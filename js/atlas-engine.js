/**
 * GeoAtlas Interactive - Leaflet Atlas Engine v2.0 (Phân hệ 1)
 * Major Refactor v2.0:
 * - 4 Basemaps (Atlat Pure Vector [Default], Esri Topo/Physical, OpenStreetMap, Esri Imagery) - 100% Free, Zero API Keys, Zero Carto Watermarks
 * - Lat/Lng Graticule Lines (8°N - 24°N, 102°E - 114°E)
 * - Decluttered Labels (Zoom >= 7 transparent markers, Hover-only tooltips, Single Sovereignty Pill)
 * - Spotlight Focus Filtering (Dims non-selected to 0.12, highlights selected to 0.85, smooth flyToBounds)
 * - Both 6 Socio-Economic Regions (GDPT 2018) & 7 Traditional Regions (Atlat SGK)
 * - 34 New Administrative Units (NQ 202/2025/QH15) & 63 Traditional Provinces Toggle
 * - Zoom-scaled Industrial Circles (radius x 0.65 when zoom < 6)
 * - Animated Climate & Monsoon Layer (Gió Đông Bắc, Tây Nam, Phơn Lào, Bão nhiệt đới)
 * - 9 Major River Systems & Category I Deep-sea Ports / International Airports
 * - Floating GIS Toolbar (Reset View, Measure Tool [Haversine + 1:6.000.000 Scale], Compare Mode Modal, 15s Quick Locate Mini-Game)
 * - Rich Knowledge Cards with 2025-2026 True/False Exam Tips
 */

