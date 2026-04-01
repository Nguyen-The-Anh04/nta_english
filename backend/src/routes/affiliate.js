const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { auth, isCTV } = require("../middleware/auth");

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

// POST /api/affiliate/register - Register as CTV (requires auth)
router.post("/register", auth, orderController.registerAsCTV);

// POST /api/affiliate/register-new - Register new user as CTV (no auth required)
router.post("/register-new", orderController.registerAffiliate);

// POST /api/affiliate/generate-link - Generate affiliate link for a product
router.post("/generate-link", auth, isCTV, orderController.generateAffiliateLink);

// GET /api/affiliate/products - Get products with commission info
router.get("/products", auth, isCTV, orderController.getAffiliateProducts);

module.exports = router;