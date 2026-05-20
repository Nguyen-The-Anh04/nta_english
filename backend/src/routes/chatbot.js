const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

// POST /api/chatbot/chat - Gửi tin nhắn
router.post("/chat", chatbotController.chat);

// GET /api/chatbot/history/:sessionId - Lấy lịch sử
router.get("/history/:sessionId", chatbotController.getHistory);

// DELETE /api/chatbot/history/:sessionId - Xóa lịch sử
router.delete("/history/:sessionId", chatbotController.clearHistory);

module.exports = router;
