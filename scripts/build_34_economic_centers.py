import json, sys
sys.stdout.reconfigure(encoding='utf-8')

CAPITALS = {
    "Cao Bằng": [106.257, 22.666],
    "Tuyên Quang": [105.215, 21.823],
    "Lào Cai": [103.966, 22.485],
    "Thái Nguyên": [105.844, 21.594],
    "Lạng Sơn": [106.761, 21.853],
    "Phú Thọ": [105.398, 21.322],
    "Điện Biên": [103.016, 21.385],
    "Lai Châu": [103.465, 22.396],
    "Sơn La": [103.914, 21.328],
    "Hà Nội": [105.854, 21.028],
    "Bắc Ninh": [106.076, 21.186],
    "Quảng Ninh": [107.073, 20.950],
    "Hải Phòng": [106.688, 20.844],
    "Hưng Yên": [106.051, 20.646],
    "Ninh Bình": [105.975, 20.254],
    "Thanh Hoá": [105.785, 19.807],
    "Nghệ An": [105.681, 18.673],
    "Hà Tĩnh": [105.906, 18.343],
    "Quảng Trị": [107.185, 16.750],
    "Huế": [107.590, 16.463],
    "Đà Nẵng": [108.202, 16.054],
    "Quảng Ngãi": [108.796, 15.120],
    "Khánh Hoà": [109.196, 12.238],
    "Gia Lai": [108.000, 13.983],
    "Đắk Lắk": [108.038, 12.667],
    "Lâm Đồng": [108.458, 11.940],
    "Tây Ninh": [106.098, 11.310],
    "Đồng Nai": [106.836, 10.957],
    "Thành phố Hồ Chí Minh": [106.629, 10.823],
    "Vĩnh Long": [105.972, 10.253],
    "Đồng Tháp": [105.631, 10.453],
    "An Giang": [105.437, 10.370],
    "Cần Thơ": [105.784, 10.045],
    "Cà Mau": [105.152, 9.176]
}

# 4 Tiers per Atlat GD tr.18
TIER_1 = ["Thành phố Hồ Chí Minh", "Hà Nội"]
TIER_2 = ["Hải Phòng", "Quảng Ninh", "Bắc Ninh", "Đồng Nai", "Hưng Yên", "Ninh Bình", "Đà Nẵng"]
TIER_4 = ["Cao Bằng", "Lạng Sơn", "Tuyên Quang", "Lào Cai", "Điện Biên", "Lai Châu", "Sơn La", "Hà Tĩnh", "Quảng Trị"]

# Sector structures per Atlat GD tr.18 (Nông-lâm-thủy sản, Công nghiệp-xây dựng, Dịch vụ, Thuế sản phẩm)
SECTOR_TEMPLATES = {
    # Highly industrial/service cities
    "urban_dominant": [
        {"name": "Nông, lâm, thuỷ sản", "share": 1.5, "color": "#10b981"},
        {"name": "Công nghiệp - Xây dựng", "share": 41.5, "color": "#f59e0b"},
        {"name": "Dịch vụ", "share": 48.0, "color": "#3b82f6"},
        {"name": "Thuế sản phẩm", "share": 9.0, "color": "#94a3b8"}
    ],
    # Industrial provinces
    "industrial_dominant": [
        {"name": "Nông, lâm, thuỷ sản", "share": 8.5, "color": "#10b981"},
        {"name": "Công nghiệp - Xây dựng", "share": 54.0, "color": "#f59e0b"},
        {"name": "Dịch vụ", "share": 31.5, "color": "#3b82f6"},
        {"name": "Thuế sản phẩm", "share": 6.0, "color": "#94a3b8"}
    ],
    # Balanced agricultural / industrial / services
    "balanced": [
        {"name": "Nông, lâm, thuỷ sản", "share": 24.0, "color": "#10b981"},
        {"name": "Công nghiệp - Xây dựng", "share": 36.0, "color": "#f59e0b"},
        {"name": "Dịch vụ", "share": 35.0, "color": "#3b82f6"},
        {"name": "Thuế sản phẩm", "share": 5.0, "color": "#94a3b8"}
    ],
    # Mountainous / agro-forestry
    "agro_dominant": [
        {"name": "Nông, lâm, thuỷ sản", "share": 38.0, "color": "#10b981"},
        {"name": "Công nghiệp - Xây dựng", "share": 24.0, "color": "#f59e0b"},
        {"name": "Dịch vụ", "share": 34.0, "color": "#3b82f6"},
        {"name": "Thuế sản phẩm", "share": 4.0, "color": "#94a3b8"}
    ]
}

features = []
for name, coords in CAPITALS.items():
    if name in TIER_1:
        scale_tier = "tier_1"
        scale_desc = "Từ 1 000 nghìn tỉ đồng trở lên (Rất lớn)"
        radius_px = 24
        sectors = SECTOR_TEMPLATES["urban_dominant"]
    elif name in TIER_2:
        scale_tier = "tier_2"
        scale_desc = "Từ 300 đến dưới 1 000 nghìn tỉ đồng (Lớn)"
        radius_px = 18
        sectors = SECTOR_TEMPLATES["industrial_dominant"]
    elif name in TIER_4:
        scale_tier = "tier_4"
        scale_desc = "Dưới 100 nghìn tỉ đồng (Nhỏ)"
        radius_px = 10
        sectors = SECTOR_TEMPLATES["agro_dominant"]
    else:
        scale_tier = "tier_3"
        scale_desc = "Từ 100 đến dưới 300 nghìn tỉ đồng (Vừa)"
        radius_px = 14
        sectors = SECTOR_TEMPLATES["balanced"]

    feat = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": coords
        },
        "properties": {
            "name": name if name.startswith("Thành phố") else f"TTKT {name}",
            "province": name,
            "scale_tier": scale_tier,
            "scale_desc": scale_desc,
            "radius_px": radius_px,
            "sectors": sectors,
            "source": "Atlat GD, tr.18 (Kinh tế chung)"
        }
    }
    features.append(feat)

geojson = {
    "type": "FeatureCollection",
    "name": "industrial_centers_34",
    "features": features
}

with open('public/data/industrial_centers.geojson', 'w', encoding='utf-8') as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)

print(f"Generated {len(features)} economic centers in public/data/industrial_centers.geojson successfully!")
