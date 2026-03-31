import { useState, useEffect } from "react";
import { fetchReviewsByBook, createReview } from "../api";

function ReviewSection({ bookId, bookName }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    ten_nguoi_danh_gia: "",
    email: "",
    diem_danh_gia: 5,
    noi_dung: "",
  });

  useEffect(() => {
    loadReviews();
  }, [bookId]);

  const loadReviews = async () => {
    try {
      const data = await fetchReviewsByBook(bookId);
      setReviews(data?.reviews || []);
      setStats(data?.stats || { average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
    } catch (error) {
      console.error("Lỗi tải đánh giá:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ten_nguoi_danh_gia || !formData.noi_dung) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createReview({
        ...formData,
        sach_id: bookId,
      });

      if (result.success) {
        alert(result.message);
        setShowForm(false);
        setFormData({ ten_nguoi_danh_gia: "", email: "", diem_danh_gia: 5, noi_dung: "" });
        loadReviews();
      } else {
        alert(result.message || "Gửi đánh giá thất bại!");
      }
    } catch (error) {
      console.error("Lỗi gửi đánh giá:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, size = 20) => {
    return (
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            onClick={() => interactive && setFormData({ ...formData, diem_danh_gia: star })}
            style={{
              fontSize: size,
              cursor: interactive ? "pointer" : "default",
              color: star <= rating ? "#ffc107" : "#e0e0e0",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => interactive && (e.target.style.transform = "scale(1.2)")}
            onMouseLeave={(e) => interactive && (e.target.style.transform = "scale(1)")}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <div
          style={{
            width: 40,
            height: 40,
            border: "4px solid #e53935",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Review Stats */}
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 25,
          marginBottom: 25,
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
          {/* Average Rating */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: "800", color: "#e53935" }}>
              {stats.average}
            </div>
            {renderStars(Math.round(stats.average), false, 24)}
            <div style={{ fontSize: 14, color: "#888", marginTop: 8 }}>
              {stats.total} đánh giá
            </div>
          </div>

          {/* Rating Distribution */}
          <div style={{ flex: 1 }}>
            {[5, 4, 3, 2, 1].map((star) => (
              <div
                key={star}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 14, color: "#666", width: 20 }}>{star}★</span>
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    background: "#e0e0e0",
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: "#ffc107",
                      width: stats.total > 0 ? `${(stats.distribution[star] / stats.total) * 100}%` : "0%",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: 13, color: "#888", width: 30 }}>
                  {stats.distribution[star]}
                </span>
              </div>
            ))}
          </div>

          {/* Write Review Button */}
          <div>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: "14px 28px",
                background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: "700",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.05)";
                e.target.style.boxShadow = "0 8px 20px rgba(229, 57, 53, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "none";
              }}
            >
              ✍️ Viết đánh giá
            </button>
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showForm && (
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: 25,
            marginBottom: 25,
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
            animation: "slideDown 0.3s ease",
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#1a1a2e",
              marginBottom: 20,
            }}
          >
            📝 Viết đánh giá cho "{bookName}"
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: "600", color: "#666", display: "block", marginBottom: 10 }}>
                Đánh giá của bạn:
              </label>
              {renderStars(formData.diem_danh_gia, true, 32)}
            </div>

            {/* Name */}
            <div style={{ marginBottom: 15 }}>
              <input
                type="text"
                value={formData.ten_nguoi_danh_gia}
                onChange={(e) => setFormData({ ...formData, ten_nguoi_danh_gia: e.target.value })}
                placeholder="Họ và tên *"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "2px solid #e0e0e0",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 15 }}>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email (không bắt buộc)"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "2px solid #e0e0e0",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </div>

            {/* Content */}
            <div style={{ marginBottom: 20 }}>
              <textarea
                value={formData.noi_dung}
                onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                placeholder="Nội dung đánh giá *"
                rows={4}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "2px solid #e0e0e0",
                  fontSize: 14,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </div>

            {/* Submit Button */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#f5f5f5",
                  color: "#666",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 2,
                  padding: "14px",
                  background: submitting ? "#ccc" : "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: "700",
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 25,
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
        }}
      >
        <h3
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#1a1a2e",
            marginBottom: 20,
          }}
        >
          💬 Bình luận ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <span style={{ fontSize: 50, display: "block", marginBottom: 15 }}>💬</span>
            <p style={{ color: "#888" }}>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
          </div>
        ) : (
          <div>
            {reviews.map((review, idx) => (
              <div
                key={review.id}
                style={{
                  padding: "20px 0",
                  borderBottom: idx < reviews.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 45,
                        height: 45,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 18,
                        fontWeight: "700",
                      }}
                    >
                      {review.ten_nguoi_danh_gia.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: "600", color: "#1a1a2e" }}>
                        {review.ten_nguoi_danh_gia}
                      </div>
                      <div style={{ fontSize: 12, color: "#888" }}>
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>
                  {renderStars(review.diem_danh_gia, false, 16)}
                </div>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, marginLeft: 57 }}>
                  {review.noi_dung}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default ReviewSection;
