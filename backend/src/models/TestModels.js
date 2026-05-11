const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const { NguoiDung } = require("./UserModels");

// Import DeThi from ExamModels to avoid duplicate table definition
const { DeThi: DeThiExam } = require("./ExamModels");
const DeThi = DeThiExam;

// Define LichHenTest
const LichHenTest = sequelize.define("LichHenTest", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hoc_vien_id: { type: DataTypes.INTEGER },
  giao_vien_id: { type: DataTypes.INTEGER },
  lead_id: { type: DataTypes.INTEGER },
  de_thi_id: { type: DataTypes.INTEGER },
  dia_diem: { type: DataTypes.STRING(255) },
  thoi_gian: { type: DataTypes.DATE },
  ghi_chu: { type: DataTypes.TEXT },
  trang_thai: { type: DataTypes.ENUM("cho_test","dang_test","hoan_thanh","huy"), defaultValue: "cho_test" },
  ten_phu_huynh: { type: DataTypes.STRING(150) },
  sdt_phu_huynh: { type: DataTypes.STRING(20) },
  quan_he_phu_huynh: { type: DataTypes.STRING(30), defaultValue: "me" },
}, { tableName: "lich_hen_test", timestamps: true, createdAt: "created_at", updatedAt: "updated_at" });

// Define KetQuaLichTest
const KetQuaLichTest = sequelize.define("KetQuaLichTest", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lich_hen_test_id: { type: DataTypes.INTEGER, allowNull: false },
  hoc_vien_id: { type: DataTypes.INTEGER, allowNull: false },
  diem_tong: { type: DataTypes.DECIMAL(4,2) },
  diem_nghe: { type: DataTypes.DECIMAL(4,2) },
  diem_doc: { type: DataTypes.DECIMAL(4,2) },
  diem_noi: { type: DataTypes.DECIMAL(4,2) },
  diem_viet: { type: DataTypes.DECIMAL(4,2) },
  thoi_gian_lam: { type: DataTypes.INTEGER },
  ngay_lam: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  trang_thai: { type: DataTypes.ENUM("chua_lam","dang_lam","hoan_thanh"), defaultValue: "chua_lam" },
  ghi_chu: { type: DataTypes.TEXT },
}, { tableName: "ket_qua_lich_test", timestamps: false });

// Associations
DeThi.belongsTo(NguoiDung, { foreignKey: "created_by", as: "nguoiTao" });
LichHenTest.belongsTo(NguoiDung, { foreignKey: "hoc_vien_id", as: "hocVien" });
LichHenTest.belongsTo(NguoiDung, { foreignKey: "giao_vien_id", as: "giaoVien" });
LichHenTest.belongsTo(DeThi, { foreignKey: "de_thi_id", as: "deThi" });
LichHenTest.hasMany(KetQuaLichTest, { foreignKey: "lich_hen_test_id", as: "ketQuas" });
KetQuaLichTest.belongsTo(LichHenTest, { foreignKey: "lich_hen_test_id", as: "lichHen" });
KetQuaLichTest.belongsTo(NguoiDung, { foreignKey: "hoc_vien_id", as: "hocVien" });

module.exports = { DeThi, LichHenTest, KetQuaLichTest };
