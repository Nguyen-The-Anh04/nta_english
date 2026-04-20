import { useState, useEffect } from "react";
import logo from "../../assets/logo/Logo.jpeg";

// Mock data - sẽ được thay thế bằng API thực tế
const studentData = {
  id: "HV001",
  name: "Nguyễn Văn A",
  email: "nguyenvana@gmail.com",
  phone: "0912 345 678",
  courses: [
    { id: 1, name: "IELTS 5.5", class: "IELTS25-01", teacher: "Trần Thị Hương", schedule: "T2, T4, T6 - 18:00-20:30" },
    { id: 2, name: "Giao tiếp", class: "GT25-01", teacher: "Lê Minh", schedule: "T5 - 19:00-21:00" },
  ],
  scores: [
    { subject: "IELTS Listening", score: 5.5, date: "2025-01-15" },
    { subject: "IELTS Reading", score: 6.0, date: "2025-01-15" },
    { subject: "IELTS Speaking", score: 5.0, date: "2025-01-20" },
    { subject: "IELTS Writing", score: 5.5, date: "2025-01-20" },
  ],
  homeworks: [
    { id: 1, title: "IELTS Writing Task 1", subject: "IELTS", dueDate: "2025-02-10", status: "chua-nop" },
    { id: 2, title: "Speaking Part 2", subject: "IELTS", dueDate: "2025-02-08", status: "da-nop" },
    { id: 3, title: "Từ vựng Unit 5", subject: "Giao tiếp", dueDate: "2025-02-12", status: "chua-nop" },
  ],
  payments: [
    { id: 1, month: "Tháng 1/2025", amount: 3500000, status: "da-thanh-toan", date: "2025-01-05" },
    { id: 2, month: "Tháng 2/2025", amount: 3500000, status: "chua-thanh-toan", date: null },
  ],
};

const menuItems = [
  { id: "home", label: "Trang chủ", icon: "🏠" },
  { id: "schedule", label: "Lịch học", icon: "📅" },
  { id: "test", label: "Lịch test", icon: "📋" },
  { id: "scores", label: "Điểm số", icon: "📊" },
  { id: "homework", label: "Bài tập", icon: "📝" },
  { id: "payment", label: "Học phí", icon: "💰" },
];

export default function StudentPortal({ onLogout }) {
  const [activePage, setActivePage] = useState("home");
  const userName = localStorage.getItem("user_name") || studentData.name;

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("chuc_vu_id");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
      if (onLogout) {
        onLogout();
      }
      window.navigateTo && window.navigateTo("home");
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "home":
        return <HomePage />;
      case "schedule":
        return <SchedulePage />;
      case "test":
        return <TestPage />;
      case "scores":
        return <ScoresPage />;
      case "homework":
        return <HomeworkPage />;
      case "payment":
        return <PaymentPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: "#e11d48",
        color: "white",
        position: "fixed",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Logo */}
        <div style={{
          padding: "16px",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <img src={logo} alt="Logo" style={{ width: 40, height: 40, borderRadius: 8 }} />
          <div>
            <span style={{ fontSize: 16, fontWeight: "bold", display: "block" }}>NTA Center</span>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Học viên</span>
          </div>
        </div>

        {/* Menu */}
        <nav style={{ padding: "16px 8px", flex: 1 }}>
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  padding: "12px 14px",
                  marginBottom: 4,
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: isActive ? "600" : "400" }}>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div style={{
          padding: "16px",
          borderTop: "1px solid rgba(255,255,255,0.2)",
        }}>
          <div style={{ marginBottom: 12, padding: "8px", background: "rgba(255,255,255,0.1)", borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: "600" }}>{userName}</p>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>{studentData.id}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 8,
              color: "white",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: 240, padding: 24 }}>
        {renderPage()}
      </main>
    </div>
  );
}

// ==================== PAGE COMPONENTS ====================

