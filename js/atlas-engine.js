/**
 * GeoAtlas Interactive - Leaflet Atlas Engine (Phân hệ 1)
 * Enhanced with:
 * - Anti-overlap & Z-Index isolation
 * - Map label decluttering (Hover-only tooltips, permanent sovereignty pill)
 * - Clean Vector Inline SVGs with white strokes & drop shadows
 * - Dynamic SVG Pie Chart markers for 15 Industrial Centers with pastel colors & center white dot
 * - Instant flyTo() with Atlat page reference popups
 */

const AtlasEngine = (function () {
  let map = null;
  let layerProvinces = null;
  let layerMinerals = null;
  let layerPower = null;
  let layerIndustrial = null;

  let geoData = {
    provinces: null,
    minerals: null,
    power: null,
    industrial: null
  };

  const LAYER_FILES = {
    provinces: "./public/data/vn_provinces.geojson",
    minerals: "./public/data/minerals.geojson",
    power: "./public/data/hydropower.geojson",
    industrial: "./public/data/industrial_centers.geojson"
  };

  const loadingPromises = {};

  let currentOpacity = 0.35;
  let activeLayers = {
    provinces: true,
    minerals: false,
    power: false,
    industrial: false
  };

  const REGION_COLORS = {
    "Đồng bằng sông Hồng": "#3b82f6",
    "Trung du và miền núi Bắc Bộ": "#10b981",
    "Bắc Trung Bộ": "#06b6d4",
    "Duyên hải Nam Trung Bộ": "#f59e0b",
    "Tây Nguyên": "#84cc16",
    "Đông Nam Bộ": "#ec4899",
    "Đồng bằng sông Cửu Long": "#8b5cf6",
    "Khác": "#94a3b8"
  };

  // Clean Vector Inline SVG - Ký hiệu chuẩn Atlat Trang 8 (Hỗ trợ cả tên tiếng Anh và mã hình học)
  function getMineralSvg(symbolType) {
    switch (symbolType) {
      case "coal":
      case "square_black":
        // Than đá: Ô vuông đen viền trắng
        return `<svg width="20" height="20" viewBox="0 0 20 20" class="atlat-vector-icon"><rect x="2.5" y="2.5" width="15" height="15" fill="#0F172A" stroke="#FFFFFF" stroke-width="1.5"/></svg>`;
      case "oil":
      case "trapezoid_black":
        // Dầu mỏ: Hình thang đen viền trắng
        return `<svg width="22" height="22" viewBox="0 0 24 24" class="atlat-vector-icon"><polygon points="6,20 18,20 15,6 9,6" fill="#0F172A" stroke="#FFFFFF" stroke-width="1.5"/></svg>`;
      case "gas":
      case "trapezoid_white":
        // Khí đốt: Hình thang trắng viền đen
        return `<svg width="22" height="22" viewBox="0 0 24 24" class="atlat-vector-icon"><polygon points="6,20 18,20 15,6 9,6" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/></svg>`;
      case "iron":
      case "triangle_black":
        // Sắt: Tam giác đều đen viền trắng
        return `<svg width="20" height="20" viewBox="0 0 20 20" class="atlat-vector-icon"><polygon points="10,2 19,18 1,18" fill="#0F172A" stroke="#FFFFFF" stroke-width="1.5"/></svg>`;
      case "apatite":
      case "inverted_v":
        // Apatit: Chữ V ngược màu xanh dương
        return `<svg width="22" height="22" viewBox="0 0 24 24" class="atlat-vector-icon"><path d="M4 20 L12 4 L20 20" fill="none" stroke="#0284C7" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 20 L12 4 L20 20" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      case "bauxite":
      case "al_symbol":
        // Bô-xít: Hình thoi cam nhãn Al
        return `<svg width="22" height="22" viewBox="0 0 24 24" class="atlat-vector-icon"><polygon points="12,2 22,12 12,22 2,12" fill="#EA580C" stroke="#FFFFFF" stroke-width="1.5"/><text x="12" y="15" font-size="8" font-weight="900" text-anchor="middle" fill="#FFFFFF" font-family="sans-serif">Al</text></svg>`;
      case "tin":
      case "sn_symbol":
        // Thiếc: Ô vuông trắng 2 đường chéo
        return `<svg width="20" height="20" viewBox="0 0 20 20" class="atlat-vector-icon"><rect x="2.5" y="2.5" width="15" height="15" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.5"/><line x1="2.5" y1="2.5" x2="17.5" y2="17.5" stroke="#0F172A" stroke-width="1.5"/><line x1="17.5" y1="2.5" x2="2.5" y2="17.5" stroke="#0F172A" stroke-width="1.5"/></svg>`;
      case "chromium":
      case "cr_symbol":
        // Crôm: Vòng tròn xám ngôi sao trắng
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

  // Hàm chuẩn hóa tiếng Việt không dấu (Vietnamese Fuzzy Search)
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

  // Hàm tạo SVG Pie Chart (Vòng tròn chia các múi quạt màu sắc theo sectors & radius_px)
  function createSvgPieChart(sectors, radiusPx) {
    const size = radiusPx * 2;
    const cx = radiusPx;
    const cy = radiusPx;
    const r = radiusPx - 1;

    if (!sectors || sectors.length === 0) {
      return `
        <div class="pie-marker-wrapper" style="width: ${size}px; height: ${size}px;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="#94a3b8" stroke="#ffffff" stroke-width="1"/>
            <circle cx="${cx}" cy="${cy}" r="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
          </svg>
        </div>
      `;
    }

    // Xử lý trường hợp đặc biệt: 1 ngành (Cung tròn A góc 360 độ sẽ bị lỗi tàng hình)
    if (sectors.length === 1) {
      const color = sectors[0].color || "#2563eb";
      return `
        <div class="pie-marker-wrapper" style="width: ${size}px; height: ${size}px;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="#ffffff" stroke-width="1"/>
            <circle cx="${cx}" cy="${cy}" r="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
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
      const d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;

      paths.push(`<path d="${d}" fill="${sec.color || '#2563eb'}" stroke="#ffffff" stroke-width="1"/>`);
    });

    return `
      <div class="pie-marker-wrapper" style="width: ${size}px; height: ${size}px;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="#f8fafc" stroke="#ffffff" stroke-width="1"/>
          ${paths.join("")}
          <circle cx="${cx}" cy="${cy}" r="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1"/>
        </svg>
      </div>
    `;
  }

  function init(mapContainerId = "atlas-map") {
    if (map) return;

    map = L.map(mapContainerId, {
      center: [16.0, 107.5],
      zoom: 6,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: false
    });

    // Bản vá 1.3: Tách Pane phân lớp để không kẹt sự kiện Click (Custom Map Panes)
    map.createPane('polygonBoundaryPane');
    map.getPane('polygonBoundaryPane').style.zIndex = 390;
    map.createPane('pointMarkerPane');
    map.getPane('pointMarkerPane').style.zIndex = 650;

    L.control.zoom({ position: "topright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; CARTO & Atlat Địa lí Việt Nam',
      subdomains: "abcd",
      maxZoom: 19
    }).addTo(map);

    addSovereigntyDemarcation();

    layerProvinces = L.layerGroup().addTo(map);
    layerMinerals = L.layerGroup();
    layerPower = L.layerGroup();
    layerIndustrial = L.layerGroup();

    map.on("mousemove", (e) => {
      const coordEl = document.getElementById("cursor-coords");
      if (coordEl) {
        coordEl.innerText = `${e.latlng.lat.toFixed(4)}°B, ${e.latlng.lng.toFixed(4)}°Đ`;
      }
    });

    // Zoom listener for decluttering logic
    map.on("zoomend", () => {
      const currentZoom = map.getZoom();
      const mapContainer = document.getElementById("atlas-map-container");
      if (mapContainer) {
        if (currentZoom >= 8) {
          mapContainer.classList.add("zoom-high");
        } else {
          mapContainer.classList.remove("zoom-high");
        }
      }
    });

    loadData();
  }

  function addSovereigntyDemarcation() {
    // Biển Đông Label
    const seaIcon = L.divIcon({
      className: "sea-label",
      html: `<div class="text-blue-900/40 dark:text-blue-200/30 font-bold text-sm tracking-widest uppercase select-none pointer-events-none font-serif">BIỂN ĐÔNG VIỆT NAM</div>`,
      iconSize: [220, 24],
      iconAnchor: [110, 12],
      popupAnchor: [0, -12]
    });
    L.marker([14.5, 113.0], { icon: seaIcon, interactive: false }).addTo(map);

    // Hoàng Sa Pill
    const hsIcon = L.divIcon({
      className: "hs-marker-wrapper",
      html: `<div class="sovereignty-pill"><span>🇻🇳</span><span>QUẦN ĐẢO HOÀNG SA (TP. ĐÀ NẴNG)</span></div>`,
      iconSize: [250, 24],
      iconAnchor: [125, 12],
      popupAnchor: [0, -12]
    });
    const hs = L.marker([16.5, 112.0], { pane: 'pointMarkerPane', icon: hsIcon }).addTo(map);
    hs.bindPopup(`
      <div class="p-3.5 bg-white dark:bg-slate-900 rounded-xl min-w-[240px]">
        <div class="flex items-center space-x-2 text-red-600 font-bold text-sm mb-1.5">
          <span>🇻🇳</span>
          <h4>Quần đảo Hoàng Sa</h4>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-300">Đơn vị hành chính: <strong>Huyện đảo Hoàng Sa, TP. Đà Nẵng</strong></p>
        <div class="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400">Tham chiếu: Atlat Địa lí Việt Nam Trang 4-5</div>
      </div>
    `);

    // Trường Sa Pill
    const tsIcon = L.divIcon({
      className: "ts-marker-wrapper",
      html: `<div class="sovereignty-pill"><span>🇻🇳</span><span>QUẦN ĐẢO TRƯỜNG SA (TỈNH KHÁNH HÒA)</span></div>`,
      iconSize: [270, 24],
      iconAnchor: [135, 12],
      popupAnchor: [0, -12]
    });
    const ts = L.marker([10.0, 114.0], { pane: 'pointMarkerPane', icon: tsIcon }).addTo(map);
    ts.bindPopup(`
      <div class="p-3.5 bg-white dark:bg-slate-900 rounded-xl min-w-[240px]">
        <div class="flex items-center space-x-2 text-red-600 font-bold text-sm mb-1.5">
          <span>🇻🇳</span>
          <h4>Quần đảo Trường Sa</h4>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-300">Đơn vị hành chính: <strong>Huyện đảo Trường Sa, Tỉnh Khánh Hòa</strong></p>
        <div class="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400">Tham chiếu: Atlat Địa lí Việt Nam Trang 4-5</div>
      </div>
    `);
  }

  async function ensureLayerData(name) {
    if (geoData[name]) return geoData[name];
    if (loadingPromises[name]) return loadingPromises[name];

    loadingPromises[name] = (async () => {
      try {
        const file = LAYER_FILES[name];
        if (!file) throw new Error("Unknown layer: " + name);
        const res = await fetch(file);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        geoData[name] = data;
        return data;
      } catch (err) {
        console.warn(`[AtlasEngine] Fetch layer '${name}' thất bại. Sử dụng Seed Fallback:`, err);
        if (window.GEO_ATLAS_FALLBACK_DATA && window.GEO_ATLAS_FALLBACK_DATA[name]) {
          geoData[name] = window.GEO_ATLAS_FALLBACK_DATA[name];
          if (typeof window.showOfflineToast === "function") {
            window.showOfflineToast();
          }
          return geoData[name];
        }
        return null;
      }
    })();

    return loadingPromises[name];
  }

  async function loadData() {
    await ensureLayerData("provinces");
    renderProvinces();
    updateDynamicLegend();
  }

  function renderProvinces(filterRegion = "all") {
    if (!geoData.provinces) return;
    layerProvinces.clearLayers();

    L.geoJSON(geoData.provinces, {
      pane: 'polygonBoundaryPane',
      filter: (f) => filterRegion === "all" || f.properties.region_name === filterRegion,
      style: (f) => {
        const color = REGION_COLORS[f.properties.region_name] || "#94a3b8";
        return {
          fillColor: color,
          weight: f.properties.is_special_island ? 2 : 1,
          opacity: 0.9,
          color: f.properties.is_special_island ? "#dc2626" : "#ffffff",
          dashArray: f.properties.is_special_island ? "4,4" : "",
          fillOpacity: currentOpacity
        };
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.on({
          mouseover: (e) => {
            e.target.setStyle({ weight: 2.5, color: "#0f172a", fillOpacity: Math.min(1, currentOpacity + 0.3) });
          },
          mouseout: (e) => {
            layerProvinces.resetStyle(e.target);
          },
          click: () => {
            showDetailsPanel(p, "province");
          }
        });
        layer.bindTooltip(`<strong>${p.name}</strong><br><span class="text-[10px] text-slate-500">${p.region_name}</span>`, { sticky: true, className: "map-label-tooltip" });
      }
    }).addTo(layerProvinces);
  }

  function setProvincesOpacity(opacityVal) {
    currentOpacity = parseFloat(opacityVal);
    if (!layerProvinces) return;
    layerProvinces.eachLayer(layer => {
      if (layer.setStyle) {
        layer.setStyle({ fillOpacity: currentOpacity });
      }
    });
  }

  async function renderMinerals(groupFilter = "all") {
    if (!geoData.minerals) {
      await ensureLayerData("minerals");
    }
    if (!geoData.minerals) return;

    if (!activeLayers.minerals) {
      activeLayers.minerals = true;
      const chk = document.getElementById("layer-chk-minerals");
      if (chk) chk.checked = true;
      if (layerMinerals && !map.hasLayer(layerMinerals)) map.addLayer(layerMinerals);
      updateDynamicLegend();
    }

    layerMinerals.clearLayers();

    geoData.minerals.features.forEach(f => {
      const p = f.properties;
      if (groupFilter !== "all" && p.group !== groupFilter) return;

      const [lng, lat] = f.geometry.coordinates;
      const svgIcon = getMineralSvg(p.symbol_type);
      const size = 22;

      const marker = L.marker([lat, lng], {
        pane: 'pointMarkerPane',
        icon: L.divIcon({
          className: "mineral-svg-icon",
          html: `<div class="cursor-pointer hover:scale-125 transition drop-shadow">${svgIcon}</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -(size / 2)]
        })
      }).addTo(layerMinerals);

      // Decluttered: Tooltip only on hover, popup on click
      marker.bindTooltip(`<strong>${p.name}</strong> (${p.mineral_type})`, { sticky: true, className: "map-label-tooltip", offset: [0, -10] });

      marker.bindPopup(`
        <div class="p-3.5 bg-white dark:bg-slate-900 rounded-xl min-w-[220px]">
          <div class="flex items-center space-x-2 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
            ${svgIcon}
            <h4 class="font-bold text-sm text-slate-900 dark:text-white">${p.name}</h4>
          </div>
          <div class="space-y-1 text-xs text-slate-600 dark:text-slate-300">
            <div>Loại khoáng sản: <strong>${p.mineral_type}</strong> (${p.group})</div>
            <div>Vị trí: <strong>${p.province}</strong></div>
            <p class="text-slate-500 text-[11px] mt-1">${p.note || ''}</p>
          </div>
          <div class="mt-2.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            Tham chiếu: Atlat Địa lí Việt Nam Trang ${p.atlat_page}
          </div>
        </div>
      `);
    });
  }

  async function renderPower(typeFilter = "all") {
    if (!geoData.power) {
      await ensureLayerData("power");
    }
    if (!geoData.power) return;

    if (!activeLayers.power) {
      activeLayers.power = true;
      const chk = document.getElementById("layer-chk-power");
      if (chk) chk.checked = true;
      if (layerPower && !map.hasLayer(layerPower)) map.addLayer(layerPower);
      updateDynamicLegend();
    }

    layerPower.clearLayers();

    geoData.power.features.forEach(f => {
      const p = f?.properties || {};
      const plantType = p.plant_type || p.type || "Thủy điện";
      if (typeFilter !== "all" && !plantType.includes(typeFilter)) return;

      const [lng, lat] = f?.geometry?.coordinates || [0, 0];
      const capacity = p.capacity_mw || 0;
      const size = capacity >= 1000 ? 26 : 20;
      const svgIcon = getPowerSvg(plantType, capacity);

      const marker = L.marker([lat, lng], {
        pane: 'pointMarkerPane',
        icon: L.divIcon({
          className: "power-svg-icon",
          html: `<div class="cursor-pointer hover:scale-125 transition">${svgIcon}</div>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -(size / 2)]
        })
      }).addTo(layerPower);

      // Decluttered tooltip on hover
      marker.bindTooltip(`<strong>${p.name || ''}</strong> (${capacity.toLocaleString()} MW)`, { sticky: true, className: "map-label-tooltip", offset: [0, -10] });

      marker.bindPopup(`
        <div class="p-3.5 bg-white dark:bg-slate-900 rounded-xl min-w-[240px]">
          <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100 dark:border-slate-800">
            <h4 class="font-bold text-sm text-slate-900 dark:text-white">${p.name || ''}</h4>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold ${plantType.includes('Thủy') ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}">${plantType}</span>
          </div>
          <div class="text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div>Công suất: <strong class="tabular-nums font-mono text-blue-600 dark:text-blue-400">${capacity.toLocaleString()} MW</strong></div>
            <div>Dòng sông / Nhiên liệu: <strong>${p.river_fuel || 'N/A'}</strong></div>
            <div>Tỉnh/Thành: <strong>${p.province || 'N/A'}</strong></div>
          </div>
          <div class="mt-2.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
            Tham chiếu: Atlat Địa lí Việt Nam Trang ${p.atlat_page || 22}
          </div>
        </div>
      `);
    });
  }

  async function renderIndustrialCenters(tierFilter = "all") {
    if (!geoData.industrial) {
      await ensureLayerData("industrial");
    }
    if (!geoData.industrial) return;

    if (!activeLayers.industrial) {
      activeLayers.industrial = true;
      const chk = document.getElementById("layer-chk-industrial");
      if (chk) chk.checked = true;
      if (layerIndustrial && !map.hasLayer(layerIndustrial)) map.addLayer(layerIndustrial);
      updateDynamicLegend();
    }

    layerIndustrial.clearLayers();

    geoData.industrial.features.forEach(f => {
      const p = f?.properties || {};
      if (tierFilter !== "all" && p.scale_tier !== tierFilter) return;

      const [lng, lat] = f?.geometry?.coordinates || [0, 0];
      const sectors = p.sectors || [];
      const radiusPx = p.radius_px || 20;
      const size = radiusPx * 2;
      const pieSvg = createSvgPieChart(sectors, radiusPx);

      const marker = L.marker([lat, lng], {
        pane: 'pointMarkerPane',
        icon: L.divIcon({
          className: "custom-pie-marker",
          html: pieSvg,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          popupAnchor: [0, -(size / 2)]
        })
      }).addTo(layerIndustrial);

      // Decluttered tooltip on hover
      const scaleLabel = p.scale_desc ? p.scale_desc.split('(')[0].trim() : (p.scale_tier || 'Vừa');
      marker.bindTooltip(`<strong>${p.name || ''}</strong> (${scaleLabel})`, { sticky: true, className: "map-label-tooltip", offset: [0, -10] });

      const sectorList = sectors.map(s => `
        <div class="flex items-center justify-between text-xs py-0.5">
          <span class="flex items-center space-x-1.5 truncate">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${s.color || '#2563eb'}"></span>
            <span class="text-slate-700 dark:text-slate-300">${s.sector || s.name || ''}</span>
          </span>
          <span class="font-bold shrink-0 ml-2 tabular-nums">${s.share}%</span>
        </div>
      `).join("");

      marker.bindPopup(`
        <div class="p-3.5 bg-white dark:bg-slate-900 rounded-xl min-w-[260px]">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
            <h3 class="font-bold text-sm text-slate-900 dark:text-white">${p.name || ''}</h3>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">${scaleLabel}</span>
          </div>
          <p class="text-xs text-slate-500 mb-2">Quy mô: ${p.scale_desc || p.scale_tier || ''}</p>
          <div class="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
            ${sectorList}
          </div>
          <div class="mt-2 text-[10px] font-bold text-purple-600 dark:text-purple-400">
            Tham chiếu: Atlat Địa lí Việt Nam Trang ${p.atlat_page || 21}
          </div>
        </div>
      `);
    });
  }

  // Bản vá 1.4: Tìm kiếm Tiếng Việt không dấu (Vietnamese Fuzzy Search) & Tự động bật lớp tương ứng
  async function searchAndFlyTo(keyword) {
    if (!keyword || !map) return;
    const kw = normalizeVN(keyword);
    if (!kw) return;

    // Đảm bảo dữ liệu các lớp đã tải để tra cứu toàn diện
    await Promise.all([
      ensureLayerData("industrial"),
      ensureLayerData("power"),
      ensureLayerData("minerals"),
      ensureLayerData("provinces")
    ]);

    // 1. Tìm TTCN (tên, tỉnh thành, hoặc tên ngành công nghiệp con)
    if (geoData.industrial) {
      const match = geoData.industrial.features.find(f => {
        const p = f.properties || {};
        if (normalizeVN(p.name).includes(kw)) return true;
        if (normalizeVN(p.province).includes(kw)) return true;
        return (p.sectors || []).some(s => normalizeVN(s.sector || s.name).includes(kw));
      });
      if (match) {
        await toggleLayer("industrial", true);
        const [lng, lat] = match.geometry.coordinates;
        map.flyTo([lat, lng], 10, { duration: 1.2 });
        return;
      }
    }

    // 2. Tìm Nhà máy điện (tên, loại năng lượng, dòng sông, tỉnh thành)
    if (geoData.power) {
      const match = geoData.power.features.find(f => {
        const p = f.properties || {};
        if (normalizeVN(p.name).includes(kw)) return true;
        if (normalizeVN(p.plant_type || p.type).includes(kw)) return true;
        if (normalizeVN(p.river_fuel).includes(kw)) return true;
        return normalizeVN(p.province).includes(kw);
      });
      if (match) {
        await toggleLayer("power", true);
        const [lng, lat] = match.geometry.coordinates;
        map.flyTo([lat, lng], 11, { duration: 1.2 });
        return;
      }
    }

    // 3. Tìm Khoáng sản (tên mỏ, loại khoáng sản, tỉnh thành)
    if (geoData.minerals) {
      const match = geoData.minerals.features.find(f => {
        const p = f.properties || {};
        if (normalizeVN(p.name).includes(kw)) return true;
        if (normalizeVN(p.mineral_type).includes(kw)) return true;
        return normalizeVN(p.province).includes(kw);
      });
      if (match) {
        await toggleLayer("minerals", true);
        const [lng, lat] = match.geometry.coordinates;
        map.flyTo([lat, lng], 11, { duration: 1.2 });
        return;
      }
    }

    // 4. Tìm Tỉnh thành / Vùng kinh tế
    if (geoData.provinces) {
      const match = geoData.provinces.features.find(f => {
        const p = f.properties || {};
        return normalizeVN(p.name).includes(kw) || normalizeVN(p.region_name).includes(kw);
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

  function showDetailsPanel(props, type) {
    const infoContainer = document.getElementById("atlas-info-card");
    if (!infoContainer) return;

    infoContainer.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 class="font-bold text-sm text-slate-900 dark:text-white">${props.name}</h4>
            <span class="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium">${props.region_name || props.region}</span>
          </div>
          <span class="text-[10px] font-bold text-slate-400">Atlat Trang 4-5</span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <span class="text-[10px] text-slate-400 block uppercase font-medium">Diện tích</span>
            <span class="font-bold tabular-nums">${props.area ? props.area.toLocaleString() : 'N/A'} km²</span>
          </div>
          <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <span class="text-[10px] text-slate-400 block uppercase font-medium">Dân số</span>
            <span class="font-bold tabular-nums">${props.pop ? props.pop.toLocaleString() : 'N/A'} k</span>
          </div>
          <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <span class="text-[10px] text-slate-400 block uppercase font-medium">Mật độ</span>
            <span class="font-bold text-blue-600 dark:text-blue-400 tabular-nums">${props.density || 'N/A'} ng/km²</span>
          </div>
        </div>
      </div>
    `;
  }

  // Bản vá 4.2: Chú giải Động (Dynamic Legend) ở góc dưới bên trái bản đồ
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

    // Khoáng sản
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

    // Năng lượng
    if (activeLayers.power) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Năng lượng (Trang 22)
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
            <div class="flex items-center space-x-1.5">${getPowerSvg("Thủy điện", 500)} <span>Thủy điện</span></div>
            <div class="flex items-center space-x-1.5">${getPowerSvg("Nhiệt điện", 500)} <span>Nhiệt điện</span></div>
            <div class="col-span-2 text-[10px] text-slate-400 italic">Ký hiệu lớn: công suất ≥ 1.000 MW</div>
          </div>
        </div>
      `);
    }

    // Trung tâm công nghiệp
    if (activeLayers.industrial) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Trung tâm Công nghiệp (Trang 21)
          </div>
          <div class="text-[11px] space-y-1 text-slate-700 dark:text-slate-300">
            <div class="flex items-center space-x-1.5">
              <span class="inline-block w-3.5 h-3.5 rounded-full border border-slate-300 bg-gradient-to-tr from-blue-500 via-amber-500 to-red-500 shrink-0"></span>
              <span>Múi quạt theo cơ cấu ngành</span>
            </div>
            <div class="text-[10px] text-slate-400">Bán kính vòng tròn tỷ lệ với quy mô</div>
          </div>
        </div>
      `);
    }

    // 7 Vùng kinh tế
    if (activeLayers.provinces) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            7 Vùng Kinh Tế (Trang 4-5)
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
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
            <span>📖</span> <span>Chú Giải Ký Hiệu</span>
          </span>
          <span class="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded-full">Atlat</span>
        </div>
        ${sections.join("")}
      </div>
    `;
  }

  async function toggleLayer(name, visible) {
    if (!map) return;
    activeLayers[name] = !!visible;

    // Cập nhật trạng thái checkbox DOM nếu được gọi từ code
    const chk = document.getElementById(`layer-chk-${name}`);
    if (chk && chk.checked !== !!visible) {
      chk.checked = !!visible;
    }

    if (visible) {
      if (!geoData[name]) {
        await ensureLayerData(name);
        if (name === "minerals") await renderMinerals();
        else if (name === "power") await renderPower();
        else if (name === "industrial") await renderIndustrialCenters();
        else if (name === "provinces") renderProvinces();
      }

      if (name === "provinces" && layerProvinces && !map.hasLayer(layerProvinces)) map.addLayer(layerProvinces);
      if (name === "minerals" && layerMinerals && !map.hasLayer(layerMinerals)) map.addLayer(layerMinerals);
      if (name === "power" && layerPower && !map.hasLayer(layerPower)) map.addLayer(layerPower);
      if (name === "industrial" && layerIndustrial && !map.hasLayer(layerIndustrial)) map.addLayer(layerIndustrial);
    } else {
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
    renderProvinces,
    setProvincesOpacity,
    renderMinerals,
    renderPower,
    renderIndustrialCenters,
    updateDynamicLegend,
    toggleLayer,
    searchAndFlyTo,
    resetView: () => map && map.flyTo([16.0, 107.5], 6, { duration: 1 }),
    getMap: () => map
  };
})();

window.AtlasEngine = AtlasEngine;
