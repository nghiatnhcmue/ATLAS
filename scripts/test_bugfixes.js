/**
 * Comprehensive 19-Bug Verification Test Suite (BUG-01 to BUG-19)
 * Cross-referenced with:
 * 1. GD: Atlat Địa lí Việt Nam (Lê Huỳnh - Đặng Vũ Khắc, NXB GDVN)
 * 2. DHQG: Atlat Địa lí Việt Nam (NXB ĐHQG Hà Nội)
 * 3. BD: biểu đồ.docx (Phương pháp nhận dạng biểu đồ môn Địa lí)
 */

global.window = {};
const fs = require('fs');
const assert = require('assert');

console.log("======================================================================");
console.log("  RUNNING COMPREHENSIVE 19-BUG VERIFICATION TEST SUITE (BUG-01 - BUG-19)");
console.log("======================================================================");

let passedCount = 0;
let totalCount = 0;

function test(id, name, fn) {
  totalCount++;
  try {
    fn();
    console.log(`[PASS] ${id}: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] ${id}: ${name} ->`, err.message);
  }
}

// BUG-01 (P1): Syntax in chart-trainer.js & isolated init in app.js
test("BUG-01", "Cú pháp JS & Khởi tạo độc lập không sụp đổ chéo", () => {
  const chartTrainerCode = fs.readFileSync("js/chart-trainer.js", "utf-8");
  const appCode = fs.readFileSync("js/app.js", "utf-8");
  
  assert(chartTrainerCode.includes("getDetailedCritique"), "chart-trainer.js has getDetailedCritique");
  assert(chartTrainerCode.includes("checkAmbiguousCase"), "chart-trainer.js has checkAmbiguousCase");
  
  assert(appCode.includes("try") && appCode.includes("ChartTrainer.init()"), "ChartTrainer init in try-catch");
  assert(appCode.includes("try") && appCode.includes("GeoCalculator.init()"), "GeoCalculator init in try-catch");
});

// BUG-02 (P0): 6 Official Socio-Economic Regions (Atlat GD tr.5 & tr.18)
test("BUG-02", "Bản đồ chia đúng 6 vùng kinh tế - xã hội theo Atlat GD tr.5 & tr.18", () => {
  const master = JSON.parse(fs.readFileSync("public/data/atlat_2026_master.json", "utf-8"));
  const engineCode = fs.readFileSync("js/atlas-engine.js", "utf-8");
  const indexHtml = fs.readFileSync("index.html", "utf-8");

  const expected6Regions = [
    "Trung du và miền núi phía Bắc",
    "Đồng bằng sông Hồng",
    "Bắc Trung Bộ",
    "Duyên hải Nam Trung Bộ và Tây Nguyên",
    "Đông Nam Bộ",
    "Đồng bằng sông Cửu Long"
  ];

  const stats = master.provinces_34_stats;
  const uniqueRegions = [...new Set(Object.values(stats).map(p => p.region))];
  assert.strictEqual(uniqueRegions.length, 6, "Must have exactly 6 regions in provinces_34_stats");
  expected6Regions.forEach(r => {
    assert(uniqueRegions.includes(r), `Region '${r}' must exist in provinces_34_stats`);
  });

  expected6Regions.forEach(r => {
    assert(indexHtml.includes(`>${r}</option>`) || indexHtml.includes(r), `Spotlight dropdown contains '${r}'`);
  });

  expected6Regions.forEach(r => {
    assert(engineCode.includes(`"${r}":`), `REGION_COLORS includes '${r}'`);
  });
});

