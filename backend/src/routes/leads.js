const express = require("express");
const router = express.Router();
const tuVanLeadController = require("../controllers/tuVanLeadController");
const { auth } = require("../middleware/auth");

// GET /api/leads/stats - Thống kê leads (PHẢI ĐỂ TRƯỚC :id)
router.get("/stats", tuVanLeadController.getLeadStats);

// POST /api/leads - Tạo lead mới (public - từ form đăng ký)
router.post("/", tuVanLeadController.createLead);

// GET /api/leads - Lấy danh sách leads
router.get("/", tuVanLeadController.getLeads);

// GET /api/leads/:id - Lấy chi tiết lead (ĐỂ SAU stats)
router.get("/:id", tuVanLeadController.getLeadById);

// PUT /api/leads/:id - Cập nhật lead
router.put("/:id", tuVanLeadController.updateLead);

// DELETE /api/leads/:id - Xóa lead
router.delete("/:id", tuVanLeadController.deleteLead);

module.exports = router;
