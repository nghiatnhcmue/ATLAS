# NHẬT KÝ SỬA LỖI TOÀN DIỆN GEOATLAS INTERACTIVE (`BUGFIX_LOG.md`)

> **Căn cứ thực thi:** Lựa chọn 2 (Sửa trọn gói toàn bộ P0 $\to$ P3) theo yêu cầu của Thầy Nghĩa.  
> **Tài liệu nguồn chân lý:**  
> - `GD`: *Atlat Địa lí Việt Nam 2026 (Chỉnh sửa theo CT GDPT 2018, Thầy Lê Huỳnh)*, NXB Giáo dục Việt Nam.  
> - `DHQG`: *Atlat Địa lí Việt Nam 2025 (Chỉnh sửa theo CT GDPT 2018)*, NXB ĐHQG Hà Nội.  
> - `BD`: *Tài liệu Kỹ năng Nhận diện Biểu đồ (`biểu đồ.docx`)*.  
> **Trạng thái tổng thể:** **14/14 LỖI ĐÃ KHẮC PHỤC HOÀN TOÀN (100% PASS)**.

---

## 1. Bảng Tổng Hợp Trạng Thái 14 Lỗi (P0 $\to$ P3)

| Mã lỗi | Phân hệ | Mức | Triệu chứng & Nguyên nhân | File thay đổi | Kết quả Test | Trạng thái |
|:---|:---|:---:|:---|:---|:---:|:---:|
| **BUG-P0-01** | Atlas Số | **P0** | Hoàng Sa & Trường Sa bị mờ khi Spotlight; bị ẩn khi tắt Lớp 1 | `js/atlas-engine.js` | `test_bugfixes.js` | **ĐÃ KHẮC PHỤC** |
| **BUG-P0-02** | Dữ liệu nền | **P0** | Đất liền Đà Nẵng & Khánh Hoà bị gán nhầm `is_special_island: True` | `public/data/vn_provinces_34.geojson` | `test_bugfixes.js` | **ĐÃ KHẮC PHỤC** |
| **BUG-P0-03** | Toàn hệ thống | **P0** | Trích dẫn thiếu mã ấn bản (`GD`/`DHQG`), sai số trang cũ | `chart_questions.json`, `minerals.geojson`, `hydropower.geojson` | `test_bugfixes.js`, `verify_data.py` | **ĐÃ KHẮC PHỤC** |
| **BUG-P0-04** | Atlas Số | **P0** | Lớp 6 hiển thị cơ cấu ngành không nguồn thay vì 4 khu vực GRDP | `industrial_centers.geojson`, `js/atlas-engine.js` | `test_bugfixes.js` | **ĐÃ KHẮC PHỤC** |
| **BUG-P0-05** | Dữ liệu nền | **P0** | Diện tích, dân số 34 tỉnh trong master sai lệch so với GD tr.5 | `atlat_2026_master.json`, `atlat-data.js` | `test_bugfixes.js` | **ĐÃ KHẮC PHỤC** |
| **BUG-P0-06** | Biểu đồ | **P0** | $\ge 3$ năm chưa ép về Miền; 4 điểm mơ hồ chưa trả thẻ sư phạm | `js/chart-trainer.js` | `test_bugfixes.js`, `test_table_analyzer.js` | **ĐÃ KHẮC PHỤC** |
| **BUG-P0-07** | Bản đồ & UI | **P0** | Sai chính tả: "Khánh Hòa", "Bô-xít", "Gió phơn" | `vn_provinces_63.geojson`, `minerals.geojson`, `atlas-engine.js` | `test_bugfixes.js` | **ĐÃ KHẮC PHỤC** |
| **BUG-P1-01** | Giao diện | **P1** | Dùng `h-screen` che khuất chân trang trên di động | `index.html`, `200.html` | `test_bugfixes.js` | **ĐÃ KHẮC PHỤC** |
| **BUG-P2-01** | Máy tính | **P2** | `<input type="number">` không nhận số định dạng Việt Nam | `js/geo-calculator.js` | `test_bugfixes.js` | **ĐÃ KHẮC PHỤC** |
| **BUG-P2-02** | Máy tính | **P2** | Mẫu số bằng 0 gây `Infinity` / `NaN` trong KaTeX | `js/geo-calculator.js` | `test_bugfixes.js` | **ĐÃ KHẮC PHỤC** |
| **BUG-P2-03** | Tìm kiếm | **P2** | Thiếu IME composition; chưa mở rộng 14 chữ viết tắt Atlat | `js/app.js`, `js/atlas-engine.js` | `test_bugfixes.js` | **ĐÃ KHẮC PHỤC** |
| **BUG-P2-04** | Biểu đồ | **P2** | `raw_prompt` chèn vào `innerHTML` chưa qua escape HTML | `js/chart-trainer.js` | `test_bugfixes.js` | **ĐÃ KHẮC PHỤC** |
| **BUG-P3-01** | Máy tính | **P3** | Dấu phẩy thập phân trong KaTeX tạo khoảng trắng thừa | `js/geo-calculator.js` | `test_bugfixes.js` | **ĐÃ KHẮC PHỤC** |
| **BUG-P3-02** | Atlas Số | **P3** | Thiếu `maxBounds` bảo vệ vùng xem toàn vẹn lãnh thổ | `js/atlas-engine.js` | `test_bugfixes.js` | **ĐÃ KHẮC PHỤC** |

