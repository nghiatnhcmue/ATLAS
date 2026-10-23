# PHÂN TÍCH TOÀN DIỆN DỰ ÁN GEOATLAS INTERACTIVE

> **Thời điểm phân tích:** 23/10/2026
> **Phiên bản mã nguồn:** `2026.3.15` (HEAD `072492f`, nhánh `main`)
> **Phương pháp:** đọc mã nguồn tĩnh → kiểm kê & đối chiếu dữ liệu (Python) → chạy thử thực tế bằng Chrome headless (35 luồng chức năng) → đo tải trang → rà soát cấu hình triển khai.
> **Phạm vi:** toàn bộ 7 tệp JS, `index.html`, `styles.css`, 31 tệp dữ liệu, 6 bộ test, 4 cấu hình hosting.

---

## 0. TÓM TẮT ĐIỀU HÀNH (TL;DR)

| # | Kết luận | Mức |
|:--|:---|:---:|
| 1 | Sản phẩm **giàu tính năng và có chiều sâu sư phạm** thật: 3 phân hệ, 7 lớp bản đồ, 30 câu biểu đồ, 10 công thức, chế độ Atlat kép, minigame, chú thích nguồn theo trang Atlat. | ✅ |
| 2 | **34/35 luồng chức năng chạy đúng** khi kiểm thử runtime; 1 luồng gây `ReferenceError` làm **toàn bộ lớp Năng lượng (61 nhà máy) không hiển thị**. | ❌ P0 |
| 3 | **2 bộ lọc bản đồ hỏng hoàn toàn** (Nông–Lâm–Thủy sản, Kinh tế–Công nghiệp): chọn bất kỳ mục nào cũng ra 0 đối tượng do UI gửi sai mã danh mục so với dữ liệu. | ❌ P0 |
| 4 | Tuyên bố **“100% offline”** trong README không đúng: Tailwind, Leaflet, ECharts, KaTeX, Google Fonts đều tải từ CDN — chặn mạng thì ứng dụng mất toàn bộ giao diện và bản đồ. | ❌ P0 |
| 5 | **Dữ liệu tồn tại 3 bản sao lệch nhau** (nhúng trong JS / GeoJSON rời / master JSON). Bản đang chạy chỉ có **6/62** đối tượng nông nghiệp và không cùng schema với bộ lọc. Master JSON 4,1 MB **không được dùng lúc runtime**. | ⚠️ P1 |
| 6 | **Giao diện mobile tràn 63 px** ở màn 390 px (body `scrollWidth` 447/390) và bị `overflow-x: hidden` che mất; **78 chỗ** dùng lớp tiện ích Tailwind v4 (`shadow-xs`, `shadow-2xs`, `backdrop-blur-xs`, `xs:inline`) **không có tác dụng** vì đang chạy Tailwind v3 CDN. | ⚠️ P1 |
| 7 | **Số liệu “Online” là hư cấu**, được sinh từ giờ hệ thống (`+9` ban ngày, `+3` ban đêm) và hiển thị cho học sinh như số liệu thật. | ⚠️ P1 |
| 8 | **Lỗ hổng stored XSS** ở phần điểm danh: tên học sinh được chèn thẳng vào `innerHTML` và lưu vĩnh viễn trong `localStorage`. | ⚠️ P1 |
| 9 | Tải trang ban đầu **2,07 MB / ~500 KB gzip**, trong đó **114 KB gzip là dữ liệu dự phòng dư thừa** (tầng 3 gần như không bao giờ dùng tới). | ⚠️ P2 |
| 10 | Quy trình chất lượng yếu: **6 bộ test đều “100% PASS” nhưng chỉ kiểm tra bằng `grep` chuỗi**, không thực thi mã — nên lọt đúng lỗi runtime ở mục 2. | ⚠️ P2 |

**Kết luận một câu:** đây là một sản phẩm học tập có nội dung tốt nhưng **cấu trúc dữ liệu và quy trình kiểm thử chưa đủ chắc để chống hồi quy**; cần xử lý 4 lỗi P0 trước khi dùng đại trà trong lớp học.

---

## 1. TỔNG QUAN DỰ ÁN

| Hạng mục | Giá trị |
|:---|:---|
| **Tên** | GeoAtlas Interactive 2026 (Bản đồ số & Hệ thống nhận dạng biểu đồ, trắc nghiệm Địa lý Việt Nam) |
| **Mục tiêu** | Ôn luyện kỹ năng Atlat, nhận dạng biểu đồ và tính toán Địa lí cho kỳ thi tốt nghiệp THPT 2026 (GDPT 2018) |
| **Người dùng** | Học sinh lớp 10–12, giáo viên Địa lí THPT |
| **Bản chất kỹ thuật** | Single Page Application thuần HTML/CSS/JS, **không có build step**, không framework, không `package.json` |
| **Khối lượng** | `index.html` 1.179 dòng · JS nghiệp vụ 8.368 dòng (~409 KB) · dữ liệu nhúng 1,54 MB · CSS 754 dòng |
| **Dữ liệu** | 31 tệp (GeoJSON/JSON/DOCX), 34 tỉnh sau sáp nhập + 63 tỉnh cũ, 7 lớp chuyên đề, 30 câu biểu đồ, 10 công thức |
| **Lịch sử** | 42 commit trong 6 ngày (17–22/10/2026), 1 nhánh `main`, remote `github.com/nghiatnhcmue/ATLAS` |
| **Triển khai** | 4 đích cấu hình song song: GitHub Pages, Cloudflare Workers/Pages, Vercel, Surge |

**Điểm mạnh nổi bật** (đã kiểm chứng bằng chạy thử, không chỉ đọc README):
- Bản đồ Leaflet dựng đúng: 15 pane phân tầng, 77 marker/nhãn ở trạng thái mặc định, graticule, đường cơ sở A1–A24, hai quần đảo Hoàng Sa/Trường Sa có nhãn chủ quyền riêng.
- Chế độ “Atlat kép”: xem ảnh scan 15 trang Atlat, zoom/pan/kéo, đồng bộ sang bản đồ GIS theo trang (`page_18.jpg` tải đúng).
- Phân hệ biểu đồ: 30 câu, 6 phương án, phản hồi sư phạm theo từng phương án sai, có “tự phân tích bảng số liệu” và vẽ ECharts.
- Phân hệ máy tính: **10/10 công thức** render đúng công thức KaTeX và trả kết quả (đã chạy hết vòng lặp 10 công thức).
- Chú thích nguồn tới cấp số trang Atlat (`Atlat GD, tr.23`) — chi tiết hiếm dự án tự làm có được.

