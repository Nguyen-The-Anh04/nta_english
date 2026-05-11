import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LMSAdminLayout from "../admin/lms/LMSAdminLayout";
import KeToanDashboard from "../admin/lms/KeToanDashboard";
import CongNo from "../admin/lms/CongNo";
import PhieuThuChi from "../admin/lms/PhieuThuChi";
import PaymentManagement from "../admin/lms/PaymentManagement";
import { login } from "../api";

export default function KeToanPortal() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [sdt, setSdt] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState("ke-toan");

  useEffect(() => {
    const savedUser = localStorage.getItem("kt_user");
    const savedToken = localStorage.getItem("kt_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await login(sdt, password);
      if (res.success && res.data) {
        const u = res.data.user;
        // Chỉ cho phép kế toán (chuc_vu_id = 4) hoặc admin (1)
        if (u.chuc_vu_id !== 4 && u.chuc_vu_id !== 1) {
          setError("Tài khoản không có quyền truy cập kế toán!");
          setLoading(false);
          return;
        }
        localStorage.setItem("kt_token", res.data.token);
        localStorage.setItem("kt_user", JSON.stringify(u));
        setUser(u);
        setIsLoggedIn(true);
      } else {
        setError(res.message || "Sai thông tin đăng nhập!");
      }
    } catch {
      setError("Lỗi kết nối máy chủ!");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("kt_token");
    localStorage.removeItem("kt_user");
    setUser(null);
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 40, width: "100%", maxWidth: 400, boxShadow: "0 4px 24px rgba(0,0,0,.12)", border: "2px solid #10b981" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48 }}>💰</div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: "#059669" }}>Portal Kế Toán</h1>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: "#555" }}>Đăng nhập để quản lý tài chính</p>
          </div>

          {error && (
            <div style={{ background: "#fef2f2", borderRadius: 8, padding: "10px 14px", marginBottom: 20, color: "#dc2626", fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>Số điện thoại / Email</label>
              <input
                value={sdt} onChange={e => setSdt(e.target.value)}
                placeholder="Nhập SĐT hoặc email"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "2px solid #d1d5db", fontSize: 14, boxSizing: "border-box", outline: "none" }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 6 }}>Mật khẩu</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "2px solid #d1d5db", fontSize: 14, boxSizing: "border-box", outline: "none" }}
              />
            </div>
            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: 14, background: loading ? "#9ca3af" : "#059669", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, color: "#fff", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button onClick={() => navigate("/")} style={{ background: "none", border: "none", fontSize: 13, color: "#555", cursor: "pointer", textDecoration: "underline" }}>
              ← Quay lại trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "ke-toan":      return <KeToanDashboard onNavigate={setActivePage} />;
      case "cong-no":      return <CongNo />;
      case "phieu-thu-chi": return <PhieuThuChi />;
      case "payment":      return <PaymentManagement />;
      default:             return <KeToanDashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <LMSAdminLayout
      activePage={activePage}
      onNavigate={setActivePage}
      onLogout={handleLogout}
      role={4}
      userName={user?.ho_ten || "Kế toán"}
    >
      {renderPage()}
    </LMSAdminLayout>
  );
}
