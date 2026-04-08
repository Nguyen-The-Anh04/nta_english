const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { NguoiDung, HoSo, ChucVu, TokenXacThuc, LichSuDangNhap } = require("../models");
const { Op } = require("sequelize");

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      chuc_vu_id: user.chuc_vu_id,
    },
    process.env.JWT_SECRET || "nta_secret_key_2026",
    { expiresIn: "7d" }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { email, mat_khau, ho_ten, sdt, chuc_vu_id = 5 } = req.body;

    // Check if email exists
    const existingUser = await NguoiDung.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(mat_khau, 10);

    // Create user
    const user = await NguoiDung.create({
      email,
      mat_khau: hashedPassword,
      ho_ten: ho_ten || "",
      sdt: sdt || "",
      chuc_vu_id,
      trang_thai: "hoat_dong",
    });

    // Create profile
    await HoSo.create({
      nguoi_dung_id: user.id,
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        user: {
          id: user.id,
          email: user.email,
          ho_ten: user.ho_ten,
          chuc_vu_id: user.chuc_vu_id,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, mat_khau } = req.body;

    // Find user with role
    const user = await NguoiDung.findOne({
      where: { email },
      include: [{ model: ChucVu, as: "chucVu" }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(mat_khau, user.mat_khau);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Check status
    if (user.trang_thai !== "hoat_dong") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    // Get profile
    const profile = await HoSo.findOne({
      where: { nguoi_dung_id: user.id },
    });

    // Save login history
    await LichSuDangNhap.create({
      nguoi_dung_id: user.id,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.headers["user-agent"],
    });

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: {
          id: user.id,
          email: user.email,
          ho_ten: user.ho_ten,
          sdt: user.sdt,
          chuc_vu_id: user.chuc_vu_id,
          chuc_vu: user.chucVu ? user.chucVu.ten_chuc_vu : null,
          profile: profile || null,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// GET /api/auth/profile
const getProfile = async (req, res) => {
  try {
    const user = await NguoiDung.findByPk(req.user.id, {
      include: [
        { model: ChucVu, as: "chucVu" },
        { model: HoSo, as: "hoSo" },
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { ho_ten, sdt, dia_chi, cmnd_cccd, ngay_sinh, gioi_tinh, so_tk_ngan_hang, ten_ngan_hang } = req.body;

    // Update user
    await NguoiDung.update(
      { ho_ten, sdt },
      { where: { id: req.user.id } }
    );

    // Update profile
    const profile = await HoSo.findOne({
      where: { nguoi_dung_id: req.user.id },
    });

    if (profile) {
      await profile.update({
        dia_chi,
        cmnd_cccd,
        ngay_sinh,
        gioi_tinh,
        so_tk_ngan_hang,
        ten_ngan_hang,
      });
    }

    res.json({
      success: true,
      message: "Cập nhật thông tin thành công",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { mat_khau_cu, mat_khau_moi } = req.body;

    const user = await NguoiDung.findByPk(req.user.id);

    // Check old password
    const isValidPassword = await bcrypt.compare(mat_khau_cu, user.mat_khau);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu cũ không đúng",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(mat_khau_moi, 10);

    await user.update({ mat_khau: hashedPassword });

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  // Với JWT, client cần xóa token
  res.json({
    success: true,
    message: "Đăng xuất thành công",
  });
};

// POST /api/auth/refresh-token
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "nta_secret_key_2026", {
      ignoreExpiration: true,
    });

    const user = await NguoiDung.findByPk(decoded.id);
    if (!user || user.trang_thai !== "hoat_dong") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    const newToken = generateToken(user);

    res.json({
      success: true,
      data: { token: newToken },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }
};

// POST /api/auth/login-ctv - Login for CTV
const loginCTV = async (req, res) => {
  try {
    const { email, mat_khau } = req.body;

    // Find user with role
    const user = await NguoiDung.findOne({
      where: { email },
      include: [{ model: ChucVu, as: "chucVu" }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(mat_khau, user.mat_khau);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    // Check if user is CTV (by chuc_vu_id OR has a record in ctv table)
    const { CTV } = require("../models");
    const ctv = await CTV.findOne({ where: { nguoi_dung_id: user.id } });

    if (user.chuc_vu_id !== 6 && !ctv) {
      return res.status(403).json({
        success: false,
        message: "Tài khoản này không phải CTV",
      });
    }

    // Check status
    if (user.trang_thai !== "hoat_dong") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    // Save login history
    await LichSuDangNhap.create({
      nguoi_dung_id: user.id,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.headers["user-agent"],
    });

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: {
          id: user.id,
          email: user.email,
          ho_ten: user.ho_ten,
          sdt: user.sdt,
          chuc_vu_id: user.chuc_vu_id,
          chuc_vu: user.chucVu ? user.chucVu.ten_chuc_vu : null,
        },
        ctv: ctv ? {
          id: ctv.id,
          ma_gioi_thieu: ctv.ma_gioi_thieu,
          cap_do: ctv.cap_do,
          tong_downline: ctv.tong_downline,
          tong_hoa_hong: ctv.tong_hoa_hong,
        } : null,
        token,
      },
    });
  } catch (error) {
    console.error("Login CTV error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};

// GET /api/auth/permissions - Lấy permissions theo chuc_vu_id
const getPermissions = async (req, res) => {
  try {
    const chuc_vu_id = req.user?.chuc_vu_id || parseInt(req.query.chuc_vu_id) || 1;
    
    // Danh sách permissions theo từng role
    const permissions = {
      1: {
        role: "admin",
        roleName: "Quản trị viên",
        menus: ["leads", "test-appointment", "class-management", "student-management", "diem-danh", "bai-tap", "bang-diem", "ke-toan", "cong-no", "phieu-thu-chi", "students", "students-in-class", "paused-students", "transferred-students", "registration", "payment", "feedback"],
        canAccessLms: true,
        canAccessAdmin: true,
        canAccessCtv: true,
      },
      2: {
        role: "sale",
        roleName: "Kinh doanh",
        menus: ["leads", "test-appointment", "registration"],
        canAccessLms: true,
        canAccessAdmin: false,
        canAccessCtv: false,
      },
      3: {
        role: "teacher",
        roleName: "Giáo viên",
        menus: ["class-management", "diem-danh", "bai-tap", "bang-diem"],
        canAccessLms: true,
        canAccessAdmin: false,
        canAccessCtv: false,
      },
      4: {
        role: "accountant",
        roleName: "Kế toán",
        menus: ["ke-toan", "cong-no", "phieu-thu-chi", "payment"],
        canAccessLms: true,
        canAccessAdmin: false,
        canAccessCtv: false,
      },
      5: {
        role: "student",
        roleName: "Học viên",
        menus: ["home", "schedule", "scores", "homework", "payment"],
        canAccessLms: false,
        canAccessStudentPortal: true,
        canAccessAdmin: false,
        canAccessCtv: false,
      },
      6: {
        role: "ctv",
        roleName: "Cộng tác viên",
        menus: [],
        canAccessLms: false,
        canAccessAdmin: false,
        canAccessCtv: true,
      },
    };
    
    const userPermissions = permissions[chuc_vu_id] || permissions[1];
    
    res.json({
      success: true,
      data: userPermissions,
    });
  } catch (error) {
    console.error("Get permissions error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  register,
  login,
  loginCTV,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
  getPermissions,
};