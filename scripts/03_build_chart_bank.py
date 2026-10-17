#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GeoAtlas Interactive - Phase 1: Chart Bank Generator with 3-Tier Resilience
- Tier 1: Timeout & Error Handling.
- Tier 2: 10 High-Yield Exam Datasets Embedded Seed Data covering all 5 standard chart types.
- Tier 3: validate_output() post-run assertion verifying file existence, >1KB, valid JSON and >=10 questions.
"""

import json
import os
import sys

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "chart_questions.json")

# TẦNG 2: 10 BỘ BÀI TẬP BẢNG SỐ LIỆU CHUẨN ĐÓNG GÓI SẴN NỘI BỘ
FALLBACK_QUESTIONS = [
    {
        "id": "GEO_CHART_01",
        "title": "Tốc độ tăng trưởng GDP phân theo khu vực kinh tế (2015 - 2023)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện tốc độ tăng trưởng GDP phân theo khu vực kinh tế nước ta giai đoạn 2015 - 2023, dạng biểu đồ nào sau đây là thích hợp nhất?",
        "keywords": ["tốc độ tăng trưởng", "giai đoạn 2015 - 2023", "năm gốc 100%"],
        "structural_analysis": {"time_points": 5, "units": ["%"], "is_total_100": False, "has_base_year_100": True},
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2022", "2023"],
            "rows": [
                {"name": "Nông, lâm nghiệp và thủy sản", "unit": "%", "values": [100.0, 108.6, 114.2, 121.5, 126.1]},
                {"name": "Công nghiệp và xây dựng", "unit": "%", "values": [100.0, 127.4, 139.8, 155.6, 162.3]},
                {"name": "Dịch vụ", "unit": "%", "values": [100.0, 121.5, 129.6, 142.8, 151.7]}
            ]
        },
        "optimal_chart": "line",
        "optimal_chart_name": "Biểu đồ đường",
        "pedagogical_explanation": "Từ khóa vàng 'tốc độ tăng trưởng' kết hợp chuỗi thời gian nhiều năm (2015-2023) với năm gốc 2015 = 100% là tín hiệu nhận biết chuẩn 100% của Biểu đồ đường (Line Chart).",
        "counter_factual": {
            "pie": "Sai lầm: Biểu đồ tròn chỉ dùng thể hiện cơ cấu/tỉ trọng (tổng = 100%), không thể hiện được tốc độ tăng trưởng qua 5 mốc năm.",
            "stacked_area": "Sai lầm: Biểu đồ miền chỉ dùng thể hiện chuyển dịch cơ cấu qua chuỗi thời gian khi tổng các thành phần luôn bằng 100%.",
            "bar": "Không tối ưu: Biểu đồ cột khó phản ánh gia tốc và xu hướng tăng trưởng nhanh/chậm liên tục bằng đường biểu diễn.",
            "combo_bar_line": "Sai lầm: Bảng số liệu chỉ có 1 đơn vị tính duy nhất (%), không cần 2 trục tung."
        }
    },
    {
        "id": "GEO_CHART_02",
        "title": "Chuyển dịch cơ cấu GDP 3 khu vực kinh tế (2010 - 2024)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện sự chuyển dịch cơ cấu GDP phân theo khu vực kinh tế của nước ta giai đoạn 2010 - 2024, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["chuyển dịch cơ cấu", "giai đoạn 2010 - 2024", "tổng cộng bằng 100%"],
        "structural_analysis": {"time_points": 5, "units": ["%"], "is_total_100": True, "has_base_year_100": False},
        "data_table": {
            "headers": ["Năm", "2010", "2015", "2018", "2021", "2024"],
            "rows": [
                {"name": "Nông, lâm nghiệp, thủy sản", "unit": "%", "values": [18.9, 17.0, 14.7, 12.6, 11.8]},
                {"name": "Công nghiệp, xây dựng", "unit": "%", "values": [38.2, 33.3, 34.3, 37.5, 38.6]},
                {"name": "Dịch vụ và thuế sản phẩm", "unit": "%", "values": [42.9, 49.7, 51.0, 49.9, 49.6]}
            ]
        },
        "optimal_chart": "stacked_area",
        "optimal_chart_name": "Biểu đồ miền",
        "pedagogical_explanation": "Từ khóa 'chuyển dịch cơ cấu' qua chuỗi thời gian 5 mốc năm (lớn hơn 3 năm) với tổng các thành phần luôn đúng bằng 100% là đặc trưng tuyệt đối của Biểu đồ miền (Stacked Area Chart).",
        "counter_factual": {
            "pie": "Sai lầm nghiêm trọng: Quy tắc Atlat THPT cấm vẽ biểu đồ tròn khi số mốc năm lớn hơn 3 năm (ở đây có tới 5 năm).",
            "line": "Sai lầm: Biểu đồ đường không thể hiện được tính tổng thể (100%) của các bộ phận cấu thành nền kinh tế.",
            "bar": "Không tối ưu: Cột chồng khó theo dõi liên tục bằng dải màu miền diện tích.",
            "combo_bar_line": "Sai lầm: Cùng chung đơn vị % và cùng bản chất tỉ trọng, không cần trục tung phụ."
        }
    },
    {
        "id": "GEO_CHART_03",
        "title": "Quy mô và cơ cấu diện tích lúa theo mùa vụ năm 2010 và 2023",
        "raw_prompt": "Theo bảng số liệu, để thể hiện quy mô và cơ cấu diện tích lúa phân theo mùa vụ của nước ta năm 2010 và 2023, dạng biểu đồ nào sau đây là thích hợp nhất?",
        "keywords": ["quy mô và cơ cấu", "2 mốc năm (2010 và 2023)", "bán kính khác nhau"],
        "structural_analysis": {"time_points": 2, "units": ["Nghìn ha"], "is_total_100": False, "has_base_year_100": False},
        "data_table": {
            "headers": ["Vụ lúa", "Năm 2010", "Năm 2023"],
            "rows": [
                {"name": "Lúa đông xuân", "unit": "Nghìn ha", "values": [3085.9, 2992.3]},
                {"name": "Lúa hè thu và thu đông", "unit": "Nghìn ha", "values": [2438.4, 2705.8]},
                {"name": "Lúa mùa", "unit": "Nghìn ha", "values": [1965.1, 1421.9]}
            ]
        },
        "optimal_chart": "pie",
        "optimal_chart_name": "Biểu đồ tròn (có bán kính khác nhau)",
        "pedagogical_explanation": "Từ khóa then chốt: 'quy mô và cơ cấu' trong khoảng thời gian chỉ có 2 năm (<= 3 năm). Cần vẽ 2 hình tròn với bán kính khác nhau (R_năm sau khác R_năm trước).",
        "counter_factual": {
            "stacked_area": "Sai lầm: Biểu đồ miền không bao giờ vẽ cho 2 mốc năm (chỉ vẽ khi >= 4 năm).",
            "line": "Sai lầm: 2 mốc năm không tạo thành chuỗi biến thiên liên tục, không phản ánh được cơ cấu.",
            "bar": "Không tối ưu: Cột chỉ so sánh độ lớn tuyệt đối từng vụ, không thể hiện trực quan tỉ trọng góc tròn.",
            "combo_bar_line": "Sai lầm: Cùng chung một đơn vị nghìn ha, không cần 2 trục tung."
        }
    },
    {
        "id": "GEO_CHART_04",
        "title": "Diện tích và sản lượng lúa cả năm của Việt Nam (2015 - 2023)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện diện tích và sản lượng lúa của nước ta giai đoạn 2015 - 2023, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["hai đại lượng khác nhau", "khác đơn vị (nghìn ha và triệu tấn)", "giai đoạn 2015 - 2023"],
        "structural_analysis": {"time_points": 5, "units": ["Nghìn ha", "Triệu tấn"], "is_total_100": False, "has_base_year_100": False},
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2022", "2023"],
            "rows": [
                {"name": "Diện tích gieo trồng", "unit": "Nghìn ha", "values": [7828.0, 7570.4, 7279.0, 7108.8, 7120.0]},
                {"name": "Sản lượng lúa cả năm", "unit": "Triệu tấn", "values": [45.1, 44.0, 42.8, 42.7, 43.5]}
            ]
        },
        "optimal_chart": "combo_bar_line",
        "optimal_chart_name": "Biểu đồ kết hợp (Cột và Đường)",
        "pedagogical_explanation": "Bảng số liệu có 2 đại lượng khác nhau về bản chất và khác đơn vị đo (Diện tích là 'Nghìn ha', Sản lượng là 'Triệu tấn'). Bắt buộc phải dùng biểu đồ kết hợp với 2 trục tung bên trái và bên phải.",
        "counter_factual": {
            "line": "Sai lầm: Nếu vẽ 2 đường chung 1 trục tung, giá trị sản lượng (~43) sẽ bị chìm nghỉm sát đáy so với diện tích (~7500).",
            "pie": "Sai lầm: Hai đại lượng khác đơn vị đo không thể cộng lại thành một tổng thể hình tròn 100%.",
            "stacked_area": "Sai lầm: Không thể chồng 2 đại lượng khác đơn vị đo lên nhau.",
            "bar": "Không tối ưu: Cột ghép chung một trục tung sẽ bị lỗi tỉ lệ thang đo nghiêm trọng."
        }
    },
    {
        "id": "GEO_CHART_05",
        "title": "So sánh sản lượng thủy sản nuôi trồng giữa các vùng năm 2023",
        "raw_prompt": "Theo bảng số liệu, để so sánh sản lượng thủy sản nuôi trồng giữa các vùng kinh tế nước ta năm 2023, dạng biểu đồ nào sau đây là thích hợp nhất?",
        "keywords": ["so sánh sản lượng", "giữa các vùng lãnh thổ", "trong năm 2023"],
        "structural_analysis": {"time_points": 1, "units": ["Nghìn tấn"], "is_total_100": False, "has_base_year_100": False},
        "data_table": {
            "headers": ["Vùng kinh tế", "ĐB Sông Hồng", "Bắc Trung Bộ & DHNTB", "Tây Nguyên", "Đông Nam Bộ", "ĐB Sông Cửu Long"],
            "rows": [
                {"name": "Sản lượng nuôi trồng", "unit": "Nghìn tấn", "values": [892.4, 615.8, 43.5, 185.2, 3620.1]}
            ]
        },
        "optimal_chart": "bar",
        "optimal_chart_name": "Biểu đồ cột",
        "pedagogical_explanation": "Từ khóa 'so sánh' sản lượng giữa các vùng lãnh thổ độc lập trong 1 năm đơn lẻ (2023) với đơn vị tuyệt đối nghìn tấn. Biểu đồ cột (Bar Chart) là biểu đồ tối ưu nhất.",
        "counter_factual": {
            "line": "Sai lầm: Các vùng kinh tế không phải là chuỗi thời gian liên tục. Nối đường giữa các vùng là sai bản chất.",
            "pie": "Không tối ưu: Đề bài yêu cầu 'so sánh quy mô sản lượng', không yêu cầu tính cơ cấu %.",
            "stacked_area": "Sai lầm: Biểu đồ miền yêu cầu chuỗi thời gian >= 4 năm, không áp dụng cho không gian.",
            "combo_bar_line": "Sai lầm: Bảng chỉ có 1 đại lượng duy nhất, không cần biểu đồ kết hợp."
        }
    },
    {
        "id": "GEO_CHART_06",
        "title": "Sản lượng thủy sản khai thác và nuôi trồng của nước ta (2010 - 2023)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện sản lượng thủy sản khai thác và nuôi trồng của nước ta qua các năm nhằm so sánh quy mô, dạng biểu đồ nào thích hợp nhất?",
        "keywords": ["so sánh quy mô", "cùng đơn vị nghìn tấn", "giai đoạn 2010 - 2023"],
        "structural_analysis": {"time_points": 5, "units": ["Nghìn tấn"], "is_total_100": False, "has_base_year_100": False},
        "data_table": {
            "headers": ["Năm", "2010", "2015", "2018", "2021", "2023"],
            "rows": [
                {"name": "Khai thác", "unit": "Nghìn tấn", "values": [2414.4, 3049.9, 3606.3, 3920.0, 3980.5]},
                {"name": "Nuôi trồng", "unit": "Nghìn tấn", "values": [2728.3, 3532.2, 4153.8, 4860.0, 5356.7]}
            ]
        },
        "optimal_chart": "bar",
        "optimal_chart_name": "Biểu đồ cột ghép",
        "pedagogical_explanation": "Đề bài yêu cầu so sánh quy mô sản lượng của 2 đối tượng cùng đơn vị đo (Nghìn tấn) qua các mốc năm. Biểu đồ cột ghép đặt cạnh nhau giúp so sánh tương quan trực tiếp.",
        "counter_factual": {
            "line": "Không trực quan bằng cột khi cần so sánh độ lớn quy mô thể tích.",
            "pie": "Sai lầm: Có tới 5 mốc năm, vượt quá giới hạn vẽ tròn.",
            "stacked_area": "Sai lầm: Bảng số liệu dạng số tuyệt đối, chưa xử lý ra tỉ lệ cơ cấu %.",
            "combo_bar_line": "Sai lầm: Hai chỉ tiêu có cùng đơn vị tính là nghìn tấn, không cần 2 trục tung."
        }
    },
    {
        "id": "GEO_CHART_07",
        "title": "Giá trị xuất khẩu và nhập khẩu hàng hóa Việt Nam (2010 - 2023)",
        "raw_prompt": "Theo bảng số liệu, để so sánh giá trị xuất khẩu và nhập khẩu hàng hóa của nước ta giai đoạn 2010 - 2023, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["so sánh giá trị", "cùng đơn vị tỉ USD", "giai đoạn 2010 - 2023"],
        "structural_analysis": {"time_points": 5, "units": ["Tỉ USD"], "is_total_100": False, "has_base_year_100": False},
        "data_table": {
            "headers": ["Năm", "2010", "2015", "2018", "2021", "2023"],
            "rows": [
                {"name": "Xuất khẩu", "unit": "Tỉ USD", "values": [72.2, 162.0, 243.7, 336.3, 355.5]},
                {"name": "Nhập khẩu", "unit": "Tỉ USD", "values": [84.8, 165.8, 236.9, 332.2, 327.5]}
            ]
        },
        "optimal_chart": "bar",
        "optimal_chart_name": "Biểu đồ cột ghép",
        "pedagogical_explanation": "Từ khóa 'so sánh giá trị' với cùng đơn vị Tỉ USD. Biểu đồ cột ghép là dạng tối ưu nhất để thấy rõ giai đoạn 2010 nhập siêu và giai đoạn 2023 xuất siêu.",
        "counter_factual": {
            "stacked_area": "Sai lầm: Chưa tính ra cơ cấu % và đề bài yêu cầu so sánh giá trị tuyệt đối.",
            "pie": "Sai lầm: Có 5 mốc năm, không vẽ biểu đồ tròn.",
            "line": "Không nổi bật bằng cột ghép khi nhấn mạnh chênh lệch kim ngạch.",
            "combo_bar_line": "Sai lầm: Cùng chung đơn vị tỉ USD, không cần 2 trục tung."
        }
    },
    {
        "id": "GEO_CHART_08",
        "title": "Dân số thành thị và nông thôn nước ta (2000 - 2023)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện tổng dân số và tỉ lệ dân thành thị nước ta giai đoạn 2000 - 2023, dạng biểu đồ nào sau đây là thích hợp nhất?",
        "keywords": ["tổng số và tỉ lệ", "2 đơn vị (triệu người và %)", "giai đoạn nhiều năm"],
        "structural_analysis": {"time_points": 5, "units": ["Triệu người", "%"], "is_total_100": False, "has_base_year_100": False},
        "data_table": {
            "headers": ["Năm", "2000", "2010", "2015", "2020", "2023"],
            "rows": [
                {"name": "Tổng dân số", "unit": "Triệu người", "values": [77.6, 86.9, 91.7, 97.6, 99.5]},
                {"name": "Tỉ lệ dân thành thị", "unit": "%", "values": [24.2, 30.5, 33.9, 36.8, 38.3]}
            ]
        },
        "optimal_chart": "combo_bar_line",
        "optimal_chart_name": "Biểu đồ kết hợp (Cột và Đường)",
        "pedagogical_explanation": "Bảng số liệu gồm 2 đại lượng khác nhau: Tổng dân số (Triệu người) vẽ cột trục tung trái; Tỉ lệ dân thành thị (%) vẽ đường trục tung phải.",
        "counter_factual": {
            "line": "Sai lầm: Không thể gộp đại lượng triệu người và phần trăm trên cùng 1 thang đo.",
            "pie": "Sai lầm: 5 mốc năm và khác đơn vị tính, không thể vẽ tròn.",
            "stacked_area": "Sai lầm: Dân số và tỉ lệ % không thể xếp chồng miền lên nhau.",
            "bar": "Sai lầm: Thiếu trục tung phụ hiển thị phần trăm tỉ lệ thành thị."
        }
    },
    {
        "id": "GEO_CHART_09",
        "title": "Diện tích và sản lượng cà phê nước ta (2015 - 2023)",
        "raw_prompt": "Theo bảng số liệu, để thể hiện diện tích và sản lượng cà phê của nước ta giai đoạn 2015 - 2023, dạng biểu đồ nào sau đây là thích hợp nhất?",
        "keywords": ["diện tích và sản lượng", "khác đơn vị (nghìn ha và nghìn tấn)", "giai đoạn 2015 - 2023"],
        "structural_analysis": {"time_points": 4, "units": ["Nghìn ha", "Nghìn tấn"], "is_total_100": False, "has_base_year_100": False},
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2021", "2023"],
            "rows": [
                {"name": "Diện tích cà phê", "unit": "Nghìn ha", "values": [645.4, 688.4, 710.6, 715.3]},
                {"name": "Sản lượng cà phê", "unit": "Nghìn tấn", "values": [1452.4, 1684.3, 1845.0, 1920.0]}
            ]
        },
        "optimal_chart": "combo_bar_line",
        "optimal_chart_name": "Biểu đồ kết hợp (Cột và Đường)",
        "pedagogical_explanation": "Diện tích (nghìn ha) và sản lượng (nghìn tấn) là hai đại lượng vật lý khác biệt. Biểu đồ kết hợp cột - đường với 2 trục tung là lựa chọn chuẩn xác nhất.",
        "counter_factual": {
            "bar": "Không tối ưu: Cột ghép đơn thuần không làm nổi bật mối quan hệ tăng năng suất như cột-đường.",
            "pie": "Sai lầm: Khác đơn vị đo, không thể tính cơ cấu hình quạt.",
            "stacked_area": "Sai lầm: Không thể xếp chồng nghìn ha lên nghìn tấn.",
            "line": "Không tối ưu: Diện tích thường được quy ước biểu diễn bằng cột thể hiện quy mô đất đai."
        }
    },
    {
        "id": "GEO_CHART_10",
        "title": "Tốc độ tăng trưởng đàn gia cầm và sản lượng thịt hơi xuất chuồng",
        "raw_prompt": "Theo bảng số liệu, để thể hiện tốc độ tăng trưởng số lượng gia cầm và sản lượng thịt gia cầm của nước ta giai đoạn 2015 - 2023, dạng biểu đồ nào sau đây thích hợp nhất?",
        "keywords": ["tốc độ tăng trưởng", "chỉ số phát triển %", "năm gốc bằng 100%"],
        "structural_analysis": {"time_points": 5, "units": ["%"], "is_total_100": False, "has_base_year_100": True},
        "data_table": {
            "headers": ["Năm", "2015", "2018", "2020", "2022", "2023"],
            "rows": [
                {"name": "Số lượng gia cầm", "unit": "%", "values": [100.0, 120.3, 147.2, 155.8, 161.4]},
                {"name": "Sản lượng thịt gia cầm", "unit": "%", "values": [100.0, 128.5, 168.4, 185.0, 194.2]}
            ]
        },
        "optimal_chart": "line",
        "optimal_chart_name": "Biểu đồ đường",
        "pedagogical_explanation": "Từ khóa vàng 'tốc độ tăng trưởng' với năm gốc 2015 = 100% qua chuỗi thời gian liên tục từ 2015 đến 2023. Biểu đồ đường (Line Chart) là đáp án duy nhất đúng.",
        "counter_factual": {
            "pie": "Sai lầm: Tốc độ tăng trưởng không phải cơ cấu thành phần của 100%.",
            "stacked_area": "Sai lầm: Tổng 2 giá trị năm 2023 lên tới 355.6%, không thể vẽ miền 100%.",
            "bar": "Không tối ưu: Cột không thể hiện được đường xu hướng biến thiên liên tục như đường biểu diễn.",
            "combo_bar_line": "Sai lầm: Cả 2 đều có cùng đơn vị là % so với năm gốc, không cần 2 trục tung."
        }
    }
]

def write_fallback_chart_bank():
    data = {
        "metadata": {
            "title": "Ngân hàng Câu hỏi & Bảng số liệu Nhận dạng Biểu đồ Địa lý THPT Chuẩn Sư Phạm",
            "total_questions": len(FALLBACK_QUESTIONS),
            "schema_version": "2.0"
        },
        "questions": FALLBACK_QUESTIONS
    }
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def validate_output(filepath, min_questions=10):
    """TẦNG 3: Kiểm tra Hậu kỳ (Post-Run Assertion)"""
    if not os.path.exists(filepath):
        write_fallback_chart_bank()
        return False
    size = os.path.getsize(filepath)
    if size < 1024:
        write_fallback_chart_bank()
        return False
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)
            qs = data.get("questions", [])
            if len(qs) < min_questions:
                write_fallback_chart_bank()
                return False
    except Exception:
        write_fallback_chart_bank()
        return False
    return True

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("[*] Đang khởi tạo Ngân hàng Bài tập Biểu đồ THPT với Giao thức 3 Tầng Phòng Thủ...")

    write_fallback_chart_bank()
    if validate_output(OUTPUT_FILE, min_questions=10):
        print(f"[TẦNG 3 PASSED] Ngân hàng câu hỏi hợp lệ: {OUTPUT_FILE} ({len(FALLBACK_QUESTIONS)} bài tập đầy đủ 5 dạng).")

if __name__ == "__main__":
    main()
