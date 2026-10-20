# BẢNG RÀ SOÁT DỮ LIỆU & ĐỊA DANH HARDCODE TRONG CODEBASE (`HARDCODE_AUDIT.md`)

> **Căn cứ rà soát:** Quét tự động và kiểm tra mã nguồn tĩnh toàn bộ các tệp JavaScript (`js/`) và giao diện (`index.html`) ngày 19/10/2026.  
> **Nguyên tắc:** Mọi số liệu, bảng biểu, danh mục địa danh hiển thị trên UI phải được tách ra `src/data/` và có trường `source` truy nguyên về 3 tài liệu nguồn (`GD`, `DHQG`, `BD`).

---

## 1. Bảng kiểm kê các vị trí hardcode dữ liệu trong codebase

| STT | Tệp tin | Vị trí (Dòng) | Nội dung hardcode | Phân hệ | Tình trạng đối chiếu với `./data/` | Hướng khắc phục ở Giai đoạn 1 |
|:---:|:---|:---:|:---|:---:|:---|:---|
| 1 | `js/geo-calculator.js` | 52–67 | Bảng số liệu mẫu Mật độ dân số 10 tỉnh (TP.HCM, Hà Nội, Hải Phòng...) | Máy tính | Khớp số liệu diện tích, dân số ở `GD` tr.5 (Niên giám 2024), nhưng đang viết cứng trong JS | Chuyển sang `src/data/stats/GD/p05_population_density.json` kèm `source` |
| 2 | `js/geo-calculator.js` | 108–117 | Bảng tỉ suất sinh thô, tử thô (Hà Nội, TP.HCM, Đắk Lắk...) | Máy tính | **DATA_GAPS:** Atlat không có bảng sinh thô/tử thô; số liệu lấy từ đặc tả mô phỏng | Đánh dấu `source.type: "spec"`, `status: "needs-review"` |
| 3 | `js/geo-calculator.js` | 160–170 | Bảng sản lượng và diện tích lúa (ĐBSCL, ĐBSH...) | Máy tính | Số liệu xấp xỉ biểu đồ lúa `GD` tr.20; chưa trích dẫn chuẩn | Trích xuất bảng chuẩn từ `GD` tr.20 sang `src/data/stats/` |
| 4 | `js/geo-calculator.js` | 212–221 | Bảng sản lượng lương thực & dân số bình quân đầu người | Máy tính | Dữ liệu tính toán kết hợp từ dân số tr.5 và sản lượng tr.20 | Tách thành dataset có trích dẫn công thức liên kết |
| 5 | `js/geo-calculator.js` | 267–277 | Bảng xuất khẩu, nhập khẩu và cán cân thương mại hàng hóa | Máy tính | Khớp chuỗi số liệu biểu đồ xuất nhập khẩu `DHQG` tr.27 | Chuyển thành `src/data/stats/DHQG/p27_trade_balance.json` |
| 6 | `js/geo-calculator.js` | 323–333 | Bảng tỉ lệ xuất/nhập khẩu và tổng kim ngạch | Máy tính | Tương tự bảng cán cân thương mại | Chuyển sang dataset thống nhất |
| 7 | `js/geo-calculator.js` | 382–392 | Bảng cơ cấu GDP phân theo khu vực kinh tế qua các năm | Máy tính | Khớp biểu đồ cơ cấu GDP `DHQG` tr.20 và `GD` tr.18 | Chuyển thành `src/data/stats/p18_gdp_structure.json` |
| 8 | `js/geo-calculator.js` | 443–454 | Bảng chỉ số tốc độ tăng trưởng GDP, công nghiệp, dịch vụ | Máy tính | Số liệu mô phỏng từ biểu đồ tăng trưởng `DHQG` tr.20 | Chuyển sang dataset có trường `source` |
| 9 | `js/geo-calculator.js` | 506–517 | Bảng diện tích rừng tự nhiên, rừng trồng và diện tích đất | Máy tính | Xấp xỉ số liệu biểu đồ lâm nghiệp `GD` tr.21 | Trích xuất số liệu chuẩn từ `GD` tr.21 |
| 10 | `js/geo-calculator.js` | 577–586 | Bảng khoảng cách đo trên Atlat 1:6.000.000 và múi giờ | Máy tính | Số đo thực tế trên thước kẻ học sinh | Đánh dấu `source.type: "spec"`, lưu công thức quy đổi |
| 11 | `js/chart-trainer.js` | 40–47 | Định nghĩa `CORE_6_CHART_TYPES` (Tròn, Miền, Đường, Cột, Chồng, Kết hợp) | Biểu đồ | Khớp 6 mục heading trong `biểu đồ.docx` | Tách sang `src/data/rules/chart-rules.json` |
| 12 | `js/chart-trainer.js` | 50–78 | Mảng `SIGNAL_KEYWORDS` gồm 28 cụm từ tín hiệu | Biểu đồ | Khớp các đoạn văn trong `biểu đồ.docx` | Tách sang `src/data/rules/keywords.json` |
| 13 | `js/chart-trainer.js` | 1374–1440 | 4 mẫu đề thi thử nạp nhanh (`loadCustomSample`) | Biểu đồ | Dữ liệu mẫu mô phỏng đề thi THPT, chưa có mã câu hỏi | Chuyển vào ngân hàng `src/data/charts/samples.json` |
| 14 | `js/atlas-engine.js` | 114–124 | Bảng mã màu 6 vùng kinh tế `REGION_COLORS` | Atlas Số | Màu CSS tự chọn trong code | Chuyển sang `src/data/rules/styles.GD.json` |
| 15 | `js/atlas-engine.js` | 57–74 | Cấu hình Basemap tiles (Esri Physical, OSM, Satellite) | Atlas Số | **Vi phạm Mục 7.3:** Dùng tile bên thứ ba | Loại bỏ hoàn toàn, thay bằng vector nền tự số hoá |
| 16 | `js/atlas-engine.js` | 345–375 | Lưới tọa độ kinh vĩ tuyến (Graticule) 8°B–24°B, 102°Đ–114°Đ | Atlas Số | Khớp các vạch tọa độ in trên mép bản đồ Atlat tr.4-5 | Chuẩn hóa vào lớp vector `geo_graticule` |

---

## 2. Kết luận và Kế hoạch xử lý
- Toàn bộ 10 bảng số liệu trong `js/geo-calculator.js` sẽ được rút trích sạch sẽ ra các tệp JSON có cấu trúc trong `src/data/stats/`.
- Toàn bộ quy tắc biểu đồ và từ khóa trong `js/chart-trainer.js` sẽ được chuyển thành `src/data/rules/chart-rules.json`.
- Gỡ bỏ hoàn toàn cấu hình `BASEMAPS` gọi tile bên thứ ba trong `js/atlas-engine.js`, chỉ sử dụng TopoJSON nội bộ theo Hợp đồng dữ liệu mục 1.5.

