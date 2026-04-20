-- Tạo bảng đề thi
CREATE TABLE IF NOT EXISTS de_thi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ten_de VARCHAR(255) NOT NULL,
  mo_ta TEXT,
  file_pdf VARCHAR(500),
  loai ENUM('ielts', 'toeic', 'giao_tiep', 'khac') DEFAULT 'ielts',
  trang_thai ENUM('hoat_dong', 'tam_dung') DEFAULT 'hoat_dong',
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng lịch hẹn test
CREATE TABLE IF NOT EXISTS lich_hen_test (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hoc_vien_id INT,
  giao_vien_id INT,
  lead_id INT,
  de_thi_id INT,
  dia_diem VARCHAR(255),
  thoi_gian DATETIME,
  ghi_chu TEXT,
  trang_thai ENUM('cho_test', 'dang_test', 'hoan_thanh', 'huy') DEFAULT 'cho_test',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tạu bảng kết quả lịch test
CREATE TABLE IF NOT EXISTS ket_qua_lich_test (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lich_hen_test_id INT NOT NULL,
  hoc_vien_id INT NOT NULL,
  diem_tong DECIMAL(4,2),
  diem_nghe DECIMAL(4,2),
  diem_doc DECIMAL(4,2),
  diem_noi DECIMAL(4,2),
  diem_viet DECIMAL(4,2),
  thoi_gian_lam INT,
  ngay_lam DATETIME DEFAULT CURRENT_TIMESTAMP,
  trang_thai ENUM('chua_lam', 'dang_lam', 'hoan_thanh') DEFAULT 'chua_lam',
  ghi_chu TEXT
);