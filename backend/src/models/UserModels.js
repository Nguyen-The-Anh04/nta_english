const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ChucVu = sequelize.define(
  "ChucVu",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ten_chuc_vu: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "chuc_vu",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

const PhongBan = sequelize.define(
  "PhongBan",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ten_phong: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "phong_ban",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

const NguoiDung = sequelize.define(
  "NguoiDung",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    mat_khau: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ho_ten: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    sdt: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    trang_thai: {
      type: DataTypes.ENUM("hoat_dong", "ngung"),
      defaultValue: "hoat_dong",
    },
  },
  {
    tableName: "nguoi_dung",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

const HoSo = sequelize.define(
  "HoSo",
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
    dia_chi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    so_tk_ngan_hang: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ten_ngan_hang: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    cmnd_cccd: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    ngay_sinh: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    gioi_tinh: {
      type: DataTypes.ENUM("Nam", "Nữ", "Khác"),
      allowNull: true,
    },
  },
  {
    tableName: "ho_so",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

const TokenXacThuc = sequelize.define(
  "TokenXacThuc",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nguoi_dung_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    loai_token: {
      type: DataTypes.ENUM("refresh", "email_verify"),
      defaultValue: "refresh",
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "token_xac_thuc",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

const LichSuDangNhap = sequelize.define(
  "LichSuDangNhap",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nguoi_dung_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "lich_su_dang_nhap",
    timestamps: true,
    createdAt: "thoi_gian",
    updatedAt: false,
  }
);

// ===== RELATIONSHIPS =====
NguoiDung.belongsTo(ChucVu, { foreignKey: "chuc_vu_id", as: "chucVu" });
ChucVu.hasMany(NguoiDung, { foreignKey: "chuc_vu_id", as: "nguoiDungs" });

NguoiDung.belongsTo(PhongBan, { foreignKey: "phong_ban_id", as: "phongBan" });
PhongBan.hasMany(NguoiDung, { foreignKey: "phong_ban_id", as: "nguoiDungs" });

NguoiDung.hasOne(HoSo, { foreignKey: "nguoi_dung_id", as: "hoSo" });
HoSo.belongsTo(NguoiDung, { foreignKey: "nguoi_dung_id", as: "nguoiDung" });

NguoiDung.hasMany(TokenXacThuc, { foreignKey: "nguoi_dung_id", as: "tokens" });
TokenXacThuc.belongsTo(NguoiDung, { foreignKey: "nguoi_dung_id", as: "nguoiDung" });

NguoiDung.hasMany(LichSuDangNhap, { foreignKey: "nguoi_dung_id", as: "lichSuDangNhaps" });
LichSuDangNhap.belongsTo(NguoiDung, { foreignKey: "nguoi_dung_id", as: "nguoiDung" });

module.exports = {
  ChucVu,
  PhongBan,
  NguoiDung,
  HoSo,
  TokenXacThuc,
  LichSuDangNhap,
};