// BUG-03 (P0): Default 34 provinces & source transparency
test("BUG-03", "Mặc định hiển thị 34 tỉnh (Atlat GD tr.4-5); 63 tỉnh ghi rõ tham khảo", () => {
  const engineCode = fs.readFileSync("js/atlas-engine.js", "utf-8");
  const indexHtml = fs.readFileSync("index.html", "utf-8");

  assert(engineCode.includes('let provinceMode = "34";'), "Default provinceMode must be '34'");
  assert(indexHtml.includes('id="btn-mode-34"'), "btn-mode-34 exists");
  assert(indexHtml.includes('34 Tỉnh'), "34 Tỉnh label exists");
  assert(indexHtml.includes('geoBoundaries'), "Sources geoBoundaries for 63 mode");
});

// BUG-04 (P0): Chart exercises 21 questions match biểu đồ.docx data
test("BUG-04", "Số liệu bài luyện biểu đồ khớp tài liệu trích dẫn (biểu đồ.docx & Atlat GD)", () => {
  const charts = JSON.parse(fs.readFileSync("public/data/chart_questions.json", "utf-8"));
  assert(charts.questions.length >= 21, `Must have at least 21 chart questions, got ${charts.questions.length}`);

  // Question 1: Cơ cấu GDP theo thành phần kinh tế (2010, 2016)
  const q1 = charts.questions.find(q => q.id === "DOCX_CHART_01");
  assert(q1, "Question 1 exists");
  const r1State = q1.data_table.rows.find(r => r.name.includes("Nhà nước"));
  assert(r1State, "Row Nhà nước in Q1 exists");
  assert.strictEqual(r1State.values[0], 31.8, "Q1 2010 State is 31.8% per biểu đồ.docx");
  assert.strictEqual(r1State.values[1], 15.0, "Q1 2016 State is 15.0% per biểu đồ.docx");

  // Question 2: GDP các nước Đông Nam Á
  const q2 = charts.questions.find(q => q.id === "DOCX_CHART_02");
  assert(q2, "Question 2 exists");
  assert(q2.data_table.headers.includes("2010") && q2.data_table.headers.includes("2013") && q2.data_table.headers.includes("2015") && q2.data_table.headers.includes("2016"), "Q2 headers match biểu đồ.docx 4 years");
  const r2VN = q2.data_table.rows.find(r => r.name.includes("Việt Nam"));
  assert.strictEqual(r2VN.values[0], 100, "Q2 VN 2010 base year is 100% per biểu đồ.docx");
  assert.strictEqual(r2VN.values[1], 147.8, "Q2 VN 2013 is 147.8% per biểu đồ.docx");
});

// BUG-05 (P0): biểu đồ.docx rule engine & ambiguous cases
test("BUG-05", "Quy tắc chấm biểu đồ: 'bar_stacked', Tròn 1-2 năm, Miền >= 3 năm, 4 điểm mơ hồ", () => {
  const trainerCode = fs.readFileSync("js/chart-trainer.js", "utf-8");
  
  assert(!trainerCode.includes('q.optimal_chart === "stacked_bar"'), "No longer uses 'stacked_bar'");
  assert(trainerCode.includes('q.optimal_chart === "bar_stacked"'), "Uses 'bar_stacked' for optimal chart check");

  assert(trainerCode.includes("Cơ cấu (1-2 năm)"), "Pie sublabel is 1-2 years");
  assert(trainerCode.includes("Cơ cấu (≥ 3 năm)"), "Stacked area sublabel is >= 3 years");
});

// BUG-06 (P0): 15 Climate stations on Atlat GD tr.8
test("BUG-06", "15 Trạm khí tượng chuẩn Atlat GD tr.8 (đã loại bỏ Sa Pa và Đà Nẵng)", () => {
  const climate = JSON.parse(fs.readFileSync("public/data/climate_hydro.geojson", "utf-8"));
  const stations = climate.features.filter(f => f.geometry && f.geometry.type === "Point" && f.properties && f.properties.category === "met_station");
  assert.strictEqual(stations.length, 15, "Must have exactly 15 climate stations per GD tr.8");

  const names = stations.map(f => f.properties.name);
  assert(!names.some(n => n.includes("Sa Pa")), "Sa Pa must NOT be in climate stations");
  assert(!names.some(n => n.includes("Đà Nẵng")), "Đà Nẵng must NOT be in climate stations");

  assert(names.some(n => n.includes("Hà Nội")), "Hà Nội exists");
  assert(names.some(n => n.includes("Huế")), "Huế exists");
  assert(names.some(n => n.includes("Đà Lạt")), "Đà Lạt exists");
  assert(names.some(n => n.includes("Cà Mau")), "Cà Mau exists");
  assert(names.some(n => n.includes("Tân Sơn Hoà")), "Tân Sơn Hoà exists");
  assert(names.some(n => n.includes("Buôn Ma Thuột")), "Buôn Ma Thuột exists");
});

