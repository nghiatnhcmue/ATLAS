#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GeoAtlas Interactive - Data Pipeline: Build 34 Administrative Units (NQ 202/2025/QH15)
& Standardize 63 Traditional Provinces (SGK THPT & Atlat Dia li Viet Nam)
"""

import json
import os
import sys
import shapely
from shapely.geometry import shape, mapping
from shapely.ops import unary_union

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "public", "data")
OLD_GEOJSON_PATH = os.path.join(DATA_DIR, "vn_provinces_63.geojson")
OUT_63_PATH = os.path.join(DATA_DIR, "vn_provinces_63.geojson")
OUT_34_PATH = os.path.join(DATA_DIR, "vn_provinces_34.geojson")

# Danh mục 63 Tỉnh Thành Cũ chuẩn Niên giám Thống kê GSO & Atlat Địa lí
PROVINCE_63_INFO = {
    # 1. Đồng bằng sông Hồng (11)
    "Hà Nội": {"region": "Đồng bằng sông Hồng", "type": "Thành phố trực thuộc Trung ương", "area": 3359.8, "pop": 8587.1, "merged_into": "Thành phố Hà Nội"},
    "Hải Phòng": {"region": "Đồng bằng sông Hồng", "type": "Thành phố trực thuộc Trung ương", "area": 1561.8, "pop": 2088.0, "merged_into": "Thành phố Hải Phòng"},
    "Hải Dương": {"region": "Đồng bằng sông Hồng", "type": "Tỉnh", "area": 1668.2, "pop": 1947.3, "merged_into": "Thành phố Hải Phòng"},
    "Hưng Yên": {"region": "Đồng bằng sông Hồng", "type": "Tỉnh", "area": 930.2, "pop": 1292.0, "merged_into": "Tỉnh Hưng Yên"},
    "Thái Bình": {"region": "Đồng bằng sông Hồng", "type": "Tỉnh", "area": 1586.4, "pop": 1878.9, "merged_into": "Tỉnh Hưng Yên"},
    "Hà Nam": {"region": "Đồng bằng sông Hồng", "type": "Tỉnh", "area": 861.9, "pop": 881.8, "merged_into": "Tỉnh Ninh Bình"},
    "Nam Định": {"region": "Đồng bằng sông Hồng", "type": "Tỉnh", "area": 1668.6, "pop": 1802.7, "merged_into": "Tỉnh Ninh Bình"},
    "Ninh Bình": {"region": "Đồng bằng sông Hồng", "type": "Tỉnh", "area": 1411.8, "pop": 1015.5, "merged_into": "Tỉnh Ninh Bình"},
    "Vĩnh Phúc": {"region": "Đồng bằng sông Hồng", "type": "Tỉnh", "area": 1235.9, "pop": 1197.6, "merged_into": "Tỉnh Phú Thọ"},
    "Bắc Ninh": {"region": "Đồng bằng sông Hồng", "type": "Tỉnh", "area": 822.7, "pop": 1488.2, "merged_into": "Tỉnh Bắc Ninh"},
    "Quảng Ninh": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 6207.9, "pop": 1362.9, "merged_into": "Tỉnh Quảng Ninh"},

    # 2. Trung du và miền núi Bắc Bộ (14 cũ + Hòa Bình)
    "Hà Giang": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 7927.5, "pop": 892.7, "merged_into": "Tỉnh Tuyên Quang"},
    "Cao Bằng": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 6700.3, "pop": 543.1, "merged_into": "Tỉnh Cao Bằng"},
    "Bắc Kạn": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 4859.9, "pop": 324.4, "merged_into": "Tỉnh Thái Nguyên"},
    "Tuyên Quang": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 5867.9, "pop": 801.3, "merged_into": "Tỉnh Tuyên Quang"},
    "Lào Cai": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 6364.0, "pop": 763.9, "merged_into": "Tỉnh Lào Cai"},
    "Yên Bái": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 6887.7, "pop": 847.2, "merged_into": "Tỉnh Lào Cai"},
    "Thái Nguyên": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 3526.6, "pop": 1335.9, "merged_into": "Tỉnh Thái Nguyên"},
    "Lạng Sơn": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 8310.2, "pop": 802.1, "merged_into": "Tỉnh Lạng Sơn"},
    "Bắc Giang": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 3895.9, "pop": 1890.9, "merged_into": "Tỉnh Bắc Ninh"},
    "Phú Thọ": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 3534.6, "pop": 1516.9, "merged_into": "Tỉnh Phú Thọ"},
    "Điện Biên": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 9541.3, "pop": 635.9, "merged_into": "Tỉnh Điện Biên"},
    "Lai Châu": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 9068.8, "pop": 482.7, "merged_into": "Tỉnh Lai Châu"},
    "Sơn La": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 14123.6, "pop": 1300.9, "merged_into": "Tỉnh Sơn La"},
    "Hòa Bình": {"region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "area": 4590.6, "pop": 875.4, "merged_into": "Tỉnh Phú Thọ"},

    # 3. Bắc Trung Bộ (6)
    "Thanh Hóa": {"region": "Bắc Trung Bộ", "type": "Tỉnh", "area": 11114.7, "pop": 3726.4, "merged_into": "Tỉnh Thanh Hóa"},
    "Nghệ An": {"region": "Bắc Trung Bộ", "type": "Tỉnh", "area": 16486.5, "pop": 3449.6, "merged_into": "Tỉnh Nghệ An"},
    "Hà Tĩnh": {"region": "Bắc Trung Bộ", "type": "Tỉnh", "area": 5994.5, "pop": 1310.4, "merged_into": "Tỉnh Hà Tĩnh"},
    "Quảng Bình": {"region": "Bắc Trung Bộ", "type": "Tỉnh", "area": 8000.0, "pop": 913.8, "merged_into": "Tỉnh Quảng Trị"},
    "Quảng Trị": {"region": "Bắc Trung Bộ", "type": "Tỉnh", "area": 4640.1, "pop": 650.9, "merged_into": "Tỉnh Quảng Trị"},
    "Thừa Thiên Huế": {"region": "Bắc Trung Bộ", "type": "Thành phố trực thuộc Trung ương", "area": 4902.4, "pop": 1160.2, "merged_into": "Thành phố Huế"},

    # 4. Duyên hải Nam Trung Bộ (8)
    "Đà Nẵng": {"region": "Duyên hải Nam Trung Bộ", "type": "Thành phố trực thuộc Trung ương", "area": 1284.9, "pop": 1220.2, "merged_into": "Thành phố Đà Nẵng"},
    "Quảng Nam": {"region": "Duyên hải Nam Trung Bộ", "type": "Tỉnh", "area": 10574.9, "pop": 1519.4, "merged_into": "Thành phố Đà Nẵng"},
    "Quảng Ngãi": {"region": "Duyên hải Nam Trung Bộ", "type": "Tỉnh", "area": 5155.8, "pop": 1245.6, "merged_into": "Tỉnh Quảng Ngãi"},
    "Bình Định": {"region": "Duyên hải Nam Trung Bộ", "type": "Tỉnh", "area": 6071.3, "pop": 1506.3, "merged_into": "Tỉnh Quảng Ngãi"},
    "Phú Yên": {"region": "Duyên hải Nam Trung Bộ", "type": "Tỉnh", "area": 5023.4, "pop": 876.6, "merged_into": "Tỉnh Khánh Hoà"},
    "Khánh Hoà": {"region": "Duyên hải Nam Trung Bộ", "type": "Tỉnh", "area": 5137.8, "pop": 1254.0, "merged_into": "Tỉnh Khánh Hoà"},
    "Ninh Thuận": {"region": "Duyên hải Nam Trung Bộ", "type": "Tỉnh", "area": 3355.3, "pop": 601.5, "merged_into": "Tỉnh Lâm Đồng"},
    "Bình Thuận": {"region": "Duyên hải Nam Trung Bộ", "type": "Tỉnh", "area": 7942.3, "pop": 1252.8, "merged_into": "Tỉnh Lâm Đồng"},

    # 5. Tây Nguyên (5)
    "Kon Tum": {"region": "Tây Nguyên", "type": "Tỉnh", "area": 9674.2, "pop": 579.9, "merged_into": "Tỉnh Gia Lai"},
    "Gia Lai": {"region": "Tây Nguyên", "type": "Tỉnh", "area": 15511.0, "pop": 1613.9, "merged_into": "Tỉnh Gia Lai"},
    "Đắk Lắk": {"region": "Tây Nguyên", "type": "Tỉnh", "area": 13030.5, "pop": 1919.2, "merged_into": "Tỉnh Đắk Lắk"},
    "Đắk Nông": {"region": "Tây Nguyên", "type": "Tỉnh", "area": 6509.3, "pop": 670.5, "merged_into": "Tỉnh Đắk Lắk"},
    "Lâm Đồng": {"region": "Tây Nguyên", "type": "Tỉnh", "area": 9783.3, "pop": 1332.5, "merged_into": "Tỉnh Lâm Đồng"},

    # 6. Đông Nam Bộ (6)
    "Bình Phước": {"region": "Đông Nam Bộ", "type": "Tỉnh", "area": 6873.6, "pop": 1034.7, "merged_into": "Tỉnh Đồng Nai"},
    "Tây Ninh": {"region": "Đông Nam Bộ", "type": "Tỉnh", "area": 4041.3, "pop": 1188.8, "merged_into": "Tỉnh Tây Ninh"},
    "Bình Dương": {"region": "Đông Nam Bộ", "type": "Tỉnh", "area": 2694.6, "pop": 2832.8, "merged_into": "Thành phố Hồ Chí Minh"},
    "Đồng Nai": {"region": "Đông Nam Bộ", "type": "Tỉnh", "area": 5863.6, "pop": 3255.4, "merged_into": "Tỉnh Đồng Nai"},
    "Bà Rịa - Vũng Tàu": {"region": "Đông Nam Bộ", "type": "Tỉnh", "area": 1980.8, "pop": 1181.3, "merged_into": "Thành phố Hồ Chí Minh"},
    "TP. Hồ Chí Minh": {"region": "Đông Nam Bộ", "type": "Thành phố trực thuộc Trung ương", "area": 2095.4, "pop": 9389.7, "merged_into": "Thành phố Hồ Chí Minh"},

    # 7. Đồng bằng sông Cửu Long (13)
    "Long An": {"region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "area": 4494.8, "pop": 1763.8, "merged_into": "Tỉnh Tây Ninh"},
    "Tiền Giang": {"region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "area": 2510.6, "pop": 1785.2, "merged_into": "Tỉnh Đồng Tháp"},
    "Bến Tre": {"region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "area": 2394.8, "pop": 1298.0, "merged_into": "Tỉnh Bến Tre"},
    "Trà Vinh": {"region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "area": 2358.3, "pop": 1019.3, "merged_into": "Tỉnh Bến Tre"},
    "Vĩnh Long": {"region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "area": 1525.7, "pop": 1028.4, "merged_into": "Thành phố Cần Thơ"},
    "Đồng Tháp": {"region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "area": 3383.8, "pop": 1603.5, "merged_into": "Tỉnh Đồng Tháp"},
    "An Giang": {"region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "area": 3536.7, "pop": 1908.4, "merged_into": "Tỉnh An Giang"},
    "Kiên Giang": {"region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "area": 6348.8, "pop": 1751.8, "merged_into": "Tỉnh An Giang"},
    "Cần Thơ": {"region": "Đồng bằng sông Cửu Long", "type": "Thành phố trực thuộc Trung ương", "area": 1439.0, "pop": 1252.3, "merged_into": "Thành phố Cần Thơ"},
    "Hậu Giang": {"region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "area": 1621.7, "pop": 729.5, "merged_into": "Thành phố Cần Thơ"},
    "Sóc Trăng": {"region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "area": 3311.9, "pop": 1197.8, "merged_into": "Tỉnh Sóc Trăng"},
    "Bạc Liêu": {"region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "area": 2669.0, "pop": 921.8, "merged_into": "Tỉnh Cà Mau"},
    "Cà Mau": {"region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "area": 5221.2, "pop": 1207.6, "merged_into": "Tỉnh Cà Mau"}
}

# Số liệu chính thức từ Bảng Niên giám thống kê 2024 tại Atlat GD Trang 5 (Chuẩn 100% tài liệu gốc)
GD_P05_OFFICIAL_DATA = {
    # 1. Trung du và miền núi phía Bắc (9)
    "Tỉnh Cao Bằng": {"area": 6700.4, "pop": 558.5, "region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "merged_from": ["Cao Bằng"]},
    "Tỉnh Tuyên Quang": {"area": 13795.6, "pop": 1731.7, "region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "merged_from": ["Tuyên Quang", "Hà Giang"]},
    "Tỉnh Lào Cai": {"area": 13257.0, "pop": 1656.6, "region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "merged_from": ["Lào Cai", "Yên Bái"]},
    "Tỉnh Thái Nguyên": {"area": 8375.3, "pop": 1694.5, "region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "merged_from": ["Thái Nguyên", "Bắc Kạn"]},
    "Tỉnh Lạng Sơn": {"area": 8310.2, "pop": 814.0, "region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "merged_from": ["Lạng Sơn"]},
    "Tỉnh Phú Thọ": {"area": 9361.4, "pop": 3663.7, "region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "merged_from": ["Phú Thọ", "Vĩnh Phúc", "Hòa Bình"]},
    "Tỉnh Điện Biên": {"area": 9539.9, "pop": 656.7, "region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "merged_from": ["Điện Biên"]},
    "Tỉnh Lai Châu": {"area": 9068.7, "pop": 495.5, "region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "merged_from": ["Lai Châu"]},
    "Tỉnh Sơn La": {"area": 14108.9, "pop": 1330.6, "region": "Trung du và miền núi Bắc Bộ", "type": "Tỉnh", "merged_from": ["Sơn La"]},

    # 2. Đồng bằng sông Hồng (6)
    "Thành phố Hà Nội": {"area": 3359.8, "pop": 8717.6, "region": "Đồng bằng sông Hồng", "type": "Thành phố trực thuộc Trung ương", "merged_from": ["Hà Nội"]},
    "Tỉnh Bắc Ninh": {"area": 4718.6, "pop": 3509.2, "region": "Đồng bằng sông Hồng", "type": "Tỉnh", "merged_from": ["Bắc Ninh", "Bắc Giang"]},
    "Tỉnh Quảng Ninh": {"area": 6208.0, "pop": 1396.5, "region": "Đồng bằng sông Hồng", "type": "Tỉnh", "merged_from": ["Quảng Ninh"]},
    "Thành phố Hải Phòng": {"area": 3194.7, "pop": 4102.7, "region": "Đồng bằng sông Hồng", "type": "Thành phố trực thuộc Trung ương", "merged_from": ["Hải Phòng", "Hải Dương"]},
    "Tỉnh Hưng Yên": {"area": 2514.8, "pop": 3208.5, "region": "Đồng bằng sông Hồng", "type": "Tỉnh", "merged_from": ["Hưng Yên", "Thái Bình"]},
    "Tỉnh Ninh Bình": {"area": 3942.6, "pop": 3818.7, "region": "Đồng bằng sông Hồng", "type": "Tỉnh", "merged_from": ["Ninh Bình", "Hà Nam", "Nam Định"]},

    # 3. Bắc Trung Bộ (5)
    "Tỉnh Thanh Hoá": {"area": 11114.7, "pop": 3764.2, "region": "Bắc Trung Bộ", "type": "Tỉnh", "merged_from": ["Thanh Hóa"]},
    "Tỉnh Nghệ An": {"area": 16486.5, "pop": 3472.3, "region": "Bắc Trung Bộ", "type": "Tỉnh", "merged_from": ["Nghệ An"]},
    "Tỉnh Hà Tĩnh": {"area": 5994.5, "pop": 1329.8, "region": "Bắc Trung Bộ", "type": "Tỉnh", "merged_from": ["Hà Tĩnh"]},
    "Tỉnh Quảng Trị": {"area": 12700.0, "pop": 1584.0, "region": "Bắc Trung Bộ", "type": "Tỉnh", "merged_from": ["Quảng Trị", "Quảng Bình"]},
    "Thành phố Huế": {"area": 4947.1, "pop": 1178.6, "region": "Bắc Trung Bộ", "type": "Thành phố trực thuộc Trung ương", "merged_from": ["Thừa Thiên Huế"]},

    # 4. Duyên hải Nam Trung Bộ và Tây Nguyên (6)
    "Thành phố Đà Nẵng": {"area": 11859.6, "pop": 2819.9, "region": "Duyên hải Nam Trung Bộ", "type": "Thành phố trực thuộc Trung ương", "merged_from": ["Đà Nẵng", "Quảng Nam"]},
    "Tỉnh Quảng Ngãi": {"area": 14832.6, "pop": 1861.7, "region": "Duyên hải Nam Trung Bộ", "type": "Tỉnh", "merged_from": ["Quảng Ngãi", "Bình Định"]},
    "Tỉnh Khánh Hoà": {"area": 8555.9, "pop": 1882.0, "region": "Duyên hải Nam Trung Bộ", "type": "Tỉnh", "merged_from": ["Khánh Hoà", "Phú Yên"]},
    "Tỉnh Gia Lai": {"area": 21576.5, "pop": 3153.4, "region": "Tây Nguyên", "type": "Tỉnh", "merged_from": ["Gia Lai", "Kon Tum"]},
    "Tỉnh Đắk Lắk": {"area": 18096.4, "pop": 2831.4, "region": "Tây Nguyên", "type": "Tỉnh", "merged_from": ["Đắk Lắk", "Đắk Nông"]},
    "Tỉnh Lâm Đồng": {"area": 24233.1, "pop": 3324.4, "region": "Tây Nguyên", "type": "Tỉnh", "merged_from": ["Lâm Đồng", "Ninh Thuận", "Bình Thuận"]},

    # 5. Đông Nam Bộ (3)
    "Tỉnh Tây Ninh": {"area": 8536.5, "pop": 2959.0, "region": "Đông Nam Bộ", "type": "Tỉnh", "merged_from": ["Tây Ninh", "Long An"]},
    "Tỉnh Đồng Nai": {"area": 12737.2, "pop": 4427.7, "region": "Đông Nam Bộ", "type": "Tỉnh", "merged_from": ["Đồng Nai", "Bình Phước"]},
    "Thành phố Hồ Chí Minh": {"area": 6772.6, "pop": 13608.8, "region": "Đông Nam Bộ", "type": "Thành phố trực thuộc Trung ương", "merged_from": ["TP. Hồ Chí Minh", "Bình Dương", "Bà Rịa - Vũng Tàu"]},

    # 6. Đồng bằng sông Cửu Long (5)
    "Tỉnh Vĩnh Long": {"area": 6296.2, "pop": 3367.5, "region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "merged_from": ["Vĩnh Long", "Bến Tre", "Trà Vinh"]},
    "Tỉnh Đồng Tháp": {"area": 5938.7, "pop": 3397.2, "region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "merged_from": ["Đồng Tháp", "Tiền Giang"]},
    "Tỉnh An Giang": {"area": 9888.9, "pop": 3679.3, "region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "merged_from": ["An Giang", "Kiên Giang"]},
    "Thành phố Cần Thơ": {"area": 6360.8, "pop": 3207.0, "region": "Đồng bằng sông Cửu Long", "type": "Thành phố trực thuộc Trung ương", "merged_from": ["Cần Thơ", "Hậu Giang", "Sóc Trăng"]},
    "Tỉnh Cà Mau": {"area": 7942.4, "pop": 2140.7, "region": "Đồng bằng sông Cửu Long", "type": "Tỉnh", "merged_from": ["Cà Mau", "Bạc Liêu"]}
}

PROVINCE_34_SPECS = GD_P05_OFFICIAL_DATA

def main():
    with open(OLD_GEOJSON_PATH, "r", encoding="utf-8") as f:
        old_data = json.load(f)

    # 1. Normalize mapping from input features
    cleaned_features_63 = []
    shapes_by_name = {}

    # Map name variants to standard key
    name_map = {
        "Ho Chi Minh": "TP. Hồ Chí Minh",
        "Thành phố Hồ Chí Minh": "TP. Hồ Chí Minh",
        "Bà Rịa–Vũng Tàu": "Bà Rịa - Vũng Tàu",
        "Thừa Thiên - Huế": "Thừa Thiên Huế",
    }

    seen_provinces = set()
    for feat in old_data["features"]:
        p = feat["properties"]
        raw_name = p.get("name") or p.get("shapeName") or ""
        norm_name = name_map.get(raw_name, raw_name)

        # Handle special islands
        if p.get("is_special_island") or norm_name in ["Quần đảo Hoàng Sa", "Quần đảo Trường Sa"]:
            feat["properties"]["is_special_island"] = True
            feat["properties"]["name"] = norm_name
            cleaned_features_63.append(feat)
            shapes_by_name[norm_name] = shape(feat["geometry"])
            continue

        if norm_name in PROVINCE_63_INFO and norm_name not in seen_provinces:
            seen_provinces.add(norm_name)
            info = PROVINCE_63_INFO[norm_name]
            p["name"] = norm_name
            p["region_name"] = info["region"]
            p["region"] = info["region"]
            p["administrative_type"] = info["type"]
            p["area"] = info["area"]
            p["pop"] = info["pop"]
            p["density"] = round((info["pop"] * 1000) / info["area"])
            p["merged_into"] = info["merged_into"]
            p["is_special_island"] = False

            cleaned_features_63.append(feat)
            shapes_by_name[norm_name] = shape(feat["geometry"])

    print(f"[+] Cleaned 63 provinces count: {len(seen_provinces)} (plus islands)")

    # 2. Save standardized 63 provinces
    data_63 = {
        "type": "FeatureCollection",
        "metadata": {
            "title": "Bản đồ Ranh giới 63 Tỉnh Thành Việt Nam (Chuẩn Atlat & SGK)",
            "count": len(cleaned_features_63),
            "standard": "Niên giám GSO & Atlat Địa lí Việt Nam"
        },
        "features": cleaned_features_63
    }
    with open(OUT_63_PATH, "w", encoding="utf-8") as f:
        json.dump(data_63, f, ensure_ascii=False)
    print(f"[+] Saved vn_provinces_63.geojson ({len(cleaned_features_63)} features)")

    # Bản 63 tỉnh đã ghi ở OUT_63_PATH — không ghi thêm bản trùng lặp (vn_provinces.geojson đã bỏ)

    # 3. Build 34 Administrative Units using Shapely Unary Union
    features_34 = []
    for unit_name, spec in PROVINCE_34_SPECS.items():
        constituents = spec["merged_from"]
        matched_shapes = []

        for c_name in constituents:
            if c_name in shapes_by_name:
                matched_shapes.append(shapes_by_name[c_name])

        if not matched_shapes:
            print(f"[!] Warning: No shapes matched for {unit_name}")
            continue

        # Geometric union of polygons with validity repair
        valid_shapes = [shapely.make_valid(s.buffer(0)) if not s.is_valid else s for s in matched_shapes]
        if len(valid_shapes) == 1:
            merged_geom = valid_shapes[0]
        else:
            try:
                merged_geom = unary_union(valid_shapes)
            except Exception:
                # Fallback: buffer slightly or collect into MultiPolygon
                polys = []
                for s in valid_shapes:
                    if s.geom_type == 'Polygon':
                        polys.append(s)
                    elif s.geom_type == 'MultiPolygon':
                        polys.extend(s.geoms)
                    elif s.geom_type == 'GeometryCollection':
                        for g in s.geoms:
                            if g.geom_type in ('Polygon', 'MultiPolygon'):
                                if g.geom_type == 'Polygon':
                                    polys.append(g)
                                else:
                                    polys.extend(g.geoms)
                try:
                    merged_geom = shapely.ops.unary_union([p.buffer(0.00001) for p in polys]).buffer(-0.00001)
                except Exception:
                    merged_geom = shapely.geometry.MultiPolygon(polys)

        total_area = spec["area"]
        total_pop = spec["pop"]
        density = round((total_pop * 1000) / total_area) if total_area > 0 else 0

        feat_34 = {
            "type": "Feature",
            "properties": {
                "name": unit_name,
                "administrative_type": spec["type"],
                "region_name": spec["region"],
                "region": spec["region"],
                "area": round(total_area, 1),
                "pop": round(total_pop, 1),
                "density": density,
                "merged_from": constituents,
                "merged_from_desc": "Hợp nhất từ: " + ", ".join(constituents) if len(constituents) > 1 else "Giữ nguyên ranh giới",
                "resolution": "Nghị quyết số 202/2025/QH15",
                "is_special_island": False,
                "source": "Atlat GD, tr.5 (Niên giám thống kê 2024)"
            },
            "geometry": mapping(merged_geom)
        }
        features_34.append(feat_34)

    # Add standalone islands for cartographic clarity and sovereignty invariant
    for island_name in ["Quần đảo Hoàng Sa", "Quần đảo Trường Sa"]:
        if island_name in shapes_by_name:
            belong_to = "Thành phố Đà Nẵng" if "Hoàng Sa" in island_name else "Tỉnh Khánh Hoà"
            features_34.append({
                "type": "Feature",
                "properties": {
                    "name": island_name,
                    "administrative_type": "Huyện đảo",
                    "region_name": "Duyên hải Nam Trung Bộ",
                    "region": "Duyên hải Nam Trung Bộ",
                    "belong_to": belong_to,
                    "is_special_island": True,
                    "resolution": "Nghị quyết số 202/2025/QH15",
                    "merged_from_desc": f"Thuộc {belong_to} theo Nghị quyết số 202/2025/QH15",
                    "source": "Atlat GD, tr.4-5 & tr.32"
                },
                "geometry": mapping(shapes_by_name[island_name])
            })

    data_34 = {
        "type": "FeatureCollection",
        "metadata": {
            "title": "Bản đồ Ranh giới 34 Tỉnh Thành Việt Nam (Nghị quyết số 202/2025/QH15)",
            "count": len(features_34),
            "provinces_count": 34,
            "cities_count": 6,
            "resolution": "Nghị quyết số 202/2025/QH15 ngày 12/6/2025 của Quốc hội"
        },
        "features": features_34
    }

    with open(OUT_34_PATH, "w", encoding="utf-8") as f:
        json.dump(data_34, f, ensure_ascii=False)
    print(f"[+] Successfully generated vn_provinces_34.geojson ({len(features_34)} features, 34 new provinces/cities)!")

if __name__ == "__main__":
    main()
