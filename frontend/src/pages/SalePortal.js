import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LMSAdminLayout from "../admin/lms/LMSAdminLayout";

// Demo sale account
const DEMO_SALE = {
  email: "sale@nta.com",
  password: "admin123",
  user: { id: 1, ho_ten: "Nguyễn Văn Sale", email: "sale@nta.com", chuc_vu_id: 2 }
};

export default function SalePortal() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("leads");

  useEffect(() => {
    // Check if already logged in
    const savedUser = localStorage.getItem("sale_user");
    const savedToken = localStorage.getItem("sale_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Check demo account
    if (email === DEMO_SALE.email && password === DEMO_SALE.password) {
      localStorage.setItem("sale_token", "demo_token_" + Date.now());
      localStorage.setItem("sale_user", JSON.stringify(DEMO_SALE.user));
      setUser(DEMO_SALE.user);
      setIsLoggedIn(true);
    } else {
      setError("Email hoặc mật khẩu không đúng!");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("sale_token");
    localStorage.removeItem("sale_user");
    setUser(null);
    setIsLoggedIn(false);
    // Stay on /sale, will show login form
  };

  // Login screen
  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 40, width: "100%", maxWidth: 400, boxShadow: "0 4px 24px rgba(0,0,0,.15)", border: "2px solid #e53935" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, color: "#e53935" }}>💼</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: "#e53935" }}>
              Portal Kinh Doanh
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#333" }}>Đăng nhập để quản lý leads</p>
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
                placeholder="sale@nta.com"
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
            <strong>📌 Demo:</strong> sale@nta.com<br />
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

  // Sale portal with LMSAdminLayout (role = 2 for sale)
  return (
    <LMSAdminLayout
      activePage={activePage}
      onNavigate={setActivePage}
      onLogout={handleLogout}
      role={2}
      userName={user?.ho_ten || "Nhân viên kinh doanh"}
    />
  );
}