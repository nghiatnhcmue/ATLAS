# GeoAtlas Interactive 🌏🇻🇳
### Hệ Thống Giáo Dục Địa Lý Tương Tác: Kỹ Năng Atlat, Nhận Dạng Biểu Đồ & Máy Tính Địa Lý THPT

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero-Cost Static Hosting](https://img.shields.io/badge/Hosting-Zero--Cost%20Serverless-emerald.svg)](README.md)
[![National Sovereignty](https://img.shields.io/badge/Ch%E1%BB%A7%20quy%E1%BB%81n-Ho%C3%A0ng%20Sa%20%26%20Tr%C6%B0%E1%BB%9Dng%20Sa-red.svg)](README.md)

**GeoAtlas Interactive** là ứng dụng web giáo dục chuyên sâu được thiết kế tối ưu dành riêng cho học sinh, giáo viên môn Địa lí bậc THPT và sĩ tử chuẩn bị thi Tốt nghiệp THPT Quốc gia tại Việt Nam.

Hệ thống hoạt động theo mô hình **Zero-cost Serverless / Pure Static Hosting**, không cần Backend server hay cơ sở dữ liệu khi vận hành, tải trang cực nhanh, hỗ trợ đầy đủ thiết bị máy tính, máy tính bảng và điện thoại di động.

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. 🗺️ Bản Đồ Atlat Tương Tác (Interactive GIS Engine)
- **Chuẩn hóa 7 Vùng Kinh Tế**: Tô màu trực quan 63 tỉnh/thành phố và hiển thị số liệu diện tích, dân số, mật độ dân số, thủ phủ hành chính.
- **Khẳng định Chủ quyền Biển Đảo**: Thể hiện trang trọng và chuẩn mực chủ quyền lãnh thổ với **Quần đảo Hoàng Sa (TP. Đà Nẵng)** và **Quần đảo Trường Sa (Tỉnh Khánh Hòa)**.
- **Lớp Khoáng sản (Atlat Trang 8)**: Hơn 45 mỏ than, dầu mỏ, khí đốt, bôxit, sắt, titan, apatit, đá quý... với bộ ký hiệu SVG chuẩn Atlat.
- **Lớp Công nghiệp Năng lượng (Atlat Trang 22)**: 46 nhà máy thủy điện, nhiệt điện than, nhiệt điện khí, điện gió, điện mặt trời kèm công suất MW và dòng sông/nhiên liệu.
- **Lớp Trung tâm Công nghiệp (Atlat Trang 21)**: Vẽ trực tiếp **Biểu đồ tròn SVG (Pie Marker)** biểu diễn cơ cấu ngành (cơ khí, điện tử, hóa chất, dệt may, thực phẩm...) với bán kính tỉ lệ thuận theo quy mô (*Rất lớn, Lớn, Vừa, Nhỏ*).
- **Bộ lọc & Tìm kiếm tức thì**: Tra cứu nhanh tỉnh thành, mỏ khoáng sản hoặc nhà máy điện với hiệu ứng `flyTo` mượt mà.

### 2. 📊 Luyện Thi Nhận Dạng Biểu Đồ & AI Table Analyzer
- **Ngân hàng Bài tập Trắc nghiệm Thực chiến**: Hệ thống các câu hỏi phân loại bảng số liệu chọn dạng biểu đồ (*Cột, Đường, Tròn, Miền, Kết hợp*).
- **Bóc tách Từ khóa Vàng**: Tự động phát hiện và đánh dấu các tín hiệu nhận biết đắt giá (*"tốc độ tăng trưởng", "quy mô và cơ cấu", "chuyển dịch cơ cấu", "năm gốc 100%"*).
- **Trực quan hóa Thực tế với Apache ECharts**: Sau khi làm bài, học sinh được quan sát biểu đồ thật tương tác, có thể phóng to, ẩn/hiện chỉ tiêu và tải ảnh PNG.
- **Công cụ Phân tích Bảng số liệu Tùy chọn**: Học sinh/giáo viên có thể dán bảng số liệu từ Word/Excel; thuật toán Rule Engine sẽ phân tích cấu trúc, đề xuất dạng biểu đồ với độ tin cậy 98% và vẽ ngay đồ thị.

### 3. 🧮 Máy Tính Công Thức Địa Lý THPT (KaTeX Step-by-Step)
- Bộ công thức chuẩn thi Tốt nghiệp THPT: *Mật độ dân số, Tỉ suất gia tăng tự nhiên, Tốc độ tăng trưởng, Năng suất cây trồng, Bình quân lương thực, Cán cân xuất nhập khẩu, Độ che phủ rừng, Biên độ nhiệt, Cân bằng ẩm...*
- **Tự động quy đổi đơn vị**: Chuyển đổi linh hoạt giữa $ha \leftrightarrow km^2$, *nghìn tấn $\leftrightarrow$ tấn*, *triệu người $\leftrightarrow$ người*.
- **Lời giải Sư phạm Từng bước**: Hiển thị công thức toán học KaTeX rõ ràng, chi tiết kèm nhận xét địa lý học.

### 4. 📖 Sổ Tay Ký Hiệu & Cẩm Nang Phòng Thi
- Tra cứu nhanh các ký hiệu Atlat chuẩn.
- Bảng ma trận phân biệt dạng biểu đồ và các bẫy đề thi kinh điển.

---

## 📂 CẤU TRÚC THƯ MỤC

```text
geoatlas-interactive/
├── scripts/
│   ├── 01_fetch_boundaries.py      # Tải GeoJSON ranh giới tỉnh + Hoàng Sa, Trường Sa
│   ├── 02_crawl_atlas_layers.py    # Cào và sinh các lớp Atlat (Khoáng sản, Thủy điện, TTCN)
│   └── 03_build_chart_bank.py      # Sinh ngân hàng bảng số liệu & câu hỏi biểu đồ
├── public/
│   └── data/
│       ├── vn_provinces.geojson    # Lớp nền hành chính & 7 vùng kinh tế
│       ├── minerals.geojson        # Lớp điểm Khoáng sản (Atlat trang 8)
│       ├── hydropower.geojson      # Lớp điểm Thủy điện/Nhiệt điện (Atlat trang 22)
│       ├── industrial_centers.geojson # Lớp điểm Trung tâm công nghiệp (Pie Markers)
│       └── chart_questions.json    # Ngân hàng câu hỏi trắc nghiệm & cấu hình ECharts
├── index.html                      # Giao diện chính tích hợp Tailwind, Leaflet, ECharts, KaTeX
├── css/
│   └── styles.css                  # Custom CSS & Ký hiệu SVG chuẩn Atlat
├── js/
│   ├── app.js                      # Quản lý trạng thái chung, dark mode & chuyển tab
│   ├── fallback-store.js           # Kho dữ liệu hạt giống nội tuyến (Phòng thủ Tầng 3)
│   ├── atlas-engine.js             # Leaflet GIS, Layer switcher & SVG Pie Markers
│   ├── chart-trainer.js            # Trắc nghiệm biểu đồ, bóc tách từ khóa & ECharts
│   └── geo-calculator.js           # Máy tính công thức địa lý & chuẩn hóa đơn vị
└── README.md                       # Tài liệu hướng dẫn sử dụng và triển khai
```

---

## 🛡️ CƠ CHẾ 3 TẦNG PHÒNG THỦ (ZERO-FAIL RESILIENCE PROTOCOL)

GeoAtlas Interactive được tích hợp cơ chế chịu lỗi toàn trình đảm bảo tính sẵn sàng 100%:
1. **Tầng 1: Thử lại Thông minh & Giới hạn Thời gian (Retry & Timeout)**
   - Mọi request trong ETL script có `timeout=8s` và định danh `User-Agent: GeoAtlas_VN_Education_App/1.0`.
   - Áp dụng Exponential Backoff tự động thử lại tối đa 2 lần khi gặp lỗi mạng/API.
2. **Tầng 2: Kho Dữ Liệu Hạt Giống Nội Bộ (Embedded Fallback Seed Data)**
   - Toàn bộ tọa độ mỏ khoáng sản (Atlat trang 8), nhà máy điện (trang 22), 15 trung tâm công nghiệp (trang 21) cùng 23 tỉnh thành và 2 quần đảo **Hoàng Sa - Trường Sa** được nhúng trực tiếp trong code Python. Nếu các API công cộng bị sập hoặc nghẽn mạng, script tự động chuyển sang dữ liệu hạt giống, đảm bảo các file GeoJSON/JSON đầu ra luôn đầy đủ.
3. **Tầng 3: Frontend Fallback Store & Hỗ trợ Mở Trực Tiếp `file://`**
   - File `js/fallback-store.js` chứa dữ liệu nội bộ `window.GEO_ATLAS_FALLBACK_DATA`.
   - Ngay cả khi người dùng mở trực tiếp `index.html` qua giao thức `file://` (bị trình duyệt chặn CORS) hoặc khi ngắt kết nối Internet hoàn toàn, cả 3 phân hệ vẫn chạy hoàn hảo và hiển thị thông báo chế độ nội tuyến.

---

## 🚀 HƯỚNG DẪN CHẠY CỤC BỘ (LOCAL DEVELOPMENT)

### Bước 1: Chạy scripts cập nhật dữ liệu (Nếu cần)
```bash
python scripts/01_fetch_boundaries.py
python scripts/02_crawl_atlas_layers.py
python scripts/03_build_chart_bank.py
```

### Bước 2: Khởi chạy Web Server cục bộ
Vì trình duyệt áp dụng chính sách CORS đối với lệnh `fetch()` file JSON/GeoJSON cục bộ, hãy khởi chạy một Web Server tĩnh đơn giản:

**Sử dụng Python (có sẵn):**
```bash
python -m http.server 8080
```
Sau đó mở trình duyệt và truy cập: `http://localhost:8080`

**Hoặc sử dụng Node.js (nếu có):**
```bash
npx serve .
```

---

## 🌐 HƯỚNG DẪN TRIỂN KHAI LÊN CLOUD (ZERO-COST HOSTING)

### Cách 1: Triển khai lên Cloudflare Pages (Khuyên dùng - Cực nhanh)
1. Đăng nhập vào [Cloudflare Dashboard](https://dash.cloudflare.com/) -> Chọn **Workers & Pages**.
2. Chọn **Create application** -> Tab **Pages** -> Chọn **Connect to Git** (hoặc chọn **Direct Upload** rồi kéo thả toàn bộ thư mục dự án).
3. Nếu liên kết qua GitHub:
   - **Project name**: `geoatlas-interactive`
   - **Production branch**: `main`
   - **Build command**: *Để trống*
   - **Build output directory**: `.` (thư mục gốc)
4. Nhấn **Save and Deploy**. Website của bạn sẽ hoạt động toàn cầu với HTTPS miễn phí và CDN siêu tốc!

### Cách 2: Triển khai lên GitHub Pages
1. Đẩy mã nguồn lên kho lưu trữ GitHub của bạn.
2. Vào tab **Settings** của repository -> Chọn mục **Pages** ở thanh bên trái.
3. Tại phần **Build and deployment**:
   - **Source**: Chọn `Deploy from a branch`
   - **Branch**: Chọn `main` (hoặc `master`), thư mục `/ (root)`
4. Nhấn **Save**. Sau 1 phút, trang web sẽ sẵn sàng tại địa chỉ `https://<ten-user>.github.io/<ten-repo>/`.

### Cách 3: Triển khai lên Vercel / Netlify
- Chỉ cần Import Repository vào Vercel hoặc Netlify, giữ nguyên thiết lập mặc định (Other / Static HTML), không cần cấu hình build step.

---

## 🇻🇳 BẢN QUYỀN & CHỦ QUYỀN LÃNH THỔ

- Dự án phát hành theo giấy phép mã nguồn mở **MIT License**.
- Toàn bộ dữ liệu bản đồ khẳng định mạnh mẽ và tôn trọng chủ quyền biển đảo thiêng liêng của Việt Nam đối với **Quần đảo Hoàng Sa** và **Quần đảo Trường Sa**.