---

## 2. Nhật Ký Chi Tiết Từng Bản Vá

### BUG-P0-01: Bất biến chủ quyền Quần đảo Hoàng Sa & Trường Sa
- **Mức độ:** P0 (Nghiêm trọng tuyệt đối).
- **Phân hệ:** Atlas Số (`js/atlas-engine.js`).
- **Triệu chứng:** Khi người dùng bật tính năng Spotlight Focus lọc theo vùng kinh tế (ví dụ: Đồng bằng sông Hồng, Tây Nguyên), hai quần đảo Hoàng Sa và Trường Sa bị làm mờ (opacity giảm xuống 0.15). Khi tắt Lớp 1 (Hành chính), hai quần đảo bị ẩn khỏi bản đồ.
- **Nguyên nhân gốc:** Đa giác Hoàng Sa & Trường Sa nằm chung trong `layerProvinces`. Style function áp dụng chung logic `isMatch` của vùng kinh tế mà không có ngoại lệ chủ quyền.
- **Cách khắc phục:**
  1. Tách riêng đa giác Quần đảo Hoàng Sa và Quần đảo Trường Sa ra khỏi luồng lọc của `layerProvinces`.
  2. Tạo lớp chuyên biệt độc lập `layerSovereigntyIslands` được gắn cố định trực tiếp vào `map`.
  3. Áp dụng style màu cờ đỏ sao vàng (`fillColor: #DC2626`, `color: #B91C1C`, `opacity: 1.0`, `fillOpacity: 0.75`), vĩnh viễn không bị mờ bởi Spotlight Focus.
  4. Trong hàm `toggleLayer("provinces", false)`, chỉ ẩn các tỉnh đất liền, giữ nguyên `layerSovereigntyIslands` luôn hiển thị.
