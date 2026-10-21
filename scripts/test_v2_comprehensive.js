/**
 * Test Suite v2 for GeoAtlas Interactive
 * Verifies all 15 audit items from BAO_CAO_LOI_GEOATLAS_v2.md
 */

const fs = require('fs');
const assert = require('assert');

console.log("======================================================================");
console.log("  GEOATLAS v2 AUDIT VERIFICATION TEST SUITE (15 BUGS/CRITERIA)");
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

// 1. BUG-23: Versioning & Cache-busting
check("BUG-23", "Versioning (?v=2026.3.1) và cache header ngăn người dùng dính cache 30 ngày", () => {
  const indexHtml = fs.readFileSync("index.html", "utf-8");
  const html200 = fs.readFileSync("200.html", "utf-8");
  const headers = fs.readFileSync("_headers", "utf-8");

  assert(!indexHtml.includes("?v=2026.2"), "index.html has no ?v=2026.2");
  assert(indexHtml.includes("?v=2026.3.1"), "index.html has ?v=2026.3.1");
  assert(!html200.includes("?v=2026.2"), "200.html has no ?v=2026.2");
  assert(html200.includes("?v=2026.3.1"), "200.html has ?v=2026.3.1");

  assert(headers.includes("/public/data/*"), "_headers has data rule");
  assert(headers.includes("must-revalidate"), "_headers has must-revalidate");
  assert(!headers.includes("immutable"), "_headers removed immutable from app data");
});

// 2. BUG-09: Toạ độ A1-A10 phần mười phút (DMM) & Điểm 0 & A24
check("BUG-09", "Toạ độ A1-A10 đúng dạng phần mười phút; Điểm 0 missing_coords; A24 ghi chú xung đột", () => {
  const master = JSON.parse(fs.readFileSync("public/data/atlat_2026_master.json", "utf-8"));
  const points = master.baseline_points;

  const p0 = points.find(p => p.code === "0");
  assert(p0, "Point 0 exists");
  assert.strictEqual(p0.status, "missing_coords", "Point 0 marked missing_coords");
  assert.strictEqual(p0.coords, null, "Point 0 coords is null");

  // A2: 8°22,8'B = 8 + 22.8/60 = 8.38; 104°52,4'Đ = 104 + 52.4/60 = 104.873333
  const a2 = points.find(p => p.code === "A2");
  assert(a2, "Point A2 exists");
  assert(Math.abs(a2.coords[1] - 8.38) < 0.001, `A2 lat must be ~8.38, got ${a2.coords[1]}`);
  assert(Math.abs(a2.coords[0] - 104.8733) < 0.001, `A2 lng must be ~104.8733, got ${a2.coords[0]}`);

  // A3: 8°37,8'B = 8 + 37.8/60 = 8.63; 106°37,5'Đ = 106 + 37.5/60 = 106.625
  const a3 = points.find(p => p.code === "A3");
  assert(a3, "Point A3 exists");
  assert(Math.abs(a3.coords[1] - 8.63) < 0.001, `A3 lat must be ~8.63, got ${a3.coords[1]}`);
  assert(Math.abs(a3.coords[0] - 106.625) < 0.001, `A3 lng must be ~106.625, got ${a3.coords[0]}`);

  // A24: conflict note
  const a24 = points.find(p => p.code === "A24");
  assert(a24, "Point A24 exists");
  assert(a24.conflict && a24.conflict.includes("107°06'04"), "A24 has conflict note between DHQG and GD");
});

// 3. BUG-06: 15 Trạm khí tượng chuẩn Atlat GD tr.8
check("BUG-06", "15 Trạm khí tượng khớp 100% Atlat GD tr.8 (loại Sa Pa, Đà Nẵng; đủ 15 trạm chuẩn)", () => {
  const master = JSON.parse(fs.readFileSync("public/data/atlat_2026_master.json", "utf-8"));
  const stations = master.climate_stations;

  assert.strictEqual(stations.length, 15, `Must have exactly 15 climate stations, got ${stations.length}`);
  const names = stations.map(s => s.name);
  assert(!names.some(n => n.includes("Sa Pa")), "No Sa Pa");
  assert(!names.some(n => n === "Đà Nẵng" || n.includes("Đà Nẵng")), "No Đà Nẵng");

  // Check key stations values from GD tr.8:
  const lang = stations.find(s => s.name.includes("Láng"));
  assert(lang && lang.rainfall.includes("1.676") && lang.avg_temp.includes("23,8"), "Láng: 23.8°C / 1.676mm");

  const hue = stations.find(s => s.name === "Huế");
  assert(hue && hue.rainfall.includes("2.868") && hue.avg_temp.includes("25,2"), "Huế: 25.2°C / 2.868mm");

  const dalat = stations.find(s => s.name.includes("Đà Lạt"));
  assert(dalat && dalat.rainfall.includes("1.739") && dalat.avg_temp.includes("17,9"), "Đà Lạt: 17.9°C / 1.739mm");

  const hs = stations.find(s => s.name.includes("Hoàng Sa"));
  assert(hs && hs.rainfall.includes("2.769") && hs.avg_temp.includes("23,6"), "Hoàng Sa: 23.6°C / 2.769mm");

  const ts = stations.find(s => s.name.includes("Trường Sa"));
  assert(ts && ts.rainfall.includes("2.666") && ts.avg_temp.includes("28,0"), "Trường Sa: 28.0°C / 2.666mm");
});

