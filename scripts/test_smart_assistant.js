/**
 * Test Suite for Smart Geo-Search & Expert Assistant (GeoSmartAssistant)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("======================================================================");
console.log("  SMART GEO-SEARCH & EXPERT ASSISTANT VERIFICATION SUITE");
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

// Load GeoSmartAssistant in simulated environment
const code = fs.readFileSync(path.join("js", "geo-smart-assistant.js"), "utf-8");
const dummyWindow = {
  addEventListener: () => {},
  removeEventListener: () => {}
};
const evalFn = new Function("window", "document", code);
evalFn(dummyWindow, {
  readyState: "complete",
  addEventListener: () => {},
  removeEventListener: () => {},
  createElement: () => ({ innerHTML: "", classList: { add: () => {}, remove: () => {} } }),
  body: { appendChild: () => {} },
  getElementById: () => null
});

const Assistant = dummyWindow.GeoSmartAssistant;

check("ASSIST-01", "GeoSmartAssistant module xuất đầy đủ API công khai", () => {
  assert(Assistant, "GeoSmartAssistant exists on window");
  assert(typeof Assistant.analyzeQuery === "function", "analyzeQuery exists");
  assert(typeof Assistant.openModal === "function", "openModal exists");
  assert(typeof Assistant.closeModal === "function", "closeModal exists");
  assert(typeof Assistant.flyToGeo === "function", "flyToGeo exists");
  assert(typeof Assistant.flipToAtlatPage === "function", "flipToAtlatPage exists");
});

check("ASSIST-02", "Giải đáp quy tắc biểu đồ: 'tốc độ tăng trưởng' -> Biểu đồ Đường + Bẫy đơn vị", () => {
  const res = Assistant.analyzeQuery("Biểu đồ nào thích hợp nhất thể hiện tốc độ tăng trưởng lúa qua các năm 2015, 2018, 2020, 2024?");
  assert(res, "Result returned");
  assert(res.chart, "Chart detected");
  assert.strictEqual(res.chart.type, "line", "Chart type must be line");
  assert(res.chart.trap.includes("BẪY KINH ĐIỂN"), "Trap detector warning present");
  assert(res.chart.formula.includes("100\\%"), "Formula includes 100%");
});

check("ASSIST-03", "Giải đáp quy tắc biểu đồ: 'cơ cấu qua 4 năm' -> Biểu đồ Miền; 'cơ cấu 1 năm' -> Biểu đồ Tròn", () => {
  const resArea = Assistant.analyzeQuery("Chuyển dịch cơ cấu lao động phân theo ngành kinh tế giai đoạn 2010 - 2024 (4 năm)");
  assert(resArea.chart, "Chart detected for area");
  assert.strictEqual(resArea.chart.type, "area", "Chart type must be area for >= 3-4 years");

  const resPie = Assistant.analyzeQuery("Cơ cấu GDP phân theo thành phần kinh tế năm 2024");
  assert(resPie.chart, "Chart detected for pie");
  assert.strictEqual(resPie.chart.type, "pie", "Chart type must be pie for single year");
});

check("ASSIST-04", "Giải đáp quy tắc biểu đồ: 'quy mô và cơ cấu từ 3 năm' -> Biểu đồ Cột chồng", () => {
  const resStacked = Assistant.analyzeQuery("Thể hiện quy mô và cơ cấu giá trị xuất nhập khẩu qua các năm 2018, 2021, 2024");
  assert(resStacked.chart, "Chart detected");
  assert.strictEqual(resStacked.chart.type, "bar_stacked", "Must recommend stacked bar");
});

check("ASSIST-05", "Định vị không gian: 'khu kinh tế Dung Quất' -> Tọa độ Quảng Ngãi & Atlat Trang 18, 22", () => {
  const res = Assistant.analyzeQuery("khu kinh tế Dung Quất");
  assert(res.geoEntities.length > 0, "Dung Quat geo-entity found");
  const top = res.geoEntities[0];
  assert(top.name.includes("Dung Quất"), "Name matches Dung Quất");
  assert(top.lat > 15.0 && top.lat < 16.0, "Latitude matches Quang Ngai coast");
  assert(top.lng > 108.0 && top.lng < 109.5, "Longitude matches Quang Ngai coast");
  assert(res.atlatPages.includes(18), "Refers to Atlat page 18");
});

check("ASSIST-06", "Định vị không gian: 'mỏ bôxit Tây Nguyên' -> Đắk Nông/Lâm Đồng & Atlat Trang 13", () => {
  const res = Assistant.analyzeQuery("cho biết mỏ bôxit Tây Nguyên có đặc điểm gì");
  assert(res.geoEntities.length > 0, "Boxit geo-entity found");
  const top = res.geoEntities[0];
  assert(top.name.includes("Bôxit"), "Matches Boxit");
  assert(res.atlatPages.includes(13), "Refers to Mineral page 13");
});

check("ASSIST-07", "Định vị không gian: 'thủy điện Hòa Bình' -> Sông Đà & Atlat Trang 22", () => {
  const res = Assistant.analyzeQuery("thủy điện Hòa Bình nằm trên sông nào");
  assert(res.geoEntities.length > 0, "Hoa Binh hydro found");
  const top = res.geoEntities[0];
  assert(top.name.includes("Hòa Bình"), "Matches Hoa Binh");
  assert(top.highlights.includes("sông Đà"), "Notes Song Da river");
  assert(res.atlatPages.includes(22), "Refers to Power page 22");
});

check("ASSIST-08", "Tích hợp giao diện: Header có thanh tra cứu, script tag có mặt trong index.html và 200.html", () => {
  const indexHtml = fs.readFileSync("index.html", "utf-8");
  const html200 = fs.readFileSync("200.html", "utf-8");

  assert.strictEqual(indexHtml, html200, "index.html and 200.html must remain identical");
  assert(indexHtml.includes("global-smart-assistant-input"), "Input element present in header");
  assert(indexHtml.includes("geo-smart-assistant.js"), "Script tag present");
});

check("ASSIST-09", "AI Sư Phạm Nội Tuyến: Trả lời câu hỏi trọng tâm THPT & chỉ dẫn trang Atlat", () => {
  const res = Assistant.analyzeQuery("vì sao miền Bắc có mùa đông lạnh");
  assert(res.offlineQA, "Offline QA matched");
  assert(res.offlineQA.title.includes("Miền Bắc"), "Title matches Northern winter");
  assert(res.offlineQA.content.includes("Gió mùa Đông Bắc"), "Explains Northeast monsoon");
  assert(res.atlatPages.includes(8) || res.atlatPages.includes(9), "Refers to Climate pages 8 or 9");
});

check("ASSIST-10", "AI Tools: Sinh mẫu nhận xét bảng số liệu 4 bước chuẩn Bộ GD&ĐT", () => {
  const review = Assistant.generateTableReview("Diện tích và sản lượng lúa");
  assert(review.includes("Bước 1"), "Contains Step 1: xu hướng");
  assert(review.includes("Bước 2"), "Contains Step 2: độ tăng giảm");
  assert(review.includes("Bước 3"), "Contains Step 3: so sánh cơ cấu");
  assert(review.includes("Bước 4"), "Contains Step 4: nguyên nhân");
});

check("ASSIST-11", "AI Tools: Sinh câu hỏi trắc nghiệm tự động theo trang Atlat", () => {
  const quiz8 = Assistant.generateAtlatQuiz(8);
  assert(quiz8.includes("trạm khí tượng"), "Quiz page 8 contains meteorological questions");
  assert(quiz8.includes("Sa Pa"), "Mentions Sa Pa station");

  const quiz22 = Assistant.generateAtlatQuiz(22);
  assert(quiz22.includes("thủy điện Hòa Bình"), "Quiz page 22 contains power plant questions");
});

console.log("======================================================================");
console.log(`  RESULT: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
console.log("======================================================================");

if (passed === total) {
  console.log(">>> SUCCESS: SMART GEO-SEARCH & ASSISTANT FULLY VERIFIED! <<<");
  process.exit(0);
} else {
  console.error(">>> FAILURE: Some assistant checks failed! <<<");
  process.exit(1);
}
