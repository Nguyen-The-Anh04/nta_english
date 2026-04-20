const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TuVanLead = sequelize.define(
  "TuVanLead",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ho_ten: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    sdt: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    muc_tieu: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    thoi_gian_hoc: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nguoi_phan_cong_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    trang_thai: {
      type: DataTypes.ENUM(
        "moi",
        "da_goi",
        "da_tu_van",
        "da_test",
        "da_dk_hoc",
        "khong_phu_hop",
        "khach_chi_hoi",
        "den_trung_tam",
        "uu_tien",
        "lien_hac_sau",
        "da_hen_test"
      ),
      defaultValue: "moi",
    },
    ghi_chu: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nguon_lead: {
      type: DataTypes.ENUM("landing_page", "fb_ads", "zalo", "walkin"),
      defaultValue: "landing_page",
    },
    trung_tam: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: "NTA_English",
    },
    tu_van_vien: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: "NGUYỄN THẾ ANH",
    },
    khoi_tao: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cap_nhat_gan_nhat: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "tu_van_lead",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Relationship with NguoiDung is set up in index.js to avoid circular dependency

module.exports = { TuVanLead };
