import json
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

with open("public/data/atlat_2026_master.json", "r", encoding="utf-8") as f:
    master = json.load(f)

print("Master keys:", list(master.keys()))
for k, v in master.items():
    if isinstance(v, list):
        print(f"  {k}: list of {len(v)} items")
    elif isinstance(v, dict):
        if "features" in v:
            print(f"  {k}: GeoJSON FeatureCollection with {len(v['features'])} features")
        else:
            print(f"  {k}: dict with {len(v)} keys")
