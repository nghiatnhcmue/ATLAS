"""
GeoAtlas Interactive - Build Full Climate & Hydrology Layer (Lớp 3)
Faithfully aligned with Atlat GD tr.8 (Khí hậu), tr.9 (Vùng khí hậu) & tr.10 (Hệ thống sông / Thủy văn)

Features included:
1. 1 Climate boundary (Dãy Bạch Mã 16°B)
2. 15 Authentic Climate Stations (Atlat GD tr.8)
3. 12 Key Hydrological Stations with Monthly Flow Regimes (Atlat GD tr.10)
4. 15 Major Lakes & Regulatory Reservoirs (Atlat GD tr.10, 13, 23)
Total: 43 objects
"""

import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "public", "data")
JS_DIR = os.path.join(BASE_DIR, "js")

# 1. 15 Authentic Climate Stations (Atlat GD, tr.8)
CLIMATE_STATIONS = [
    {
        "id": "MET_01",
        "category": "met_station",
        "name": "Hà Nội (Trạm Láng)",
        "province": "Thành phố Hà Nội",
        "coords": [105.80, 21.02],
        "avg_temp": "23,8°C",
        "max_temp": "29,8°C",
        "min_temp": "16,4°C",
        "temp_range": "13,4°C",
        "rainfall": "1.676 mm",
        "climate_type": "Nhiệt đới ẩm gió mùa có mùa đông lạnh",
        "desc": "Đặc trưng khí hậu miền Bắc: Biên độ nhiệt lớn (13,4°C), có mùa đông lạnh kéo dài từ tháng XI đến tháng IV năm sau do gió mùa Đông Bắc.",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_02",
        "category": "met_station",
        "name": "Sơn La",
        "province": "Tỉnh Sơn La",
        "coords": [103.90, 21.32],
        "avg_temp": "21,2°C",
        "max_temp": "25,5°C",
        "min_temp": "13,7°C",
        "temp_range": "11,8°C",
        "rainfall": "1.420 mm",
        "climate_type": "Nhiệt đới gió mùa vùng núi Tây Bắc",
        "desc": "Vùng núi cao Tây Bắc: Nhiệt độ trung bình thấp hơn đồng bằng, biên độ nhiệt năm cao (11,8°C), lượng mưa trung bình 1.420 mm.",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_03",
        "category": "met_station",
        "name": "Tuyên Quang",
        "province": "Tỉnh Tuyên Quang",
        "coords": [105.21, 21.82],
        "avg_temp": "23,5°C",
        "max_temp": "28,9°C",
        "min_temp": "15,7°C",
        "temp_range": "13,2°C",
        "rainfall": "1.665 mm",
        "climate_type": "Nhiệt đới ẩm gió mùa Đông Bắc",
        "desc": "Khu vực Đông Bắc: Đón gió mùa Đông Bắc sớm và kết thúc muộn, biên độ nhiệt lớn (13,2°C), mùa đông rét đậm rét hại.",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_04",
        "category": "met_station",
        "name": "Lạng Sơn",
        "province": "Tỉnh Lạng Sơn",
        "coords": [106.76, 21.85],
        "avg_temp": "21,2°C",
        "max_temp": "27,2°C",
        "min_temp": "13,5°C",
        "temp_range": "13,7°C",
        "rainfall": "1.311 mm",
        "climate_type": "Nhiệt đới gió mùa Đông Bắc đón gió",
        "desc": "Cửa ngõ đón gió mùa Đông Bắc trực tiếp: Nhiệt độ mùa đông xuống rất thấp, biên độ nhiệt lớn nhất cả nước (13,7°C).",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_05",
        "category": "met_station",
        "name": "Hà Tĩnh",
        "province": "Tỉnh Hà Tĩnh",
        "coords": [105.90, 18.34],
        "avg_temp": "24,1°C",
        "max_temp": "29,8°C",
        "min_temp": "18,4°C",
        "temp_range": "11,4°C",
        "rainfall": "2.658 mm",
        "climate_type": "Nhiệt đới Bắc Trung Bộ mưa thu đông",
        "desc": "Bắc Trung Bộ: Chịu ảnh hưởng gay gắt của gió tây khô nóng vào đầu mùa hạ; mưa lớn tập trung vào mùa thu đông do bão và gió mùa Đông Bắc.",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_06",
        "category": "met_station",
        "name": "Huế",
        "province": "Thành phố Huế",
        "coords": [107.59, 16.46],
        "avg_temp": "25,2°C",
        "max_temp": "29,4°C",
        "min_temp": "19,7°C",
        "temp_range": "9,7°C",
        "rainfall": "2.868 mm",
        "climate_type": "Khí hậu chuyển tiếp Bắc Trung Bộ",
        "desc": "Trung tâm mưa lớn nhất dải đồng bằng: Lượng mưa đạt 2.868 mm, cực đại vào tháng X - XI do gió mùa Đông Bắc qua biển gặp địa hình chắn gió Bạch Mã.",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_07",
        "category": "met_station",
        "name": "Đà Lạt",
        "province": "Tỉnh Lâm Đồng",
        "coords": [108.44, 11.94],
        "avg_temp": "17,9°C",
        "max_temp": "20,5°C",
        "min_temp": "14,8°C",
        "temp_range": "5,7°C",
        "rainfall": "1.739 mm",
        "climate_type": "Cận nhiệt đới vùng núi cao Tây Nguyên",
        "desc": "Độ cao ~1.500m trên cao nguyên Lâm Viên: Nhiệt độ trung bình năm chỉ 17,9°C, mát mẻ quanh năm, biên độ nhiệt nhỏ (5,7°C).",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_08",
        "category": "met_station",
        "name": "Quy Nhơn",
        "province": "Tỉnh Quảng Ngãi",
        "coords": [109.22, 13.78],
        "avg_temp": "27,1°C",
        "max_temp": "30,1°C",
        "min_temp": "23,3°C",
        "temp_range": "6,8°C",
        "rainfall": "1.852 mm",
        "climate_type": "Nhiệt đới Duyên hải Nam Trung Bộ",
        "desc": "Duyên hải Nam Trung Bộ: Nắng ấm quanh năm, mùa khô kéo dài, mùa mưa lùi hẳn về các tháng cuối năm (tháng IX - XII).",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_09",
        "category": "met_station",
        "name": "Buôn Ma Thuột",
        "province": "Tỉnh Đắk Lắk",
        "coords": [108.05, 12.67],
        "avg_temp": "24,0°C",
        "max_temp": "26,5°C",
        "min_temp": "20,8°C",
        "temp_range": "5,7°C",
        "rainfall": "1.904 mm",
        "climate_type": "Cận xích đạo cao nguyên Tây Nguyên",
        "desc": "Tây Nguyên: Khí hậu phân chia 2 mùa mưa - khô sâu sắc; mùa mưa từ tháng V đến tháng X, mùa khô thiếu nước nghiêm trọng.",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_10",
        "category": "met_station",
        "name": "Hoàng Sa",
        "province": "Thành phố Đà Nẵng",
        "coords": [111.60, 16.50],
        "avg_temp": "23,6°C",
        "max_temp": "26,8°C",
        "min_temp": "21,3°C",
        "temp_range": "5,5°C",
        "rainfall": "2.769 mm",
        "climate_type": "Nhiệt đới hải đảo Hoàng Sa",
        "desc": "Quần đảo Hoàng Sa (Đặc khu Hoàng Sa - TP. Đà Nẵng): Khí hậu hải dương nhiệt đới, lượng mưa lớn (2.769 mm), chịu nhiều ảnh hưởng của bão nhiệt đới.",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_11",
        "category": "met_station",
        "name": "Trường Sa",
        "province": "Tỉnh Khánh Hoà",
        "coords": [111.92, 8.65],
        "avg_temp": "28,0°C",
        "max_temp": "29,4°C",
        "min_temp": "26,6°C",
        "temp_range": "2,8°C",
        "rainfall": "2.666 mm",
        "climate_type": "Cận xích đạo hải đảo Trường Sa",
        "desc": "Quần đảo Trường Sa (Đặc khu Trường Sa - Tỉnh Khánh Hoà): Nóng đều quanh năm (28,0°C), biên độ nhiệt năm nhỏ nhất (2,8°C), nắng gió dồi dào.",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_12",
        "category": "met_station",
        "name": "Tân Sơn Hoà (TP. Hồ Chí Minh)",
        "province": "Thành phố Hồ Chí Minh",
        "coords": [106.66, 10.77],
        "avg_temp": "28,1°C",
        "max_temp": "29,7°C",
        "min_temp": "26,0°C",
        "temp_range": "3,7°C",
        "rainfall": "1.964 mm",
        "climate_type": "Cận xích đạo gió mùa Nam Bộ",
        "desc": "Nam Bộ: Nóng quanh năm (Ttb 28,1°C), không có mùa đông lạnh, biên độ nhiệt nhỏ (3,7°C), 2 mùa mưa - khô rõ rệt.",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_13",
        "category": "met_station",
        "name": "Cần Thơ",
        "province": "Thành phố Cần Thơ",
        "coords": [105.78, 10.04],
        "avg_temp": "26,9°C",
        "max_temp": "28,5°C",
        "min_temp": "25,2°C",
        "temp_range": "3,3°C",
        "rainfall": "1.674 mm",
        "climate_type": "Cận xích đạo châu thổ sông Cửu Long",
        "desc": "Đồng bằng sông Cửu Long: Biên độ nhiệt nhỏ (3,3°C), mùa mưa trùng mùa lũ sông Mê Công, thích hợp sản xuất lúa gạo và thủy sản.",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_14",
        "category": "met_station",
        "name": "Cà Mau",
        "province": "Tỉnh Cà Mau",
        "coords": [105.15, 9.18],
        "avg_temp": "26,8°C",
        "max_temp": "28,6°C",
        "min_temp": "25,5°C",
        "temp_range": "3,1°C",
        "rainfall": "2.360 mm",
        "climate_type": "Cực Nam cận xích đạo hải dương",
        "desc": "Bán đảo Cà Mau: Biên độ nhiệt chỉ 3,1°C, mưa nhiều (2.360 mm) do giáp 3 mặt biển, mùa mưa kéo dài từ tháng V đến tháng XI.",
        "source": "Atlat GD, tr.8"
    },
    {
        "id": "MET_15",
        "category": "met_station",
        "name": "Phú Quốc",
        "province": "Tỉnh An Giang",
        "coords": [103.96, 10.22],
        "avg_temp": "27,3°C",
        "max_temp": "28,9°C",
        "min_temp": "25,7°C",
        "temp_range": "3,2°C",
        "rainfall": "2.882 mm",
        "climate_type": "Hải đảo cực Tây Nam",
        "desc": "Đảo ngọc Phú Quốc: Lượng mưa lớn nhất Nam Bộ (2.882 mm) do đón trực tiếp gió mùa Tây Nam ẩm từ vịnh Thái Lan thổi vào.",
        "source": "Atlat GD, tr.8"
    }
]

