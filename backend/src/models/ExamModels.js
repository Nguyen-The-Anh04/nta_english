const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { NguoiDung } = require("./UserModels");

// ===== DE THI =====
const DeThi = sequelize.define("DeThi", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ten_de: { type: DataTypes.STRING(255), allowNull: false },
  mo_ta: { type: DataTypes.TEXT },
  file_pdf: { type: DataTypes.STRING(500) },
  file_audio: { type: DataTypes.STRING(500) },
  loai: { type: DataTypes.ENUM("ielts","toeic","giao_tiep","khac"), defaultValue: "ielts" },
  loai_de: { type: DataTypes.STRING(50) },
  giao_vien_id: { type: DataTypes.INTEGER },
  thoi_gian_phut: { type: DataTypes.INTEGER, defaultValue: 60 },
  so_cau_nghe: { type: DataTypes.INTEGER, defaultValue: 0 },
  so_cau_doc: { type: DataTypes.INTEGER, defaultValue: 0 },
  trang_thai: { type: DataTypes.ENUM("hoat_dong","tam_dung"), defaultValue: "hoat_dong" },
  created_by: { type: DataTypes.INTEGER },
}, { tableName: "de_thi", timestamps: true, createdAt: "created_at", updatedAt: false });

// ===== CAU HOI =====
const CauHoi = sequelize.define("CauHoi", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  de_thi_id: { type: DataTypes.INTEGER, allowNull: false },
  stt: { type: DataTypes.INTEGER, defaultValue: 1 },
  phan: { type: DataTypes.ENUM("nghe","doc"), defaultValue: "doc" },
  ky_nang: { type: DataTypes.ENUM("nghe","doc","noi","viet") },
  noi_dung: { type: DataTypes.TEXT, allowNull: false },
  lua_chon: { type: DataTypes.JSON },
  dap_an_dung: { type: DataTypes.STRING(10) },
  diem: { type: DataTypes.DECIMAL(3,2), defaultValue: 1.00 },
  hinh_anh: { type: DataTypes.STRING(500) },
}, { tableName: "cau_hoi_de_thi", timestamps: false });

// ===== KET QUA DE THI =====
const KetQuaDeThi = sequelize.define("KetQuaDeThi", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  de_thi_id: { type: DataTypes.INTEGER, allowNull: false },
  hoc_vien_id: { type: DataTypes.INTEGER, allowNull: false },
  lop_hoc_id: { type: DataTypes.INTEGER },
  lich_hen_test_id: { type: DataTypes.INTEGER },
  diem_tong: { type: DataTypes.DECIMAL(4,2) },
  thoi_gian_lam: { type: DataTypes.INTEGER }, // giây
  bat_dau_luc: { type: DataTypes.DATE },
  hoan_thanh_luc: { type: DataTypes.DATE },
  trang_thai: { type: DataTypes.ENUM("chua_lam","dang_lam","hoan_thanh"), defaultValue: "chua_lam" },
}, { tableName: "ket_qua_de_thi", timestamps: false });

// ===== BAI LAM (từng câu trả lời) =====
const BaiLam = sequelize.define("BaiLam", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ket_qua_de_thi_id: { type: DataTypes.INTEGER, allowNull: false },
  cau_hoi_id: { type: DataTypes.INTEGER, allowNull: false },
  dap_an_chon: { type: DataTypes.STRING(10) }, // "A","B","C","D"
  dung_sai: { type: DataTypes.BOOLEAN, defaultValue: false },
  diem_duoc: { type: DataTypes.DECIMAL(3,2), defaultValue: 0 },
}, { tableName: "bai_lam", timestamps: true, createdAt: "created_at", updatedAt: false });

// ===== ASSOCIATIONS =====
DeThi.hasMany(CauHoi, { foreignKey: "de_thi_id", as: "cauHois" });
CauHoi.belongsTo(DeThi, { foreignKey: "de_thi_id", as: "deThi" });

DeThi.hasMany(KetQuaDeThi, { foreignKey: "de_thi_id", as: "ketQuas" });
KetQuaDeThi.belongsTo(DeThi, { foreignKey: "de_thi_id", as: "deThi" });

NguoiDung.hasMany(KetQuaDeThi, { foreignKey: "hoc_vien_id", as: "ketQuaDeThis" });
KetQuaDeThi.belongsTo(NguoiDung, { foreignKey: "hoc_vien_id", as: "hocVien" });

KetQuaDeThi.hasMany(BaiLam, { foreignKey: "ket_qua_de_thi_id", as: "baiLams" });
BaiLam.belongsTo(KetQuaDeThi, { foreignKey: "ket_qua_de_thi_id", as: "ketQua" });

CauHoi.hasMany(BaiLam, { foreignKey: "cau_hoi_id", as: "baiLams" });
BaiLam.belongsTo(CauHoi, { foreignKey: "cau_hoi_id", as: "cauHoi" });

module.exports = { DeThi, CauHoi, KetQuaDeThi, BaiLam };
