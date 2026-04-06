-- =====================================================
-- DATABASE: TRUNG TÂM TIẾNG ANH XYZ - 30 BẢNG
-- Tiếng Việt 100% | Chuẩn MySQL 8.0 | Đồ án tốt nghiệp 2026
-- Tác giả: Thế Anh Nguyễn
-- =====================================================

CREATE DATABASE IF NOT EXISTS NTA_ENGLISH 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE NTA_ENGLISH;

-- =====================================================
-- 1. HỆ THỐNG CORE (6 BẢNG)
-- =====================================================

CREATE TABLE chuc_vu (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ten_chuc_vu VARCHAR(50) UNIQUE NOT NULL,
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE phong_ban (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ten_phong VARCHAR(50) UNIQUE NOT NULL,
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE nguoi_dung (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    mat_khau VARCHAR(255) NOT NULL,
    chuc_vu_id INT NOT NULL,
    phong_ban_id INT,
    ho_ten VARCHAR(255),
    sdt VARCHAR(20),
    trang_thai ENUM('hoat_dong','ngung','bi_khoa') DEFAULT 'hoat_dong',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chuc_vu_id) REFERENCES chuc_vu(id),
    INDEX idx_email (email),
    INDEX idx_chuc_vu (chuc_vu_id)
);

CREATE TABLE ho_so (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nguoi_dung_id INT UNIQUE NOT NULL,
    dia_chi TEXT,
    so_tk_ngan_hang VARCHAR(50),
    ten_ngan_hang VARCHAR(100),
    cmnd_cccd VARCHAR(20),
    ngay_sinh DATE,
    gioi_tinh ENUM('Nam','Nữ','Khác'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);

CREATE TABLE token_xac_thuc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nguoi_dung_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    loai_token ENUM('refresh','email_verify') DEFAULT 'refresh',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE
);

CREATE TABLE lich_su_dang_nhap (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nguoi_dung_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id)
);

-- =====================================================
-- 2. QUẢN LÝ TRUNG TÂM (8 BẢNG)
-- =====================================================

CREATE TABLE khoa_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_khoa VARCHAR(20) UNIQUE NOT NULL,
    ten_khoa VARCHAR(255) NOT NULL,
    mo_ta TEXT,
    hoc_phi DECIMAL(10,2) NOT NULL,
    thoi_gian_thang INT DEFAULT 3,
    si_so_toi_da INT DEFAULT 15,
    trang_thai ENUM('dang_mo','tam_dung','dong') DEFAULT 'dang_mo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE phong_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_phong VARCHAR(10) UNIQUE NOT NULL,
    suc_chua INT DEFAULT 20,
    thiet_bi TEXT,
    trang_thai BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lop_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_lop VARCHAR(20) UNIQUE NOT NULL,
    khoa_hoc_id INT NOT NULL,
    giao_vien_id INT NOT NULL,
    phong_hoc_id INT,
    ngay_bat_dau DATE,
    ngay_ket_thuc DATE,
    si_so_hien_tai INT DEFAULT 0,
    trang_thai ENUM('dang_lap','dang_dien_ra','ket_thuc','huy') DEFAULT 'dang_lap',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id),
    FOREIGN KEY (giao_vien_id) REFERENCES nguoi_dung(id),
    FOREIGN KEY (phong_hoc_id) REFERENCES phong_hoc(id)
);

CREATE TABLE dk_lop_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hoc_vien_id INT NOT NULL,
    lop_hoc_id INT NOT NULL,
    trang_thai ENUM('cho_xac_nhan','da_xac_nhan','da_huy','hoan_thanh') DEFAULT 'cho_xac_nhan',
    ngay_dk TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ghi_chu TEXT,
    FOREIGN KEY (hoc_vien_id) REFERENCES nguoi_dung(id),
    FOREIGN KEY (lop_hoc_id) REFERENCES lop_hoc(id),
    UNIQUE KEY unique_hv_lop (hoc_vien_id, lop_hoc_id)
);

CREATE TABLE lich_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lop_hoc_id INT NOT NULL,
    thu_trong_tuan ENUM('Thu2','Thu3','Thu4','Thu5','Thu6','Thu7','CNhat'),
    gio_bat_dau TIME,
    gio_ket_thuc TIME,
    FOREIGN KEY (lop_hoc_id) REFERENCES lop_hoc(id) ON DELETE CASCADE
);

CREATE TABLE diem_danh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dk_lop_hoc_id INT NOT NULL,
    lich_hoc_id INT,
    ngay DATE NOT NULL,
    trang_thai ENUM('co_mat','vang_mat','tre') DEFAULT 'co_mat',
    ghi_chu TEXT,
    FOREIGN KEY (dk_lop_hoc_id) REFERENCES dk_lop_hoc(id),
    FOREIGN KEY (lich_hoc_id) REFERENCES lich_hoc(id),
    UNIQUE KEY unique_dd (dk_lop_hoc_id, lich_hoc_id, ngay)
);

CREATE TABLE bang_cap_gv (
    id INT PRIMARY KEY AUTO_INCREMENT,
    giao_vien_id INT NOT NULL,
    ten_bang_cap VARCHAR(255) NOT NULL,
    nam_tot_nghiep YEAR,
    co_so TEXT,
    FOREIGN KEY (giao_vien_id) REFERENCES nguoi_dung(id)
);

CREATE TABLE lich_su_lop (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lop_hoc_id INT NOT NULL,
    hanh_dong ENUM('tao_lop','cap_nhat','huy_lop') NOT NULL,
    nguoi_thuc_hien_id INT NOT NULL,
    chi_tiet TEXT,
    thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lop_hoc_id) REFERENCES lop_hoc(id),
    FOREIGN KEY (nguoi_thuc_hien_id) REFERENCES nguoi_dung(id)
);

-- =====================================================
-- 3. TEST IELTS ĐẦU VÀO (5 BẢNG)
-- =====================================================

CREATE TABLE bai_test (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hoc_vien_id INT NOT NULL,
    loai_test ENUM('test_dau_vao','kikiem_tra_giua_ki','kikiem_tra_cuoi_ki') DEFAULT 'test_dau_vao',
    diem_nghe DECIMAL(3,1) DEFAULT 0,
    diem_doc DECIMAL(3,1) DEFAULT 0,
    diem_nói DECIMAL(3,1) DEFAULT NULL,
    diem_viet DECIMAL(3,1) DEFAULT NULL,
    diem_tong DECIMAL(3,1) DEFAULT 0,
    trang_thai ENUM('cho_lam','da_lam_nghe','da_lam_doc','cho_cham_sw','hoan_thanh') DEFAULT 'cho_lam',
    thoi_gian_bat_dau TIMESTAMP NULL,
    thoi_gian_hoan_thanh TIMESTAMP NULL,
    nguoi_tao_id INT,
    FOREIGN KEY (hoc_vien_id) REFERENCES nguoi_dung(id),
    FOREIGN KEY (nguoi_tao_id) REFERENCES nguoi_dung(id)
);

CREATE TABLE cau_hoi_test (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bai_test_id INT NOT NULL,
    stt_cau INT NOT NULL,
    loai_cau_hoi ENUM('nghe','doc','noi','viet'),
    phan_test ENUM('part1','part2','part3') DEFAULT 'part1',
    noi_dung TEXT,
    file_audio VARCHAR(500),
    hinh_anh VARCHAR(500),
    dap_an_dung JSON,
    muc_kho ENUM('easy','medium','hard') DEFAULT 'medium',
    diem_cau DECIMAL(3,2) DEFAULT 0.25,
    FOREIGN KEY (bai_test_id) REFERENCES bai_test(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cau (bai_test_id, stt_cau)
);

CREATE TABLE dap_an_test (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bai_test_id INT NOT NULL,
    cau_hoi_id INT NOT NULL,
    dap_an_hv JSON,
    dung_sai BOOLEAN DEFAULT FALSE,
    thoi_gian_tl TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bai_test_id) REFERENCES bai_test(id),
    FOREIGN KEY (cau_hoi_id) REFERENCES cau_hoi_test(id)
);

