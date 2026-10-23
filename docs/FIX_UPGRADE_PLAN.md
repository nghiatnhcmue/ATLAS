# KẾ HOẠCH SỬA LỖI & NÂNG CẤP GEOATLAS INTERACTIVE

> **Ngày lập:** 23/10/2026 · **Căn cứ:** [PROJECT_ANALYSIS.md](PROJECT_ANALYSIS.md) + 2 lượt kiểm chứng runtime (Chrome headless, gần 80 thao tác chức năng)
> **Nguyên tắc:** mỗi lỗi có (1) bằng chứng, (2) vị trí chính xác, (3) cách sửa cụ thể, (4) lệnh kiểm chứng sau sửa. Không sửa "mò".

---

## PHẦN 1 — SỔ ĐĂNG KÝ LỖI (26 lỗi, đã xác minh 100%)

### 1.1. Lỗi P0 — chặn tính năng (phải sửa trước khi phát hành)

| ID | Lỗi | Vị trí | Bằng chứng | Cách sửa |
|:---|:---|:---|:---|:---|
| **B-01** | Lớp Năng lượng (61 nhà máy) **không bao giờ hiển thị** — `ReferenceError: isRenewable is not defined` | [atlas-engine.js:2190](js/atlas-engine.js#L2190) | Stack trace thật: lỗi ném trong `onEachFeature` khi Leaflet gọi trước `addLayer` → 0 marker cho cả 4 lựa chọn (hydro/thermal/renewable/power) | Đổi `isThermal \|\| isRenewable` → `isThermal \|\| isWind \|\| isSolar` |
| **B-02** | Lớp 4 (Nông–Lâm–Thủy sản): UI ghi **62 đối tượng**, vẽ **6**; **5/5 bộ lọc trả 0** | `index.html:464-472` + [atlas-engine.js:1989](js/atlas-engine.js#L1989) + `atlat-data.js` | Dữ liệu nhúng chỉ 10 feature (`crop_specialized`, `fishing_ground`), UI gửi `industrial_crops`… ; tệp rời `agriculture_fishery.geojson` có đủ 62 và đúng schema | Tái sinh `atlat-data.js` từ tệp GeoJSON chuẩn 62 (sửa pipeline) — xem B-10 |
| **B-03** | Lớp 6 (Kinh tế–Công nghiệp): **3/3 bộ lọc trả 0** | `index.html:506-508` + [atlas-engine.js:2233](js/atlas-engine.js#L2233) | UI gửi `very_large/large/medium`, dữ liệu là `tier_1..tier_4` | Thêm map trong engine: `{very_large:'tier_1', large:'tier_2', medium:['tier_3','tier_4']}` |
| **B-04** | Tuyên bố **“100% offline” sai** — chặn CDN là app mất bản đồ + giao diện | `index.html:14-50`; không có Service Worker | Ảnh [offline-cdn-blocked.png](analysis/offline-cdn-blocked.png): chặn 5 domain ngoài → không có `.leaflet-container`, không style | Self-host 5 thư viện + Service Worker (U-02) hoặc sửa lại tuyên bố |

### 1.2. Lỗi P1 — sai dữ liệu/giao diện/bảo mật

| ID | Lỗi | Vị trí | Cách sửa |
|:---|:---|:---|:---|
| **B-05** | Tooltip GRDP hiển thị **“100 nghìn tỉ” cho cả 34 tỉnh** (placeholder `grdp:100`) | `vn_provinces_34.geojson` + [atlas-engine.js:1446](js/atlas-engine.js#L1446) | Đổi thứ tự ưu tiên: `GRDP_LOOKUP[p.name] \|\| p.grdp \|\| 50`; bổ sung GRDP thật cho 34 tỉnh (U-06) |
| **B-06** | Mobile 390px **tràn 63px**; nút Sổ Tay & theme bị cắt khỏi màn hình | `styles.css:589-593` che lỗi bằng `overflow-x: hidden` | Sửa gốc: co cụm bên phải header, `min-w-0` cho nav, bỏ `shrink-0` khi < sm; đo `body.scrollWidth == 390` |
| **B-07** | **78 chỗ** class Tailwind v4 (`shadow-xs` 48, `shadow-2xs` 16, `backdrop-blur-xs` 13, `xs:inline` 1) **vô tác dụng** (đang chạy Tailwind v3 CDN) | toàn HTML/JS | Thay bằng tên v3: `shadow-sm`, `backdrop-blur-sm`, bỏ `xs:inline`; xoá cảnh báo “should not be used in production” bằng cách self-host build (U-02) |
| **B-08** | **Số “Online” là bịa** (`+9` ban ngày / `+3` ban đêm + minuteHash), hiển thị như số liệu thật | [visitor-tracker.js:92-101](js/visitor-tracker.js#L92-L101) | Chỉ đếm tab thật (`localTabsCount`), đổi nhãn “Online” → “Phiên đang mở” |
| **B-09** | **Stored XSS**: tên điểm danh chèn thẳng vào `innerHTML`, lưu vĩnh viễn | [visitor-tracker.js:259-267](js/visitor-tracker.js#L259-L267) | Escape bằng `escapeHtml()`/dựng node bằng `textContent` |
| **B-10** | **Dữ liệu 3 bản sao lệch nhau** (nguyên nhân gốc của B-02): nhúng 1.084KB ≠ GeoJSON rời ≠ master 4.186KB (stale: 20/61 nhà máy, 10/62 nông nghiệp, 21/30 câu); master **không bao giờ được fetch** | `ensureLayerData` [atlas-engine.js:1127](js/atlas-engine.js#L1127), 3 script build ghi đè chéo | Dựng 1 nguồn dữ liệu chuẩn + 1 script `rebuild_all.py` duy nhất (U-01) |
| **B-11** | `provinces_34_stats` có **35 khoá/34 tỉnh** — trùng `"Đồng Nai"` + `"Thành phố Đồng Nai"` → tổng diện tích 344.063 km² (+12.719), dân số 105,88 triệu (+4,43 triệu) | `atlat_2026_master.json`, `atlat-data.js` | Xoá bản ghi `"Đồng Nai"` cũ; thêm assert `len(stats) == 34` vào `verify_data.py` |
| **B-12** | Số liệu hiển thị/tài liệu sai lệch: “62 đối tượng” (vẽ 6), “43” khí hậu (có 44), README “21 câu” (30), “6 lớp” (7), “19 lỗi” (14) | `README.md:14,17,37`, `index.html:442,464` | Đồng bộ số sau khi sửa B-02; sửa README |

### 1.3. Lỗi P2 — nợ kỹ thuật ảnh hưởng vận hành

| ID | Lỗi | Bằng chứng | Cách sửa |
|:---|:---|:---|:---|
| **B-13** | `fallback-store.js` 457KB (114KB gz) là tầng dự phòng **bất khả đạt** (tầng 1 luôn thắng) | `ensureLayerData` ưu tiên `ATLAT_DATA`; tầng 3 chỉ chạy khi fetch lỗi **và** JS 1MB hỏng | Xoá khỏi critical path (U-03); giữ lại dạng JSON lười nếu muốn |
| **B-14** | `vn_provinces.geojson` **trùng byte 100%** `vn_provinces_63.geojson` (1.314KB ×2) | So hash SHA-256 | Xoá 1 tệp, cập nhật `LAYER_FILES` |
| **B-15** | Tài sản chết: `page_02.jpg` (268KB, không trong manifest), `districts_data.json` (stub), `biểu đồ.docx` (616KB ship ra web) | Kiểm kê tệp | Xoá / chuyển `biểu đồ.docx` sang `docs/` |
| **B-16** | **6 bộ test “100% PASS” nhưng chỉ grep chuỗi** — không bắt được B-01/B-02/B-03 | Đọc `scripts/test_*.js` | Bộ smoke test Playwright (U-04) chạy 6 kịch bản runtime |
| **B-17** | 4 cấu hình host với **3 chính sách cache xung đột**; `CNAME` là domain Surge; `dist/` stale (thiếu visitor-tracker); `200.html` copy tay | `vercel.json` vs `_headers`; `dist/` | Chọn 1 host chuẩn (U-07); xoá `dist/`; script đồng bộ `200.html` |
| **B-18** | Repo 247MB: `.git` 205,7MB (2 PDF 57+42MB trong lịch sử), `docs/` 60,6MB được track → **GitHub Pages sẽ phục vụ 60MB ảnh bằng chứng** | `git ls-files`, `verify-pack` | Tách bằng chứng khỏi deploy; viết lại lịch sử bằng `git filter-repo` (U-07, cần xác nhận) |
| **B-19** | Google Fonts nạp **2 lần** (`<link>` + `@import`) | `index.html:9-11`, `styles.css:9` | Xoá `@import`, giữ 1 `<link>` |
| **B-20** | Không CSP; **6 thẻ CDN thiếu SRI**; `push_to_github.bat` đưa PAT lên dòng lệnh | Quét HTML + bat | Thêm SRI/CSP tương thích handler inline (U-08); chuyển sang credential helper |
| **B-21** | A11y: **0 `aria-*`**, 44 nút icon không nhãn, chữ 9–11px (111 chỗ), `select-none` toàn trang | Quét HTML | U-05 |

### 1.4. Lỗi P3 — chất lượng học thuật/trải nghiệm

| ID | Lỗi | Cách sửa |
|:---|:---|:---|
| **B-22** | Khung nhìn đầu tiên “chết” ~40% không gian (fit bao gồm Trường Sa xa); nhãn 34 tỉnh chồng chéo ở zoom 5.5; chú giải bị widget đè | Fit đất liền làm mặc định, quần đảo hiển thị inset khi zoom; chỉ hiện nhãn tỉnh từ zoom ≥ 7 (chuyển dần bằng `getZoom`) |
| **B-23** | Cơ cấu GRDP 4 khu vực của 34 trung tâm chỉ là **4 khuôn lặp** (16 trung tâm giống hệt 24/36/35/5) | Ghi nhãn “số minh hoạ” hoặc bổ sung số GSO thật (U-06) |
| **B-24** | `DOCX_CHART_03`: dãy “Cả nước” 62→46,9→53,8→64,3→83,6→92→78,2 phi thực tế; quy tắc “≥3 năm bắt buộc Miền” quá cứng khi trình bày | Đối chiếu lại bảng số liệu với nguồn; nới quy tắc thành “cơ cấu ≥3 năm → Miền; tốc độ → Đường” |
| **B-25** | `parseVNNumber` nhập nhằng (“1.234” coi là 1,234; “12,5” ok) | Chấp nhận nhưng hiển thị định dạng đã hiểu ngay dưới ô nhập |
| **B-26** | Zoom ban đầu `5.5` bị Leaflet snap (zoomSnap mặc định 1) | Đặt `zoomSnap: 0.5` hoặc dùng 5/6 |

---

## PHẦN 2 — KẾ HOẠCH THỰC THI FIX (4 giai đoạn)

### Giai đoạn 1 — “Cứu sản phẩm” (1 ngày, chỉ P0 + lỗi 1 dòng)

| Bước | Việc | Tệp | Kiểm chứng (chạy sau sửa) |
|:--|:---|:---|:---|
| 1.1 | Sửa `isRenewable` → `isWind \|\| isSolar` | `atlas-engine.js:2190` | `AtlasEngine.renderMineralsPowerLayer('all')` → `.atlat-power-marker` **= 61** |
| 1.2 | Map filter Lớp 6 `very_large/large/medium` ↔ `tier_*` | `atlas-engine.js:2233` | Chọn từng mục → marker **2 / 7 / 25** |
| 1.3 | Thêm escape tên điểm danh (B-09) | `visitor-tracker.js:259-267` | Nhập `<img src=x onerror=…>` → hiển thị dạng text |
| 1.4 | Tooltip GRDP ưu tiên `GRDP_LOOKUP` (B-05) | `atlas-engine.js:1446` | Bấm TP.HCM → “1.620 nghìn tỉ đồng” |
| 1.5 | Bỏ số online bịa (B-08) | `visitor-tracker.js:92-101` | Mở 1 tab → “Phiên đang mở: 1” |
| 1.6 | Xoá `"Đồng Nai"` trùng (B-11) | `atlat-data.js` + master | `len(stats)==34`; tổng diện tích 331.344 km² |
| 1.7 | Sửa README số liệu (B-12) | `README.md` | Không còn “21 câu”, “6 lớp”, “19 lỗi” |

**Definition of Done:** bật Lớp 5 thấy ≥ 61 ngôi sao; 2 bộ lọc trả > 0; không còn ReferenceError trong console; không còn XSS.

### Giai đoạn 2 — “Dữ liệu một nguồn + offline thật” (3–5 ngày)

| Bước | Việc | Tệp |
|:--|:---|:---|
| 2.1 | **Tái sinh dữ liệu nhúng đúng 62 đối tượng nông nghiệp** (khép B-02): chạy lại pipeline `build_full_agriculture.py` → `sync` vào `atlat-data.js` + master, hoặc đổi `ensureLayerData("agriculture")` sang fetch tệp rời trước | `scripts/`, `atlat-data.js` |
| 2.2 | **Một nguồn dữ liệu duy nhất (U-01):** viết `scripts/rebuild_all.py` chạy đủ 8 builder theo thứ tự → ghi 1 `public/data/dataset.json` → sinh `atlat-data.js`/`fallback-store.js` từ đó; xoá master JSON cũ (4,1MB) | `scripts/rebuild_all.py` |
| 2.3 | Self-host 5 thư viện vào `vendor/` (Leaflet, Tailwind build nhỏ, ECharts, KaTeX, font local) + SRI; xoá cảnh báo Tailwind CDN | `vendor/`, `index.html` |
| 2.4 | **Service Worker** precache app shell + dữ liệu + 15 trang Atlat (≈8MB, cache theo tầng) → offline **thật** | `sw.js`, `manifest.webmanifest` |
| 2.5 | Xoá dữ liệu dư (B-13, B-14, B-15); bỏ font trùng (B-19) | — |
| 2.6 | **Playwright smoke suite (U-04):** 6 kịch bản runtime (khởi động, đếm marker từng lớp, lọc danh mục, trả lời biểu đồ, 10 công thức, tràn mobile) chạy trong CI | `.github/workflows/ci.yml` |

**Definition of Done:** chặn mạng (offline) vẫn mở được bản đồ + biểu đồ + máy tính; chạy `python scripts/rebuild_all.py` rồi `diff` không đổi; CI xanh.

### Giai đoạn 3 — “Chất lượng giao diện & dữ liệu học thuật” (1–2 tuần)

| Bước | Việc |
|:--|:---|
| 3.1 | Sửa mobile 390px (B-06), class Tailwind (B-07), khung nhìn + nhãn tỉnh + legend (B-22), zoom snap (B-26) |
| 3.2 | A11y (B-21): `aria-label` cho nút icon, `aria-live` cho phản hồi trắc nghiệm, chữ tối thiểu 12px, cho phép chọn/copy số liệu ở bảng kết quả |
| 3.3 | Dữ liệu học thuật (B-23, B-24): gắn nhãn “số minh hoạ” cho cơ cấu GRDP chưa có nguồn; đối chiếu lại bảng `DOCX_CHART_03`; nới quy tắc miền |
| 3.4 | Nội suy GRDP thật 34 tỉnh (GSO 2024 / Niên giám) vào `GRDP_LOOKUP` và tooltip (U-06) |
| 3.5 | Đồng bộ nhãn số đối tượng trên UI với dữ liệu thật (đếm động từ GeoJSON thay vì số cứng) |

### Giai đoạn 4 — “Kiến trúc & vận hành dài hạn” (2–4 tuần)

| Bước | Việc |
|:--|:---|
| 4.1 | **Tái cấu trúc `atlas-engine.js` 4.748 dòng** → 5 module (core, layers, tools, book, game) qua `esbuild` bundle; giữ API `window.AtlasEngine` không đổi (U-08) |
| 4.2 | Bỏ 62 handler inline → delegation theo `data-action`; bật CSP không-unsafe-inline |
| 4.3 | **Chuẩn hoá deploy (U-07):** chọn Cloudflare Pages làm host chính; xoá `vercel.json`/CNAME Surge; GitHub Actions auto-deploy; một chính sách cache duy nhất; xoá `dist/`; script sinh `200.html` |
| 4.4 | **Dọn lịch sử git:** tách 2 PDF khỏi lịch sử bằng `git filter-repo` (cần Thầy xác nhận vì phải force-push), di chuyển 60,6MB bằng chứng ra kho lưu trữ riêng |
| 4.5 | Tính năng mới (ưu tiên đề xuất): ① lưu tiến độ 30 câu + điểm cao nhất (localStorage); ② chế độ “thi thử 15 câu/15 phút”; ③ biểu đồ lưu lượng 12 trạm thủy văn (dữ liệu `monthly_flow_pattern` đã có sẵn); ④ xuất/nhập điểm danh CSV cho giáo viên |

---

## PHẦN 3 — LỘ TRÌNH & ƯỚC LƯỢNG

| Giai đoạn | Nội dung | Nỗ lực | Rủi ro |
|:---|:---|:---:|:---|
| 1 | P0 + 7 lỗi một dòng | **1 ngày** | Thấp |
| 2 | Dữ liệu một nguồn, offline, CI test | 3–5 ngày | Trung bình (đụng pipeline) |
| 3 | Giao diện, a11y, dữ liệu học thuật | 1–2 tuần | Trung bình |
| 4 | Tái cấu trúc, deploy, tính năng mới | 2–4 tuần | Cao (đụng mọi tệp) |

**Thứ tự ưu tiên:** B-01 → B-03 → B-09 → B-05 → B-08 → B-11 → B-12 → (kiểm chứng) → B-02 → B-04 → còn lại theo bảng.

---

## PHẦN 4 — CHECKLIST CHỐNG TÁI PHÁT (mỗi fix phải kèm)

1. Lỗi liên quan dữ liệu → thêm assert vào `scripts/verify_data.py` (đếm feature, schema, tổng diện tích).
2. Lỗi runtime → thêm kịch bản Playwright đếm phần tử (marker/canvas/filter).
3. Lỗi giao diện → chụp ảnh 390px & 1500px trước/sau.
4. Mọi thay đổi → `node --check` + chạy đủ 6 bộ test cũ + smoke mới.

---

*Danh sách lỗi trong tài liệu này là toàn bộ những gì đã tìm thấy và xác minh bằng 2 lượt quét (tĩnh + runtime). Mọi vị trí `file:line` đều chính xác tại commit `072492f`.*
