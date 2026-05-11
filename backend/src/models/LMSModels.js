const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
// NOTE: Do NOT import NguoiDung here - use string-based associations to avoid circular dependency
// Relationships will be set up in index.js after all models are loaded

// ===== KHOA HOC =====
const KhoaHoc = sequelize.define("KhoaHoc", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ma_khoa: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  ten_khoa: { type: DataTypes.STRING(255), allowNull: false },
  mo_ta: { type: DataTypes.TEXT },
  hoc_phi: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  thoi_gian_thang: { type: DataTypes.INTEGER, defaultValue: 3 },
  si_so_toi_da: { type: DataTypes.INTEGER, defaultValue: 15 },
  trang_thai: { type: DataTypes.ENUM("dang_mo", "tam_dung", "dong"), defaultValue: "dang_mo" },
}, { tableName: "khoa_hoc", timestamps: true, createdAt: "created_at", updatedAt: false });

// ===== PHONG HOC =====
const PhongHoc = sequelize.define("PhongHoc", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ma_phong: { type: DataTypes.STRING(10), allowNull: false, unique: true },
  suc_chua: { type: DataTypes.INTEGER, defaultValue: 20 },
  thiet_bi: { type: DataTypes.TEXT },
  trang_thai: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: "phong_hoc", timestamps: true, createdAt: "created_at", updatedAt: false });

// ===== LOP HOC =====
const LopHoc = sequelize.define("LopHoc", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ma_lop: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  khoa_hoc_id: { type: DataTypes.INTEGER, allowNull: false },
  giao_vien_id: { type: DataTypes.INTEGER, allowNull: false },
  phong_hoc_id: { type: DataTypes.INTEGER },
  ngay_bat_dau: { type: DataTypes.DATEONLY },
  ngay_ket_thuc: { type: DataTypes.DATEONLY },
  si_so_hien_tai: { type: DataTypes.INTEGER, defaultValue: 0 },
  si_so_toi_da: { type: DataTypes.INTEGER, defaultValue: 15 },
  so_buoi_tong:   { type: DataTypes.INTEGER, defaultValue: 0 },
  so_buoi_da_hoc: { type: DataTypes.INTEGER, defaultValue: 0 },
  hoc_phi:  { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  hinh_anh: { type: DataTypes.STRING(500) },
  trang_thai: { type: DataTypes.ENUM("dang_lap", "dang_dien_ra", "ket_thuc", "huy"), defaultValue: "dang_lap" },
}, { tableName: "lop_hoc", timestamps: true, createdAt: "created_at", updatedAt: false });

// ===== DANG KY LOP HOC =====
const DkLopHoc = sequelize.define("DkLopHoc", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hoc_vien_id: { type: DataTypes.INTEGER, allowNull: false },
  lop_hoc_id: { type: DataTypes.INTEGER, allowNull: false },
  trang_thai: { type: DataTypes.ENUM("cho_xac_nhan", "da_xac_nhan", "da_huy", "hoan_thanh"), defaultValue: "cho_xac_nhan" },
  ghi_chu: { type: DataTypes.TEXT },
}, { tableName: "dk_lop_hoc", timestamps: true, createdAt: "ngay_dk", updatedAt: false });

// ===== LICH HOC =====
const LichHoc = sequelize.define("LichHoc", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lop_hoc_id: { type: DataTypes.INTEGER, allowNull: false },
  thu_trong_tuan: { type: DataTypes.ENUM("Thu2","Thu3","Thu4","Thu5","Thu6","Thu7","CNhat") },
  gio_bat_dau: { type: DataTypes.TIME },
  gio_ket_thuc: { type: DataTypes.TIME },
}, { tableName: "lich_hoc", timestamps: false });