# 2. 12 Key Hydrological Stations (Atlat GD, tr.10 - Các Hệ Thống Sông)
HYDRO_STATIONS = [
    {
        "id": "HYDRO_01",
        "category": "hydro_station",
        "name": "Trạm Thủy văn Hà Nội",
        "river_system": "Hệ thống sông Hồng",
        "river_name": "Sông Hồng",
        "province": "Thành phố Hà Nội",
        "coords": [105.86, 21.03],
        "flood_season": "Tháng VI - X",
        "peak_month": "Tháng VIII",
        "dry_season": "Tháng XI - V",
        "peak_flow": ">9.100 m³/s",
        "avg_flow": "2.640 m³/s",
        "regime_desc": "Mùa lũ kéo dài 5 tháng (VI-X), đỉnh lũ cao vào tháng VIII chiếm trên 50-60% lượng nước năm. Lũ lên nhanh do dạng nan quạt hợp lưu từ sông Đà, sông Thao và sông Lô.",
        "monthly_flow_pattern": "Thấp nhất tháng III (~1.000 m³/s), cao nhất tháng VIII (~9.100 m³/s). Chế độ lũ được điều tiết mạnh bởi hồ thủy điện Hòa Bình, Thác Bà, Tuyên Quang.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 (Biểu đồ lưu lượng trạm Hà Nội)"
    },
    {
        "id": "HYDRO_02",
        "category": "hydro_station",
        "name": "Trạm Thủy văn Sơn Tây",
        "river_system": "Hệ thống sông Hồng",
        "river_name": "Sông Hồng",
        "province": "Thành phố Hà Nội",
        "coords": [105.50, 21.14],
        "flood_season": "Tháng VI - X",
        "peak_month": "Tháng VIII",
        "dry_season": "Tháng XI - V",
        "peak_flow": ">8.800 m³/s",
        "avg_flow": "2.550 m³/s",
        "regime_desc": "Nằm ngay ngã ba hợp lưu sông Đà, sông Thao, sông Lô (Việt Trì). Điểm khống chế lưu lượng nước chính đổ vào toàn bộ đồng bằng châu thổ Bắc Bộ.",
        "monthly_flow_pattern": "Đỉnh lũ tháng VIII, mùa cạn từ tháng XI đến tháng V năm sau.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10"
    },
    {
        "id": "HYDRO_03",
        "category": "hydro_station",
        "name": "Trạm Thủy văn Hòa Bình",
        "river_system": "Hệ thống sông Hồng",
        "river_name": "Sông Đà",
        "province": "Tỉnh Phú Thọ",
        "coords": [105.33, 20.82],
        "flood_season": "Tháng VI - X",
        "peak_month": "Tháng VIII",
        "dry_season": "Tháng XI - V",
        "peak_flow": ">6.500 m³/s",
        "avg_flow": "1.780 m³/s",
        "regime_desc": "Sông Đà đóng góp trên 53% tổng lượng dòng chảy của toàn bộ hệ thống sông Hồng. Trạm thủy văn gắn liền đập và hồ chứa thủy điện Hòa Bình điều tiết chống lũ.",
        "monthly_flow_pattern": "Lưu lượng dòng chảy dồi dào, điều tiết bởi hồ Hòa Bình và hồ Sơn La.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 & tr.23"
    },
    {
        "id": "HYDRO_04",
        "category": "hydro_station",
        "name": "Trạm Thủy văn Yên Bái",
        "river_system": "Hệ thống sông Hồng",
        "river_name": "Sông Thao",
        "province": "Tỉnh Yên Bái",
        "coords": [104.88, 21.72],
        "flood_season": "Tháng VI - X",
        "peak_month": "Tháng VIII",
        "dry_season": "Tháng XI - V",
        "peak_flow": ">3.200 m³/s",
        "avg_flow": "760 m³/s",
        "regime_desc": "Quan trắc dòng chảy dòng chính sông Thao từ Vân Nam (Trung Quốc) chảy vào Việt Nam qua cửa khẩu Lào Cai.",
        "monthly_flow_pattern": "Lượng phù sa đỏ lớn nhất trong các nhánh sông miền Bắc.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10"
    },
    {
        "id": "HYDRO_05",
        "category": "hydro_station",
        "name": "Trạm Thủy văn Ghềnh Gà",
        "river_system": "Hệ thống sông Hồng",
        "river_name": "Sông Lô",
        "province": "Tỉnh Phú Thọ",
        "coords": [105.35, 21.36],
        "flood_season": "Tháng VI - X",
        "peak_month": "Tháng VIII",
        "dry_season": "Tháng XI - V",
        "peak_flow": ">3.500 m³/s",
        "avg_flow": "1.050 m³/s",
        "regime_desc": "Quan trắc lưu lượng sông Lô sau khi nhận tiếp nước từ sông Gâm; điều hòa bởi hồ thủy điện Tuyên Quang và hồ Thác Bà.",
        "monthly_flow_pattern": "Lũ hè thu dữ dội, mùa cạn kéo dài.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10"
    },
    {
        "id": "HYDRO_06",
        "category": "hydro_station",
        "name": "Trạm Thủy văn Cẩm Thủy",
        "river_system": "Hệ thống sông Mã",
        "river_name": "Sông Mã",
        "province": "Tỉnh Thanh Hóa",
        "coords": [105.46, 20.21],
        "flood_season": "Tháng VII - X",
        "peak_month": "Tháng VIII - IX",
        "dry_season": "Tháng XI - VI",
        "peak_flow": ">2.600 m³/s",
        "avg_flow": "430 m³/s",
        "regime_desc": "Mùa lũ kéo dài 4 tháng (VII-X), đỉnh lũ rơi vào tháng VIII - IX. Địa hình núi dốc đứng làm lũ lên rất nhanh và rút nhanh.",
        "monthly_flow_pattern": "Thấp nhất vào tháng III - IV (~80 m³/s), cao nhất tháng VIII - IX (~2.600 m³/s).",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 (Biểu đồ lưu lượng trạm Cẩm Thủy)"
    },
    {
        "id": "HYDRO_07",
        "category": "hydro_station",
        "name": "Trạm Thủy văn Dừa",
        "river_system": "Hệ thống sông Cả (Sông Lam)",
        "river_name": "Sông Cả",
        "province": "Tỉnh Nghệ An",
        "coords": [105.28, 18.98],
        "flood_season": "Tháng VIII - XI",
        "peak_month": "Tháng IX - X",
        "dry_season": "Tháng XII - VII",
        "peak_flow": ">3.100 m³/s",
        "avg_flow": "450 m³/s",
        "regime_desc": "Mùa lũ lệch dần về mùa thu đông (VIII-XI) với đỉnh lũ tháng IX - X trùng mùa mưa bão lớn dải Bắc Trung Bộ.",
        "monthly_flow_pattern": "Mùa cạn kéo dài từ tháng XII đến tháng VII năm sau; khô hạn sâu sắc khi có gió Lào.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 (Biểu đồ lưu lượng trạm Dừa)"
    },
    {
        "id": "HYDRO_08",
        "category": "hydro_station",
        "name": "Trạm Thủy văn Nông Sơn",
        "river_system": "Hệ thống sông Thu Bồn",
        "river_name": "Sông Thu Bồn",
        "province": "Tỉnh Quảng Nam",
        "coords": [108.01, 15.68],
        "flood_season": "Tháng IX - XII",
        "peak_month": "Tháng X - XI",
        "dry_season": "Tháng I - VIII",
        "peak_flow": ">1.250 m³/s",
        "avg_flow": "290 m³/s",
        "regime_desc": "Mùa lũ đặc thù thu đông (IX-XII), đỉnh lũ tháng X - XI. Địa hình núi cao sườn đón gió biển ngắn dốc gây ra các đợt lũ quét dữ dội.",
        "monthly_flow_pattern": "Lượng nước 3 tháng lũ chiếm tới 65-70% tổng dòng chảy cả năm; mùa kiệt lưu lượng hạ rất thấp.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 (Biểu đồ lưu lượng trạm Nông Sơn)"
    },
    {
        "id": "HYDRO_09",
        "category": "hydro_station",
        "name": "Trạm Thủy văn Củng Sơn",
        "river_system": "Hệ thống sông Ba (Đà Rằng)",
        "river_name": "Sông Ba",
        "province": "Tỉnh Đắk Lắk",
        "coords": [108.97, 13.06],
        "flood_season": "Tháng IX - XII",
        "peak_month": "Tháng XI",
        "dry_season": "Tháng I - VIII",
        "peak_flow": ">1.650 m³/s",
        "avg_flow": "310 m³/s",
        "regime_desc": "Sông Ba là con sông lớn nhất Nam Trung Bộ nối Tây Nguyên xuống biển Đông. Đỉnh lũ trễ nhất vào tháng XI; mùa khô Tây Nguyên làm dòng sông cạn kiệt.",
        "monthly_flow_pattern": "Chênh lệch lưu lượng giữa mùa lũ và mùa cạn cực lớn; lũ gây ngập úng hạ lưu Tuy Hòa.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 (Biểu đồ lưu lượng trạm Củng Sơn)"
    },
    {
        "id": "HYDRO_10",
        "category": "hydro_station",
        "name": "Trạm Thủy văn Tà Lài",
        "river_system": "Hệ thống sông Đồng Nai",
        "river_name": "Sông Đồng Nai",
        "province": "Thành phố Đồng Nai",
        "coords": [107.35, 11.41],
        "flood_season": "Tháng VII - XI",
        "peak_month": "Tháng VIII - IX",
        "dry_season": "Tháng XII - VI",
        "peak_flow": ">1.150 m³/s",
        "avg_flow": "370 m³/s",
        "regime_desc": "Mùa lũ kéo dài từ tháng VII đến tháng XI, đỉnh lũ tháng VIII - IX trùng mùa mưa gió Tây Nam. Nguồn nước cấp thiết cho toàn bộ vùng kinh tế Đông Nam Bộ.",
        "monthly_flow_pattern": "Được điều tiết lớn bởi thảm rừng phòng hộ Nam Cát Tiên và hồ chứa Trị An.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 (Biểu đồ lưu lượng trạm Tà Lài)"
    },
    {
        "id": "HYDRO_11",
        "category": "hydro_station",
        "name": "Trạm Thủy văn Tân Châu",
        "river_system": "Hệ thống sông Mê Công",
        "river_name": "Sông Tiền",
        "province": "Tỉnh An Giang",
        "coords": [105.24, 10.80],
        "flood_season": "Tháng VII - XI",
        "peak_month": "Tháng IX - X",
        "dry_season": "Tháng XII - VI",
        "peak_flow": ">25.500 m³/s",
        "avg_flow": "11.200 m³/s",
        "regime_desc": "Cửa ngõ chính nhận ~80% lưu lượng sông Mê Công vào Việt Nam. Mùa lũ tháng VII - XI, đỉnh lũ tháng IX - X (mùa nước nổi). Lũ lên chậm và rút chậm nhờ điều hòa Biển Hồ.",
        "monthly_flow_pattern": "Lưu lượng khổng lồ mang theo hàng trăm triệu tấn phù sa; mùa kiệt tháng III - IV hạ thấp dẫn tới xâm nhập mặn.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 & tr.11"
    },
    {
        "id": "HYDRO_12",
        "category": "hydro_station",
        "name": "Trạm Thủy văn Châu Đốc",
        "river_system": "Hệ thống sông Mê Công",
        "river_name": "Sông Hậu",
        "province": "Tỉnh An Giang",
        "coords": [105.12, 10.70],
        "flood_season": "Tháng VII - XI",
        "peak_month": "Tháng IX - X",
        "peak_flow": ">8.600 m³/s",
        "avg_flow": "3.800 m³/s",
        "dry_season": "Tháng XII - VI",
        "regime_desc": "Cửa ngõ phân lưu chính thứ hai nhận nước từ sông Bassac vào Việt Nam. Trạm đo ngập lụt vùng Tứ giác Long Xuyên và cảnh báo mặn ven biển.",
        "monthly_flow_pattern": "Mùa nước nổi đem lại nguồn lợi thủy sản tôm cá phong phú và rửa chua phèn đất phù sa.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10"
    }
]

