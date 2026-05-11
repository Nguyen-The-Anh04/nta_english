const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const ctrl = require("../controllers/onlineExamController");
const { auth } = require("../middleware/auth");

// Multer config for audio uploads
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "../../uploads/exams")),
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.fieldname + path.extname(file.originalname)),
});

const uploadAudio = multer({
  storage: audioStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = /mp3|wav|m4a|ogg/i;
    cb(null, allowed.test(path.extname(file.originalname)));
  },
});

// ========== EXAMS ==========
router.get("/exams", ctrl.getAllExams);
router.get("/exams/:id", ctrl.getExamById);
router.post("/exams", auth, ctrl.createExam);
router.put("/exams/:id", auth, ctrl.updateExam);
router.delete("/exams/:id", auth, ctrl.deleteExam);

// ========== SECTIONS ==========
router.post("/sections", auth, ctrl.createSection);
router.put("/sections/:id", auth, ctrl.updateSection);
router.delete("/sections/:id", auth, ctrl.deleteSection);

// ========== QUESTIONS ==========
router.post("/questions", auth, ctrl.createQuestion);
router.delete("/questions/:id", auth, ctrl.deleteQuestion);

// ========== ANSWERS ==========
router.post("/answers", auth, ctrl.createAnswer);
router.delete("/answers/:id", auth, ctrl.deleteAnswer);

// ========== EXAM TAKING ==========
router.post("/start", ctrl.startExam);
router.post("/submit", ctrl.submitExam);
router.get("/results/:userId", ctrl.getUserResults);

module.exports = router;