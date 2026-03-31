const { DanhGia, Sach, NguoiDung } = require("../models");
const { Op } = require("sequelize");

// GET /api/reviews/book/:bookId - Get reviews for a book
const getReviewsByBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await DanhGia.findAndCountAll({
      where: { 
        sach_id: bookId,
        trang_thai: "da_duyet"
      },
      include: [
        { model: NguoiDung, as: "nguoiDung", attributes: ["id", "ho_ten"] }
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Calculate average rating
    const allReviews = await DanhGia.findAll({
      where: { sach_id: bookId, trang_thai: "da_duyet" },
      attributes: ["diem_danh_gia"],
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.diem_danh_gia, 0);
    const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

    // Rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    allReviews.forEach(r => {
      distribution[r.diem_danh_gia]++;
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
        },
        stats: {
          average: Math.round(averageRating * 10) / 10,
          total: count,
          distribution,
        },
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// POST /api/reviews - Create a review
const createReview = async (req, res) => {
  try {
    const { sach_id, ten_nguoi_danh_gia, email, diem_danh_gia, noi_dung, hinh_anh } = req.body;
    const nguoi_dung_id = req.user ? req.user.id : null;

    // Validate book exists
    const book = await Sach.findByPk(sach_id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Sách không tồn tại" });
    }

    // Validate rating
    if (diem_danh_gia < 1 || diem_danh_gia > 5) {
      return res.status(400).json({ success: false, message: "Điểm đánh giá phải từ 1 đến 5" });
    }

    const review = await DanhGia.create({
      sach_id,
      nguoi_dung_id,
      ten_nguoi_danh_gia,
      email,
      diem_danh_gia,
      noi_dung,
      hinh_anh,
      trang_thai: "cho_duyet",
    });

    res.status(201).json({
      success: true,
      message: "Gửi đánh giá thành công! Đánh giá sẽ được duyệt trước khi hiển thị.",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/reviews/:id/approve - Approve a review (Admin)
const approveReview = async (req, res) => {
  try {
    const review = await DanhGia.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Đánh giá không tồn tại" });
    }

    await review.update({ trang_thai: "da_duyet" });

    res.json({ success: true, message: "Duyệt đánh giá thành công" });
  } catch (error) {
    console.error("Approve review error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// PUT /api/reviews/:id/reject - Reject a review (Admin)
const rejectReview = async (req, res) => {
  try {
    const review = await DanhGia.findByPk(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: "Đánh giá không tồn tại" });
    }

    await review.update({ trang_thai: "tu_choi" });

    res.json({ success: true, message: "Từ chối đánh giá thành công" });
  } catch (error) {
    console.error("Reject review error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

// GET /api/reviews/pending - Get pending reviews (Admin)
const getPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await DanhGia.findAndCountAll({
      where: { trang_thai: "cho_duyet" },
      include: [
        { model: Sach, as: "sach", attributes: ["id", "ten_sach"] }
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: { total: count, page: parseInt(page), limit: parseInt(limit) },
      },
    });
  } catch (error) {
    console.error("Get pending reviews error:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};

module.exports = {
  getReviewsByBook,
  createReview,
  approveReview,
  rejectReview,
  getPendingReviews,
};