---

## 2. KIẾN TRÚC KỸ THUẬT

### 2.1. Sơ đồ tổng thể

```
index.html (1.179 dòng, 97 KB)
├── CDN: Tailwind v3 + config inline, Leaflet 1.9.4, ECharts 5.4.3,
│        KaTeX 0.16.8, Google Fonts (5 domain ngoài)
├── css/styles.css (754 dòng) — design system, Leaflet skin, atlas book
└── 7 script đồng bộ (không defer/async, không module)
    ├── fallback-store.js   457 KB  → window.GEO_ATLAS_FALLBACK_DATA  (tầng 3)
    ├── atlat-data.js     1.084 KB  → window.ATLAT_DATA               (tầng 1, nhúng toàn bộ)
    ├── atlas-engine.js     244 KB  → window.AtlasEngine   (IIFE, 67 hàm, 26 biến trạng thái)
    ├── chart-trainer.js     93 KB  → window.ChartTrainer  (IIFE, 35 hàm)
    ├── geo-calculator.js    54 KB  → window.GeoCalculator (IIFE, 15 hàm)
    ├── visitor-tracker.js   11 KB  → window.AtlasVisitorTracker
    └── app.js                7 KB  → điều phối 3 phân hệ, theme, search, toast
```

**Mô hình:** 6 module IIFE gắn vào `window`, giao tiếp bằng **tên hàm toàn cục trong `onclick`** (62 handler inline). Không có bundler, không import/export, không dependency graph — thứ tự `<script>` chính là thứ tự phụ thuộc ngầm.

### 2.2. Bản đồ module

| Tệp | Dòng | KB | Trách nhiệm | Ghi chú kỹ thuật |
|:---|---:|---:|:---|:---|
| `js/atlas-engine.js` | 4.748 | 244 | Toàn bộ Phân hệ 1: Leaflet, 7 lớp, 4 chuyên đề nền, choropleth, tìm kiếm, so sánh, minigame, sổ tay ký hiệu, trình đọc Atlat | **God object**: 67 hàm + 26 biến trạng thái trong 1 closure; 28 điểm `innerHTML`; 9 bảng tra cứu hardcode |
| `js/chart-trainer.js` | 1.965 | 93 | Phân hệ 2: ngân hàng câu hỏi, phân tích 3 bước, 6 dạng biểu đồ ECharts, tự phân tích bảng dán | Có `escapeHtml()` đúng chỗ; rule engine dựa heuristic |
| `js/geo-calculator.js` | 1.110 | 54 | Phân hệ 3: 10 công thức, nhập liệu số kiểu VN, KaTeX, bảng mẫu | `parseVNNumber` xử lý dấu phẩy/chấm phân nghìn |
| `js/visitor-tracker.js` | 341 | 11 | Đếm lượt truy cập, “đang online”, điểm danh học sinh | Xem mục 9 — có vấn đề đạo đức & bảo mật |
| `js/app.js` | 204 | 7 | Khởi tạo, chuyển tab, theme, tìm kiếm, toast | Có try/catch cách ly 3 phân hệ |
| `js/atlat-data.js` | 1 | 1.084 | `window.ATLAT_DATA` — **bản sao dữ liệu nhúng** | 1 dòng JSON khổng lồ, không thể diff/review |
| `js/fallback-store.js` | 1 | 457 | `window.GEO_ATLAS_FALLBACK_DATA` — tầng 3 | Trùng lặp ~100% với `ATLAT_DATA` |
| `index.html` | 1.179 | 97 | Khung 3 phân hệ + 5 modal + widget | 62 `onclick` inline, 0 `aria-*` |
| `css/styles.css` | 754 | 20 | Design system, Leaflet, cartography | 8 khối `!important` chồng chéo |

### 2.3. Luồng dữ liệu 3 tầng (thiết kế) và thực tế

```
Tầng 1: window.ATLAT_DATA          (atlat-data.js, 1.084 KB nhúng)
   ↓ nếu thiếu key
Tầng 2: fetch('./public/data/*.geojson')  (9 tệp, ~15,8 MB trên repo)
   ↓ nếu fetch lỗi
Tầng 3: window.GEO_ATLAS_FALLBACK_DATA    (fallback-store.js, 457 KB)
```

**Thực tế vận hành:** vì `atlat-data.js` nằm cùng thư mục và được nhúng sẵn, **tầng 1 gần như luôn thắng** → tầng 2 và tầng 3 hầu như là mã chết:

- `ensureLayerData()` kiểm tra `window.ATLAT_DATA` trước khi `fetch` (`atlas-engine.js:1136-1155`).
- Tầng 3 chỉ chạy khi `fetch` thất bại **và** `ATLAT_DATA` thiếu key — nhưng nếu `atlat-data.js` tải được thì `ATLAT_DATA` luôn có key. Chỉ khi tệp JS 1 MB này hỏng mới rơi xuống tầng 3.
- `LAYER_FILES.baseline` trỏ tới `atlat_2026_master.json` (4,1 MB) nhưng **không có lời gọi `ensureLayerData("baseline")` nào trong toàn bộ mã** → master JSON **không bao giờ được tải**.

---

## 3. KIỂM CHỨNG RUNTIME (35 LUỒNG)

Chạy bằng Chrome headless trên `http://127.0.0.1:8777`, thao tác thật qua API công khai của `AtlasEngine`/`ChartTrainer`/`GeoCalculator`.

