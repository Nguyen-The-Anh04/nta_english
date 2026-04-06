import { useState } from "react";
import logo from "../../assets/logo/Logo.jpeg";

export default function LMSAdminLayout({ children, activePage = "leads", onNavigate, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, title: "Học viên mới đăng ký", time: "5 phút trước", unread: true },
    { id: 2, title: "Lớp IELTS 5.5 sắp khai giảng", time: "1 giờ trước", unread: true },
    { id: 3, title: "Có 3 học viên xin bảo lưu", time: "2 giờ trước", unread: false },
  ]);
  const [notifOpen, setNotifOpen] = useState(false);

  const menuItems = [
    { id: "leads", label: "Leads", icon: "👤" },
    { id: "test-appointment", label: "Hẹn test", icon: "📝" },
    { id: "students", label: "Danh sách học viên", icon: "👥" },
    { id: "students-in-class", label: "Học viên trong lớp", icon: "📚" },
    { id: "paused-students", label: "Học viên bảo lưu", icon: "⏸️" },
    { id: "transferred-students", label: "Học viên chuyển lớp", icon: "🔄" },
    { id: "registration", label: "Hẹn đăng ký", icon: "📋" },
    { id: "payment", label: "Thanh toán", icon: "💳" },
    { id: "feedback", label: "Phản hồi học viên", icon: "💬" },
  ];

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      if (onLogout) {
        onLogout();
      }
      window.navigateTo && window.navigateTo("home");
    }
  };

  const getPageTitle = () => {
    const titles = {
      "leads": "Leads",
      "test-appointment": "Hẹn test đầu vào",
      "students": "Danh sách học viên",
      "students-in-class": "Học viên trong lớp",
      "paused-students": "Học viên bảo lưu",
      "transferred-students": "Học viên chuyển lớp",
      "registration": "Hẹn đăng ký",
      "payment": "Quản lý thanh toán",
      "feedback": "Phản hồi học viên",
    };
    return titles[activePage] || "Dashboard";
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Sidebar */}
      <aside
        className="lms-sidebar"
        style={{
          width: sidebarOpen ? 240 : 70,
          background: "#e11d48",
          color: "white",
          transition: "all 0.2s",
          position: "fixed",
          height: "100vh",
          zIndex: 100,
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
            <div style={{ overflow: "hidden" }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  display: "block",
                  whiteSpace: "nowrap",
                }}
              >
                NTA Center
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
        <nav className="lms-sidebar-menu" style={{ padding: "16px 8px" }}>
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

        {/* Back to Admin - fixed at bottom with spacing */}
        <div
          style={{
            marginTop: "auto",
            padding: "16px 8px",
            borderTop: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <div
            style={{
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
            onClick={() => onNavigate && onNavigate("main-admin")}
          >
            <span style={{ fontSize: 18 }}>🏠</span>
          {sidebarOpen && <span style={{ fontSize: 14 }}>Quay lại Admin</span>}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          marginLeft: sidebarOpen ? 240 : 70,
          transition: "margin-left 0.2s",
          display: "flex",
          flexDirection: "column",
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
          {/* Left: Page Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
            <h1
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "black",
                margin: 0,
              }}
            >
              {getPageTitle()}
            </h1>
          </div>

          {/* Right: Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                  position: "relative",
                  fontSize: 18,
                }}
              >
                🔔
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 10,
                    height: 10,
                    background: "#e11d48",
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                />
              </button>

              {/* Notifications Dropdown */}
              {notifOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 8,
                    width: 300,
                    background: "white",
                    borderRadius: 12,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    border: "1px solid #ddd",
                    overflow: "hidden",
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      padding: "14px 16px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: "bold", color: "black" }}>
                      Thông báo
                    </h3>
                  </div>
                  <div style={{ maxHeight: 250, overflow: "auto" }}>
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid #f5f5f5",
                          background: notif.unread ? "#fff5f5" : "white",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: "600", color: "black" }}>
                            {notif.title}
                          </span>
                          {notif.unread && (
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                background: "#e11d48",
                                borderRadius: "50%",
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: "#888" }}>{notif.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div style={{ position: "relative" }}>
              <div
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 12px 6px 6px",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: "1px solid #ddd",
                  background: "white",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "#e11d48",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 14,
                  }}
                >
                  A
                </div>
                <div style={{ textAlign: "left" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: "600", color: "black" }}>
                    Admin NTA
                  </p>
                </div>
              </div>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: 8,
                    width: 180,
                    background: "white",
                    borderRadius: 12,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    border: "1px solid #ddd",
                    overflow: "hidden",
                    zIndex: 100,
                  }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      borderBottom: "1px solid #f5f5f5",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "black" }}>Thông tin</span>
                  </div>
                  <div
                    onClick={handleLogout}
                    style={{
                      padding: "12px 14px",
                      background: "#fff5f5",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: 13, color: "#e11d48", fontWeight: "600" }}>Đăng xuất</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: 24, overflow: "auto" }}>{children}</main>
      </div>

      {/* Click outside to close dropdowns */}
      {(notifOpen || userMenuOpen) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 49,
          }}
          onClick={() => {
            setNotifOpen(false);
            setUserMenuOpen(false);
          }}
        />
      )}
    </div>
  );
}