- **File thay đổi:** `js/atlas-engine.js`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P0-01` PASS).

---

### BUG-P0-02: Thuộc tính `is_special_island` của 34 tỉnh thành
- **Mức độ:** P0.
- **Phân hệ:** Dữ liệu không gian (`public/data/vn_provinces_34.geojson`, `scripts/build_34_provinces.py`).
- **Triệu chứng:** Nhãn tên của Thành phố Đà Nẵng và Tỉnh Khánh Hoà trên đất liền không hiển thị ở các mức zoom cao.
- **Nguyên nhân gốc:** Script gộp tỉnh `build_34_provinces.py` gán cờ `is_special_island: True` cho toàn bộ feature Đà Nẵng và Khánh Hoà để tránh trùng nhãn với huyện đảo Hoàng Sa / Trường Sa, vô tình làm mất nhãn đất liền.
- **Cách khắc phục:**
  1. Đất liền Thành phố Đà Nẵng: `is_special_island: false`.
  2. Đất liền Tỉnh Khánh Hoà: `is_special_island: false`.
  3. Tạo 2 feature độc lập đại diện cho Quần đảo Hoàng Sa và Quần đảo Trường Sa với `is_special_island: true`.
- **File thay đổi:** `scripts/build_34_provinces.py`, `public/data/vn_provinces_34.geojson`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P0-02` PASS).

---

### BUG-P0-03: Chuẩn hóa trích dẫn nguồn và số trang Atlat
- **Mức độ:** P0.
- **Phân hệ:** Toàn hệ thống (`public/data/chart_questions.json`, `minerals.geojson`, `hydropower.geojson`, `build_atlat_2026_master.py`).
- **Triệu chứng:** Trích dẫn nguồn hiển thị số trang từ ấn bản cũ 2009 (Khoáng sản tr.8, Công nghiệp tr.21, Năng lượng tr.22) và thiếu mã ấn bản chuẩn.
- **Bằng chứng tài liệu:** Đối chiếu với `GD` (*Atlat Lê Huỳnh 2026*) và `DHQG` (*Atlat ĐHQG Hà Nội 2025*):
  - Khoáng sản: `Atlat GD, tr.13 (DHQG, tr.7)`
  - Năng lượng: `Atlat GD, tr.23 (DHQG, tr.19)`
  - Kinh tế chung & GRDP: `Atlat GD, tr.18 (DHQG, tr.14)`
  - Công nghiệp chung: `Atlat GD, tr.22 (DHQG, tr.18)`
  - Nông nghiệp: `Atlat GD, tr.19-21`
  - Thương mại & Cán cân: `Atlat GD, tr.26 (DHQG, tr.21)`
- **Cách khắc phục:** Cập nhật đồng bộ toàn bộ schema `atlat_page` và `source` trên các tệp dữ liệu và trong generator `build_atlat_2026_master.py`.
- **File thay đổi:** `public/data/chart_questions.json`, `public/data/minerals.geojson`, `public/data/hydropower.geojson`, `scripts/build_atlat_2026_master.py`, `public/data/atlat_2026_master.json`, `js/atlat-data.js`, `js/fallback-store.js`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P0-03` PASS), `python scripts/verify_data.py` (PASS).

---

### BUG-P0-04: Lớp 6 - Quy mô & Cơ cấu GRDP 4 khu vực kinh tế
- **Mức độ:** P0.
- **Phân hệ:** Atlas Số & Dữ liệu chuyên đề (`public/data/industrial_centers.geojson`, `js/atlas-engine.js`).
- **Triệu chứng:** Lớp 6 hiển thị các biểu đồ tròn đa quạt thể hiện cơ cấu ngành sản xuất của trung tâm công nghiệp (nội dung không có trong Atlat).
- **Bằng chứng tài liệu:** Mở `GD` tr.18 (*docs/bugfix-evidence/gd_p18_grdp_legend_clean.png*): Atlat không có biểu đồ cơ cấu ngành công nghiệp; biểu đồ tròn trên bản đồ là **"Quy mô và cơ cấu GRDP phân theo 4 khu vực kinh tế của các tỉnh, thành phố năm 2024"**.
- **Cách khắc phục:**
  1. Đổi tên Lớp 6 thành **"Kinh tế & Công nghiệp (Atlat GD, tr.18 & tr.22)"**.
  2. Tái cấu trúc thuộc tính `sectors` của các trung tâm gồm đúng 4 thành phần kinh tế theo bảng màu chuẩn `GD` tr.18:
     - Nông nghiệp, lâm nghiệp và thuỷ sản: `#16A34A` (Xanh lá cây)
     - Công nghiệp và xây dựng: `#DC2626` (Đỏ)
     - Dịch vụ: `#EAB308` (Vàng)
     - Thuế sản phẩm trừ trợ cấp sản phẩm: `#0284C7` (Xanh dương nhạt)
  3. Cập nhật tooltip, thẻ chi tiết và chú giải động hiển thị đúng 4 nhóm ngành và nguồn trích dẫn `Atlat GD, tr.18`.
