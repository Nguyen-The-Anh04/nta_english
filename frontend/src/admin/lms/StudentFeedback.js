import { useState } from "react";
import {
  Search,
  Star,
  MessageSquare,
  User,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Filter,
  CheckCircle,
  XCircle
} from "lucide-react";

const feedbacks = [
  {
    id: "FB001",
    studentId: "HV001",
    studentName: "Nguyễn Văn A",
    avatar: "👨",
    course: "IELTS 5.5",
    class: "IELTS25-01",
    rating: 5,
    content: "Giảng viên rất nhiệt tình, phương pháp dạy dễ hiểu. Tôi đã cải thiện được kỹ năng listening rất nhiều sau 2 tháng học tại đây.",
    date: "2024-04-20",
    status: "da-phan-hoi",
    adminReply: "Cảm ơn phản hồi của bạn! Chúc bạn sớm đạt được mục tiêu IELTS!",
    likes: 12,
    dislikes: 0,
  },
  {
    id: "FB002",
    studentId: "HV002",
    studentName: "Trần Thị B",
    avatar: "👩",
    course: "TOEIC 750",
    class: "TOEIC25-02",
    rating: 4,
    content: "Khóa học khá tốt, giáo viên chuyên môn cao. Tuy nhiên thời gian học buổi tối hơi muộn, mong trung tâm có thể linh hoạt hơn về giờ giấc.",
    date: "2024-04-19",
    status: "da-phan-hoi",
    adminReply: "Cảm ơn góp ý của bạn. Chúng tôi sẽ xem xét điều chỉnh lịch học phù hợp hơn!",
    likes: 8,
    dislikes: 1,
  },
  {
    id: "FB003",
    studentId: "HV003",
    studentName: "Lê Văn C",
    avatar: "👨",
    course: "IELTS 6.5",
    class: "IELTS25-01",
    rating: 5,
    content: "Tuyệt vời! Đội ngũ giáo viên rất chuyên nghiệp, tài liệu học phong phú. Đặc biệt thích phương pháp luyện speaking của cô Mai.",
    date: "2024-04-18",
    status: "chua-phan-hoi",
    adminReply: null,
    likes: 15,
    dislikes: 0,
  },
  {
    id: "FB004",
    studentId: "HV004",
    studentName: "Phạm Thị D",
    avatar: "👩",
    course: "General English",
    class: "GE25-01",
    rating: 3,
    content: "Chưa hài lắm với chất lượng giảng dạy. Cảm thấy tiến độ học hơi chậm so với mong đợi.",
    date: "2024-04-17",
    status: "da-phan-hoi",
    adminReply: "Chúng tôi xin lỗi vì trải nghiệm chưa tốt. Đã tiếp nhận và sẽ cải thiện!",
    likes: 3,
    dislikes: 2,
  },
  {
    id: "FB005",
    studentId: "HV005",
    studentName: "Ngô Văn E",
    avatar: "👨",
    course: "IELTS Beginner",
    class: "IELTS25-02",
    rating: 4,
    content: "Mới join lớp được 1 tuần, cảm thấy khá ổn. Giáo viên kiên nhẫn, nhiệt tình với học viên mới.",
    date: "2024-04-20",
    status: "chua-phan-hoi",
    adminReply: null,
    likes: 6,
    dislikes: 0,
  },
];

const ratingConfig = {
  5: { label: "Xuất sắc", color: "#10b981", bg: "#d1fae5", stars: 5 },
  4: { label: "Tốt", color: "#3b82f6", bg: "#dbeafe", stars: 4 },
  3: { label: "Trung bình", color: "#f59e0b", bg: "#fef3c7", stars: 3 },
  2: { label: "Kém", color: "#ef4444", bg: "#fee2e2", stars: 2 },
  1: { label: "Rất kém", color: "#ef4444", bg: "#fee2e2", stars: 1 },
};

