# BẢNG RÀ SOÁT VÀ PHÂN LOẠI LỖI TOÀN DIỆN (`BUG_AUDIT.md` - v2)

> **Căn cứ thực thi:** Mục 5 (Chế độ rà soát) của `PROMPT_SUA_LOI_GEOATLAS (v2)` khi Mục 1 để trống.  
> **Phương pháp:** Bắt đầu từ Mục 5.0 (Đối chiếu với tài liệu gốc), kết hợp kiểm toán mã nguồn, kiểm tra số liệu từng ô so với ảnh chụp 300 dpi từ Atlat `GD`, `DHQG` và tài liệu `BD`. Lưu ảnh bằng chứng tại `docs/bugfix-evidence/`.

---

## 1. Bảng tổng hợp lỗi theo thứ tự ưu tiên P0 → P3

| Mã lỗi | Phân hệ | Mức | Loại lỗi | Tóm tắt lỗi | Vị trí phát sinh & Bằng chứng tài liệu |
|:---|:---|:---:|:---:|:---|:---|
| **BUG-P0-01** | Atlas Số | **P0** | Chủ quyền biển đảo | Hoàng Sa & Trường Sa bị làm mờ khi bật Spotlight; bị ẩn khi tắt lớp Tỉnh thành | `js/atlas-engine.js:685-694, 700` |
| **BUG-P0-02** | Atlas Số | **P0** | Thuộc tính 34 tỉnh | Đất liền Đà Nẵng và Khánh Hòa bị gán nhầm `is_special_island: True` làm mất nhãn | `public/data/vn_provinces_34.geojson` (dòng 272 `build_34_provinces.py`) |
| **BUG-P0-03** | Toàn hệ thống | **P0** | Hợp đồng dữ liệu | Trích dẫn thiếu mã ấn bản (`GD`/`DHQG`), còn dùng số trang đặc tả cũ (tr.8, tr.21, tr.22) | `public/data/chart_questions.json`, `minerals.geojson`, `hydropower.geojson` |
| **BUG-P0-04** | Atlas Số | **P0** | Nội dung không nguồn | Lớp 6 hiển thị "Trung tâm CN kèm cơ cấu ngành" (nội dung không có trong Atlat) thay vì biểu đồ tròn cơ cấu GRDP 4 khu vực | `js/atlas-engine.js:191-252`; Đối chứng: `GD` tr.18 (`docs/bugfix-evidence/gd_p18_grdp_legend_clean.png`) |
| **BUG-P0-05** | Dữ liệu nền | **P0** | Sai lệch số liệu | Số liệu diện tích, dân số 34 tỉnh trong master JSON sai so với bảng Niên giám 2024 tại `GD` tr.5 | `scripts/build_atlat_2026_master.py:28-65`; Đối chứng: `docs/bugfix-evidence/gd_p05_table_crop.png` |
| **BUG-P0-06** | Biểu đồ | **P0** | Quy tắc chưa khớp BD | Cơ cấu 3 năm chưa ép về Miền; 4 điểm mơ hồ của BD chưa trả về "chấp nhận được (tài liệu chưa phân định)" | `js/chart-trainer.js:234-290`, `biểu đồ.docx` Mục 1, 4, 6 |
| **BUG-P0-07** | Bản đồ & UI | **P0** | Sai chính tả Atlat | Tên hiển thị bị thay đổi so với Atlat: "Khánh Hòa" (Atlat ghi "Khánh Hoà"), "Bô-xít" (ghi "Bôxit"), "Gió phơn" (ghi "Gió tây khô nóng") | `js/atlas-engine.js:145`, `minerals.geojson`, `public/data/vn_provinces_63.geojson` |
| **BUG-P1-01** | Giao diện | **P1** | Mobile Viewport | Dùng `h-screen` (100vh) ở `index.html:61` khiến chân trang bị che khuất trên mobile | `index.html:61` |
| **BUG-P2-01** | Máy tính | **P2** | Nhập liệu số VN | `<input type="number">` không chấp nhận dấu phẩy `,` hoặc dấu cách phân nghìn kiểu Atlat | `js/geo-calculator.js:729` |
| **BUG-P2-02** | Máy tính | **P2** | Xử lý biên | Chia cho 0 hoặc để trống ô mẫu số hiển thị `Infinity` / `NaN` trong KaTeX | `js/geo-calculator.js:68, 120, 588` |
| **BUG-P2-03** | Tìm kiếm | **P2** | Tương tác & IME | Không bắt sự kiện `compositionstart/end`; chưa mở rộng 14 chữ viết tắt chuẩn Atlat (`CC.`, `CN.`...) | `js/app.js:99`, `js/atlas-engine.js:179` |
| **BUG-P2-04** | Biểu đồ | **P2** | An toàn dữ liệu | Đề bài `raw_prompt` chèn vào `innerHTML` chưa qua escape HTML trong bộ Highlighting | `js/chart-trainer.js:212-226` |
| **BUG-P3-01** | Máy tính | **P3** | Hiển thị KaTeX | Dấu phẩy thập phân trong KaTeX tạo khoảng trắng thừa (cần bọc dạng `{,}`) | `js/geo-calculator.js:123-124` |
| **BUG-P3-02** | Atlas Số | **P3** | Trải nghiệm bản đồ | Chưa cấu hình `maxBounds: [[4.0, 99.0], [25.0, 122.0]]` bao trọn lãnh thổ và Biển Đông | `js/atlas-engine.js:258` |

---

## 2. Bằng chứng và phương án khắc phục chi tiết cho các lỗi P0