| Nhóm chức năng | Kết quả | Chi tiết |
|:---|:---:|:---|
| Tìm kiếm tỉnh / viết tắt (`Hà Nội`, `CC.`) | ✅ | Bay tới đúng, panel chi tiết cập nhật |
| Modal so sánh 2 tỉnh | ✅ | Mở/đóng, render bảng |
| Sổ tay ký hiệu 4 tab (khoáng sản, năng lượng, nông nghiệp, ma trận) | ✅ | Chuyển tab không lỗi |
| Chuyển 34 ↔ 63 tỉnh | ✅ | Ranh giới, nhãn, legend đổi đúng |
| Choropleth: density / grdp / area / none | ✅ | Không lỗi (xem cảnh báo GRDP ở 4.3) |
| Thước đo khoảng cách | ✅ | Bật/tắt |
| Minigame 3 chế độ (tốc độ, bóng đổ, ký hiệu) | ✅ | Khởi tạo, đổi chế độ, đóng |
| Chế độ Atlat giấy (book) + chọn trang 18 + next/prev + zoom + fit | ✅ | Ảnh `page_18.jpg` tải đúng, transform hoạt động |
| Theme sáng/tối | ✅ | `localStorage` + class `dark` |
| Lớp 2 Địa hình (41 đối tượng, 4 bộ lọc) | ✅ | Lọc rivers/peaks/mountains/plateaus trả tập khác nhau đúng logic |
| Lớp 3 Khí hậu–Thủy văn (44) | ✅ | Bộ lọc + 3 mũi gió mùa vẽ động |
| Lớp 7 Giao thông (19 tuyến) | ✅ | 19 feature, đường + sân bay + cảng |
| **Lớp 5 Năng lượng (61 nhà máy)** | ❌ | **0 marker** — `ReferenceError: isRenewable is not defined` |
| Lớp 5 Khoáng sản (26) | ✅ | 26 marker hiện đủ |
| **Lớp 4 Nông–Lâm–Thủy sản (UI ghi 62)** | ❌ | Chỉ vẽ **6 marker**; cả 5 bộ lọc → **0** |
| Lớp 6 Kinh tế–Công nghiệp (34) | ⚠️ | Vẽ đủ 34, nhưng **3/3 bộ lọc → 0** |
| Phân hệ biểu đồ | ✅ | 30 câu, 6 nút chọn, phản hồi 441 ký tự sau khi trả lời |
| Phân hệ máy tính | ✅ | 10/10 công thức trả kết quả, ví dụ mật độ 2.595 người/km² |
| **Kết luận** | **34/35** | 1 exception chặn hẳn 1 lớp bản đồ |

---

## 4. LỖI NGHIÊM TRỌNG (CÓ BẰNG CHỨNG)

### 4.1. P0 — Lớp Năng lượng không bao giờ hiển thị (`isRenewable is not defined`)

**Vị trí:** `js/atlas-engine.js:2190`

```js
// trong onEachFeature của L.geoJSON power (khối bắt đầu dòng 2129)
const plantSize = (isThermal || isRenewable) ? 22 : (isLargePlant ? 26 : 20);
//                             ^^^^^^^^^^^^ không tồn tại trong scope này
```

`isRenewable` chỉ được khai báo **bên trong `pointToLayer`** (dòng 2135), không nằm trong scope của `onEachFeature`. Leaflet gọi `onEachFeature` **trước** `addLayer`, nên feature đầu tiên ném lỗi → `L.geoJSON(...)` hủy toàn bộ → **không có nhà máy nào được thêm**.

**Bằng chứng runtime (stack trace thật):**

```
ReferenceError: isRenewable is not defined
    at Object.onEachFeature (js/atlas-engine.js:2191:43)   ← trình duyệt báo lệch 1 dòng
    at e.addData (leaflet.js)
    at Object.renderMineralsPowerLayer (js/atlas-engine.js:2130:9)
```

Hệ quả: commit gần nhất (`feat: expand 61 power stations from Atlat tr.23…`) **không có tác dụng trực quan**; select “Chỉ Thủy điện (36 nhà máy)”, “Chỉ Nhiệt điện (18)”, “Điện gió & Mặt trời (7)”, “Tất cả Năng lượng (61)” đều không vẽ được gì.

**Cách sửa (1 dòng):** thay `isRenewable` bằng biểu thức đã có:
```js
const plantSize = (isThermal || isWind || isSolar) ? 22 : (isLargePlant ? 26 : 20);
```
**Và bổ sung test runtime** (xem 4.7) để không tái phát.

---

### 4.2. P0 — Hai bộ lọc bản đồ gửi sai mã danh mục

**(a) Lớp 4 — Nông, Lâm, Thủy sản**

| Nguồn | Giá trị |
|:---|:---|
| UI gửi (`index.html:464-469`) | `industrial_crops`, `food_crops`, `livestock`, `fishery`, `forestry` |
| Dữ liệu đang chạy (`ATLAT_DATA.geo_agriculture`) | `crop_specialized`, `fishing_ground` |
| Dữ liệu rời (`public/data/agriculture_fishery.geojson`, 62 feature) | `industrial_crops`, `food_crops`, `livestock`, `fishery`, `forestry` |

Engine so sánh `p.category === categoryFilter` (`atlas-engine.js:1989`) → **mọi bộ lọc trả 0**. Tệ hơn, dữ liệu nhúng chỉ có **10 feature**, trong đó 4 bị `hidden/status` → chỉ còn **6 marker**, trong khi giao diện quảng cáo **“62 đối tượng”** (index.html:464, 472).

**(b) Lớp 6 — Kinh tế & Công nghiệp**

| Nguồn | Giá trị |
|:---|:---|
| UI gửi (`index.html:506-508`) | `very_large`, `large`, `medium` |
| Dữ liệu (`scale_tier`) | `tier_1`, `tier_2`, `tier_3`, `tier_4` |

Engine: `f.properties.scale === scaleFilter || f.properties.scale_tier === scaleFilter` (`atlas-engine.js:2233`) → không khớp → **0 marker** cho cả 3 lựa chọn. Chỉ mục “Tất cả” hiển thị đủ 34.

**Cách sửa:** chuẩn hoá một nguồn dữ liệu duy nhất (xem mục 5) và map mã UI ↔ mã dữ liệu tại một chỗ; thêm test runtime đếm marker sau khi lọc.

---

### 4.3. P1 — GRDP hiển thị sai cho cả 34 tỉnh

