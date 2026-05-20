import { useState, useRef, useEffect } from "react";
import logo from "../assets/logo/Logo.jpeg";

export default function AdminLayout({ children, activePage = "dashboard", onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [statsSubmenuOpen, setStatsSubmenuOpen] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [passForm, setPassForm] = useState({ old: "", new: "", confirm: "" });
  const [passMsg, setPassMsg] = useState(null);
  const userMenuRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lấy role từ localStorage
  const chucVuId = parseInt(localStorage.getItem("chuc_vu_id") || "1");
  const userName = localStorage.getItem("user_name") || "Admin";

  const allMenuItems = [
    { id: "dashboard",  label: "Dashboard",          icon: "📊", roles: [1] },
    { id: "lms",        label: "Quản lý học viên",   icon: "🎓", roles: [1, 2, 3, 4] },
    { id: "customers",  label: "Quản lý khách hàng", icon: "👤", roles: [1] },
    { id: "ctv",        label: "Quản lý CTV",        icon: "👥", roles: [1] },
    { id: "orders",     label: "Quản lý đơn hàng",   icon: "📦", roles: [1] },
    { id: "commissions",label: "Quản lý hoa hồng",   icon: "💰", roles: [1] },
    { id: "withdrawals",label: "Quản lý rút tiền",   icon: "💸", roles: [1] },
    { id: "products",   label: "Quản lý sản phẩm",   icon: "📚", roles: [1] },
    { id: "statistics", label: "Thống kê",            icon: "📈", roles: [1], hasSubmenu: true },
    { id: "settings",   label: "Cài đặt",             icon: "⚙️", roles: [1] },
  ];

  const menuItems = allMenuItems.filter(m => m.roles.includes(chucVuId));

  const statsSubmenus = [
    { id: "stats-revenue", label: "Doanh thu", icon: "💰" },
    { id: "stats-products", label: "Sản phẩm", icon: "📦" },
    { id: "stats-affiliates", label: "Best Sale CTV", icon: "👑" },
  ];

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("chuc_vu_id");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
      localStorage.removeItem("adminUser");
      window.navigateTo && window.navigateTo("home");
    }
  };

  const handleChangePass = async () => {
    setPassMsg(null);
    if (!passForm.old || !passForm.new || !passForm.confirm) {
      setPassMsg({ type: "error", text: "Vui lòng điền đầy đủ thông tin" });
      return;
    }
    if (passForm.new !== passForm.confirm) {
      setPassMsg({ type: "error", text: "Mật khẩu mới không khớp" });
      return;
    }
    if (passForm.new.length < 6) {
      setPassMsg({ type: "error", text: "Mật khẩu mới phải ít nhất 6 ký tự" });
      return;
    }
    try {
      const API_URL = localStorage.getItem("API_URL") || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mat_khau_cu: passForm.old, mat_khau_moi: passForm.new }),
      });
      const data = await res.json();
      if (data.success) {
        setPassMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
        setPassForm({ old: "", new: "", confirm: "" });
        setTimeout(() => setShowChangePass(false), 1500);
      } else {
        setPassMsg({ type: "error", text: data.message || "Đổi mật khẩu thất bại" });
      }
    } catch {
      setPassMsg({ type: "error", text: "Lỗi kết nối server" });
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      <style>{`
        aside::-webkit-scrollbar { display: none; }
      `}</style>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? 240 : 70,
          background: "#e11d48",
          color: "white",
          transition: "all 0.2s",
          position: "fixed",
          height: "100vh",
          zIndex: 100,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "none",        /* Firefox */
          msOverflowStyle: "none",       /* IE/Edge */
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            minHeight: 60,
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          {sidebarOpen && (
            <div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  display: "block",
                  whiteSpace: "nowrap",
                }}
              >
                NTA <span style={{ color: "#ffcdd2" }}>Admin</span>
              </span>
              <span style={{ fontSize: 10, color: "#ffcdd2", display: "block", whiteSpace: "nowrap" }}>
                Hệ thống quản lý
              </span>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: "absolute",
            right: -12,
            top: 20,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "white",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#e11d48",
            fontSize: 12,
            zIndex: 101,
          }}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>

        {/* Menu */}
        <nav style={{ padding: "16px 8px", overflowX: "hidden" }}>
          {menuItems.map((item) => {
            const isActive = activePage === item.id || (item.hasSubmenu && activePage.startsWith("stats-"));
            
            // Check if this item has active submenu
            const hasActiveSubmenu = item.hasSubmenu && statsSubmenus.some(sub => activePage === sub.id);
            
            return (
              <div key={item.id}>
                <div
                  onClick={() => {
                    if (item.hasSubmenu) {
                      setStatsSubmenuOpen(!statsSubmenuOpen);
                    } else {
                      onNavigate && onNavigate(item.id);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(100, 100, 100, 0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                  style={{
                    padding: sidebarOpen ? "12px 14px" : "12px",
                    marginBottom: 4,
                    borderRadius: 8,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
                    color: "white",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                  }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                  {sidebarOpen && (
                    <span style={{ fontSize: 14, fontWeight: isActive ? "600" : "400", flex: 1 }}>
                      {item.label}
                    </span>
                  )}
                  {sidebarOpen && item.hasSubmenu && (
                    <span style={{ fontSize: 10, transition: "transform 0.2s", transform: statsSubmenuOpen ? "rotate(180deg)" : "rotate(0)" }}>
                      ▼
                    </span>
                  )}
                </div>
                
                {/* Submenu for Statistics */}
                {sidebarOpen && item.hasSubmenu && statsSubmenuOpen && (
                  <div style={{ paddingLeft: 20, marginBottom: 4 }}>
                    {statsSubmenus.map((sub) => {
                      const isSubActive = activePage === sub.id;
                      return (
                        <div
                          key={sub.id}
                          onClick={() => onNavigate && onNavigate(sub.id)}
                          onMouseEnter={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.background = "rgba(100, 100, 100, 0.4)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSubActive) {
                              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                            }
                          }}
                          style={{
                            padding: "10px 14px",
                            marginBottom: 2,
                            borderRadius: 6,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: isSubActive ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)",
                            color: isSubActive ? "white" : "rgba(255,255,255,0.8)",
                            fontSize: 13,
                          }}
                        >
                          <span style={{ fontSize: 14 }}>{sub.icon}</span>
                          <span style={{ fontWeight: isSubActive ? "600" : "400" }}>{sub.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div
          style={{
            margin: "8px 8px 4px",
            padding: "12px 14px",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.1)",
            color: "white",
            justifyContent: sidebarOpen ? "flex-start" : "center",
          }}
          onClick={() => setUserMenuOpen(!userMenuOpen)}
        >
          <span style={{ fontSize: 18 }}>👤</span>
          {sidebarOpen && <span style={{ fontSize: 14 }}>Admin</span>}
        </div>

        {/* Logout */}
        <div
          onClick={handleLogout}
          style={{
            margin: "0 8px 16px",
            padding: "12px 14px",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(255,255,255,0.1)",
            color: "white",
            justifyContent: sidebarOpen ? "flex-start" : "center",
          }}
        >
          <span style={{ fontSize: 18 }}>🚪</span>
          {sidebarOpen && <span style={{ fontSize: 14 }}>Đăng xuất</span>}
        </div>
      </aside>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? 240 : 70,
          transition: "margin-left 0.2s",
        }}
      >
        {/* Header */}
        <header
          style={{
            height: 60,
            background: "white",
            borderBottom: "1px solid #ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#666",
              fontSize: 16,
            }}
          >
            ☰
          </button>
          <div ref={userMenuRef} style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: "black", fontWeight: "600" }}>{userName}</span>
            <div
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{ width: 36, height: 36, borderRadius: 8, background: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", cursor: "pointer", userSelect: "none" }}
            >
              {userName.charAt(0)}
            </div>

            {/* Dropdown menu */}
            {userMenuOpen && (
              <div style={{
                position: "absolute", top: 44, right: 0, background: "#fff",
                borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                minWidth: 200, zIndex: 200, overflow: "hidden",
                border: "1px solid #f0f0f0",
              }}>
                {/* User info */}
                <div style={{ padding: "14px 16px", borderBottom: "1px solid #f5f5f5", background: "#fafafa" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{userName}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{localStorage.getItem("user_email") || ""}</div>
                </div>

                {/* Đổi mật khẩu */}
                <div
                  onClick={() => { setShowChangePass(true); setUserMenuOpen(false); setPassMsg(null); }}
                  style={{ padding: "11px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#374151" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  🔑 Đổi mật khẩu
                </div>

                {/* Đăng xuất */}
                <div
                  onClick={handleLogout}
                  style={{ padding: "11px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#e11d48", borderTop: "1px solid #f5f5f5" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  🚪 Đăng xuất
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: 24, minHeight: "calc(100vh - 60px)", overflowY: "auto" }}>{children}</main>
      </div>

      {/* Modal đổi mật khẩu */}
      {showChangePass && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => e.target === e.currentTarget && setShowChangePass(false)}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#e11d48", marginBottom: 20 }}>🔑 Đổi mật khẩu</div>

            {[
              { label: "Mật khẩu hiện tại", key: "old" },
              { label: "Mật khẩu mới", key: "new" },
              { label: "Xác nhận mật khẩu mới", key: "confirm" },
            ].map(({ label, key }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{label}</label>
                <input
                  type="password"
                  value={passForm[key]}
                  onChange={e => setPassForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                />
              </div>
            ))}

            {passMsg && (
              <div style={{ padding: "8px 12px", borderRadius: 6, marginBottom: 14, fontSize: 13,
                background: passMsg.type === "success" ? "#d1fae5" : "#fee2e2",
                color: passMsg.type === "success" ? "#065f46" : "#991b1b" }}>
                {passMsg.text}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
              <button onClick={() => setShowChangePass(false)}
                style={{ padding: "8px 20px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 14 }}>
                Hủy
              </button>
              <button onClick={handleChangePass}
                style={{ padding: "8px 20px", background: "#e11d48", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
