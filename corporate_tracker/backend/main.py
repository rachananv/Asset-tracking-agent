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

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Get frontend directory (now at project root for GitHub Pages)
FRONTEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Include routers
from agent import agent

# Placeholder for Chat endpoint - integrated with Agent
@app.post("/chat")
def chat(request: ChatRequest):
    try:
        result = agent.process_message(request.session_id, request.message)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve frontend assets (styles, js, etc)
app.mount("/styles", StaticFiles(directory=os.path.join(FRONTEND_DIR, "styles")), name="styles")
app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")

@app.get("/")
def read_root():
    return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
