#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GeoAtlas Interactive - Build All 6 Standard Atlat Layers
Layers:
1. Hành chính & Vùng kinh tế (Trang 4-5) -> vn_provinces_63.geojson & vn_provinces_34.geojson
2. Địa hình & Sông ngòi (Trang 6-7, 10) -> topography_rivers.geojson
3. Khí hậu & Thủy văn (Trang 9) -> climate_hydro.geojson
4. Nông, Lâm, Thủy sản (Trang 18-20) -> agriculture_fishery.geojson
5. Khoáng sản & Năng lượng (Trang 8 & 22) -> minerals.geojson & hydropower.geojson
6. Trung tâm Công nghiệp (Trang 21) -> industrial_centers.geojson
"""

import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data")
os.makedirs(DATA_DIR, exist_ok=True)

# ==============================================================================
# LỚP 2: ĐỊA HÌNH & SÔNG NGÒI (Trang 6-7, 10)
# ==============================================================================
TOPOGRAPHY_FEATURES = [
    # --- Đỉnh núi cao tiêu biểu ---
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [103.7753, 22.3033]},
        "properties": {
            "id": "PEAK_01",
            "name": "Đỉnh Fansipan (3.147m)",
            "category": "peak",
            "elevation_m": 3147,
            "mountain_range": "Dãy Hoàng Liên Sơn",
            "province": "Lào Cai",
            "desc": "Nóc nhà Đông Dương, đỉnh núi cao nhất Việt Nam và toàn bán đảo Đông Dương.",
            "atlat_page": 6
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [102.8028, 22.6283]},
        "properties": {
            "id": "PEAK_02",
            "name": "Đỉnh Pu Si Lung (3.076m)",
            "category": "peak",
            "elevation_m": 3076,
            "mountain_range": "Biên giới Việt - Trung",
            "province": "Lai Châu",
            "desc": "Đỉnh núi cao thứ hai Việt Nam, địa hình hiểm trở vùng biên cương.",
            "atlat_page": 6
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [107.8500, 16.1950]},
        "properties": {
            "id": "PEAK_03",
            "name": "Đỉnh Bạch Mã (1.444m)",
            "category": "peak",
            "elevation_m": 1444,
            "mountain_range": "Dãy Bạch Mã",
            "province": "Thừa Thiên Huế",
            "desc": "Ranh giới tự nhiên giữa miền khí hậu phía Bắc và phía Nam (vĩ tuyến 16°B), bức tường chắn gió mùa Đông Bắc.",
            "atlat_page": 6
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [107.9800, 15.0800]},
        "properties": {
            "id": "PEAK_04",
            "name": "Đỉnh Ngọc Linh (2.598m)",
            "category": "peak",
            "elevation_m": 2598,
            "mountain_range": "Khối núi Kon Tum / Nam Trường Sơn",
            "province": "Kon Tum",
            "desc": "Đỉnh cao nhất vùng Trường Sơn Nam, thủ phủ sâm Ngọc Linh quý hiếm.",
            "atlat_page": 7
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.4300, 12.4000]},
        "properties": {
            "id": "PEAK_05",
            "name": "Đỉnh Chư Yang Sin (2.405m)",
            "category": "peak",
            "elevation_m": 2405,
            "mountain_range": "Khối núi Nam Tây Nguyên",
            "province": "Đắk Lắk",
            "desc": "Đỉnh núi cao nhất vùng Đắk Lắk, thuộc Vườn quốc gia Chư Yang Sin.",
            "atlat_page": 7
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.4400, 12.0400]},
        "properties": {
            "id": "PEAK_06",
            "name": "Đỉnh Langbiang (2.167m)",
            "category": "peak",
            "elevation_m": 2167,
            "mountain_range": "Cao nguyên Lâm Viên",
            "province": "Lâm Đồng",
            "desc": "Biểu tượng nóc nhà Đà Lạt, cảnh quan thiên nhiên và du lịch sinh thái nổi tiếng.",
            "atlat_page": 7
        }
    },

    # --- Dãy núi & Cánh cung lớn ---
    {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [[103.50, 22.60], [103.80, 22.30], [104.20, 21.80], [104.50, 21.40]]
        },
        "properties": {
            "id": "RANGE_01",
            "name": "Dãy Hoàng Liên Sơn",
            "category": "mountain_range",
            "direction": "Tây Bắc - Đông Nam",
            "desc": "Dãy núi cao và đồ sộ nhất Việt Nam chạy theo hướng Tây Bắc - Đông Nam.",
            "atlat_page": 6
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [[105.10, 23.20], [105.40, 22.60], [105.60, 21.80]]
        },
        "properties": {
            "id": "RANGE_02",
            "name": "Cánh cung Sông Gâm",
            "category": "mountain_arc",
            "direction": "Cánh cung chụm đầu ở Tam Đảo",
            "desc": "Cánh cung núi thuộc vùng Đông Bắc, đón gió mùa Đông Bắc lạnh.",
            "atlat_page": 6
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [[105.80, 22.70], [106.00, 22.20], [106.10, 21.60]]
        },
        "properties": {
            "id": "RANGE_03",
            "name": "Cánh cung Ngân Sơn",
            "category": "mountain_arc",
            "direction": "Cánh cung mở rộng về phía Bắc",
            "desc": "Cánh cung Ngân Sơn vùng Đông Bắc, địa hình núi đón gió mùa.",
            "atlat_page": 6
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [[106.30, 22.40], [106.50, 21.90], [106.40, 21.50]]
        },
        "properties": {
            "id": "RANGE_04",
            "name": "Cánh cung Bắc Sơn",
            "category": "mountain_arc",
            "direction": "Cánh cung đá vôi",
            "desc": "Cánh cung Bắc Sơn nổi tiếng với thung lũng đá vôi và văn hóa Bắc Sơn.",
            "atlat_page": 6
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [[107.00, 21.80], [107.10, 21.40], [106.70, 21.10]]
        },
        "properties": {
            "id": "RANGE_05",
            "name": "Cánh cung Đông Triều",
            "category": "mountain_arc",
            "direction": "Cánh cung ven biển Đông Bắc",
            "desc": "Cánh cung Đông Triều ôm trọn vùng than Quảng Ninh và danh thắng Yên Tử.",
            "atlat_page": 6
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [[105.30, 19.30], [105.80, 18.20], [106.20, 17.50], [107.20, 16.30]]
        },
        "properties": {
            "id": "RANGE_06",
            "name": "Dãy Trường Sơn Bắc",
            "category": "mountain_range",
            "direction": "Tây Bắc - Đông Nam",
            "desc": "Từ nam sông Cả tới dãy Bạch Mã, sườn Đông dốc hẹp ăn lan ra biển.",
            "atlat_page": 6
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [[108.00, 15.20], [108.50, 14.00], [108.30, 12.50], [107.80, 11.50]]
        },
        "properties": {
            "id": "RANGE_07",
            "name": "Dãy Trường Sơn Nam",
            "category": "mountain_range",
            "direction": "Vòng cung lồi ra biển Đông",
            "desc": "Khối núi Kon Tum và các cao nguyên badan xếp tầng màu mỡ.",
            "atlat_page": 7
        }
    },

    # --- Các Cao nguyên badan tiêu biểu ---
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [103.90, 21.32]},
        "properties": {"id": "PLA_01", "name": "Cao nguyên Sơn La", "category": "plateau", "province": "Sơn La", "desc": "Cao nguyên đá vôi và đất feralit vùng Tây Bắc, trồng ngô, chè, cây ăn quả ôn đới.", "atlat_page": 6}
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [104.64, 20.84]},
        "properties": {"id": "PLA_02", "name": "Cao nguyên Mộc Châu", "category": "plateau", "province": "Sơn La", "desc": "Khí hậu mát mẻ, nổi tiếng chăn nuôi bò sữa, trồng chè shan tuyết và mận.", "atlat_page": 6}
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.00, 14.35]},
        "properties": {"id": "PLA_03", "name": "Cao nguyên Kon Tum", "category": "plateau", "province": "Kon Tum", "desc": "Cao nguyên phía bắc Tây Nguyên, độ cao ~500m, trồng cà phê, cao su.", "atlat_page": 7}
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.00, 13.98]},
        "properties": {"id": "PLA_04", "name": "Cao nguyên Pleiku", "category": "plateau", "province": "Gia Lai", "desc": "Đất đỏ bazan màu mỡ, vùng chuyên canh cà phê, hồ tiêu, chè lớn.", "atlat_page": 7}
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.04, 12.67]},
        "properties": {"id": "PLA_05", "name": "Cao nguyên Đắk Lắk", "category": "plateau", "province": "Đắk Lắk", "desc": "Cao nguyên bazan diện tích rộng lớn và bằng phẳng nhất, thủ phủ cà phê Buôn Ma Thuột.", "atlat_page": 7}
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [107.60, 12.25]},
        "properties": {"id": "PLA_06", "name": "Cao nguyên Mơ Nông", "category": "plateau", "province": "Đắk Nông", "desc": "Địa hình gợn sóng lượn, giàu khoáng sản bô-xít nhôm và cây công nghiệp lâu năm.", "atlat_page": 7}
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.45, 11.95]},
        "properties": {"id": "PLA_07", "name": "Cao nguyên Lâm Viên", "category": "plateau", "province": "Lâm Đồng", "desc": "Độ cao ~1.500m, khí hậu ôn đới quanh năm, trung tâm rau hoa quả cận nhiệt Đà Lạt.", "atlat_page": 7}
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.08, 11.53]},
        "properties": {"id": "PLA_08", "name": "Cao nguyên Di Linh", "category": "plateau", "province": "Lâm Đồng", "desc": "Độ cao ~1.000m, đất bazan màu mỡ, vùng chuyên canh chè và cà phê robusta.", "atlat_page": 7}
    },

    # --- Hệ thống sông ngòi lớn ---
    {
        "type": "Feature",
        "geometry": {"type": "LineString", "coordinates": [[103.95, 22.50], [104.90, 21.70], [105.35, 21.30], [105.85, 21.05], [106.35, 20.30]]},
        "properties": {"id": "RIV_01", "name": "Sông Hồng", "category": "river", "desc": "Dòng sông bồi đắp đồng bằng sông Hồng trù phú, dài 1.149km (đoạn VN dài 510km).", "atlat_page": 10}
    },
    {
        "type": "Feature",
        "geometry": {"type": "LineString", "coordinates": [[102.85, 22.40], [103.99, 21.49], [105.32, 20.81], [105.35, 21.30]]},
        "properties": {"id": "RIV_02", "name": "Sông Đà", "category": "river", "desc": "Phụ lưu lớn nhất của sông Hồng, giàu tiềm năng thủy điện bậc nhất với chuỗi Lai Châu, Sơn La, Hòa Bình.", "atlat_page": 10}
    },
    {
        "type": "Feature",
        "geometry": {"type": "LineString", "coordinates": [[103.00, 21.30], [104.50, 20.80], [105.90, 19.80]]},
        "properties": {"id": "RIV_03", "name": "Sông Mã", "category": "river", "desc": "Bồi đắp đồng bằng Thanh Hóa rộng lớn.", "atlat_page": 10}
    },
    {
        "type": "Feature",
        "geometry": {"type": "LineString", "coordinates": [[104.20, 19.50], [105.00, 19.00], [105.70, 18.70]]},
        "properties": {"id": "RIV_04", "name": "Sông Cả (Sông Lam)", "category": "river", "desc": "Dòng sông mẹ của xứ Nghệ, bồi đắp đồng bằng Nghệ An - Hà Tĩnh.", "atlat_page": 10}
    },
    {
        "type": "Feature",
        "geometry": {"type": "LineString", "coordinates": [[107.60, 15.80], [108.20, 15.80], [108.40, 15.90]]},
        "properties": {"id": "RIV_05", "name": "Sông Thu Bồn - Vu Gia", "category": "river", "desc": "Hệ thống sông huyết mạch của vùng đất Quảng Nam - Đà Nẵng, cửa biển Hội An.", "atlat_page": 10}
    },
    {
        "type": "Feature",
        "geometry": {"type": "LineString", "coordinates": [[108.40, 11.80], [107.50, 11.30], [106.80, 10.90], [106.80, 10.50]]},
        "properties": {"id": "RIV_06", "name": "Sông Đồng Nai", "category": "river", "desc": "Lưu vực sông nội địa lớn nhất Việt Nam, cung cấp nước ngọt và thủy điện cho Đông Nam Bộ.", "atlat_page": 10}
    },
    {
        "type": "Feature",
        "geometry": {"type": "LineString", "coordinates": [[105.15, 10.80], [105.80, 10.30], [106.40, 10.20]]},
        "properties": {"id": "RIV_07", "name": "Sông Tiền", "category": "river", "desc": "Nhánh chính phía Bắc sông Mê Kông đổ ra biển Đông qua nhiều cửa sông (Cửa Tiểu, Đại, Ba Lai...).", "atlat_page": 10}
    },
    {
        "type": "Feature",
        "geometry": {"type": "LineString", "coordinates": [[105.10, 10.70], [105.65, 10.10], [106.35, 9.60]]},
        "properties": {"id": "RIV_08", "name": "Sông Hậu", "category": "river", "desc": "Nhánh chính phía Nam sông Mê Kông chảy qua Cần Thơ, đổ ra biển qua cửa Định An, Trần Đề.", "atlat_page": 10}
    }
]

# ==============================================================================
# LỚP 3: KHÍ HẬU & THỦY VĂN (Trang 9)
# ==============================================================================
CLIMATE_FEATURES = [
    # Ranh giới khí hậu Bạch Mã 16°B
    {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [[107.20, 16.20], [107.85, 16.20], [108.30, 16.20]]
        },
        "properties": {
            "id": "CLI_BOUND_16",
            "name": "Ranh giới Khí hậu Bắc - Nam (Dãy Bạch Mã 16°B)",
            "category": "climate_boundary",
            "desc": "Ngăn gió mùa Đông Bắc. Phía Bắc có mùa đông lạnh, biên độ nhiệt lớn; Phía Nam tính chất cận xích đạo nóng quanh năm.",
            "atlat_page": 9
        }
    },

    # Các Trạm Khí Tượng Tiêu Biểu
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [106.76, 21.85]},
        "properties": {
            "id": "MET_01",
            "name": "Trạm Khí tượng Lạng Sơn",
            "category": "met_station",
            "avg_temp": "21.2°C",
            "temp_range": "13.7°C",
            "rainfall": "1.400 mm",
            "climate_type": "Nhiệt đới ẩm gió mùa có mùa đông rất lạnh",
            "atlat_page": 9
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [105.80, 21.02]},
        "properties": {
            "id": "MET_02",
            "name": "Trạm Khí tượng Hà Nội (Láng)",
            "category": "met_station",
            "avg_temp": "23.9°C",
            "temp_range": "12.5°C",
            "rainfall": "1.676 mm",
            "climate_type": "Mùa hạ nóng mưa nhiều, mùa đông lạnh ít mưa và có mưa phùn",
            "atlat_page": 9
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [105.68, 18.67]},
        "properties": {
            "id": "MET_03",
            "name": "Trạm Khí tượng Vinh",
            "category": "met_station",
            "avg_temp": "24.1°C",
            "temp_range": "10.9°C",
            "rainfall": "1.944 mm",
            "climate_type": "Mùa đông lạnh, mùa hè chịu hiệu ứng gió phơn Tây Nam khô nóng gay gắt",
            "atlat_page": 9
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [107.59, 16.46]},
        "properties": {
            "id": "MET_04",
            "name": "Trạm Khí tượng Huế",
            "category": "met_station",
            "avg_temp": "25.1°C",
            "temp_range": "9.7°C",
            "rainfall": "2.868 mm",
            "climate_type": "Lượng mưa cực đại vào thu đông (tháng IX - XII) do bão và frông kết hợp địa hình",
            "atlat_page": 9
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.20, 16.05]},
        "properties": {
            "id": "MET_05",
            "name": "Trạm Khí tượng Đà Nẵng",
            "category": "met_station",
            "avg_temp": "25.9°C",
            "temp_range": "7.8°C",
            "rainfall": "2.044 mm",
            "climate_type": "Vùng chuyển tiếp khí hậu Bắc - Nam, mùa khô và mùa mưa rõ rệt",
            "atlat_page": 9
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.45, 11.95]},
        "properties": {
            "id": "MET_06",
            "name": "Trạm Khí tượng Đà Lạt",
            "category": "met_station",
            "avg_temp": "17.9°C",
            "temp_range": "3.4°C",
            "rainfall": "1.739 mm",
            "climate_type": "Khí hậu ôn đới vùng núi cao, nhiệt độ quanh năm dưới 20°C",
            "atlat_page": 9
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [106.66, 10.76]},
        "properties": {
            "id": "MET_07",
            "name": "Trạm Khí tượng TP. Hồ Chí Minh (Tân Sơn Hòa)",
            "category": "met_station",
            "avg_temp": "27.1°C",
            "temp_range": "3.2°C",
            "rainfall": "1.931 mm",
            "climate_type": "Cận xích đạo gió mùa, nóng quanh năm, 2 mùa mưa - khô sâu sắc",
            "atlat_page": 9
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [105.15, 9.18]},
        "properties": {
            "id": "MET_08",
            "name": "Trạm Khí tượng Cà Mau",
            "category": "met_station",
            "avg_temp": "26.8°C",
            "temp_range": "2.4°C",
            "rainfall": "2.360 mm",
            "climate_type": "Biên độ nhiệt năm nhỏ nhất cả nước (< 3°C), lượng mưa dồi dào",
            "atlat_page": 9
        }
    }
]

# ==============================================================================
# LỚP 4: NÔNG, LÂM, THỦY SẢN (Trang 18-20)
# ==============================================================================
AGRICULTURE_FEATURES = [
    # Vùng chuyên canh nông nghiệp
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [105.50, 10.30]},
        "properties": {
            "id": "AGRI_01",
            "name": "Vựa lúa lớn nhất: Đồng bằng sông Cửu Long",
            "category": "crop_specialized",
            "crop_type": "Lúa gạo",
            "symbol": "rice",
            "icon_emoji": "🌾",
            "desc": "Chiếm trên 50% diện tích và sản lượng lúa cả nước, đóng góp trên 90% lượng gạo xuất khẩu.",
            "atlat_page": 19
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [106.30, 20.60]},
        "properties": {
            "id": "AGRI_02",
            "name": "Vựa lúa lớn thứ hai: Đồng bằng sông Hồng",
            "category": "crop_specialized",
            "crop_type": "Lúa gạo",
            "symbol": "rice",
            "icon_emoji": "🌾",
            "desc": "Trình độ thâm canh cao nhất cả nước, năng suất lúa dẫn đầu toàn quốc (Thái Bình, Nam Định).",
            "atlat_page": 19
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.04, 12.67]},
        "properties": {
            "id": "AGRI_03",
            "name": "Vùng chuyên canh Cà phê lớn nhất: Tây Nguyên",
            "category": "crop_specialized",
            "crop_type": "Cà phê & Hồ tiêu",
            "symbol": "coffee",
            "icon_emoji": "☕",
            "desc": "Tây Nguyên dẫn đầu cả nước về diện tích và sản lượng cà phê vối (robusta) và hồ tiêu (Đắk Lắk, Gia Lai).",
            "atlat_page": 19
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [106.85, 11.75]},
        "properties": {
            "id": "AGRI_04",
            "name": "Vùng chuyên canh Cao su lớn nhất: Đông Nam Bộ",
            "category": "crop_specialized",
            "crop_type": "Cao su",
            "symbol": "rubber",
            "icon_emoji": "🌲",
            "desc": "Đông Nam Bộ là thủ phủ cao su Việt Nam (Bình Phước, Bình Dương, Tây Ninh) trên đất badan và xám phù sa cổ.",
            "atlat_page": 19
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [105.80, 21.65]},
        "properties": {
            "id": "AGRI_05",
            "name": "Vùng chuyên canh Chè lớn nhất: Trung du & MN Bắc Bộ",
            "category": "crop_specialized",
            "crop_type": "Chè",
            "symbol": "tea",
            "icon_emoji": "🍵",
            "desc": "Thái Nguyên, Phú Thọ, Yên Bái dẫn đầu cả nước về diện tích và sản lượng chè búp nổi tiếng.",
            "atlat_page": 19
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [106.35, 10.35]},
        "properties": {
            "id": "AGRI_06",
            "name": "Vùng Cây ăn quả lớn nhất: Đồng bằng sông Cửu Long",
            "category": "crop_specialized",
            "crop_type": "Cây ăn quả",
            "symbol": "fruit",
            "icon_emoji": "🍊",
            "desc": "Tiền Giang, Bến Tre, Vĩnh Long chiếm diện tích cây ăn trái nhiệt đới lớn nhất nước (xoài, sầu riêng, bưởi, chôm chôm).",
            "atlat_page": 19
        }
    },

    # 4 Ngư trường trọng điểm
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [107.50, 20.50]},
        "properties": {
            "id": "FISH_01",
            "name": "Ngư trường Hải Phòng - Quảng Ninh",
            "category": "fishing_ground",
            "desc": "Ngư trường trọng điểm vịnh Bắc Bộ, tập trung trữ lượng cá đáy và hải sản xuất khẩu phong phú.",
            "atlat_page": 20
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [109.20, 10.80]},
        "properties": {
            "id": "FISH_02",
            "name": "Ngư trường Ninh Thuận - Bình Thuận - Bà Rịa Vũng Tàu",
            "category": "fishing_ground",
            "desc": "Ngư trường có năng suất khai thác cao nhất cả nước, nguồn lợi cá nục, cá thu, mực nang dồi dào.",
            "atlat_page": 20
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [104.20, 9.50]},
        "properties": {
            "id": "FISH_03",
            "name": "Ngư trường Cà Mau - Kiên Giang",
            "category": "fishing_ground",
            "desc": "Ngư trường vịnh Thái Lan biển ấm nông, trữ lượng tôm cá biển lớn nhất cả nước.",
            "atlat_page": 20
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [112.50, 14.50]},
        "properties": {
            "id": "FISH_04",
            "name": "Ngư trường Quần đảo Hoàng Sa - Quần đảo Trường Sa",
            "category": "fishing_ground",
            "desc": "Ngư trường biển xa bờ giàu tiềm năng cá ngừ đại dương, cá thu và khẳng định chủ quyền thiêng liêng Tổ quốc.",
            "atlat_page": 20
        }
    }
]

def save_geojson(filename, features, metadata_title):
    path = os.path.join(DATA_DIR, filename)
    data = {
        "type": "FeatureCollection",
        "metadata": {
            "title": metadata_title,
            "count": len(features),
            "standard": "Atlat Địa lí Việt Nam & SGK THPT"
        },
        "features": features
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"[+] Saved {path} with {len(features)} features")

def main():
    save_geojson("topography_rivers.geojson", TOPOGRAPHY_FEATURES, "Bản đồ Địa hình & Hệ thống Sông ngòi Việt Nam (Atlat Trang 6-7, 10)")
    save_geojson("climate_hydro.geojson", CLIMATE_FEATURES, "Bản đồ Khí hậu, Thủy văn & Trạm Khí tượng Việt Nam (Atlat Trang 9)")
    save_geojson("agriculture_fishery.geojson", AGRICULTURE_FEATURES, "Bản đồ Nông, Lâm, Thủy sản & Ngư trường Việt Nam (Atlat Trang 18-20)")

if __name__ == "__main__":
    main()

