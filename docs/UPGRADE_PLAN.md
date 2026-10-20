# KẾ HOẠCH NÂNG CẤP TOÀN DIỆN GEOATLAS INTERACTIVE (`UPGRADE_PLAN.md` - v2)

> **Căn cứ xác lập:** Toàn bộ nội dung và 3 phụ lục của `PROMPT_NANG_CAP_GEOATLAS (v2)` sau khi khảo sát thực tế 3 tài liệu nguồn (`GD`, `DHQG`, `BD`).  
> **Nguyên tắc xuyên suốt:** Tái lập 100% qua pipeline; bảo vệ tuyệt đối chủ quyền Hoàng Sa & Trường Sa; mọi số liệu có trích dẫn mã ấn bản và trang in; kiểm thử tự động toàn diện.

---

## 1. Lộ trình thực hiện 6 Giai đoạn

### Giai đoạn 1: Đường ống dữ liệu tái lập (`data-pipeline/` $\to$ `src/data/`)
- **Cấu trúc:**
  - `data-pipeline/cache/`: Chứa ảnh render, ảnh cắt, kết quả OCR (đưa vào `.gitignore`).
  - `data-pipeline/extract/`: Script trích xuất từng tài liệu (`gd_p05_table.py`, `dhqg_p09_coords.py`...).
  - `data-pipeline/georef/`: Lưu điểm khống chế (GCP) và tham số nắn ảnh.
  - `data-pipeline/digitize/`: Kết quả số hóa trung gian kèm ảnh overlay kiểm tra chéo.
  - `data-pipeline/normalize/`: Chuẩn hóa Unicode NFC, định dạng số, thứ nguyên.
  - `data-pipeline/validate/`: Bộ kiểm tra `npm run data:validate` (Ajv schema, kiểm tra chéo 2 nguồn, tổng con = tổng mẹ, cơ cấu = 100%, toạ độ).
  - `src/data/`: Đầu ra đóng gói cho ứng dụng (`geo/`, `stats/`, `charts/`, `rules/`, `manifest.json`).
- **Sản phẩm:** Tái lập hoàn toàn bằng 1 lệnh `npm run data:build`, xuất `docs/DATA_REPORT.md`.

---

### Giai đoạn 2: Nâng cấp Phân hệ 1 (Atlas Số Chuyên Đề & Biển Đảo)
- **7 Lớp chuyên đề theo chuẩn Atlat GD (Mục 7.1):**
  1. *Lớp 1: Hành chính & Vùng:* 34 tỉnh, trung tâm hành chính, đặc khu, 6 vùng KT-XH theo ấn bản.
  2. *Lớp 2: Địa hình & Sông ngòi:* Phân tầng độ cao, đỉnh núi, 9 hệ thống sông lớn (GD tr.10), lát cắt địa hình.
  3. *Lớp 3: Khí hậu:* 2 miền khí hậu, vùng khí hậu, gió mùa, gió tây khô nóng, bão, trạm khí tượng (T, P in trên hình).
  4. *Lớp 4: Nông–lâm–thuỷ sản:* 5 loại vùng sản xuất nông nghiệp (polygon), ký hiệu điểm cây/con, bãi tôm bãi cá.
  5. *Lớp 5: Khoáng sản & Năng lượng:* 3 nhóm mỏ, bể dầu khí, nhà máy điện theo loại & công suất (>1000 MW, <1000 MW), lưới 500kV/220kV.
  6. *Lớp 6: Kinh tế & Công nghiệp:* Biểu đồ tròn quy mô & cơ cấu GRDP 4 khu vực của 34 tỉnh, GRDP/người, khu CN, khu công nghệ cao.
  7. *Lớp 7: Biển đảo & Chủ quyền (Lớp nền BẤT BIẾN, không có nút tắt):* Hoàng Sa & Trường Sa (nhãn nguyên văn theo ấn bản), đường cơ sở (A1–A24, điểm 0), 21 điểm phân định Vịnh Bắc Bộ, 13 đặc khu, nhãn "Biển Đông".