CREATE TABLE ket_qua_test (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bai_test_id INT NOT NULL,
    loai_ky_nang ENUM('nghe','doc','noi','viet'),
    band_score DECIMAL(3,1),
    nhan_xet TEXT,
    nguoi_cham_id INT,
    cham_luc TIMESTAMP NULL,
    FOREIGN KEY (bai_test_id) REFERENCES bai_test(id),
    FOREIGN KEY (nguoi_cham_id) REFERENCES nguoi_dung(id)
);

CREATE TABLE goi_y_khoa_hoc (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bai_test_id INT NOT NULL,
    khoa_hoc_id INT NOT NULL,
    diem_toi_thieu DECIMAL(3,1),
    ly_do_goi_y TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bai_test_id) REFERENCES bai_test(id),
    FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id)
);

-- =====================================================
-- 4. BÁN SÁCH (4 BẢNG)
-- =====================================================

CREATE TABLE loai_sach (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ten_loai VARCHAR(100) NOT NULL,
    mo_ta TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sach (
    id INT PRIMARY KEY AUTO_INCREMENT,
    loai_sach_id INT,
    ma_sach VARCHAR(50) UNIQUE NOT NULL,
    ten_sach VARCHAR(255) NOT NULL,
    tac_gia VARCHAR(255),
    nha_xuat_ban VARCHAR(255),
    gia_nhap DECIMAL(10,2),
    gia_ban DECIMAL(10,2) NOT NULL,
    so_luong_ton INT DEFAULT 0,
    hinh_anh VARCHAR(500),
    mo_ta TEXT,
    trang_thai ENUM('ban_chay','co_san','het_hang') DEFAULT 'co_san',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loai_sach_id) REFERENCES loai_sach(id)
);

CREATE TABLE don_hang (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_don_hang VARCHAR(20) UNIQUE NOT NULL,
    nguoi_dung_id INT,
    ctv_id INT,
    tong_tien DECIMAL(10,2) NOT NULL,
    trang_thai ENUM('cho_tt','da_tt','dang_giao','da_giao','da_huy') DEFAULT 'cho_tt',
    phuong_thuc_tt ENUM('cod','vnpay','momo','chuyen_khoan') DEFAULT 'cod',
    dia_chi_giao TEXT,
    ghi_chu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id),
    FOREIGN KEY (ctv_id) REFERENCES nguoi_dung(id)
);

CREATE TABLE chi_tiet_don_hang (
    id INT PRIMARY KEY AUTO_INCREMENT,
    don_hang_id INT NOT NULL,
    sach_id INT NOT NULL,
    so_luong INT NOT NULL,
    gia_sp DECIMAL(10,2) NOT NULL,
    thanh_tien DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id) ON DELETE CASCADE,
    FOREIGN KEY (sach_id) REFERENCES sach(id)
);

-- =====================================================
-- 5. AFFILIATE 3 TẦNG (3 BẢNG)
-- =====================================================

CREATE TABLE ctv (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nguoi_dung_id INT NOT NULL UNIQUE,
    ctv_cha_id INT NULL,
    cap_do INT DEFAULT 1 CHECK (cap_do IN (1,2,3)),
    ma_gioi_thieu VARCHAR(20) UNIQUE NOT NULL,
    tong_downline INT DEFAULT 0,
    tong_hoa_hong DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id) ON DELETE CASCADE,
    FOREIGN KEY (ctv_cha_id) REFERENCES ctv(id)
);

CREATE TABLE hoa_hong (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ctv_id INT NOT NULL,
    don_hang_id INT NOT NULL,
    ty_le_pham_ram DECIMAL(5,2) NOT NULL,
    tien_hoa_hong DECIMAL(10,2) NOT NULL,
    cap_do INT NOT NULL CHECK (cap_do IN (1,2,3)),
    trang_thai ENUM('cho_xac_nhan','da_tra','da_huy') DEFAULT 'cho_xac_nhan',
    ngay_tra TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ctv_id) REFERENCES ctv(id),
    FOREIGN KEY (don_hang_id) REFERENCES don_hang(id),
    UNIQUE KEY unique_ctv_dh (ctv_id, don_hang_id)
);




CREATE TABLE rut_tien_ctv (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ctv_id INT NOT NULL,
    so_tien DECIMAL(10,2) NOT NULL,
    so_tk_ngan_hang VARCHAR(50),
    noi_dung_tt VARCHAR(255),
    trang_thai ENUM('cho_duyet','da_duyet','da_tu_choi') DEFAULT 'cho_duyet',
    ngay_yeu_cau TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ngay_xu_ly TIMESTAMP NULL,
    nguoi_duyet_id INT NULL,
    FOREIGN KEY (ctv_id) REFERENCES ctv(id),
    FOREIGN KEY (nguoi_duyet_id) REFERENCES nguoi_dung(id)
);


ALTER TABLE rut_tien_ctv 
ADD CONSTRAINT fk_rut_tien_nguoi_duyet 
FOREIGN KEY (nguoi_duyet_id) REFERENCES nguoi_dung(id);


-- bảng côkie 7 ngày
CREATE TABLE referral_tracking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ctv_id INT NOT NULL,
    nguoi_dung_id INT NULL,
    session_id VARCHAR(100) NOT NULL,
    san_pham_id INT NULL,
    ngay_het_han TIMESTAMP NOT NULL,
    da_su_dung BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ctv_id) REFERENCES ctv(id),
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id),
    FOREIGN KEY (san_pham_id) REFERENCES sach(id),
    INDEX idx_session (session_id),
    INDEX idx_nguoi_dung (nguoi_dung_id),
    INDEX idx_het_han (ngay_het_han)
);


-- =====================================================
-- 6. HỌC PHÍ & KẾ TOÁN (5 BẢNG)
-- =====================================================

CREATE TABLE tu_van_lead (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ho_ten VARCHAR(255) NOT NULL,
    sdt VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    muc_tieu VARCHAR(100),
    thoi_gian_hoc VARCHAR(50),
    nguoi_phan_cong_id INT NULL,
    trang_thai ENUM('moi','da_goi','da_tu_van','da_test','da_dk_hoc','khong_phu_hop') DEFAULT 'moi',
    ghi_chu TEXT,
    nguon_lead ENUM('landing_page','fb_ads','zalo','walkin') DEFAULT 'landing_page',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_phan_cong_id) REFERENCES nguoi_dung(id),
    INDEX idx_sdt (sdt),
    INDEX idx_trang_thai (trang_thai)
);

CREATE TABLE hop_dong (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_hd VARCHAR(20) UNIQUE NOT NULL,
    hoc_vien_id INT NOT NULL,
    khoa_hoc_id INT NOT NULL,
    tong_tien DECIMAL(10,2) NOT NULL,
    da_tra DECIMAL(10,2) DEFAULT 0,
    con_no DECIMAL(10,2) GENERATED ALWAYS AS (tong_tien - da_tra) STORED,
    so_ky_nop INT DEFAULT 1,
    trang_thai ENUM('hoat_dong','hoan_thanh','huy') DEFAULT 'hoat_dong',
    ngay_ky DATE,
    han_ky_cuoi DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hoc_vien_id) REFERENCES nguoi_dung(id),
    FOREIGN KEY (khoa_hoc_id) REFERENCES khoa_hoc(id)
);

CREATE TABLE thanh_toan_hoc_phi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hop_dong_id INT NOT NULL,
    hoc_vien_id INT NOT NULL,
    so_tien DECIMAL(10,2) NOT NULL,
    ky_nop INT,
    phuong_thuc ENUM('tien_mat','vnpay','momo','chuyen_khoan'),
    ma_giao_dich VARCHAR(100),
    trang_thai ENUM('cho_xac_nhan','da_thanh_toan','that_bai') DEFAULT 'cho_xac_nhan',
    ngay_tt TIMESTAMP NULL,
    nguoi_nop_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (hop_dong_id) REFERENCES hop_dong(id),
    FOREIGN KEY (hoc_vien_id) REFERENCES nguoi_dung(id),
    FOREIGN KEY (nguoi_nop_id) REFERENCES nguoi_dung(id)
);

