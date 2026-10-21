#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GeoAtlas Interactive - Complete Dataset Master Patch
Adheres 100% to BUG-02, BUG-03, BUG-04, BUG-05, BUG-06, BUG-07, BUG-08, BUG-09, BUG-14, BUG-16.
Sources:
  - GD = Atlat Địa lí Việt Nam (Lê Huỳnh - Đặng Vũ Khắc, NXB Giáo dục Việt Nam, 2025/2026)
  - DHQG = Atlat Địa lí Việt Nam (NXB ĐHQG Hà Nội, 2025)
  - BD = biểu đồ.docx
"""
import os
import json
import math
import sys

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT_DIR, "public", "data")
JS_DIR = os.path.join(ROOT_DIR, "js")

# -----------------------------------------------------------------------------
# 1. 34 PROVINCES & 6 REGIONS (BUG-02 & GD tr.5, tr.18)
# -----------------------------------------------------------------------------
PROVINCES_34_STATS = {
    # 1. Trung du và miền núi phía Bắc (9)
    "Tỉnh Cao Bằng": {"area": 6700.4, "pop": 558.5, "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "merged_from": ["Cao Bằng"]},
    "Tỉnh Tuyên Quang": {"area": 13795.6, "pop": 1731.7, "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "merged_from": ["Tuyên Quang", "Hà Giang"]},
    "Tỉnh Lào Cai": {"area": 13257.0, "pop": 1656.6, "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "merged_from": ["Lào Cai", "Yên Bái"]},
    "Tỉnh Thái Nguyên": {"area": 8375.3, "pop": 1694.5, "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "merged_from": ["Thái Nguyên", "Bắc Kạn"]},
    "Tỉnh Lạng Sơn": {"area": 8310.2, "pop": 814.0, "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "merged_from": ["Lạng Sơn"]},
    "Tỉnh Phú Thọ": {"area": 9361.4, "pop": 3663.7, "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "merged_from": ["Phú Thọ", "Vĩnh Phúc", "Hòa Bình"]},
    "Tỉnh Điện Biên": {"area": 9539.9, "pop": 656.7, "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "merged_from": ["Điện Biên"]},
    "Tỉnh Lai Châu": {"area": 9068.7, "pop": 495.5, "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "merged_from": ["Lai Châu"]},
    "Tỉnh Sơn La": {"area": 14108.9, "pop": 1330.6, "type": "Tỉnh", "region": "Trung du và miền núi phía Bắc", "merged_from": ["Sơn La"]},

    # 2. Đồng bằng sông Hồng (6)
    "Thành phố Hà Nội": {"area": 3359.8, "pop": 8717.6, "type": "Thành phố trực thuộc Trung ương", "region": "Đồng bằng sông Hồng", "merged_from": ["Hà Nội"]},
    "Tỉnh Bắc Ninh": {"area": 4718.6, "pop": 3509.2, "type": "Tỉnh", "region": "Đồng bằng sông Hồng", "merged_from": ["Bắc Ninh", "Bắc Giang"]},
    "Tỉnh Quảng Ninh": {"area": 6208.0, "pop": 1396.5, "type": "Tỉnh", "region": "Đồng bằng sông Hồng", "merged_from": ["Quảng Ninh"]},
    "Thành phố Hải Phòng": {"area": 3194.7, "pop": 4102.7, "type": "Thành phố trực thuộc Trung ương", "region": "Đồng bằng sông Hồng", "merged_from": ["Hải Phòng", "Hải Dương"]},
    "Tỉnh Hưng Yên": {"area": 2514.8, "pop": 3208.5, "type": "Tỉnh", "region": "Đồng bằng sông Hồng", "merged_from": ["Hưng Yên", "Thái Bình"]},
    "Tỉnh Ninh Bình": {"area": 3942.6, "pop": 3818.7, "type": "Tỉnh", "region": "Đồng bằng sông Hồng", "merged_from": ["Ninh Bình", "Hà Nam", "Nam Định"]},

    # 3. Bắc Trung Bộ (5)
    "Tỉnh Thanh Hoá": {"area": 11114.7, "pop": 3764.2, "type": "Tỉnh", "region": "Bắc Trung Bộ", "merged_from": ["Thanh Hóa"]},
    "Tỉnh Nghệ An": {"area": 16486.5, "pop": 3472.3, "type": "Tỉnh", "region": "Bắc Trung Bộ", "merged_from": ["Nghệ An"]},
    "Tỉnh Hà Tĩnh": {"area": 5994.5, "pop": 1329.8, "type": "Tỉnh", "region": "Bắc Trung Bộ", "merged_from": ["Hà Tĩnh"]},
    "Tỉnh Quảng Trị": {"area": 12700.0, "pop": 1584.0, "type": "Tỉnh", "region": "Bắc Trung Bộ", "merged_from": ["Quảng Trị", "Quảng Bình"]},
    "Thành phố Huế": {"area": 4947.1, "pop": 1178.6, "type": "Thành phố trực thuộc Trung ương", "region": "Bắc Trung Bộ", "merged_from": ["Thừa Thiên Huế"]},

    # 4. Duyên hải Nam Trung Bộ và Tây Nguyên (6)
    "Thành phố Đà Nẵng": {"area": 11859.6, "pop": 2819.9, "type": "Thành phố trực thuộc Trung ương", "region": "Duyên hải Nam Trung Bộ và Tây Nguyên", "merged_from": ["Đà Nẵng", "Quảng Nam"]},
    "Tỉnh Quảng Ngãi": {"area": 14832.6, "pop": 1861.7, "type": "Tỉnh", "region": "Duyên hải Nam Trung Bộ và Tây Nguyên", "merged_from": ["Quảng Ngãi", "Bình Định"]},
    "Tỉnh Khánh Hoà": {"area": 8555.9, "pop": 1882.0, "type": "Tỉnh", "region": "Duyên hải Nam Trung Bộ và Tây Nguyên", "merged_from": ["Khánh Hoà", "Phú Yên"]},
    "Tỉnh Gia Lai": {"area": 21576.5, "pop": 3153.4, "type": "Tỉnh", "region": "Duyên hải Nam Trung Bộ và Tây Nguyên", "merged_from": ["Gia Lai", "Kon Tum"]},
    "Tỉnh Đắk Lắk": {"area": 18096.4, "pop": 2831.4, "type": "Tỉnh", "region": "Duyên hải Nam Trung Bộ và Tây Nguyên", "merged_from": ["Đắk Lắk", "Đắk Nông"]},
    "Tỉnh Lâm Đồng": {"area": 24233.1, "pop": 3324.4, "type": "Tỉnh", "region": "Duyên hải Nam Trung Bộ và Tây Nguyên", "merged_from": ["Lâm Đồng", "Ninh Thuận", "Bình Thuận"]},

    # 5. Đông Nam Bộ (3)
    "Tỉnh Tây Ninh": {"area": 8536.5, "pop": 2959.0, "type": "Tỉnh", "region": "Đông Nam Bộ", "merged_from": ["Tây Ninh", "Long An"]},
    "Thành phố Đồng Nai": {"area": 12737.2, "pop": 4427.7, "type": "Thành phố trực thuộc Trung ương", "region": "Đông Nam Bộ", "merged_from": ["Đồng Nai", "Bình Phước"]},
    "Đồng Nai": {"area": 12737.2, "pop": 4427.7, "type": "Thành phố trực thuộc Trung ương", "region": "Đông Nam Bộ", "merged_from": ["Đồng Nai", "Bình Phước"]},
    "Thành phố Hồ Chí Minh": {"area": 6772.6, "pop": 13608.8, "type": "Thành phố trực thuộc Trung ương", "region": "Đông Nam Bộ", "merged_from": ["TP. Hồ Chí Minh", "Bình Dương", "Bà Rịa - Vũng Tàu"]},

    # 6. Đồng bằng sông Cửu Long (5)
    "Tỉnh Vĩnh Long": {"area": 6296.2, "pop": 3367.5, "type": "Tỉnh", "region": "Đồng bằng sông Cửu Long", "merged_from": ["Vĩnh Long", "Bến Tre", "Trà Vinh"]},
    "Tỉnh Đồng Tháp": {"area": 5938.7, "pop": 3397.2, "type": "Tỉnh", "region": "Đồng bằng sông Cửu Long", "merged_from": ["Đồng Tháp", "Tiền Giang"]},
    "Tỉnh An Giang": {"area": 9888.9, "pop": 3679.3, "type": "Tỉnh", "region": "Đồng bằng sông Cửu Long", "merged_from": ["An Giang", "Kiên Giang"]},
    "Thành phố Cần Thơ": {"area": 6360.8, "pop": 3207.0, "type": "Thành phố trực thuộc Trung ương", "region": "Đồng bằng sông Cửu Long", "merged_from": ["Cần Thơ", "Hậu Giang", "Sóc Trăng"]},
    "Tỉnh Cà Mau": {"area": 7942.4, "pop": 2140.7, "type": "Tỉnh", "region": "Đồng bằng sông Cửu Long", "merged_from": ["Cà Mau", "Bạc Liêu"]}
}

# -----------------------------------------------------------------------------
# 2. BASELINE POINTS (Điểm 0 + A1 -> A24) (BUG-09 & GD tr.7, DHQG tr.9)
# -----------------------------------------------------------------------------
def dms(d, m, s=0.0):
    return round(d + m / 60.0 + s / 3600.0, 4)

BASELINE_POINTS = [
    {
        "code": "0",
        "name": "Điểm 0: Ranh giới vùng nước lịch sử VN - Campuchia",
        "province": "Tỉnh An Giang",
        "coords": [102.9167, 9.5833],
        "dms_lat": "9°35'00\"B",
        "dms_lng": "102°55'00\"Đ",
        "desc": "Nằm trên ranh giới phía Tây Nam của vùng nước lịch sử của nước CHXHCN Việt Nam và CHND Campuchia."
    },
    {
        "code": "A1",
        "name": "Điểm A1: Hòn Nhạn (Quần đảo Thổ Chu)",
        "province": "Tỉnh An Giang",
        "coords": [dms(103, 27, 0.0), dms(9, 15, 0.0)],
        "dms_lat": "9°15'0\"B",
        "dms_lng": "103°27'0\"Đ",
        "desc": "Điểm cơ sở số 1 phía Tây Nam vịnh Thái Lan (Kiên Giang cũ)."
    },
    {
        "code": "A2",
        "name": "Điểm A2: Hòn Đá Lẻ (Hòn Khoai)",
        "province": "Tỉnh Cà Mau",
        "coords": [dms(104, 52, 4.0), dms(8, 22, 8.0)],
        "dms_lat": "8°22'8\"B",
        "dms_lng": "104°52'4\"Đ",
        "desc": "Điểm cơ sở cực Nam bán đảo Cà Mau."
    },
    {
        "code": "A3",
        "name": "Điểm A3: Hòn Tài Lớn (Côn Đảo)",
        "province": "Thành phố Hồ Chí Minh",
        "coords": [dms(106, 37, 5.0), dms(8, 37, 8.0)],
        "dms_lat": "8°37'8\"B",
        "dms_lng": "106°37'5\"Đ",
        "desc": "Điểm cơ sở nhóm đảo Côn Sơn (Bà Rịa - Vũng Tàu cũ)."
    },
    {
        "code": "A4",
        "name": "Điểm A4: Hòn Bông Lang (Côn Đảo)",
        "province": "Thành phố Hồ Chí Minh",
        "coords": [dms(106, 40, 3.0), dms(8, 38, 9.0)],
        "dms_lat": "8°38'9\"B",
        "dms_lng": "106°40'3\"Đ",
        "desc": "Điểm cơ sở phía Đông Nam Côn Đảo."
    },
    {
        "code": "A5",
        "name": "Điểm A5: Hòn Bảy Cạnh (Côn Đảo)",
        "province": "Thành phố Hồ Chí Minh",
        "coords": [dms(106, 42, 1.0), dms(8, 39, 7.0)],
        "dms_lat": "8°39'7\"B",
        "dms_lng": "106°42'1\"Đ",
        "desc": "Điểm cơ sở phía Đông Côn Đảo."
    },
    {
        "code": "A6",
        "name": "Điểm A6: Hòn Hải (Nhóm đảo Phú Quý)",
        "province": "Tỉnh Lâm Đồng",
        "coords": [dms(109, 5, 0.0), dms(9, 58, 0.0)],
        "dms_lat": "9°58'0\"B",
        "dms_lng": "109°05'0\"Đ",
        "desc": "Điểm cơ sở xa bờ nhất Nam Trung Bộ (Bình Thuận cũ)."
    },
    {
        "code": "A7",
        "name": "Điểm A7: Hòn Đôi (Bán đảo Hòn Gốm)",
        "province": "Tỉnh Khánh Hoà",
        "coords": [dms(109, 28, 0.0), dms(12, 39, 0.0)],
        "dms_lat": "12°39'0\"B",
        "dms_lng": "109°28'0\"Đ",
        "desc": "Điểm cơ sở gần cực Đông đất liền."
    },
    {
        "code": "A8",
        "name": "Điểm A8: Mũi Đại Lãnh",
        "province": "Tỉnh Khánh Hoà",
        "coords": [dms(109, 27, 2.0), dms(12, 53, 8.0)],
        "dms_lat": "12°53'8\"B",
        "dms_lng": "109°27'2\"Đ",
        "desc": "Điểm cơ sở mũi đất đón bình minh sớm nhất đất liền (Phú Yên cũ)."
    },
    {
        "code": "A9",
        "name": "Điểm A9: Hòn Ông Căn",
        "province": "Tỉnh Quảng Ngãi",
        "coords": [dms(109, 21, 0.0), dms(13, 54, 0.0)],
        "dms_lat": "13°54'0\"B",
        "dms_lng": "109°21'0\"Đ",
        "desc": "Điểm cơ sở bờ biển Bình Định cũ."
    },
    {
        "code": "A10",
        "name": "Điểm A10: Đảo Lý Sơn",
        "province": "Tỉnh Quảng Ngãi",
        "coords": [dms(109, 9, 0.0), dms(15, 23, 1.0)],
        "dms_lat": "15°23'1\"B",
        "dms_lng": "109°09'0\"Đ",
        "desc": "Điểm cơ sở huyện đảo Lý Sơn."
    },
    {
        "code": "A11",
        "name": "Điểm A11: Đảo Cồn Cỏ",
        "province": "Tỉnh Quảng Trị",
        "coords": [dms(107, 20, 36.0), dms(17, 10, 0.0)],
        "dms_lat": "17°10'00.0\"B",
        "dms_lng": "107°20'36.0\"Đ",
        "desc": "Điểm cơ sở cửa ngõ phía Nam vịnh Bắc Bộ."
    },
    {
        "code": "A12",
        "name": "Điểm A12: Mũi Ròn",
        "province": "Tỉnh Quảng Trị",
        "coords": [dms(106, 40, 25.8), dms(17, 54, 48.1)],
        "dms_lat": "17°54'48.1\"B",
        "dms_lng": "106°40'25.8\"Đ",
        "desc": "Điểm cơ sở phân định vịnh Bắc Bộ (vùng biển Quảng Bình cũ)."
    },
    {
        "code": "A13",
        "name": "Điểm A13: Đảo Sơn Dương",
        "province": "Tỉnh Hà Tĩnh",
        "coords": [dms(106, 29, 23.7), dms(18, 7, 2.5)],
        "dms_lat": "18°07'02.5\"B",
        "dms_lng": "106°29'23.7\"Đ",
        "desc": "Điểm cơ sở vùng biển Hà Tĩnh."
    },
    {
        "code": "A14",
        "name": "Điểm A14: Hòn Mắt",
        "province": "Tỉnh Nghệ An",
        "coords": [dms(105, 59, 20.5), dms(18, 47, 28.2)],
        "dms_lat": "18°47'28.2\"B",
        "dms_lng": "105°59'20.5\"Đ",
        "desc": "Điểm cơ sở vùng biển Nghệ An."
    },
    {
        "code": "A15",
        "name": "Điểm A15: Hòn Mê",
        "province": "Tỉnh Thanh Hoá",
        "coords": [dms(105, 56, 18.6), dms(19, 22, 36.7)],
        "dms_lat": "19°22'36.7\"B",
        "dms_lng": "105°56'18.6\"Đ",
        "desc": "Điểm cơ sở vùng biển Thanh Hoá."
    },
    {
        "code": "A16",
        "name": "Điểm A16: Đảo Long Châu",
        "province": "Thành phố Hải Phòng",
        "coords": [dms(107, 12, 32.2), dms(20, 36, 47.9)],
        "dms_lat": "20°36'47.9\"B",
        "dms_lng": "107°12'32.2\"Đ",
        "desc": "Điểm cơ sở quần đảo Long Châu, Hải Phòng."
    },
    {
        "code": "A17",
        "name": "Điểm A17: Hòn Chân Voi",
        "province": "Tỉnh Quảng Ninh",
        "coords": [dms(107, 27, 14.9), dms(20, 42, 58.6)],
        "dms_lat": "20°42'58.6\"B",
        "dms_lng": "107°27'14.9\"Đ",
        "desc": "Điểm cơ sở vùng biển Quảng Ninh."
    },
    {
        "code": "A18",
        "name": "Điểm A18: Hòn Voi Lớn",
        "province": "Tỉnh Quảng Ninh",
        "coords": [dms(107, 27, 50.2), dms(20, 43, 21.3)],
        "dms_lat": "20°43'21.3\"B",
        "dms_lng": "107°27'50.2\"Đ",
        "desc": "Điểm cơ sở vùng biển Quảng Ninh."
    },
    {
        "code": "A19",
        "name": "Điểm A19: Đảo Vĩnh Thực",
        "province": "Tỉnh Quảng Ninh",
        "coords": [dms(107, 49, 20.9), dms(20, 59, 2.3)],
        "dms_lat": "20°59'02.3\"B",
        "dms_lng": "107°49'20.9\"Đ",
        "desc": "Điểm cơ sở đảo Vĩnh Thực, Quảng Ninh."
    },
    {
        "code": "A20",
        "name": "Điểm A20: Đảo Vĩnh Thực Đông",
        "province": "Tỉnh Quảng Ninh",
        "coords": [dms(107, 51, 46.5), dms(21, 1, 25.9)],
        "dms_lat": "21°01'25.9\"B",
        "dms_lng": "107°51'46.5\"Đ",
        "desc": "Điểm cơ sở phía Đông đảo Vĩnh Thực."
    },
    {
        "code": "A21",
        "name": "Điểm A21: Hòn Miều",
        "province": "Tỉnh Quảng Ninh",
        "coords": [dms(108, 1, 9.6), dms(21, 11, 19.6)],
        "dms_lat": "21°11'19.6\"B",
        "dms_lng": "108°01'09.6\"Đ",
        "desc": "Điểm cơ sở cụm đảo gần bờ Quảng Ninh."
    },
    {
        "code": "A22",
        "name": "Điểm A22: Hòn Miều Đông",
        "province": "Tỉnh Quảng Ninh",
        "coords": [dms(108, 1, 17.7), dms(21, 11, 29.2)],
        "dms_lat": "21°11'29.2\"B",
        "dms_lng": "108°01'17.7\"Đ",
        "desc": "Điểm cơ sở phía Đông Hòn Miều."
    },
    {
        "code": "A23",
        "name": "Điểm A23: Mũi Ngọc",
        "province": "Tỉnh Quảng Ninh",
        "coords": [dms(108, 5, 32.8), dms(21, 28, 14.9)],
        "dms_lat": "21°28'14.9\"B",
        "dms_lng": "108°05'32.8\"Đ",
        "desc": "Điểm cơ sở Mũi Ngọc, Móng Cái."
    },
    {
        "code": "A24",
        "name": "Điểm A24: Mũi Trà Cổ",
        "province": "Tỉnh Quảng Ninh",
        "coords": [dms(108, 6, 4.3), dms(21, 28, 12.5)],
        "dms_lat": "21°28'12.5\"B",
        "dms_lng": "108°06'04.3\"Đ",
        "desc": "Điểm cơ sở Mũi Trà Cổ (Điểm đầu đường cơ sở phía Bắc)."
    }
]

# -----------------------------------------------------------------------------
# 3. 15 CLIMATE STATIONS (BUG-06 & GD tr.8)
# -----------------------------------------------------------------------------
CLIMATE_STATIONS = [
    {
        "name": "Hà Nội (Trạm Láng)",
        "coords": [105.80, 21.02],
        "avg_temp": "23,9°C",
        "rainfall": "1.670 mm",
        "province": "Thành phố Hà Nội",
        "climate_type": "Nhiệt đới ẩm gió mùa có mùa đông lạnh",
        "desc": "Trạm Láng (Hà Nội): Ttb = 23,9°C; Lượng mưa năm = 1.670 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Huế",
        "coords": [107.59, 16.46],
        "avg_temp": "25,1°C",
        "rainfall": "2.926 mm",
        "province": "Thành phố Huế",
        "climate_type": "Khí hậu chuyển tiếp Bắc Trung Bộ",
        "desc": "Trạm Huế: Ttb = 25,1°C; Lượng mưa năm = 2.926 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Đà Lạt",
        "coords": [108.44, 11.94],
        "avg_temp": "18,1°C",
        "rainfall": "1.809 mm",
        "province": "Tỉnh Lâm Đồng",
        "climate_type": "Cận nhiệt đới vùng núi cao Tây Nguyên",
        "desc": "Trạm Đà Lạt: Ttb = 18,1°C; Lượng mưa năm = 1.809 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Cà Mau",
        "coords": [105.15, 9.18],
        "avg_temp": "27,1°C",
        "rainfall": "2.388 mm",
        "province": "Tỉnh Cà Mau",
        "climate_type": "Cực Nam cận xích đạo hải dương",
        "desc": "Trạm Cà Mau: Ttb = 27,1°C; Lượng mưa năm = 2.388 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Tân Sơn Hoà (TP. Hồ Chí Minh)",
        "coords": [106.66, 10.77],
        "avg_temp": "27,1°C",
        "rainfall": "1.964 mm",
        "province": "Thành phố Hồ Chí Minh",
        "climate_type": "Cận xích đạo gió mùa Nam Bộ",
        "desc": "Trạm Tân Sơn Hoà: Ttb = 27,1°C; Lượng mưa năm = 1.964 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Buôn Ma Thuột",
        "coords": [108.05, 12.67],
        "avg_temp": "23,7°C",
        "rainfall": "1.796 mm",
        "province": "Tỉnh Đắk Lắk",
        "climate_type": "Cận xích đạo cao nguyên Tây Nguyên",
        "desc": "Trạm Buôn Ma Thuột: Ttb = 23,7°C; Lượng mưa năm = 1.796 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Sơn La",
        "coords": [103.90, 21.32],
        "avg_temp": "21,4°C",
        "rainfall": "1.448 mm",
        "province": "Tỉnh Sơn La",
        "climate_type": "Nhiệt đới gió mùa vùng núi Tây Bắc",
        "desc": "Trạm Sơn La: Ttb = 21,4°C; Lượng mưa năm = 1.448 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Tuyên Quang",
        "coords": [105.21, 21.82],
        "avg_temp": "22,9°C",
        "rainfall": "1.720 mm",
        "province": "Tỉnh Tuyên Quang",
        "climate_type": "Nhiệt đới ẩm gió mùa Đông Bắc",
        "desc": "Trạm Tuyên Quang: Ttb = 22,9°C; Lượng mưa năm = 1.720 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Lạng Sơn",
        "coords": [106.76, 21.85],
        "avg_temp": "21,5°C",
        "rainfall": "1.405 mm",
        "province": "Tỉnh Lạng Sơn",
        "climate_type": "Cận nhiệt đới gió mùa biên giới Đông Bắc",
        "desc": "Trạm Lạng Sơn: Ttb = 21,5°C; Lượng mưa năm = 1.405 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Hà Tĩnh",
        "coords": [105.90, 18.34],
        "avg_temp": "24,0°C",
        "rainfall": "2.458 mm",
        "province": "Tỉnh Hà Tĩnh",
        "climate_type": "Nhiệt đới gió mùa Bắc Trung Bộ",
        "desc": "Trạm Hà Tĩnh: Ttb = 24,0°C; Lượng mưa năm = 2.458 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Quy Nhơn",
        "coords": [109.22, 13.77],
        "avg_temp": "26,8°C",
        "rainfall": "1.695 mm",
        "province": "Tỉnh Quảng Ngãi",
        "climate_type": "Duyên hải Nam Trung Bộ",
        "desc": "Trạm Quy Nhơn: Ttb = 26,8°C; Lượng mưa năm = 1.695 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Phú Quốc",
        "coords": [103.96, 10.22],
        "avg_temp": "27,2°C",
        "rainfall": "2.958 mm",
        "province": "Tỉnh An Giang",
        "climate_type": "Hải dương nhiệt đới vịnh Thái Lan",
        "desc": "Trạm Phú Quốc: Ttb = 27,2°C; Lượng mưa năm = 2.958 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Cần Thơ",
        "coords": [105.78, 10.03],
        "avg_temp": "27,0°C",
        "rainfall": "1.620 mm",
        "province": "Thành phố Cần Thơ",
        "climate_type": "Cận xích đạo đồng bằng châu thổ sông Cửu Long",
        "desc": "Trạm Cần Thơ: Ttb = 27,0°C; Lượng mưa năm = 1.620 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Hoàng Sa",
        "coords": [111.60, 16.53],
        "avg_temp": "26,9°C",
        "rainfall": "1.250 mm",
        "province": "Thành phố Đà Nẵng",
        "climate_type": "Hải dương nhiệt đới Biển Đông",
        "desc": "Trạm Quần đảo Hoàng Sa: Ttb = 26,9°C; Lượng mưa năm = 1.250 mm (Atlat GD, tr.8)."
    },
    {
        "name": "Trường Sa",
        "coords": [111.92, 8.64],
        "avg_temp": "27,7°C",
        "rainfall": "2.540 mm",
        "province": "Tỉnh Khánh Hoà",
        "climate_type": "Cận xích đạo hải dương Biển Đông",
        "desc": "Trạm Quần đảo Trường Sa: Ttb = 27,7°C; Lượng mưa năm = 2.540 mm (Atlat GD, tr.8)."
    }
]

# -----------------------------------------------------------------------------
# 4. 21 CHART EXERCISES (BUG-04 & BUG-14)
# -----------------------------------------------------------------------------
ALL_CHART_QUESTIONS = [
    # DOCX_CHART_01 (Mục 1 biểu đồ.docx)
    {
        "id": "DOCX_CHART_01",
        "atlat_page": "biểu đồ.docx (Mục 1); Atlat GD, tr.27",
        "source": "biểu đồ.docx, Mục 1; Atlat GD, tr.27",
        "title": "Cơ cấu doanh thu du lịch lữ hành phân theo thành phần kinh tế nước ta năm 2010 và 2016",
        "raw_prompt": "Theo bảng số liệu, để thể hiện cơ cấu doanh thu du lịch lữ hành phân theo thành phần kinh tế của nước ta năm 2010 và 2016 (%), dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["cơ cấu", "tỷ trọng", "năm 2010 và 2016 (1-2 năm)", "tổng = 100%"],
        "data_table": {
            "headers": ["Thành phần kinh tế", "Năm 2010", "Năm 2016"],
            "rows": [
                {"name": "Kinh tế Nhà nước", "unit": "%", "values": [31.8, 15.0]},
                {"name": "Kinh tế ngoài Nhà nước", "unit": "%", "values": [60.3, 73.8]},
                {"name": "Khu vực có vốn đầu tư nước ngoài", "unit": "%", "values": [7.9, 11.2]}
            ]
        },
        "optimal_chart": "pie",
        "optimal_chart_name": "Biểu đồ tròn (Pie Chart)",
        "pedagogical_explanation": "Theo quy tắc Mục 1 biểu đồ.docx: Khi đề bài yêu cầu thể hiện 'cơ cấu, tỷ trọng' mà mốc thời gian chỉ từ 1-2 năm với tổng các thành phần bằng 100%, biểu đồ Tròn là lựa chọn chuẩn mực nhất.",
        "counter_factual": {
            "stacked_area": "Sai lầm quy tắc: Biểu đồ miền yêu cầu chuỗi thời gian từ 3 năm trở lên. Chỉ có 2 mốc năm (2010 và 2016) tuyệt đối không vẽ biểu đồ miền.",
            "line": "Sai lầm quy tắc: Biểu đồ đường dùng để thể hiện tốc độ tăng trưởng, không phản ánh được cấu trúc 100% của một tổng thể.",
            "bar": "Không tối ưu: Biểu đồ cột không thể hiện trực quan các múi quạt tỷ trọng thành phần trong 100% như hình tròn."
        }
    },
    # DOCX_CHART_02 (Mục 2 biểu đồ.docx)
    {
        "id": "DOCX_CHART_02",
        "atlat_page": "biểu đồ.docx (Mục 2); Atlat GD, tr.18",
        "source": "biểu đồ.docx, Mục 2; Atlat GD, tr.18",
        "title": "Tốc độ tăng trưởng GDP của Phi-líp-pin, Thái Lan và Việt Nam giai đoạn 2010 – 2016",
        "raw_prompt": "Theo bảng số liệu, để thể hiện sự thay đổi, phát triển, tốc độ tăng trưởng GDP của Phi líp pin, Thái Lan và Việt Nam giai đoạn 2010 – 2016, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["tốc độ tăng trưởng", "sự thay đổi", "phát triển", "năm gốc 2010 = 100%", "biểu đồ đường"],
        "data_table": {
            "headers": ["Năm", "2010", "2013", "2015", "2016"],
            "rows": [
                {"name": "Phi-líp-pin", "unit": "%", "values": [100.0, 136.2, 146.7, 152.8]},
                {"name": "Thái Lan", "unit": "%", "values": [100.0, 123.3, 117.0, 119.3]},
                {"name": "Việt Nam", "unit": "%", "values": [100.0, 147.8, 166.9, 177.2]}
            ]
        },
        "optimal_chart": "line",
        "optimal_chart_name": "Biểu đồ đường (Line Chart)",
        "pedagogical_explanation": "Theo quy tắc Mục 2 biểu đồ.docx: Khi đề bài yêu cầu thể hiện 'sự thay đổi, phát triển, tốc độ tăng trưởng, diễn biến' của các đối tượng qua nhiều năm (năm gốc = 100%), biểu đồ Đường là lựa chọn chuẩn xác nhất.",
        "counter_factual": {
            "pie": "Sai lầm quy tắc: Chuỗi thời gian 4 năm không vẽ tròn. Không có tổng cơ cấu 100%.",
            "bar_stacked": "Sai lầm quy tắc: Các chỉ số tăng trưởng độc lập của 3 quốc gia không thể chồng lên nhau tạo thành tổng thể."
        }
    },
    # DOCX_CHART_03 (Mục 3 biểu đồ.docx)
    {
        "id": "DOCX_CHART_03",
        "atlat_page": "biểu đồ.docx (Mục 3)",
        "source": "biểu đồ.docx, Mục 3",
        "title": "Sản lượng lương thực có hạt của Liên bang Nga giai đoạn 1995 - 2005",
        "raw_prompt": "Theo bảng số liệu, để thể hiện sự biến động sản lượng lương thực có hạt của Liên bang Nga giai đoạn 1995 - 2005 (triệu tấn), dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["biến động qua nhiều năm", "một đối tượng duy nhất", "cột đơn"],
        "data_table": {
            "headers": ["Năm", "1995", "1998", "2002", "2005"],
            "rows": [
                {"name": "Sản lượng lương thực có hạt", "unit": "Triệu tấn", "values": [93.4, 47.8, 86.8, 78.2]}
            ]
        },
        "optimal_chart": "bar",
        "optimal_chart_name": "Biểu đồ cột (Bar Chart)",
        "pedagogical_explanation": "Theo quy tắc Mục 3 biểu đồ.docx: Khi đề bài yêu cầu thể hiện 'sự biến động của một đối tượng qua nhiều năm', biểu đồ Cột là dạng thích hợp nhất.",
        "counter_factual": {
            "pie": "Sai lầm quy tắc: Chuỗi 4 mốc năm không vẽ tròn, bảng số liệu không phải là các thành phần cơ cấu 100%.",
            "combo_bar_line": "Sai lầm quy tắc: Chỉ có 1 đại lượng duy nhất nên không dùng biểu đồ kết hợp 2 trục."
        }
    },
    # DOCX_CHART_04 (Mục 4 biểu đồ.docx)
    {
        "id": "DOCX_CHART_04",
        "atlat_page": "biểu đồ.docx (Mục 4)",
        "source": "biểu đồ.docx, Mục 4",
        "title": "Sự thay đổi cơ cấu dân số thành thị và nông thôn nước ta giai đoạn 2000 - 2014",
        "raw_prompt": "Theo bảng số liệu, để thể hiện rõ nhất sự thay đổi cơ cấu dân số phân theo thành thị và nông thôn nước ta giai đoạn 2000 - 2014 (từ 3 năm trở lên, tổng 100%), dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["thay đổi cơ cấu", "tỉ trọng của hai nhóm đối tượng", "từ 3 năm trở lên", "tổng = 100%"],
        "data_table": {
            "headers": ["Năm", "2000", "2005", "2010", "2014"],
            "rows": [
                {"name": "Tỉ trọng Dân số thành thị", "unit": "%", "values": [24.2, 27.1, 30.5, 33.1]},
                {"name": "Tỉ trọng Dân số nông thôn", "unit": "%", "values": [75.8, 72.9, 69.5, 66.9]}
            ]
        },
        "optimal_chart": "stacked_area",
        "optimal_chart_name": "Biểu đồ miền (Stacked Area)",
        "pedagogical_explanation": "Theo quy tắc Mục 4 biểu đồ.docx: Khi đề bài yêu cầu thể hiện rõ nhất 'sự thay đổi cơ cấu, tỉ trọng của hai hoặc ba nhóm đối tượng mà có từ 3 năm trở lên' (ở đây có 4 năm: 2000, 2005, 2010, 2014), biểu đồ Miền là lựa chọn chính xác tuyệt đối.",
        "counter_factual": {
            "pie": "Sai lầm quy tắc: Chuỗi 4 mốc thời gian không vẽ tròn vì phải vẽ tới 4 hình tròn gây rối mắt và không thấy được sự biến chuyển liên tục.",
            "line": "Không tối ưu: Biểu đồ đường không thể hiện được tính bù trừ khép kín 100% của 2 thành phần."
        }
    },
    # DOCX_CHART_05 (Mục 5 biểu đồ.docx)
    {
        "id": "DOCX_CHART_05",
        "atlat_page": "biểu đồ.docx (Mục 5)",
        "source": "biểu đồ.docx, Mục 5",
        "title": "Số dân thành thị và tỉ lệ dân thành thị nước ta giai đoạn 1990 - 2005",
        "raw_prompt": "Theo bảng số liệu, để thể hiện số dân thành thị (triệu người) và tỉ lệ dân thành thị (%) nước ta giai đoạn 1990 - 2005, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["khác nhau về đơn vị nhưng có mối quan hệ", "số dân và tỉ lệ", "kết hợp"],
        "data_table": {
            "headers": ["Năm", "1990", "1995", "2000", "2005"],
            "rows": [
                {"name": "Số dân thành thị", "unit": "Triệu người", "values": [12.9, 14.9, 18.7, 22.3]},
                {"name": "Tỉ lệ dân thành thị", "unit": "%", "values": [19.5, 20.8, 24.2, 27.1]}
            ]
        },
        "optimal_chart": "combo_bar_line",
        "optimal_chart_name": "Biểu đồ kết hợp cột và đường (Combo Bar & Line)",
        "pedagogical_explanation": "Theo quy tắc Mục 5 biểu đồ.docx: Biểu đồ kết hợp giữa đường và cột dùng khi đề bài yêu cầu thể hiện 'các đối tượng khác nhau về đơn vị nhưng có mối quan hệ với nhau' (Số dân thành thị: triệu người vẽ Cột, Tỉ lệ: % vẽ Đường) với 2 trục tung.",
        "counter_factual": {
            "bar": "Sai lầm quy tắc: Không thể gộp triệu người và % vào 1 trục tung đơn lẻ.",
            "pie": "Sai lầm quy tắc: Chuỗi 4 năm và khác đơn vị đo lường nên tuyệt đối không vẽ hình tròn."
        }
    },
    # DOCX_CHART_06 (Mục 6 biểu đồ.docx)
    {
        "id": "DOCX_CHART_06",
        "atlat_page": "biểu đồ.docx (Mục 6)",
        "source": "biểu đồ.docx, Mục 6",
        "title": "Cơ cấu giá trị sản xuất ngành chăn nuôi nước ta năm 1990 và 2002 theo tỉ lệ tuyệt đối",
        "raw_prompt": "Theo bảng số liệu, để thể hiện tốt nhất quy mô và cơ cấu giá trị sản xuất ngành chăn nuôi nước ta năm 1990 và 2002 (theo tỉ lệ % tuyệt đối), dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["quy mô và cơ cấu", "theo tỉ lệ % tuyệt đối", "cột chồng"],
        "data_table": {
            "headers": ["Năm", "1990", "2002"],
            "rows": [
                {"name": "Gia súc", "unit": "Tỉ đồng", "values": [5775.0, 17290.0]},
                {"name": "Gia cầm", "unit": "Tỉ đồng", "values": [1730.0, 6420.0]},
                {"name": "Sản phẩm không qua giết thịt", "unit": "Tỉ đồng", "values": [810.0, 4830.0]}
            ]
        },
        "optimal_chart": "bar_stacked",
        "optimal_chart_name": "Biểu đồ cột chồng (Stacked Bar)",
        "pedagogical_explanation": "Theo quy tắc Mục 6 biểu đồ.docx: Khi đề bài yêu cầu thể hiện tốt nhất 'quy mô và cơ cấu của đối tượng (theo tỉ lệ % tuyệt đối)', biểu đồ Cột Chồng phản ánh được cả độ cao tổng thể và cấu trúc bộ phận.",
        "counter_factual": {
            "pie": "Khác biệt phân định: Đề bài yêu cầu thể hiện theo tỉ lệ % tuyệt đối từ số liệu thô tỉ đồng, biểu đồ Cột Chồng là dạng chuẩn xác theo Mục 6.",
            "line": "Không tối ưu: Không thấy rõ tổng quy mô giá trị bằng hình học cột chồng."
        }
    },
    # ATLAT_CHART_01 (GD tr.18, DHQG tr.20)
    {
        "id": "ATLAT_CHART_01",
        "atlat_page": "Atlat GD, tr.18 (DHQG, tr.20)",
        "source": "Atlat GD, tr.18 (DHQG, tr.20)",
        "title": "Cơ cấu GDP phân theo khu vực kinh tế Việt Nam (2010 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện sự chuyển dịch cơ cấu GDP phân theo 4 khu vực kinh tế nước ta giai đoạn 2010 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["chuyển dịch cơ cấu", "giai đoạn 2010 - 2024 (4 năm)", "tổng 100%"],
        "data_table": {
            "headers": ["Năm", "2010", "2015", "2020", "2024"],
            "rows": [
                {"name": "Nông, lâm, thủy sản", "unit": "%", "values": [15.4, 14.5, 12.7, 11.9]},
                {"name": "Công nghiệp và xây dựng", "unit": "%", "values": [33.0, 34.3, 36.7, 37.6]},
                {"name": "Dịch vụ", "unit": "%", "values": [40.6, 42.2, 41.8, 42.4]},
                {"name": "Thuế sản phẩm trừ trợ cấp sản phẩm", "unit": "%", "values": [11.0, 9.0, 8.8, 8.1]}
            ]
        },
        "optimal_chart": "stacked_area",
        "optimal_chart_name": "Biểu đồ miền (Stacked Area)",
        "pedagogical_explanation": "Bảng số liệu thể hiện 'chuyển dịch cơ cấu' qua chuỗi thời gian 4 mốc năm (≥ 3 năm) với 4 khu vực kinh tế (chuẩn GD tr.18) cộng lại luôn bằng 100%. Biểu đồ miền là lựa chọn chính xác tuyệt đối.",
        "counter_factual": {
            "pie": "Sai lầm: Biểu đồ tròn chỉ dùng khi có từ 1 đến 2 mốc năm (≤ 2 năm). Ở đây có 4 mốc năm.",
            "line": "Sai lầm: Biểu đồ đường dùng cho 'tốc độ tăng trưởng', không thể hiện trực quan cơ cấu bù trừ 100%."
        }
    },
    # ATLAT_CHART_02 (GD tr.18, DHQG tr.20)
    {
        "id": "ATLAT_CHART_02",
        "atlat_page": "Atlat GD, tr.18 (DHQG, tr.20)",
        "source": "Atlat GD, tr.18 (DHQG, tr.20)",
        "title": "Quy mô GDP và Tốc độ tăng trưởng GDP Việt Nam (2010 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện quy mô GDP và tốc độ tăng trưởng GDP nước ta giai đoạn 2010 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["quy mô và tốc độ tăng", "hai đơn vị tính (triệu tỉ đồng và %)", "kết hợp"],
        "data_table": {
            "headers": ["Năm", "2010", "2015", "2020", "2024"],
            "rows": [
                {"name": "Quy mô GDP (Giá hiện hành)", "unit": "Triệu tỉ đồng", "values": [2.2, 5.2, 8.0, 11.5]},
                {"name": "Tốc độ tăng trưởng GDP", "unit": "%", "values": [6.4, 7.0, 2.9, 7.1]}
            ]
        },
        "optimal_chart": "combo_bar_line",
        "optimal_chart_name": "Biểu đồ kết hợp (Cột và Đường)",
        "pedagogical_explanation": "Bảng số liệu có 2 đại lượng mang 2 đơn vị tính hoàn toàn khác nhau (Quy mô: Triệu tỉ đồng - vẽ Cột; Tốc độ tăng: % - vẽ Đường). Cần 2 trục tung để thể hiện (Atlat GD, tr.18).",
        "counter_factual": {
            "pie": "Sai lầm: Khác đơn vị đo lường, không thể vẽ hình tròn.",
            "bar": "Sai lầm: Không thể gộp triệu tỉ đồng và % vào 1 trục tung duy nhất."
        }
    },
    # ATLAT_CHART_03 (GD tr.19, DHQG tr.21)
    {
        "id": "ATLAT_CHART_03",
        "atlat_page": "Atlat GD, tr.19 (DHQG, tr.21)",
        "source": "Atlat GD, tr.19 (DHQG, tr.21)",
        "title": "Quy mô và Cơ cấu giá trị sản xuất Nông - Lâm - Thủy sản năm 2010 và 2024",
        "raw_prompt": "Theo bảng số liệu, để thể hiện quy mô và cơ cấu giá trị sản xuất nông, lâm, thủy sản nước ta năm 2010 và 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["quy mô và cơ cấu", "2 năm (2010 và 2024)", "bán kính khác nhau"],
        "data_table": {
            "headers": ["Năm", "2010", "2024"],
            "rows": [
                {"name": "Nông nghiệp", "unit": "Nghìn tỉ đồng", "values": [675.4, 2055.5]},
                {"name": "Lâm nghiệp", "unit": "Nghìn tỉ đồng", "values": [22.8, 82.9]},
                {"name": "Thủy sản", "unit": "Nghìn tỉ đồng", "values": [177.8, 624.4]}
            ]
        },
        "optimal_chart": "pie",
        "optimal_chart_name": "Biểu đồ tròn (Pie Chart - Bán kính khác nhau)",
        "pedagogical_explanation": "Yêu cầu thể hiện 'quy mô và cơ cấu' trong 2 mốc năm (Tổng: 2010 = 876,0 nghìn tỉ; 2024 = 2.762,8 nghìn tỉ đồng theo GD tr.19). Vẽ 2 biểu đồ tròn với bán kính năm 2024 lớn hơn năm 2010 tương ứng với quy mô tổng số.",
        "counter_factual": {
            "stacked_area": "Sai lầm: Biểu đồ miền yêu cầu chuỗi thời gian từ 3 năm trở lên.",
            "line": "Sai lầm: Không thể hiện được cơ cấu bộ phận của một tổng thể."
        }
    },
    # ATLAT_CHART_04 (GD tr.26, DHQG tr.27)
    {
        "id": "ATLAT_CHART_04",
        "atlat_page": "Atlat GD, tr.26 (DHQG, tr.27)",
        "source": "Atlat GD, tr.26 (DHQG, tr.27)",
        "title": "Trị giá xuất khẩu và nhập khẩu hàng hóa nước ta (2015 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để so sánh trị giá xuất khẩu và nhập khẩu hàng hóa nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["so sánh xuất khẩu và nhập khẩu", "cùng đơn vị (tỉ USD)", "cột ghép"],
        "data_table": {
            "headers": ["Năm", "2015", "2020", "2024"],
            "rows": [
                {"name": "Xuất khẩu", "unit": "Tỉ USD", "values": [162.0, 282.6, 405.9]},
                {"name": "Nhập khẩu", "unit": "Tỉ USD", "values": [165.7, 262.8, 381.0]}
            ]
        },
        "optimal_chart": "bar",
        "optimal_chart_name": "Biểu đồ cột ghép (Grouped Bar)",
        "pedagogical_explanation": "So sánh 2 đại lượng Xuất khẩu và Nhập khẩu cùng chung đơn vị tính (tỉ USD) qua 3 mốc năm (số liệu in chuẩn DHQG tr.27 & GD tr.26). Biểu đồ cột ghép đặt cạnh nhau là dạng biểu đồ trực quan nhất.",
        "counter_factual": {
            "pie": "Sai lầm: Không có yêu cầu cơ cấu 100%.",
            "stacked_area": "Sai lầm: Xuất khẩu và Nhập khẩu không phải là các thành phần cộng lại bằng 100%."
        }
    },
    # ATLAT_CHART_05 (GD tr.23, DHQG tr.25)
    {
        "id": "ATLAT_CHART_05",
        "atlat_page": "Atlat GD, tr.23 (DHQG, tr.25)",
        "source": "Atlat GD, tr.23 (DHQG, tr.25)",
        "title": "Tốc độ tăng trưởng sản lượng than, dầu thô và khí tự nhiên (2010 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện tốc độ tăng trưởng sản lượng than sạch, dầu thô và khí tự nhiên nước ta giai đoạn 2010 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["tốc độ tăng trưởng", "năm gốc 2010 = 100%", "biểu đồ đường"],
        "data_table": {
            "headers": ["Năm", "2010", "2015", "2020", "2024"],
            "rows": [
                {"name": "Than sạch", "unit": "%", "values": [100.0, 93.5, 108.4, 115.2]},
                {"name": "Dầu thô", "unit": "%", "values": [100.0, 125.8, 65.2, 54.6]},
                {"name": "Khí tự nhiên", "unit": "%", "values": [100.0, 112.4, 102.8, 88.5]}
            ]
        },
        "optimal_chart": "line",
        "optimal_chart_name": "Biểu đồ đường (Line Chart)",
        "pedagogical_explanation": "Từ khóa vàng 'tốc độ tăng trưởng' kết hợp đơn vị % với năm gốc 2010 = 100% xuất phát từ cùng một gốc là dấu hiệu nhận biết chuẩn mực của Biểu đồ đường.",
        "counter_factual": {
            "pie": "Sai lầm: Biểu đồ tròn không thể hiện tốc độ tăng trưởng qua các năm.",
            "bar_stacked": "Sai lầm: Không thể chồng các chỉ số tăng trưởng độc lập lên nhau."
        }
    },
    # ATLAT_CHART_06 (GD tr.17, DHQG tr.18)
    {
        "id": "ATLAT_CHART_06",
        "atlat_page": "Atlat GD, tr.17 (DHQG, tr.18)",
        "source": "Atlat GD, tr.17 (DHQG, tr.18)",
        "title": "Dân số thành thị và nông thôn nước ta giai đoạn 2010 - 2024",
        "raw_prompt": "Theo bảng số liệu, để thể hiện quy mô và cơ cấu dân số phân theo thành thị và nông thôn nước ta giai đoạn 2010 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["quy mô và cơ cấu dân số", "thành thị + nông thôn = tổng dân số", "cột chồng"],
        "data_table": {
            "headers": ["Năm", "2010", "2015", "2020", "2024"],
            "rows": [
                {"name": "Dân số thành thị", "unit": "Triệu người", "values": [26.5, 31.1, 35.9, 39.5]},
                {"name": "Dân số nông thôn", "unit": "Triệu người", "values": [60.4, 60.7, 61.6, 60.8]}
            ]
        },
        "optimal_chart": "bar_stacked",
        "optimal_chart_name": "Biểu đồ cột chồng (Stacked Bar)",
        "pedagogical_explanation": "Hai bộ phận Thành thị và Nông thôn cộng lại đúng bằng Tổng dân số cả nước. Biểu đồ cột chồng vừa thể hiện được tổng quy mô dân số (độ cao cột), vừa thể hiện được cơ cấu thành thị - nông thôn.",
        "counter_factual": {
            "pie": "Sai lầm: Chuỗi thời gian 4 năm không nên vẽ nhiều biểu đồ tròn gây rối.",
            "line": "Không tối ưu: Không thấy rõ tổng quy mô dân số cả nước bằng hình học cột chồng."
        }
    },
    # ATLAT_CHART_07 (GD tr.19, DHQG tr.21)
    {
        "id": "ATLAT_CHART_07",
        "atlat_page": "Atlat GD, tr.19 (DHQG, tr.21)",
        "source": "Atlat GD, tr.19 (DHQG, tr.21)",
        "title": "Diện tích và sản lượng lúa cả năm của Việt Nam (2015 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện diện tích và sản lượng lúa cả năm của nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["diện tích và sản lượng", "khác đơn vị (nghìn ha và triệu tấn)", "kết hợp"],
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2024"],
            "rows": [
                {"name": "Diện tích lúa", "unit": "Nghìn ha", "values": [7828.0, 7570.4, 7279.0, 7120.0]},
                {"name": "Sản lượng lúa", "unit": "Triệu tấn", "values": [45.1, 44.0, 42.8, 43.5]}
            ]
        },
        "optimal_chart": "combo_bar_line",
        "optimal_chart_name": "Biểu đồ kết hợp (Cột và Đường)",
        "pedagogical_explanation": "Diện tích (nghìn ha - vẽ Cột) và Sản lượng (triệu tấn - vẽ Đường) mang 2 đơn vị tính khác nhau. Bắt buộc vẽ biểu đồ kết hợp cột và đường với 2 trục tung.",
        "counter_factual": {
            "bar": "Sai lầm: Không thể gộp nghìn ha và triệu tấn vào cùng một trục số.",
            "pie": "Sai lầm: Chuỗi 4 năm và hai đại lượng khác đơn vị đo lường."
        }
    },
    # ATLAT_CHART_08 (GD tr.22, DHQG tr.24) - BUG-02 & BUG-04 fix: 6 vùng chuẩn Atlat GD
    {
        "id": "ATLAT_CHART_08",
        "atlat_page": "Atlat GD, tr.22 (DHQG, tr.24)",
        "source": "Atlat GD, tr.22 (DHQG, tr.24)",
        "title": "Giá trị sản xuất công nghiệp phân theo 6 Vùng Kinh tế - Xã hội năm 2024",
        "raw_prompt": "Theo bảng số liệu, để so sánh giá trị sản xuất công nghiệp giữa 6 Vùng Kinh tế - Xã hội nước ta năm 2024 (tổng cả nước: 16 929,7 nghìn tỉ đồng), dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["so sánh giữa các vùng", "năm 2024 duy nhất", "tên vùng dài"],
        "data_table": {
            "headers": ["Vùng Kinh tế - Xã hội", "Giá trị sản xuất (Nghìn tỉ đồng)"],
            "rows": [
                {"name": "Đông Nam Bộ", "unit": "Nghìn tỉ đồng", "values": [5580.4]},
                {"name": "Đồng bằng sông Hồng", "unit": "Nghìn tỉ đồng", "values": [5120.6]},
                {"name": "Duyên hải Nam Trung Bộ và Tây Nguyên", "unit": "Nghìn tỉ đồng", "values": [2890.5]},
                {"name": "Đồng bằng sông Cửu Long", "unit": "Nghìn tỉ đồng", "values": [1650.8]},
                {"name": "Trung du và miền núi phía Bắc", "unit": "Nghìn tỉ đồng", "values": [1120.2]},
                {"name": "Bắc Trung Bộ", "unit": "Nghìn tỉ đồng", "values": [567.2]}
            ]
        },
        "optimal_chart": "bar",
        "optimal_chart_name": "Biểu đồ thanh ngang (Horizontal Bar)",
        "pedagogical_explanation": "So sánh quy mô một chỉ tiêu kinh tế giữa 6 vùng kinh tế - xã hội chuẩn Atlat GD tr.18 & tr.22 có tên địa danh dài tại một mốc thời gian. Biểu đồ thanh ngang giúp nhãn chữ nằm ngang rõ ràng không bị đè chữ.",
        "counter_factual": {
            "line": "Sai lầm: Các vùng độc lập không tạo thành chuỗi thời gian liên tục.",
            "stacked_area": "Sai lầm: 1 năm duy nhất không thể vẽ biểu đồ miền."
        }
    },
    # ATLAT_CHART_09 (GD tr.23, DHQG tr.25)
    {
        "id": "ATLAT_CHART_09",
        "atlat_page": "Atlat GD, tr.23 (DHQG, tr.25)",
        "source": "Atlat GD, tr.23 (DHQG, tr.25)",
        "title": "Sản lượng điện phát ra của nước ta qua các năm (2015 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện tình hình phát triển sản lượng điện phát ra của nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["tình hình phát triển", "1 đại lượng duy nhất", "cột đơn"],
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2024"],
            "rows": [
                {"name": "Sản lượng điện", "unit": "Tỉ kWh", "values": [159.4, 212.9, 235.4, 275.9]}
            ]
        },
        "optimal_chart": "bar",
        "optimal_chart_name": "Biểu đồ cột đơn (Single Bar)",
        "pedagogical_explanation": "Đề bài yêu cầu thể hiện quy mô, tình hình phát triển của một đối tượng duy nhất (sản lượng điện - tỉ kWh) qua các năm. Biểu đồ cột đơn là phù hợp nhất.",
        "counter_factual": {
            "pie": "Sai lầm: Có 4 mốc năm và không có cơ cấu các nguồn điện thành phần.",
            "bar_stacked": "Sai lầm: Chỉ có 1 đối tượng duy nhất nên không dùng cột chồng."
        }
    },
    # ATLAT_CHART_10 (GD tr.26, DHQG tr.27)
    {
        "id": "ATLAT_CHART_10",
        "atlat_page": "Atlat GD, tr.26 (DHQG, tr.27)",
        "source": "Atlat GD, tr.26 (DHQG, tr.27)",
        "title": "Cơ cấu thị trường xuất khẩu hàng hóa Việt Nam năm 2024",
        "raw_prompt": "Theo bảng số liệu, để thể hiện cơ cấu thị trường xuất khẩu hàng hóa của nước ta năm 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["cơ cấu thị trường", "năm 2024 duy nhất (1 năm)", "tổng cộng 100%"],
        "data_table": {
            "headers": ["Thị trường xuất khẩu", "Tỉ trọng (%)"],
            "rows": [
                {"name": "Hoa Kỳ", "unit": "%", "values": [28.5]},
                {"name": "Trung Quốc", "unit": "%", "values": [16.8]},
                {"name": "EU", "unit": "%", "values": [12.6]},
                {"name": "ASEAN", "unit": "%", "values": [9.1]},
                {"name": "Hàn Quốc", "unit": "%", "values": [6.8]},
                {"name": "Nhật Bản", "unit": "%", "values": [6.5]},
                {"name": "Các thị trường khác", "unit": "%", "values": [19.7]}
            ]
        },
        "optimal_chart": "pie",
        "optimal_chart_name": "Biểu đồ tròn (Pie Chart)",
        "pedagogical_explanation": "Yêu cầu 'cơ cấu thị trường' trong duy nhất 1 mốc năm 2024 với tổng tỉ trọng bằng 100%. Biểu đồ tròn là lựa chọn tiêu chuẩn theo Mục 1 biểu đồ.docx.",
        "counter_factual": {
            "stacked_area": "Sai lầm: Biểu đồ miền cần ít nhất 3-4 năm.",
            "line": "Sai lầm: Các thị trường là đối tượng phân loại không gian, không có trục thời gian."
        }
    },
    # ATLAT_CHART_11 (GD tr.21, DHQG tr.23)
    {
        "id": "ATLAT_CHART_11",
        "atlat_page": "Atlat GD, tr.21 (DHQG, tr.23)",
        "source": "Atlat GD, tr.21 (DHQG, tr.23)",
        "title": "Sản lượng thủy sản khai thác và nuôi trồng nước ta (2015 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để so sánh sản lượng thủy sản khai thác và nuôi trồng nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["so sánh khai thác và nuôi trồng", "cùng đơn vị (nghìn tấn)", "cột ghép"],
        "data_table": {
            "headers": ["Năm", "2015", "2020", "2024"],
            "rows": [
                {"name": "Nuôi trồng", "unit": "Nghìn tấn", "values": [3550.7, 4739.2, 5812.3]},
                {"name": "Khai thác", "unit": "Nghìn tấn", "values": [3176.5, 3896.5, 3863.9]}
            ]
        },
        "optimal_chart": "bar",
        "optimal_chart_name": "Biểu đồ cột ghép (Grouped Bar)",
        "pedagogical_explanation": "So sánh 2 ngành Khai thác và Nuôi trồng có cùng đơn vị tính (nghìn tấn) qua các năm (số liệu in chuẩn DHQG tr.23). Biểu đồ cột ghép phản ánh trực quan sự bứt phá của ngành nuôi trồng.",
        "counter_factual": {
            "pie": "Sai lầm: Chuỗi 3 năm không vẽ tròn. Không có tổng cơ cấu 100%.",
            "combo_bar_line": "Không phù hợp: Cùng 1 đơn vị tính (nghìn tấn) thì không cần 2 trục tung."
        }
    },
    # ATLAT_CHART_12 (GD tr.20, DHQG tr.22)
    {
        "id": "ATLAT_CHART_12",
        "atlat_page": "Atlat GD, tr.20 (DHQG, tr.22)",
        "source": "Atlat GD, tr.20 (DHQG, tr.22)",
        "title": "Chuyển dịch cơ cấu diện tích cây công nghiệp nước ta (2010 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện sự chuyển dịch cơ cấu diện tích cây công nghiệp phân theo hàng năm và lâu năm nước ta giai đoạn 2010 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["chuyển dịch cơ cấu diện tích", "giai đoạn 2010 - 2024 (4 năm)", "biểu đồ miền"],
        "data_table": {
            "headers": ["Năm", "2010", "2015", "2020", "2024"],
            "rows": [
                {"name": "Cây công nghiệp lâu năm", "unit": "%", "values": [72.4, 75.8, 79.2, 81.5]},
                {"name": "Cây công nghiệp hàng năm", "unit": "%", "values": [27.6, 24.2, 20.8, 18.5]}
            ]
        },
        "optimal_chart": "stacked_area",
        "optimal_chart_name": "Biểu đồ miền (Stacked Area)",
        "pedagogical_explanation": "Cơ cấu diện tích 2 nhóm cây cộng lại bằng 100% biến thiên qua chuỗi 4 mốc năm (≥ 3 năm). Biểu đồ miền thể hiện rõ xu thế chuyển dịch tăng nhanh của cây lâu năm (cà phê, cao su, hồ tiêu).",
        "counter_factual": {
            "pie": "Sai lầm: 4 năm vượt quá giới hạn vẽ tròn (chỉ từ 1-2 năm).",
            "line": "Không tối ưu: Không làm nổi bật được tính bù trừ của 2 nhóm cây trong diện tích chung 100%."
        }
    },
    # ATLAT_CHART_13 (GD tr.23, DHQG tr.25)
    {
        "id": "ATLAT_CHART_13",
        "atlat_page": "Atlat GD, tr.23 (DHQG, tr.25)",
        "source": "Atlat GD, tr.23 (DHQG, tr.25)",
        "title": "Sản lượng dầu thô khai thác của nước ta giai đoạn 2015 - 2024",
        "raw_prompt": "Theo bảng số liệu, để thể hiện diễn biến sản lượng dầu thô khai thác nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["diễn biến sản lượng", "1 chỉ tiêu duy nhất", "cột đơn"],
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2024"],
            "rows": [
                {"name": "Dầu thô khai thác", "unit": "Triệu tấn", "values": [18.7, 14.0, 9.7, 8.2]}
            ]
        },
        "optimal_chart": "bar",
        "optimal_chart_name": "Biểu đồ cột đơn (Single Bar)",
        "pedagogical_explanation": "Thể hiện diễn biến giảm dần của sản lượng dầu thô khai thác (1 đối tượng duy nhất) qua các năm. Biểu đồ cột đơn là phù hợp nhất.",
        "counter_factual": {
            "pie": "Sai lầm: 4 mốc thời gian không vẽ tròn.",
            "combo_bar_line": "Không phù hợp: Chỉ có 1 đối tượng nghiên cứu duy nhất."
        }
    },
    # ATLAT_CHART_14 (GD tr.26, DHQG tr.27)
    {
        "id": "ATLAT_CHART_14",
        "atlat_page": "Atlat GD, tr.26 (DHQG, tr.27)",
        "source": "Atlat GD, tr.26 (DHQG, tr.27)",
        "title": "Cán cân thương mại hàng hóa nước ta giai đoạn 2015 - 2024",
        "raw_prompt": "Theo bảng số liệu, để thể hiện cán cân thương mại hàng hóa của nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["cán cân thương mại", "thặng dư / thâm hụt (có giá trị âm/dương)", "cột"],
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2022", "2024"],
            "rows": [
                {"name": "Cán cân thương mại", "unit": "Tỉ USD", "values": [-3.7, 6.8, 19.9, 12.4, 27.0]}
            ]
        },
        "optimal_chart": "bar",
        "optimal_chart_name": "Biểu đồ cột (Single Bar - Trục đối xứng 0)",
        "pedagogical_explanation": "Cán cân thương mại có giá trị âm (nhập siêu năm 2015: -3,7 tỉ USD theo DHQG tr.27) và giá trị dương (xuất siêu các năm sau). Biểu đồ cột có trục số 0 đối xứng là chuẩn mực nhất.",
        "counter_factual": {
            "pie": "Sai lầm: Số liệu có giá trị âm không thể vẽ biểu đồ tròn.",
            "stacked_area": "Sai lầm: Số liệu âm không thể xếp chồng miền."
        }
    },
    # ATLAT_CHART_15 (GD tr.23, DHQG tr.25)
    {
        "id": "ATLAT_CHART_15",
        "atlat_page": "Atlat GD, tr.23 (DHQG, tr.25)",
        "source": "Atlat GD, tr.23 (DHQG, tr.25)",
        "title": "Công suất lắp máy một số nhà máy thủy điện lớn ở nước ta",
        "raw_prompt": "Theo bảng số liệu, để so sánh công suất lắp máy của một số nhà máy thủy điện lớn ở nước ta, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["so sánh công suất", "nhiều đối tượng địa danh", "thanh ngang"],
        "data_table": {
            "headers": ["Nhà máy thủy điện", "Công suất (MW)"],
            "rows": [
                {"name": "Sơn La (Sông Đà)", "unit": "MW", "values": [2400]},
                {"name": "Hòa Bình (Sông Đà)", "unit": "MW", "values": [1920]},
                {"name": "Lai Châu (Sông Đà)", "unit": "MW", "values": [1200]},
                {"name": "Yaly (Sông Sê San)", "unit": "MW", "values": [720]},
                {"name": "Huội Quảng (Sông Nậm Mu)", "unit": "MW", "values": [520]},
                {"name": "Trị An (Sông Đồng Nai)", "unit": "MW", "values": [400]}
            ]
        },
        "optimal_chart": "bar",
        "optimal_chart_name": "Biểu đồ thanh ngang (Horizontal Bar)",
        "pedagogical_explanation": "So sánh 1 chỉ tiêu duy nhất (công suất MW) giữa các nhà máy độc lập có tên riêng dài. Biểu đồ thanh ngang là tối ưu nhất.",
        "counter_factual": {
            "line": "Sai lầm: Các nhà máy độc lập không liên tục theo thời gian.",
            "pie": "Không tối ưu: Khó so sánh độ chênh lệch công suất chính xác như thanh ngang."
        }
    }
]

# -----------------------------------------------------------------------------
# 5. 6 QUY TẮC VÀNG CHUẨN NGUYÊN VĂN "biểu đồ.docx" (BUG-05)
# -----------------------------------------------------------------------------
KEYWORD_GUIDE_6 = [
    {
        "chart_type": "pie",
        "chart_name": "1. Biểu đồ Tròn (Pie Chart)",
        "time_rule": "Mốc thời gian chỉ từ 1 - 2 năm (theo Mục 1 biểu đồ.docx: 'Mốc thời gian chỉ từ 1-2 năm')",
        "golden_keywords": ["cơ cấu", "tỷ trọng", "tỷ lệ", "kết cấu"],
        "typical_units": ["% (tổng các thành phần luôn bằng 100%)"],
        "critical_traps": "Không vẽ biểu đồ Tròn khi chuỗi thời gian từ 3 năm trở lên (phải chuyển sang Biểu đồ Miền). Không vẽ tròn khi số liệu có giá trị âm.",
        "example_prompt": "Cơ cấu doanh thu du lịch lữ hành phân theo thành phần kinh tế của nước ta năm 2010 và 2016 (%) (Trích biểu đồ.docx, Mục 1)"
    },
    {
        "chart_type": "line",
        "chart_name": "2. Biểu đồ Đường (Line Chart)",
        "time_rule": "Chuỗi thời gian liên tục qua nhiều năm (theo Mục 2 biểu đồ.docx)",
        "golden_keywords": ["tốc độ tăng trưởng", "tốc độ phát triển", "sự thay đổi", "phát triển", "diễn biến"],
        "typical_units": ["% (năm gốc = 100%)", "đại lượng liên tục qua thời gian"],
        "critical_traps": "Không vẽ biểu đồ Đường cho các đối tượng độc lập phân theo không gian (các tỉnh, các nước trong 1 năm tĩnh). Chỉ vẽ khi có chuỗi thời gian liên tục.",
        "example_prompt": "GDP của Phi líp pin, Thái Lan và Việt Nam giai đoạn 2010 – 2016 (Trích biểu đồ.docx, Mục 2)"
    },
    {
        "chart_type": "bar",
        "chart_name": "3. Biểu đồ Cột (Bar Chart)",
        "time_rule": "1 năm hoặc nhiều năm (so sánh theo không gian/thời gian, theo Mục 3 biểu đồ.docx)",
        "golden_keywords": ["sự biến động của một đối tượng qua nhiều năm", "so sánh các đối tượng khi có cùng đơn vị trong một năm", "tình hình phát triển", "khối lượng"],
        "typical_units": ["Cùng 1 đơn vị tính (Triệu tấn, Tỉ kWh, Nghìn ha...)"],
        "critical_traps": "Không vẽ biểu đồ Cột khi các đại lượng khác nhau về đơn vị đo lường trên cùng một trục tung. Nếu tên đối tượng dài, ưu tiên biểu đồ Thanh Ngang.",
        "example_prompt": "So sánh dân số, diện tích của 1 số tỉnh; So sánh sản lượng điện của 1 địa phương qua các năm (Trích biểu đồ.docx, Mục 3)"
    },
    {
        "chart_type": "stacked_area",
        "chart_name": "4. Biểu đồ Miền (Stacked Area)",
        "time_rule": "Chuỗi thời gian từ 3 năm trở lên (theo Mục 4 biểu đồ.docx: 'từ 3 năm trở lên')",
        "golden_keywords": ["thay đổi cơ cấu", "chuyển dịch cơ cấu", "tỉ trọng của hai hoặc ba nhóm đối tượng từ 3 năm trở lên"],
        "typical_units": ["% (tổng các miền chồng luôn bằng 100%)"],
        "critical_traps": "Không vẽ biểu đồ Miền khi chỉ có 1-2 mốc năm (phải vẽ Tròn). Không vẽ miền khi số liệu có giá trị âm hoặc tổng các bộ phận không bằng 100%.",
        "example_prompt": "Tỷ lệ xuất và nhập khẩu; Cán cân xuất nhập khẩu; Cơ cấu GDP phân theo khu vực kinh tế (Trích biểu đồ.docx, Mục 4)"
    },
    {
        "chart_type": "combo_bar_line",
        "chart_name": "5. Biểu đồ Kết Hợp Cột + Đường (Combo)",
        "time_rule": "Chuỗi thời gian qua nhiều năm (theo Mục 5 biểu đồ.docx)",
        "golden_keywords": ["khác nhau về đơn vị nhưng có mối quan hệ với nhau", "quy mô và tốc độ tăng trưởng", "diện tích và sản lượng", "từ ba loại số liệu trở lên"],
        "typical_units": ["2 loại đơn vị đo lường khác nhau (ví dụ: Nghìn ha và Triệu tấn, Tỉ USD và %)"],
        "critical_traps": "Bắt buộc có 2 trục tung (trục trái và trục phải). Nếu các đại lượng có cùng một đơn vị tính thì KHÔNG được vẽ kết hợp 2 trục.",
        "example_prompt": "Thể hiện sản lượng khai thác, nuôi trồng và giá trị sản xuất của Việt Nam (Trích biểu đồ.docx, Mục 5)"
    },
    {
        "chart_type": "bar_stacked",
        "chart_name": "6. Biểu đồ Cột Chồng (Stacked Bar)",
        "time_rule": "Từ 2 đến nhiều năm (theo Mục 6 biểu đồ.docx)",
        "golden_keywords": ["quy mô và cơ cấu của đối tượng (theo tỉ lệ % tuyệt đối)", "thành phần cấu thành tổng thể"],
        "typical_units": ["Cùng 1 đơn vị tính (Triệu người, Nghìn tấn hoặc %)"],
        "critical_traps": "Các thành phần xếp chồng bắt buộc phải cộng dồn lại đúng bằng tổng số (hoặc bằng 100%). Không xếp chồng các đại lượng độc lập không cùng một chỉnh thể.",
        "example_prompt": "Dân số thành thị và nông thôn nước ta (cộng lại bằng tổng dân số cả nước) (Trích biểu đồ.docx, Mục 6)"
    }
]

def update_topography(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    for feat in data.get("features", []):
        p = feat.get("properties", {})
        # BUG-12: Rename Fansipan to Phanxipăng
        if "Fansipan" in p.get("name", ""):
            p["name"] = "Đỉnh Phanxipăng (3.147m)"
            p["elevation_m"] = 3147
            p["aliases"] = ["Fansipan", "Phanxipang", "Phan xi păng", "N. Phanxipăng"]
            p["source"] = "Atlat GD, tr.14 (N. Phanxipăng 3 147)"
        # BUG-16: Standardize province names
        prov = p.get("province", "")
        if prov == "Thừa Thiên Huế":
            p["province"] = "Thành phố Huế"
        elif prov == "Kon Tum":
            p["province"] = "Tỉnh Gia Lai"
        elif prov == "Đắk Nông":
            p["province"] = "Tỉnh Đắk Lắk"
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {file_path}")

def update_minerals(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    prov_map = {
        "Quảng Nam": "Thành phố Đà Nẵng",
        "Bà Rịa - Vũng Tàu": "Thành phố Hồ Chí Minh",
        "Thái Bình": "Tỉnh Hưng Yên",
        "Hà Giang": "Tỉnh Tuyên Quang",
        "Đắk Nông": "Tỉnh Đắk Lắk",
        "Bình Thuận": "Tỉnh Lâm Đồng",
        "Bình Định": "Tỉnh Quảng Ngãi"
    }
    for feat in data.get("features", []):
        p = feat.get("properties", {})
        prov = p.get("province", "")
        if prov in prov_map:
            p["province"] = prov_map[prov]
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {file_path}")

def update_hydropower(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    prov_map = {
        "Hòa Bình": "Tỉnh Phú Thọ",
        "Bình Thuận": "Tỉnh Lâm Đồng",
        "Bà Rịa - Vũng Tàu": "Thành phố Hồ Chí Minh",
        "Trà Vinh": "Tỉnh Vĩnh Long",
        "Hải Dương": "Thành phố Hải Phòng",
        "Bạc Liêu": "Tỉnh Cà Mau",
        "Ninh Thuận": "Tỉnh Lâm Đồng"
    }
    for feat in data.get("features", []):
        p = feat.get("properties", {})
        cap = p.get("capacity_mw", 0)
        # BUG-07: 2 tiers in Atlat GD tr.23
        p["capacity_tier"] = "Trên 1 000 MW" if cap >= 1000 else "Dưới 1 000 MW"
        p["source"] = "Atlat GD, tr.23 (Năng lượng)"
        prov = p.get("province", "")
        if prov in prov_map:
            p["province"] = prov_map[prov]
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {file_path}")

def update_agriculture(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    for feat in data.get("features", []):
        p = feat.get("properties", {})
        # BUG-07: Hide fishing grounds not in Atlat
        if p.get("category") == "fishing_ground":
            p["status"] = "missing"
            p["hidden"] = True
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {file_path}")

def main():
    print("[*] Starting Complete Dataset Master Patch...")

    # 1. Update individual GeoJSON files
    update_topography(os.path.join(DATA_DIR, "topography_rivers.geojson"))
    update_minerals(os.path.join(DATA_DIR, "minerals.geojson"))
    update_hydropower(os.path.join(DATA_DIR, "hydropower.geojson"))
    update_agriculture(os.path.join(DATA_DIR, "agriculture_fishery.geojson"))

    # 2. Update vn_provinces_34.geojson
    with open(os.path.join(DATA_DIR, "vn_provinces_34.geojson"), "r", encoding="utf-8") as f:
        geo_34 = json.load(f)

    for feat in geo_34["features"]:
        p = feat["properties"]
        name = p.get("name")
        if name in PROVINCES_34_STATS:
            st = PROVINCES_34_STATS[name]
            p["area"] = st["area"]
            p["pop"] = st["pop"]
            p["density"] = round((st["pop"] * 1000) / st["area"])
            p["administrative_type"] = st["type"]
            p["region_name"] = st["region"]
            p["region"] = st["region"]
            p["merged_from"] = st["merged_from"]
            p["merged_from_desc"] = "Gồm: " + ", ".join(st["merged_from"])
            p["source"] = "NQ số 202/2025/QH15 & Atlat GD, tr.4-5 (Bảng thống kê diện tích, dân số)"
        elif p.get("is_special_island"):
            p["administrative_type"] = "Đặc khu"
            p["region_name"] = "Duyên hải Nam Trung Bộ và Tây Nguyên"
            p["region"] = "Duyên hải Nam Trung Bộ và Tây Nguyên"

    with open(os.path.join(DATA_DIR, "vn_provinces_34.geojson"), "w", encoding="utf-8") as f:
        json.dump(geo_34, f, ensure_ascii=False, indent=2)
    print("[+] Updated vn_provinces_34.geojson with 6 regions.")

    # 3. Build baseline GeoJSON (Điểm 0 + A1 -> A24)
    baseline_features = []
    polyline_coords = []
    for bp in BASELINE_POINTS:
        polyline_coords.append(bp["coords"])
        baseline_features.append({
            "type": "Feature",
            "properties": {
                "category": "baseline_point",
                "code": bp["code"],
                "name": bp["name"],
                "province": bp["province"],
                "dms_lat": bp.get("dms_lat", ""),
                "dms_lng": bp.get("dms_lng", ""),
                "desc": bp["desc"],
                "source": "Atlat GD, tr.7 (Bảng toạ độ điểm chuẩn đường cơ sở)"
            },
            "geometry": {
                "type": "Point",
                "coordinates": bp["coords"]
            }
        })

    # LineString for the full marine baseline
    baseline_features.append({
        "type": "Feature",
        "properties": {
            "category": "baseline_line",
            "name": "Đường cơ sở dùng để tính chiều rộng lãnh hải Việt Nam (Điểm 0, A1 - A24)",
            "desc": "Đường cơ sở thẳng nối liền các điểm nhô ra ngoài cùng của các đảo và mũi đất ven bờ từ Điểm 0 (vùng nước lịch sử Tây Nam) qua Hòn Nhạn (A1) đến Mũi Trà Cổ (A24).",
            "source": "Tuyên bố của Chính phủ ngày 12/11/1982 & Atlat GD, tr.7"
        },
        "geometry": {
            "type": "LineString",
            "coordinates": polyline_coords
        }
    })

    geo_baseline = {
        "type": "FeatureCollection",
        "metadata": {
            "title": "Đường cơ sở biển Việt Nam (Điểm 0, A1 - A24)",
            "standard": "Atlat GD, tr.7 & DHQG, tr.9"
        },
        "features": baseline_features
    }

    # 4. Climate GeoJSON
    with open(os.path.join(DATA_DIR, "climate_hydro.geojson"), "r", encoding="utf-8") as f:
        geo_climate = json.load(f)

    climate_features = []
    for feat in geo_climate.get("features", []):
        if feat.get("properties", {}).get("category") != "met_station":
            climate_features.append(feat)

    for cs in CLIMATE_STATIONS:
        climate_features.append({
            "type": "Feature",
            "properties": {
                "category": "met_station",
                "name": cs["name"],
                "avg_temp": cs["avg_temp"],
                "rainfall": cs["rainfall"],
                "province": cs["province"],
                "climate_type": cs["climate_type"],
                "desc": cs["desc"],
                "source": "Atlat GD, tr.8 (Khí hậu chung)"
            },
            "geometry": {
                "type": "Point",
                "coordinates": cs["coords"]
            }
        })

    geo_climate_updated = {
        "type": "FeatureCollection",
        "metadata": {
            "title": "Khí hậu & Thủy văn Việt Nam (Atlat GD, tr.8 & 9)",
            "stations_count": len(CLIMATE_STATIONS)
        },
        "features": climate_features
    }

    with open(os.path.join(DATA_DIR, "climate_hydro.geojson"), "w", encoding="utf-8") as f:
        json.dump(geo_climate_updated, f, ensure_ascii=False, indent=2)
    print("[+] Updated climate_hydro.geojson with 15 official stations.")

    # 5. Enrich chart exercises
    for q in ALL_CHART_QUESTIONS:
        headers = q["data_table"]["headers"]
        rows = q["data_table"]["rows"]
        time_points = max(1, len(headers) - 1)
        units = list(dict.fromkeys([r.get("unit") for r in rows if r.get("unit")])) or ["%"]
        is_total_100 = any("%" in str(u) for u in units) or "100" in str(q.get("keywords", [])) or "cơ cấu" in q.get("raw_prompt", "").lower()
        q["structural_analysis"] = {
            "time_points": time_points,
            "units": units,
            "is_total_100": is_total_100
        }

    chart_bank = {
        "metadata": {
            "title": "Ngân hàng 21 Bài Tập Nhận Dạng Biểu Đồ Atlat Địa Lí (GDPT 2018)",
            "standard": "Ấn phẩm Atlat GD (chỉnh sửa năm 2025, Lê Huỳnh - Đặng Vũ Khắc) & biểu đồ.docx",
            "total_questions": len(ALL_CHART_QUESTIONS)
        },
        "questions": ALL_CHART_QUESTIONS,
        "keyword_guide": KEYWORD_GUIDE_6
    }
    with open(os.path.join(DATA_DIR, "chart_questions.json"), "w", encoding="utf-8") as f:
        json.dump(chart_bank, f, ensure_ascii=False, indent=2)
    print(f"[+] Updated chart_questions.json ({len(ALL_CHART_QUESTIONS)} questions).")

    # 6. Load remaining datasets for master object
    with open(os.path.join(DATA_DIR, "vn_provinces_63.geojson"), "r", encoding="utf-8") as f:
        geo_63 = json.load(f)
    with open(os.path.join(DATA_DIR, "topography_rivers.geojson"), "r", encoding="utf-8") as f:
        geo_topography = json.load(f)
    with open(os.path.join(DATA_DIR, "agriculture_fishery.geojson"), "r", encoding="utf-8") as f:
        geo_agriculture = json.load(f)
    with open(os.path.join(DATA_DIR, "minerals.geojson"), "r", encoding="utf-8") as f:
        geo_minerals = json.load(f)
    with open(os.path.join(DATA_DIR, "hydropower.geojson"), "r", encoding="utf-8") as f:
        geo_power = json.load(f)
    with open(os.path.join(DATA_DIR, "industrial_centers.geojson"), "r", encoding="utf-8") as f:
        geo_industrial = json.load(f)

    master_atlat_data = {
        "metadata": {
            "title": "Bộ Dữ Liệu Gốc Atlat Địa Lí Việt Nam 2026 (GDPT 2018)",
            "version": "2026.3.0",
            "published": "2026",
            "source": "Atlat Địa lí Việt Nam (chỉnh sửa năm 2025, đồng Chủ biên Lê Huỳnh, Đặng Vũ Khắc) & NQ 202/2025/QH15 & biểu đồ.docx",
            "offline_embedded": True
        },
        "baseline_points": BASELINE_POINTS,
        "climate_stations": CLIMATE_STATIONS,
        "provinces_34_stats": PROVINCES_34_STATS,
        "chart_exercises": ALL_CHART_QUESTIONS,
        "keyword_guide": KEYWORD_GUIDE_6,
        "geo_baseline": geo_baseline,
        "geo_climate": geo_climate_updated,
        "geo_provinces_34": geo_34,
        "geo_provinces_63": geo_63,
        "geo_topography": geo_topography,
        "geo_agriculture": geo_agriculture,
        "geo_minerals": geo_minerals,
        "geo_power": geo_power,
        "geo_industrial": geo_industrial
    }

    master_json_path = os.path.join(DATA_DIR, "atlat_2026_master.json")
    with open(master_json_path, "w", encoding="utf-8") as f:
        json.dump(master_atlat_data, f, ensure_ascii=False, indent=2)
    print(f"[+] Exported {master_json_path} ({os.path.getsize(master_json_path) / 1024:.1f} KB)")

    # Also sync root data/ directory if exists
    root_data_path = os.path.join(ROOT_DIR, "data", "atlat_2026_master.json")
    if os.path.exists(os.path.dirname(root_data_path)):
        with open(root_data_path, "w", encoding="utf-8") as f:
            json.dump(master_atlat_data, f, ensure_ascii=False, indent=2)
        print(f"[+] Exported {root_data_path}")

    # Write js/atlat-data.js
    atlat_js_path = os.path.join(JS_DIR, "atlat-data.js")
    js_content = f"/**\n * GeoAtlas Interactive - Master Atlat 2026 Embedded Dataset (GDPT 2018)\n * 100% Offline Static Data - Zero Network Latency - Zero CORS - Zero Scraping\n */\nwindow.ATLAT_DATA = {json.dumps(master_atlat_data, ensure_ascii=False)};\n"
    with open(atlat_js_path, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"[+] Exported {atlat_js_path} ({os.path.getsize(atlat_js_path) / 1024:.1f} KB)")

    # Sync js/fallback-store.js
    fallback_data = {
        "provinces": geo_34,
        "minerals": geo_minerals,
        "power": geo_power,
        "industrial": geo_industrial,
        "chartQuestions": chart_bank
    }
    fallback_js_path = os.path.join(JS_DIR, "fallback-store.js")
    fb_content = f"/**\n * GeoAtlas Interactive - Fallback Data Store (Tier 3 Seed Resilience)\n * Auto-synchronized with official Atlat GD 2026 dataset\n */\nwindow.GEO_ATLAS_FALLBACK_DATA = {json.dumps(fallback_data, ensure_ascii=False)};\n"
    with open(fallback_js_path, "w", encoding="utf-8") as f:
        f.write(fb_content)
    print(f"[+] Exported {fallback_js_path} ({os.path.getsize(fallback_js_path) / 1024:.1f} KB)")

if __name__ == "__main__":
    main()

