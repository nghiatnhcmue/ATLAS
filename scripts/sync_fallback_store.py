import json
import sys

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    data = {}
    
    with open('public/data/vn_provinces.geojson', 'r', encoding='utf-8') as f:
        data['provinces'] = json.load(f)
    with open('public/data/minerals.geojson', 'r', encoding='utf-8') as f:
        data['minerals'] = json.load(f)
    with open('public/data/hydropower.geojson', 'r', encoding='utf-8') as f:
        data['power'] = json.load(f)
    with open('public/data/industrial_centers.geojson', 'r', encoding='utf-8') as f:
        data['industrial'] = json.load(f)
    with open('public/data/chart_questions.json', 'r', encoding='utf-8') as f:
        data['chartQuestions'] = json.load(f)

    content = f"""/**
 * GeoAtlas Interactive - Fallback Data Store (Tier 3 Seed Resilience)
 * Auto-synchronized with official Atlat GD 2026 dataset
 */
window.GEO_ATLAS_FALLBACK_DATA = {json.dumps(data, ensure_ascii=False)};
"""
    with open('js/fallback-store.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully synchronized js/fallback-store.js!")

if __name__ == '__main__':
    main()

