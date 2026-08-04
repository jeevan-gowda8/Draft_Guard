from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
from pathlib import Path
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
    load_dotenv(Path(__file__).resolve().parent / ".env")
except Exception:
    pass

# Resolve default local SQLite DB path if DATABASE_URL is not set
DB_PATH = Path(__file__).resolve().parent / "users.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DB_PATH}")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

try:
    engine_kwargs = {}
    if DATABASE_URL.startswith("sqlite"):
        engine_kwargs["connect_args"] = {"check_same_thread": False}
    engine = create_engine(DATABASE_URL, **engine_kwargs)
except Exception as err:
    print(f"Database Connection Warning ({err}). Falling back to local SQLite database.")
    DATABASE_URL = f"sqlite:///{DB_PATH}"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    username = Column(String, index=True, nullable=False)
    file_name = Column(String, nullable=False)
    completeness = Column(Float, nullable=False)
    status = Column(String, nullable=False)
    detection_method = Column(String, nullable=True)
    total_fields = Column(Integer, default=0)
    filled_fields = Column(Integer, default=0)
    incomplete_fields = Column(Integer, default=0)
    results_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)

def purge_expired_history(db):
    """Automatically delete history records older than 5 days"""
    try:
        now = datetime.datetime.utcnow()
        db.query(AnalysisHistory).filter(AnalysisHistory.expires_at <= now).delete()
        db.commit()
    except Exception as e:
        db.rollback()
        print("Error purging expired history:", e)

def init_db():
    """Create all database tables if they do not exist and ensure missing columns are added"""
    Base.metadata.create_all(bind=engine)
    
    # Auto-migrate missing columns for existing database tables
    try:
        from sqlalchemy import text, inspect
        inspector = inspect(engine)
        if 'users' in inspector.get_table_names():
            columns = [c['name'] for c in inspector.get_columns('users')]
            with engine.begin() as conn:
                if 'email' not in columns:
                    try:
                        conn.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR;"))
                    except Exception as e:
                        print("Notice: email column migration skipped:", e)
                if 'full_name' not in columns:
                    try:
                        conn.execute(text("ALTER TABLE users ADD COLUMN full_name VARCHAR;"))
                    except Exception as e:
                        print("Notice: full_name column migration skipped:", e)
    except Exception as err:
        print("Schema auto-migration notice:", err)

def get_db():
    """Dependency generator for database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
