const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { auth, authOptional, isAdmin } = require("../middleware/auth");

// GET /api/users - Get all users (Admin)
router.get("/", authOptional, isAdmin, userController.getAllUsers);

// GET /api/users/roles - Get all roles (không cần token)
router.get("/roles", authOptional, userController.getRoles);

// GET /api/users/departments - Get all departments (không cần token)
router.get("/departments", authOptional, userController.getDepartments);

// GET /api/users/teachers - Get all teachers (không cần token)
router.get("/teachers", authOptional, userController.getTeachers);

// GET /api/users/:id - Get user by ID
router.get("/:id", authOptional, userController.getUserById);

// POST /api/users - Create user (Admin)
router.post("/", auth, isAdmin, userController.createUser);

// PUT /api/users/:id - Update user
router.put("/:id", auth, userController.updateUser);

// DELETE /api/users/:id - Delete user (Admin)
router.delete("/:id", auth, isAdmin, userController.deleteUser);

// GET /api/users/:id/login-history - Get login history
router.get("/:id/login-history", auth, isAdmin, userController.getLoginHistory);

module.exports = router;