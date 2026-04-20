const jwt = require("jsonwebtoken");
const { NguoiDung } = require("../models");

// Verify JWT token - optional (không bắt buộc)
const authOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      // Không có token -> để req.user = null và tiếp tục
      req.user = null;
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "nta_secret_key_2026");
    const user = await NguoiDung.findByPk(decoded.id, {
      include: ["chucVu"],
    });

    if (!user || user.trang_thai !== "hoat_dong") {
      req.user = null;
    } else {
      req.user = user;
    }

    next();
  } catch (error) {
    // Token lỗi -> vẫn cho qua nhưng không có user
    req.user = null;
    next();
  }
};

// Verify JWT token - bắt buộc
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không có token xác thực",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "nta_secret_key_2026");

    const user = await NguoiDung.findByPk(decoded.id, {
      include: ["chucVu"],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    if (user.trang_thai !== "hoat_dong") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }
};

// Check role permissions
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    if (!req.user.chuc_vu_id) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản không có quyền",
      });
    }

    const userRole = req.user.chuc_vu_id;
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập",
      });
    }

    next();
  };
};

// ===================
// Role IDs trong database:
// 1 = admin
// 2 = nhanvien_kd
// 3 = giaovien
// 4 = ketoan
// 5 = hocvien
// 6 = ctv
// ===================

// Middleware cho Admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }
  if (req.user.chuc_vu_id !== 1) {
    return res.status(403).json({
      success: false,
      message: "Chỉ admin mới có quyền truy cập",
    });
  }
  next();
};

// Middleware cho Teacher
const isTeacher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }
  if (req.user.chuc_vu_id !== 3) {
    return res.status(403).json({
      success: false,
      message: "Chỉ giáo viên mới có quyền truy cập",
    });
  }
  next();
};

// Middleware cho Student
const isStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }
  if (req.user.chuc_vu_id !== 5) {
    return res.status(403).json({
      success: false,
      message: "Chỉ học viên mới có quyền truy cập",
    });
  }
  next();
};

// Middleware cho CTV (Affiliate)
const isCTV = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }
  // Cho phép nếu chuc_vu_id = 6 HOẶC có bản ghi trong bảng ctv
  if (req.user.chuc_vu_id === 6) return next();

  try {
    const { CTV } = require("../models");
    const ctv = await CTV.findOne({ where: { nguoi_dung_id: req.user.id } });
    if (ctv) return next();
  } catch (e) {}

  return res.status(403).json({
    success: false,
    message: "Chỉ CTV mới có quyền truy cập",
  });
};

// Middleware cho Admin & Teacher
const isAdminOrTeacher = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }
  if (req.user.chuc_vu_id !== 1 && req.user.chuc_vu_id !== 3) {
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập",
    });
  }
  next();
};

// Middleware cho Admin & Employee (KD)
const isAdminOrEmployee = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }
  if (req.user.chuc_vu_id !== 1 && req.user.chuc_vu_id !== 2) {
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập",
    });
  }
  next();
};

// Middleware cho CTV hoặc Admin
const isCTVOrAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }
  // Admin cho phép
  if (req.user.chuc_vu_id === 1) return next();
  // Cho phép nếu chuc_vu_id = 6 HOẶC có bản ghi trong bảng ctv
  if (req.user.chuc_vu_id === 6) return next();
  try {
    const { CTV } = require("../models");
    const ctv = await CTV.findOne({ where: { nguoi_dung_id: req.user.id } });
    if (ctv) return next();
  } catch (e) {}
  return res.status(403).json({
    success: false,
    message: "Chỉ CTV hoặc admin mới có quyền truy cấp",
  });
};

// Middleware cho Admin & Staff (Admin, Sale, Teacher, Accountant)
const isAdminOrStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }
  if (req.user.chuc_vu_id >= 1 && req.user.chuc_vu_id <= 4) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Không có quyền truy cập",
  });
};

module.exports = {
  auth,
  authOptional,
  checkRole,
  isAdmin,
  isAdminOrStaff,
  isTeacher,
  isStudent,
  isCTV,
  isAdminOrTeacher,
  isAdminOrEmployee,
  isCTVOrAdmin,
};