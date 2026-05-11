import { useState } from "react";
import logo from "../../assets/logo/Logo.jpeg";

// ── Category groups theo role ──────────────────────────────────────────────
const CATEGORIES = {
  1: [
    {
      id: "tong-quan",
      label: "TỔNG QUAN",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
      items: [
        { id: "leads",            label: "Leads" },
        { id: "test-appointment", label: "Hẹn test" },
      ],
    },
    {
      id: "hoc-vu",
      label: "HỌC VỤ",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
        </svg>
      ),
      items: [
        { id: "class-management",     label: "Quản lý lớp học" },
        { id: "lich-hoc",             label: "Lịch học" },
        { id: "quan-ly-de-thi",       label: "Quản lý đề thi" },
        { id: "quan-ly-de-thi-moi",   label: "Thi Online" },
      ],
    },
    {
      id: "hoc-vien",
      label: "HỌC VIÊN",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
        </svg>
      ),
      items: [
        { id: "student-management",   label: "Quản lý học viên" },
        { id: "students-in-class",    label: "Học viên trong lớp" },
        { id: "paused-students",      label: "Học viên bảo lưu" },
        { id: "transferred-students", label: "Học viên chuyển lớp" },
        { id: "registration",         label: "Hẹn đăng ký" },
        { id: "feedback",             label: "Phản hồi học viên" },
      ],
    },
    {
      id: "tai-chinh",
      label: "TÀI CHÍNH",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
        </svg>
      ),
      items: [
        { id: "ke-toan",      label: "Tổng quan kế toán" },
        { id: "cong-no",      label: "Công nợ" },
        { id: "phieu-thu-chi",label: "Phiếu thu/chi" },
        { id: "payment",      label: "Quản lý thanh toán" },
      ],
    },
  ],
  2: [
    {
      id: "kinh-doanh",
      label: "KINH DOANH",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
      items: [
        { id: "leads",            label: "Leads" },
        { id: "test-appointment", label: "Hẹn test" },
        { id: "registration",     label: "Hẹn đăng ký" },
      ],
    },
  ],
  3: [
    {
      id: "lop-hoc",
      label: "LỚP HỌC",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
      items: [
        { id: "class-management", label: "Lớp học của tôi" },
        { id: "lich-hoc",         label: "Lịch dạy" },
      ],
    },
    {
      id: "hoc-vien",
      label: "HỌC VIÊN",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
        </svg>
      ),
      items: [
        { id: "student-management", label: "Quản lý học viên" },
        { id: "quan-ly-de-thi",     label: "Quản lý đề thi" },
        { id: "test-appointment",   label: "Hẹn test" },
        { id: "feedback",           label: "Phản hồi học viên" },
      ],
    },
  ],
  4: [
    {
      id: "tai-chinh",
      label: "TÀI CHÍNH",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
        </svg>
      ),
      items: [
        { id: "ke-toan",       label: "Tổng quan kế toán" },
        { id: "cong-no",       label: "Công nợ" },
        { id: "phieu-thu-chi", label: "Phiếu thu/chi" },
        { id: "payment",       label: "Quản lý thanh toán" },
      ],
    },
  ],
};

const getRoleLabel = (r) => ({ 1:"Quản trị viên", 2:"Kinh doanh", 3:"Giáo viên", 4:"Kế toán", 5:"Học viên" }[r] || "Nhân viên");

const PAGE_TITLES = {
  "leads":"Leads", "test-appointment":"Hẹn test đầu vào",
  "class-management":"Quản lý lớp học", "lich-hoc":"Lịch học",
  "student-management":"Quản lý học viên", "diem-danh":"Điểm danh",
  "bai-tap":"Bài tập", "bang-diem":"Bảng điểm",
  "quan-ly-de-thi":"Quản lý đề thi", "quan-ly-de-thi-moi":"Thi Online",
  "ke-toan":"Tổng quan kế toán", "cong-no":"Công nợ",
  "phieu-thu-chi":"Phiếu thu/chi",
  "students-in-class":"Học viên trong lớp", "paused-students":"Học viên bảo lưu",
  "transferred-students":"Học viên chuyển lớp", "registration":"Hẹn đăng ký",
  "payment":"Quản lý thanh toán", "feedback":"Phản hồi học viên",
};