# 3. 15 Major Lakes & Regulatory Reservoirs (Hồ Thủy văn & Điều Tiết Dòng Chảy)
RESERVOIRS_LAKES = [
    {
        "id": "LAKE_01",
        "category": "reservoir_lake",
        "sub_type": "reservoir",
        "name": "Hồ Hòa Bình",
        "basin": "Lưu vực sông Hồng (Sông Đà)",
        "province": "Tỉnh Phú Thọ",
        "coords": [105.32, 20.80],
        "capacity": "9,45 tỉ m³",
        "area_km2": "208 km²",
        "role": "Cắt lũ lịch sử, phát điện (1.920 MW), điều tiết cấp nước mùa kiệt đẩy mặn ngọt hóa cho hạ du Hà Nội và đồng bằng sông Hồng.",
        "desc": "Công trình thế kỷ trên sông Đà: Dung tích phòng lũ lớn nhất miền Bắc, bảo vệ an toàn tuyệt đối cho thủ đô Hà Nội trong mùa mưa bão.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 & tr.23"
    },
    {
        "id": "LAKE_02",
        "category": "reservoir_lake",
        "sub_type": "reservoir",
        "name": "Hồ Thác Bà",
        "basin": "Lưu vực sông Hồng (Sông Chảy)",
        "province": "Tỉnh Yên Bái",
        "coords": [104.98, 21.75],
        "capacity": "3,9 tỉ m³",
        "area_km2": "234 km²",
        "role": "Hồ nhân tạo lớn đầu tiên của miền Bắc, điều tiết dòng chảy sông Chảy đổ vào sông Lô, cấp nước tưới tiêu và phát điện (120 MW).",
        "desc": "Được ví như 'Hạ Long trên núi' của vùng Tây Bắc, có vai trò điều hòa khí hậu và cân bằng dòng chảy lưu vực sông Chảy.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 & tr.23"
    },
    {
        "id": "LAKE_03",
        "category": "reservoir_lake",
        "sub_type": "reservoir",
        "name": "Hồ Tuyên Quang",
        "basin": "Lưu vực sông Hồng (Sông Gâm)",
        "province": "Tỉnh Tuyên Quang",
        "coords": [105.40, 22.35],
        "capacity": "2,26 tỉ m³",
        "area_km2": "89 km²",
        "role": "Cắt lũ cho thành phố Tuyên Quang và hạ lưu sông Lô, bổ sung lưu lượng dòng chảy mùa cạn cho sông Hồng và phát điện (342 MW).",
        "desc": "Hồ thủy điện lớn trên dòng sông Gâm (Na Hang), đóng vai trò then chốt trong chuỗi hồ bậc thang kiểm soát lũ miền Bắc.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 & tr.23"
    },
    {
        "id": "LAKE_04",
        "category": "reservoir_lake",
        "sub_type": "lake",
        "name": "Hồ Ba Bể",
        "basin": "Lưu vực sông Cầu / Sông Năng",
        "province": "Tỉnh Thái Nguyên",
        "coords": [105.62, 22.41],
        "capacity": "Tự nhiên karst",
        "area_km2": "6,5 km²",
        "role": "Hồ nước ngọt tự nhiên lớn nhất Việt Nam trên núi đá vôi kiến tạo karst, điều hòa dòng chảy sông Năng và bảo tồn sinh học đất ngập nước.",
        "desc": "Nằm ở độ cao 145m trên mực nước biển, là khu Ramsar bảo tồn sinh quyển quý giá của Đông Bắc.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 & tr.12"
    },
    {
        "id": "LAKE_05",
        "category": "reservoir_lake",
        "sub_type": "lake",
        "name": "Hồ Tây",
        "basin": "Lưu vực sông Hồng",
        "province": "Thành phố Hà Nội",
        "coords": [105.82, 21.05],
        "capacity": "Tự nhiên khúc uốn",
        "area_km2": "5,3 km²",
        "role": "Hồ tự nhiên hình thành từ vết tích khúc uốn cổ (hồ móng ngựa) của sông Hồng khi chuyển dòng; điều hòa vi khí hậu thủ đô Hà Nội.",
        "desc": "Hồ nước ngọt tự nhiên lớn nhất nội thành Hà Nội, minh chứng lịch sử cho sự biến thiên dòng chảy sông Hồng.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10"
    },
    {
        "id": "LAKE_06",
        "category": "reservoir_lake",
        "sub_type": "reservoir",
        "name": "Hồ Núi Cốc",
        "basin": "Lưu vực sông Cầu (Sông Công)",
        "province": "Tỉnh Thái Nguyên",
        "coords": [105.70, 21.58],
        "capacity": "175 triệu m³",
        "area_km2": "25 km²",
        "role": "Hồ thủy lợi đa mục tiêu trên sông Công, cấp nước sinh hoạt và sản xuất công nghiệp cho Thái Nguyên, cắt giảm lũ hạ lưu.",
        "desc": "Công trình thủy lợi quan trọng của vùng Đông Bắc, điều tiết dòng chảy lưu vực sông Cầu.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10"
    },
    {
        "id": "LAKE_07",
        "category": "reservoir_lake",
        "sub_type": "reservoir",
        "name": "Hồ Cửa Đạt",
        "basin": "Lưu vực sông Mã (Sông Chu)",
        "province": "Tỉnh Thanh Hóa",
        "coords": [105.27, 19.88],
        "capacity": "1,45 tỉ m³",
        "area_km2": "31 km²",
        "role": "Công trình thủy lợi - thủy điện cắt lũ lớn nhất Bắc Trung Bộ, cấp nước tưới cho hơn 86.000 ha đất canh tác đồng bằng sông Mã và sông Chu.",
        "desc": "Đập đá đổ bản mặt bê tông cao nhất Việt Nam, điều tiết dòng chảy bảo vệ vùng đồng bằng Thanh Hóa khỏi ngập lụt.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10"
    },
    {
        "id": "LAKE_08",
        "category": "reservoir_lake",
        "sub_type": "reservoir",
        "name": "Hồ Kẻ Gỗ",
        "basin": "Lưu vực sông Rào Cái",
        "province": "Tỉnh Hà Tĩnh",
        "coords": [105.90, 18.20],
        "capacity": "345 triệu m³",
        "area_km2": "29 km²",
        "role": "Hồ thủy lợi nhân tạo lớn nhất Hà Tĩnh, cung cấp nước ngọt phục vụ nông nghiệp và công nghiệp, cắt lũ tiểu mãn cho hạ du Thạch Hà.",
        "desc": "Nguồn nước sự sống cho cả dải đồng bằng khô hạn Hà Tĩnh khi vào mùa khô gió Lào.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10"
    },
    {
        "id": "LAKE_09",
        "category": "reservoir_lake",
        "sub_type": "reservoir",
        "name": "Hồ Tả Trạch",
        "basin": "Lưu vực sông Hương",
        "province": "Thành phố Huế",
        "coords": [107.63, 16.32],
        "capacity": "646 triệu m³",
        "area_km2": "23 km²",
        "role": "Cắt giảm đỉnh lũ sông Hương cho thành phố di sản Huế, đẩy mặn và ngọt hóa hệ đầm phá Tam Giang - Cầu Hai.",
        "desc": "Hồ điều tiết chiến lược trên thượng nguồn sông Hương, giữ an toàn di sản Cố đô trước các trận đại hồng thủy mùa thu đông.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10"
    },
    {
        "id": "LAKE_09_ALT",
        "category": "reservoir_lake",
        "sub_type": "reservoir",
        "name": "Hồ Phú Ninh",
        "basin": "Lưu vực sông Tam Kỳ",
        "province": "Tỉnh Quảng Nam",
        "coords": [108.45, 15.48],
        "capacity": "344 triệu m³",
        "area_km2": "34 km²",
        "role": "Công trình thủy lợi lớn thứ hai miền Trung, cấp nước tưới cho 23.000 ha ruộng lúa Quảng Nam và chống hạn hán mùa khô.",
        "desc": "Hồ điều hòa sinh thái nổi tiếng, cung cấp nguồn nước ngọt bền vững cho khu vực Duyên hải Nam Trung Bộ.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10"
    },
    {
        "id": "LAKE_10",
        "category": "reservoir_lake",
        "sub_type": "lake",
        "name": "Biển Hồ (Hồ T’Nưng)",
        "basin": "Lưu vực sông Sê San",
        "province": "Tỉnh Gia Lai",
        "coords": [108.00, 14.05],
        "capacity": "Miệng núi lửa cổ",
        "area_km2": "2,3 km²",
        "role": "Hồ tự nhiên hình thành từ miệng núi lửa bazan đã ngừng hoạt động hàng triệu năm; hồ chứa nước ngọt tự nhiên lớn của Pleiku.",
        "desc": "Được mệnh danh là 'Đôi mắt Pleiku', nguồn cung cấp nước sinh hoạt chính cho thành phố Pleiku trên cao nguyên đất đỏ.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 & tr.14"
    },
    {
        "id": "LAKE_11",
        "category": "reservoir_lake",
        "sub_type": "lake",
        "name": "Hồ Lắk",
        "basin": "Lưu vực sông Srêpôk",
        "province": "Tỉnh Đắk Lắk",
        "coords": [108.18, 12.41],
        "capacity": "Tự nhiên trũng bồn địa",
        "area_km2": "6,2 km²",
        "role": "Hồ nước ngọt tự nhiên lớn nhất Tây Nguyên và lớn thứ hai cả nước, thông với sông Krông Ana, điều hòa dòng chảy sông Srêpôk.",
        "desc": "Cảnh quan thiên nhiên kỳ vĩ gắn với văn hóa cồng chiêng voi Tây Nguyên của người M'Nông.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10"
    },
    {
        "id": "LAKE_12",
        "category": "reservoir_lake",
        "sub_type": "reservoir",
        "name": "Hồ Trị An",
        "basin": "Lưu vực sông Đồng Nai",
        "province": "Thành phố Đồng Nai",
        "coords": [107.03, 11.13],
        "capacity": "2,76 tỉ m³",
        "area_km2": "323 km²",
        "role": "Hồ chứa điều tiết thủy văn lớn nhất miền Nam: Cắt lũ, phát điện (400 MW), đẩy mặn ngăn triều cường bảo vệ nước sinh hoạt cho TP.HCM và Đồng Nai.",
        "desc": "Biển nước nhân tạo lớn nhất miền Nam trên dòng sông Đồng Nai, giữ vai trò sống còn đối với an ninh nguồn nước vùng Đông Nam Bộ.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 & tr.23"
    },
    {
        "id": "LAKE_13",
        "category": "reservoir_lake",
        "sub_type": "reservoir",
        "name": "Hồ Dầu Tiếng",
        "basin": "Lưu vực sông Sài Gòn & Vàm Cỏ Đông",
        "province": "Tỉnh Tây Ninh",
        "coords": [106.35, 11.32],
        "capacity": "1,58 tỉ m³",
        "area_km2": "270 km²",
        "role": "Hồ thủy lợi nhân tạo lớn nhất Đông Nam Á, điều tiết nguồn nước ngọt đẩy mặn cho sông Sài Gòn và sông Vàm Cỏ Đông, cấp nước cho hơn 100.000 ha đất canh tác.",
        "desc": "Công trình thủy lợi kỳ vĩ giáp ba tỉnh Tây Ninh, Bình Dương, Bình Phước, nuôi sống nông nghiệp Đông Nam Bộ.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10"
    },
    {
        "id": "LAKE_14",
        "category": "reservoir_lake",
        "sub_type": "reservoir",
        "name": "Hồ Thác Mơ",
        "basin": "Lưu vực sông Đồng Nai (Sông Bé)",
        "province": "Tỉnh Bình Phước",
        "coords": [107.01, 11.85],
        "capacity": "1,25 tỉ m³",
        "area_km2": "109 km²",
        "role": "Hồ thủy điện và thủy lợi trên sông Bé, điều hòa dòng chảy mùa khô, bổ sung nước cho hạ lưu sông Bé và hồ Trị An.",
        "desc": "Công trình trữ nước trọng điểm vùng biên giới Đông Nam Bộ, phát điện công suất 150 MW.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 & tr.23"
    },
    {
        "id": "LAKE_15",
        "category": "reservoir_lake",
        "sub_type": "reservoir",
        "name": "Hồ Yaly",
        "basin": "Lưu vực sông Mê Công (Sông Sê San)",
        "province": "Tỉnh Gia Lai",
        "coords": [107.82, 14.22],
        "capacity": "1,03 tỉ m³",
        "area_km2": "64 km²",
        "role": "Hồ chứa thủy điện lớn nhất Tây Nguyên (720 MW), kiểm soát dòng chảy lưu vực sông Sê San trước khi đổ sang Campuchia.",
        "desc": "Bậc thang thủy điện khổng lồ trên dòng Sê San hùng vĩ, điều hòa nguồn nước mặt trên cao nguyên Kon Tum - Gia Lai.",
        "atlat_page": 10,
        "source": "Atlat GD, tr.10 & tr.23"
    }
]

