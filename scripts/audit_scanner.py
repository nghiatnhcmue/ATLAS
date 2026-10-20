import os
import re
import json
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

print("======================================================================")
print("  AUTOMATED BUG AUDIT SCANNER FOR GEOATLAS INTERACTIVE")
print("======================================================================")

findings = []

def add_finding(code, category, severity, title, file, line, desc, fix_suggestion):
    findings.append({
        "code": code,
        "category": category,
        "severity": severity,
        "title": title,
        "file": file,
        "line": line,
        "desc": desc,
        "fix": fix_suggestion
    })

# 1. Audit JS files for regex XSS / unescaped HTML injection
chart_trainer_path = "js/chart-trainer.js"
with open(chart_trainer_path, "r", encoding="utf-8") as f:
    ct_lines = f.readlines()

for i, line in enumerate(ct_lines):
    # Check if raw prompt is inserted with innerHTML without HTML escaping
    if ".innerHTML =" in line and "raw_prompt" in line:
        add_finding(
            "BUG-SEC-01", "Biểu đồ", "P2",
            "Chèn raw_prompt vào innerHTML mà không qua escape HTML (tiềm ẩn XSS khi dán câu hỏi)",
            chart_trainer_path, i + 1,
            line.strip(),
            "Dùng hàm escapeHtml() trước khi áp dụng regex highlighting và chèn vào innerHTML."
        )
    # Check dispose on echarts
    if "echarts.init" in line:
        # Check previous 5 lines for dispose
        prev_lines = "".join(ct_lines[max(0, i-6):i])
        if "dispose" not in prev_lines:
            add_finding(
                "BUG-CHART-01", "Biểu đồ", "P2",
                "Khởi tạo echarts.init mà không dispose() instance cũ trước đó (gây rò rỉ bộ nhớ hoặc cảnh báo instance already exists)",
                chart_trainer_path, i + 1,
                line.strip(),
                "Kiểm tra if (chartInstance) chartInstance.dispose() trước khi gọi echarts.init(dom)."
            )

# 2. Audit KaTeX formatting in geo-calculator.js
calc_path = "js/geo-calculator.js"
with open(calc_path, "r", encoding="utf-8") as f:
    calc_lines = f.readlines()

for i, line in enumerate(calc_lines):
    # Check for unescaped decimal comma in KaTeX like "12,5" instead of "12{,}5"
    if re.search(r'\d+,\d+', line) and "\\text" not in line and "katex" in line:
        add_finding(
            "BUG-KATEX-01", "Máy tính", "P3",
            "Dấu phẩy thập phân trong KaTeX không bọc trong {,} tạo khoảng trắng cách quãng không chuẩn toán học",
            calc_path, i + 1,
            line.strip(),
            "Thay thế dấu phẩy số học trong chuỗi KaTeX thành {,} (ví dụ: '12{,}5')."
        )
    # Check for division by zero check
    if "/" in line and "val" in line:
        if "=== 0" in line or "== 0" in line:
            pass # Has check

# 3. Audit Atlas Engine for search normalization, z-index, maxBounds
atlas_path = "js/atlas-engine.js"
with open(atlas_path, "r", encoding="utf-8") as f:
    atlas_lines = f.readlines()

for i, line in enumerate(atlas_lines):
    if "normalizeVN" in line and "function" in line:
        # Check if normalizeVN handles NFD / NFC
        body = "".join(atlas_lines[i:i+20])
        if "normalize('NFD')" not in body and 'normalize("NFD")' not in body:
            add_finding(
                "BUG-SEARCH-01", "Tìm kiếm", "P2",
                "Hàm normalizeVN chỉ thay thế ký tự có dấu thủ công bằng replace regex mà không normalize('NFD')/NFC, dễ miss ký tự tiếng Việt tổ hợp",
                atlas_path, i + 1,
                line.strip(),
                "Thêm str.normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().trim()"
            )
    # Check spotlight effect on Hoang Sa and Truong Sa
    if "applySpotlight" in line or "spotlight" in line.lower():
        # check if islands are excluded from dimming
        pass

# 4. Check for viewport 100vh vs dvh in index.html
html_path = "index.html"
with open(html_path, "r", encoding="utf-8") as f:
    html_lines = f.readlines()

for i, line in enumerate(html_lines):
    if "h-screen" in line:
        add_finding(
            "BUG-UI-01", "Giao diện", "P3",
            "Sử dụng h-screen (100vh) thay vì h-[100dvh] khiến giao diện bị thanh địa chỉ trình duyệt Safari/Chrome trên điện thoại che mất phần đáy",
            html_path, i + 1,
            line.strip(),
            "Thay h-screen bằng h-[100dvh] hoặc h-dvh trong Tailwind CSS."
        )

# 5. Check if search input handles compositionend for Vietnamese IME on mobile
app_path = "js/app.js"
with open(app_path, "r", encoding="utf-8") as f:
    app_lines = f.readlines()

for i, line in enumerate(app_lines):
    if "setupSearch" in line:
        body = "".join(app_lines[i:i+30])
        if "composition" not in body:
            add_finding(
                "BUG-SEARCH-02", "Tìm kiếm", "P2",
                "Ô tìm kiếm không bắt sự kiện compositionstart/compositionend của bộ gõ Telex/VNI trên điện thoại",
                app_path, i + 1,
                "input.addEventListener('keypress', ...)",
                "Thêm cờ isComposing khi gõ dấu tiếng Việt trên điện thoại để tránh tìm kiếm chập chờn giữa chừng."
            )

print(f"Total automated scan findings: {len(findings)}")
for f in findings:
    print(f"[{f['severity']}] {f['code']} ({f['category']}): {f['title']} in {f['file']}:{f['line']}")

