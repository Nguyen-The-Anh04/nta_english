import { useState, useEffect, useRef } from "react";
import { setCookie } from "./utils/cookieUtils";
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
import HocVienPortal from "./pages/HocVienPortal";
import Footer from "./components/Footer";

// ProductDetail Wrapper - Fetch data from API
function ProductDetailWrapper({ productId, onBack, onViewProduct }) {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/books/${productId}`);
        const data = await response.json();
        
        if (data.success && data.data) {
          const book = data.data;
          // Map database fields to frontend format
          const mappedProduct = {
            id: book.id,
            name: book.ten_sach,
            category: book.loaiSach?.ten_loai?.toLowerCase() || "other",
            description: book.mo_ta || "Sách luyện thi tiếng Anh",
            price: parseFloat(book.gia_ban),
            oldPrice: parseFloat(book.gia_ban) * 1.2,
            discount: 20,
            image: book.hinh_anh || "📚",
            tag: book.loaiSach?.ten_loai || "Sách",
            author: book.tac_gia || "NXB",
            publisher: book.nha_xuat_ban || "NXB",
            stock: book.so_luong_ton,
          };
          setProduct(mappedProduct);

          // Fetch related products
          const relatedResponse = await fetch(`http://localhost:5000/api/books?loai_sach_id=${book.loai_sach_id}&limit=4`);
          const relatedData = await relatedResponse.json();
          
          if (relatedData.success && relatedData.data?.books) {
            const mappedRelated = relatedData.data.books
              .filter(b => b.id !== book.id)
              .slice(0, 4)
              .map(b => ({
                id: b.id,
                name: b.ten_sach,
                category: b.loaiSach?.ten_loai?.toLowerCase() || "other",
                description: b.mo_ta || "Sách luyện thi tiếng Anh",
                price: parseFloat(b.gia_ban),
                oldPrice: parseFloat(b.gia_ban) * 1.2,
                discount: 20,
                image: b.hinh_anh || "📚",
                tag: b.loaiSach?.ten_loai || "Sách",
                author: b.tac_gia || "NXB",
                publisher: b.nha_xuat_ban || "NXB",
                stock: b.so_luong_ton,
              }));
            setRelatedProducts(mappedRelated);
          }
        } else {
          setError("Không tìm thấy sản phẩm");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Lỗi khi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>📚</div>
          <div style={{ fontSize: 18, color: "#666" }}>Đang tải sản phẩm...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>❌</div>
          <div style={{ fontSize: 18, color: "#666", marginBottom: 20 }}>{error || "Không tìm thấy sản phẩm"}</div>
          <button
            onClick={onBack}
            style={{
              padding: "12px 24px",
              background: "#e53935",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            Quay lại cửa hàng
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProductDetail
      product={product}
      onBack={onBack}
      relatedProducts={relatedProducts}
      onViewProduct={(item) => {
        // Navigate to the new product page
        window.location.href = `/product/${item.id}`;
      }}
    />
  );
}

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

  // Check if there's a ref code in URL - redirect to collab if exists
  const refProcessedRef = useRef(false);
  useEffect(() => {
    if (refProcessedRef.current) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const refCodeFromUrl = urlParams.get("ref");
    if (path === "/" && refCodeFromUrl) {
      refProcessedRef.current = true;
      // Store ref code in cookie for later use
      setCookie("ref", refCodeFromUrl, 7);
      // Redirect to collab page
      navigate("/collab");
    }
  }, [path, navigate]);

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

  if (path === "/hoc-vien") {
    return <HocVienPortal />;
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
    // Get ref code from URL and store in cookie
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setCookie("ref", refCode, 7);
    }
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
    // Get ref code from URL and store in cookie
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setCookie("ref", refCode, 7);
    }
    // If ref code exists in URL, always show registration page (not dashboard even if logged in)
    const affiliateInitialPage = refCode ? "register" : (window.affiliateInitialPage || "register");
    // Clear the initial page after using it to prevent persistence issues
    window.affiliateInitialPage = null;
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
    
    // Lưu cookie ref nếu có trong URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `ref=${refCode}; expires=${expires.toUTCString()}; path=/`;
    }
    
    return (
      <ProductDetailWrapper
        productId={productId}
        onBack={() => navigate("/shop")}
        onViewProduct={(item) => {
          window.location.href = `/product/${item.id}`;
        }}
      />
    );
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
