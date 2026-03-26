const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { auth, isCTV } = require("../middleware/auth");

// GET /api/affiliate/profile - Get CTV profile
router.get("/profile", auth, orderController.getCTVProfile);

// GET /api/affiliate/downline - Get F1/F2/F3 tree
router.get("/downline", auth, isCTV, orderController.getDownline);

// GET /api/affiliate/commissions - Get commissions
router.get("/commissions", auth, isCTV, orderController.getCommissions);

// POST /api/affiliate/withdraw - Request withdrawal
router.post("/withdraw", auth, isCTV, orderController.requestWithdraw);

// GET /api/affiliate/withdrawals - Get withdrawal history
router.get("/withdrawals", auth, isCTV, orderController.getWithdrawals);

// POST /api/affiliate/register - Register as CTV
router.post("/register", auth, orderController.registerAsCTV);

module.exports = router;