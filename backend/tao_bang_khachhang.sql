-- =====================================================
-- TẠO BẢNG KHÁCH HÀNG (KHÁCH MUA SẢN PHẨM)
-- =====================================================

-- Bước 1: Tạo bảng khach_hang (status: moi, cho_xac_nhan, da_mua, huy)
CREATE TABLE IF NOT EXISTS khach_hang (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_khach_hang VARCHAR(20) UNIQUE NOT NULL,
    ten_khach_hang VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    dia_chi TEXT,
    nguon_khach ENUM('landing_page','fb_ads','zalo_oa','walkin','gioi_thieu','khac') NOT NULL DEFAULT 'landing_page',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trang_thai ENUM('moi','cho_xac_nhan','da_mua','huy') DEFAULT 'moi',
    nhan_vien_id INT,
    ghi_chu TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_sdt (so_dien_thoai),
    INDEX idx_trang_thai (trang_thai),
    INDEX idx_nguon (nguon_khach),
    INDEX idx_nhan_vien (nhan_vien_id),
    
    FOREIGN KEY (nhan_vien_id) REFERENCES nguoi_dung(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bước 2: Thêm dữ liệu mẫu (10 khách hàng - KHÁCH MUA SẢN PHẨM)
INSERT INTO khach_hang (ma_khach_hang, ten_khach_hang, so_dien_thoai, email, dia_chi, nguon_khach, trang_thai) VALUES 
('KH001', 'Nguyễn Văn An', '0901111222', 'an@gmail.com', 'Hà Nội', 'landing_page', 'da_mua'),
('KH002', 'Trần Thị Bình', '0902222333', 'binh@gmail.com', 'TP. Hồ Chí Minh', 'fb_ads', 'da_mua'),
('KH003', 'Lê Văn Cường', '0903333444', 'cuong@gmail.com', 'Đà Nẵng', 'zalo_oa', 'cho_xac_nhan'),
('KH004', 'Phạm Thị Dung', '0904444555', 'dung@gmail.com', 'Hà Nội', 'walkin', 'da_mua'),
('KH005', 'Hoàng Văn Em', '0905555666', 'em@gmail.com', 'Hải Phòng', 'landing_page', 'moi'),
('KH006', 'Nguyễn Thị Hoa', '0906666777', 'hoa@gmail.com', 'TP. Hồ Chí Minh', 'fb_ads', 'da_mua'),
('KH007', 'Trần Văn Hùng', '0907777888', 'hung@gmail.com', 'Cần Thơ', 'gioi_thieu', 'huy'),
('KH008', 'Lê Thị Mai', '0908888999', 'mai@gmail.com', 'Huế', 'landing_page', 'moi'),
('KH009', 'Phạm Quốc Việt', '0909999000', 'viet@gmail.com', 'Nha Trang', 'zalo_oa', 'da_mua'),
('KH010', 'Nguyễn Hoàng Nam', '0910101010', 'nam@gmail.com', 'Vũng Tàu', 'landing_page', 'cho_xac_nhan');

-- Bước 3: Xem dữ liệu
SELECT * FROM khach_hang;

SELECT COUNT(*) AS 'Tổng số khách hàng' FROM khach_hang;