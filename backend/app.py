from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.orm import Session
import asyncio
from pathlib import Path
import uuid
import shutil

# Make sure backend is in the system path to find local modules
import sys
sys.path.append(str(Path(__file__).resolve().parent))

from database import init_db, get_db, User, AnalysisHistory, purge_expired_history
from auth import hash_password, verify_password, create_access_token, decode_access_token
from detection_engine import FormDetectionEngine
from datetime import datetime, timedelta
import json

app = FastAPI(
    title="DraftGuard API",
    description="Automated detection of incomplete fields in engineering drawings",
    version="1.0.0"
)

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp directory in workspace
TEMP_DIR = Path(__file__).resolve().parent / "temp"
TEMP_DIR.mkdir(exist_ok=True)

# Initialize database tables on startup
@app.on_event("startup")
def startup_event():
    init_db()

security = HTTPBearer()

# Initialize engine
detector = FormDetectionEngine()

@app.post("/api/analyze")
async def analyze_pdf(file: UploadFile = File(...)):
    """
    Analyze a PDF file to detect form field completeness.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Check file size (limit: 50MB)
    max_size = 50 * 1024 * 1024
    content_size = 0
    
    # Unique local path
    temp_file_name = f"{uuid.uuid4()}_{file.filename}"
    temp_path = TEMP_DIR / temp_file_name
    
    try:
        # Stream file contents and check size
        with open(temp_path, "wb") as buffer:
            while True:
                chunk = await file.read(1024 * 1024)  # 1MB chunk
                if not chunk:
                    break
                content_size += len(chunk)
                if content_size > max_size:
                    raise HTTPException(status_code=413, detail="File too large. Maximum size is 50MB.")
                buffer.write(chunk)
        
        # Run CPU-bound detection pipeline in a thread pool
        results = await asyncio.to_thread(
            detector.analyze_pdf,
            str(temp_path),
            file.filename
        )
        
        return JSONResponse(content=results, status_code=200)
        
    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
    finally:
        # Always clean up the temp file
        if temp_path.exists():
            try:
                temp_path.unlink()
            except Exception:
                pass

@app.post("/api/compare-2d")
async def compare_2d_files(
    pdf_file: UploadFile = File(...),
    cad_file: UploadFile = File(...)
):
    """
    Compare a 2D PDF drawing file against a CAD file (DXF or DWF).
    Extracts geometric dimensions, calculates scale ratios, and verifies ratio fidelity.
    """
    if not pdf_file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="pdf_file must be a PDF file")

    cad_ext = Path(cad_file.filename).suffix.lower()
    if cad_ext not in ('.dxf', '.dwf'):
        raise HTTPException(status_code=400, detail="cad_file must be a .dxf or .dwf CAD file")

    pdf_temp = TEMP_DIR / f"{uuid.uuid4()}_{pdf_file.filename}"
    cad_temp = TEMP_DIR / f"{uuid.uuid4()}_{cad_file.filename}"

    try:
        # Save uploaded PDF
        with open(pdf_temp, "wb") as f_pdf:
            shutil.copyfileobj(pdf_file.file, f_pdf)

        # Save uploaded CAD
        with open(cad_temp, "wb") as f_cad:
            shutil.copyfileobj(cad_file.file, f_cad)

        # Run comparison in thread pool
        results = await asyncio.to_thread(
            detector.compare_2d_cad_and_pdf,
            str(pdf_temp),
            str(cad_temp)
        )

        return JSONResponse(content=results, status_code=200)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"2D Comparison error: {str(e)}")
    finally:
        for p in (pdf_temp, cad_temp):
            if p.exists():
                try:
                    p.unlink()
                except Exception:
                    pass

@app.post("/api/validate-template")
async def validate_template(template_config: dict):
    """
    Validate a new title block template configuration.
    """
    try:
        is_valid = detector.validate_template(template_config)
        if is_valid:
            return {"valid": True, "message": "Template configuration is valid"}
        else:
            raise HTTPException(status_code=400, detail="Template config is missing required fields (name, cells, region/dimensions)")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/templates")
async def list_templates():
    """
    Get all registered title block templates.
    """
    templates = detector.list_templates()
    return {"templates": templates}

@app.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {
        "status": "healthy",
        "service": "DraftGuard API",
        "version": "1.0.0"
    }

class UserRegister(BaseModel):
    username: str
    password: str
    email: str | None = None
    full_name: str | None = None

class UserLogin(BaseModel):
    username: str
    password: str

@app.post("/api/auth/register")
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    username_clean = user_data.username.strip()
    if not username_clean:
        raise HTTPException(status_code=400, detail="Username cannot be empty")
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")
        
    # Check if username exists
    existing_user = db.query(User).filter(User.username == username_clean).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
        
    password_hash = hash_password(user_data.password)
    new_user = User(
        username=username_clean, 
        email=user_data.email.strip() if user_data.email else None,
        full_name=user_data.full_name.strip() if user_data.full_name else None,
        password_hash=password_hash, 
        role="user"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    token = create_access_token(data={"sub": new_user.username, "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "role": new_user.role
        }
    }

@app.post("/api/auth/login")
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    username_clean = user_data.username.strip()
    user = db.query(User).filter(User.username == username_clean).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
        
    token = create_access_token(data={"sub": user.username, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": getattr(user, 'email', None),
            "full_name": getattr(user, 'full_name', None),
            "role": user.role
        }
    }

@app.get("/api/auth/me")
async def get_me(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid session token")
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return {
        "id": user.id,
        "username": user.username,
        "email": getattr(user, 'email', None),
        "full_name": getattr(user, 'full_name', None),
        "role": user.role
    }

class SaveHistoryRequest(BaseModel):
    file_name: str
    completeness: float
    status: str
    detection_method: str | None = None
    total_fields: int = 0
    filled_fields: int = 0
    incomplete_fields: int = 0
    results: dict | None = None

@app.get("/api/history")
async def get_history(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """
    Get 5-day analysis history for current user.
    Automatically purges items older than 5 days.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid session token")
    username = payload.get("sub")
    
    # Auto-purge expired records
    purge_expired_history(db)
    
    now = datetime.utcnow()
    records = db.query(AnalysisHistory).filter(
        AnalysisHistory.username == username,
        AnalysisHistory.expires_at > now
    ).order_by(AnalysisHistory.created_at.desc()).all()
    
    items = []
    for r in records:
        time_left = r.expires_at - now
        days_left = max(0.0, round(time_left.total_seconds() / 86400, 1))
        
        parsed_results = None
        if r.results_json:
            try:
                parsed_results = json.loads(r.results_json)
            except Exception:
                pass
                
        items.append({
            "id": r.id,
            "fileName": r.file_name,
            "completeness": r.completeness,
            "status": r.status,
            "detectionMethod": r.detection_method,
            "totalFields": r.total_fields,
            "filledFields": r.filled_fields,
            "incompleteFields": r.incomplete_fields,
            "results": parsed_results,
            "createdAt": r.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "expiresAt": r.expires_at.strftime("%Y-%m-%d %H:%M:%S"),
            "daysRemaining": days_left
        })
        
    return {"history": items, "retentionDays": 5}

