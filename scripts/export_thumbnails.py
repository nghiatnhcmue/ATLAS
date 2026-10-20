import fitz
import os

def analyze_pdf(pdf_path, name):
    doc = fitz.open(pdf_path)
    print(f"=== {name}: {len(doc)} pages ===")
    out_dir = f"scripts/thumbs_{name}"
    os.makedirs(out_dir, exist_ok=True)
    
    # We will export small thumbnail of each page
    for i, page in enumerate(doc):
        # Render a 400px wide thumbnail to inspect
        pix = page.get_pixmap(dpi=50)
        pix.save(f"{out_dir}/p{i+1:02d}.jpg")

analyze_pdf("public/data/Atlat Địa lí Việt Nam 2026 (Thầy Lê Huỳnh).pdf", "atlat2026")
analyze_pdf("public/data/Atlat 2025_mới.pdf", "atlat2025")
print("Done creating thumbnails.")
