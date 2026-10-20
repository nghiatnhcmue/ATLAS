import fitz

doc = fitz.open("public/data/Atlat Địa lí Việt Nam 2026 (Thầy Lê Huỳnh).pdf")
p17 = doc[16] # 0-indexed: 16 is PDF page 17 (printed 18)
r = p17.rect

# Crop bottom left of printed page 18
legend_rect = fitz.Rect(0, r.height * 0.45, r.width * 0.45, r.height)
pix = p17.get_pixmap(clip=legend_rect, dpi=300)
pix.save("docs/bugfix-evidence/gd_p18_grdp_legend_clean.png")

print("Saved clean p18 legend crop.")

