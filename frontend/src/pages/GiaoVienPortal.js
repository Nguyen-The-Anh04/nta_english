import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LMSAdminLayout from "../admin/lms/LMSAdminLayout";
import { loginDemo } from "../api";

// Demo teacher account
const DEMO_TEACHER = {
  email: "giaovien@nta.com",
  password: "admin123",
  user: { id: 1, ho_ten: "Trần Thị Giáo Viên", email: "giaovien@nta.com", chuc_vu_id: 3 }
};

export default function GiaoVienPortal() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("class-management");

  useEffect(() => {
    // Check if already logged in
    const savedUser = localStorage.getItem("gv_user");
    const savedToken = localStorage.getItem("gv_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check demo account
    if (email === DEMO_TEACHER.email && password === DEMO_TEACHER.password) {
      try {
        // Use loginDemo API to get valid JWT token
        const res = await loginDemo(email, DEMO_TEACHER.user.id);
        if (res.success && res.data && res.data.token) {
          localStorage.setItem("gv_token", res.data.token);
          localStorage.setItem("gv_user", JSON.stringify(res.data.user));
          setUser(res.data.user);
          setIsLoggedIn(true);
        } else {
          // Fallback
          localStorage.setItem("gv_token", "demo_token_" + Date.now());
          localStorage.setItem("gv_user", JSON.stringify(DEMO_TEACHER.user));
          setUser(DEMO_TEACHER.user);
          setIsLoggedIn(true);
        }
      } catch (err) {
        // Fallback
        localStorage.setItem("gv_token", "demo_token_" + Date.now());
        localStorage.setItem("gv_user", JSON.stringify(DEMO_TEACHER.user));
        setUser(DEMO_TEACHER.user);
        setIsLoggedIn(true);
      }
    } else {
      setError("Email hoặc mật khẩu không đúng!");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("gv_token");
    localStorage.removeItem("gv_user");
    setUser(null);
    setIsLoggedIn(false);
    // Stay on /giaovien, will show login form
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 40, width: "100%", maxWidth: 400, boxShadow: "0 4px 24px rgba(0,0,0,.15)", border: "2px solid #e53935" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, color: "#e53935" }}>👩‍🏫</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: "#e53935" }}>
              Portal Giáo Viên
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#333" }}>Đăng nhập để quản lý lớp học</p>
          </div>

          {error && (
            <div style={{ background: "#ffebee", borderRadius: 8, padding: "10px 14px", marginBottom: 20, color: "#c62828", fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="giaovien@nta.com"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "2px solid #333", fontSize: 14, boxSizing: "border-box", color: "#000" }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "2px solid #333", fontSize: 14, boxSizing: "border-box", color: "#000" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "14px", background: loading ? "#999" : "#e53935", border: "none", borderRadius: 8, fontSize: 14, fontWeight: "700", color: "white", cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: 14, background: "#fafafa", borderRadius: 8, fontSize: 12, color: "#333", textAlign: "center", border: "1px solid #ddd" }}>
            <strong>📌 Demo:</strong> giaovien@nta.com<br />
            <strong>Mật khẩu:</strong> admin123
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", fontSize: 13, color: "#333", cursor: "pointer", textDecoration: "underline" }}>
              ← Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Teacher portal with LMSAdminLayout (role = 3 for teacher)
  return (
    <LMSAdminLayout
      activePage={activePage}
      onNavigate={setActivePage}
      onLogout={handleLogout}
      role={3}
      userName={user?.ho_ten || "Giáo viên"}
    />
  );
}