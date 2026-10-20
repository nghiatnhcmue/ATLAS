import fitz
import os
import sys

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

pdf_path = "public/data/Atlat Địa lí Việt Nam 2026 (Thầy Lê Huỳnh).pdf"
doc = fitz.open(pdf_path)

# Page 4 in PDF is printed page 5 (has the 34 province table)
page5 = doc[3] # 0-indexed: 3 is page 4 in PDF
rect = page5.rect
print(f"Page 5 rect: {rect}")

# Render full page 5 at 200 dpi
pix = page5.get_pixmap(dpi=200)
pix.save("docs/bugfix-evidence/gd_p05_full.png")

# Crop the table area on right or bottom
# Let's crop the table (usually bottom-right or right half)
table_rect = fitz.Rect(rect.width * 0.45, rect.height * 0.35, rect.width, rect.height)
pix_table = page5.get_pixmap(clip=table_rect, dpi=300)
pix_table.save("docs/bugfix-evidence/gd_p05_table_crop.png")

# Also render GD page 3 (Kí hiệu chung) at 200 dpi
page3 = doc[1]
pix3 = page3.get_pixmap(dpi=200)
pix3.save("docs/bugfix-evidence/gd_p03_legend.png")

# Also render GD page 13 (Khoáng sản) at 200 dpi
page13 = doc[11]
pix13 = page13.get_pixmap(dpi=200)
pix13.save("docs/bugfix-evidence/gd_p13_minerals.png")

# Also render GD page 18 (Kinh tế chung - GRDP 4 khu vực) at 200 dpi
page18 = doc[16]
pix18 = page18.get_pixmap(dpi=200)
pix18.save("docs/bugfix-evidence/gd_p18_economy_grdp.png")

# Also render GD page 22 (Công nghiệp chung) at 200 dpi
page22 = doc[20]
pix22 = page22.get_pixmap(dpi=200)
pix22.save("docs/bugfix-evidence/gd_p22_industry.png")

print("Exported 300 dpi crops to docs/bugfix-evidence/")

