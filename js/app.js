/**
 * GeoAtlas Interactive - Main App Controller
 * Manages Viewport Lock, Segmented Pill Controls, Theme, Engine Sync, and System Health Check
 */

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setupModes();

  // Khởi động 3 phân hệ cốt lõi độc lập, cách ly lỗi tuyệt đối
  try {
    if (typeof AtlasEngine?.init === "function") AtlasEngine.init("atlas-map");
  } catch (e) {
    console.error("AtlasEngine init error:", e);
  }

  try {
    if (typeof ChartTrainer?.init === "function") ChartTrainer.init();
  } catch (e) {
    console.error("ChartTrainer init error:", e);
  }

  try {
    if (typeof GeoCalculator?.init === "function") GeoCalculator.init();
  } catch (e) {
    console.error("GeoCalculator init error:", e);
  }

  setupSearch();
  initSplitResizers();



  // Tự động co giãn khi đổi kích thước màn hình
  window.addEventListener("resize", () => {
    const map = AtlasEngine.getMap();
    if (map) map.invalidateSize();
    if (typeof ChartTrainer?.resize === "function") ChartTrainer.resize();
  });

  // Đóng modal khi bấm Escape hoặc click nền mờ ngoài modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      AtlasEngine.closeSymbolHandbook();
      AtlasEngine.closeCompareModal();
      AtlasEngine.closeMiniGame();
    }
  });

  const handbookModal = document.getElementById("symbol-handbook-modal");
  if (handbookModal) {
    handbookModal.addEventListener("click", (e) => {
      if (e.target === handbookModal) AtlasEngine.closeSymbolHandbook();
    });
  }

  const compareModal = document.getElementById("compare-modal");
  if (compareModal) {
    compareModal.addEventListener("click", (e) => {
      if (e.target === compareModal) AtlasEngine.closeCompareModal();
    });
  }

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
        b.classList.remove("bg-blue-600", "text-white", "shadow-sm");
        b.classList.add("text-slate-600", "dark:text-slate-400");
      });
      btn.classList.remove("text-slate-600", "dark:text-slate-400");
      btn.classList.add("bg-blue-600", "text-white", "shadow-sm");

      // Cập nhật hiển thị view
      modeViews.forEach(v => v.classList.add("hidden"));
      const activeView = document.getElementById(targetId);
      if (activeView) activeView.classList.remove("hidden");

      // Bắt buộc gọi invalidateSize & resize tại 50ms và 180ms để chống xám/bẹp
      setTimeout(() => {
        const map = AtlasEngine.getMap();
        if (map) map.invalidateSize();
        if (typeof ChartTrainer?.resize === "function") ChartTrainer.resize();
      }, 50);

      setTimeout(() => {
        const map = AtlasEngine.getMap();
        if (map) map.invalidateSize();
        if (typeof ChartTrainer?.resize === "function") ChartTrainer.resize();
      }, 180);
    });
  });
}

