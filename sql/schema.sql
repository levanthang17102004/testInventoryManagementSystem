-- 1. Đơn vị / bộ phận
CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Kho nhập
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Phiếu nhập kho
CREATE TABLE IF NOT EXISTS inventory_receipts (
  id SERIAL PRIMARY KEY,
  receipt_no VARCHAR(50) NOT NULL UNIQUE,
  receipt_date DATE NOT NULL,
  department_id INT REFERENCES departments(id),
  warehouse_id INT REFERENCES warehouses(id),
  delivered_by VARCHAR(255),
  received_by VARCHAR(255),
  accountant VARCHAR(255),
  warehouse_keeper VARCHAR(255),
  reference_document TEXT,
  debit_account VARCHAR(50),
  credit_account VARCHAR(50),
  total_amount NUMERIC(18,2) DEFAULT 0,
  total_amount_text TEXT,
  attached_documents_count INT DEFAULT 0,
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Danh mục vật tư / hàng hóa
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Chi tiết phiếu nhập kho
CREATE TABLE IF NOT EXISTS inventory_receipt_items (
  id SERIAL PRIMARY KEY,
  receipt_id INT NOT NULL REFERENCES inventory_receipts(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id),
  document_quantity NUMERIC(18,2) DEFAULT 0,
  actual_quantity NUMERIC(18,2) NOT NULL,
  unit_price NUMERIC(18,2) NOT NULL,
  total_price NUMERIC(18,2) GENERATED ALWAYS AS (actual_quantity * unit_price) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION set_inventory_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_inventory_receipts_updated_at ON inventory_receipts;
CREATE TRIGGER trg_inventory_receipts_updated_at
  BEFORE UPDATE ON inventory_receipts
  FOR EACH ROW
  EXECUTE PROCEDURE set_inventory_receipts_updated_at();
