import json
import ast
from services import assets_service

def get_assets() ->  dict:
    return assets_service.get_all_assets()