// ===== HOP DONG =====
const HopDong = sequelize.define("HopDong", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ma_hd: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  hoc_vien_id: { type: DataTypes.INTEGER, allowNull: false },
  khoa_hoc_id: { type: DataTypes.INTEGER, allowNull: false },
  tong_tien: { type: DataTypes.DECIMAL(12, 0), allowNull: false },
  da_tra:    { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  con_no:    { type: DataTypes.DECIMAL(12, 0), defaultValue: 0 },
  so_ky_nop: { type: DataTypes.INTEGER, defaultValue: 1 },
  trang_thai: { type: DataTypes.ENUM("hoat_dong", "hoan_thanh", "huy"), defaultValue: "hoat_dong" },
  ngay_ky:    { type: DataTypes.DATEONLY },
  han_ky_cuoi:{ type: DataTypes.DATEONLY },
  co_cam_ket:      { type: DataTypes.BOOLEAN, defaultValue: false },
  so_khoa_dang_ky: { type: DataTypes.INTEGER, defaultValue: 1 },
  ghi_chu: { type: DataTypes.TEXT },
}, { tableName: "hop_dong", timestamps: true, createdAt: "created_at", updatedAt: false });

// ===== THANH TOAN HOC PHI =====
const ThanhToanHocPhi = sequelize.define("ThanhToanHocPhi", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hop_dong_id: { type: DataTypes.INTEGER, allowNull: false },
  hoc_vien_id: { type: DataTypes.INTEGER, allowNull: false },
  so_tien: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  ky_nop: { type: DataTypes.INTEGER },
  phuong_thuc: { type: DataTypes.ENUM("tien_mat", "vnpay", "momo", "chuyen_khoan") },
  ma_giao_dich: { type: DataTypes.STRING(100) },
  trang_thai: { type: DataTypes.ENUM("cho_xac_nhan", "da_thanh_toan", "that_bai"), defaultValue: "cho_xac_nhan" },
  ngay_tt: { type: DataTypes.DATE },
  nguoi_nop_id: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: "thanh_toan_hoc_phi", timestamps: true, createdAt: "created_at", updatedAt: false });

// ===== RELATIONSHIPS =====
// Use string-based associations to avoid circular dependency
KhoaHoc.hasMany(LopHoc, { foreignKey: "khoa_hoc_id", as: "lopHocs" });
LopHoc.belongsTo(KhoaHoc, { foreignKey: "khoa_hoc_id", as: "khoaHoc" });

PhongHoc.hasMany(LopHoc, { foreignKey: "phong_hoc_id", as: "lopHocs" });
LopHoc.belongsTo(PhongHoc, { foreignKey: "phong_hoc_id", as: "phongHoc" });

// References to NguoiDung (teacher) - will be set in index.js
// LopHoc.belongsTo("NguoiDung", { foreignKey: "giao_vien_id", as: "giaoVien" });

LopHoc.hasMany(DkLopHoc, { foreignKey: "lop_hoc_id", as: "dangKys" });
DkLopHoc.belongsTo(LopHoc, { foreignKey: "lop_hoc_id", as: "lopHoc" });

// DkLopHoc.belongsTo("NguoiDung", { foreignKey: "hoc_vien_id", as: "hocVien" });

LopHoc.hasMany(LichHoc, { foreignKey: "lop_hoc_id", as: "lichHocs" });
LichHoc.belongsTo(LopHoc, { foreignKey: "lop_hoc_id", as: "lopHoc" });

// HopDong.belongsTo("NguoiDung", { foreignKey: "hoc_vien_id", as: "hocVien" });

KhoaHoc.hasMany(HopDong, { foreignKey: "khoa_hoc_id", as: "hopDongs" });
HopDong.belongsTo(KhoaHoc, { foreignKey: "khoa_hoc_id", as: "khoaHoc" });

HopDong.hasMany(ThanhToanHocPhi, { foreignKey: "hop_dong_id", as: "thanhToans" });
ThanhToanHocPhi.belongsTo(HopDong, { foreignKey: "hop_dong_id", as: "hopDong" });

// ThanhToanHocPhi references will be set in index.js

// Models moved to end of file after all definitions// ===== DIEM DANH =====
const DiemDanh = sequelize.define("DiemDanh", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  dk_lop_hoc_id: { type: DataTypes.INTEGER, allowNull: false },
  lich_hoc_id: { type: DataTypes.INTEGER },
  ngay: { type: DataTypes.DATEONLY, allowNull: false },
  trang_thai: { type: DataTypes.ENUM("co_mat", "vang_mat", "tre"), defaultValue: "co_mat" },
  ghi_chu: { type: DataTypes.TEXT },
}, { tableName: "diem_danh", timestamps: false });

