import re
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    with open('scripts/build_atlat_2026_master.py', 'r', encoding='utf-8') as f:
        content = f.read()

    replacements = [
        ('"id": "ATLAT_CHART_01",\n        "atlat_page": "Trang 18",', '"id": "ATLAT_CHART_01",\n        "atlat_page": "Atlat GD, tr.18 (DHQG, tr.14)",\n        "source": "Atlat GD, tr.18 (DHQG, tr.14)",'),
        ('"id": "ATLAT_CHART_02",\n        "atlat_page": "Trang 18",', '"id": "ATLAT_CHART_02",\n        "atlat_page": "Atlat GD, tr.18 (DHQG, tr.14)",\n        "source": "Atlat GD, tr.18 (DHQG, tr.14)",'),
        ('"id": "ATLAT_CHART_03",\n        "atlat_page": "Trang 19",', '"id": "ATLAT_CHART_03",\n        "atlat_page": "Atlat GD, tr.19 (DHQG, tr.15)",\n        "source": "Atlat GD, tr.19 (DHQG, tr.15)",'),
        ('"id": "ATLAT_CHART_04",\n        "atlat_page": "Trang 26",', '"id": "ATLAT_CHART_04",\n        "atlat_page": "Atlat GD, tr.26 (DHQG, tr.21)",\n        "source": "Atlat GD, tr.26 (DHQG, tr.21)",'),
        ('"id": "ATLAT_CHART_05",\n        "atlat_page": "Trang 23",', '"id": "ATLAT_CHART_05",\n        "atlat_page": "Atlat GD, tr.23 (DHQG, tr.19)",\n        "source": "Atlat GD, tr.23 (DHQG, tr.19)",'),
        ('"id": "ATLAT_CHART_06",\n        "atlat_page": "Trang 17",', '"id": "ATLAT_CHART_06",\n        "atlat_page": "Atlat GD, tr.17 (DHQG, tr.13)",\n        "source": "Atlat GD, tr.17 (DHQG, tr.13)",'),
        ('"id": "ATLAT_CHART_07",\n        "atlat_page": "Trang 19",', '"id": "ATLAT_CHART_07",\n        "atlat_page": "Atlat GD, tr.19 (DHQG, tr.15)",\n        "source": "Atlat GD, tr.19 (DHQG, tr.15)",'),
        ('"id": "ATLAT_CHART_08",\n        "atlat_page": "Trang 21",', '"id": "ATLAT_CHART_08",\n        "atlat_page": "Atlat GD, tr.22 (DHQG, tr.18)",\n        "source": "Atlat GD, tr.22 (DHQG, tr.18)",'),
        ('"id": "ATLAT_CHART_09",\n        "atlat_page": "Trang 23",', '"id": "ATLAT_CHART_09",\n        "atlat_page": "Atlat GD, tr.23 (DHQG, tr.19)",\n        "source": "Atlat GD, tr.23 (DHQG, tr.19)",'),
        ('"id": "ATLAT_CHART_10",\n        "atlat_page": "Trang 26",', '"id": "ATLAT_CHART_10",\n        "atlat_page": "Atlat GD, tr.26 (DHQG, tr.21)",\n        "source": "Atlat GD, tr.26 (DHQG, tr.21)",'),
        ('"id": "ATLAT_CHART_11",\n        "atlat_page": "Trang 20",', '"id": "ATLAT_CHART_11",\n        "atlat_page": "Atlat GD, tr.21 (DHQG, tr.17)",\n        "source": "Atlat GD, tr.21 (DHQG, tr.17)",'),
        ('"id": "ATLAT_CHART_12",\n        "atlat_page": "Trang 19",', '"id": "ATLAT_CHART_12",\n        "atlat_page": "Atlat GD, tr.20 (DHQG, tr.16)",\n        "source": "Atlat GD, tr.20 (DHQG, tr.16)",'),
        ('"id": "ATLAT_CHART_13",\n        "atlat_page": "Trang 23",', '"id": "ATLAT_CHART_13",\n        "atlat_page": "Atlat GD, tr.23 (DHQG, tr.19)",\n        "source": "Atlat GD, tr.23 (DHQG, tr.19)",'),
        ('"id": "ATLAT_CHART_14",\n        "atlat_page": "Trang 26",', '"id": "ATLAT_CHART_14",\n        "atlat_page": "Atlat GD, tr.26 (DHQG, tr.21)",\n        "source": "Atlat GD, tr.26 (DHQG, tr.21)",'),
        ('"id": "ATLAT_CHART_15",\n        "atlat_page": "Trang 22",', '"id": "ATLAT_CHART_15",\n        "atlat_page": "Atlat GD, tr.23 (DHQG, tr.19)",\n        "source": "Atlat GD, tr.23 (DHQG, tr.19)",'),
        ('"id": "DOCX_CHART_01",\n        "atlat_page": "Trang 25 & biểu đồ.docx (Mục 1)",', '"id": "DOCX_CHART_01",\n        "atlat_page": "Atlat GD, tr.27 & biểu đồ.docx (Mục 1)",\n        "source": "biểu đồ.docx, Mục 1; Atlat GD, tr.27",'),
        ('"id": "DOCX_CHART_02",\n        "atlat_page": "Trang 19 & biểu đồ.docx (Mục 2)",', '"id": "DOCX_CHART_02",\n        "atlat_page": "Atlat GD, tr.18 & biểu đồ.docx (Mục 2)",\n        "source": "biểu đồ.docx, Mục 2; Atlat GD, tr.18",'),
        ('"id": "DOCX_CHART_03",\n        "atlat_page": "Trang 22 & biểu đồ.docx (Mục 3)",', '"id": "DOCX_CHART_03",\n        "atlat_page": "Atlat GD, tr.23 & biểu đồ.docx (Mục 3)",\n        "source": "biểu đồ.docx, Mục 3; Atlat GD, tr.23",'),
        ('"id": "DOCX_CHART_04",\n        "atlat_page": "Trang 24 & biểu đồ.docx (Mục 4)",', '"id": "DOCX_CHART_04",\n        "atlat_page": "Atlat GD, tr.26 & biểu đồ.docx (Mục 4)",\n        "source": "biểu đồ.docx, Mục 4; Atlat GD, tr.26",'),
        ('"id": "DOCX_CHART_05",\n        "atlat_page": "Trang 20 & biểu đồ.docx (Mục 5)",', '"id": "DOCX_CHART_05",\n        "atlat_page": "Atlat GD, tr.21 & biểu đồ.docx (Mục 5)",\n        "source": "biểu đồ.docx, Mục 5; Atlat GD, tr.21",'),
        ('"id": "DOCX_CHART_06",\n        "atlat_page": "Trang 21 & biểu đồ.docx (Mục 6)",', '"id": "DOCX_CHART_06",\n        "atlat_page": "Atlat GD, tr.22 & biểu đồ.docx (Mục 6)",\n        "source": "biểu đồ.docx, Mục 6; Atlat GD, tr.22",')
    ]

    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
        else:
            print(f"Warning: pattern not found: {old[:30]}")

    with open('scripts/build_atlat_2026_master.py', 'w', encoding='utf-8') as f:
        f.write(content)

    print("Patched build_atlat_2026_master.py successfully!")

if __name__ == '__main__':
    main()

