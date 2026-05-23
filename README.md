# Test BE — Phiếu nhập kho

Backend TypeScript (Node.js + Express) kết nối PostgreSQL qua thư viện **pg** (binding **libpq**).

## Yêu cầu

- Node.js 18+
- PostgreSQL (port `5432`, user `postgres`, mật khẩu `123456`)

## Cấu hình

Sao chép `.env.example` thành `.env` (đã có sẵn mẫu):

```
DATABASE_URL=postgresql://postgres:123456@localhost:5432/inventory_db
PORT=3001
```

Tạo database (psql hoặc pgAdmin):

```sql
CREATE DATABASE inventory_db;
```

## Cài đặt & chạy

```bash
cd Test/be
npm install
npm run db:init
npm run dev
```

API: `http://localhost:3001`

## Endpoints

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/health` | Kiểm tra DB |
| GET/POST/PUT/DELETE | `/api/departments` | Đơn vị / bộ phận |
| GET/POST/PUT/DELETE | `/api/warehouses` | Kho nhập |
| GET/POST/PUT/DELETE | `/api/products` | Vật tư / hàng hóa |
| GET/POST/PUT/DELETE | `/api/inventory-receipts` | Phiếu nhập kho (+ chi tiết) |

### Tạo phiếu nhập (POST `/api/inventory-receipts`)

```json
{
  "receipt_no": "PNK-001",
  "receipt_date": "2026-05-23",
  "department_id": 1,
  "warehouse_id": 1,
  "delivered_by": "Nguyễn Văn A",
  "received_by": "Trần Thị B",
  "items": [
    {
      "product_id": 1,
      "document_quantity": 10,
      "actual_quantity": 10,
      "unit_price": 50000
    }
  ]
}
```

`total_amount` được tính tự động từ các dòng `items`.
