import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Books from "./components/Books";
import Collab from "./components/Collab";
import Shop from "./components/Shop";
import ProductDetail from "./components/ProductDetail";
import AffiliateSystem from "./components/AffiliateSystem";
import OrderHistory from "./components/OrderHistory";
import OrderDetail from "./components/OrderDetail";
import Admin from "./admin/Admin";
import AdminLogin from "./admin/AdminLogin";
import Footer from "./components/Footer";

// Wrap all components with navigation prop
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const adminLoggedIn = localStorage.getItem("adminLoggedIn");
    if (adminLoggedIn === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    localStorage.setItem("adminLoggedIn", "true");
    localStorage.setItem("adminUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("adminLoggedIn");
    localStorage.removeItem("adminUser");
  };

  // Expose navigate function globally - LUÔN dùng đường dẫn tuyệt đối
  window.navigateTo = (page, product = null) => {
    // Đảm bảo page luôn bắt đầu bằng /
    const targetPage = page.startsWith("/") ? page : "/" + page;
    if (product) {
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
    navigate(targetPage);
    window.scrollTo(0, 0);
  };

  window.navigateToAffiliate = (initialPage = "register") => {
    window.affiliateInitialPage = initialPage;
    navigate("/affiliate");
    window.scrollTo(0, 0);
  };

  // Get URL path - SỬ DỤNG useLocation() THAY VÌ window.location.pathname
  const path = location.pathname;

  // Redirect /books/shop to /shop
  if (path === "/books/shop") {
    navigate("/shop");
    return null;
  }

  // Redirect /admin to admin page (check login first)
  if (path === "/admin") {
    if (!isLoggedIn) {
      return <AdminLogin onLogin={handleLogin} />;
    }
    return <Admin onLogout={handleLogout} />;
  }

  // Render based on URL
  if (path === "/books") {
    return (
      <>
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
          boxShadow: "0 2px 20px rgba(229, 57, 53, 0.3)", padding: "0 40px",
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
              <span style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>← Quay lại</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>Tài liệu luyện thi</span>
            <div style={{ width: 100 }}></div>
          </div>
        </header>
        <div style={{ marginTop: 70 }}><Books /></div>
        <Footer />
      </>
    );
  }

  if (path === "/collab") {
    return (
      <>
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
          boxShadow: "0 2px 20px rgba(229, 57, 53, 0.3)", padding: "0 40px",
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => navigate("/")}>
              <span style={{ fontSize: 20, fontWeight: "bold", color: "white" }}>← Quay lại</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>Cộng tác viên</span>
            <div style={{ width: 100 }}></div>
          </div>
        </header>
        <div style={{ marginTop: 70 }}>
          <Collab onAccessAffiliate={() => window.navigateToAffiliate("login")} />
        </div>
        <Footer />
      </>
    );
  }

  if (path === "/affiliate") {
    const affiliateInitialPage = window.affiliateInitialPage || "register";
    return (
      <>
        <header style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
          background: "white", boxShadow: "0 2px 20px rgba(0,0,0,0.08)", padding: "0 40px",
        }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => { navigate("/collab"); window.affiliateInitialPage = null; }}>
              <span style={{ fontSize: 18, fontWeight: "bold", color: "#e53935" }}>← Quay lại</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 28 }}>🤝</span>
              <span style={{ fontSize: 22, fontWeight: "800", color: "#1a1a2e" }}>NTA <span style={{ color: "#e53935" }}>CTV</span></span>
            </div>
            <div style={{ width: 100 }}></div>
          </div>
        </header>
        <div style={{ marginTop: 70 }}><AffiliateSystem initialPage={affiliateInitialPage} /></div>
      </>
    );
  }

  if (path === "/shop") {
    return <Shop />;
  }

  if (path === "/orders") {
    return (
      <OrderHistory
        onBack={() => navigate("/")}
        onViewOrder={(order) => {
          setSelectedOrder(order);
          navigate("/orders/detail");
        }}
      />
    );
  }

  if (path === "/orders/detail" && selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        onBack={() => navigate("/orders")}
        onOrderCancelled={() => {
          navigate("/orders");
        }}
      />
    );
  }

  if (path.startsWith("/product/")) {
    const productId = parseInt(path.split("/")[2]);
    const shopProducts = [
      { id: 1, name: "Cambridge IELTS 18 Academic", category: "ielts", price: 189000, oldPrice: 250000, discount: 24, image: "📚", author: "Cambridge University Press", publisher: "Cambridge University Press", pages: 400, level: "IELTS 5.0 - 8.0", weight: "0.8 kg", dimensions: "21 x 30 cm", description: "Bộ đề chính thức từ Cambridge 2023 - Phiên bản mới nhất dành cho kỳ thi IELTS Academic." },
      { id: 2, name: "Official TOEIC Test Vol 9", category: "toeic", price: 159000, oldPrice: 220000, discount: 28, image: "📝", author: "ETS", publisher: "ETS", pages: 380, level: "TOEIC 450 - 990", weight: "0.7 kg", dimensions: "21 x 28 cm", description: "Bộ đề ETS chính hãng mới nhất." },
      { id: 3, name: "IELTS Speaking Booster", category: "ielts", price: 199000, oldPrice: 280000, discount: 29, image: "🎤", author: "National Geographic", publisher: "Cengage Learning", pages: 250, level: "IELTS 6.0 - 8.5", weight: "0.5 kg", dimensions: "19 x 26 cm", description: "Hướng dẫn nói IELTS 8.0+." },
      { id: 4, name: "Target TOEIC 900", category: "toeic", price: 175000, oldPrice: 230000, discount: 24, image: "🎯", author: "Lougheed", publisher: "Pearson", pages: 320, level: "TOEIC 700 - 900", weight: "0.6 kg", dimensions: "21 x 28 cm", description: "Luyện thi TOEIC 900 điểm." },
      { id: 5, name: "Cambridge KET Practice Tests", category: "cambridge", price: 145000, oldPrice: 180000, discount: 19, image: "🏫", author: "Cambridge University Press", publisher: "Cambridge University Press", pages: 280, level: "KET", weight: "0.5 kg", dimensions: "21 x 30 cm", description: "Bộ đề KET chính thức." },
      { id: 6, name: "English Grammar in Use", category: "ngu-phap", price: 165000, oldPrice: 210000, discount: 21, image: "📖", author: "Raymond Murphy", publisher: "Cambridge University Press", pages: 380, level: "A1 - C1", weight: "0.9 kg", dimensions: "19 x 26 cm", description: "Ngữ pháp tiếng Anh toàn diện." },
    ];
    const product = shopProducts.find(p => p.id === productId);
    const relatedProducts = shopProducts.filter(p => p && p.id !== productId && p.category === product?.category);

    if (product) {
      return (
        <ProductDetail
          product={product}
          onBack={() => navigate("/shop")}
          relatedProducts={relatedProducts}
        />
      );
    }
  }

  // Default: Home page
  return <Home />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
