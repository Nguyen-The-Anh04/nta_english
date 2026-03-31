const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { auth, authOptional, isAdmin, isCTV } = require("../middleware/auth");

// ==================== BOOKS ====================

// GET /api/books/categories - Get all categories (không cần token)
router.get("/categories", authOptional, orderController.getCategories);

// ==================== ORDERS ====================

// GET /api/orders/stats - Get order statistics by status
router.get("/orders/stats", orderController.getOrderStats);

// GET /api/orders - Get all orders
router.get("/orders", orderController.getAllOrders);

// GET /api/orders/:id - Get order by ID
router.get("/orders/:id", orderController.getOrderById);

// POST /api/orders - Create order
router.post("/orders", orderController.createOrder);

// PUT /api/orders/:id/status - Update order status
router.put("/orders/:id/status", auth, isAdmin, orderController.updateOrderStatus);

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