const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { auth, isCTV } = require("../middleware/auth");

// ==================== DEBUG API ====================
// Xem tất cả hoa hồng (ko cần auth)
router.get("/debug/commissions", async (req, res) => {
  try {
    const { HoaHong } = require("../models");
    const commissions = await HoaHong.findAll({ order: [["id", "DESC"]], limit: 20 });
    res.json({ success: true, count: commissions.length, data: commissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xem tất cả đơn hàng (ko cần auth)
router.get("/debug/orders", async (req, res) => {
  try {
    const { DonHang, NguoiDung } = require("../models");
    const orders = await DonHang.findAll({ 
      order: [["id", "DESC"]], 
      limit: 20,
      include: [{ model: NguoiDung, as: "ctv" }]
    });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Xem tất cả CTV
router.get("/debug/ctv", async (req, res) => {
  try {
    const { CTV, NguoiDung } = require("../models");
    const ctvs = await CTV.findAll({ 
      order: [["id", "DESC"]], 
      limit: 20,
      include: [{ model: NguoiDung, as: "nguoiDung" }]
    });
    res.json({ success: true, count: ctvs.length, data: ctvs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== END DEBUG ====================

// GET /api/affiliate/by-ref/:refCode - Get CTV by referral code (PHẢI ĐỂ TRƯỚC :id)
router.get("/by-ref/:refCode", orderController.getCTVByRefCode);

// GET /api/affiliate/profile - Get CTV profile
router.get("/profile", auth, orderController.getCTVProfile);

// GET /api/affiliate/stats - Dashboard stats
router.get("/stats", auth, isCTV, orderController.getAffiliateStats);

// GET /api/affiliate/downline - Get F1/F2/F3 tree
router.get("/downline", auth, isCTV, orderController.getDownline);

// GET /api/affiliate/commissions - Get commissions
router.get("/commissions", auth, isCTV, orderController.getCommissions);

// POST /api/affiliate/withdraw - Request withdrawal
router.post("/withdraw", auth, isCTV, orderController.requestWithdraw);

// GET /api/affiliate/withdrawals - Get withdrawal history
router.get("/withdrawals", auth, isCTV, orderController.getWithdrawals);

// Admin: Duyệt/từ chối rút tiền
router.post("/admin/withdrawals/:id/approve", auth, orderController.approveWithdrawal);

// Admin: Từ chối rút tiền
router.post("/admin/withdrawals/:id/reject", auth, orderController.rejectWithdrawal);

// Admin: Lấy thông tin QR code cho withdrawal
router.get("/admin/withdrawals/:id/qr", auth, orderController.getWithdrawalQR);

// Admin: Lấy danh sách tất cả withdrawal
router.get("/admin/withdrawals", auth, orderController.getAllWithdrawals);

// Admin: Backfill hoa hồng cho đơn da_tt chưa có hoa hồng
router.post("/admin/backfill-commissions", auth, orderController.backfillCommissions);

// Admin: Fix cap_do cho toàn bộ CTV
router.post("/admin/fix-cap-do", auth, orderController.fixCapDo);

// POST /api/affiliate/register - Register as CTV (requires auth)
router.post("/register", auth, orderController.registerAsCTV);

// POST /api/affiliate/register-new - Register new user as CTV (no auth required)
router.post("/register-new", orderController.registerAffiliate);

// DEBUG: POST /api/affiliate/register-existing - Register existing user as CTV by email (temp debug endpoint)
router.post("/register-existing", async (req, res) => {
  const { CTV, NguoiDung } = require("../models");
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Thiếu email" });
    
    const user = await NguoiDung.findOne({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: "User không tồn tại" });
    
    const existingCTV = await CTV.findOne({ where: { nguoi_dung_id: user.id } });
    if (existingCTV) return res.status(400).json({ success: false, message: "Đã là CTV", data: existingCTV });
    
    const ma_ctv = "CTV" + Date.now();
    const ctv = await CTV.create({
      nguoi_dung_id: user.id,
      ctv_cha_id: null,
      cap_do: 1,
      ma_gioi_thieu: ma_ctv,
      tong_downline: 0,
      tong_hoa_hong: 0,
    });
    
    res.json({ success: true, message: "Đăng ký CTV thành công", data: ctv });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi: " + error.message });
  }
});

// POST /api/affiliate/generate-link - Generate affiliate link for a product
router.post("/generate-link", auth, isCTV, orderController.generateAffiliateLink);

// GET /api/affiliate/products - Get products with commission info
router.get("/products", auth, isCTV, orderController.getAffiliateProducts);

// Admin: Lấy tất cả CTV với thông tin downline đầy đủ
router.get("/admin/ctvs", auth, orderController.getAllCTVsWithDownline);

// DEBUG: Tạo tài khoản admin
router.post("/debug/create-admin", async (req, res) => {
  try {
    const { email, password, ho_ten } = req.body;
    
    // Check if user exists
    const existingUser = await require("../models").NguoiDung.findOne({ where: { email } });
    if (existingUser) {
      return res.json({ success: true, message: "User đã tồn tại", userId: existingUser.id });
    }
    
    // Hash password
    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user (chuc_vu_id = 1 for admin)
    const user = await require("../models").NguoiDung.create({
      email,
      mat_khau: hashedPassword,
      ho_ten: ho_ten || "Admin",
      sdt: "",
      chuc_vu_id: 1, // Admin role
      trang_thai: "hoat_dong",
    });
    
    res.json({ success: true, message: "Tạo admin thành công", userId: user.id });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DEBUG: Cập nhật role user
router.post("/debug/update-role", async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    
    const user = await require("../models").NguoiDung.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User không tồn tại" });
    }
    
    await user.update({ chuc_vu_id: roleId });
    
    res.json({ success: true, message: "Cập nhật role thành công", chuc_vu_id: roleId });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DEBUG: Tạo CTV từ user có sẵn
router.post("/debug/create-ctv", async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await require("../models").NguoiDung.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User không tồn tại" });
    }
    
    // Check if already CTV
    const existingCTV = await require("../models").CTV.findOne({ where: { nguoi_dung_id: userId } });
    if (existingCTV) {
      return res.json({ success: true, message: "Đã là CTV", ctvId: existingCTV.id });
    }
    
    // Create CTV
    const ma_ctv = "CTV" + Date.now();
    const ctv = await require("../models").CTV.create({
      nguoi_dung_id: userId,
      ctv_cha_id: null,
      cap_do: 1,
      ma_gioi_thieu: ma_ctv,
      tong_downline: 0,
      tong_hoa_hong: 0,
    });
    
    res.json({ success: true, message: "Tạo CTV thành công", ctvId: ctv.id, ma_gioi_thieu: ma_ctv });
  } catch (error) {
    console.error("Create CTV error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DEBUG: Reset password
router.post("/debug/reset-password", async (req, res) => {
  try {
    const { userId, password } = req.body;
    
    const user = await require("../models").NguoiDung.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User không tồn tại" });
    }
    
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);
    await user.update({ mat_khau: hashedPassword });
    
    res.json({ success: true, message: "Reset password thành công" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;