- **File thay đổi:** `scripts/02_crawl_atlas_layers.py`, `public/data/industrial_centers.geojson`, `js/atlas-engine.js`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P0-04` PASS).

---

### BUG-P0-05: Khắc phục sai lệch số liệu 34 tỉnh so với bảng Niên giám GD tr.5
- **Mức độ:** P0.
- **Phân hệ:** Dữ liệu nền (`scripts/build_34_provinces.py`, `scripts/build_atlat_2026_master.py`, `atlat_2026_master.json`).
- **Triệu chứng:** Số liệu diện tích, dân số 34 đơn vị hành chính mới bị lệch so với bảng in chính thức tại `GD` tr.5 (*Niên giám thống kê 2024*).
- **Bằng chứng tài liệu:** Ảnh đối chiếu `docs/bugfix-evidence/gd_p05_table_crop.png`:
  - Đồng Nai: 12 737,2 km² / 4 427,7 nghìn người.
  - Khánh Hoà: 8 555,9 km² / 1 882,0 nghìn người.
  - Quảng Ngãi: 14 832,6 km² / 1 861,7 nghìn người.
  - Bắc Ninh: 4 718,6 km² / 3 509,2 nghìn người.
  - Hưng Yên: 2 514,8 km² / 3 208,5 nghìn người.
  - Ninh Bình: 3 942,6 km² / 3 818,7 nghìn người.
  - Vĩnh Long: 6 296,2 km² / 3 367,5 nghìn người.
- **Cách khắc phục:** Cập nhật toàn bộ 34 bản ghi trong dictionary `PROVINCE_34_SPECS` và master JSON khớp 100% từng chữ số của bảng `GD` tr.5.
- **File thay đổi:** `scripts/build_34_provinces.py`, `scripts/build_atlat_2026_master.py`, `public/data/vn_provinces_34.geojson`, `public/data/atlat_2026_master.json`, `js/atlat-data.js`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P0-05` PASS).

---

### BUG-P0-06: Chuẩn hoá quy tắc nhận diện biểu đồ theo tài liệu `biểu đồ.docx`
- **Mức độ:** P0.
- **Phân hệ:** Huấn luyện viên Biểu đồ (`js/chart-trainer.js`).
- **Triệu chứng:** Chuỗi thời gian 3 năm có tổng 100% chưa được ép về dạng Miền; 4 tình huống mơ hồ của tài liệu `biểu đồ.docx` chưa có phản hồi sư phạm phù hợp.
- **Cách khắc phục:**
  1. Áp dụng quy tắc Mục 1 & Mục 4 của `biểu đồ.docx`: 1-2 năm có tổng 100% ưu tiên Tròn; từ 3 năm trở lên bắt buộc chọn Miền.
  2. Bổ sung hàm `checkAmbiguousCase(q, selectedType)`: Nhận diện 4 điểm tranh luận (tốc độ tăng trưởng 2 đơn vị khác nhau, quy mô và cơ cấu 3-4 năm, diện tích và sản lượng cùng vẽ cột), trả về thẻ phản hồi sư phạm màu hổ phách: *"Chấp nhận được (Tài liệu chưa phân định)"*.
