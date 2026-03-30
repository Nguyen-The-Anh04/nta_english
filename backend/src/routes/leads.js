const express = require("express");
const router = express.Router();
const tuVanLeadController = require("../controllers/tuVanLeadController");
const { auth } = require("../middleware/auth");

// POST /api/leads - Tạo lead mới (public - từ form đăng ký)
router.post("/", tuVanLeadController.createLead);

// GET /api/leads - Lấy danh sách leads
router.get("/", tuVanLeadController.getLeads);

// GET /api/leads/stats - Thống kê leads
router.get("/stats", tuVanLeadController.getLeadStats);

// GET /api/leads/:id - Lấy chi tiết lead
router.get("/:id", tuVanLeadController.getLeadById);

// PUT /api/leads/:id - Cập nhật lead
router.put("/:id", tuVanLeadController.updateLead);

// DELETE /api/leads/:id - Xóa lead
router.delete("/:id", tuVanLeadController.deleteLead);

module.exports = router;
