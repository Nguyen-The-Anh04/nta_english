import { useState } from "react";
import logo from "../assets/logo/Logo.jpeg";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      if (email === "admin@nta.com" && password === "admin123") {
        onLogin && onLogin({ name: "Admin NTA", email, role: "admin" });
      } else {
        setError("Email hoặc mật khẩu không đúng!");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", padding: 20 }}>
      {/* Login Card */}
      <div style={{ background: "white", borderRadius: 12, padding: 40, width: "100%", maxWidth: 400, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src={logo}
            alt="Logo"
            style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover", margin: "0 auto 12px" }}
          />
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: "black" }}>
            NTA <span style={{ color: "#e11d48" }}>Admin</span>
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#666" }}>Đăng nhập để quản lý hệ thống</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ background: "#fee2e2", borderRadius: 8, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#ef4444", fontWeight: "500" }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "black", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              placeholder="admin@nta.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "2px solid #ddd", fontSize: 14, color: "black", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "black", marginBottom: 6 }}>Mật khẩu</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: "12px 40px 12px 14px", borderRadius: 8, border: "2px solid #ddd", fontSize: 14, color: "black", outline: "none", boxSizing: "border-box" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", padding: 0 }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" style={{ width: 16, height: 16, accentColor: "#e11d48" }} />
              <span style={{ fontSize: 13, color: "#666" }}>Ghi nhớ</span>
            </label>
            <a href="#" style={{ fontSize: 13, color: "#e11d48", fontWeight: "600", textDecoration: "none" }}>Quên mật khẩu?</a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", background: loading ? "#999" : "#e11d48", border: "none", borderRadius: 8, fontSize: 14, fontWeight: "700", color: "white", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Demo Info */}
        <div style={{ marginTop: 20, padding: 14, background: "#f5f5f5", borderRadius: 8, textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
            Demo: <strong>admin@nta.com</strong> / <strong>admin123</strong>
          </p>
        </div>

        {/* Back to home */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => window.navigateTo && window.navigateTo("home")} style={{ background: "none", border: "none", fontSize: 13, color: "#666", cursor: "pointer" }}>
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
