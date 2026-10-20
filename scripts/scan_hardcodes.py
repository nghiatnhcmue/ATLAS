import os
import re
import json
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

hardcodes = []

# Scan geo-calculator.js
with open("js/geo-calculator.js", "r", encoding="utf-8") as f:
    lines = f.readlines()

in_sample_table = False
current_formula = ""
for idx, line in enumerate(lines):
    line_no = idx + 1
    # Check formula definition
    if re.search(r'^\s*([a-z_]+):\s*\{', line):
        m = re.search(r'^\s*([a-z_]+):\s*\{', line)
        if m.group(1) not in ["inputs", "sampleTable", "solve", "defaultVal", "units"]:
            current_formula = m.group(1)
    
    if "sampleTable:" in line:
        in_sample_table = True
        hardcodes.append({
            "file": "js/geo-calculator.js",
            "line": line_no,
            "category": f"Bảng số liệu mẫu (Công thức {current_formula})",
            "snippet": line.strip()[:80],
            "in_sources": "Chưa có trích dẫn nguồn chuẩn (thuộc DATA_GAPS)"
        })
    elif in_sample_table and "};" in line:
        in_sample_table = False

    if "defaultVal:" in line:
        hardcodes.append({
            "file": "js/geo-calculator.js",
            "line": line_no,
            "category": f"Giá trị mặc định ô nhập ({current_formula})",
            "snippet": line.strip()[:80],
            "in_sources": "Giá trị mẫu giả định, chưa gắn nguồn Atlat"
        })

# Scan chart-trainer.js
with open("js/chart-trainer.js", "r", encoding="utf-8") as f:
    ct_lines = f.readlines()

for idx, line in enumerate(ct_lines):
    line_no = idx + 1
    if "const SIGNAL_KEYWORDS" in line or "const CORE_6_CHART_TYPES" in line:
        hardcodes.append({
            "file": "js/chart-trainer.js",
            "line": line_no,
            "category": "Từ khóa tín hiệu & Định nghĩa 6 dạng biểu đồ",
            "snippet": line.strip()[:80],
            "in_sources": "Có trong biểu đồ.docx (cần tách ra chart-rules.json)"
        })
    if "loadCustomSample" in line and "const samples =" in line:
        hardcodes.append({
            "file": "js/chart-trainer.js",
            "line": line_no,
            "category": "4 Bảng số liệu mẫu đề thi thử AI Table Analyzer",
            "snippet": line.strip()[:80],
            "in_sources": "Dữ liệu mẫu mô phỏng đề thi THPT, cần bổ sung source"
        })

# Scan atlas-engine.js
with open("js/atlas-engine.js", "r", encoding="utf-8") as f:
    ae_lines = f.readlines()

for idx, line in enumerate(ae_lines):
    line_no = idx + 1
    if "const REGION_COLORS" in line:
        hardcodes.append({
            "file": "js/atlas-engine.js",
            "line": line_no,
            "category": "Bảng mã màu 6/7 vùng kinh tế",
            "snippet": line.strip()[:80],
            "in_sources": "Màu CSS tự chọn, cần chuyển sang styles.GD.json"
        })
    if "const BASEMAPS" in line:
        hardcodes.append({
            "file": "js/atlas-engine.js",
            "line": line_no,
            "category": "Cấu hình Tile layer Esri/OSM",
            "snippet": line.strip()[:80],
            "in_sources": "Tile bên thứ ba (Cần loại bỏ theo Mục 7.3)"
        })

print(f"Total hardcode items found: {len(hardcodes)}")
with open("docs/hardcode_scan.json", "w", encoding="utf-8") as f:
    json.dump(hardcodes, f, ensure_ascii=False, indent=2)

print("Saved docs/hardcode_scan.json")