- `vn_provinces_34.geojson`: **cả 34 feature đều có `grdp: 100.0`** (giá trị placeholder).
- `atlas-engine.js:1446`: `const grdpVal = p.grdp || GRDP_LOOKUP[p.name] || 50;` → vì `p.grdp` luôn truthy, tooltip hiển thị **“GRDP: 100 nghìn tỉ đồng”** cho mọi tỉnh, kể cả TP.HCM (1.620) hay Hà Nội (1.210) trong `GRDP_LOOKUP`.
- Bản choropleth GRDP lại dùng bảng `GRDP_PER_CAPITA_TIERS` theo tên → **không khớp** với số hiển thị ở tooltip. Hai con số GRDP khác nhau trong cùng một màn hình.

### 4.4. P0 — “Offline 100%” không đúng

Kiểm chứng: chặn toàn bộ domain ngoài (giữ `127.0.0.1`) rồi tải lại:

| Kiểm tra | Bình thường | Khi chặn CDN |
|:---|:---:|:---:|
| `.leaflet-container` tồn tại | ✅ | **❌ không có bản đồ** |
| `#atlas-dynamic-legend` | ✅ | **❌ không tạo** |
| Giao diện Tailwind | ✅ | **❌ mất toàn bộ style** (xem ảnh) |
| Biểu đồ ECharts / công thức KaTeX | ✅ | ❌ không chạy |

Ảnh minh chứng: [`docs/analysis/offline-cdn-blocked.png`](analysis/offline-cdn-blocked.png)

**5 domain phụ thuộc:** `cdn.tailwindcss.com`, `unpkg.com` (Leaflet), `cdn.jsdelivr.net` (ECharts, KaTeX ×2), `fonts.googleapis.com`, `fonts.gstatic.com`.
**4 tài nguyên không có SRI:** Tailwind, ECharts, KaTeX, auto-render (chỉ Leaflet có `integrity`).
**Không có Service Worker** → không có khả năng cache offline thật.
**Mâu thuẫn nội bộ:** test `BUG-19` khẳng định “ứng dụng 100% tĩnh offline” nhưng chỉ kiểm tra chuỗi HTML.

**Khuyến nghị:** self-host 5 thư viện (≈1,1 MB, gzip ~350 KB) + Service Worker precache; hoặc chấp nhận phụ thuộc mạng nhưng **sửa lại tài liệu và thông điệp UI**.

### 4.5. P1 — Mobile tràn ngang, nội dung bị cắt

Đo tại viewport 390 px (iPhone 12/13/14):

| Chỉ số | Giá trị |
|:---|---:|
| `documentElement.scrollWidth` | 384 px |
| `body.scrollWidth` | **447 px** (vượt 63 px) |
| Số phần tử tràn mép phải | **10** |
| Trong đó | nút “Sổ Tay”, nút theme, `select#choropleth-select`, 4 SVG 439 px |

`css/styles.css:589-593` và `:25-34` dùng `overflow-x: hidden !important` → **che lỗi thay vì sửa**, khiến nút đổi theme và Sổ tay **không bấm được** trên mobile. Ảnh: [`docs/analysis/mobile-390.png`](analysis/mobile-390.png)

### 4.6. P1 — 78 chỗ dùng lớp tiện ích Tailwind không có tác dụng

| Class | Số lần dùng | Có trong Tailwind v3 CDN? | Computed style thực tế |
|:---|---:|:---:|:---|
| `shadow-xs` | 48 | ❌ (v4 mới có; v3 là `shadow-sm`) | `box-shadow: none` |
| `shadow-2xs` | 16 | ❌ | — |
| `backdrop-blur-xs` | 13 | ❌ (v3 là `backdrop-blur-sm`) | `backdrop-filter: none` |
| `xs:inline` | 1 | ❌ (không có breakpoint `xs`) | Luôn ẩn |

Đã kiểm chứng bằng `getComputedStyle` trong trình duyệt. Hệ quả: toàn bộ “bóng đổ nhẹ” và “kính mờ” trong thiết kế **không render**, giao diện phẳng hơn thiết kế và khó phân tầng thị giác. Nguyên nhân: dự án viết class theo Tailwind v4 nhưng nạp `cdn.tailwindcss.com` (v3.4).

### 4.7. P2 — Quy trình test không bắt được lỗi runtime

- 6 bộ test (`scripts/test_*.js`), tổng 20+6+6+12+4+14+15 ≈ **77 assertion**, đều **PASS 100%**.
- Nhưng chúng dùng `fs.readFileSync(...).includes("...")` — **kiểm tra sự tồn tại của chuỗi trong mã nguồn**, không thực thi DOM/Leaflet.
- Vì vậy `isRenewable is not defined` và 2 bộ lọc hỏng vẫn “qua cửa” tất cả các test, dù README tuyên bố “kiểm thử tự động 100%”.

**Khuyến nghị:** thêm 1 bộ smoke test headless (Playwright/Puppeteer) chạy 6 kịch bản: mở app → bật từng lớp → đếm marker → lọc từng danh mục → trả lời 1 câu biểu đồ → tính 1 công thức. Chính là quy trình đã dùng để tìm ra các lỗi trong báo cáo này.

---

## 5. KIẾN TRÚC DỮ LIỆU — VẤN ĐỀ LỚN NHẤT

### 5.1. Ba bản sao dữ liệu, nội dung lệch nhau

| Lớp | `ATLAT_DATA` (đang chạy) | `public/data/*.geojson` (tầng 2) | `atlat_2026_master.json` (tầng chết) |
|:---|---:|---:|---:|
| provinces_34 | 36 | 36 | 36 |
| provinces_63 | 65 | 65 | 65 |
| topography | 41 | 41 | 41 |
| climate | 44 | 44 | 44 |
| minerals | 26 | 26 | 26 |
| power | 61 | 61 | **20** |
| industrial | 34 | 34 | 34 |
| **agriculture** | **10** | **62** | **10** |
| chart_exercises | 30 | 30 (`chart_questions.json`) | **21** |

Không chỉ khác số lượng — **nội dung cũng khác** (so sánh `JSON.stringify` có sắp xếp): `geo_provinces_34`, `geo_provinces_63`, `geo_topography`, `geo_climate`, `geo_industrial`, `geo_agriculture` **đều khác** bản GeoJSON rời. Chỉ `geo_minerals` và `geo_power` trùng khớp với tệp rời.

