const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { auth } = require("../middleware/auth");

// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

// POST /api/auth/login-ctv - Login for CTV
router.post("/login-ctv", authController.loginCTV);

// GET /api/auth/profile - Get current user profile
router.get("/profile", auth, authController.getProfile);

// PUT /api/auth/profile - Update profile
router.put("/profile", auth, authController.updateProfile);

// PUT /api/auth/change-password
router.put("/change-password", auth, authController.changePassword);

// POST /api/auth/logout
router.post("/logout", auth, authController.logout);

// POST /api/auth/refresh-token
router.post("/refresh-token", authController.refreshToken);

// GET /api/auth/permissions - Get permissions by role (optional - for frontend)
router.get("/permissions", authController.getPermissions);

module.exports = router;