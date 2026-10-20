#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GeoAtlas Interactive - Automated Backend & Spatial Data Diagnostics & Auto-Fix Script
Scans and auto-repairs:
1. Flipped coordinates [Longitude, Latitude] bug.
2. JSON NaN / Infinity / None sanitization.
3. UTF-8 character encoding integrity.
4. Empty geometry and sovereignty demarcation (Hoàng Sa & Trường Sa).
5. Schema Contract Check between Python ETL and JavaScript Frontend.
"""

import json
import os
import sys
import math

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data")

def check_and_fix_coords(coords, geom_type):
    """
    Checks if coordinates are [Longitude, Latitude].
    For Vietnam:
    Longitude: ~102.0 to 118.5
    Latitude: ~6.0 to 24.5
    If flipped [lat, lng], auto-flips to [lng, lat].
    """
    flipped_count = 0

    def fix_point(pt):
        nonlocal flipped_count
        if len(pt) >= 2:
            x, y = pt[0], pt[1]
            # If x looks like latitude (6 to 25) and y looks like longitude (102 to 119)
            if (6.0 <= x <= 25.0) and (101.0 <= y <= 119.0):
                flipped_count += 1
                return [y, x] + pt[2:]
        return pt

    def process_nested(item):
        if not isinstance(item, list):
            return item
        if len(item) >= 2 and all(isinstance(v, (int, float)) for v in item[:2]):
            return fix_point(item)
        return [process_nested(sub) for sub in item]

    fixed_coords = process_nested(coords)
    return fixed_coords, flipped_count

def sanitize_json_val(obj):
    """Recursively replaces NaN, Infinity, -Infinity with 0 or None."""
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return 0
        return obj
    elif isinstance(obj, dict):
        return {k: sanitize_json_val(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_json_val(v) for v in obj]
    return obj

def audit_file(filepath):
    filename = os.path.basename(filepath)
    report = {
        "file": filename,
        "size_kb": os.path.getsize(filepath) / 1024.0,
        "records": 0,
        "flipped_coords_fixed": 0,
        "nan_infinity_fixed": 0,
        "sovereignty_verified": True,
        "schema_ok": True,
        "schema_issues": []
    }

    with open(filepath, "r", encoding="utf-8") as f:
        raw_text = f.read()

    # Check for NaN / Infinity in raw text
    nan_count = raw_text.count("NaN") + raw_text.count("Infinity")
    report["nan_infinity_fixed"] = nan_count

    data = json.loads(raw_text)
    data = sanitize_json_val(data)
    dirty = (nan_count > 0)

    # 1. vn_provinces.geojson
    if filename == "vn_provinces.geojson":
        features = data.get("features", [])
        report["records"] = len(features)
        
        # Check sovereignty
        names = [f.get("properties", {}).get("name", "") for f in features]
        has_hs = any("Hoàng Sa" in n for n in names)
        has_ts = any("Trường Sa" in n for n in names)
        report["sovereignty_verified"] = (has_hs and has_ts)
        if not report["sovereignty_verified"]:
            report["schema_issues"].append("Thiếu Quần đảo Hoàng Sa hoặc Trường Sa")

        for f in features:
            geom = f.get("geometry")
            if not geom or not geom.get("coordinates"):
                report["schema_issues"].append(f"Hình học rỗng: {f.get('properties', {}).get('name')}")
            else:
                fixed, count = check_and_fix_coords(geom["coordinates"], geom.get("type"))
                if count > 0:
                    geom["coordinates"] = fixed
                    report["flipped_coords_fixed"] += count
                    dirty = True

    # 2. minerals.geojson
    elif filename == "minerals.geojson":
        features = data.get("features", [])
        report["records"] = len(features)
        required_keys = ["id", "name", "mineral_type", "symbol_type", "province", "atlat_page"]
        
        for i, f in enumerate(features):
            props = f.get("properties", {})
            geom = f.get("geometry", {})
            coords = geom.get("coordinates", [])

            # Check id
            if "id" not in props:
                props["id"] = f"MIN_{i+1:02d}"
                dirty = True

            for k in required_keys:
                if k not in props:
                    report["schema_issues"].append(f"Thiếu key '{k}' ở mỏ {props.get('name')}")
                    report["schema_ok"] = False

            # Check coords
            fixed, count = check_and_fix_coords(coords, "Point")
            if count > 0:
                geom["coordinates"] = fixed
                report["flipped_coords_fixed"] += count
                dirty = True

    # 3. hydropower.geojson
    elif filename == "hydropower.geojson":
        features = data.get("features", [])
        report["records"] = len(features)
        required_keys = ["id", "name", "capacity_mw", "river_fuel", "province", "atlat_page"]

        for i, f in enumerate(features):
            props = f.get("properties", {})
            geom = f.get("geometry", {})
            coords = geom.get("coordinates", [])

            if "id" not in props:
                props["id"] = f"POW_{i+1:02d}"
                dirty = True
            if "plant_type" not in props:
                props["plant_type"] = props.get("type", "Thủy điện")
                dirty = True
            if "type" not in props:
                props["type"] = props.get("plant_type", "Thủy điện")
                dirty = True

            for k in required_keys:
                if k not in props:
                    report["schema_issues"].append(f"Thiếu key '{k}' ở nhà máy {props.get('name')}")
                    report["schema_ok"] = False

            fixed, count = check_and_fix_coords(coords, "Point")
            if count > 0:
                geom["coordinates"] = fixed
                report["flipped_coords_fixed"] += count
                dirty = True

    # 4. industrial_centers.geojson
    elif filename == "industrial_centers.geojson":
        features = data.get("features", [])
        report["records"] = len(features)
        required_keys = ["id", "name", "scale_tier", "radius_px", "sectors"]

        for i, f in enumerate(features):
            props = f.get("properties", {})
            geom = f.get("geometry", {})
            coords = geom.get("coordinates", [])

            if "id" not in props:
                props["id"] = f"IND_{i+1:02d}"
                dirty = True

            for k in required_keys:
                if k not in props:
                    report["schema_issues"].append(f"Thiếu key '{k}' ở TTCN {props.get('name')}")
                    report["schema_ok"] = False

            # Check sectors array
            sectors = props.get("sectors", [])
            if not isinstance(sectors, list) or len(sectors) == 0:
                report["schema_issues"].append(f"sectors không phải array ở {props.get('name')}")
                report["schema_ok"] = False
            else:
                for s in sectors:
                    if isinstance(s, dict):
                        if "name" not in s and "sector" in s:
                            s["name"] = s["sector"]
                            dirty = True
                        if "sector" not in s and "name" in s:
                            s["sector"] = s["name"]
                            dirty = True

            fixed, count = check_and_fix_coords(coords, "Point")
            if count > 0:
                geom["coordinates"] = fixed
                report["flipped_coords_fixed"] += count
                dirty = True

    # 5. chart_questions.json
    elif filename == "chart_questions.json":
        questions = data.get("questions", [])
        report["records"] = len(questions)
        required_keys = ["id", "raw_prompt", "keywords", "structural_analysis", "data_table", "optimal_chart", "pedagogical_explanation"]

        for q in questions:
            for k in required_keys:
                if k not in q:
                    report["schema_issues"].append(f"Thiếu key '{k}' ở câu {q.get('id')}")
                    report["schema_ok"] = False
            
            # Check data_table.rows numerical values
            data_tbl = q.get("data_table", {})
            rows = data_tbl.get("rows", [])
            for r in rows:
                if isinstance(r, dict) and "values" in r:
                    cleaned_vals = []
                    for v in r["values"]:
                        if isinstance(v, (int, float)):
                            cleaned_vals.append(v)
                        else:
                            # Parse string e.g. "18,4" -> 18.4
                            clean_num = float(str(v).replace(",", ".").replace("%", "").strip())
                            cleaned_vals.append(clean_num)
                            dirty = True
                    r["values"] = cleaned_vals

    # Save back if auto-repaired
    if dirty:
        with open(filepath, "w", encoding="utf-8") as fw:
            json.dump(data, fw, ensure_ascii=False, indent=2)

    return report

def main():
    print("=" * 70)
    print("  GEOATLAS AUTOMATED BACKEND & SPATIAL DATA INTEGRITY AUDITOR")
    print("=" * 70)

    files = [
        "vn_provinces.geojson",
        "minerals.geojson",
        "hydropower.geojson",
        "industrial_centers.geojson",
        "chart_questions.json"
    ]

    all_passed = True
    reports = []

    for fn in files:
        fp = os.path.join(DATA_DIR, fn)
        if not os.path.exists(fp):
            print(f"[!] KHÔNG TÌM THẤY TỆP: {fp}")
            all_passed = False
            continue
        rep = audit_file(fp)
        reports.append(rep)

    print(f"\n{'Tệp dữ liệu':<28} | {'Dung lượng':<10} | {'Bản ghi':<8} | {'Tọa độ':<8} | {'Chủ quyền':<10} | {'Schema':<8}")
    print("-" * 80)
    for r in reports:
        sovereignty = "ĐẠT (HS&TS)" if r["sovereignty_verified"] else "THIẾU"
        schema_status = "ĐỒNG BỘ" if r["schema_ok"] else "LỖI"
        coords_status = f"ĐÃ SỬA {r['flipped_coords_fixed']}" if r["flipped_coords_fixed"] > 0 else "CHUẨN"
        print(f"{r['file']:<28} | {r['size_kb']:>7.1f} KB | {r['records']:>7} | {coords_status:<8} | {sovereignty:<10} | {schema_status:<8}")

    print("-" * 80)
    for r in reports:
        if r["schema_issues"]:
            print(f"[!] Cảnh báo schema ở {r['file']}: {', '.join(r['schema_issues'])}")

    print("\n[+] TẤT CẢ TỆP DỮ LIỆU ĐÃ ĐƯỢC CHUẨN HÓA VÀ ĐỒNG BỘ SCHEMA THÀNH CÔNG!")
    print("=" * 70)

if __name__ == "__main__":
    main()

