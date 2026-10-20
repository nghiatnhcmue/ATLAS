import fitz

doc = fitz.open("public/data/Atlat Địa lí Việt Nam 2026 (Thầy Lê Huỳnh).pdf")
# Let's inspect pages around 16-18
for p_idx in [15, 16, 17, 18]:
    p = doc[p_idx]
    # Crop top 10% to see title
    r = p.rect
    title_rect = fitz.Rect(0, 0, r.width, r.height * 0.12)
    pix = p.get_pixmap(clip=title_rect, dpi=150)
    pix.save(f"docs/bugfix-evidence/title_p{p_idx+1}.png")

print("Saved title crops.")

