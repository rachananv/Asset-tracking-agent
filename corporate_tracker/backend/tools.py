from services import asset_service
from models import AssetCreate, AssetUpdate, Assignment, StatusUpdate

def get_assets():
    """Returns a list of all corporate assets."""
    assets = asset_service.get_all_assets()
    return [a.dict() for a in assets]

def find_asset(query: str):
    """Finds assets based on a search query (brand, model, type, or employee)."""
    assets = asset_service.find_assets(query)
    return [a.dict() for a in assets]

def assign_asset(asset_id: str, employee_id: str):
    """Assigns a specific asset to an employee."""
    asset = asset_service.assign_asset(asset_id, employee_id)
    if asset:
        return asset.dict()
    return {"error": "Asset not found"}

def update_asset_status(asset_id: str, status: str):
    """Updates the status of an asset (Active, Assigned, Damaged, Available)."""
    asset = asset_service.update_status(asset_id, status)
    if asset:
        return asset.dict()
    return {"error": "Asset not found"}

def remove_asset(asset_id: str):
    """Removes an asset from the system."""
    success = asset_service.delete_asset(asset_id)
    if success:
        return {"message": "Asset removed successfully"}
    return {"error": "Asset not found"}

# Tool mapping for the agent
TOOLS = [
    get_assets,
    find_asset,
    assign_asset,
    update_asset_status,
    remove_asset
]
