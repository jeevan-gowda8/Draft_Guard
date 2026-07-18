# ⚡ Form Completeness Detector - Quick Reference Card

## 🚀 Quick Start Commands

### Docker (Recommended)
```bash
# Start all services
docker-compose up

# View logs
docker-compose logs -f api

# Stop everything
docker-compose down

# Clean up everything (including data)
docker-compose down -v
```

### Local Development
```bash
# Setup backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd backend && python app.py

# Setup frontend (new terminal)
cd frontend
npm install
npm start
```

### Access Points
| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Web UI |
| API | http://localhost:8000 | REST API |
| API Docs | http://localhost:8000/docs | Swagger UI |
| Database | localhost:5432 | PostgreSQL |
| Cache | localhost:6379 | Redis |
| Monitoring | http://localhost:9090 | Prometheus |
| Dashboard | http://localhost:3001 | Grafana |

---

## 📡 API Endpoints

### Analyze PDF
```bash
POST /api/analyze
Content-Type: multipart/form-data

curl -X POST http://localhost:8000/api/analyze \
  -F "file=@drawing.pdf"
```

**Response:**
```json
{
  "fileName": "drawing.pdf",
  "completeness": 72,
  "status": "incomplete",
  "titleBlock": {
    "totalFields": 23,
    "filledFields": 16,
    "incompleteFields": 7,
    "criticalFields": ["DWG NO.", "MATERIAL"]
  },
  "fields": [...],
  "recommendations": [...]
}
```

### Batch Processing
```bash
POST /api/batch?batch_id=batch-001
Content-Type: multipart/form-data

curl -X POST http://localhost:8000/api/batch?batch_id=batch-001 \
  -F "files=@drawing1.pdf" \
  -F "files=@drawing2.pdf"
```

### List Templates
```bash
GET /api/templates

curl http://localhost:8000/api/templates
```

**Response:**
```json
{
  "templates": [
    "ATS-A3-Standard",
    "ISO-A4-Form",
    "CUSTOM-TEMPLATE-1"
  ]
}
```

### Validate Template
```bash
POST /api/validate-template
Content-Type: application/json

curl -X POST http://localhost:8000/api/validate-template \
  -H "Content-Type: application/json" \
  -d @template.json
```

### Health Check
```bash
GET /health

curl http://localhost:8000/health
```

---

## 🎨 UI Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + U` | Toggle sidebar |
| `Ctrl/Cmd + O` | Open file dialog |
| `Ctrl/Cmd + E` | Export report |
| `1` | Overview tab |
| `2` | Details tab |
| `3` | Settings tab |

---

## ⚙️ Environment Variables

### Essential
```bash
ANTHROPIC_API_KEY=sk-your-key-here
DATABASE_URL=postgresql://user:password@localhost/dbname
API_PORT=8000
```

### Optional
```bash
API_WORKERS=4
MAX_PDF_SIZE_MB=50
ENABLE_AI_CROSSCHECK=True
DEBUG=False
LOG_LEVEL=INFO
```

### Set in .env
```bash
# Create .env in project root or backend directory
echo "ANTHROPIC_API_KEY=sk-..." >> .env
echo "DATABASE_URL=postgresql://..." >> .env

# Load in Python
from dotenv import load_dotenv
load_dotenv()
```

---

## 🔧 Common Tasks

### Configure Custom Template
```bash
# Edit config/templates.json
{
  "MY-TEMPLATE": {
    "name": "My Custom Template",
    "cells": [
      {
        "id": "field_1",
        "label": "Field Name",
        "criticality": "critical"
      }
    ]
  }
}

# Restart API to load
docker-compose restart api
```

### Change Color Scheme
Edit `incomplete-form-detector.jsx`:
```jsx
// Search for color codes:
// #1E40AF → your primary color
// #16A34A → your success color
// #DC2626 → your error color
// #F9FAFB → your background
```

### Scale API Workers
```bash
# Docker
docker-compose up -d --scale api=3

# Local
export API_WORKERS=8
python backend/app.py
```

### Increase PDF Size Limit
```bash
# .env
MAX_PDF_SIZE_MB=100  # From 50

# Restart
docker-compose restart api
```

### Enable GPU Acceleration
```bash
# Install CUDA packages
pip install torch torchvision tensorflow-gpu

# Set environment
export CUDA_VISIBLE_DEVICES=0

# Restart API
python backend/app.py
```

---

## 🐛 Troubleshooting Quick Fixes

### "Connection refused" on port 8000
```bash
# Check if service is running
docker ps | grep api

# Restart API
docker-compose restart api

# Check logs
docker-compose logs api
```

### "Database connection failed"
```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Verify connection string in .env
DATABASE_URL=postgresql://postgres:postgres@db:5432/form_detector

# Restart database
docker-compose restart db
```

### "High memory usage"
```bash
# Reduce processing quality
# In detection_engine.py:
pix = page.get_pixmap(matrix=fitz.Matrix(1, 1))  # Reduce from 2x

# Or restart with memory limit
docker run -m 4g form-detector:1.0
```

### "Slow PDF processing"
```bash
# Check if AI cross-check is enabled
ENABLE_AI_CROSSCHECK=False

# Reduce image DPI
PDF_DPI=150  # From 200

# Scale up workers
API_WORKERS=8
```

### "PDF upload fails"
```bash
# Check file size
MAX_PDF_SIZE_MB=50

# Verify temp directory exists
mkdir -p /tmp/form-detector
chmod 777 /tmp/form-detector

# Scan for malware (if enabled)
clamdscan drawing.pdf
```

---

## 📊 Performance Tips

### Frontend Optimization
```bash
# Build for production
cd frontend
npm run build

# Serve with compression
npm install -g serve
serve -s build -l 3000
```