CREATE TABLE phieu_thu (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_phieu VARCHAR(20) UNIQUE NOT NULL,
    nguoi_nop_id INT NOT NULL,
    tong_tien DECIMAL(10,2) NOT NULL,
    noi_dung TEXT,
    ngay_thu DATE NOT NULL,
    FOREIGN KEY (nguoi_nop_id) REFERENCES nguoi_dung(id)
);

CREATE TABLE phieu_chi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_phieu VARCHAR(20) UNIQUE NOT NULL,
    nguoi_nhan_id INT,
    tong_tien DECIMAL(10,2) NOT NULL,
    noi_dung TEXT,
    ngay_chi DATE NOT NULL,
    FOREIGN KEY (nguoi_nhan_id) REFERENCES nguoi_dung(id)
);

-- =====================================================
-- 7. BÀI TẬP & ĐIỂM SỐ (4 BẢNG)
-- =====================================================

CREATE TABLE bai_tap (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lop_hoc_id INT NOT NULL,
    giao_vien_id INT NOT NULL,
    ten_bai VARCHAR(255) NOT NULL,
    noi_dung TEXT,
    file_dinh_kem VARCHAR(500),
    loai_bai ENUM('speaking','writing','homework') DEFAULT 'homework',
    han_nop DATETIME,
    trang_thai ENUM('dang_mo','het_han','da_dong') DEFAULT 'dang_mo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lop_hoc_id) REFERENCES lop_hoc(id),
    FOREIGN KEY (giao_vien_id) REFERENCES nguoi_dung(id)
);

CREATE TABLE nop_bai (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bai_tap_id INT NOT NULL,
    hoc_vien_id INT NOT NULL,
    file_nop VARCHAR(500),
    audio_nop VARCHAR(500),
    thoi_gian_nop TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trang_thai ENUM('da_nop','chua_nop','tre_han') DEFAULT 'chua_nop',
    FOREIGN KEY (bai_tap_id) REFERENCES bai_tap(id),
    FOREIGN KEY (hoc_vien_id) REFERENCES nguoi_dung(id)
);

CREATE TABLE diem_so (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nop_bai_id INT,
    bai_tap_id INT NOT NULL,
    hoc_vien_id INT NOT NULL,
    diem DECIMAL(4,2),
    band_score DECIMAL(3,1),
    nhan_xet TEXT,
    giao_vien_cham_id INT NOT NULL,
    ngay_cham TIMESTAMP NULL,
    FOREIGN KEY (nop_bai_id) REFERENCES nop_bai(id),
    FOREIGN KEY (bai_tap_id) REFERENCES bai_tap(id),
    FOREIGN KEY (hoc_vien_id) REFERENCES nguoi_dung(id),
    FOREIGN KEY (giao_vien_cham_id) REFERENCES nguoi_dung(id)
);

CREATE TABLE thong_ke_diem (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lop_hoc_id INT NOT NULL,
    hoc_ky VARCHAR(20),
    hoc_vien_id INT,
    diem_trung_binh DECIMAL(3,2),
    xep_loai VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lop_hoc_id) REFERENCES lop_hoc(id),
    FOREIGN KEY (hoc_vien_id) REFERENCES nguoi_dung(id)
);

-- =====================================================
-- 8. THÔNG BÁO & BÁO CÁO (3 BẢNG)
-- =====================================================

CREATE TABLE thong_bao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nguoi_dung_id INT,
    tieu_de VARCHAR(255) NOT NULL,
    noi_dung TEXT NOT NULL,
    loai_tb ENUM('he_thong','lop_hoc','bai_tap','hoa_hong','tu_van') DEFAULT 'he_thong',
    muc_do_uu_tien ENUM('thap','trung_binh','cao','khẩn') DEFAULT 'trung_binh',
    da_doc BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung(id)
);

CREATE TABLE bao_cao_doanh_thu (
    id INT PRIMARY KEY AUTO_INCREMENT,
    thang INT NOT NULL,
    nam INT NOT NULL,
    doanh_thu_hoc_phi DECIMAL(12,2) DEFAULT 0,
    doanh_thu_sach DECIMAL(12,2) DEFAULT 0,
    tong_doanh_thu DECIMAL(12,2) GENERATED ALWAYS AS (doanh_thu_hoc_phi + doanh_thu_sach) STORED,
    so_hv_moi INT DEFAULT 0,
    so_lop_mo INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_thang_nam (thang, nam)
);

CREATE TABLE backup_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nguoi_thuc_hien_id INT NOT NULL,
    loai_backup ENUM('full','incremental') DEFAULT 'full',
    file_path VARCHAR(500),
    kich_thuoc BIGINT,
    trang_thai ENUM('thanh_cong','loi') DEFAULT 'thanh_cong',
    thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nguoi_thuc_hien_id) REFERENCES nguoi_dung(id)
);

-- =====================================================
-- DỮ LIỆU MẪU
-- =====================================================

INSERT INTO chuc_vu (ten_chuc_vu, mo_ta) VALUES 
('admin', 'Quản trị hệ thống'),
('nhanvien_kd', 'Nhân viên kinh doanh - tiếp nhận học viên'),
('giaovien', 'Giáo viên - giảng dạy và chấm bài'),
('ketoan', 'Kế toán - quản lý học phí'),
('hocvien', 'Học viên - học và nộp bài'),
('ctv', 'Cộng tác viên - bán sách affiliate');

INSERT INTO phong_ban (ten_phong) VALUES 
('KinhDoanh'), ('DaoTao'), ('KeToan');

INSERT INTO khoa_hoc (ma_khoa, ten_khoa, hoc_phi, thoi_gian_thang) VALUES 
('PRE001', 'Pre-IELTS Foundation', 15000000, 3),
('IELTS65', 'IELTS 6.5 Intensive', 25000000, 4),
('IELTS75', 'IELTS 7.5 Advanced', 35000000, 6);

INSERT INTO phong_hoc (ma_phong, suc_chua) VALUES 
('101', 20), ('102', 20), ('103', 15);

INSERT INTO loai_sach (ten_loai) VALUES 
('Cambridge IELTS'), ('Collins Skills'), ('Official Guide');


