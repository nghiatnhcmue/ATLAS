/**
 * ===========================================================================
 * GEOATLAS INTERACTIVE - HỘP TÌM KIẾM & HỎI ĐÁP THÔNG MINH
 * (Smart Geo-Search & Exam Expert Assistant)
 * ===========================================================================
 * Ba chức năng hợp nhất trong 1 hộp tìm kiếm thông minh:
 * 1. Giải đáp quy tắc biểu đồ (Nhận dạng bẫy trắc nghiệm, công thức tính toán)
 * 2. Định vị không gian trực tiếp trên Bản đồ GIS (Tự động zoom & mở thông tin chi tiết)
 * 3. Chỉ dẫn trang Atlat Địa lí Việt Nam bản in tương ứng (Lật trang 3D tức thì)
 */

window.GeoSmartAssistant = (function () {
  "use strict";

  // =========================================================================
  // 1. CƠ SỞ TRI THỨC BIỂU ĐỒ & BẪY TRẮC NGHIỆM ĐỊA LÍ THPT
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
  // 2. CƠ SỞ DỮ LIỆU ĐỊA DANH, KHU KINH TẾ & TRANG ATLAT CHUẨN GD
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
  // 3. THUẬT TOÁN PHÂN TÍCH TRUY VẤN TỰ NHIÊN (NLP RULE ENGINE)
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

    // Sắp xếp địa danh điểm cao nhất lên đầu
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

    // Nhận diện theo từ khóa trang Atlat (ví dụ: "trang 8", "trang 13", "khi hau", "khoang san")
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

    referencedAtlatPages = Array.from(pageSet).sort((a, b) => a - b);

    return {
      query: rawQuery,
      yearsCount,
      chart: detectedChart,
      geoEntities: detectedGeoEntities,
      atlatPages: referencedAtlatPages
    };
  }

  // =========================================================================
  // 4. GIAO DIỆN HỘP THÔNG MINH (MODAL / COMMAND PALETTE)
  // =========================================================================
  function ensureModalDOM() {
    if (document.getElementById("smart-assistant-modal")) return;

    const modal = document.createElement("div");
    modal.id = "smart-assistant-modal";
    modal.className = "hidden fixed inset-0 z-[9500] bg-slate-950/70 backdrop-blur-md flex items-start justify-center pt-10 sm:pt-16 p-3 sm:p-4 animate-in fade-in duration-200";
    modal.innerHTML = `
      <div class="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        <!-- Header Thanh Nhập Liệu Thông Minh -->
        <div class="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-3 bg-slate-50/70 dark:bg-slate-900/70 shrink-0">
          <div class="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-sky-400 flex items-center justify-center text-white text-base shadow-sm shrink-0">
            <span>✨</span>
          </div>
          <div class="relative flex-1">
            <input 
              type="text" 
              id="assistant-modal-input" 
              placeholder="Dán đề bài biểu đồ hoặc gõ: 'Dung Quất', 'bôxit', 'thủy điện Hòa Bình'..." 
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
          <!-- Hiển thị mặc định khi chưa nhập -->
          <div id="assistant-empty-state" class="text-center py-8 space-y-3">
            <div class="text-4xl">💡</div>
            <div class="font-bold text-sm text-slate-800 dark:text-slate-200">
              Trợ Lí Địa Lí Thông Minh & Chẩn Đoán Đề Thi THPT
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Dán câu hỏi biểu đồ bất kì hoặc gõ tên địa danh, khoáng sản, khu kinh tế. Hệ thống sẽ giải mã quy tắc thi, định vị trên bản đồ số và chỉ dẫn trang Atlat tương ứng.
            </p>
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
          // Nếu có địa danh, tự động bay tới địa danh đầu tiên
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
  }

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

  // =========================================================================
  // 5. RENDER KẾT QUẢ TRẢ LỜI ĐA TẦNG (CHART + SPATIAL + ATLAT PAGE)
  // =========================================================================
  function handleSearch(query) {
    const container = document.getElementById("assistant-results-container");
    if (!container) return;

    if (!query || !query.trim()) {
      container.innerHTML = `
        <div id="assistant-empty-state" class="text-center py-8 space-y-3">
          <div class="text-4xl">💡</div>
          <div class="font-bold text-sm text-slate-800 dark:text-slate-200">
            Trợ Lí Địa Lí Thông Minh & Chẩn Đoán Đề Thi THPT
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Dán câu hỏi biểu đồ bất kì hoặc gõ tên địa danh, khoáng sản, khu kinh tế. Hệ thống sẽ giải mã quy tắc thi, định vị trên bản đồ số và chỉ dẫn trang Atlat tương ứng.
          </p>
        </div>
      `;
      return;
    }

    const res = analyzeQuery(query);
    if (!res || (!res.chart && res.geoEntities.length === 0 && res.atlatPages.length === 0)) {
      // Fallback: Thử tìm kiếm mờ trên lớp dữ liệu AtlasEngine
      renderFallbackSearch(query, container);
      return;
    }

    let html = "";

    // CARD 1: GIẢI ĐÁP QUY TẮC BIỂU ĐỒ & BẪY THI THPT (Nếu phát hiện từ khóa biểu đồ)
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

    // CARD 2: ĐỊNH VỊ KHÔNG GIAN BẢN ĐỒ GIS (Nếu tìm thấy đối tượng địa lí)
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

    // CARD 3: CHỈ DẪN TRANG ATLAT GIẤY TƯƠNG ỨNG (LẬT TRANG 3D)
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

          <div class="pt-1">
            <button 
              onclick="GeoSmartAssistant.flipToAtlatPage(${primaryPage})" 
              class="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition"
            >
              <span>📖</span>
              <span>Lật Trang 3D sang Trang ${primaryPage} (Atlat Giấy)</span>
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  function renderFallbackSearch(query, container) {
    // Gọi tìm kiếm tổng thể của AtlasEngine nếu có
    container.innerHTML = `
      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
        <div class="text-2xl">🔍</div>
        <div class="text-xs text-slate-700 dark:text-slate-300">
          Đang tìm kiếm "<strong>${query}</strong>" trên toàn bộ cơ sở dữ liệu GIS...
        </div>
        <button 
          onclick="GeoSmartAssistant.runGisSearch('${query.replace(/'/g, "\\'")}')" 
          class="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
        >
          Tìm và bay tới vị trí trên Bản đồ GIS 🧭
        </button>
      </div>
    `;
  }

  // =========================================================================
  // 6. CÁC HÀNH ĐỘNG ĐIỀU HƯỚNG LIÊN PHÂN HỆ (CROSS-TAB ACTIONS)
  // =========================================================================
  function flyToGeo(lat, lng, name, layerKey) {
    closeModal();
    if (window.AtlasEngine) {
      window.AtlasEngine.setAtlasViewMode("gis");
      const map = window.AtlasEngine.getMap();
      if (map) {
        map.flyTo([lat, lng], 11, { duration: 1.2 });
        // Mở popup hoặc highlight
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
  // 7. KHỞI TẠO BỘ LẮNG NGHE SỰ KIỆN & PHÍM TẮT (CTRL+K)
  // =========================================================================
  function init() {
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      // Phím tắt toàn cục: Ctrl+K hoặc / để mở hộp tìm kiếm thông minh
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
      // Lắng nghe ô nhập liệu trên header nếu có
      const headerInput = document.getElementById("global-smart-assistant-input");
      if (headerInput && typeof headerInput.addEventListener === "function") {
        headerInput.addEventListener("focus", () => {
          openModal(headerInput.value);
        });
        headerInput.addEventListener("input", (e) => {
          openModal(e.target.value);
        });
      }

      // Đồng bộ với ô tìm kiếm trên cột điều khiển GIS
      const atlasSearchInput = document.getElementById("atlas-search-input");
      if (atlasSearchInput && typeof atlasSearchInput.addEventListener === "function") {
        atlasSearchInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !e.isComposing) {
            const val = atlasSearchInput.value.trim();
            const analysis = analyzeQuery(val);
            // Nếu người dùng nhập câu hỏi biểu đồ vào ô tìm kiếm GIS, mở ngay trợ lí thông minh
            if (analysis && analysis.chart) {
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
    runGisSearch
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
