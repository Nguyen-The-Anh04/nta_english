const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const multer = require("multer");
const path = require("path");
const { auth, authOptional, isAdmin, isAdminOrStaff, isCTV, isCTVOrAdmin } = require("../middleware/auth");

// Configure multer for image uploads - FIXED: Added proper auth middleware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|jfif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp, jfif)"));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// ==================== UPLOAD IMAGE ====================
// FIXED: Added auth middleware for security
router.post("/upload", auth, isAdmin, upload.single("hinh_anh"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Vui lòng chọn file ảnh" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, data: { url: imageUrl } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ORDERS ====================

// GET /api/books/orders/stats - Get order statistics by status
router.get("/orders/stats", orderController.getOrderStats);

// GET /api/books/orders/tra-cuu - Tra cứu đơn hàng (không cần đăng nhập)
router.get("/orders/tra-cuu", orderController.traCuuDonHang);

// GET /api/books/orders - Get all orders (with stats)
router.get("/orders", orderController.getAllOrders);

// POST /api/books/orders - Create order
router.post("/orders", orderController.createOrder);

// PUT /api/books/orders/:id/status - Update order status
router.put("/orders/:id/status", auth, orderController.updateOrderStatus);

// DELETE /api/books/orders/:id - Delete order (Admin only)
router.delete("/orders/:id", auth, isAdmin, orderController.deleteOrder);

// GET /api/books/orders/:id - Get order by ID (ĐỂ SAU status)
router.get("/orders/:id", authOptional, orderController.getOrderById);

// ==================== BOOKS ====================

// GET /api/books/categories - Get all categories (không cần token)
router.get("/categories", authOptional, orderController.getCategories);

// GET /api/books/top-products - Get top selling products (không cần token)
router.get("/top-products", authOptional, orderController.getTopProducts);

// GET /api/books - Get all books (không cần token)
router.get("/", authOptional, orderController.getAllBooks);

// GET /api/books/:id - Get book by ID (không cần token)
router.get("/:id", authOptional, orderController.getBookById);

// POST /api/books - Create book (Admin only)
// FIXED: Added auth and isAdmin for security
router.post("/", auth, isAdmin, orderController.createBook);

// PUT /api/books/:id - Update book (Admin only)
// FIXED: Added auth and isAdmin for security
router.put("/:id", auth, isAdmin, orderController.updateBook);

// DELETE /api/books/:id - Delete book (Admin only)
// FIXED: Added auth and isAdmin for security
router.delete("/:id", auth, isAdmin, orderController.deleteBook);

module.exports = router;