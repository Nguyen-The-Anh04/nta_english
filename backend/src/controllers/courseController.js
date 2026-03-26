const { KhoaHoc, LopHoc, PhongHoc, NguoiDung, DKLopHoc, LichHoc, DiemDanh, BangCapGV, LichSuLop } = require("../models");
const { Op } = require("sequelize");

// GET /api/courses - Get all courses
const getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 20, trang_thai, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (trang_thai) where.trang_thai = trang_thai;
    if (search) {
      where[Op.or] = [
        { ten_khoa: { [Op.like]: `%${search}%` } },
        { ma_khoa: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: courses } = await KhoaHoc.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all courses error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/courses/:id - Get course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await KhoaHoc.findByPk(req.params.id, {
      include: [
        { model: LopHoc, as: "lopHocs", include: [{ model: NguoiDung, as: "giaoVien", attributes: ["id", "ho_ten"] }] },
      ],
    });

    if (!course) {
      return res.status(404).json({ success: false, message: "Khóa học không tồn tại" });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    console.error("Get course by ID error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/courses - Create course (Admin/Teacher)
const createCourse = async (req, res) => {
  try {
    const { ma_khoa, ten_khoa, mo_ta, hoc_phi, thoi_gian_thang, si_so_toi_da, trang_thai = "dang_mo" } = req.body;

    const course = await KhoaHoc.create({
      ma_khoa,
      ten_khoa,
      mo_ta,
      hoc_phi,
      thoi_gian_thang: thoi_gian_thang || 3,
      si_so_toi_da: si_so_toi_da || 15,
      trang_thai,
    });

    res.status(201).json({
      success: true,
      message: "Tạo khóa học thành công",
      data: course,
    });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/courses/:id - Update course
const updateCourse = async (req, res) => {
  try {
    const course = await KhoaHoc.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Khóa học không tồn tại" });
    }

    const { ten_khoa, mo_ta, hoc_phi, thoi_gian_thang, si_so_toi_da, trang_thai } = req.body;

    await course.update({
      ten_khoa: ten_khoa || course.ten_khoa,
      mo_ta: mo_ta || course.mo_ta,
      hoc_phi: hoc_phi || course.hoc_phi,
      thoi_gian_thang: thoi_gian_thang || course.thoi_gian_thang,
      si_so_toi_da: si_so_toi_da || course.si_so_toi_da,
      trang_thai: trang_thai || course.trang_thai,
    });

    res.json({ success: true, message: "Cập nhật khóa học thành công" });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// DELETE /api/courses/:id - Delete course
const deleteCourse = async (req, res) => {
  try {
    const course = await KhoaHoc.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Khóa học không tồn tại" });
    }

    await course.update({ trang_thai: "dong" });

    res.json({ success: true, message: "Đã đóng khóa học" });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// ==================== CLASS MANAGEMENT ====================

// GET /api/courses/:id/classes - Get classes of a course
const getClassesByCourse = async (req, res) => {
  try {
    const classes = await LopHoc.findAll({
      where: { khoa_hoc_id: req.params.id },
      include: [
        { model: NguoiDung, as: "giaoVien", attributes: ["id", "ho_ten"] },
        { model: PhongHoc, as: "phongHoc", attributes: ["ma_phong", "suc_chua"] },
      ],
    });

    res.json({ success: true, data: classes });
  } catch (error) {
    console.error("Get classes error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/classes - Get all classes
const getAllClasses = async (req, res) => {
  try {
    const { page = 1, limit = 20, khoa_hoc_id, giao_vien_id, trang_thai } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (khoa_hoc_id) where.khoa_hoc_id = khoa_hoc_id;
    if (giao_vien_id) where.giao_vien_id = giao_vien_id;
    if (trang_thai) where.trang_thai = trang_thai;

    const { count, rows: classes } = await LopHoc.findAndCountAll({
      where,
      include: [
        { model: KhoaHoc, as: "khoaHoc", attributes: ["ma_khoa", "ten_khoa"] },
        { model: NguoiDung, as: "giaoVien", attributes: ["id", "ho_ten"] },
        { model: PhongHoc, as: "phongHoc", attributes: ["ma_phong", "suc_chua"] },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        classes,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all classes error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/classes - Create class
const createClass = async (req, res) => {
  try {
    const { ma_lop, khoa_hoc_id, giao_vien_id, phong_hoc_id, ngay_bat_dau, ngay_ket_thuc } = req.body;

    const classObj = await LopHoc.create({
      ma_lop,
      khoa_hoc_id,
      giao_vien_id,
      phong_hoc_id,
      ngay_bat_dau,
      ngay_ket_thuc,
      trang_thai: "dang_lap",
      si_so_hien_tai: 0,
    });

    // Log history
    await LichSuLop.create({
      lop_hoc_id: classObj.id,
      hanh_dong: "tao_lop",
      nguoi_thuc_hien_id: req.user.id,
      chi_tiet: "Tạo lớp mới",
    });

    res.status(201).json({
      success: true,
      message: "Tạo lớp học thành công",
      data: classObj,
    });
  } catch (error) {
    console.error("Create class error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/classes/:id/enroll - Enroll student to class
const enrollStudent = async (req, res) => {
  try {
    const { hoc_vien_id, ghi_chu } = req.body;
    const lop_hoc_id = req.params.id;

    // Check class exists
    const classObj = await LopHoc.findByPk(lop_hoc_id);
    if (!classObj) {
      return res.status(404).json({ success: false, message: "Lớp học không tồn tại" });
    }

    // Check if already enrolled
    const existing = await DKLopHoc.findOne({
      where: { hoc_vien_id, lop_hoc_id },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: "Học viên đã đăng ký lớp này" });
    }

    // Check capacity
    if (classObj.si_so_hien_tai >= classObj.si_so_toi_da) {
      return res.status(400).json({ success: false, message: "Lớp đã đầy" });
    }

    // Enroll
    await DKLopHoc.create({
      hoc_vien_id,
      lop_hoc_id,
      trang_thai: "cho_xac_nhan",
      ghi_chu,
    });

    // Update class count
    await classObj.update({
      si_so_hien_tai: classObj.si_so_hien_tai + 1,
    });

    res.status(201).json({
      success: true,
      message: "Đăng ký lớp thành công",
    });
  } catch (error) {
    console.error("Enroll student error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/classes/:id/students - Get students in class
const getClassStudents = async (req, res) => {
  try {
    const registrations = await DKLopHoc.findAll({
      where: { lop_hoc_id: req.params.id },
      include: [
        { model: NguoiDung, as: "hocVien", attributes: ["id", "email", "ho_ten", "sdt"] },
      ],
    });

    res.json({ success: true, data: registrations });
  } catch (error) {
    console.error("Get class students error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/classes/:id/confirm - Confirm enrollment
const confirmEnrollment = async (req, res) => {
  try {
    const { dk_lop_hoc_id } = req.body;

    const registration = await DKLopHoc.findByPk(dk_lop_hoc_id);
    if (!registration) {
      return res.status(404).json({ success: false, message: "Đăng ký không tồn tại" });
    }

    await registration.update({ trang_thai: "da_xac_nhan" });

    res.json({ success: true, message: "Xác nhận đăng ký thành công" });
  } catch (error) {
    console.error("Confirm enrollment error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/courses/rooms - Get all rooms
const getRooms = async (req, res) => {
  try {
    const rooms = await PhongHoc.findAll({ where: { trang_thai: true } });
    res.json({ success: true, data: rooms });
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/courses/rooms - Create room
const createRoom = async (req, res) => {
  try {
    const { ma_phong, suc_chua, thiet_bi } = req.body;

    const room = await PhongHoc.create({
      ma_phong,
      suc_chua: suc_chua || 20,
      thiet_bi,
      trang_thai: true,
    });

    res.status(201).json({
      success: true,
      message: "Tạo phòng học thành công",
      data: room,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getClassesByCourse,
  getAllClasses,
  createClass,
  enrollStudent,
  getClassStudents,
  confirmEnrollment,
  getRooms,
  createRoom,
};