### BUG-P0-04: Lớp 6 hiển thị cơ cấu ngành công nghiệp (nội dung không có nguồn)
- **Triệu chứng:** Lớp 6 hiện vẽ các biểu đồ tròn đa quạt đại diện cho cơ cấu ngành sản xuất (cơ khí, thực phẩm, dệt may...) của từng trung tâm công nghiệp.
- **Bằng chứng tài liệu:**  
  Mở trang 18 và trang 22 của Atlat `GD` (xem ảnh cắt: `docs/bugfix-evidence/gd_p18_grdp_legend_clean.png` và `gd_p22_industry.png`):
  - Atlat **hoàn toàn không có biểu đồ tròn cơ cấu ngành cho trung tâm công nghiệp**.
  - Biểu đồ tròn trên bản đồ là **"Quy mô và cơ cấu GRDP phân theo 4 khu vực kinh tế của các tỉnh, thành phố năm 2024"** gồm 4 thành phần:
    1. *Nông nghiệp, lâm nghiệp và thuỷ sản* (màu xanh lá cây)
    2. *Công nghiệp và xây dựng* (màu đỏ)
    3. *Dịch vụ* (màu vàng)
    4. *Thuế sản phẩm trừ trợ cấp sản phẩm* (màu xanh dương nhạt)
- **Cách sửa:** Đổi tên Lớp 6 thành **"Kinh tế & Công nghiệp"**, hiển thị đúng 4 khu vực GRDP của 34 tỉnh với 4 màu chuẩn theo chú giải `GD` tr.18.

---

### BUG-P0-05: Sai lệch số liệu diện tích và dân số 34 tỉnh so với bảng Niên giám 2024
- **Triệu chứng:** Số liệu diện tích, dân số 34 tỉnh trong `build_atlat_2026_master.py` và `atlat_2026_master.json` bị lệch so với bảng gốc Atlat.
- **Bằng chứng tài liệu:**  
  Đối chiếu từng ô với bảng in tại `GD` tr.5 (ảnh cắt: `docs/bugfix-evidence/gd_p05_table_crop.png` và `gd_p05_table_left_crop.png`):
  - *Đồng Nai:* Code đang ghi `4 290,1` nghìn người $\to$ Bảng gốc `GD` tr.5 in rõ: **`4 427,7`** nghìn người.
  - *Khánh Hoà:* Code đang ghi `10 161,2` km² / `2 130,6` nghìn người $\to$ Bảng gốc `GD` tr.5 in rõ: **`8 555,9`** km² / **`1 882,0`** nghìn người.
  - *Quảng Ngãi:* Code đang ghi `11 227,1` km² / `2 751,9` nghìn người $\to$ Bảng gốc `GD` tr.5 in rõ: **`14 832,6`** km² / **`1 861,7`** nghìn người.
  - *Bắc Ninh:* Code đang ghi `3 379,1` nghìn người $\to$ Bảng gốc `GD` tr.5 in rõ: **`3 509,2`** nghìn người.
  - *Hưng Yên:* Code đang ghi `2 516,6` km² / `3 170,9` nghìn người $\to$ Bảng gốc `GD` tr.5 in rõ: **`2 514,8`** km² / **`3 208,5`** nghìn người.
  - *Ninh Bình:* Code đang ghi `3 942,3` km² / `3 700,0` nghìn người $\to$ Bảng gốc `GD` tr.5 in rõ: **`3 942,6`** km² / **`3 818,7`** nghìn người.
- **Cách sửa:** Cập nhật 100% số liệu diện tích và dân số của toàn bộ 34 tỉnh theo đúng bảng in tại `GD` tr.5.

---

### BUG-P0-07: Sai chính tả và thuật ngữ nguyên văn Atlat
- **Triệu chứng:** Tên hiển thị một số địa danh và hiện tượng tự nhiên bị thay đổi so với Atlat.
- **Bằng chứng tài liệu:**
  - `GD` tr.4–5 in: **"Khánh Hoà"** (dấu huyền trên chữ a) $\to$ Code đang ghi "Khánh Hòa".
  - `GD` tr.13 và trang Kí hiệu chung in: **"Bôxit"** $\to$ Code đang ghi "Bô-xít".
  - `GD` tr.8 và `DHQG` tr.3 in: **"Gió tây khô nóng"** $\to$ Code đang ghi "Gió phơn Tây Nam".
- **Cách sửa:** Giữ nguyên văn cách viết của Atlat trên nhãn hiển thị; các biến thể đưa vào mảng `aliases` để tìm kiếm.

---

## 3. Điểm dừng chờ phê duyệt (Checkpoint)

Toàn bộ **14 lỗi** trên đã được kiểm chứng thực tế và có ảnh bằng chứng đối chiếu tại thư mục `docs/bugfix-evidence/`.  
Chúng tôi đang **DỪNG** để chờ Thầy lựa chọn phạm vi sửa chữa:
- **Phương án 1 (Ưu tiên P0 & P1):** Sửa dứt điểm 7 lỗi P0 (Chủ quyền biển đảo, Sửa số liệu 34 tỉnh theo bảng gốc GD tr.5, Đổi Lớp 6 sang cơ cấu GRDP 4 khu vực, Chuẩn hóa mã ấn bản, Sửa chính tả Atlat) và 1 lỗi P1 (Layout 100dvh).
- **Phương án 2 (Sửa toàn bộ P0 → P3):** Cho phép tự động xử lý toàn diện cả 14 lỗi theo quy trình Mục 3 (có test chống tái phát và ghi nhật ký `docs/BUGFIX_LOG.md`).
