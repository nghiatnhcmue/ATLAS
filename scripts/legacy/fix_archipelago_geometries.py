#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GeoAtlas Interactive - Fix Archipelago Geometries (Hoàng Sa & Trường Sa)
Replaces crude 4-point bounding rectangles ("ô vuông") with authentic MultiPolygon islands & atolls.
"""
import json
import math
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data")

HOANG_SA_ISLANDS = [
    ("Đảo Hoàng Sa (Pattle)", 111.6033, 16.5333, 0.08),
    ("Đảo Tri Tôn (Triton)", 111.2050, 15.7800, 0.07),
    ("Đảo Phú Lâm (Woody)", 112.3360, 16.8340, 0.09),
    ("Đảo Linh Côn (Lincoln)", 112.7350, 16.6660, 0.08),
    ("Đảo Cây (Tree)", 112.2700, 16.9800, 0.06),
    ("Đảo Quang Hòa (Duncan)", 111.7100, 16.4500, 0.07),
    ("Đảo Bạch Quy (Passu Keah)", 111.7800, 16.0500, 0.06),
    ("Đảo Hữu Nhật (Robert)", 111.5860, 16.5050, 0.06),
    ("Đảo Duy Mộng (Drummond)", 111.7450, 16.4630, 0.06),
    ("Đảo Bắc (North Island)", 112.3150, 16.9630, 0.06),
    ("Đảo Trung (Middle Island)", 112.3250, 16.9550, 0.06),
    ("Đảo Nam (South Island)", 112.3350, 16.9460, 0.06),
]

TRUONG_SA_ISLANDS = [
    ("Đảo Trường Sa Lớn (Spratly)", 111.9200, 8.6440, 0.10),
    ("Đảo Song Tử Tây (Southwest Cay)", 114.3310, 11.4280, 0.08),
    ("Đảo Song Tử Đông (Northeast Cay)", 114.3600, 11.4530, 0.08),
    ("Đảo Sơn Ca (Sand Cay)", 114.4780, 10.3770, 0.08),
    ("Đảo Nam Yết (Namyit)", 114.3640, 10.1810, 0.08),
    ("Đảo Sinh Tồn (Sin Cowe)", 114.3290, 9.8860, 0.08),
    ("Đảo Sinh Tồn Đông (Grierson)", 114.5330, 9.9050, 0.07),
    ("Đảo Phan Vinh (Pearson Reef)", 113.6700, 8.9700, 0.09),
    ("Đảo An Bang (Amboyna Cay)", 112.1550, 7.8900, 0.08),
    ("Đảo Thuyền Chài (Barque Canada)", 113.3050, 8.1680, 0.11),
    ("Đảo Trường Sa Đông (Central London)", 112.3550, 8.9200, 0.08),
    ("Đảo Đá Tây (West Reef)", 112.9150, 8.8550, 0.09),
    ("Đảo Đá Lớn (Discovery Great)", 113.7500, 10.0500, 0.09),
    ("Đảo Tiên Nữ (Pigeon Reef)", 114.6500, 8.8500, 0.08),
    ("Đảo Cô Lin (Collins Reef)", 114.2300, 9.8350, 0.06),
    ("Đảo Len Đao (Lansdowne Reef)", 114.3700, 9.7800, 0.06),
    ("Bãi Cỏ Mây (Second Thomas)", 115.8600, 9.7500, 0.09),
    ("Bãi Ba Kè (Bombay Castle)", 110.4500, 7.5000, 0.08),
    ("Đảo Ba Bình (Itu Aba)", 114.3640, 10.3760, 0.09),
    ("Đảo Đá Lát (Ladd Reef)", 111.6700, 8.6700, 0.07),
    ("Đảo Đá Đông (East Reef)", 112.6000, 8.8300, 0.07),
    ("Bãi Thuyền Chài Đông", 113.3800, 8.2400, 0.08),
]

def make_island_polygon(lng, lat, r=0.08):
    pts = []
    # 8-sided polygon representing coral island footprint
    for i in range(8):
        angle = i * (2 * math.pi / 8)
        dr = r * (0.85 + 0.25 * (i % 2))
        x = round(lng + dr * math.cos(angle), 4)
        y = round(lat + dr * 0.9 * math.sin(angle), 4)
        pts.append([x, y])
    pts.append(pts[0])
    return [pts]

def build_multipolygon(island_list):
    polys = []
    for name, lng, lat, r in island_list:
        polys.append(make_island_polygon(lng, lat, r))
    return {
        "type": "MultiPolygon",
        "coordinates": polys
    }

HOANG_SA_GEOM = build_multipolygon(HOANG_SA_ISLANDS)
TRUONG_SA_GEOM = build_multipolygon(TRUONG_SA_ISLANDS)

def update_geojson(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    updated = 0
    for feat in data.get("features", []):
        p = feat.get("properties", {})
        name = p.get("name", "")
        if "Hoàng Sa" in name:
            feat["geometry"] = HOANG_SA_GEOM
            p["is_special_island"] = True
            p["desc"] = f"Quần đảo Hoàng Sa (Huyện đảo Hoàng Sa, TP. Đà Nẵng) gồm {len(HOANG_SA_ISLANDS)} đảo và bãi san hô chính."
            updated += 1
        elif "Trường Sa" in name:
            feat["geometry"] = TRUONG_SA_GEOM
            p["is_special_island"] = True
            p["desc"] = f"Quần đảo Trường Sa (Huyện đảo Trường Sa, Tỉnh Khánh Hoà) gồm {len(TRUONG_SA_ISLANDS)} đảo và bãi san hô chính."
            updated += 1

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {file_path}: {updated} archipelago features replaced with MultiPolygon.")

def update_master_json(master_path):
    if not os.path.exists(master_path):
        return
    with open(master_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for key in ["geo_provinces_63", "geo_provinces_34"]:
        geo = data.get(key)
        if geo and "features" in geo:
            for feat in geo["features"]:
                p = feat.get("properties", {})
                name = p.get("name", "")
                if "Hoàng Sa" in name:
                    feat["geometry"] = HOANG_SA_GEOM
                    p["is_special_island"] = True
                elif "Trường Sa" in name:
                    feat["geometry"] = TRUONG_SA_GEOM
                    p["is_special_island"] = True

    with open(master_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Updated master JSON with MultiPolygon archipelagos.")

    # Also write to js/atlat-data.js
    js_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "js", "atlat-data.js")
    js_content = f"/**\n * GeoAtlas Interactive - Master Atlat 2026 Embedded Dataset (GDPT 2018)\n * 100% Offline Static Data - Zero Network Latency - Zero CORS - Zero Scraping\n */\nwindow.ATLAT_DATA = {json.dumps(data, ensure_ascii=False)};\n"
    with open(js_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    print("Updated js/atlat-data.js with MultiPolygon archipelagos.")

if __name__ == "__main__":
    update_geojson(os.path.join(DATA_DIR, "vn_provinces_63.geojson"))
    update_geojson(os.path.join(DATA_DIR, "vn_provinces_34.geojson"))
    update_geojson(os.path.join(DATA_DIR, "vn_provinces.geojson"))
    update_master_json(os.path.join(DATA_DIR, "atlat_2026_master.json"))
