const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { auth, authOptional, isAdmin, isCTV } = require("../middleware/auth");

// ==================== ORDERS ====================

// GET /api/books/orders/stats - Get order statistics by status
router.get("/orders/stats", orderController.getOrderStats);

// GET /api/books/orders - Get all orders (with stats) - bỏ admin check
router.get("/orders", orderController.getAllOrders);

// GET /api/books/orders - Get all orders
router.get("/orders", orderController.getAllOrders);

// POST /api/books/orders - Create order
router.post("/orders", orderController.createOrder);

// PUT /api/books/orders/:id/status - Update order status (PHẢI ĐỂ TRƯỚC :id)
// Bỏ cả auth và isAdmin để ai cũng có thể duyệt (CHỈ DÙNG KHI DEV)
router.put("/orders/:id/status", orderController.updateOrderStatus);

// GET /api/books/orders/:id - Get order by ID (ĐỂ SAU status)
router.get("/orders/:id", orderController.getOrderById);

// ==================== BOOKS ====================

// GET /api/books/categories - Get all categories (không cần token)
router.get("/categories", authOptional, orderController.getCategories);

// GET /api/books - Get all books (không cần token)
router.get("/", authOptional, orderController.getAllBooks);

// GET /api/books/:id - Get book by ID (không cần token)
router.get("/:id", authOptional, orderController.getBookById);

// POST /api/books - Create book (Admin)
router.post("/", auth, isAdmin, orderController.createBook);

// PUT /api/books/:id - Update book
router.put("/:id", auth, isAdmin, orderController.updateBook);

// DELETE /api/books/:id - Delete book (Admin)
router.delete("/:id", auth, isAdmin, orderController.deleteBook);

module.exports = router;