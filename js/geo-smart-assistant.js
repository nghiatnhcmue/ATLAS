/**
 * ===========================================================================
 * GEOATLAS INTERACTIVE - HỘP TÌM KIẾM & TRỢ LÍ TRÍ TUỆ NHÂN TẠO (AI) ĐỊA LÍ
 * (Integrated Smart Geo-Search & AI Expert Assistant)
 * ===========================================================================
 * Hệ thống Trí Tuệ Nhân Tạo 3 Tầng:
 * 1. AI Sư Phạm Nội Tuyến (100% Offline, Zero-Latency, Chuẩn Sư Phạm Bộ GD&ĐT)
 * 2. AI Trình Duyệt Nội Thiết (On-Device Web AI / Chrome Gemini Nano)
 * 3. AI Đám Mây Sâu (Google Gemini Free Tier qua API Key cá nhân)
 *
 * Tích hợp:
 * - Chẩn đoán & giải đáp quy tắc biểu đồ (Bẫy trắc nghiệm, công thức)
 * - Định vị không gian trực tiếp trên Bản đồ số GIS
 * - Chỉ dẫn & lật trang 3D Atlat Địa lí Việt Nam
 * - Hướng dẫn nhận xét bảng số liệu 4 bước chuẩn thi
 * - Tạo câu hỏi trắc nghiệm tự động theo trang Atlat
 */