Hệ quả trực tiếp: **sửa dữ liệu ở tệp GeoJSON không có tác dụng gì trên giao diện**, vì engine luôn đọc bản nhúng trước.

### 5.2. Bản master JSON 4,1 MB là “di sản chết”

- `LAYER_FILES.baseline` trỏ tới nó nhưng không có lời gọi `ensureLayerData("baseline")`.
- Nội dung lỗi thời: 20 nhà máy điện (so với 61), 10 đối tượng nông nghiệp (so với 62), 21 câu biểu đồ (so với 30).
- Vẫn được đóng gói vào bản deploy (15,8 MB `public/data`).

### 5.3. Số liệu tổng hợp bị thổi phồng do bản ghi trùng

`atlat_2026_master.json → provinces_34_stats` có **35** khoá cho 34 tỉnh, vì tồn tại **cả** `"Thành phố Đồng Nai"` **và** `"Đồng Nai"` (bản ghi cũ 12.737,2 km² / 4.427,7 nghìn người).

| Chỉ số | Cộng 35 khoá | Thực tế 34 tỉnh | Chênh |
|:---|---:|---:|---:|
| Tổng diện tích | 344.063,3 km² | 331.344 km² | **+12.719,3 km²** (= đúng Đồng Nai) |
| Tổng dân số | 105.879,4 nghìn | 101.451,7 nghìn | **+4.427,7 nghìn** |

Hiện frontend chưa dùng `provinces_34_stats`, nhưng bất kỳ tính năng tổng hợp nào (so sánh vùng, mật độ trung bình, biểu đồ cơ cấu) thêm sau này sẽ **sai ngay từ gốc**.

### 5.4. Dữ liệu mô phỏng đội lốt dữ liệu thật

| Dữ liệu | Hiện trạng |
|:---|:---|
| Cơ cấu 4 khu vực GRDP của 34 trung tâm công nghiệp | **Chỉ có 4 “khuôn”** cho 34 đối tượng: 16 trung tâm dùng chung `24/36/35/5`, 9 dùng `38/24/34/4`, 7 dùng `8,5/54/31,5/6`, 2 dùng `1,5/41,5/48/9` |
| `grdp` của 34 tỉnh | Tất cả = `100` |
| “Online” | Sinh từ giờ hệ thống |
| Tổng lượt truy cập | `BASELINE_VISITS = 2468` cộng dồn + CounterAPI công cộng |

Đây là điểm cần cân nhắc **về mặt sư phạm**: học sinh có thể ghi nhớ số liệu sai nếu tin đây là số liệu Atlat.

### 5.5. Tài sản dữ liệu dư thừa / chết

| Tệp | Kích thước | Trạng thái |
|:---|---:|:---|
| `public/data/vn_provinces.geojson` | 1.314 KB | **Trùng byte 100%** với `vn_provinces_63.geojson` |
| `public/data/atlat_pages/page_02.jpg` | 268 KB | Có trên đĩa nhưng **không có trong `manifest.json`** → không bao giờ hiển thị |
| `public/data/districts_data.json` | 0,2 KB | Chỉ có 3 khoá metadata, **không được dùng** |
| `public/data/atlat_2026_master.json` | 4.186 KB | Stale, không fetch |
| `js/fallback-store.js` | 457 KB | Tầng dự phòng gần như bất khả đạt |
| `dist/` (cục bộ) | 15 MB | **Stale**: `index.html` 71 KB vs 99 KB; `atlas-engine.js` 182 vs 244 KB; **thiếu `visitor-tracker.js`** |

---

## 6. HIỆU NĂNG

### 6.1. Tải trang ban đầu (critical path)

| Tài nguyên | Raw | Gzip |
|:---|---:|---:|
| `index.html` | 97 KB | 19 KB |
| `css/styles.css` | 20 KB | 5 KB |
| `js/fallback-store.js` | 457 KB | 114 KB |
| `js/atlat-data.js` | 1.084 KB | 268 KB |
| `js/atlas-engine.js` | 244 KB | 53 KB |
| `js/chart-trainer.js` | 93 KB | 21 KB |
| `js/geo-calculator.js` | 54 KB | 14 KB |
| `js/visitor-tracker.js` + `app.js` | 18 KB | 6 KB |
| **Tổng** | **2.066 KB** | **~500 KB** |

Ngoài ra 8 tệp CDN (Tailwind runtime ~100 KB, Leaflet 42 KB, ECharts 330 KB, KaTeX ~280 KB, 2 tệp CSS font + font) — chưa kể các tệp font binary.

### 6.2. Vấn đề

1. **114 KB gzip dữ liệu dự phòng vô ích** — xoá `fallback-store.js` (hoặc nạp lười bằng `onerror`) giảm ngay 22% payload.
2. **268 KB gzip JSON nhúng** được parse đồng bộ trước khi app khởi động; không có code-splitting theo phân hệ (người chỉ dùng Máy tính vẫn tải toàn bộ bản đồ).
3. **Không nén trước / không versioning nội dung thật**: cache-buster là query `?v=` thủ công, phải sửa tay ở 8 chỗ mỗi lần release.
4. **`atlat-data.js` 1 dòng** khiến diff/merge gần như không thể; mọi thay đổi dữ liệu là “1 dòng thay đổi” khổng lồ.
5. **Google Fonts nạp 2 lần** (thẻ `<link>` ở `index.html:9-11` và `@import` ở `styles.css:9`).
6. **Ảnh Atlat: 16 tệp, 7,8 MB** (15 trang có trong `manifest.json` + 1 tệp mồ côi) tải lười từng trang — hợp lý, nhưng chưa có thumbnail/preload.

### 6.3. Đề xuất
Tách dữ liệu thành JSON tĩnh nạp theo nhu cầu (`fetch` + cache HTTP), bỏ bản nhúng; bỏ `fallback-store`; `defer` các script; thêm `<link rel="preload">` cho CSS/font; cân nhắc Service Worker để vừa offline thật vừa giảm 500 KB CDN.

---

## 7. GIAO DIỆN, TRẢI NGHIỆM & KHẢ NĂNG TRUY CẬP

### 7.1. Quan sát từ ảnh chụp thực tế

