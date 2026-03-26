const { NguoiDung, HoSo, ChucVu, PhongBan, LichSuDangNhap } = require("../models");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");

// GET /api/users - Get all users (Admin)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, chuc_vu_id, trang_thai } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { email: { [Op.like]: `%${search}%` } },
        { ho_ten: { [Op.like]: `%${search}%` } },
        { sdt: { [Op.like]: `%${search}%` } },
      ];
    }
    if (chuc_vu_id) where.chuc_vu_id = chuc_vu_id;
    if (trang_thai) where.trang_thai = trang_thai;

    const { count, rows: users } = await NguoiDung.findAndCountAll({
      where,
      include: [
        { model: ChucVu, as: "chucVu", attributes: ["id", "ten_chuc_vu"] },
        { model: PhongBan, as: "phongBan", attributes: ["id", "ten_phong"] },
      ],
      attributes: { exclude: ["mat_khau"] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/users/:id - Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await NguoiDung.findByPk(req.params.id, {
      include: [
        { model: ChucVu, as: "chucVu" },
        { model: PhongBan, as: "phongBan" },
        { model: HoSo, as: "hoSo" },
      ],
      attributes: { exclude: ["mat_khau"] },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Get user by ID error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/users - Create new user (Admin)
const createUser = async (req, res) => {
  try {
    const { email, mat_khau, ho_ten, sdt, chuc_vu_id, phong_ban_id } = req.body;

    // Check email exists
    const existingUser = await NguoiDung.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email đã tồn tại" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(mat_khau, 10);

    const user = await NguoiDung.create({
      email,
      mat_khau: hashedPassword,
      ho_ten,
      sdt,
      chuc_vu_id,
      phong_ban_id,
      trang_thai: "hoat_dong",
    });

    // Create profile
    await HoSo.create({ nguoi_dung_id: user.id });

    res.status(201).json({
      success: true,
      message: "Tạo người dùng thành công",
      data: {
        id: user.id,
        email: user.email,
        ho_ten: user.ho_ten,
        chuc_vu_id: user.chuc_vu_id,
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/users/:id - Update user
const updateUser = async (req, res) => {
  try {
    const { ho_ten, sdt, chuc_vu_id, phong_ban_id, trang_thai } = req.body;

    const user = await NguoiDung.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    await user.update({
      ho_ten: ho_ten || user.ho_ten,
      sdt: sdt || user.sdt,
      chuc_vu_id: chuc_vu_id || user.chuc_vu_id,
      phong_ban_id: phong_ban_id || user.phong_ban_id,
      trang_thai: trang_thai || user.trang_thai,
    });

    res.json({
      success: true,
      message: "Cập nhật người dùng thành công",
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// DELETE /api/users/:id - Delete user (soft delete)
const deleteUser = async (req, res) => {
  try {
    const user = await NguoiDung.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    // Soft delete - change status
    await user.update({ trang_thai: "ngung" });

    res.json({ success: true, message: "Đã vô hiệu hóa người dùng" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/users/:id/login-history - Get login history
const getLoginHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await LichSuDangNhap.findAndCountAll({
      where: { nguoi_dung_id: req.params.id },
      order: [["thoi_gian", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        history: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get login history error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/users/roles - Get all roles
const getRoles = async (req, res) => {
  try {
    const roles = await ChucVu.findAll();
    res.json({ success: true, data: roles });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/users/departments - Get all departments
const getDepartments = async (req, res) => {
  try {
    const departments = await PhongBan.findAll();
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error("Get departments error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/users/teachers - Get all teachers
const getTeachers = async (req, res) => {
  try {
    const teachers = await NguoiDung.findAll({
      where: { chuc_vu_id: 3, trang_thai: "hoat_dong" },
      attributes: ["id", "email", "ho_ten", "sdt"],
    });
    res.json({ success: true, data: teachers });
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getLoginHistory,
  getRoles,
  getDepartments,
  getTeachers,
};