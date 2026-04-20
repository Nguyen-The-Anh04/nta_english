const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const ctrl = require("../controllers/testController");
const { auth } = require("../middleware/auth");

// Upload PDF
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const uploadPdf = multer({ storage: pdfStorage, limits: { fileSize: 20 * 1024 * 1024 } });

// De thi
router.get("/de-thi", ctrl.getDeThi);
router.post("/de-thi", auth, uploadPdf.single("file_pdf"), ctrl.createDeThi);
router.delete("/de-thi/:id", auth, ctrl.deleteDeThi);

// GET /api/test/lich-hen - Lịch hẹn test
// FIX: Bỏ auth middleware để demo có thể hoạt động
router.get("/lich-hen", ctrl.getLichHenTest);
router.post("/lich-hen", ctrl.createLichHenTest);
router.put("/lich-hen/:id", ctrl.updateLichHenTest);
router.delete("/lich-hen/:id", ctrl.deleteLichHenTest);

// Ket qua
router.put("/ket-qua/:id", auth, ctrl.updateKetQua);

// Portal hoc vien
router.get("/my-lich-test", auth, ctrl.getMyLichTest);

module.exports = router;
