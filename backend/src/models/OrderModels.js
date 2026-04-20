const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LoaiSach = sequelize.define(
  "LoaiSach",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ten_loai: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "loai_sach",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

const Sach = sequelize.define(
  "Sach",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    loai_sach_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ma_sach: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    ten_sach: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tac_gia: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    nha_xuat_ban: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    gia_nhap: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    gia_ban: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    so_luong_ton: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    hinh_anh: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    trang_thai: {
      type: DataTypes.ENUM("ban_chay", "co_san", "het_hang"),
      defaultValue: "co_san",
    },
  },
  {
    tableName: "sach",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

const DonHang = sequelize.define(
  "DonHang",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ma_don_hang: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    nguoi_dung_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ctv_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tong_tien: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tong_tien_goc: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    giam_gia: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
    },
    khuyen_mai_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    trang_thai: {
      type: DataTypes.ENUM("cho_tt", "da_tt", "dang_giao", "da_giao", "da_huy"),
      defaultValue: "cho_tt",
    },
    phuong_thuc_tt: {
      type: DataTypes.ENUM("cod", "vnpay", "momo", "chuyen_khoan"),
      defaultValue: "cod",
    },
    dia_chi_giao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "don_hang",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

const ChiTietDonHang = sequelize.define(
  "ChiTietDonHang",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    don_hang_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sach_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    so_luong: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gia_sp: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    thanh_tien: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    tableName: "chi_tiet_don_hang",
    timestamps: true,
    createdAt: false,
    updatedAt: false,
  }
);

// ===== AFFILIATE MODELS =====
const CTV = sequelize.define(
  "CTV",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nguoi_dung_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    ctv_cha_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cap_do: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 3,
      },
    },
    ma_gioi_thieu: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    tong_downline: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tong_hoa_hong: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
  },
  {
    tableName: "ctv",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

const HoaHong = sequelize.define(
  "HoaHong",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ctv_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    don_hang_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ty_le_pham_ram: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    tien_hoa_hong: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cap_do: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 3,
      },
    },
    trang_thai: {
      type: DataTypes.ENUM("cho_xac_nhan", "da_tra", "da_huy"),
      defaultValue: "cho_xac_nhan",
    },
  },
  {
    tableName: "hoa_hong",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

const RutTienCTV = sequelize.define(
  "RutTienCTV",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ctv_id: { type: DataTypes.INTEGER, allowNull: false },
    so_tien: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    phi_rut: { type: DataTypes.DECIMAL(10, 2), defaultValue: 1000 },
    so_tk_ngan_hang: { type: DataTypes.STRING(50), allowNull: true },
    ten_ngan_hang: { type: DataTypes.STRING(100), allowNull: true },
    ten_chu_tk: { type: DataTypes.STRING(100), allowNull: true },
    phuong_thuc: { type: DataTypes.ENUM("bank", "momo"), defaultValue: "bank" },
    noi_dung_tt: { type: DataTypes.STRING(255), allowNull: true },
    trang_thai: {
      type: DataTypes.ENUM("cho_duyet", "da_duyet", "da_tu_choi"),
      defaultValue: "cho_duyet",
    },
    ngay_duyet: { type: DataTypes.DATE, allowNull: true },
    ghi_chu: { type: DataTypes.TEXT, allowNull: true },
    ma_giao_dich: { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    tableName: "rut_tien_ctv",
    timestamps: true,
    createdAt: "ngay_yeu_cau",
    updatedAt: false,
  }
);

// Import NguoiDung để tạo relationships
const { NguoiDung } = require("./UserModels");

// ===== RELATIONSHIPS =====
// NOTE: Relationships với NguoiDung được khai báo trong index.js để tránh trùng alias
LoaiSach.hasMany(Sach, { foreignKey: "loai_sach_id", as: "saches" });
Sach.belongsTo(LoaiSach, { foreignKey: "loai_sach_id", as: "loaiSach" });

DonHang.hasMany(ChiTietDonHang, { foreignKey: "don_hang_id", as: "chiTiets" });
ChiTietDonHang.belongsTo(DonHang, { foreignKey: "don_hang_id", as: "donHang" });

Sach.hasMany(ChiTietDonHang, { foreignKey: "sach_id", as: "chiTiets" });
ChiTietDonHang.belongsTo(Sach, { foreignKey: "sach_id", as: "sach" });

// Affiliate relationships (không liên quan NguoiDung)
CTV.hasMany(CTV, { foreignKey: "ctv_cha_id", as: "downlines" });
CTV.belongsTo(CTV, { foreignKey: "ctv_cha_id", as: "cha" });

CTV.hasMany(HoaHong, { foreignKey: "ctv_id", as: "hoaHongs" });
HoaHong.belongsTo(CTV, { foreignKey: "ctv_id", as: "ctv" });

DonHang.hasMany(HoaHong, { foreignKey: "don_hang_id", as: "hoaHongs" });
HoaHong.belongsTo(DonHang, { foreignKey: "don_hang_id", as: "donHang" });

CTV.hasMany(RutTienCTV, { foreignKey: "ctv_id", as: "rutTiens" });
RutTienCTV.belongsTo(CTV, { foreignKey: "ctv_id", as: "ctv" });

const CommissionProducts = sequelize.define(
  "CommissionProducts",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    san_pham_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    f1_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 10.00,
    },
    f2_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 5.00,
    },
    f3_percent: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 2.00,
    },
    trang_thai: {
      type: DataTypes.ENUM("hoat_dong", "tam_dung"),
      defaultValue: "hoat_dong",
    },
  },
  {
    tableName: "commission_products",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Relationships for CommissionProducts
CommissionProducts.belongsTo(Sach, { foreignKey: "san_pham_id", as: "sanPham" });
Sach.hasMany(CommissionProducts, { foreignKey: "san_pham_id", as: "commissionProducts" });

module.exports = {
  LoaiSach,
  Sach,
  DonHang,
  ChiTietDonHang,
  CTV,
  HoaHong,
  RutTienCTV,
  CommissionProducts,
};