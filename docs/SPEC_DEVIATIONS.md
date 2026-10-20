# BẢNG TỔNG HỢP CÁC ĐIỂM ĐẶC TẢ LỆCH VỚI TÀI LIỆU NGUỒN (`SPEC_DEVIATIONS.md`)

> **Căn cứ xác minh:** Mục 5 của `PROMPT_NANG_CAP_GEOATLAS (v2)` và kết quả khảo sát chi tiết 3 tài liệu nguồn (`GD`, `DHQG`, `BD`).  
> **Nguyên tắc:** Khi đặc tả và tài liệu mâu thuẫn $\to$ tuyệt đối tuân theo tài liệu nguồn, không tự suy đoán.

---

## 1. Bảng đối chiếu 11 điểm đặc tả sai lệch với tài liệu nguồn

| # | Nội dung trong đặc tả cũ | Thực tế trong 3 tài liệu nguồn (`GD`, `DHQG`, `BD`) | Quyết định xử lý chuẩn hóa |
|:---:|:---|:---|:---|
| **1** | "6 vùng KT-XH mới (hoặc 7 vùng truyền thống)" | Cả hai Atlat chỉ có **6 vùng KT-XH**, hoàn toàn **không có 7 vùng truyền thống**.<br>- Tên Vùng IV ở `GD` tr.18: *"Duyên hải Nam Trung Bộ và Tây Nguyên"*.<br>- Tên Vùng IV ở `DHQG` tr.20: *"Vùng Nam Trung Bộ"*. | Chỉ xây dựng dữ liệu cho **6 vùng** theo ấn bản. Đưa "7 vùng truyền thống" vào `docs/DATA_GAPS.md`. |
| **2** | "Trung tâm Công nghiệp: biểu đồ quạt đa ngành theo cơ cấu sản xuất" | **Không cuốn Atlat nào có trung tâm công nghiệp kèm cơ cấu ngành.**<br>Biểu đồ tròn trên bản đồ là **"Quy mô và cơ cấu GRDP phân theo 4 khu vực kinh tế của tỉnh, thành phố năm 2024"** (Nông-lâm-thủy sản; Công nghiệp-xây dựng; Dịch vụ; Thuế sản phẩm trừ trợ cấp). Công nghiệp được thể hiện qua: tỉ trọng GTSX công nghiệp tỉnh so với cả nước, khu kinh tế, khu công nghệ cao, khu công nghiệp. | Đổi tên Lớp 6 thành **"Kinh tế & Công nghiệp"** thể hiện đúng GRDP 4 khu vực và hạ tầng công nghiệp. Tuyệt đối không đo góc quạt để bịa số liệu. |
| **3** | "4 ngư trường trọng điểm" | Atlat **không có** danh mục chữ "4 ngư trường trọng điểm". Atlat chỉ thể hiện ký hiệu bản đồ: "Bãi tôm", "Bãi cá", "Khai thác hải sản", "Nuôi trồng hải sản" (GD tr.21, tr.32; DHQG tr.23). | Đưa "4 ngư trường trọng điểm" vào `docs/DATA_GAPS.md`. Trên bản đồ hiển thị đúng các bãi tôm, bãi cá và vùng khai thác Atlat có. |
| **4** | "Đối chiếu 63 ↔ 34 tỉnh" | Cả hai Atlat chỉ thể hiện **34 tỉnh/thành phố** sau sắp xếp (áp dụng từ 01/7/2025). Không có ranh giới 63 tỉnh cũ và không có bảng ánh xạ trong Atlat. | Tạm ẩn tính năng đối chiếu 63 tỉnh sau cờ cấu hình (Feature Flag) cho tới khi được cung cấp thêm dữ liệu nguồn. |
| **5** | "Gió Phơn Tây Nam" | Atlat dùng thuật ngữ chuẩn: **"Gió tây khô nóng"** (DHQG tr.3, GD tr.3). | Hiển thị tên nhãn nguyên văn "Gió tây khô nóng"; đưa "gió phơn" vào mảng `aliases` tìm kiếm. |
| **6** | "Ranh giới khí hậu: dãy Bạch Mã 16°B" | Atlat thể hiện **"Ranh giới miền khí hậu"** phân chia giữa "Miền khí hậu phía Bắc" và "Miền khí hậu phía Nam" (DHQG tr.11, GD tr.8). | Vẽ đường và gắn nhãn đúng như Atlat. Chỉ ghi chú tọa độ 16°B nếu Atlat có thể hiện. |
| **7** | "Vùng chuyên canh cà phê, cao su, chè, hồ tiêu" | Atlat thể hiện cây trồng bằng **ký hiệu điểm**. Phần vùng (polygon) là **5 loại vùng sản xuất nông nghiệp** (Vùng trồng cây lương thực thực phẩm & cây hàng năm; Vùng trồng cây CN lâu năm & cây ăn quả; Vùng nông lâm kết hợp; Vùng rừng; Vùng nuôi thủy sản tập trung). | Phân lớp đúng chuẩn: Polygon thể hiện 5 loại vùng sản xuất; Ký hiệu điểm thể hiện sự phân bố cây trồng, vật nuôi. |
| **8** | "Click-to-Bind vào bảng số liệu Atlat" | Atlat **có bảng số liệu thật** tại: GD tr.5, 7, 10, 13, 16, 23; DHQG tr.5, 8, 9. | Trích xuất chuẩn xác các bảng thật này vào `src/data/stats/` để phục vụ Click-to-Bind cho Phân hệ 3. |
| **9** | Quy tắc nhận dạng 6 dạng biểu đồ | File `BD` có các quy định phân định rõ rệt khác với đặc tả ban đầu (Tròn 1-2 năm; Miền từ 3 năm trở lên; Cột chồng cho quy mô và cơ cấu). | Tuân thủ 100% theo tài liệu `BD` (chi tiết tại Phụ lục B). |
| **10** | "Dữ liệu chuẩn Atlat 2026", "30-40% tổng điểm", "tải trang dưới 0.2s" | Không có căn cứ trong tài liệu nguồn. Chữ "2026" trong tên file chỉ là năm học, cả hai Atlat đều ghi *"Chỉnh sửa năm 2025"* và số liệu chủ yếu là năm 2024. | Loại bỏ các câu chữ tiếp thị không nguồn trên UI. Thay bằng ngân sách hiệu năng đo kiểm được trong `docs/PERF.md`. |
| **11** | Biển đảo không có trong 6 lớp | Cả hai Atlat đều có trang chuyên đề riêng: GD tr.7, tr.32; DHQG tr.8, tr.9. | Bổ sung Lớp 7 **"Biển đảo & Chủ quyền"** làm lớp nền cố định bất biến, không có nút tắt. |

---

## 2. Số trang Atlat trong đặc tả cũ bị chồng chéo
Đặc tả cũ trộn lẫn số trang của ấn bản cũ 2009 với hai ấn bản mới:
- *Khoáng sản:* Đặc tả cũ ghi trang 8 & 22 $\to$ Thực tế GD là **Trang 13**, DHQG là **Trang 10**.
- *Năng lượng:* Đặc tả cũ ghi trang 21-22 $\to$ Thực tế GD là **Trang 23**, DHQG là **Trang 25**.
- *Công nghiệp:* Đặc tả cũ ghi trang 21-24 $\to$ Thực tế GD là **Trang 22**, DHQG là **Trang 24**.
- *Nông nghiệp:* Đặc tả cũ ghi trang 19-21, 21-23 $\to$ Thực tế GD là **Trang 19, 20, 21**, DHQG là **Trang 21, 22, 23**.

$\implies$ **Quy tắc bắt buộc:** Mọi trích dẫn nguồn trên app đều phải ghi kèm mã ấn bản, ví dụ: `Atlat GD, tr.13` hoặc `Atlat DHQG, tr.10`.