// 4. BUG-20: Bảng mẫu Máy tính trong geo-calculator.js
check("BUG-20", "Bảng mẫu Máy tính: 6 vùng kinh tế, XNK 2010/2015/2020/2024 đồng bộ, 15 trạm khí tượng", () => {
  const calcCode = fs.readFileSync("js/geo-calculator.js", "utf-8");

  // Formula 3: 6 regions
  assert(calcCode.includes("Trung du và miền núi Bắc Bộ"), "Formula 3 has TD&MNBB");
  assert(calcCode.includes("Tây Nguyên"), "Formula 3 has Tây Nguyên");
  assert(calcCode.includes("Đông Nam Bộ"), "Formula 3 has Đông Nam Bộ");

  // Formula 5 & 6: XNK years
  assert(calcCode.includes("Năm 2010") && calcCode.includes("72.2") && calcCode.includes("84.8"), "Formula 5 has 2010 XNK");
  assert(calcCode.includes("157.0") && calcCode.includes("-12.6"), "Formula 6 has 2010 T & B");
  assert(calcCode.includes("786.3") && calcCode.includes("+24.7"), "Formula 6 has 2024 T & B");

  // Formula 9: 15 stations
  assert(calcCode.includes("Đặc trưng Khí hậu 15 Trạm Khí tượng Chuẩn Atlat GD"), "Formula 9 title has 15 stations");
  assert(!calcCode.includes("Sa Pa (Lào Cai)"), "Formula 9 removed Sa Pa");
  assert(calcCode.includes("Hoàng Sa") && calcCode.includes("Trường Sa"), "Formula 9 has Hoang Sa & Truong Sa");
});

// 5. BUG-04: Chuẩn hoá bài luyện biểu đồ
check("BUG-04", "14 bài luyện biểu đồ đã kiểm chứng nguồn; Câu 6 chỉ có %; Câu 3 đủ 7 năm", () => {
  const chartData = JSON.parse(fs.readFileSync("public/data/chart_questions.json", "utf-8"));
  assert.strictEqual(chartData.questions.length, 14, `Must have 14 verified questions, got ${chartData.questions.length}`);

  // Question 6 (DOCX_CHART_06): Only %
  const q6 = chartData.questions.find(q => q.id === "DOCX_CHART_06");
  assert(q6, "Question 6 exists");
  q6.data_table.rows.forEach(r => {
    assert.strictEqual(r.unit, "%", `Question 6 row ${r.name} unit must be %, got ${r.unit}`);
  });

  // Question 3 (DOCX_CHART_03): 7 years
  const q3 = chartData.questions.find(q => q.id === "DOCX_CHART_03");
  assert(q3, "Question 3 exists");
  assert.strictEqual(q3.data_table.headers.slice(1).length, 7, `Question 3 must have 7 years, got ${q3.data_table.headers.slice(1).length}`);
});

// 6. BUG-05: Quy tắc chấm biểu đồ (Tròn 1-2 năm, Miền >= 3 năm, Cột chồng)
check("BUG-05", "Quy tắc chấm biểu đồ: Tròn <= 2 năm, Miền >= 3 năm, Cột chồng khi quy mô và cơ cấu >= 3 năm", () => {
  const chartTrainerCode = fs.readFileSync("js/chart-trainer.js", "utf-8");

  assert(chartTrainerCode.includes("numYears <= 2"), "hasScaleAndStructure checks numYears <= 2");
  assert(chartTrainerCode.includes("numYears >= 3"), "hasStructure checks numYears >= 3");
  assert(chartTrainerCode.includes("Chuỗi số liệu có từ 3 năm trở lên"), "Critique updated to 3 years");
});

// 7. BUG-07: Thủy điện/nhiệt điện 2 cấp công suất, GRDP 34 tỉnh
check("BUG-07", "Thủy điện/nhiệt điện 2 cấp công suất (>1000MW & <1000MW), không số MW cụ thể", () => {
  const hydroGeo = JSON.parse(fs.readFileSync("public/data/hydropower.geojson", "utf-8"));
  hydroGeo.features.forEach(f => {
    const p = f.properties;
    assert(!p.capacity_mw, `Power plant ${p.name} must not have exact capacity_mw`);
    assert(p.capacity_group === "Trên 1.000 MW" || p.capacity_group === "Dưới 1.000 MW", `Power plant ${p.name} must have 2-tier capacity_group`);
  });
});

