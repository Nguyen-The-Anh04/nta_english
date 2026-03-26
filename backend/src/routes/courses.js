const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { auth, authOptional, isAdmin, isAdminOrTeacher } = require("../middleware/auth");

// ==================== COURSES ====================

// GET /api/courses - Get all courses (không cần token)
router.get("/", authOptional, courseController.getAllCourses);

// GET /api/courses/:id - Get course by ID (không cần token)
router.get("/:id", authOptional, courseController.getCourseById);

// POST /api/courses - Create course (Admin/Teacher)
router.post("/", auth, isAdminOrTeacher, courseController.createCourse);

// PUT /api/courses/:id - Update course
router.put("/:id", auth, isAdminOrTeacher, courseController.updateCourse);

// DELETE /api/courses/:id - Delete course
router.delete("/:id", auth, isAdmin, courseController.deleteCourse);

// GET /api/courses/:id/classes - Get classes by course
router.get("/:id/classes", courseController.getClassesByCourse);

// ==================== CLASSES ====================

// GET /api/classes - Get all classes
router.get("/classes/all", courseController.getAllClasses);

// POST /api/classes - Create class
router.post("/classes", auth, isAdminOrTeacher, courseController.createClass);

// GET /api/classes/:id/students - Get students in class
router.get("/classes/:id/students", auth, courseController.getClassStudents);

// POST /api/classes/:id/enroll - Enroll student
router.post("/classes/:id/enroll", auth, courseController.enrollStudent);

// PUT /api/classes/:id/confirm - Confirm enrollment
router.put("/classes/:id/confirm", auth, isAdminOrTeacher, courseController.confirmEnrollment);

// ==================== ROOMS ====================

// GET /api/courses/rooms - Get all rooms
router.get("/rooms", courseController.getRooms);

// POST /api/courses/rooms - Create room
router.post("/rooms", auth, isAdmin, courseController.createRoom);

module.exports = router;