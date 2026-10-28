/**
 * GeoAtlas Interactive - Leaflet Atlas Engine v2.0 (Phân hệ 1)
 * Hoàn thiện 100% 6 Lớp Chuyên Đề Chuẩn Atlat Địa Lí Việt Nam (NXB Giáo Dục):
 * - Lớp 1: Hành chính & Vùng Kinh tế (Atlat GD, tr.4-5)
 * - Lớp 2: Địa hình & Sông ngòi (Atlat GD, tr.7 & tr.10)
 * - Lớp 3: Khí hậu & Thủy văn (Atlat GD, tr.8 & tr.9)
 * - Lớp 4: Nông, Lâm, Thủy sản & Ngư trường (Atlat GD, tr.19 - 21)
 * - Lớp 5: Khoáng sản & Năng lượng (Atlat GD, tr.13 & tr.23)
 * - Lớp 6: Kinh tế & Công nghiệp (Atlat GD, tr.18 & tr.22)
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
  // Hàm định dạng số chuẩn Việt Nam (Dấu chấm hàng nghìn, dấu phẩy thập phân)
  function formatVNNum(val, decimals = null) {
    if (val === null || val === undefined || val === "") return "N/A";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    let str = (decimals !== null && typeof decimals === "number") ? num.toFixed(decimals) : String(num);
    const parts = str.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.length > 1 ? parts.join(",") : parts[0];
  }

  let map = null;

  // 7 Lớp chuyên đề (Lớp 1-6 + Lớp 7 Giao thông Huyết mạch)
  let layerProvinces = null;       // Lớp 1
  let layerProvinceLabels = null;
  let layerTopography = null;      // Lớp 2
  let layerClimate = null;         // Lớp 3
  let layerAgriculture = null;     // Lớp 4
  let layerMineralsPower = null;   // Lớp 5
  let layerIndustrial = null;      // Lớp 6
  let layerTransportation = null;  // Lớp 7 (Atlat GD, tr.23)

  // Hỗ trợ GIS & Chủ quyền
  let layerGraticule = null;
  let layerMeasure = null;
  let layerBaseline = null;
  let layerSovereigntyIslands = null;

  let currentBaseMapMode = "vector"; // "vector" | "physical" | "osm" | "satellite"
  let currentBaseMapTile = null;
  let provinceMode = "34"; // BUG-03: Mặc định 34 đơn vị hành chính theo chuẩn Atlat GD 2026 tr.4-5
  let currentRegionFilter = "all";
  let currentOpacity = 0.35;
  let currentChoroplethMode = "none"; // "none" | "density" | "grdp" | "area"

  // Trạng thái công cụ đo khoảng cách
  let isMeasureActive = false;
  let measurePoints = [];
  let measureLine = null;
  let measureMarkers = [];

  // Trạng thái Đấu Trường Atlat THPT 3 Chế Độ
  let miniGameActive = false;
  let gameMode = "speed"; // "speed" | "silhouette" | "symbols"
  let miniGameTarget = null;
  let silhouetteTarget = null;
  let symbolTarget = null;
  let miniGameTimer = null;
  let miniGameTimeLeft = 15;
  let miniGameScore = 0;
  let miniGameStreak = 0;

  // 4 Chuyên Đề Bản Đồ Tự Vẽ 100% Theo Chuẩn Atlat (Không Dùng Bất Kỳ API Ngoài Nào)
  const ATLAT_THEMES = {
    admin: {
      id: "admin",
      name: "Atlat Hành Chính (Tr.4-5)",
      desc: "Tự vẽ 6 Vùng kinh tế - xã hội & ranh giới tỉnh theo chuẩn Atlat GD tr.4-5 & tr.18."
    },
    physical: {
      id: "physical",
      name: "Atlat Địa Hình (Tr.6-7)",
      desc: "Tự vẽ phân tầng độ cao địa hình: Xanh lá (<200m), Vàng (200-500m), Cam (500-1000m), Nâu (>1000m)."
    },
    climate: {
      id: "climate",
      name: "Atlat Khí Hậu (Tr.8-9)",
      desc: "Tự vẽ 2 miền khí hậu Bắc/Nam, ranh giới Bạch Mã 16°B, luồng gió mùa Đông Bắc & Tây Nam."
    },
    economic: {
      id: "economic",
      name: "Atlat Kinh Tế (Tr.18 & 22)",
      desc: "Tự vẽ nền kinh tế tỉnh & vòng tròn phân cấp quy mô GRDP 4 cấp, năng lượng, trung tâm công nghiệp."
    }
  };

  // Bảng màu phân tầng độ cao (Hypsometric Tints) chuẩn Atlat Địa lí Việt Nam Trang 6-7
  const ELEVATION_COLORS = {
    plain_low: "#86efac",     // < 50m: Xanh lục mạ non tươi (ĐBSH, ĐBSCL)
    plain_high: "#bef264",    // 50 - 200m: Xanh cốm (Duyên hải miền Trung)
    hill: "#fde047",          // 200 - 500m: Vàng tươi (Trung du Bắc Bộ, ĐNB)
    plateau: "#fb923c",       // 500 - 1000m: Cam đất (Tây Nguyên)
    mountain_mid: "#ea580c",  // 1000 - 1500m: Cam nâu (Trường Sơn, Tây Bắc)
    mountain_high: "#9a3412"  // > 1500m: Nâu đậm (Hoàng Liên Sơn, Ngọc Linh)
  };

  const PROVINCE_ELEVATION = {
    // Đồng bằng phù sa < 50m
    "Hà Nội": "plain_low", "Hải Phòng": "plain_low", "Hưng Yên": "plain_low", "Bắc Ninh": "plain_low",
    "Nam Định": "plain_low", "Hà Nam": "plain_low", "Ninh Bình": "plain_low", "Thái Bình": "plain_low",
    "Hải Dương": "plain_low", "Long An": "plain_low", "Tiền Giang": "plain_low", "Bến Tre": "plain_low",
    "Vĩnh Long": "plain_low", "Trà Vinh": "plain_low", "Hậu Giang": "plain_low", "Sóc Trăng": "plain_low",
    "Bạc Liêu": "plain_low", "Cà Mau": "plain_low", "An Giang": "plain_low", "Đồng Tháp": "plain_low",
    "Kiên Giang": "plain_low", "Cần Thơ": "plain_low",

    // Đồng bằng duyên hải & thềm chuyển tiếp 50 - 200m
    "Thanh Hoá": "plain_high", "Nghệ An": "plain_high", "Hà Tĩnh": "plain_high", "Quảng Bình": "plain_high",
    "Quảng Trị": "plain_high", "Thừa Thiên Huế": "plain_high", "Đà Nẵng": "plain_high", "Quảng Nam": "plain_high",
    "Quảng Ngãi": "plain_high", "Bình Định": "plain_high", "Phú Yên": "plain_high", "Khánh Hoà": "plain_high",
    "Ninh Thuận": "plain_high", "Bình Thuận": "plain_high", "Bà Rịa - Vũng Tàu": "plain_high", "TP. Hồ Chí Minh": "plain_high",

    // Đồi trung du & bán bình nguyên 200 - 500m
    "Phú Thọ": "hill", "Thái Nguyên": "hill", "Bắc Giang": "hill", "Quảng Ninh": "hill",
    "Bình Phước": "hill", "Tây Ninh": "hill", "Đồng Nai": "hill",

    // Cao nguyên & đồi núi trung bình 500 - 1000m
    "Đắk Lắk": "plateau", "Gia Lai": "plateau", "Đắk Nông": "plateau", "Kon Tum": "plateau",
    "Lạng Sơn": "plateau", "Bắc Kạn": "plateau", "Tuyên Quang": "plateau", "Yên Bái": "plateau", "Hòa Bình": "plateau",

    // Vùng núi cao > 1000m
    "Lào Cai": "mountain_high", "Lai Châu": "mountain_high", "Điện Biên": "mountain_high",
    "Sơn La": "mountain_high", "Hà Giang": "mountain_high", "Cao Bằng": "mountain_high", "Lâm Đồng": "mountain_high",

    // 34 đơn vị hành chính mới (NQ 202/2025/QH15)
    "Tỉnh Cao Bằng": "mountain_high", "Tỉnh Tuyên Quang": "plateau", "Tỉnh Lào Cai": "mountain_high",
    "Tỉnh Thái Nguyên": "hill", "Tỉnh Lạng Sơn": "plateau", "Tỉnh Phú Thọ": "hill",
    "Tỉnh Điện Biên": "mountain_high", "Tỉnh Lai Châu": "mountain_high", "Tỉnh Sơn La": "mountain_high",
    "Thành phố Hà Nội": "plain_low", "Thành phố Bắc Ninh": "plain_high", "Tỉnh Bắc Ninh": "plain_high", "Thành phố Quảng Ninh": "hill", "Tỉnh Quảng Ninh": "hill",
    "Thành phố Hải Phòng": "plain_low", "Tỉnh Hưng Yên": "plain_low", "Tỉnh Ninh Bình": "plain_low",
    "Tỉnh Thanh Hoá": "plain_high", "Tỉnh Nghệ An": "plain_high", "Tỉnh Hà Tĩnh": "plain_high",
    "Tỉnh Quảng Trị": "plain_high", "Thành phố Huế": "plain_high", "Thành phố Đà Nẵng": "plain_high",
    "Tỉnh Quảng Ngãi": "plain_high", "Tỉnh Khánh Hoà": "plain_high", "Tỉnh Gia Lai": "plateau",
    "Tỉnh Đắk Lắk": "plateau", "Tỉnh Lâm Đồng": "mountain_high", "Tỉnh Tây Ninh": "plain_high",
    "Thành phố Đồng Nai": "hill", "Đồng Nai": "hill", "Thành phố Hồ Chí Minh": "plain_high", "Tỉnh Vĩnh Long": "plain_low",
    "Tỉnh Đồng Tháp": "plain_low", "Tỉnh An Giang": "plain_low", "Thành phố Cần Thơ": "plain_low",
    "Tỉnh Cà Mau": "plain_low"
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
    transportation: null,
    baseline: null
  };

  const LAYER_FILES = {
    provinces63: "./public/data/vn_provinces_63.geojson",
    provinces34: "./public/data/vn_provinces_34.geojson",
    topography: "./public/data/topography_rivers.geojson",
    climate: "./public/data/climate_hydro.geojson",
    agriculture: "./public/data/agriculture_fishery.geojson",
    minerals: "./public/data/minerals.geojson",
    power: "./public/data/hydropower.geojson",
    industrial: "./public/data/industrial_centers.geojson",
    transportation: "./public/data/transportation.geojson",
    baseline: "./public/data/baseline.geojson"
  };

  const loadingPromises = {};

  // Trạng thái bật/tắt 7 lớp
  let activeLayers = {
    provinces: true,        // Lớp 1 (mặc định bật)
    topography: false,      // Lớp 2
    climate: false,         // Lớp 3
    agriculture: false,     // Lớp 4
    minerals_power: false,  // Lớp 5
    industrial: false,      // Lớp 6
    transportation: false   // Lớp 7 (Atlat GD, tr.23)
  };

  // BUG-02: 6 Vùng Kinh Tế Chuẩn Atlat GD, tr.5 & tr.18
  const REGION_COLORS = {
    "Trung du và miền núi phía Bắc": "#10b981",
    "Đồng bằng sông Hồng": "#3b82f6",
    "Bắc Trung Bộ": "#06b6d4",
    "Duyên hải Nam Trung Bộ và Tây Nguyên": "#f59e0b",
    "Đông Nam Bộ": "#ec4899",
    "Đồng bằng sông Cửu Long": "#8b5cf6",
    // Tương thích ngược:
    "Trung du và miền núi Bắc Bộ": "#10b981",
    "Duyên hải Nam Trung Bộ": "#f59e0b",
    "Tây Nguyên": "#f59e0b",
    "IV. Duyên hải Nam Trung Bộ & Tây Nguyên": "#f59e0b",
    "IV. Duyên hải Nam Trung Bộ và Tây Nguyên": "#f59e0b",
    "Duyên hải Nam Trung Bộ & Tây Nguyên": "#f59e0b",
    "Bắc Trung Bộ và Duyên hải miền Trung": "#0891b2",
    "Khác": "#94a3b8"
  };

  // Tra cứu nhanh GRDP 63 tỉnh thành (nghìn tỉ đồng, Atlat GD tr.18 & Niên giám GSO)
  const GRDP_LOOKUP = {
    "TP. Hồ Chí Minh": 1620, "Hà Nội": 1210, "Bình Dương": 465, "Thành phố Đồng Nai": 445, "Đồng Nai": 445, "Hải Phòng": 372,
    "Bà Rịa - Vũng Tàu": 285, "Quảng Ninh": 275, "Thanh Hóa": 262, "Bắc Ninh": 250, "Nghệ An": 195,
    "Bắc Giang": 182, "Hải Dương": 178, "Long An": 168, "Vĩnh Phúc": 162, "Thái Nguyên": 154,
    "Đà Nẵng": 138, "Quảng Nam": 125, "Kiên Giang": 122, "Cần Thơ": 120, "Khánh Hoà": 118,
    "Tiền Giang": 116, "Lâm Đồng": 115, "Bình Định": 112, "Đắk Lắk": 110, "Tây Ninh": 105,
    "Bình Thuận": 98, "Thái Bình": 95, "Nam Định": 92, "Hưng Yên": 90, "An Giang": 88,
    "Ninh Bình": 85, "Gia Lai": 85, "Bình Phước": 82, "Hà Tĩnh": 80, "Đồng Tháp": 78,
    "Phú Thọ": 76, "Sơn La": 72, "Cà Mau": 70, "Bến Tre": 68, "Thừa Thiên Huế": 66,
    "Lào Cai": 65, "Sóc Trăng": 64, "Lạng Sơn": 62, "Hòa Bình": 60, "Quảng Ngãi": 60,
    "Hà Nam": 58, "Vĩnh Long": 56, "Trà Vinh": 55, "Bạc Liêu": 54, "Quảng Bình": 52,
    "Tuyên Quang": 48, "Yên Bái": 46, "Ninh Thuận": 44, "Hậu Giang": 43, "Phú Yên": 42,
    "Đắk Nông": 40, "Kon Tum": 38, "Quảng Trị": 36, "Hà Giang": 34, "Điện Biên": 30,
    "Lai Châu": 28, "Cao Bằng": 26, "Bắc Kạn": 22,
    "Quần đảo Hoàng Sa": 1.2, "Quần đảo Trường Sa": 2.5
  };

  // B-05: Bảng tra cứu GRDP chuẩn hoá tên (bỏ dấu + bỏ tiền tố "Tỉnh "/"Thành phố "/"TP. ")
  // để khớp cả tên 63 tỉnh cũ lẫn tên 34 đơn vị mới (vd: "Tỉnh Thanh Hoá" → "thanh hoa" → "Thanh Hóa")
  const stripProvincePrefix = (s) => String(s || "").replace(/^(Tỉnh|Thành phố|TP\.|TT\.)\s+/i, "").trim();
  const GRDP_NORM_LOOKUP = {};
  Object.keys(GRDP_LOOKUP).forEach((k) => {
    GRDP_NORM_LOOKUP[normalizeVN(stripProvincePrefix(k))] = GRDP_LOOKUP[k];
  });

  // Bảng phân hạng tô màu Choropleth Heatmap (Upgrade 1)
  // GRDP bình quân đầu người 4 cấp chuẩn Atlat GD, tr.18
  const GRDP_PER_CAPITA_TIERS = {
    // Cấp 1: Từ 125 triệu đồng trở lên
    "Thành phố Hà Nội": 1, "Thành phố Hồ Chí Minh": 1, "Thành phố Hải Phòng": 1, "Thành phố Đồng Nai": 1,
    "Thành phố Quảng Ninh": 1, "Thành phố Bắc Ninh": 1, "Tỉnh Quảng Ninh": 1, "Tỉnh Bắc Ninh": 1,
    "Hà Nội": 1, "TP. Hồ Chí Minh": 1, "Hải Phòng": 1, "Quảng Ninh": 1, "Bắc Ninh": 1, "Đồng Nai": 1, "Bà Rịa - Vũng Tàu": 1, "Bình Dương": 1,
    // Cấp 2: 100 đến dưới 125 triệu đồng
    "Thành phố Đà Nẵng": 2, "Tỉnh Hưng Yên": 2, "Tỉnh Ninh Bình": 2, "Tỉnh Vĩnh Long": 2, "Thành phố Cần Thơ": 2, "Tỉnh Tây Ninh": 2, "Tỉnh Khánh Hoà": 2,
    "Đà Nẵng": 2, "Hưng Yên": 2, "Ninh Bình": 2, "Vĩnh Long": 2, "Cần Thơ": 2, "Tây Ninh": 2, "Khánh Hoà": 2,
    // Cấp 3: 75 đến dưới 100 triệu đồng
    "Tỉnh Thái Nguyên": 3, "Tỉnh Phú Thọ": 3, "Tỉnh Thanh Hoá": 3, "Tỉnh Nghệ An": 3, "Thành phố Huế": 3, "Tỉnh Quảng Ngãi": 3, "Tỉnh Gia Lai": 3, "Tỉnh Đắk Lắk": 3, "Tỉnh Lâm Đồng": 3, "Tỉnh Đồng Tháp": 3, "Tỉnh An Giang": 3, "Tỉnh Cà Mau": 3,
    "Thái Nguyên": 3, "Phú Thọ": 3, "Thanh Hoá": 3, "Nghệ An": 3, "Huế": 3, "Thừa Thiên Huế": 3, "Quảng Ngãi": 3, "Gia Lai": 3, "Đắk Lắk": 3, "Lâm Đồng": 3, "Đồng Tháp": 3, "An Giang": 3, "Cà Mau": 3, "Bình Định": 3, "Phú Yên": 3, "Ninh Thuận": 3, "Bình Thuận": 3, "Đắk Nông": 3, "Kon Tum": 3,
    // Cấp 4: Dưới 75 triệu đồng
    "Tỉnh Cao Bằng": 4, "Tỉnh Lạng Sơn": 4, "Tỉnh Tuyên Quang": 4, "Tỉnh Lào Cai": 4, "Tỉnh Điện Biên": 4, "Tỉnh Lai Châu": 4, "Tỉnh Sơn La": 4, "Tỉnh Hà Tĩnh": 4, "Tỉnh Quảng Trị": 4,
    "Cao Bằng": 4, "Lạng Sơn": 4, "Tuyên Quang": 4, "Lào Cai": 4, "Điện Biên": 4, "Lai Châu": 4, "Sơn La": 4, "Hà Tĩnh": 4, "Quảng Trị": 4, "Hà Giang": 4, "Bắc Kạn": 4, "Yên Bái": 4, "Hòa Bình": 4, "Quảng Bình": 4
  };

  const CHOROPLETH_PALETTES = {
    density: {
      id: "density",
      title: "Mật độ dân số (người/km²)",
      source: "Atlat GD, tr.17 (Dân số và Mật độ dân số)",
      ranges: [
        { max: 99.99, color: "#ffffcc", label: "Dưới 100 ng/km²" },
        { max: 199.99, color: "#fed976", label: "100 đến dưới 200 ng/km²" },
        { max: 499.99, color: "#feb24c", label: "200 đến dưới 500 ng/km²" },
        { max: 999.99, color: "#fd8d3c", label: "500 đến dưới 1.000 ng/km²" },
        { max: Infinity, color: "#e31a1c", label: "Từ 1.000 ng/km² trở lên" }
      ],
      getValue: (p) => Number(p.density) || 0
    },
    grdp: {
      id: "grdp",
      title: "GRDP bình quân đầu người (triệu đồng)",
      source: "Atlat GD, tr.18 (Kinh tế chung)",
      ranges: [
        { max: 1, color: "#1e3a8a", label: "Từ 125 triệu đồng trở lên" },
        { max: 2, color: "#2563eb", label: "100 đến dưới 125 triệu đồng" },
        { max: 3, color: "#f59e0b", label: "75 đến dưới 100 triệu đồng" },
        { max: 4, color: "#fef08a", label: "Dưới 75 triệu đồng" }
      ],
      getValue: (p) => GRDP_PER_CAPITA_TIERS[p.name] || 3
    },
    area: {
      id: "area",
      title: "Diện tích tự nhiên (km²)",
      source: "Atlat GD, tr.4-5 (Hành chính)",
      ranges: [
        { max: 2000, color: "#ede9fe", label: "< 2 000 km² (Đô thị, đồng bằng hẹp)" },
        { max: 5000, color: "#c4b5fd", label: "2 000 - 5 000 km²" },
        { max: 8000, color: "#8b5cf6", label: "5 000 - 8 000 km²" },
        { max: 12000, color: "#6d28d9", label: "8 000 - 12 000 km²" },
        { max: Infinity, color: "#4c1d95", label: "> 12 000 km² (Nghệ An, Sơn La, Gia Lai...)" }
      ],
      getValue: (p) => Number(p.area) || 0
    }
  };

  // Tra cứu Đơn vị Hành chính cấp Quận / Huyện / Thị xã (Upgrade 5 Drill-down)
  const PROVINCE_DISTRICTS = {
    "Hà Nội": {
      total: 30,
      desc: "12 Quận, 1 Thị xã, 17 Huyện",
      units: [
        { name: "Ba Đình", type: "Quận" }, { name: "Hoàn Kiếm", type: "Quận" }, { name: "Tây Hồ", type: "Quận" },
        { name: "Long Biên", type: "Quận" }, { name: "Cầu Giấy", type: "Quận" }, { name: "Đống Đa", type: "Quận" },
        { name: "Hai Bà Trưng", type: "Quận" }, { name: "Hoàng Mai", type: "Quận" }, { name: "Thanh Xuân", type: "Quận" },
        { name: "Nam Từ Liêm", type: "Quận" }, { name: "Bắc Từ Liêm", type: "Quận" }, { name: "Hà Đông", type: "Quận" },
        { name: "Sơn Tây", type: "Thị xã" },
        { name: "Ba Vì", type: "Huyện" }, { name: "Chương Mỹ", type: "Huyện" }, { name: "Đan Phượng", type: "Huyện" },
        { name: "Đông Anh", type: "Huyện" }, { name: "Gia Lâm", type: "Huyện" }, { name: "Hoài Đức", type: "Huyện" },
        { name: "Mê Linh", type: "Huyện" }, { name: "Mỹ Đức", type: "Huyện" }, { name: "Phú Xuyên", type: "Huyện" },
        { name: "Phúc Thọ", type: "Huyện" }, { name: "Quốc Oai", type: "Huyện" }, { name: "Sóc Sơn", type: "Huyện" },
        { name: "Thạch Thất", type: "Huyện" }, { name: "Thanh Oai", type: "Huyện" }, { name: "Thanh Trì", type: "Huyện" },
        { name: "Thường Tín", type: "Huyện" }, { name: "Ứng Hòa", type: "Huyện" }
      ]
    },
    "Thành phố Hà Nội": {
      total: 30,
      desc: "12 Quận, 1 Thị xã, 17 Huyện",
      units: [
        { name: "Ba Đình", type: "Quận" }, { name: "Hoàn Kiếm", type: "Quận" }, { name: "Tây Hồ", type: "Quận" },
        { name: "Long Biên", type: "Quận" }, { name: "Cầu Giấy", type: "Quận" }, { name: "Đống Đa", type: "Quận" },
        { name: "Hai Bà Trưng", type: "Quận" }, { name: "Hoàng Mai", type: "Quận" }, { name: "Thanh Xuân", type: "Quận" },
        { name: "Nam Từ Liêm", type: "Quận" }, { name: "Bắc Từ Liêm", type: "Quận" }, { name: "Hà Đông", type: "Quận" },
        { name: "Sơn Tây", type: "Thị xã" },
        { name: "Ba Vì", type: "Huyện" }, { name: "Chương Mỹ", type: "Huyện" }, { name: "Đan Phượng", type: "Huyện" },
        { name: "Đông Anh", type: "Huyện" }, { name: "Gia Lâm", type: "Huyện" }, { name: "Hoài Đức", type: "Huyện" },
        { name: "Mê Linh", type: "Huyện" }, { name: "Mỹ Đức", type: "Huyện" }, { name: "Phú Xuyên", type: "Huyện" },
        { name: "Phúc Thọ", type: "Huyện" }, { name: "Quốc Oai", type: "Huyện" }, { name: "Sóc Sơn", type: "Huyện" },
        { name: "Thạch Thất", type: "Huyện" }, { name: "Thanh Oai", type: "Huyện" }, { name: "Thanh Trì", type: "Huyện" },
        { name: "Thường Tín", type: "Huyện" }, { name: "Ứng Hòa", type: "Huyện" }
      ]
    },
    "TP. Hồ Chí Minh": {
      total: 22,
      desc: "16 Quận, 1 Thành phố, 5 Huyện",
      units: [
        { name: "Thủ Đức", type: "Thành phố" },
        { name: "Quận 1", type: "Quận" }, { name: "Quận 3", type: "Quận" }, { name: "Quận 4", type: "Quận" },
        { name: "Quận 5", type: "Quận" }, { name: "Quận 6", type: "Quận" }, { name: "Quận 7", type: "Quận" },
        { name: "Quận 8", type: "Quận" }, { name: "Quận 10", type: "Quận" }, { name: "Quận 11", type: "Quận" },
        { name: "Quận 12", type: "Quận" }, { name: "Bình Thạnh", type: "Quận" }, { name: "Gò Vấp", type: "Quận" },
        { name: "Phú Nhuận", type: "Quận" }, { name: "Tân Bình", type: "Quận" }, { name: "Tân Phú", type: "Quận" },
        { name: "Bình Tân", type: "Quận" },
        { name: "Củ Chi", type: "Huyện" }, { name: "Hóc Môn", type: "Huyện" }, { name: "Bình Chánh", type: "Huyện" },
        { name: "Nhà Bè", type: "Huyện" }, { name: "Cần Giờ", type: "Huyện" }
      ]
    },
    "Thành phố Hồ Chí Minh": {
      total: 22,
      desc: "16 Quận, 1 Thành phố, 5 Huyện",
      units: [
        { name: "Thủ Đức", type: "Thành phố" },
        { name: "Quận 1", type: "Quận" }, { name: "Quận 3", type: "Quận" }, { name: "Quận 4", type: "Quận" },
        { name: "Quận 5", type: "Quận" }, { name: "Quận 6", type: "Quận" }, { name: "Quận 7", type: "Quận" },
        { name: "Quận 8", type: "Quận" }, { name: "Quận 10", type: "Quận" }, { name: "Quận 11", type: "Quận" },
        { name: "Quận 12", type: "Quận" }, { name: "Bình Thạnh", type: "Quận" }, { name: "Gò Vấp", type: "Quận" },
        { name: "Phú Nhuận", type: "Quận" }, { name: "Tân Bình", type: "Quận" }, { name: "Tân Phú", type: "Quận" },
        { name: "Bình Tân", type: "Quận" },
        { name: "Củ Chi", type: "Huyện" }, { name: "Hóc Môn", type: "Huyện" }, { name: "Bình Chánh", type: "Huyện" },
        { name: "Nhà Bè", type: "Huyện" }, { name: "Cần Giờ", type: "Huyện" }
      ]
    },
    "Hải Phòng": {
      total: 15,
      desc: "7 Quận, 8 Huyện (gồm 2 huyện đảo)",
      units: [
        { name: "Hồng Bàng", type: "Quận" }, { name: "Ngô Quyền", type: "Quận" }, { name: "Lê Chân", type: "Quận" },
        { name: "Hải An", type: "Quận" }, { name: "Kiến An", type: "Quận" }, { name: "Đồ Sơn", type: "Quận" },
        { name: "Dương Kinh", type: "Quận" },
        { name: "An Dương", type: "Huyện" }, { name: "An Lão", type: "Huyện" }, { name: "Bạch Long Vĩ", type: "Huyện đảo" },
        { name: "Cát Hải", type: "Huyện đảo" }, { name: "Kiến Thụy", type: "Huyện" }, { name: "Thủy Nguyên", type: "Huyện" },
        { name: "Tiên Lãng", type: "Huyện" }, { name: "Vĩnh Bảo", type: "Huyện" }
      ]
    },
    "Thành phố Hải Phòng": {
      total: 15,
      desc: "7 Quận, 8 Huyện (gồm 2 huyện đảo)",
      units: [
        { name: "Hồng Bàng", type: "Quận" }, { name: "Ngô Quyền", type: "Quận" }, { name: "Lê Chân", type: "Quận" },
        { name: "Hải An", type: "Quận" }, { name: "Kiến An", type: "Quận" }, { name: "Đồ Sơn", type: "Quận" },
        { name: "Dương Kinh", type: "Quận" },
        { name: "An Dương", type: "Huyện" }, { name: "An Lão", type: "Huyện" }, { name: "Bạch Long Vĩ", type: "Huyện đảo" },
        { name: "Cát Hải", type: "Huyện đảo" }, { name: "Kiến Thụy", type: "Huyện" }, { name: "Thủy Nguyên", type: "Huyện" },
        { name: "Tiên Lãng", type: "Huyện" }, { name: "Vĩnh Bảo", type: "Huyện" }
      ]
    },
    "Đà Nẵng": {
      total: 8,
      desc: "6 Quận, 2 Huyện (gồm huyện đảo Hoàng Sa thiêng liêng)",
      units: [
        { name: "Hải Châu", type: "Quận" }, { name: "Thanh Khê", type: "Quận" }, { name: "Sơn Trà", type: "Quận" },
        { name: "Ngũ Hành Sơn", type: "Quận" }, { name: "Liên Chiểu", type: "Quận" }, { name: "Cẩm Lệ", type: "Quận" },
        { name: "Hòa Vang", type: "Huyện" }, { name: "Hoàng Sa (Huyện đảo)", type: "Huyện đảo" }
      ]
    },
    "Thành phố Đà Nẵng": {
      total: 8,
      desc: "6 Quận, 2 Huyện (gồm huyện đảo Hoàng Sa thiêng liêng)",
      units: [
        { name: "Hải Châu", type: "Quận" }, { name: "Thanh Khê", type: "Quận" }, { name: "Sơn Trà", type: "Quận" },
        { name: "Ngũ Hành Sơn", type: "Quận" }, { name: "Liên Chiểu", type: "Quận" }, { name: "Cẩm Lệ", type: "Quận" },
        { name: "Hòa Vang", type: "Huyện" }, { name: "Hoàng Sa (Huyện đảo)", type: "Huyện đảo" }
      ]
    },
    "Cần Thơ": {
      total: 9,
      desc: "5 Quận, 4 Huyện",
      units: [
        { name: "Ninh Kiều", type: "Quận" }, { name: "Bình Thủy", type: "Quận" }, { name: "Cái Răng", type: "Quận" },
        { name: "Ô Môn", type: "Quận" }, { name: "Thốt Nốt", type: "Quận" },
        { name: "Phong Điền", type: "Huyện" }, { name: "Cờ Đỏ", type: "Huyện" }, { name: "Thới Lai", type: "Huyện" },
        { name: "Vĩnh Thạnh", type: "Huyện" }
      ]
    },
    "Thành phố Cần Thơ": {
      total: 9,
      desc: "5 Quận, 4 Huyện",
      units: [
        { name: "Ninh Kiều", type: "Quận" }, { name: "Bình Thủy", type: "Quận" }, { name: "Cái Răng", type: "Quận" },
        { name: "Ô Môn", type: "Quận" }, { name: "Thốt Nốt", type: "Quận" },
        { name: "Phong Điền", type: "Huyện" }, { name: "Cờ Đỏ", type: "Huyện" }, { name: "Thới Lai", type: "Huyện" },
        { name: "Vĩnh Thạnh", type: "Huyện" }
      ]
    },
    "Thừa Thiên Huế": {
      total: 9,
      desc: "1 Thành phố, 2 Thị xã, 6 Huyện",
      units: [
        { name: "TP. Huế", type: "Thành phố" }, { name: "Hương Thủy", type: "Thị xã" }, { name: "Hương Trà", type: "Thị xã" },
        { name: "Phong Điền", type: "Huyện" }, { name: "Quảng Điền", type: "Huyện" }, { name: "Phú Vang", type: "Huyện" },
        { name: "Phú Lộc", type: "Huyện" }, { name: "A Lưới", type: "Huyện" }, { name: "Nam Đông", type: "Huyện" }
      ]
    },
    "Thành phố Huế": {
      total: 9,
      desc: "1 Thành phố, 2 Thị xã, 6 Huyện",
      units: [
        { name: "TP. Huế", type: "Thành phố" }, { name: "Hương Thủy", type: "Thị xã" }, { name: "Hương Trà", type: "Thị xã" },
        { name: "Phong Điền", type: "Huyện" }, { name: "Quảng Điền", type: "Huyện" }, { name: "Phú Vang", type: "Huyện" },
        { name: "Phú Lộc", type: "Huyện" }, { name: "A Lưới", type: "Huyện" }, { name: "Nam Đông", type: "Huyện" }
      ]
    },
    "Quảng Ninh": {
      total: 13,
      desc: "4 Thành phố, 2 Thị xã, 7 Huyện (gồm Cô Tô, Vân Đồn)",
      units: [
        { name: "Hạ Long", type: "Thành phố" }, { name: "Cẩm Phả", type: "Thành phố" }, { name: "Uông Bí", type: "Thành phố" },
        { name: "Móng Cái", type: "Thành phố" }, { name: "Quảng Yên", type: "Thị xã" }, { name: "Đông Triều", type: "Thị xã" },
        { name: "Vân Đồn", type: "Huyện đảo" }, { name: "Cô Tô", type: "Huyện đảo" }, { name: "Ba Chẽ", type: "Huyện" },
        { name: "Bình Liêu", type: "Huyện" }, { name: "Đầm Hà", type: "Huyện" }, { name: "Hải Hà", type: "Huyện" },
        { name: "Tiên Yên", type: "Huyện" }
      ]
    },
    "Khánh Hoà": {
      total: 9,
      desc: "2 Thành phố, 1 Thị xã, 6 Huyện (gồm huyện đảo Trường Sa thiêng liêng)",
      units: [
        { name: "Nha Trang", type: "Thành phố" }, { name: "Cam Ranh", type: "Thành phố" }, { name: "Ninh Hòa", type: "Thị xã" },
        { name: "Vạn Ninh", type: "Huyện" }, { name: "Diên Khánh", type: "Huyện" }, { name: "Khánh Vĩnh", type: "Huyện" },
        { name: "Khánh Sơn", type: "Huyện" }, { name: "Cam Lâm", type: "Huyện" }, { name: "Trường Sa (Huyện đảo)", type: "Huyện đảo" }
      ]
    },
    "Tỉnh Khánh Hoà": {
      total: 9,
      desc: "2 Thành phố, 1 Thị xã, 6 Huyện (gồm huyện đảo Trường Sa thiêng liêng)",
      units: [
        { name: "Nha Trang", type: "Thành phố" }, { name: "Cam Ranh", type: "Thành phố" }, { name: "Ninh Hòa", type: "Thị xã" },
        { name: "Vạn Ninh", type: "Huyện" }, { name: "Diên Khánh", type: "Huyện" }, { name: "Khánh Vĩnh", type: "Huyện" },
        { name: "Khánh Sơn", type: "Huyện" }, { name: "Cam Lâm", type: "Huyện" }, { name: "Trường Sa (Huyện đảo)", type: "Huyện đảo" }
      ]
    },
    "Bà Rịa - Vũng Tàu": {
      total: 8,
      desc: "2 Thành phố, 1 Thị xã, 5 Huyện (gồm huyện đảo Côn Đảo)",
      units: [
        { name: "Vũng Tàu", type: "Thành phố" }, { name: "Bà Rịa", type: "Thành phố" }, { name: "Phú Mỹ", type: "Thị xã" },
        { name: "Côn Đảo", type: "Huyện đảo" }, { name: "Châu Đức", type: "Huyện" }, { name: "Đất Đỏ", type: "Huyện" },
        { name: "Long Điền", type: "Huyện" }, { name: "Xuyên Mộc", type: "Huyện" }
      ]
    },
    "Đồng Nai": {
      total: 11,
      desc: "2 Thành phố, 9 Huyện (Cụm đô thị - công nghiệp sân bay quốc tế Long Thành)",
      units: [
        { name: "Biên Hòa", type: "Thành phố" }, { name: "Long Khánh", type: "Thành phố" },
        { name: "Long Thành", type: "Huyện" }, { name: "Nhơn Trạch", type: "Huyện" }, { name: "Trảng Bom", type: "Huyện" },
        { name: "Vĩnh Cửu", type: "Huyện" }, { name: "Định Quán", type: "Huyện" }, { name: "Tân Phú", type: "Huyện" },
        { name: "Thống Nhất", type: "Huyện" }, { name: "Cẩm Mỹ", type: "Huyện" }, { name: "Xuân Lộc", type: "Huyện" }
      ]
    },
    "Thành phố Đồng Nai": {
      total: 11,
      desc: "2 Thành phố, 9 Huyện (Cụm đô thị - công nghiệp sân bay quốc tế Long Thành)",
      units: [
        { name: "Biên Hòa", type: "Thành phố" }, { name: "Long Khánh", type: "Thành phố" },
        { name: "Long Thành", type: "Huyện" }, { name: "Nhơn Trạch", type: "Huyện" }, { name: "Trảng Bom", type: "Huyện" },
        { name: "Vĩnh Cửu", type: "Huyện" }, { name: "Định Quán", type: "Huyện" }, { name: "Tân Phú", type: "Huyện" },
        { name: "Thống Nhất", type: "Huyện" }, { name: "Cẩm Mỹ", type: "Huyện" }, { name: "Xuân Lộc", type: "Huyện" }
      ]
    },
    "Bình Dương": {
      total: 9,
      desc: "5 Thành phố, 4 Huyện",
      units: [
        { name: "Thủ Dầu Một", type: "Thành phố" }, { name: "Thuận An", type: "Thành phố" }, { name: "Dĩ An", type: "Thành phố" },
        { name: "Tân Uyên", type: "Thành phố" }, { name: "Bến Cát", type: "Thành phố" },
        { name: "Bắc Tân Uyên", type: "Huyện" }, { name: "Bàu Bàng", type: "Huyện" }, { name: "Dầu Tiếng", type: "Huyện" },
        { name: "Phú Giáo", type: "Huyện" }
      ]
    },
    "Kiên Giang": {
      total: 15,
      desc: "3 Thành phố, 12 Huyện (gồm TP. Phú Quốc & Kiên Hải)",
      units: [
        { name: "Rạch Giá", type: "Thành phố" }, { name: "Hà Tiên", type: "Thành phố" }, { name: "Phú Quốc", type: "Thành phố đảo" },
        { name: "Kiên Hải", type: "Huyện đảo" }, { name: "An Biên", type: "Huyện" }, { name: "An Minh", type: "Huyện" },
        { name: "Châu Thành", type: "Huyện" }, { name: "Giang Thành", type: "Huyện" }, { name: "Giồng Riềng", type: "Huyện" },
        { name: "Gò Quao", type: "Huyện" }, { name: "Hòn Đất", type: "Huyện" }, { name: "Kiên Lương", type: "Huyện" },
        { name: "Tân Hiệp", type: "Huyện" }, { name: "U Minh Thượng", type: "Huyện" }, { name: "Vĩnh Thuận", type: "Huyện" }
      ]
    },
    "Nghệ An": {
      total: 21,
      desc: "1 Thành phố, 3 Thị xã, 17 Huyện (tỉnh rộng nhất nước)",
      units: [
        { name: "Vinh", type: "Thành phố" }, { name: "Cửa Lò", type: "Thị xã" }, { name: "Thái Hòa", type: "Thị xã" }, { name: "Hoàng Mai", type: "Thị xã" },
        { name: "Diễn Châu", type: "Huyện" }, { name: "Quỳnh Lưu", type: "Huyện" }, { name: "Yên Thành", type: "Huyện" },
        { name: "Đô Lương", type: "Huyện" }, { name: "Nghi Lộc", type: "Huyện" }, { name: "Hưng Nguyên", type: "Huyện" },
        { name: "Nam Đàn", type: "Huyện" }, { name: "Thanh Chương", type: "Huyện" }, { name: "Tân Kỳ", type: "Huyện" },
        { name: "Anh Sơn", type: "Huyện" }, { name: "Con Cuông", type: "Huyện" }, { name: "Tương Dương", type: "Huyện" },
        { name: "Kỳ Sơn", type: "Huyện" }, { name: "Quỳ Hợp", type: "Huyện" }, { name: "Quỳ Châu", type: "Huyện" },
        { name: "Quế Phong", type: "Huyện" }, { name: "Nghĩa Đàn", type: "Huyện" }
      ]
    },
    "Lâm Đồng": {
      total: 12,
      desc: "2 Thành phố, 10 Huyện",
      units: [
        { name: "Đà Lạt", type: "Thành phố" }, { name: "Bảo Lộc", type: "Thành phố" },
        { name: "Lạc Dương", type: "Huyện" }, { name: "Đơn Dương", type: "Huyện" }, { name: "Đức Trọng", type: "Huyện" },
        { name: "Lâm Hà", type: "Huyện" }, { name: "Bảo Lâm", type: "Huyện" }, { name: "Di Linh", type: "Huyện" },
        { name: "Đạ Huoai", type: "Huyện" }, { name: "Đạ Tẻh", type: "Huyện" }, { name: "Cát Tiên", type: "Huyện" },
        { name: "Đam Rông", type: "Huyện" }
      ]
    },
    "Đắk Lắk": {
      total: 15,
      desc: "1 Thành phố, 1 Thị xã, 13 Huyện (thủ phủ cà phê)",
      units: [
        { name: "Buôn Ma Thuột", type: "Thành phố" }, { name: "Buôn Hồ", type: "Thị xã" },
        { name: "Ea H'leo", type: "Huyện" }, { name: "Ea Súp", type: "Huyện" }, { name: "Krông Năng", type: "Huyện" },
        { name: "Krông Búk", type: "Huyện" }, { name: "Buôn Đôn", type: "Huyện" }, { name: "Cư M'gar", type: "Huyện" },
        { name: "Ea Kar", type: "Huyện" }, { name: "M'Drắk", type: "Huyện" }, { name: "Krông Pắc", type: "Huyện" },
        { name: "Krông Ana", type: "Huyện" }, { name: "Krông Bông", type: "Huyện" }, { name: "Lắk", type: "Huyện" },
        { name: "Cư Kuin", type: "Huyện" }
      ]
    }
  };

  // Ký hiệu Khoáng sản chuẩn Atlat GD, tr.13
  // Ký hiệu Khoáng sản chuẩn Atlat GD, tr.3 & tr.13
  function getMineralSvg(symbolType) {
    switch (symbolType) {
      case "coal":
      case "square_black":
        return `<svg width="20" height="20" viewBox="0 0 20 20" class="atlat-vector-icon"><rect x="2" y="2" width="16" height="16" fill="#0F172A" stroke="#FFFFFF" stroke-width="1.5"/></svg>`;
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
      case "square_a":
      case "inverted_v":
        // Atlat GD tr.3: Hình vuông viền đen chữ A
        return `<svg width="20" height="20" viewBox="0 0 20 20" class="atlat-vector-icon"><rect x="2" y="2" width="16" height="16" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/><text x="10" y="15" font-size="12" font-weight="900" text-anchor="middle" fill="#0F172A" font-family="sans-serif">A</text></svg>`;
      case "bauxite":
      case "square_al":
      case "al_symbol":
        // Atlat GD tr.3: Hình vuông viền đen chữ Al
        return `<svg width="20" height="20" viewBox="0 0 20 20" class="atlat-vector-icon"><rect x="2" y="2" width="16" height="16" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/><text x="10" y="14" font-size="9.5" font-weight="900" text-anchor="middle" fill="#0F172A" font-family="sans-serif">Al</text></svg>`;
      case "tin":
      case "rhombus_black_flat":
      case "sn_symbol":
        // Atlat GD tr.3: Hình thoi đen dẹt
        return `<svg width="22" height="20" viewBox="0 0 22 20" class="atlat-vector-icon"><polygon points="11,4 21,10 11,16 1,10" fill="#0F172A" stroke="#FFFFFF" stroke-width="1.2"/></svg>`;
      case "chromium":
      case "square_hourglass":
      case "cr_symbol":
        // Atlat GD tr.3: Hình vuông có hình đồng hồ cát
        return `<svg width="20" height="20" viewBox="0 0 20 20" class="atlat-vector-icon"><rect x="2" y="2" width="16" height="16" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/><polygon points="3,3 17,17 3,17 17,3" fill="#0F172A"/></svg>`;
      case "titan":
      case "rhombus_half":
      case "ti_symbol":
        // Atlat GD tr.3: Hình thoi nửa trắng nửa đen
        return `<svg width="20" height="20" viewBox="0 0 20 20" class="atlat-vector-icon"><polygon points="10,2 18,10 10,18 2,10" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8"/><polygon points="2,10 10,2 18,10" fill="#0F172A"/></svg>`;
      default:
        return `<svg width="18" height="18" viewBox="0 0 20 20" class="atlat-vector-icon"><circle cx="10" cy="10" r="7" fill="#64748B" stroke="#FFFFFF" stroke-width="1.5"/></svg>`;
    }
  }

  // Ký hiệu Năng lượng chuẩn Atlat GD, tr.3 & tr.23: Ngôi sao (Đỏ: Nhiệt điện, Xanh lam: Thủy điện, Xanh lá: Gió, Cam: Mặt trời)
  function getPowerSvg(plantType, capacityGroup) {
    const raw = (plantType || "").toString().toLowerCase();
    let color = "#0284C7"; // Mặc định Thủy điện: Xanh lam
    if (raw.includes("nhiệt") || raw.includes("nhiet")) color = "#DC2626"; // Đỏ (Nhiệt điện)
    else if (raw.includes("gió") || raw.includes("gio")) color = "#16A34A"; // Xanh lá (Điện gió)
    else if (raw.includes("mặt trời") || raw.includes("mat troi")) color = "#EA580C"; // Cam (Điện mặt trời)
    else color = "#0284C7"; // Thủy điện: Xanh lam

    const isLarge = (capacityGroup === "Trên 1.000 MW" || capacityGroup === "tren_1000mw" || (typeof capacityGroup === "number" && capacityGroup >= 1000));
    const size = isLarge ? 26 : 18;

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" class="atlat-vector-icon inline-block">
        <polygon points="12,1 15.3,8.3 23.3,9.2 17.3,14.6 19.1,22.5 12,18.4 4.9,22.5 6.7,14.6 0.7,9.2 8.7,8.3" fill="${color}" stroke="#FFFFFF" stroke-width="1.5"/>
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

  const VIETNAM_FULL_BOUNDS = [[6.5, 102.0], [23.6, 117.5]];
  function fitVietnamBounds(options = {}) {
    if (!map) return;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const padding = isMobile ? [8, 8] : [24, 24];
    map.fitBounds(VIETNAM_FULL_BOUNDS, { padding, ...options });
  }

  function init() {
    const mapEl = document.getElementById("atlas-map");
    if (!mapEl) return;

    map = L.map("atlas-map", {
      center: [16.2, 107.5],
      zoom: 5.5,
      minZoom: 4,
      maxZoom: 14,
      maxBounds: [[4.0, 99.0], [25.0, 122.0]],
      maxBoundsViscosity: 0.85,
      zoomControl: false,
      attributionControl: true
    });

    L.control.zoom({ position: "topleft" }).addTo(map);

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
    layerSovereigntyIslands = L.layerGroup().addTo(map);
    layerTopography = L.layerGroup();
    layerClimate = L.layerGroup();
    layerAgriculture = L.layerGroup();
    layerMineralsPower = L.layerGroup();
    layerIndustrial = L.layerGroup();
    layerTransportation = L.layerGroup();
    layerMeasure = L.layerGroup().addTo(map);

    // Lập lưới kinh vĩ tuyến (Graticule)
    setupGraticule();

    // Mặc định dùng nền Atlat Vector Thuần
    setBaseMap("vector");
    initAtlatPages();

    // Khẳng định chủ quyền biển đảo (duy nhất 1 nhãn sạch cho mỗi quần đảo)
    addSovereigntyDemarcation();
    // Đường cơ sở A0-A24 nạp từ public/data/baseline.geojson (fetch → fallback lười)
    ensureLayerData("baseline").then(() => renderBaselineLayer()).catch(() => renderBaselineLayer());
    // Cập nhật lớp nhãn đường cơ sở theo mức zoom (A12-A24 chỉ hiện nhãn chữ khi zoom >= 8)
    map.on("zoomend", () => {
      const container = map.getContainer();
      if (container) {
        container.classList.toggle("zoom-dense-baseline", map.getZoom() >= 8);
      }
    });

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

    // Zoom listener: tự động mở rộng cỡ chữ/ký hiệu địa danh theo độ phóng to, bật nhãn tỉnh khi zoom >= 5, co giãn bán kính công nghiệp
    function updateCartoZoomScale() {
      if (!map) return;
      const z = map.getZoom();
      // Phóng to bản đồ -> Chữ và ký hiệu địa danh tự động to dần theo độ zoom, không bị teo nhỏ
      // Overview z=5.5 -> scale=1.0. Khi phóng to z=7 -> 1.45, z=8 -> 1.75, z=9 -> 2.05, z=10+ -> 2.35 (max 2.6)
      const scale = Math.min(2.6, Math.max(0.85, 1.0 + (z - 5.5) * 0.3));
      const mapEl = document.getElementById("atlas-map");
      if (mapEl) {
        mapEl.style.setProperty("--carto-zoom-scale", scale.toFixed(2));
      }
    }

    map.on("zoom", updateCartoZoomScale);
    map.on("zoomend", () => {
      updateCartoZoomScale();
      updateProvinceLabelsVisibility();
      if (activeLayers.industrial) {
        renderIndustrialCenters();
      }
    });
    updateCartoZoomScale();

    loadData();
    // BUG-08: Đảm bảo toàn bộ lãnh thổ gồm Hoàng Sa & Trường Sa luôn nằm trọn trong khung nhìn
    setTimeout(() => {
      fitVietnamBounds();
    }, 100);
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

  // Chuyển đổi 4 Chuyên Đề Bản Đồ Tự Vẽ 100% Theo Chuẩn Atlat (Không Dùng Bất Kỳ API Ngoài Nào)
  function setAtlatTheme(theme) {
    if (!map) return;
    // Chuẩn hoá theme: admin, physical, climate, economic
    if (theme === "vector" || theme === "osm") theme = "admin";
    if (theme === "satellite") theme = "economic";
    currentBaseMapMode = theme;

    const mapContainer = document.getElementById("atlas-map");
    if (mapContainer) mapContainer.classList.add("atlat-pure-vector");
    if (layerGraticule && !map.hasLayer(layerGraticule)) map.addLayer(layerGraticule);

    // Xoá hoàn toàn tile nếu còn sót lại (bảo đảm 0 API ngoài)
    if (currentBaseMapTile && map.hasLayer(currentBaseMapTile)) {
      map.removeLayer(currentBaseMapTile);
      currentBaseMapTile = null;
    }

    // Đóng toàn bộ popup đang mở dở để không che khuất bản đồ
    map.closePopup();

    // Hiển thị/ẩn chú giải phân tầng độ cao
    const elevLegend = document.getElementById("elevation-legend");
    if (elevLegend) {
      if (theme === "physical") elevLegend.classList.remove("hidden");
      else elevLegend.classList.add("hidden");
    }

    // TẮT TOÀN BỘ CÁC LỚP KHÔNG THUỘC CHUYÊN ĐỀ ĐỂ TRÁNH RÁC VÀ ĐÈ NHAU
    function setSubLayer(layerObj, chkId, isVis) {
      if (!layerObj) return;
      if (isVis) {
        if (!map.hasLayer(layerObj)) map.addLayer(layerObj);
      } else {
        if (map.hasLayer(layerObj)) map.removeLayer(layerObj);
      }
      activeLayers[chkId.replace("layer-chk-", "")] = isVis;
      const chk = document.getElementById(chkId);
      if (chk) chk.checked = isVis;
    }

    if (theme === "physical") {
      setSubLayer(layerClimate, "layer-chk-climate", false);
      setSubLayer(layerIndustrial, "layer-chk-industrial", false);
      setSubLayer(layerMineralsPower, "layer-chk-minerals_power", false);
      setSubLayer(layerAgriculture, "layer-chk-agriculture", false);
      setSubLayer(layerTransportation, "layer-chk-transportation", false);
      setSubLayer(layerTopography, "layer-chk-topography", true);
      ensureLayerData("topography").then(() => renderTopographyLayer());
    } else if (theme === "climate") {
      setSubLayer(layerTopography, "layer-chk-topography", false);
      setSubLayer(layerIndustrial, "layer-chk-industrial", false);
      setSubLayer(layerMineralsPower, "layer-chk-minerals_power", false);
      setSubLayer(layerAgriculture, "layer-chk-agriculture", false);
      setSubLayer(layerTransportation, "layer-chk-transportation", false);
      setSubLayer(layerClimate, "layer-chk-climate", true);
      ensureLayerData("climate").then(() => renderClimateLayer());
    } else if (theme === "economic") {
      setSubLayer(layerTopography, "layer-chk-topography", false);
      setSubLayer(layerClimate, "layer-chk-climate", false);
      setSubLayer(layerAgriculture, "layer-chk-agriculture", false);
      setSubLayer(layerTransportation, "layer-chk-transportation", false);
      setSubLayer(layerIndustrial, "layer-chk-industrial", true);
      setSubLayer(layerMineralsPower, "layer-chk-minerals_power", true);
      Promise.all([ensureLayerData("industrial"), ensureLayerData("power")]).then(() => {
        renderIndustrialCenters();
        renderMineralsPowerLayer();
      });
    } else if (theme === "admin") {
      setSubLayer(layerTopography, "layer-chk-topography", false);
      setSubLayer(layerClimate, "layer-chk-climate", false);
      setSubLayer(layerIndustrial, "layer-chk-industrial", false);
      setSubLayer(layerMineralsPower, "layer-chk-minerals_power", false);
      setSubLayer(layerAgriculture, "layer-chk-agriculture", false);
      setSubLayer(layerTransportation, "layer-chk-transportation", false);
      setSubLayer(layerProvinces, "layer-chk-provinces", true);
    }

    // Cập nhật giao diện nút chọn Chuyên đề
    ['admin', 'physical', 'climate', 'economic'].forEach(k => {
      const btn = document.getElementById(`btn-bm-${k}`);
      if (btn) {
        if (k === theme) {
          btn.className = "px-2.5 py-1 rounded-md bg-blue-600 text-white font-bold transition shadow-sm";
        } else {
          btn.className = "px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium";
        }
      }
    });

    // Hỗ trợ nút legacy
    ['vector', 'osm', 'satellite'].forEach(k => {
      const btn = document.getElementById(`btn-bm-${k}`);
      if (btn) {
        btn.className = "px-2.5 py-1 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition font-medium";
      }
    });

    renderProvinces(currentRegionFilter);
    updateDynamicLegend();
  }

  // Alias để tương thích ngược 100%
  const setBaseMap = setAtlatTheme;

  // Nhãn chủ quyền duy nhất cho Hoàng Sa & Trường Sa
  function addSovereigntyDemarcation() {
    // Biển Đông
    const seaIcon = L.divIcon({
      className: "sea-label",
      html: `<div class="text-blue-900/40 dark:text-blue-200/30 font-bold text-sm select-none pointer-events-none" style="font-family: var(--font-sans); letter-spacing: 0;">BIỂN ĐÔNG</div>`,
      iconSize: [180, 24],
      iconAnchor: [90, 12]
    });
    L.marker([14.5, 113.2], { icon: seaIcon, interactive: false }).addTo(map);

    // Khung nét đứt ranh giới hành chính Atlat GD tr.4-5 (Không có nền tô / fill: false)
    L.polygon([[15.6, 111.0], [17.2, 111.0], [17.2, 113.2], [15.6, 113.2]], {
      fill: false,
      color: "#DC2626",
      weight: 1.2,
      dashArray: "5, 5",
      opacity: 0.6,
      interactive: false
    }).addTo(map);

    L.polygon([[6.5, 111.2], [11.8, 111.2], [11.8, 117.2], [6.5, 117.2]], {
      fill: false,
      color: "#DC2626",
      weight: 1.2,
      dashArray: "5, 5",
      opacity: 0.6,
      interactive: false
    }).addTo(map);

    // Hoàng Sa (BUG-08: Chuẩn nhãn Atlat GD tr.4-5, 2 dòng gọn gàng không tràn màn hình)
    const hsIcon = L.divIcon({
      className: "hs-marker-wrapper",
      html: `
        <div class="carto-sovereignty-label cursor-pointer select-none text-center">
          <div class="font-bold text-red-700 dark:text-red-400 text-xs" style="font-family: var(--font-sans); letter-spacing: 0; text-shadow: 0 0 4px #ffffff, 0 0 8px #ffffff;">Q.Đ. HOÀNG SA</div>
          <div class="text-[9px] text-blue-900 dark:text-blue-200 font-bold" style="font-family: var(--font-sans); letter-spacing: 0; text-shadow: 0 0 3px #ffffff, 0 0 6px #ffffff;">(TP. Đà Nẵng)</div>
        </div>
      `,
      iconSize: [140, 30],
      iconAnchor: [70, 15],
      popupAnchor: [0, -15]
    });
    const hs = L.marker([16.5, 112.0], { pane: 'pointMarkerPane', icon: hsIcon }).addTo(map);
    hs.bindPopup(`
      <div class="p-3 bg-white dark:bg-slate-900 rounded-xl min-w-[260px]">
        <div class="flex items-center space-x-2 text-red-600 font-bold text-xs mb-1">
          <span>🇻🇳</span>
          <h4>Quần đảo Hoàng Sa (Đặc khu Hoàng Sa - TP. Đà Nẵng - Việt Nam)</h4>
        </div>
        <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Đơn vị hành chính: <strong>Đặc khu Hoàng Sa, TP. Đà Nẵng</strong>. Vùng biển có vị trí chiến lược và tiềm năng ngư trường lớn của Tổ quốc.
        </p>
        <div class="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400">Tham chiếu: Atlat GD, tr.4-5</div>
      </div>
    `);

    // Trường Sa (BUG-08: Chuẩn nhãn Atlat GD tr.4-5, 2 dòng gọn gàng không tràn màn hình)
    const tsIcon = L.divIcon({
      className: "ts-marker-wrapper",
      html: `
        <div class="carto-sovereignty-label cursor-pointer select-none text-center">
          <div class="font-bold text-red-700 dark:text-red-400 text-xs" style="font-family: var(--font-sans); letter-spacing: 0; text-shadow: 0 0 4px #ffffff, 0 0 8px #ffffff;">Q.Đ. TRƯỜNG SA</div>
          <div class="text-[9px] text-blue-900 dark:text-blue-200 font-bold" style="font-family: var(--font-sans); letter-spacing: 0; text-shadow: 0 0 3px #ffffff, 0 0 6px #ffffff;">(T. Khánh Hoà)</div>
        </div>
      `,
      iconSize: [140, 30],
      iconAnchor: [70, 15],
      popupAnchor: [0, -15]
    });
    const ts = L.marker([10.0, 114.2], { pane: 'pointMarkerPane', icon: tsIcon }).addTo(map);
    ts.bindPopup(`
      <div class="p-3 bg-white dark:bg-slate-900 rounded-xl min-w-[260px]">
        <div class="flex items-center space-x-2 text-red-600 font-bold text-xs mb-1">
          <span>🇻🇳</span>
          <h4>Quần đảo Trường Sa (Đặc khu Trường Sa - Tỉnh Khánh Hoà - Việt Nam)</h4>
        </div>
        <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Đơn vị hành chính: <strong>Đặc khu Trường Sa, Tỉnh Khánh Hoà</strong>. Điểm tựa vững chắc phát triển kinh tế biển đảo của Tổ quốc.
        </p>
        <div class="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400">Tham chiếu: Atlat GD, tr.4-5</div>
      </div>
    `);
  }

  // Lớp Đường cơ sở biển A1 - A11 (Tuyên bố 12/11/1982, Atlat GD, tr.7 & 9)
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
        const codeNum = parseInt(String(p.code || "").replace(/\D/g, "")) || 0;
        const isDensePoint = codeNum >= 12 && codeNum <= 24;
        const icon = L.divIcon({
          className: `atlat-baseline-point-marker ${isDensePoint ? 'baseline-dense' : ''}`,
          html: `
            <div class="carto-baseline-point flex items-center space-x-1 select-none pointer-events-none" style="transform: translate(-3px, -3px);">
              <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#ffffff" stroke="#dc2626" stroke-width="1.5"/></svg>
              <span class="baseline-label-text font-mono text-[9px] font-bold text-red-600" style="text-shadow: 0 0 3px #ffffff, 0 0 6px #ffffff;">${p.code}</span>
            </div>
          `,
          iconSize: isDensePoint ? [10, 10] : [35, 14],
          iconAnchor: isDensePoint ? [5, 5] : [4, 4],
          popupAnchor: [0, -6]
        });
        return L.marker(latlng, { icon });
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        if (feature.geometry.type === 'LineString') {
          layer.bindTooltip(`
            <div class="p-1 font-sans">
              <div class="font-bold text-xs text-red-600">🇻🇳 Đường cơ sở bờ biển Việt Nam</div>
              <div class="text-[10px] text-slate-500">Nối liền các mốc từ A1 (Hòn Nhạn, Kiên Giang) qua đảo Cồn Cỏ (A11) đến Mũi Trà Cổ (A24, Quảng Ninh) theo chuẩn Atlat GD</div>
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
              <div class="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400">Tham chiếu: Atlat GD, tr.7 & 9</div>
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

        // B-13: bản dự phòng NẠP LƯỜI — chỉ tải khi fetch thật sự thất bại,
        // không chiếm critical path lúc tải trang ban đầu.
        if (!window.GEO_ATLAS_FALLBACK_DATA && !window.__fallbackLoading) {
          window.__fallbackLoading = new Promise((resolve) => {
            const s = document.createElement("script");
            s.src = "./js/fallback-store.js";
            s.onload = () => resolve(true);
            s.onerror = () => resolve(false);
            document.head.appendChild(s);
          });
        }
        if (window.__fallbackLoading) {
          try { await window.__fallbackLoading; } catch (e) { /* bỏ qua */ }
        }

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

    if (mode === "34") {
      if (btn34) btn34.className = "px-2.5 py-1.5 rounded-md font-bold transition text-center flex items-center justify-center space-x-1 bg-blue-600 text-white shadow-sm";
      if (btn63) btn63.className = "px-2.5 py-1.5 rounded-md font-semibold transition text-center flex items-center justify-center space-x-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
      if (badge) {
        badge.innerText = "34 Đơn Vị (Chuẩn Atlat GD, tr.4-5)";
        badge.className = "text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300";
      }
      if (hint) {
        hint.innerText = "Chuẩn Atlat GD 2026, tr.4-5 (Bảng diện tích, dân số 34 đơn vị hành chính; ranh giới tổng hợp nội suy).";
      }
    } else {
      if (btn63) btn63.className = "px-2.5 py-1.5 rounded-md font-bold transition text-center flex items-center justify-center space-x-1 bg-slate-700 text-white shadow-sm";
      if (btn34) btn34.className = "px-2.5 py-1.5 rounded-md font-semibold transition text-center flex items-center justify-center space-x-1 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800";
      if (badge) {
        badge.innerText = "63 Tỉnh / Thành (Trước 01/7/2025 - Tham khảo)";
        badge.className = "text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
      }
      if (hint) {
        hint.innerText = "Ranh giới trước 01/7/2025 (Nguồn tham khảo: geoBoundaries CC-BY). Bấm vào tỉnh để xem số liệu.";
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
  // LỚP 1: HÀNH CHÍNH & VÙNG KINH TẾ (Atlat GD, tr.4-5) - Spotlight Focus & Choropleth
  // ===========================================================================
  function setChoroplethMode(mode) {
    currentChoroplethMode = mode;
    const selectEl = document.getElementById("choropleth-select");
    if (selectEl && selectEl.value !== mode) {
      selectEl.value = mode;
    }
    renderProvinces(currentRegionFilter);
    updateChoroplethLegend();
  }

  function updateChoroplethLegend() {
    let legend = document.getElementById("choropleth-legend");
    if (!legend) {
      const mapContainer = document.getElementById("atlas-map-container");
      if (!mapContainer) return;
      legend = document.createElement("div");
      legend.id = "choropleth-legend";
      legend.className = "absolute bottom-8 left-3 z-[890] hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-[10px] font-sans max-w-[280px]";
      mapContainer.appendChild(legend);
    }

    if (currentChoroplethMode === "none" || !CHOROPLETH_PALETTES[currentChoroplethMode]) {
      legend.classList.add("hidden");
      return;
    }

    const pal = CHOROPLETH_PALETTES[currentChoroplethMode];
    legend.classList.remove("hidden");
    legend.innerHTML = `
      <div class="flex items-center justify-between font-bold text-[11px] text-slate-800 dark:text-slate-200 mb-1.5 pb-1 border-b border-slate-200 dark:border-slate-700">
        <span class="flex items-center space-x-1">
          <span>🎨</span>
          <span>${pal.title}</span>
        </span>
        <button onclick="AtlasEngine.setChoroplethMode('none')" class="text-rose-500 hover:text-rose-700 text-[10px] font-bold ml-2">✕ Tắt</button>
      </div>
      <div class="text-[9px] text-blue-600 dark:text-blue-400 font-semibold mb-1">${pal.source}</div>
      <div class="space-y-1">
        ${pal.ranges.map(r => `
          <div class="flex items-center space-x-2">
            <span class="w-3.5 h-3 rounded-xs inline-block shrink-0 border border-black/10" style="background:${r.color}"></span>
            <span class="truncate">${r.label}</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  function isProvinceInRegion(p, filterRegion) {
    if (!filterRegion || filterRegion === "all") return true;

    const regName = p.region_name || p.region || "";
    const regId = String(p.region_id || "");

    // 1. So sánh chính xác
    if (regName === filterRegion) return true;

    // 2. Chuẩn hoá chuỗi đối sánh (loại bỏ I., IV., ký tự &, khoảng trắng)
    const normFilter = normalizeVN(filterRegion).replace(/^[ivx]+\.\s*/i, "").replace(/&/g, "va").trim();
    const normReg = normalizeVN(regName).replace(/^[ivx]+\.\s*/i, "").replace(/&/g, "va").trim();

    if (normFilter === normReg) return true;

    // VÙNG I: Trung du và miền núi phía Bắc / Bắc Bộ
    if (normFilter.includes("trung du") && (normReg.includes("trung du") || regId === "1")) return true;

    // VÙNG II: Đồng bằng sông Hồng
    if (normFilter.includes("song hong") && (normReg.includes("song hong") || regId === "2")) return true;

    // VÙNG III: Bắc Trung Bộ
    if (normFilter === "bac trung bo" && (normReg === "bac trung bo" || regId === "3")) return true;

    // VÙNG IV: Duyên hải Nam Trung Bộ và Tây Nguyên (Atlat GD, tr.4-5 & tr.18)
    const isFilterVung4 = normFilter.includes("duyen hai nam trung bo va tay nguyen") || 
                          normFilter.includes("duyen hai nam trung bo & tay nguyen") ||
                          normFilter === "duyen hai nam trung bo" || 
                          normFilter === "tay nguyen" ||
                          normFilter.includes("nam trung bo") ||
                          filterRegion.includes("IV.");

    if (isFilterVung4) {
      if (regId === "4") return true;
      if (normReg.includes("nam trung bo") || normReg.includes("tay nguyen")) return true;
      if (["Đà Nẵng", "Quảng Ngãi", "Gia Lai", "Đắk Lắk", "Khánh Hoà", "Lâm Đồng", "Hoàng Sa", "Trường Sa"].some(k => (p.name || "").includes(k))) return true;
    }

    // VÙNG V: Đông Nam Bộ
    if (normFilter.includes("dong nam bo") && (normReg.includes("dong nam bo") || regId === "5")) return true;

    // VÙNG VI: Đồng bằng sông Cửu Long
    if (normFilter.includes("cuu long") && (normReg.includes("cuu long") || regId === "6")) return true;

    // Hỗ trợ trường hợp gộp Bắc Trung Bộ & Duyên hải miền Trung
    if (normFilter.includes("duyen hai mien trung") && (normReg.includes("bac trung bo") || normReg.includes("nam trung bo"))) return true;

    return false;
  }

  function checkIsCity(p) {
    if (!p) return false;
    return p.administrative_type === "Thành phố trực thuộc Trung ương" || 
           (p.name && (p.name.startsWith("Thành phố") || p.name === "Đồng Nai" || p.name === "Hà Nội" || p.name === "TP. Hồ Chí Minh" || p.name === "Hải Phòng" || p.name === "Đà Nẵng" || p.name === "Cần Thơ" || p.name === "Huế" || p.name === "Quảng Ninh" || p.name === "Bắc Ninh"));
  }

  function renderProvinces(filterRegion = "all") {
    if (!geoData.provinces) return;
    currentRegionFilter = filterRegion;
    layerProvinces.clearLayers();
    layerProvinceLabels.clearLayers();
    if (layerSovereigntyIslands) {
      layerSovereigntyIslands.clearLayers();
    }

    let matchedLayers = [];
    const mainlandFeatures = geoData.provinces.features.filter(f => !f.properties.is_special_island);
    const islandFeatures = geoData.provinces.features.filter(f => !!f.properties.is_special_island);

    // 1. Mainland provinces (toggleable & spotlight filterable)
    let mainlandGeoJson = null;
    mainlandGeoJson = L.geoJSON({ type: "FeatureCollection", features: mainlandFeatures }, {
      pane: 'polygonBoundaryPane',
      style: (f) => {
        const p = f.properties;
        let color;
        if (currentChoroplethMode !== "none" && CHOROPLETH_PALETTES[currentChoroplethMode]) {
          const pal = CHOROPLETH_PALETTES[currentChoroplethMode];
          const val = pal.getValue(p);
          const matched = pal.ranges.find(r => val <= r.max) || pal.ranges[pal.ranges.length - 1];
          color = matched.color;
        } else if (currentBaseMapMode === "physical") {
          const elevKey = PROVINCE_ELEVATION[p.name] || (p.region_name === "Tây Nguyên" ? "plateau" : "plain_low");
          color = ELEVATION_COLORS[elevKey] || "#86efac";
        } else if (currentBaseMapMode === "climate") {
          const isNorth = p.region_name === "Trung du và miền núi phía Bắc" || 
                          p.region_name === "Trung du và miền núi Bắc Bộ" || 
                          p.region_name === "Đồng bằng sông Hồng" || 
                          p.region_name === "Bắc Trung Bộ";
          color = isNorth ? "#7dd3fc" : "#fdba74";
        } else if (currentBaseMapMode === "economic") {
          color = "#e2e8f0";
        } else {
          color = REGION_COLORS[p.region_name] || "#94a3b8";
        }

        const isCity = checkIsCity(p);
        const isMatch = isProvinceInRegion(p, filterRegion);

        const isChoroplethActive = currentChoroplethMode !== "none";
        const baseFillOpacity = isChoroplethActive ? 0.85 : ((currentBaseMapMode === "physical" || currentBaseMapMode === "climate") ? 0.8 : (filterRegion === "all" ? currentOpacity : 0.85));

        if (isMatch) {
          const isPhysical = currentBaseMapMode === "physical";
          return {
            fillColor: color,
            weight: isPhysical ? 0.75 : (isCity ? 2.2 : (filterRegion !== "all" ? 2 : 1)),
            opacity: isPhysical ? 0.45 : 0.95,
            dashArray: isPhysical ? "3, 3" : null,
            color: isPhysical ? "#475569" : (isCity ? "#1d4ed8" : "#ffffff"),
            fillOpacity: isPhysical ? 0.55 : baseFillOpacity
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
        const isMatch = isProvinceInRegion(p, filterRegion);

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
            try { layer.openTooltip(); } catch (err) {}
          },
          mouseout: (e) => {
            try { layer.closeTooltip(); } catch (err) {}
            if (mainlandGeoJson && typeof mainlandGeoJson.resetStyle === 'function') {
              try { mainlandGeoJson.resetStyle(e.target); } catch (err) {}
            }
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

        let choroplethBadge = '';
        if (currentChoroplethMode === "density") {
          choroplethBadge = `<div class="text-[10px] text-rose-600 dark:text-rose-400 font-bold mt-0.5">👥 Mật độ: ${Number(p.density).toLocaleString()} ng/km²</div>`;
        } else if (currentChoroplethMode === "grdp") {
          // B-05: ưu tiên lookup chuẩn hoá tên; chỉ dùng p.grdp khi là giá trị thật (khác placeholder 100)
          const rawGrdp = Number(p.grdp);
          const grdpVal = GRDP_NORM_LOOKUP[normalizeVN(stripProvincePrefix(p.name))] || (rawGrdp > 0 && rawGrdp !== 100 ? rawGrdp : null);
          choroplethBadge = grdpVal != null
            ? `<div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">💰 GRDP: ${formatVNNum(grdpVal)} nghìn tỉ đồng</div>`
            : `<div class="text-[10px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">💰 GRDP: Chưa có số liệu 34 đơn vị mới</div>`;
        } else if (currentChoroplethMode === "area") {
          choroplethBadge = `<div class="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">📐 Diện tích: ${Number(p.area).toLocaleString()} km²</div>`;
        }

        const isCity = checkIsCity(p);
        const iconType = isCity ? '🏛️' : '📍';
        layer.bindTooltip(`
          <div class="p-1 text-left font-sans">
            <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1">
              <span>${iconType}</span>
              <span>${p.name}</span>
            </div>
            <div class="text-[10px] text-slate-500 dark:text-slate-300 font-medium">${p.region_name || ''}</div>
            ${choroplethBadge}
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
          let center = null;
          if (p.name === "Khánh Hoà" || p.name === "Tỉnh Khánh Hoà") {
            center = L.latLng(12.25, 109.19); // Đặt đúng trung tâm Nha Trang / đất liền Khánh Hòa, không bị trôi ra Trường Sa
          } else if (p.name === "Thành phố Đà Nẵng") {
            center = L.latLng(15.98, 108.05); // Đặt đúng trung tâm đất liền Đà Nẵng - Quảng Nam
          } else {
            center = layer.getBounds().getCenter();
          }
          if (center && p.name && !p.is_special_island) {
            const labelMarker = L.marker(center, {
              pane: 'labelPane',
              icon: L.divIcon({
                className: 'province-clean-label-marker',
                html: `<div class="province-clean-label text-[10px] font-bold text-slate-800 dark:text-slate-100 drop-shadow-sm select-none pointer-events-none">${stripProvincePrefix(p.name)}</div>`,
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

    // 2. Quần đảo Hoàng Sa & Trường Sa (BẤT BIẾN, KHÔNG BỊ DIM, KHÔNG BỊ ẨN KHI TẮT LỚP 1)
    if (layerSovereigntyIslands && islandFeatures.length > 0) {
      let sovereigntyGeoJson = null;
      sovereigntyGeoJson = L.geoJSON({ type: "FeatureCollection", features: islandFeatures }, {
        pane: 'polygonBoundaryPane',
        style: () => ({
          fillColor: "#DC2626",
          weight: 2,
          opacity: 1.0,
          color: "#B91C1C",
          fillOpacity: 0.75
        }),
        onEachFeature: (feature, layer) => {
          const p = feature.properties;
          layer.on({
            mouseover: (e) => {
              e.target.setStyle({ weight: 3, color: "#991B1B", fillOpacity: 0.95 });
              try { layer.openTooltip(); } catch (err) {}
            },
            mouseout: (e) => {
              try { layer.closeTooltip(); } catch (err) {}
              if (sovereigntyGeoJson && typeof sovereigntyGeoJson.resetStyle === 'function') {
                try { sovereigntyGeoJson.resetStyle(e.target); } catch (err) {}
              }
            },
            click: () => {
              showDetailsPanel(p, "province");
            }
          });

          layer.bindTooltip(`
            <div class="p-1.5 text-left font-sans">
              <div class="font-bold text-xs text-red-600 dark:text-red-400 flex items-center space-x-1">
                <span>🇻🇳</span>
                <span>${p.name}</span>
              </div>
              <div class="text-[10px] text-slate-600 dark:text-slate-300 font-medium">${p.desc || 'Chủ quyền thiêng liêng của Tổ quốc'}</div>
              <div class="text-[9px] text-blue-600 font-bold mt-0.5">Trực thuộc: ${p.name.includes('Hoàng Sa') ? 'TP. Đà Nẵng' : 'Tỉnh Khánh Hoà'}</div>
            </div>
          `, { permanent: false, sticky: false, opacity: 0.95 });
        }
      }).addTo(layerSovereigntyIslands);
    }

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
    if (currentZoom >= 5) {
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
  // LỚP 2: ĐỊA HÌNH & SÔNG NGÒI (Atlat GD, tr.7 & tr.10)
  // ===========================================================================
  let currentTopoFilter = "all";

  async function renderTopographyLayer(categoryFilter = "all") {
    currentTopoFilter = categoryFilter;
    if (!geoData.topography) await ensureLayerData("topography");
    if (!geoData.topography) return;

    if (map && !map.hasLayer(layerTopography)) {
      map.addLayer(layerTopography);
      activeLayers["topography"] = true;
      const chk = document.getElementById("layer-chk-topography");
      if (chk) chk.checked = true;
    }

    layerTopography.clearLayers();

    L.geoJSON(geoData.topography, {
      pane: 'topographyPane',
      filter: (f) => {
        const p = f.properties || {};
        if (p.hidden) return false;
        if (categoryFilter === "all") return true;
        if (categoryFilter === "rivers") return p.category === "river_system" || p.category === "river";
        if (categoryFilter === "peaks") return p.category === "peak";
        if (categoryFilter === "mountains") return p.category === "mountain_range" || p.category === "mountain_arc";
        if (categoryFilter === "plateaus") return p.category === "plateau";
        return true;
      },
      pointToLayer: (feature, latlng) => {
        const p = feature.properties || {};
        if (p.category === "peak") {
          // Ký hiệu đỉnh núi chuẩn Atlat GD tr.3 & 7: Tam giác đen nhỏ ▲ kèm số độ cao
          const icon = L.divIcon({
            className: "peak-carto-marker",
            html: `
              <div class="carto-peak-label select-none cursor-pointer hover:scale-110 transition">
                <span class="text-black dark:text-white font-black text-[10px] leading-none drop-shadow-sm">▲</span>
                <span class="text-[10px] font-bold text-slate-900 dark:text-slate-100 font-sans tracking-tight whitespace-nowrap" style="text-shadow: 0 0 3px #ffffff, 0 0 6px #ffffff, 0 1px 2px rgba(255,255,255,0.9);">${p.name.replace('Đỉnh ', '')} <span class="font-mono text-[9px] text-amber-950 dark:text-amber-300 font-bold">${p.elevation_m}</span></span>
              </div>
            `,
            iconSize: [110, 18],
            iconAnchor: [6, 9]
          });
          return L.marker(latlng, { icon });
        } else if (p.category === "plateau") {
          // Nhãn cao nguyên chuẩn Atlat GD tr.7: Chữ in đậm màu nâu sẫm thanh lịch, KHÔNG HỘP CHỮ KHÔNG EMOJI
          const icon = L.divIcon({
            className: "plateau-carto-marker",
            html: `
              <div class="carto-plateau-label cursor-pointer select-none text-[11px] font-bold text-amber-950 dark:text-amber-200 tracking-tight whitespace-nowrap" style="text-shadow: 0 0 4px #ffffff, 0 0 8px #ffffff, 0 1px 3px rgba(255,255,255,0.95); font-family: var(--font-sans);">
                ${p.name.replace('Cao nguyên ', 'Cn. ')}
              </div>
            `,
            iconSize: [110, 18],
            iconAnchor: [55, 9]
          });
          return L.marker(latlng, { icon });
        }
        return L.marker(latlng);
      },
      style: (feature) => {
        const p = feature.properties || {};
        if (p.category === "river" || p.category === "river_system") {
          return {
            color: "#0284C7", // Sông chính: Xanh lam nước chuẩn Atlat tr.10
            weight: 3.5,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round"
          };
        } else if (p.category === "mountain_range" || p.category === "mountain_arc") {
          return {
            color: "#78350F",
            weight: 3.5,
            opacity: 0.8,
            dashArray: "6, 4"
          };
        }
        return { color: "#B45309", weight: 2 };
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        const isRiver = p.category === "river" || p.category === "river_system";

        if (isRiver) {
          layer.bindPopup(`
            <div class="p-3 bg-white dark:bg-slate-900 rounded-xl min-w-[250px] space-y-1.5 shadow-lg border border-sky-200 dark:border-sky-800">
              <div class="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span class="font-bold text-xs text-sky-700 dark:text-sky-300 flex items-center space-x-1">
                  <span>🌊</span> <span>${p.name}</span>
                </span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200 font-semibold">Sông chính</span>
              </div>
              <div class="text-[11px] space-y-1 text-slate-700 dark:text-slate-200 py-0.5">
                ${p.length_in_vn_km ? `<div>Chiều dài ở VN: <strong class="text-sky-600 font-mono">${p.length_in_vn_km} km</strong></div>` : ''}
                ${p.basin_area_vn_km2 ? `<div>Diện tích lưu vực ở VN: <strong class="text-blue-600 font-mono">${p.basin_area_vn_km2} km²</strong></div>` : ''}
                ${p.flow_volume_bil_m3 ? `<div>Tổng lượng dòng chảy: <strong class="text-cyan-600 font-mono">${p.flow_volume_bil_m3} tỉ m³</strong></div>` : ''}
              </div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight italic">${p.desc || ''}</p>
            </div>
          `);

          // Thêm nhãn sông nổi bật trên bản đồ
          const isMountain = p.category === "mountain_range" || p.category === "mountain_arc";
          if (isMountain && p.name) {
            // Nhãn chữ in hoa uốn lượn dọc sống núi theo chuẩn Atlat GD
            layer.bindTooltip(p.name.toUpperCase(), {
              permanent: true,
              direction: "center",
              className: "carto-mountain-label"
            });
          }

          const coords = feature.geometry?.coordinates;
          if (coords && coords.length >= 2) {
            const midIdx = Math.floor(coords.length * 0.45);
            const pt = coords[midIdx];
            if (pt && pt.length >= 2) {
              const shortRiverName = p.name.replace('Hệ thống sông ', 's. ').replace('Hệ thống ', 's. ').replace('Sông ', 's. ');
              const riverMarker = L.marker([pt[1], pt[0]], {
                pane: 'pointMarkerPane',
                icon: L.divIcon({
                  className: 'river-label-marker',
                  html: `<div class="carto-river-label cursor-pointer select-none text-[10px] font-bold italic text-sky-700 dark:text-sky-300 whitespace-nowrap hover:scale-110 transition" style="text-shadow: 0 0 3px #ffffff, 0 0 6px #ffffff;">${shortRiverName}</div>`,
                  iconSize: [90, 16],
                  iconAnchor: [45, 8]
                })
              });
              riverMarker.bindTooltip(`<strong>${p.name}</strong><br>${p.desc || ''}`, { permanent: false, sticky: false });
              riverMarker.on("click", () => showDetailsPanel(p, "topography"));
              layerTopography.addLayer(riverMarker);
            }
          }
        } else {
          layer.bindTooltip(`
            <div class="p-1 text-left">
              <div class="font-bold text-xs text-slate-900 dark:text-white">${p.name}</div>
              <div class="text-[10px] text-slate-500">${p.desc || ''}</div>
            </div>
          `, { permanent: false, sticky: false });
        }

        layer.on("click", () => showDetailsPanel(p, "topography"));
      }
    }).addTo(layerTopography);
  }

  // ===========================================================================
  // LỚP 3: KHÍ HẬU & THỦY VĂN (Atlat GD, tr.8 & 9) - Mũi tên Gió mùa SVG & Trạm Khí tượng
  // ===========================================================================
  // LỚP 3: KHÍ HẬU & THỦY VĂN (Atlat GD, tr.8, 9 & 10)
  // ===========================================================================
  let currentClimateFilter = "all";

  async function renderClimateLayer(categoryFilter = "all") {
    currentClimateFilter = categoryFilter;
    if (!geoData.climate) await ensureLayerData("climate");
    if (!geoData.climate) return;

    if (map && !map.hasLayer(layerClimate)) {
      map.addLayer(layerClimate);
      activeLayers["climate"] = true;
      const chk = document.getElementById("layer-chk-climate");
      if (chk) chk.checked = true;
    }

    layerClimate.clearLayers();

    const showMonsoonStorm = categoryFilter === "all" || categoryFilter === "monsoon_storm";

    if (showMonsoonStorm) {
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

      // 3. Gió tây khô nóng: Orange dashed arrows vượt Trường Sơn Bắc
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
        line.bindTooltip("Gió tây khô nóng: Khô nóng gay gắt ven biển miền Trung do hiệu ứng phơn vượt Trường Sơn Bắc (Atlat GD, tr.8 & DHQG, tr.3).", { permanent: false, sticky: false });
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
            html: `<div class="cursor-pointer select-none text-[9.5px] font-bold text-purple-800 dark:text-purple-300 whitespace-nowrap" style="text-shadow: 0 0 3px #ffffff, 0 0 6px #ffffff;">↗ ${st.month}</div>`,
            iconSize: [80, 16],
            iconAnchor: [40, 8]
          })
        });
        layerClimate.addLayer(stormMarker);
      });
    }

    // 5. Ranh giới Bạch Mã, 15 Trạm Khí Tượng, 12 Trạm Thủy Văn & 15 Hồ Điều Tiết
    L.geoJSON(geoData.climate, {
      pane: 'climatePane',
      filter: (f) => {
        const p = f.properties || {};
        if (p.hidden) return false;
        if (categoryFilter === "all") return true;
        if (categoryFilter === "met_station") return p.category === "met_station" || p.category === "climate_boundary";
        if (categoryFilter === "hydro_station") return p.category === "hydro_station";
        if (categoryFilter === "reservoir_lake") return p.category === "reservoir_lake";
        if (categoryFilter === "monsoon_storm") return p.category === "climate_boundary";
        return true;
      },
      pointToLayer: (feature, latlng) => {
        const p = feature.properties || {};
        let markerHtml = "";
        let size = [80, 18];
        let anchor = [5, 9];

        if (p.category === "met_station") {
          // Trạm khí tượng chuẩn Atlat GD tr.8: Chấm tròn đỏ tâm trắng tinh tế kèm tên trạm
          markerHtml = `
            <div class="carto-station-label flex items-center space-x-1 cursor-pointer select-none hover:scale-110 transition">
              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="#ffffff" stroke="#dc2626" stroke-width="1.8"/><circle cx="5" cy="5" r="2" fill="#dc2626"/></svg>
              <span class="text-[9px] font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap" style="text-shadow: 0 0 3px #ffffff, 0 0 6px #ffffff;">${(p.name || '').replace('Trạm khí tượng ', '')}</span>
            </div>
          `;
          size = [80, 18];
          anchor = [5, 9];
        } else if (p.category === "hydro_station") {
          // Trạm thủy văn chuẩn Atlat GD tr.10: Chấm tròn xanh lam viền trắng kèm tên trạm
          markerHtml = `
            <div class="carto-station-label flex items-center space-x-1 cursor-pointer select-none hover:scale-110 transition">
              <svg width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4.5" fill="#ffffff" stroke="#0284c7" stroke-width="1.8"/><circle cx="5" cy="5" r="2" fill="#0284c7"/></svg>
              <span class="text-[9px] font-bold text-sky-900 dark:text-sky-200 whitespace-nowrap" style="text-shadow: 0 0 3px #ffffff, 0 0 6px #ffffff;">${(p.name || '').replace('Trạm thủy văn ', '')}</span>
            </div>
          `;
          size = [80, 18];
          anchor = [5, 9];
        } else if (p.category === "reservoir_lake") {
          // Hồ chứa nước chuẩn Atlat GD tr.10: Biểu tượng hồ biếc thanh lịch
          markerHtml = `
            <div class="carto-station-label flex items-center space-x-1 cursor-pointer select-none hover:scale-110 transition">
              <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="2" width="8" height="6" rx="2" fill="#0d9488" stroke="#ffffff" stroke-width="1"/></svg>
              <span class="text-[9px] font-bold text-teal-900 dark:text-teal-200 whitespace-nowrap" style="text-shadow: 0 0 3px #ffffff, 0 0 6px #ffffff;">${(p.name || '').replace('Hồ ', 'h. ')}</span>
            </div>
          `;
          size = [80, 18];
          anchor = [5, 9];
        }

        const icon = L.divIcon({
          className: "climate-hydro-marker",
          html: markerHtml,
          iconSize: size,
          iconAnchor: anchor
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
        const p = feature.properties || {};
        if (p.category === "met_station") {
          layer.bindPopup(`
            <div class="p-3 bg-white dark:bg-slate-900 rounded-xl min-w-[240px] space-y-1.5 shadow-lg border border-slate-200 dark:border-slate-800">
              <div class="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span class="font-bold text-xs text-blue-600 dark:text-blue-400">🌡️ ${p.name}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">Trạm Khí Tượng</span>
              </div>
              <div class="text-[11px] grid grid-cols-2 gap-1 text-slate-700 dark:text-slate-200 py-0.5">
                <div>Nhiệt độ TB: <strong class="text-blue-600 dark:text-blue-400">${p.avg_temp}</strong></div>
                <div>Biên độ nhiệt: <strong class="text-amber-600 dark:text-amber-400">${p.temp_range || 'N/A'}</strong></div>
                <div class="col-span-2">Tổng lượng mưa: <strong class="text-cyan-600 dark:text-cyan-400">${p.rainfall}</strong></div>
              </div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight italic">${p.climate_type || p.desc || ''}</p>
            </div>
          `);
        } else if (p.category === "hydro_station") {
          layer.bindPopup(`
            <div class="p-3 bg-white dark:bg-slate-900 rounded-xl min-w-[260px] space-y-1.5 shadow-lg border border-cyan-200 dark:border-cyan-800">
              <div class="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span class="font-bold text-xs text-cyan-700 dark:text-cyan-300">💧 ${p.name}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200 font-semibold">Trạm Thủy Văn</span>
              </div>
              <div class="text-[11px] space-y-1 text-slate-700 dark:text-slate-200 py-0.5">
                <div>Hệ thống sông: <strong class="text-blue-600 dark:text-blue-400">${p.river_system}</strong></div>
                <div class="grid grid-cols-2 gap-1">
                  <div>Mùa lũ: <strong class="text-rose-600 dark:text-rose-400">${p.flood_season}</strong></div>
                  <div>Đỉnh lũ: <strong class="text-rose-700 dark:text-rose-300 font-bold">${p.peak_month}</strong></div>
                  <div>Mùa cạn: <strong class="text-slate-600 dark:text-slate-400">${p.dry_season}</strong></div>
                  <div>Đỉnh lưu lượng: <strong class="text-cyan-600 font-mono">${p.peak_flow}</strong></div>
                </div>
              </div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight italic">${p.regime_desc || p.desc || ''}</p>
            </div>
          `);
        } else if (p.category === "reservoir_lake") {
          layer.bindPopup(`
            <div class="p-3 bg-white dark:bg-slate-900 rounded-xl min-w-[260px] space-y-1.5 shadow-lg border border-teal-200 dark:border-teal-800">
              <div class="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span class="font-bold text-xs text-teal-700 dark:text-teal-300">🏞️ ${p.name}</span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-semibold">${p.sub_type === 'lake' ? 'Hồ tự nhiên' : 'Hồ thủy lợi / thủy điện'}</span>
              </div>
              <div class="text-[11px] space-y-1 text-slate-700 dark:text-slate-200 py-0.5">
                <div>Lưu vực: <strong>${p.basin}</strong></div>
                <div>Dung tích / Diện tích: <strong class="text-emerald-600 font-mono">${p.capacity || p.area_km2 || 'Lớn'}</strong></div>
                <div>Vai trò thủy văn: <strong>${p.role}</strong></div>
              </div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight italic">${p.desc || ''}</p>
            </div>
          `);
        } else {
          layer.bindTooltip(`<strong>${p.name}</strong><br>${p.desc}`, { permanent: false, sticky: false });
        }
        layer.on("click", () => showDetailsPanel(p, "climate"));
      }
    }).addTo(layerClimate);
  }

  // ===========================================================================
  // LỚP 4: NÔNG, LÂM, THỦY SẢN & NGƯ TRƯỜNG (Atlat GD, tr.19 - 21)
  // ===========================================================================
  async function renderAgricultureLayer(categoryFilter = "all") {
    if (!geoData.agriculture) await ensureLayerData("agriculture");
    if (!geoData.agriculture) return;

    if (map && !map.hasLayer(layerAgriculture)) {
      map.addLayer(layerAgriculture);
      activeLayers["agriculture"] = true;
      const chk = document.getElementById("layer-chk-agriculture");
      if (chk) chk.checked = true;
    }

    layerAgriculture.clearLayers();

    const categoryBadgeStyles = {
      industrial_crops: "bg-amber-600 border-amber-300 text-white",
      food_crops: "bg-emerald-600 border-emerald-300 text-white",
      livestock: "bg-rose-600 border-rose-300 text-white",
      fishery: "bg-cyan-600 border-cyan-300 text-white",
      forestry: "bg-teal-700 border-teal-300 text-white"
    };

    L.geoJSON(geoData.agriculture, {
      pane: 'agriculturePane',
      filter: (f) => {
        const p = f.properties || {};
        if (p.hidden || p.status === "missing") return false;
        if (categoryFilter === "all") return true;
        return p.category === categoryFilter;
      },
      pointToLayer: (feature, latlng) => {
        const p = feature.properties;
        const badgeStyle = categoryBadgeStyles[p.category] || "bg-emerald-600 border-emerald-300 text-white";
        const shortName = p.crop_type || p.name.replace(/^Vùng\s*/i, '').replace(/^Thủ phủ\s*/i, '');

        const icon = L.divIcon({
          className: "agri-clean-marker",
          html: `
            <div class="${badgeStyle} text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm hover:scale-110 hover:shadow-md transition flex items-center space-x-1 whitespace-nowrap cursor-pointer">
              <span>${p.icon_emoji || '🌾'}</span>
              <span class="truncate max-w-[130px]">${shortName}</span>
            </div>
          `,
          iconSize: [120, 22],
          iconAnchor: [60, 11]
        });
        return L.marker(latlng, { icon });
      },
      onEachFeature: (feature, layer) => {
        const p = feature.properties;
        layer.bindTooltip(`
          <div class="p-1.5 text-left font-sans min-w-[210px]">
            <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1 mb-0.5">
              <span>${p.icon_emoji || '🌾'}</span>
              <span>${p.name}</span>
            </div>
            <div class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
              ${p.crop_type} • ${p.province || ''}
            </div>
            <div class="text-[11px] text-slate-600 dark:text-slate-300 leading-snug border-t border-slate-100 dark:border-slate-800 pt-1">
              ${p.desc || ''}
            </div>
            <div class="text-[9px] text-slate-400 mt-1 font-mono">${p.source || 'Atlat GD, tr.19-21'}</div>
          </div>
        `, { permanent: false, sticky: false });

        layer.on("click", () => showDetailsPanel(p, "agriculture"));
      }
    }).addTo(layerAgriculture);
  }

  // ===========================================================================
  // LỚP 5: KHOÁNG SẢN & NĂNG LƯỢNG (Atlat GD, tr.13 & tr.23)
  // ===========================================================================
  async function renderMineralsPowerLayer(filterType = "all") {
    if (!geoData.minerals) await ensureLayerData("minerals");
    if (!geoData.power) await ensureLayerData("power");

    if (map && !map.hasLayer(layerMineralsPower)) {
      map.addLayer(layerMineralsPower);
      activeLayers["minerals_power"] = true;
      const chk = document.getElementById("layer-chk-minerals_power");
      if (chk) chk.checked = true;
    }

    layerMineralsPower.clearLayers();

    // 1. Khoáng sản (Atlat GD, tr.13)
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
          let provLabel = String(p.province || "").replace(/^Tỉnh\s+/i, "").trim();

          const minTooltipHtml = `
            <div class="p-1.5 text-left font-sans min-w-[220px] max-w-[280px] space-y-1.5">
              <div class="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>💎</span>
                  <span>${p.name}</span>
                </div>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">Atlat tr.13</span>
              </div>
              <div class="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                <div>Loại khoáng sản: <strong class="text-slate-900 dark:text-white">${p.mineral_type || p.name}</strong></div>
                ${p.group ? `<div>Nhóm: <strong class="text-slate-900 dark:text-white">${p.group}</strong></div>` : ''}
                ${provLabel ? `<div>Địa bàn phân bố: <strong class="text-slate-900 dark:text-white">${provLabel}</strong></div>` : ''}
              </div>
              <div class="pt-1 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-500 dark:text-slate-400 italic">
                ${p.source || 'Atlat GD, tr.13 (Khoáng sản Việt Nam)'}
              </div>
            </div>
          `;

          layer.bindTooltip(minTooltipHtml, {
            className: "atlat-rich-tooltip",
            direction: "top",
            offset: [0, -11],
            opacity: 1,
            sticky: false
          });

          layer.bindPopup(minTooltipHtml, {
            className: "atlat-rich-popup",
            offset: [0, -11]
          });

          layer.on("click", () => showDetailsPanel(p, "mineral"));
        }
      }).addTo(layerMineralsPower);
    }

    // 2. Năng lượng: Thủy điện, Nhiệt điện, Điện gió, Điện mặt trời (Atlat GD, tr.23)
    const isPowerFilter = filterType === "all" || filterType === "power" || filterType === "hydro" || filterType === "thermal" || filterType === "renewable";
    if (geoData.power && isPowerFilter) {
      let powerFeatures = geoData.power.features || [];
      if (filterType === "hydro") {
        powerFeatures = powerFeatures.filter(f => {
          const t = (f.properties.plant_type || f.properties.type || "").toLowerCase();
          return t.includes("thủy") || t.includes("thuy");
        });
      } else if (filterType === "thermal") {
        powerFeatures = powerFeatures.filter(f => {
          const t = (f.properties.plant_type || f.properties.type || "").toLowerCase();
          return t.includes("nhiệt") || t.includes("nhiet");
        });
      } else if (filterType === "renewable") {
        powerFeatures = powerFeatures.filter(f => {
          const t = (f.properties.plant_type || f.properties.type || "").toLowerCase();
          return t.includes("gió") || t.includes("gio") || t.includes("mặt trời") || t.includes("mat troi");
        });
      }

      L.geoJSON({ type: "FeatureCollection", features: powerFeatures }, {
        pane: 'pointMarkerPane',
        pointToLayer: (feature, latlng) => {
          const p = feature.properties;
          const capTier = p.capacity_group || p.capacity_tier || "Dưới 1.000 MW";
          const iconSvg = getPowerSvg(p.plant_type || p.type || "Thủy điện", capTier);
          const isRenewable = (p.plant_type || "").includes("gió") || (p.plant_type || "").includes("mặt trời");
          const isLarge = capTier.includes("Trên 1.000 MW");
          const size = isRenewable ? 22 : (isLarge ? 26 : 20);
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
          const pType = p.plant_type || p.type || "Thủy điện";
          const pRaw = pType.toLowerCase();
          const isThermal = pRaw.includes("nhiệt") || pRaw.includes("nhiet");
          const isSolar = pRaw.includes("mặt trời") || pRaw.includes("mat troi");
          const isWind = pRaw.includes("gió") || pRaw.includes("gio");
          const starColor = isThermal ? "#DC2626" : (isWind ? "#16A34A" : (isSolar ? "#EA580C" : "#0284C7"));
          const starIcon = `<svg width="18" height="18" viewBox="0 0 24 24" class="inline-block shrink-0"><polygon points="12,1 15.3,8.3 23.3,9.2 17.3,14.6 19.1,22.5 12,18.4 4.9,22.5 6.7,14.6 0.7,9.2 8.7,8.3" fill="${starColor}" stroke="#FFFFFF" stroke-width="1.5"/></svg>`;
          const badgeClass = isThermal 
            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800" 
            : (isWind || isSolar ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800");
          
          const capText = p.capacity_group || p.capacity_tier || "Dưới 1.000 MW";
          const capColor = isThermal ? "text-rose-600 dark:text-rose-400" : "text-blue-600 dark:text-blue-400";
          
          let cleanProv = String(p.province || "").replace(/^Tỉnh\s+/i, "").trim();

          const powerTooltipHtml = `
            <div class="p-1.5 text-left font-sans min-w-[240px] max-w-[300px] space-y-1.5">
              <div class="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
                <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <span>${starIcon}</span>
                  <span>${p.name}</span>
                </div>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badgeClass} shrink-0">Atlat tr.23</span>
              </div>
              <div class="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
                <div>Loại năng lượng: <strong class="text-slate-900 dark:text-white">${pType}</strong></div>
                <div>Quy mô công suất: <strong class="${capColor} font-bold">${capText}</strong></div>
                ${p.river_fuel ? `<div>Nguồn nhiên liệu / Sông: <strong class="text-slate-900 dark:text-white">${p.river_fuel}</strong> ${cleanProv ? `<span class="text-slate-500 dark:text-slate-400">(${cleanProv})</span>` : ''}</div>` : (cleanProv ? `<div>Địa bàn: <strong class="text-slate-900 dark:text-white">${cleanProv}</strong></div>` : '')}
              </div>
              <div class="pt-1 border-t border-slate-100 dark:border-slate-800 text-[9px] text-slate-500 dark:text-slate-400 leading-tight italic">
                ${p.source || 'Atlat GD, tr.23 (Công nghiệp năng lượng: Phân cấp > 1000 MW và < 1000 MW)'}
              </div>
            </div>
          `;

          const capTierVal = p.capacity_group || p.capacity_tier || "Dưới 1.000 MW";
          const isLargePlant = capTierVal.includes("Trên 1.000 MW");
          const plantSize = (isThermal || isWind || isSolar) ? 22 : (isLargePlant ? 26 : 20);

          layer.bindTooltip(powerTooltipHtml, {
            className: "atlat-rich-tooltip",
            direction: "top",
            offset: [0, -plantSize / 2 - 2],
            opacity: 1,
            sticky: false
          });

          layer.bindPopup(powerTooltipHtml, {
            className: "atlat-rich-popup",
            offset: [0, -plantSize / 2 - 2]
          });

          layer.on("click", () => showDetailsPanel(p, "power"));
        }
      }).addTo(layerMineralsPower);
    }
  }

  // ===========================================================================
  // LỚP 6: KINH TẾ & CÔNG NGHIỆP - GRDP 4 KHU VỰC (Atlat GD, tr.18 & tr.22)
  // ===========================================================================
  async function renderIndustrialCenters(scaleFilter = "all") {
    if (!geoData.industrial) await ensureLayerData("industrial");
    if (!geoData.industrial) return;

    if (map && !map.hasLayer(layerIndustrial)) {
      map.addLayer(layerIndustrial);
      activeLayers["industrial"] = true;
      const chk = document.getElementById("layer-chk-industrial");
      if (chk) chk.checked = true;
    }

    layerIndustrial.clearLayers();

    // B-03: UI gửi very_large/large/medium, dữ liệu dùng tier_1..tier_4 → map sang tier
    const SCALE_FILTER_MAP = { very_large: "tier_1", large: "tier_2", medium: ["tier_3", "tier_4"] };

    const currentZoom = map.getZoom();
    const zoomScale = currentZoom < 6 ? 0.65 : 1.0;

    L.geoJSON(geoData.industrial, {
      pane: 'pointMarkerPane',
      filter: (f) => {
        if (scaleFilter === "all") return true;
        const mapped = SCALE_FILTER_MAP[scaleFilter];
        const tier = f.properties.scale_tier || f.properties.scale;
        if (Array.isArray(mapped)) return mapped.includes(tier);
        return mapped === tier || tier === scaleFilter;
      },
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
        const sectorsText = (p.sectors || []).map(s => `
          <div class="flex items-center justify-between space-x-2 text-[10px]">
            <span class="flex items-center space-x-1"><span class="w-2 h-2 rounded-full inline-block shrink-0" style="background:${s.color}"></span><span>${s.sector || s.name}</span></span>
            <span class="font-bold font-mono">${s.share}%</span>
          </div>
        `).join("");

        layer.bindTooltip(`
          <div class="p-1.5 text-left font-sans min-w-[200px]">
            <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1 mb-0.5">
              <span>🏭</span>
              <span>${p.name}</span>
            </div>
            <div class="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mb-1">${p.scale_desc || p.scale_label || ''}</div>
            <div class="space-y-0.5 pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              ${sectorsText}
            </div>
            <div class="text-[9px] text-slate-400 mt-1 font-mono">${p.source || 'Atlat GD, tr.18'}</div>
          </div>
        `, { permanent: false, sticky: false });

        layer.on("click", () => showDetailsPanel(p, "industrial"));
      }
    }).addTo(layerIndustrial);
  }

  // ===========================================================================
  // LỚP 7: GIAO THÔNG VẬN TẢI HUYẾT MẠCH (Atlat GD, tr.23)
  // Tuyến QL1A, Đường Hồ Chí Minh, Đường sắt Thống Nhất Bắc - Nam, 9 Sân bay, 7 Cụm cảng biển
  // ===========================================================================
  let currentTransportFilter = "all";

  async function renderTransportationLayer(categoryFilter = "all") {
    currentTransportFilter = categoryFilter;
    if (!layerTransportation) {
      layerTransportation = L.featureGroup().addTo(map);
    }
    if (!geoData.transportation) await ensureLayerData("transportation");
    const data = geoData.transportation;
    if (!data || !data.features) return;

    if (map && !map.hasLayer(layerTransportation)) {
      map.addLayer(layerTransportation);
      activeLayers["transportation"] = true;
      const chk = document.getElementById("layer-chk-transportation");
      if (chk) chk.checked = true;
    }

    layerTransportation.clearLayers();

    L.geoJSON(data, {
      filter: (f) => {
        const p = f.properties || {};
        if (categoryFilter === "all") return true;
        if (categoryFilter === "highway") return p.category === "national_highway" || p.category === "highway" || (p.name && (p.name.includes("Quốc lộ") || p.name.includes("Hồ Chí Minh")));
        if (categoryFilter === "railway") return p.category === "railway" || (p.name && p.name.includes("Đường sắt"));
        if (categoryFilter === "airport") return (p.category && p.category.includes("airport")) || (p.name && p.name.includes("hàng không"));
        if (categoryFilter === "seaport") return (p.category && p.category.includes("seaport")) || (p.name && p.name.includes("Cảng biển"));
        return true;
      },
      style: (f) => {
        const p = f.properties || {};
        const isHighway1A = (p.name && p.name.includes("Quốc lộ 1A")) || p.category === "highway";
        const isHoChiMinh = (p.name && p.name.includes("Hồ Chí Minh")) || p.category === "highway_green";
        const isRailway = p.category === "railway" || (p.name && p.name.includes("Đường sắt"));

        if (isHighway1A) {
          return {
            color: "#DC2626", // Đỏ Quốc lộ 1A chuẩn Atlat tr.24
            weight: 3.5,
            opacity: 0.95,
            lineCap: "round",
            lineJoin: "round"
          };
        }
        if (isHoChiMinh) {
          return {
            color: "#16A34A", // Xanh lá Đường Hồ Chí Minh
            weight: 3.5,
            opacity: 0.95,
            lineCap: "round",
            lineJoin: "round"
          };
        }
        if (isRailway) {
          return {
            color: "#0F172A", // Đường sắt Thống Nhất Bắc - Nam
            weight: 3.5,
            dashArray: "10, 8",
            opacity: 0.95
          };
        }
        return { color: "#2563EB", weight: 2.5 };
      },
      pointToLayer: (f, latlng) => {
        const p = f.properties || {};
        const isIntlAirport = p.category === "airport_intl";
        const isDomesticAirport = p.category === "airport_domestic";
        const isAirport = isIntlAirport || isDomesticAirport || (p.category && p.category.includes("airport"));
        const isSpecialPort = p.category === "seaport_special";

        if (isAirport) {
          const shortName = p.name.replace(/^Cảng hàng không Quốc tế\s*/i, '').replace(/^Cảng hàng không\s*/i, '');
          const planeColor = isIntlAirport ? "#DC2626" : "#0F172A"; // Chuẩn Atlat GD tr.3: Quốc tế màu Đỏ, Nội địa màu Đen
          const badgeBg = isIntlAirport ? "bg-rose-950/90 border-rose-400 text-rose-200" : "bg-slate-900/90 border-slate-400 text-slate-200";
          const markerHtml = `
            <div class="flex items-center space-x-1 cursor-pointer hover:scale-115 transition drop-shadow-md">
              <div class="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-md border-2 ${isIntlAirport ? 'border-red-500' : 'border-slate-800'} shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="${planeColor}">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <span class="${badgeBg} text-[9.5px] font-bold px-1.5 py-0.5 rounded-full border shadow-sm whitespace-nowrap">${shortName}</span>
            </div>
          `;
          return L.marker(latlng, {
            icon: L.divIcon({
              className: "transport-airport-marker",
              html: markerHtml,
              iconSize: [110, 24],
              iconAnchor: [12, 12]
            })
          });
        } else {
          // Cảng biển: Chuẩn Atlat GD tr.3 là Mỏ neo màu xanh lam (#0284C7)
          const shortName = p.name.replace(/^Cụm Cảng biển nước sâu\s*/i, '').replace(/^Cụm Cảng biển\s*/i, '').replace(/^Cảng biển\s*/i, '');
          const badgeBg = isSpecialPort ? "bg-amber-950/90 border-amber-400 text-amber-200" : "bg-sky-950/90 border-sky-400 text-sky-200";
          const markerHtml = `
            <div class="flex items-center space-x-1 cursor-pointer hover:scale-115 transition drop-shadow-md">
              <div class="flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-md border-2 border-sky-500 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#0284C7">
                  <path d="M12 2a3 3 0 0 0-3 3c0 1.3.84 2.4 2 2.82V10H9v2h2v7.17A7 7 0 0 1 5 12h-2a9 9 0 0 0 8 8.95V22h2v-1.05A9 9 0 0 0 21 12h-2a7 7 0 0 1-6 7.17V12h2v-2h-2V7.82c1.16-.42 2-1.52 2-2.82a3 3 0 0 0-3-3zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
              </div>
              <span class="${badgeBg} text-[9.5px] font-bold px-1.5 py-0.5 rounded-full border shadow-sm whitespace-nowrap">${shortName}</span>
            </div>
          `;
          return L.marker(latlng, {
            icon: L.divIcon({
              className: "transport-seaport-marker",
              html: markerHtml,
              iconSize: [120, 24],
              iconAnchor: [12, 12]
            })
          });
        }
      },
      onEachFeature: (f, layer) => {
        const p = f.properties || {};
        const isAirport = (p.category && p.category.includes("airport")) || (p.name && p.name.includes("hàng không"));
        const isRailway = p.category === "railway" || (p.name && p.name.includes("Đường sắt"));
        const iconChar = isAirport ? "✈️" : (isRailway ? "🚂" : (f.geometry.type.includes("Line") ? "🛣️" : "⚓"));

        // Thêm nhãn nhận diện tuyến đường chính
        if (f.geometry.type === "LineString" && f.geometry.coordinates && f.geometry.coordinates.length > 5) {
          const coords = f.geometry.coordinates;
          const midIdx = Math.floor(coords.length * 0.4);
          const pt = coords[midIdx];
          if (pt && pt.length >= 2) {
            let badgeText = p.name;
            let badgeBg = "bg-red-700 text-white";
            if (p.name.includes("Quốc lộ 1A")) { badgeText = "🔴 QL 1A"; badgeBg = "bg-red-700 text-white"; }
            else if (p.name.includes("Hồ Chí Minh")) { badgeText = "🟢 Đ. Hồ Chí Minh"; badgeBg = "bg-emerald-700 text-white"; }
            else if (isRailway) { badgeText = "🚂 Đường sắt Thống Nhất"; badgeBg = "bg-slate-900 text-slate-100"; }

            const lineMarker = L.marker([pt[1], pt[0]], {
              pane: 'pointMarkerPane',
              icon: L.divIcon({
                className: "transport-line-badge",
                html: `<div class="${badgeBg} text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-white/80 shadow-sm whitespace-nowrap">${badgeText}</div>`,
                iconSize: [80, 20],
                iconAnchor: [40, 10]
              })
            });
            lineMarker.bindTooltip(`<strong>${p.name}</strong><br>${p.desc || ''}`, { permanent: false, sticky: false });
            lineMarker.on("click", () => showDetailsPanel(p, "transportation"));
            layerTransportation.addLayer(lineMarker);
          }
        }

        layer.on({
          mouseover: (e) => {
            if (layer.setStyle && f.geometry.type.includes("Line")) {
              layer.setStyle({ weight: 5.5, opacity: 1.0 });
            }
            try { layer.openTooltip(); } catch (err) {}
          },
          mouseout: (e) => {
            if (layer.setStyle && f.geometry.type.includes("Line")) {
              const isHw = (p.name && p.name.includes("Quốc lộ 1A")) || p.category === "highway";
              const isHg = (p.name && p.name.includes("Hồ Chí Minh")) || p.category === "highway_green";
              const isRw = p.category === "railway" || (p.name && p.name.includes("Đường sắt"));
              layer.setStyle({
                weight: (isHw || isHg || isRw) ? 3.5 : 2.5,
                opacity: 0.95
              });
            }
            try { layer.closeTooltip(); } catch (err) {}
          },
          click: () => {
            showDetailsPanel(p, "transportation");
          }
        });

        layer.bindTooltip(`
          <div class="p-1.5 text-left font-sans">
            <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1">
              <span>${iconChar}</span>
              <span>${p.name}</span>
            </div>
            <div class="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">${p.desc || ''}</div>
            <div class="text-[9px] text-slate-500 mt-0.5">${p.source || 'Atlat GD, tr.24'}</div>
          </div>
        `, { permanent: false, sticky: false, opacity: 0.95 });
      }
    }).addTo(layerTransportation);
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
            <td class="p-2.5 text-center font-mono font-bold">${formatVNNum(pA.area)}</td>
            <td class="p-2.5 text-center font-mono font-bold">${formatVNNum(pB.area)}</td>
          </tr>
          <tr>
            <td class="p-2.5 font-semibold text-slate-600 dark:text-slate-400">Dân số (nghìn người)</td>
            <td class="p-2.5 text-center font-mono font-bold">${formatVNNum(pA.pop)}</td>
            <td class="p-2.5 text-center font-mono font-bold">${formatVNNum(pB.pop)}</td>
          </tr>
          <tr>
            <td class="p-2.5 font-semibold text-slate-600 dark:text-slate-400">Mật độ dân số (người/km²)</td>
            <td class="p-2.5 text-center font-mono font-bold text-blue-600">${formatVNNum(pA.density)}</td>
            <td class="p-2.5 text-center font-mono font-bold text-indigo-600">${formatVNNum(pB.density)}</td>
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

  // ===========================================================================
  // ĐẤU TRƯỜNG ATLAT THPT (3 CHẾ ĐỘ CHƠI) - Upgrade 3
  // 1. Định vị nhanh 15s (Speed Locator)
  // 2. Đoán hình thể bóng (Silhouette Quiz)
  // 3. Nhận diện Ký hiệu Mỏ & Trung tâm Công nghiệp (Atlat Symbol Quiz)
  // ===========================================================================
  const ATLAT_SYMBOL_QUESTIONS = [
    {
      id: "SYM_01",
      symbol_svg: getMineralSvg("coal"),
      prompt: "Ký hiệu hình vuông màu đen trên bản đồ Atlat Địa lí Việt Nam (Trang 13) thể hiện loại khoáng sản nào?",
      options: ["Than đá", "Dầu mỏ", "Quặng sắt", "Apatit"],
      correct: "Than đá",
      explanation: "Hình vuông màu đen là ký hiệu Than đá (Atlat GD, tr.13). Bể than Quảng Ninh là vùng có trữ lượng than đá lớn nhất cả nước."
    },
    {
      id: "SYM_02",
      symbol_svg: getMineralSvg("oil"),
      prompt: "Ký hiệu hình thang màu đen trên thềm lục địa miền Nam (Atlat Trang 13) đại diện cho:",
      options: ["Dầu mỏ", "Khí tự nhiên", "Than bùn", "Muối biển"],
      correct: "Dầu mỏ",
      explanation: "Hình thang đen là ký hiệu Dầu mỏ (mỏ Bạch Hổ, Rồng, Đại Hùng, Rạng Đông... ở thềm lục địa Nam Bộ, Atlat GD tr.13 & 23)."
    },
    {
      id: "SYM_03",
      symbol_svg: getMineralSvg("gas"),
      prompt: "Ký hiệu hình thang màu trắng ở thềm lục địa nước ta thể hiện loại tài nguyên nào?",
      options: ["Khí tự nhiên", "Dầu thô", "Titan", "Cát thủy tinh"],
      correct: "Khí tự nhiên",
      explanation: "Hình thang viền đen nền trắng là Khí tự nhiên (mỏ Lan Tây, Lan Đỏ ở bể Nam Côn Sơn, mỏ Tiền Hải ở Thái Bình, Atlat GD tr.13 & 23)."
    },
    {
      id: "SYM_04",
      symbol_svg: getMineralSvg("iron"),
      prompt: "Ký hiệu tam giác đều màu đen trong bản đồ khoáng sản (Trang 13) là mỏ gì?",
      options: ["Quặng Sắt", "Mangan", "Chì - Kẽm", "Vàng"],
      correct: "Quặng Sắt",
      explanation: "Tam giác đen là Quặng sắt (mỏ Thạch Khê - Hà Tĩnh, mỏ Trại Cau - Thái Nguyên, Tùng Bá - Hà Giang, Atlat GD tr.13)."
    },
    {
      id: "SYM_05",
      symbol_svg: getMineralSvg("bauxite"),
      prompt: "Ký hiệu hình vuông viền đen có chữ 'Al' (Atlat GD tr.3 & 13) là mỏ khoáng sản nào?",
      options: ["Bôxit (quặng nhôm)", "Đồng", "Thiếc", "Crôm"],
      correct: "Bôxit (quặng nhôm)",
      explanation: "Hình vuông chữ Al là Bôxit (quặng nhôm, Atlat GD tr.3 & tr.13). Tập trung diện tích lớn tại Lâm Đồng, Đắk Lắk, Gia Lai."
    },
    {
      id: "SYM_06",
      symbol_svg: getMineralSvg("apatite"),
      prompt: "Ký hiệu hình vuông viền đen có chữ 'A' (Atlat GD tr.3 & 13) là mỏ khoáng sản:",
      options: ["Apatit", "Đá quý", "Sét cao lanh", "Thạch anh"],
      correct: "Apatit",
      explanation: "Hình vuông chữ A là mỏ Apatit Cam Đường (Lào Cai, Atlat GD tr.3 & tr.13), nguyên liệu quý sản xuất phân bón lân cho nông nghiệp."
    },
    {
      id: "SYM_07",
      symbol_svg: getPowerSvg("Thủy điện", "Trên 1.000 MW"),
      prompt: "Ký hiệu ngôi sao màu xanh lam trên bản đồ Năng lượng (Atlat GD tr.23) thể hiện:",
      options: ["Nhà máy Thủy điện", "Nhà máy Nhiệt điện", "Trạm biến áp 500kV", "Điện gió"],
      correct: "Nhà máy Thủy điện",
      explanation: "Ngôi sao màu xanh lam là Thủy điện (Hòa Bình, Sơn La trên sông Đà; Ialy trên sông Sê San; Trị An trên sông Đồng Nai, Atlat GD tr.23)."
    },
    {
      id: "SYM_08",
      symbol_svg: getPowerSvg("Nhiệt điện", "Trên 1.000 MW"),
      prompt: "Ký hiệu ngôi sao màu đỏ trên bản đồ Công nghiệp & Năng lượng (Atlat GD tr.23) thể hiện:",
      options: ["Nhà máy Nhiệt điện", "Nhà máy Thủy điện", "Điện mặt trời", "Mỏ than"],
      correct: "Nhà máy Nhiệt điện",
      explanation: "Ngôi sao đỏ là Nhiệt điện (Phú Mỹ, Cà Mau chạy bằng khí; Phả Lại, Ninh Bình chạy bằng than, Atlat GD tr.23)."
    },
    {
      id: "SYM_09",
      symbol_svg: `<div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-base font-bold shadow">✈️</div>`,
      prompt: "Cảng hàng không quốc tế có lưu lượng hành khách lớn nhất miền Bắc (Atlat GD tr.24) là:",
      options: ["Nội Bài (Hà Nội)", "Cát Bi (Hải Phòng)", "Vân Đồn (Quảng Ninh)", "Điện Biên"],
      correct: "Nội Bài (Hà Nội)",
      explanation: "Sân bay quốc tế Nội Bài (Hà Nội) là cảng hàng không quốc tế lớn nhất miền Bắc (Atlat GD, tr.24)."
    },
    {
      id: "SYM_10",
      symbol_svg: `<div class="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-base font-bold shadow">⚓</div>`,
      prompt: "Cụm cảng biển nước sâu cửa ngõ quốc tế lớn nhất miền Nam có khả năng đón tàu mẹ đi Mỹ - Âu (Atlat GD tr.24) là:",
      options: ["Cái Mép - Thị Vải (TP.HCM / BR-VT)", "Cảng Sài Gòn", "Cảng Quy Nhơn", "Cảng Tiên Sa (Đà Nẵng)"],
      correct: "Cái Mép - Thị Vải (TP.HCM / BR-VT)",
      explanation: "Cụm cảng nước sâu Cái Mép - Thị Vải (Atlat GD tr.24) là cảng biển loại đặc biệt của Việt Nam."
    },
    {
      id: "SYM_11",
      symbol_svg: getMineralSvg("tin"),
      prompt: "Ký hiệu hình thoi màu đen dẹt trên bản đồ Kí hiệu chung (Trang 3) là khoáng sản gì?",
      options: ["Thiếc", "Titan", "Crôm", "Đồng"],
      correct: "Thiếc",
      explanation: "Hình thoi đen dẹt là ký hiệu Thiếc (mỏ Tĩnh Túc - Cao Bằng, Quỳ Hợp - Nghệ An, Atlat GD tr.3 & tr.13)."
    },
    {
      id: "SYM_12",
      symbol_svg: getMineralSvg("titan"),
      prompt: "Ký hiệu hình thoi chia nửa đen trắng dọc bờ biển miền Trung là:",
      options: ["Titan", "Cát trắng", "Muối", "Than bùn"],
      correct: "Titan",
      explanation: "Hình thoi nửa đen nửa trắng là quặng Titan sa khoáng ven biển (Cẩm Xuyên - Hà Tĩnh, Phù Cát - Gia Lai/Bình Định cũ, Atlat GD tr.3 & tr.13)."
    }
  ];

  function setGameMode(mode) {
    gameMode = mode;
    const tabs = ["speed", "silhouette", "symbols"];
    tabs.forEach(t => {
      const btn = document.getElementById(`game-tab-${t}`);
      if (btn) {
        if (t === mode) {
          btn.className = "flex-1 py-1 rounded-md bg-amber-500 text-white font-bold transition text-center shadow-sm";
        } else {
          btn.className = "flex-1 py-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-center font-medium";
        }
      }
    });

    if (miniGameTimer) clearInterval(miniGameTimer);

    if (mode === "speed") {
      pickNextGameTarget();
    } else if (mode === "silhouette") {
      pickNextSilhouetteQuestion();
    } else if (mode === "symbols") {
      pickNextSymbolQuestion();
    }
  }

  function generateSilhouetteSvg(feature, width = 200, height = 150) {
    if (!feature || !feature.geometry) return "";
    const geom = feature.geometry;
    let rings = [];
    if (geom.type === "Polygon") {
      rings = [geom.coordinates[0]];
    } else if (geom.type === "MultiPolygon") {
      rings = geom.coordinates.map(poly => poly[0]);
    }
    if (rings.length === 0) return "";

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    rings.forEach(ring => {
      ring.forEach(([x, y]) => {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      });
    });

    const dx = maxX - minX || 0.001;
    const dy = maxY - minY || 0.001;
    const pad = 12;
    const scale = Math.min((width - pad * 2) / dx, (height - pad * 2) / dy);
    const offsetX = (width - dx * scale) / 2;
    const offsetY = (height - dy * scale) / 2;

    const paths = rings.map(ring => {
      const pts = ring.map(([x, y]) => {
        const px = (x - minX) * scale + offsetX;
        const py = height - ((y - minY) * scale + offsetY);
        return `${px.toFixed(1)},${py.toFixed(1)}`;
      });
      return `M ${pts.join(" L ")} Z`;
    }).join(" ");

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="mx-auto drop-shadow-md">
        <path d="${paths}" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" stroke-linejoin="round" />
      </svg>
    `;
  }

  function pickNextSilhouetteQuestion() {
    if (!geoData.provinces) return;
    const validProvinces = geoData.provinces.features.filter(f => !f.properties.is_special_island);
    const targetFeat = validProvinces[Math.floor(Math.random() * validProvinces.length)];
    silhouetteTarget = targetFeat.properties;

    // Pick 3 distractors
    const distractors = [];
    while (distractors.length < 3) {
      const cand = validProvinces[Math.floor(Math.random() * validProvinces.length)].properties.name;
      if (cand !== silhouetteTarget.name && !distractors.includes(cand)) {
        distractors.push(cand);
      }
    }

    const options = [silhouetteTarget.name, ...distractors].sort(() => Math.random() - 0.5);
    const svgHtml = generateSilhouetteSvg(targetFeat, 200, 150);

    const container = document.getElementById("game-interactive-area");
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-2.5 text-center">
        <div class="p-2 rounded-xl bg-slate-900/90 border border-slate-700 flex items-center justify-center">
          ${svgHtml}
        </div>
        <div class="text-[11px] font-bold text-slate-700 dark:text-slate-300">
          Hình thể bóng trên thuộc tỉnh/thành phố nào?
        </div>
        <div class="grid grid-cols-2 gap-1.5" id="silhouette-options-grid">
          ${options.map(opt => `
            <button onclick="AtlasEngine.handleSilhouetteAnswer('${opt}')" class="game-opt-btn p-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition truncate">
              ${opt}
            </button>
          `).join("")}
        </div>
        <div id="silhouette-feedback" class="text-[10px] min-h-[24px]"></div>
      </div>
    `;
    updateGameDisplay();
  }

  function handleSilhouetteAnswer(chosen) {
    if (!silhouetteTarget) return;
    const isCorrect = chosen === silhouetteTarget.name;
    const fbEl = document.getElementById("silhouette-feedback");

    const btns = document.querySelectorAll("#silhouette-options-grid .game-opt-btn");
    btns.forEach(btn => {
      btn.disabled = true;
      if (btn.innerText.trim() === silhouetteTarget.name) {
        btn.classList.add("bg-emerald-600", "text-white", "border-emerald-600");
      } else if (btn.innerText.trim() === chosen && !isCorrect) {
        btn.classList.add("bg-rose-600", "text-white", "border-rose-600");
      }
    });

    if (isCorrect) {
      miniGameScore += 15 + miniGameStreak * 3;
      miniGameStreak += 1;
      if (fbEl) {
        fbEl.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-bold">🎯 Chính xác!</span> ${silhouetteTarget.name} (${silhouetteTarget.region_name || 'Việt Nam'}, ${Number(silhouetteTarget.area).toLocaleString()} km²)`;
      }
      setTimeout(pickNextSilhouetteQuestion, 1200);
    } else {
      miniGameStreak = 0;
      if (fbEl) {
        fbEl.innerHTML = `<span class="text-rose-600 dark:text-rose-400 font-bold">❌ Chưa đúng!</span> Đáp án đúng: <strong>${silhouetteTarget.name}</strong>`;
      }
      setTimeout(pickNextSilhouetteQuestion, 2000);
    }
    updateGameDisplay();
  }

  function pickNextSymbolQuestion() {
    const q = ATLAT_SYMBOL_QUESTIONS[Math.floor(Math.random() * ATLAT_SYMBOL_QUESTIONS.length)];
    symbolTarget = q;

    const options = [...q.options].sort(() => Math.random() - 0.5);
    const container = document.getElementById("game-interactive-area");
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-2.5 text-center">
        <div class="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[50px]">
          ${q.symbol_svg}
        </div>
        <div class="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-snug">
          ${q.prompt}
        </div>
        <div class="grid grid-cols-2 gap-1.5" id="symbol-options-grid">
          ${options.map(opt => `
            <button onclick="AtlasEngine.handleSymbolAnswer('${opt}')" class="game-opt-btn p-2 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white transition truncate">
              ${opt}
            </button>
          `).join("")}
        </div>
        <div id="symbol-feedback" class="text-[10px] min-h-[30px] leading-snug"></div>
      </div>
    `;
    updateGameDisplay();
  }

  function handleSymbolAnswer(chosen) {
    if (!symbolTarget) return;
    const isCorrect = chosen === symbolTarget.correct;
    const fbEl = document.getElementById("symbol-feedback");

    const btns = document.querySelectorAll("#symbol-options-grid .game-opt-btn");
    btns.forEach(btn => {
      btn.disabled = true;
      if (btn.innerText.trim() === symbolTarget.correct) {
        btn.classList.add("bg-emerald-600", "text-white", "border-emerald-600");
      } else if (btn.innerText.trim() === chosen && !isCorrect) {
        btn.classList.add("bg-rose-600", "text-white", "border-rose-600");
      }
    });

    if (isCorrect) {
      miniGameScore += 15 + miniGameStreak * 3;
      miniGameStreak += 1;
      if (fbEl) {
        fbEl.innerHTML = `<span class="text-emerald-600 dark:text-emerald-400 font-bold">🎯 Xuất sắc!</span> ${symbolTarget.explanation}`;
      }
      setTimeout(pickNextSymbolQuestion, 1600);
    } else {
      miniGameStreak = 0;
      if (fbEl) {
        fbEl.innerHTML = `<span class="text-rose-600 dark:text-rose-400 font-bold">❌ Chưa chính xác!</span> ${symbolTarget.explanation}`;
      }
      setTimeout(pickNextSymbolQuestion, 2400);
    }
    updateGameDisplay();
  }

  // Mini-Game 15 Giây "Định Vị Nhanh Atlat"
  function startMiniGame() {
    if (!geoData.provinces) return;
    miniGameActive = true;
    miniGameScore = 0;
    miniGameStreak = 0;

    const gameModal = document.getElementById("game-modal");
    if (gameModal) gameModal.classList.remove("hidden");

    setGameMode(gameMode || "speed");
  }

  function pickNextGameTarget() {
    if (!geoData.provinces) return;
    const validProvinces = geoData.provinces.features.filter(f => !f.properties.is_special_island);
    const randomIndex = Math.floor(Math.random() * validProvinces.length);
    miniGameTarget = validProvinces[randomIndex].properties;
    miniGameTimeLeft = 15;

    const container = document.getElementById("game-interactive-area");
    if (container) {
      container.innerHTML = `
        <div class="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 text-center space-y-1">
          <span class="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">Hãy tìm & bấm chọn trên bản đồ:</span>
          <div id="game-target-name" class="text-base font-black text-blue-700 dark:text-blue-300">${miniGameTarget.name}</div>
        </div>
      `;
    }

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

    if (targetEl && gameMode === "speed") targetEl.innerText = miniGameTarget ? miniGameTarget.name : "...";
    if (scoreEl) scoreEl.innerText = miniGameScore;
    if (streakEl) streakEl.innerText = miniGameStreak;
    if (timeEl) timeEl.innerText = `${miniGameTimeLeft}s`;
  }

  function handleMiniGameClick(clickedProps) {
    if (!miniGameActive || !miniGameTarget || gameMode !== "speed") return;

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

  // 14 chữ viết tắt chuẩn Atlat (Mục 1 GLOSSARY_SEED.md & Atlat GD/DHQG tr.3):
  // CC. (Cánh cung), CN. (Cao nguyên), SN. (Sơn nguyên), N. (Núi), D. (Dãy), Đ. (Đảo),
  // BĐ. (Bán đảo), QĐ. (Quần đảo), S. (Sông), K. (Kênh), V. (Vịnh), TP. (Thành phố),
  // GDP (Tổng sản phẩm trong nước), GRDP (Tổng sản phẩm trên địa bàn)
  function expandSearchVariants(query) {
    const raw = (query || "").trim();
    if (!raw) return [];
    const norm = normalizeVN(raw);
    const variants = new Set([norm, raw.toLowerCase()]);

    const normNoDot = norm.replace(/\./g, " ").replace(/\s+/g, " ").trim();
    variants.add(normNoDot);

    const ABBR_EXPANSIONS = [
      { re: /^(cc\.|cc)\s+/i, full: "canh cung " },
      { re: /^(cn\.|cn)\s+/i, full: "cao nguyen " },
      { re: /^(sn\.|sn)\s+/i, full: "son nguyen " },
      { re: /^(n\.)\s+/i, full: "nui " },
      { re: /^(d\.)\s+/i, full: "day " },
      { re: /^(d\.|đ\.)\s+/i, full: "dao " },
      { re: /^(bd\.|bd)\s+/i, full: "ban dao " },
      { re: /^(qd\.|qd)\s+/i, full: "quan dao " },
      { re: /^(s\.)\s+/i, full: "song " },
      { re: /^(k\.)\s+/i, full: "kenh " },
      { re: /^(v\.)\s+/i, full: "vinh " },
      { re: /^(tp\.|tp)\s+/i, full: "thanh pho " },
      { re: /\bgdp\b/i, full: "tong san pham trong nuoc" },
      { re: /\bgrdp\b/i, full: "tong san pham tren dia ban" }
    ];

    const REVERSE_EXPANSIONS = [
      { re: /^canh cung\s+/i, abbr: "cc " },
      { re: /^cao nguyen\s+/i, abbr: "cn " },
      { re: /^son nguyen\s+/i, abbr: "sn " },
      { re: /^nui\s+/i, abbr: "n. " },
      { re: /^day\s+/i, abbr: "d. " },
      { re: /^dao\s+/i, abbr: "đ. " },
      { re: /^ban dao\s+/i, abbr: "bd " },
      { re: /^quan dao\s+/i, abbr: "qd " },
      { re: /^song\s+/i, abbr: "s. " },
      { re: /^kenh\s+/i, abbr: "k. " },
      { re: /^vinh\s+/i, abbr: "v. " },
      { re: /^thanh pho\s+/i, abbr: "tp " }
    ];

    ABBR_EXPANSIONS.forEach(rule => {
      if (rule.re.test(norm)) {
        variants.add(norm.replace(rule.re, rule.full).trim());
        variants.add(norm.replace(rule.re, "").trim());
      }
    });

    REVERSE_EXPANSIONS.forEach(rule => {
      if (rule.re.test(norm)) {
        variants.add(norm.replace(rule.re, rule.abbr).trim());
        variants.add(norm.replace(rule.re, rule.abbr.replace(".", "")).trim());
        variants.add(norm.replace(rule.re, "").trim());
      }
    });

    return Array.from(variants).filter(v => v.length > 0);
  }

  function matchesSearch(text, variants) {
    if (!text) return false;
    const norm = normalizeVN(text);
    const normNoDot = norm.replace(/\./g, " ").replace(/\s+/g, " ").trim();
    return variants.some(v => norm.includes(v) || normNoDot.includes(v) || v.includes(norm));
  }

  // ===========================================================================
  // THANH TÌM KIẾM THÔNG MINH TOÀN DIỆN (Nhiệm vụ 2.7 & BUG-12)
  // ===========================================================================
  async function searchAndFlyTo(keyword) {
    if (!keyword || !keyword.trim()) return;
    const rawQuery = keyword.trim();
    const variants = expandSearchVariants(rawQuery);
    if (variants.length === 0) return;

    // Tải trước dữ liệu các lớp cần thiết nếu chưa nạp
    await Promise.all([
      ensureLayerData("provinces"),
      ensureLayerData("topography"),
      ensureLayerData("power"),
      ensureLayerData("minerals"),
      ensureLayerData("climate"),
      ensureLayerData("industrial"),
      ensureLayerData("agriculture")
    ]);

    const normQuery = normalizeVN(rawQuery);
    const isHydroQuery = /thuy dien|nhiet dien|nha may dien|dien gio|dien mat troi/i.test(normQuery);
    const isTopoQuery = /cao nguyen|day nui|dinh nui|nui|deo|song|he thong song/i.test(normQuery);
    const isClimateQuery = /tram|khi hau|khi tuong|thuy van|luu luong|ho |bien ho/i.test(normQuery);
    const isMineralQuery = /khoang san|mo than|mo dau|mo khi|mo |than|dau mo|khi dot|sat|boxit|bauxite|apatit|titan/i.test(normQuery);
    const isIndustrialQuery = /trung tam cong nghiep|ttcn/i.test(normQuery);
    const isProvinceQuery = /tinh|thanh pho|tp\s+/i.test(normQuery);

    function scoreCandidate(feature, layerType) {
      const p = feature.properties || {};
      const nameNorm = normalizeVN(p.name || "");
      let score = 0;

      // Ưu tiên theo loại đối tượng người dùng tìm kiếm
      if (isHydroQuery && (layerType === "power" || p.category === "hydropower" || p.category === "thermal_power")) score += 70;
      if (isTopoQuery && layerType === "topography") score += 70;
      if (isClimateQuery && layerType === "climate") score += 70;
      if (isMineralQuery && layerType === "minerals") score += 70;
      if (isIndustrialQuery && layerType === "industrial") score += 70;
      if (isProvinceQuery && layerType === "provinces") score += 70;

      // Khớp tuyệt đối tên đối tượng
      if (nameNorm === normQuery) {
        score += 100;
      } else if (nameNorm.includes(normQuery)) {
        score += 80;
      } else if (normQuery.includes(nameNorm) && nameNorm.length >= 3) {
        score += 75;
      }

      // Khớp biến thể tìm kiếm
      for (const v of variants) {
        if (nameNorm === v) { score += 90; break; }
        if (nameNorm.includes(v)) { score += 60; break; }
      }

      // Khớp bí danh (aliases)
      if (p.aliases && Array.isArray(p.aliases)) {
        for (const a of p.aliases) {
          const aNorm = normalizeVN(a);
          if (aNorm === normQuery) { score += 85; break; }
          if (aNorm.includes(normQuery)) { score += 55; break; }
        }
      }

      // Khớp đặc tính địa lý
      if (p.mountain_range && normalizeVN(p.mountain_range).includes(normQuery)) score += 50;
      if (p.mineral_type && normalizeVN(p.mineral_type).includes(normQuery)) score += 45;
      if (p.plant_type && normalizeVN(p.plant_type).includes(normQuery)) score += 45;

      // Xử lý tỉnh sáp nhập (merged_from): Điểm RẤT THẤP và tuyệt đối KHÔNG cộng điểm nếu đang tìm thủy điện/cao nguyên
      if (layerType === "provinces") {
        if (p.merged_from && Array.isArray(p.merged_from) && !isHydroQuery && !isTopoQuery) {
          for (const m of p.merged_from) {
            const mNorm = normalizeVN(m);
            if (mNorm === normQuery) { score += 25; break; }
            if (normQuery.includes(mNorm)) { score += 10; break; }
          }
        }
        if (p.region_name && normalizeVN(p.region_name).includes(normQuery) && !isTopoQuery && !isHydroQuery) {
          score += 5;
        }
      }

      return score;
    }

    const candidatePool = [];

    // Thu thập ứng viên từ tất cả các lớp
    if (geoData.power?.features) {
      for (const f of geoData.power.features) {
        const sc = scoreCandidate(f, "power");
        if (sc > 0) candidatePool.push({ feature: f, type: "power", score: sc, layerKey: "minerals_power" });
      }
    }

    if (geoData.topography?.features) {
      for (const f of geoData.topography.features) {
        const sc = scoreCandidate(f, "topography");
        if (sc > 0) candidatePool.push({ feature: f, type: "topography", score: sc, layerKey: "topography" });
      }
    }

    if (geoData.climate?.features) {
      for (const f of geoData.climate.features) {
        const sc = scoreCandidate(f, "climate");
        if (sc > 0) candidatePool.push({ feature: f, type: "climate", layerKey: "climate", score: sc });
      }
    }

    if (geoData.minerals?.features) {
      for (const f of geoData.minerals.features) {
        const sc = scoreCandidate(f, "minerals");
        if (sc > 0) candidatePool.push({ feature: f, type: "mineral", layerKey: "minerals_power", score: sc });
      }
    }

    if (geoData.industrial?.features) {
      for (const f of geoData.industrial.features) {
        const sc = scoreCandidate(f, "industrial");
        if (sc > 0) candidatePool.push({ feature: f, type: "industrial", layerKey: "industrial", score: sc });
      }
    }

    if (geoData.agriculture?.features) {
      for (const f of geoData.agriculture.features) {
        if (f.properties?.hidden || f.properties?.category === "fishing_ground") continue;
        const sc = scoreCandidate(f, "agriculture");
        if (sc > 0) candidatePool.push({ feature: f, type: "agriculture", layerKey: "agriculture", score: sc });
      }
    }

    if (geoData.provinces?.features) {
      for (const f of geoData.provinces.features) {
        const sc = scoreCandidate(f, "provinces");
        if (sc > 0) candidatePool.push({ feature: f, type: "province", layerKey: "provinces", score: sc });
      }
    }

    // Sắp xếp theo điểm số giảm dần
    candidatePool.sort((a, b) => b.score - a.score);

    if (candidatePool.length === 0 || candidatePool[0].score < 15) {
      if (typeof window.showAppToast === 'function') {
        window.showAppToast(`🔍 Không tìm thấy kết quả phù hợp cho "${keyword}". Thử: Thủy điện Hòa Bình, Cao nguyên Sơn La, Phanxipăng, Hà Nội...`);
      }
      return;
    }

    const winner = candidatePool[0];
    const match = winner.feature;

    // Bật layer tương ứng nếu chưa bật
    await toggleLayer(winner.layerKey, true);

    // Di chuyển bản đồ và hiển thị thẻ thông tin
    if (winner.type === "province") {
      const layer = L.geoJSON(match);
      map.fitBounds(layer.getBounds(), { padding: [50, 50], duration: 1.2 });
      showDetailsPanel(match.properties, "province");
    } else if (match.geometry?.type === "Point") {
      const [lng, lat] = match.geometry.coordinates;
      const targetZoom = (winner.type === "topography" || winner.type === "power") ? 11 : 10;
      map.flyTo([lat, lng], targetZoom, { duration: 1.2 });
      showDetailsPanel(match.properties, winner.type);
    } else {
      const layer = L.geoJSON(match);
      map.fitBounds(layer.getBounds(), { padding: [50, 50], duration: 1.2 });
      showDetailsPanel(match.properties, winner.type);
    }
  }

  function showDetailsPanel(props, type) {
    const infoContainer = document.getElementById("atlas-info-card");
    if (!infoContainer) return;

    if (type === "topography") {
      const isRiver = props.category === "river" || props.category === "river_system";
      if (isRiver) {
        infoContainer.innerHTML = `
          <div class="space-y-2.5">
            <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <h4 class="font-bold text-xs text-sky-700 dark:text-sky-300 flex items-center space-x-1.5">
                <span>🌊</span> <span>${props.name}</span>
              </h4>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">Sông chính (Atlat GD, tr.10)</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-center text-xs">
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Chiều dài ở VN</span>
                <span class="font-bold text-sky-600 dark:text-sky-400 text-[11px] font-mono">${props.length_in_vn_km ? props.length_in_vn_km + ' km' : 'N/A'}</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Diện tích lưu vực</span>
                <span class="font-bold text-blue-600 dark:text-blue-400 text-[11px] font-mono">${props.basin_area_vn_km2 ? props.basin_area_vn_km2 + ' km²' : 'N/A'}</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Lượng dòng chảy</span>
                <span class="font-bold text-cyan-600 dark:text-cyan-400 text-[11px] font-mono">${props.flow_volume_bil_m3 ? props.flow_volume_bil_m3 + ' tỉ m³' : 'N/A'}</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Tổng chiều dài</span>
                <span class="font-bold text-slate-700 dark:text-slate-300 text-[11px] font-mono">${props.total_length_km ? props.total_length_km + ' km' : 'N/A'}</span>
              </div>
            </div>
            <div class="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900/50 space-y-1">
              <div class="text-[10px] font-bold text-sky-800 dark:text-sky-300 flex items-center space-x-1">
                <span>📘</span> <span>Kiến thức địa lí trọng tâm</span>
              </div>
              <p class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">${props.desc || ''}</p>
            </div>
          </div>
        `;
        return;
      }

      infoContainer.innerHTML = `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h4 class="font-bold text-xs text-amber-800 dark:text-amber-300 flex items-center space-x-1.5">
              <span>⛰️</span> <span>${props.name}</span>
            </h4>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">${props.source || 'Atlat GD, tr.7 & tr.10'}</span>
          </div>
          <div class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">${props.desc || ''}</div>
          ${props.elevation_m ? `<div class="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs">Độ cao tuyệt đối: <strong>${props.elevation_m} m</strong> • Dãy: <strong>${props.mountain_range || ''}</strong></div>` : ''}
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
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">${props.source || 'Atlat GD, tr.19 - 21'}</span>
          </div>
          <p class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">${props.desc || ''}</p>
        </div>
      `;
      return;
    }

    if (type === "climate") {
      if (props.category === "hydro_station") {
        infoContainer.innerHTML = `
          <div class="space-y-2.5">
            <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <h4 class="font-bold text-xs text-cyan-700 dark:text-cyan-300 flex items-center space-x-1.5">
                <span>💧</span> <span>${props.name}</span>
              </h4>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">${props.source || 'Atlat GD, tr.10'}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-center text-xs">
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Hệ thống sông</span>
                <span class="font-bold text-blue-600 dark:text-blue-400 text-[11px]">${props.river_system || 'Sông lớn'}</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Đỉnh lũ cao nhất</span>
                <span class="font-bold text-rose-600 dark:text-rose-400 text-[11px]">${props.peak_month || 'N/A'}</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Mùa lũ chính</span>
                <span class="font-bold text-rose-700 dark:text-rose-300 text-[11px]">${props.flood_season || 'N/A'}</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Đỉnh lưu lượng</span>
                <span class="font-bold text-cyan-600 font-mono text-[11px]">${props.peak_flow || 'N/A'}</span>
              </div>
            </div>
            <div class="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900/50 space-y-1">
              <div class="text-[10px] font-bold text-cyan-800 dark:text-cyan-300 flex items-center space-x-1">
                <span>🌊</span> <span>Chế độ dòng chảy theo Atlat GD tr.10</span>
              </div>
              <p class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">${props.regime_desc || props.desc || ''}</p>
              ${props.monthly_flow_pattern ? `<p class="text-[10px] text-slate-500 dark:text-slate-400 italic">${props.monthly_flow_pattern}</p>` : ''}
            </div>
          </div>
        `;
        return;
      }

      if (props.category === "reservoir_lake") {
        infoContainer.innerHTML = `
          <div class="space-y-2.5">
            <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
              <h4 class="font-bold text-xs text-teal-700 dark:text-teal-300 flex items-center space-x-1.5">
                <span>🏞️</span> <span>${props.name}</span>
              </h4>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">${props.sub_type === 'lake' ? 'Hồ Tự Nhiên' : 'Hồ Điều Tiết Thủy Lợi / Thủy Điện'}</span>
            </div>
            <div class="grid grid-cols-2 gap-2 text-center text-xs">
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Lưu vực sông</span>
                <span class="font-bold text-blue-600 dark:text-blue-400 text-[11px]">${props.basin || 'N/A'}</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Dung tích / Quy mô</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">${props.capacity || props.area_km2 || 'Lớn'}</span>
              </div>
            </div>
            <div class="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/50 space-y-1">
              <div class="text-[10px] font-bold text-teal-800 dark:text-teal-300 flex items-center space-x-1">
                <span>🏞️</span> <span>Vai trò điều tiết thủy văn (Atlat GD tr.10)</span>
              </div>
              <p class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">${props.role || props.desc || ''}</p>
            </div>
            <p class="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed italic">${props.desc || ''}</p>
          </div>
        `;
        return;
      }

      infoContainer.innerHTML = `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h4 class="font-bold text-xs text-blue-700 dark:text-blue-300 flex items-center space-x-1.5">
              <span>🌡️</span> <span>${props.name}</span>
            </h4>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">${props.source || 'Atlat GD, tr.8 & tr.9'}</span>
          </div>
          ${props.avg_temp ? `
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Nhiệt độ TB</span>
                <span class="font-bold text-blue-600">${props.avg_temp}</span>
              </div>
              <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span class="text-[9px] text-slate-400 block font-bold">Biên độ nhiệt</span>
                <span class="font-bold text-amber-600">${props.temp_range || 'N/A'}</span>
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

    if (type === "industrial") {
      const sectorsHtml = (props.sectors || []).map(s => `
        <div class="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <div class="flex items-center space-x-1.5">
            <span class="w-2.5 h-2.5 rounded-full inline-block shrink-0" style="background-color: ${s.color};"></span>
            <span class="text-slate-700 dark:text-slate-300">${s.sector || s.name}</span>
          </div>
          <span class="font-bold text-slate-900 dark:text-slate-100 font-mono">${s.share}%</span>
        </div>
      `).join("");

      infoContainer.innerHTML = `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h4 class="font-bold text-xs text-purple-700 dark:text-purple-300 flex items-center space-x-1.5">
              <span>🏭</span> <span>${props.name}</span>
            </h4>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">${props.source || 'Atlat GD, tr.18 & tr.22'}</span>
          </div>
          <div class="text-[11px] text-slate-600 dark:text-slate-400">
            Quy mô GRDP: <strong class="text-purple-700 dark:text-purple-300">${props.scale_desc || props.scale_tier || ''}</strong>
          </div>
          <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <div class="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Cơ cấu GRDP 4 khu vực kinh tế:</div>
            ${sectorsHtml}
          </div>
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
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">${props.source || 'Atlat GD, tr.13'}</span>
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
      const pType = props.plant_type || props.type || "Thủy điện";
      const pRaw = pType.toLowerCase();
      const isThermal = pRaw.includes("nhiệt") || pRaw.includes("nhiet");
      const isSolar = pRaw.includes("mặt trời") || pRaw.includes("mat troi");
      const isWind = pRaw.includes("gió") || pRaw.includes("gio");
      const starColor = isThermal ? "#DC2626" : (isWind ? "#16A34A" : (isSolar ? "#EA580C" : "#0284C7"));
      const starIcon = `<svg width="20" height="20" viewBox="0 0 24 24" class="inline-block"><polygon points="12,1 15.3,8.3 23.3,9.2 17.3,14.6 19.1,22.5 12,18.4 4.9,22.5 6.7,14.6 0.7,9.2 8.7,8.3" fill="${starColor}" stroke="#FFFFFF" stroke-width="1.5"/></svg>`;
      const badgeBg = isThermal ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300";

      infoContainer.innerHTML = `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h4 class="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>${starIcon}</span> <span>${props.name}</span>
            </h4>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeBg}">${pType} (Atlat tr.23)</span>
          </div>
          <div class="text-[11px] text-slate-700 dark:text-slate-300 space-y-1">
            <div>Loại năng lượng: <strong>${pType}</strong></div>
            <div>Quy mô công suất: <strong class="${isThermal ? 'text-rose-600' : 'text-blue-600'} font-semibold">${props.capacity_group || (props.capacity_mw ? (props.capacity_mw >= 1000 ? 'Trên 1.000 MW' : 'Dưới 1.000 MW') : 'Chuẩn Atlat GD, tr.23')}</strong></div>
            <div>Nguồn nhiên liệu / Sông: <strong>${props.river_fuel || 'N/A'}</strong> ${props.province ? `(${(props.province || '').startsWith('Tỉnh ') || (props.province || '').startsWith('Thành phố ') ? props.province : 'Tỉnh ' + props.province})` : ''}</div>
          </div>
        </div>
      `;
      return;
    }

    if (type === "transportation") {
      const isAirport = (props.category || "").includes("airport") || (props.name || "").includes("hàng không");
      const isPort = (props.category || "").includes("seaport") || (props.name || "").includes("Cảng biển");
      const isRailway = (props.category || "").includes("railway") || (props.name || "").includes("Đường sắt");
      const iconChar = isAirport ? "✈️" : (isPort ? "⚓" : (isRailway ? "🚂" : "🛣️"));

      infoContainer.innerHTML = `
        <div class="space-y-2.5">
          <div class="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800">
            <h4 class="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>${iconChar}</span> <span>${props.name}</span>
            </h4>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">${props.source || 'Atlat GD, tr.24'}</span>
          </div>
          <div class="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-[11px]">
            <div><strong>Phân loại:</strong> ${props.type || 'Hạ tầng giao thông huyết mạch'}</div>
            ${props.length_km ? `<div><strong>Chiều dài:</strong> <span class="font-bold font-mono text-blue-600 dark:text-blue-400">${formatVNNum(props.length_km)} km</span></div>` : ''}
            ${props.capacity ? `<div><strong>Quy mô / Công suất:</strong> <span class="font-bold text-emerald-600 dark:text-emerald-400">${props.capacity}</span></div>` : ''}
            ${props.pass_provinces ? `<div><strong>Các tỉnh đi qua:</strong> ${props.pass_provinces}</div>` : ''}
            ${props.province ? `<div><strong>Địa bàn:</strong> ${props.province}</div>` : ''}
            ${props.role ? `<div><strong>Vai trò chiến lược:</strong> ${props.role}</div>` : ''}
          </div>
          <div class="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[10px] text-amber-800 dark:text-amber-300">
            💡 <strong>Trọng tâm thi THPT (Atlat tr.23):</strong> ${props.exam_tip || props.desc || 'Tuyến huyết mạch gắn kết các vùng kinh tế và đảm bảo an ninh quốc phòng.'}
          </div>
        </div>
      `;
      return;
    }

    // Default: Tỉnh thành
    const is34 = provinceMode === "34" || props.resolution;
    const isCity = checkIsCity(props);
    const adminTypeBadge = isCity 
      ? '<span class="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold">Thành phố Trực thuộc TW</span>'
      : '<span class="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-bold">Tỉnh</span>';

    const examTipsMap = {
      "Thành phố Quảng Ninh": "Thành phố trực thuộc Trung ương (NQ Quốc hội 24/8/2026). Trữ lượng than đá lớn nhất cả nước (bể than Đông Bắc), có cảng nước sâu Cái Lân, đảo Cô Tô và di sản thiên nhiên thế giới Vịnh Hạ Long (chuyển đổi mô hình tăng trưởng xanh, kiểm soát chặt chẽ hoạt động xây dựng ven bờ và vùng đệm).",
      "Quảng Ninh": "Thành phố trực thuộc Trung ương (NQ Quốc hội 24/8/2026). Trữ lượng than đá lớn nhất cả nước (bể than Đông Bắc), có cảng nước sâu Cái Lân, đảo Cô Tô và di sản thiên nhiên thế giới Vịnh Hạ Long (chuyển đổi mô hình tăng trưởng xanh, kiểm soát chặt chẽ hoạt động xây dựng ven bờ và vùng đệm).",
      "Thành phố Bắc Ninh": "Thành phố trực thuộc Trung ương (NQ Quốc hội 24/8/2026). Thủ phủ công nghiệp điện tử - bán dẫn công nghệ cao, bảo tồn hệ thống di tích quốc gia đặc biệt, làng nghề truyền thống và không gian văn hóa Quan họ.",
      "Bắc Ninh": "Thành phố trực thuộc Trung ương (NQ Quốc hội 24/8/2026). Thủ phủ công nghiệp điện tử - bán dẫn công nghệ cao, bảo tồn hệ thống di tích quốc gia đặc biệt, làng nghề truyền thống và không gian văn hóa Quan họ.",
      "Hà Nội": "Thủ đô, trung tâm kinh tế - văn hóa lớn nhất miền Bắc, trung tâm công nghiệp quy mô rất lớn (Atlat GD, tr.22).",
      "Thành phố Hồ Chí Minh": "Đô thị đặc biệt, đầu tàu kinh tế cả nước, trung tâm công nghiệp quy mô rất lớn, cảng biển có sản lượng container lớn nhất.",
      "Bà Rịa - Vũng Tàu": "Thủ phủ dầu khí ngoài thềm lục địa (mỏ Bạch Hổ, Rồng, Rạng Đông), cụm cảng quốc tế Cái Mép - Thị Vải.",
      "Cà Mau": "Điểm cực Nam của Tổ quốc (Mũi Cà Mau), cụm Khí - Điện - Đạm Cà Mau, diện tích rừng ngập mặn lớn nhất nước.",
      "Đắk Lắk": "Thủ phủ cà phê Việt Nam (Buôn Ma Thuột), đất đỏ bazan màu mỡ diện tích lớn nhất Tây Nguyên.",
      "Lâm Đồng": "Thế mạnh rau quả và hoa ôn đới, du lịch sinh thái Đà Lạt, tiềm năng thủy điện lớn trên sông Đồng Nai.",
      "Thành phố Đồng Nai": "Thành phố trực thuộc Trung ương, trung tâm công nghiệp - dịch vụ hiện đại vùng Đông Nam Bộ, sở hữu Cảng hàng không quốc tế Long Thành.",
      "Đồng Nai": "Thành phố trực thuộc Trung ương, trung tâm công nghiệp - dịch vụ hiện đại vùng Đông Nam Bộ, sở hữu Cảng hàng không quốc tế Long Thành."
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
          <span>Kiến thức Atlat Địa lí THPT (Atlat GD, tr.4-5):</span>
        </div>
        <div class="text-[11px] text-blue-700 dark:text-blue-400">Đơn vị hành chính truyền thống ôn thi tốt nghiệp.</div>
        ${props.merged_into ? `<div class="text-[10px] text-slate-600 dark:text-slate-300 mt-1 font-semibold">➡️ Từ 01/7/2025 sáp nhập thành: <span class="text-blue-600 dark:text-blue-400">${props.merged_into}</span></div>` : ''}
      </div>
    `;

    const grdpTier = GRDP_PER_CAPITA_TIERS[props.name] || 3;
    const grdpTierLabels = {
      1: "Từ 125 triệu đồng/người trở lên",
      2: "100 đến dưới 125 triệu đồng/người",
      3: "75 đến dưới 100 triệu đồng/người",
      4: "Dưới 75 triệu đồng/người"
    };

    const isIslandSpecial = props.is_special_island || props.name.includes("Hoàng Sa") || props.name.includes("Trường Sa");

    if (isIslandSpecial) {
      infoContainer.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div class="flex items-center space-x-2">
              <span class="text-lg">🇻🇳</span>
              <h4 class="font-bold text-sm text-red-600 dark:text-red-400">${props.name}</h4>
            </div>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">Chủ Quyền Quốc Gia</span>
          </div>
          <div class="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
            <div>Đơn vị quản lý: <strong>${props.name.includes('Hoàng Sa') ? 'Đặc khu Hoàng Sa, trực thuộc UBND TP. Đà Nẵng' : 'Đặc khu Trường Sa, trực thuộc UBND Tỉnh Khánh Hoà'}</strong></div>
            <div>Vị trí chiến lược: <strong>Vùng biển đảo thiêng liêng tiền tiêu của Tổ quốc trên Biển Đông</strong></div>
            <div class="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-1">Căn cứ pháp lý: Nghị quyết Quốc hội & Tuyên bố Chính phủ 12/11/1982 • Atlat GD tr.4-5</div>
          </div>
        </div>
      `;
      return;
    }

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
          <span class="text-[10px] font-bold text-slate-400">${is34 ? 'NQ 202/2025' : 'Atlat GD, tr.4-5'}</span>
        </div>

        ${mergedBlock}

        <div class="grid grid-cols-3 gap-1.5 text-center text-xs">
          <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <span class="text-[9px] text-slate-400 block uppercase font-medium">Diện tích (tr.5)</span>
            <span class="font-bold tabular-nums text-slate-800 dark:text-slate-100 text-[11px]">${formatVNNum(props.area)} km²</span>
          </div>
          <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <span class="text-[9px] text-slate-400 block uppercase font-medium">Dân số (tr.5)</span>
            <span class="font-bold tabular-nums text-slate-800 dark:text-slate-100 text-[11px]">${formatVNNum(props.pop)} k người</span>
          </div>
          <div class="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
            <span class="text-[9px] text-slate-400 block uppercase font-medium">Mật độ (tr.17)</span>
            <span class="font-bold text-blue-600 dark:text-blue-400 tabular-nums text-[11px]">${formatVNNum(props.density)} ng/km²</span>
          </div>
        </div>

        <!-- Cấp GRDP bình quân đầu người theo Atlat GD tr.18 -->
        <div class="p-2.5 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between text-xs">
          <span class="text-slate-600 dark:text-slate-400 text-[11px]">GRDP bình quân đầu người:</span>
          <span class="font-bold text-blue-700 dark:text-blue-300 text-[11px]">${grdpTierLabels[grdpTier]}</span>
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
      legendEl.className = isLegendCollapsed
        ? "absolute bottom-3 left-3 z-[900] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl text-xs shadow-md border border-slate-200 dark:border-slate-700 max-w-[280px] pointer-events-auto transition-all"
        : "absolute bottom-3 left-3 z-[900] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 rounded-xl text-xs shadow-md border border-slate-200 dark:border-slate-700 max-w-[280px] max-h-[260px] overflow-y-auto space-y-2 pointer-events-auto transition-all";
      mapContainer.appendChild(legendEl);
    } else {
      legendEl.className = isLegendCollapsed
        ? "absolute bottom-3 left-3 z-[900] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl text-xs shadow-md border border-slate-200 dark:border-slate-700 max-w-[280px] pointer-events-auto transition-all"
        : "absolute bottom-3 left-3 z-[900] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 rounded-xl text-xs shadow-md border border-slate-200 dark:border-slate-700 max-w-[280px] max-h-[260px] overflow-y-auto space-y-2 pointer-events-auto transition-all";
    }

    const sections = [];

    // Chú giải Chuyên đề Nền (Base Theme hoặc Choropleth Heatmap)
    if (currentChoroplethMode === "density") {
      const pal = CHOROPLETH_PALETTES.density;
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            ${pal.title} (${pal.source})
          </div>
          <div class="space-y-0.5 text-[10px]">
            ${pal.ranges.map(r => `<div class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:${r.color}; border: 1px solid rgba(0,0,0,0.1)"></span><span>${r.label}</span></div>`).join("")}
          </div>
        </div>
      `);
    } else if (currentChoroplethMode === "grdp") {
      const pal = CHOROPLETH_PALETTES.grdp;
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            ${pal.title} (${pal.source})
          </div>
          <div class="space-y-0.5 text-[10px]">
            ${pal.ranges.map(r => `<div class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:${r.color}; border: 1px solid rgba(0,0,0,0.1)"></span><span>${r.label}</span></div>`).join("")}
          </div>
        </div>
      `);
    } else if (currentBaseMapMode === "physical") {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Phân Tầng Độ Cao (Atlat GD, tr.3 & tr.7)
          </div>
          <div class="grid grid-cols-2 gap-1 text-[10px]">
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#86efac"></span><span>< 50 m</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#bef264"></span><span>50 - 200 m</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#fde047"></span><span>200 - 500 m</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#fb923c"></span><span>500 - 1000 m</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#ea580c"></span><span>1000 - 1500 m</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#9a3412"></span><span>> 1500 m</span></div>
          </div>
        </div>
      `);
    } else if (currentBaseMapMode === "climate") {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            2 Miền & 7 Vùng Khí Hậu (Atlat GD, tr.8)
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#a7f3d0"></span><span class="truncate">Tây Bắc</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#6ee7b7"></span><span class="truncate">Đông Bắc</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#93c5fd"></span><span class="truncate">ĐB Bắc Bộ</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#38bdf8"></span><span class="truncate">Bắc Trung Bộ</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#fde047"></span><span class="truncate">Nam Trung Bộ</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#fb923c"></span><span class="truncate">Tây Nguyên</span></div>
            <div class="flex items-center space-x-1"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#f472b6"></span><span class="truncate">Nam Bộ</span></div>
          </div>
        </div>
      `);
    } else if (currentBaseMapMode === "economic") {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-purple-700 dark:text-purple-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Quy Mô GRDP Tỉnh (Atlat GD, tr.18)
          </div>
          <div class="space-y-0.5 text-[10px]">
            <div class="flex items-center space-x-1.5"><span class="w-3.5 h-3.5 rounded-full border border-purple-600 inline-block shrink-0"></span><span>≥ 1 000 nghìn tỉ</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-3 h-3 rounded-full border border-purple-600 inline-block shrink-0"></span><span>300 - < 1 000 nghìn tỉ</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-full border border-purple-600 inline-block shrink-0"></span><span>100 - < 300 nghìn tỉ</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-2 h-2 rounded-full border border-purple-600 inline-block shrink-0"></span><span>< 100 nghìn tỉ</span></div>
          </div>
        </div>
      `);
    } else if (activeLayers.provinces) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            6 Vùng Kinh Tế (Atlat GD, tr.4-5 & tr.18)
          </div>
          <div class="space-y-0.5 text-[10px]">
            <div class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#10b981"></span><span class="truncate">I. Trung du và miền núi phía Bắc</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#3b82f6"></span><span class="truncate">II. Đồng bằng sông Hồng</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#06b6d4"></span><span class="truncate">III. Bắc Trung Bộ</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#f59e0b"></span><span class="truncate">IV. Duyên hải Nam Trung Bộ & Tây Nguyên</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#ec4899"></span><span class="truncate">V. Đông Nam Bộ</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background:#8b5cf6"></span><span class="truncate">VI. Đồng bằng sông Cửu Long</span></div>
          </div>
        </div>
      `);
    }

    // Các lớp chuyên đề bật kèm
    if (activeLayers.topography) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Địa hình & Sông (Atlat GD, tr.7 & tr.10)
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
            <div class="flex items-center space-x-1"><span class="text-black dark:text-white font-black text-[10px]">▲</span> <span>Đỉnh núi cao</span></div>
            <div class="flex items-center space-x-1"><span class="w-4 h-0.5 border-t-2 border-dashed border-amber-800 inline-block"></span> <span>Dãy núi / Cánh cung</span></div>
            <div class="flex items-center space-x-1"><span class="w-3 h-2 bg-amber-800 rounded-xs inline-block"></span> <span>Cao nguyên badan</span></div>
            <div class="flex items-center space-x-1"><span class="w-3 h-1 bg-sky-600 inline-block"></span> <span>Sông chính</span></div>
          </div>
        </div>
      `);
    }

    if (activeLayers.climate) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Khí Hậu & Thủy Văn (Atlat GD, tr.8 - 10)
          </div>
          <div class="text-[10px] space-y-0.5">
            <div class="flex items-center space-x-1.5"><svg width="8" height="8" viewBox="0 0 10 10" class="shrink-0"><circle cx="5" cy="5" r="4.5" fill="#ffffff" stroke="#dc2626" stroke-width="2"/><circle cx="5" cy="5" r="2" fill="#dc2626"/></svg> <span>Trạm khí tượng (Nhiệt - Mưa Atlat tr.8)</span></div>
            <div class="flex items-center space-x-1.5"><svg width="8" height="8" viewBox="0 0 10 10" class="shrink-0"><circle cx="5" cy="5" r="4.5" fill="#ffffff" stroke="#0284c7" stroke-width="2"/><circle cx="5" cy="5" r="2" fill="#0284c7"/></svg> <span>Trạm thủy văn (Lưu lượng nước tr.10)</span></div>
            <div class="flex items-center space-x-1.5"><svg width="8" height="8" viewBox="0 0 10 10" class="shrink-0"><rect x="1" y="2" width="8" height="6" rx="2" fill="#0d9488"/></svg> <span>Hồ thủy văn & điều tiết lũ/kiệt</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-3 h-0.5 border-t-2 border-dashed border-purple-600 inline-block"></span> <span>Ranh giới Bạch Mã 16°B</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-3 h-1 bg-blue-600 inline-block"></span> <span>Gió mùa Đông Bắc (Tháng XI - IV)</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-3 h-1 bg-red-600 inline-block"></span> <span>Gió mùa Tây Nam (Tháng V - X)</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-3 h-1 bg-amber-600 inline-block"></span> <span>Gió Tây khô nóng (Phơn)</span></div>
            <div class="flex items-center space-x-1.5"><span class="font-bold text-purple-700">↗</span> <span>Hướng bão (Tháng VI - XII)</span></div>
          </div>
        </div>
      `);
    }

    if (activeLayers.minerals_power) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-slate-700 dark:text-slate-300 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Ký hiệu Khoáng Sản & Điện (Tr.3, 13, 23)
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
            <div class="flex items-center space-x-1">${getMineralSvg("coal")} <span>Than</span></div>
            <div class="flex items-center space-x-1">${getMineralSvg("oil")} <span>Dầu mỏ</span></div>
            <div class="flex items-center space-x-1">${getMineralSvg("gas")} <span>Khí đốt</span></div>
            <div class="flex items-center space-x-1">${getMineralSvg("iron")} <span>Sắt (Fe)</span></div>
            <div class="flex items-center space-x-1">${getMineralSvg("bauxite")} <span>Bôxit (Al)</span></div>
            <div class="flex items-center space-x-1">${getMineralSvg("apatite")} <span>Apatit (A)</span></div>
            <div class="flex items-center space-x-1">${getMineralSvg("tin")} <span>Thiếc (Sn)</span></div>
            <div class="flex items-center space-x-1">${getMineralSvg("titan")} <span>Titan (Ti)</span></div>
            <div class="flex items-center space-x-1">${getPowerSvg("Thủy điện", 1000)} <span>Thủy điện</span></div>
            <div class="flex items-center space-x-1">${getPowerSvg("Nhiệt điện", 1000)} <span>Nhiệt điện</span></div>
          </div>
        </div>
      `);
    }

    if (activeLayers.agriculture) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Nông, Lâm & Thủy Sản (Atlat GD, tr.3 & tr.19-21)
          </div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px]">
            <div class="flex items-center space-x-1"><span>🌾</span> <span>Lúa & lương thực</span></div>
            <div class="flex items-center space-x-1"><span>☕</span> <span>Cà phê, cao su, chè</span></div>
            <div class="flex items-center space-x-1"><span>🐃</span> <span>Trâu, bò</span></div>
            <div class="flex items-center space-x-1"><span>🐖</span> <span>Lợn & gia cầm</span></div>
            <div class="flex items-center space-x-1"><span>🐟</span> <span>Thủy sản nuôi & khai thác</span></div>
            <div class="flex items-center space-x-1"><span>🌲</span> <span>Lâm nghiệp & rừng</span></div>
          </div>
        </div>
      `);
    }

    if (activeLayers.transportation) {
      sections.push(`
        <div class="legend-section space-y-1">
          <div class="text-[10px] font-bold uppercase text-red-700 dark:text-red-400 pb-0.5 border-b border-slate-100 dark:border-slate-800">
            Giao Thông Vận Tải (Atlat GD, tr.3 & tr.24)
          </div>
          <div class="text-[10px] space-y-0.5">
            <div class="flex items-center space-x-1.5"><span class="w-4 h-1 bg-red-600 inline-block rounded-full"></span> <span>Quốc lộ 1A (Trục Bắc - Nam)</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-4 h-1 bg-green-600 inline-block rounded-full"></span> <span>Đường Hồ Chí Minh</span></div>
            <div class="flex items-center space-x-1.5"><span class="w-4 h-0.5 border-t-2 border-dashed border-slate-900 dark:border-slate-100 inline-block"></span> <span>Đường sắt Thống Nhất</span></div>
            <div class="flex items-center space-x-1.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="#DC2626"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg> <span>Cảng hàng không quốc tế (Đỏ)</span></div>
            <div class="flex items-center space-x-1.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="#0F172A"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg> <span>Cảng hàng không nội địa (Đen)</span></div>
            <div class="flex items-center space-x-1.5"><svg width="10" height="10" viewBox="0 0 24 24" fill="#0284C7"><path d="M12 2a3 3 0 0 0-3 3c0 1.3.84 2.4 2 2.82V10H9v2h2v7.17A7 7 0 0 1 5 12h-2a9 9 0 0 0 8 8.95V22h2v-1.05A9 9 0 0 0 21 12h-2a7 7 0 0 1-6 7.17V12h2v-2h-2V7.82c1.16-.42 2-1.52 2-2.82a3 3 0 0 0-3-3zm0 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/></svg> <span>Cảng biển nước sâu / tổng hợp</span></div>
          </div>
        </div>
      `);
    }

    if (sections.length === 0) {
      legendEl.innerHTML = `<div class="text-[11px] text-slate-400 italic text-center py-1">Đã tắt các lớp chuyên đề</div>`;
      return;
    }

    legendEl.innerHTML = `
      <div class="space-y-1.5">
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1 cursor-pointer select-none" onclick="AtlasEngine.toggleLegendCollapse()">
          <span class="font-bold text-[11px] uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center space-x-1">
            <span>📖</span> <span>Chú Giải Atlat</span>
          </span>
          <div class="flex items-center space-x-1">
            <span class="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-1.5 py-0.2 rounded-full">THPT</span>
            <button id="btn-legend-collapse" onclick="AtlasEngine.toggleLegendCollapse(); event.stopPropagation();" title="Thu gọn / Mở rộng bảng chú giải" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold leading-none px-1">${isLegendCollapsed ? "▼" : "▲"}</button>
          </div>
        </div>
        <div id="atlas-dynamic-legend-body" class="space-y-2 pt-0.5 ${isLegendCollapsed ? "hidden" : ""}">
          ${sections.join("")}
        </div>
      </div>
    `;
  }

  let isLegendCollapsed = false;
  function toggleLegendCollapse() {
    isLegendCollapsed = !isLegendCollapsed;
    const legendEl = document.getElementById("atlas-dynamic-legend");
    const body = document.getElementById("atlas-dynamic-legend-body") || document.getElementById("atlas-legend-body");
    const btn = document.getElementById("btn-legend-collapse");
    if (body) {
      body.classList.toggle("hidden", isLegendCollapsed);
    }
    if (btn) {
      btn.innerText = isLegendCollapsed ? "▼" : "▲";
    }
    if (legendEl) {
      if (isLegendCollapsed) {
        legendEl.className = "absolute bottom-3 left-3 z-[900] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl text-xs shadow-md border border-slate-200 dark:border-slate-700 max-w-[280px] pointer-events-auto transition-all";
      } else {
        legendEl.className = "absolute bottom-3 left-3 z-[900] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-3 rounded-xl text-xs shadow-md border border-slate-200 dark:border-slate-700 max-w-[280px] max-h-[260px] overflow-y-auto space-y-2 pointer-events-auto transition-all";
      }
    }
  }

  // Bật/tắt lớp độc lập
  async function toggleLayer(name, visible) {
    if (!map) return;
    activeLayers[name] = !!visible;

    const chk = document.getElementById(`layer-chk-${name}`);
    if (chk && chk.checked !== !visible) {
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
      } else if (name === "transportation") {
        await renderTransportationLayer();
        if (!map.hasLayer(layerTransportation)) map.addLayer(layerTransportation);
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
      if (name === "transportation" && layerTransportation && map.hasLayer(layerTransportation)) map.removeLayer(layerTransportation);
      if (name === "provinces" && layerProvinces && map.hasLayer(layerProvinces)) map.removeLayer(layerProvinces);
    }

    updateDynamicLegend();
  }

  // Sổ Tay Ký Hiệu & Cẩm Nang Atlat Chuẩn THPT
  function openSymbolHandbook(defaultTab = "minerals") {
    const modal = document.getElementById("symbol-handbook-modal");
    if (!modal) return;
    modal.classList.remove("hidden");
    setSymbolHandbookTab(defaultTab);
  }

  function closeSymbolHandbook() {
    const modal = document.getElementById("symbol-handbook-modal");
    if (modal) modal.classList.add("hidden");
  }

  function setSymbolHandbookTab(tab) {
    const tabs = ["minerals", "power", "agriculture", "matrix"];
    tabs.forEach(t => {
      const btn = document.getElementById(`hb-tab-btn-${t}`);
      const pane = document.getElementById(`hb-pane-${t}`);
      if (btn) {
        if (t === tab) {
          btn.className = "px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-sm transition";
        } else {
          btn.className = "px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition";
        }
      }
      if (pane) {
        pane.classList.toggle("hidden", t !== tab);
      }
    });
  }

  // ===========================================================================
  // HỆ SINH THÁI ATLAT KÉP: LẬT TRANG ATLAT GIẤY GỐC & BẢN ĐỒ SỐ GIS 34 TỈNH
  // ===========================================================================
  let atlasViewMode = "gis"; // "gis" | "book" | "split"
  const DEFAULT_ATLAT_PAGES_MANIFEST = [
    { page: 1, title: "Trang 1: Bìa Atlat Địa lí Việt Nam 2026", file: "./public/data/atlat_pages/page_01.jpg?v=2026.3.11" },
    { page: 3, title: "Trang 3: Kí hiệu chung", file: "./public/data/atlat_pages/page_03.jpg?v=2026.3.11" },
    { page: 4, title: "Trang 4: Hành chính (Phía Bắc & Bắc Trung Bộ)", file: "./public/data/atlat_pages/page_04.jpg?v=2026.3.11" },
    { page: 5, title: "Trang 5: Hành chính (Phía Nam) & Bảng diện tích, dân số 34 đơn vị", file: "./public/data/atlat_pages/page_05.jpg?v=2026.3.11" },
    { page: 6, title: "Trang 6: Hình thể & Địa hình (Phía Bắc)", file: "./public/data/atlat_pages/page_06.jpg?v=2026.3.11" },
    { page: 7, title: "Trang 7: Hình thể & Địa hình (Phía Nam) - Mốc toạ độ & Đường cơ sở", file: "./public/data/atlat_pages/page_07.jpg?v=2026.3.11" },
    { page: 8, title: "Trang 8: Khí hậu chung & 15 Trạm khí tượng", file: "./public/data/atlat_pages/page_08.jpg?v=2026.3.11" },
    { page: 9, title: "Trang 9: Các miền khí hậu & Lượng mưa, nhiệt độ", file: "./public/data/atlat_pages/page_09.jpg?v=2026.3.11" },
    { page: 10, title: "Trang 10: Các hệ thống sông ngòi Việt Nam", file: "./public/data/atlat_pages/page_10.jpg?v=2026.3.11" },
    { page: 13, title: "Trang 13: Địa chất & Khoáng sản", file: "./public/data/atlat_pages/page_13.jpg?v=2026.3.11" },
    { page: 18, title: "Trang 18: Kinh tế chung - Các vùng kinh tế & Quy mô GRDP", file: "./public/data/atlat_pages/page_18.jpg?v=2026.3.11" },
    { page: 19, title: "Trang 19: Nông nghiệp chung", file: "./public/data/atlat_pages/page_19.jpg?v=2026.3.11" },
    { page: 21, title: "Trang 21: Công nghiệp chung", file: "./public/data/atlat_pages/page_21.jpg?v=2026.3.11" },
    { page: 22, title: "Trang 22: Các ngành công nghiệp trọng điểm", file: "./public/data/atlat_pages/page_22.jpg?v=2026.3.11" },
    { page: 23, title: "Trang 23: Giao thông vận tải & Thương mại", file: "./public/data/atlat_pages/page_23.jpg?v=2026.3.11" }
  ];
  let atlatPagesManifest = [...DEFAULT_ATLAT_PAGES_MANIFEST];
  let currentAtlatPageNumber = 4;
  let currentAtlatPageIndex = 2; // Trang 4 Hành chính Bắc
  let atlatBookZoom = 1.0;
  let atlatBookPanX = 0;
  let atlatBookPanY = 0;
  let isAtlatBookDragging = false;
  let atlatBookDragStartX = 0;
  let atlatBookDragStartY = 0;
  let atlatBookTouchDist = 0;
  let atlatBookTouchZoom = 1.0;
  let atlatBookGesturesAttached = false;
  let isPageFlipping = false;
  let activeFlipTimer = null;
  let activeFlipCleanup = null;
  let isFlipSoundMuted = false;
  let flipAudioCtx = null;

  try {
    const savedSound = localStorage.getItem("geoatlas_flip_sound");
    if (savedSound === "muted") isFlipSoundMuted = true;
  } catch (e) {}

  function toggleFlipSound() {
    isFlipSoundMuted = !isFlipSoundMuted;
    try {
      localStorage.setItem("geoatlas_flip_sound", isFlipSoundMuted ? "muted" : "active");
    } catch (e) {}
    const iconEl = document.getElementById("flip-sound-icon");
    if (iconEl) {
      iconEl.innerText = isFlipSoundMuted ? "🔇" : "🔊";
    }
  }

  function playPageFlipSound() {
    if (isFlipSoundMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!flipAudioCtx) {
        flipAudioCtx = new AudioCtx();
      }
      if (flipAudioCtx.state === 'suspended') {
        flipAudioCtx.resume().catch(() => {});
      }

      const duration = 0.32;
      const sampleRate = flipAudioCtx.sampleRate;
      const bufferSize = Math.floor(sampleRate * duration);
      const buffer = flipAudioCtx.createBuffer(1, bufferSize, sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const envelope = Math.sin(t * Math.PI) * Math.pow(1 - t, 0.85);
        const noise = (Math.random() * 2 - 1) * (0.8 + 0.2 * Math.sin(i * 0.05));
        data[i] = noise * envelope * 0.22;
      }

      const noiseSource = flipAudioCtx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = flipAudioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1400, flipAudioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(360, flipAudioCtx.currentTime + duration);
      filter.Q.setValueAtTime(1.8, flipAudioCtx.currentTime);

      const gainNode = flipAudioCtx.createGain();
      gainNode.gain.setValueAtTime(0.75, flipAudioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, flipAudioCtx.currentTime + duration);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(flipAudioCtx.destination);

      noiseSource.start();
    } catch (err) {
      // Audio autoplay policy or unavailable WebAudio silently ignored
    }
  }

  // Cẩm nang sư phạm & Trọng tâm thi tốt nghiệp THPT theo từng trang Atlat GD
  const ATLAT_PAGE_STUDY_GUIDE = {
    1: {
      page: 1,
      title: "Bìa Atlat Địa lí Việt Nam",
      badge: "Ấn bản GD 2026",
      theme: "admin",
      target: "Nhận biết cấu trúc tổng thể 32 trang chuyên đề Atlat Địa lí Việt Nam phục vụ học tập và thi tốt nghiệp THPT.",
      keyFeatures: [
        "Nhà xuất bản Giáo dục Việt Nam - Đơn vị ấn hành chính thức chuẩn mực.",
        "Phân bổ khoa học 4 nhóm phân hệ: Tự nhiên (Tr.6-14), Dân cư (Tr.15-17), Kinh tế chung & Ngành (Tr.18-25), Vùng kinh tế (Tr.26-32)."
      ],
      examTraps: "Quan sát kĩ số trang và tên bản đồ được nêu trong câu hỏi trắc nghiệm để lật chính xác trang Atlat.",
      recommendedLayer: "provinces"
    },
    3: {
      page: 3,
      title: "Kí hiệu chung",
      badge: "Nền Tảng Bắt Buộc",
      theme: "admin",
      target: "Nhận biết 100% hệ thống kí hiệu quy ước: địa hình, khoáng sản, thủy văn, động thực vật, nông lâm ngư nghiệp và công nghiệp.",
      keyFeatures: [
        "Khoáng sản nhiên liệu: Than đá (vuông đen), Than nâu (vuông sọc), Dầu mỏ (thang đen), Khí tự nhiên (thang trắng).",
        "Khoáng sản kim loại & phi kim: Sắt (tam giác đen), Bôxit (chữ nhật/thang màu tím chữ Al), Apatit (chữ nhật sọc chéo chữ A), Titan (tròn đen viền tia).",
        "Năng lượng: Nhà máy thủy điện (ngôi sao màu xanh), Nhà máy nhiệt điện (ngôi sao màu đỏ)."
      ],
      examTraps: "Bẫy phân biệt Than (vuông đen) vs Bôxit (chữ Al) vs Apatit (chữ A); Thủy điện (sao xanh) vs Nhiệt điện (sao đỏ).",
      recommendedLayer: "minerals_power"
    },
    4: {
      page: 4,
      title: "Hành chính (Phía Bắc & Bắc Trung Bộ)",
      badge: "Vùng I, II, III",
      theme: "admin",
      target: "Xác định vị trí địa lí, phạm vi lãnh thổ, tiếp giáp biên giới Việt - Trung, Việt - Lào; các tỉnh giáp biển và hải đảo phía Bắc.",
      keyFeatures: [
        "Điểm cực Bắc: Xã Lũng Cú, huyện Đồng Văn, tỉnh Hà Giang (vĩ độ 23°23'B).",
        "Điểm cực Tây: Xã Sín Thầu, huyện Mường Nhé, tỉnh Điện Biên (ngã ba biên giới Việt - Trung - Lào A Pa Chải, kinh độ 102°09'Đ).",
        "Đơn vị vừa giáp biển vừa giáp Trung Quốc: Thành phố Quảng Ninh (Thành phố trực thuộc Trung ương theo NQ 24/8/2026).",
        "7 tỉnh biên giới phía Bắc giáp Trung Quốc: Quảng Ninh, Lạng Sơn, Cao Bằng, Hà Giang, Lào Cai, Lai Châu, Điện Biên."
      ],
      examTraps: "Điện Biên giáp cả Lào và Trung Quốc tại ngã ba A Pa Chải (không chỉ giáp Lào).",
      recommendedLayer: "provinces"
    },
    5: {
      page: 5,
      title: "Hành chính (Phía Nam) & Bảng 34 đơn vị",
      badge: "Vùng IV, V, VI & Biển Đảo",
      theme: "admin",
      target: "Khai thác chuẩn xác bảng diện tích, dân số 34 đơn vị hành chính cấp tỉnh (Nghị quyết 202/2025/QH15); vị trí Hoàng Sa, Trường Sa và biển đảo Tổ quốc.",
      keyFeatures: [
        "Điểm cực Nam: Xã Đất Mũi, huyện Ngọc Hiển, tỉnh Cà Mau (8°34'B).",
        "Điểm cực Đông (đất liền): Mũi Đôi, xã Vạn Thạnh, Vạn Ninh, tỉnh Khánh Hoà (109°28'Đ).",
        "9 Thành phố trực thuộc Trung ương: Hà Nội, Hải Phòng, Quảng Ninh, Bắc Ninh, Huế, Đà Nẵng, Đồng Nai, TP. Hồ Chí Minh, Cần Thơ (theo NQ Quốc hội 24/8/2026 & NQ 202/2025/QH15).",
        "Hai quần đảo chiến lược: Quần đảo Hoàng Sa (TP. Đà Nẵng) và Quần đảo Trường Sa (Tỉnh Khánh Hoà).",
        "Bảng số liệu 34 đơn vị: Nghệ An có diện tích lớn nhất (16.486,5 km²), TP. Bắc Ninh có mật độ dân số cao bậc nhất; TP. Hồ Chí Minh đông dân nhất."
      ],
      examTraps: "So sánh diện tích hoặc dân số tỉnh thành: luôn đọc chuẩn xác số liệu in tại bảng tr.5 Atlat GD.",
      recommendedLayer: "provinces"
    },
    6: {
      page: 6,
      title: "Hình thể & Địa hình (Phía Bắc)",
      badge: "Miền Bắc & Đông Bắc Bắc Bộ",
      theme: "physical",
      target: "Đặc điểm địa hình miền Bắc: Hướng núi Tây Bắc - Đông Nam và Hướng Vòng Cung; các bậc phân tầng độ cao từ đồng bằng lên núi cao.",
      keyFeatures: [
        "4 Cánh cung Đông Bắc quy tụ tại Tam Đảo: Cánh cung Sông Gâm, Cánh cung Ngân Sơn, Cánh cung Bắc Sơn, Cánh cung Đông Triều.",
        "Dãy Hoàng Liên Sơn: Hướng Tây Bắc - Đông Nam, có đỉnh Phanxipăng 3.143 m (nóc nhà Đông Dương).",
        "Các cao nguyên đá vôi Tây Bắc: Mộc Châu, Sơn La, Tà Phình, Sín Chải."
      ],
      examTraps: "Cánh cung Đông Triều chạy từ Tây sang Đông và nhô ra sát biển vịnh Bắc Bộ (hướng vòng cung lồi ra biển).",
      recommendedLayer: "topography"
    },
    7: {
      page: 7,
      title: "Hình thể (Phía Nam) - Mốc toạ độ & Đường cơ sở",
      badge: "Trường Sơn Nam & Đường Cơ Sở",
      theme: "physical",
      target: "Đặc điểm hình thể miền Nam: Dãy Bạch Mã, khối núi Kon Tum, đỉnh Ngọc Linh (2.598 m), các cao nguyên badan xếp tầng và 11 mốc đường cơ sở ven bờ.",
      keyFeatures: [
        "Dãy Bạch Mã: Đâm ngang ra biển tại vĩ độ 16°B, là ranh giới tự nhiên ngăn cản gió mùa Đông Bắc tràn sâu xuống phía Nam.",
        "Hệ thống cao nguyên badan Tây Nguyên: Kon Tum, Pleiku, Đắk Lắk, Mơ Nông, Lâm Viên, Di Linh (địa hình phân bậc từ 500m đến 1.500m).",
        "Hệ thống 11 mốc đường cơ sở ven bờ (A1 Hòn Nhạn đến A11 Đảo Cồn Cỏ) xác định đường cơ sở thẳng để tính chiều rộng lãnh hải 12 hải lý."
      ],
      examTraps: "Điểm A1 ở Hòn Nhạn (Thổ Chu, Kiên Giang), không phải ở Mũi Cà Mau; Điểm A11 ở Đảo Cồn Cỏ (Quảng Trị).",
      recommendedLayer: "topography"
    },
    8: {
      page: 8,
      title: "Khí hậu chung & 15 Trạm khí tượng",
      badge: "Khí Tượng & Nhiệt Ẩm",
      theme: "climate",
      target: "Khai thác biểu đồ khí hậu của 15 trạm khí tượng tiêu biểu: nhiệt độ trung bình năm, biên độ nhiệt, tổng lượng mưa và tháng mưa cực đại.",
      keyFeatures: [
        "Ranh giới khí hậu: Dãy Bạch Mã phân chia miền khí hậu phía Bắc (có mùa đông lạnh, biên độ nhiệt lớn) và phía Nam (cận xích đạo, 2 mùa mưa - khô rõ rệt).",
        "Trạm có biên độ nhiệt năm cao nhất: Lạng Sơn (biên độ > 13°C), Hà Nội (biên độ ~ 12,5°C).",
        "Trạm có biên độ nhiệt năm thấp nhất: Cà Mau, TP. Hồ Chí Minh (< 3,5°C).",
        "Mùa mưa lệch sang thu - đông: Trạm Huế (tháng cực đại X - XI) và Đà Nẵng."
      ],
      examTraps: "Trạm có nhiệt độ tháng lạnh nhất dưới 18°C chỉ có ở miền Bắc (Lạng Sơn, Hà Nội, Sơn La). Miền Nam nhiệt độ quanh năm luôn trên 25°C.",
      recommendedLayer: "climate"
    },
    9: {
      page: 9,
      title: "Các miền khí hậu & Lượng mưa, nhiệt độ",
      badge: "Gió Mùa & Tần Suất Bão",
      theme: "climate",
      target: "Quy luật hoàn lưu gió mùa: Gió mùa Đông Bắc, Gió mùa Tây Nam, gió phơn khô nóng; tần suất bão di chuyển từ Bắc vào Nam theo các tháng.",
      keyFeatures: [
        "Gió mùa Đông Bắc (tháng XI - IV): Nửa đầu mùa lạnh khô, nửa sau mùa lạnh ẩm gây mưa phùn ven biển và đồng bằng Bắc Bộ.",
        "Gió mùa Tây Nam (tháng V - X): Gây mưa lớn cho Nam Bộ và Tây Nguyên; vượt dãy Trường Sơn gây gió phơn Tây Nam khô nóng cho Bắc Trung Bộ.",
        "Mùa bão: Bắt đầu tháng VI ở miền Bắc, chậm dần vào miền Trung (tháng IX - X tần suất lớn nhất) và đến tháng XII ở Nam Bộ."
      ],
      examTraps: "Tháng bão đổ bộ lớn nhất vào miền Trung là tháng IX và X (không phải tháng VI hay VII).",
      recommendedLayer: "climate"
    },
    10: {
      page: 10,
      title: "Các hệ thống sông ngòi Việt Nam",
      badge: "9 Hệ Thống Sông Lớn",
      theme: "physical",
      target: "9 hệ thống sông lớn; hình thái mạng lưới sông, chế độ dòng chảy theo mùa và các trạm thủy văn quan trắc.",
      keyFeatures: [
        "Hệ thống sông Hồng & Thái Bình: Mạng lưới hình nan quạt, mùa lũ kéo dài 5 tháng (VI - X), tháng đỉnh lũ là tháng VIII.",
        "Hệ thống sông miền Trung (Thu Bồn, Ba): Ngắn, dốc, lưu vực hẹp, mùa lũ lệch sang thu - đông (tháng IX - XII), lũ lên rất nhanh.",
        "Hệ thống sông Mê Kông (Tiền & Hậu): Điều hòa nước nhờ Biển Hồ, mùa lũ từ tháng VII đến XI, đỉnh lũ tháng X (mùa nước nổi hiền hòa)."
      ],
      examTraps: "Sông Đà là phụ lưu bên hữu ngạn (bên phải theo chiều dòng chảy), sông Lô ở tả ngạn sông Hồng.",
      recommendedLayer: "topography"
    },
    13: {
      page: 13,
      title: "Địa chất & Khoáng sản",
      badge: "Tài Nguyên Khoáng Sản",
      theme: "admin",
      target: "Phân bố các mỏ khoáng sản nhiên liệu, kim loại và phi kim loại trên bản đồ địa chất và các bồn trũng trầm tích dầu khí.",
      keyFeatures: [
        "Than đá: Bể than lớn nhất ở Quảng Ninh (Cẩm Phả, Hòn Gai, Mạo Khê). Than nâu ở Đồng bằng sông Hồng. Than bùn ở U Minh.",
        "Dầu mỏ & Khí tự nhiên: Bể trầm tích Cửu Long (Bạch Hổ, Rồng, Rạng Đông, Hồng Ngọc), Bể Nam Côn Sơn (Lan Tây, Lan Đỏ, Đại Hùng).",
        "Bôxit: Phân bố tập trung trữ lượng lớn trên cao nguyên badan Tây Nguyên (Đắk Nông, Lâm Đồng, Gia Lai).",
        "Apatit: Phân bố duy nhất tại Lào Cai (Cam Đường)."
      ],
      examTraps: "Mỏ sắt lớn nhất miền Trung là Thạch Khê (Hà Tĩnh); Apatit chỉ có ở Lào Cai; Bôxit tập trung ở Tây Nguyên.",
      recommendedLayer: "minerals_power"
    },
    18: {
      page: 18,
      title: "Kinh tế chung - 6 Vùng & Quy mô GRDP",
      badge: "6 Vùng Kinh Tế & GRDP",
      theme: "economic",
      target: "Khai thác 6 vùng kinh tế - xã hội; 4 cấp phân loại quy mô GRDP cấp tỉnh và các trung tâm kinh tế đầu tàu.",
      keyFeatures: [
        "6 Vùng kinh tế: I. Trung du và miền núi phía Bắc; II. Đồng bằng sông Hồng; III. Bắc Trung Bộ; IV. Duyên hải Nam Trung Bộ và Tây Nguyên; V. Đông Nam Bộ; VI. Đồng bằng sông Cửu Long.",
        "Quy mô GRDP từ 1.000 nghìn tỉ đồng trở lên: TP. Hồ Chí Minh và Thủ đô Hà Nội.",
        "Quy mô GRDP từ 300 đến dưới 1.000 nghìn tỉ: Hải Phòng, Biên Hòa, Bình Dương, Đồng Nai, Quảng Ninh...",
        "Hai vùng kinh tế trọng điểm đầu tàu cả nước: Đông Nam Bộ và Đồng bằng sông Hồng."
      ],
      examTraps: "Vùng Duyên hải Nam Trung Bộ và Tây Nguyên (Vùng IV) hợp nhất Tây Nguyên và duyên hải Nam Trung Bộ; Đông Nam Bộ dẫn đầu về GRDP bình quân đầu người.",
      recommendedLayer: "industrial"
    },
    19: {
      page: 19,
      title: "Nông nghiệp chung",
      badge: "Nông - Lâm - Thủy Sản",
      theme: "admin",
      target: "Xác định các vùng sản xuất nông nghiệp, vùng chuyên canh lúa, cây công nghiệp lâu năm và các ngư trường thủy sản lớn.",
      keyFeatures: [
        "Vùng trọng điểm lúa lớn nhất: Đồng bằng sông Cửu Long (> 50% diện tích & sản lượng lúa cả nước), thứ hai là Đồng bằng sông Hồng.",
        "Vùng cây công nghiệp lâu năm lớn nhất: Đông Nam Bộ (cao su, điều, hồ tiêu) và Tây Nguyên (cà phê số 1 cả nước, cao su, hồ tiêu).",
        "Chăn nuôi gia súc lớn: Trâu nhiều nhất ở Trung du và miền núi phía Bắc; Bò thịt/bò sữa ở Bắc Trung Bộ, Duyên hải Nam Trung Bộ, ĐBSH.",
        "Thủy sản nuôi trồng & đánh bắt: ĐBSCL là vùng dẫn đầu cả nước về cả nuôi trồng và đánh bắt (cá tra, tôm nước lợ)."
      ],
      examTraps: "Cà phê trồng nhiều nhất ở Tây Nguyên; Cao su và Điều nhiều nhất ở Đông Nam Bộ; Chè nhiều nhất ở Trung du miền núi phía Bắc.",
      recommendedLayer: "agriculture"
    },
    21: {
      page: 21,
      title: "Công nghiệp chung",
      badge: "Trung Tâm Công Nghiệp",
      theme: "economic",
      target: "Phân loại quy mô trung tâm công nghiệp (rất lớn, lớn, trung bình, nhỏ) và cơ cấu ngành của từng trung tâm.",
      keyFeatures: [
        "Trung tâm quy mô rất lớn (> 120 nghìn tỉ đồng): TP. Hồ Chí Minh, Hà Nội.",
        "Trung tâm quy mô lớn (40 - 120 nghìn tỉ đồng): Hải Phòng, Biên Hòa, Thủ Dầu Một, Vũng Tàu, Đà Nẵng, Cần Thơ.",
        "Hướng chuyên môn hóa công nghiệp: Dọc quốc lộ 18 (Hà Nội - Bắc Ninh - Hải Dương - Hạ Long); Dọc quốc lộ 1A."
      ],
      examTraps: "Đọc đúng cơ cấu ngành qua các biểu tượng ngành xung quanh vòng tròn quy mô của từng thành phố.",
      recommendedLayer: "industrial"
    },
    22: {
      page: 22,
      title: "Các ngành công nghiệp trọng điểm",
      badge: "Năng Lượng & Chế Biến",
      theme: "admin",
      target: "Phân bố công nghiệp năng lượng (thủy điện, nhiệt điện) và công nghiệp chế biến lương thực thực phẩm.",
      keyFeatures: [
        "Thủy điện trên 1.000 MW: Sơn La (2.400 MW - lớn nhất Đông Nam Á), Hòa Bình (1.920 MW), Lai Châu (1.200 MW) trên sông Đà; Yaly (720 MW) trên sông Xê Xan.",
        "Nhiệt điện than: Phả Lại, Uông Bí, Cẩm Phả, Mông Dương, Duyên Hải, Vĩnh Tân.",
        "Nhiệt điện khí: Cụm Phú Mỹ (Bà Rịa - Vũng Tàu), Cà Mau, Nhơn Trạch (chạy bằng khí tự nhiên thềm lục địa)."
      ],
      examTraps: "Sơn La và Hòa Bình nằm trên sông Đà (hữu ngạn sông Hồng); Thác Bà trên sông Chảy; Tuyên Quang trên sông Gâm; Trị An trên sông Đồng Nai.",
      recommendedLayer: "minerals_power"
    },
    23: {
      page: 23,
      title: "Giao thông vận tải & Thương mại",
      badge: "Hạ Tầng Huyết Mạch",
      theme: "admin",
      target: "Các tuyến huyết mạch đường bộ (QL1A, Đường Hồ Chí Minh), đường sắt Thống Nhất, hệ thống cảng biển nước sâu và sân bay quốc tế.",
      keyFeatures: [
        "Quốc lộ 1A: Tuyến đường bộ xương sống chạy dài từ Cửa khẩu Hữu Nghị (Lạng Sơn) đến Năm Căn (Cà Mau), dài 2.395 km.",
        "Đường Hồ Chí Minh: Đi qua dải núi phía Tây, thúc đẩy phát triển kinh tế dải đất miền Tây Tổ quốc.",
        "Đường sắt Thống Nhất: Tuyến huyết mạch Bắc - Nam từ ga Hà Nội đến ga Sài Gòn (dài 1.726 km).",
        "Cụm cảng biển đặc biệt & quốc tế: Cảng Hải Phòng (Lạch Huyện), Cảng Cái Mép - Thị Vải (cảng nước sâu quốc tế đón tàu mẹ đi thẳng Âu - Mỹ).",
        "Sân bay quốc tế cửa ngõ: Nội Bài, Tân Sơn Nhất, Đà Nẵng, Cam Ranh, Phú Quốc, Cát Bi."
      ],
      examTraps: "Cảng Cái Mép - Thị Vải là cụm cảng nước sâu lớn nhất phía Nam; Đường sắt Thống Nhất song song với Quốc lộ 1A trên phần lớn chiều dài đất nước.",
      recommendedLayer: "transportation"
    }
  };

  async function initAtlatPages() {
    try {
      const res = await fetch("./public/data/atlat_pages/manifest.json");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          atlatPagesManifest = data;
        }
      }
    } catch (e) {
      console.warn("Could not load atlat_pages manifest, using embedded default:", e);
    }

    // Populate dropdown #atlat-book-page-select if not already populated
    const selectEl = document.getElementById("atlat-book-page-select");
    if (selectEl && atlatPagesManifest && atlatPagesManifest.length > 0) {
      selectEl.innerHTML = atlatPagesManifest.map(p => 
        `<option value="${p.page}" ${p.page === 4 ? "selected" : ""}>Trang ${p.page}: ${p.title.replace(/^Trang\s+\d+:\s*/, '')}</option>`
      ).join('');
    }

    // Default select page 4 (Hành chính Bắc)
    selectAtlatBookPage(4);
  }

  function applyAtlatBookTransform() {
    const wrapper = document.getElementById("atlat-book-wrapper");
    const zoomTextEl = document.getElementById("atlat-book-zoom-val");
    if (wrapper) {
      wrapper.style.transform = `translate(${atlatBookPanX}px, ${atlatBookPanY}px) scale(${atlatBookZoom})`;
    }
    if (zoomTextEl) {
      zoomTextEl.innerText = `${Math.round(atlatBookZoom * 100)}%`;
    }
  }

  function resetAtlatBookZoom() {
    atlatBookZoom = 1.0;
    atlatBookPanX = 0;
    atlatBookPanY = 0;
    applyAtlatBookTransform();
  }

  function fitAtlatBookWidth() {
    const container = document.getElementById("atlat-book-viewport");
    const img = document.getElementById("atlat-book-page-img");
    if (container && img && img.naturalWidth) {
      const containerW = container.clientWidth - 24;
      const scale = Math.max(0.5, Math.min(3.5, (containerW / img.naturalWidth) * 1.2));
      atlatBookZoom = scale;
      atlatBookPanX = 0;
      atlatBookPanY = 0;
      applyAtlatBookTransform();
    } else {
      atlatBookZoom = 1.4;
      atlatBookPanX = 0;
      atlatBookPanY = 0;
      applyAtlatBookTransform();
    }
  }

  function zoomAtlatBook(delta) {
    atlatBookZoom = Math.min(4.0, Math.max(0.4, atlatBookZoom + delta));
    applyAtlatBookTransform();
  }

  function prevAtlatBookPage() {
    if (atlatPagesManifest && atlatPagesManifest.length > 0) {
      if (currentAtlatPageIndex > 0) {
        currentAtlatPageIndex--;
        selectAtlatBookPage(atlatPagesManifest[currentAtlatPageIndex].page, 'prev');
      }
    }
  }

  function nextAtlatBookPage() {
    if (atlatPagesManifest && atlatPagesManifest.length > 0) {
      if (currentAtlatPageIndex < atlatPagesManifest.length - 1) {
        currentAtlatPageIndex++;
        selectAtlatBookPage(atlatPagesManifest[currentAtlatPageIndex].page, 'next');
      }
    }
  }

  function attachAtlatBookGestures() {
    if (atlatBookGesturesAttached) return;
    const viewport = document.getElementById("atlat-book-viewport");
    if (!viewport) return;

    let dragOriginX = 0;
    let dragOriginY = 0;
    let dragStartTime = 0;

    viewport.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      isAtlatBookDragging = true;
      dragOriginX = e.clientX;
      dragOriginY = e.clientY;
      dragStartTime = Date.now();
      atlatBookDragStartX = e.clientX - atlatBookPanX;
      atlatBookDragStartY = e.clientY - atlatBookPanY;
      viewport.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", (e) => {
      if (!isAtlatBookDragging) return;
      atlatBookPanX = e.clientX - atlatBookDragStartX;
      atlatBookPanY = e.clientY - atlatBookDragStartY;
      applyAtlatBookTransform();
    });

    window.addEventListener("mouseup", (e) => {
      if (isAtlatBookDragging) {
        isAtlatBookDragging = false;
        if (viewport) viewport.style.cursor = "grab";

        const deltaX = e.clientX - dragOriginX;
        const deltaY = e.clientY - dragOriginY;
        const elapsed = Date.now() - dragStartTime;

        // Nếu zoom ở mức bình thường (<= 1.15), kéo ngang > 60px được xem là cử chỉ lật trang 3D
        if (atlatBookZoom <= 1.15 && Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && elapsed < 800) {
          if (deltaX < -60) {
            nextAtlatBookPage();
          } else if (deltaX > 60) {
            prevAtlatBookPage();
          }
        }
      }
    });

    // Cuộn chuột: Phóng to / Thu nhỏ mượt mà
    viewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.15 : -0.15;
      zoomAtlatBook(delta);
    }, { passive: false });

    // Nháy đúp: Đổi giữa 100% và 200%
    viewport.addEventListener("dblclick", () => {
      if (atlatBookZoom > 1.2) {
        resetAtlatBookZoom();
      } else {
        atlatBookZoom = 2.0;
        applyAtlatBookTransform();
      }
    });

    // Touch
    let touchOriginX = 0;
    let touchOriginY = 0;
    let touchStartTime = 0;

    viewport.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        isAtlatBookDragging = true;
        touchOriginX = e.touches[0].clientX;
        touchOriginY = e.touches[0].clientY;
        touchStartTime = Date.now();
        atlatBookDragStartX = e.touches[0].clientX - atlatBookPanX;
        atlatBookDragStartY = e.touches[0].clientY - atlatBookPanY;
      } else if (e.touches.length === 2) {
        isAtlatBookDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        atlatBookTouchDist = Math.hypot(dx, dy);
        atlatBookTouchZoom = atlatBookZoom;
      }
    }, { passive: true });

    viewport.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1 && isAtlatBookDragging) {
        atlatBookPanX = e.touches[0].clientX - atlatBookDragStartX;
        atlatBookPanY = e.touches[0].clientY - atlatBookDragStartY;
        applyAtlatBookTransform();
      } else if (e.touches.length === 2 && atlatBookTouchDist > 0) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const factor = dist / atlatBookTouchDist;
        atlatBookZoom = Math.min(4.0, Math.max(0.4, atlatBookTouchZoom * factor));
        applyAtlatBookTransform();
      }
    }, { passive: true });

    viewport.addEventListener("touchend", (e) => {
      if (isAtlatBookDragging) {
        isAtlatBookDragging = false;
        if (e.changedTouches && e.changedTouches.length === 1) {
          const deltaX = e.changedTouches[0].clientX - touchOriginX;
          const deltaY = e.changedTouches[0].clientY - touchOriginY;
          const elapsed = Date.now() - touchStartTime;

          // Vuốt ngang lật trang trên màn hình cảm ứng
          if (atlatBookZoom <= 1.15 && Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && elapsed < 700) {
            if (deltaX < -45) {
              nextAtlatBookPage();
            } else if (deltaX > 45) {
              prevAtlatBookPage();
            }
          }
        }
      }
      atlatBookTouchDist = 0;
    }, { passive: true });

    // Phím mũi tên lật trang
    window.addEventListener("keydown", (e) => {
      if (atlasViewMode === "gis") return;
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT")) return;
      if (e.key === "ArrowLeft") {
        prevAtlatBookPage();
      } else if (e.key === "ArrowRight") {
        nextAtlatBookPage();
      }
    });

    atlatBookGesturesAttached = true;
  }

  function selectAtlatBookPage(pageNumber) {
    const num = Number(pageNumber);
    if (isNaN(num)) return;

    const imgEl = document.getElementById("atlat-book-page-img");
    const titleEl = document.getElementById("atlat-book-page-title");
    const selectEl = document.getElementById("atlat-book-page-select");

    const guide = ATLAT_PAGE_STUDY_GUIDE[num];
    const displayTitle = guide ? `Trang ${num}: ${guide.title}` : `Bản đồ Atlat Địa lí Việt Nam - Trang ${num}`;
    const pageFile = `./public/data/atlat_pages/page_${String(num).padStart(2, '0')}.jpg?v=2026.3.16`;

    if (imgEl) {
      imgEl.alt = displayTitle;
    }

    let direction = arguments[1];
    if (!direction && currentAtlatPageNumber) {
      if (num > currentAtlatPageNumber) direction = 'next';
      else if (num < currentAtlatPageNumber) direction = 'prev';
    }

    const previousPageNumber = currentAtlatPageNumber || 4;
    currentAtlatPageNumber = num;

    if (atlatPagesManifest && atlatPagesManifest.length > 0) {
      const idx = atlatPagesManifest.findIndex(p => p.page === num);
      if (idx !== -1) currentAtlatPageIndex = idx;
    }

    // Cập nhật trạng thái hiển thị của các nút chuyển hướng (Paddles & Corner Curl)
    const paddlePrev = document.getElementById("atlat-paddle-prev");
    const paddleNext = document.getElementById("atlat-paddle-next");
    const cornerCurl = document.getElementById("atlat-corner-curl");
    if (paddlePrev) {
      const isFirst = currentAtlatPageIndex <= 0;
      paddlePrev.style.opacity = isFirst ? "0.2" : "";
      paddlePrev.style.pointerEvents = isFirst ? "none" : "";
    }
    if (paddleNext) {
      const isLast = currentAtlatPageIndex >= (atlatPagesManifest ? atlatPagesManifest.length - 1 : 14);
      paddleNext.style.opacity = isLast ? "0.2" : "";
      paddleNext.style.pointerEvents = isLast ? "none" : "";
    }
    if (cornerCurl) {
      const isLast = currentAtlatPageIndex >= (atlatPagesManifest ? atlatPagesManifest.length - 1 : 14);
      cornerCurl.style.display = isLast ? "none" : "block";
    }

    if (titleEl) titleEl.innerText = displayTitle;
    if (selectEl) selectEl.value = num;

    renderAtlatPageStudyGuide(num);

    if (atlasViewMode === "split") {
      syncGisWithAtlatPage(num);
    }

    const leaf = document.getElementById("atlat-book-flip-leaf");
    const underLayer = document.getElementById("atlat-book-under-layer");
    const underImg = document.getElementById("atlat-book-under-img");
    const frontImg = document.getElementById("atlat-flip-front-img");
    const backImg = document.getElementById("atlat-flip-back-img");
    const mainLayer = document.getElementById("atlat-book-main-layer");

    // Nếu đang có hoạt ảnh lật dở thì hoàn tất ngay lập tức để chuyển trang mới trơn tru
    if (activeFlipCleanup) {
      activeFlipCleanup();
    }

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Chuyển trang tức thì nếu không yêu cầu hoạt ảnh, hệ thống tắt motion hoặc cùng trang
    if (prefersReducedMotion || !direction || !leaf || previousPageNumber === num) {
      if (imgEl) {
        imgEl.alt = displayTitle;
        imgEl.onerror = () => {
          if (!imgEl.dataset.retried) {
            imgEl.dataset.retried = "1";
            imgEl.src = `./public/data/atlat_pages/page_${String(num).padStart(2, '0')}.jpg?t=${Date.now()}`;
          }
        };
        imgEl.onload = () => {
          imgEl.dataset.retried = "";
          if (atlatBookZoom <= 1.2) fitAtlatBookWidth();
        };
        imgEl.src = pageFile;
      }
      return;
    }

    // CHẠY HOẠT ẢNH LẬT TRANG 3D CHÂN THỰC
    isPageFlipping = true;
    playPageFlipSound();

    const prevFile = `./public/data/atlat_pages/page_${String(previousPageNumber).padStart(2, '0')}.jpg?v=2026.3.16`;

    if (direction === 'next') {
      if (underImg) underImg.src = pageFile;
      if (underLayer) underLayer.classList.remove("hidden");

      if (frontImg) frontImg.src = prevFile;
      if (backImg) backImg.src = pageFile;

      if (mainLayer) mainLayer.style.visibility = "hidden";
      leaf.classList.remove("hidden", "flip-anim-prev");
      leaf.classList.add("flip-anim-next");
    } else {
      if (underImg) underImg.src = prevFile;
      if (underLayer) underLayer.classList.remove("hidden");

      if (frontImg) frontImg.src = pageFile;
      if (backImg) backImg.src = prevFile;

      if (mainLayer) mainLayer.style.visibility = "hidden";
      leaf.classList.remove("hidden", "flip-anim-next");
      leaf.classList.add("flip-anim-prev");
    }

    const cleanupFlip = () => {
      if (activeFlipTimer) {
        clearTimeout(activeFlipTimer);
        activeFlipTimer = null;
      }
      activeFlipCleanup = null;
      if (imgEl) {
        imgEl.alt = displayTitle;
        imgEl.src = pageFile;
      }
      if (mainLayer) mainLayer.style.visibility = "visible";
      if (underLayer) underLayer.classList.add("hidden");
      if (leaf) {
        leaf.classList.add("hidden");
        leaf.classList.remove("flip-anim-next", "flip-anim-prev");
      }
      isPageFlipping = false;
      if (atlatBookZoom <= 1.2) {
        fitAtlatBookWidth();
      }
    };

    activeFlipCleanup = cleanupFlip;
    leaf.addEventListener("animationend", cleanupFlip, { once: true });
    activeFlipTimer = setTimeout(cleanupFlip, 580);
  }

  function renderAtlatPageStudyGuide(pageNumber) {
    const cardEl = document.getElementById("atlat-page-guide-card");
    if (!cardEl) return;

    const num = Number(pageNumber);
    const guide = ATLAT_PAGE_STUDY_GUIDE[num] || {
      page: num,
      title: `Trang ${num}`,
      badge: "Chuẩn Atlat GD",
      target: "Khai thác thông tin không gian và số liệu trên bản đồ theo yêu cầu đề thi.",
      keyFeatures: ["Đối chiếu các đối tượng địa lí tự nhiên, dân cư và kinh tế xã hội trên trang bản đồ."],
      examTraps: "Quan sát kĩ chú giải và tỉ lệ bản đồ để nhận định chính xác.",
      recommendedLayer: "provinces"
    };

    const featuresHtml = guide.keyFeatures.map(f => `
      <li class="flex items-start space-x-2 text-[11px] text-slate-700 dark:text-slate-300">
        <span class="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
        <span>${f}</span>
      </li>
    `).join('');

    cardEl.innerHTML = `
      <div class="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div class="flex items-center space-x-2">
          <span class="text-base">📖</span>
          <h4 class="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
            Trang ${guide.page}: ${guide.title}
          </h4>
        </div>
        <span class="atlat-page-guide-badge bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          ${guide.badge}
        </span>
      </div>

      <!-- Trọng tâm thi THPT -->
      <div class="space-y-1.5 bg-blue-50/60 dark:bg-blue-950/30 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
        <span class="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center space-x-1">
          <span>🎯</span>
          <span>Trọng tâm thi tốt nghiệp THPT:</span>
        </span>
        <p class="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          ${guide.target}
        </p>
      </div>

      <!-- Điểm then chốt cần nhận dạng -->
      <div class="space-y-1.5">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1">
          <span>🔍</span>
          <span>Đối tượng cốt lõi & Cách đọc:</span>
        </span>
        <ul class="space-y-1.5 pl-1">
          ${featuresHtml}
        </ul>
      </div>

      <!-- Bẫy đề thi kinh điển -->
      <div class="space-y-1 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/60">
        <span class="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center space-x-1">
          <span>⚠️</span>
          <span>Bẫy đề thi & Dễ nhầm lẫn:</span>
        </span>
        <p class="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
          ${guide.examTraps}
        </p>
      </div>

      <!-- Nút hành động tương tác -->
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2">
        <button 
          onclick="AtlasEngine.setAtlasViewMode('split')" 
          class="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
          title="Mở đối chiếu song song Atlat Giấy và Bản đồ số GIS"
        >
          <span>⚡</span>
          <span>Đối Chiếu Song Song (50:50)</span>
        </button>
        <button 
          onclick="AtlasEngine.syncGisWithAtlatPage(${guide.page}); AtlasEngine.setAtlasViewMode('gis');" 
          class="py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition flex items-center space-x-1"
          title="Mở lớp GIS này trên bản đồ số toàn màn hình"
        >
          <span>🗺️</span>
          <span>Lớp GIS</span>
        </button>
      </div>
    `;
  }

  function syncGisWithAtlatPage(pageNumber) {
    const num = Number(pageNumber);
    const guide = ATLAT_PAGE_STUDY_GUIDE[num];
    if (!guide) return;

    if (map) map.closePopup();

    if (num === 4 || num === 5 || num === 1) {
      setAtlatTheme('admin');
    } else if (num === 6 || num === 7) {
      setAtlatTheme('physical');
    } else if (num === 8 || num === 9) {
      setAtlatTheme('climate');
    } else if (num === 10) {
      setAtlatTheme('physical');
      renderTopographyLayer("rivers");
    } else if (num === 13) {
      setAtlatTheme('admin');
      if (layerMineralsPower && !map.hasLayer(layerMineralsPower)) map.addLayer(layerMineralsPower);
      renderMineralsPowerLayer("minerals");
    } else if (num === 18) {
      setAtlatTheme('economic');
    } else if (num === 19) {
      setAtlatTheme('admin');
      if (layerAgriculture && !map.hasLayer(layerAgriculture)) map.addLayer(layerAgriculture);
      renderAgricultureLayer();
    } else if (num === 21 || num === 22) {
      setAtlatTheme('economic');
      if (layerMineralsPower && !map.hasLayer(layerMineralsPower)) map.addLayer(layerMineralsPower);
      renderMineralsPowerLayer("power");
    } else if (num === 23) {
      setAtlatTheme('admin');
      if (layerTransportation && !map.hasLayer(layerTransportation)) map.addLayer(layerTransportation);
      renderTransportationLayer();
    } else if (guide.theme && typeof setAtlatTheme === "function") {
      setAtlatTheme(guide.theme);
    }
  }

  function setAtlasViewMode(mode) {
    atlasViewMode = mode;
    const gisMapCol = document.getElementById("gis-map-col");
    const gisControlsCol = document.getElementById("gis-controls-col");
    const atlatBookCol = document.getElementById("atlat-book-col");
    const atlatNotesCol = document.getElementById("atlat-notes-col");
    const atlatToolbar = document.getElementById("atlat-book-toolbar");

    const btnGis = document.getElementById("btn-view-gis");
    const btnBook = document.getElementById("btn-view-book");
    const btnSplit = document.getElementById("btn-view-split");

    const activeClasses = ["bg-blue-600", "text-white", "font-bold", "shadow-sm"];
    const inactiveClasses = ["text-slate-600", "dark:text-slate-300", "hover:bg-slate-200", "dark:hover:bg-slate-700", "font-semibold"];

    function setBtnStyle(btn, isActive) {
      if (!btn) return;
      if (isActive) {
        btn.classList.add(...activeClasses);
        btn.classList.remove(...inactiveClasses);
      } else {
        btn.classList.remove(...activeClasses);
        btn.classList.add(...inactiveClasses);
      }
    }

    setBtnStyle(btnGis, mode === "gis");
    setBtnStyle(btnBook, mode === "book");
    setBtnStyle(btnSplit, mode === "split");

    if (mode === "gis") {
      if (gisMapCol) {
        gisMapCol.classList.remove("hidden", "is-split-right", "lg:col-span-5", "lg:col-span-6", "lg:col-span-7");
        gisMapCol.classList.add("col-span-12", "lg:col-span-8");
      }
      if (gisControlsCol) {
        gisControlsCol.classList.remove("hidden", "lg:col-span-7", "lg:col-span-6", "lg:col-span-5");
        gisControlsCol.classList.add("col-span-12", "lg:col-span-4");
      }
      if (atlatBookCol) atlatBookCol.classList.add("hidden");
      if (atlatNotesCol) atlatNotesCol.classList.add("hidden");
      if (atlatToolbar) atlatToolbar.classList.add("hidden");

      const savedRatio = localStorage.getItem("geoatlas_split_gis") || "68";
      const atlasModeEl = document.getElementById("mode-atlas");
      if (atlasModeEl) atlasModeEl.style.setProperty("--atlas-split-left", savedRatio + "%");

      setTimeout(() => { if (map) map.invalidateSize(); }, 150);
    } else if (mode === "book") {
      if (gisMapCol) {
        gisMapCol.classList.add("hidden");
        gisMapCol.classList.remove("is-split-right");
      }
      if (gisControlsCol) gisControlsCol.classList.add("hidden");
      if (atlatBookCol) {
        atlatBookCol.classList.remove("hidden", "is-split-right", "lg:col-span-5", "lg:col-span-6", "lg:col-span-7");
        atlatBookCol.classList.add("col-span-12", "lg:col-span-8");
      }
      if (atlatNotesCol) {
        atlatNotesCol.classList.remove("hidden", "lg:col-span-7", "lg:col-span-6", "lg:col-span-5");
        atlatNotesCol.classList.add("col-span-12", "lg:col-span-4");
      }
      if (atlatToolbar) atlatToolbar.classList.remove("hidden");

      const savedRatio = localStorage.getItem("geoatlas_split_book") || "65";
      const atlasModeEl = document.getElementById("mode-atlas");
      if (atlasModeEl) atlasModeEl.style.setProperty("--atlas-split-left", savedRatio + "%");

      attachAtlatBookGestures();
      selectAtlatBookPage(currentAtlatPageNumber);
      setTimeout(() => fitAtlatBookWidth(), 50);
    } else if (mode === "split") {
      if (atlatBookCol) {
        atlatBookCol.classList.remove("hidden", "is-split-right", "lg:col-span-8", "lg:col-span-7", "lg:col-span-5", "lg:col-span-4");
        atlatBookCol.classList.add("col-span-12", "lg:col-span-6");
      }
      if (gisMapCol) {
        gisMapCol.classList.remove("hidden", "lg:col-span-8", "lg:col-span-7", "lg:col-span-5", "lg:col-span-4");
        gisMapCol.classList.add("col-span-12", "lg:col-span-6", "is-split-right");
      }
      if (gisControlsCol) gisControlsCol.classList.add("hidden");
      if (atlatNotesCol) atlatNotesCol.classList.add("hidden");
      if (atlatToolbar) atlatToolbar.classList.remove("hidden");

      const savedRatio = localStorage.getItem("geoatlas_split_split") || "50";
      const atlasModeEl = document.getElementById("mode-atlas");
      if (atlasModeEl) atlasModeEl.style.setProperty("--atlas-split-left", savedRatio + "%");

      attachAtlatBookGestures();
      selectAtlatBookPage(currentAtlatPageNumber);
      setTimeout(() => {
        fitAtlatBookWidth();
        if (map) {
          map.invalidateSize();
          fitVietnamBounds();
        }
      }, 150);
      isLegendCollapsed = true;
      syncGisWithAtlatPage(currentAtlatPageNumber);
      updateDynamicLegend();
    }
  }

  return {
    init,
    normalizeVN,
    setBaseMap,
    setAtlatTheme,
    setProvinceMode,
    getProvinceMode: () => provinceMode,
    setChoroplethMode,
    getChoroplethMode: () => currentChoroplethMode,
    renderProvinces,
    setProvincesOpacity,
    renderTopographyLayer,
    renderClimateLayer,
    renderAgricultureLayer,
    renderMineralsPowerLayer,
    renderIndustrialCenters,
    renderTransportationLayer,
    renderBaselineLayer,
    updateDynamicLegend,
    toggleLegendCollapse,
    toggleLayer,
    searchAndFlyTo,
    toggleMeasureTool,
    clearMeasure,
    openCompareModal,
    closeCompareModal,
    renderCompareTable,
    startMiniGame,
    closeMiniGame,
    setGameMode,
    getGameMode: () => gameMode,
    handleSilhouetteAnswer,
    handleSymbolAnswer,
    openSymbolHandbook,
    closeSymbolHandbook,
    setSymbolHandbookTab,
    setAtlasViewMode,
    getAtlasViewMode: () => atlasViewMode,
    selectAtlatBookPage,
    zoomAtlatBook,
    resetAtlatBookZoom,
    fitAtlatBookWidth,
    prevAtlatBookPage,
    nextAtlatBookPage,
    toggleFlipSound,
    playPageFlipSound,
    syncGisWithAtlatPage,
    renderAtlatPageStudyGuide,
    openAtlatPagesModal: (p = 4) => { setAtlasViewMode('book'); selectAtlatBookPage(p); },
    closeAtlatPagesModal: () => setAtlasViewMode('gis'),
    selectAtlatPage: selectAtlatBookPage,
    zoomAtlatPage: zoomAtlatBook,
    resetAtlatPageZoom: resetAtlatBookZoom,
    fitAtlatPageWidth: fitAtlatBookWidth,
    prevAtlatPage: prevAtlatBookPage,
    nextAtlatPage: nextAtlatBookPage,
    resetView: () => fitVietnamBounds({ duration: 1.2 }),
    fitVietnamBounds,
    getMap: () => map
  };
})();

window.AtlasEngine = AtlasEngine;
