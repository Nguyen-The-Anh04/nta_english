-- Tạo bảng khuyen_mai
CREATE TABLE IF NOT EXISTS `khuyen_mai` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ten_khoa` VARCHAR(255) NOT NULL,
  `mo_ta` TEXT NULL,
  `loai_khoa` ENUM('giam_phan_tram', 'giam_tien', 'mien_phi_van_chuyen', 'mua_x_tang_y') NOT NULL,
  `gia_tri` DECIMAL(10, 2) NOT NULL COMMENT 'Phần trăm hoặc số tiền giảm',
  `dieu_kien` DECIMAL(10, 2) NULL COMMENT 'Điều kiện áp dụng (số lượng sản phẩm hoặc tổng tiền)',
  `loai_dieu_kien` ENUM('so_luong', 'tong_tien') NULL,
  `ma_khoa` VARCHAR(50) NULL UNIQUE COMMENT 'Mã khuyến mại (nếu có)',
  `ngay_bat_dau` DATETIME NOT NULL,
  `ngay_ket_thuc` DATETIME NOT NULL,
  `trang_thai` ENUM('hoat_dong', 'tam_dung', 'het_han') DEFAULT 'hoat_dong',
  `ap_dung_cho` ENUM('tat_ca', 'danh_muc', 'san_pham') DEFAULT 'tat_ca' COMMENT 'Áp dụng cho tất cả, danh mục hoặc sản phẩm cụ thể',
  `danh_muc_id` INT NULL COMMENT 'ID danh mục nếu áp dụng cho danh mục',
  `san_pham_id` INT NULL COMMENT 'ID sản phẩm nếu áp dụng cho sản phẩm cụ thể',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ma_khoa` (`ma_khoa`),
  INDEX `idx_trang_thai` (`trang_thai`),
  INDEX `idx_ngay_bat_dau` (`ngay_bat_dau`),
  INDEX `idx_ngay_ket_thuc` (`ngay_ket_thuc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu cho khuyến mại
INSERT INTO `khuyen_mai` (`ten_khoa`, `mo_ta`, `loai_khoa`, `gia_tri`, `dieu_kien`, `loai_dieu_kien`, `ma_khoa`, `ngay_bat_dau`, `ngay_ket_thuc`, `trang_thai`, `ap_dung_cho`) VALUES
('Giảm 10% cho đơn hàng từ 2 sản phẩm', 'Áp dụng khi mua từ 2 sản phẩm trở lên', 'giam_phan_tram', 10.00, 2.00, 'so_luong', 'GIAM10', '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'hoat_dong', 'tat_ca'),
('Giảm 50.000đ cho đơn hàng từ 500.000đ', 'Áp dụng cho đơn hàng có tổng tiền từ 500.000đ', 'giam_tien', 50000.00, 500000.00, 'tong_tien', 'GIAM50K', '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'hoat_dong', 'tat_ca'),
('Miễn phí vận chuyển cho đơn hàng từ 300.000đ', 'Áp dụng cho đơn hàng có tổng tiền từ 300.000đ', 'mien_phi_van_chuyen', 30000.00, 300000.00, 'tong_tien', 'FREESHIP', '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'hoat_dong', 'tat_ca'),
('Giảm 15% cho combo IELTS', 'Áp dụng khi mua combo 4 kỹ năng IELTS', 'giam_phan_tram', 15.00, 4.00, 'so_luong', 'IELTS15', '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'hoat_dong', 'tat_ca');
