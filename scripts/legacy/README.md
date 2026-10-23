# scripts/legacy/ — ĐÃ NGƯNG DÙNG (đã lưu trữ 23/10/2026)

Các tệp trong thư mục này từng ghi đè trực tiếp `js/atlat-data.js` và
`public/data/atlat_2026_master.json` theo định dạng cũ (nhúng toàn bộ dữ liệu).

**Từ bản 2026.4.0**, quy trình dữ liệu một nguồn là `scripts/rebuild_all.py`:

```
public/data/*.geojson + chart_questions.json + atlat_rich.json  (NGUỒN)
        │  python scripts/rebuild_all.py
        ├── public/data/dataset.json           (tập hợp đầy đủ, đối chiếu)
        ├── js/atlat-data.js                   (nhúng nhẹ: câu hỏi + keyword)
        └── js/fallback-store.js               (dự phòng lười, chỉ tải khi fetch lỗi)
```

**KHÔNG chạy lại** các tệp ở đây — chúng sẽ ghi đè định dạng mới.
Nếu cần sửa dữ liệu: sửa tệp nguồn trong `public/data/` rồi chạy `rebuild_all.py`.
