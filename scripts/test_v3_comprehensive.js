/**
 * Test Suite v3 for GeoAtlas Interactive
 * Verifies all 16 cross-verification items from KE_HOACH_DOI_CHIEU_ATLAT_V3.md
 * and DOI_CHIEU_ATLAS_SO_vs_ATLAT_GIAY.md
 */

const fs = require('fs');
const assert = require('assert');

console.log("======================================================================");
console.log("  GEOATLAS v3 CROSS-VERIFICATION TEST SUITE (16 BUGS/CRITERIA)");
console.log("======================================================================");

let passed = 0;
let total = 0;

function check(id, title, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] ${id}: ${title}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${id}: ${title} ->`, err.message);
  }
}

// 1. BUG-40 (P0): Sắp xếp 5 tỉnh Vùng IV theo Nghị quyết 202/2025/QH15 & Atlat GD tr.5
check("BUG-40", "Sáp nhập 5 tỉnh Vùng IV chuẩn Nghị quyết 202/2025/QH15 & Atlat GD tr.5", () => {
  const p34 = JSON.parse(fs.readFileSync("public/data/vn_provinces_34.geojson", "utf-8"));
  const feats = p34.features;

  const expected = {
    "Tỉnh Gia Lai": { area: 21576.5, pop: 3245.6, merged: ["Gia Lai", "Bình Định"] },
    "Tỉnh Quảng Ngãi": { area: 14832.6, pop: 1861.1, merged: ["Quảng Ngãi", "Kon Tum"] },
    "Tỉnh Khánh Hoà": { area: 8555.9, pop: 1892.4, merged: ["Khánh Hoà", "Ninh Thuận"] },
    "Tỉnh Đắk Lắk": { area: 18096.4, pop: 2784.8, merged: ["Đắk Lắk", "Phú Yên"] },
    "Tỉnh Lâm Đồng": { area: 24233.1, pop: 3376.8, merged: ["Lâm Đồng", "Bình Thuận", "Đắk Nông"] }
  };

  for (const [name, exp] of Object.entries(expected)) {
    const f = feats.find(feat => feat.properties.name === name || feat.properties.name === name.replace(/^Tỉnh\s+/, "") || feat.properties.name === "Tỉnh " + name);
    assert(f, `Province ${name} must exist in vn_provinces_34.geojson`);
    const p = f.properties;
    assert.strictEqual(p.area, exp.area, `${name} area must be ${exp.area}, got ${p.area}`);
    assert.strictEqual(p.pop, exp.pop, `${name} pop must be ${exp.pop}, got ${p.pop}`);
    
    // Check that merged_from has all expected constituent names
    for (const sub of exp.merged) {
      assert(p.merged_from.some(m => m.includes(sub) || sub.includes(m)), `${name} merged_from must include ${sub}, got ${p.merged_from}`);
    }

    // Geometry check
    assert(f.geometry && f.geometry.coordinates && f.geometry.coordinates.length > 0, `${name} has valid coordinates`);
  }
});

// 2. BUG-24 (P1): Sửa renderIndustrialCenters & ensureLayerData
check("BUG-24", "renderIndustrialCenters & ensureLayerData được khai báo và liên kết chuẩn xác", () => {
  const code = fs.readFileSync("js/atlas-engine.js", "utf-8");
  assert(code.includes("function renderIndustrialCenters"), "renderIndustrialCenters is declared");
  assert(code.includes("async function ensureLayerData"), "ensureLayerData is declared");
  assert(!code.includes("renderIndustrialLayer"), "No stale renderIndustrialLayer call");
});

// 3. BUG-26 & BUG-27 (P0): Choropleth Palettes cho GRDP & Dân số
check("BUG-26/27", "Thang màu Choropleth: Dân số 5 cấp (GD tr.17) & GRDP bình quân 4 cấp (GD tr.18)", () => {
  const code = fs.readFileSync("js/atlas-engine.js", "utf-8");
  assert(code.includes("GRDP_PER_CAPITA_TIERS"), "GRDP_PER_CAPITA_TIERS lookup table defined");
  assert(code.includes("Atlat GD, tr.17 (Dân số và Mật độ dân số)"), "Density source citations correct");
  assert(code.includes("Atlat GD, tr.18 (Kinh tế chung)"), "GRDP source citations correct");
  assert(code.includes("Dưới 100 ng/km²"), "Density tier 1 correct");
  assert(code.includes("Từ 1.000 ng/km² trở lên"), "Density tier 5 correct");
});

// 4. BUG-30 (P0): Ký hiệu Khoáng sản & Năng lượng chuẩn Atlat GD tr.3 & 23
check("BUG-30", "Ký hiệu chuẩn Atlat GD tr.3 & 23 (ngôi sao nhiệt điện/thủy điện, ô vuông A/Al)", () => {
  const code = fs.readFileSync("js/atlas-engine.js", "utf-8");
  assert(code.includes("getPowerSvg"), "getPowerSvg helper defined");
  assert(code.includes("getMineralSvg"), "getMineralSvg helper defined");
  // Check mini-game questions
  assert(code.includes("SYM_05"), "Mini-game questions updated with official symbols");
  assert(code.includes("SYM_12"), "Mini-game includes SYM_12");

  // Check handbook in index.html & 200.html has distinct Blue (Hydro) and Red (Thermal) stars
  const indexHtml = fs.readFileSync("index.html", "utf-8");
  assert(!indexHtml.includes("<span>⭐</span> Hệ Thống Nhà Máy Thủy Điện"), "Thủy điện must not use generic yellow star");
  assert(!indexHtml.includes("<span>⭐</span> Hệ Thống Nhà Máy Nhiệt Điện"), "Nhiệt điện must not use generic yellow star");
  assert(indexHtml.includes("#0284C7"), "Thủy điện uses official blue star (#0284C7)");
  assert(indexHtml.includes("#DC2626"), "Nhiệt điện uses official red star (#DC2626)");
});

// 5. BUG-31 (P0): Tọa độ 4 mỏ dầu khí georeferenced GD tr.13 & chuẩn tên địa danh
check("BUG-31", "Tọa độ 4 mỏ dầu khí georeferenced tr.13 & chuẩn hoá tên địa danh", () => {
  const minerals = JSON.parse(fs.readFileSync("public/data/minerals.geojson", "utf-8"));
  const mfeats = minerals.features;

  const hongNgoc = mfeats.find(f => f.properties.name.includes("Hồng Ngọc"));
  assert(hongNgoc, "Hồng Ngọc exists");
  assert(Math.abs(hongNgoc.geometry.coordinates[0] - 108.60) < 0.05, "Hồng Ngọc lon ~ 108.60");
  assert(Math.abs(hongNgoc.geometry.coordinates[1] - 10.55) < 0.05, "Hồng Ngọc lat ~ 10.55");

  const lanTay = mfeats.find(f => f.properties.name.includes("Lan Tây"));
  assert(lanTay, "Lan Tây exists");
  assert(Math.abs(lanTay.geometry.coordinates[0] - 108.85) < 0.05, "Lan Tây lon ~ 108.85");
  assert(Math.abs(lanTay.geometry.coordinates[1] - 7.51) < 0.05, "Lan Tây lat ~ 7.51");

  const lanDo = mfeats.find(f => f.properties.name.includes("Lan Đỏ"));
  assert(lanDo, "Lan Đỏ exists");
  assert(Math.abs(lanDo.geometry.coordinates[0] - 109.10) < 0.05, "Lan Đỏ lon ~ 109.10");
  assert(Math.abs(lanDo.geometry.coordinates[1] - 7.58) < 0.05, "Lan Đỏ lat ~ 7.58");

  const titanCamXuyen = mfeats.find(f => f.properties.name.includes("Cẩm Xuyên"));
  assert(titanCamXuyen, "Mỏ titan Cẩm Xuyên exists");
});

// 6. BUG-32 (P0): Nắn Dãy Trường Sơn Bắc & Cánh cung Đông Triều
check("BUG-32", "Nắn Dãy Trường Sơn Bắc dọc biên giới Việt - Lào, Cánh cung Đông Triều Tây - Đông", () => {
  const topo = JSON.parse(fs.readFileSync("public/data/topography_rivers.geojson", "utf-8"));
  const tfeats = topo.features;

  const tsb = tfeats.find(f => f.properties.name && f.properties.name.includes("Trường Sơn Bắc"));
  assert(tsb, "Dãy Trường Sơn Bắc exists");
  // Check alignment points along border (lon 105.2 - 106.8, lat 16.8 - 18.8)
  const coords = tsb.geometry.coordinates;
  assert(coords.length >= 4, "TSB has multiple vertex points");
  assert(coords[0][0] <= 105.3, "TSB starts near Giăng Màn / Pù Mát");

  const dongTrieu = tfeats.find(f => f.properties.name && f.properties.name.includes("Đông Triều"));
  assert(dongTrieu, "Cánh cung Đông Triều exists");
  assert(dongTrieu.geometry.coordinates[0][0] < dongTrieu.geometry.coordinates[dongTrieu.geometry.coordinates.length - 1][0], "Đông Triều runs West to East");
});

// 7. BUG-33 (P0): Hoàng Sa & Trường Sa đa giác thực tế, không chồng lấn
check("BUG-33", "Hoàng Sa & Trường Sa đảo thực tế tỉ lệ chuẩn, không đa giác bát giác chồng chéo", () => {
  const p34 = JSON.parse(fs.readFileSync("public/data/vn_provinces_34.geojson", "utf-8"));
  const hs = p34.features.find(f => f.properties.name && f.properties.name.includes("Hoàng Sa"));
  const ts = p34.features.find(f => f.properties.name && f.properties.name.includes("Trường Sa"));

  assert(hs, "Hoàng Sa feature exists");
  assert(ts, "Trường Sa feature exists");
  assert(hs.properties.is_special_island, "Hoàng Sa is marked special island");
  assert(ts.properties.is_special_island, "Trường Sa is marked special island");
  assert(hs.geometry.coordinates.length >= 8, "Hoàng Sa has individual distinct islands");
  assert(ts.geometry.coordinates.length >= 15, "Trường Sa has individual distinct islands");
});

// 8. BUG-34 (P0): Nông nghiệp chuẩn GD tr.19-21
check("BUG-34", "Lớp nông nghiệp chuẩn Atlat GD tr.19-21, không số % tự sinh, không đơn vị cũ", () => {
  const agri = JSON.parse(fs.readFileSync("public/data/agriculture_fishery.geojson", "utf-8"));
  assert(agri.features.length >= 50, "Full comprehensive agricultural zones & fishing grounds >= 50");
  for (const feat of agri.features) {
    const p = feat.properties;
    assert(p.source.includes("Atlat GD"), "Source cites Atlat GD");
    assert(!p.desc.includes("Bình Phước, Bình Dương"), "No outdated 63 single-province list in desc");
  }
});

// 9. BUG-35 (P0): 34 Trung tâm kinh tế / GRDP cấp tỉnh theo GD tr.18
check("BUG-35", "34 Trung tâm kinh tế cấp tỉnh theo 4 cấp quy mô Atlat GD tr.18", () => {
  const ind = JSON.parse(fs.readFileSync("public/data/industrial_centers.geojson", "utf-8"));
  assert.strictEqual(ind.features.length, 34, "Exactly 34 provincial economic centers");
  
  const hcm = ind.features.find(f => f.properties.province === "Thành phố Hồ Chí Minh");
  assert(hcm && hcm.properties.scale_tier === "tier_1", "TP.HCM is tier 1 (>= 1 000 nghìn tỉ)");

  const hp = ind.features.find(f => f.properties.province === "Hải Phòng");
  assert(hp && hp.properties.scale_tier === "tier_2", "Hải Phòng is tier 2 (300 - < 1 000 nghìn tỉ)");

  const cb = ind.features.find(f => f.properties.province === "Cao Bằng");
  assert(cb && cb.properties.scale_tier === "tier_4", "Cao Bằng is tier 4 (< 100 nghìn tỉ)");
});

// 10. BUG-36 (P0): Info Card chuẩn hoá không lặp và Hoàng Sa/Trường Sa trang trọng
check("BUG-36", "Cửa sổ thông tin tỉnh bỏ quận/huyện cũ, Hoàng Sa/Trường Sa ghi nhận chủ quyền", () => {
  const code = fs.readFileSync("js/atlas-engine.js", "utf-8");
  assert(!code.includes("PROVINCE_DISTRICTS[props.name]"), "No obsolete district drilldown in details panel");
  assert(code.includes("Chủ Quyền Quốc Gia"), "National sovereignty badge present");
});

// 11. BUG-37 (P2): Giao thông dẫn nguồn Atlat GD tr.24 & Cái Mép - Thị Vải
check("BUG-37", "Lớp Giao thông dẫn nguồn Atlat GD tr.24, Cái Mép - Thị Vải thuộc TP. Hồ Chí Minh", () => {
  const trans = JSON.parse(fs.readFileSync("public/data/transportation.geojson", "utf-8"));
  const cm = trans.features.find(f => f.properties.name && f.properties.name.includes("Cái Mép"));
  assert(cm, "Cảng Cái Mép - Thị Vải exists");
  assert(cm.properties.province.includes("Hồ Chí Minh"), "Cái Mép assigned to TP. Hồ Chí Minh / Vũng Tàu");
});

// 12. BUG-38 (P2): Chú giải Động và Nút Thu Gọn
check("BUG-38", "Chú giải động tự động đồng bộ theo Nền Bản Đồ và có nút thu gọn", () => {
  const code = fs.readFileSync("js/atlas-engine.js", "utf-8");
  assert(code.includes("function updateDynamicLegend"), "updateDynamicLegend exists");
  assert(code.includes("function toggleLegendCollapse"), "toggleLegendCollapse exists");
  assert(code.includes("atlas-dynamic-legend-body"), "atlas-dynamic-legend-body element toggled");
});

// 13. BUG-39 (P3): Nhãn phạm vi đối tượng ôn thi THPT
check("BUG-39", "Nhãn 'Lựa chọn các đối tượng tiêu biểu phục vụ ôn thi tốt nghiệp THPT' trên giao diện", () => {
  const html = fs.readFileSync("index.html", "utf-8");
  assert(html.includes("Lựa chọn các đối tượng tiêu biểu phục vụ ôn thi tốt nghiệp THPT theo chuẩn Atlat GD"), "Exam focus banner present in index.html");
});

// 14. BUG-41: Thành phố Đồng Nai là Thành phố trực thuộc Trung ương
check("BUG-41", "Thành phố Đồng Nai chuẩn hoá thành Thành phố trực thuộc Trung ương", () => {
  const p34 = JSON.parse(fs.readFileSync("public/data/vn_provinces_34.geojson", "utf-8"));
  const dn = p34.features.find(f => f.properties.name === "Thành phố Đồng Nai");
  assert(dn, "Thành phố Đồng Nai exists in vn_provinces_34");
  assert.strictEqual(dn.properties.administrative_type, "Thành phố trực thuộc Trung ương", "Đồng Nai is Thành phố trực thuộc Trung ương in 34 provinces");

  const p63 = JSON.parse(fs.readFileSync("public/data/vn_provinces_63.geojson", "utf-8"));
  const dn63 = p63.features.find(f => f.properties.shapeName === "Đồng Nai" || f.properties.name === "Thành phố Đồng Nai" || f.properties.name === "Đồng Nai");
  assert(dn63, "Đồng Nai exists in vn_provinces_63");
  assert.strictEqual(dn63.properties.administrative_type, "Thành phố trực thuộc Trung ương", "Đồng Nai is Thành phố trực thuộc Trung ương in 63 provinces");

  const master = JSON.parse(fs.readFileSync("public/data/atlat_2026_master.json", "utf-8"));
  const dnMaster = master.geo_provinces_34.features.find(f => f.properties.name === "Thành phố Đồng Nai");
  assert(dnMaster, "Thành phố Đồng Nai exists in master geo_provinces_34");
  assert.strictEqual(dnMaster.properties.administrative_type, "Thành phố trực thuộc Trung ương", "Đồng Nai is Thành phố trực thuộc Trung ương in master");

  const atlatData = fs.readFileSync("js/atlat-data.js", "utf-8");
  assert(atlatData.includes("Thành phố Đồng Nai"), "atlat-data.js includes Thành phố Đồng Nai");

  const calc = fs.readFileSync("js/geo-calculator.js", "utf-8");
  assert(calc.includes("Thành phố Đồng Nai"), "geo-calculator.js uses Thành phố Đồng Nai");
});

// 15. BUG-42: Hệ thống Thủy văn & Khí hậu đầy đủ chuẩn Atlat GD tr.8, 9, 10
check("BUG-42", "Hệ thống Thủy văn & Khí hậu đầy đủ (15 trạm KT tr.8, 12 trạm TV tr.10, 16 hồ điều tiết, bộ lọc và biểu đồ dòng chảy)", () => {
  const ch = JSON.parse(fs.readFileSync("public/data/climate_hydro.geojson", "utf-8"));
  const feats = ch.features;
  
  const mets = feats.filter(f => f.properties.category === "met_station");
  assert.strictEqual(mets.length, 15, `Must have 15 climate stations, got ${mets.length}`);

  const hydros = feats.filter(f => f.properties.category === "hydro_station");
  assert.strictEqual(hydros.length, 12, `Must have 12 hydro stations, got ${hydros.length}`);

  const lakes = feats.filter(f => f.properties.category === "reservoir_lake");
  assert(lakes.length >= 15, `Must have >= 15 reservoirs/lakes, got ${lakes.length}`);

  // Check key hydro stations per Atlat GD tr.10:
  const hn = hydros.find(h => h.properties.name.includes("Hà Nội"));
  assert(hn && hn.properties.flood_season.includes("VI - X") && hn.properties.peak_month.includes("VIII"), "Hà Nội flood season VI-X, peak VIII");

  const nongSon = hydros.find(h => h.properties.name.includes("Nông Sơn"));
  assert(nongSon && nongSon.properties.flood_season.includes("IX - XII"), "Nông Sơn autumn-winter flood season IX-XII");

  const tanChau = hydros.find(h => h.properties.name.includes("Tân Châu"));
  assert(tanChau && tanChau.properties.flood_season.includes("VII - XI"), "Tân Châu Mekong flood season VII-XI");

  // Check engine code supports categoryFilter and custom hydro details panel
  const engineCode = fs.readFileSync("js/atlas-engine.js", "utf-8");
  assert(engineCode.includes('renderClimateLayer(categoryFilter = "all")'), "renderClimateLayer supports filter parameter");
  assert(engineCode.includes("Trạm Thủy Văn"), "atlas-engine.js renders Trạm Thủy Văn popup and details");
  assert(engineCode.includes("Hồ Tự Nhiên") || engineCode.includes("Hồ Điều Tiết Thủy Lợi"), "atlas-engine.js renders reservoir/lake popup and details");

  // Check UI has climate filter select
  const html = fs.readFileSync("index.html", "utf-8");
  assert(html.includes("climate-filter-select"), "index.html has climate-filter-select dropdown");
  const html200 = fs.readFileSync("200.html", "utf-8");
  assert(html200.includes("climate-filter-select"), "200.html has climate-filter-select dropdown");
});

// 16. BUG-44: Nghị quyết 24/8/2026: Thành phố Quảng Ninh và Thành phố Bắc Ninh là Thành phố trực thuộc Trung ương
check("BUG-44", "Thành phố Quảng Ninh & Thành phố Bắc Ninh là TP trực thuộc TW (NQ Quốc hội 24/8/2026)", () => {
  const p34 = JSON.parse(fs.readFileSync("public/data/vn_provinces_34.geojson", "utf-8"));
  const qn = p34.features.find(f => f.properties.name === "Thành phố Quảng Ninh");
  const bn = p34.features.find(f => f.properties.name === "Thành phố Bắc Ninh");
  assert(qn, "Thành phố Quảng Ninh exists in vn_provinces_34");
  assert(bn, "Thành phố Bắc Ninh exists in vn_provinces_34");
  assert.strictEqual(qn.properties.administrative_type, "Thành phố trực thuộc Trung ương", "Quảng Ninh is TP trực thuộc TW in 34");
  assert.strictEqual(bn.properties.administrative_type, "Thành phố trực thuộc Trung ương", "Bắc Ninh is TP trực thuộc TW in 34");

  const p63 = JSON.parse(fs.readFileSync("public/data/vn_provinces_63.geojson", "utf-8"));
  const qn63 = p63.features.find(f => f.properties.shapeName === "Quảng Ninh" || f.properties.name === "Thành phố Quảng Ninh");
  const bn63 = p63.features.find(f => f.properties.shapeName === "Bắc Ninh" || f.properties.name === "Thành phố Bắc Ninh");
  assert(qn63, "Quảng Ninh exists in 63");
  assert(bn63, "Bắc Ninh exists in 63");
  assert.strictEqual(qn63.properties.administrative_type, "Thành phố trực thuộc Trung ương", "Quảng Ninh is TP trực thuộc TW in 63");
  assert.strictEqual(bn63.properties.administrative_type, "Thành phố trực thuộc Trung ương", "Bắc Ninh is TP trực thuộc TW in 63");

  const atlatData = fs.readFileSync("js/atlat-data.js", "utf-8");
  assert(atlatData.includes("Thành phố Quảng Ninh"), "atlat-data.js includes Thành phố Quảng Ninh");
  assert(atlatData.includes("Thành phố Bắc Ninh"), "atlat-data.js includes Thành phố Bắc Ninh");

  const assistant = fs.readFileSync("js/geo-smart-assistant.js", "utf-8");
  assert(assistant.includes("24 tháng 8 năm 2026") || assistant.includes("24/8/2026"), "geo-smart-assistant.js references NQ 24/8/2026");
  assert(assistant.includes("thanh_pho_quang_ninh") && assistant.includes("thanh_pho_bac_ninh"), "assistant contains new city entities");

  const engine = fs.readFileSync("js/atlas-engine.js", "utf-8");
  assert(engine.includes("Thành phố Quảng Ninh") && engine.includes("Thành phố Bắc Ninh"), "atlas-engine.js contains new city profiles");
});

// 17. BUG-45: Bố cục 2 Cột Tùy Biến: Thanh Kéo Resizer, Cột Trái Rộng Rãi & Cột Phải Tinh Gọn
check("BUG-45", "Bố cục 2 Cột Tùy Biến: Cột Trái rộng rãi, Cột Phải tinh gọn, Thanh kéo ranh giới tương tác", () => {
  const indexHtml = fs.readFileSync("index.html", "utf-8");
  const html200 = fs.readFileSync("200.html", "utf-8");
  assert.strictEqual(indexHtml, html200, "index.html and 200.html must remain 100% strictly identical down to the byte");

  // Check 3 resizers
  const resizers = ["atlas-split-resizer", "charts-split-resizer", "calc-split-resizer"];
  resizers.forEach(id => {
    assert(indexHtml.includes(`id="${id}"`), `Element #${id} must exist in index.html`);
  });

  // Check column ids
  assert(indexHtml.includes('id="chart-canvas-col"'), "chart-canvas-col exists in index.html");
  assert(indexHtml.includes('id="calc-display-col"'), "calc-display-col exists in index.html");
  assert(indexHtml.includes('id="calc-controls-col"'), "calc-controls-col exists in index.html");

  // Check CSS styles
  const css = fs.readFileSync("css/styles.css", "utf-8");
  assert(css.includes(".split-resizer"), "css contains .split-resizer rules");
  assert(css.includes("body.split-resizing"), "css contains body.split-resizing");
  assert(css.includes("--atlas-split-left"), "css contains --atlas-split-left");
  assert(css.includes("--charts-split-left"), "css contains --charts-split-left");
  assert(css.includes("--calc-split-left"), "css contains --calc-split-left");

  // Check JavaScript implementations
  const appJs = fs.readFileSync("js/app.js", "utf-8");
  assert(appJs.includes("function initSplitResizers"), "js/app.js implements initSplitResizers");
  assert(appJs.includes("initSplitResizers()"), "js/app.js calls initSplitResizers");
  assert(appJs.includes("dblclick"), "app.js supports double click reset");

  const atlasEngine = fs.readFileSync("js/atlas-engine.js", "utf-8");
  assert(atlasEngine.includes("--atlas-split-left"), "atlas-engine.js updates --atlas-split-left dynamically");
  assert(atlasEngine.includes("is-split-right"), "atlas-engine.js uses is-split-right for 50:50 split mode");
});

