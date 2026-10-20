# DANH MỤC 10 KHOẢNG TRỐNG DỮ LIỆU ĐÃ XÁC MINH (`DATA_GAPS.md`)

> **Căn cứ xác minh:** Mục 5.3 của `PROMPT_NANG_CAP_GEOATLAS (v2)` sau khi kiểm tra đệ quy toàn bộ 3 tài liệu nguồn (`GD`, `DHQG`, `BD`).  
> **Nguyên tắc:** Ghi nhận minh bạch, để `status: "missing"` trong dữ liệu, UI hiển thị *"Chưa có dữ liệu"*, không bịa số liệu thay thế.

---

## 1. Chi tiết 10 khoảng trống dữ liệu trong kho nguồn hiện tại

| # | Khoảng trống dữ liệu | Phân hệ ảnh hưởng | Tình trạng thực tế trong 3 tài liệu | Phương án xử lý tuân thủ Hợp đồng dữ liệu |
|:---:|:---|:---:|:---|:---|
| **1** | **Ranh giới 63 tỉnh cũ & Bảng ánh xạ 63 → 34** | Phân hệ 1 (Atlas Số) | Cả hai cuốn Atlat chỉ có **34 tỉnh mới**. Hoàn toàn không có ranh giới 63 tỉnh cũ và không có bảng ánh xạ sáp nhập. | Tạm ẩn tính năng đối chiếu 63 tỉnh sau cờ cấu hình cho tới khi được cung cấp thêm tài liệu (xem câu hỏi C3). |
| **2** | **Phân chia 7 vùng truyền thống** | Phân hệ 1 (Atlas Số) | Cả hai Atlat chỉ thể hiện **6 vùng kinh tế - xã hội**. Không có tài liệu nào chia 7 vùng. | Chỉ hiển thị 6 vùng theo ấn bản Atlat. Không tạo dữ liệu 7 vùng. |
| **3** | **4 Ngư trường trọng điểm** | Phân hệ 1 (Lớp 4) | Không có khái niệm chữ này. Atlat chỉ có ký hiệu bãi tôm, bãi cá, vùng nuôi trồng/khai thác. | Chỉ hiển thị đúng các bãi tôm, bãi cá và cơ sở thủy sản mà Atlat có. |
| **4** | **Trung tâm công nghiệp kèm cơ cấu ngành** | Phân hệ 1 (Lớp 6) | Không có. Biểu đồ tròn trên bản đồ là quy mô và cơ cấu GRDP 4 khu vực của toàn tỉnh, không phải của trung tâm công nghiệp. | Đổi Lớp 6 thành **"Kinh tế & Công nghiệp"**, hiển thị đúng GRDP 4 khu vực và hạ tầng công nghiệp (xem câu hỏi C4). |
| **5** | **Dữ liệu hình học Vector (GeoJSON/Shapefile)** | Phân hệ 1 (Atlas Số) | Thư mục `./data/` **hoàn toàn không có file vector gốc**. Mọi hình học phải số hoá từ ảnh scan, hoặc dùng nguồn ngoài đã duyệt. | Trình phương án số hóa từ Atlat hoặc xin duyệt nguồn ngoài (xem câu hỏi C2). |
| **6** | **Đề thi và ngân hàng câu hỏi** | Phân hệ 4 & Phân hệ 2 | Ba tài liệu nguồn **không có đề thi hay ngân hàng câu hỏi**. | Chỉ xây dựng các câu hỏi tự sinh (`origin: "generated"`) từ số liệu và bản đồ của Atlat, ghi rõ trên UI (xem câu hỏi C8). |
| **7** | **Công thức tính toán Địa lý** | Phân hệ 3 (Máy tính) | Ba tài liệu nguồn **không có tài liệu công thức**. | Sử dụng 8 công thức trong đặc tả, gắn nhãn `source.type: "spec"` và `status: "needs-review"` (chờ giáo viên duyệt). |
| **8** | **Trang thiếu của bản scan DHQG** | Phân hệ 1 (Đối chiếu) | File `Atlat 2025_mới.pdf` **thiếu 6 trang in**: trang 2, 6, 7, 14, 15, 19. | Sử dụng ấn bản `GD` làm nguồn chính (đủ 31 trang). Không dùng các trang thiếu của DHQG (xem câu hỏi C7). |
| **9** | **Tỉ suất sinh thô và tử thô** | Phân hệ 3 (Công thức 2) | Chưa thấy bảng nào in tỉ suất sinh thô và tử thô (‰) để tính gia tăng tự nhiên. | Công thức gia tăng tự nhiên chỉ cho nhập tay, không có bảng mẫu Click-to-bind từ Atlat. |
| **10** | **Nhiệt độ từng tháng của trạm khí tượng** | Phân hệ 1 & Phân hệ 3 | Biểu đồ trạm khí hậu chỉ in số cho $T$ (nhiệt độ TB năm) và $P$ (tổng lượng mưa năm). Không in số từng tháng. | Không đo chiều cao cột hay đọc ước lượng để tính biên độ nhiệt. Nếu đọc từ hình chỉ gán `confidence: "low"`. |

---

## 2. Danh mục tài liệu đề xuất bổ sung (để người dùng duyệt)
1. Quyết định số 202/2025/QH15 hoặc phụ lục sáp nhập chi tiết 63 tỉnh $\to$ 34 tỉnh.
2. Đề thi minh họa tốt nghiệp THPT năm 2025 môn Địa lí của Bộ GD&ĐT (để nạp câu hỏi thật).
3. Tài liệu công thức tính toán Địa lý THPT có phê duyệt chuyên môn của tổ nghiệp vụ.
