const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const orderController = require("../controllers/orderController");
const { auth, authOptional, isAdmin, isCTV, isCTVOrAdmin } = require("../middleware/auth");

// Configure multer for image uploads
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

// ==================== ORDERS ====================

// GET /api/books/orders/stats - Get order statistics by status
router.get("/orders/stats", orderController.getOrderStats);

// GET /api/books/orders - Get all orders (with stats) - bỏ admin check
router.get("/orders", orderController.getAllOrders);

// POST /api/books/orders - Create order
router.post("/orders", orderController.createOrder);

// PUT /api/books/orders/:id/status - Update order status (PHẢI ĐỂ TRƯỚC :id)
router.put("/orders/:id/status", orderController.updateOrderStatus);

// DELETE /api/books/orders/:id - Delete order (Admin)
router.delete("/orders/:id", auth, orderController.deleteOrder);

// PUT /api/books/orders/:id - Update order (Admin)
router.put("/orders/:id", auth, orderController.updateOrder);

// GET /api/books/orders/:id - Get order by ID (ĐỂ SAU status)
router.get("/orders/:id", authOptional, orderController.getOrderById);

// ==================== KHÁCH HÀNG ====================

// GET /api/books/khach-hang - Get all customers
router.get("/khach-hang", auth, orderController.getAllKhachHang);

// GET /api/books/khach-hang/:id - Get customer by ID
router.get("/khach-hang/:id", auth, orderController.getKhachHangById);

// POST /api/books/khach-hang - Create customer
router.post("/khach-hang", auth, orderController.createKhachHang);

// PUT /api/books/khach-hang/:id - Update customer
router.put("/khach-hang/:id", auth, orderController.updateKhachHang);

// DELETE /api/books/khach-hang/:id - Delete customer
router.delete("/khach-hang/:id", auth, orderController.deleteKhachHang);

// ==================== BOOKS ====================

// POST /api/books/upload - Upload book image (Bỏ tạm middleware kiểm tra)
router.post("/upload", upload.single("hinh_anh"), async (req, res) => {
  try {
    console.log("=== UPLOAD DEBUG ===");
    console.log("Upload request received at", new Date().toISOString());
    console.log("req.file:", req.file);
    console.log("req.body:", req.body);
    console.log("req.headers:", req.headers);
    console.log("req.user:", req.user);
    console.log("===================");
    
    if (!req.file) {
      console.log("No file in request");
      return res.status(400).json({ success: false, message: "Vui lòng chọn file ảnh" });
    }
    
    console.log("File details:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename
    });
    
    const imageUrl = `/uploads/${req.file.filename}`;
    console.log("Upload success, URL:", imageUrl);
    res.json({ success: true, data: { url: imageUrl } });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/books/categories - Get all categories (không cần token)
router.get("/categories", authOptional, orderController.getCategories);

// GET /api/books - Get all books (không cần token)
router.get("/", authOptional, orderController.getAllBooks);

// GET /api/books/:id - Get book by ID (không cần token)
router.get("/:id", authOptional, orderController.getBookById);

// POST /api/books - Create book (Admin hoặc CTV)
router.post("/", auth, isCTVOrAdmin, orderController.createBook);

// PUT /api/books/:id - Update book
router.put("/:id", auth, isCTVOrAdmin, orderController.updateBook);

// DELETE /api/books/:id - Delete book (Admin hoặc CTV)
router.delete("/:id", auth, isCTVOrAdmin, orderController.deleteBook);

module.exports = router;