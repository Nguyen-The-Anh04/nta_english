import { useState } from "react";
import logo from "../assets/logo/Logo.jpeg";

export default function StudentLogin({ onLogin }) {
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
      // Demo student accounts - tất cả dùng mật khẩu: admin123
      const demoStudents = {
        "hocvien@nta.com": { name: "Nguyễn Văn Học Viên", email, role: "student", chuc_vu_id: 5 },
        "phuhuynh@nta.com": { name: "Phụ huynh học viên", email, role: "parent", chuc_vu_id: 5 },
      };
      
      const isDemoUser = demoStudents[email] !== undefined;
      const isValidPassword = password === "admin123";
      
      if (isDemoUser && isValidPassword) {
        const user = demoStudents[email];
        // Lưu thông tin user vào localStorage
        localStorage.setItem("chuc_vu_id", user.chuc_vu_id);
        localStorage.setItem("user_name", user.name);
        localStorage.setItem("user_email", user.email);
        localStorage.setItem("is_student_portal", "true");
        onLogin && onLogin(user);
      } else {
        setError("Email hoặc mật khẩu không đúng!");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: 20 }}>
      {/* Login Card */}
      <div style={{ background: "white", borderRadius: 16, padding: 40, width: "100%", maxWidth: 420, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src={logo}
            alt="Logo"
            style={{ width: 70, height: 70, borderRadius: 16, objectFit: "cover", margin: "0 auto 16px" }}
          />
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: "bold", color: "#333" }}>
            NTA <span style={{ color: "#e11d48" }}>Center</span>
          </h1>
          <p style={{ margin: "12px 0 0", fontSize: 14, color: "#666" }}>Portal Học viên - Đăng nhập để tiếp tục</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ background: "#fee2e2", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{ fontSize: 13, color: "#dc2626", fontWeight: "500" }}>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: "600", color: "#333" }}>
              Email học viên
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#999" }}>📧</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email học viên..."
                style={{
                  width: "100%",
                  padding: "14px 14px 14px 44px",
                  borderRadius: 10,
                  border: "1px solid #e5e5e5",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 8, fontSize: 14, fontWeight: "600", color: "#333" }}>
              Mật khẩu
            </label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "#999" }}>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                style={{
                  width: "100%",
                  padding: "14px 44px 14px 44px",
                  borderRadius: 10,
                  border: "1px solid #e5e5e5",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              background: loading ? "#ccc" : "#e11d48",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Demo Accounts Info */}
        <div style={{ marginTop: 24, padding: 16, background: "#f5f5f5", borderRadius: 10 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#666", textAlign: "center", fontWeight: "600" }}>
            📌 Tài khoản demo (mật khẩu: admin123)
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 11, color: "#888", textAlign: "center" }}>
            hocvien@nta.com | phuhuynh@nta.com
          </p>
        </div>

        {/* Back to Home */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            onClick={() => window.navigateTo && window.navigateTo("home")}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              fontSize: 13,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            ← Quay về trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}