Ảnh desktop: [`docs/analysis/desktop-1500.png`](analysis/desktop-1500.png)

| Vấn đề | Chi tiết |
|:---|:---|
| **Bản đồ bị “chết” không gian** | `fitBounds` theo khung `[6.5,102]–[23.6,117.5]` (bao gồm cả Trường Sa xa) trong khung 840×700 → đất liền Việt Nam chỉ chiếm ~1/3 chiều rộng, hai bên là biển trống |
| **Nhãn tỉnh chồng chéo** | Ở zoom 5.5, toàn bộ 34 nhãn “Tỉnh …” hiển thị, dồn thành khối không đọc được ở vùng Đông Bắc |
| **Chồng lấn widget** | Chú giải Atlat (dưới trái) bị widget “Online/Tổng lượt” đè lên; thanh công cụ lớp bản đồ đè nút zoom `+` |
| **Cỡ chữ quá nhỏ** | 52 chỗ `text-[10px]`, 46 chỗ `text-[11px]`, 13 chỗ `text-[9px]` — dưới ngưỡng đọc thoải mái cho học sinh |
| **`select-none` toàn trang** | `body` đặt `select-none` → học sinh **không copy được số liệu** để làm bài, một hạn chế trong ngữ cảnh học tập |

### 7.2. Khả năng truy cập (a11y)

| Chỉ số | Giá trị | Nhận xét |
|:---|---:|:---|
| Thuộc tính `aria-*` | **0** | Không có landmark, không `aria-label`, không `aria-live` cho phản hồi |
| Nút `<button>` | 44 | Chủ yếu là icon + `title`; screen reader đọc tiêu đề thay vì nhãn |
| `onclick` inline | **62** | Khó bảo trì, không tương thích CSP |
| `<label>` | 13 | Nhiều input không gắn `for`/`id` |
| Thẻ `<img>` | 1 | Có `alt` đúng ✅ |
| Điều hướng bàn phím | Hạn chế | Modal không trap focus; Escape có xử lý ✅ |

### 7.3. Điểm tích cực
- Responsive 2 cột → 1 cột có `order-*` hợp lý.
- Dark mode đầy đủ, có lưu tùy chọn.
- Font Be Vietnam Pro hiển thị tiếng Việt tốt, có `font-variant-numeric: tabular-nums` cho bảng số.
- Có xử lý IME khi tìm kiếm (`compositionstart/end`) — chi tiết hiếm gặp.

---

## 8. BẢO MẬT & RIÊNG TƯ

### 8.1. Stored XSS ở phần điểm danh (P1)

`js/visitor-tracker.js:259-267`:

```js
// js/visitor-tracker.js:259-267 (lược bớt class Tailwind)
listEl.innerHTML = logs.slice(0, 5).map(item => `
  ...
  <span ...>${item.user || 'Khách vãng lai'}</span>
  <span ...>${item.device}</span>
`).join('');
```

`item.user` là **dữ liệu người dùng nhập** (`#visitor-input-name`), được lưu vào `localStorage` và render lại mỗi lần mở popover **không qua escape**. Học sinh nhập `<img src=x onerror=...>` → mã chạy vĩnh viễn trên máy đó. Trong khi đó `chart-trainer.js` **có** hàm `escapeHtml()` và dùng đúng — cho thấy thiếu chuẩn hoá chứ không phải thiếu nhận thức.

### 8.2. “Số đang online” là số bịa (P1 — vấn đề đạo đức)

`js/visitor-tracker.js:92-101`:

```js
const localTabsCount = Math.max(1, Object.keys(sessions).length);
const hour = new Date().getHours();
const timeFactor = (hour >= 7 && hour <= 22) ? 9 : 3;   // ← hằng số trang trí
const minuteHash = Math.floor(new Date().getMinutes() / 5) % 5;
const calculatedOnline = localTabsCount + timeFactor + minuteHash;
```

Một tab duy nhất vẫn hiển thị **“Online: 13”** (đã đo thực tế: 13 và 14 ở hai lần chạy). Với sản phẩm giáo dục, số liệu giả hiển thị cho học sinh là rủi ro uy tín; nếu muốn tạo cảm giác cộng đồng, nên ghi rõ là “hoạt động gần đây” hoặc bỏ.

### 8.3. Các điểm khác

| Vấn đề | Mức | Chi tiết |
|:---|:---:|:---|
| “Bắt buộc điểm danh” chỉ là `localStorage` | ⚠️ | `toggleRequireAuth` ghi `geoatlas_require_auth` trên **máy giáo viên**; học sinh không bị ảnh hưởng, xoá localStorage là xong. Không thể dùng để quản lý lớp. |
| Thu thập họ tên học sinh (trẻ vị thành niên) vào localStorage | ⚠️ | Không có thông báo riêng tư, không có cơ chế kiểm soát/xoá dữ liệu tập trung |
| Gọi `api.counterapi.dev` (bên thứ ba) | ⚠️ | Gửi request ra ngoài mỗi phiên; dịch vụ công cộng, không SLA, có thể chết bất kỳ lúc nào |
| Không có CSP, 62 handler inline, 6 thẻ CDN thiếu SRI | ⚠️ | Bề mặt tấn công chuỗi cung ứng; một CDN bị chiếm là chạy mã trong ngữ cảnh trường học |
| `push_to_github.bat` truyền PAT qua URL trong dòng lệnh | ⚠️ | Token lộ trong lịch sử shell/process list; nên dùng credential helper |
| `innerHTML` | 45 chỗ | Phần lớn là template tĩnh an toàn, nhưng không có quy ước rõ ràng dữ liệu nào được phép nội suy |

---

## 9. TRIỂN KHAI & VẬN HÀNH

### 9.1. Bốn đích cấu hình, chính sách cache xung đột

| Nền tảng | Tệp | Cache `public/data` | Cache JS/CSS | HTML |
|:---|:---|:---|:---|:---|
| Cloudflare | `_headers` | 1 giờ | 5 phút | `no-store` |
| Vercel | `vercel.json` | **1 năm, immutable** | 30 ngày | `max-age=0` |
| Cloudflare Workers | `wrangler.jsonc` | (theo `_headers`) | | |
| Surge | `.surgeignore` + `CNAME` | — | — | — |

