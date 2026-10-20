import fitz

doc = fitz.open("public/data/Atlat Địa lí Việt Nam 2026 (Thầy Lê Huỳnh).pdf")
page5 = doc[3]
rect = page5.rect

# Crop left half of table (bottom 50%, left 50%)
table_left_rect = fitz.Rect(0, rect.height * 0.45, rect.width * 0.55, rect.height)
pix_left = page5.get_pixmap(clip=table_left_rect, dpi=300)
pix_left.save("docs/bugfix-evidence/gd_p05_table_left_crop.png")

print("Saved left table crop.")

