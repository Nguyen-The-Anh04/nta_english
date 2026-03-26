import { useState } from "react";
import logo from "../assets/logo/Logo.jpeg";

export default function AdminLayout({ children, activePage = "dashboard", onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "lms", label: "Quản lý học viên", icon: "🎓" },
    { id: "users", label: "Quản lý CTV", icon: "👥" },
    { id: "orders", label: "Quản lý đơn hàng", icon: "📦" },
    { id: "commissions", label: "Quản lý hoa hồng", icon: "💰" },
    { id: "withdrawals", label: "Quản lý rút tiền", icon: "💸" },
    { id: "products", label: "Quản lý sản phẩm", icon: "📚" },
    { id: "settings", label: "Cài đặt", icon: "⚙️" },
  ];

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      window.navigateTo && window.navigateTo("home");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
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
          overflow: "hidden",
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
        <nav style={{ padding: "16px 8px", overflow: "hidden" }}>
          {menuItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <div
                key={item.id}
                onClick={() => onNavigate && onNavigate(item.id)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(207, 46, 46, 0.2)";
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
                  <span style={{ fontSize: 14, fontWeight: isActive ? "600" : "400" }}>
                    {item.label}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* User */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 8,
            right: 8,
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
            position: "absolute",
            bottom: 16,
            left: 8,
            right: 8,
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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 14, color: "black", fontWeight: "600" }}>Admin NTA</span>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "#e11d48", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ padding: 24, minHeight: "calc(100vh - 60px)", overflowY: "auto" }}>{children}</main>
      </div>
    </div>
  );
}