export default function StudentFeedback() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchesRating = filterRating === "all" || fb.rating === parseInt(filterRating);
    const matchesStatus = filterStatus === "all" || fb.status === filterStatus;
    const matchesSearch =
      fb.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRating && matchesStatus && matchesSearch;
  });

  const avgRating = (feedbacks.reduce((acc, fb) => acc + fb.rating, 0) / feedbacks.length).toFixed(1);

  return (
    <div>
      {/* Header Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Overall Rating */}
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            gridColumn: "span 1",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 14, color: "#64748b", marginBottom: 8 }}>Đánh giá trung bình</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ fontSize: 48, fontWeight: "800", color: "#1e293b" }}>{avgRating}</span>
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    fill={star <= Math.round(avgRating) ? "#f59e0b" : "none"}
                    color={star <= Math.round(avgRating) ? "#f59e0b" : "#cbd5e1"}
                  />
                ))}
              </div>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#94a3b8" }}>{feedbacks.length} đánh giá</p>
          </div>
        </div>

        {/* Rating Breakdown */}
        {Object.entries(ratingConfig).map(([rating, config]) => {
          const count = feedbacks.filter((fb) => fb.rating === parseInt(rating)).length;
          const percentage = Math.round((count / feedbacks.length) * 100);
          
          return (
            <div
              key={rating}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 16,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: "600", color: "#1e293b" }}>{config.stars}</span>
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontSize: 12, color: "#64748b" }}>{config.label}</span>
              </div>
              <div style={{ height: 8, background: "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${percentage}%`,
                    background: config.color,
                    borderRadius: 4,
                  }}
                />
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#94a3b8" }}>{count} đánh giá</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#f8fafc",
              borderRadius: 12,
              padding: "10px 16px",
              border: "1px solid #e2e8f0",
              flex: 1,
              minWidth: 250,
            }}
          >
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Tìm kiếm phản hồi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 14,
                color: "#1e293b",
                width: "100%",
              }}
            />
          </div>

          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              fontSize: 14,
              color: "#1e293b",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="all">Tất cả sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              fontSize: 14,
              color: "#1e293b",
              background: "white",
              cursor: "pointer",
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="chua-phan-hoi">Chưa phản hồi</option>
            <option value="da-phan-hoi">Đã phản hồi</option>
          </select>
        </div>
      </div>

      {/* Feedback Cards */}
      <div style={{ display: "grid", gap: 16 }}>
        {filteredFeedbacks.map((fb) => {
          const rating = ratingConfig[fb.rating];
          const hasReply = fb.adminReply !== null;

          return (
            <div
              key={fb.id}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: "#fef2f2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 24,
                    }}
                  >
                    {fb.avatar}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: "700", color: "#1e293b" }}>
                      {fb.studentName}
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                      {fb.course} • {fb.class}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <div style={{ display: "flex", gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={14}
                            fill={star <= fb.rating ? "#f59e0b" : "none"}
                            color={star <= fb.rating ? "#f59e0b" : "#cbd5e1"}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: 12, color: rating.color, fontWeight: "600" }}>
                        {rating.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span
                    style={{
                      padding: "6px 14px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: "600",
                      background: hasReply ? "#d1fae5" : "#fef3c7",
                      color: hasReply ? "#10b981" : "#f59e0b",
                    }}
                  >
                    {hasReply ? "Đã phản hồi" : "Chờ phản hồi"}
                  </span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {fb.date}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                }}
              >
                <p style={{ margin: 0, fontSize: 14, color: "#1e293b", lineHeight: 1.6 }}>
                  {fb.content}
                </p>
              </div>

              {/* Admin Reply */}
              {hasReply && (
                <div
                  style={{
                    background: "#dbeafe",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    borderLeft: "4px solid #3b82f6",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <CheckCircle size={16} color="#3b82f6" />
                    <span style={{ fontSize: 13, fontWeight: "600", color: "#3b82f6" }}>Phản hồi từ Admin</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: "#1e293b", lineHeight: 1.6 }}>
                    {fb.adminReply}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      color: "#64748b",
                    }}
                  >
                    <ThumbsUp size={14} />
                    {fb.likes}
                  </button>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      background: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: 13,
                      color: "#64748b",
                    }}
                  >
                    <ThumbsDown size={14} />
                    {fb.dislikes}
                  </button>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  {!hasReply && (
                    <button
                      style={{
                        padding: "10px 20px",
                        background: "#e11d48",
                        border: "none",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: "600",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <MessageSquare size={16} />
                      Phản hồi
                    </button>
                  )}
                  <button
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      background: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                    }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
