# Form Completeness Detector - Backend Implementation Guide

## Overview
Complete Python FastAPI backend for automated detection of incomplete fields in engineering drawing PDFs.

## Architecture
```
PDF Upload → PDF Analysis → Field Detection → Results Processing → JSON Report
                  ↓
            Vector Extraction / Raster Analysis
                  ↓
            Text Intersection / OCR Validation
                  ↓
            Optional AI Cross-Check (Claude Vision)
```

## Installation

### Prerequisites
- Python 3.9+
- pip or conda
- CUDA/GPU support (optional, for faster processing)

### Dependencies
```bash
pip install fastapi uvicorn python-multipart pymupdf pdfplumber opencv-python pytesseract pillow numpy anthropic pdf2image
```

## Core API Implementation

### 1. Main Application (`app.py`)

```python
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
from pathlib import Path
import json

from detection_engine import FormDetectionEngine

app = FastAPI(
    title="Form Completeness Detector API",
    description="Automated detection of incomplete fields in engineering drawings",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = FormDetectionEngine()

@app.post("/api/analyze")
async def analyze_pdf(file: UploadFile = File(...)):
    """
    Analyze a PDF for incomplete form fields.
    
    Supports:
    - AcroForm fillable PDFs
    - CAD-exported (vector) PDFs
    - Scanned/rasterized PDFs
    """
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        # Save uploaded file temporarily
        temp_path = Path(f"temp_{file.filename}")
        contents = await file.read()
        temp_path.write_bytes(contents)
        
        # Run analysis
        results = await asyncio.to_thread(
            detector.analyze_pdf,
            str(temp_path),
            file.filename
        )
        
        # Cleanup
        temp_path.unlink()
        
        return JSONResponse(content=results, status_code=200)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/validate-template")
async def validate_template(template_config: dict):
    """Validate and register a new title block template"""
    try:
        is_valid = detector.validate_template(template_config)
        return {"valid": is_valid, "message": "Template validated successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/templates")
async def list_templates():
    """Get all registered title block templates"""
    templates = detector.list_templates()
    return {"templates": templates}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "Form Completeness Detector"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 2. Detection Engine (`detection_engine.py`)

```python
import pymupdf as fitz
import pdfplumber
import cv2
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import json
import re

