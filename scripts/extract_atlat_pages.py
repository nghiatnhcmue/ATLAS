import fitz, os, json, sys
sys.stdout.reconfigure(encoding='utf-8')

out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'data', 'atlat_pages')
os.makedirs(out_dir, exist_ok=True)

pdf_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'Atlat Địa lí Việt Nam 2026 (Thầy Lê Huỳnh).pdf')
doc = fitz.open(pdf_path)
print(f"Opened Atlat PDF with {len(doc)} pages.")

# Mapping: (printed_page_no, pdf_index, title)
pages_spec = [
    (1, 0, "Trang 1: Bìa Atlat Địa lí Việt Nam 2026"),
    (3, 1, "Trang 3: Kí hiệu chung"),
    (4, 2, "Trang 4: Hành chính (Phía Bắc & Bắc Trung Bộ)"),
    (5, 3, "Trang 5: Hành chính (Phía Nam) & Bảng diện tích, dân số 34 đơn vị"),
    (6, 4, "Trang 6: Hình thể & Địa hình (Phía Bắc)"),
    (7, 5, "Trang 7: Hình thể & Địa hình (Phía Nam) - Mốc toạ độ & Đường cơ sở"),
    (8, 6, "Trang 8: Khí hậu chung & 15 Trạm khí tượng"),
    (9, 7, "Trang 9: Các miền khí hậu & Lượng mưa, nhiệt độ"),
    (10, 8, "Trang 10: Các hệ thống sông ngòi Việt Nam"),
    (13, 11, "Trang 13: Địa chất & Khoáng sản"),
    (18, 16, "Trang 18: Kinh tế chung - Các vùng kinh tế & Quy mô GRDP"),
    (19, 17, "Trang 19: Nông nghiệp chung"),
    (21, 19, "Trang 21: Công nghiệp chung"),
    (22, 20, "Trang 22: Các ngành công nghiệp trọng điểm"),
    (23, 21, "Trang 23: Giao thông vận tải & Thương mại")
]

manifest = []
for pno, idx, title in pages_spec:
    if idx < 0 or idx >= len(doc):
        continue
    page = doc[idx]
    scale = 1100 / max(page.rect.width, page.rect.height)
    mat = fitz.Matrix(scale, scale)
    pix = page.get_pixmap(matrix=mat)
    fname = f"page_{pno:02d}.jpg"
    fpath = os.path.join(out_dir, fname)
    pix.save(fpath)
    size_kb = os.path.getsize(fpath) / 1024
    manifest.append({
        "page": pno,
        "title": title,
        "file": f"public/data/atlat_pages/{fname}",
        "width": pix.width,
        "height": pix.height,
        "size_kb": round(size_kb, 1)
    })
    print(f"Extracted {fname} (PDF idx {idx} -> Printed p.{pno}) - {size_kb:.1f} KB")

with open(os.path.join(out_dir, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, ensure_ascii=False, indent=2)

print("Atlat pages re-extracted with EXACT printed page mapping successfully!")
