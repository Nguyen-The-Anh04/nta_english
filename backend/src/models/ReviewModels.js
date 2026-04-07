const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const DanhGia = sequelize.define(
  "DanhGia",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sach_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nguoi_dung_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ten_nguoi_danh_gia: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    diem_danh_gia: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    noi_dung: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hinh_anh: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    trang_thai: {
      type: DataTypes.ENUM("cho_duyet", "da_duyet", "tu_choi"),
      defaultValue: "cho_duyet",
    },
  },
  {
    tableName: "danh_gia",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Import models for relationships
const { Sach } = require("./OrderModels");

// Relationships
Sach.hasMany(DanhGia, { foreignKey: "sach_id", as: "danhGias" });
DanhGia.belongsTo(Sach, { foreignKey: "sach_id", as: "sach" });

// DanhGia <-> NguoiDung relationship is set up in index.js

module.exports = { DanhGia };
