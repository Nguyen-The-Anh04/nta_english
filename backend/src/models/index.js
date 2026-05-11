// =====================================================
// CENTRAL MODEL REGISTRY
// Tất cả associations chỉ khai báo ở đây, KHÔNG khai báo trong file model riêng
// =====================================================

const { NguoiDung, ChucVu, HoSo, TokenXacThuc, LichSuDangNhap } = require("./UserModels");

// LMS Models (dùng cho toàn bộ hệ thống LMS)
const {
  KhoaHoc, PhongHoc, LopHoc, DkLopHoc, LichHoc,
  HopDong, ThanhToanHocPhi,
  DiemDanh, BaiTap, NopBai, DiemSo, DanhGiaGiaoVien,
  PhieuThu, PhieuChi,
} = require("./LMSModels");

// Order / Affiliate Models
const {
  LoaiSach, Sach, DonHang, ChiTietDonHang,
  CTV, HoaHong, RutTienCTV, CommissionProducts,
} = require("./OrderModels");

// CourseModels — chỉ lấy BangCapGV và LichSuLop (các model khác trùng với LMSModels)
const CourseModels = require("./CourseModels");
const BangCapGV = CourseModels.BangCapGV;
const LichSuLop = CourseModels.LichSuLop;
// DKLopHoc từ CourseModels (legacy, courseController dùng)
const DKLopHoc = CourseModels.DKLopHoc;

const { TuVanLead } = require("./TuVanLeadModels");
const { DanhGia } = require("./ReviewModels");
const KhuyenMai = require("./KhuyenMaiModels");
const { KhachHang } = require("./KhachHangModels");

// Test Models
const { DeThi, LichHenTest, KetQuaLichTest } = require("./TestModels");

// =====================================================
// ASSOCIATIONS — khai báo một lần duy nhất
// =====================================================

// ── NguoiDung ↔ LopHoc (giảng viên) ──
NguoiDung.hasMany(LopHoc, { foreignKey: "giao_vien_id", as: "lopHocGiangDay" });
LopHoc.belongsTo(NguoiDung, { foreignKey: "giao_vien_id", as: "giaoVien" });

// ── NguoiDung ↔ DkLopHoc (học viên) ──
NguoiDung.hasMany(DkLopHoc, { foreignKey: "hoc_vien_id", as: "dangKyLops" });
DkLopHoc.belongsTo(NguoiDung, { foreignKey: "hoc_vien_id", as: "hocVien" });

// ── NguoiDung ↔ HopDong ──
NguoiDung.hasMany(HopDong, { foreignKey: "hoc_vien_id", as: "hopDongs" });
HopDong.belongsTo(NguoiDung, { foreignKey: "hoc_vien_id", as: "hocVien" });

// ── NguoiDung ↔ ThanhToanHocPhi ──
NguoiDung.hasMany(ThanhToanHocPhi, { foreignKey: "hoc_vien_id", as: "thanhToanHocPhis" });
ThanhToanHocPhi.belongsTo(NguoiDung, { foreignKey: "hoc_vien_id", as: "hocVien" });
ThanhToanHocPhi.belongsTo(NguoiDung, { foreignKey: "nguoi_nop_id", as: "nguoiNop" });

// ── NguoiDung ↔ BaiTap (giảng viên) ──
NguoiDung.hasMany(BaiTap, { foreignKey: "giao_vien_id", as: "baiTapGiao" });
BaiTap.belongsTo(NguoiDung, { foreignKey: "giao_vien_id", as: "giaoVien" });

// ── NguoiDung ↔ NopBai ──
NguoiDung.hasMany(NopBai, { foreignKey: "hoc_vien_id", as: "nopBais" });
NopBai.belongsTo(NguoiDung, { foreignKey: "hoc_vien_id", as: "hocVien" });

// ── NguoiDung ↔ DiemSo ──
NguoiDung.hasMany(DiemSo, { foreignKey: "hoc_vien_id", as: "diemSos" });
DiemSo.belongsTo(NguoiDung, { foreignKey: "hoc_vien_id", as: "hocVien" });
DiemSo.belongsTo(NguoiDung, { foreignKey: "giao_vien_cham_id", as: "giaoVienCham" });

