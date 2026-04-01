-- Tạo bảng commission_products
CREATE TABLE IF NOT EXISTS commission_products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  san_pham_id INT NOT NULL,
  f1_percent DECIMAL(5, 2) DEFAULT 10.00,
  f2_percent DECIMAL(5, 2) DEFAULT 5.00,
  f3_percent DECIMAL(5, 2) DEFAULT 2.00,
  trang_thai ENUM('hoat_dong', 'tam_dung') DEFAULT 'hoat_dong',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (san_pham_id) REFERENCES sach(id) ON DELETE CASCADE
);
