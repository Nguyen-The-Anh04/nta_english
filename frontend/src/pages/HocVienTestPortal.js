import { useState, useEffect } from "react";
import { testAPI, login, examAPI } from "../api";
import LamBai from "./LamBai";

const TRANG_THAI_CFG = {
  cho_test: { label: "Chờ test", bg: "#fef3c7", color: "#92400e" },
  dang_test: { label: "Đang test", bg: "#dbeafe", color: "#1d4ed8" },
  hoan_thanh: { label: "Hoàn thành", bg: "#d1fae5", color: "#065f46" },
  huy: { label: "Đã hủy", bg: "#fee2e2", color: "#991b1b" },
};

export default function HocVienTestPortal() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [lichTests, setLichTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLich, setSelectedLich] = useState(null);
  const [showLamBai, setShowLamBai] = useState(false);
  const [deThiId, setDeThiId] = useState(null);
  const [lichHenTestId, setLichHenTestId] = useState(null);
  const [sdt, setSdt] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const savedToken = localStorage.getItem("hv_token");
    const savedUser = localStorage.getItem("hv_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (token) loadLichTests();
  }, [token]);

  const loadLichTests = async () => {
    setLoading(true);
    try {
      const res = await testAPI.getMyLichTest();
      setLichTests(res.data || res || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // Render LamBai if showing
  if (showLamBai && deThiId) {
    return (
      <LamBai 
        deThiId={deThiId} 
        lichHenTestId={lichHenTestId} 
        onHoanThanh={() => {
          setShowLamBai(false);
          setSelectedLich(null);
          loadLichTests();
        }} 
      />
    );
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await login(sdt, password);
      if (res.token) {
        localStorage.setItem("hv_token", res.token);
        localStorage.setItem("hv_user", JSON.stringify(res.user || { ho_ten: sdt }));
        setToken(res.token);
        setUser(res.user || { ho_ten: sdt });
      } else {
        setLoginError(res.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.");
      }
    } catch (e) {
      setLoginError("Không thể kết nối máy chủ.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hv_token");
    localStorage.removeItem("hv_user");
    setToken(null);
    setUser(null);
    setLichTests([]);
    setSelectedLich(null);
  };

  const cardStyle = {
    background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: 20, marginBottom: 14,
  };

  // ---- Login screen ----
  if (!token) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 36, width: 380, boxShadow: "0 4px 24px rgba(0,0,0,0.15)", border: "2px solid #e53935" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#e53935", marginBottom: 4 }}>Portal Học Viên</div>
          <div style={{ fontSize: 13, color: "#333", marginBottom: 24 }}>Kiểm tra đầu vào</div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#333", display: "block", marginBottom: 4 }}>Số điện thoại</label>
              <input
                type="text"
                value={sdt}
                onChange={e => setSdt(e.target.value)}
                placeholder="Nhập số điện thoại"
                required
                style={{ width: "100%", padding: "9px 12px", border: "2px solid #333", borderRadius: 7, fontSize: 14, boxSizing: "border-box", color: "#000" }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#333", display: "block", marginBottom: 4 }}>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
                style={{ width: "100%", padding: "9px 12px", border: "2px solid #333", borderRadius: 7, fontSize: 14, boxSizing: "border-box", color: "#000" }}
              />
            </div>
            {loginError && (
              <div style={{ fontSize: 13, color: "#c62828", marginBottom: 12, padding: "8px 12px", background: "#ffebee", borderRadius: 6 }}>{loginError}</div>
            )}
            <button
              type="submit"
              style={{ width: "100%", padding: "10px", background: "#e53935", color: "#fff", border: "none", borderRadius: 7, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Đăng nhập
            </button>
          </form>
          <div style={{ marginTop: 16, padding: "10px 12px", background: "#fafafa", borderRadius: 6, fontSize: 12, color: "#333", border: "1px solid #ddd" }}>
            Tài khoản: SĐT của bạn / Mật khẩu: 123456
          </div>
        </div>
      </div>
    );
  }

  // ---- Chi tiết lịch test ----
  if (selectedLich) {
    const lich = selectedLich;
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", padding: 24 }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <button
              onClick={() => setSelectedLich(null)}
              style={{ padding: "7px 16px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151" }}
            >
              ← Quay lại
            </button>
            <span style={{ fontSize: 13, color: "#6b7280" }}>Xin chào, {user?.ho_ten}</span>
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 16 }}>{lich.ten_de || "Bài kiểm tra đầu vào"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Giáo viên", value: lich.ten_giao_vien || "—" },
                { label: "Địa điểm", value: lich.dia_diem || "—" },
                { label: "Thời gian", value: lich.thoi_gian ? new Date(lich.thoi_gian).toLocaleString("vi-VN") : "—" },
                { label: "Loại đề", value: lich.loai?.toUpperCase() || "—" },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: "#111827" }}>{item.value}</div>
                </div>
              ))}
            </div>
            {lich.ghi_chu && (
              <div style={{ padding: "10px 14px", background: "#f9fafb", borderRadius: 6, fontSize: 13, color: "#374151", marginBottom: 16 }}>
                <span style={{ fontWeight: 600 }}>Ghi chú: </span>{lich.ghi_chu}
              </div>
            )}
            {lich.file_pdf && (
              <a
                href={`http://localhost:5000/uploads/${lich.file_pdf}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-block", padding: "8px 18px", background: "#1d4ed8", color: "#fff", borderRadius: 6, fontSize: 13, textDecoration: "none", marginBottom: 16 }}
              >
                Xem đề thi (PDF)
              </a>
            )}
          </div>

          {/* Kết quả */}
          <div style={cardStyle}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Kết quả bài test</div>
            {lich.ket_qua && lich.ket_qua.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Ngày làm", "Điểm tổng", "Nghe", "Đọc", "Nói", "Viết", "Thời gian (phút)"].map((h, i) => (
                      <th key={i} style={{ padding: "8px 10px", background: "#f3f4f6", color: "#374151", fontWeight: 600, textAlign: "left", border: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lich.ket_qua.map((kq, i) => (
                    <tr key={i}>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb" }}>{kq.ngay_lam ? new Date(kq.ngay_lam).toLocaleDateString("vi-VN") : "—"}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb", fontWeight: 700, color: "#111827" }}>{kq.diem_tong ?? "—"}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb" }}>{kq.diem_nghe ?? "—"}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb" }}>{kq.diem_doc ?? "—"}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb" }}>{kq.diem_noi ?? "—"}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb" }}>{kq.diem_viet ?? "—"}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb" }}>{kq.thoi_gian_lam ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "16px", background: "#f9fafb", borderRadius: 8, fontSize: 13, color: "#6b7280", textAlign: "center" }}>
                Vui lòng đến trung tâm để làm bài test
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- Danh sách lịch test ----
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Portal Học Viên</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 14, color: "#374151" }}>Xin chào, <strong>{user?.ho_ten}</strong></span>
          <button
            onClick={handleLogout}
            style={{ padding: "6px 14px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151" }}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Lịch kiểm tra của bạn</div>
        {loading ? (
          <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>Đang tải...</div>
        ) : lichTests.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", color: "#9ca3af", padding: 40 }}>Chưa có lịch kiểm tra nào</div>
        ) : lichTests.map(lich => {
          const cfg = TRANG_THAI_CFG[lich.trang_thai] || { label: lich.trang_thai, bg: "#f3f4f6", color: "#374151" };
          return (
            <div key={lich.id} style={cardStyle}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{lich.ten_de || "Bài kiểm tra đầu vào"}</div>
                <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: cfg.bg, color: cfg.color, whiteSpace: "nowrap" }}>
                  {cfg.label}
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Giáo viên</div>
                  <div style={{ fontSize: 13, color: "#374151" }}>{lich.ten_giao_vien || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Địa điểm</div>
                  <div style={{ fontSize: 13, color: "#374151" }}>{lich.dia_diem || "—"}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Thời gian</div>
                  <div style={{ fontSize: 13, color: "#374151" }}>{lich.thoi_gian ? new Date(lich.thoi_gian).toLocaleString("vi-VN") : "—"}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedLich(lich);
                  if (lich.de_thi_id) {
                    setDeThiId(lich.de_thi_id);
                    setLichHenTestId(lich.id);
                    setShowLamBai(true);
                  }
                }}
                style={{ padding: "7px 18px", background: lich.de_thi_id ? "#059669" : "#111827", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
              >
                {lich.de_thi_id ? "🎯 Bắt đầu làm bài" : "Xem chi tiết"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