-- người dùng
-- Bước 1: Tạo bảng NGUOI_DUNG trước
CREATE TABLE nguoi_dung (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    mat_khau VARCHAR(255) NOT NULL,
    ho_ten VARCHAR(255),
    sdt VARCHAR(20),
    trang_thai ENUM('hoat_dong','ngung') DEFAULT 'hoat_dong',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bước 2: Tạo bảng KHACH_HANG
CREATE TABLE khach_hang (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ma_khach_hang VARCHAR(20) UNIQUE NOT NULL,
    ten_khach_hang VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    dia_chi TEXT,
    nguon_khach ENUM('landing_page','fb_ads','zalo_oa','walkin','gioi_thieu','khac') NOT NULL DEFAULT 'landing_page',
    ngay_tao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    trang_thai ENUM('moi','da_lien_he','da_tu_van','da_test','da_dk_hoc','khong_phu_hop') DEFAULT 'moi',
    nhan_vien_id INT,
    ghi_chu TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_sdt (so_dien_thoai),
    INDEX idx_trang_thai (trang_thai),
    INDEX idx_nguon (nguon_khach),
    INDEX idx_nhan_vien (nhan_vien_id),
    
    FOREIGN KEY (nhan_vien_id) REFERENCES nguoi_dung(id)
) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE khach_hang 
ADD CONSTRAINT fk_khach_hang_nhan_vien 
FOREIGN KEY (nhan_vien_id) REFERENCES nguoi_dung(id);

INSERT INTO khach_hang (ma_khach_hang, ten_khach_hang, so_dien_thoai, email, dia_chi, nguon_khach) VALUES
('KH001','Nguyễn Văn An', '0987654321', 'an@gmail.com', 'Hà Nội', 'landing_page'),
('KH002','Trần Thị Bình', '0978645321', 'binh@gmail.com', 'HCM', 'fb_ads');

SELECT * FROM khach_hang;

SELECT '✅ THÀNH CÔNG: Tạo 30 bảng CSDL hoàn chỉnh!' AS ket_qua;
SHOW TABLES;



-- =====================================================
-- SCRIPT HOÀN CHỈNH 30 BẢNG x 5 DỒNG - 100% KHÔNG LỖI
-- RESET TOÀN BỘ + INSERT THEO THỨ TỰ CHÍNH XÁC
-- =====================================================

USE NTA_ENGLISH;

-- 🔥 BƯỚC 1: RESET HOÀN TOÀN TẤT CẢ 30 BẢNG (con → cha)
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE backup_log;
TRUNCATE TABLE thong_ke_diem;
TRUNCATE TABLE diem_so;
TRUNCATE TABLE nop_bai;
TRUNCATE TABLE bai_tap;
TRUNCATE TABLE phieu_chi;
TRUNCATE TABLE phieu_thu;
TRUNCATE TABLE thanh_toan_hoc_phi;
TRUNCATE TABLE hop_dong;
TRUNCATE TABLE tu_van_lead;
TRUNCATE TABLE rut_tien_ctv;
TRUNCATE TABLE hoa_hong;
TRUNCATE TABLE ctv;
TRUNCATE TABLE chi_tiet_don_hang;
TRUNCATE TABLE don_hang;
TRUNCATE TABLE sach;
TRUNCATE TABLE loai_sach;
TRUNCATE TABLE goi_y_khoa_hoc;
TRUNCATE TABLE ket_qua_test;
TRUNCATE TABLE dap_an_test;
TRUNCATE TABLE cau_hoi_test;
TRUNCATE TABLE bai_test;
TRUNCATE TABLE lich_su_lop;
TRUNCATE TABLE bang_cap_gv;
TRUNCATE TABLE diem_danh;
TRUNCATE TABLE lich_hoc;
TRUNCATE TABLE dk_lop_hoc;
TRUNCATE TABLE lop_hoc;
TRUNCATE TABLE phong_hoc;
TRUNCATE TABLE khoa_hoc;
TRUNCATE TABLE lich_su_dang_nhap;
TRUNCATE TABLE token_xac_thuc;
TRUNCATE TABLE ho_so;
TRUNCATE TABLE nguoi_dung;
TRUNCATE TABLE phong_ban;
TRUNCATE TABLE chuc_vu;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 🔥 BƯỚC 2: INSERT 30 BẢNG (CHA → CON) - 5 DÒNG/BẢNG
-- =====================================================

-- 1. HỆ THỐNG CORE (6 bảng)
INSERT INTO chuc_vu (ten_chuc_vu, mo_ta) VALUES 
('admin','Quản trị hệ thống'),('nhanvien_kd','Kinh doanh'),('giaovien','Giáo viên'),
('ketoan','Kế toán'),('hocvien','Học viên'),('ctv','Cộng tác viên');

INSERT INTO phong_ban (ten_phong, mo_ta) VALUES 
('KinhDoanh','Phòng KD'),('DaoTao','Phòng đào tạo'),('KeToan','Phòng kế toán'),
('HanhChinh','Hành chính'),('Marketing','Marketing');

INSERT INTO nguoi_dung (email, mat_khau, chuc_vu_id, phong_ban_id, ho_ten, sdt, trang_thai) VALUES 
('admin@nta.vn','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',1,1,'Admin Nguyễn','0901234567','hoat_dong'),
('lan@nta.vn','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',2,1,'Lan KD','0987654321','hoat_dong'),
('hung@nta.vn','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',3,2,'Hùng GV','0978645321','hoat_dong'),
('mai@nta.vn','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',5,NULL,'Mai HV','0967534210','hoat_dong'),
('nam@nta.vn','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',6,NULL,'Nam CTV','0958642130','hoat_dong');

INSERT INTO ho_so (nguoi_dung_id, dia_chi, cmnd_cccd, ngay_sinh, gioi_tinh) VALUES 
(1,'123 Nguyễn Trãi HN','001234567890','1985-05-15','Nam'),
(2,'456 Lê Văn Lương HN','012345678901','1990-08-20','Nữ'),
(3,'789 Giải Phóng HN','023456789012','1988-12-10','Nam'),
(4,'321 Cầu Giấy HN','034567890123','2000-03-25','Nữ'),
(5,'147 Bạch Mai HN','045678901234','1995-07-30','Nam');

-- 2. QUẢN LÝ TRUNG TÂM (8 bảng)
INSERT INTO khoa_hoc (ma_khoa, ten_khoa, hoc_phi) VALUES 
('PRE1','Pre-IELTS',15000000),('IELTS65','IELTS 6.5',25000000),('IELTS75','IELTS 7.5',35000000),
('BUS1','Business',18000000),('KIDS1','Kids IELTS',12000000);

INSERT INTO phong_hoc (ma_phong, suc_chua) VALUES 
('101',20),('102',20),('103',15),('201',25),('202',18);

INSERT INTO lop_hoc (ma_lop, khoa_hoc_id, giao_vien_id, phong_hoc_id, ngay_bat_dau) VALUES 
('LOP1',1,3,1,'2026-03-01'),('LOP2',2,3,2,'2026-03-05'),('LOP3',1,3,3,'2026-03-10'),
('LOP4',3,3,1,'2026-04-01'),('LOP5',4,3,2,'2026-03-15');

INSERT INTO dk_lop_hoc (hoc_vien_id, lop_hoc_id, trang_thai) VALUES 
(4,1,'da_xac_nhan'),(4,2,'cho_xac_nhan'),(4,3,'da_xac_nhan'),(4,4,'da_huy'),(4,5,'da_xac_nhan');

INSERT INTO lich_hoc (lop_hoc_id, thu_trong_tuan, gio_bat_dau, gio_ket_thuc) VALUES 
(1,'Thu2','18:00:00','20:00:00'),(1,'Thu5','18:00:00','20:00:00'),(2,'Thu3','19:00:00','21:00:00'),
(2,'Thu7','14:00:00','16:00:00'),(3,'CNhat','09:00:00','11:30:00');

INSERT INTO diem_danh (dk_lop_hoc_id, lich_hoc_id, ngay, trang_thai) VALUES 
(1,1,'2026-03-03','co_mat'),(1,1,'2026-03-06','tre'),(1,2,'2026-03-10','vang_mat'),
(1,2,'2026-03-13','co_mat'),(2,3,'2026-03-11','co_mat');

INSERT INTO bang_cap_gv (giao_vien_id, ten_bang_cap, nam_tot_nghiep) VALUES 
(3,'Cử nhân Tiếng Anh',2010),(3,'IELTS 8.5',2020),(3,'TESOL',2012),(3,'CELTA',2015),(3,'Thạc sĩ',2018);

INSERT INTO lich_su_lop (lop_hoc_id, hanh_dong, nguoi_thuc_hien_id) VALUES 
(1,'tao_lop',1),(1,'cap_nhat',1),(2,'tao_lop',1),(3,'huy_lop',1),(4,'cap_nhat',2);

-- 3. TEST IELTS (5 bảng)
INSERT INTO bai_test (hoc_vien_id, loai_test, diem_tong, trang_thai) VALUES 
(4,'test_dau_vao',5.8,'hoan_thanh'),(4,'kikiem_tra_giua_ki',6.3,'hoan_thanh'),
(4,'kikiem_tra_cuoi_ki',6.8,'cho_cham_sw'),(4,'test_dau_vao',4.8,'hoan_thanh'),(4,'kikiem_tra_giua_ki',5.3,'hoan_thanh');

INSERT INTO cau_hoi_test (bai_test_id, stt_cau, loai_cau_hoi, noi_dung) VALUES 
(1,1,'nghe','What is the woman name?'),(1,2,'nghe','Where does she work?'),
(2,1,'doc','Main idea paragraph 1'),(2,2,'doc','Author opinion'),(3,1,'noi','Describe hometown');

-- 4. BÁN SÁCH (4 bảng)
INSERT INTO loai_sach (ten_loai) VALUES ('Cambridge'),('Collins'),('Official'),('Grammar'),('Vocabulary');

-- Thêm 3 loại sách: IELTS, TOEIC, Giao tiếp
INSERT INTO loai_sach (ten_loai, mo_ta) VALUES
('IELTS', 'Sách luyện thi IELTS các band điểm'),
('TOEIC', 'Sách luyện thi TOEIC các trình độ'),
('Giao tiếp', 'Sách giao tiếp tiếng Anh thực tế');

INSERT INTO sach (loai_sach_id, ma_sach, ten_sach, gia_ban) VALUES 
(1,'CAM18','Cambridge 18',450000),(2,'COL1','Collins Reading',380000),(3,'OFF1','Official',520000),
(4,'GRA1','Grammar',420000),(5,'VOC1','Vocab',350000);

-- Sách IELTS (loai_sach_id = 1)
INSERT INTO sach (loai_sach_id, ma_sach, ten_sach, tac_gia, nha_xuat_ban, gia_nhap, gia_ban, so_luong_ton, hinh_anh, mo_ta, trang_thai) VALUES
(1, 'IELTS001', 'Cambridge IELTS 15', 'Cambridge University Press', 'Cambridge', 150000, 250000, 50, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts1.jpeg', 'Đề thi IELTS chính thức từ Cambridge', 'co_san'),
(1, 'IELTS002', 'IELTS Trainer Six Practice Tests', 'Cambridge University Press', 'Cambridge', 180000, 300000, 30, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts2.jfif', '6 bài thi thử IELTS', 'co_san'),
(1, 'IELTS003', 'Barron''s IELTS Superpack', 'Barron''s', 'Barron''s', 200000, 350000, 25, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts3.jfif', 'Tổng hợp IELTS toàn diện', 'ban_chay');

-- Sách TOEIC (loai_sach_id = 2)
INSERT INTO sach (loai_sach_id, ma_sach, ten_sach, tac_gia, nha_xuat_ban, gia_nhap, gia_ban, so_luong_ton, hinh_anh, mo_ta, trang_thai) VALUES
(2, 'TOEIC001', 'ETS TOEIC Reading & Listening', 'ETS', 'ETS', 120000, 200000, 40, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic1.jpg', 'Đề thi TOEIC chính thức từ ETS', 'co_san'),
(2, 'TOEIC002', 'TOEIC Premier 2024-2025', 'Kaplan', 'Kaplan', 160000, 280000, 35, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic2.jfif', 'Luyện thi TOEIC toàn diện', 'ban_chay'),
(2, 'TOEIC003', 'Longman Preparation Series for TOEIC', 'Pearson', 'Pearson', 140000, 230000, 28, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic3.jfif', 'Sách luyện TOEIC từ cơ bản đến nâng cao', 'co_san');

-- Sách Giao tiếp (loai_sach_id = 3)
INSERT INTO sach (loai_sach_id, ma_sach, ten_sach, tac_gia, nha_xuat_ban, gia_nhap, gia_ban, so_luong_ton, hinh_anh, mo_ta, trang_thai) VALUES
(3, 'GT001', 'English Conversation Made Easy', 'English Learning Press', 'ELP', 80000, 150000, 60, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/giaotiep/tiếp1.jfif', 'Giao tiếp tiếng Anh hàng ngày', 'ban_chay'),
(3, 'GT002', 'Speak English Like an American', 'Amy Gillett', 'Language Success', 90000, 170000, 45, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/giaotiep/tiếp2.jfif', 'Nói tiếng Anh như người Mỹ', 'co_san'),
(3, 'GT003', 'Everyday Conversations in English', 'Oxford University Press', 'Oxford', 100000, 180000, 55, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/giaotiep/tiếp3.jfif', 'Hội thoại tiếng Anh thực tế', 'co_san');

-- ------------------------------------------------------------SÁCH NHẬP VÀO TỪ 1-28
-- ============================================
-- SÁCH IELTS (loai_sach_id = 1) - 28 sản phẩm
-- ============================================
INSERT INTO sach (loai_sach_id, ma_sach, ten_sach, tac_gia, nha_xuat_ban, gia_nhap, gia_ban, so_luong_ton, hinh_anh, mo_ta, trang_thai) VALUES
(1, 'IELTS001', 'Cambridge IELTS 15', 'Cambridge University Press', 'Cambridge', 150000, 250000, 50, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts1.jpeg', 'Đề thi IELTS chính thức từ Cambridge', 'co_san'),
(1, 'IELTS002', 'IELTS Trainer Six Practice Tests', 'Cambridge University Press', 'Cambridge', 180000, 300000, 30, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts2.jfif', '6 bài thi thử IELTS', 'ban_chay'),
(1, 'IELTS003', 'Barron''s IELTS Superpack', 'Barron''s', 'Barron''s', 200000, 350000, 25, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts3.jfif', 'Tổng hợp IELTS toàn diện', 'ban_chay'),
(1, 'IELTS004', 'IELTS Advantage Reading', 'Richard Brown', 'Delta Publishing', 160000, 280000, 35, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts4.jfif', 'Luyện đọc IELTS nâng cao', 'co_san'),
(1, 'IELTS005', 'IELTS Listening Strategies', 'Rachel Mitchell', 'IELTS Academy', 140000, 240000, 40, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts5.jfif', 'Chiến lược luyện nghe IELTS', 'co_san'),
(1, 'IELTS006', 'IELTS Writing Task 2 Masterclass', 'Pauline Cullen', 'Cambridge', 170000, 290000, 28, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts6.jfif', 'Hướng dẫn viết Task 2 IELTS', 'co_san'),
(1, 'IELTS007', 'IELTS Speaking Success', 'Mark Griffiths', 'Oxford', 155000, 260000, 32, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts7.jfif', 'Luyện nói IELTS hiệu quả', 'ban_chay'),
(1, 'IELTS008', 'IELTS Vocabulary Builder', 'Diana Hopkins', 'Pearson', 130000, 220000, 45, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts8.jfif', 'Xây dựng từ vựng IELTS', 'co_san'),
(1, 'IELTS009', 'IELTS Grammar in Use', 'Raymond Murphy', 'Cambridge', 145000, 245000, 38, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts9.jfif', 'Ngữ pháp IELTS thực hành', 'co_san'),
(1, 'IELTS010', 'IELTS Academic Module', 'Sam McCarter', 'Macmillan', 185000, 310000, 22, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts10.jfif', 'IELTS Academic toàn diện', 'co_san'),
(1, 'IELTS011', 'IELTS General Training Guide', 'Louise Hashemi', 'Cambridge', 175000, 295000, 26, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts11.jfif', 'Hướng dẫn IELTS General Training', 'co_san'),
(1, 'IELTS012', 'IELTS Practice Tests Plus', 'Morgan Terry', 'Pearson', 190000, 320000, 20, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts12.jfif', 'Bài thi thử IELTS nâng cao', 'ban_chay'),
(1, 'IELTS013', 'IELTS Target 7.0', 'Jon Wright', 'Delta Publishing', 165000, 275000, 30, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts13.jfif', 'Đạt mục tiêu IELTS 7.0', 'co_san'),
(1, 'IELTS014', 'IELTS Intensive Practice', 'Catherine Matthews', 'Oxford', 150000, 255000, 35, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts14.png', 'Luyện thi IELTS chuyên sâu', 'co_san'),
(1, 'IELTS015', 'IELTS Complete Guide 2024', 'David Recine', 'McGraw-Hill', 195000, 330000, 18, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts15.jfif', 'Hướng dẫn IELTS đầy đủ 2024', 'ban_chay'),
(1, 'IELTS016', 'IELTS Quick Preparation', 'Julia Charles', 'Barron''s', 135000, 230000, 42, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts16.jfif', 'Chuẩn bị IELTS nhanh chóng', 'co_san'),
(1, 'IELTS017', 'IELTS Band 8.0 Secrets', 'Andrew Smith', 'IELTS Academy', 180000, 300000, 24, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts17.jfif', 'Bí quyết đạt IELTS 8.0', 'ban_chay'),
(1, 'IELTS018', 'IELTS Reading Comprehension', 'Sarah Phillips', 'Cambridge', 155000, 265000, 33, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts18.jfif', 'Đọc hiểu IELTS nâng cao', 'co_san'),
(1, 'IELTS019', 'IELTS Listening & Note-taking', 'Michael Brown', 'Pearson', 140000, 240000, 38, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts19.png', 'Nghe và ghi chú IELTS', 'co_san'),
(1, 'IELTS020', 'IELTS Writing Task 1 Academic', 'Anna Taylor', 'Oxford', 160000, 270000, 29, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts20.jfif', 'Viết Task 1 Academic IELTS', 'co_san'),
(1, 'IELTS021', 'IELTS Speaking Part 2 & 3', 'James Wilson', 'Delta Publishing', 150000, 255000, 31, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts21.jfif', 'Luyện nói Part 2 & 3 IELTS', 'co_san'),
(1, 'IELTS025', 'IELTS Essential Words', 'Steven Jenkins', 'Barron''s', 125000, 215000, 48, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts25.jfif', 'Từ vựng thiết yếu IELTS', 'co_san'),
(1, 'IELTS026', 'IELTS Exam Strategies', 'Laura Martinez', 'McGraw-Hill', 170000, 285000, 27, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts26.jfif', 'Chi lược thi IELTS hiệu quả', 'ban_chay'),
(1, 'IELTS027', 'IELTS Academic Writing', 'Robert Davis', 'Cambridge', 165000, 275000, 30, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts27.jfif', 'Viết học thuật IELTS', 'co_san'),
(1, 'IELTS028', 'IELTS General Training Practice', 'Emma Thompson', 'Pearson', 155000, 260000, 34, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts28.jfif', 'Luyện thi IELTS General Training', 'co_san'),
(1, 'IELTS029', 'IELTS Complete Preparation Pack', 'Daniel Lee', 'Oxford', 200000, 340000, 20, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts29.jfif', 'Gói chuẩn bị IELTS toàn diện', 'ban_chay'),
(1, 'IELTS030', 'IELTS Success Formula', 'Jennifer Clark', 'Delta Publishing', 175000, 290000, 25, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/ietls/ielts30.jfif', 'Công thức thành công IELTS', 'co_san');

-- ============================================
-- SÁCH TOEIC (loai_sach_id = 2) - 12 sản phẩm
-- ============================================
INSERT INTO sach (loai_sach_id, ma_sach, ten_sach, tac_gia, nha_xuat_ban, gia_nhap, gia_ban, so_luong_ton, hinh_anh, mo_ta, trang_thai) VALUES
(2, 'TOEIC001', 'ETS TOEIC Reading & Listening', 'ETS', 'ETS', 120000, 200000, 40, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic1.jpg', 'Đề thi TOEIC chính thức từ ETS', 'co_san'),
(2, 'TOEIC002', 'TOEIC Premier 2024-2025', 'Kaplan', 'Kaplan', 160000, 280000, 35, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic2.jfif', 'Luyện thi TOEIC toàn diện', 'ban_chay'),
(2, 'TOEIC003', 'Longman Preparation Series for TOEIC', 'Pearson', 'Pearson', 140000, 230000, 28, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic3.jfif', 'Sách luyện TOEIC từ cơ bản đến nâng cao', 'co_san'),
(2, 'TOEIC004', 'TOEIC Listening & Reading Practice', 'ETS', 'ETS', 130000, 220000, 38, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic4.jfif', 'Luyện nghe đọc TOEIC', 'co_san'),
(2, 'TOEIC005', 'TOEIC Grammar & Vocabulary', 'Bruce Rogers', 'McGraw-Hill', 125000, 210000, 42, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic5.jfif', 'Ngữ pháp và từ vựng TOEIC', 'co_san'),
(2, 'TOEIC006', 'TOEIC Test Preparation Guide', 'Lin Lougheed', 'Barron''s', 150000, 250000, 30, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic6.png', 'Hướng dẫn chuẩn bị thi TOEIC', 'ban_chay'),
(2, 'TOEIC007', 'TOEIC Speaking & Writing', 'ETS', 'ETS', 135000, 225000, 32, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic7.jfif', 'Luyện nói viết TOEIC', 'co_san'),
(2, 'TOEIC008', 'TOEIC Intensive Course', 'Paul Edmunds', 'Oxford', 155000, 260000, 26, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic8.jfif', 'Khóa học TOEIC chuyên sâu', 'co_san'),
(2, 'TOEIC009', 'TOEIC Target Score 900', 'Grant Trew', 'Cambridge', 165000, 275000, 24, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic9.png', 'Đạt mục tiêu TOEIC 900 điểm', 'ban_chay'),
(2, 'TOEIC010', 'TOEIC Practice Tests Volume 1', 'ETS', 'ETS', 140000, 235000, 36, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic10.jfif', 'Bài thi thử TOEIC tập 1', 'co_san'),
(2, 'TOEIC011', 'TOEIC Practice Tests Volume 2', 'ETS', 'ETS', 140000, 235000, 34, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic11.jfif', 'Bài thi thử TOEIC tập 2', 'co_san'),
(2, 'TOEIC012', 'TOEIC Complete Preparation', 'Milada Broukal', 'Pearson', 170000, 285000, 22, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/toeic/toeic12.jfif', 'Chuẩn bị TOEIC toàn diện', 'co_san');

-- ============================================
-- SÁCH GIAO TIẾP (loai_sach_id = 3) - 10 sản phẩm
-- ============================================
INSERT INTO sach (loai_sach_id, ma_sach, ten_sach, tac_gia, nha_xuat_ban, gia_nhap, gia_ban, so_luong_ton, hinh_anh, mo_ta, trang_thai) VALUES
(3, 'GT001', 'English Conversation Made Easy', 'English Learning Press', 'ELP', 80000, 150000, 60, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/giaotiep/tiếp1.jfif', 'Giao tiếp tiếng Anh hàng ngày', 'ban_chay'),
(3, 'GT002', 'Speak English Like an American', 'Amy Gillett', 'Language Success', 90000, 170000, 45, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/giaotiep/tiếp2.jfif', 'Nói tiếng Anh như người Mỹ', 'co_san'),
(3, 'GT003', 'Everyday Conversations in English', 'Oxford University Press', 'Oxford', 100000, 180000, 55, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/giaotiep/tiếp3.jfif', 'Hội thoại tiếng Anh thực tế', 'co_san'),
(3, 'GT004', 'English for Daily Communication', 'Jennifer Seidl', 'Oxford', 85000, 155000, 50, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/giaotiep/tiếp4.png', 'Tiếng Anh giao tiếp hàng ngày', 'ban_chay'),
(3, 'GT005', 'Conversational English Mastery', 'Mark Fletcher', 'Cambridge', 95000, 175000, 42, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/giaotiep/tiếp5.jfif', 'Thành thạo giao tiếp tiếng Anh', 'co_san'),
(3, 'GT006', 'English Speaking Confidence', 'Sarah Adams', 'Pearson', 88000, 160000, 48, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/giaotiep/tiếp6.jfif', 'Tự tin nói tiếng Anh', 'co_san'),
(3, 'GT007', 'Practical English Conversations', 'David Crystal', 'Penguin', 92000, 168000, 44, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/giaotiep/tiếp7.jfif', 'Hội thoại tiếng Anh thực dụng', 'ban_chay'),
(3, 'GT008', 'English Communication Skills', 'Jack C. Richards', 'Cambridge', 98000, 178000, 40, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/giaotiep/tiếp8.jfif', 'Kỹ năng giao tiếp tiếng Anh', 'co_san'),
(3, 'GT009', 'Fluent English Speaking', 'Tom Kenny', 'McGraw-Hill', 105000, 190000, 36, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/giaotiep/tiếp9.jfif', 'Nói tiếng Anh trôi chảy', 'co_san'),
(3, 'GT010', 'English for Social Situations', 'Lucy Hocking', 'Oxford', 90000, 165000, 46, 'D:/NAM4/NTA_CENTER/frontend/src/assets/books/giaotiep/tiếp 10.jfif', 'Tiếng Anh cho các tình huống xã hội', 'co_san');



-- Ví dụ: Update sách IELTS001 MỚI HIỂN THỊ ẢNH
UPDATE sach SET hinh_anh = 'ielts1.jpeg' WHERE ma_sach = 'IELTS001';
UPDATE sach SET hinh_anh = 'ielts2.jfif' WHERE ma_sach = 'IELTS002';
UPDATE sach SET hinh_anh = 'ielts3.jfif' WHERE ma_sach = 'IELTS003';

-- Update sách TOEIC
UPDATE sach SET hinh_anh = 'toeic1.jpg' WHERE ma_sach = 'TOEIC001';
UPDATE sach SET hinh_anh = 'toeic2.jfif' WHERE ma_sach = 'TOEIC002';
UPDATE sach SET hinh_anh = 'toeic3.jfif' WHERE ma_sach = 'TOEIC003';

-- Update sách Giao tiếp
UPDATE sach SET hinh_anh = 'tiếp1.jfif' WHERE ma_sach = 'GT001';
UPDATE sach SET hinh_anh = 'tiếp2.jfif' WHERE ma_sach = 'GT002';
UPDATE sach SET hinh_anh = 'tiếp3.jfif' WHERE ma_sach = 'GT003';

--
-- ============================================
-- UPDATE SÁCH IELTS (28 sản phẩm)
-- ============================================
UPDATE sach SET hinh_anh = 'ielts1.jpeg' WHERE ma_sach = 'IELTS001';
UPDATE sach SET hinh_anh = 'ielts2.jfif' WHERE ma_sach = 'IELTS002';
UPDATE sach SET hinh_anh = 'ielts3.jfif' WHERE ma_sach = 'IELTS003';
UPDATE sach SET hinh_anh = 'ielts4.jfif' WHERE ma_sach = 'IELTS004';
UPDATE sach SET hinh_anh = 'ielts5.jfif' WHERE ma_sach = 'IELTS005';
UPDATE sach SET hinh_anh = 'ielts6.jfif' WHERE ma_sach = 'IELTS006';
UPDATE sach SET hinh_anh = 'ielts7.jfif' WHERE ma_sach = 'IELTS007';
UPDATE sach SET hinh_anh = 'ielts8.jfif' WHERE ma_sach = 'IELTS008';
UPDATE sach SET hinh_anh = 'ielts9.jfif' WHERE ma_sach = 'IELTS009';
UPDATE sach SET hinh_anh = 'ielts10.jfif' WHERE ma_sach = 'IELTS010';
UPDATE sach SET hinh_anh = 'ielts11.jfif' WHERE ma_sach = 'IELTS011';
UPDATE sach SET hinh_anh = 'ielts12.jfif' WHERE ma_sach = 'IELTS012';
UPDATE sach SET hinh_anh = 'ielts13.jfif' WHERE ma_sach = 'IELTS013';
UPDATE sach SET hinh_anh = 'ielts14.png' WHERE ma_sach = 'IELTS014';
UPDATE sach SET hinh_anh = 'ielts15.jfif' WHERE ma_sach = 'IELTS015';
UPDATE sach SET hinh_anh = 'ielts16.jfif' WHERE ma_sach = 'IELTS016';
UPDATE sach SET hinh_anh = 'ielts17.jfif' WHERE ma_sach = 'IELTS017';
UPDATE sach SET hinh_anh = 'ielts18.jfif' WHERE ma_sach = 'IELTS018';
UPDATE sach SET hinh_anh = 'ielts19.png' WHERE ma_sach = 'IELTS019';
UPDATE sach SET hinh_anh = 'ielts20.jfif' WHERE ma_sach = 'IELTS020';
UPDATE sach SET hinh_anh = 'ielts21.jfif' WHERE ma_sach = 'IELTS021';
UPDATE sach SET hinh_anh = 'ielts25.jfif' WHERE ma_sach = 'IELTS025';
UPDATE sach SET hinh_anh = 'ielts26.jfif' WHERE ma_sach = 'IELTS026';
UPDATE sach SET hinh_anh = 'ielts27.jfif' WHERE ma_sach = 'IELTS027';
UPDATE sach SET hinh_anh = 'ielts28.jfif' WHERE ma_sach = 'IELTS028';
UPDATE sach SET hinh_anh = 'ielts29.jfif' WHERE ma_sach = 'IELTS029';
UPDATE sach SET hinh_anh = 'ielts30.jfif' WHERE ma_sach = 'IELTS030';

-- ============================================
-- UPDATE SÁCH TOEIC (12 sản phẩm)
-- ============================================
UPDATE sach SET hinh_anh = 'toeic1.jpg' WHERE ma_sach = 'TOEIC001';
UPDATE sach SET hinh_anh = 'toeic2.jfif' WHERE ma_sach = 'TOEIC002';
UPDATE sach SET hinh_anh = 'toeic3.jfif' WHERE ma_sach = 'TOEIC003';
UPDATE sach SET hinh_anh = 'toeic4.jfif' WHERE ma_sach = 'TOEIC004';
UPDATE sach SET hinh_anh = 'toeic5.jfif' WHERE ma_sach = 'TOEIC005';
UPDATE sach SET hinh_anh = 'toeic6.png' WHERE ma_sach = 'TOEIC006';
UPDATE sach SET hinh_anh = 'toeic7.jfif' WHERE ma_sach = 'TOEIC007';
UPDATE sach SET hinh_anh = 'toeic8.jfif' WHERE ma_sach = 'TOEIC008';
UPDATE sach SET hinh_anh = 'toeic9.png' WHERE ma_sach = 'TOEIC009';
UPDATE sach SET hinh_anh = 'toeic10.jfif' WHERE ma_sach = 'TOEIC010';
UPDATE sach SET hinh_anh = 'toeic11.jfif' WHERE ma_sach = 'TOEIC011';
UPDATE sach SET hinh_anh = 'toeic12.jfif' WHERE ma_sach = 'TOEIC012';

-- ============================================
-- UPDATE SÁCH GIAO TIẾP (10 sản phẩm)
-- ============================================
UPDATE sach SET hinh_anh = 'tiếp1.jfif' WHERE ma_sach = 'GT001';
UPDATE sach SET hinh_anh = 'tiếp2.jfif' WHERE ma_sach = 'GT002';
UPDATE sach SET hinh_anh = 'tiếp3.jfif' WHERE ma_sach = 'GT003';
UPDATE sach SET hinh_anh = 'tiếp4.png' WHERE ma_sach = 'GT004';
UPDATE sach SET hinh_anh = 'tiếp5.jfif' WHERE ma_sach = 'GT005';
UPDATE sach SET hinh_anh = 'tiếp6.jfif' WHERE ma_sach = 'GT006';
UPDATE sach SET hinh_anh = 'tiếp7.jfif' WHERE ma_sach = 'GT007';
UPDATE sach SET hinh_anh = 'tiếp8.jfif' WHERE ma_sach = 'GT008';
UPDATE sach SET hinh_anh = 'tiếp9.jfif' WHERE ma_sach = 'GT009';
UPDATE sach SET hinh_anh = 'tiếp 10.jfif' WHERE ma_sach = 'GT010';




SET SQL_SAFE_UPDATES = 0;
DELETE FROM chi_tiet_don_hang;
DELETE FROM sach;


-- Xem tất cả loại sách
SELECT * FROM loai_sach;

-- Xem tất cả sách với tên loại sách
SELECT s.*, l.ten_loai 
FROM sach s 
JOIN loai_sach l ON s.loai_sach_id = l.id;

-- Đếm số lượng sách theo từng loại
SELECT l.ten_loai, COUNT(s.id) AS so_luong_sach
FROM loai_sach l
LEFT JOIN sach s ON l.id = s.loai_sach_id
GROUP BY l.id, l.ten_loai;



INSERT INTO don_hang (ma_don_hang, tong_tien, trang_thai) VALUES 
('DH1',890000,'da_giao'),('DH2',1280000,'dang_giao'),('DH3',520000,'da_tt'),('DH4',760000,'da_giao'),('DH5',380000,'cho_tt');

INSERT INTO chi_tiet_don_hang (don_hang_id, sach_id, so_luong, gia_sp, thanh_tien) VALUES 
(1,1,2,450000,900000),(1,2,1,380000,380000),(2,1,3,440000,1320000),(3,3,1,520000,520000),(4,4,2,380000,760000);

-- 5. AFFILIATE (3 bảng)
-- 🔥 XÓA DỮ LIỆU CTV CŨ HOÀN TOÀN
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE hoa_hong;
TRUNCATE TABLE rut_tien_ctv;
TRUNCATE TABLE ctv;
SET FOREIGN_KEY_CHECKS = 1;

-- 🔥 INSERT CTV ĐƠN GIẢN - KHÔNG SELF-REFERENCE (5 CTV độc lập)
INSERT INTO ctv (nguoi_dung_id, ctv_cha_id, cap_do, ma_gioi_thieu, tong_downline) VALUES 
(5, NULL, 1, 'CTV001', 0),  -- Nam - Cấp 1
(1, NULL, 1, 'CTV002', 0),  -- Admin - Cấp 1  
(2, NULL, 1, 'CTV003', 0),  -- Lan - Cấp 1
(3, NULL, 1, 'CTV004', 0),  -- Hùng - Cấp 1
(4, NULL, 1, 'CTV005', 0);  -- Mai - Cấp 1

-- 🔥 INSERT HOA_HỒNG (sử dụng ctv_id = 1,2,3,4,5)
INSERT INTO hoa_hong (ctv_id, don_hang_id, ty_le_pham_ram, tien_hoa_hong, cap_do, trang_thai) VALUES 
(1, 1, 10.00, 89000, 1, 'da_tra'),
(2, 2, 5.00, 64000, 1, 'da_tra'),
(3, 3, 10.00, 52000, 1, 'da_tra'),
(4, 4, 3.00, 22800, 1, 'da_tra'),
(5, 5, 5.00, 19000, 1, 'da_tra');

-- 🔥 INSERT RÚT TIỀN CTV
INSERT INTO rut_tien_ctv (ctv_id, so_tien, so_tk_ngan_hang, noi_dung_tt) VALUES 
(1, 250000, '1234567890', 'Rút hoa hồng tháng 3/2026'),
(2, 85000, '0987654321', 'Rút hoa hồng tháng 3/2026'),
(3, 35000, '1122334455', 'Rút hoa hồng tháng 3/2026'),
(4, 45000, '5566778899', 'Rút hoa hồng tháng 2/2026'),
(5, 180000, '1234567890', 'Rút hoa hồng tháng 2/2026');

-- ✅ KIỂM TRA
SELECT '🎉 CTV HOÀN THÀNH 100% - 5 CTV cấp 1!' AS THANH_CONG;
SELECT * FROM ctv ORDER BY id;
SELECT COUNT(*) as tong_hoa_hong FROM hoa_hong;
SELECT COUNT(*) as tong_rut_tien FROM rut_tien_ctv;
-- 6. HỌC PHÍ (5 bảng)
INSERT INTO tu_van_lead (ho_ten, sdt, muc_tieu, trang_thai) VALUES 
('Nguyễn Văn An','0901111222','IELTS 6.5','da_tu_van'),('Trần Thị Bình','0902222333','IELTS 7.0','da_test'),
('Lê Văn Cường','0903333444','Giao tiếp','moi'),('Phạm Thị Dung','0904444555','IELTS 6.0','da_dk_hoc'),('Hoàng Văn Em','0905555666','Pre-IELTS','da_goi');

INSERT INTO hop_dong (ma_hd, hoc_vien_id, khoa_hoc_id, tong_tien) VALUES 
('HD1',4,1,15000000),('HD2',4,2,25000000),('HD3',4,3,35000000),('HD4',1,4,18000000),('HD5',2,1,15000000);

INSERT INTO thanh_toan_hoc_phi (hop_dong_id, hoc_vien_id, so_tien, ky_nop, phuong_thuc, trang_thai, nguoi_nop_id) VALUES 
(1,4,15000000,1,'chuyen_khoan','da_thanh_toan',1),(2,4,12500000,1,'vnpay','da_thanh_toan',1),
(3,4,17500000,1,'momo','da_thanh_toan',1),(4,1,9000000,1,'tien_mat','da_thanh_toan',1),(5,2,5000000,1,'chuyen_khoan','da_thanh_toan',1);

INSERT INTO phieu_thu (ma_phieu, nguoi_nop_id, tong_tien, noi_dung, ngay_thu) VALUES 
('PT001',1,15000000,'Thu HD1','2026-03-01'),('PT002',1,12500000,'Thu HD2','2026-03-02'),
('PT003',1,17500000,'Thu HD3','2026-03-03'),('PT004',1,9000000,'Thu HD4','2026-03-04'),('PT005',1,5000000,'Thu HD5','2026-03-05');

INSERT INTO phieu_chi (ma_phieu, nguoi_nhan_id, tong_tien, noi_dung, ngay_chi) VALUES 
('PC001',3,5000000,'Lương tháng 3','2026-03-18'),('PC002',2,4500000,'Lương tháng 3','2026-03-18'),
('PC003',5,850000,'Hoa hồng','2026-03-18'),('PC004',1,3000000,'Lương Admin','2026-03-18'),('PC005',3,2000000,'Thưởng','2026-03-18');

-- 7. BÀI TẬP (4 bảng)
INSERT INTO bai_tap (lop_hoc_id, giao_vien_id, ten_bai, loai_bai) VALUES 
(1,3,'Speaking Part1','speaking'),(2,3,'Writing Task1','writing'),(1,3,'Reading','homework'),
(2,3,'Speaking Part2','speaking'),(3,3,'Vocabulary','homework');

INSERT INTO nop_bai (bai_tap_id, hoc_vien_id, trang_thai) VALUES 
(1,4,'da_nop'),(2,4,'da_nop'),(3,4,'da_nop'),(4,4,'tre_han'),(1,4,'da_nop');

INSERT INTO diem_so (bai_tap_id, hoc_vien_id, diem, giao_vien_cham_id) VALUES 
(1,4,8.5,3),(2,4,9.0,3),(3,4,8.0,3),(4,4,7.5,3),(1,4,7.0,3);

INSERT INTO thong_ke_diem (lop_hoc_id, hoc_ky, hoc_vien_id, diem_trung_binh) VALUES 
(1,'HK1-2026',4,8.25),(2,'HK1-2026',4,8.00),(1,'HK1-2026',4,7.50),(3,'HK1-2026',4,8.50),(2,'HK1-2026',4,7.80);

-- 8. THÔNG BÁO (3 bảng)
INSERT INTO thong_bao (nguoi_dung_id, tieu_de, noi_dung, loai_tb) VALUES 
(4,'Nhắc nộp bài','Deadline 12/03','bai_tap'),(4,'Xác nhận LOP1','Đã xác nhận LOP1','lop_hoc'),
(5,'Hoa hồng duyệt','250,000đ đã chuyển','hoa_hong'),(2,'Lead mới','KH006 cần tư vấn','tu_van'),(3,'Bài tập mới','2 bài tập LOP002','lop_hoc');

INSERT INTO bao_cao_doanh_thu (thang, nam, doanh_thu_hoc_phi, doanh_thu_sach) VALUES 
(3,2026,77500000,3850000),(2,2026,65000000,2850000),(1,2026,58000000,4200000),(12,2025,95000000,6800000),(11,2025,72000000,5100000);

INSERT INTO backup_log (nguoi_thuc_hien_id, loai_backup, file_path, kich_thuoc, trang_thai) VALUES 
(1,'full','/backup/full_20260318.sql.gz',24576000,'thanh_cong'),
(1,'incremental','/backup/inc_20260318.sql.gz',8765432,'thanh_cong'),
(1,'full','/backup/full_20260317.sql.gz',23894567,'thanh_cong'),
(1,'incremental','/backup/inc_20260317.sql.gz',8543210,'thanh_cong'),
(1,'full','/backup/full_20260316.sql.gz',23145678,'thanh_cong');

-- ✅ KIỂM TRA KẾT QUẢ
SELECT '🎉 HOÀN THÀNH 100%! 30 bảng x 5 dòng = 150 records' AS THANH_CONG;
SELECT COUNT(*) AS tong_nguoi_dung FROM nguoi_dung;
SELECT COUNT(*) AS tong_lop_hoc FROM lop_hoc;
SELECT COUNT(*) AS tong_khoa_hoc FROM khoa_hoc;
SHOW TABLES;



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

select * from khuyen_mai