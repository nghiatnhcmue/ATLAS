import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    with open('public/data/chart_questions.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    citations = {
        "DOCX_CHART_01": {"atlat_page": "Atlat GD, tr.27 & biểu đồ.docx (Mục 1)", "source": "biểu đồ.docx, Mục 1; Atlat GD, tr.27"},
        "DOCX_CHART_02": {"atlat_page": "Atlat GD, tr.18 & biểu đồ.docx (Mục 2)", "source": "biểu đồ.docx, Mục 2; Atlat GD, tr.18"},
        "DOCX_CHART_03": {"atlat_page": "Atlat GD, tr.23 & biểu đồ.docx (Mục 3)", "source": "biểu đồ.docx, Mục 3; Atlat GD, tr.23"},
        "DOCX_CHART_04": {"atlat_page": "Atlat GD, tr.26 & biểu đồ.docx (Mục 4)", "source": "biểu đồ.docx, Mục 4; Atlat GD, tr.26"},
        "DOCX_CHART_05": {"atlat_page": "Atlat GD, tr.21 & biểu đồ.docx (Mục 5)", "source": "biểu đồ.docx, Mục 5; Atlat GD, tr.21"},
        "DOCX_CHART_06": {"atlat_page": "Atlat GD, tr.22 & biểu đồ.docx (Mục 6)", "source": "biểu đồ.docx, Mục 6; Atlat GD, tr.22"},
        "ATLAT_CHART_01": {"atlat_page": "Atlat GD, tr.18 (DHQG, tr.14)", "source": "Atlat GD, tr.18 (DHQG, tr.14)"},
        "ATLAT_CHART_02": {"atlat_page": "Atlat GD, tr.18 (DHQG, tr.14)", "source": "Atlat GD, tr.18 (DHQG, tr.14)"},
        "ATLAT_CHART_03": {"atlat_page": "Atlat GD, tr.19 (DHQG, tr.15)", "source": "Atlat GD, tr.19 (DHQG, tr.15)"},
        "ATLAT_CHART_04": {"atlat_page": "Atlat GD, tr.26 (DHQG, tr.21)", "source": "Atlat GD, tr.26 (DHQG, tr.21)"},
        "ATLAT_CHART_05": {"atlat_page": "Atlat GD, tr.23 (DHQG, tr.19)", "source": "Atlat GD, tr.23 (DHQG, tr.19)"},
        "ATLAT_CHART_06": {"atlat_page": "Atlat GD, tr.17 (DHQG, tr.13)", "source": "Atlat GD, tr.17 (DHQG, tr.13)"},
        "ATLAT_CHART_07": {"atlat_page": "Atlat GD, tr.19 (DHQG, tr.15)", "source": "Atlat GD, tr.19 (DHQG, tr.15)"},
        "ATLAT_CHART_08": {"atlat_page": "Atlat GD, tr.22 (DHQG, tr.18)", "source": "Atlat GD, tr.22 (DHQG, tr.18)"},
        "ATLAT_CHART_09": {"atlat_page": "Atlat GD, tr.23 (DHQG, tr.19)", "source": "Atlat GD, tr.23 (DHQG, tr.19)"},
        "ATLAT_CHART_10": {"atlat_page": "Atlat GD, tr.26 (DHQG, tr.21)", "source": "Atlat GD, tr.26 (DHQG, tr.21)"},
        "ATLAT_CHART_11": {"atlat_page": "Atlat GD, tr.21 (DHQG, tr.17)", "source": "Atlat GD, tr.21 (DHQG, tr.17)"},
        "ATLAT_CHART_12": {"atlat_page": "Atlat GD, tr.20 (DHQG, tr.16)", "source": "Atlat GD, tr.20 (DHQG, tr.16)"},
        "ATLAT_CHART_13": {"atlat_page": "Atlat GD, tr.23 (DHQG, tr.19)", "source": "Atlat GD, tr.23 (DHQG, tr.19)"},
        "ATLAT_CHART_14": {"atlat_page": "Atlat GD, tr.26 (DHQG, tr.21)", "source": "Atlat GD, tr.26 (DHQG, tr.21)"},
        "ATLAT_CHART_15": {"atlat_page": "Atlat GD, tr.23 (DHQG, tr.19)", "source": "Atlat GD, tr.23 (DHQG, tr.19)"}
    }

    for q in data.get('questions', []):
        qid = q.get('id')
        if qid in citations:
            q['atlat_page'] = citations[qid]['atlat_page']
            q['source'] = citations[qid]['source']

    with open('public/data/chart_questions.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("Successfully updated public/data/chart_questions.json with official citations!")

if __name__ == '__main__':
    main()