window.GeoSmartAssistant = (function () {
  "use strict";

  // =========================================================================
  // 1. CẤU HÌNH & LƯU TRỮ CHẾ ĐỘ AI (AI SETTINGS)
  // =========================================================================
  let currentAIMode = "offline"; // "offline" | "gemini" | "window_ai"
  let geminiApiKey = "";
  let geminiModel = "gemini-1.5-flash";

  try {
    const savedMode = localStorage.getItem("geoatlas_ai_mode");
    if (savedMode) currentAIMode = savedMode;
    const savedKey = localStorage.getItem("geoatlas_gemini_key");
    if (savedKey) geminiApiKey = savedKey;
    const savedModel = localStorage.getItem("geoatlas_gemini_model");
    if (savedModel) geminiModel = savedModel;
  } catch (e) {}

  function getAIMode() { return currentAIMode; }
  function setAIMode(mode) {
    currentAIMode = mode;
    try { localStorage.setItem("geoatlas_ai_mode", mode); } catch (e) {}
    updateAIModeUI();
  }

  function getGeminiApiKey() { return geminiApiKey; }
  function setGeminiApiKey(key) {
    geminiApiKey = key.trim();
    try { localStorage.setItem("geoatlas_gemini_key", geminiApiKey); } catch (e) {}
  }

  function getGeminiModel() { return geminiModel; }
  function setGeminiModel(model) {
    geminiModel = model;
    try { localStorage.setItem("geoatlas_gemini_model", geminiModel); } catch (e) {}
  }

  // =========================================================================
  // 2. CƠ SỞ TRI THỨC BIỂU ĐỒ & BẪY TRẮC NGHIỆM ĐỊA LÍ THPT
  // =========================================================================
  const CHART_KNOWLEDGE_BASE = [
    {
      type: "line",
      name: "Biểu đồ ĐƯỜNG (Line Chart)",
      icon: "📈",
      keywords: ["toc do tang truong", "toc do phat trien", "toc do gia tang", "dong thai phat trien", "tang truong qua cac nam", "toc do"],
      triggers: ["tốc độ tăng trưởng", "tốc độ phát triển", "tốc độ gia tăng", "động thái phát triển"],
      rule: "Cứ xuất hiện từ khóa 'TỐC ĐỘ TĂNG TRƯỞNG' hoặc 'TỐC ĐỘ PHÁT TRIỂN' trong chuỗi thời gian ≥ 3 năm $\\rightarrow$ BẮT BUỘC CHỌN BIỂU ĐỒ ĐƯỜNG.",
      trap: "BẪY KINH ĐIỂN: Đề bài cho bảng số liệu đơn vị %, học sinh thường nhầm chọn Biểu đồ Cột hoặc Tròn. Nhớ rằng: Bảng số liệu có chữ 'tốc độ' thì bất kể đơn vị gốc là gì, bắt buộc phải chọn biểu đồ ĐƯỜNG (lấy năm gốc = 100%).",
      formula: "Tốc độ tăng trưởng năm $t = \\frac{\\text{Giá trị năm } t}{\\text{Giá trị năm gốc}} \\times 100\\%$ (Năm gốc luôn xuất phát từ $100\\%$ trên trục tung).",
      recommendedTab: "mode-charts",
      calcFormulaId: "growth_rate"
    },
    {
      type: "area",
      name: "Biểu đồ MIỀN (Area Chart)",
      icon: "🏔️",
      keywords: ["chuyen dich co cau", "thay doi co cau", "co cau qua cac nam", "ti trong qua cac nam"],
      triggers: ["chuyển dịch cơ cấu", "thay đổi cơ cấu", "cơ cấu từ 3 năm", "cơ cấu từ 4 năm"],
      condition: (query, yearsCount) => query.includes("chuyen dich co cau") || query.includes("thay doi co cau") || ((query.includes("co cau") || query.includes("ti trong")) && yearsCount >= 3) || query.includes("3 nam") || query.includes("4 nam"),
      rule: "Thể hiện SỰ CHUYỂN DỊCH CƠ CẤU / THAY ĐỔI CƠ CẤU theo chuỗi thời gian từ 3 hoặc 4 năm trở lên $\\rightarrow$ BẮT BUỘC CHỌN BIỂU ĐỒ MIỀN.",
      trap: "BẪY TRÒN vs MIỀN: Nhìn thấy từ 'cơ cấu' học sinh hay vội vàng chọn Tròn. Quy tắc bất di bất dịch của Bộ GD&ĐT: Cơ cấu $\\le 2$ năm chọn Tròn; Cơ cấu $\\ge 3$ năm hoặc $\\ge 4$ năm BẮT BUỘC chọn MIỀN (vì vẽ $\\ge 3$ hình tròn sẽ rối mắt, khó quan sát sự liên tục).",
      formula: "Trục tung luôn cố định từ $0\\%$ đến $100\\%$. Vẽ theo thứ tự cộng dồn (tích lũy) từng thành phần từ dưới lên trên.",
      recommendedTab: "mode-charts",
      calcFormulaId: "proportion"
    },
    {
      type: "pie",
      name: "Biểu đồ TRÒN (Pie Chart)",
      icon: "🥧",
      keywords: ["co cau", "ti trong", "quy mo va co cau"],
      triggers: ["cơ cấu 1 năm", "cơ cấu 2 năm", "tỉ trọng 1-2 năm", "quy mô và cơ cấu 2 năm"],
      condition: (query, yearsCount) => !query.includes("chuyen dich co cau") && (yearsCount <= 2 || query.includes("1 nam") || query.includes("2 nam") || query.includes("hai nam") || query.includes("mot nam")),
      rule: "Thể hiện CƠ CẤU / TỈ TRỌNG của đối tượng trong phạm vi 1 đến 2 năm (hoặc so sánh giữa 2 vùng/quốc gia) $\\rightarrow$ BẮT BUỘC CHỌN BIỂU ĐỒ TRÒN.",
      trap: "BẪY BÁN KÍNH: Khi 2 năm có quy mô tổng thể khác nhau (ví dụ năm 2015 quy mô 100 nghìn tỉ, 2024 quy mô 320 nghìn tỉ) $\\rightarrow$ Bắt buộc phải vẽ hai hình tròn có BÁN KÍNH KHÁC NHAU ($R_2 > R_1$). Nếu vẽ bán kính bằng nhau là SAI quy chuẩn thi tốt nghiệp.",
      formula: "Tỉ trọng thành phần $\\% = \\frac{\\text{Giá trị thành phần}}{\\text{Tổng quy mô}} \\times 100\\%$. Bán kính: $R_2 = R_1 \\times \\sqrt{\\frac{\\text{Quy mô } 2}{\\text{Quy mô } 1}}$.",
      recommendedTab: "mode-charts",
      calcFormulaId: "proportion"
    },
    {
      type: "bar_stacked",
      name: "Biểu đồ CỘT CHỒNG (Stacked Bar Chart)",
      icon: "📊",
      keywords: ["quy mo va co cau", "co cau va quy mo", "tong quy mo va cac thanh phan"],
      triggers: ["quy mô và cơ cấu", "cơ cấu và quy mô"],
      condition: (query, yearsCount) => (query.includes("quy mo va co cau") || query.includes("co cau va quy mo")) && (yearsCount >= 3 || !query.includes("2 nam")),
      rule: "Đề bài yêu cầu thể hiện ĐỒNG THỜI CẢ QUY MÔ VÀ CƠ CẤU qua chuỗi thời gian $\\ge 3$ năm với đơn vị đo tuyệt đối (nghìn tỉ đồng, triệu tấn, triệu người...) $\\rightarrow$ BẮT BUỘC CHỌN BIỂU ĐỒ CỘT CHỒNG.",
      trap: "BẪY ĐƠN VỊ: Cột chồng vừa thể hiện được tổng số bằng chiều cao của cột (đơn vị tuyệt đối), vừa thể hiện được tỉ trọng bên trong bằng các đoạn phân chia. Đừng nhầm với Cột ghép hay Biểu đồ Miền.",
      formula: "Chiều cao cột = Tổng số = Thành phần 1 + Thành phần 2 + Thành phần 3... (Giữ nguyên số liệu tuyệt đối, không quy đổi ra %).",
      recommendedTab: "mode-charts",
      calcFormulaId: "proportion"
    },
    {
      type: "bar",
      name: "Biểu đồ CỘT (Bar Chart / Column Chart)",
      icon: "📊",
      keywords: ["so sanh", "quy mo", "san luong", "dien tich", "khoi luong", "gia tri", "so luong"],
      triggers: ["so sánh", "quy mô", "sản lượng", "diện tích", "khối lượng", "giá trị"],
      rule: "Đề bài yêu cầu SO SÁNH QUY MÔ / ĐỘ LỚN / SỐ LƯỢNG giữa các vùng, các địa phương hoặc giữa các năm $\\rightarrow$ CHỌN BIỂU ĐỒ CỘT (Cột đơn, Cột nhóm/ghép, Cột thanh ngang).",
      trap: "Nếu so sánh nhiều đối tượng tại 1 hoặc 2 thời điểm $\\rightarrow$ Chọn Cột nhóm. Nếu so sánh nhiều vùng/tỉnh có tên dài $\\rightarrow$ Cột ngang.",
      formula: "Dựng trục tung đúng khoảng chia đơn vị, độ rộng các cột bằng nhau và có khoảng cách giữa các nhóm.",
      recommendedTab: "mode-charts",
      calcFormulaId: null
    },
    {
      type: "combo",
      name: "Biểu đồ KẾT HỢP (Cột + Đường / Combo Chart)",
      icon: "📉",
      keywords: ["hai don vi", "vua quy mo vua toc do", "san luong va toc do", "dien tich va nang suat"],
      triggers: ["kết hợp", "hai đơn vị", "vừa quy mô vừa tốc độ", "sản lượng và năng suất"],
      rule: "Bảng số liệu có 2 ĐƠN VỊ ĐO KHÁC NHAU (ví dụ: Sản lượng nghìn tấn và Tốc độ %; hoặc Diện tích nghìn ha và Năng suất tạ/ha) $\\rightarrow$ BẮT BUỘC CHỌN BIỂU ĐỒ KẾT HỢP với 2 trục tung.",
      trap: "Biểu đồ kết hợp luôn có 2 trục tung ở 2 bên: Trục bên trái cho đại lượng có cột, Trục bên phải cho đại lượng có đường.",
      formula: "Không bao giờ gộp chung 2 đơn vị khác nhau vào 1 trục tung.",
      recommendedTab: "mode-charts",
      calcFormulaId: null
    }
  ];

  // =========================================================================
  // 3. CƠ SỞ DỮ LIỆU ĐỊA DANH, KHU KINH TẾ & TRANG ATLAT CHUẨN GD
  // =========================================================================
  const GEO_ENTITIES_KNOWLEDGE = [
    {
      id: "dung_quat",
      name: "Khu kinh tế Dung Quất (Quảng Ngãi)",
      category: "Khu kinh tế ven biển",
      lat: 15.3536,
      lng: 108.7834,
      zoom: 11,
      layerKey: "industrial",
      atlatPage: 18,
      atlatSubPages: [21, 22],
      aliases: ["dung quat", "kkt dung quat", "loc dau dung quat", "nha may loc dau dung quat", "cang dung quat"],
      highlights: "Khu kinh tế ven biển trọng điểm miền Trung, nơi đặt Nhà máy Lọc dầu Dung Quất đầu tiên của Việt Nam (công suất chế biến 6,5 triệu tấn dầu thô/năm).",
      examTip: "Đề thi hay hỏi: 'Khu kinh tế Dung Quất thuộc tỉnh nào?' $\\rightarrow$ Tỉnh Quảng Ngãi (thuộc Vùng kinh tế trọng điểm miền Trung)."
    },
    {
      id: "boxit_tay_nguyen",
      name: "Mỏ Bôxit Tây Nguyên (Đắk Nông & Lâm Đồng)",
      category: "Khoáng sản kim loại màu",
      lat: 12.0000,
      lng: 107.7000,
      zoom: 9,
      layerKey: "minerals_power",
      atlatPage: 13,
      atlatSubPages: [18, 22],
      aliases: ["boxit", "boxit tay nguyen", "mo boxit", "bauxite", "bauxite tay nguyen", "boxit dak nong", "boxit lam dong"],
      highlights: "Bể bôxit Tây Nguyên chiếm gần 90% trữ lượng bôxit cả nước và thuộc top đầu thế giới, hình thành từ phong hóa đá bazan trên các bề mặt cao nguyên (Tổ hợp Nhôm Nhân Cơ, Tân Rai).",
      examTip: "Đề thi hay hỏi: 'Khoáng sản kim loại màu có trữ lượng lớn nhất ở Tây Nguyên là gì?' $\\rightarrow$ Bôxit."
    },
    {
      id: "hoa_binh_hydro",
      name: "Nhà máy Thủy điện Hòa Bình",
      category: "Năng lượng / Thủy điện",
      lat: 20.8167,
      lng: 105.3167,
      zoom: 11,
      layerKey: "minerals_power",
      atlatPage: 22,
      atlatSubPages: [10, 18],
      aliases: ["thuy dien hoa binh", "hoa binh", "nha may thuy dien hoa binh", "thuy dien song da"],
      highlights: "Công suất thiết kế 1.920 MW nằm trên sông Đà, đóng vai trò điều tiết lũ sống còn cho đồng bằng Bắc Bộ và cung cấp sản lượng điện lớn cho lưới điện quốc gia 500kV.",
      examTip: "Đề thi hay hỏi: 'Nhà máy thủy điện Hòa Bình được xây dựng trên dòng sông nào?' $\\rightarrow$ Sông Đà."
    },
    {
      id: "son_la_hydro",
      name: "Nhà máy Thủy điện Sơn La",
      category: "Năng lượng / Thủy điện",
      lat: 21.4967,
      lng: 103.9967,
      zoom: 11,
      layerKey: "minerals_power",
      atlatPage: 22,
      atlatSubPages: [10],
      aliases: ["thuy dien son la", "son la", "nha may thuy dien son la"],
      highlights: "Công suất thiết kế 2.400 MW, là công trình thủy điện lớn nhất Đông Nam Á, nằm trên bậc thang sông Đà phía thượng lưu thủy điện Hòa Bình.",
      examTip: "Đề thi hay hỏi: 'Công trình thủy điện có công suất lớn nhất nước ta hiện nay là...' $\\rightarrow$ Thủy điện Sơn La (2.400 MW)."
    },
    {
      id: "lai_chau_hydro",
      name: "Nhà máy Thủy điện Lai Châu",
      category: "Năng lượng / Thủy điện",
      lat: 22.1467,
      lng: 102.9167,
      zoom: 11,
      layerKey: "minerals_power",
      atlatPage: 22,
      atlatSubPages: [10],
      aliases: ["thuy dien lai chau", "lai chau", "nha may thuy dien lai chau"],
      highlights: "Công suất 1.200 MW, bậc thang thủy điện trên cùng của dòng chính sông Đà trên lãnh thổ Việt Nam.",
      examTip: "Bậc thang thủy điện sông Đà gồm 3 công trình lớn từ thượng lưu về hạ lưu: Lai Châu $\\rightarrow$ Sơn La $\\rightarrow$ Hòa Bình."
    },
    {
      id: "yaly_hydro",
      name: "Nhà máy Thủy điện Yaly (Sông Sê San)",
      category: "Năng lượng / Thủy điện",
      lat: 14.2250,
      lng: 107.8250,
      zoom: 11,
      layerKey: "minerals_power",
      atlatPage: 22,
      atlatSubPages: [10, 18],
      aliases: ["thuy dien yaly", "yaly", "song se san"],
      highlights: "Công suất 720 MW, nhà máy thủy điện lớn nhất trên hệ thống sông Sê San tại vùng Tây Nguyên (giáp ranh Gia Lai và Kon Tum).",
      examTip: "Đề thi hay hỏi: 'Thủy điện Yaly được xây dựng trên hệ thống sông nào?' $\\rightarrow$ Sông Sê San."
    },
    {
      id: "cai_mep_port",
      name: "Cụm Cảng nước sâu Cái Mép - Thị Vải",
      category: "Giao thông vận tải biển",
      lat: 10.5167,
      lng: 107.0167,
      zoom: 11,
      layerKey: "transportation",
      atlatPage: 23,
      atlatSubPages: [18],
      aliases: ["cai mep", "thi vai", "cai mep thi vai", "cang cai mep", "cang thi vai"],
      highlights: "Cụm cảng nước sâu quốc tế đặc biệt cửa ngõ phía Nam, đón được tàu container siêu trọng tải (>200.000 DWT) đi thẳng châu Âu và Bắc Mỹ mà không phải trung chuyển qua Singapore.",
      examTip: "Đề thi hay hỏi: 'Cụm cảng biển nước sâu quan trọng nhất của vùng kinh tế trọng điểm phía Nam là...' $\\rightarrow$ Cụm cảng Cái Mép - Thị Vải."
    },
    {
      id: "thanh_pho_quang_ninh",
      name: "Thành phố Quảng Ninh (Trực thuộc Trung ương)",
      category: "Thành phố trực thuộc Trung ương (NQ 24/8/2026)",
      lat: 20.9500,
      lng: 107.0730,
      zoom: 9,
      layerKey: "provinces",
      atlatPage: 4,
      atlatSubPages: [5, 13, 18, 22],
      aliases: ["quang ninh", "thanh pho quang ninh", "tp quang ninh", "tinh quang ninh", "ha long", "vinh ha long"],
      highlights: "Thành phố trực thuộc Trung ương thành lập theo Nghị quyết Quốc hội ngày 24/8/2026. Định hướng chuyển đổi mô hình tăng trưởng xanh, lấy khoa học - công nghệ và đổi mới sáng tạo làm động lực; kiểm soát chặt chẽ hoạt động xây dựng ven bờ và vùng đệm di sản thiên nhiên thế giới Vịnh Hạ Long.",
      examTip: "Đặc điểm nổi bật: Vừa giáp biển vừa giáp Trung Quốc; bể than đá lớn nhất cả nước; cụm cảng nước sâu Cái Lân; di sản thiên nhiên thế giới Vịnh Hạ Long."
    },
    {
      id: "thanh_pho_bac_ninh",
      name: "Thành phố Bắc Ninh (Trực thuộc Trung ương)",
      category: "Thành phố trực thuộc Trung ương (NQ 24/8/2026)",
      lat: 21.1860,
      lng: 106.0760,
      zoom: 10,
      layerKey: "provinces",
      atlatPage: 4,
      atlatSubPages: [5, 18, 21],
      aliases: ["bac ninh", "thanh pho bac ninh", "tp bac ninh", "tinh bac ninh", "quan ho bac ninh"],
      highlights: "Thành phố trực thuộc Trung ương thành lập theo Nghị quyết Quốc hội ngày 24/8/2026. Thủ phủ công nghiệp điện tử - bán dẫn công nghệ cao hàng đầu cả nước; định hướng bảo tồn hệ thống di tích quốc gia đặc biệt, làng nghề truyền thống và không gian văn hóa Dân ca Quan họ.",
      examTip: "Đặc điểm nổi bật: Mật độ dân số cao hàng đầu ĐBSH; trung tâm công nghiệp quy mô lớn trên hành lang kinh tế then chốt miền Bắc."
    },
    {
      id: "cam_pha_coal",
      name: "Bể than đá Cẩm Phả - Hòn Gai (Quảng Ninh)",
      category: "Khoáng sản nhiên liệu",
      lat: 21.0167,
      lng: 107.3000,
      zoom: 10,
      layerKey: "minerals_power",
      atlatPage: 13,
      atlatSubPages: [22],
      aliases: ["than cam pha", "than quang ninh", "hon gai", "be than quang ninh", "cam pha"],
      highlights: "Trữ lượng than antraxít lớn nhất Đông Nam Á (trên 3 tỉ tấn), chất lượng nhiệt lượng cao, cung cấp than cho các nhà máy nhiệt điện và phục vụ xuất khẩu.",
      examTip: "Đề thi hay hỏi: 'Loại khoáng sản có trữ lượng lớn nhất và giá trị kinh tế cao nhất của vùng Trung du miền núi Bắc Bộ là...' $\\rightarrow$ Than đá (Quảng Ninh)."
    },
    {
      id: "bach_ho_oil",
      name: "Mỏ dầu Bạch Hổ (Bồn trũng Cửu Long)",
      category: "Khoáng sản nhiên liệu",
      lat: 9.8000,
      lng: 107.9500,
      zoom: 9,
      layerKey: "minerals_power",
      atlatPage: 13,
      atlatSubPages: [22],
      aliases: ["bach ho", "mo bach ho", "dau bach ho", "dau mo vung tau"],
      highlights: "Mỏ dầu thô lớn nhất Việt Nam được khai thác từ tầng móng đá hoa cương nứt nẻ, nằm ở thềm lục địa phía Nam (Bà Rịa - Vũng Tàu).",
      examTip: "Đề thi hay hỏi: 'Mỏ dầu đầu tiên và lớn nhất được khai thác ở thềm lục địa nước ta là...' $\\rightarrow$ Mỏ Bạch Hổ."
    },
    {
      id: "phanxipang",
      name: "Đỉnh Phanxipăng (3.143m)",
      category: "Địa hình / Núi cao",
      lat: 22.3033,
      lng: 103.7750,
      zoom: 11,
      layerKey: "topography",
      atlatPage: 6,
      atlatSubPages: [4, 13],
      aliases: ["phanxipang", "fansipan", "dinh phanxipang", "noc nha dong duong"],
      highlights: "Đỉnh núi cao nhất Việt Nam và toàn bán đảo Đông Dương ('Nóc nhà Đông Dương') với độ cao 3.143m, nằm trên dãy Hoàng Liên Sơn hùng vĩ.",
      examTip: "Đề thi hay hỏi: 'Đỉnh núi cao nhất nước ta Phanxipăng nằm trên dãy núi nào?' $\\rightarrow$ Dãy Hoàng Liên Sơn."
    },
    {
      id: "lam_vien_plateau",
      name: "Cao nguyên Lâm Viên (Đà Lạt)",
      category: "Địa hình / Cao nguyên",
      lat: 11.9404,
      lng: 108.4583,
      zoom: 10,
      layerKey: "topography",
      atlatPage: 7,
      atlatSubPages: [8, 9],
      aliases: ["cao nguyen lam vien", "lam vien", "da lat", "cao nguyen da lat"],
      highlights: "Độ cao trung bình 1.500m so với mực nước biển, có khí hậu cận nhiệt đới và ôn đới núi cao quanh năm mát mẻ, chuyên canh rau hoa quả ôn đới và du lịch nghỉ dưỡng.",
      examTip: "Đề thi hay hỏi: 'Thành phố Đà Lạt nằm trên cao nguyên nào sau đây?' $\\rightarrow$ Cao nguyên Lâm Viên."
    },
    {
      id: "hoang_sa_truong_sa",
      name: "Quần đảo Hoàng Sa & Trường Sa (Chủ quyền Việt Nam)",
      category: "Lãnh thổ & Chủ quyền biển đảo",
      lat: 16.5000,
      lng: 112.0000,
      zoom: 7,
      layerKey: "provinces",
      atlatPage: 4,
      atlatSubPages: [5, 6, 7],
      aliases: ["hoang sa", "truong sa", "quan dao hoang sa", "quan dao truong sa", "bien dong"],
      highlights: "Hai quần đảo thiêng liêng trực thuộc TP. Đà Nẵng (Đặc khu / Huyện Hoàng Sa) và Tỉnh Khánh Hòa (Huyện Trường Sa), đóng vai trò then chốt trong bảo vệ chủ quyền biển đảo Tổ quốc.",
      examTip: "Đề thi hay hỏi: 'Huyện đảo Hoàng Sa thuộc tỉnh/thành phố nào?' $\\rightarrow$ TP. Đà Nẵng; 'Huyện đảo Trường Sa thuộc tỉnh nào?' $\\rightarrow$ Tỉnh Khánh Hòa."
    },
    {
      id: "nghi_son",
      name: "Khu kinh tế Nghi Sơn (Thanh Hóa)",
      category: "Khu kinh tế ven biển",
      lat: 19.3333,
      lng: 105.7833,
      zoom: 11,
      layerKey: "industrial",
      atlatPage: 18,
      atlatSubPages: [21, 22],
      aliases: ["nghi son", "kkt nghi son", "loc hoa dau nghi son"],
      highlights: "Khu kinh tế trọng điểm Bắc Trung Bộ, có liên hợp Lọc hóa dầu Nghi Sơn công suất 10 triệu tấn dầu thô/năm và cảng biển nước sâu.",
      examTip: "Đề thi hay hỏi: 'Khu kinh tế Nghi Sơn thuộc tỉnh nào sau đây?' $\\rightarrow$ Thanh Hóa."
    },
    {
      id: "vung_ang",
      name: "Khu kinh tế Vũng Áng (Hà Tĩnh)",
      category: "Khu kinh tế ven biển",
      lat: 18.0667,
      lng: 106.3833,
      zoom: 11,
      layerKey: "industrial",
      atlatPage: 18,
      atlatSubPages: [21, 23],
      aliases: ["vung ang", "kkt vung ang", "cang vung ang"],
      highlights: "Khu kinh tế tổng hợp với cụm cảng nước sâu Vũng Áng - Sơn Dương, trung tâm luyện gang thép và nhiệt điện than lớn của miền Trung.",
      examTip: "Đề thi hay hỏi: 'Khu kinh tế Vũng Áng nằm ở tỉnh nào?' $\\rightarrow$ Hà Tĩnh."
    },
    {
      id: "sa_pa_station",
      name: "Trạm Khí tượng Sa Pa (Lào Cai)",
      category: "Khí hậu / Trạm khí tượng",
      lat: 22.3364,
      lng: 103.8438,
      zoom: 11,
      layerKey: "climate",
      atlatPage: 8,
      atlatSubPages: [9],
      aliases: ["tram sa pa", "sa pa", "khi hau sa pa", "tram khi tuong sa pa"],
      highlights: "Trạm khí tượng núi cao đặc trưng miền Bắc với nhiệt độ trung bình năm dưới 16°C, mùa đông có hiện tượng băng giá, tuyết rơi và sương muối.",
      examTip: "Khai thác biểu đồ khí hậu tr.8: Sa Pa có nhiệt độ các tháng mùa đông hạ thấp nhất cả nước và lượng mưa lớn."
    }
  ];

  // =========================================================================
  // 4. KHO ĐÁP ÁN AI SƯ PHẠM NỘI TUYẾN (OFFLINE PEDAGOGICAL QA BASE)
  // =========================================================================
  const OFFLINE_QA_BASE = [
    {
      patterns: [
        "nghi quyet 24 thang 8 nam 2026",
        "24 thang 8 nam 2026",
        "thanh pho truc thuoc trung uong moi",
        "quang ninh va bac ninh",
        "bac ninh va quang ninh",
        "quang ninh len thanh pho truc thuoc trung uong",
        "bac ninh len thanh pho truc thuoc trung uong",
        "9 thanh pho truc thuoc trung uong",
        "cac thanh pho truc thuoc trung uong",
        "thanh pho truc thuoc trung uong gom nhung thanh pho nao"
      ],
      title: "Nghị quyết thành lập hai Thành phố trực thuộc Trung ương: Quảng Ninh và Bắc Ninh (24/8/2026)",
      atlatPages: [4, 5, 18],
      content: `
**Nội dung cơ bản và Ý nghĩa của Nghị quyết Quốc hội ngày 24/8/2026:**
1. **Thành lập 2 Thành phố trực thuộc Trung ương mới:**
   - Ngày 24 tháng 8 năm 2026, Quốc hội Việt Nam đã chính thức thông qua Nghị quyết thành lập thêm hai thành phố trực thuộc Trung ương là **Quảng Ninh** và **Bắc Ninh**.
   - Cả nước hiện có **9 Thành phố trực thuộc Trung ương**: Hà Nội, Hải Phòng, Quảng Ninh, Bắc Ninh, Huế, Đà Nẵng, Đồng Nai, TP. Hồ Chí Minh, Cần Thơ (cùng 25 tỉnh và 2 quần đảo đặc khu Hoàng Sa, Trường Sa).

2. **Định hướng và mục tiêu chiến lược của Chính phủ:**
   - Chỉ đạo hai địa phương chuyển đổi mô hình tăng trưởng kinh tế, phát triển kinh tế gắn liền với bảo vệ môi trường, lấy khoa học - công nghệ và đổi mới sáng tạo làm động lực phát triển then chốt.
   - **Đối với Vịnh Hạ Long (Quảng Ninh):** Cần kiểm soát chặt chẽ hoạt động xây dựng ven bờ và vùng đệm di sản thiên nhiên thế giới, phát triển bền vững kinh tế biển, du lịch xanh và dịch vụ chất lượng cao.
   - **Đối với Bắc Ninh:** Phát triển công nghiệp công nghệ cao, điện tử bán dẫn kết hợp hài hòa với việc bảo tồn hệ thống di tích quốc gia đặc biệt, bảo tồn làng nghề truyền thống và không gian văn hóa Dân ca Quan họ.

*Đối chiếu Atlat Địa lí:* Mở **Trang 4 - 5 (Hành chính 34 đơn vị)**, **Trang 18 (Kinh tế chung & GRDP)** và **Trang 21 (Vùng Đồng bằng sông Hồng)**.
      `
    },
    {
      patterns: ["tai sao mien bac co mua dong lanh", "vi sao mien bac co mua dong lanh", "mua dong lanh o mien bac"],
      title: "Giải thích nguyên nhân Miền Bắc nước ta có mùa đông lạnh",
      atlatPages: [8, 9],
      content: `
**Nguyên nhân Miền Bắc có mùa đông lạnh nhất cả nước (Chuẩn thi THPT):**
1. **Gió mùa Đông Bắc (Khối khí cực đới phương Bắc - NP):** Bắt nguồn từ áp cao Xibia qua lục địa châu Á tràn trực tiếp vào miền Bắc nước ta thành từng đợt, làm nền nhiệt hạ rất sâu.
2. **Hướng vòng cung của địa hình vùng Đông Bắc:** Bốn cánh cung núi (Sông Gâm, Ngân Sơn, Bắc Sơn, Đông Triều) mở rộng về phía Bắc và quy tụ tại Tam Đảo, tạo thành 'phễu hút gió' đón gió mùa Đông Bắc tràn sâu vào nội địa.
3. **Vị trí địa lí:** Nằm ở vĩ độ cao nhất cả nước, chịu ảnh hưởng sớm nhất và muộn nhất của gió mùa Đông Bắc (từ tháng 11 đến tháng 4 năm sau).
*Đối chiếu Atlat:* Mở **Trang 9** xem mũi tên gió mùa Đông Bắc (màu xanh) và biểu đồ nhiệt độ tr.8 của trạm Lạng Sơn, Hà Nội.
      `
    },
    {
      patterns: ["so sanh dat phu sa", "dat phu sa song hong va song cuu long", "dong bang song hong va dong bang song cuu long"],
      title: "So sánh đất phù sa Đồng bằng sông Hồng và Đồng bằng sông Cửu Long",
      atlatPages: [11, 19],
      content: `
**So sánh đất phù sa hai đồng bằng lớn (Chuẩn thi THPT):**
- **Đồng bằng sông Hồng:** Có hệ thống đê chống lũ dài hàng ngàn km ngăn chặn lũ tràn vào đồng ruộng. Vì vậy:
  - *Đất trong đê:* Không được bồi đắp phù sa hàng năm, qua hàng ngàn năm canh tác đã bị bạc màu, thoái hóa thành đất xám, đất bạc màu.
  - *Đất ngoài đê:* Được bồi đắp phù sa hàng năm nhưng diện tích nhỏ hẹp.
- **Đồng bằng sông Cửu Long:** Không có hệ thống đê ngăn lũ biển bao bọc, lũ hàng năm tràn ngập mênh mông:
  - Có 1,2 triệu ha đất phù sa ngọt màu mỡ ven sông Tiền và sông Hậu được bồi đắp liên tục.
  - Tuy nhiên, có tới 2,8 triệu ha là đất phèn và đất mặn (chiếm 60% diện tích) do địa hình trũng thấp và 3 mặt giáp biển.
*Đối chiếu Atlat:* Mở **Trang 11 (Đất)** & **Trang 19 (Nông nghiệp)**.
      `
    },
    {
      patterns: ["the manh kinh te bien nam trung bo", "kinh te bien duyen hai nam trung bo", "the manh nam trung bo"],
      title: "Thế mạnh phát triển kinh tế biển vùng Duyên hải Nam Trung Bộ",
      atlatPages: [18, 23, 25],
      content: `
**Bốn thế mạnh kinh tế biển nổi bật của Duyên hải Nam Trung Bộ:**
1. **Giao thông vận tải biển & Cảng biển nước sâu:** Bờ biển khúc khuỷu nhiều vịnh kín gió nước sâu lý tưởng (Vân Phong, Dung Quất, Cam Ranh, Quy Nhơn) xây dựng cụm cảng trung chuyển quốc tế.
2. **Khai thác và nuôi trồng hải sản:** Ngư trường trọng điểm cực Nam Trung Bộ (Ninh Thuận - Bình Thuận), biển ấm, nhiều bãi tôm, bãi cá lớn.
3. **Du lịch biển - đảo:** Khí hậu nhiều nắng, bãi biển đẹp nổi tiếng thế giới (Nha Trang, Mũi Né, Mỹ Khê, Quy Nhơn).
4. **Nghề làm muối & Khoáng sản biển:** Số giờ nắng cao, ít mưa, độ mặn nước biển cao (vựa muối Cà Ná, Sa Huỳnh); titan ở Bình Định.
*Đối chiếu Atlat:* Mở **Trang 18 (Kinh tế chung)**, **Trang 23 (Giao thông)**.
      `
    },
    {
      patterns: ["tai sao tay nguyen trong ca phe", "vung chuyen canh ca phe lon nhat", "ca phe tay nguyen"],
      title: "Vì sao Tây Nguyên là vùng chuyên canh cà phê lớn nhất nước ta?",
      atlatPages: [19, 28],
      content: `
**Các điều kiện quyết định giúp Tây Nguyên dẫn đầu về cà phê:**
1. **Đất đai:** Đất đỏ bazan màu mỡ, tầng phong hóa dày, hàm lượng dinh dưỡng cao, phân bố trên các cao nguyên xếp tầng rộng lớn (Pleiku, Đắk Lắk, Di Linh) rất thuận lợi thành lập nông trường quy mô lớn.
2. **Khí hậu:** Cận xích đạo gió mùa có 2 mùa mưa - khô rõ rệt. Mùa khô kéo dài là điều kiện vàng để thu hoạch, phơi sấy và chế biến cà phê chất lượng cao.
3. **Địa hình:** Độ cao 500m - 1000m thích hợp tuyệt vời cho cà phê vối (Robusta) - loại cà phê xuất khẩu chủ lực của Việt Nam.
4. **Chính sách & Thị trường:** Truyền thống canh tác lâu đời của đồng bào, chính sách phát triển cây công nghiệp của Nhà nước và thị trường xuất khẩu mở rộng.
*Đối chiếu Atlat:* Mở **Trang 19 (Nông nghiệp)** & **Trang 28 (Vùng Tây Nguyên)**.
      `
    },
    {
      patterns: ["y nghia duong ho chi minh", "duong ho chi minh", "tuyen duong ho chi minh"],
      title: "Ý nghĩa chiến lược của tuyến đường Hồ Chí Minh đối với nước ta",
      atlatPages: [23],
      content: `
**Ý nghĩa toàn diện của tuyến đường Hồ Chí Minh (Chuẩn đề thi THPT):**
1. **Kinh tế:** Thúc đẩy sự phát triển kinh tế - xã hội của dải đất rộng lớn phía Tây đất nước; khai thác thế mạnh lâm nghiệp, khoáng sản, cây công nghiệp và du lịch sinh thái.
2. **Xã hội:** Phân bố lại dân cư, giải quyết việc làm, nâng cao đời sống văn hóa cho đồng bào các dân tộc thiểu số vùng sâu, vùng xa.
3. **Giao thông:** Giảm tải áp lực cho Quốc lộ 1A; tạo thành trục giao thông xương sống thứ hai chạy dọc Bắc - Nam; kết nối các tuyến giao thông Đông - Tây sang Lào và Campuchia.
4. **An ninh quốc phòng:** Củng cố thế trận quốc phòng toàn dân và an ninh khu vực biên giới phía Tây Tổ quốc.
*Đối chiếu Atlat:* Mở **Trang 23 (Giao thông vận tải)**.
      `
    }
  ];

  // =========================================================================
  // 5. NLP NORMALIZER & QUERY ANALYZER
  // =========================================================================
  function normalizeVN(str) {
    if (!str) return "";
    return str
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function countYearsInText(text) {
    const yearMatches = text.match(/\b(19\d{2}|20\d{2})\b/g);
    if (!yearMatches) return 0;
    const uniqueYears = new Set(yearMatches);
    return uniqueYears.size;
  }

  function analyzeQuery(rawQuery) {
    if (!rawQuery || !rawQuery.trim()) return null;

    const norm = normalizeVN(rawQuery);
    const yearsCount = countYearsInText(rawQuery);

    let detectedChart = null;
    let detectedGeoEntities = [];
    let referencedAtlatPages = [];
    let offlineQA = null;

    // A. PHÂN TÍCH NHU CẦU BIỂU ĐỒ
    for (const rule of CHART_KNOWLEDGE_BASE) {
      let matched = false;
      for (const kw of rule.keywords) {
        if (norm.includes(kw)) {
          matched = true;
          break;
        }
      }
      if (matched) {
        if (typeof rule.condition === "function") {
          if (rule.condition(norm, yearsCount)) {
            detectedChart = rule;
            break;
          }
        } else {
          detectedChart = rule;
          break;
        }
      }
    }

    // B. PHÂN TÍCH ĐỊA DANH / TỌA ĐỘ / KHU KINH TẾ
    for (const geo of GEO_ENTITIES_KNOWLEDGE) {
      let score = 0;
      const nameNorm = normalizeVN(geo.name);
      if (norm.includes(nameNorm)) score += 100;
      for (const alias of geo.aliases) {
        if (norm.includes(alias)) {
          score += 80;
          break;
        }
      }
      if (score > 0) {
        detectedGeoEntities.push({ ...geo, score });
      }
    }
    detectedGeoEntities.sort((a, b) => b.score - a.score);

    // C. TỔNG HỢP TRANG ATLAT CHỈ DẪN
    const pageSet = new Set();
    if (detectedGeoEntities.length > 0) {
      const topGeo = detectedGeoEntities[0];
      if (topGeo.atlatPage) pageSet.add(topGeo.atlatPage);
      if (topGeo.atlatSubPages) {
        topGeo.atlatSubPages.forEach(p => pageSet.add(p));
      }
    }

    if (norm.includes("trang 8") || norm.includes("khi hau")) pageSet.add(8);
    if (norm.includes("trang 9") || norm.includes("luong mua")) pageSet.add(9);
    if (norm.includes("trang 10") || norm.includes("song ngoi") || norm.includes("thuy van")) pageSet.add(10);
    if (norm.includes("trang 13") || norm.includes("khoang san") || norm.includes("dia chat")) pageSet.add(13);
    if (norm.includes("trang 18") || norm.includes("kinh te chung") || norm.includes("grdp")) pageSet.add(18);
    if (norm.includes("trang 19") || norm.includes("nong nghiep")) pageSet.add(19);
    if (norm.includes("trang 21") || norm.includes("cong nghiep chung")) pageSet.add(21);
    if (norm.includes("trang 22") || norm.includes("nang luong") || norm.includes("thuy dien")) pageSet.add(22);
    if (norm.includes("trang 23") || norm.includes("giao thong") || norm.includes("cang bien")) pageSet.add(23);
    if (norm.includes("trang 4") || norm.includes("trang 5") || norm.includes("hanh chinh") || norm.includes("34 tinh")) pageSet.add(4);

    // D. KHỚP CÂU HỎI SƯ PHẠM NỘI TUYẾN
    for (const qa of OFFLINE_QA_BASE) {
      for (const pat of qa.patterns) {
        if (norm.includes(pat)) {
          offlineQA = qa;
          if (qa.atlatPages) qa.atlatPages.forEach(p => pageSet.add(p));
          break;
        }
      }
      if (offlineQA) break;
    }

    referencedAtlatPages = Array.from(pageSet).sort((a, b) => a - b);

    return {
      query: rawQuery,
      yearsCount,
      chart: detectedChart,
      geoEntities: detectedGeoEntities,
      atlatPages: referencedAtlatPages,
      offlineQA: offlineQA
    };
  }

  // =========================================================================
  // 6. GỌI GOOGLE GEMINI API CLOUD (FREE TIER INTEGRATION)
  // =========================================================================
  async function callGeminiAPI(userQuery, systemInstruction) {
    const key = getGeminiApiKey();
    if (!key) {
      return {
        success: false,
        error: "NO_API_KEY",
        message: "Chưa cấu hình API Key. Thầy cô hoặc học sinh có thể lấy API Key miễn phí từ Google AI Studio (không cần thẻ tín dụng) hoặc bấm nút chuyển sang '⚡ AI Nội Tuyến' để sử dụng hoàn toàn miễn phí không cần mạng."
      };
    }

    const model = getGeminiModel() || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const promptText = `Câu hỏi Địa lí của học sinh: "${userQuery}".\nHãy giải đáp chi tiết, nêu rõ căn cứ lý thuyết Địa lí 12 và đối chiếu số trang Atlat Địa lí Việt Nam tương ứng.`;

    const bodyData = {
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }]
        }
      ],
      systemInstruction: {
        parts: [
          {
            text: systemInstruction || "Bạn là Chuyên gia Trí tuệ Nhân tạo Địa lí THPT Việt Nam (GeoAtlas AI Tutor). Nhiệm vụ của bạn là giải đáp chính xác, sâu sắc các câu hỏi môn Địa lí lớp 12, phân tích biểu đồ, phát hiện bẫy thi trắc nghiệm tốt nghiệp THPT, đối chiếu các trang Atlat Địa lí Việt Nam bản in chuẩn của NXB Giáo dục Việt Nam. Trả lời bằng tiếng Việt sư phạm, súc tích, định dạng Markdown rõ ràng, làm nổi bật từ khóa quan trọng."
          }
        ]
      },
      generationConfig: {
        temperature: 0.35,
        maxOutputTokens: 1200
      }
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return {
          success: false,
          error: "API_ERROR",
          message: errJson.error?.message || `Lỗi phản hồi Gemini API (${response.status})`
        };
      }

      const data = await response.json();
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!answer) {
        return {
          success: false,
          error: "EMPTY_ANSWER",
          message: "Không nhận được nội dung trả lời từ mô hình AI."
        };
      }

      return {
        success: true,
        text: answer
      };
    } catch (err) {
      return {
        success: false,
        error: "NETWORK_ERROR",
        message: `Lỗi kết nối mạng: ${err.message}. Đã tự động chuyển về AI Nội Tuyến.`
      };
    }
  }

  // =========================================================================
  // 7. CÔNG CỤ TẠO CÂU HỎI TRẮC NGHIỆM & NHẬN XÉT BẢNG SỐ LIỆU TỰ ĐỘNG
  // =========================================================================
  function generateTableReview(dataPrompt) {
    return `
### 📝 Hướng Dẫn Nhận Xét Bảng Số Liệu Chuẩn 4 Bước Sư Phạm THPT:
**Bước 1: Nhận xét tổng quát xu hướng:**
- Nhìn toàn bộ tiến trình từ năm đầu đến năm cuối: Chỉ số có xu hướng tăng liên tục, giảm, hay biến động qua các năm?
- *Mẫu câu:* "Giai đoạn [Năm đầu] - [Năm cuối], [Tên đại lượng] nhìn chung có xu hướng [tăng/giảm/biến động], từ [Giá trị năm đầu] lên/xuống [Giá trị năm cuối] (đơn vị)."

**Bước 2: Phân tích độ tăng/giảm cụ thể:**
- *Tăng tuyệt đối:* Lấy [Năm cuối] - [Năm đầu] = ... (đơn vị).
- *Tăng tương đối (gấp bao nhiêu lần):* Lấy [Năm cuối] / [Năm đầu] = ... (lần).
- Chia nhỏ các giai đoạn: Giai đoạn nào tăng nhanh nhất, giai đoạn nào tăng chậm hoặc chững lại?

**Bước 3: So sánh giữa các đối tượng / thành phần:**
- Đại lượng nào luôn chiếm tỉ trọng lớn nhất?
- Đại lượng nào có tốc độ tăng trưởng nhanh nhất?
- Cơ cấu thành phần có sự thay đổi ra sao?

**Bước 4: Giải thích ngắn gọn nguyên nhân cốt lõi:**
- Do tác động của công nghiệp hóa, hiện đại hóa, đường lối đổi mới kinh tế.
- Do ứng dụng khoa học kỹ thuật hoặc mở rộng thị trường xuất khẩu.
    `;
  }

  function generateAtlatQuiz(pageNumber) {
    const p = Number(pageNumber) || 4;
    const quizzes = {
      4: [
        { q: "Căn cứ vào Atlat Địa lí Việt Nam trang 4 - 5, tỉnh nào sau đây giáp cả Lào và Campuchia?", a: "Kon Tum", options: ["Kon Tum", "Gia Lai", "Đắk Lắk", "Quảng Trị"] },
        { q: "Căn cứ vào Atlat trang 4 - 5, điểm cực Bắc phần đất liền nước ta thuộc tỉnh nào?", a: "Hà Giang (xã Lũng Cú)", options: ["Hà Giang (xã Lũng Cú)", "Lào Cai", "Cao Bằng", "Tuyên Quang"] }
      ],
      8: [
        { q: "Căn cứ vào Atlat Địa lí Việt Nam trang 8, trạm khí tượng nào sau đây có nhiệt độ trung bình năm thấp nhất?", a: "Sa Pa", options: ["Sa Pa", "Hà Nội", "Đà Nẵng", "Cần Thơ"] },
        { q: "Trạm khí tượng Đà Lạt có tháng mưa nhiều nhất vào thời gian nào?", a: "Tháng 9 và 10", options: ["Tháng 9 và 10", "Tháng 1 và 2", "Tháng 4 và 5", "Tháng 12"] }
      ],
      13: [
        { q: "Căn cứ vào Atlat Địa lí Việt Nam trang 13, mỏ sắt Thạch Khê thuộc tỉnh nào sau đây?", a: "Hà Tĩnh", options: ["Hà Tĩnh", "Quảng Bình", "Nghệ An", "Thanh Hóa"] },
        { q: "Khoáng sản bôxit ở nước ta tập trung trữ lượng lớn nhất ở vùng nào?", a: "Tây Nguyên", options: ["Tây Nguyên", "Trung du miền núi Bắc Bộ", "Bắc Trung Bộ", "Đông Nam Bộ"] }
      ],
      22: [
        { q: "Căn cứ vào Atlat Địa lí Việt Nam trang 22, nhà máy thủy điện Hòa Bình được xây dựng trên dòng sông nào?", a: "Sông Đà", options: ["Sông Đà", "Sông Mã", "Sông Gâm", "Sông Lô"] },
        { q: "Nhà máy nhiệt điện Phú Mỹ sử dụng nguồn nhiên liệu nào sau đây?", a: "Khí tự nhiên", options: ["Khí tự nhiên", "Than đá", "Dầu thô", "Năng lượng gió"] }
      ]
    };

    const list = quizzes[p] || quizzes[4];
    return list.map((item, idx) => `
      <div class="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
        <div class="font-bold text-slate-900 dark:text-white">Câu ${idx + 1}: ${item.q}</div>
        <div class="grid grid-cols-2 gap-1.5 pt-1">
          ${item.options.map(opt => `
            <button 
              onclick="this.classList.add('${opt === item.a ? 'bg-emerald-600 text-white font-bold' : 'bg-rose-100 text-rose-800 line-through'}')" 
              class="p-2 text-left rounded-lg bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-[11px] transition"
            >
              ${opt}
            </button>
          `).join('')}
        </div>
        <div class="text-[10px] text-slate-400 font-mono pt-1">💡 Bấm vào phương án để kiểm tra đáp án đúng.</div>
      </div>
    `).join('');
  }

  // =========================================================================
  // 8. GIAO DIỆN HỘP THÔNG MINH & POPUP CẤU HÌNH AI
  // =========================================================================
  function ensureModalDOM() {
    if (document.getElementById("smart-assistant-modal")) return;

    const modal = document.createElement("div");
    modal.id = "smart-assistant-modal";
    modal.className = "hidden fixed inset-0 z-[9500] bg-slate-950/75 backdrop-blur-md flex items-start justify-center pt-8 sm:pt-14 p-3 sm:p-4 animate-in fade-in duration-200";
    modal.innerHTML = `
      <div class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh]">
        <!-- Header Thanh Nhập Liệu Thông Minh -->
        <div class="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-400 flex items-center justify-center text-white text-base shadow-sm shrink-0">
            <span>✨</span>
          </div>
          <div class="relative flex-1">
            <input 
              type="text" 
              id="assistant-modal-input" 
              placeholder="Dán câu hỏi biểu đồ hoặc gõ: 'Dung Quất', 'bôxit', 'thủy điện Hòa Bình'..." 
              class="w-full pl-3 pr-10 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-indigo-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              autocomplete="off"
            />
            <button 
              id="assistant-clear-btn" 
              onclick="GeoSmartAssistant.clearInput()" 
              class="hidden absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              title="Xóa ô nhập"
            >
              ✕
            </button>
          </div>
          <button 
            onclick="GeoSmartAssistant.closeModal()" 
            class="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-xs font-bold transition shrink-0"
            title="Đóng (ESC)"
          >
            ESC
          </button>
        </div>

        <!-- Thanh Chuyển Đổi Chế Độ AI & Cài Đặt API Key -->
        <div class="px-3.5 sm:px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-2 text-[11px] shrink-0">
          <div class="flex items-center space-x-1 bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs">
            <button 
              id="ai-mode-btn-offline" 
              onclick="GeoSmartAssistant.setAIMode('offline')" 
              class="px-2.5 py-1 rounded-md font-bold text-xs transition flex items-center space-x-1 bg-indigo-600 text-white shadow-xs"
              title="100% Ngoại tuyến, không cần mạng hay API Key"
            >
              <span>⚡</span> <span>AI Nội Tuyến (Offline)</span>
            </button>
            <button 
              id="ai-mode-btn-gemini" 
              onclick="GeoSmartAssistant.setAIMode('gemini')" 
              class="px-2.5 py-1 rounded-md font-semibold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center space-x-1"
              title="Sử dụng Google Gemini AI đám mây (Hỗ trợ giải đáp mở rộng và chấm bài)"
            >
              <span>🧠</span> <span>Gemini AI (Cloud)</span>
            </button>
          </div>

          <div class="flex items-center space-x-1.5">
            <button 
              onclick="GeoSmartAssistant.openAISettings()" 
              class="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center space-x-1 shadow-xs transition"
              title="Cài đặt API Key miễn phí từ Google AI Studio"
            >
              <span>⚙️</span> <span class="hidden sm:inline">Cài đặt API Key</span>
            </button>
          </div>
        </div>

        <!-- Các thẻ gợi ý mẫu (Quick Tags) -->
        <div class="px-3.5 sm:px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0 text-[10px] sm:text-[11px]">
          <span class="text-slate-400 font-bold shrink-0">Gợi ý nhanh:</span>
          <button onclick="GeoSmartAssistant.setSearch('thể hiện tốc độ tăng trưởng lúa qua 4 năm')" class="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 shrink-0 hover:bg-blue-100 font-medium transition">📈 Tốc độ tăng trưởng</button>
          <button onclick="GeoSmartAssistant.setSearch('quy mô và cơ cấu từ năm 2018 đến 2024')" class="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 shrink-0 hover:bg-indigo-100 font-medium transition">📊 Quy mô & cơ cấu</button>
          <button onclick="GeoSmartAssistant.setSearch('khu kinh tế Dung Quất')" class="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 shrink-0 hover:bg-emerald-100 font-medium transition">📍 KKT Dung Quất</button>
          <button onclick="GeoSmartAssistant.setSearch('mỏ bôxit Tây Nguyên')" class="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 shrink-0 hover:bg-amber-100 font-medium transition">💎 Mỏ bôxit</button>
          <button onclick="GeoSmartAssistant.setSearch('thủy điện Hòa Bình')" class="px-2 py-0.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900 shrink-0 hover:bg-sky-100 font-medium transition">⚡ Thủy điện Hòa Bình</button>
          <button onclick="GeoSmartAssistant.setSearch('cảng Cái Mép Thị Vải')" class="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900 shrink-0 hover:bg-purple-100 font-medium transition">🚢 Cảng Cái Mép</button>
        </div>

        <!-- Khung kết quả phân tích & Trả lời chuyên gia -->
        <div id="assistant-results-container" class="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
          <div id="assistant-empty-state" class="text-center py-8 space-y-3">
            <div class="text-4xl">💡</div>
            <div class="font-bold text-sm text-slate-800 dark:text-slate-200">
              Trợ Lí Trí Tuệ Nhân Tạo Địa Lí & Chẩn Đoán Đề Thi THPT
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Dán câu hỏi biểu đồ bất kì hoặc gõ tên địa danh, khoáng sản, khu kinh tế. Hệ thống sẽ giải mã quy tắc thi, định vị trên bản đồ số và chỉ dẫn trang Atlat tương ứng.
            </p>
            <div class="pt-2 flex flex-wrap items-center justify-center gap-2">
              <button onclick="GeoSmartAssistant.triggerTableHelper()" class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 transition shadow-xs flex items-center space-x-1">
                <span>📝</span> <span>AI Hướng dẫn nhận xét bảng số liệu</span>
              </button>
              <button onclick="GeoSmartAssistant.triggerQuizHelper(8)" class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 transition shadow-xs flex items-center space-x-1">
                <span>🎯</span> <span>Tạo câu hỏi trắc nghiệm Atlat tr.8</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const input = document.getElementById("assistant-modal-input");
    const clearBtn = document.getElementById("assistant-clear-btn");

    if (input) {
      input.addEventListener("input", (e) => {
        const val = e.target.value;
        if (clearBtn) clearBtn.classList.toggle("hidden", !val);
        handleSearch(val);
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
        if (e.key === "Enter") {
          const res = analyzeQuery(input.value);
          if (res && res.geoEntities.length > 0) {
            const first = res.geoEntities[0];
            flyToGeo(first.lat, first.lng, first.name, first.layerKey);
          }
        }
      });
    }

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    updateAIModeUI();
  }

  function updateAIModeUI() {
    const btnOffline = document.getElementById("ai-mode-btn-offline");
    const btnGemini = document.getElementById("ai-mode-btn-gemini");
    if (!btnOffline || !btnGemini) return;

    if (currentAIMode === "gemini") {
      btnGemini.className = "px-2.5 py-1 rounded-md font-bold text-xs transition flex items-center space-x-1 bg-indigo-600 text-white shadow-xs";
      btnOffline.className = "px-2.5 py-1 rounded-md font-semibold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center space-x-1";
    } else {
      btnOffline.className = "px-2.5 py-1 rounded-md font-bold text-xs transition flex items-center space-x-1 bg-indigo-600 text-white shadow-xs";
      btnGemini.className = "px-2.5 py-1 rounded-md font-semibold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center space-x-1";
    }
  }

  // =========================================================================
  // 9. POPUP CÀI ĐẶT API KEY CHO AI CLOUD (FREE TIER)
  // =========================================================================
  function ensureSettingsModalDOM() {
    if (document.getElementById("ai-settings-modal")) return;

    const modal = document.createElement("div");
    modal.id = "ai-settings-modal";
    modal.className = "hidden fixed inset-0 z-[9600] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200";
    modal.innerHTML = `
      <div class="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center space-x-2">
            <span class="text-xl">⚙️</span>
            <span class="font-bold text-sm text-slate-900 dark:text-white">Cấu Hình Trí Tuệ Nhân Tạo (Gemini AI)</span>
          </div>
          <button onclick="GeoSmartAssistant.closeAISettings()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold">✕</button>
        </div>

        <div class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
          <p>
            Google cung cấp gói <strong>miễn phí hoàn toàn (Free Tier)</strong> cho mô hình <strong>Gemini Flash</strong> qua Google AI Studio không yêu cầu thẻ tín dụng.
          </p>
          <div class="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-800 dark:text-blue-200">
            🔒 <strong>Bảo mật riêng tư tuyệt đối:</strong> Khóa API được lưu cục bộ trên trình duyệt máy bạn (localStorage) và chỉ gửi trực tiếp tới máy chủ Google khi bạn yêu cầu.
          </div>
        </div>

        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Khóa API Google Gemini:</label>
            <input 
              type="password" 
              id="ai-settings-key-input" 
              placeholder="AIzaSy..." 
              value="${geminiApiKey}"
              class="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phiên bản mô hình:</label>
            <select id="ai-settings-model-select" class="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">
              <option value="gemini-1.5-flash" ${geminiModel === 'gemini-1.5-flash' ? 'selected' : ''}>Gemini 1.5 Flash (Gọn nhẹ, phản hồi nhanh, Free Tier)</option>
              <option value="gemini-2.5-flash" ${geminiModel === 'gemini-2.5-flash' ? 'selected' : ''}>Gemini 2.5 Flash (Thế hệ mới nhất, suy luận sâu)</option>
            </select>
          </div>

          <div class="text-[10px] text-slate-500 dark:text-slate-400">
            👉 Chưa có khóa? Nhận miễn phí trong 30 giây tại: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" class="text-indigo-600 dark:text-indigo-400 font-bold underline">Google AI Studio ↗</a>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button 
            onclick="GeoSmartAssistant.clearAISettings()" 
            class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 text-xs font-semibold"
          >
            Xóa khóa
          </button>
          <button 
            onclick="GeoSmartAssistant.saveAISettings()" 
            class="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
          >
            Lưu Cấu Hình
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  function openAISettings() {
    ensureSettingsModalDOM();
    const modal = document.getElementById("ai-settings-modal");
    const input = document.getElementById("ai-settings-key-input");
    if (modal) modal.classList.remove("hidden");
    if (input) input.value = geminiApiKey;
  }

  function closeAISettings() {
    const modal = document.getElementById("ai-settings-modal");
    if (modal) modal.classList.add("hidden");
  }

  function saveAISettings() {
    const input = document.getElementById("ai-settings-key-input");
    const select = document.getElementById("ai-settings-model-select");
    if (input) setGeminiApiKey(input.value);
    if (select) setGeminiModel(select.value);
    if (input && input.value.trim()) {
      setAIMode("gemini");
    }
    closeAISettings();
    if (typeof window.showAppToast === "function") {
      window.showAppToast("✅ Đã lưu cấu hình Google Gemini AI thành công!");
    }
  }

  function clearAISettings() {
    setGeminiApiKey("");
    setAIMode("offline");
    closeAISettings();
    if (typeof window.showAppToast === "function") {
      window.showAppToast("ℹ️ Đã xóa khóa API và chuyển sang AI Nội Tuyến.");
    }
  }

  // =========================================================================
  // 10. RENDER KẾT QUẢ TỔNG HỢP & XỬ LÝ HỎI ĐÁP AI
  // =========================================================================
  function openModal(initialQuery = "") {
    ensureModalDOM();
    const modal = document.getElementById("smart-assistant-modal");
    const input = document.getElementById("assistant-modal-input");
    if (modal) modal.classList.remove("hidden");
    if (input) {
      if (initialQuery) {
        input.value = initialQuery;
        handleSearch(initialQuery);
      }
      setTimeout(() => input.focus(), 50);
    }
  }

  function closeModal() {
    const modal = document.getElementById("smart-assistant-modal");
    if (modal) modal.classList.add("hidden");
  }

  function clearInput() {
    const input = document.getElementById("assistant-modal-input");
    const clearBtn = document.getElementById("assistant-clear-btn");
    if (input) {
      input.value = "";
      input.focus();
    }
    if (clearBtn) clearBtn.classList.add("hidden");
    handleSearch("");
  }

  function setSearch(text) {
    const input = document.getElementById("assistant-modal-input");
    const headerInput = document.getElementById("global-smart-assistant-input");
    if (input) {
      input.value = text;
      handleSearch(text);
      input.focus();
    }
    if (headerInput) headerInput.value = text;
  }

  function triggerTableHelper() {
    const container = document.getElementById("assistant-results-container");
    if (container) {
      container.innerHTML = `
        <div class="p-4 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-3">
          <div class="font-bold text-sm text-indigo-700 dark:text-indigo-300 flex items-center space-x-1.5">
            <span>📝</span> <span>Cẩm Nang AI: Viết Nhận Xét Bảng Số Liệu Chuẩn Điểm Tuyệt Đối</span>
          </div>
          <div class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            ${generateTableReview()}
          </div>
          <div class="pt-2">
            <button onclick="GeoSmartAssistant.goToCalcMode('proportion')" class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs">
              🧮 Mở Máy tính để tính nhanh tỉ trọng & tốc độ
            </button>
          </div>
        </div>
      `;
    }
  }

  function triggerQuizHelper(pageNum = 8) {
    const container = document.getElementById("assistant-results-container");
    if (container) {
      container.innerHTML = `
        <div class="space-y-3">
          <div class="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
            <div class="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
              <span>🎯</span> <span>Bộ Câu Hỏi Trắc Nghiệm Tự Động Theo Atlat Trang ${pageNum}:</span>
            </div>
            <button onclick="GeoSmartAssistant.flipToAtlatPage(${pageNum})" class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              📖 Lật mở trang ${pageNum}
            </button>
          </div>
          ${generateAtlatQuiz(pageNum)}
        </div>
      `;
    }
  }

  async function askDeepAI(query) {
    const container = document.getElementById("assistant-results-container");
    if (!container) return;

    container.innerHTML = `
      <div class="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-center space-y-3">
        <div class="text-2xl animate-spin">🌀</div>
        <div class="font-bold text-xs text-indigo-800 dark:text-indigo-200">
          Đang kết nối Gemini AI & Đối chiếu kiến thức Địa lí THPT...
        </div>
        <p class="text-[11px] text-slate-500">Mô hình đang phân tích đề bài, trích xuất căn cứ và tổng hợp lời giải chi tiết.</p>
      </div>
    `;

    const res = await callGeminiAPI(query);
    if (!res.success) {
      container.innerHTML = `
        <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div class="font-bold flex items-center space-x-1">
            <span>⚠️</span> <span>Thông báo từ hệ thống AI:</span>
          </div>
          <div>${res.message}</div>
          <div class="pt-2 flex items-center space-x-2">
            <button onclick="GeoSmartAssistant.openAISettings()" class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs">
              ⚙️ Nhập API Key miễn phí
            </button>
            <button onclick="GeoSmartAssistant.setAIMode('offline'); GeoSmartAssistant.handleSearch('${query.replace(/'/g, "\\'")}')" class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold">
              ⚡ Dùng AI Nội Tuyến
            </button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-900 shadow-sm space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-indigo-100 dark:border-indigo-900/50">
          <div class="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center space-x-1.5">
            <span>🧠</span> <span>Lời Giải Chuyên Gia Google Gemini AI</span>
          </div>
          <span class="text-[9px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-mono font-bold">${geminiModel}</span>
        </div>
        <div class="text-xs text-slate-800 dark:text-slate-200 leading-relaxed prose prose-sm dark:prose-invert max-w-none space-y-2 whitespace-pre-line">
          ${res.text}
        </div>
        <div class="pt-2 flex items-center space-x-2 border-t border-slate-100 dark:border-slate-800">
          <button onclick="navigator.clipboard.writeText('${res.text.replace(/'/g, "\\'").replace(/\n/g, "\\n")}'); if(window.showAppToast) window.showAppToast('📋 Đã sao chép câu trả lời AI!');" class="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100">
            📋 Sao chép
          </button>
          <button onclick="GeoSmartAssistant.handleSearch('${query.replace(/'/g, "\\'")}')" class="px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100">
            🔄 Xem dạng bảng quy tắc
          </button>
        </div>
      </div>
    `;
  }

  function handleSearch(query) {
    const container = document.getElementById("assistant-results-container");
    if (!container) return;

    if (!query || !query.trim()) {
      container.innerHTML = `
        <div id="assistant-empty-state" class="text-center py-8 space-y-3">
          <div class="text-4xl">💡</div>
          <div class="font-bold text-sm text-slate-800 dark:text-slate-200">
            Trợ Lí Trí Tuệ Nhân Tạo Địa Lí & Chẩn Đoán Đề Thi THPT
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Dán câu hỏi biểu đồ bất kì hoặc gõ tên địa danh, khoáng sản, khu kinh tế. Hệ thống sẽ giải mã quy tắc thi, định vị trên bản đồ số và chỉ dẫn trang Atlat tương ứng.
          </p>
          <div class="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button onclick="GeoSmartAssistant.triggerTableHelper()" class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 transition shadow-xs flex items-center space-x-1">
              <span>📝</span> <span>AI Hướng dẫn nhận xét bảng số liệu</span>
            </button>
            <button onclick="GeoSmartAssistant.triggerQuizHelper(8)" class="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 transition shadow-xs flex items-center space-x-1">
              <span>🎯</span> <span>Tạo câu hỏi trắc nghiệm Atlat tr.8</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    // Nếu người dùng đang chọn chế độ Gemini Cloud và đã có API key, hỏi sâu trực tiếp
    if (currentAIMode === "gemini" && geminiApiKey) {
      askDeepAI(query);
      return;
    }

    const res = analyzeQuery(query);
    if (!res || (!res.chart && res.geoEntities.length === 0 && res.atlatPages.length === 0 && !res.offlineQA)) {
      renderFallbackSearch(query, container);
      return;
    }

    let html = "";

    // Nút kích hoạt Gemini Cloud nếu người dùng muốn suy luận sâu
    html += `
      <div class="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between">
        <div class="flex items-center space-x-2 text-xs text-indigo-900 dark:text-indigo-200">
          <span>🧠</span>
          <span>Cần AI phân tích sâu hơn bài làm này?</span>
        </div>
        <button 
          onclick="GeoSmartAssistant.askDeepAI('${query.replace(/'/g, "\\'")}')" 
          class="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs transition flex items-center space-x-1"
        >
          <span>Hỏi sâu với Gemini AI ↗</span>
        </button>
      </div>
    `;

    // CÂU HỎI SƯ PHẠM NỘI TUYẾN (NẾU CÓ)
    if (res.offlineQA) {
      const qa = res.offlineQA;
      html += `
        <div class="p-4 rounded-xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200 dark:border-blue-900/60 shadow-sm space-y-2.5">
          <div class="flex items-center justify-between pb-1 border-b border-blue-100 dark:border-blue-900/50">
            <span class="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>🎓</span>
              <span>Kiến Thức Trọng Tâm THPT</span>
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shadow-xs">
              AI Sư Phạm Tự Động
            </span>
          </div>
          <div class="font-bold text-xs text-slate-900 dark:text-white">${qa.title}</div>
          <div class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-blue-100 dark:border-blue-900/40">
            ${qa.content}
          </div>
        </div>
      `;
    }

    // CARD 1: GIẢI ĐÁP QUY TẮC BIỂU ĐỒ & BẪY THI THPT
    if (res.chart) {
      const c = res.chart;
      html += `
        <div class="p-4 rounded-xl bg-gradient-to-br from-indigo-50/80 to-blue-50/50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>${c.icon}</span>
              <span>1. Quy Tắc Biểu Đồ & Chẩn Đoán Đề Thi</span>
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white shadow-xs">
              Khuyên dùng: ${c.name.split('(')[0].trim()}
            </span>
          </div>

          <div class="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-relaxed bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40">
            🎯 <strong>Căn cứ lựa chọn:</strong> ${c.rule}
          </div>

          <div class="p-2.5 rounded-lg bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-800 dark:text-rose-200 space-y-1">
            <div class="font-bold flex items-center space-x-1 text-rose-700 dark:text-rose-300">
              <span>⚠️</span> <span>Cảnh Báo Bẫy Đề Thi Tốt Nghiệp THPT:</span>
            </div>
            <div class="text-[11px] leading-relaxed">${c.trap}</div>
          </div>

          <div class="p-2.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-1 font-mono text-[11px]">
            <div class="font-bold text-slate-900 dark:text-white font-sans flex items-center space-x-1">
              <span>📐</span> <span>Công thức tính toán tương ứng:</span>
            </div>
            <div>${c.formula}</div>
          </div>

          <div class="flex flex-wrap items-center gap-2 pt-1">
            <button 
              onclick="GeoSmartAssistant.goToChartMode()" 
              class="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center space-x-1 shadow-sm transition"
            >
              <span>📊</span>
              <span>Thực hành ngay trên Phân hệ 2 (Nhận dạng biểu đồ)</span>
            </button>
            ${c.calcFormulaId ? `
              <button 
                onclick="GeoSmartAssistant.goToCalcMode('${c.calcFormulaId}')" 
                class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 transition"
              >
                <span>🧮</span>
                <span>Mở máy tính tính nhanh</span>
              </button>
            ` : ""}
          </div>
        </div>
      `;
    }

    // CARD 2: ĐỊNH VỊ KHÔNG GIAN BẢN ĐỒ GIS
    if (res.geoEntities.length > 0) {
      const top = res.geoEntities[0];
      html += `
        <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>📍</span>
              <span>2. Định Vị Bản Đồ Số GIS & Dữ Liệu Thực Tế</span>
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
              ${top.category}
            </span>
          </div>

          <div class="bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/40 space-y-1.5 text-xs">
            <div class="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-2">
              <span>${top.name}</span>
              <span class="font-mono text-[10px] text-slate-400 font-normal">(${top.lat.toFixed(4)}°B, ${top.lng.toFixed(4)}°Đ)</span>
            </div>
            <div class="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              ${top.highlights}
            </div>
            ${top.examTip ? `
              <div class="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 pt-1 border-t border-emerald-50 dark:border-slate-700">
                💡 <strong>Điểm thi THPT:</strong> ${top.examTip}
              </div>
            ` : ""}
          </div>

          <div class="flex items-center space-x-2 pt-1">
            <button 
              onclick="GeoSmartAssistant.flyToGeo(${top.lat}, ${top.lng}, '${top.name.replace(/'/g, "\\'")}', '${top.layerKey}')" 
              class="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition"
            >
              <span>🗺️</span>
              <span>Bay tới vị trí trên Bản đồ GIS ngay</span>
            </button>
          </div>
        </div>
      `;
    }

    // CARD 3: CHỈ DẪN TRANG ATLAT GIẤY TƯƠNG ỨNG
    if (res.atlatPages.length > 0) {
      const primaryPage = res.atlatPages[0];
      html += `
        <div class="p-4 rounded-xl bg-gradient-to-br from-amber-50/80 to-orange-50/50 dark:from-amber-950/40 dark:to-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>📖</span>
              <span>3. Chỉ Dẫn Trang Atlat Địa Lí Việt Nam (Bản In Chuẩn)</span>
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-xs">
              Mở trang ${primaryPage}
            </span>
          </div>

          <div class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-white/80 dark:bg-slate-800/80 p-3 rounded-lg border border-amber-100 dark:border-amber-900/40 space-y-2">
            <div>
              Học sinh cần đối chiếu thông tin này trên <strong>Trang in số ${primaryPage}</strong> ${res.atlatPages.length > 1 ? `(kèm các trang bổ trợ: ${res.atlatPages.slice(1).join(', ')})` : ""} trong Atlat Địa lí Việt Nam do NXB Giáo dục phát hành.
            </div>
            <div class="flex flex-wrap items-center gap-1.5 pt-1">
              ${res.atlatPages.map(p => `
                <button 
                  onclick="GeoSmartAssistant.flipToAtlatPage(${p})" 
                  class="px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 font-bold text-xs transition flex items-center space-x-1"
                >
                  <span>📄</span>
                  <span>Lật mở Trang ${p}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <div class="pt-1 flex items-center space-x-2">
            <button 
              onclick="GeoSmartAssistant.flipToAtlatPage(${primaryPage})" 
              class="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition"
            >
              <span>📖</span>
              <span>Lật Trang 3D sang Trang ${primaryPage} (Atlat Giấy)</span>
            </button>
            <button 
              onclick="GeoSmartAssistant.triggerQuizHelper(${primaryPage})" 
              class="px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-amber-800 dark:text-amber-200 font-bold text-xs hover:bg-amber-50"
            >
              🎯 Đố vui Trang ${primaryPage}
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  function renderFallbackSearch(query, container) {
    container.innerHTML = `
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
        <div class="text-2xl">🔍</div>
        <div class="text-xs text-slate-700 dark:text-slate-300">
          Chưa tìm thấy mục tra cứu định sẵn cho "<strong>${query}</strong>".
        </div>
        <div class="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button 
            onclick="GeoSmartAssistant.askDeepAI('${query.replace(/'/g, "\\'")}')" 
            class="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition flex items-center space-x-1"
          >
            <span>🧠</span> <span>Hỏi đáp mở rộng với Google Gemini AI</span>
          </button>
          <button 
            onclick="GeoSmartAssistant.runGisSearch('${query.replace(/'/g, "\\'")}')" 
            class="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-sm transition"
          >
            <span>🧭</span> <span>Quét tìm trên Bản đồ GIS</span>
          </button>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // 11. HÀNH ĐỘNG ĐIỀU HƯỚNG LIÊN PHÂN HỆ
  // =========================================================================
  function flyToGeo(lat, lng, name, layerKey) {
    closeModal();
    if (window.AtlasEngine) {
      window.AtlasEngine.setAtlasViewMode("gis");
      const map = window.AtlasEngine.getMap();
      if (map) {
        map.flyTo([lat, lng], 11, { duration: 1.2 });
        setTimeout(() => {
          L.popup()
            .setLatLng([lat, lng])
            .setContent(`
              <div class="p-2 space-y-1">
                <div class="font-bold text-xs text-blue-700">${name}</div>
                <div class="text-[10px] text-slate-500 font-mono">${lat.toFixed(4)}°B, ${lng.toFixed(4)}°Đ</div>
                <div class="text-[11px] text-slate-700">Đã định vị thành công từ Hộp Tra Cứu Thông Minh.</div>
              </div>
            `)
            .openOn(map);
        }, 1250);
      }
    }
  }

  function flipToAtlatPage(pageNum) {
    closeModal();
    if (window.AtlasEngine) {
      window.AtlasEngine.setAtlasViewMode("book");
      setTimeout(() => {
        window.AtlasEngine.selectAtlatBookPage(pageNum);
      }, 50);
    }
  }

  function goToChartMode() {
    closeModal();
    const btn = document.querySelector('[data-tab-target="mode-charts"]');
    if (btn) btn.click();
  }

  function goToCalcMode(formulaId) {
    closeModal();
    const btn = document.querySelector('[data-tab-target="mode-calc"]');
    if (btn) btn.click();
    if (formulaId && window.GeoCalculator) {
      const select = document.getElementById("calc-formula-select");
      if (select) {
        select.value = formulaId;
        window.GeoCalculator.selectFormula(formulaId);
      }
    }
  }

  function runGisSearch(query) {
    closeModal();
    if (window.AtlasEngine && window.AtlasEngine.searchAndFlyTo) {
      window.AtlasEngine.setAtlasViewMode("gis");
      window.AtlasEngine.searchAndFlyTo(query);
    }
  }

  // =========================================================================
  // 12. KHỞI TẠO BỘ LẮNG NGHE SỰ KIỆN & PHÍM TẮT
  // =========================================================================
  function init() {
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      window.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key && e.key.toLowerCase() === "k") {
          e.preventDefault();
          openModal();
        }
        if (e.key === "/" && document.activeElement && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
          e.preventDefault();
          openModal();
        }
      });
    }

    if (typeof document !== "undefined") {
      const headerInput = document.getElementById("global-smart-assistant-input");
      if (headerInput && typeof headerInput.addEventListener === "function") {
        headerInput.addEventListener("focus", () => {
          openModal(headerInput.value);
        });
        headerInput.addEventListener("input", (e) => {
          openModal(e.target.value);
        });
      }

      const atlasSearchInput = document.getElementById("atlas-search-input");
      if (atlasSearchInput && typeof atlasSearchInput.addEventListener === "function") {
        atlasSearchInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.isComposing) {
            const val = atlasSearchInput.value.trim();
            const analysis = analyzeQuery(val);
            if (analysis && (analysis.chart || analysis.offlineQA)) {
              e.stopPropagation();
              openModal(val);
            }
          }
        });
      }
    }
  }

  return {
    init,
    openModal,
    closeModal,
    clearInput,
    setSearch,
    handleInputChange: (val) => openModal(val),
    handleInputFocus: () => openModal(),
    analyzeQuery,
    flyToGeo,
    flipToAtlatPage,
    goToChartMode,
    goToCalcMode,
    runGisSearch,
    // AI Specific API
    getAIMode,
    setAIMode,
    getGeminiApiKey,
    setGeminiApiKey,
    getGeminiModel,
    setGeminiModel,
    openAISettings,
    closeAISettings,
    saveAISettings,
    clearAISettings,
    callGeminiAPI,
    askDeepAI,
    triggerTableHelper,
    triggerQuizHelper,
    generateTableReview,
    generateAtlatQuiz
  };
})();

// Khởi chạy khi DOM sẵn sàng
if (typeof document !== "undefined" && typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => window.GeoSmartAssistant && window.GeoSmartAssistant.init());
  } else {
    window.GeoSmartAssistant && window.GeoSmartAssistant.init();
  }
}
