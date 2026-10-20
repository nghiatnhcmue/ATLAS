# TỪ ĐIỂN CHỮ VIẾT TẮT & KÍ HIỆU CHUẨN ATLAT (`GLOSSARY_SEED.md`)

> **Căn cứ xác lập:** Trích xuất nguyên văn mục "Chữ viết tắt" từ Trang 3 (Kí hiệu chung) của cả hai ấn bản Atlat:
> - `GD` (Trang in 3): *Atlat Địa lí Việt Nam (Chỉnh sửa năm 2025, Thầy Lê Huỳnh)*
> - `DHQG` (Trang in 3): *Atlat Địa lí Việt Nam (Chỉnh sửa năm 2025, NXB ĐHQG Hà Nội)*
> 
> **Mục đích:** Mở rộng từ điển Alias tìm kiếm tiếng Việt cho hệ thống GIS (ví dụ: người dùng gõ `CN. Lâm Viên`, `Cao nguyên Lâm Viên` hoặc `cao nguyen lam vien` đều tìm thấy chính xác đối tượng).

---

## 1. Bảng tra cứu chữ viết tắt địa danh & kinh tế

| Ký hiệu tắt | Dạng đầy đủ | Tiếng Anh tương đương | Ví dụ thực tế trong Atlat | Mở rộng Alias tìm kiếm | Nguồn tài liệu |
|:---:|:---|:---|:---|:---|:---:|
| **CC.** | Cánh cung | Mountain Arc | CC. Ngân Sơn, CC. Sông Gâm, CC. Bắc Sơn, CC. Đông Triều | `canh cung`, `dãy cánh cung` | GD tr.3, DHQG tr.3 |
| **CN.** | Cao nguyên | Plateau | CN. Lâm Viên, CN. Mơ Nông, CN. Di Linh, CN. Kon Tum, CN. Đắk Lắk | `cao nguyen`, `plateau` | GD tr.3, DHQG tr.3 |
| **SN.** | Sơn nguyên | Highland / Plateau | SN. Đồng Văn | `son nguyen` | DHQG tr.3 |
| **N.** | Núi | Mount / Peak | N. Fansipan, N. Pu Si Lung, N. Ngọc Linh, N. Bạch Mã | `nui`, `đỉnh`, `dãy núi` | GD tr.3, DHQG tr.3 |
| **D.** | Dãy (núi) | Mountain Range | D. Hoàng Liên Sơn, D. Trường Sơn Bắc, D. Trường Sơn Nam | `day`, `dãy núi` | DHQG tr.3 |
| **Đ.** | Đảo | Island | Đ. Phú Quốc, Đ. Côn Sơn, Đ. Bạch Long Vĩ, Đ. Cát Bà, Đ. Lý Sơn | `dao`, `hòn` | DHQG tr.3 |
| **BĐ.** | Bán đảo | Peninsula | BĐ. Trà Cổ, BĐ. Hòn Gốm, BĐ. Cà Mau, BĐ. Sơn Trà | `ban dao` | GD tr.3, DHQG tr.3 |
| **QĐ.** | Quần đảo | Archipelago | QĐ. Hoàng Sa, QĐ. Trường Sa, QĐ. Cô Tô, QĐ. Nam Du | `quan dao`, `archipelago` | GD tr.3, DHQG tr.3 |
| **S.** | Sông | River | S. Hồng, S. Đà, S. Mã, S. Cả, S. Đồng Nai, S. Tiền, S. Hậu | `song`, `river` | GD tr.3, DHQG tr.3 |
| **K.** | Kênh | Canal | K. Vĩnh Tế, K. Chợ Gạo, K. Phụng Hiệp | `kenh`, `kênh đào` | GD tr.3, DHQG tr.3 |
| **V.** | Vịnh | Bay / Gulf | V. Bắc Bộ, V. Thái Lan, V. Hạ Long, V. Cam Ranh, V. Vân Phong | `vinh`, `gulf`, `bay` | GD tr.3, DHQG tr.3 |
| **TP.** | Thành phố | City | TP. Hà Nội, TP. Hồ Chí Minh, TP. Hải Phòng, TP. Đà Nẵng, TP. Cần Thơ, TP. Huế | `thanh pho`, `tp` | GD tr.3 |
| **GDP** | Tổng sản phẩm trong nước | Gross Domestic Product | Biểu đồ quy mô và tốc độ tăng trưởng GDP | `gdp`, `tong san pham trong nuoc` | GD tr.3, DHQG tr.3 |
| **GRDP** | Tổng sản phẩm trên địa bàn | Gross Regional Domestic Product | Bản đồ quy mô và cơ cấu GRDP 34 tỉnh | `grdp`, `gdp tinh` | GD tr.3, DHQG tr.3 |

---

## 2. Quy tắc mở rộng Alias trong công cụ tìm kiếm GeoAtlas

Khi một đối tượng địa lý có tên bắt đầu bằng ký hiệu viết tắt trong Atlat, hệ thống tự động sinh các biến thể:
1. **Dạng nguyên văn Atlat:** `CN. Lâm Viên`
2. **Dạng mở rộng đầy đủ:** `Cao nguyên Lâm Viên`
3. **Dạng bỏ tiền tố:** `Lâm Viên`
4. **Dạng không dấu (ASCII):** `cn. lam vien`, `cao nguyen lam vien`, `lam vien`
5. **Dạng chữ thường chuẩn hóa:** `cn lam vien`

