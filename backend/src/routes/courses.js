const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { auth, authOptional, isAdmin, isAdminOrTeacher } = require("../middleware/auth");

// ==================== COURSES ====================

// GET /api/courses - Get all courses (không cần token)
router.get("/", authOptional, courseController.getAllCourses);

// GET /api/courses/:id/classes - Get classes by course (PHẢI ĐỂ TRƯỚC :id)
router.get("/:id/classes", courseController.getClassesByCourse);

// GET /api/courses/:id - Get course by ID (ĐỂ SAU :id/classes)
router.get("/:id", authOptional, courseController.getCourseById);

// POST /api/courses - Create course (Admin/Teacher)
router.post("/", auth, isAdminOrTeacher, courseController.createCourse);

// PUT /api/courses/:id - Update course
router.put("/:id", auth, isAdminOrTeacher, courseController.updateCourse);

// DELETE /api/courses/:id - Delete course
router.delete("/:id", auth, isAdmin, courseController.deleteCourse);

// ==================== CLASSES ====================

// GET /api/courses/classes/all - Get all classes
router.get("/classes/all", courseController.getAllClasses);

// POST /api/courses/classes - Create class
router.post("/classes", auth, isAdminOrTeacher, courseController.createClass);

// GET /api/courses/classes/:id/students - Get students in class (PHẢI ĐỂ TRƯỚC /classes/:id)
router.get("/classes/:id/students", auth, courseController.getClassStudents);

// POST /api/courses/classes/:id/enroll - Enroll student (PHẢI ĐỂ TRƯỚC /classes/:id)
router.post("/classes/:id/enroll", auth, courseController.enrollStudent);

// PUT /api/courses/classes/:id/confirm - Confirm enrollment (PHẢI ĐỂ TRƯỚC /classes/:id)
router.put("/classes/:id/confirm", auth, isAdminOrTeacher, courseController.confirmEnrollment);

// ==================== ROOMS ====================

// GET /api/courses/rooms - Get all rooms
router.get("/rooms", courseController.getRooms);

// POST /api/courses/rooms - Create room
router.post("/rooms", auth, isAdmin, courseController.createRoom);

module.exports = router;