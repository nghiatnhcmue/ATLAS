import json, sys, os
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
import shapely

sys.stdout.reconfigure(encoding='utf-8')

print("=== STARTING CORE DATA REBUILD V3 ===")

# ==============================================================================
# 1. BUG-40: REBUILD 5 PROVINCES OF REGION IV (NGHỊ QUYẾT 202/2025 & ATLAT GD TR.5)
# ==============================================================================
p63_file = 'public/data/vn_provinces_63.geojson'
p34_file = 'public/data/vn_provinces_34.geojson'
vn_file = 'public/data/vn_provinces.geojson'

p63 = json.load(open(p63_file, encoding='utf-8'))
p34 = json.load(open(p34_file, encoding='utf-8'))
vn = json.load(open(vn_file, encoding='utf-8'))

feat_63_by_name = {f['properties']['name']: f for f in p63['features']}

REGION_IV_MERGERS = {
    'Tỉnh Gia Lai': {
        'constituents': ['Gia Lai', 'Bình Định'],
        'area': 21576.5,
        'pop': 3153.4,
        'capital': 'Thành phố Pleiku',
        'region': 'IV. Duyên hải Nam Trung Bộ & Tây Nguyên',
        'region_id': 4
    },
    'Tỉnh Quảng Ngãi': {
        'constituents': ['Quảng Ngãi', 'Kon Tum'],
        'area': 14832.6,
        'pop': 1839.6,
        'capital': 'Thành phố Quảng Ngãi',
        'region': 'IV. Duyên hải Nam Trung Bộ & Tây Nguyên',
        'region_id': 4
    },
    'Tỉnh Khánh Hoà': {
        'constituents': ['Khánh Hoà', 'Ninh Thuận'],
        'area': 8555.9,
        'pop': 1890.1,
        'capital': 'Thành phố Nha Trang',
        'region': 'IV. Duyên hải Nam Trung Bộ & Tây Nguyên',
        'region_id': 4
    },
    'Tỉnh Lâm Đồng': {
        'constituents': ['Lâm Đồng', 'Bình Thuận', 'Đắk Nông'],
        'area': 24233.1,
        'pop': 3324.4,
        'capital': 'Thành phố Đà Lạt',
        'region': 'IV. Duyên hải Nam Trung Bộ & Tây Nguyên',
        'region_id': 4
    },
    'Tỉnh Đắk Lắk': {
        'constituents': ['Đắk Lắk', 'Phú Yên'],
        'area': 18096.4,
        'pop': 2802.8,
        'capital': 'Thành phố Buôn Ma Thuột',
        'region': 'IV. Duyên hải Nam Trung Bộ & Tây Nguyên',
        'region_id': 4
    }
}

for f in p34['features']:
    name = f['properties']['name']
    if name in REGION_IV_MERGERS:
        cfg = REGION_IV_MERGERS[name]
        geoms = [shapely.make_valid(shape(feat_63_by_name[c]['geometry'])).buffer(0) for c in cfg['constituents']]
        merged_geom = unary_union(geoms)
        f['geometry'] = mapping(merged_geom)
        f['properties']['merged_from'] = cfg['constituents']
        f['properties']['area'] = cfg['area']
        f['properties']['pop'] = cfg['pop']
        f['properties']['capital'] = cfg['capital']
        f['properties']['region_name'] = cfg['region']
        f['properties']['region_id'] = cfg['region_id']
        f['properties']['density'] = round((cfg['pop'] * 1000) / cfg['area'])
        print(f"Rebuilt geometry & props for {name}")

correct_merged_into = {
    'Bình Định': 'Tỉnh Gia Lai',
    'Gia Lai': 'Tỉnh Gia Lai',
    'Kon Tum': 'Tỉnh Quảng Ngãi',
    'Quảng Ngãi': 'Tỉnh Quảng Ngãi',
    'Ninh Thuận': 'Tỉnh Khánh Hoà',
    'Khánh Hoà': 'Tỉnh Khánh Hoà',
    'Đắk Nông': 'Tỉnh Lâm Đồng',
    'Bình Thuận': 'Tỉnh Lâm Đồng',
    'Lâm Đồng': 'Tỉnh Lâm Đồng',
    'Phú Yên': 'Tỉnh Đắk Lắk',
    'Đắk Lắk': 'Tỉnh Đắk Lắk'
}

for f in p63['features']:
    pname = f['properties']['name']
    if pname in correct_merged_into:
        f['properties']['merged_into'] = correct_merged_into[pname]

