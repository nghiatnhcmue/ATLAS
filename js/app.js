/**
 * GeoAtlas Interactive - Main App Controller
 * Manages Viewport Lock, Segmented Pill Controls, Theme, Engine Sync, and System Health Check
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setupModes();

  // Khởi động 3 phân hệ cốt lõi
  AtlasEngine.init("atlas-map");
  ChartTrainer.init();
  GeoCalculator.init();

  setupSearch();

  // Chạy quy trình Tự Chẩn Đoán Dữ Liệu (Health Check) khi trình duyệt nhàn rỗi (idle) để đạt FCP < 50ms
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => runSystemHealthCheck());
  } else {
    setTimeout(runSystemHealthCheck, 2000);
  }

  // Tự động co giãn khi đổi kích thước màn hình
  window.addEventListener("resize", () => {
    const map = AtlasEngine.getMap();
    if (map) map.invalidateSize();
    ChartTrainer.resize();
  });

  console.log("🚀 GeoAtlas Interactive: 3 Phân hệ đã sẵn sàng với Viewport Lock & Anti-overlap!");
});

function setupModes() {
  const modeButtons = document.querySelectorAll("[data-tab-target]");
  const modeViews = document.querySelectorAll(".mode-view");

  modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab-target");

      // Cập nhật trạng thái Segmented Pill Button
      modeButtons.forEach(b => {
        b.classList.remove("bg-blue-600", "text-white", "shadow-xs");
        b.classList.add("text-slate-600", "dark:text-slate-400");
      });
      btn.classList.remove("text-slate-600", "dark:text-slate-400");
      btn.classList.add("bg-blue-600", "text-white", "shadow-xs");

      // Cập nhật hiển thị view
      modeViews.forEach(v => v.classList.add("hidden"));
      const activeView = document.getElementById(targetId);
      if (activeView) activeView.classList.remove("hidden");

      // Bắt buộc gọi invalidateSize & resize tại 50ms và 180ms để chống xám/bẹp
      setTimeout(() => {
        const map = AtlasEngine.getMap();
        if (map) map.invalidateSize();
        ChartTrainer.resize();
      }, 50);

      setTimeout(() => {
        const map = AtlasEngine.getMap();
        if (map) map.invalidateSize();
        ChartTrainer.resize();
      }, 180);
    });
  });
}

function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  const isDark = localStorage.getItem("geoatlas_theme") === "dark" || 
                 (!localStorage.getItem("geoatlas_theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const currentDark = document.documentElement.classList.toggle("dark");
      localStorage.setItem("geoatlas_theme", currentDark ? "dark" : "light");
      if (typeof ChartTrainer.syncTheme === "function") {
        ChartTrainer.syncTheme();
      }
      ChartTrainer.resize();
    });
  }
}

function setupSearch() {
  const input = document.getElementById("atlas-search-input");
  const btn = document.getElementById("atlas-search-btn");

  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") AtlasEngine.searchAndFlyTo(input.value);
    });
  }
  if (btn && input) {
    btn.addEventListener("click", () => AtlasEngine.searchAndFlyTo(input.value));
  }
}

/**
 * BƯỚC 5: Tự Chẩn Đoán Trực Tiếp (Built-in Health Check)
 * Quét trạng thái 5 tệp dữ liệu, kích hoạt Fallback nếu lỗi, và in báo cáo console.table
 */
async function runSystemHealthCheck() {
  const datasets = [
    { key: "provinces", url: "./public/data/vn_provinces.geojson", fallback: window.GEO_ATLAS_FALLBACK_DATA?.provinces },
    { key: "minerals", url: "./public/data/minerals.geojson", fallback: window.GEO_ATLAS_FALLBACK_DATA?.minerals },
    { key: "power", url: "./public/data/hydropower.geojson", fallback: window.GEO_ATLAS_FALLBACK_DATA?.power },
    { key: "industrial", url: "./public/data/industrial_centers.geojson", fallback: window.GEO_ATLAS_FALLBACK_DATA?.industrial },
    { key: "chartQuestions", url: "./public/data/chart_questions.json", fallback: window.GEO_ATLAS_FALLBACK_DATA?.chartQuestions }
  ];

  const results = [];
  let anyFallbackUsed = false;

  for (const ds of datasets) {
    let status = "OK (Network)";
    let count = 0;
    try {
      const res = await fetch(ds.url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      count = json.features ? json.features.length : (json.questions ? json.questions.length : 0);
      if (count === 0) throw new Error("Dữ liệu rỗng");
    } catch (err) {
      status = "FALLBACK (Nội tuyến)";
      anyFallbackUsed = true;
      count = ds.fallback ? (ds.fallback.features ? ds.fallback.features.length : (Array.isArray(ds.fallback) ? ds.fallback.length : 0)) : 0;
    }

    results.push({
      "Tệp / Đối Tượng": ds.key,
      "Đường Dẫn": ds.url,
      "Trạng Thái": status,
      "Số Bản Ghi": count
    });
  }

  console.log("%c🏥 GEOATLAS HEALTH CHECK REPORT", "font-weight: bold; font-size: 13px; color: #2563eb;");
  console.table(results);

  if (anyFallbackUsed && typeof window.showOfflineToast === 'function') {
    window.showOfflineToast();
  }
}

/**
 * Hiển thị thông báo khi hệ thống kích hoạt TẦNG 3 Dữ liệu Hạt giống (CORS / Offline)
 * Đặt z-index: 2000 (app-toast)
 */
let offlineToastShown = false;
window.showOfflineToast = function () {
  if (offlineToastShown) return;
  offlineToastShown = true;

  const toast = document.createElement("div");
  toast.id = "geoatlas-offline-toast";
  toast.className = "fixed bottom-4 right-4 z-[2000] app-toast flex items-center space-x-3 px-4 py-3 bg-amber-500 text-white rounded-2xl shadow-xl border border-amber-400 font-sans text-xs font-semibold animate-bounce transition-all duration-300";
  toast.innerHTML = `
    <span class="text-base">🛡️</span>
    <div>
      <div class="font-bold">Đang chạy Chế độ Dự phòng Nội tuyến (Tier 3 Seed Data)</div>
      <div class="text-[10px] text-amber-100 font-normal">Toàn bộ 3 phân hệ hoạt động 100% trơn tru không cần kết nối mạng.</div>
    </div>
    <button onclick="this.parentElement.remove()" class="ml-2 hover:bg-amber-600 rounded-lg p-1 text-white">✕</button>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("animate-bounce");
  }, 2500);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 500);
    }
  }, 8000);
};

window.showAppToast = function (msg) {
  const existing = document.getElementById("geoatlas-app-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "geoatlas-app-toast";
  toast.className = "fixed bottom-5 left-1/2 -translate-x-1/2 z-[2000] app-toast flex items-center space-x-2 px-4 py-2.5 bg-slate-900/95 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl shadow-xl text-xs font-semibold border border-slate-700 dark:border-slate-300 transition-all duration-300";
  toast.innerHTML = `<span>${msg}</span>`;

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 400);
    }
  }, 4000);
};

