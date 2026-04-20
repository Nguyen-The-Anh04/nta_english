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

    // Gọi thẳng API backend để lấy JWT token thật
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), mat_khau: password }),
      });
      const data = await res.json();

      if (data.success && data.data?.token) {
        const user = data.data.user;
        // Lưu token và thông tin user
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("admin_token", data.data.token);
        localStorage.setItem("adminLoggedIn", "true");
        localStorage.setItem("chuc_vu_id", user.chuc_vu_id);
        localStorage.setItem("user_name", user.ho_ten || user.email);
        localStorage.setItem("user_email", user.email);
        localStorage.setItem("adminUser", JSON.stringify(user));
        setLoading(false);
        onLogin && onLogin({ ...user, name: user.ho_ten, role: "admin", chuc_vu_id: user.chuc_vu_id });
      } else {
        setError(data.message || "Email hoặc mật khẩu không đúng!");
        setLoading(false);
      }
    } catch (err) {
      setError("Không thể kết nối server!");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", padding: 20 }}>
      {/* Login Card */}
      <div style={{ background: "white", borderRadius: 12, padding: 40, width: "100%", maxWidth: 400, boxShadow: "0 4px 20px rgba(0,0,0,0.1)", border: "2px solid #e53935" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img
            src={logo}
            alt="Logo"
            style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover", margin: "0 auto 12px" }}
          />
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: "black" }}>
            NTA <span style={{ color: "#e53935" }}>Admin</span>
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#333" }}>Đăng nhập để quản lý hệ thống</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ background: "#ffebee", borderRadius: 8, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#c62828", fontWeight: "500" }}>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "black", marginBottom: 6 }}>Email</label>
            <input
              type="email"
              placeholder="admin@nta.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "2px solid #333", fontSize: 14, color: "black", outline: "none", boxSizing: "border-box" }}
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
                style={{ width: "100%", padding: "12px 40px 12px 14px", borderRadius: 8, border: "2px solid #333", fontSize: 14, color: "black", outline: "none", boxSizing: "border-box" }}
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
              <input type="checkbox" style={{ width: 16, height: 16, accentColor: "#e53935" }} />
              <span style={{ fontSize: 13, color: "#333" }}>Ghi nhớ</span>
            </label>
            <a href="#" style={{ fontSize: 13, color: "#e53935", fontWeight: "600", textDecoration: "none" }}>Quên mật khẩu?</a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "14px", background: loading ? "#999" : "#e53935", border: "none", borderRadius: 8, fontSize: 14, fontWeight: "700", color: "white", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Demo Info */}
        <div style={{ marginTop: 20, padding: 14, background: "#fafafa", borderRadius: 8, border: "1px solid #ddd" }}>
          <p style={{ margin: "0 0 6px", fontSize: 12, color: "#333", fontWeight: 600 }}>Tài khoản demo (mật khẩu: admin123)</p>
          {[
            ["admin@nta.vn", "Admin — toàn quyền"],
            ["lan@nta.vn", "Sale — quản lý leads"],
            ["hung@nta.vn", "Giáo viên — lớp học, bài tập"],
            ["nguyentheanh2018hy@gmail.com", "Admin — toàn quyền"],
          ].map(([e, label]) => (
            <div key={e} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555", marginBottom: 2 }}>
              <span style={{ color: "#e53935", cursor: "pointer" }} onClick={() => setEmail(e)}>{e}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Back to home */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => window.navigateTo && window.navigateTo("home")} style={{ background: "none", border: "none", fontSize: 13, color: "#333", cursor: "pointer" }}>
            ← Quay lại trang chủ
          </button>
        </div>
      </div>
    </div>
  );
}