for f in vn['features']:
    pname = f['properties']['name']
    if pname in correct_merged_into:
        f['properties']['merged_into'] = correct_merged_into[pname]

with open(p34_file, 'w', encoding='utf-8') as f:
    json.dump(p34, f, ensure_ascii=False, indent=2)

with open(p63_file, 'w', encoding='utf-8') as f:
    json.dump(p63, f, ensure_ascii=False, indent=2)

with open(vn_file, 'w', encoding='utf-8') as f:
    json.dump(vn, f, ensure_ascii=False, indent=2)

print("Saved updated province geojsons!")

# ==============================================================================
# 2. BUG-31: OIL & GAS COORDINATES ACCURATELY DIGITIZED FROM ATLAT GD TR.13
# ==============================================================================
minerals_file = 'public/data/minerals.geojson'
minerals = json.load(open(minerals_file, encoding='utf-8'))

OFFSHORE_OIL_GAS = {
    'Mỏ dầu Hồng Ngọc': {'coords': [108.60, 10.55], 'province': 'Thành phố Hồ Chí Minh', 'desc': 'Mỏ dầu Hồng Ngọc (Thềm lục địa Nam Bộ, Atlat GD tr.13).'},
    'Mỏ khí Lan Tây': {'coords': [108.85, 7.51], 'province': 'Thành phố Hồ Chí Minh', 'desc': 'Mỏ khí Lan Tây (Bể Nam Côn Sơn, Atlat GD tr.13).'},
    'Mỏ khí Lan Đỏ': {'coords': [109.10, 7.58], 'province': 'Thành phố Hồ Chí Minh', 'desc': 'Mỏ khí Lan Đỏ (Bể Nam Côn Sơn, Atlat GD tr.13).'},
    'Mỏ dầu Rạng Đông': {'coords': [108.28, 10.06], 'province': 'Thành phố Hồ Chí Minh', 'desc': 'Mỏ dầu Rạng Đông (Bể Cửu Long, Atlat GD tr.13).'},
    'Mỏ dầu Bạch Hổ': {'coords': [107.98, 9.80], 'province': 'Thành phố Hồ Chí Minh', 'desc': 'Mỏ dầu Bạch Hổ (Bể Cửu Long, Atlat GD tr.13).'},
    'Mỏ dầu Rồng': {'coords': [107.90, 9.70], 'province': 'Thành phố Hồ Chí Minh', 'desc': 'Mỏ dầu Rồng (Bể Cửu Long, Atlat GD tr.13).'},
    'Mỏ dầu Đại Hùng': {'coords': [108.72, 8.48], 'province': 'Thành phố Hồ Chí Minh', 'desc': 'Mỏ dầu Đại Hùng (Bể Nam Côn Sơn, Atlat GD tr.13).'}
}

for f in minerals['features']:
    p = f['properties']
    name = p.get('name', '')
    if name in OFFSHORE_OIL_GAS:
        f['geometry']['coordinates'] = OFFSHORE_OIL_GAS[name]['coords']
        p['province'] = OFFSHORE_OIL_GAS[name]['province']
        p['desc'] = OFFSHORE_OIL_GAS[name]['desc']
        print(f"Updated coordinates for {name}")

    if 'Nhân Cơ' in name:
        p['province'] = 'Tỉnh Lâm Đồng'
        p['desc'] = 'Mỏ bôxit Nhân Cơ (Lâm Đồng - Atlat GD tr.13).'
        print("Updated Nhân Cơ province -> Lâm Đồng")
    elif 'Phù Cát' in name:
        p['province'] = 'Tỉnh Gia Lai'
        p['desc'] = 'Mỏ titan Phù Cát (Gia Lai - Atlat GD tr.13).'
        print("Updated Phù Cát province -> Gia Lai")
    elif 'Kỳ Anh' in name or 'Cẩm Xuyên' in name:
        p['name'] = 'Mỏ titan Cẩm Xuyên'
        p['desc'] = 'Mỏ titan Cẩm Xuyên (Hà Tĩnh, Atlat GD tr.13).'
        p['aliases'] = ['Titan Kỳ Anh', 'Titan Cẩm Xuyên']
        print("Updated Titan Kỳ Anh -> Cẩm Xuyên")

with open(minerals_file, 'w', encoding='utf-8') as f:
    json.dump(minerals, f, ensure_ascii=False, indent=2)

print("Saved updated minerals.geojson!")

# ==============================================================================
# 3. BUG-31 & BUG-07: POWER PLANTS ACCURATELY NAMED & PROVINCES UPDATED
# ==============================================================================
power_file = 'public/data/hydropower.geojson'
power = json.load(open(power_file, encoding='utf-8'))