class FormDetectionEngine:
    def __init__(self, config_path: str = "config/templates.json"):
        self.config_path = Path(config_path)
        self.templates = self._load_templates()
        self.confidence_threshold = 0.90
    
    def analyze_pdf(self, pdf_path: str, filename: str) -> Dict:
        """
        Main analysis pipeline for PDF form detection.
        
        Steps:
        1. Detect PDF type (AcroForm, Vector, Raster)
        2. Extract regions of interest (title blocks)
        3. Identify grid structure and cells
        4. Check for field completeness
        5. Validate content where applicable
        6. Generate report
        """
        
        pdf_path = Path(pdf_path)
        
        # Step 1: PDF Type Detection
        pdf_type = self._detect_pdf_type(pdf_path)
        
        # Step 2: Extract title block region
        title_block_region = self._locate_title_block(pdf_path, pdf_type)
        
        # Step 3: Grid Analysis
        if pdf_type == "acroform":
            fields_data = self._analyze_acroform(pdf_path)
        elif pdf_type == "vector":
            fields_data = self._analyze_vector_pdf(pdf_path, title_block_region)
        else:  # raster
            fields_data = self._analyze_raster_pdf(pdf_path, title_block_region)
        
        # Step 4: Completeness Check
        completeness_report = self._generate_completeness_report(fields_data)
        
        # Step 5: Content Validation (Optional)
        validation_results = self._validate_content(fields_data)
        
        # Step 6: Generate final report
        report = self._compile_report(
            filename=filename,
            pdf_type=pdf_type,
            fields=fields_data,
            completeness=completeness_report,
            validation=validation_results
        )
        
        return report
    
    def _detect_pdf_type(self, pdf_path: Path) -> str:
        """
        Detect PDF type: 'acroform' (interactive forms), 
        'vector' (CAD-exported), or 'raster' (scanned)
        """
        try:
            doc = fitz.open(pdf_path)
            page = doc[0]
            
            # Check for AcroForm fields
            if page.is_form_pdf:
                doc.close()
                return "acroform"
            
            # Check for vector content (text and drawings)
            drawings = page.get_drawings()
            text = page.get_text()
            
            doc.close()
            
            if len(drawings) > 0 and len(text) > 0:
                return "vector"
            else:
                return "raster"
        
        except Exception as e:
            print(f"Error detecting PDF type: {e}")
            return "unknown"
    
    def _locate_title_block(self, pdf_path: Path, pdf_type: str) -> Dict:
        """
        Locate and extract the title block region.
        Typically in bottom-right corner for engineering drawings.
        """
        doc = fitz.open(pdf_path)
        page = doc[0]
        
        # Common title block position in engineering drawings
        # (bottom-right corner, roughly 25% of page width/height)
        page_rect = page.rect
        width = page_rect.width
        height = page_rect.height
        
        # Default title block region (adjustable per template)
        estimated_region = {
            "x0": width * 0.6,
            "y0": height * 0.7,
            "x1": width,
            "y1": height
        }
        
        doc.close()
        return estimated_region
    
    def _analyze_vector_pdf(self, pdf_path: Path, region: Dict) -> List[Dict]:
        """
        Analyze vector PDF using PyMuPDF's table detection.
        Recommended method for CAD-exported PDFs.
        """
        doc = fitz.open(pdf_path)
        page = doc[0]
        
        # Extract tables (cells detected from vector geometry)
        tables = page.find_tables(
            clip=fitz.Rect(region["x0"], region["y0"], region["x1"], region["y1"])
        )
        
        fields = []
        text_dict = page.get_text("words")
        
        for table in tables:
            table_data = table.extract()
            
            for row_idx, row in enumerate(table_data):
                for col_idx, cell_text in enumerate(row):
                    if cell_text is None:
                        cell_text = ""
                    
                    # Get cell boundaries
                    cell_rect = table.cells[row_idx][col_idx]
                    
                    # Check if any text intersects with this cell
                    is_filled = self._check_text_intersection(text_dict, cell_rect)
                    
                    field_name = self._infer_field_label(row_idx, col_idx, table_data)
                    
                    fields.append({
                        "name": field_name,
                        "row": row_idx,
                        "col": col_idx,
                        "status": "complete" if is_filled else "incomplete",
                        "value": cell_text if is_filled else None,
                        "confidence": 0.95,
                        "detection_method": "vector_geometry"
                    })
        
        doc.close()
        return fields
    
    def _analyze_raster_pdf(self, pdf_path: Path, region: Dict) -> List[Dict]:
        """
        Analyze raster/scanned PDF using image processing.
        Uses morphological operations and ink-density detection.
        """
        doc = fitz.open(pdf_path)
        page = doc[0]
        
        # Render to image
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2x zoom for better quality
        img_data = pix.tobytes("ppm")
        
        import io
        from PIL import Image
        img = Image.open(io.BytesIO(img_data))
        
        # Crop to title block region
        crop_region = (region["x0"], region["y0"], region["x1"], region["y1"])
        img_cropped = img.crop(crop_region)
        
        # Convert to grayscale
        img_gray = cv2.cvtColor(np.array(img_cropped), cv2.COLOR_RGB2GRAY)
        
        # Binarize using Otsu's threshold
        _, img_binary = cv2.threshold(img_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Detect grid lines (horizontal and vertical)
        horizontal_lines = self._detect_lines(img_binary, "horizontal")
        vertical_lines = self._detect_lines(img_binary, "vertical")
        
        # Reconstruct cells from grid lines
        cells = self._reconstruct_cells(horizontal_lines, vertical_lines)
        
        # Check ink density per cell
        fields = []
        for cell_idx, cell_bounds in enumerate(cells):
            cell_region = img_binary[
                cell_bounds["y0"]:cell_bounds["y1"],
                cell_bounds["x0"]:cell_bounds["x1"]
            ]
            
            # Calculate ink density (excluding border)
            border_px = 2
            if cell_region.shape[0] > 2*border_px and cell_region.shape[1] > 2*border_px:
                interior = cell_region[border_px:-border_px, border_px:-border_px]
                ink_ratio = np.sum(interior == 0) / interior.size  # Black = 0
            else:
                ink_ratio = 0
            
            is_filled = ink_ratio > 0.01  # Threshold: >1% ink density
            
            fields.append({
                "name": f"cell_{cell_idx}",
                "bounds": cell_bounds,
                "status": "complete" if is_filled else "incomplete",
                "ink_density": float(ink_ratio),
                "confidence": 0.85,
                "detection_method": "raster_morphology"
            })
        
        doc.close()
        return fields
    
    def _analyze_acroform(self, pdf_path: Path) -> List[Dict]:
        """
        Analyze AcroForm (interactive) PDF.
        Most straightforward method - direct field enumeration.
        """
        doc = fitz.open(pdf_path)
        fields = []
        
        if doc.is_pdf:
            form_fields = doc.form_field_get()
            
            for field in form_fields:
                field_dict = field
                
                fields.append({
                    "name": field_dict.get("field_name", "unknown"),
                    "status": "incomplete" if not field_dict.get("value") else "complete",
                    "value": field_dict.get("value"),
                    "field_type": field_dict.get("field_type"),
                    "flags": field_dict.get("flags", 0),
                    "confidence": 0.98,
                    "detection_method": "acroform_enumeration"
                })
        
        doc.close()
        return fields
    
    def _check_text_intersection(self, text_dict: List, cell_rect) -> bool:
        """Check if any text intersects with the given cell rectangle"""
        for word_info in text_dict:
            word_rect = fitz.Rect(word_info[:4])
            if word_rect.intersects(cell_rect):
                return True
        return False
    
    def _detect_lines(self, img_binary: np.ndarray, direction: str) -> List:
        """Detect horizontal or vertical lines using morphological operations"""
        if direction == "horizontal":
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (50, 1))
        else:  # vertical
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 50))
        
        lines = cv2.morphologyEx(img_binary, cv2.MORPH_OPEN, kernel)
        return lines
    
    def _reconstruct_cells(self, h_lines: np.ndarray, v_lines: np.ndarray) -> List[Dict]:
        """Reconstruct cell boundaries from detected lines"""
        # Find row and column indices from line positions
        h_pos = np.where(np.sum(h_lines, axis=1) > 0)[0]
        v_pos = np.where(np.sum(v_lines, axis=0) > 0)[0]
        
        cells = []
        for i in range(len(h_pos) - 1):
            for j in range(len(v_pos) - 1):
                cells.append({
                    "y0": h_pos[i],
                    "y1": h_pos[i + 1],
                    "x0": v_pos[j],
                    "x1": v_pos[j + 1]
                })
        
        return cells
    
    def _infer_field_label(self, row: int, col: int, table_data: List) -> str:
        """Infer field label from position in table"""
        # For title blocks, use row/column-based labeling
        row_labels = ["DRAWN", "CHK'D", "APPV'D", "MFG", "Q.A"]
        col_labels = ["NAME", "SIGNATURE", "DATE"]
        
        row_label = row_labels[row] if row < len(row_labels) else f"row_{row}"
        col_label = col_labels[col] if col < len(col_labels) else f"col_{col}"
        
        return f"{row_label}-{col_label}"
    
    def _generate_completeness_report(self, fields: List[Dict]) -> Dict:
        """Generate completeness summary"""
        total = len(fields)
        complete = sum(1 for f in fields if f["status"] == "complete")
        incomplete = total - complete
        
        return {
            "total_fields": total,
            "complete_fields": complete,
            "incomplete_fields": incomplete,
            "completeness_percentage": (complete / total * 100) if total > 0 else 0,
            "overall_status": "complete" if incomplete == 0 else "incomplete"
        }
    
    def _validate_content(self, fields: List[Dict]) -> Dict:
        """Optional: Validate field content against expected patterns"""
        validation = {
            "date_format": 0,
            "drawing_number_format": 0,
            "material_list": 0,
            "total_validations": 0
        }
        
        date_pattern = r"\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}"
        dwg_pattern = r"[A-Z]{3}-\d{3}-\d{3}-\d{3}-\d{2}"
        
        for field in fields:
            if field["status"] == "complete":
                value = str(field.get("value", ""))
                
                if "DATE" in field.get("name", "").upper():
                    if re.search(date_pattern, value):
                        validation["date_format"] += 1
                
                if "DWG" in field.get("name", "").upper():
                    if re.search(dwg_pattern, value):
                        validation["drawing_number_format"] += 1
                
                validation["total_validations"] += 1
        
        return validation
    
    def _compile_report(self, filename: str, pdf_type: str, fields: List[Dict],
                       completeness: Dict, validation: Dict) -> Dict:
        """Compile final analysis report"""
        incomplete_fields = [f for f in fields if f["status"] == "incomplete"]
        critical_fields = [f for f in incomplete_fields if "DRAWN" in f.get("name", "") or 
                          "DWG NO" in f.get("name", "") or "MATERIAL" in f.get("name", "")]
        
        recommendations = []
        for field in critical_fields[:5]:  # Top 5 critical issues
            recommendations.append(f"Complete required field: {field['name']}")
        
        return {
            "fileName": filename,
            "timestamp": datetime.now().isoformat(),
            "pdfType": pdf_type,
            "completeness": completeness["completeness_percentage"],
            "status": completeness["overall_status"],
            "titleBlock": {
                "totalFields": completeness["total_fields"],
                "filledFields": completeness["complete_fields"],
                "incompleteFields": completeness["incomplete_fields"],
                "criticalFields": [f["name"] for f in critical_fields]
            },
            "detectionMethod": "Vector Geometry + Text Intersection" if pdf_type == "vector" else
                              "AcroForm Field Enumeration" if pdf_type == "acroform" else
                              "Raster Grid + Ink Density Analysis",
            "confidenceScore": np.mean([f["confidence"] for f in fields]) * 100,
            "fields": fields,
            "detectionDetails": {
                "vectorGridExtraction": pdf_type == "vector",
                "cellReconstruction": "successful",
                "textIntersectionAnalysis": True,
                "ocrValidation": False,
                "aiCrosscheck": False
            },
            "recommendations": recommendations
        }
    
    def _load_templates(self) -> Dict:
        """Load title block templates from configuration"""
        if self.config_path.exists():
            with open(self.config_path) as f:
                return json.load(f)
        return {}
    
    def validate_template(self, template: Dict) -> bool:
        """Validate and register a new template"""
        required_fields = ["name", "cells", "dimensions"]
        return all(field in template for field in required_fields)
    
    def list_templates(self) -> List[str]:
        """List all registered templates"""
        return list(self.templates.keys())
