import fitz
from PIL import Image
import os

doc = fitz.open("public/data/Atlat Địa lí Việt Nam 2026 (Thầy Lê Huỳnh).pdf")
print("Total pages in Atlat 2026:", len(doc))

# Let's inspect where the title/page number is
# On landscape pages, title is often top or right. Let's make a contact sheet of all 31 pages (6 cols x 6 rows)
thumb_w, thumb_h = 240, 320
sheet = Image.new("RGB", (thumb_w * 6, thumb_h * 6), (255, 255, 255))

for i, page in enumerate(doc):
    rect = page.rect
    # Render thumbnail
    pix = page.get_pixmap(dpi=40)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    img.thumbnail((thumb_w - 10, thumb_h - 10))
    col = i % 6
    row = i // 6
    sheet.paste(img, (col * thumb_w + 5, row * thumb_h + 5))

sheet.save("scripts/atlat2026_contact_sheet.jpg", quality=85)
print("Saved atlat2026_contact_sheet.jpg")

# Also for atlat2025
doc25 = fitz.open("public/data/Atlat 2025_mới.pdf")
sheet25 = Image.new("RGB", (thumb_w * 6, thumb_h * 5), (255, 255, 255))
for i, page in enumerate(doc25):
    pix = page.get_pixmap(dpi=40)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    img.thumbnail((thumb_w - 10, thumb_h - 10))
    col = i % 6
    row = i // 6
    sheet25.paste(img, (col * thumb_w + 5, row * thumb_h + 5))
sheet25.save("scripts/atlat2025_contact_sheet.jpg", quality=85)
print("Saved atlat2025_contact_sheet.jpg")
