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
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|mp3|wav|m4a|ogg|json|xlsx|xls/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  },
});

// De thi
router.get("/de-thi/template", ctrl.downloadTemplate);
router.get("/de-thi/template-excel", ctrl.downloadTemplateExcel);
router.get("/de-thi", ctrl.getAllDeThi);
router.get("/de-thi/:id", ctrl.getDeThiById);
router.post("/de-thi", upload.fields([{ name: "file_pdf", maxCount: 1 }, { name: "file_audio", maxCount: 1 }]), ctrl.createDeThi);
router.post("/de-thi/upload-json", upload.fields([{ name: "file_json", maxCount: 1 }, { name: "file_audio", maxCount: 1 }]), ctrl.uploadDeThiJSON);
router.post("/de-thi/upload-excel", upload.fields([
  { name: "file_excel", maxCount: 1 }, { name: "file_audio", maxCount: 1 }
]), ctrl.uploadDeThiExcel);
router.put("/de-thi/:id", auth, ctrl.updateDeThi);
router.put("/de-thi/:id/publish", auth, ctrl.publishDeThi);
router.put("/de-thi/:id/cap-nhat", upload.fields([{ name: "file_pdf", maxCount: 1 }, { name: "file_audio", maxCount: 1 }]), ctrl.updateDeThiFull);
router.delete("/de-thi/:id", auth, ctrl.deleteDeThi);

// Cau hoi
router.post("/de-thi/:id/cau-hoi", auth, ctrl.addCauHoi);
router.delete("/cau-hoi/:id", auth, ctrl.deleteCauHoi);

// Passages
router.post("/passages", auth, ctrl.createPassage);
router.put("/passages/:id", auth, ctrl.updatePassage);
router.delete("/passages/:id", auth, ctrl.deletePassage);

// Lam bai (hoc vien) - FIX: Bo auth de hoc vien co the lam bai test
router.post("/bat-dau", ctrl.batDauLamBai);
router.post("/tra-loi", ctrl.traLoi);
router.post("/nop-bai", ctrl.nopBai);

// Ket qua
router.get("/ket-qua/:id", auth, ctrl.getKetQua);
router.get("/ket-qua-by-lich/:lichHenTestId", ctrl.getKetQuaByLich);
router.get("/my-results", auth, ctrl.getMyResults);
router.get("/admin/ket-qua", auth, ctrl.getAllKetQua);

module.exports = router;