@app.post("/api/history")
async def save_history(data: SaveHistoryRequest, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """
    Save an analysis result to user history with a strict 5-day expiration timestamp.
    """
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid session token")
    username = payload.get("sub")
    
    user = db.query(User).filter(User.username == username).first()
    
    now = datetime.utcnow()
    expires_at = now + timedelta(days=5)
    
    history_entry = AnalysisHistory(
        user_id=user.id if user else None,
        username=username,
        file_name=data.file_name,
        completeness=data.completeness,
        status=data.status,
        detection_method=data.detection_method,
        total_fields=data.total_fields,
        filled_fields=data.filled_fields,
        incomplete_fields=data.incomplete_fields,
        results_json=json.dumps(data.results) if data.results else None,
        created_at=now,
        expires_at=expires_at
    )
    
    db.add(history_entry)
    db.commit()
    db.refresh(history_entry)
    
    return {"status": "saved", "id": history_entry.id, "expiresAt": expires_at.strftime("%Y-%m-%d %H:%M:%S")}

@app.delete("/api/history/{history_id}")
async def delete_history_item(history_id: int, credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid session token")
    username = payload.get("sub")
    
    entry = db.query(AnalysisHistory).filter(
        AnalysisHistory.id == history_id,
        AnalysisHistory.username == username
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="History entry not found")
        
    db.delete(entry)
    db.commit()
    return {"status": "deleted", "id": history_id}

@app.delete("/api/history")
async def clear_all_history(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid session token")
    username = payload.get("sub")
    
    db.query(AnalysisHistory).filter(AnalysisHistory.username == username).delete()
    db.commit()
    return {"status": "cleared"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
