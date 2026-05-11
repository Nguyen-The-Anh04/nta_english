CREATE TABLE IF NOT EXISTS thong_bao (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tieu_de VARCHAR(255) NOT NULL,
  noi_dung TEXT,
  loai ENUM('thong_bao','bai_tap','diem_so','hoc_phi','he_thong') DEFAULT 'thong_bao',
  nguoi_gui_id INT,
  nguoi_nhan_id INT,        -- NULL = gửi cho tất cả học viên trong lớp
  lop_hoc_id INT,           -- NULL = gửi cho cá nhân
  da_doc BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nguoi_nhan (nguoi_nhan_id),
  INDEX idx_lop_hoc (lop_hoc_id)
);