for f in power['features']:
    p = f['properties']
    if 'Yaly' in p.get('name', ''):
        p['name'] = 'Thủy điện Ialy'
        p['aliases'] = ['Thủy điện Yaly']
        if p.get('desc'):
            p['desc'] = p['desc'].replace('Yaly', 'Ialy')
        print("Updated Yaly -> Ialy")

    if 'Trung Nam Thuận Nam' in p.get('name', '') or 'Trung Nam (Ninh Thuận)' in p.get('name', ''):
        p['province'] = 'Tỉnh Khánh Hoà'
        p['desc'] = 'Nhà máy điện năng lượng tái tạo (Khánh Hoà - Atlat GD tr.23).'
        print("Updated Trung Nam Thuận Nam province -> Khánh Hoà")

    if 'Vĩnh Tân' in p.get('name', ''):
        p['province'] = 'Tỉnh Lâm Đồng'
        p['desc'] = 'Trung tâm nhiệt điện Vĩnh Tân (Lâm Đồng - Atlat GD tr.23).'

with open(power_file, 'w', encoding='utf-8') as f:
    json.dump(power, f, ensure_ascii=False, indent=2)

print("Saved updated hydropower.geojson!")

# ==============================================================================
# 4. BUG-32: MOUNTAIN RANGES & RIVERS ACCURATELY ALIGNED TO GD TR.14-15
# ==============================================================================
topo_file = 'public/data/topography_rivers.geojson'
topo = json.load(open(topo_file, encoding='utf-8'))

for f in topo['features']:
    p = f['properties']
    name = p.get('name', '')
    if 'Trường Sơn Bắc' in name:
        f['geometry']['coordinates'] = [
            [104.90, 19.30], [105.30, 18.70], [105.60, 18.20],
            [106.00, 17.80], [106.30, 17.20], [106.70, 16.80]
        ]
        p['note'] = 'Dãy Trường Sơn Bắc chạy dọc biên giới Việt - Lào (Atlat GD, tr.14).'
        print("Updated Dãy Trường Sơn Bắc alignment")
    elif 'Đông Triều' in name:
        f['geometry']['coordinates'] = [
            [106.50, 21.10], [106.80, 21.15], [107.10, 21.22],
            [107.45, 21.35], [107.75, 21.50]
        ]
        p['note'] = 'Cánh cung Đông Triều chạy vòng cung Tây - Đông (Atlat GD, tr.14).'
        print("Updated Cánh cung Đông Triều alignment")
    elif 'Trường Sơn Nam' in name:
        f['geometry']['coordinates'] = [
            [107.90, 16.00], [108.30, 15.30], [108.70, 14.80],
            [108.90, 14.00], [109.00, 13.00], [108.90, 12.20], [108.60, 11.50]
        ]
        p['note'] = 'Dãy Trường Sơn Nam chạy theo dải núi phía đông (Atlat GD, tr.14).'
        print("Updated Dãy Trường Sơn Nam alignment")
    elif 'Langbiang' in name:
        p['name'] = 'Đỉnh Lang Biang'
        p['aliases'] = ['Langbiang', 'Đỉnh Lâm Viên']
        p['desc'] = 'Đỉnh Lang Biang (2.167 m, Lâm Đồng - Atlat GD tr.15).'
        print("Updated Langbiang -> Lang Biang")

with open(topo_file, 'w', encoding='utf-8') as f:
    json.dump(topo, f, ensure_ascii=False, indent=2)

print("Saved updated topography_rivers.geojson!")

# ==============================================================================
# 5. BUG-37: TRANSPORTATION CITATION GD TR.24
# ==============================================================================
trans_file = 'public/data/transportation.geojson'
trans = json.load(open(trans_file, encoding='utf-8'))

for f in trans['features']:
    p = f['properties']
    p['atlat_page'] = 24
    p['source'] = 'Atlat GD, tr.24 (Giao thông vận tải)'
    if 'Cái Mép' in p.get('name', ''):
        p['province'] = 'Thành phố Hồ Chí Minh'
        p['aliases'] = ['Cảng Cái Mép - Thị Vải (Bà Rịa - Vũng Tàu cũ)']

with open(trans_file, 'w', encoding='utf-8') as f:
    json.dump(trans, f, ensure_ascii=False, indent=2)

print("Saved updated transportation.geojson!")

print("=== CORE DATA REBUILD V3 COMPLETED! ===")
