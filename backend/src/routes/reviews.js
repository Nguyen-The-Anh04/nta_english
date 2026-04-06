const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const { auth, authOptional, isAdmin } = require("../middleware/auth");

// GET /api/reviews/pending - Get pending reviews (Admin only) (PHẢI ĐỂ TRƯỚC :id)
router.get("/pending", auth, isAdmin, reviewController.getPendingReviews);

// GET /api/reviews/book/:bookId - Get reviews for a book (public)
router.get("/book/:bookId", authOptional, reviewController.getReviewsByBook);

// POST /api/reviews - Create a review (public or authenticated)
router.post("/", authOptional, reviewController.createReview);

// PUT /api/reviews/:id/approve - Approve a review (Admin only) (PHẢI ĐỂ TRƯỚC /:id)
router.put("/:id/approve", auth, isAdmin, reviewController.approveReview);

// PUT /api/reviews/:id/reject - Reject a review (Admin only) (PHẢI ĐỂ TRƯỚC /:id)
router.put("/:id/reject", auth, isAdmin, reviewController.rejectReview);

module.exports = router;