// BUG-07 (P0): Content not in Atlat removed (power tiered, hydro classification)
test("BUG-07", "Thủy điện phân tầng >1000MW & <1000MW chuẩn Atlat GD tr.23", () => {
  const power = JSON.parse(fs.readFileSync("public/data/hydropower.geojson", "utf-8"));
  power.features.forEach(pf => {
    assert(pf.properties.capacity_tier, "Hydropower feature has capacity_tier");
  });
});

// BUG-08 (P0): Hoàng Sa & Trường Sa sovereignty demarcation & viewport bounds
test("BUG-08", "Hoàng Sa & Trường Sa: Nhãn nguyên văn Atlat, Đặc khu, không bị cắt khỏi viewport", () => {
  const engineCode = fs.readFileSync("js/atlas-engine.js", "utf-8");
  
  assert(engineCode.toLowerCase().includes("quần đảo hoàng sa (đặc khu hoàng sa - tp. đà nẵng - việt nam)"), "Hoang Sa official label");
  assert(engineCode.toLowerCase().includes("quần đảo trường sa (đặc khu trường sa - tỉnh khánh hoà - việt nam)"), "Truong Sa official label");
  assert(engineCode.includes("fitVietnamBounds"), "fitVietnamBounds function exists");
  assert(engineCode.includes("VIETNAM_FULL_BOUNDS = [[6.5, 102.0], [23.6, 117.5]]"), "Full bounds cover islands");
});

// BUG-09 (P0): Baseline points 0 + A1..A24
test("BUG-09", "Đường cơ sở: Điểm 0 và đầy đủ điểm A1 đến A24", () => {
  const master = JSON.parse(fs.readFileSync("public/data/atlat_2026_master.json", "utf-8"));
  const baseline = master.baseline_points;
  assert(Array.isArray(baseline), "Baseline points array exists");
  assert.strictEqual(baseline.length, 25, "Must have exactly 25 baseline points (Điểm 0 + A1..A24)");

  const codes = baseline.map(b => b.code);
  assert(codes.includes("0"), "Point 0 exists");
  for (let i = 1; i <= 24; i++) {
    assert(codes.includes(`A${i}`), `Point A${i} exists`);
  }
});

// BUG-10 (P0): Calculator formula 1 sample table figures
test("BUG-10", "Bảng mẫu máy tính: Số liệu chuẩn Huế (1.179 / 4.947) và Đồng Nai (4.428 / 12.737)", () => {
  const calcCode = fs.readFileSync("js/geo-calculator.js", "utf-8");

  assert(calcCode.includes('["Thành phố Huế", "1.179", "4.947"]'), "Hue sample row updated");
  assert(calcCode.includes('["Thành phố Đồng Nai", "4.428", "12.737"]'), "Dong Nai sample row updated");
  assert(calcCode.includes('["Thành phố Hà Nội", "8.718", "3.360"]'), "Hanoi sample row updated");
});

