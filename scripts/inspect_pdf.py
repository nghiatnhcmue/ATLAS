import sys, fitz
sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open("data/Atlat Địa lí Việt Nam 2026 (Thầy Lê Huỳnh).pdf")
print("Total pages in Lê Huỳnh:", len(doc))
for i in range(min(15, len(doc))):
    txt = doc[i].get_text().strip().replace('\n', ' ')
    print(f"PDF page {i+1} (idx {i}): {txt[:120]}")