- **Chế độ mới:** "Không Atlat" (ẩn nhãn địa danh, đố vị trí không gian để thích ứng với quy chế thi 2025 không cho mang Atlat).

---

### Giai đoạn 3: Nâng cấp Phân hệ 2 (Nhận dạng Biểu đồ & Nhận xét Đúng/Sai Phần II)
- **Bộ quy tắc biểu đồ từ file BD (`src/data/rules/chart-rules.json`):**
  - Tròn: 1–2 năm, từ khóa "cơ cấu, tỷ trọng, tỷ lệ, kết cấu".
  - Miền: Từ 3 năm trở lên, 2–3 nhóm đối tượng, từ khóa "thay đổi cơ cấu, tỉ trọng".
  - Đường: Tốc độ tăng trưởng, mốc gốc 100% qua nhiều năm.
  - Cột: Biến động qua nhiều năm hoặc so sánh cùng đơn vị trong 1 năm.
  - Kết hợp: Khác đơn vị hoặc từ 3 loại số liệu trở lên.
  - Cột chồng: Quy mô và cơ cấu theo tỉ lệ % tuyệt đối.
  - Xử lý 4 điểm mơ hồ (Phụ lục B.3) theo phương án "Chấp nhận được kèm ghi chú".
- **Counter-factual Engine:** Vẽ minh họa tức thì trên ECharts cho mọi lựa chọn, có cảnh báo vi phạm hình học/tỉ xích, không crash.
- **Dạng bài mới:** Nhận xét Đúng/Sai 4 ý kiểu Phần II sinh tự động từ bảng số liệu Atlat, chấm điểm 0,1 / 0,25 / 0,5 / 1,0 đ.

---

### Giai đoạn 4: Nâng cấp Phân hệ 3 (Máy tính Địa lý & Phân tích Thứ nguyên)
- **Bảng số liệu thật từ Atlat:** Khai thác các bảng thật tại GD tr.5 (dân số, diện tích), tr.10 (9 hệ thống sông), tr.13 (trữ lượng khoáng sản), tr.16 (dân tộc), tr.23 (sản phẩm công nghiệp).
- **Phân tích thứ nguyên tự động:** Kiểm tra đơn vị đầu vào, nhân hệ số tiền tố bậc (nghìn, triệu, tỉ) và đơn vị gốc, chặn ghép sai thứ nguyên.
- **Định dạng số Việt Nam:** Hỗ trợ dấu cách phân nghìn và dấu phẩy thập phân ("2 876,7"), chấp nhận linh hoạt khi nhập liệu.
- **Làm tròn chuẩn phiếu thi:** Tách bạch kết quả đầy đủ và đáp án điền phiếu $\le 4$ ký tự (Phần III).

---

### Giai đoạn 5: Phân hệ Luyện đề 2025+ (Câu hỏi Tự sinh từ Atlat)
- **Đề thi 28 câu, 50 phút đúng QĐ 764/QĐ-BGDĐT:**
  - Phần I: 18 câu trắc nghiệm 4 lựa chọn (0,25 đ/câu).
  - Phần II: 4 câu Đúng/Sai 4 ý (0,1 $\to$ 1,0 đ/câu).
  - Phần III: 6 câu trả lời ngắn điền số $\le 4$ ký tự (0,25 đ/câu).
- Toàn bộ câu hỏi được sinh từ dữ liệu Atlat (`origin: "generated"`), hiển thị rõ xuất xứ trên UI.
- Câu làm sai tự động liên kết về trang Atlat / bài biểu đồ / công thức tương ứng để ôn tập lại.

---

### Giai đoạn 6: Kỹ thuật, Hiệu năng PWA & Triển khai
- Chuyển Tailwind CSS từ CDN sang build thời gian thực (Vite + Tailwind CSS).
- Ngân sách hiệu năng (Lighthouse CI): JS màn hình đầu $\le 200$ KB gzip, LCP $< 2,5$s trên mobile 4G.
- Service Worker precache app shell, chạy 100% offline.
- Không đóng gói ảnh scan hàng chục MB vào app để bảo vệ bản quyền và dung lượng.
- CI GitHub Actions tự động kiểm định dữ liệu và test trước khi deploy Cloudflare Pages.