function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle-btn");
  // Mặc định luôn là Light Mode; chỉ chuyển sang Dark Mode khi người dùng chủ động chọn
  const isDark = localStorage.getItem("geoatlas_theme") === "dark";

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

  let isComposing = false;
  if (input) {
    input.addEventListener("compositionstart", () => {
      isComposing = true;
    });
    input.addEventListener("compositionend", () => {
      isComposing = false;
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        if (isComposing || e.isComposing) return;
        AtlasEngine.searchAndFlyTo(input.value);
      }
    });
  }
  if (btn && input) {
    btn.addEventListener("click", () => AtlasEngine.searchAndFlyTo(input.value));
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



/**
 * Trình điều khiển thanh kéo chia đôi ranh giới hai cột (Draggable Split Resizer)
 * Tự do tùy biến chiều rộng cột Trái / Phải, lưu localStorage, nháy đúp khôi phục mặc định
 */
function initSplitResizers() {
  const configs = [
    {
      resizerId: "atlas-split-resizer",
      containerId: "mode-atlas",
      cssVar: "--atlas-split-left",
      getStorageKey: () => "geoatlas_split_" + (typeof AtlasEngine?.getAtlasViewMode === "function" ? AtlasEngine.getAtlasViewMode() : "gis"),
      getDefault: () => {
        const sub = typeof AtlasEngine?.getAtlasViewMode === "function" ? AtlasEngine.getAtlasViewMode() : "gis";
        return sub === "split" ? 50 : (sub === "book" ? 65 : 68);
      },
      minPct: 35,
      maxPct: 80,
      onResize: () => {
        const map = typeof AtlasEngine?.getMap === "function" ? AtlasEngine.getMap() : null;
        if (map) map.invalidateSize();
        const sub = typeof AtlasEngine?.getAtlasViewMode === "function" ? AtlasEngine.getAtlasViewMode() : "gis";
        if ((sub === "book" || sub === "split") && typeof AtlasEngine?.fitAtlatBookWidth === "function") {
          AtlasEngine.fitAtlatBookWidth();
        }
      }
    },
    {
      resizerId: "charts-split-resizer",
      containerId: "mode-charts",
      cssVar: "--charts-split-left",
      getStorageKey: () => "geoatlas_split_charts",
      getDefault: () => 65,
      minPct: 35,
      maxPct: 78,
      onResize: () => {
        if (typeof ChartTrainer?.resize === "function") ChartTrainer.resize();
      }
    },
    {
      resizerId: "calc-split-resizer",
      containerId: "mode-calc",
      cssVar: "--calc-split-left",
      getStorageKey: () => "geoatlas_split_calc",
      getDefault: () => 60,
      minPct: 35,
      maxPct: 75,
      onResize: () => {}
    }
  ];

  configs.forEach(cfg => {
    const resizer = document.getElementById(cfg.resizerId);
    const container = document.getElementById(cfg.containerId);
    if (!resizer || !container) return;

    // Thiết lập tỉ lệ ban đầu từ localStorage hoặc mặc định
    const saved = localStorage.getItem(cfg.getStorageKey());
    const initPct = saved ? parseFloat(saved) : cfg.getDefault();
    if (!isNaN(initPct)) {
      container.style.setProperty(cfg.cssVar, initPct + "%");
    }

    let isDragging = false;
    let animFrame = null;

    function updateRatio(clientX) {
      const rect = container.getBoundingClientRect();
      if (!rect.width) return;
      const offset = clientX - rect.left;
      let pct = (offset / rect.width) * 100;
      pct = Math.max(cfg.minPct, Math.min(cfg.maxPct, pct));

      container.style.setProperty(cfg.cssVar, pct.toFixed(2) + "%");
      localStorage.setItem(cfg.getStorageKey(), pct.toFixed(2));

      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(() => {
        cfg.onResize();
      });
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      e.preventDefault();
      updateRatio(e.clientX);
    }

    function onPointerUp(e) {
      if (!isDragging) return;
      isDragging = false;
      resizer.classList.remove("is-dragging");
      document.body.classList.remove("split-resizing");

      try {
        if (e && e.pointerId && resizer.releasePointerCapture) {
          resizer.releasePointerCapture(e.pointerId);
        }
      } catch (_) {}

      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);

      cfg.onResize();
    }

    function onPointerDown(e) {
      if (window.innerWidth < 1024) return;
      if (e.button !== undefined && e.button !== 0) return;

      isDragging = true;
      resizer.classList.add("is-dragging");
      document.body.classList.add("split-resizing");

      try {
        if (e.pointerId && resizer.setPointerCapture) {
          resizer.setPointerCapture(e.pointerId);
        }
      } catch (_) {}

      window.addEventListener("pointermove", onPointerMove, { passive: false });
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);

      e.preventDefault();
    }

    resizer.addEventListener("pointerdown", onPointerDown);

    // Nháy đúp chuột để khôi phục tỉ lệ chuẩn
    resizer.addEventListener("dblclick", () => {
      const defPct = cfg.getDefault();
      container.style.setProperty(cfg.cssVar, defPct + "%");
      localStorage.removeItem(cfg.getStorageKey());
      cfg.onResize();

      if (typeof window.showAppToast === "function") {
        window.showAppToast(`Đã khôi phục kích thước mặc định: ${defPct}% / ${100 - defPct}%`);
      }
    });
  });
}