- **File thay đổi:** `js/chart-trainer.js`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P0-06` PASS), `node scripts/test_table_analyzer.js` (PASS).

---

### BUG-P0-07: Chính tả và thuật ngữ nguyên văn Atlat
- **Mức độ:** P0.
- **Phân hệ:** Toàn hệ thống (`public/data/vn_provinces_63.geojson`, `minerals.geojson`, `js/atlas-engine.js`).
- **Triệu chứng:** Tên hiển thị bị biến đổi: "Khánh Hòa" thay vì "Khánh Hoà"; "Bô-xít" thay vì "Bôxit"; "Gió phơn Tây Nam" thay vì "Gió tây khô nóng".
- **Bằng chứng tài liệu:**
  - `GD` tr.4-5: In nguyên văn **"Khánh Hoà"** (dấu huyền đặt trên chữ a).
  - `GD` tr.13 & Kí hiệu chung: In **"Bôxit"** (viết liền, không có dấu gạch ngang).
  - `GD` tr.8 & `DHQG` tr.3: In **"Gió tây khô nóng"**.
- **Cách khắc phục:** Chuyển toàn bộ chuỗi hiển thị sang đúng văn bản Atlat; các cách viết khác được đưa vào danh sách `aliases` để hỗ trợ tìm kiếm.
- **File thay đổi:** `public/data/vn_provinces_63.geojson`, `public/data/vn_provinces.geojson`, `public/data/minerals.geojson`, `js/atlas-engine.js`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P0-07` PASS).

---

### BUG-P1-01: Viewport di động `h-[100dvh]`
- **Mức độ:** P1.
- **Phân hệ:** Giao diện (`index.html`, `200.html`).
- **Triệu chứng:** Trên trình duyệt Safari iOS và Chrome Android, thanh địa chỉ di động che khuất thanh công cụ chân trang.
- **Nguyên nhân gốc:** Container cha sử dụng `h-screen` (tương đương `100vh` tĩnh).
- **Cách khắc phục:** Đổi class sang `h-[100dvh] overflow-hidden` hỗ trợ Dynamic Viewport Height hiện đại.
- **File thay đổi:** `index.html`, `200.html`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P1-01` PASS).

---

### BUG-P2-01: Bộ phân tích số định dạng Việt Nam (`parseVNNumber`)
- **Mức độ:** P2.
- **Phân hệ:** Máy tính Địa lí (`js/geo-calculator.js`).
- **Triệu chứng:** Người dùng dán số liệu có dấu phẩy thập phân (`12,5`) hoặc khoảng trắng phân tách hàng nghìn (`2 876,7`) bị chuyển thành `NaN`.
- **Cách khắc phục:**
  1. Đổi `<input type="number">` thành `<input type="text" inputmode="decimal">`.
  2. Xây dựng hàm `parseVNNumber(val)` loại bỏ ký tự khoảng trắng thông thường, NBSP (`\u00A0`), thin space (`\u2009`) và chuẩn hóa dấu phẩy `,` thành dấu chấm `.`.
- **File thay đổi:** `js/geo-calculator.js`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P2-01` PASS).

---

### BUG-P2-02: Xử lý an toàn mẫu số bằng 0 trong KaTeX
- **Mức độ:** P2.
- **Phân hệ:** Máy tính Địa lí (`js/geo-calculator.js`).
- **Triệu chứng:** Khi người dùng xóa trống hoặc nhập diện tích $= 0$, màn hình KaTeX hiển thị `Infinity` hoặc `NaN`.
- **Cách khắc phục:** Bổ sung điều kiện kiểm soát biên cho diện tích (`density`), kim ngạch nhập khẩu (`trade_balance`) và mẫu số tỷ lệ bản đồ (`map_scale_timezone`), trả về thông báo lỗi thân thiện thay vì công thức lỗi.
- **File thay đổi:** `js/geo-calculator.js`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P2-02` PASS).

---

### BUG-P2-03: IME Composition & 14 Chữ viết tắt chuẩn Atlat
- **Mức độ:** P2.
- **Phân hệ:** Tìm kiếm thông minh (`js/app.js`, `js/atlas-engine.js`).
- **Triệu chứng:** Người dùng gõ tiếng Việt bằng bộ gõ Telex/VNI bấm Enter bị kích hoạt tìm kiếm trước khi ký tự hoàn tất; gõ viết tắt Atlat như `CC. Ngân Sơn`, `CN. Lâm Viên` không tìm thấy kết quả.
- **Cách khắc phục:**
  1. Trong `js/app.js`: Bắt sự kiện `compositionstart` và `compositionend`, ngăn chặn sự kiện phím Enter khi `isComposing === true`.
  2. Trong `js/atlas-engine.js`: Thêm hàm `expandSearchVariants` mở rộng hai chiều 14 chữ viết tắt chuẩn Atlat (`CC.`, `CN.`, `SN.`, `N.`, `D.`, `Đ.`, `BĐ.`, `QĐ.`, `S.`, `K.`, `V.`, `TP.`, `GDP`, `GRDP`).
- **File thay đổi:** `js/app.js`, `js/atlas-engine.js`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P2-03` PASS).