```

### 3. Configuration Template (`config/templates.json`)

```json
{
  "ATS-A3-Standard": {
    "name": "ATS Standard A3 Title Block",
    "page_size": "A3",
    "region": {
      "x0": 0.6,
      "y0": 0.7,
      "width": 0.4,
      "height": 0.3
    },
    "cells": [
      {
        "id": "DWG_NO",
        "label": "DWG NO.",
        "row": 0,
        "col": 0,
        "criticality": "critical",
        "format": "^[A-Z]{3}-\\d{3}-\\d{3}-\\d{3}-\\d{2}$"
      },
      {
        "id": "TITLE",
        "label": "TITLE",
        "row": 1,
        "col": 0,
        "criticality": "critical"
      },
      {
        "id": "DRAWN_NAME",
        "label": "DRAWN - NAME",
        "row": 2,
        "col": 0,
        "criticality": "high"
      },
      {
        "id": "DRAWN_SIG",
        "label": "DRAWN - SIGNATURE",
        "row": 2,
        "col": 1,
        "criticality": "high"
      },
      {
        "id": "DRAWN_DATE",
        "label": "DRAWN - DATE",
        "row": 2,
        "col": 2,
        "criticality": "high",
        "format": "^\\d{4}-\\d{2}-\\d{2}$"
      },
      {
        "id": "MATERIAL",
        "label": "MATERIAL",
        "row": 3,
        "col": 0,
        "criticality": "critical"
      },
      {
        "id": "FINISH",
        "label": "FINISH",
        "row": 4,
        "col": 0,
        "criticality": "high"
      }
    ]
  }
}
```

## Running the Server

```bash
# Development mode (with auto-reload)
uvicorn app:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### POST `/api/analyze`
Upload and analyze a PDF
```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -F "file=@drawing.pdf"
```

### GET `/api/templates`
List available templates
```bash
curl http://localhost:8000/api/templates
```

### POST `/api/validate-template`
Validate a new template
```bash
curl -X POST http://localhost:8000/api/validate-template \
  -H "Content-Type: application/json" \
  -d @template.json
```

## Performance Optimization

- **Vectorization**: Use NumPy for image processing operations
- **Async Processing**: FastAPI handles concurrent requests
- **Caching**: Store template definitions to avoid re-computation
- **Lazy Loading**: Load PyMuPDF/OpenCV only when needed
- **GPU Support**: Enable CUDA for faster image processing (optional)

## Testing

```bash
pytest tests/ -v
```

## Production Deployment

### Docker
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - ./config:/app/config
    environment:
      - WORKERS=4
```

## Security Considerations

- Validate file uploads (file size, MIME type)
- Scan uploaded files for malware
- Implement rate limiting
- Add authentication/API key validation
- Encrypt sensitive configuration
- Use HTTPS in production

## Monitoring & Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
```

## References

- PyMuPDF Documentation: https://pymupdf.readthedocs.io
- pdfplumber: https://github.com/jsvine/pdfplumber
- FastAPI: https://fastapi.tiangolo.com
- OpenCV: https://docs.opencv.org
