import fitz
import os

pdf2_path = "public/data/Atlat Địa lí Việt Nam 2026 (Thầy Lê Huỳnh).pdf"
pdf1_path = "public/data/Atlat 2025_mới.pdf"
out_dir = "scripts/page_headers"
os.makedirs(out_dir, exist_ok=True)

doc2 = fitz.open(pdf2_path)
print(f"Doc2: {len(doc2)} pages")
for i, page in enumerate(doc2):
    rect = page.rect
    # Header crop: top 15% of page
    header_rect = fitz.Rect(0, 0, rect.width, rect.height * 0.15)
    pix = page.get_pixmap(clip=header_rect, dpi=100)
    pix.save(f"{out_dir}/doc2_p{i+1:02d}_header.png")

doc1 = fitz.open(pdf1_path)
print(f"Doc1: {len(doc1)} pages")
for i, page in enumerate(doc1):
    rect = page.rect
    header_rect = fitz.Rect(0, 0, rect.width, rect.height * 0.15)
    pix = page.get_pixmap(clip=header_rect, dpi=100)
    pix.save(f"{out_dir}/doc1_p{i+1:02d}_header.png")

print("Done exporting headers.")