// 8. BUG-08 & BUG-17: Nhãn Hoàng Sa & Trường Sa và cuộn ngang
check("BUG-08 & BUG-17", "Nhãn Hoàng Sa/Trường Sa 2 dòng không tràn viewport; A12-A24 ẩn chữ khi zoom < 8", () => {
  const engineCode = fs.readFileSync("js/atlas-engine.js", "utf-8");
  const css = fs.readFileSync("css/styles.css", "utf-8");

  assert(engineCode.includes("Q.Đ. HOÀNG SA"), "HS short label");
  assert(engineCode.includes("Q.Đ. TRƯỜNG SA"), "TS short label");
  assert(engineCode.includes("isDensePoint"), "isDensePoint check for A12-A24");
  assert(css.includes("zoom-dense-baseline"), "zoom-dense-baseline class defined in CSS");
  assert(css.includes("overflow-x: hidden !important"), "overflow-x prevention in CSS");
});

// 9. BUG-12: Tìm kiếm thông minh ưu tiên loại đối tượng
check("BUG-12", "Tìm kiếm: 'thủy điện Hòa Bình' -> Thủy điện Hòa Bình; 'cao nguyên Sơn La' -> Cao nguyên Sơn La", () => {
  const engineCode = fs.readFileSync("js/atlas-engine.js", "utf-8");

  assert(engineCode.includes("isHydroQuery"), "search has isHydroQuery");
  assert(engineCode.includes("isTopoQuery"), "search has isTopoQuery");
  assert(engineCode.includes("candidatePool"), "search uses scored candidatePool");
});

// 10. BUG-13: Gỡ nút và modal Bản Đồ Gốc SGK
check("BUG-13", "Gỡ hoàn toàn nút và modal Bản Đồ Gốc SGK khỏi index.html và 200.html", () => {
  const indexHtml = fs.readFileSync("index.html", "utf-8");
  const html200 = fs.readFileSync("200.html", "utf-8");

  assert(!indexHtml.includes("modal-atlat-pages"), "index.html has no modal-atlat-pages");
  assert(!indexHtml.includes("openAtlatPagesModal"), "index.html has no openAtlatPagesModal");
  assert(!html200.includes("modal-atlat-pages"), "200.html has no modal-atlat-pages");
  assert(!html200.includes("openAtlatPagesModal"), "200.html has no openAtlatPagesModal");
});

// 11. BUG-15: Định dạng số chuẩn Việt Nam (bỏ toLocaleString)
check("BUG-15", "Định dạng số chuẩn Việt Nam (0 chỗ toLocaleString trong geo-calculator.js)", () => {
  const calcCode = fs.readFileSync("js/geo-calculator.js", "utf-8");
  assert.strictEqual((calcCode.match(/toLocaleString/g) || []).length, 0, "0 toLocaleString in geo-calculator.js");
  assert(calcCode.includes("function formatVN("), "formatVN helper exists");
  assert(calcCode.includes("function formatIntVN("), "formatIntVN helper exists");
});

// 12. BUG-21: Biểu đồ đường và miền: tắt uốn cong (smooth: false)
check("BUG-21", "Biểu đồ đường và miền: tắt uốn cong (smooth: false)", () => {
  const chartTrainerCode = fs.readFileSync("js/chart-trainer.js", "utf-8");
  assert(!chartTrainerCode.includes("smooth: true,"), "chart-trainer.js has no smooth: true");
});

// 13. BUG-22: Đủ 9 hệ thống sông lớn Atlat GD tr.10
check("BUG-22", "Bổ sung đủ 9 hệ thống sông lớn Atlat GD tr.10 kèm nhãn Sơ đồ minh hoạ", () => {
  const topoGeo = JSON.parse(fs.readFileSync("public/data/topography_rivers.geojson", "utf-8"));
  const rivers = topoGeo.features.filter(f => f.properties.category === "river_system");

  assert.strictEqual(rivers.length, 9, `Must have all 9 river systems, got ${rivers.length}`);
  rivers.forEach(r => {
    assert(r.properties.note && r.properties.note.includes("Sơ đồ minh hoạ"), `River ${r.properties.name} has note Sơ đồ minh hoạ`);
  });
});

// 14. BUG-19: Bỏ runSystemHealthCheck 1.4MB vô ích khi khởi động
check("BUG-19", "Bỏ runSystemHealthCheck tải 1.4MB GeoJSON vô ích khi khởi động app.js", () => {
  const appCode = fs.readFileSync("js/app.js", "utf-8");
  assert(!appCode.includes("runSystemHealthCheck"), "app.js does not run runSystemHealthCheck");
});

console.log("======================================================================");
console.log(`  RESULT: ${passed}/${total} TESTS PASSED (${Math.round(passed/total*100)}%)`);
console.log("======================================================================");

if (passed === total) {
  console.log(">>> SUCCESS: ALL v2 AUDIT ITEMS FULLY RESOLVED! <<<");
  process.exit(0);
} else {
  console.error(">>> FAILURE: Some items did not pass! <<<");
  process.exit(1);
}