# 4. Climate Boundary (Dãy Bạch Mã 16°B)
CLIMATE_BOUNDARY = {
    "type": "Feature",
    "geometry": {
        "type": "LineString",
        "coordinates": [
            [107.20, 16.20],
            [107.85, 16.20],
            [108.30, 16.20]
        ]
    },
    "properties": {
        "id": "CLI_BOUND_16",
        "name": "Ranh giới miền khí hậu Bắc - Nam (Dãy Bạch Mã 16°B)",
        "category": "climate_boundary",
        "desc": "Ranh giới tự nhiên phân chia 2 miền khí hậu: Phía Bắc có mùa đông lạnh, biên độ nhiệt lớn; Phía Nam mang tính chất cận xích đạo nóng quanh năm, biên độ nhiệt nhỏ.",
        "atlat_page": 8,
        "source": "Atlat GD, tr.8 & tr.9"
    }
}

def build_geojson():
    features = [CLIMATE_BOUNDARY]

    # Add 15 Climate Stations
    for s in CLIMATE_STATIONS:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": s["coords"]
            },
            "properties": s
        })

    # Add 12 Hydrological Stations
    for h in HYDRO_STATIONS:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": h["coords"]
            },
            "properties": h
        })

    # Add 15 Lakes & Reservoirs
    for lk in RESERVOIRS_LAKES:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": lk["coords"]
            },
            "properties": lk
        })

    geo_data = {
        "type": "FeatureCollection",
        "metadata": {
            "title": "Bản đồ Khí hậu & Thủy văn Việt Nam (Atlat GD, tr.8, 9, 10)",
            "met_stations_count": len(CLIMATE_STATIONS),
            "hydro_stations_count": len(HYDRO_STATIONS),
            "reservoirs_lakes_count": len(RESERVOIRS_LAKES),
            "total_features": len(features),
            "source": "Atlat Địa lí Việt Nam (NXB Giáo dục Việt Nam, tr.8, 9, 10)"
        },
        "features": features
    }

    out_path = os.path.join(DATA_DIR, "climate_hydro.geojson")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(geo_data, f, ensure_ascii=False, indent=2)

    print(f"[+] Successfully exported {out_path} ({len(features)} features)")
    return geo_data

if __name__ == "__main__":
    build_geojson()