const AtlasEngine = (function () {
  let map = null;
  let layerProvinces = null;
  let layerProvinceLabels = null;
  let layerMinerals = null;
  let layerPower = null;
  let layerIndustrial = null;
  let layerClimate = null;
  let layerRiversPorts = null;
  let layerGraticule = null;
  let layerMeasure = null;

  let currentBaseMapMode = "vector"; // "vector" | "physical" | "osm" | "satellite"
  let currentBaseMapTile = null;
  let provinceMode = "63"; // "63" (Atlat SGK) | "34" (NQ 202/2025/QH15)
  let currentRegionFilter = "all";
  let currentOpacity = 0.35;

  // Measurement tool state
  let isMeasureActive = false;
  let measurePoints = [];
  let measureLine = null;
  let measureMarkers = [];

  // Mini-Game state
  let miniGameActive = false;
  let miniGameTarget = null;
  let miniGameTimer = null;
  let miniGameTimeLeft = 15;
  let miniGameScore = 0;
  let miniGameStreak = 0;

  const BASEMAPS = {
    vector: {
      name: "Atlat Vector Thuần",
      desc: "Nền vector đại dương không bao giờ lỗi, không cần internet",
      attribution: "&copy; Atlat Địa lí Việt Nam & GDPT 2018"
    },
    physical: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}",
      attribution: "&copy; Esri World Physical Map & USGS"
    },
    osm: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "&copy; OpenStreetMap contributors"
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "&copy; Esri World Imagery"
    }
  };

  let geoData = {
    provinces: null,
    provinces63: null,
    provinces34: null,
    minerals: null,
    power: null,
    industrial: null
  };

  const LAYER_FILES = {
    provinces: "./public/data/vn_provinces.geojson",
    provinces63: "./public/data/vn_provinces_63.geojson",
    provinces34: "./public/data/vn_provinces_34.geojson",
    minerals: "./public/data/minerals.geojson",
    power: "./public/data/hydropower.geojson",
    industrial: "./public/data/industrial_centers.geojson"
  };

  const loadingPromises = {};

  let activeLayers = {
    provinces: true,
    minerals: false,
    power: false,
    industrial: false,
    climate: false,
    rivers: false
  };

  const REGION_COLORS = {
    "Đồng bằng sông Hồng": "#3b82f6",
    "Trung du và miền núi Bắc Bộ": "#10b981",
    "Bắc Trung Bộ": "#06b6d4",
    "Duyên hải Nam Trung Bộ": "#f59e0b",
    "Bắc Trung Bộ và Duyên hải miền Trung": "#0891b2",
    "Tây Nguyên": "#84cc16",
    "Đông Nam Bộ": "#ec4899",
    "Đồng bằng sông Cửu Long": "#8b5cf6",
    "Khác": "#94a3b8"
  };

  // Ký hiệu Khoáng sản chuẩn Atlat Trang 8
  function getMineralSvg(symbolType) {
    switch (symbolType) {
      case "coal":
      case "square_black":
        return `<svg width="20" height="20" viewBox="0 0 20 20" class="atlat-vector-icon"><rect x="2.5" y="2.5" width="15" height="15" fill="#0F172A" stroke="#FFFFFF" stroke-width="1.5"/></svg>`;
      case "oil":
      case "trapezoid_black":
        return `<svg width="22" height="22" viewBox="0 0 24 24" class="atlat-vector-icon"><polygon points="6,20 18,20 15,6 9,6" fill="#0F172A" stroke="#FFFFFF" stroke-width="1.5"/></svg>`;
      case "gas":
      case "trapezoid_white":
        return `<svg width="22" height="22" viewBox="0 0 24 24" class="atlat-vector-icon"><polygon points="6,20 18,20 15,6 9,6" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/></svg>`;
      case "iron":
      case "triangle_black":
        return `<svg width="20" height="20" viewBox="0 0 20 20" class="atlat-vector-icon"><polygon points="10,2 19,18 1,18" fill="#0F172A" stroke="#FFFFFF" stroke-width="1.5"/></svg>`;
      case "apatite":
      case "inverted_v":
        return `<svg width="22" height="22" viewBox="0 0 24 24" class="atlat-vector-icon"><path d="M4 20 L12 4 L20 20" fill="none" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 20 L12 4 L20 20" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case "bauxite":
      case "al_symbol":
        return `<svg width="22" height="22" viewBox="0 0 24 24" class="atlat-vector-icon"><polygon points="12,2 22,12 12,22 2,12" fill="#EA580C" stroke="#FFFFFF" stroke-width="1.5"/><text x="12" y="15" font-size="8" font-weight="900" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif">Al</text></svg>`;
      case "tin":
      case "sn_symbol":
        return `<svg width="20" height="20" viewBox="0 0 20 20" class="atlat-vector-icon"><rect x="2.5" y="2.5" width="15" height="15" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/><line x1="2.5" y1="2.5" x2="17.5" y2="17.5" stroke="#0F172A" stroke-width="1.5"/><line x1="17.5" y1="2.5" x2="2.5" y2="17.5" stroke="#0F172A" stroke-width="1.5"/></svg>`;
      case "chromium":
      case "cr_symbol":
        return `<svg width="20" height="20" viewBox="0 0 20 20" class="atlat-vector-icon"><circle cx="10" cy="10" r="8" fill="#334155" stroke="#FFFFFF" stroke-width="1.5"/><polygon points="10,4 12,8 16,8 13,11 14,15 10,12 6,15 7,11 4,8 8,8" fill="#FFFFFF"/></svg>`;
      default:
        return `<svg width="18" height="18" viewBox="0 0 20 20" class="atlat-vector-icon"><circle cx="10" cy="10" r="7" fill="#64748B" stroke="#FFFFFF" stroke-width="1.5"/></svg>`;
    }
  }

  // Ký hiệu Năng lượng chuẩn Atlat Trang 22
  function getPowerSvg(plantType, mw) {
    const isHydro = plantType.includes("Thủy");
    const color = isHydro ? "#0284C7" : "#DC2626";
    const size = mw >= 1000 ? 26 : 20;
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" class="atlat-vector-icon">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="${color}" stroke="#FFFFFF" stroke-width="1.5"/>
      </svg>
    `;
  }

  function normalizeVN(str) {
    return (str || '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }

  // Tạo SVG Pie Chart cho Trung tâm Công nghiệp (Zoom-scaled an toàn)
  function createSvgPieChart(sectors, radiusPx) {
    const size = radiusPx * 2;
    const cx = radiusPx;
    const cy = radiusPx;
    const r = radiusPx - 1;

    if (!sectors || sectors.length === 0) {
      return `
        <div class="pie-marker-wrapper" style="width: ${size}px; height: ${size}px;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="#94a3b8" stroke="#ffffff" stroke-width="1.2"/>
            <circle cx="${cx}" cy="${cy}" r="2" fill="#ffffff" stroke="#0f172a" stroke-width="0.8"/>
          </svg>
        </div>
      `;
    }

    // Xử lý an toàn: 1 ngành vẽ thẻ <circle> tránh lỗi SVG arc 360 độ
    if (sectors.length === 1) {
      const color = sectors[0].color || "#2563eb";
      return `
        <div class="pie-marker-wrapper" style="width: ${size}px; height: ${size}px;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#ffffff" stroke-width="1.2"/>
            <circle cx="${cx}" cy="${cy}" r="2" fill="#ffffff" stroke="#0f172a" stroke-width="0.8"/>
          </svg>
        </div>
      `;
    }

    let accumulatedAngle = 0;
    const totalShare = sectors.reduce((sum, s) => sum + (Number(s.share) || 0), 0) || 100;
    const paths = [];

    sectors.forEach(sec => {
      const sliceAngle = ((Number(sec.share) || 0) / totalShare) * 360;
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + sliceAngle;
      accumulatedAngle = endAngle;

      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);

      const largeArc = sliceAngle > 180 ? 1 : 0;
      const color = sec.color || "#3b82f6";

      paths.push(`<path d="M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${color}" stroke="#ffffff" stroke-width="0.8"/>`);
    });

    return `
      <div class="pie-marker-wrapper" style="width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          ${paths.join("")}
          <circle cx="${cx}" cy="${cy}" r="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
        </svg>
      </div>
    `;
  }

  function init() {
    const mapEl = document.getElementById("atlas-map");
    if (!mapEl) return;

    map = L.map("atlas-map", {
      center: [16.2, 107.5],
      zoom: 5.5,
      minZoom: 4,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: true
    });

    L.control.zoom({ position: "topright" }).addTo(map);

    // Panes phân tầng z-index
    map.createPane('graticulePane');
    map.getPane('graticulePane').style.zIndex = 200;

    map.createPane('polygonBoundaryPane');
    map.getPane('polygonBoundaryPane').style.zIndex = 300;

    map.createPane('climatePane');
    map.getPane('climatePane').style.zIndex = 350;

    map.createPane('riverPane');
    map.getPane('riverPane').style.zIndex = 380;

    map.createPane('pointMarkerPane');
    map.getPane('pointMarkerPane').style.zIndex = 400;

    map.createPane('labelPane');
    map.getPane('labelPane').style.zIndex = 450;
    map.getPane('labelPane').style.pointerEvents = 'none';

    // Khởi tạo các Layer Group
    layerProvinces = L.layerGroup().addTo(map);
    layerProvinceLabels = L.layerGroup().addTo(map);
    layerMinerals = L.layerGroup();
    layerPower = L.layerGroup();
    layerIndustrial = L.layerGroup();
    layerClimate = L.layerGroup();
    layerRiversPorts = L.layerGroup();
    layerMeasure = L.layerGroup().addTo(map);

    // Lập lưới kinh vĩ tuyến (Graticule)
    setupGraticule();

    // Mặc định dùng nền Atlat Vector Thuần
    setBaseMap("vector");

    // Khẳng định chủ quyền biển đảo (duy nhất 1 nhãn sạch cho mỗi quần đảo)
    addSovereigntyDemarcation();

    // Tọa độ con trỏ chuột thời gian thực & bắt sự kiện đo đạc / mini-game
    map.on("mousemove", (e) => {
      const coordEl = document.getElementById("cursor-coords");
      if (coordEl) {
        coordEl.innerText = `${e.latlng.lat.toFixed(4)}°B, ${e.latlng.lng.toFixed(4)}°Đ`;
      }
    });

    map.on("click", (e) => {
      if (isMeasureActive) {
        handleMeasureClick(e.latlng);
      }
    });

    // Zoom listener: bật nhãn tỉnh khi zoom >= 7, co giãn bán kính công nghiệp
    map.on("zoomend", () => {
      updateProvinceLabelsVisibility();
      if (activeLayers.industrial) {
        renderIndustrialCenters();
      }
    });

    loadData();
  }

  // Khởi tạo Lưới Kinh Vĩ Tuyến (Graticule)
  function setupGraticule() {
    layerGraticule = L.layerGroup();

    // Vĩ tuyến: 8°B đến 24°B mỗi 2 độ
    for (let lat = 8; lat <= 24; lat += 2) {
      const line = L.polyline([[lat, 101.0], [lat, 116.0]], {
        pane: 'graticulePane',
        color: "rgba(100, 116, 139, 0.28)",
        weight: 1,
        dashArray: "3, 5",
        interactive: false
      });
      layerGraticule.addLayer(line);

      const label = L.marker([lat, 102.0], {
        pane: 'graticulePane',
        icon: L.divIcon({
          className: 'graticule-deg-label',
          html: `<span class="text-[9px] font-mono font-bold text-slate-500/70 select-none">${lat}°B</span>`,
          iconSize: [30, 14],
          iconAnchor: [15, 7]
        }),
        interactive: false
      });
      layerGraticule.addLayer(label);
    }

    // Kinh tuyến: 102°Đ đến 114°Đ mỗi 2 độ
    for (let lng = 102; lng <= 114; lng += 2) {
      const line = L.polyline([[7.5, lng], [24.5, lng]], {
        pane: 'graticulePane',
        color: "rgba(100, 116, 139, 0.28)",
        weight: 1,
        dashArray: "3, 5",
        interactive: false
      });
      layerGraticule.addLayer(line);

      const label = L.marker([8.5, lng], {
        pane: 'graticulePane',
        icon: L.divIcon({
          className: 'graticule-deg-label',
          html: `<span class="text-[9px] font-mono font-bold text-slate-500/70 select-none">${lng}°Đ</span>`,
          iconSize: [30, 14],
          iconAnchor: [15, 7]
        }),
        interactive: false
      });
      layerGraticule.addLayer(label);
    }
  }

  // Chuyển đổi Basemap: 4 chế độ miễn phí không cần API Key
  function setBaseMap(type) {
    if (!map) return;
    currentBaseMapMode = type;

    if (currentBaseMapTile && map.hasLayer(currentBaseMapTile)) {
      map.removeLayer(currentBaseMapTile);
      currentBaseMapTile = null;
    }

    const mapContainer = document.getElementById("atlas-map");

    if (type === "vector") {
      // Atlat Vector Thuần: Không dùng tile bên ngoài, nền đại dương CSS + Graticule
      if (mapContainer) mapContainer.classList.add("atlat-pure-vector");
      if (layerGraticule && !map.hasLayer(layerGraticule)) map.addLayer(layerGraticule);
    } else {
      if (mapContainer) mapContainer.classList.remove("atlat-pure-vector");
      const cfg = BASEMAPS[type];
      if (cfg && cfg.url) {
        currentBaseMapTile = L.tileLayer(cfg.url, {
          attribution: cfg.attribution,
          maxZoom: 16
        }).addTo(map);
      }
    }

    // Cập nhật giao diện nút chọn Basemap
    ['vector', 'physical', 'osm', 'satellite'].forEach(k => {
      const btn = document.getElementById(`btn-bm-${k}`);
      if (btn) {
        if (k === type) {
          btn.className = "px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold transition shadow-xs";
        } else {
          btn.className = "px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium";
        }
      }
    });
  }

  // Nhãn chủ quyền duy nhất cho Hoàng Sa & Trường Sa
  function addSovereigntyDemarcation() {
    // Biển Đông
    const seaIcon = L.divIcon({
      className: "sea-label",
      html: `<div class="text-blue-900/40 dark:text-blue-200/30 font-bold text-sm tracking-widest uppercase select-none pointer-events-none font-serif">BIỂN ĐÔNG VIỆT NAM</div>`,
      iconSize: [220, 24],
      iconAnchor: [110, 12]
    });
    L.marker([14.5, 113.2], { icon: seaIcon, interactive: false }).addTo(map);

    // Hoàng Sa
    const hsIcon = L.divIcon({
      className: "hs-marker-wrapper",
      html: `<div class="sovereignty-pill"><span>🇻🇳</span><span>QUẦN ĐẢO HOÀNG SA (TP. ĐÀ NẴNG)</span></div>`,
      iconSize: [240, 24],
      iconAnchor: [120, 12],
      popupAnchor: [0, -12]
    });
    const hs = L.marker([16.5, 112.0], { pane: 'pointMarkerPane', icon: hsIcon }).addTo(map);
    hs.bindPopup(`
      <div class="p-3 bg-white dark:bg-slate-900 rounded-xl min-w-[240px]">
        <div class="flex items-center space-x-2 text-red-600 font-bold text-xs mb-1">
          <span>🇻🇳</span>
          <h4>Quần đảo Hoàng Sa</h4>
        </div>
        <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Đơn vị hành chính: <strong>Huyện đảo Hoàng Sa, TP. Đà Nẵng</strong>. Vùng biển có vị trí chiến lược và tiềm năng ngư trường lớn.
        </p>
        <div class="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400">Tham chiếu: Atlat Trang 4-5</div>
      </div>
    `);

    // Trường Sa
    const tsIcon = L.divIcon({
      className: "ts-marker-wrapper",
      html: `<div class="sovereignty-pill"><span>🇻🇳</span><span>QUẦN ĐẢO TRƯỜNG SA (TỈNH KHÁNH HÒA)</span></div>`,
      iconSize: [260, 24],
      iconAnchor: [130, 12],
      popupAnchor: [0, -12]
    });
    const ts = L.marker([10.0, 114.2], { pane: 'pointMarkerPane', icon: tsIcon }).addTo(map);
    ts.bindPopup(`
      <div class="p-3 bg-white dark:bg-slate-900 rounded-xl min-w-[240px]">
        <div class="flex items-center space-x-2 text-red-600 font-bold text-xs mb-1">
          <span>🇻🇳</span>
          <h4>Quần đảo Trường Sa</h4>
        </div>
        <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Đơn vị hành chính: <strong>Huyện đảo Trường Sa, Tỉnh Khánh Hòa</strong>. Điểm tựa vững chắc phát triển kinh tế biển đảo.
        </p>
        <div class="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400">Tham chiếu: Atlat Trang 4-5</div>
      </div>
    `);
  }

  async function ensureLayerData(name) {
    const effectiveName = (name === "provinces") ? (provinceMode === "34" ? "provinces34" : "provinces63") : name;

    if (geoData[effectiveName]) {
      if (name === "provinces") geoData.provinces = geoData[effectiveName];
      return geoData[effectiveName];
    }
    if (loadingPromises[effectiveName]) return loadingPromises[effectiveName];

    loadingPromises[effectiveName] = (async () => {
      try {
        const file = LAYER_FILES[effectiveName] || LAYER_FILES[name];
        if (!file) throw new Error("Unknown layer: " + effectiveName);
        const res = await fetch(file);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        geoData[effectiveName] = data;
        if (name === "provinces") geoData.provinces = data;
        return data;
      } catch (err) {
        console.warn(`[AtlasEngine] Fetch layer '${effectiveName}' thất bại. Sử dụng Seed Fallback:`, err);
        if (window.GEO_ATLAS_FALLBACK_DATA) {
          const fallbackData = window.GEO_ATLAS_FALLBACK_DATA[effectiveName] || window.GEO_ATLAS_FALLBACK_DATA[name];
          if (fallbackData) {
            geoData[effectiveName] = fallbackData;
            if (name === "provinces") geoData.provinces = fallbackData;
            if (typeof window.showOfflineToast === "function") {
              window.showOfflineToast();
            }
            return geoData[effectiveName];
          }
        }
        return null;
      }
    })();

    return loadingPromises[effectiveName];
  }

  async function setProvinceMode(mode) {
    if (mode !== "63" && mode !== "34") return;
    provinceMode = mode;

    const btn63 = document.getElementById("btn-mode-63");
    const btn34 = document.getElementById("btn-mode-34");
    const badge = document.getElementById("province-mode-badge");
    const hint = document.getElementById("province-mode-hint");

    if (mode === "63") {
      if (btn63) btn63.className = "px-2.5 py-1.5 rounded-md font-bold transition text-center flex items-center justify-center space-x-1 bg-blue-600 text-white shadow-xs";
      if (btn34) btn34.className = "px-2.5 py-1.5 rounded-md font-semibold transition text-center flex items-center justify-center space-x-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
      if (badge) {
        badge.innerText = "63 Tỉnh Thành (Atlat SGK)";
        badge.className = "text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      }
      if (hint) {
        hint.innerText = "Chuẩn SGK & Atlat trang 4-5. Bấm vào tỉnh để xem số liệu và phương án sáp nhập mới.";
      }
    } else {
      if (btn63) btn63.className = "px-2.5 py-1.5 rounded-md font-semibold transition text-center flex items-center justify-center space-x-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
      if (btn34) btn34.className = "px-2.5 py-1.5 rounded-md font-bold transition text-center flex items-center justify-center space-x-1 bg-amber-600 text-white shadow-xs";
      if (badge) {
        badge.innerText = "34 Đơn Vị (NQ 202/2025/QH15)";
        badge.className = "text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300";
      }
      if (hint) {
        hint.innerText = "Sắp xếp theo Nghị quyết 202/2025/QH15 (28 Tỉnh + 6 Thành phố TW). Bấm vào tỉnh để xem chi tiết sáp nhập.";
      }
    }

    await ensureLayerData("provinces");
    renderProvinces(currentRegionFilter);
    updateDynamicLegend();
  }

  async function loadData() {
    await ensureLayerData("provinces");
    renderProvinces();
    updateDynamicLegend();
  }

  // Render Tỉnh thành với cơ chế Spotlight Focus (Không bao giờ làm mất tỉnh khác)
  function renderProvinces(filterRegion = "all") {
    if (!geoData.provinces) return;
    currentRegionFilter = filterRegion;
    layerProvinces.clearLayers();
    layerProvinceLabels.clearLayers();

    let matchedLayers = [];

    L.geoJSON(geoData.provinces, {
      pane: 'polygonBoundaryPane',
      style: (f) => {
        const p = f.properties;
        const color = REGION_COLORS[p.region_name] || "#94a3b8";
        const isCity = p.administrative_type === "Thành phố trực thuộc Trung ương";

        const isMatch = filterRegion === "all" || 
          p.region_name === filterRegion ||
          (filterRegion === "Bắc Trung Bộ và Duyên hải miền Trung" && (p.region_name === "Bắc Trung Bộ" || p.region_name === "Duyên hải Nam Trung Bộ"));

        if (isMatch) {
          return {
            fillColor: color,
            weight: isCity ? 2.2 : (filterRegion !== "all" ? 2 : 1),
            opacity: 0.95,
            color: isCity ? "#1d4ed8" : "#ffffff",
            fillOpacity: filterRegion === "all" ? currentOpacity : 0.82
          };
        } else {
          // Spotlight Focus: Làm mờ các tỉnh không thuộc vùng chọn
          return {
            fillColor: color,
            weight: 0.6,
            opacity: 0.5,
            color: "rgba(255, 255, 255, 0.4)",
            fillOpacity: 0.12
          };
        }
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        const isMatch = filterRegion === "all" || 
          p.region_name === filterRegion ||
          (filterRegion === "Bắc Trung Bộ và Duyên hải miền Trung" && (p.region_name === "Bắc Trung Bộ" || p.region_name === "Duyên hải Nam Trung Bộ"));

        if (isMatch) {
          matchedLayers.push(layer);
        }

        layer.on({
          mouseover: (e) => {
            e.target.setStyle({ 
              weight: 2.5, 
              color: "#0f172a", 
              fillOpacity: 0.9
            });
            layer.openTooltip();
          },
          mouseout: (e) => {
            layerProvinces.resetStyle(e.target);
            layer.closeTooltip();
          },
          click: () => {
            if (miniGameActive) {
              handleMiniGameClick(p);
            } else {
              showDetailsPanel(p, "province");
            }
          }
        });

        // Hover-only Tooltip sạch sẽ, không dùng sticky
        const subInfo = provinceMode === "34" 
          ? (p.merged_from_desc ? `<div class="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">${p.merged_from_desc}</div>` : '')
          : (p.merged_into ? `<div class="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">➡️ Sắp xếp mới: ${p.merged_into}</div>` : '');

        const iconType = p.administrative_type === 'Thành phố trực thuộc Trung ương' ? '🏛️' : '📍';
        layer.bindTooltip(`
          <div class="p-1 text-left">
            <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1">
              <span>${iconType}</span>
              <span>${p.name}</span>
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-300 font-medium">${p.region_name || ''}</div>
            ${subInfo}
          </div>
        `, { 
          sticky: false,
          direction: "auto", 
          className: "map-label-tooltip",
          opacity: 0.95
        });

        // Nhãn tên tỉnh trong suốt khi zoom cao (Decluttered)
        try {
          const center = layer.getBounds().getCenter();
          if (center && p.name && !p.is_special_island) {
            const labelMarker = L.marker(center, {
              pane: 'labelPane',
              icon: L.divIcon({
                className: 'province-clean-label-marker',
                html: `<div class="province-clean-label text-[10px] font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm select-none pointer-events-none">${p.name}</div>`,
                iconSize: [100, 16],
                iconAnchor: [50, 8]
              }),
              interactive: false
            });
            layerProvinceLabels.addLayer(labelMarker);
          }
        } catch (e) {}
      }
    }).addTo(layerProvinces);

    // Spotlight focus flyToBounds
    if (filterRegion !== "all" && matchedLayers.length > 0) {
      const group = L.featureGroup(matchedLayers);
      map.flyToBounds(group.getBounds(), { padding: [40, 40], duration: 1.2 });
    }

    updateProvinceLabelsVisibility();
  }

  function updateProvinceLabelsVisibility() {
    if (!map || !layerProvinceLabels) return;
    const currentZoom = map.getZoom();
    if (currentZoom >= 7) {
      if (!map.hasLayer(layerProvinceLabels)) map.addLayer(layerProvinceLabels);
    } else {
      if (map.hasLayer(layerProvinceLabels)) map.removeLayer(layerProvinceLabels);
    }
  }

  function setProvincesOpacity(opacityVal) {
    currentOpacity = parseFloat(opacityVal);
    if (!layerProvinces) return;
    layerProvinces.eachLayer(layer => {
      if (layer.setStyle && currentRegionFilter === "all") {
        layer.setStyle({ fillOpacity: currentOpacity });
      }
    });
  }

  // Lớp Khoáng sản Atlat Trang 8
  async function renderMinerals(groupFilter = "all") {
    if (!geoData.minerals) await ensureLayerData("minerals");
    if (!geoData.minerals) return;

    if (!activeLayers.minerals) {
      activeLayers.minerals = true;
      const chk = document.getElementById("layer-chk-minerals");
      if (chk) chk.checked = true;
      if (!map.hasLayer(layerMinerals)) map.addLayer(layerMinerals);
    }

    layerMinerals.clearLayers();

    L.geoJSON(geoData.minerals, {
      pane: 'pointMarkerPane',
      filter: (f) => groupFilter === "all" || f.properties.group === groupFilter,
      pointToLayer: (feature, latlng) => {
        const p = feature.properties;
        const iconSvg = getMineralSvg(p.symbol || p.mineral_type);
        const icon = L.divIcon({
          className: "atlat-mineral-marker",
          html: iconSvg,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          popupAnchor: [0, -11]
        });
        return L.marker(latlng, { icon });
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindTooltip(`
          <div class="p-1 text-left">
            <div class="font-bold text-xs text-slate-900 dark:text-white">${p.name}</div>
            <div class="text-[10px] text-slate-500">${p.mineral_type} • ${p.province}</div>
          </div>
        `, { sticky: false });

        layer.on("click", () => showDetailsPanel(p, "mineral"));
      }
    }).addTo(layerMinerals);
  }

  // Lớp Năng lượng Atlat Trang 22
  async function renderPower(typeFilter = "all") {
    if (!geoData.power) await ensureLayerData("power");
    if (!geoData.power) return;

    if (!activeLayers.power) {
      activeLayers.power = true;
      const chk = document.getElementById("layer-chk-power");
      if (chk) chk.checked = true;
      if (!map.hasLayer(layerPower)) map.addLayer(layerPower);
    }

    layerPower.clearLayers();

    L.geoJSON(geoData.power, {
      pane: 'pointMarkerPane',
      filter: (f) => typeFilter === "all" || (f.properties.plant_type && f.properties.plant_type.includes(typeFilter)),
      pointToLayer: (feature, latlng) => {
        const p = feature.properties;
        const iconSvg = getPowerSvg(p.plant_type || p.type || "Thủy điện", p.capacity_mw || 500);
        const size = (p.capacity_mw || 500) >= 1000 ? 26 : 20;
        const icon = L.divIcon({
          className: "atlat-power-marker",
          html: iconSvg,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -size / 2]
        });
        return L.marker(latlng, { icon });
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindTooltip(`
          <div class="p-1 text-left">
            <div class="font-bold text-xs text-slate-900 dark:text-white">${p.name}</div>
            <div class="text-[10px] text-blue-600 dark:text-blue-400 font-bold">${p.capacity_mw ? p.capacity_mw.toLocaleString() + ' MW' : ''}</div>
          </div>
        `, { sticky: false });

        layer.on("click", () => showDetailsPanel(p, "power"));
      }
    }).addTo(layerPower);
  }

  // Lớp 15 Trung tâm Công nghiệp Atlat Trang 21 (Zoom-scaled)
  async function renderIndustrialCenters(scaleFilter = "all") {
    if (!geoData.industrial) await ensureLayerData("industrial");
    if (!geoData.industrial) return;

    if (!activeLayers.industrial) {
      activeLayers.industrial = true;
      const chk = document.getElementById("layer-chk-industrial");
      if (chk) chk.checked = true;
      if (!map.hasLayer(layerIndustrial)) map.addLayer(layerIndustrial);
    }

    layerIndustrial.clearLayers();

    const currentZoom = map.getZoom();
    const zoomScale = currentZoom < 6 ? 0.65 : 1.0;

    L.geoJSON(geoData.industrial, {
      pane: 'pointMarkerPane',
      filter: (f) => scaleFilter === "all" || f.properties.scale === scaleFilter,
      pointToLayer: (feature, latlng) => {
        const p = feature.properties;
        const baseRadius = p.radius_px || (p.scale === "very_large" ? 24 : p.scale === "large" ? 18 : 14);
        const radius = Math.round(baseRadius * zoomScale);
        const size = radius * 2;

        const iconHtml = createSvgPieChart(p.sectors, radius);
        const icon = L.divIcon({
          className: "atlat-industrial-marker",
          html: iconHtml,
          iconSize: [size, size],
          iconAnchor: [radius, radius],
          popupAnchor: [0, -radius]
        });
        return L.marker(latlng, { icon });
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindTooltip(`
          <div class="p-1 text-left">
            <div class="font-bold text-xs text-slate-900 dark:text-white">${p.name}</div>
            <div class="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">${p.scale_label || ''}</div>
          </div>
        `, { sticky: false });

        layer.on("click", () => showDetailsPanel(p, "industrial"));
      }
    }).addTo(layerIndustrial);
  }

  // Lớp Khí Hậu & Gió Mùa Động (Animated Vectors & Bão Nhiệt Đới)
  function renderClimateLayer() {
    layerClimate.clearLayers();

    // 1. Gió mùa Đông Bắc (Tháng 11 - 4): Blue arrows đâm vào Bắc Bộ & Bắc Trung Bộ đến dãy Bạch Mã (16°B)
    const dongBacCoords = [
      [[22.8, 107.5], [21.5, 106.0], [20.0, 105.5]],
      [[22.0, 108.5], [20.5, 107.0], [18.5, 106.0], [16.2, 107.8]],
      [[21.0, 109.5], [19.0, 107.5], [17.5, 106.8], [16.0, 108.2]]
    ];

    dongBacCoords.forEach((pts) => {
      const line = L.polyline(pts, {
        pane: 'climatePane',
        color: '#2563EB',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '8, 8',
        className: 'animated-monsoon-line'
      });
      line.bindTooltip("Gió mùa Đông Bắc (Tháng XI - IV): Lạnh khô đầu mùa, lạnh ẩm cuối mùa. Ngăn lại ở dãy Bạch Mã (16°B).", { sticky: false });
      layerClimate.addLayer(line);
    });

    // 2. Gió mùa Tây Nam (Tháng 5 - 10): Red arrows thổi qua Tây Nguyên & Nam Bộ
    const tayNamCoords = [
      [[8.5, 103.5], [10.5, 105.5], [12.5, 107.5]],
      [[9.5, 104.5], [11.5, 107.0], [14.0, 108.5]],
      [[10.0, 106.0], [12.5, 108.0], [15.0, 108.8]]
    ];

    tayNamCoords.forEach((pts) => {
      const line = L.polyline(pts, {
        pane: 'climatePane',
        color: '#DC2626',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '8, 8',
        className: 'animated-monsoon-line'
      });
      line.bindTooltip("Gió mùa Tây Nam (Tháng V - X): Nóng ẩm, gây mưa lớn cho Nam Bộ và Tây Nguyên.", { sticky: false });
      layerClimate.addLayer(line);
    });

    // 3. Gió Phơn Tây Nam (Gió Lào): Orange dashed arrows vượt Trường Sơn Bắc
    const phonLaoCoords = [
      [[18.2, 105.2], [18.6, 105.8]],
      [[17.5, 105.9], [17.8, 106.5]],
      [[16.8, 106.5], [16.9, 107.2]]
    ];

    phonLaoCoords.forEach((pts) => {
      const line = L.polyline(pts, {
        pane: 'climatePane',
        color: '#EA580C',
        weight: 3,
        opacity: 0.9,
        dashArray: '4, 4'
      });
      line.bindTooltip("Gió Tây khô nóng (Gió Phơn Lào): Hiệu ứng phơn qua dãy Trường Sơn Bắc gây khô nóng gay gắt cho dải ven biển miền Trung.", { sticky: false });
      layerClimate.addLayer(line);
    });

    // 4. Đường đi của Bão (Storm Tracks)
    const storms = [
      { pts: [[19.5, 114.0], [20.5, 108.5], [20.8, 106.5]], month: "Tháng VI - VIII (Bắc Bộ)" },
      { pts: [[16.5, 114.5], [16.8, 109.5], [16.5, 107.5]], month: "Tháng IX - X (Trung Bộ)" },
      { pts: [[12.0, 114.0], [11.5, 109.5], [10.5, 107.5]], month: "Tháng XI - XII (Nam Bộ)" }
    ];

    storms.forEach(st => {
      const line = L.polyline(st.pts, {
        pane: 'climatePane',
        color: '#7C3AED',
        weight: 2.5,
        dashArray: '6, 6'
      });
      line.bindTooltip(`Tần suất & Hướng bão: ${st.month} (Bão chậm dần từ Bắc vào Nam)`, { sticky: false });
      layerClimate.addLayer(line);

      // Ký hiệu tâm bão
      const stormMarker = L.marker(st.pts[1], {
        pane: 'pointMarkerPane',
        icon: L.divIcon({
          className: 'storm-marker',
          html: `<div class="bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">🌀 ${st.month.split(' ')[0]} ${st.month.split(' ')[1]}</div>`,
          iconSize: [80, 20],
          iconAnchor: [40, 10]
        })
      });
      layerClimate.addLayer(stormMarker);
    });
  }

  // Lớp 9 Hệ Thống Sông & Cảng Nước Sâu / Sân Bay Quốc Tế
  function renderRiversPortsLayer() {
    layerRiversPorts.clearLayers();

    // 9 Hệ thống sông chính
    const rivers = [
      { name: "Sông Hồng", pts: [[22.5, 103.9], [21.7, 104.9], [21.3, 105.3], [21.0, 105.8], [20.3, 106.3]], desc: "Hệ thống sông lớn nhất miền Bắc, bồi đắp đồng bằng sông Hồng trù phú." },
      { name: "Sông Thái Bình", pts: [[21.6, 106.3], [21.2, 106.3], [20.9, 106.5], [20.7, 106.7]], desc: "Hệ thống sông Thái Bình (sông Cầu, Thương, Lục Nam)." },
      { name: "Sông Kỳ Cùng - Bằng Giang", pts: [[22.7, 106.2], [22.0, 106.7], [21.8, 107.0]], desc: "Dòng sông chảy ngược duy nhất sang Trung Quốc." },
      { name: "Sông Mã", pts: [[21.3, 103.0], [20.8, 104.5], [19.8, 105.9]], desc: "Bồi đắp đồng bằng Thanh Hóa." },
      { name: "Sông Cả (Sông Lam)", pts: [[19.5, 104.2], [19.0, 105.0], [18.7, 105.7]], desc: "Bồi đắp đồng bằng Nghệ An - Hà Tĩnh." },
      { name: "Sông Thu Bồn - Vu Gia", pts: [[15.8, 107.6], [15.8, 108.2], [15.9, 108.4]], desc: "Lưu vực sông trọng điểm Quảng Nam - Đà Nẵng." },
      { name: "Sông Ba (Đà Rằng)", pts: [[14.3, 108.5], [13.4, 108.9], [13.1, 109.3]], desc: "Hệ thống sông lớn nhất duyên hải miền Trung." },
      { name: "Sông Đồng Nai", pts: [[11.8, 108.4], [11.3, 107.5], [10.9, 106.8], [10.5, 106.8]], desc: "Lưu vực sông nội địa lớn nhất Việt Nam, giàu tiềm năng thủy điện." },
      { name: "Sông Mê Kông (Tiền & Hậu)", pts: [[10.8, 105.1], [10.3, 105.8], [9.8, 106.4]], desc: "Bồi đắp đồng bằng châu thổ sông Cửu Long màu mỡ, vựa lúa lớn nhất nước." }
    ];

    rivers.forEach(r => {
      const line = L.polyline(r.pts, {
        pane: 'riverPane',
        color: '#0284C7',
        weight: 3.5,
        opacity: 0.85
      });
      line.bindTooltip(`<strong>${r.name}</strong><br><span class="text-[10px] text-slate-500">${r.desc}</span>`, { sticky: false });
      layerRiversPorts.addLayer(line);
    });

    // Cảng biển nước sâu loại I & Đặc biệt (Mỏ neo)
    const deepPorts = [
      { name: "Cảng Lạch Huyện (Hải Phòng)", pos: [20.85, 106.88], desc: "Cảng cửa ngõ quốc tế loại đặc biệt lớn nhất miền Bắc." },
      { name: "Cảng Cái Mép - Thị Vải (Bà Rịa - Vũng Tàu)", pos: [10.51, 107.02], desc: "Cảng trung chuyển quốc tế nước sâu đón siêu tàu container." },
      { name: "Cảng Tiên Sa (Đà Nẵng)", pos: [16.12, 108.22], desc: "Cảng biển trung chuyển lớn nhất miền Trung." },
      { name: "Cảng Quy Nhơn", pos: [13.77, 109.24], desc: "Cửa ngõ ra biển của vùng Bắc Tây Nguyên." },
      { name: "Cảng Cam Ranh", pos: [11.90, 109.15], desc: "Vịnh nước sâu kín gió bậc nhất Đông Nam Á." },
      { name: "Cảng Cát Lái (TP.HCM)", pos: [10.76, 106.79], desc: "Cảng biển container có sản lượng lớn nhất cả nước." }
    ];

    deepPorts.forEach(port => {
      const marker = L.marker(port.pos, {
        pane: 'pointMarkerPane',
        icon: L.divIcon({
          className: 'port-marker',
          html: `<div class="bg-blue-600 text-white p-1 rounded-full shadow-md border border-white hover:scale-125 transition">⚓</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        })
      });
      marker.bindTooltip(`<strong>${port.name}</strong><br><span class="text-[10px] text-slate-500">${port.desc}</span>`, { sticky: false });
      layerRiversPorts.addLayer(marker);
    });

    // Sân bay quốc tế (Máy bay)
    const airports = [
      { name: "Sân bay Quốc tế Nội Bài (Hà Nội)", pos: [21.22, 105.80] },
      { name: "Sân bay Quốc tế Tân Sơn Nhất (TP.HCM)", pos: [10.82, 106.65] },
      { name: "Sân bay Quốc tế Đà Nẵng", pos: [16.05, 108.20] },
      { name: "Sân bay Quốc tế Cam Ranh (Khánh Hòa)", pos: [11.99, 109.22] },
      { name: "Sân bay Quốc tế Phú Quốc (Kiên Giang)", pos: [10.17, 103.99] },
      { name: "Sân bay Quốc tế Cát Bi (Hải Phòng)", pos: [20.82, 106.72] },
      { name: "Sân bay Quốc tế Vân Đồn (Quảng Ninh)", pos: [21.12, 107.41] }
    ];

    airports.forEach(ap => {
      const marker = L.marker(ap.pos, {
        pane: 'pointMarkerPane',
        icon: L.divIcon({
          className: 'airport-marker',
          html: `<div class="bg-indigo-600 text-white p-1 rounded-full shadow-md border border-white hover:scale-125 transition">✈️</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        })
      });
      marker.bindTooltip(`<strong>${ap.name}</strong>`, { sticky: false });
      layerRiversPorts.addLayer(marker);
    });
  }

  // Công cụ Đo khoảng cách (Haversine + Quy đổi Tỷ lệ Atlat 1:6.000.000)
  function toggleMeasureTool() {
    isMeasureActive = !isMeasureActive;
    const btn = document.getElementById("btn-tool-measure");

    if (isMeasureActive) {
      if (btn) btn.className = "p-2 rounded-lg bg-blue-600 text-white shadow-md text-xs font-bold";
      map.getContainer().style.cursor = "crosshair";
      clearMeasure();
      if (typeof window.showAppToast === 'function') {
        window.showAppToast("📐 Chế độ đo khoảng cách: Bấm 2 điểm trên bản đồ để tính km thực tế và cm trên Atlat.");
      }
    } else {
      if (btn) btn.className = "p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-xs";
      map.getContainer().style.cursor = "";
      clearMeasure();
    }
  }

  function handleMeasureClick(latlng) {
    measurePoints.push(latlng);

    const m = L.circleMarker(latlng, {
      radius: 6,
      fillColor: "#2563EB",
      color: "#FFFFFF",
      weight: 2,
      fillOpacity: 1
    }).addTo(layerMeasure);
    measureMarkers.push(m);

    if (measurePoints.length === 2) {
      const p1 = measurePoints[0];
      const p2 = measurePoints[1];

      // Công thức Haversine
      const R = 6371; // Bán kính Trái Đất (km)
      const dLat = (p2.lat - p1.lat) * Math.PI / 180;
      const dLng = (p2.lng - p1.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distKm = R * c;

      // Quy đổi trên bản đồ Atlat 1:6.000.000 (1 cm = 60 km)
      const distAtlatCm = distKm / 60;

      measureLine = L.polyline([p1, p2], {
        color: "#2563EB",
        weight: 3.5,
        dashArray: "6, 6"
      }).addTo(layerMeasure);

      const midLat = (p1.lat + p2.lat) / 2;
      const midLng = (p1.lng + p2.lng) / 2;

      const badge = L.marker([midLat, midLng], {
        icon: L.divIcon({
          className: "measure-result-badge",
          html: `
            <div class="bg-slate-900/95 text-white p-2 rounded-xl text-center shadow-lg border border-slate-700 text-xs whitespace-nowrap">
              <div class="font-bold text-blue-400 font-mono text-sm">${distKm.toFixed(1)} km</div>
              <div class="text-[10px] text-slate-300">≈ ${distAtlatCm.toFixed(2)} cm (Tỷ lệ 1:6.000.000)</div>
              <button onclick="AtlasEngine.clearMeasure()" class="mt-1 px-2 py-0.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-bold">Xóa đo</button>
            </div>
          `,
          iconSize: [160, 60],
          iconAnchor: [80, 30]
        })
      }).addTo(layerMeasure);
      measureMarkers.push(badge);

      measurePoints = [];
    }
  }

  function clearMeasure() {
    layerMeasure.clearLayers();
    measurePoints = [];
    measureMarkers = [];
    measureLine = null;
  }

  // Chế độ So sánh 2 Thực thể (Compare Mode Modal)
  function openCompareModal() {
    const modal = document.getElementById("compare-modal");
    if (!modal) return;
    modal.classList.remove("hidden");

    // Điền danh sách tỉnh thành vào 2 dropdown
    const selA = document.getElementById("compare-select-a");
    const selB = document.getElementById("compare-select-b");
    if (!selA || !selB || !geoData.provinces) return;

    const optionsHtml = geoData.provinces.features
      .filter(f => !f.properties.is_special_island)
      .map(f => `<option value="${f.properties.name}">${f.properties.name} (${f.properties.region_name})</option>`)
      .join("");

    selA.innerHTML = optionsHtml;
    selB.innerHTML = optionsHtml;

    if (selB.options.length > 1) selB.selectedIndex = 1;
    renderCompareTable();
  }

  function closeCompareModal() {
    const modal = document.getElementById("compare-modal");
    if (modal) modal.classList.add("hidden");
  }

  function renderCompareTable() {
    const selA = document.getElementById("compare-select-a");
    const selB = document.getElementById("compare-select-b");
    const tableContainer = document.getElementById("compare-table-container");
    if (!selA || !selB || !tableContainer || !geoData.provinces) return;

    const nameA = selA.value;
    const nameB = selB.value;

    const featA = geoData.provinces.features.find(f => f.properties.name === nameA);
    const featB = geoData.provinces.features.find(f => f.properties.name === nameB);

    if (!featA || !featB) return;
    const pA = featA.properties;
    const pB = featB.properties;

    tableContainer.innerHTML = `
      <table class="w-full text-xs border-collapse">
        <thead>
          <tr class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            <th class="p-2.5 text-left border-b border-slate-200 dark:border-slate-700">Chỉ tiêu so sánh</th>
            <th class="p-2.5 text-center font-bold text-blue-600 dark:text-blue-400 border-b border-slate-200 dark:border-slate-700">${pA.name}</th>
            <th class="p-2.5 text-center font-bold text-indigo-600 dark:text-indigo-400 border-b border-slate-200 dark:border-slate-700">${pB.name}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr>
            <td class="p-2.5 font-semibold text-slate-600 dark:text-slate-400">Vùng kinh tế</td>
            <td class="p-2.5 text-center">${pA.region_name || 'N/A'}</td>
            <td class="p-2.5 text-center">${pB.region_name || 'N/A'}</td>
          </tr>
          <tr>
            <td class="p-2.5 font-semibold text-slate-600 dark:text-slate-400">Diện tích (km²)</td>
            <td class="p-2.5 text-center font-mono font-bold">${pA.area ? pA.area.toLocaleString() : 'N/A'}</td>
            <td class="p-2.5 text-center font-mono font-bold">${pB.area ? pB.area.toLocaleString() : 'N/A'}</td>
          </tr>
          <tr>
            <td class="p-2.5 font-semibold text-slate-600 dark:text-slate-400">Dân số (nghìn người)</td>
            <td class="p-2.5 text-center font-mono font-bold">${pA.pop ? pA.pop.toLocaleString() : 'N/A'}</td>
            <td class="p-2.5 text-center font-mono font-bold">${pB.pop ? pB.pop.toLocaleString() : 'N/A'}</td>
          </tr>
          <tr>
            <td class="p-2.5 font-semibold text-slate-600 dark:text-slate-400">Mật độ dân số (người/km²)</td>
            <td class="p-2.5 text-center font-mono font-bold text-blue-600">${pA.density ? pA.density.toLocaleString() : 'N/A'}</td>
            <td class="p-2.5 text-center font-mono font-bold text-indigo-600">${pB.density ? pB.density.toLocaleString() : 'N/A'}</td>
          </tr>
          <tr>
            <td class="p-2.5 font-semibold text-slate-600 dark:text-slate-400">Sắp xếp theo NQ 202/2025</td>
            <td class="p-2.5 text-center text-amber-700 dark:text-amber-400 font-medium">${pA.merged_into || pA.merged_from_desc || 'Tỉnh độc lập'}</td>
            <td class="p-2.5 text-center text-amber-700 dark:text-amber-400 font-medium">${pB.merged_into || pB.merged_from_desc || 'Tỉnh độc lập'}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // Mini-Game 15 Giây "Định Vị Nhanh Atlat"
  function startMiniGame() {
    if (!geoData.provinces) return;
    miniGameActive = true;
    miniGameScore = 0;
    miniGameStreak = 0;

    const gameModal = document.getElementById("game-modal");
    if (gameModal) gameModal.classList.remove("hidden");

    pickNextGameTarget();
  }

  function pickNextGameTarget() {
    if (!geoData.provinces) return;
    const validProvinces = geoData.provinces.features.filter(f => !f.properties.is_special_island);
    const randomIndex = Math.floor(Math.random() * validProvinces.length);
    miniGameTarget = validProvinces[randomIndex].properties;
    miniGameTimeLeft = 15;

    updateGameDisplay();

    if (miniGameTimer) clearInterval(miniGameTimer);
    miniGameTimer = setInterval(() => {
      miniGameTimeLeft--;
      const timeEl = document.getElementById("game-time-left");
      if (timeEl) timeEl.innerText = `${miniGameTimeLeft}s`;

      if (miniGameTimeLeft <= 0) {
        clearInterval(miniGameTimer);
        endMiniGameRound(false, "Hết giờ!");
      }
    }, 1000);
  }

  function updateGameDisplay() {
    const targetEl = document.getElementById("game-target-name");
    const scoreEl = document.getElementById("game-score");
    const streakEl = document.getElementById("game-streak");
    const timeEl = document.getElementById("game-time-left");

    if (targetEl) targetEl.innerText = miniGameTarget ? miniGameTarget.name : "...";
    if (scoreEl) scoreEl.innerText = miniGameScore;
    if (streakEl) streakEl.innerText = miniGameStreak;
    if (timeEl) timeEl.innerText = `${miniGameTimeLeft}s`;
  }

  function handleMiniGameClick(clickedProps) {
    if (!miniGameActive || !miniGameTarget) return;

    if (clickedProps.name === miniGameTarget.name) {
      clearInterval(miniGameTimer);
      miniGameScore += 10 + miniGameStreak * 2;
      miniGameStreak += 1;
      if (typeof window.showAppToast === 'function') {
        window.showAppToast(`🎯 Chính xác! +${10 + (miniGameStreak - 1) * 2} điểm!`);
      }
      setTimeout(pickNextGameTarget, 600);
    } else {
      miniGameStreak = 0;
      updateGameDisplay();
      if (typeof window.showAppToast === 'function') {
        window.showAppToast(`❌ Bạn vừa bấm '${clickedProps.name}'. Hãy tìm '${miniGameTarget.name}'!`);
      }
    }
  }

  function endMiniGameRound(isWin, msg) {
    const targetEl = document.getElementById("game-target-name");
    if (targetEl) {
      targetEl.innerHTML = `<span class="text-rose-600 dark:text-rose-400">${msg}</span> Mục tiêu là: <strong>${miniGameTarget?.name}</strong>`;
    }
  }

  function closeMiniGame() {
    miniGameActive = false;
    if (miniGameTimer) clearInterval(miniGameTimer);
    const gameModal = document.getElementById("game-modal");
    if (gameModal) gameModal.classList.add("hidden");
  }

  // Tra cứu thông minh & FlyTo
  async function searchAndFlyTo(keyword) {
    if (!keyword) return;
    const kw = normalizeVN(keyword);

    // 1. Tìm Trung tâm công nghiệp
    if (geoData.industrial) {
      const match = geoData.industrial.features.find(f => normalizeVN(f.properties.name).includes(kw));
      if (match) {
        await toggleLayer("industrial", true);
        const [lng, lat] = match.geometry.coordinates;
        map.flyTo([lat, lng], 10, { duration: 1.2 });
        showDetailsPanel(match.properties, "industrial");
        return;
      }
    }

    // 2. Tìm Nhà máy điện
    if (geoData.power) {
      const match = geoData.power.features.find(f => {
        const p = f.properties || {};
        return normalizeVN(p.name).includes(kw) || normalizeVN(p.province).includes(kw);
      });
      if (match) {
        await toggleLayer("power", true);
        const [lng, lat] = match.geometry.coordinates;
        map.flyTo([lat, lng], 11, { duration: 1.2 });
        showDetailsPanel(match.properties, "power");
        return;
      }
    }

    // 3. Tìm Khoáng sản
    if (geoData.minerals) {
      const match = geoData.minerals.features.find(f => {
        const p = f.properties || {};
        return normalizeVN(p.name).includes(kw) || normalizeVN(p.mineral_type).includes(kw) || normalizeVN(p.province).includes(kw);
      });
      if (match) {
        await toggleLayer("minerals", true);
        const [lng, lat] = match.geometry.coordinates;
        map.flyTo([lat, lng], 11, { duration: 1.2 });
        showDetailsPanel(match.properties, "mineral");
        return;
      }
    }

    // 4. Tìm Tỉnh thành
    if (geoData.provinces) {
      const match = geoData.provinces.features.find(f => {
        const p = f.properties || {};
        return normalizeVN(p.name).includes(kw) || 
          normalizeVN(p.region_name).includes(kw) ||
          (p.merged_from && p.merged_from.some(m => normalizeVN(m).includes(kw))) ||
          (p.merged_into && normalizeVN(p.merged_into).includes(kw));
      });
      if (match) {
        await toggleLayer("provinces", true);
        const layer = L.geoJSON(match);
        map.fitBounds(layer.getBounds(), { padding: [50, 50], duration: 1.2 });
        showDetailsPanel(match.properties, "province");
        return;
      }
    }
  }

  // Thẻ Thông Tin Tri Thức & Mẹo Thi THPT 2025 - 2026
  function showDetailsPanel(props, type) {
    const infoContainer = document.getElementById("atlas-info-card");
    if (!infoContainer) return;

    const is34 = provinceMode === "34" || props.resolution;
    const isCity = props.administrative_type === "Thành phố trực thuộc Trung ương";
    const adminTypeBadge = isCity 
      ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold">Thành phố Trực thuộc TW</span>'
      : '<span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">Tỉnh</span>';

    // Mẹo thi THPT & Câu hỏi Đúng/Sai đặc trưng cho từng tỉnh
    const examTipsMap = {
      "Quảng Ninh": "Trữ lượng than đá lớn nhất cả nước (bể than Đông Bắc), có cảng nước sâu Cái Lân, đảo Cô Tô và di sản Vịnh Hạ Long.",
      "Hà Nội": "Thủ đô, trung tâm kinh tế - văn hóa lớn nhất miền Bắc, trung tâm công nghiệp quy mô rất lớn (Trang 21).",
      "Thành phố Hồ Chí Minh": "Đô thị đặc biệt, đầu tàu kinh tế cả nước, trung tâm công nghiệp quy mô rất lớn, cảng biển có sản lượng container lớn nhất.",
      "Bà Rịa - Vũng Tàu": "Thủ phủ dầu khí ngoài thềm lục địa (mỏ Bạch Hổ, Rồng, Rạng Đông), cụm cảng quốc tế Cái Mép - Thị Vải.",
      "Cà Mau": "Điểm cực Nam của Tổ quốc (Mũi Cà Mau), cụm Khí - Điện - Đạm Cà Mau, diện tích rừng ngập mặn lớn nhất nước.",
      "Đắk Lắk": "Thủ phủ cà phê Việt Nam (Buôn Ma Thuột), đất đỏ bazan màu mỡ diện tích lớn nhất Tây Nguyên.",
      "Lâm Đồng": "Thế mạnh rau quả và hoa ôn đới, du lịch sinh thái Đà Lạt, tiềm năng thủy điện lớn trên sông Đồng Nai."
    };

    const examTip = examTipsMap[props.name] || `Nằm trong ${props.region_name || 'vùng kinh tế trọng điểm'}, có tiềm năng chuyển dịch cơ cấu theo hướng công nghiệp hóa và hiện đại hóa.`;

    const mergedBlock = is34 ? `
      <div class="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 text-xs">
        <div class="font-bold text-amber-800 dark:text-amber-300 flex items-center space-x-1 mb-1">
          <span>📜</span>
          <span>Sắp xếp theo Nghị quyết 202/2025/QH15:</span>
        </div>
        <p class="text-[11px] text-amber-700 dark:text-amber-400 font-medium">${props.merged_from_desc || 'Giữ nguyên ranh giới không sáp nhập'}</p>
        ${props.merged_from && props.merged_from.length > 1 ? `<div class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Gồm các đơn vị cũ: <strong>${props.merged_from.join(", ")}</strong></div>` : ''}
      </div>
    ` : `
      <div class="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-lg border border-blue-200 dark:border-blue-900/60 text-xs">
        <div class="font-bold text-blue-800 dark:text-blue-300 flex items-center space-x-1 mb-1">
          <span>📖</span>
          <span>Kiến thức Atlat Địa lí THPT (Trang 4-5):</span>
        </div>
        <div class="text-[11px] text-blue-700 dark:text-blue-400">Đơn vị hành chính truyền thống ôn thi tốt nghiệp.</div>
        ${props.merged_into ? `<div class="text-[10px] text-slate-600 dark:text-slate-300 mt-1 font-semibold">➡️ Từ 01/7/2025 sáp nhập thành: <span class="text-blue-600 dark:text-blue-400">${props.merged_into}</span></div>` : ''}
      </div>
    `;

    infoContainer.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div class="flex items-center space-x-2">
              <h4 class="font-bold text-sm text-slate-900 dark:text-white">${props.name}</h4>
              ${adminTypeBadge}
            </div>
            <span class="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium inline-block mt-1">${props.region_name || props.region}</span>
          </div>
          <span class="text-[10px] font-bold text-slate-400">${is34 ? 'NQ 202/2025' : 'Atlat Trang 4-5'}</span>
        </div>

        ${mergedBlock}

        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <span class="text-[10px] text-slate-400 block uppercase font-medium">Diện tích</span>
            <span class="font-bold tabular-nums text-slate-800 dark:text-slate-100">${props.area ? props.area.toLocaleString() : 'N/A'} km²</span>
          </div>
          <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <span class="text-[10px] text-slate-400 block uppercase font-medium">Dân số</span>
            <span class="font-bold tabular-nums text-slate-800 dark:text-slate-100">${props.pop ? props.pop.toLocaleString() : 'N/A'} k</span>
          </div>
          <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <span class="text-[10px] text-slate-400 block uppercase font-medium">Mật độ</span>
            <span class="font-bold text-blue-600 dark:text-blue-400 tabular-nums">${props.density ? props.density.toLocaleString() : 'N/A'} ng/km²</span>
          </div>
        </div>

        <!-- Thẻ Mẹo Thi & Câu Hỏi Đúng/Sai THPT 2026 -->
        <div class="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
          <div class="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 flex items-center space-x-1">
            <span>💡</span>
            <span>Trọng Tâm Ôn Thi THPT (Chuẩn 2026):</span>
          </div>
          <p class="text-[11px] text-slate-700 dark:text-slate-200 leading-relaxed">${examTip}</p>
        </div>
      </div>
    `;
  }

  // Chú giải Động (Dynamic Legend)
  function updateDynamicLegend() {
    let legendEl = document.getElementById("atlas-dynamic-legend");
    if (!legendEl) {
      const mapContainer = document.getElementById("atlas-map-container");
      if (!mapContainer) return;
      legendEl = document.createElement("div");
      legendEl.id = "atlas-dynamic-legend";
      legendEl.className = "absolute bottom-3 left-3 z-[900] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-3 rounded-xl text-xs shadow-md border border-slate-200 dark:border-slate-700 max-w-[270px] max-h-[220px] overflow-y-auto space-y-2 pointer-events-auto transition-all";
      mapContainer.appendChild(legendEl);
    }

    const sections = [];

    if (activeLayers.minerals) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Khoáng sản (Trang 8)
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
            <div class="flex items-center space-x-1.5">${getMineralSvg("coal")} <span>Than đá</span></div>
            <div class="flex items-center space-x-1.5">${getMineralSvg("oil")} <span>Dầu mỏ</span></div>
            <div class="flex items-center space-x-1.5">${getMineralSvg("gas")} <span>Khí đốt</span></div>
            <div class="flex items-center space-x-1.5">${getMineralSvg("iron")} <span>Quặng sắt</span></div>
            <div class="flex items-center space-x-1.5">${getMineralSvg("bauxite")} <span>Bô-xít (Al)</span></div>
            <div class="flex items-center space-x-1.5">${getMineralSvg("apatite")} <span>Apatit</span></div>
            <div class="flex items-center space-x-1.5">${getMineralSvg("tin")} <span>Thiếc (Sn)</span></div>
            <div class="flex items-center space-x-1.5">${getMineralSvg("chromium")} <span>Crôm</span></div>
          </div>
        </div>
      `);
    }

    if (activeLayers.power) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Năng lượng (Trang 22)
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
            <div class="flex items-center space-x-1.5">${getPowerSvg("Thủy điện", 500)} <span>Thủy điện</span></div>
            <div class="flex items-center space-x-1.5">${getPowerSvg("Nhiệt điện", 500)} <span>Nhiệt điện</span></div>
          </div>
        </div>
      `);
    }

    if (activeLayers.industrial) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Trung tâm CN (Trang 21)
          </div>
          <div class="text-[11px] text-slate-700 dark:text-slate-300">
            Vòng tròn chia múi quạt theo cơ cấu ngành công nghiệp
          </div>
        </div>
      `);
    }

    if (activeLayers.climate) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Khí Hậu & Gió Mùa
          </div>
          <div class="text-[10px] space-y-0.5">
            <div class="flex items-center space-x-1.5"><span class="w-3 h-1 bg-blue-600 inline-block"></span> <span>Gió mùa Đông Bắc (lạnh)</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-3 h-1 bg-red-600 inline-block"></span> <span>Gió mùa Tây Nam (ẩm)</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-3 h-1 bg-amber-600 inline-block"></span> <span>Gió Phơn Tây Nam (khô nóng)</span></div>
          </div>
        </div>
      `);
    }

    if (activeLayers.rivers) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Sông Ngòi & Cảng Biển
          </div>
          <div class="text-[10px] space-y-0.5">
            <div class="flex items-center space-x-1.5"><span class="text-blue-600 font-bold">⚓</span> <span>Cảng nước sâu loại I</span></div>
            <div class="flex items-center space-x-1.5"><span class="text-indigo-600 font-bold">✈️</span> <span>Sân bay quốc tế</span></div>
          </div>
        </div>
      `);
    }

    if (sections.length === 0) {
      legendEl.innerHTML = `
        <div class="text-[11px] text-slate-400 italic text-center py-1">
          Đã tắt các lớp chuyên đề
        </div>
      `;
      return;
    }

    legendEl.innerHTML = `
      <div class="space-y-2">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1">
          <span class="font-bold text-[11px] uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-1">
            <span>📖</span> <span>Chú Giải Atlat</span>
          </span>
          <span class="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded-full">THPT</span>
        </div>
        ${sections.join("")}
      </div>
    `;
  }

  async function toggleLayer(name, visible) {
    if (!map) return;
    activeLayers[name] = !!visible;

    const chk = document.getElementById(`layer-chk-${name}`);
    if (chk && chk.checked !== !!visible) {
      chk.checked = !!visible;
    }

    if (visible) {
      if (name === "climate") {
        renderClimateLayer();
        if (!map.hasLayer(layerClimate)) map.addLayer(layerClimate);
      } else if (name === "rivers") {
        renderRiversPortsLayer();
        if (!map.hasLayer(layerRiversPorts)) map.addLayer(layerRiversPorts);
      } else {
        if (!geoData[name]) {
          await ensureLayerData(name);
          if (name === "minerals") await renderMinerals();
          else if (name === "power") await renderPower();
          else if (name === "industrial") await renderIndustrialCenters();
          else if (name === "provinces") renderProvinces(currentRegionFilter);
        }

        if (name === "provinces" && layerProvinces && !map.hasLayer(layerProvinces)) map.addLayer(layerProvinces);
        if (name === "minerals" && layerMinerals && !map.hasLayer(layerMinerals)) map.addLayer(layerMinerals);
        if (name === "power" && layerPower && !map.hasLayer(layerPower)) map.addLayer(layerPower);
        if (name === "industrial" && layerIndustrial && !map.hasLayer(layerIndustrial)) map.addLayer(layerIndustrial);
      }
    } else {
      if (name === "climate" && layerClimate && map.hasLayer(layerClimate)) map.removeLayer(layerClimate);
      if (name === "rivers" && layerRiversPorts && map.hasLayer(layerRiversPorts)) map.removeLayer(layerRiversPorts);
      if (name === "provinces" && layerProvinces && map.hasLayer(layerProvinces)) map.removeLayer(layerProvinces);
      if (name === "minerals" && layerMinerals && map.hasLayer(layerMinerals)) map.removeLayer(layerMinerals);
      if (name === "power" && layerPower && map.hasLayer(layerPower)) map.removeLayer(layerPower);
      if (name === "industrial" && layerIndustrial && map.hasLayer(layerIndustrial)) map.removeLayer(layerIndustrial);
    }

    updateDynamicLegend();
  }

  return {
    init,
    normalizeVN,
    setBaseMap,
    setProvinceMode,
    getProvinceMode: () => provinceMode,
    renderProvinces,
    setProvincesOpacity,
    renderMinerals,
    renderPower,
    renderIndustrialCenters,
    updateDynamicLegend,
    toggleLayer,
    searchAndFlyTo,
    toggleMeasureTool,
    clearMeasure,
    openCompareModal,
    closeCompareModal,
    renderCompareTable,
    startMiniGame,
    closeMiniGame,
    resetView: () => map && map.flyTo([16.2, 107.5], 5.5, { duration: 1.2 }),
    getMap: () => map
  };
})();

window.AtlasEngine = AtlasEngine;
