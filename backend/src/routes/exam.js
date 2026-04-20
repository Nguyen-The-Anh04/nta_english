const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const ctrl = require("../controllers/examController");
const { auth } = require("../middleware/auth");

const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.fieldname + path.extname(file.originalname)),
});
const upload = multer({
  storage: pdfStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB cho MP3
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|mp3|wav|m4a|ogg/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  },
});

// De thi
router.get("/de-thi", ctrl.getAllDeThi);
router.get("/de-thi/:id", ctrl.getDeThiById);
router.post("/de-thi", upload.fields([{ name: "file_pdf", maxCount: 1 }, { name: "file_audio", maxCount: 1 }]), ctrl.createDeThi);
router.put("/de-thi/:id", auth, ctrl.updateDeThi);
router.delete("/de-thi/:id", auth, ctrl.deleteDeThi);

// Cau hoi
router.post("/de-thi/:id/cau-hoi", auth, ctrl.addCauHoi);
router.delete("/cau-hoi/:id", auth, ctrl.deleteCauHoi);

// Lam bai (hoc vien) - FIX: Bo auth de hoc vien co the lam bai test
router.post("/bat-dau", ctrl.batDauLamBai);
router.post("/tra-loi", ctrl.traLoi);
router.post("/nop-bai", ctrl.nopBai);

// Ket qua
router.get("/ket-qua/:id", auth, ctrl.getKetQua);
router.get("/my-results", auth, ctrl.getMyResults);
router.get("/admin/ket-qua", auth, ctrl.getAllKetQua);

module.exports = router;