// ── NguoiDung ↔ DanhGiaGiaoVien ──
NguoiDung.hasMany(DanhGiaGiaoVien, { foreignKey: "giao_vien_id", as: "danhGiasNhan" });
NguoiDung.hasMany(DanhGiaGiaoVien, { foreignKey: "hoc_vien_id", as: "danhGiasGui" });
DanhGiaGiaoVien.belongsTo(NguoiDung, { foreignKey: "giao_vien_id", as: "giaoVien" });
DanhGiaGiaoVien.belongsTo(NguoiDung, { foreignKey: "hoc_vien_id", as: "hocVien" });

// ── NguoiDung ↔ PhieuThu / PhieuChi ──
PhieuThu.belongsTo(NguoiDung, { foreignKey: "nguoi_nop_id", as: "nguoiNop" });
PhieuChi.belongsTo(NguoiDung, { foreignKey: "nguoi_nhan_id", as: "nguoiNhan" });
PhieuChi.belongsTo(NguoiDung, { foreignKey: "nguoi_duyet_id", as: "nguoiDuyet" });

// ── NguoiDung ↔ DonHang ──
DonHang.belongsTo(NguoiDung, { foreignKey: "nguoi_dung_id", as: "nguoiMua" });
NguoiDung.hasMany(DonHang, { foreignKey: "nguoi_dung_id", as: "donHangs" });
DonHang.belongsTo(NguoiDung, { foreignKey: "ctv_id", as: "nguoiCTV" });
NguoiDung.hasMany(DonHang, { foreignKey: "ctv_id", as: "donHangsCTV" });

// ── NguoiDung ↔ CTV ──
CTV.belongsTo(NguoiDung, { foreignKey: "nguoi_dung_id", as: "nguoiDung" });
NguoiDung.hasOne(CTV, { foreignKey: "nguoi_dung_id", as: "ctvProfile" });

// ── NguoiDung ↔ DanhGia (review sách) ──
NguoiDung.hasMany(DanhGia, { foreignKey: "nguoi_dung_id", as: "danhGias" });
DanhGia.belongsTo(NguoiDung, { foreignKey: "nguoi_dung_id", as: "nguoiDung" });

// ── NguoiDung ↔ TuVanLead ──
TuVanLead.belongsTo(NguoiDung, { foreignKey: "nguoi_phan_cong_id", as: "nguoiPhanCong" });
NguoiDung.hasMany(TuVanLead, { foreignKey: "nguoi_phan_cong_id", as: "tuVanLeads" });

// ── BangCapGV / LichSuLop ↔ NguoiDung ──
if (BangCapGV) {
  NguoiDung.hasMany(BangCapGV, { foreignKey: "giao_vien_id", as: "bangCaps" });
  BangCapGV.belongsTo(NguoiDung, { foreignKey: "giao_vien_id", as: "giaoVien" });
}
if (LichSuLop) {
  LichSuLop.belongsTo(NguoiDung, { foreignKey: "nguoi_thuc_hien_id", as: "nguoiThucHien" });
}

// ── KhachHang ↔ NguoiDung (nhân viên phụ trách) ──
if (KhachHang) {
  KhachHang.belongsTo(NguoiDung, { foreignKey: "nhan_vien_id", as: "nhanVien" });
  NguoiDung.hasMany(KhachHang, { foreignKey: "nhan_vien_id", as: "khachHangs" });
}

// =====================================================
// EXPORTS
// =====================================================
module.exports = {
  // User
  NguoiDung, ChucVu, HoSo, TokenXacThuc, LichSuDangNhap,
  // LMS
  KhoaHoc, PhongHoc, LopHoc, DkLopHoc, LichHoc,
  HopDong, ThanhToanHocPhi,
  DiemDanh, BaiTap, NopBai, DiemSo, DanhGiaGiaoVien,
  PhieuThu, PhieuChi,
  // Backward compat (courseController dùng DKLopHoc, BangCapGV, LichSuLop)
  DKLopHoc, BangCapGV, LichSuLop,
  // Order / Affiliate
  LoaiSach, Sach, DonHang, ChiTietDonHang,
  CTV, HoaHong, RutTienCTV, CommissionProducts,
  // Other
  TuVanLead, DanhGia, KhuyenMai, KhachHang,
  // Test
  DeThi, LichHenTest, KetQuaLichTest,
};
