const express = require("express");
const router = express.Router();
const {
  createMoMoPayment,
  handleMoMoIPN,
  checkMoMoTransactionStatus,
  createVNPayPayment,
  handleVNPayReturn,
  handleVNPayIPN,
} = require("../controllers/paymentController");

// ==================== MOMO ROUTES ====================

// POST /api/payment/momo/create - Tạo thanh toán MOMO
router.post("/momo/create", createMoMoPayment);

// POST /api/payment/momo/ipn - Xử lý IPN từ MOMO
router.post("/momo/ipn", handleMoMoIPN);

// POST /api/payment/momo/status - Kiểm tra trạng thái giao dịch MOMO
router.post("/momo/status", checkMoMoTransactionStatus);

// ==================== VNPAY ROUTES ====================

// POST /api/payment/vnpay/create - Tạo thanh toán VNPAY
router.post("/vnpay/create", createVNPayPayment);

// GET /api/payment/vnpay/return - Xử lý return URL từ VNPAY
router.get("/vnpay/return", handleVNPayReturn);

// GET /api/payment/vnpay/ipn - Xử lý IPN từ VNPAY
router.get("/vnpay/ipn", handleVNPayIPN);

module.exports = router;
