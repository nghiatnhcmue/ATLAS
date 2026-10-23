#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GeoAtlas Interactive - MỘT NGUỒN DỮ LIỆU DUY NHẤT (Single Source of Truth)
============================================================================
Nguyên tắc: mọi bản sao dữ liệu đều sinh ra TỪ các tệp nguồn chuẩn ở public/data/:

  Nguồn (được chỉnh thủ công / builder ghi):
    public/data/vn_provinces_34.geojson      → geo_provinces_34
    public/data/vn_provinces_63.geojson      → geo_provinces_63
    public/data/topography_rivers.geojson    → geo_topography
    public/data/climate_hydro.geojson        → geo_climate
    public/data/agriculture_fishery.geojson  → geo_agriculture   (62 đối tượng)
    public/data/minerals.geojson             → geo_minerals
    public/data/hydropower.geojson           → geo_power         (61 nhà máy)
    public/data/industrial_centers.geojson   → geo_industrial    (34 TTCN)
    public/data/transportation.geojson       → geo_transportation
    public/data/baseline.geojson             → geo_baseline      (A0-A24)
    public/data/chart_questions.json         → chart_exercises   (30 câu)
    public/data/atlat_rich.json              → metadata, baseline_points,
                                               climate_stations, hydro_stations,
                                               reservoirs_lakes, keyword_guide,
                                               provinces_34_stats (34 khoá)

  Sản phẩm (không chỉnh tay, sinh tự động):
    public/data/dataset.json   — tập hợp đầy đủ để đối chiếu / kiểm kê
    js/atlat-data.js           — nhúng NHẸ (chỉ câu hỏi + keyword) cho critical path
    js/fallback-store.js       — bản dự phòng đầy đủ, NẠP LƯỜI chỉ khi fetch thất bại

Cách chạy:
    python scripts/rebuild_all.py            # sinh lại 3 tệp sản phẩm
    python scripts/rebuild_all.py --check    # xác minh sản phẩm khớp nguồn (CI)
