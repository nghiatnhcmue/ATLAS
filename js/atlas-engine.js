/**
 * GeoAtlas Interactive - Leaflet Atlas Engine v2.0 (Phân hệ 1)
 * Hoàn thiện 100% 6 Lớp Chuyên Đề Chuẩn Atlat Địa Lý Việt Nam:
 * - Lớp 1: Hành chính & Vùng Kinh tế (Trang 4-5)
 * - Lớp 2: Địa hình & Sông ngòi (Trang 6-7, 10)
 * - Lớp 3: Khí hậu & Thủy văn (Trang 9)
 * - Lớp 4: Nông, Lâm, Thủy sản & Ngư trường (Trang 18-20)
 * - Lớp 5: Khoáng sản & Năng lượng (Trang 8, 22)
 * - Lớp 6: Trung tâm Công nghiệp & Kinh tế (Trang 21)
 * 
 * Khắc phục 4 lỗi giao diện:
 * 1. Xóa bỏ hoàn toàn API key watermark, mặc định Vector Atlat + Esri/OSM miễn phí
 * 2. Không dùng permanent: true cho tooltip tỉnh, chỉ hover/click, 1 nhãn Hoàng Sa & Trường Sa duy nhất
 * 3. Spotlight Focus không làm mất ranh giới VN khi lọc vùng
 * 4. Đồng bộ Theme Sáng/Tối
 * 
 * Thanh công cụ GIS & Tìm kiếm thông minh toàn diện
 */

