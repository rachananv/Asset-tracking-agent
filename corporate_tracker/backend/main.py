from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import Asset, AssetCreate, AssetUpdate, Assignment, StatusUpdate, ChatRequest
from services import asset_service
import os

app = FastAPI(title="Corporate Assets Tracker API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/assets", response_model=list[Asset])
def get_assets():
    return asset_service.get_all_assets()

@app.post("/assets", response_model=Asset)
def add_asset(asset: AssetCreate):
    return asset_service.create_asset(asset)

@app.put("/assets/{asset_id}", response_model=Asset)
def update_asset(asset_id: str, asset: AssetUpdate):
    updated = asset_service.update_asset(asset_id, asset)
    if not updated:
        raise HTTPException(status_code=404, detail="Asset not found")
    return updated

@app.delete("/assets/{asset_id}")
def remove_asset(asset_id: str):
    success = asset_service.delete_asset(asset_id)
    if not success:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"message": "Asset removed successfully"}

@app.post("/assign", response_model=Asset)
def assign_asset(assignment: Assignment):
    updated = asset_service.assign_asset(assignment.asset_id, assignment.employee_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Asset not found")
    return updated

@app.post("/update-status", response_model=Asset)
def update_status(status_update: StatusUpdate):
    updated = asset_service.update_status(status_update.asset_id, status_update.status)
    if not updated:
        raise HTTPException(status_code=404, detail="Asset not found")
    return updated

import mimetypes
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi import Request
import time

# Robust path resolution
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FRONTEND_DIR = BASE_DIR

print(f"DEBUG: BASE_DIR resolved to: {BASE_DIR}")
print(f"DEBUG: Checking index.html at: {os.path.join(FRONTEND_DIR, 'index.html')}")
if os.path.exists(os.path.join(FRONTEND_DIR, 'index.html')):
    print("DEBUG: index.html found!")
else:
    print("DEBUG: index.html NOT FOUND!")

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    print(f"DEBUG: {request.method} {request.url.path} - Status: {response.status_code} - Done in {duration:.4f}s")
    return response

# Include routers
from agent import agent

# Placeholder for Chat endpoint - integrated with Agent
@app.post("/chat")
def chat(request: ChatRequest):
    try:
        result = agent.process_message(request.session_id, request.message)
        return result
    except Exception as e:
        print(f"CHAT ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Serve frontend assets (styles, js, etc)
# Check directories exist before mounting
for folder in ["styles", "js"]:
    path = os.path.join(FRONTEND_DIR, folder)
    if os.path.exists(path):
        print(f"DEBUG: Mounting {folder} from {path}")
        app.mount(f"/{folder}", StaticFiles(directory=path), name=folder)
    else:
        print(f"DEBUG: FOLDER NOT FOUND: {path}")

@app.get("/")
def read_root():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("ASSET TRACKER SERVER STARTING")
    print("Link: http://localhost:8000")
    print("="*50 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