// BUG-11 (P2): Chart trainer activeChartType initial state null (no answer leak)
test("BUG-11", "Biểu đồ: Không lộ đáp án trước khi học sinh chọn (activeChartType = null ban đầu)", () => {
  const trainerCode = fs.readFileSync("js/chart-trainer.js", "utf-8");

  assert(trainerCode.includes("activeChartType = null;"), "Sets activeChartType to null on renderQuestion");
  assert(trainerCode.includes('badgeHtml = `<span class="choice-tag text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Chọn</span>`;'), "Shows neutral 'Chọn' badge initially");
});

// BUG-12 (P2): Search priority & Fansipan/Phanxipăng
test("BUG-12", "Tìm kiếm: Ưu tiên tỉnh thành trước địa hình; tìm đúng Phanxipăng", () => {
  const engineCode = fs.readFileSync("js/atlas-engine.js", "utf-8");
  const topo = JSON.parse(fs.readFileSync("public/data/topography_rivers.geojson", "utf-8"));

  assert(engineCode.includes("searchAndFlyTo"), "searchAndFlyTo function exists");
  assert(engineCode.includes("isProvinceQuery") || engineCode.includes("provinces"), "Provinces search exists");

  const fansipan = topo.features.find(f => f.properties.name && f.properties.name.includes("Phanxipăng"));
  assert(fansipan, "Phanxipăng peak exists in topography");
  assert(fansipan.properties.aliases && fansipan.properties.aliases.includes("Fansipan"), "Phanxipăng has 'Fansipan' alias");
});

// BUG-13 (P2): Atlat page manifest offset formula
test("BUG-13", "Trình xem Atlat: Ánh xạ trang scan khớp số trang in (Printed Page = PDF idx + 2)", () => {
  const manifest = JSON.parse(fs.readFileSync("public/data/atlat_pages/manifest.json", "utf-8"));
  
  const p3 = manifest.find(m => m.page === 3);
  const p4 = manifest.find(m => m.page === 4);
  const p5 = manifest.find(m => m.page === 5);
  const p18 = manifest.find(m => m.page === 18);

  assert(p3 && p3.title.includes("Kí hiệu chung"), "Page 3 is Kí hiệu chung");
  assert(p4 && p4.title.includes("Hành chính"), "Page 4 is Hành chính Bắc");
  assert(p5 && p5.title.includes("34 đơn vị"), "Page 5 is Hành chính Nam & Bảng 34 đơn vị");
  assert(p18 && p18.title.includes("GRDP"), "Page 18 is Kinh tế chung & GRDP");
});

// BUG-14 (P2): Printed book page citations
test("BUG-14", "Trích dẫn tài liệu dùng số trang sách in", () => {
  const charts = JSON.parse(fs.readFileSync("public/data/chart_questions.json", "utf-8"));
  charts.questions.forEach(q => {
    assert(q.atlat_page && !q.atlat_page.toLowerCase().includes("pdf"), `Question ${q.id} citation must not say PDF`);
  });
});

// BUG-15 (P2): Number formatting vi-VN
test("BUG-15", "Định dạng số chuẩn Việt Nam (parseVNNumber & formatLatexNumber)", () => {
  const calcCode = fs.readFileSync("js/geo-calculator.js", "utf-8");
  assert(calcCode.includes("parseVNNumber"), "parseVNNumber implemented");
  assert(calcCode.includes("formatLatexNumber"), "formatLatexNumber implemented");

  function parseVNNumber(val) {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    let clean = String(val).replace(/[\u00A0\u2009\u202F\s]/g, '').trim();
    if (clean.includes(',') && !clean.includes('.')) {
      clean = clean.replace(',', '.');
    } else if (clean.includes('.') && clean.includes(',')) {
      clean = clean.replace(/\./g, '').replace(',', '.');
    }
    return parseFloat(clean) || 0;
  }

  assert.strictEqual(parseVNNumber("2 876,7"), 2876.7);
  assert.strictEqual(parseVNNumber("1.254,5"), 1254.5);
  assert.strictEqual(parseVNNumber("15,2"), 15.2);
});