Ba chính sách cache khác nhau cho cùng một tệp → hành vi “đã sửa mà không thấy đổi” rất khó tái hiện. Vercel `immutable 1 năm` cho dữ liệu **không có hash trong tên** là rủi ro cao.

### 9.2. Các điểm bất nhất khác

- `CNAME` chứa `geoatlas-vietnam.surge.sh` — domain của Surge, **không phải custom domain**. Nếu bật GitHub Pages, GitHub sẽ cố phục vụ tại domain này và gần như chắc chắn lỗi.
- `200.html` là **bản sao thủ công** của `index.html` (99.255 byte, trùng hash). Không có script đồng bộ; test chỉ khẳng định “phải giống nhau” → mỗi lần sửa phải copy tay.
- `dist/` cục bộ đã lỗi thời và không được track; nếu ai đó deploy `dist/` sẽ phát hành **phiên bản cũ hơn nhiều** (thiếu hẳn visitor-tracker).
- **Không có CI/CD, không `package.json`, không lockfile** → không tái lập được môi trường, không có bước kiểm tra tự động trước khi push.

### 9.3. Kích thước repo

| Thành phần | Kích thước |
|:---|---:|
| `.git` | **205,7 MB** (2 PDF Atlat 57 MB + 42 MB nằm trong lịch sử) |
| Working tree (không tính `.git`) | 246,8 MB |
| Trong đó: `tools/mingit/` | 106,6 MB (bộ Git portable, đã gitignore) |
| Trong đó: `docs/` | **60,6 MB** (ảnh bằng chứng PNG 8,5 MB/tấm) |
| **Tệp được track (sẽ deploy)** | **~113 MB / 253 tệp** |

Nếu deploy GitHub Pages từ nhánh `main`, **60,6 MB ảnh bằng chứng trong `docs/` sẽ được phục vụ công khai** cùng website. `wrangler.jsonc`, `.assetsignore`, `.surgeignore` đều loại `docs/` — riêng GitHub Pages thì không.

---

## 10. TÀI LIỆU & TÍNH NHẤT QUÁN

| Tài liệu | Tuyên bố | Thực tế |
|:---|:---|:---|
| `README.md:14` | “**6 Lớp** chuyên đề” | Giao diện có **7 lớp** (đã thêm Giao thông) |
| `README.md:17` | “**21 câu** hỏi luyện tập” | **30 câu** (`chart_questions.json`, `ATLAT_DATA`) |
| `README.md:37` | “**19 lỗi** … kiểm thử tự động 100%” | `BUG_AUDIT.md` nói **14 lỗi**; test grep, không chạy runtime |
| `README.md:29` | “SPA thuần, không cần build” | Đúng — nhưng có 4 cấu hình hosting và 2 bản HTML phải đồng bộ tay |
| `index.html:464,472` | “62 đối tượng” nông nghiệp | Vẽ **6** |
| `index.html:442` | “43 đối tượng” khí hậu | Dữ liệu có **44** |
| `docs/` | 24 tệp, 60,6 MB bằng chứng | Tốt về mặt học thuật, nhưng nên tách khỏi bản deploy |

Bộ tài liệu `docs/` (đặc biệt `BUG_AUDIT.md`, `BUGFIX_LOG.md`, `DATA_INVENTORY.md`, `SPEC_DEVIATIONS.md`) **rất chất lượng về nội dung** — hiếm dự án cá nhân có đối chiếu tới số trang Atlat và ảnh bằng chứng. Vấn đề chỉ là chúng không được dùng làm “cổng chặn” kỹ thuật.

---

## 11. BẢNG ƯU TIÊN HÀNH ĐỘNG

| ID | Việc cần làm | Mức | Nỗ lực | Tác động |
|:---|:---|:---:|:---:|:---|
| F1 | Sửa `isRenewable` → `isWind \|\| isSolar` (`atlas-engine.js:2190`) | **P0** | 5 phút | Khôi phục 61 nhà máy điện |
| F2 | Đồng bộ mã danh mục Lớp 4 (chọn bộ dữ liệu chuẩn 62 đối tượng) | **P0** | 2–4 giờ | Khôi phục 5 bộ lọc + đúng số lượng |
| F3 | Map `very_large/large/medium` ↔ `tier_*` ở Lớp 6 | **P0** | 30 phút | Khôi phục 3 bộ lọc |
| F4 | Quyết định “offline thật” hay “cần mạng”: self-host CDN + Service Worker, hoặc sửa README/UI | **P0** | 1 ngày | Đúng cam kết, dùng được trong lớp mạng yếu |
| F5 | Xoá `fallback-store.js` khỏi critical path (hoặc nạp `onerror`) | P1 | 1 giờ | −114 KB gzip |
| F6 | Một nguồn dữ liệu duy nhất: bỏ nhúng `atlat-data.js`, `fetch` JSON có cache; xoá `atlas_2026_master.json` hoặc dùng làm nguồn build | P1 | 1–2 ngày | Hết drift, review được dữ liệu |
| F7 | Sửa XSS `renderRecentLogs` bằng `textContent` | P1 | 20 phút | Bịt lỗ hổng |
| F8 | Bỏ “số online” hư cấu hoặc ghi rõ là ước lượng | P1 | 30 phút | Trung thực dữ liệu |
| F9 | Sửa tràn mobile 390 px (bỏ `overflow-x: hidden`, xử lý header co giãn) | P1 | 2–3 giờ | Dùng được trên điện thoại |
| F10 | Thay `shadow-xs`/`shadow-2xs`/`backdrop-blur-xs` → `shadow-sm`/`backdrop-blur-sm`; bỏ `xs:` | P1 | 1 giờ | Đúng thiết kế |
| F11 | Sửa tooltip GRDP (dùng `GRDP_LOOKUP` hoặc bỏ `grdp:100`) | P1 | 30 phút | Số liệu đúng |
| F12 | Thêm smoke test headless (Playwright) + CI | P2 | 1 ngày | Chặn tái phát |
| F13 | Xoá `vn_provinces.geojson` trùng, `page_02.jpg` mồ côi, `districts_data.json` | P2 | 15 phút | Gọn 1,6 MB |
| F14 | Xoá bản ghi `"Đồng Nai"` trùng trong `provinces_34_stats` | P2 | 10 phút | Tổng hợp đúng |
| F15 | Sửa `README` (7 lớp, 30 câu, offline) | P2 | 20 phút | Tài liệu khớp |
| F16 | Bỏ `docs/` khỏi bản deploy GitHub Pages (dùng Actions + artifact) | P2 | 1 giờ | −60 MB, không lộ tài liệu nội bộ |
| F17 | Chuẩn hoá 1 chính sách cache duy nhất | P2 | 1 giờ | Hết “sửa mà không thấy đổi” |
| F18 | Script đồng bộ `index.html` → `200.html` | P3 | 30 phút | Hết lỗi copy tay |
| F19 | Bổ sung `aria-*`, tăng cỡ chữ tối thiểu 12 px | P3 | 1–2 ngày | Tiếp cận |
| F20 | Làm rõ nguồn dữ liệu mô phỏng (cơ cấu GRDP 4 khuôn) hoặc bổ sung số thật | P3 | 1–2 ngày | Chính xác học thuật |

