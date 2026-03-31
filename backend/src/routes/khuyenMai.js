const express = require("express");
const router = express.Router();
const {
  getKhuyenMai,
  getKhuyenMaiById,
  createKhuyenMai,
  updateKhuyenMai,
  deleteKhuyenMai,
  apDungKhuyenMai,
} = require("../controllers/khuyenMaiController");

// Lấy danh sách khuyến mại
router.get("/", getKhuyenMai);

// Lấy chi tiết khuyến mại
router.get("/:id", getKhuyenMaiById);

// Tạo khuyến mại mới
router.post("/", createKhuyenMai);

// Cập nhật khuyến mại
router.put("/:id", updateKhuyenMai);

// Xóa khuyến mại
router.delete("/:id", deleteKhuyenMai);

// Áp dụng khuyến mại cho đơn hàng
router.post("/ap-dung", apDungKhuyenMai);

module.exports = router;