// ===== BAI TAP =====
const BaiTap = sequelize.define("BaiTap", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lop_hoc_id: { type: DataTypes.INTEGER, allowNull: false },
  giao_vien_id: { type: DataTypes.INTEGER, allowNull: false },
  ten_bai: { type: DataTypes.STRING(255), allowNull: false },
  noi_dung: { type: DataTypes.TEXT },
  file_dinh_kem: { type: DataTypes.STRING(500) },
  loai_bai: { type: DataTypes.ENUM("speaking", "writing", "homework"), defaultValue: "homework" },
  han_nop: { type: DataTypes.DATE },
  trang_thai: { type: DataTypes.ENUM("dang_mo", "het_han", "da_dong"), defaultValue: "dang_mo" },
}, { tableName: "bai_tap", timestamps: true, createdAt: "created_at", updatedAt: false });

// ===== NOP BAI =====
const NopBai = sequelize.define("NopBai", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bai_tap_id: { type: DataTypes.INTEGER, allowNull: false },
  hoc_vien_id: { type: DataTypes.INTEGER, allowNull: false },
  file_nop: { type: DataTypes.STRING(500) },
  ghi_chu: { type: DataTypes.TEXT },
  trang_thai: { type: DataTypes.ENUM("da_nop", "chua_nop", "tre_han"), defaultValue: "da_nop" },
}, { tableName: "nop_bai", timestamps: true, createdAt: "thoi_gian_nop", updatedAt: false });

// ===== DIEM SO =====
const DiemSo = sequelize.define("DiemSo", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nop_bai_id: { type: DataTypes.INTEGER },
  bai_tap_id: { type: DataTypes.INTEGER, allowNull: false },
  hoc_vien_id: { type: DataTypes.INTEGER, allowNull: false },
  diem: { type: DataTypes.DECIMAL(4, 2) },
  band_score: { type: DataTypes.DECIMAL(3, 1) },
  nhan_xet: { type: DataTypes.TEXT },
  giao_vien_cham_id: { type: DataTypes.INTEGER, allowNull: false },
  ngay_cham: { type: DataTypes.DATE },
}, { tableName: "diem_so", timestamps: false });

// ===== DANH GIA GIAO VIEN =====
const DanhGiaGiaoVien = sequelize.define("DanhGiaGiaoVien", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hoc_vien_id: { type: DataTypes.INTEGER, allowNull: false },
  giao_vien_id: { type: DataTypes.INTEGER, allowNull: false },
  lop_hoc_id: { type: DataTypes.INTEGER, allowNull: false },
  buoi_hoc_ngay: { type: DataTypes.DATEONLY, allowNull: false },
  diem_giang_day: { type: DataTypes.TINYINT },
  diem_thai_do: { type: DataTypes.TINYINT },
  nhan_xet: { type: DataTypes.TEXT },
}, { tableName: "danh_gia_giao_vien", timestamps: true, createdAt: "created_at", updatedAt: false });

// ===== RELATIONSHIPS module 2 =====
// LMS models internal relationships only
DkLopHoc.hasMany(DiemDanh, { foreignKey: "dk_lop_hoc_id", as: "diemDanhs" });
DiemDanh.belongsTo(DkLopHoc, { foreignKey: "dk_lop_hoc_id", as: "dangKy" });

LichHoc.hasMany(DiemDanh, { foreignKey: "lich_hoc_id", as: "diemDanhs" });
DiemDanh.belongsTo(LichHoc, { foreignKey: "lich_hoc_id", as: "lichHoc" });

LopHoc.hasMany(BaiTap, { foreignKey: "lop_hoc_id", as: "baiTaps" });
BaiTap.belongsTo(LopHoc, { foreignKey: "lop_hoc_id", as: "lopHoc" });

// BaiTap references will be set in index.js

