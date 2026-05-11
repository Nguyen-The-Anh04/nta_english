import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { onlineExamAPI } from "../api";

export default function OnlineExamListPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const res = await onlineExamAPI.getAllExams();
      if (res.success) {
        setExams(res.data || []);
      } else {
        setError(res.message || "Lỗi tải danh sách đề thi");
      }
    } catch (e) {
      console.error(e);
      setError("Lỗi kết nối server");
    }
    setLoading(false);
  };

  const handleStartExam = (examId) => {
    // Navigate to exam page with exam ID
    navigate(`/thi/${examId}`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: "#dcfce7", color: "#166534" },
      inactive: { bg: "#f3f4f6", color: "#6b7280" },
      draft: { bg: "#fef3c7", color: "#92400e" },
    };
    const labels = {
      active: "Sẵn sàng",
      inactive: "Đã đóng",
      draft: "Nháp",
    };
    const s = styles[status] || styles.draft;
    return (
      <span
        style={{
          padding: "4px 12px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: 600,
          background: s.bg,
          color: s.color,
        }}
      >
        {labels[status] || "Nháp"}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", padding: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <div style={{ fontSize: 18, color: "#6b7280" }}>Đang tải danh sách đề thi...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", padding: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
          <div style={{ fontSize: 18, color: "#dc2626", marginBottom: 16 }}>{error}</div>
          <button
            onClick={loadExams}
            style={{
              padding: "12px 24px",
              background: "#111827",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)",
        padding: "60px 24px 40px",
        textAlign: "center",
        color: "white",
      }}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, marginBottom: 12 }}>
          📝 Thi Online
        </h1>
        <p style={{ margin: 0, fontSize: 18, opacity: 0.9, maxWidth: 600, margin: "0 auto" }}>
          Luyện thi IELTS, TOEIC với các đề thi chuẩn quốc tế
        </p>
      </header>

      {/* Exam List */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 24px" }}>
        {exams.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, background: "white", borderRadius: 12 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <div style={{ fontSize: 18, color: "#6b7280" }}>Chưa có đề thi nào</div>
            <p style={{ color: "#9ca3af", marginTop: 8 }}>Vui lòng quay lại sau</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {exams.map((exam) => (
              <div
                key={exam.id}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: 24,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #e5e7eb",
                  transition: "all 0.2s",
                }}
              >
                {/* Exam Title */}
                <h3 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 700, color: "#111827" }}>
                  {exam.title}
                </h3>
                
                {/* Description */}
                <p style={{ margin: "0 0 16px", fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
                  {exam.description || "Ôn luyện kiến thức và kỹ năng tiếng Anh"}
                </p>
                
                {/* Status */}
                <div style={{ marginBottom: 16 }}>
                  {getStatusBadge(exam.status)}
                </div>
                
                {/* Info */}
                <div style={{ display: "flex", gap: 16, marginBottom: 20, fontSize: 13, color: "#6b7280" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span>⏱️</span>
                    <span>{exam.duration} phút</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span>📊</span>
                    <span>{exam.question_count || exam.questions?.length || 0} câu</span>
                  </div>
                </div>
                
                {/* Start Button */}
                <button
                  onClick={() => handleStartExam(exam.id)}
                  disabled={exam.status !== "active"}
                  style={{
                    width: "100%",
                    padding: "12px 20px",
                    background: exam.status === "active" 
                      ? "linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)" 
                      : "#9ca3af",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: exam.status === "active" ? "pointer" : "not-allowed",
                    transition: "all 0.2s",
                  }}
                >
                  {exam.status === "active" ? "Bắt đầu thi ngay" : "Đề thi đã đóng"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back Button */}
      <div style={{ textAlign: "center", paddingBottom: 40 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "#6b7280",
            border: "1px solid #d1d5db",
            borderRadius: 8,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          ← Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}