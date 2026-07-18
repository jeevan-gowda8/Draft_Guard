from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from pathlib import Path
import uuid
import shutil

# Make sure backend is in the system path to find local modules
import sys
sys.path.append(str(Path(__file__).resolve().parent))

from detection_engine import FormDetectionEngine

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