const AtlasEngine = (function () {
  let map = null;

  // 6 Lớp chuyên đề
  let layerProvinces = null;       // Lớp 1
  let layerProvinceLabels = null;
  let layerTopography = null;      // Lớp 2
  let layerClimate = null;         // Lớp 3
  let layerAgriculture = null;     // Lớp 4
  let layerMineralsPower = null;   // Lớp 5
  let layerIndustrial = null;      // Lớp 6

  // Hỗ trợ GIS & Chủ quyền
  let layerGraticule = null;
  let layerMeasure = null;
  let layerBaseline = null;

  let currentBaseMapMode = "vector"; // "vector" | "physical" | "osm" | "satellite"
  let currentBaseMapTile = null;
  let provinceMode = "63"; // "63" (Atlat SGK) | "34" (NQ 202/2025/QH15)
  let currentRegionFilter = "all";
  let currentOpacity = 0.35;

  // Trạng thái công cụ đo khoảng cách
  let isMeasureActive = false;
  let measurePoints = [];
  let measureLine = null;
  let measureMarkers = [];

  // Trạng thái Mini-game 15 giây
  let miniGameActive = false;
  let miniGameTarget = null;
  let miniGameTimer = null;
  let miniGameTimeLeft = 15;
  let miniGameScore = 0;
  let miniGameStreak = 0;

  const BASEMAPS = {
    vector: {
      name: "Atlat Vector Thuần",
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
    topography: null,
    climate: null,
    agriculture: null,
    minerals: null,
    power: null,
    industrial: null,
    baseline: null
  };

  const LAYER_FILES = {
    provinces: "./public/data/vn_provinces.geojson",
    provinces63: "./public/data/vn_provinces_63.geojson",
    provinces34: "./public/data/vn_provinces_34.geojson",
    topography: "./public/data/topography_rivers.geojson",
    climate: "./public/data/climate_hydro.geojson",
    agriculture: "./public/data/agriculture_fishery.geojson",
    minerals: "./public/data/minerals.geojson",
    power: "./public/data/hydropower.geojson",
    industrial: "./public/data/industrial_centers.geojson",
    baseline: "./public/data/atlat_2026_master.json"
  };

  const loadingPromises = {};

  // Trạng thái bật/tắt 6 lớp
  let activeLayers = {
    provinces: true,        // Lớp 1 (mặc định bật)
    topography: false,      // Lớp 2
    climate: false,         // Lớp 3
    agriculture: false,     // Lớp 4
    minerals_power: false,  // Lớp 5
    industrial: false       // Lớp 6
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
      case "titan":
      case "ti_symbol":
        return `<svg width="20" height="20" viewBox="0 0 20 20" class="atlat-vector-icon"><circle cx="10" cy="10" r="8" fill="#475569" stroke="#FFFFFF" stroke-width="1.5"/><text x="10" y="14" font-size="9" font-weight="bold" text-anchor="middle" fill="#FFFFFF">Ti</text></svg>`;
      default:
        return `<svg width="18" height="18" viewBox="0 0 20 20" class="atlat-vector-icon"><circle cx="10" cy="10" r="7" fill="#64748B" stroke="#FFFFFF" stroke-width="1.5"/></svg>`;
    }
  }

  // Ký hiệu Năng lượng chuẩn Atlat Trang 22
  function getPowerSvg(plantType, mw) {
    if (plantType.includes("gió")) {
      return `<div class="bg-teal-600 text-white text-xs p-1 rounded-full shadow-md border border-white hover:scale-125 transition">🌀</div>`;
    }
    if (plantType.includes("mặt trời")) {
      return `<div class="bg-amber-500 text-white text-xs p-1 rounded-full shadow-md border border-white hover:scale-125 transition">☀️</div>`;
    }
    const isHydro = plantType.includes("Thủy");
    const color = isHydro ? "#0284C7" : "#DC2626";
    const size = (mw || 500) >= 1000 ? 26 : 20;
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

    // Panes phân tầng z-index khoa học
    map.createPane('graticulePane');
    map.getPane('graticulePane').style.zIndex = 200;

    map.createPane('polygonBoundaryPane');
    map.getPane('polygonBoundaryPane').style.zIndex = 300;

    map.createPane('topographyPane');
    map.getPane('topographyPane').style.zIndex = 340;

    map.createPane('climatePane');
    map.getPane('climatePane').style.zIndex = 360;

    map.createPane('agriculturePane');
    map.getPane('agriculturePane').style.zIndex = 380;

    map.createPane('baselinePane');
    map.getPane('baselinePane').style.zIndex = 390;

    map.createPane('pointMarkerPane');
    map.getPane('pointMarkerPane').style.zIndex = 400;

    map.createPane('labelPane');
    map.getPane('labelPane').style.zIndex = 450;
    map.getPane('labelPane').style.pointerEvents = 'none';

    // Khởi tạo các Layer Group
    layerProvinces = L.layerGroup().addTo(map);
    layerProvinceLabels = L.layerGroup().addTo(map);
    layerBaseline = L.layerGroup().addTo(map);
    layerTopography = L.layerGroup();
    layerClimate = L.layerGroup();
    layerAgriculture = L.layerGroup();
    layerMineralsPower = L.layerGroup();
    layerIndustrial = L.layerGroup();
    layerMeasure = L.layerGroup().addTo(map);

    // Lập lưới kinh vĩ tuyến (Graticule)
    setupGraticule();

    // Mặc định dùng nền Atlat Vector Thuần
    setBaseMap("vector");

    // Khẳng định chủ quyền biển đảo (duy nhất 1 nhãn sạch cho mỗi quần đảo)
    addSovereigntyDemarcation();
    renderBaselineLayer();

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

  // Lập Đường cơ sở biển A1 - A11 (Tuyên bố 12/11/1982, Atlat Trang 7 & 9)
  function renderBaselineLayer() {
    if (!layerBaseline) return;
    layerBaseline.clearLayers();

    const baselineData = window.ATLAT_DATA?.geo_baseline || geoData.baseline;
    if (!baselineData || !baselineData.features) return;

    L.geoJSON(baselineData, {
      pane: 'baselinePane',
      style: (feature) => {
        if (feature.geometry.type === 'LineString') {
          return {
            color: '#DC2626',
            weight: 2.2,
            dashArray: '6, 6',
            opacity: 0.95
          };
        }
      },
      pointToLayer: (feature, latlng) => {
        const p = feature.properties;
        const icon = L.divIcon({
          className: 'atlat-baseline-point-marker',
          html: `<div class="baseline-pill font-mono"><span>🔴</span><span>${p.code}</span></div>`,
          iconSize: [46, 20],
          iconAnchor: [23, 10],
          popupAnchor: [0, -10]
        });
        return L.marker(latlng, { icon });
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        if (feature.geometry.type === 'LineString') {
          layer.bindTooltip(`
            <div class="p-1 font-sans">
              <div class="font-bold text-xs text-red-600">🇻🇳 Đường cơ sở bờ biển Việt Nam</div>
              <div class="text-[10px] text-slate-500">Tuyên bố ngày 12/11/1982 của Chính phủ • Nối từ A1 đến A11</div>
            </div>
          `, { permanent: false, sticky: true });
        } else {
          const [lng, lat] = feature.geometry.coordinates;
          layer.bindPopup(`
            <div class="p-3 bg-white dark:bg-slate-900 rounded-xl min-w-[240px] font-sans">
              <div class="flex items-center space-x-1.5 text-red-600 font-bold text-xs mb-1">
                <span>🚩</span>
                <h4>${p.name}</h4>
              </div>
              <div class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
                <div>Tỉnh / Thành: <strong>${p.province}</strong></div>
                <div>Tọa độ: <strong>${lat}°B, ${lng}°Đ</strong></div>
                <div>Mô tả: ${p.desc}</div>
              </div>
              <div class="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400">Tham chiếu: Atlat Địa lí Việt Nam Trang 7 & 9</div>
            </div>
          `);
        }
      }
    }).addTo(layerBaseline);
  }

  async function ensureLayerData(name) {
    const effectiveName = (name === "provinces") ? (provinceMode === "34" ? "provinces34" : "provinces63") : name;

    if (geoData[effectiveName]) {
      if (name === "provinces") geoData.provinces = geoData[effectiveName];
      return geoData[effectiveName];
    }

    // 1. Nạp tức thì từ window.ATLAT_DATA (Zero network latency, 100% offline)
    if (window.ATLAT_DATA) {
      const atlatKeyMap = {
        provinces34: "geo_provinces_34",
        provinces63: "geo_provinces_63",
        provinces: provinceMode === "34" ? "geo_provinces_34" : "geo_provinces_63",
        topography: "geo_topography",
        climate: "geo_climate",
        agriculture: "geo_agriculture",
        minerals: "geo_minerals",
        power: "geo_power",
        industrial: "geo_industrial",
        baseline: "geo_baseline"
      };
      const key = atlatKeyMap[effectiveName] || atlatKeyMap[name];
      if (key && window.ATLAT_DATA[key]) {
        geoData[effectiveName] = window.ATLAT_DATA[key];
        if (name === "provinces") geoData.provinces = window.ATLAT_DATA[key];
        return geoData[effectiveName];
      }
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

  // ===========================================================================
  // LỚP 1: HÀNH CHÍNH & VÙNG KINH TẾ (Trang 4-5) - Spotlight Focus
  // ===========================================================================
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
            fillOpacity: filterRegion === "all" ? currentOpacity : 0.85
          };
        } else {
          // Spotlight Focus: Làm mờ nhẹ vùng không chọn
          return {
            fillColor: color,
            weight: 0.6,
            opacity: 0.45,
            color: "rgba(255, 255, 255, 0.4)",
            fillOpacity: 0.15
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

        // Hover-only Tooltip sạch sẽ, KHÔNG DÙNG permanent: true
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
          permanent: false,
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

  // ===========================================================================
  // LỚP 2: ĐỊA HÌNH & SÔNG NGÒI (Trang 6-7, 10)
  // ===========================================================================
  async function renderTopographyLayer() {
    if (!geoData.topography) await ensureLayerData("topography");
    if (!geoData.topography) return;

    layerTopography.clearLayers();

    L.geoJSON(geoData.topography, {
      pane: 'topographyPane',
      pointToLayer: (feature, latlng) => {
        const p = feature.properties;
        if (p.category === "peak") {
          // Icon tam giác đỉnh núi
          const icon = L.divIcon({
            className: "peak-marker",
            html: `
              <div class="flex items-center space-x-1 cursor-pointer hover:scale-125 transition drop-shadow-md">
                <svg width="22" height="22" viewBox="0 0 24 24"><polygon points="12,2 22,22 2,22" fill="#B45309" stroke="#FFFFFF" stroke-width="1.5"/><polygon points="12,2 15,9 9,9" fill="#FFFFFF"/></svg>
                <span class="bg-amber-900/90 text-amber-100 text-[9px] font-bold px-1 py-0.2 rounded-xs whitespace-nowrap shadow-xs">${p.elevation_m}m</span>
              </div>
            `,
            iconSize: [60, 22],
            iconAnchor: [11, 22]
          });
          return L.marker(latlng, { icon });
        } else if (p.category === "plateau") {
          // Icon cao nguyên badan
          const icon = L.divIcon({
            className: "plateau-marker",
            html: `<div class="bg-amber-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-white shadow-xs cursor-pointer hover:scale-110 transition whitespace-nowrap">🟫 ${p.name.replace('Cao nguyên ', '')}</div>`,
            iconSize: [80, 20],
            iconAnchor: [40, 10]
          });
          return L.marker(latlng, { icon });
        }
        return L.marker(latlng);
      },
      style: (feature) => {
        const p = feature.properties;
        if (p.category === "river") {
          return { color: "#0284C7", weight: 3.5, opacity: 0.85 };
        } else if (p.category === "mountain_range" || p.category === "mountain_arc") {
          return { color: "#78350F", weight: 3.5, opacity: 0.8, dashArray: "6, 4" };
        }
        return { color: "#B45309", weight: 2 };
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindTooltip(`
          <div class="p-1 text-left">
            <div class="font-bold text-xs text-slate-900 dark:text-white">${p.name}</div>
            <div class="text-[10px] text-slate-500">${p.desc || ''}</div>
          </div>
        `, { permanent: false, sticky: false });

        layer.on("click", () => showDetailsPanel(p, "topography"));
      }
    }).addTo(layerTopography);
  }

  // ===========================================================================
  // LỚP 3: KHÍ HẬU & THỦY VĂN (Trang 9) - Mũi tên Gió mùa SVG & Trạm Khí tượng
  // ===========================================================================
  async function renderClimateLayer() {
    if (!geoData.climate) await ensureLayerData("climate");
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
      line.bindTooltip("Gió mùa Đông Bắc (Tháng XI - IV): Lạnh khô đầu mùa, lạnh ẩm cuối mùa. Ngăn lại ở dãy Bạch Mã (16°B).", { permanent: false, sticky: false });
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
      line.bindTooltip("Gió mùa Tây Nam (Tháng V - X): Nóng ẩm, gây mưa lớn cho Nam Bộ và Tây Nguyên.", { permanent: false, sticky: false });
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
      line.bindTooltip("Gió Tây khô nóng (Gió Phơn Lào): Khô nóng gay gắt ven biển miền Trung do hiệu ứng phơn vượt Trường Sơn Bắc.", { permanent: false, sticky: false });
      layerClimate.addLayer(line);
    });

    // 4. Hướng bão đổ bộ
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
      line.bindTooltip(`Tần suất & Hướng bão: ${st.month} (Bão chậm dần từ Bắc vào Nam)`, { permanent: false, sticky: false });
      layerClimate.addLayer(line);

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

    // 5. Ranh giới Bạch Mã & Các Trạm Khí Tượng Tiêu Biểu
    if (geoData.climate) {
      L.geoJSON(geoData.climate, {
        pane: 'climatePane',
        pointToLayer: (feature, latlng) => {
          const p = feature.properties;
          const icon = L.divIcon({
            className: "met-station-marker",
            html: `<div class="bg-blue-600 text-white text-xs p-1 rounded-full shadow-md border border-white hover:scale-125 transition">🌡️</div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
          });
          return L.marker(latlng, { icon });
        },
        style: (feature) => {
          if (feature.properties.category === "climate_boundary") {
            return { color: "#7C3AED", weight: 4, dashArray: "4, 6" };
          }
          return { color: "#2563EB", weight: 2 };
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties;
          if (p.category === "met_station") {
            layer.bindPopup(`
              <div class="p-3 bg-white dark:bg-slate-900 rounded-xl min-w-[220px] space-y-1.5">
                <div class="font-bold text-xs text-blue-600 dark:text-blue-400">🌡️ ${p.name}</div>
                <div class="text-[11px] grid grid-cols-2 gap-1 text-slate-700 dark:text-slate-200">
                  <div>Nhiệt độ TB: <strong>${p.avg_temp}</strong></div>
                  <div>Biên độ nhiệt: <strong>${p.temp_range}</strong></div>
                  <div class="col-span-2">Tổng lượng mưa: <strong>${p.rainfall}</strong></div>
                </div>
                <p class="text-[10px] text-slate-500 italic">${p.climate_type}</p>
              </div>
            `);
          } else {
            layer.bindTooltip(`<strong>${p.name}</strong><br>${p.desc}`, { permanent: false, sticky: false });
          }
          layer.on("click", () => showDetailsPanel(p, "climate"));
        }
      }).addTo(layerClimate);
    }
  }

  // ===========================================================================
  // LỚP 4: NÔNG, LÂM, THỦY SẢN & NGƯ TRƯỜNG (Trang 18-20)
  // ===========================================================================
  async function renderAgricultureLayer() {
    if (!geoData.agriculture) await ensureLayerData("agriculture");
    if (!geoData.agriculture) return;

    layerAgriculture.clearLayers();

    L.geoJSON(geoData.agriculture, {
      pane: 'agriculturePane',
      pointToLayer: (feature, latlng) => {
        const p = feature.properties;
        if (p.category === "fishing_ground") {
          const icon = L.divIcon({
            className: "fishing-ground-marker",
            html: `<div class="bg-cyan-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-md hover:scale-110 transition whitespace-nowrap">🐟 ${p.name.replace('Ngư trường ', '')}</div>`,
            iconSize: [120, 22],
            iconAnchor: [60, 11]
          });
          return L.marker(latlng, { icon });
        } else {
          const icon = L.divIcon({
            className: "agri-crop-marker",
            html: `
              <div class="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-xl border border-white shadow-md hover:scale-110 transition flex items-center space-x-1 whitespace-nowrap">
                <span>${p.icon_emoji || '🌾'}</span>
                <span>${p.crop_type}</span>
              </div>
            `,
            iconSize: [100, 22],
            iconAnchor: [50, 11]
          });
          return L.marker(latlng, { icon });
        }
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindTooltip(`
          <div class="p-1 text-left">
            <div class="font-bold text-xs text-slate-900 dark:text-white">${p.name}</div>
            <div class="text-[10px] text-slate-500">${p.desc || ''}</div>
          </div>
        `, { permanent: false, sticky: false });

        layer.on("click", () => showDetailsPanel(p, "agriculture"));
      }
    }).addTo(layerAgriculture);
  }

  // ===========================================================================
  // LỚP 5: KHOÁNG SẢN & NĂNG LƯỢNG (Trang 8 & 22)
  // ===========================================================================
  async function renderMineralsPowerLayer(filterType = "all") {
    if (!geoData.minerals) await ensureLayerData("minerals");
    if (!geoData.power) await ensureLayerData("power");

    layerMineralsPower.clearLayers();

    // 1. Khoáng sản (Trang 8)
    if (geoData.minerals && (filterType === "all" || filterType === "minerals")) {
      L.geoJSON(geoData.minerals, {
        pane: 'pointMarkerPane',
        pointToLayer: (feature, latlng) => {
          const p = feature.properties;
          const iconSvg = getMineralSvg(p.symbol_type || p.symbol || p.mineral_code);
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
          `, { permanent: false, sticky: false });

          layer.on("click", () => showDetailsPanel(p, "mineral"));
        }
      }).addTo(layerMineralsPower);
    }

    // 2. Năng lượng: Thủy điện, Nhiệt điện, Điện gió, Điện mặt trời (Trang 22)
    if (geoData.power && (filterType === "all" || filterType === "power")) {
      L.geoJSON(geoData.power, {
        pane: 'pointMarkerPane',
        pointToLayer: (feature, latlng) => {
          const p = feature.properties;
          const iconSvg = getPowerSvg(p.plant_type || p.type || "Thủy điện", p.capacity_mw || 500);
          const isRenewable = (p.plant_type || "").includes("gió") || (p.plant_type || "").includes("mặt trời");
          const size = isRenewable ? 22 : ((p.capacity_mw || 500) >= 1000 ? 26 : 20);
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
              <div class="text-[10px] text-blue-600 dark:text-blue-400 font-bold">${p.plant_type || ''} • ${p.capacity_mw ? p.capacity_mw.toLocaleString() + ' MW' : ''}</div>
            </div>
          `, { permanent: false, sticky: false });

          layer.on("click", () => showDetailsPanel(p, "power"));
        }
      }).addTo(layerMineralsPower);
    }
  }

  // ===========================================================================
  // LỚP 6: TRUNG TÂM CÔNG NGHIỆP & KINH TẾ (Trang 21)
  // ===========================================================================
  async function renderIndustrialCenters(scaleFilter = "all") {
    if (!geoData.industrial) await ensureLayerData("industrial");
    if (!geoData.industrial) return;

    layerIndustrial.clearLayers();

    const currentZoom = map.getZoom();
    const zoomScale = currentZoom < 6 ? 0.65 : 1.0;

    L.geoJSON(geoData.industrial, {
      pane: 'pointMarkerPane',
      filter: (f) => scaleFilter === "all" || f.properties.scale === scaleFilter || f.properties.scale_tier === scaleFilter,
      pointToLayer: (feature, latlng) => {
        const p = feature.properties;
        const baseRadius = p.radius_px || (p.scale_tier === "very_large" ? 28 : p.scale_tier === "large" ? 22 : 16);
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
            <div class="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">${p.scale_desc || p.scale_label || ''}</div>
          </div>
        `, { permanent: false, sticky: false });

        layer.on("click", () => showDetailsPanel(p, "industrial"));
      }
    }).addTo(layerIndustrial);
  }

  // Công cụ Đo khoảng cách (Haversine & Tỷ lệ 1:6.000.000)
  function toggleMeasureTool() {
    isMeasureActive = !isMeasureActive;
    const btn = document.getElementById("btn-tool-measure");

    if (isMeasureActive) {
      if (btn) btn.className = "px-2 py-1 rounded-md bg-blue-600 text-white shadow-md text-[11px] font-bold flex items-center space-x-1";
      map.getContainer().style.cursor = "crosshair";
      clearMeasure();
      if (typeof window.showAppToast === 'function') {
        window.showAppToast("📐 Bấm 2 điểm trên bản đồ để tính km thực địa và cm trên Atlat.");
      }
    } else {
      if (btn) btn.className = "px-2 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium flex items-center space-x-1 text-[11px]";
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
      const R = 6371; // km
      const dLat = (p2.lat - p1.lat) * Math.PI / 180;
      const dLng = (p2.lng - p1.lng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distKm = R * c;

      // Quy đổi thước kẻ Atlat 1:6.000.000 (1 cm = 60 km)
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

  // Chế độ So sánh 2 Thực thể (Compare Mode)
  function openCompareModal() {
    const modal = document.getElementById("compare-modal");
    if (!modal) return;
    modal.classList.remove("hidden");

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

  // ===========================================================================
  // THANH TÌM KIẾM THÔNG MINH TOÀN DIỆN (Nhiệm vụ 2.7)
  // ===========================================================================
  async function searchAndFlyTo(keyword) {
    if (!keyword) return;
    const kw = normalizeVN(keyword);

    // 1. Tìm trong Lớp 2: Địa hình & Sông ngòi (Đỉnh núi, dãy núi, cao nguyên, sông)
    if (!geoData.topography) await ensureLayerData("topography");
    if (geoData.topography) {
      const match = geoData.topography.features.find(f => {
        const p = f.properties || {};
        return normalizeVN(p.name).includes(kw) || normalizeVN(p.mountain_range).includes(kw) || normalizeVN(p.province).includes(kw);
      });
      if (match) {
        await toggleLayer("topography", true);
        if (match.geometry.type === "Point") {
          const [lng, lat] = match.geometry.coordinates;
          map.flyTo([lat, lng], 11, { duration: 1.2 });
        } else {
          const layer = L.geoJSON(match);
          map.fitBounds(layer.getBounds(), { padding: [50, 50], duration: 1.2 });
        }
        showDetailsPanel(match.properties, "topography");
        return;
      }
    }

    // 2. Tìm trong Lớp 4: Nông, Lâm, Thủy sản & Ngư trường
    if (!geoData.agriculture) await ensureLayerData("agriculture");
    if (geoData.agriculture) {
      const match = geoData.agriculture.features.find(f => {
        const p = f.properties || {};
        return normalizeVN(p.name).includes(kw) || normalizeVN(p.crop_type).includes(kw);
      });
      if (match) {
        await toggleLayer("agriculture", true);
        const [lng, lat] = match.geometry.coordinates;
        map.flyTo([lat, lng], 10, { duration: 1.2 });
        showDetailsPanel(match.properties, "agriculture");
        return;
      }
    }

    // 3. Tìm trong Lớp 6: Trung tâm công nghiệp
    if (!geoData.industrial) await ensureLayerData("industrial");
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

    // 4. Tìm trong Lớp 5: Khoáng sản & Năng lượng
    if (!geoData.minerals) await ensureLayerData("minerals");
    if (geoData.minerals) {
      const match = geoData.minerals.features.find(f => {
        const p = f.properties || {};
        return normalizeVN(p.name).includes(kw) || normalizeVN(p.mineral_type).includes(kw) || normalizeVN(p.province).includes(kw);
      });
      if (match) {
        await toggleLayer("minerals_power", true);
        const [lng, lat] = match.geometry.coordinates;
        map.flyTo([lat, lng], 11, { duration: 1.2 });
        showDetailsPanel(match.properties, "mineral");
        return;
      }
    }

    if (!geoData.power) await ensureLayerData("power");
    if (geoData.power) {
      const match = geoData.power.features.find(f => {
        const p = f.properties || {};
        return normalizeVN(p.name).includes(kw) || normalizeVN(p.province).includes(kw) || normalizeVN(p.plant_type).includes(kw);
      });
      if (match) {
        await toggleLayer("minerals_power", true);
        const [lng, lat] = match.geometry.coordinates;
        map.flyTo([lat, lng], 11, { duration: 1.2 });
        showDetailsPanel(match.properties, "power");
        return;
      }
    }

    // 5. Tìm trong Lớp 3: Trạm khí tượng
    if (!geoData.climate) await ensureLayerData("climate");
    if (geoData.climate) {
      const match = geoData.climate.features.find(f => normalizeVN(f.properties.name).includes(kw));
      if (match) {
        await toggleLayer("climate", true);
        if (match.geometry.type === "Point") {
          const [lng, lat] = match.geometry.coordinates;
          map.flyTo([lat, lng], 11, { duration: 1.2 });
        }
        showDetailsPanel(match.properties, "climate");
        return;
      }
    }

    // 6. Tìm trong Lớp 1: Tỉnh thành
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

    if (typeof window.showAppToast === 'function') {
      window.showAppToast(`🔍 Không tìm thấy kết quả phù hợp cho "${keyword}". Hãy thử tìm: Fansipan, Than Cẩm Phả, Lúa gạo...`);
    }
  }

  // Thẻ Thông Tin Tri Thức & Mẹo Thi THPT 2026
  function showDetailsPanel(props, type) {
    const infoContainer = document.getElementById("atlas-info-card");
    if (!infoContainer) return;

    if (type === "topography") {
      infoContainer.innerHTML = `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h4 class="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
              <span>⛰️</span> <span>${props.name}</span>
            </h4>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Trang 6-7, 10</span>
          </div>
          <div class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">${props.desc || ''}</div>
          ${props.elevation_m ? `<div class="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs">Độ cao tuyệt đối: <strong>${props.elevation_m.toLocaleString()} m</strong> • Dãy: <strong>${props.mountain_range || ''}</strong></div>` : ''}
        </div>
      `;
      return;
    }

    if (type === "agriculture") {
      infoContainer.innerHTML = `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h4 class="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
              <span>${props.icon_emoji || '🌾'}</span> <span>${props.name}</span>
            </h4>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Trang 18-20</span>
          </div>
          <p class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">${props.desc || ''}</p>
        </div>
      `;
      return;
    }

    if (type === "climate") {
      infoContainer.innerHTML = `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h4 class="font-bold text-xs text-blue-700 dark:text-blue-300 flex items-center space-x-1.5">
              <span>🌡️</span> <span>${props.name}</span>
            </h4>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Trang 9</span>
          </div>
          ${props.avg_temp ? `
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Nhiệt độ TB</span>
                <span class="font-bold text-blue-600">${props.avg_temp}</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Biên độ nhiệt</span>
                <span class="font-bold text-amber-600">${props.temp_range}</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Lượng mưa</span>
                <span class="font-bold text-cyan-600">${props.rainfall}</span>
              </div>
            </div>
          ` : ''}
          <p class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">${props.climate_type || props.desc || ''}</p>
        </div>
      `;
      return;
    }

    if (type === "mineral") {
      infoContainer.innerHTML = `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h4 class="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>💎</span> <span>${props.name}</span>
            </h4>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Trang 8</span>
          </div>
          <div class="text-[11px] text-slate-700 dark:text-slate-300">
            Loại khoáng sản: <strong>${props.mineral_type}</strong> (${props.group || 'Nhiên liệu / Kim loại'})<br>
            Tỉnh / Vùng phân bố: <strong>${props.province}</strong>
          </div>
        </div>
      `;
      return;
    }

    if (type === "power") {
      infoContainer.innerHTML = `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h4 class="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>⚡</span> <span>${props.name}</span>
            </h4>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Trang 22</span>
          </div>
          <div class="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
            <div>Loại năng lượng: <strong>${props.plant_type || props.type}</strong></div>
            <div>Công suất: <strong class="text-blue-600 font-mono">${props.capacity_mw ? props.capacity_mw.toLocaleString() + ' MW' : 'Đang cập nhật'}</strong></div>
            <div>Nguồn nhiên liệu / Sông: <strong>${props.river_fuel || 'N/A'}</strong> (Tỉnh ${props.province})</div>
          </div>
        </div>
      `;
      return;
    }

    // Default: Tỉnh thành
    const is34 = provinceMode === "34" || props.resolution;
    const isCity = props.administrative_type === "Thành phố trực thuộc Trung ương";
    const adminTypeBadge = isCity 
      ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold">Thành phố Trực thuộc TW</span>'
      : '<span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">Tỉnh</span>';

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

        <!-- Thẻ Mẹo Thi & Trọng Tâm Ôn Tập -->
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

  // Bảng Chú giải Động (Dynamic Legend)
  function updateDynamicLegend() {
    let legendEl = document.getElementById("atlas-dynamic-legend");
    if (!legendEl) {
      const mapContainer = document.getElementById("atlas-map-container");
      if (!mapContainer) return;
      legendEl = document.createElement("div");
      legendEl.id = "atlas-dynamic-legend";
      legendEl.className = "absolute bottom-3 left-3 z-[900] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-3 rounded-xl text-xs shadow-md border border-slate-200 dark:border-slate-700 max-w-[280px] max-h-[220px] overflow-y-auto space-y-2 pointer-events-auto transition-all";
      mapContainer.appendChild(legendEl);
    }

    const sections = [];

    // Lớp 2: Địa hình
    if (activeLayers.topography) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Địa hình & Sông ngòi (Trang 6-7, 10)
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
            <div class="flex items-center space-x-1"><span>⛰️</span> <span>Đỉnh núi cao</span></div>
            <div class="flex items-center space-x-1"><span>〰️</span> <span>Dãy núi / Cánh cung</span></div>
            <div class="flex items-center space-x-1"><span>🟫</span> <span>Cao nguyên badan</span></div>
            <div class="flex items-center space-x-1"><span class="w-3 h-1 bg-blue-500 inline-block"></span> <span>Sông ngòi chính</span></div>
          </div>
        </div>
      `);
    }

    // Lớp 3: Khí hậu
    if (activeLayers.climate) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Khí Hậu & Thủy Văn (Trang 9)
          </div>
          <div class="text-[10px] space-y-0.5">
            <div class="flex items-center space-x-1.5"><span class="w-3 h-1 bg-blue-600 inline-block"></span> <span>Gió mùa Đông Bắc (lạnh)</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-3 h-1 bg-red-600 inline-block"></span> <span>Gió mùa Tây Nam (nóng ẩm)</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-3 h-1 bg-amber-600 inline-block"></span> <span>Gió Phơn Tây Nam (khô nóng)</span></div>
            <div class="flex items-center space-x-1.5"><span>🌀</span> <span>Đường di chuyển bão</span></div>
            <div class="flex items-center space-x-1.5"><span>🌡️</span> <span>Trạm khí tượng</span></div>
          </div>
        </div>
      `);
    }

    // Lớp 4: Nông nghiệp & Ngư trường
    if (activeLayers.agriculture) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Nông Nghiệp & Ngư Trường (Trang 18-20)
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
            <div class="flex items-center space-x-1"><span>🌾</span> <span>Lúa gạo</span></div>
            <div class="flex items-center space-x-1"><span>☕</span> <span>Cà phê / Tiêu</span></div>
            <div class="flex items-center space-x-1"><span>🌲</span> <span>Cao su</span></div>
            <div class="flex items-center space-x-1"><span>🍵</span> <span>Chè</span></div>
            <div class="flex items-center space-x-1"><span>🍊</span> <span>Cây ăn quả</span></div>
            <div class="flex items-center space-x-1"><span>🐟</span> <span>Ngư trường lớn</span></div>
          </div>
        </div>
      `);
    }

    // Lớp 5: Khoáng sản & Năng lượng
    if (activeLayers.minerals_power) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Khoáng Sản & Năng Lượng (Trang 8, 22)
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
            <div class="flex items-center space-x-1">${getMineralSvg("coal")} <span>Than</span></div>
            <div class="flex items-center space-x-1">${getMineralSvg("oil")} <span>Dầu</span></div>
            <div class="flex items-center space-x-1">${getMineralSvg("gas")} <span>Khí</span></div>
            <div class="flex items-center space-x-1">${getMineralSvg("iron")} <span>Sắt</span></div>
            <div class="flex items-center space-x-1">${getMineralSvg("bauxite")} <span>Bô-xít</span></div>
            <div class="flex items-center space-x-1">${getMineralSvg("titan")} <span>Titan</span></div>
            <div class="flex items-center space-x-1">${getPowerSvg("Thủy điện", 500)} <span>Thủy điện</span></div>
            <div class="flex items-center space-x-1">${getPowerSvg("Nhiệt điện", 500)} <span>Nhiệt điện</span></div>
            <div class="flex items-center space-x-1"><span>🌀</span> <span>Điện gió</span></div>
            <div class="flex items-center space-x-1"><span>☀️</span> <span>Mặt trời</span></div>
          </div>
        </div>
      `);
    }

    // Lớp 6: Trung tâm Công nghiệp
    if (activeLayers.industrial) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Trung Tâm CN (Trang 21)
          </div>
          <div class="text-[11px] text-slate-700 dark:text-slate-300">
            Vòng tròn chia múi quạt theo cơ cấu ngành công nghiệp
          </div>
        </div>
      `);
    }

    // Lớp 1: Ranh giới & 7 Vùng
    if (activeLayers.provinces) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            7 Vùng Kinh Tế (Trang 4-5)
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#3b82f6"></span><span class="truncate">ĐB Sông Hồng</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#10b981"></span><span class="truncate">TD & MN Bắc Bộ</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#06b6d4"></span><span class="truncate">Bắc Trung Bộ</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#f59e0b"></span><span class="truncate">DH Nam Trung Bộ</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#84cc16"></span><span class="truncate">Tây Nguyên</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#ec4899"></span><span class="truncate">Đông Nam Bộ</span></div>
            <div class="flex items-center space-x-1 col-span-2"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#8b5cf6"></span><span class="truncate">ĐB Sông Cửu Long</span></div>
          </div>
        </div>
      `);
    }

    if (sections.length === 0) {
      legendEl.innerHTML = `<div class="text-[11px] text-slate-400 italic text-center py-1">Đã tắt các lớp chuyên đề</div>`;
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

  // Bật/tắt lớp độc lập
  async function toggleLayer(name, visible) {
    if (!map) return;
    activeLayers[name] = !!visible;

    const chk = document.getElementById(`layer-chk-${name}`);
    if (chk && chk.checked !== !!visible) {
      chk.checked = !!visible;
    }

    if (visible) {
      if (name === "topography") {
        await renderTopographyLayer();
        if (!map.hasLayer(layerTopography)) map.addLayer(layerTopography);
      } else if (name === "climate") {
        await renderClimateLayer();
        if (!map.hasLayer(layerClimate)) map.addLayer(layerClimate);
      } else if (name === "agriculture") {
        await renderAgricultureLayer();
        if (!map.hasLayer(layerAgriculture)) map.addLayer(layerAgriculture);
      } else if (name === "minerals_power") {
        await renderMineralsPowerLayer();
        if (!map.hasLayer(layerMineralsPower)) map.addLayer(layerMineralsPower);
      } else if (name === "industrial") {
        await renderIndustrialCenters();
        if (!map.hasLayer(layerIndustrial)) map.addLayer(layerIndustrial);
      } else if (name === "provinces") {
        renderProvinces(currentRegionFilter);
        if (!map.hasLayer(layerProvinces)) map.addLayer(layerProvinces);
      }
    } else {
      if (name === "topography" && layerTopography && map.hasLayer(layerTopography)) map.removeLayer(layerTopography);
      if (name === "climate" && layerClimate && map.hasLayer(layerClimate)) map.removeLayer(layerClimate);
      if (name === "agriculture" && layerAgriculture && map.hasLayer(layerAgriculture)) map.removeLayer(layerAgriculture);
      if (name === "minerals_power" && layerMineralsPower && map.hasLayer(layerMineralsPower)) map.removeLayer(layerMineralsPower);
      if (name === "industrial" && layerIndustrial && map.hasLayer(layerIndustrial)) map.removeLayer(layerIndustrial);
      if (name === "provinces" && layerProvinces && map.hasLayer(layerProvinces)) map.removeLayer(layerProvinces);
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
    renderTopographyLayer,
    renderClimateLayer,
    renderAgricultureLayer,
    renderMineralsPowerLayer,
    renderIndustrialCenters,
    renderBaselineLayer,
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