BaiTap.hasMany(NopBai, { foreignKey: "bai_tap_id", as: "nopBais" });
NopBai.belongsTo(BaiTap, { foreignKey: "bai_tap_id", as: "baiTap" });

// NopBai references will be set in index.js

NopBai.hasOne(DiemSo, { foreignKey: "nop_bai_id", as: "diemSo" });
DiemSo.belongsTo(NopBai, { foreignKey: "nop_bai_id", as: "nopBai" });

BaiTap.hasMany(DiemSo, { foreignKey: "bai_tap_id", as: "diemSos" });
DiemSo.belongsTo(BaiTap, { foreignKey: "bai_tap_id", as: "baiTap" });

// DiemSo references will be set in index.js

// DanhGiaGiaoVien references will be set in index.js

LopHoc.hasMany(DanhGiaGiaoVien, { foreignKey: "lop_hoc_id", as: "danhGias" });
DanhGiaGiaoVien.belongsTo(LopHoc, { foreignKey: "lop_hoc_id", as: "lopHoc" });

// ===== PHIEU THU =====
const PhieuThu = sequelize.define("PhieuThu", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ma_phieu: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  hop_dong_id: { type: DataTypes.INTEGER },
  nguoi_nop_id: { type: DataTypes.INTEGER, allowNull: false },
  tong_tien: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  noi_dung: { type: DataTypes.TEXT },
  phuong_thuc: { type: DataTypes.STRING(20), defaultValue: "tien_mat" },
  ngay_thu: { type: DataTypes.DATEONLY, allowNull: false },
  loai_thu: { type: DataTypes.STRING(50) },
}, { tableName: "phieu_thu", timestamps: true, createdAt: "created_at", updatedAt: false });

// ===== PHIEU CHI =====
const PhieuChi = sequelize.define("PhieuChi", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ma_phieu: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  nguoi_nhan_id: { type: DataTypes.INTEGER },
  tong_tien: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  noi_dung: { type: DataTypes.TEXT },
  loai_chi: { type: DataTypes.STRING(50), defaultValue: "khac" },
  ngay_chi: { type: DataTypes.DATEONLY, allowNull: false },
  nguoi_duyet_id: { type: DataTypes.INTEGER },
}, { tableName: "phieu_chi", timestamps: true, createdAt: "created_at", updatedAt: false });

PhieuThu.belongsTo(HopDong, { foreignKey: "hop_dong_id", as: "hopDong" });
// PhieuChi references will be set in index.js

// ===== PHU HUYNH =====
const { NguoiDung } = require("./UserModels");
const PhuHuynh = sequelize.define("PhuHuynh", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hoc_vien_id: { type: DataTypes.INTEGER },
  ho_ten: { type: DataTypes.STRING(150), allowNull: false },
  sdt: { type: DataTypes.STRING(20) },
  email: { type: DataTypes.STRING(150) },
  quan_he: {
    type: DataTypes.ENUM("bo","me","ong","ba","anh","chi","nguoi_giam_ho"),
    defaultValue: "me",
  },
  la_tai_khoan_chinh: { type: DataTypes.BOOLEAN, defaultValue: false },
  nguoi_dung_id: { type: DataTypes.INTEGER },
  ghi_chu: { type: DataTypes.TEXT },
}, { tableName: "phu_huynh", timestamps: true, createdAt: "created_at", updatedAt: false });

PhuHuynh.belongsTo(NguoiDung, { foreignKey: "hoc_vien_id", as: "hocVien" });
NguoiDung.hasMany(PhuHuynh, { foreignKey: "hoc_vien_id", as: "phuHuynhs" });
PhuHuynh.belongsTo(NguoiDung, { foreignKey: "nguoi_dung_id", as: "taiKhoan" });

module.exports = {
  KhoaHoc, PhongHoc, LopHoc, DkLopHoc, LichHoc, HopDong, ThanhToanHocPhi,
  DiemDanh, BaiTap, NopBai, DiemSo, DanhGiaGiaoVien,
  PhieuThu, PhieuChi, PhuHuynh,
};
