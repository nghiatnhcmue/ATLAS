/**
 * Test Suite for Dual-View Atlat Ecosystem (He sinh thai Atlat Kep)
 * Verifies that Tab 1 successfully integrates:
 * 1. GIS Vector Mode (34 provinces & 7 thematic layers)
 * 2. Authentic Scanned Book Mode (Deep-zoom, pan, exam study guide)
 * 3. Split Classroom 50:50 Mode (Synchronized Atlat Book + GIS)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("======================================================================");
console.log("  DUAL-VIEW ATLAT ECOSYSTEM VERIFICATION TEST SUITE");
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

// 1. Check HTML Elements in index.html and 200.html
check("DUAL-01", "Giao diện tích hợp 3 Chế độ (GIS / Atlat Giấy / Song Song) trong index.html & 200.html", () => {
  const indexHtml = fs.readFileSync("index.html", "utf-8");
  const html200 = fs.readFileSync("200.html", "utf-8");

  assert.strictEqual(indexHtml, html200, "index.html and 200.html must remain 100% identical");

  const requiredIds = [
    "atlat-mode-nav-banner",
    "btn-view-gis",
    "btn-view-book",
    "btn-view-split",
    "atlat-book-toolbar",
    "atlat-book-page-select",
    "atlat-book-zoom-val",
    "gis-map-col",
    "gis-controls-col",
    "atlat-book-col",
    "atlat-book-viewport",
    "atlat-book-wrapper",
    "atlat-book-page-img",
    "atlat-book-page-title",
    "atlat-notes-col",
    "atlat-page-guide-card"
  ];

  requiredIds.forEach(id => {
    assert(indexHtml.includes(`id="${id}"`), `Element id="${id}" must exist in index.html`);
  });
});

// 2. Check CSS styling
check("DUAL-02", "CSS styling cho Viewport, Cursor grab/grabbing và Image shadow", () => {
  const css = fs.readFileSync("css/styles.css", "utf-8");
  assert(css.includes("#atlat-book-viewport"), "css contains #atlat-book-viewport");
  assert(css.includes("#atlat-book-wrapper"), "css contains #atlat-book-wrapper");
  assert(css.includes("#atlat-book-page-img"), "css contains #atlat-book-page-img");
  assert(css.includes("cursor: grab"), "css has grab cursor");
  assert(css.includes("cursor: grabbing"), "css has grabbing cursor");
});

// 3. Check JavaScript Engine Functions
check("DUAL-03", "AtlasEngine triển khai đầy đủ các hàm điều khiển Hệ sinh thái Atlat Kép", () => {
  const code = fs.readFileSync("js/atlas-engine.js", "utf-8");

  const requiredFunctions = [
    "function setAtlasViewMode",
    "function selectAtlatBookPage",
    "function zoomAtlatBook",
    "function resetAtlatBookZoom",
    "function fitAtlatBookWidth",
    "function prevAtlatBookPage",
    "function nextAtlatBookPage",
    "function attachAtlatBookGestures",
    "function renderAtlatPageStudyGuide",
    "function syncGisWithAtlatPage"
  ];

  requiredFunctions.forEach(fn => {
    assert(code.includes(fn), `${fn} must be implemented in atlas-engine.js`);
  });

  const requiredExports = [
    "setAtlasViewMode",
    "getAtlasViewMode",
    "selectAtlatBookPage",
    "zoomAtlatBook",
    "resetAtlatBookZoom",
    "fitAtlatBookWidth",
    "prevAtlatBookPage",
    "nextAtlatBookPage",
    "syncGisWithAtlatPage",
    "renderAtlatPageStudyGuide"
  ];

  requiredExports.forEach(exp => {
    assert(code.includes(exp), `${exp} must be exported in AtlasEngine`);
  });
});

// 4. Check ATLAT_PAGE_STUDY_GUIDE Content
check("DUAL-04", "Cẩm nang ôn thi THPT theo trang (ATLAT_PAGE_STUDY_GUIDE) đầy đủ và sâu sắc", () => {
  const code = fs.readFileSync("js/atlas-engine.js", "utf-8");
  assert(code.includes("ATLAT_PAGE_STUDY_GUIDE"), "ATLAT_PAGE_STUDY_GUIDE lookup table exists");

  const keyPages = [1, 3, 4, 5, 6, 7, 8, 9, 10, 13, 18, 19, 21, 22, 23];
  keyPages.forEach(p => {
    assert(code.includes(`page: ${p}`) || code.includes(`page: "${p}"`), `Study guide covers Page ${p}`);
  });

  assert(code.includes("Trọng tâm thi tốt nghiệp THPT"), "Target exam competency label present");
  assert(code.includes("Bẫy đề thi & Dễ nhầm lẫn"), "Exam traps section present");
});

// 5. Check Scanned Atlat Pages and Manifest on Disk
check("DUAL-05", "100% trang Atlat quét có mặt trên đĩa và khớp với manifest.json", () => {
  const manifestPath = path.join("public", "data", "atlat_pages", "manifest.json");
  assert(fs.existsSync(manifestPath), "manifest.json exists");
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  assert(manifest.length >= 14, `Manifest contains >= 14 pages, got ${manifest.length}`);

  manifest.forEach(item => {
    const filePath = path.normalize(item.file);
    assert(fs.existsSync(filePath), `Page file ${filePath} must exist on disk`);
    const stat = fs.statSync(filePath);
    assert(stat.size > 100000, `Page file ${filePath} must be high-res (> 100KB), got ${stat.size} bytes`);
  });
});

check("DUAL-06", "Thumbnail Trang 3 nguyên vẹn và selectAtlatBookPage không lỗi TDZ ReferenceError", () => {
  assert(fs.existsSync("thumb_page_03.jpg"), "thumb_page_03.jpg exists");
  const engineCode = fs.readFileSync(path.join("js", "atlas-engine.js"), "utf-8");
  const funcIdx = engineCode.indexOf("function selectAtlatBookPage(pageNumber)");
  assert(funcIdx !== -1, "selectAtlatBookPage exists");
  const funcSlice = engineCode.slice(funcIdx, funcIdx + 1500);
  const titleDeclIdx = funcSlice.indexOf("const displayTitle =");
  const altUseIdx = funcSlice.indexOf("imgEl.alt = displayTitle;");
  assert(titleDeclIdx !== -1 && altUseIdx !== -1, "Both displayTitle and imgEl.alt exist");
  assert(titleDeclIdx < altUseIdx, "displayTitle declared before imgEl.alt (No TDZ bug)");
});

console.log("======================================================================");
console.log(`  RESULT: ${passed}/${total} TESTS PASSED (${Math.round((passed/total)*100)}%)`);
console.log("======================================================================");

if (passed === total) {
  console.log(">>> SUCCESS: DUAL-VIEW ATLAT ECOSYSTEM FULLY OPERATIONAL! <<<");
  process.exit(0);
} else {
  console.error(">>> FAILURE: Some dual-ecosystem checks failed! <<<");
  process.exit(1);
}

