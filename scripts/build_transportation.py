import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data")
os.makedirs(DATA_DIR, exist_ok=True)

OUT_PATH = os.path.join(DATA_DIR, "transportation.geojson")

features = [
    # =========================================================================
    # 1. CÁC TUYẾN HUYẾT MẠCH (LINESTRINGS)
    # =========================================================================
    {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [106.71, 21.98], # Cửa khẩu Hữu Nghị (Lạng Sơn)
                [106.76, 21.85], # TP. Lạng Sơn
                [106.20, 21.27], # TP. Bắc Giang
                [106.07, 21.18], # TP. Bắc Ninh
                [105.85, 21.03], # Thủ đô Hà Nội
                [105.92, 20.54], # Phủ Lý (Hà Nam)
                [105.97, 20.25], # TP. Ninh Bình
                [105.78, 19.81], # TP. Thanh Hoá
                [105.68, 18.67], # TP. Vinh (Nghệ An)
                [105.90, 18.34], # TP. Hà Tĩnh
                [106.60, 17.47], # TP. Đồng Hới (Quảng Bình)
                [107.10, 16.82], # TP. Đông Hà (Quảng Trị)
                [107.59, 16.46], # TP. Huế
                [108.22, 16.07], # TP. Đà Nẵng
                [108.48, 15.57], # TP. Tam Kỳ (Quảng Nam)
                [108.80, 15.12], # TP. Quảng Ngãi
                [109.22, 13.78], # TP. Quy Nhơn (Bình Định)
                [109.30, 13.09], # TP. Tuy Hòa (Phú Yên)
                [109.19, 12.24], # TP. Nha Trang (Khánh Hoà)
                [108.99, 11.57], # TP. Phan Rang (Ninh Thuận)
                [108.10, 10.93], # TP. Phan Thiết (Bình Thuận)
                [106.82, 10.95], # TP. Biên Hòa (Đồng Nai)
                [106.66, 10.78], # TP. Hồ Chí Minh
                [106.41, 10.54], # TP. Tân An (Long An)
                [106.36, 10.36], # TP. Mỹ Tho (Tiền Giang)
                [105.97, 10.25], # TP. Vĩnh Long
                [105.78, 10.04], # TP. Cần Thơ
                [105.77, 9.78],  # TP. Vị Thanh (Hậu Giang)
                [105.97, 9.60],  # TP. Sóc Trăng
                [105.73, 9.29],  # TP. Bạc Liêu
                [105.15, 9.18],  # TP. Cà Mau
                [104.99, 8.75]   # Huyện Năm Căn (Cà Mau)
            ]
        },
        "properties": {
            "id": "ROAD_QL1A",
            "name": "Quốc lộ 1A (Trục Xương Sống Bắc - Nam)",
            "category": "national_highway",
            "code": "QL.1A",
            "length_km": 2301,
            "start_point": "Cửa khẩu Hữu Nghị (Lạng Sơn)",
            "end_point": "Huyện Năm Căn (Cà Mau)",
            "desc": "Tuyến giao thông đường bộ huyết mạch nối liền 31 tỉnh thành từ Bắc vào Nam, đóng vai trò phát triển kinh tế - xã hội và an ninh quốc phòng.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [106.05, 22.98], # Pác Bó (Cao Bằng)
                [105.80, 22.15], # Bắc Kạn
                [105.84, 21.59], # Thái Nguyên
                [105.40, 20.82], # Hòa Bình
                [105.25, 19.30], # Tân Kỳ (Nghệ An) - Km 0 đường Hồ Chí Minh
                [105.37, 18.25], # Phố Châu (Hà Tĩnh)
                [106.10, 17.50], # Xuân Sơn (Quảng Bình)
                [106.98, 16.78], # Cam Lộ (Quảng Trị)
                [107.25, 16.20], # A Lưới (Thừa Thiên Huế)
                [107.75, 15.65], # Nam Giang (Quảng Nam)
                [107.98, 14.35], # TP. Kon Tum
                [108.01, 13.98], # TP. Pleiku (Gia Lai)
                [108.04, 12.67], # TP. Buôn Ma Thuột (Đắk Lắk)
                [107.69, 12.00], # TP. Gia Nghĩa (Đắk Nông)
                [106.68, 11.55], # Chơn Thành (Bình Phước)
                [105.45, 10.60], # Tháp Mười (Đồng Tháp)
                [105.15, 9.18],  # TP. Cà Mau
                [104.75, 8.61]   # Mũi Cà Mau (Đất Mũi)
            ]
        },
        "properties": {
            "id": "ROAD_HCM",
            "name": "Đường Hồ Chí Minh",
            "category": "national_highway",
            "code": "Đường HCM",
            "length_km": 3183,
            "start_point": "Pác Bó (Cao Bằng)",
            "end_point": "Đất Mũi (Cà Mau)",
            "desc": "Tuyến giao thông chiến lược thứ hai chạy dọc sườn Tây Tổ quốc qua Trường Sơn và Tây Nguyên, phá thế độc đạo của QL1A.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [
                [105.84, 21.02], # Ga Hà Nội
                [105.92, 20.54], # Phủ Lý
                [105.97, 20.25], # Ninh Bình
                [105.78, 19.81], # Thanh Hoá
                [105.68, 18.67], # Vinh
                [105.90, 18.34], # Hà Tĩnh
                [106.60, 17.47], # Đồng Hới
                [107.10, 16.82], # Đông Hà
                [107.59, 16.46], # Huế
                [108.22, 16.07], # Ga Đà Nẵng
                [108.48, 15.57], # Tam Kỳ
                [108.80, 15.12], # Quảng Ngãi
                [109.10, 13.78], # Diêu Trì (Bình Định)
                [109.30, 13.09], # Tuy Hòa
                [109.19, 12.24], # Nha Trang
                [108.99, 11.57], # Tháp Chàm
                [108.10, 10.93], # Mương Mán / Phan Thiết
                [106.82, 10.95], # Biên Hòa
                [106.68, 10.78]  # Ga Sài Gòn (TP.HCM)
            ]
        },
        "properties": {
            "id": "RAILWAY_BN",
            "name": "Đường sắt Thống Nhất (Bắc - Nam)",
            "category": "railway",
            "code": "ĐS. Bắc - Nam",
            "length_km": 1726,
            "start_point": "Ga Hà Nội",
            "end_point": "Ga Sài Gòn (TP.HCM)",
            "desc": "Tuyến đường sắt huyết mạch xương sống dài nhất Việt Nam, kết nối hai đầu cầu kinh tế Bắc - Nam.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },

    # =========================================================================
    # 2. CẢNG HÀNG KHÔNG / SÂN BAY (POINTS)
    # =========================================================================
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [105.80, 21.22]},
        "properties": {
            "id": "AIR_HAN",
            "name": "Cảng hàng không Quốc tế Nội Bài",
            "short_name": "Sân bay Nội Bài (HAN)",
            "category": "airport_intl",
            "province": "Hà Nội",
            "code": "HAN",
            "desc": "Cửa ngõ hàng không quốc tế lớn nhất miền Bắc, trung tâm vận tải hàng không Vùng Thủ đô.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [106.65, 10.82]},
        "properties": {
            "id": "AIR_SGN",
            "name": "Cảng hàng không Quốc tế Tân Sơn Nhất",
            "short_name": "Sân bay Tân Sơn Nhất (SGN)",
            "category": "airport_intl",
            "province": "TP. Hồ Chí Minh",
            "code": "SGN",
            "desc": "Sân bay có sản lượng hành khách và hàng hóa lớn nhất cả nước.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.20, 16.04]},
        "properties": {
            "id": "AIR_DAD",
            "name": "Cảng hàng không Quốc tế Đà Nẵng",
            "short_name": "Sân bay Đà Nẵng (DAD)",
            "category": "airport_intl",
            "province": "Đà Nẵng",
            "code": "DAD",
            "desc": "Cửa ngõ hàng không quốc tế miền Trung và đầu mối Hành lang kinh tế Đông - Tây.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [109.21, 11.99]},
        "properties": {
            "id": "AIR_CXR",
            "name": "Cảng hàng không Quốc tế Cam Ranh",
            "short_name": "Sân bay Cam Ranh (CXR)",
            "category": "airport_intl",
            "province": "Khánh Hoà",
            "code": "CXR",
            "desc": "Sân bay quốc tế trọng điểm phục vụ du lịch Nam Trung Bộ và Tây Nguyên.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [106.72, 20.82]},
        "properties": {
            "id": "AIR_HPH",
            "name": "Cảng hàng không Quốc tế Cát Bi",
            "short_name": "Sân bay Cát Bi (HPH)",
            "category": "airport_intl",
            "province": "Hải Phòng",
            "code": "HPH",
            "desc": "Cửa ngõ hàng không của Vùng Duyên hải Bắc Bộ.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [105.71, 10.08]},
        "properties": {
            "id": "AIR_VCA",
            "name": "Cảng hàng không Quốc tế Cần Thơ",
            "short_name": "Sân bay Cần Thơ (VCA)",
            "category": "airport_intl",
            "province": "Cần Thơ",
            "code": "VCA",
            "desc": "Sân bay quốc tế trung tâm vùng Đồng bằng sông Cửu Long.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [103.99, 10.17]},
        "properties": {
            "id": "AIR_PQC",
            "name": "Cảng hàng không Quốc tế Phú Quốc",
            "short_name": "Sân bay Phú Quốc (PQC)",
            "category": "airport_intl",
            "province": "Kiên Giang",
            "code": "PQC",
            "desc": "Cảng hàng không quốc tế đảo ngọc phục vụ phát triển kinh tế biển đảo.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [103.00, 21.39]},
        "properties": {
            "id": "AIR_DIN",
            "name": "Cảng hàng không Điện Biên Phủ",
            "short_name": "Sân bay Điện Biên Phủ (DIN)",
            "category": "airport_domestic",
            "province": "Điện Biên",
            "code": "DIN",
            "desc": "Cảng hàng không trọng yếu vùng Tây Bắc nối Thủ đô Hà Nội và TP.HCM.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.12, 12.67]},
        "properties": {
            "id": "AIR_BMV",
            "name": "Cảng hàng không Buôn Ma Thuột",
            "short_name": "Sân bay Buôn Ma Thuột (BMV)",
            "category": "airport_domestic",
            "province": "Đắk Lắk",
            "code": "BMV",
            "desc": "Đầu mối hàng không quan trọng của vùng Tây Nguyên.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },

    # =========================================================================
    # 3. CẢNG BIỂN NƯỚC SÂU / LOẠI ĐẶC BIỆT & LOẠI 1 (POINTS)
    # =========================================================================
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [106.87, 20.84]},
        "properties": {
            "id": "SEAPORT_HP",
            "name": "Cụm Cảng biển Hải Phòng (Lạch Huyện)",
            "short_name": "Cảng Hải Phòng",
            "category": "seaport_special",
            "province": "Hải Phòng",
            "desc": "Cảng biển nước sâu loại đặc biệt lớn nhất miền Bắc, tiếp nhận tàu trọng tải trên 100.000 DWT đi thẳng châu Mỹ, châu Âu.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [107.03, 10.51]},
        "properties": {
            "id": "SEAPORT_CMTV",
            "name": "Cụm Cảng biển nước sâu Cái Mép - Thị Vải",
            "short_name": "Cảng Cái Mép - Thị Vải",
            "category": "seaport_special",
            "province": "Bà Rịa - Vũng Tàu",
            "desc": "Cụm cảng nước sâu loại đặc biệt lớn nhất Đông Nam Bộ, thuộc nhóm cảng có tốc độ tăng trưởng nhanh nhất thế giới.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [106.75, 10.76]},
        "properties": {
            "id": "SEAPORT_SGN",
            "name": "Cụm Cảng biển Sài Gòn (Cát Lái)",
            "short_name": "Cảng Sài Gòn (Cát Lái)",
            "category": "seaport_major",
            "province": "TP. Hồ Chí Minh",
            "desc": "Cảng container có sản lượng hàng hóa thông qua lớn nhất Việt Nam (chiếm trên 50% thị phần container cả nước).",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.21, 16.12]},
        "properties": {
            "id": "SEAPORT_DAD",
            "name": "Cảng biển Đà Nẵng (Tiên Sa)",
            "short_name": "Cảng Đà Nẵng (Tiên Sa)",
            "category": "seaport_major",
            "province": "Đà Nẵng",
            "desc": "Cảng biển tổng hợp quốc gia loại 1, cửa ngõ biển chính của Hành lang kinh tế Đông - Tây.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [105.81, 19.31]},
        "properties": {
            "id": "SEAPORT_NGHISOH",
            "name": "Cảng biển Nghi Sơn",
            "short_name": "Cảng Nghi Sơn",
            "category": "seaport_major",
            "province": "Thanh Hoá",
            "desc": "Cảng chuyên dùng nước sâu phục vụ Khu kinh tế Nghi Sơn và liên hợp lọc hóa dầu.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [108.78, 15.40]},
        "properties": {
            "id": "SEAPORT_DQ",
            "name": "Cảng biển Dung Quất",
            "short_name": "Cảng Dung Quất",
            "category": "seaport_major",
            "province": "Quảng Ngãi",
            "desc": "Cảng nước sâu gắn liền Khu kinh tế Dung Quất và Nhà máy Lọc dầu Dung Quất đầu tiên của Việt Nam.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    },
    {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": [109.25, 13.77]},
        "properties": {
            "id": "SEAPORT_QN",
            "name": "Cảng biển Quy Nhơn",
            "short_name": "Cảng Quy Nhơn",
            "category": "seaport_major",
            "province": "Bình Định",
            "desc": "Cửa ngõ ra Biển Đông quan trọng nhất của vùng Tây Nguyên và Nam Lào.",
            "atlat_page": 23,
            "source": "Atlat GD, tr.23 (DHQG, tr.19)"
        }
    }
]

geojson = {
    "type": "FeatureCollection",
    "metadata": {
        "title": "Mạng lưới Giao thông Vận tải Việt Nam (Atlat GD, tr.23)",
        "national_highways_count": 2,
        "railways_count": 1,
        "airports_count": 9,
        "seaports_count": 7,
        "source": "Atlat GD, tr.23 (DHQG, tr.19)"
    },
    "features": features
}

with open(OUT_PATH, "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)

print(f"Generated {OUT_PATH} successfully! Total features: {len(features)}")