---

## 12. LỘ TRÌNH ĐỀ XUẤT

**Giai đoạn 1 — “Cứu sản phẩm” (1–2 ngày)**
F1, F3, F7, F11, F14, F15 → sửa lỗi một dòng, kiểm chứng lại bằng smoke test thủ công.
*Điều kiện hoàn thành:* bật Lớp 5 thấy ≥ 61 marker; lọc Lớp 6 trả ≥ 2/7/16; không còn ReferenceError.

**Giai đoạn 2 — “Ổn định dữ liệu & offline” (1 tuần)**
F2, F4, F5, F6, F12 → hợp nhất dữ liệu về một nguồn JSON, self-host thư viện, Service Worker, CI smoke test.
*Điều kiện hoàn thành:* chặn mạng vẫn mở được bản đồ; đếm marker khớp với số hiển thị trên UI; có test tự động chặn 3 lỗi P0 tái phát.

**Giai đoạn 3 — “Chất lượng & mở rộng” (2 tuần)**
F8, F9, F10, F13, F16–F20 → mobile, a11y, deploy gọn, tài liệu khớp.
*Điều kiện hoàn thành:* Lighthouse mobile ≥ 90 performance/accessibility; `scrollWidth == clientWidth` ở 360/390/768 px; repo deploy < 20 MB.

---

## 13. ĐÁNH GIÁ TỔNG HỢP

| Tiêu chí | Điểm /10 | Cơ sở |
|:---|:---:|:---|
| Nội dung & giá trị sư phạm | **9** | 30 câu có phản hồi theo từng phương án sai, 10 công thức, chú thích trang Atlat |
| Độ phủ tính năng | **8** | 3 phân hệ + 7 lớp + Atlat kép + minigame; nhiều tính năng “xịn” hơn nhu cầu |
| Độ đúng chức năng (runtime) | **5** | 34/35 luồng đúng, nhưng 2 bộ lọc và 1 lớp hỏng hoàn toàn |
| Chất lượng dữ liệu | **4** | 3 bản sao lệch, số liệu mô phỏng, bản ghi trùng, master chết |
| Kiến trúc mã nguồn | **4** | 1 tệp 4.748 dòng, 6 global, 62 handler inline, 45 `innerHTML` |
| Hiệu năng | **5** | 500 KB gzip và 2 MB parse trước khi dùng; 1/4 là dữ liệu thừa |
| Khả năng truy cập | **3** | 0 `aria-*`, chữ 9–11 px, tràn mobile |
| Bảo mật & riêng tư | **4** | XSS, số liệu hư cấu, auth giả, không CSP/SRI |
| Quy trình & vận hành | **3** | Test grep, 4 cấu hình cache, 113 MB tracked, không CI |
| Tài liệu | **7** | Tài liệu kỹ thuật tốt nhưng lệch thực tế ở các con số quan trọng |
| **Tổng** | **5,2/10** | **Nội dung xuất sắc, kỹ thuật cần gia cố** |

---

## PHỤ LỤC A — Cách tái lập kiểm chứng

```powershell
# 1. Chạy static server
python server.py                       # http://localhost:8080

# 2. Kiểm tra cú pháp
Get-ChildItem js\*.js | ForEach-Object { node --check $_.FullName }

# 3. Chạy bộ test hiện có (chỉ grep)
Get-ChildItem scripts\test*.js | ForEach-Object { node $_.FullName }

# 4. Đo tải trang (gzip) — Python
#    (xem mục 6.1 trong báo cáo)

# 5. Chạy smoke test runtime (khuyến nghị thay cho test grep)
#    Mở Chrome DevTools, bật từng lớp bản đồ và đếm marker:
#    document.querySelectorAll('.atlat-power-marker').length        -> phải ~61
#    document.querySelectorAll('.agri-clean-marker').length          -> phải ~62
#    chọn "very_large" ở Lớp 6                                       -> phải > 0

# 6. Kiểm tra tràn mobile
#    DevTools → 390×844 → console:
#    document.body.scrollWidth  (kỳ vọng 390, thực tế 447)
```

## PHỤ LỤC B — Số liệu đo lường chính

| Phép đo | Giá trị |
|:---|:---|
| Payload critical path | 2.066 KB raw / ~500 KB gzip |
| `atlat-data.js` | 1.084 KB (268 KB gz) |
| `fallback-store.js` | 457 KB (114 KB gz) |
| Số domain CDN | 5 |
| Số `innerHTML` trong JS | 45 |
| Số handler inline trong HTML | 62 |
| Số thuộc tính `aria-*` | 0 |
| Số dòng `atlas-engine.js` | 4.748 |
| Số tệp dữ liệu | 31 |
| Tệp track được deploy | 253 tệp / ~113 MB |
| Lịch sử git | 205,7 MB (2 PDF 57 MB + 42 MB) |
| Luồng runtime đạt | 34/35 |

---

*Báo cáo được lập bằng phân tích tĩnh kết hợp kiểm chứng runtime; mọi con số trong báo cáo đều đo trực tiếp trên mã nguồn tại commit `072492f`, không suy đoán từ tài liệu.*
