#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GeoAtlas Interactive - Master Atlat 2026 Data Builder
Converts and packages 100% official data extracted from Atlat 2026 & GDPT 2018:
1. 34 New Administrative Units (NQ 202/2025/QH15) & 63 Traditional Provinces (Trang 4-5)
2. Marine Baseline Points A1 - A11 & Baseline Polyline (Trang 7 & 9)
3. 8 Standard Climate Stations & Monsoon/Storm Vectors (Atlat GD, tr.8 & 9)
4. Topography & Rivers, Agriculture & Fisheries, Minerals & Energy, Industrial Centers
5. 15 Standard High-School Exam Chart Identification Exercises (Trang 17, 18, 19, 21, 23, 26)

Outputs:
- public/data/atlat_2026_master.json
- js/atlat-data.js (window.ATLAT_DATA)
"""

import json
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "public", "data")
JS_DIR = os.path.join(BASE_DIR, "js")

MASTER_JSON_PATH = os.path.join(DATA_DIR, "atlat_2026_master.json")
ATLAT_DATA_JS_PATH = os.path.join(JS_DIR, "atlat-data.js")

# 1. 34 Tỉnh / Thành phố mới (Số liệu chuẩn 100% Bảng Niên giám thống kê 2024 tại Atlat GD Trang 5)
PROVINCES_34_STATS = {
    # 1. Trung du và miền núi phía Bắc (9)
    "Tỉnh Cao Bằng": {"area": 6700.4, "pop": 558.5, "type": "Tỉnh", "region": "Trung du và miền núi Bắc Bộ", "merged_from": ["Cao Bằng"]},
    "Tỉnh Tuyên Quang": {"area": 13795.6, "pop": 1731.7, "type": "Tỉnh", "region": "Trung du và miền núi Bắc Bộ", "merged_from": ["Tuyên Quang", "Hà Giang"]},
    "Tỉnh Lào Cai": {"area": 13257.0, "pop": 1656.6, "type": "Tỉnh", "region": "Trung du và miền núi Bắc Bộ", "merged_from": ["Lào Cai", "Yên Bái"]},
    "Tỉnh Thái Nguyên": {"area": 8375.3, "pop": 1694.5, "type": "Tỉnh", "region": "Trung du và miền núi Bắc Bộ", "merged_from": ["Thái Nguyên", "Bắc Kạn"]},
    "Tỉnh Lạng Sơn": {"area": 8310.2, "pop": 814.0, "type": "Tỉnh", "region": "Trung du và miền núi Bắc Bộ", "merged_from": ["Lạng Sơn"]},
    "Tỉnh Phú Thọ": {"area": 9361.4, "pop": 3663.7, "type": "Tỉnh", "region": "Trung du và miền núi Bắc Bộ", "merged_from": ["Phú Thọ", "Vĩnh Phúc", "Hòa Bình"]},
    "Tỉnh Điện Biên": {"area": 9539.9, "pop": 656.7, "type": "Tỉnh", "region": "Trung du và miền núi Bắc Bộ", "merged_from": ["Điện Biên"]},
    "Tỉnh Lai Châu": {"area": 9068.7, "pop": 495.5, "type": "Tỉnh", "region": "Trung du và miền núi Bắc Bộ", "merged_from": ["Lai Châu"]},
    "Tỉnh Sơn La": {"area": 14108.9, "pop": 1330.6, "type": "Tỉnh", "region": "Trung du và miền núi Bắc Bộ", "merged_from": ["Sơn La"]},

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

    # 4. Duyên hải Nam Trung Bộ và Tây Nguyên (6) - Chuẩn Nghị quyết 202/2025/QH15 & Atlat GD tr.5
    "Thành phố Đà Nẵng": {"area": 11859.6, "pop": 2819.9, "type": "Thành phố trực thuộc Trung ương", "region": "Duyên hải Nam Trung Bộ và Tây Nguyên", "merged_from": ["Đà Nẵng", "Quảng Nam"]},
    "Tỉnh Quảng Ngãi": {"area": 14832.6, "pop": 1861.1, "type": "Tỉnh", "region": "Duyên hải Nam Trung Bộ và Tây Nguyên", "merged_from": ["Kon Tum", "Quảng Ngãi"]},
    "Tỉnh Khánh Hoà": {"area": 8555.9, "pop": 1892.4, "type": "Tỉnh", "region": "Duyên hải Nam Trung Bộ và Tây Nguyên", "merged_from": ["Ninh Thuận", "Khánh Hoà"]},
    "Tỉnh Gia Lai": {"area": 21576.5, "pop": 3245.6, "type": "Tỉnh", "region": "Duyên hải Nam Trung Bộ và Tây Nguyên", "merged_from": ["Bình Định", "Gia Lai"]},
    "Tỉnh Đắk Lắk": {"area": 18096.4, "pop": 2784.8, "type": "Tỉnh", "region": "Duyên hải Nam Trung Bộ và Tây Nguyên", "merged_from": ["Phú Yên", "Đắk Lắk"]},
    "Tỉnh Lâm Đồng": {"area": 24233.1, "pop": 3376.8, "type": "Tỉnh", "region": "Duyên hải Nam Trung Bộ và Tây Nguyên", "merged_from": ["Đắk Nông", "Bình Thuận", "Lâm Đồng"]},

    # 5. Đông Nam Bộ (3)
    "Tỉnh Tây Ninh": {"area": 8536.5, "pop": 2959.0, "type": "Tỉnh", "region": "Đông Nam Bộ", "merged_from": ["Tây Ninh", "Long An"]},
    "Thành phố Đồng Nai": {"area": 12737.2, "pop": 4427.7, "type": "Thành phố trực thuộc Trung ương", "region": "Đông Nam Bộ", "merged_from": ["Đồng Nai", "Bình Phước"]},
    "Thành phố Hồ Chí Minh": {"area": 6772.6, "pop": 13608.8, "type": "Thành phố trực thuộc Trung ương", "region": "Đông Nam Bộ", "merged_from": ["TP. Hồ Chí Minh", "Bình Dương", "Bà Rịa - Vũng Tàu"]},

    # 6. Đồng bằng sông Cửu Long (5)
    "Tỉnh Vĩnh Long": {"area": 6296.2, "pop": 3367.5, "type": "Tỉnh", "region": "Đồng bằng sông Cửu Long", "merged_from": ["Vĩnh Long", "Bến Tre", "Trà Vinh"]},
    "Tỉnh Đồng Tháp": {"area": 5938.7, "pop": 3397.2, "type": "Tỉnh", "region": "Đồng bằng sông Cửu Long", "merged_from": ["Đồng Tháp", "Tiền Giang"]},
    "Tỉnh An Giang": {"area": 9888.9, "pop": 3679.3, "type": "Tỉnh", "region": "Đồng bằng sông Cửu Long", "merged_from": ["An Giang", "Kiên Giang"]},
    "Thành phố Cần Thơ": {"area": 6360.8, "pop": 3207.0, "type": "Thành phố trực thuộc Trung ương", "region": "Đồng bằng sông Cửu Long", "merged_from": ["Cần Thơ", "Hậu Giang", "Sóc Trăng"]},
    "Tỉnh Cà Mau": {"area": 7942.4, "pop": 2140.7, "type": "Tỉnh", "region": "Đồng bằng sông Cửu Long", "merged_from": ["Cà Mau", "Bạc Liêu"]}
}

# 2. Điểm cơ sở đường biển A1 - A11 (Atlat Trang 7 & 9)
BASELINE_POINTS = [
    {"code": "A1", "name": "Điểm A1: Hòn Nhạn (Quần đảo Thổ Chu)", "province": "Kiên Giang", "coords": [103.45, 9.25], "desc": "Điểm cơ sở số 1 phía Tây Nam vịnh Thái Lan."},
    {"code": "A2", "name": "Điểm A2: Hòn Đá Lẻ", "province": "Cà Mau", "coords": [104.87, 8.38], "desc": "Điểm cơ sở cực Nam bán đảo Cà Mau."},
    {"code": "A3", "name": "Điểm A3: Hòn Tài Lớn (Côn Đảo)", "province": "Bà Rịa - Vũng Tàu", "coords": [106.63, 8.63], "desc": "Điểm cơ sở nhóm đảo Côn Sơn."},
    {"code": "A4", "name": "Điểm A4: Hòn Bông Lang (Côn Đảo)", "province": "Bà Rịa - Vũng Tàu", "coords": [106.67, 8.65], "desc": "Điểm cơ sở phía Đông Nam Côn Đảo."},
    {"code": "A5", "name": "Điểm A5: Hòn Bảy Cạnh (Côn Đảo)", "province": "Bà Rịa - Vũng Tàu", "coords": [106.70, 8.66], "desc": "Điểm cơ sở phía Đông Côn Đảo."},
    {"code": "A6", "name": "Điểm A6: Hòn Hải (Nhóm đảo Phú Quý)", "province": "Bình Thuận", "coords": [109.08, 9.97], "desc": "Điểm cơ sở xa bờ nhất Nam Trung Bộ."},
    {"code": "A7", "name": "Điểm A7: Hòn Đôi (Bán đảo Hòn Gốm)", "province": "Khánh Hoà", "coords": [109.47, 12.65], "desc": "Điểm cơ sở gần cực Đông đất liền."},
    {"code": "A8", "name": "Điểm A8: Mũi Đại Lãnh", "province": "Phú Yên", "coords": [109.45, 12.89], "desc": "Điểm cơ sở mũi đất đón bình minh sớm nhất đất liền."},
    {"code": "A9", "name": "Điểm A9: Hòn Ông Căn", "province": "Bình Định", "coords": [109.35, 13.90], "desc": "Điểm cơ sở bờ biển Bình Định."},
    {"code": "A10", "name": "Điểm A10: Đảo Lý Sơn", "province": "Quảng Ngãi", "coords": [109.15, 15.39], "desc": "Điểm cơ sở huyện đảo Lý Sơn."},
    {"code": "A11", "name": "Điểm A11: Đảo Cồn Cỏ", "province": "Quảng Trị", "coords": [107.34, 17.17], "desc": "Điểm cơ sở cửa ngõ phía Nam vịnh Bắc Bộ."}
]

# 3. 8 Trạm khí tượng tiêu biểu (Atlat GD, tr.8 & 9)
CLIMATE_STATIONS = [
    {
        "name": "Hà Nội (Trạm Láng)",
        "coords": [105.80, 21.02],
        "avg_temp": "23,8°C",
        "max_temp": "29,8°C",
        "min_temp": "16,4°C",
        "temp_range": "13,4°C",
        "rainfall": "1.676 mm",
        "climate_type": "Nhiệt đới ẩm gió mùa có mùa đông lạnh",
        "desc": "Đặc trưng khí hậu miền Bắc: Biên độ nhiệt lớn (13,4°C), có mùa đông lạnh kéo dài từ tháng XI đến tháng IV năm sau do gió mùa Đông Bắc."
    },
    {
        "name": "Sa Pa",
        "coords": [103.84, 22.33],
        "avg_temp": "15,2°C",
        "max_temp": "19,8°C",
        "min_temp": "8,6°C",
        "temp_range": "11,2°C",
        "rainfall": "2.700 mm",
        "climate_type": "Ôn đới núi cao Hoàng Liên Sơn",
        "desc": "Độ cao >1.500m: Nhiệt độ trung bình năm thấp (15,2°C), sườn đón gió ẩm mưa rất lớn, mùa đông có thể xuất hiện băng giá và tuyết rơi."
    },
    {
        "name": "Huế",
        "coords": [107.59, 16.46],
        "avg_temp": "25,1°C",
        "max_temp": "29,4°C",
        "min_temp": "19,7°C",
        "temp_range": "9,7°C",
        "rainfall": "2.868 mm",
        "climate_type": "Khí hậu chuyển tiếp Bắc Trung Bộ",
        "desc": "Lượng mưa cực đại vào các tháng thu - đông (tháng IX - XII) do gió mùa Đông Bắc qua biển gặp địa hình chắn gió Bạch Mã kết hợp bão và dải hội tụ."
    },
    {
        "name": "Đà Nẵng",
        "coords": [108.22, 16.07],
        "avg_temp": "25,7°C",
        "max_temp": "29,1°C",
        "min_temp": "21,3°C",
        "temp_range": "7,8°C",
        "rainfall": "2.044 mm",
        "climate_type": "Duyên hải Nam Trung Bộ",
        "desc": "Phía nam đèo Hải Vân: Nhiệt độ trung bình năm trên 25°C, biên độ nhiệt giảm dần (7,8°C), không có mùa đông lạnh sâu như miền Bắc."
    },
    {
        "name": "Đà Lạt",
        "coords": [108.44, 11.94],
        "avg_temp": "17,9°C",
        "max_temp": "20,5°C",
        "min_temp": "14,8°C",
        "temp_range": "5,7°C",
        "rainfall": "1.739 mm",
        "climate_type": "Cận nhiệt đới vùng núi cao Tây Nguyên",
        "desc": "Độ cao ~1.500m trên cao nguyên Lâm Viên: Mát mẻ quanh năm, biên độ nhiệt năm nhỏ (5,7°C), thích hợp canh tác rau hoa quả ôn đới."
    },
    {
        "name": "Buôn Ma Thuột",
        "coords": [108.05, 12.67],
        "avg_temp": "23,7°C",
        "max_temp": "26,5°C",
        "min_temp": "20,8°C",
        "temp_range": "5,7°C",
        "rainfall": "1.796 mm",
        "climate_type": "Cận xích đạo cao nguyên Tây Nguyên",
        "desc": "Khí hậu phân hóa sâu sắc thành 2 mùa mưa - khô rõ rệt, là thủ phủ vùng chuyên canh cà phê vối số 1 Việt Nam."
    },
    {
        "name": "TP. Hồ Chí Minh",
        "coords": [106.66, 10.77],
        "avg_temp": "27,1°C",
        "max_temp": "29,7°C",
        "min_temp": "26,0°C",
        "temp_range": "3,7°C",
        "rainfall": "1.931 mm",
        "climate_type": "Cận xích đạo gió mùa Nam Bộ",
        "desc": "Nhiệt độ cao đều quanh năm (>27°C), không có mùa đông lạnh, biên độ nhiệt năm rất nhỏ (3,7°C), mùa mưa trùng với gió mùa Tây Nam."
    },
    {
        "name": "Cà Mau",
        "coords": [105.15, 9.18],
        "avg_temp": "26,8°C",
        "max_temp": "28,6°C",
        "min_temp": "25,5°C",
        "temp_range": "3,1°C",
        "rainfall": "2.360 mm",
        "climate_type": "Cực Nam cận xích đạo hải dương",
        "desc": "Biên độ nhiệt năm nhỏ nhất cả nước (3,1°C), mùa mưa dài và lượng mưa phong phú (>2.300 mm)."
    }
]

# 4. 15 Bài tập Nhận dạng biểu đồ chuẩn THPT từ số liệu Atlat
CHART_EXERCISES_15 = [
    {
        "id": "ATLAT_CHART_01",
        "atlat_page": "Atlat GD, tr.18 (DHQG, tr.14)",
        "source": "Atlat GD, tr.18 (DHQG, tr.14)",
        "title": "Cơ cấu GDP phân theo khu vực kinh tế Việt Nam (2010 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện sự chuyển dịch cơ cấu GDP phân theo khu vực kinh tế nước ta giai đoạn 2010 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["chuyển dịch cơ cấu", "giai đoạn 2010 - 2024 (4 năm)", "tổng 100%"],
        "data_table": {
            "headers": ["Năm", "2010", "2015", "2020", "2024"],
            "rows": [
                {"name": "Nông, lâm, thủy sản", "unit": "%", "values": [18.9, 17.0, 14.8, 11.8]},
                {"name": "Công nghiệp và xây dựng", "unit": "%", "values": [38.2, 36.7, 33.7, 37.6]},
                {"name": "Dịch vụ", "unit": "%", "values": [42.9, 46.3, 51.5, 50.6]}
            ]
        },
        "optimal_chart": "stacked_area",
        "optimal_chart_name": "Biểu đồ miền (Stacked Area)",
        "pedagogical_explanation": "Bảng số liệu thể hiện 'chuyển dịch cơ cấu' qua chuỗi thời gian 4 mốc năm (≥ 4 năm) với đơn vị tính là % và tổng các cột luôn bằng 100%. Biểu đồ miền là lựa chọn chính xác tuyệt đối.",
        "counter_factual": {
            "pie": "Sai lầm: Biểu đồ tròn chỉ dùng khi có từ 1 đến 3 mốc năm (≤ 3 năm). Ở đây có 4 mốc năm.",
            "line": "Sai lầm: Biểu đồ đường dùng cho 'tốc độ tăng trưởng', không thể hiện trực quan cơ cấu 100%."
        }
    },
    {
        "id": "ATLAT_CHART_02",
        "atlat_page": "Atlat GD, tr.18 (DHQG, tr.14)",
        "source": "Atlat GD, tr.18 (DHQG, tr.14)",
        "title": "Quy mô GDP và Tốc độ tăng trưởng GDP Việt Nam (2010 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện quy mô GDP và tốc độ tăng trưởng GDP nước ta giai đoạn 2010 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["quy mô và tốc độ tăng", "hai đơn vị tính (nghìn tỉ đồng và %)", "kết hợp"],
        "data_table": {
            "headers": ["Năm", "2010", "2015", "2020", "2024"],
            "rows": [
                {"name": "Quy mô GDP (Giá hiện hành)", "unit": "Nghìn tỉ đồng", "values": [2158.0, 4193.0, 6293.0, 10220.0]},
                {"name": "Tốc độ tăng trưởng GDP", "unit": "%", "values": [6.42, 6.68, 2.91, 7.05]}
            ]
        },
        "optimal_chart": "combo_bar_line",
        "optimal_chart_name": "Biểu đồ kết hợp (Cột và Đường)",
        "pedagogical_explanation": "Bảng số liệu có 2 đại lượng mang 2 đơn vị tính hoàn toàn khác nhau (Quy mô: Nghìn tỉ đồng - vẽ Cột; Tốc độ tăng: % - vẽ Đường). Cần 2 trục tung để thể hiện.",
        "counter_factual": {
            "pie": "Sai lầm: Khác đơn vị đo lường, không thể vẽ hình tròn.",
            "bar_single": "Sai lầm: Không thể gộp nghìn tỉ đồng và % vào 1 trục tung duy nhất."
        }
    },
    {
        "id": "ATLAT_CHART_03",
        "atlat_page": "Atlat GD, tr.19 (DHQG, tr.15)",
        "source": "Atlat GD, tr.19 (DHQG, tr.15)",
        "title": "Quy mô và Cơ cấu giá trị sản xuất Nông - Lâm - Thủy sản năm 2010 và 2024",
        "raw_prompt": "Theo bảng số liệu, để thể hiện quy mô và cơ cấu giá trị sản xuất nông, lâm, thủy sản nước ta năm 2010 và 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["quy mô và cơ cấu", "2 năm (2010 và 2024)", "bán kính khác nhau"],
        "data_table": {
            "headers": ["Năm", "2010", "2024"],
            "rows": [
                {"name": "Nông nghiệp", "unit": "Nghìn tỉ đồng", "values": [540.1, 1085.6]},
                {"name": "Lâm nghiệp", "unit": "Nghìn tỉ đồng", "values": [24.3, 76.8]},
                {"name": "Thủy sản", "unit": "Nghìn tỉ đồng", "values": [165.2, 428.5]}
            ]
        },
        "optimal_chart": "pie",
        "optimal_chart_name": "Biểu đồ tròn (Pie Chart - Bán kính khác nhau)",
        "pedagogical_explanation": "Yêu cầu thể hiện 'quy mô và cơ cấu' trong 2 mốc năm. Vẽ 2 biểu đồ tròn với bán kính năm 2024 lớn hơn năm 2010 (R2024 > R2010) tương ứng với quy mô tổng số.",
        "counter_factual": {
            "stacked_area": "Sai lầm: Biểu đồ miền yêu cầu chuỗi thời gian từ 4 năm trở lên.",
            "line": "Sai lầm: Không thể hiện được cơ cấu bộ phận của một tổng thể."
        }
    },
    {
        "id": "ATLAT_CHART_04",
        "atlat_page": "Atlat GD, tr.26 (DHQG, tr.21)",
        "source": "Atlat GD, tr.26 (DHQG, tr.21)",
        "title": "Trị giá xuất khẩu và nhập khẩu hàng hóa nước ta (2010 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để so sánh trị giá xuất khẩu và nhập khẩu hàng hóa nước ta giai đoạn 2010 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["so sánh xuất khẩu và nhập khẩu", "cùng đơn vị (tỉ USD)", "cột ghép"],
        "data_table": {
            "headers": ["Năm", "2010", "2015", "2020", "2024"],
            "rows": [
                {"name": "Xuất khẩu", "unit": "Tỉ USD", "values": [72.2, 162.0, 281.4, 395.0]},
                {"name": "Nhập khẩu", "unit": "Tỉ USD", "values": [84.8, 165.8, 261.3, 368.0]}
            ]
        },
        "optimal_chart": "bar_grouped",
        "optimal_chart_name": "Biểu đồ cột ghép (Grouped Bar)",
        "pedagogical_explanation": "So sánh 2 đại lượng Xuất khẩu và Nhập khẩu cùng chung đơn vị tính (tỉ USD) qua 4 mốc năm. Biểu đồ cột ghép đặt cạnh nhau là dạng biểu đồ trực quan nhất.",
        "counter_factual": {
            "pie": "Sai lầm: 4 mốc năm không vẽ tròn. Không có yêu cầu cơ cấu 100%.",
            "stacked_area": "Sai lầm: Xuất khẩu và Nhập khẩu không phải là các thành phần cộng lại bằng 100%."
        }
    },
    {
        "id": "ATLAT_CHART_05",
        "atlat_page": "Atlat GD, tr.23 (DHQG, tr.19)",
        "source": "Atlat GD, tr.23 (DHQG, tr.19)",
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
    {
        "id": "ATLAT_CHART_06",
        "atlat_page": "Atlat GD, tr.17 (DHQG, tr.13)",
        "source": "Atlat GD, tr.17 (DHQG, tr.13)",
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
    {
        "id": "ATLAT_CHART_07",
        "atlat_page": "Atlat GD, tr.19 (DHQG, tr.15)",
        "source": "Atlat GD, tr.19 (DHQG, tr.15)",
        "title": "Diện tích và sản lượng lúa cả năm của Việt Nam (2015 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện diện tích và sản lượng lúa cả năm của nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["diện tích và sản lượng", "khác đơn vị (nghìn ha và triệu tấn)", "kết hợp"],
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2022", "2024"],
            "rows": [
                {"name": "Diện tích lúa", "unit": "Nghìn ha", "values": [7828.0, 7570.4, 7279.0, 7109.0, 7120.0]},
                {"name": "Sản lượng lúa", "unit": "Triệu tấn", "values": [45.1, 44.0, 42.8, 42.7, 43.5]}
            ]
        },
        "optimal_chart": "combo_bar_line",
        "optimal_chart_name": "Biểu đồ kết hợp (Cột và Đường)",
        "pedagogical_explanation": "Diện tích (nghìn ha - vẽ Cột) và Sản lượng (triệu tấn - vẽ Đường) mang 2 đơn vị tính khác nhau. Bắt buộc vẽ biểu đồ kết hợp cột và đường với 2 trục tung.",
        "counter_factual": {
            "bar_single": "Sai lầm: Không thể gộp nghìn ha và triệu tấn vào cùng một trục số.",
            "pie": "Sai lầm: Chuỗi 5 năm và hai đại lượng khác đơn vị đo lường."
        }
    },
    {
        "id": "ATLAT_CHART_08",
        "atlat_page": "Atlat GD, tr.22 (DHQG, tr.18)",
        "source": "Atlat GD, tr.22 (DHQG, tr.18)",
        "title": "Giá trị sản xuất công nghiệp phân theo 6 Vùng Kinh tế - Xã hội năm 2024",
        "raw_prompt": "Theo bảng số liệu, để so sánh giá trị sản xuất công nghiệp giữa 6 Vùng Kinh tế - Xã hội nước ta năm 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["so sánh giữa các vùng", "năm 2024 duy nhất", "tên vùng dài"],
        "data_table": {
            "headers": ["Vùng Kinh tế - Xã hội", "Giá trị sản xuất (Nghìn tỉ đồng)"],
            "rows": [
                {"name": "Đông Nam Bộ", "unit": "Nghìn tỉ đồng", "values": [2850.5]},
                {"name": "Đồng bằng sông Hồng", "unit": "Nghìn tỉ đồng", "values": [2640.2]},
                {"name": "Bắc Trung Bộ và Duyên hải miền Trung", "unit": "Nghìn tỉ đồng", "values": [890.4]},
                {"name": "Đồng bằng sông Cửu Long", "unit": "Nghìn tỉ đồng", "values": [720.6]},
                {"name": "Trung du và miền núi Bắc Bộ", "unit": "Nghìn tỉ đồng", "values": [680.1]},
                {"name": "Tây Nguyên", "unit": "Nghìn tỉ đồng", "values": [165.8]}
            ]
        },
        "optimal_chart": "bar_horizontal",
        "optimal_chart_name": "Biểu đồ thanh ngang (Horizontal Bar)",
        "pedagogical_explanation": "So sánh quy mô một chỉ tiêu kinh tế giữa các vùng hành chính có tên địa danh dài tại một mốc thời gian. Biểu đồ thanh ngang giúp nhãn chữ nằm ngang rõ ràng không bị đè chữ.",
        "counter_factual": {
            "line": "Sai lầm: Các vùng độc lập không tạo thành chuỗi thời gian liên tục.",
            "stacked_area": "Sai lầm: 1 năm duy nhất không thể vẽ biểu đồ miền."
        }
    },
    {
        "id": "ATLAT_CHART_09",
        "atlat_page": "Atlat GD, tr.23 (DHQG, tr.19)",
        "source": "Atlat GD, tr.23 (DHQG, tr.19)",
        "title": "Sản lượng điện phát ra của nước ta qua các năm (2015 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện tình hình phát triển sản lượng điện phát ra của nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["tình hình phát triển", "1 đại lượng duy nhất", "cột đơn"],
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2022", "2024"],
            "rows": [
                {"name": "Sản lượng điện", "unit": "Tỉ kWh", "values": [159.4, 212.9, 235.4, 259.6, 275.9]}
            ]
        },
        "optimal_chart": "bar_single",
        "optimal_chart_name": "Biểu đồ cột đơn (Single Bar)",
        "pedagogical_explanation": "Đề bài yêu cầu thể hiện quy mô, tình hình phát triển của một đối tượng duy nhất (sản lượng điện - tỉ kWh) qua các năm. Biểu đồ cột đơn là phù hợp nhất.",
        "counter_factual": {
            "pie": "Sai lầm: Có 5 mốc năm và không có cơ cấu các nguồn điện thành phần.",
            "bar_grouped": "Thừa thãi: Chỉ có 1 đối tượng duy nhất nên không dùng cột ghép."
        }
    },
    {
        "id": "ATLAT_CHART_10",
        "atlat_page": "Atlat GD, tr.26 (DHQG, tr.21)",
        "source": "Atlat GD, tr.26 (DHQG, tr.21)",
        "title": "Cơ cấu thị trường xuất khẩu hàng hóa Việt Nam năm 2024",
        "raw_prompt": "Theo bảng số liệu, để thể hiện cơ cấu thị trường xuất khẩu hàng hóa của nước ta năm 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["cơ cấu thị trường", "năm 2024 duy nhất", "tổng cộng 100%"],
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
        "pedagogical_explanation": "Yêu cầu 'cơ cấu thị trường' trong duy nhất 1 mốc năm 2024 với tổng tỉ trọng bằng 100%. Biểu đồ tròn là lựa chọn tiêu chuẩn.",
        "counter_factual": {
            "stacked_area": "Sai lầm: Biểu đồ miền cần ít nhất 4 năm.",
            "line": "Sai lầm: Các thị trường là đối tượng phân loại không gian, không có trục thời gian."
        }
    },
    {
        "id": "ATLAT_CHART_11",
        "atlat_page": "Atlat GD, tr.21 (DHQG, tr.17)",
        "source": "Atlat GD, tr.21 (DHQG, tr.17)",
        "title": "Sản lượng thủy sản khai thác và nuôi trồng nước ta (2015 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để so sánh sản lượng thủy sản khai thác và nuôi trồng nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["so sánh khai thác và nuôi trồng", "cùng đơn vị (nghìn tấn)", "cột ghép"],
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2022", "2024"],
            "rows": [
                {"name": "Nuôi trồng", "unit": "Nghìn tấn", "values": [3512.4, 4153.8, 4625.3, 5139.8, 5450.0]},
                {"name": "Khai thác", "unit": "Nghìn tấn", "values": [3049.9, 3600.3, 3850.7, 3960.2, 3980.0]}
            ]
        },
        "optimal_chart": "bar_grouped",
        "optimal_chart_name": "Biểu đồ cột ghép (Grouped Bar)",
        "pedagogical_explanation": "So sánh 2 ngành Khai thác và Nuôi trồng có cùng đơn vị tính (nghìn tấn) qua các năm. Biểu đồ cột ghép phản ánh trực quan sự bứt phá của ngành nuôi trồng.",
        "counter_factual": {
            "pie": "Sai lầm: Chuỗi 5 năm không vẽ tròn.",
            "combo_bar_line": "Không phù hợp: Cùng 1 đơn vị tính (nghìn tấn) thì không cần 2 trục tung."
        }
    },
    {
        "id": "ATLAT_CHART_12",
        "atlat_page": "Atlat GD, tr.20 (DHQG, tr.16)",
        "source": "Atlat GD, tr.20 (DHQG, tr.16)",
        "title": "Chuyển dịch cơ cấu diện tích cây công nghiệp nước ta (2010 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện sự chuyển dịch cơ cấu diện tích cây công nghiệp phân theo hàng năm và lâu năm nước ta giai đoạn 2010 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["chuyển dịch cơ cấu diện tích", "giai đoạn 2010 - 2024", "biểu đồ miền"],
        "data_table": {
            "headers": ["Năm", "2010", "2015", "2020", "2024"],
            "rows": [
                {"name": "Cây công nghiệp lâu năm", "unit": "%", "values": [72.4, 75.8, 79.2, 81.5]},
                {"name": "Cây công nghiệp hàng năm", "unit": "%", "values": [27.6, 24.2, 20.8, 18.5]}
            ]
        },
        "optimal_chart": "stacked_area",
        "optimal_chart_name": "Biểu đồ miền (Stacked Area)",
        "pedagogical_explanation": "Cơ cấu diện tích 2 nhóm cây cộng lại bằng 100% biến thiên qua 4 mốc năm. Biểu đồ miền thể hiện rõ xu thế tăng nhanh của cây lâu năm (cà phê, cao su, chè).",
        "counter_factual": {
            "pie": "Sai lầm: 4 năm vượt quá giới hạn vẽ tròn.",
            "line": "Không tối ưu: Không làm nổi bật được tỷ trọng đóng góp của 2 nhóm cây trong diện tích chung."
        }
    },
    {
        "id": "ATLAT_CHART_13",
        "atlat_page": "Atlat GD, tr.23 (DHQG, tr.19)",
        "source": "Atlat GD, tr.23 (DHQG, tr.19)",
        "title": "Sản lượng dầu thô khai thác của nước ta giai đoạn 2015 - 2024",
        "raw_prompt": "Theo bảng số liệu, để thể hiện diễn biến sản lượng dầu thô khai thác nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["diễn biến sản lượng", "1 chỉ tiêu duy nhất", "cột đơn"],
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2022", "2024"],
            "rows": [
                {"name": "Dầu thô khai thác", "unit": "Triệu tấn", "values": [18.7, 14.0, 9.7, 8.9, 8.2]}
            ]
        },
        "optimal_chart": "bar_single",
        "optimal_chart_name": "Biểu đồ cột đơn (Single Bar)",
        "pedagogical_explanation": "Thể hiện diễn biến giảm dần của sản lượng dầu thô khai thác (1 đối tượng duy nhất) qua các năm. Biểu đồ cột đơn là phù hợp nhất.",
        "counter_factual": {
            "pie": "Sai lầm: 5 mốc thời gian không vẽ tròn.",
            "combo_bar_line": "Không phù hợp: Chỉ có 1 đối tượng nghiên cứu duy nhất."
        }
    },
    {
        "id": "ATLAT_CHART_14",
        "atlat_page": "Atlat GD, tr.26 (DHQG, tr.21)",
        "source": "Atlat GD, tr.26 (DHQG, tr.21)",
        "title": "Cán cân thương mại hàng hóa nước ta giai đoạn 2015 - 2024",
        "raw_prompt": "Theo bảng số liệu, để thể hiện cán cân thương mại hàng hóa của nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["cán cân thương mại", "thặng dư / thâm hụt (có giá trị âm/dương)", "cột"],
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2022", "2024"],
            "rows": [
                {"name": "Cán cân thương mại", "unit": "Tỉ USD", "values": [-3.8, 6.8, 19.9, 12.4, 27.0]}
            ]
        },
        "optimal_chart": "bar_single",
        "optimal_chart_name": "Biểu đồ cột (Single Bar - Trục đối xứng 0)",
        "pedagogical_explanation": "Cán cân thương mại có giá trị âm (nhập siêu năm 2015) và giá trị dương (xuất siêu các năm sau). Biểu đồ cột có trục số 0 đối xứng là chuẩn mực nhất.",
        "counter_factual": {
            "pie": "Sai lầm: Số liệu có giá trị âm không thể vẽ biểu đồ tròn.",
            "stacked_area": "Sai lầm: Số liệu âm không thể xếp chồng miền."
        }
    },
    {
        "id": "ATLAT_CHART_15",
        "atlat_page": "Atlat GD, tr.23 (DHQG, tr.19)",
        "source": "Atlat GD, tr.23 (DHQG, tr.19)",
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
        "optimal_chart": "bar_horizontal",
        "optimal_chart_name": "Biểu đồ thanh ngang (Horizontal Bar)",
        "pedagogical_explanation": "So sánh 1 chỉ tiêu duy nhất (công suất MW) giữa các nhà máy độc lập có tên riêng dài. Biểu đồ thanh ngang là tối ưu nhất.",
        "counter_factual": {
            "line": "Sai lầm: Các nhà máy độc lập không liên tục theo thời gian.",
            "pie": "Không tối ưu: Khó so sánh độ chênh lệch công suất chính xác như thanh ngang."
        }
    }
]

# 5. 6 Bài tập Tiêu biểu trích xuất trực tiếp từ tệp chuẩn "biểu đồ.docx"
DOCX_QUESTIONS = [
    {
        "id": "DOCX_CHART_01",
        "atlat_page": "Atlat GD, tr.27 & biểu đồ.docx (Mục 1)",
        "source": "biểu đồ.docx, Mục 1; Atlat GD, tr.27",
        "title": "Cơ cấu doanh thu du lịch lữ hành phân theo thành phần kinh tế nước ta năm 2010 và 2016",
        "raw_prompt": "Theo bảng số liệu, để thể hiện cơ cấu doanh thu du lịch lữ hành phân theo thành phần kinh tế của nước ta năm 2010 và 2016 (%), dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["cơ cấu", "tỷ trọng", "năm 2010 và 2016 (2 năm)", "tổng = 100%"],
        "data_table": {
            "headers": ["Thành phần kinh tế", "Năm 2010", "Năm 2016"],
            "rows": [
                {"name": "Kinh tế Nhà nước", "unit": "%", "values": [51.8, 36.2]},
                {"name": "Kinh tế ngoài Nhà nước", "unit": "%", "values": [45.3, 59.6]},
                {"name": "Khu vực có vốn đầu tư nước ngoài", "unit": "%", "values": [2.9, 4.2]}
            ]
        },
        "optimal_chart": "pie",
        "optimal_chart_name": "Biểu đồ tròn (Pie Chart)",
        "pedagogical_explanation": "Theo quy tắc Mục 1 tệp biểu đồ.docx: Khi đề bài yêu cầu thể hiện 'cơ cấu, tỷ trọng' mà mốc thời gian chỉ từ 1-2 năm với tổng các thành phần bằng 100%, biểu đồ Tròn là lựa chọn chuẩn mực nhất.",
        "counter_factual": {
            "stacked_area": "Sai lầm quy tắc: Biểu đồ miền yêu cầu chuỗi thời gian từ 3-4 năm trở lên. Chỉ có 2 mốc năm (2010 và 2016) tuyệt đối không vẽ biểu đồ miền.",
            "line": "Sai lầm quy tắc: Biểu đồ đường dùng để thể hiện tốc độ tăng trưởng, không phản ánh được cấu trúc 100% của một tổng thể.",
            "bar": "Không tối ưu: Biểu đồ cột không thể hiện trực quan các múi quạt tỷ trọng thành phần trong 100% như hình tròn."
        }
    },
    {
        "id": "DOCX_CHART_02",
        "atlat_page": "Atlat GD, tr.18 & biểu đồ.docx (Mục 2)",
        "source": "biểu đồ.docx, Mục 2; Atlat GD, tr.18",
        "title": "Tốc độ tăng trưởng GDP của Phi-líp-pin, Thái Lan và Việt Nam giai đoạn 2010 – 2016",
        "raw_prompt": "Theo bảng số liệu, để thể hiện sự thay đổi, phát triển, tốc độ tăng trưởng GDP của Phi líp pin, Thái Lan và Việt Nam giai đoạn 2010 – 2016, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["tốc độ tăng trưởng", "sự thay đổi", "phát triển", "năm gốc 2010 = 100%", "biểu đồ đường"],
        "data_table": {
            "headers": ["Năm", "2010", "2012", "2014", "2016"],
            "rows": [
                {"name": "Phi-líp-pin", "unit": "%", "values": [100.0, 114.2, 128.6, 146.5]},
                {"name": "Thái Lan", "unit": "%", "values": [100.0, 107.5, 111.8, 120.4]},
                {"name": "Việt Nam", "unit": "%", "values": [100.0, 112.8, 126.4, 144.2]}
            ]
        },
        "optimal_chart": "line",
        "optimal_chart_name": "Biểu đồ đường (Line Chart)",
        "pedagogical_explanation": "Theo quy tắc Mục 2 tệp biểu đồ.docx: Khi đề bài yêu cầu thể hiện 'sự thay đổi, phát triển, tốc độ tăng trưởng, diễn biến' của các đối tượng qua nhiều năm (năm gốc = 100%), biểu đồ Đường là lựa chọn chuẩn xác nhất.",
        "counter_factual": {
            "pie": "Sai lầm quy tắc: Chuỗi thời gian 4 năm không vẽ tròn. Không có tổng cơ cấu 100%.",
            "bar_stacked": "Sai lầm quy tắc: Các chỉ số tăng trưởng độc lập của 3 quốc gia không thể chồng lên nhau tạo thành tổng thể."
        }
    },
    {
        "id": "DOCX_CHART_03",
        "atlat_page": "Atlat GD, tr.23 & biểu đồ.docx (Mục 3)",
        "source": "biểu đồ.docx, Mục 3; Atlat GD, tr.23",
        "title": "So sánh sản lượng điện của một số địa phương nước ta qua các năm",
        "raw_prompt": "Theo bảng số liệu, để thể hiện sự biến động hoặc so sánh sản lượng điện của một số địa phương qua các năm (cùng đơn vị tỉ kWh), dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["biến động qua nhiều năm", "so sánh các đối tượng cùng đơn vị", "cột ghép"],
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2024"],
            "rows": [
                {"name": "Sơn La", "unit": "Tỉ kWh", "values": [9.5, 10.2, 11.5, 12.8]},
                {"name": "Quảng Ninh", "unit": "Tỉ kWh", "values": [8.2, 9.6, 10.8, 12.0]},
                {"name": "Bà Rịa - Vũng Tàu", "unit": "Tỉ kWh", "values": [12.4, 13.8, 14.5, 15.2]}
            ]
        },
        "optimal_chart": "bar",
        "optimal_chart_name": "Biểu đồ cột (Bar Chart)",
        "pedagogical_explanation": "Theo quy tắc Mục 3 tệp biểu đồ.docx: Khi đề bài yêu cầu thể hiện 'sự biến động của một đối tượng qua nhiều năm hoặc so sánh các đối tượng khi có cùng đơn vị trong một năm', biểu đồ Cột (cột ghép) là dạng thích hợp nhất.",
        "counter_factual": {
            "pie": "Sai lầm quy tắc: Chuỗi 4 mốc năm không vẽ tròn, bảng số liệu không phải là các thành phần cơ cấu 100%.",
            "combo_bar_line": "Sai lầm quy tắc: Các địa phương có cùng chung 1 đơn vị tính (tỉ kWh) nên không cần dùng biểu đồ kết hợp 2 trục tung."
        }
    },
    {
        "id": "DOCX_CHART_04",
        "atlat_page": "Atlat GD, tr.26 & biểu đồ.docx (Mục 4)",
        "source": "biểu đồ.docx, Mục 4; Atlat GD, tr.26",
        "title": "Sự thay đổi cơ cấu trị giá xuất khẩu và nhập khẩu hàng hóa nước ta (2010 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện rõ nhất sự thay đổi cơ cấu, tỉ trọng xuất khẩu và nhập khẩu của nước ta giai đoạn 2010 - 2024 (từ 3 năm trở lên), dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["thay đổi cơ cấu", "tỉ trọng của hai nhóm đối tượng", "từ 3 năm trở lên", "tổng = 100%"],
        "data_table": {
            "headers": ["Năm", "2010", "2015", "2020", "2024"],
            "rows": [
                {"name": "Tỉ trọng Xuất khẩu", "unit": "%", "values": [46.0, 49.4, 51.8, 51.8]},
                {"name": "Tỉ trọng Nhập khẩu", "unit": "%", "values": [54.0, 50.6, 48.2, 48.2]}
            ]
        },
        "optimal_chart": "stacked_area",
        "optimal_chart_name": "Biểu đồ miền (Stacked Area)",
        "pedagogical_explanation": "Theo quy tắc Mục 4 tệp biểu đồ.docx: Khi đề bài yêu cầu thể hiện rõ nhất 'sự thay đổi cơ cấu, tỉ trọng của hai hoặc ba nhóm đối tượng mà có từ 3 năm trở lên' (ở đây có 4 năm: 2010, 2015, 2020, 2024), biểu đồ Miền là lựa chọn chính xác tuyệt đối.",
        "counter_factual": {
            "pie": "Sai lầm quy tắc: Chuỗi 4 mốc thời gian không vẽ tròn vì phải vẽ tới 4 hình tròn gây rối mắt và không thấy được sự biến chuyển liên tục.",
            "line": "Không tối ưu: Biểu đồ đường không thể hiện được tính bù trừ khép kín 100% của 2 thành phần xuất và nhập."
        }
    },
    {
        "id": "DOCX_CHART_05",
        "atlat_page": "Atlat GD, tr.21 & biểu đồ.docx (Mục 5)",
        "source": "biểu đồ.docx, Mục 5; Atlat GD, tr.21",
        "title": "Sản lượng và Giá trị sản xuất thủy sản của Việt Nam giai đoạn 2015 - 2024",
        "raw_prompt": "Theo bảng số liệu, để thể hiện sản lượng thủy sản (nghìn tấn) và giá trị sản xuất thủy sản (nghìn tỉ đồng) của nước ta giai đoạn 2015 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["khác nhau về đơn vị nhưng có mối quan hệ", "sản lượng và giá trị", "kết hợp"],
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2022", "2024"],
            "rows": [
                {"name": "Sản lượng thủy sản", "unit": "Nghìn tấn", "values": [6562.3, 7754.1, 8476.0, 9100.0, 9430.0]},
                {"name": "Giá trị sản xuất thủy sản", "unit": "Nghìn tỉ đồng", "values": [198.5, 265.4, 312.8, 385.0, 428.5]}
            ]
        },
        "optimal_chart": "combo_bar_line",
        "optimal_chart_name": "Biểu đồ kết hợp cột và đường (Combo Bar & Line)",
        "pedagogical_explanation": "Theo quy tắc Mục 5 tệp biểu đồ.docx: Biểu đồ kết hợp giữa đường và cột dùng khi đề bài yêu cầu thể hiện 'các đối tượng khác nhau về đơn vị nhưng có mối quan hệ với nhau' (Sản lượng: nghìn tấn vẽ Cột, Giá trị: nghìn tỉ đồng vẽ Đường) với 2 trục tung.",
        "counter_factual": {
            "bar": "Sai lầm quy tắc: Không thể gộp nghìn tấn và nghìn tỉ đồng vào 1 trục tung đơn lẻ.",
            "pie": "Sai lầm quy tắc: Chuỗi 5 năm và khác đơn vị đo lường nên tuyệt đối không vẽ hình tròn."
        }
    },
    {
        "id": "DOCX_CHART_06",
        "atlat_page": "Atlat GD, tr.22 & biểu đồ.docx (Mục 6)",
        "source": "biểu đồ.docx, Mục 6; Atlat GD, tr.22",
        "title": "Quy mô và cơ cấu giá trị sản xuất công nghiệp theo nhóm ngành của nước ta (2015 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện tốt nhất quy mô và cơ cấu giá trị sản xuất công nghiệp phân theo nhóm ngành nước ta giai đoạn 2015 - 2024 (theo tỉ lệ % tuyệt đối), dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["quy mô và cơ cấu", "theo tỉ lệ % tuyệt đối", "cột chồng"],
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2024"],
            "rows": [
                {"name": "Công nghiệp chế biến, chế tạo", "unit": "Nghìn tỉ đồng", "values": [1250.0, 1850.0, 2450.0, 3650.0]},
                {"name": "Công nghiệp sản xuất, phân phối điện, khí", "unit": "Nghìn tỉ đồng", "values": [180.0, 260.0, 340.0, 480.0]},
                {"name": "Công nghiệp khai khoáng", "unit": "Nghìn tỉ đồng", "values": [220.0, 240.0, 230.0, 210.0]}
            ]
        },
        "optimal_chart": "bar_stacked",
        "optimal_chart_name": "Biểu đồ cột chồng (Stacked Bar)",
        "pedagogical_explanation": "Theo quy tắc Mục 6 tệp biểu đồ.docx: Khi đề bài yêu cầu thể hiện tốt nhất 'quy mô và cơ cấu của đối tượng (theo tỉ lệ % tuyệt đối)', biểu đồ Cột Chồng phản ánh được cả độ cao tổng thể và cấu trúc bộ phận.",
        "counter_factual": {
            "pie": "Sai lầm quy tắc: Chuỗi 4 năm không nên vẽ nhiều hình tròn gây rối mắt.",
            "line": "Không tối ưu: Không thấy rõ tổng quy mô giá trị bằng hình học cột chồng."
        }
    }
]

# 6. Toàn bộ 6 Quy tắc Vàng Nhận dạng Biểu đồ trích nguyên văn từ "biểu đồ.docx"
KEYWORD_GUIDE_6 = [
    {
        "chart_type": "pie",
        "chart_name": "1. Biểu đồ Tròn (Pie Chart)",
        "time_rule": "Mốc thời gian chỉ từ 1 - 2 năm (tối đa ≤ 3 năm)",
        "golden_keywords": ["cơ cấu", "tỷ trọng", "tỷ lệ", "kết cấu", "quy mô và cơ cấu (1-2 năm)"],
        "typical_units": ["% (tổng các thành phần luôn bằng 100%)"],
        "critical_traps": "Không vẽ biểu đồ Tròn khi chuỗi thời gian từ 4 năm trở lên (phải chuyển sang Biểu đồ Miền). Không vẽ tròn khi số liệu có giá trị âm.",
        "example_prompt": "Cơ cấu doanh thu du lịch lữ hành phân theo thành phần kinh tế của nước ta năm 2010 và 2016 (%) (Trích biểu đồ.docx)"
    },
    {
        "chart_type": "line",
        "chart_name": "2. Biểu đồ Đường (Line Chart)",
        "time_rule": "Chuỗi thời gian liên tục qua nhiều năm (≥ 3 - 4 năm)",
        "golden_keywords": ["tốc độ tăng trưởng", "tốc độ phát triển", "sự thay đổi", "phát triển", "diễn biến"],
        "typical_units": ["% (năm gốc = 100%)", "đại lượng liên tục qua thời gian"],
        "critical_traps": "Không vẽ biểu đồ Đường cho các đối tượng độc lập phân theo không gian (các tỉnh, các nước trong 1 năm tĩnh). Chỉ vẽ khi có chuỗi thời gian liên tục.",
        "example_prompt": "GDP của Phi líp pin, Thái Lan và Việt Nam giai đoạn 2010 – 2016 (Trích biểu đồ.docx)"
    },
    {
        "chart_type": "bar",
        "chart_name": "3. Biểu đồ Cột Đơn/Ghép (Bar Chart)",
        "time_rule": "1 năm hoặc nhiều năm (so sánh theo không gian/thời gian)",
        "golden_keywords": ["sự biến động của một đối tượng qua nhiều năm", "so sánh các đối tượng khi có cùng đơn vị trong một năm", "tình hình phát triển", "khối lượng"],
        "typical_units": ["Cùng 1 đơn vị tính (Triệu tấn, Tỉ kWh, Nghìn ha...)"],
        "critical_traps": "Không vẽ biểu đồ Cột khi các đại lượng khác nhau về đơn vị đo lường trên cùng một trục tung. Nếu tên đối tượng dài, ưu tiên biểu đồ Thanh Ngang.",
        "example_prompt": "So sánh dân số, diện tích của 1 số tỉnh; So sánh sản lượng điện của 1 địa phương qua các năm (Trích biểu đồ.docx)"
    },
    {
        "chart_type": "stacked_area",
        "chart_name": "4. Biểu đồ Miền (Stacked Area)",
        "time_rule": "Chuỗi thời gian từ 3 năm trở lên (thường ≥ 4 năm)",
        "golden_keywords": ["thay đổi cơ cấu", "chuyển dịch cơ cấu", "tỉ trọng của hai hoặc ba nhóm đối tượng từ 3 năm trở lên"],
        "typical_units": ["% (tổng các miền chồng luôn bằng 100%)"],
        "critical_traps": "Không vẽ biểu đồ Miền khi chỉ có 1-2 mốc năm (phải vẽ Tròn). Không vẽ miền khi số liệu có giá trị âm hoặc tổng các bộ phận không bằng 100%.",
        "example_prompt": "Tỷ lệ xuất và nhập khẩu; Cán cân xuất nhập khẩu; Cơ cấu GDP phân theo khu vực kinh tế (Trích biểu đồ.docx)"
    },
    {
        "chart_type": "combo_bar_line",
        "chart_name": "5. Biểu đồ Kết Hợp Cột + Đường (Combo)",
        "time_rule": "Chuỗi thời gian từ 3 năm trở lên",
        "golden_keywords": ["khác nhau về đơn vị nhưng có mối quan hệ với nhau", "quy mô và tốc độ tăng trưởng", "diện tích và sản lượng", "từ ba loại số liệu trở lên"],
        "typical_units": ["2 loại đơn vị đo lường khác nhau (ví dụ: Nghìn ha và Triệu tấn, Tỉ USD và %)"],
        "critical_traps": "Bắt buộc có 2 trục tung (trục trái và trục phải). Nếu các đại lượng có cùng một đơn vị tính thì KHÔNG được vẽ kết hợp 2 trục.",
        "example_prompt": "Thể hiện sản lượng khai thác, nuôi trồng và giá trị sản xuất của Việt Nam (Trích biểu đồ.docx)"
    },
    {
        "chart_type": "bar_stacked",
        "chart_name": "6. Biểu đồ Cột Chồng (Stacked Bar)",
        "time_rule": "Từ 2 đến nhiều năm",
        "golden_keywords": ["quy mô và cơ cấu của đối tượng (theo tỉ lệ % tuyệt đối)", "thành phần cấu thành tổng thể"],
        "typical_units": ["Cùng 1 đơn vị tính (Triệu người, Nghìn tấn hoặc %)"],
        "critical_traps": "Các thành phần xếp chồng bắt buộc phải cộng dồn lại đúng bằng tổng số (hoặc bằng 100%). Không xếp chồng các đại lượng độc lập không cùng một chỉnh thể.",
        "example_prompt": "Dân số thành thị và nông thôn nước ta (cộng lại bằng tổng dân số cả nước) (Trích biểu đồ.docx)"
    }
]

ALL_CHART_QUESTIONS = DOCX_QUESTIONS + CHART_EXERCISES_15

def main():
    print("[*] Generating Master Atlat 2026 Embedded Dataset...")

    # Load existing clean GeoJSONs
    with open(os.path.join(DATA_DIR, "vn_provinces_34.geojson"), "r", encoding="utf-8") as f:
        geo_34 = json.load(f)

    with open(os.path.join(DATA_DIR, "vn_provinces_63.geojson"), "r", encoding="utf-8") as f:
        geo_63 = json.load(f)

    with open(os.path.join(DATA_DIR, "topography_rivers.geojson"), "r", encoding="utf-8") as f:
        geo_topography = json.load(f)

    with open(os.path.join(DATA_DIR, "climate_hydro.geojson"), "r", encoding="utf-8") as f:
        geo_climate = json.load(f)

    with open(os.path.join(DATA_DIR, "agriculture_fishery.geojson"), "r", encoding="utf-8") as f:
        geo_agriculture = json.load(f)

    with open(os.path.join(DATA_DIR, "minerals.geojson"), "r", encoding="utf-8") as f:
        geo_minerals = json.load(f)

    with open(os.path.join(DATA_DIR, "hydropower.geojson"), "r", encoding="utf-8") as f:
        geo_power = json.load(f)

    with open(os.path.join(DATA_DIR, "industrial_centers.geojson"), "r", encoding="utf-8") as f:
        geo_industrial = json.load(f)

    # 1. Update 34 provinces properties with exact 2026 Atlat stats
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

    # 2. Build GeoJSON for Baseline Points A1 - A11
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
                "desc": bp["desc"]
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
            "name": "Đường cơ sở dùng để tính chiều rộng lãnh hải Việt Nam (Tuyên bố 12/11/1982)",
            "desc": "Đường cơ sở thẳng nối liền các điểm nhô ra ngoài cùng của các đảo và mũi đất ven bờ từ Hòn Nhạn (A1) đến Đảo Cồn Cỏ (A11)."
        },
        "geometry": {
            "type": "LineString",
            "coordinates": polyline_coords
        }
    })

    geo_baseline = {
        "type": "FeatureCollection",
        "metadata": {
            "title": "Đường cơ sở biển Việt Nam A1 - A11 (Tuyên bố 12/11/1982)",
            "standard": "Atlat Địa lí Việt Nam Trang 7 & 9"
        },
        "features": baseline_features
    }

    # 3. Build GeoJSON for Climate Stations
    climate_features = []
    # Retain climate boundary & storm lines from existing climate_hydro
    for feat in geo_climate["features"]:
        if feat["properties"].get("category") != "met_station":
            climate_features.append(feat)

    # Add 8 official stations
    for cs in CLIMATE_STATIONS:
        climate_features.append({
            "type": "Feature",
            "properties": {
                "category": "met_station",
                "name": cs["name"],
                "avg_temp": cs["avg_temp"],
                "max_temp": cs["max_temp"],
                "min_temp": cs["min_temp"],
                "temp_range": cs["temp_range"],
                "rainfall": cs["rainfall"],
                "climate_type": cs["climate_type"],
                "desc": cs["desc"]
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

    # 4. Enrich Chart Exercises with structural analysis
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

    # Complete Master Atlat 2026 object
    master_atlat_data = {
        "metadata": {
            "title": "Bộ Dữ Liệu Gốc Atlat Địa Lí Việt Nam 2026 (GDPT 2018)",
            "version": "2026.2.0",
            "published": "2026",
            "source": "2 Cuốn Atlat Địa lí Việt Nam mới nhất & NQ 202/2025/QH15 & biểu đồ.docx",
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

    # 1. Save to public/data/atlat_2026_master.json
    with open(MASTER_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(master_atlat_data, f, ensure_ascii=False, indent=2)
    print(f"[+] Successfully exported: {MASTER_JSON_PATH} ({os.path.getsize(MASTER_JSON_PATH) / 1024:.1f} KB)")

    # 2. Save directly as executable JS: js/atlat-data.js (window.ATLAT_DATA)
    js_content = f"/**\n * GeoAtlas Interactive - Master Atlat 2026 Embedded Dataset (GDPT 2018)\n * 100% Offline Static Data - Zero Network Latency - Zero CORS - Zero Scraping\n */\nwindow.ATLAT_DATA = {json.dumps(master_atlat_data, ensure_ascii=False)};\n"
    with open(ATLAT_DATA_JS_PATH, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(f"[+] Successfully exported: {ATLAT_DATA_JS_PATH} ({os.path.getsize(ATLAT_DATA_JS_PATH) / 1024:.1f} KB)")

    # 3. Update public/data/chart_questions.json with all 21 exercises + 6-rule keyword guide
    chart_bank = {
        "metadata": {
            "title": "Ngân hàng 21 Bài Tập Nhận Dạng Biểu Đồ Atlat Địa Lí 2026 & 6 Dạng Trọng Tâm biểu đồ.docx",
            "standard": "Chương trình GDPT 2018 & Định hướng Đề thi Tốt nghiệp THPT 2026",
            "total_questions": len(ALL_CHART_QUESTIONS)
        },
        "questions": ALL_CHART_QUESTIONS,
        "keyword_guide": KEYWORD_GUIDE_6
    }
    with open(os.path.join(DATA_DIR, "chart_questions.json"), "w", encoding="utf-8") as f:
        json.dump(chart_bank, f, ensure_ascii=False, indent=2)
    print(f"[+] Successfully updated chart_questions.json ({len(ALL_CHART_QUESTIONS)} questions + 6 rules)")
    print("[+] Successfully updated chart_questions.json")

    # 4. Update public/data/climate_hydro.geojson with the 8 official stations
    with open(os.path.join(DATA_DIR, "climate_hydro.geojson"), "w", encoding="utf-8") as f:
        json.dump(geo_climate_updated, f, ensure_ascii=False, indent=2)
    print("[+] Successfully updated climate_hydro.geojson")

    # 5. Update public/data/vn_provinces_34.geojson with exact numbers
    with open(os.path.join(DATA_DIR, "vn_provinces_34.geojson"), "w", encoding="utf-8") as f:
        json.dump(geo_34, f, ensure_ascii=False, indent=2)
    print("[+] Successfully updated vn_provinces_34.geojson")

if __name__ == "__main__":
    main()