"""

import json
import os
import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "public", "data")
JS_DIR = os.path.join(ROOT, "js")

# Tên lớp → (tệp nguồn, số feature kỳ vọng)
LAYER_SOURCES = [
    ("geo_provinces_34", "vn_provinces_34.geojson", 36),
    ("geo_provinces_63", "vn_provinces_63.geojson", 65),
    ("geo_topography", "topography_rivers.geojson", 41),
    ("geo_climate", "climate_hydro.geojson", 44),
    ("geo_agriculture", "agriculture_fishery.geojson", 62),
    ("geo_minerals", "minerals.geojson", 26),
    ("geo_power", "hydropower.geojson", 61),
    ("geo_industrial", "industrial_centers.geojson", 34),
    ("geo_transportation", "transportation.geojson", 19),
    ("geo_baseline", "baseline.geojson", 25),
]

EXPECTED_CHART_QUESTIONS = 30
EXPECTED_STATS = 34


def load_json(rel):
    path = os.path.join(DATA_DIR, rel)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def round_coords(obj, ndigits=4):
    """Làm tròn toạ độ cho bản dự phòng lười (giữ độ chính xác ~11 m, thu gọn kích thước)."""
    if isinstance(obj, list):
        return [round_coords(x, ndigits) for x in obj]
    if isinstance(obj, float):
        return round(obj, ndigits)
    return obj


def build_dataset():
    rich = load_json("atlat_rich.json")

    dataset = {
        "metadata": {
            "title": rich["metadata"].get("title", "Bộ Dữ Liệu Gốc Atlat Địa Lí Việt Nam 2026 (GDPT 2018)"),
            "version": "2026.4.0",
            "published": rich["metadata"].get("published", "2026"),
            "source": rich["metadata"].get("source", ""),
            "offline_embedded": False,
            "pipeline": "scripts/rebuild_all.py",
        },
        "baseline_points": rich["baseline_points"],
        "climate_stations": rich["climate_stations"],
        "hydro_stations": rich["hydro_stations"],
        "reservoirs_lakes": rich["reservoirs_lakes"],
        "keyword_guide": rich["keyword_guide"],
        "provinces_34_stats": rich["provinces_34_stats"],
    }

    # 1. Các lớp GeoJSON
    for key, rel, expected in LAYER_SOURCES:
        data = load_json(rel)
        assert data.get("type") == "FeatureCollection", f"{rel}: thiếu type FeatureCollection"
        n = len(data.get("features", []))
        assert n == expected, f"{rel}: kỳ vọng {expected} feature, thực tế {n}"
        dataset[key] = data

    # 2. Ngân hàng câu hỏi biểu đồ
    cq = load_json("chart_questions.json")
    questions = cq.get("questions", [])
    assert len(questions) == EXPECTED_CHART_QUESTIONS, \
        f"chart_questions.json: kỳ vọng {EXPECTED_CHART_QUESTIONS} câu, thực tế {len(questions)}"
    dataset["chart_exercises"] = questions

    # 3. Kiểm tra hợp đồng schema với bộ lọc UI
    agri_cats = {f["properties"].get("category") for f in dataset["geo_agriculture"]["features"]}
    allowed = {"industrial_crops", "food_crops", "livestock", "fishery", "forestry"}
    assert agri_cats <= allowed, f"geo_agriculture: danh mục lạ {agri_cats - allowed}"
    assert "fishery" in agri_cats and "industrial_crops" in agri_cats, "geo_agriculture thiếu danh mục UI"

    tiers = {f["properties"].get("scale_tier") for f in dataset["geo_industrial"]["features"]}
    assert tiers <= {"tier_1", "tier_2", "tier_3", "tier_4"}, f"geo_industrial: tier lạ {tiers}"

    stats = dataset["provinces_34_stats"]
    assert len(stats) == EXPECTED_STATS, f"provinces_34_stats: kỳ vọng {EXPECTED_STATS}, thực tế {len(stats)}"
    assert "Đồng Nai" not in stats, "provinces_34_stats còn bản ghi trùng 'Đồng Nai' (lỗi B-11 tái phát)"

    # 4. Tổng hợp quốc gia phải hợp lý (chống tái phát B-11)
    area_sum = sum(v["area"] for v in stats.values())
    pop_sum = sum(v["pop"] for v in stats.values())
    assert 325_000 <= area_sum <= 335_000, f"tổng diện tích bất thường: {area_sum:.1f}"
    assert 99_000 <= pop_sum <= 103_000, f"tổng dân số bất thường: {pop_sum:.1f}"

    return dataset


def render_js(global_name, payload):
    comment = (
        "/**\n"
        " * GeoAtlas Interactive - Generated data store.\n"
        " * NGUỒN DUY NHẤT: public/data/*.geojson + chart_questions.json + atlat_rich.json\n"
        " * SINH TỰ ĐỘNG bởi scripts/rebuild_all.py - KHÔNG SỬA TAY.\n"
        " */\n"
    )
    return comment + f"window.{global_name} = " + json.dumps(payload, ensure_ascii=False) + ";\n"


def build_outputs(dataset):
    # atlat-data.js: nhúng NHẸ (chỉ những gì cần ngay ở critical path)
    embed = {
        "metadata": dataset["metadata"],
        "provinces_34_stats": dataset["provinces_34_stats"],
        "chart_exercises": dataset["chart_exercises"],
        "keyword_guide": dataset["keyword_guide"],
    }
    atlat_js = render_js("ATLAT_DATA", embed)

    # fallback-store.js: đầy đủ, nạp lười khi fetch thất bại; toạ độ làm tròn 4 chữ số
    fb = {
        "provinces34": round_coords(dataset["geo_provinces_34"]),
        "provinces63": round_coords(dataset["geo_provinces_63"]),
        "provinces": round_coords(dataset["geo_provinces_63"]),
        "topography": dataset["geo_topography"],
        "climate": dataset["geo_climate"],
        "agriculture": dataset["geo_agriculture"],
        "minerals": dataset["geo_minerals"],
        "power": dataset["geo_power"],
        "industrial": dataset["geo_industrial"],
        "transportation": dataset["geo_transportation"],
        "baseline": dataset["geo_baseline"],
        "chartQuestions": {
            "version": "2026.4.0",
            "description": "Ngân hàng 30 câu nhận dạng biểu đồ",
            "questions": dataset["chart_exercises"],
            "keyword_guide": dataset["keyword_guide"],
        },
        "keyword_guide": dataset["keyword_guide"],
    }
    fallback_js = render_js("GEO_ATLAS_FALLBACK_DATA", fb)

    return atlat_js, fallback_js


def main():
    check_only = "--check" in sys.argv
    dataset = build_dataset()

    atlat_js, fallback_js = build_outputs(dataset)
    dataset_json = json.dumps(dataset, ensure_ascii=False, indent=2) + "\n"

    outputs = {
        os.path.join(DATA_DIR, "dataset.json"): dataset_json,
        os.path.join(DATA_DIR, "atlat_2026_master.json"): dataset_json,
        os.path.join(JS_DIR, "atlat-data.js"): atlat_js,
        os.path.join(JS_DIR, "fallback-store.js"): fallback_js,
    }

    ok = True
    for path, content in outputs.items():
        exists = os.path.exists(path)
        if check_only:
            current = open(path, "r", encoding="utf-8").read() if exists else None
            status = "OK" if current == content else "DIFF"
            if current != content:
                ok = False
            print(f"[check] {os.path.relpath(path, ROOT):28} {status}")
        else:
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[write] {os.path.relpath(path, ROOT):28} {len(content)/1024:7.0f} KB")

    if check_only:
        sys.exit(0 if ok else 1)

    area = sum(v["area"] for v in dataset["provinces_34_stats"].values())
    pop = sum(v["pop"] for v in dataset["provinces_34_stats"].values())
    print(f"[+] dataset: {len(dataset['geo_agriculture']['features'])} NN, "
          f"{len(dataset['geo_power']['features'])} năng lượng, {len(dataset['chart_exercises'])} câu")
    print(f"[+] provinces_34_stats: {len(dataset['provinces_34_stats'])} khoá | "
          f"tổng diện tích {area:,.1f} km² | tổng dân số {pop:,.1f} nghìn người")


if __name__ == "__main__":
    main()
