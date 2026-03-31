const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const KhuyenMai = sequelize.define(
  "KhuyenMai",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ten_khoa: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    loai_khoa: {
      type: DataTypes.ENUM("giam_phan_tram", "giam_tien", "mien_phi_van_chuyen", "mua_x_tang_y"),
      allowNull: false,
    },
    gia_tri: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Phần trăm hoặc số tiền giảm",
    },
    dieu_kien: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: "Điều kiện áp dụng (số lượng sản phẩm hoặc tổng tiền)",
    },
    loai_dieu_kien: {
      type: DataTypes.ENUM("so_luong", "tong_tien"),
      allowNull: true,
    },
    ma_khoa: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      comment: "Mã khuyến mại (nếu có)",
    },
    ngay_bat_dau: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ngay_ket_thuc: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    trang_thai: {
      type: DataTypes.ENUM("hoat_dong", "tam_dung", "het_han"),
      defaultValue: "hoat_dong",
    },
    ap_dung_cho: {
      type: DataTypes.ENUM("tat_ca", "danh_muc", "san_pham"),
      defaultValue: "tat_ca",
      comment: "Áp dụng cho tất cả, danh mục hoặc sản phẩm cụ thể",
    },
    danh_muc_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID danh mục nếu áp dụng cho danh mục",
    },
    san_pham_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "ID sản phẩm nếu áp dụng cho sản phẩm cụ thể",
    },
  },
  {
    tableName: "khuyen_mai",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = KhuyenMai;
