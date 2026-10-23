import json, math, sys
sys.stdout.reconfigure(encoding='utf-8')

def make_island_poly(center_lon, center_lat, radius_deg=0.018, sides=8):
    coords = []
    for i in range(sides):
        angle = (2 * math.pi / sides) * i
        # slight elongation along EW or natural reef orientation
        dx = radius_deg * math.cos(angle)
        dy = radius_deg * 0.85 * math.sin(angle)
        coords.append([round(center_lon + dx, 5), round(center_lat + dy, 5)])
    coords.append(coords[0]) # close ring
    return [coords]

# 10 prominent islands & reefs of Quần đảo Hoàng Sa (Atlat GD, tr.4-5 & tr.13)
HOANG_SA_POINTS = [
    {"name": "Đảo Hoàng Sa", "coords": [111.608, 16.534]},
    {"name": "Đảo Phú Lâm", "coords": [112.336, 16.834]},
    {"name": "Đảo Cây", "coords": [112.271, 16.981]},
    {"name": "Đảo Linh Côn", "coords": [112.735, 16.666]},
    {"name": "Đảo Tri Tôn", "coords": [111.205, 15.780]},
    {"name": "Đảo Quang Hoà", "coords": [111.711, 16.452]},
    {"name": "Đảo Hữu Nhật", "coords": [111.586, 16.505]},
    {"name": "Đảo Quang Ảnh", "coords": [111.745, 16.463]},
    {"name": "Bãi Bom Bay", "coords": [112.510, 16.040]},
    {"name": "Đảo Bắc", "coords": [112.315, 16.963]}
]

# 20 prominent islands & reefs of Quần đảo Trường Sa (Atlat GD, tr.4-5 & tr.13)
TRUONG_SA_POINTS = [
    {"name": "Đảo Trường Sa", "coords": [111.919, 8.644]},
    {"name": "Đảo Song Tử Tây", "coords": [114.331, 11.428]},
    {"name": "Đảo Song Tử Đông", "coords": [114.361, 11.453]},
    {"name": "Đảo Nam Yết", "coords": [114.364, 10.181]},
    {"name": "Đảo Sinh Tồn", "coords": [114.329, 9.886]},
    {"name": "Đảo Sinh Tồn Đông", "coords": [114.533, 9.905]},
    {"name": "Đảo Sơn Ca", "coords": [114.478, 10.377]},
    {"name": "Đảo Ba Bình", "coords": [114.364, 10.376]},
    {"name": "Đảo Phan Vinh", "coords": [113.670, 8.970]},
    {"name": "Đảo An Bang", "coords": [112.155, 7.890]},
    {"name": "Đảo Trường Sa Đông", "coords": [112.355, 8.920]},
    {"name": "Đá Tây", "coords": [112.915, 8.855]},
    {"name": "Bãi Thuyền Chài", "coords": [113.305, 8.168]},
    {"name": "Bãi Tứ Chính", "coords": [110.450, 7.500]},
    {"name": "Đá Cô Lin", "coords": [114.230, 9.835]},
    {"name": "Đá Len Đao", "coords": [114.370, 9.780]},
    {"name": "Đá Nam", "coords": [114.650, 8.850]},
    {"name": "Bãi Vành Khăn", "coords": [115.860, 9.750]},
    {"name": "Bãi ngầm Phúc Tần", "coords": [111.670, 8.670]},
    {"name": "Đá Lớn", "coords": [112.600, 8.830]}
]

hs_polys = [make_island_poly(p["coords"][0], p["coords"][1], radius_deg=0.016) for p in HOANG_SA_POINTS]
ts_polys = [make_island_poly(p["coords"][0], p["coords"][1], radius_deg=0.016) for p in TRUONG_SA_POINTS]

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)

    updated = False
    for feat in data['features']:
        name = feat.get('properties', {}).get('name', '')
        if 'Hoàng Sa' in name:
            feat['geometry'] = {
                'type': 'MultiPolygon',
                'coordinates': hs_polys
            }
            feat['properties']['is_special_island'] = True
            feat['properties']['sovereignty'] = "Chủ quyền bất khả xâm phạm của Việt Nam - Trực thuộc TP. Đà Nẵng (Atlat GD, tr.4-5)"
            feat['properties']['islands_count'] = len(HOANG_SA_POINTS)
            updated = True
            print(f"Updated Hoàng Sa in {filepath}")
        elif 'Trường Sa' in name:
            feat['geometry'] = {
                'type': 'MultiPolygon',
                'coordinates': ts_polys
            }
            feat['properties']['is_special_island'] = True
            feat['properties']['sovereignty'] = "Chủ quyền bất khả xâm phạm của Việt Nam - Trực thuộc Tỉnh Khánh Hoà (Atlat GD, tr.4-5)"
            feat['properties']['islands_count'] = len(TRUONG_SA_POINTS)
            updated = True
            print(f"Updated Trường Sa in {filepath}")

    if updated:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Saved {filepath}")

update_file('public/data/vn_provinces_34.geojson')
update_file('public/data/vn_provinces_63.geojson')
print("Island update complete!")