### Backend Optimization
```bash
# Use production settings
DEBUG=False
API_WORKERS=4  # 2 x CPU cores

# Enable caching
REDIS_URL=redis://localhost:6379

# Limit connection pool
DATABASE_POOL_SIZE=5
DATABASE_MAX_OVERFLOW=10
```

### Database Optimization
```sql
-- Create indices
CREATE INDEX idx_document_id ON results(document_id);
CREATE INDEX idx_created_at ON results(created_at);
CREATE INDEX idx_status ON results(status);

-- Analyze query plans
EXPLAIN ANALYZE SELECT * FROM results WHERE status='incomplete';

-- Vacuum and optimize
VACUUM ANALYZE;
```

---

## 📁 File Locations

### Frontend
- Component: `incomplete-form-detector.jsx`
- Config: `frontend/.env`
- Build: `frontend/build/`

### Backend
- App: `backend/app.py`
- Engine: `backend/detection_engine.py`
- Config: `backend/config/templates.json`
- Logs: `backend/logs/form-detector.log`
- Database: `form_detector.db` (SQLite) or PostgreSQL

### Docker
- Compose: `docker-compose.yml`
- Image: `Dockerfile`
- Volumes: `postgres_data/`, `redis_data/`

### Documentation
- Quick Start: `README.md`
- Deployment: `DEPLOYMENT_GUIDE.md`
- Backend: `backend-setup.md`
- Summary: `PROJECT_SUMMARY.md`

---

## 🔐 Security Checklist

```bash
# Set strong password
POSTGRES_PASSWORD=your-strong-password

# Generate secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-generated-key

# Enable HTTPS
# Copy certificates to ./ssl/
# Enable in nginx.conf

# Set CORS properly
CORS_ORIGINS=["https://yourdomain.com"]

# Enable rate limiting
RATE_LIMIT_PER_MINUTE=30

# Audit logging
LOG_LEVEL=INFO
AUDIT_LOGGING=True
```

---

## 📈 Monitoring Commands

### View Metrics
```bash
# Prometheus queries
curl 'http://localhost:9090/api/v1/query?query=http_requests_total'

# Health check
curl http://localhost:8000/health

# Database status
psql -U postgres -d form_detector -c "SELECT version();"
```

### View Logs
```bash
# Docker
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f db

# Local
tail -f backend/logs/form-detector.log
```

### Performance Stats
```bash
# Docker resource usage
docker stats

# Database connections
psql -U postgres -c "SELECT datname, usename, count(*) FROM pg_stat_activity GROUP BY datname, usename;"

# Redis memory
redis-cli INFO memory
```

---

## 📦 Deployment Quick Reference

### Docker Compose Development
```bash
docker-compose up -d
# Frontend: 3000, API: 8000, DB: 5432
```

### Docker Compose Production
```bash
docker-compose -f docker-compose.prod.yml up -d
# With health checks, resource limits, logging
```

### AWS ECS/Fargate
```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster form-detector --service-name api --task-definition form-detector:1
```

### Google Cloud Run
```bash
gcloud run deploy form-detector --source . --allow-unauthenticated
```

### Kubernetes
```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl scale deployment form-detector-api --replicas=3
```

---

## 🔄 Update & Maintenance

### Update Dependencies
```bash
# Python
pip install --upgrade -r requirements.txt

# Node packages
npm update

# Docker images
docker pull postgres:15-alpine
docker pull node:18-alpine
```

### Backup & Restore
```bash
# Backup database
pg_dump form_detector_db > backup.sql

# Restore database
psql form_detector_db < backup.sql

# Backup configuration
tar -czf config-backup.tar.gz config/
```

### Migration
```bash
# Database migrations
python -m alembic upgrade head

# Version check
alembic current
```

---

## 💬 Common Questions

**Q: How long does PDF processing take?**  
A: 2-30 seconds depending on PDF size (2-50 MB)

**Q: What's the maximum PDF size?**  
A: 50 MB (configurable via MAX_PDF_SIZE_MB)

**Q: Can I process multiple PDFs at once?**  
A: Yes, use /api/batch endpoint

**Q: Is my data secure?**  
A: Yes, with encryption, HTTPS, and audit logging

**Q: Can I customize the UI colors?**  
A: Yes, edit color codes in the React component

**Q: How do I integrate with my system?**  
A: Use the REST API (/api/analyze endpoint)

**Q: Is AI cross-check necessary?**  
A: No, it's optional but improves accuracy by 2-3%

**Q: Can I run this on-premise?**  
A: Yes, fully self-hosted, no external dependencies except Claude API

---

## 📞 Support & Resources

- **Docs:** See README.md, DEPLOYMENT_GUIDE.md
- **Issues:** Check troubleshooting section
- **API Docs:** http://localhost:8000/docs
- **Logs:** docker-compose logs -f

---

## ⌨️ Useful Command Reference

```bash
# Development server
npm start                              # Frontend
python app.py                          # Backend

# Production build
npm run build                          # Frontend
docker build -t form-detector .        # Backend

# Testing
pytest tests/ -v                       # Python tests
npm test                               # React tests

# Formatting
black backend/                         # Format Python
npm run prettier                       # Format JavaScript

# Database
psql -U postgres                       # Connect to DB
alembic revision --autogenerate       # Create migration

# Docker
docker-compose ps                      # List services
docker-compose logs -f                 # Follow logs
docker-compose exec api bash          # Shell into container

# Deployment
git push heroku main                   # Deploy to Heroku
gcloud run deploy form-detector        # Deploy to GCP
aws ecs update-service                 # Deploy to AWS
```

---

**Last Updated:** 2024  
**Version:** 1.0.0  
**Quick Reference v1.0**