// 18. BUG-46: Tải ảnh bảng biểu đề bài lên nhận diện dạng biểu đồ (Image Table OCR & Rule Engine)
check("BUG-46", "Nhận dạng biểu đồ: Tải ảnh bảng biểu đề bài lên đề xuất biểu đồ tối ưu", () => {
  const indexHtml = fs.readFileSync("index.html", "utf-8");
  const html200 = fs.readFileSync("200.html", "utf-8");
  assert.strictEqual(indexHtml, html200, "index.html and 200.html must remain 100% strictly identical down to the byte");

  // Check UI elements in HTML
  assert(indexHtml.includes('id="btn-upload-table-image"'), "btn-upload-table-image exists in toolbar");
  assert(indexHtml.includes('tesseract.min.js'), "tesseract.min.js CDN included in head");

  // Check CSS styles
  const css = fs.readFileSync("css/styles.css", "utf-8");
  assert(css.includes(".upload-dropzone"), "css contains .upload-dropzone");
  assert(css.includes(".scanning-pulse"), "css contains .scanning-pulse");

  // Check JavaScript functions and exports
  const trainerCode = fs.readFileSync("js/chart-trainer.js", "utf-8");
  const requiredFuncs = [
    "openImageUploader",
    "handleImageInputChange",
    "handleUploadedImage",
    "loadExamImagePreset",
    "clearUploadedImage",
    "generateExamTableCanvasImage",
    "processTableImage",
    "parseAndApplyOcrText",
    "attachClipboardPaste"
  ];
  requiredFuncs.forEach(fn => {
    assert(trainerCode.includes(fn), `js/chart-trainer.js must implement ${fn}`);
  });

  // Verify that the 4 exam presets exist
  assert(trainerCode.includes('Chuyển dịch cơ cấu GDP 4 năm'), "Custom sample 1 exists");
  assert(trainerCode.includes('Tốc độ tăng trưởng than, dầu, khí'), "Custom sample 2 exists");
  assert(trainerCode.includes('Quy mô và cơ cấu 2 năm'), "Custom sample 3 exists");
  assert(trainerCode.includes('Sản lượng & Giá trị khác đơn vị'), "Custom sample 4 exists");
});

console.log("======================================================================");
console.log(`  RESULT: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
console.log("======================================================================");

if (passed === total) {
  console.log(">>> SUCCESS: ALL v3 CROSS-VERIFICATION AUDIT ITEMS FULLY RESOLVED! <<<");
  process.exit(0);
} else {
  console.error(">>> FAILURE: Some v3 items did not pass! <<<");
  process.exit(1);
}

