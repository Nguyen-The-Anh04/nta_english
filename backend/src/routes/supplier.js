const express = require("express");
const router = express.Router();
const s = require("../controllers/supplierController");
const { auth } = require("../middleware/auth");

// Nhà cung cấp
router.get("/nha-cung-cap", auth, s.getNhaCungCaps);
router.post("/nha-cung-cap", auth, s.createNhaCungCap);
router.put("/nha-cung-cap/:id", auth, s.updateNhaCungCap);
router.delete("/nha-cung-cap/:id", auth, s.deleteNhaCungCap);
router.get("/nha-cung-cap/:nccId/san-pham", auth, s.getSachByNcc);

// Hoá đơn nhập
router.get("/hoa-don-nhap", auth, s.getHoaDonNhaps);
router.get("/hoa-don-nhap/:id", auth, s.getHoaDonNhapById);
router.post("/hoa-don-nhap", auth, s.createHoaDonNhap);
router.delete("/hoa-don-nhap/:id", auth, s.deleteHoaDonNhap);

module.exports = router;
