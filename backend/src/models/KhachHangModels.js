const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const KhachHang = sequelize.define(
  "KhachHang",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ma_khach_hang: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    ten_khach_hang: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    so_dien_thoai: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    dia_chi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nguon_khach: {
      type: DataTypes.ENUM("landing_page", "fb_ads", "zalo_oa", "walkin", "gioi_thieu", "khac"),
      defaultValue: "landing_page",
    },
    trang_thai: {
      type: DataTypes.ENUM("moi", "cho_xac_nhan", "da_mua", "huy"),
      defaultValue: "moi",
    },
    nhan_vien_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "khach_hang",
    timestamps: true,
    createdAt: "ngay_tao",
    updatedAt: "updated_at",
  }
);

// Relationships will be defined in index.js
// KhachHang.belongsTo(NguoiDung, { foreignKey: "nhan_vien_id", as: "nhanVien" });
// NguoiDung.hasMany(KhachHang, { foreignKey: "nhan_vien_id", as: "khachHangs" });

module.exports = { KhachHang };