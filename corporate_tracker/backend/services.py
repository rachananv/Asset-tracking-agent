import uuid
from typing import Dict, List
from models import Asset, AssetCreate, AssetUpdate

class AssetService:
    def __init__(self):
        # In-memory database with some initial data
        self.assets: Dict[str, Asset] = {
            "AST-001": Asset(
                id="AST-001",
                type="Laptop",
                brand="Dell",
                model="Latitude 7420",
                assigned_to="EMP-1001",
                purchase_date="2023-05-15",
                status="Assigned"
            ),
            "AST-002": Asset(
                id="AST-002",
                type="Phone",
                brand="Apple",
                model="iPhone 15",
                assigned_to=None,
                purchase_date="2024-01-10",
                status="Available"
            ),
             "AST-003": Asset(
                id="AST-003",
                type="Server",
                brand="HP",
                model="ProLiant DL380",
                assigned_to=None,
                purchase_date="2022-11-20",
                status="Active"
            )
        }

    def get_all_assets(self) -> List[Asset]:
        return list(self.assets.values())

    def get_asset_by_id(self, asset_id: str) -> Asset:
        return self.assets.get(asset_id)

    def create_asset(self, asset_data: AssetCreate) -> Asset:
        asset_id = f"AST-{str(uuid.uuid4())[:8].upper()}"
        new_asset = Asset(id=asset_id, **asset_data.dict())
        self.assets[asset_id] = new_asset
        return new_asset

    def update_asset(self, asset_id: str, asset_data: AssetUpdate) -> Asset:
        if asset_id not in self.assets:
            return None
        
        current_asset = self.assets[asset_id].dict()
        update_data = asset_data.dict(exclude_unset=True)
        current_asset.update(update_data)
        
        updated_asset = Asset(**current_asset)
        self.assets[asset_id] = updated_asset
        return updated_asset

    def delete_asset(self, asset_id: str) -> bool:
        if asset_id in self.assets:
            del self.assets[asset_id]
            return True
        return False

    def assign_asset(self, asset_id: str, employee_id: str) -> Asset:
        if asset_id in self.assets:
            asset = self.assets[asset_id]
            asset.assigned_to = employee_id
            asset.status = "Assigned"
            return asset
        return None

    def update_status(self, asset_id: str, status: str) -> Asset:
        if asset_id in self.assets:
            asset = self.assets[asset_id]
            asset.status = status
            if status == "Available":
                asset.assigned_to = None
            return asset
        return None

    def find_assets(self, query: str) -> List[Asset]:
        query = query.lower()
        results = []
        for asset in self.assets.values():
            if (query in asset.brand.lower() or 
                query in asset.model.lower() or 
                query in asset.type.lower() or
                (asset.assigned_to and query in asset.assigned_to.lower())):
                results.append(asset)
        return results

asset_service = AssetService()