function HomePage() {
  return (
    <div>
      <h2 style={{ color: "#333", marginBottom: 24 }}>Xin chào, {studentData.name}! 👋</h2>
      
      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="📚" label="Khóa học" value={studentData.courses.length} color="#3b82f6" />
        <StatCard icon="📝" label="Bài tập" value={studentData.homeworks.filter(h => h.status === "chua-nop").length} color="#ef4444" />
        <StatCard icon="💰" label="Học phí" value={studentData.payments.filter(p => p.status === "chua-thanh-toan").length} color="#f59e0b" />
        <StatCard icon="📊" label="Điểm TB" value="5.5" color="#10b981" />
      </div>

      {/* Recent Courses */}
      <div style={{ background: "white", borderRadius: 12, padding: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, color: "#333" }}>Khóa học của tôi</h3>
        {studentData.courses.map((course) => (
          <div key={course.id} style={{ 
            padding: 16, 
            border: "1px solid #e5e5e5", 
            borderRadius: 8, 
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <h4 style={{ margin: 0, color: "#333" }}>{course.name}</h4>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>Lớp: {course.class} - GV: {course.teacher}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#666" }}>{course.schedule}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SchedulePage() {
  return (
    <div>
      <h2 style={{ color: "#333", marginBottom: 24 }}>Lịch học</h2>
      <div style={{ background: "white", borderRadius: 12, padding: 20 }}>
        {studentData.courses.map((course) => (
          <div key={course.id} style={{ 
            padding: 16, 
            border: "1px solid #e5e5e5", 
            borderRadius: 8, 
            marginBottom: 12,
          }}>
            <h4 style={{ margin: "0 0 8px", color: "#333" }}>{course.name}</h4>
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
              <strong>Lớp:</strong> {course.class} | <strong>GV:</strong> {course.teacher}
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>
              <strong>Lịch:</strong> {course.schedule}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Test Page - Lịch test cho học viên
function TestPage() {
  const [lichTests, setLichTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    loadLichTest();
  }, []);

  const loadLichTest = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/test/my-lich-test", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLichTests(Array.isArray(data.data) ? data.data : []);
      }
    } catch (e) {
      console.error("Lỗi load lịch test:", e);
    }
    setLoading(false);
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN");
  };

  const getStatusBadge = (status) => {
    const cfg = {
      "cho_test": { bg: "#fef3c7", color: "#92400e", label: "Chờ test" },
      "dang_test": { bg: "#dbeafe", color: "#1d4ed8", label: "Đang test" },
      "hoan_thanh": { bg: "#d1fae5", color: "#065f46", label: "Hoàn thành" },
      "huy": { bg: "#fee2e2", color: "#991b1b", label: "Đã hủy" },
    };
    const s = cfg[status] || cfg["cho_test"];
    return <span style={{ padding: "4px 10px", borderRadius: 12, fontSize: 12, background: s.bg, color: s.color }}>{s.label}</span>;
  };

  const handleStartTest = (lich) => {
    setSelectedTest(lich);
    setShowTestModal(true);
  };

  return (
    <div>
      <h2 style={{ color: "#333", marginBottom: 24 }}>Lịch test</h2>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#666" }}>Đang tải...</div>
      ) : lichTests.length === 0 ? (
        <div style={{ background: "white", borderRadius: 12, padding: 40, textAlign: "center" }}>
          <p style={{ color: "#666" }}>Chưa có lịch test nào</p>
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: 12, padding: 20 }}>
          {lichTests.map((lich) => (
            <div key={lich.id} style={{ 
              padding: 20, 
              border: "1px solid #e5e5e5", 
              borderRadius: 10, 
              marginBottom: 16,
              background: lich.trang_thai === "hoan_thanh" ? "#f0fdf4" : "#fff",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h4 style={{ margin: "0 0 6px", color: "#333", fontSize: 16 }}>{lich.deThi?.ten_de || "Đề thi"}</h4>
                  <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
                    <strong>Ngày:</strong> {formatDateTime(lich.thoi_gian)} | <strong>Địa điểm:</strong> {lich.dia_diem || "—"}
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>
                    <strong>Giáo viên:</strong> {lich.giaoVien?.ho_ten || "—"}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {getStatusBadge(lich.trang_thai)}
                  {lich.trang_thai !== "hoan_thanh" && lich.trang_thai !== "huy" && (
                    <button 
                      onClick={() => handleStartTest(lich)}
                      style={{
                        padding: "8px 16px",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      Làm bài
                    </button>
                  )}
                </div>
              </div>
              {lich.ketQuas && lich.ketQuas.length > 0 && (
                <div style={{ marginTop: 12, padding: 12, background: "#f9fafb", borderRadius: 8 }}>
                  <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: "600", color: "#374151" }}>Kết quả:</p>
                  {lich.ketQuas.map((kq, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#666" }}>Ngày: {kq.ngay_lam ? new Date(kq.ngay_lam).toLocaleDateString("vi-VN") : "—"}</span>
                      <span style={{ fontSize: 12, fontWeight: "600", color: kq.diem_tong >= 5 ? "#059669" : "#dc2626" }}>
                        Điểm: {kq.diem_tong ?? "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal làm bài test */}
      {showTestModal && selectedTest && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 12, padding: 24, width: 600, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 16px", color: "#111827" }}>Làm bài test: {selectedTest.deThi?.ten_de}</h3>
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: "0 0 8px", fontSize: 13, color: "#666" }}>
                <strong>Ngày giờ:</strong> {formatDateTime(selectedTest.thoi_gian)}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
                <strong>Giáo viên:</strong> {selectedTest.giaoVien?.ho_ten || "—"}
              </p>
            </div>
            {selectedTest.deThi?.file_pdf ? (
              <div style={{ marginTop: 16 }}>
                <p style={{ margin: "0 0 12px", fontSize: 13, color: "#374151" }}>
                  Bạn sẽ làm bài test với file đề thi. Sau khi hoàn thành, nhập điểm số:
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Điểm Nghe</label>
                    <input type="number" placeholder="0-10" style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Điểm Đọc</label>
                    <input type="number" placeholder="0-10" style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Điểm Nói</label>
                    <input type="number" placeholder="0-10" style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: 6 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>Điểm Viết</label>
                    <input type="number" placeholder="0-10" style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: 6 }} />
                  </div>
                </div>
                <a 
                  href={`http://localhost:5000/uploads/${selectedTest.deThi.file_pdf}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: "inline-block", marginTop: 16, color: "#2563eb", textDecoration: "underline" }}
                >
                  Xem file đề thi PDF
                </a>
              </div>
            ) : (
              <p style={{ color: "#666" }}>Chưa có file đề thi</p>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button 
                onClick={() => setShowTestModal(false)}
                style={{ padding: "10px 20px", border: "1px solid #d1d5db", borderRadius: 6, background: "white", cursor: "pointer" }}
              >
                Đóng
              </button>
              <button 
                style={{ padding: "10px 20px", background: "#dc2626", color: "white", border: "none", borderRadius: 6, cursor: "pointer" }}
              >
                Nộp bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoresPage() {
  const avgScore = (studentData.scores.reduce((sum, s) => sum + s.score, 0) / studentData.scores.length).toFixed(1);
  
  return (
    <div>
      <h2 style={{ color: "#333", marginBottom: 24 }}>Điểm số</h2>
      
      {/* Average Score */}
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
        borderRadius: 12, 
        padding: 24, 
        color: "white",
        marginBottom: 24
      }}>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>Điểm trung bình</p>
        <p style={{ margin: "8px 0 0", fontSize: 48, fontWeight: "bold" }}>{avgScore}</p>
      </div>

      {/* Score List */}
      <div style={{ background: "white", borderRadius: 12, padding: 20 }}>
        {studentData.scores.map((score, index) => (
          <div key={index} style={{ 
            padding: 16, 
            borderBottom: index < studentData.scores.length - 1 ? "1px solid #e5e5e5" : "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <p style={{ margin: 0, fontWeight: "600", color: "#333" }}>{score.subject}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>{score.date}</p>
            </div>
            <div style={{ 
              padding: "8px 16px", 
              background: score.score >= 5 ? "#d1fae5" : "#fee2e2",
              color: score.score >= 5 ? "#059669" : "#dc2626",
              borderRadius: 8,
              fontWeight: "600"
            }}>
              {score.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeworkPage() {
  const pendingHomeworks = studentData.homeworks.filter(h => h.status === "chua-nop");
  const submittedHomeworks = studentData.homeworks.filter(h => h.status === "da-nop");
  
  return (
    <div>
      <h2 style={{ color: "#333", marginBottom: 24 }}>Bài tập</h2>
      
      {/* Pending */}
      <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, color: "#ef4444" }}>
          Chờ nộp ({pendingHomeworks.length})
        </h3>
        {pendingHomeworks.map((hw) => (
          <div key={hw.id} style={{ 
            padding: 16, 
            border: "1px solid #fee2e2", 
            borderRadius: 8, 
            marginBottom: 12,
            background: "#fef2f2",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: 0, color: "#333" }}>{hw.title}</h4>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{hw.subject}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 12, color: "#ef4444" }}>Hạn: {hw.dueDate}</p>
                <button style={{
                  marginTop: 8,
                  padding: "8px 16px",
                  background: "#e11d48",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 13,
                }}>
                  Nộp bài
                </button>
              </div>
            </div>
          </div>
        ))}
        {pendingHomeworks.length === 0 && (
          <p style={{ color: "#666", textAlign: "center" }}>Không có bài tập chờ nộp 🎉</p>
        )}
      </div>

      {/* Submitted */}
      <div style={{ background: "white", borderRadius: 12, padding: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, color: "#10b981" }}>
          Đã nộp ({submittedHomeworks.length})
        </h3>
        {submittedHomeworks.map((hw) => (
          <div key={hw.id} style={{ 
            padding: 16, 
            border: "1px solid #d1fae5", 
            borderRadius: 8, 
            marginBottom: 12,
            background: "#f0fdf4",
          }}>
            <h4 style={{ margin: 0, color: "#333" }}>{hw.title}</h4>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>{hw.subject} - Hạn: {hw.dueDate}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentPage() {
  const unpaid = studentData.payments.find(p => p.status === "chua-thanh-toan");
  
  return (
    <div>
      <h2 style={{ color: "#333", marginBottom: 24 }}>Học phí</h2>
      
      {/* Unpaid Alert */}
      {unpaid && (
        <div style={{ 
          background: "#fef3c7", 
          border: "1px solid #f59e0b", 
          borderRadius: 12, 
          padding: 20, 
          marginBottom: 24,
        }}>
          <h3 style={{ marginTop: 0, color: "#92400e" }}>Cần thanh toán</h3>
          <p style={{ color: "#92400e", marginBottom: 16 }}>
            {unpaid.month}: <strong>{unpaid.amount.toLocaleString()} VNĐ</strong>
          </p>
          <button style={{
            padding: "12px 24px",
            background: "#f59e0b",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: "600",
          }}>
            Thanh toán ngay
          </button>
        </div>
      )}

      {/* Payment History */}
      <div style={{ background: "white", borderRadius: 12, padding: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, color: "#333" }}>Lịch sử thanh toán</h3>
        {studentData.payments.map((payment) => (
          <div key={payment.id} style={{ 
            padding: 16, 
            borderBottom: "1px solid #e5e5e5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <p style={{ margin: 0, fontWeight: "600", color: "#333" }}>{payment.month}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>
                {payment.date || "Chưa thanh toán"}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontWeight: "600", color: "#333" }}>
                {payment.amount.toLocaleString()} VNĐ
              </p>
              <span style={{ 
                fontSize: 12, 
                padding: "4px 8px", 
                borderRadius: 4,
                background: payment.status === "da-thanh-toan" ? "#d1fae5" : "#fee2e2",
                color: payment.status === "da-thanh-toan" ? "#059669" : "#dc2626",
              }}>
                {payment.status === "da-thanh-toan" ? "Đã thanh toán" : "Chờ thanh toán"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: "white", borderRadius: 12, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ 
          width: 48, 
          height: 48, 
          borderRadius: 12, 
          background: color + "20", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          fontSize: 24
        }}>
          {icon}
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{label}</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: "#333" }}>{value}</p>
        </div>
      </div>
    </div>
  );
}