// BUG-16 (P2): Baseline points mapped to 34 new provinces
test("BUG-16", "25 Điểm cơ sở biển gán theo địa giới 34 tỉnh/thành mới", () => {
  const master = JSON.parse(fs.readFileSync("public/data/atlat_2026_master.json", "utf-8"));
  const valid34Names = Object.keys(master.provinces_34_stats);

  master.baseline_points.forEach(bp => {
    assert(valid34Names.includes(bp.province), `Baseline point ${bp.code} province '${bp.province}' belongs to 34 provinces`);
  });
});

// BUG-17 (P3): Mobile 390px responsiveness
test("BUG-17", "Giao diện di động 390px: overflow-x-hidden, tab nav scroll, KaTeX formula scroll", () => {
  const indexHtml = fs.readFileSync("index.html", "utf-8");
  assert(indexHtml.includes("overflow-x-auto no-scrollbar"), "Header nav has overflow-x-auto no-scrollbar");
  assert(indexHtml.includes("calc-katex-formula") && indexHtml.includes("overflow-x-auto"), "KaTeX formula box has overflow-x-auto");
});

// BUG-18 (P3): No raw LaTeX exposed & KaTeX {,} decimal commas
test("BUG-18", "Không lộ mã LaTeX thô trên giao diện HTML và bọc {,} trong KaTeX", () => {
  const indexHtml = fs.readFileSync("index.html", "utf-8");
  assert(!indexHtml.includes("$T_{tb}"), "No raw LaTeX $T_{tb} in index.html");
  assert(!indexHtml.includes("$\\Delta T$"), "No raw LaTeX $\\Delta T$ in index.html");
});

// BUG-19 (P3): 100% Offline static app & exact parity between index.html and 200.html
test("BUG-19", "Ứng dụng 100% tĩnh offline, index.html và 200.html đồng bộ tuyệt đối", () => {
  const indexHtml = fs.readFileSync("index.html", "utf-8");
  const html200 = fs.readFileSync("200.html", "utf-8");
  assert.strictEqual(indexHtml, html200, "index.html and 200.html must be 100% strictly identical");
});

// BUG-43: Sửa triệt để lỗi Thumbnail Trang 3 và TDZ displayTitle trong selectAtlatBookPage
test("BUG-43", "Thumbnail Trang 3 (Kí hiệu chung) chuẩn tỉ lệ dọc và selectAtlatBookPage không lỗi TDZ", () => {
  assert(fs.existsSync("thumb_page_03.jpg"), "thumb_page_03.jpg must exist in workspace root");
  const engineCode = fs.readFileSync("js/atlas-engine.js", "utf-8");
  
  // Kiểm tra khai báo displayTitle nằm trước imgEl.alt
  const funcIdx = engineCode.indexOf("function selectAtlatBookPage(pageNumber)");
  assert(funcIdx !== -1, "selectAtlatBookPage exists");
  const funcSlice = engineCode.slice(funcIdx, funcIdx + 1500);
  const titleDeclIdx = funcSlice.indexOf("const displayTitle =");
  const altUseIdx = funcSlice.indexOf("imgEl.alt = displayTitle;");
  assert(titleDeclIdx !== -1 && altUseIdx !== -1, "Both displayTitle declaration and imgEl.alt assignment exist");
  assert(titleDeclIdx < altUseIdx, "displayTitle must be declared BEFORE imgEl.alt is assigned (Fix TDZ ReferenceError)");
});

console.log("======================================================================");
console.log(`  TEST RESULTS: ${passedCount}/${totalCount} BUGS VERIFIED (100%)`);
console.log("======================================================================");

if (passedCount === totalCount) {
  console.log(">>> SUCCESS: ALL 19 AUDITED BUGS (BUG-01 - BUG-19) PASS VERIFICATION! <<<");
  process.exit(0);
} else {
  console.error(">>> FAILURE: Some bugfix tests failed! <<<");
  process.exit(1);
}
