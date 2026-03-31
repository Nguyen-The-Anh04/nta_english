import { useState } from "react";
import logo from "../assets/logo/Logo.jpeg";

const scrollTo = (id) => {
  // If navigating to books, collab, or orders, use page navigation
  if (id === "books") {
    if (window.navigateTo) {
      window.navigateTo("books");
    } else {
      // Fallback: reload with hash
      window.location.href = "/books";
    }
    return;
  }
  
  if (id === "collab") {
    if (window.navigateTo) {
      window.navigateTo("collab");
    } else {
      window.location.href = "/collab";
    }
    return;
  }

  if (id === "orders") {
    if (window.navigateTo) {
      window.navigateTo("orders");
    } else {
      window.location.href = "/orders";
    }
    return;
  }
  
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  } else {
    console.warn(`Element with id "${id}" not found`);
  }
};

function Header() {
  const [activeNav, setActiveNav] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "about", label: "Về chúng tôi" },
    { id: "courses", label: "Khóa học" },
    { id: "books", label: "Tài liệu" },
    { id: "collab", label: "CTV" },
    { id: "roadmap", label: "Lộ trình" },
    { id: "teachers", label: "Giáo viên" },
    { id: "orders", label: "Đơn hàng" },
  ];

  return (
    <header style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
      boxShadow: "0 2px 20px rgba(229, 57, 53, 0.3)",
      padding: "0 40px",
    }}>
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 70,
      }}>
        {/* Logo */}
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 10,
            cursor: "pointer"
          }}
          onClick={() => scrollTo("home")}
        >
          <img 
            src={logo} 
            alt="NTA English Center Logo" 
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              background: "white",
            }}
          />
          <span style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "white",
            letterSpacing: "0.5px",
          }}>
            NTA English Center
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }} className="desktop-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                scrollTo(item.id);
                setActiveNav(item.id);
              }}
              style={{
                background: activeNav === item.id ? "rgba(255,255,255,0.2)" : "transparent",
                border: "none",
                color: "white",
                padding: "10px 18px",
                borderRadius: 25,
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 500,
                transition: "all 0.3s ease",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,255,255,0.2)";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                if (activeNav !== item.id) {
                  e.target.style.background = "transparent";
                }
                e.target.style.transform = "translateY(0)";
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }} className="desktop-actions">
          <button
            onClick={() => scrollTo("cta")}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "2px solid white",
              color: "white",
              padding: "10px 24px",
              borderRadius: 30,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "white";
              e.target.style.color = "#e53935";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(255,255,255,0.15)";
              e.target.style.color = "white";
            }}
          >
            Tư vấn miễn phí
          </button>
          <button
            onClick={() => scrollTo("cta")}
            style={{
              background: "linear-gradient(135deg, #ff7043 0%, #f4511e 100%)",
              border: "none",
              color: "white",
              padding: "10px 24px",
              borderRadius: 30,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(244, 81, 30, 0.4)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(244, 81, 30, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(244, 81, 30, 0.4)";
            }}
          >
            Đăng ký ngay
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "white",
            fontSize: 28,
            cursor: "pointer",
          }}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div style={{
          background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
          padding: "20px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                scrollTo(item.id);
                setActiveNav(item.id);
                setMobileMenuOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                background: "none",
                border: "none",
                color: "white",
                padding: "15px",
                textAlign: "left",
                fontSize: 16,
                fontWeight: 500,
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
              }}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              scrollTo("cta");
              setMobileMenuOpen(false);
            }}
            style={{
              display: "block",
              width: "100%",
              background: "linear-gradient(135deg, #ff7043 0%, #f4511e 100%)",
              border: "none",
              color: "white",
              padding: "15px",
              marginTop: 10,
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Đăng ký ngay
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .desktop-nav, .desktop-actions {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}

export default Header;