---

## 2. Toàn bộ 9 Câu hỏi tại Điểm dừng Giai đoạn 0 (Phụ lục C)

| # | Câu hỏi cần Thầy/Người dùng phê duyệt | Phương án mặc định (nếu Thầy cho tự chạy) | Đề xuất chuyên môn của Agent |
|:---:|:---|:---|:---|
| **C1** | Ấn bản mặc định là GD hay DHQG? App có cần chuyển qua lại giữa hai ấn bản không? | GD mặc định; chưa làm chuyển ấn bản, chỉ dùng DHQG để đối chiếu | **Chọn GD làm mặc định** vì đủ 31 trang, DHQG thiếu 6 trang in. Chưa cần nút chuyển ấn bản để tránh rối học sinh. |
| **C2** | Nền bản đồ: (a) số hoá toàn bộ từ ảnh scan Atlat (Mục 6.5), hay (b) dùng ranh giới hành chính 34 tỉnh từ một nguồn ngoài do Thầy chỉ định (đã thể hiện đủ chủ quyền), rồi chỉ số hoá các đối tượng chuyên đề? | Phương án (a) | **Kiến nghị chọn (b)**: Sử dụng ranh giới vector 34 tỉnh chuẩn WGS84 đã kiểm định chủ quyền Hoàng Sa & Trường Sa hiện có, và nắn ảnh số hóa các điểm chuyên đề Atlat. Phương án này đảm bảo độ mượt và chính xác cao hơn tự vector hóa từ ảnh scan. |
| **C3** | Đối chiếu 63 ↔ 34 tỉnh: Thầy có bổ sung tài liệu sáp nhập gì không? Hay tạm ẩn tính năng? | Tạm ẩn tính năng | **Tạm ẩn** sau cờ cấu hình cho tới khi Thầy cung cấp văn bản sáp nhập chính thức. |
| **C4** | Lớp "Trung tâm công nghiệp" của đặc tả: đổi thành biểu đồ tròn GRDP theo khu vực kinh tế và các lớp công nghiệp của Atlat (5.2 #2) được không? Có cho phép đo góc quạt để suy số không? | Đổi tên lớp; Tuyệt đối không đo góc | **Đổi thành "Kinh tế & Công nghiệp"**; tuyệt đối không đo góc quạt để suy số, chỉ dùng số in trên Atlat. |
| **C5** | Cách chấm cho 4 điểm mơ hồ về biểu đồ ở Phụ lục B.3 (Đường vs Kết hợp khác đơn vị; Tròn vs Cột chồng 2 năm; Miền $\ge 4$ nhóm; Cột ghép) | Chấm "Chấp nhận được" kèm ghi chú sư phạm | **Chấp nhận được kèm giải thích rõ ràng** cho học sinh, không đánh sai oan. |
| **C6** | Công thức không có trong tài liệu: chấp nhận nguồn "đặc tả + giáo viên duyệt", hay Thầy bổ sung tài liệu công thức? | Dùng đặc tả, gắn nhãn `needs-review` | **Dùng đặc tả hiện có**, ghi chú `source.type: "spec"` và hiển thị nguồn chờ duyệt. |
| **C7** | Có bổ sung trang thiếu của DHQG (in 2, 6, 7, 14, 15, 19) không? | Không; dùng bản GD | **Không bổ sung**, tập trung khai thác bản GD trọn vẹn. |
| **C8** | Có làm phân hệ Luyện tập với câu hỏi tự sinh từ Atlat không? | Chưa làm (hoặc làm ở giai đoạn 5) | **Làm ở Giai đoạn 5** sau khi đường ống dữ liệu Atlat đã hoàn thành chuẩn xác. |
| **C9** | Toạ độ đường cơ sở: Atlat có ghi hệ quy chiếu không? Nếu không, dùng mặc định nào? | Vẽ theo đúng số in, ghi `datum: "unknown"`, đưa vào REVIEW_QUEUE | **Vẽ theo đúng toạ độ in**, ghi chú hệ quy chiếu gốc trong bảng tra cứu. |