export default function LMSAdminLayout({ children, activePage = "leads", onNavigate, onLogout, role = 1, userName = "Admin NTA" }) {
  const categories = CATEGORIES[role] || CATEGORIES[1];

  // Tìm category chứa activePage
  const findActiveCat = () => {
    for (const cat of categories) {
      if (cat.items.some(i => i.id === activePage)) return cat.id;
    }
    return categories[0]?.id;
  };

  const [activeCat, setActiveCat] = useState(findActiveCat);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const currentCat = categories.find(c => c.id === activeCat) || categories[0];

  const handleCatClick = (catId) => {
    setActiveCat(catId);
    // Auto-navigate to first item of category
    const cat = categories.find(c => c.id === catId);
    if (cat && !cat.items.some(i => i.id === activePage)) {
      onNavigate && onNavigate(cat.items[0]?.id);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      onLogout && onLogout();
    }
  };

  const pageTitle = PAGE_TITLES[activePage] || activePage;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f6fa", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ display: "flex", position: "fixed", height: "100vh", zIndex: 100, boxShadow: "2px 0 12px rgba(0,0,0,0.10)" }}>

        {/* Cột 1: Icon categories (đỏ) */}
        <div style={{ width: 64, background: "#c0392b", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 0 }}>
          {/* Logo */}
          <div style={{ width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }}>
            <img src={logo} alt="NTA" style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover" }} />
          </div>

          {/* Category icons */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 8, gap: 4, overflowY: "auto" }}>
            {categories.map(cat => {
              const isActive = activeCat === cat.id;
              return (
                <div key={cat.id} onClick={() => handleCatClick(cat.id)}
                  title={cat.label}
                  style={{
                    width: 48, height: 48, borderRadius: isActive ? "12px 0 0 12px" : 12,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "white", flexShrink: 0,
                    background: isActive ? "white" : "transparent",
                    color: isActive ? "#c0392b" : "rgba(255,255,255,0.85)",
                    transition: "all 0.15s",
                    position: "relative",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  {cat.icon}
                  {/* Active indicator — white tab jutting right */}
                  {isActive && (
                    <>
                      <div style={{ position:"absolute", right:-1, top:-8, width:8, height:8, background:"#c0392b",
                        borderBottomRightRadius:8 }} />
                      <div style={{ position:"absolute", right:-1, bottom:-8, width:8, height:8, background:"#c0392b",
                        borderTopRightRadius:8 }} />
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Logout icon at bottom */}
          <div style={{ paddingBottom: 16 }}>
            <div onClick={handleLogout} title="Đăng xuất"
              style={{ width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "rgba(255,255,255,0.7)" }}
              onMouseEnter={e => e.currentTarget.style.color = "white"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.7)"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Cột 2: Submenu items (trắng) */}
        <div style={{ width: 200, background: "white", display: "flex", flexDirection: "column", borderRight: "1px solid #e5e7eb" }}>
          {/* Header của category */}
          <div style={{ height: 64, display: "flex", alignItems: "center", padding: "0 20px", borderBottom: "1px solid #f0f0f0", flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: "#111827", letterSpacing: 0.5 }}>
              {currentCat?.label}
            </span>
          </div>

          {/* Menu items */}
          <nav style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
            {currentCat?.items.map(item => {
              const isActive = activePage === item.id;
              return (
                <div key={item.id} onClick={() => onNavigate && onNavigate(item.id)}
                  style={{
                    padding: "11px 20px", cursor: "pointer", fontSize: 14,
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? "#111827" : "#4b5563",
                    background: isActive ? "#eef2ff" : "transparent",
                    borderLeft: isActive ? "3px solid #c0392b" : "3px solid transparent",
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.color = "#111827"; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4b5563"; }}}
                >
                  {item.label}
                </div>
              );
            })}
          </nav>

          {/* Back to admin */}
          {role === 1 && (
            <div style={{ padding: "12px 0", borderTop: "1px solid #f0f0f0" }}>
              <div onClick={() => onNavigate && onNavigate("main-admin")}
                style={{ padding: "10px 20px", cursor: "pointer", fontSize: 13, color: "#9ca3af", display: "flex", alignItems: "center", gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.color = "#374151"}
                onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                Quay lại Admin
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, marginLeft: 264, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Header */}
        <header style={{
          height: 56, background: "white", borderBottom: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 24px", position: "sticky", top: 0, zIndex: 50,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>
            {pageTitle}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Bell */}
            <div style={{ position: "relative" }}>
              <button onClick={() => { setNotifOpen(v => !v); setUserMenuOpen(false); }}
                style={{ width: 38, height: 38, borderRadius: 8, border: "1px solid #e5e7eb", background: "white",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, position: "relative" }}>
                🔔
                <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, background: "#e11d48", borderRadius: "50%", border: "2px solid white" }} />
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 280, background: "white",
                  borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #e5e7eb", zIndex: 200, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", fontWeight: 700, fontSize: 13, color: "#111827" }}>Thông báo</div>
                  {[
                    { title: "Học viên mới đăng ký", time: "5 phút trước", unread: true },
                    { title: "Lớp IELTS 5.5 sắp khai giảng", time: "1 giờ trước", unread: true },
                    { title: "Có 3 học viên xin bảo lưu", time: "2 giờ trước", unread: false },
                  ].map((n, i) => (
                    <div key={i} style={{ padding: "10px 16px", borderBottom: "1px solid #f9fafb", background: n.unread ? "#fef2f2" : "white", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: n.unread ? 600 : 400, color: "#111827" }}>{n.title}</span>
                        {n.unread && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e11d48", flexShrink: 0 }} />}
                      </div>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>{n.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User */}
            <div style={{ position: "relative" }}>
              <div onClick={() => { setUserMenuOpen(v => !v); setNotifOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px 5px 5px",
                  borderRadius: 8, cursor: "pointer", border: "1px solid #e5e7eb", background: "white" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "#c0392b",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700 }}>
                  {(userName || "A")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.2 }}>{userName || "Admin NTA"}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{getRoleLabel(role)}</div>
                </div>
              </div>
              {userMenuOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, width: 160, background: "white",
                  borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid #e5e7eb", zIndex: 200, overflow: "hidden" }}>
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid #f3f4f6", fontSize: 13, color: "#374151", cursor: "pointer" }}>
                    Thông tin
                  </div>
                  <div onClick={handleLogout}
                    style={{ padding: "10px 14px", fontSize: 13, color: "#e11d48", fontWeight: 600, cursor: "pointer", background: "#fef2f2" }}>
                    Đăng xuất
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: "auto" }}>{children}</main>
      </div>

      {/* Overlay to close dropdowns */}
      {(notifOpen || userMenuOpen) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 49 }}
          onClick={() => { setNotifOpen(false); setUserMenuOpen(false); }} />
      )}
    </div>
  );
}
