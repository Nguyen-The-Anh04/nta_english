const express = require("express");
const router = express.Router();
const khachHangController = require("../controllers/khachHangController");
const { auth, isAdmin } = require("../middleware/auth");

// GET /api/customers - Get all customers
router.get("/", khachHangController.getAllCustomers);

// GET /api/customers/stats - Get customer statistics
router.get("/stats", khachHangController.getCustomerStats);

// GET /api/customers/:id - Get customer by ID
router.get("/:id", auth, khachHangController.getCustomerById);

// POST /api/customers - Create customer
router.post("/", auth, isAdmin, khachHangController.createCustomer);

// PUT /api/customers/:id - Update customer
router.put("/:id", auth, isAdmin, khachHangController.updateCustomer);

// DELETE /api/customers/:id - Delete customer
router.delete("/:id", auth, isAdmin, khachHangController.deleteCustomer);

module.exports = router;