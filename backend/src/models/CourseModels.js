const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const KhoaHoc = sequelize.define(
  "KhoaHoc",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ma_khoa: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    ten_khoa: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mo_ta: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hoc_phi: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    thoi_gian_thang: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
    si_so_toi_da: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
    },
    trang_thai: {
      type: DataTypes.ENUM("dang_mo", "tam_dung", "dong"),
      defaultValue: "dang_mo",
    },
  },
  {
    tableName: "khoa_hoc",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

const PhongHoc = sequelize.define(
  "PhongHoc",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ma_phong: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    suc_chua: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
    },
    thiet_bi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    trang_thai: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "phong_hoc",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

const LopHoc = sequelize.define(
  "LopHoc",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ma_lop: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    khoa_hoc_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    giao_vien_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    phong_hoc_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ngay_bat_dau: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ngay_ket_thuc: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    si_so_hien_tai: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    trang_thai: {
      type: DataTypes.ENUM("dang_lap", "dang_dien_ra", "ket_thuc", "huy"),
      defaultValue: "dang_lap",
    },
  },
  {
    tableName: "lop_hoc",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

const DKLopHoc = sequelize.define(
  "DKLopHoc",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    hoc_vien_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lop_hoc_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    trang_thai: {
      type: DataTypes.ENUM("cho_xac_nhan", "da_xac_nhan", "da_huy", "hoan_thanh"),
      defaultValue: "cho_xac_nhan",
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "dk_lop_hoc",
    timestamps: true,
    createdAt: "ngay_dk",
    updatedAt: false,
  }
);

const LichHoc = sequelize.define(
  "LichHoc",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    lop_hoc_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    thu_trong_tuan: {
      type: DataTypes.ENUM("Thu2", "Thu3", "Thu4", "Thu5", "Thu6", "Thu7", "CNhat"),
      allowNull: true,
    },
    gio_bat_dau: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    gio_ket_thuc: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  },
  {
    tableName: "lich_hoc",
    timestamps: true,
    createdAt: false,
    updatedAt: false,
  }
);

const DiemDanh = sequelize.define(
  "DiemDanh",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dk_lop_hoc_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lich_hoc_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    ngay: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    trang_thai: {
      type: DataTypes.ENUM("co_mat", "vang_mat", "tre"),
      defaultValue: "co_mat",
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "diem_danh",
    timestamps: true,
    createdAt: false,
    updatedAt: false,
  }
);

const BangCapGV = sequelize.define(
  "BangCapGV",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    giao_vien_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ten_bang_cap: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    nam_tot_nghiep: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    co_so: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "bang_cap_gv",
    timestamps: true,
    createdAt: false,
    updatedAt: false,
  }
);

const LichSuLop = sequelize.define(
  "LichSuLop",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    lop_hoc_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hanh_dong: {
      type: DataTypes.ENUM("tao_lop", "cap_nhat", "huy_lop"),
      allowNull: false,
    },
    nguoi_thuc_hien_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chi_tiet: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "lich_su_lop",
    timestamps: true,
    createdAt: "thoi_gian",
    updatedAt: false,
  }
);

// ===== RELATIONSHIPS =====
// NOTE: Cross-model relationships with NguoiDung are set up in index.js to avoid circular dependency
KhoaHoc.hasMany(LopHoc, { foreignKey: "khoa_hoc_id", as: "lopHocs" });
LopHoc.belongsTo(KhoaHoc, { foreignKey: "khoa_hoc_id", as: "khoaHoc" });

LopHoc.belongsTo(PhongHoc, { foreignKey: "phong_hoc_id", as: "phongHoc" });
PhongHoc.hasMany(LopHoc, { foreignKey: "phong_hoc_id", as: "lopHocs" });

LopHoc.hasMany(DKLopHoc, { foreignKey: "lop_hoc_id", as: "dkLopHocs" });
DKLopHoc.belongsTo(LopHoc, { foreignKey: "lop_hoc_id", as: "lopHoc" });

LopHoc.hasMany(LichHoc, { foreignKey: "lop_hoc_id", as: "lichHocs" });
LichHoc.belongsTo(LopHoc, { foreignKey: "lop_hoc_id", as: "lopHoc" });

DKLopHoc.hasMany(DiemDanh, { foreignKey: "dk_lop_hoc_id", as: "diemDanhs" });
DiemDanh.belongsTo(DKLopHoc, { foreignKey: "dk_lop_hoc_id", as: "dkLopHoc" });

LichHoc.hasMany(DiemDanh, { foreignKey: "lich_hoc_id", as: "diemDanhs" });
DiemDanh.belongsTo(LichHoc, { foreignKey: "lich_hoc_id", as: "lichHoc" });

LopHoc.hasMany(LichSuLop, { foreignKey: "lop_hoc_id", as: "lichSus" });
LichSuLop.belongsTo(LopHoc, { foreignKey: "lop_hoc_id", as: "lopHoc" });

module.exports = {
  KhoaHoc,
  PhongHoc,
  LopHoc,
  DKLopHoc,
  LichHoc,
  DiemDanh,
  BangCapGV,
  LichSuLop,
};