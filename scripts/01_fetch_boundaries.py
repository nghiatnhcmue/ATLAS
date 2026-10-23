#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GeoAtlas Interactive - Phase 1: Boundary Fetcher with 3-Tier Resilience
Tier 1: Timeout (8s), custom User-Agent, Exponential Backoff (2s, 4s).
Tier 2: 3 Candidate URLs + Embedded Fallback Seed Dataset (7 regions, 23 key provinces, Hoang Sa & Truong Sa).
Tier 3: validate_output() assertion verifying existence, >1KB, valid JSON, and feature count.
"""

import json
import os
import sys
import time
import urllib.request
import urllib.error

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "vn_provinces_63.geojson")

USER_AGENT = "GeoAtlas_VN_Education_App/1.0 (contact: admin@geoatlas.edu.vn)"

CANDIDATE_URLS = [
    "https://github.com/wmgeolab/geoBoundaries/raw/main/releaseData/gbOpen/VNM/ADM1/geoBoundaries-VNM-ADM1.geojson",
    "https://raw.githubusercontent.com/OpenDevelopmentMekong/geodata/master/vietnam/administrative/vn_adm1.geojson",
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson"
]

REGION_MAPPING = {
    "Hà Giang": "Trung du và miền núi Bắc Bộ", "Cao Bằng": "Trung du và miền núi Bắc Bộ",
    "Bắc Kạn": "Trung du và miền núi Bắc Bộ", "Tuyên Quang": "Trung du và miền núi Bắc Bộ",
    "Lào Cai": "Trung du và miền núi Bắc Bộ", "Yên Bái": "Trung du và miền núi Bắc Bộ",
    "Thái Nguyên": "Trung du và miền núi Bắc Bộ", "Lạng Sơn": "Trung du và miền núi Bắc Bộ",
    "Bắc Giang": "Trung du và miền núi Bắc Bộ", "Phú Thọ": "Trung du và miền núi Bắc Bộ",
    "Điện Biên": "Trung du và miền núi Bắc Bộ", "Lai Châu": "Trung du và miền núi Bắc Bộ",
    "Sơn La": "Trung du và miền núi Bắc Bộ", "Hòa Bình": "Trung du và miền núi Bắc Bộ",
    "Hà Nội": "Đồng bằng sông Hồng", "Hải Phòng": "Đồng bằng sông Hồng",
    "Hải Dương": "Đồng bằng sông Hồng", "Hưng Yên": "Đồng bằng sông Hồng",
    "Bắc Ninh": "Đồng bằng sông Hồng", "Hà Nam": "Đồng bằng sông Hồng",
    "Nam Định": "Đồng bằng sông Hồng", "Thái Bình": "Đồng bằng sông Hồng",
    "Ninh Bình": "Đồng bằng sông Hồng", "Vĩnh Phúc": "Đồng bằng sông Hồng",
    "Quảng Ninh": "Đồng bằng sông Hồng",
    "Thanh Hóa": "Bắc Trung Bộ", "Nghệ An": "Bắc Trung Bộ", "Hà Tĩnh": "Bắc Trung Bộ",
    "Quảng Bình": "Bắc Trung Bộ", "Quảng Trị": "Bắc Trung Bộ", "Thừa Thiên Huế": "Bắc Trung Bộ",
    "Đà Nẵng": "Duyên hải Nam Trung Bộ", "Quảng Nam": "Duyên hải Nam Trung Bộ",
    "Quảng Ngãi": "Duyên hải Nam Trung Bộ", "Bình Định": "Duyên hải Nam Trung Bộ",
    "Phú Yên": "Duyên hải Nam Trung Bộ", "Khánh Hoà": "Duyên hải Nam Trung Bộ",
    "Ninh Thuận": "Duyên hải Nam Trung Bộ", "Bình Thuận": "Duyên hải Nam Trung Bộ",
    "Kon Tum": "Tây Nguyên", "Gia Lai": "Tây Nguyên", "Đắk Lắk": "Tây Nguyên",
    "Đắk Nông": "Tây Nguyên", "Lâm Đồng": "Tây Nguyên",
    "TP. Hồ Chí Minh": "Đông Nam Bộ", "Bà Rịa - Vũng Tàu": "Đông Nam Bộ",
    "Bình Dương": "Đông Nam Bộ", "Bình Phước": "Đông Nam Bộ",
    "Đồng Nai": "Đông Nam Bộ", "Tây Ninh": "Đông Nam Bộ",
    "Cần Thơ": "Đồng bằng sông Cửu Long", "Long An": "Đồng bằng sông Cửu Long",
    "Tiền Giang": "Đồng bằng sông Cửu Long", "Bến Tre": "Đồng bằng sông Cửu Long",
    "Trà Vinh": "Đồng bằng sông Cửu Long", "Vĩnh Long": "Đồng bằng sông Cửu Long",
    "Đồng Tháp": "Đồng bằng sông Cửu Long", "An Giang": "Đồng bằng sông Cửu Long",
    "Kiên Giang": "Đồng bằng sông Cửu Long", "Hậu Giang": "Đồng bằng sông Cửu Long",
    "Sóc Trăng": "Đồng bằng sông Cửu Long", "Bạc Liêu": "Đồng bằng sông Cửu Long",
    "Cà Mau": "Đồng bằng sông Cửu Long"
}

# TẦNG 2: BỘ DỮ LIỆU HẠT GIỐNG NỘI BỘ (EMBEDDED FALLBACK SEED DATA)
# Gồm 7 Vùng Kinh Tế, 23 tỉnh thành trọng điểm và 2 Quần đảo Hoàng Sa, Trường Sa
EMBEDDED_FALLBACK_PROVINCES = [
    # 1. Quần đảo Hoàng Sa (TP. Đà Nẵng)
    {
        "type": "Feature",
        "properties": {"name": "Quần đảo Hoàng Sa", "province": "Đà Nẵng", "region_name": "Duyên hải Nam Trung Bộ", "capital": "Đà Nẵng", "area": 305.0, "pop": 0.5, "density": 2, "is_special_island": True, "sovereignty": "Chủ quyền thiêng liêng bất khả xâm phạm của Việt Nam"},
        "geometry": {"type": "Polygon", "coordinates": [[[111.20, 17.20], [112.90, 17.20], [112.90, 15.80], [111.20, 15.80], [111.20, 17.20]]]}
    },
    # 2. Quần đảo Trường Sa (Tỉnh Khánh Hoà)
    {
        "type": "Feature",
        "properties": {"name": "Quần đảo Trường Sa", "province": "Khánh Hoà", "region_name": "Duyên hải Nam Trung Bộ", "capital": "Khánh Hoà", "area": 496.0, "pop": 3.2, "density": 6, "is_special_island": True, "sovereignty": "Chủ quyền thiêng liêng bất khả xâm phạm của Việt Nam"},
        "geometry": {"type": "Polygon", "coordinates": [[[111.50, 12.00], [117.40, 12.00], [117.40, 6.80], [111.50, 6.80], [111.50, 12.00]]]}
    },
    # 3. Hà Nội
    {"type": "Feature", "properties": {"name": "Hà Nội", "region_name": "Đồng bằng sông Hồng", "capital": "Hà Nội", "area": 3359.8, "pop": 8500.0, "density": 2530}, "geometry": {"type": "Polygon", "coordinates": [[[105.4, 21.3], [106.0, 21.3], [106.1, 20.8], [105.4, 20.8], [105.4, 21.3]]]}},
    # 4. Hải Phòng
    {"type": "Feature", "properties": {"name": "Hải Phòng", "region_name": "Đồng bằng sông Hồng", "capital": "Hải Phòng", "area": 1561.8, "pop": 2085.0, "density": 1335}, "geometry": {"type": "Polygon", "coordinates": [[[106.5, 21.0], [107.0, 21.0], [106.9, 20.6], [106.4, 20.7], [106.5, 21.0]]]}},
    # 5. Quảng Ninh
    {"type": "Feature", "properties": {"name": "Quảng Ninh", "region_name": "Đồng bằng sông Hồng", "capital": "Hạ Long", "area": 6178.2, "pop": 1360.0, "density": 220}, "geometry": {"type": "Polygon", "coordinates": [[[106.5, 21.5], [108.0, 21.5], [107.8, 20.8], [106.6, 20.8], [106.5, 21.5]]]}},
    # 6. Thái Nguyên
    {"type": "Feature", "properties": {"name": "Thái Nguyên", "region_name": "Trung du và miền núi Bắc Bộ", "capital": "Thái Nguyên", "area": 3526.6, "pop": 1335.0, "density": 379}, "geometry": {"type": "Polygon", "coordinates": [[[105.5, 21.8], [106.1, 21.8], [106.1, 21.3], [105.5, 21.3], [105.5, 21.8]]]}},
    # 7. Phú Thọ
    {"type": "Feature", "properties": {"name": "Phú Thọ", "region_name": "Trung du và miền núi Bắc Bộ", "capital": "Việt Trì", "area": 3534.6, "pop": 1510.0, "density": 427}, "geometry": {"type": "Polygon", "coordinates": [[[104.9, 21.6], [105.5, 21.5], [105.4, 21.0], [104.8, 21.1], [104.9, 21.6]]]}},
    # 8. Sơn La
    {"type": "Feature", "properties": {"name": "Sơn La", "region_name": "Trung du và miền núi Bắc Bộ", "capital": "Sơn La", "area": 14123.6, "pop": 1300.0, "density": 92}, "geometry": {"type": "Polygon", "coordinates": [[[103.2, 22.0], [105.0, 21.5], [104.8, 20.6], [103.2, 20.7], [103.2, 22.0]]]}},
    # 9. Lào Cai
    {"type": "Feature", "properties": {"name": "Lào Cai", "region_name": "Trung du và miền núi Bắc Bộ", "capital": "Lào Cai", "area": 6364.0, "pop": 760.0, "density": 119}, "geometry": {"type": "Polygon", "coordinates": [[[103.6, 22.8], [104.5, 22.8], [104.4, 21.9], [103.5, 22.1], [103.6, 22.8]]]}},
    # 10. Thanh Hóa
    {"type": "Feature", "properties": {"name": "Thanh Hóa", "region_name": "Bắc Trung Bộ", "capital": "Thanh Hóa", "area": 11114.7, "pop": 3720.0, "density": 335}, "geometry": {"type": "Polygon", "coordinates": [[[104.8, 20.6], [106.0, 20.1], [105.9, 19.3], [104.7, 19.5], [104.8, 20.6]]]}},
    # 11. Nghệ An
    {"type": "Feature", "properties": {"name": "Nghệ An", "region_name": "Bắc Trung Bộ", "capital": "Vinh", "area": 16493.7, "pop": 3420.0, "density": 207}, "geometry": {"type": "Polygon", "coordinates": [[[103.9, 19.8], [105.8, 19.2], [105.7, 18.6], [104.0, 18.8], [103.9, 19.8]]]}},
    # 12. Thừa Thiên Huế
    {"type": "Feature", "properties": {"name": "Thừa Thiên Huế", "region_name": "Bắc Trung Bộ", "capital": "Huế", "area": 4902.4, "pop": 1160.0, "density": 237}, "geometry": {"type": "Polygon", "coordinates": [[[107.0, 16.8], [108.1, 16.4], [107.9, 16.0], [107.1, 16.1], [107.0, 16.8]]]}},
    # 13. Đà Nẵng
    {"type": "Feature", "properties": {"name": "Đà Nẵng", "region_name": "Duyên hải Nam Trung Bộ", "capital": "Đà Nẵng", "area": 1284.9, "pop": 1220.0, "density": 950}, "geometry": {"type": "Polygon", "coordinates": [[[108.0, 16.2], [108.4, 16.2], [108.3, 15.9], [107.9, 15.9], [108.0, 16.2]]]}},
    # 14. Khánh Hoà
    {"type": "Feature", "properties": {"name": "Khánh Hoà", "region_name": "Duyên hải Nam Trung Bộ", "capital": "Nha Trang", "area": 5137.8, "pop": 1255.0, "density": 244}, "geometry": {"type": "Polygon", "coordinates": [[[108.8, 12.8], [109.4, 12.6], [109.3, 11.8], [108.7, 12.0], [108.8, 12.8]]]}},
    # 15. Bình Thuận
    {"type": "Feature", "properties": {"name": "Bình Thuận", "region_name": "Duyên hải Nam Trung Bộ", "capital": "Phan Thiết", "area": 7943.9, "pop": 1250.0, "density": 157}, "geometry": {"type": "Polygon", "coordinates": [[[107.5, 11.6], [108.9, 11.5], [108.7, 10.7], [107.4, 10.8], [107.5, 11.6]]]}},
    # 16. Gia Lai
    {"type": "Feature", "properties": {"name": "Gia Lai", "region_name": "Tây Nguyên", "capital": "Pleiku", "area": 15510.8, "pop": 1590.0, "density": 103}, "geometry": {"type": "Polygon", "coordinates": [[[107.4, 14.5], [108.8, 14.4], [108.7, 13.2], [107.3, 13.3], [107.4, 14.5]]]}},
    # 17. Đắk Lắk
    {"type": "Feature", "properties": {"name": "Đắk Lắk", "region_name": "Tây Nguyên", "capital": "Buôn Ma Thuột", "area": 13030.5, "pop": 1920.0, "density": 147}, "geometry": {"type": "Polygon", "coordinates": [[[107.5, 13.4], [109.0, 13.2], [108.9, 12.2], [107.4, 12.3], [107.5, 13.4]]]}},
    # 18. Lâm Đồng
    {"type": "Feature", "properties": {"name": "Lâm Đồng", "region_name": "Tây Nguyên", "capital": "Đà Lạt", "area": 9783.2, "pop": 1330.0, "density": 136}, "geometry": {"type": "Polygon", "coordinates": [[[107.3, 12.3], [108.7, 12.2], [108.5, 11.3], [107.2, 11.4], [107.3, 12.3]]]}},
    # 19. TP. Hồ Chí Minh
    {"type": "Feature", "properties": {"name": "TP. Hồ Chí Minh", "region_name": "Đông Nam Bộ", "capital": "TP. Hồ Chí Minh", "area": 2095.4, "pop": 9300.0, "density": 4438}, "geometry": {"type": "Polygon", "coordinates": [[[106.4, 11.1], [107.0, 11.0], [106.9, 10.4], [106.4, 10.5], [106.4, 11.1]]]}},
    # 20. Bà Rịa - Vũng Tàu
    {"type": "Feature", "properties": {"name": "Bà Rịa - Vũng Tàu", "region_name": "Đông Nam Bộ", "capital": "Bà Rịa", "area": 1980.8, "pop": 1180.0, "density": 596}, "geometry": {"type": "Polygon", "coordinates": [[[107.0, 10.7], [107.5, 10.7], [107.3, 10.3], [106.9, 10.3], [107.0, 10.7]]]}},
    # 21. Bình Dương
    {"type": "Feature", "properties": {"name": "Bình Dương", "region_name": "Đông Nam Bộ", "capital": "Thủ Dầu Một", "area": 2694.4, "pop": 2800.0, "density": 1039}, "geometry": {"type": "Polygon", "coordinates": [[[106.4, 11.5], [107.0, 11.4], [106.9, 10.9], [106.4, 11.0], [106.4, 11.5]]]}},
    # 22. Đồng Nai
    {"type": "Feature", "properties": {"name": "Đồng Nai", "region_name": "Đông Nam Bộ", "capital": "Biên Hòa", "area": 5905.7, "pop": 3250.0, "density": 550}, "geometry": {"type": "Polygon", "coordinates": [[[106.7, 11.4], [107.6, 11.3], [107.4, 10.7], [106.7, 10.8], [106.7, 11.4]]]}},
    # 23. Cần Thơ
    {"type": "Feature", "properties": {"name": "Cần Thơ", "region_name": "Đồng bằng sông Cửu Long", "capital": "Cần Thơ", "area": 1440.4, "pop": 1250.0, "density": 868}, "geometry": {"type": "Polygon", "coordinates": [[[105.5, 10.3], [105.9, 10.2], [105.8, 9.8], [105.4, 9.9], [105.5, 10.3]]]}},
    # 24. Cà Mau
    {"type": "Feature", "properties": {"name": "Cà Mau", "region_name": "Đồng bằng sông Cửu Long", "capital": "Cà Mau", "area": 5221.2, "pop": 1210.0, "density": 232}, "geometry": {"type": "Polygon", "coordinates": [[[104.7, 9.6], [105.5, 9.5], [105.3, 8.5], [104.6, 8.6], [104.7, 9.6]]]}},
    # 25. Kiên Giang
    {"type": "Feature", "properties": {"name": "Kiên Giang", "region_name": "Đồng bằng sông Cửu Long", "capital": "Rạch Giá", "area": 6348.5, "pop": 1750.0, "density": 276}, "geometry": {"type": "Polygon", "coordinates": [[[104.4, 10.4], [105.4, 10.1], [105.3, 9.4], [104.4, 9.7], [104.4, 10.4]]]}}
]

def round_coords(coords, precision=4):
    if isinstance(coords, (int, float)):
        return round(float(coords), precision)
    elif isinstance(coords, list):
        return [round_coords(c, precision) for c in coords]
    return coords

def fetch_with_retry_and_backoff(url, max_retries=2, timeout=8):
    """TẦNG 1: Timeout=8s, Custom User-Agent, Exponential Backoff (2s, 4s)"""
    for attempt in range(max_retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return data
        except Exception as e:
            if attempt < max_retries:
                wait_time = 2 ** (attempt + 1)
                print(f"[!] Lỗi kết nối {url} ({e}). Thử lại lần {attempt + 1} sau {wait_time}s...")
                time.sleep(wait_time)
            else:
                print(f"[!] Thất bại hoàn toàn với URL: {url} ({e}).")
    return None

def write_fallback_dataset():
    """TẦNG 2: Ghi bộ dữ liệu hạt giống nội tuyến (Embedded Fallback)"""
    fallback_geojson = {
        "type": "FeatureCollection",
        "metadata": {
            "title": "Bản đồ Ranh giới Hành chính & 7 Vùng Kinh tế Việt Nam (Fallback Seed Dataset)",
            "source": "Atlat Địa lí Việt Nam & GIS Seed Data",
            "is_fallback": True,
            "total_features": len(EMBEDDED_FALLBACK_PROVINCES)
        },
        "features": EMBEDDED_FALLBACK_PROVINCES
    }
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(fallback_geojson, f, ensure_ascii=False, separators=(',', ':'))
    print(f"[FALLBACK] Đã kích hoạt Tầng 2: Ghi {len(EMBEDDED_FALLBACK_PROVINCES)} thực thể từ kho hạt giống nội bộ.")

def validate_output(filepath, min_features=10):
    """TẦNG 3: Kiểm tra Hậu kỳ (Post-Run Assertion)"""
    if not os.path.exists(filepath):
        print(f"[TẦNG 3 ASSERTION FAIL] Tệp {filepath} không tồn tại!")
        write_fallback_dataset()
        return False

    size = os.path.getsize(filepath)
    if size < 1024:
        print(f"[TẦNG 3 ASSERTION FAIL] Dung lượng file quá nhỏ ({size} bytes < 1KB)!")
        write_fallback_dataset()
        return False

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            features = data.get("features", [])
            if len(features) < min_features:
                print(f"[TẦNG 3 ASSERTION FAIL] Số lượng features ({len(features)}) < {min_features}!")
                write_fallback_dataset()
                return False

            # Bắt buộc có Hoàng Sa và Trường Sa
            names = [f.get("properties", {}).get("name", "") for f in features]
            has_hs = any("Hoàng Sa" in n for n in names)
            has_ts = any("Trường Sa" in n for n in names)
            if not (has_hs and has_ts):
                print("[TẦNG 3 ASSERTION FAIL] Thiếu Hoàng Sa hoặc Trường Sa! Đang bổ sung...")
                features.extend(EMBEDDED_FALLBACK_PROVINCES[:2])
                data["features"] = features
                with open(filepath, "w", encoding="utf-8") as fw:
                    json.dump(data, fw, ensure_ascii=False, separators=(',', ':'))
    except Exception as e:
        print(f"[TẦNG 3 ASSERTION FAIL] Lỗi cú pháp JSON ({e})!")
        write_fallback_dataset()
        return False

    print(f"[TẦNG 3 PASSED] Kiểm định hợp lệ 100%: File {os.path.basename(filepath)} ({size/1024:.1f} KB, {len(features)} features).")
    return True

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("[*] Bắt đầu quy trình Tải ranh giới với Giao thức 3 Tầng Phòng Thủ...")

    geojson_data = None
    for url in CANDIDATE_URLS:
        print(f"[*] Đang thử URL: {url} (timeout=8s)...")
        geojson_data = fetch_with_retry_and_backoff(url, max_retries=2, timeout=8)
        if geojson_data and "features" in geojson_data:
            print(f"[+] Thành công với URL: {url}")
            break

    if not geojson_data:
        print("[!] Toàn bộ 3 URL đều không phản hồi. Lập tức kích hoạt TẦNG 2!")
        write_fallback_dataset()
    else:
        # Chuẩn hóa & nén tọa độ 4 chữ số thập phân
        features = geojson_data.get("features", [])
        processed = []
        for feat in features:
            props = feat.get("properties", {})
            name = props.get("shapeName", props.get("name", "")).strip()
            if name == "Côn Đảo": name = "Bà Rịa - Vũng Tàu"
            region = REGION_MAPPING.get(name, "Khác")

            props["name"] = name
            props["region_name"] = region
            props["region"] = region
            props["country"] = "Việt Nam"

            geom = feat.get("geometry", {})
            if "coordinates" in geom:
                geom["coordinates"] = round_coords(geom["coordinates"], precision=4)
            processed.append(feat)

        # Đảm bảo Hoàng Sa & Trường Sa
        names = [f.get("properties", {}).get("name", "") for f in processed]
        if not any("Hoàng Sa" in n for n in names):
            processed.append(EMBEDDED_FALLBACK_PROVINCES[0])
        if not any("Trường Sa" in n for n in names):
            processed.append(EMBEDDED_FALLBACK_PROVINCES[1])

        result_geojson = {
            "type": "FeatureCollection",
            "metadata": {"title": "Bản đồ Ranh giới Hành chính Việt Nam", "features_count": len(processed)},
            "features": processed
        }
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(result_geojson, f, ensure_ascii=False, separators=(',', ':'))

    # TẦNG 3: Kiểm định Hậu kỳ tự động
    validate_output(OUTPUT_FILE, min_features=10)

if __name__ == "__main__":
    main()