---

### BUG-P2-04: Chống XSS trong bộ lọc từ khóa câu hỏi
- **Mức độ:** P2.
- **Phân hệ:** Huấn luyện viên Biểu đồ (`js/chart-trainer.js`).
- **Triệu chứng:** Thuộc tính `raw_prompt` chứa thẻ HTML chèn thẳng vào `innerHTML` khi hiển thị highlight từ khóa.
- **Cách khắc phục:** Đưa `raw_prompt` qua hàm `escapeHtml` biến đổi `&`, `<`, `>`, `"`, `'` thành HTML entities an toàn trước khi chạy regex bọc thẻ `<span class="keyword-highlight">`.
- **File thay đổi:** `js/chart-trainer.js`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P2-04` PASS).

---

### BUG-P3-01: Định dạng dấu phẩy KaTeX `{,}`
- **Mức độ:** P3.
- **Phân hệ:** Máy tính Địa lí (`js/geo-calculator.js`).
- **Triệu chứng:** Trong KaTeX, dấu phẩy trong số thập phân (`15,2`) bị coi là dấu phẩy phân tách câu lệnh khiến KaTeX tạo khoảng trắng thừa khó nhìn (`15, 2`).
- **Cách khắc phục:** Xây dựng hàm `formatLatexNumber` tự động chuyển đổi `(\d+),(\d+)` thành `$1{,}$2` trước khi gọi `katex.render`.
- **File thay đổi:** `js/geo-calculator.js`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P3-01` PASS).

---

### BUG-P3-02: Giới hạn không gian lãnh thổ Leaflet `maxBounds`
- **Mức độ:** P3.
- **Phân hệ:** Atlas Số (`js/atlas-engine.js`).
- **Triệu chứng:** Người dùng kéo bản đồ có thể cuộn ra ngoài phạm vi Việt Nam và Biển Đông.
- **Cách khắc phục:** Bổ sung cấu hình `maxBounds: [[4.0, 99.0], [25.0, 122.0]]` cùng `maxBoundsViscosity: 0.85` vào đối tượng khởi tạo `L.map`.
- **File thay đổi:** `js/atlas-engine.js`.
- **Test xác minh:** `node scripts/test_bugfixes.js` (Test `BUG-P3-02` PASS).

---

## 3. Kết Quả Kiểm Thử Toàn Hệ Thống

Toàn bộ các bộ kiểm thử tự động đã được thực thi và đạt tỷ lệ thành công 100%:
1. `node scripts/test_bugfixes.js`: **14/14 tests PASS (100%)**
2. `node scripts/test_table_analyzer.js`: **4/4 tests PASS (100%)**
3. `node scripts/test_edge_cases.js`: **6/6 tests PASS (100%)**
4. `node scripts/test_patches.js`: **12/12 tests PASS (100%)**
5. `python scripts/verify_data.py`: **5/5 datasets ĐỒNG BỘ SCHEMA & CHỦ QUYỀN ĐẠT (100%)**
