import fitz

doc = fitz.open("public/data/Atlat Địa lí Việt Nam 2026 (Thầy Lê Huỳnh).pdf")
# Page 16 in PDF is printed page 17, page 17 in PDF is printed page 18 (Kinh tế chung)
page18 = doc[17] # 0-indexed: 17 is page 18
rect = page18.rect

# Crop bottom left legend of page 18
legend_rect = fitz.Rect(0, rect.height * 0.5, rect.width * 0.45, rect.height)
pix_leg = page18.get_pixmap(clip=legend_rect, dpi=300)
pix_leg.save("docs/bugfix-evidence/gd_p18_legend_crop.png")

print("Saved p18 legend crop.")

