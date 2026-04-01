import { useState, useEffect } from "react";
import {
  loginCTV,
  registerAffiliate,
  fetchAffiliateStats,
  fetchAffiliateCommissions,
  fetchAffiliateDownline,
  fetchAffiliateWithdrawals,
  createAffiliateWithdraw,
  fetchBooks,
  fetchCategories
} from "../api";
import CartDrawer from "./CartDrawer";
import CheckoutDrawer from "./CheckoutDrawer";
import Footer from "./Footer";
import ProductDetail from "./ProductDetail";

// Business Rules
const COMMISSION_RATES = {
  F1: 10, // 10%
  F2: 5,  // 5%
  F3: 2,  // 2%
};

const MIN_WITHDRAW = 50000;
const WITHDRAW_FEE = 1000;

export default function AffiliateSystem({ initialPage = "register" }) {
  const [user, setUser] = useState(null);
  const [ctvInfo, setCtvInfo] = useState(null);
  const [page, setPage] = useState(initialPage); // register, login, dashboard
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);
  const [showWithdrawHistory, setShowWithdrawHistory] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankInfo, setBankInfo] = useState({
    bankName: "MB BANK",
    accountName: "",
    accountNumber: "",
  });

  // Real data from API
  const [stats, setStats] = useState({
    totalRevenue: 0,
    f1Count: 0,
    f2Count: 0,
    f3Count: 0,
    pendingCommission: 0,
  });
  const [commissions, setCommissions] = useState([]);
  const [downline, setDownline] = useState({ f1: [], f2: [], f3: [] });
  const [withdrawals, setWithdrawals] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Load products and categories on mount
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const books = await fetchBooks();
      // Map database fields to frontend format
      const mappedProducts = books.map(book => ({
        id: book.id,
        title: book.ten_sach,
        name: book.ten_sach,
        price: parseFloat(book.gia_ban),
        oldPrice: parseFloat(book.gia_ban) * 1.2,
        discount: 20,
        image: book.hinh_anh || "📚",
        category: book.loaiSach?.ten_loai?.toLowerCase() || "other",
        categoryId: book.loai_sach_id,
        tag: book.loaiSach?.ten_loai || "Sách",
        author: book.tac_gia || "NXB",
        publisher: book.nha_xuat_ban || "NXB",
        stock: book.so_luong_ton || 0,
        description: book.mo_ta || "Sách luyện thi tiếng Anh",
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error("Lỗi tải sách:", error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await fetchCategories();
      // Add "Tất cả" option
      const allCategories = [
        { id: "all", ten_loai: "Tất cả", icon: "📚" },
        ...categoriesData.map(cat => ({
          id: cat.id,
          ten_loai: cat.ten_loai,
          icon: cat.ten_loai.toLowerCase().includes("ielts") ? "🎯" : 
                cat.ten_loai.toLowerCase().includes("toeic") ? "📝" : "💬"
        }))
      ];
      setCategories(allCategories);
    } catch (error) {
      console.error("Lỗi tải categories:", error);
      // Fallback to default categories
      setCategories([
        { id: "all", ten_loai: "Tất cả", icon: "📚" },
        { id: 1, ten_loai: "Sách IELTS", icon: "🎯" },
        { id: 2, ten_loai: "Sách TOEIC", icon: "📝" },
        { id: 3, ten_loai: "Sách Giao tiếp", icon: "💬" },
      ]);
    }
  };

  // Filter products by category
  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.categoryId === activeCategory);

  // Cart management functions
  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleBuyNow = (product) => {
    addToCart(product, 1);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleBackFromProduct = () => {
    setSelectedProduct(null);
  };

  // Load data when user logs in
  useEffect(() => {
    if (user && ctvInfo) {
      loadDashboardData();
    }
  }, [user, ctvInfo]);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedCtv = localStorage.getItem("ctv");

    if (token && savedUser && savedCtv) {
      setUser(JSON.parse(savedUser));
      setCtvInfo(JSON.parse(savedCtv));
      setPage("dashboard");
    }
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Load stats
      const statsResult = await fetchAffiliateStats();
      if (statsResult.success) {
        setStats(statsResult.data);
      }

      // Load commissions
      const commissionsResult = await fetchAffiliateCommissions();
      if (commissionsResult.success) {
        setCommissions(commissionsResult.data.commissions);
      }

      // Load downline
      const downlineResult = await fetchAffiliateDownline();
      if (downlineResult.success) {
        setDownline(downlineResult.data);
      }

      // Load withdrawals
      const withdrawalsResult = await fetchAffiliateWithdrawals();
      if (withdrawalsResult.success) {
        setWithdrawals(withdrawalsResult.data.withdrawals);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Generate ref code
  const generateRefCode = () => {
    return "REF" + Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await registerAffiliate({
        ho_ten: registerForm.name,
        email: registerForm.email,
        mat_khau: registerForm.password,
        sdt: registerForm.phone,
      });

      if (result.success) {
        // Save token and user info
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        localStorage.setItem("ctv", JSON.stringify(result.data.ctv));

        setUser(result.data.user);
        setCtvInfo(result.data.ctv);
        setPage("dashboard");
        showToast("Đăng ký thành công! Chào mừng bạn đến với NTA Books!");
      } else {
        showToast(result.message || "Đăng ký thất bại", "error");
      }
    } catch (error) {
      console.error("Register error:", error);
      showToast("Có lỗi xảy ra. Vui lòng thử lại!", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await loginCTV(loginForm.email, loginForm.password);

      if (result.success) {
        // Save token and user info
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        localStorage.setItem("ctv", JSON.stringify(result.data.ctv));

        setUser(result.data.user);
        setCtvInfo(result.data.ctv);
        setPage("dashboard");
        showToast("Đăng nhập thành công!");
      } else {
        showToast(result.message || "Đăng nhập thất bại", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("Có lỗi xảy ra. Vui lòng thử lại!", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount < MIN_WITHDRAW) {
      showToast(`Số tiền tối thiểu là ${MIN_WITHDRAW.toLocaleString("vi-VN")} đ`, "error");
      return;
    }
    if (amount > stats.totalRevenue - WITHDRAW_FEE) {
      showToast("Số tiền vượt quá số dư khả dụng", "error");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const result = await createAffiliateWithdraw({
        so_tien: amount,
        so_tk_ngan_hang: bankInfo.accountNumber,
        noi_dung_tt: `Rút tiền CTV - ${bankInfo.bankName}`,
      });

      if (result.success) {
        showToast("Yêu cầu rút tiền đã được gửi! Chờ duyệt trong 24-48h");
        setShowWithdraw(false);
        setWithdrawAmount("");
        loadDashboardData(); // Reload data
      } else {
        showToast(result.message || "Rút tiền thất bại", "error");
      }
    } catch (error) {
      console.error("Withdraw error:", error);
      showToast("Có lỗi xảy ra. Vui lòng thử lại!", "error");
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Đã copy vào clipboard!");
  };

  // Get referral link
  const getReferralLink = (productId = null) => {
    const baseUrl = window.location.origin;
    const refParam = ctvInfo ? `?ref=${ctvInfo.ma_gioi_thieu}` : "";
    const productParam = productId ? `/product/${productId}` : "";
    return `${baseUrl}/shop${productParam}${refParam}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("vi-VN") + " đ";
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("ctv");
    setUser(null);
    setCtvInfo(null);
    setPage("login");
    showToast("Đã đăng xuất");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 90,
            right: 20,
            background: toast.type === "error" ? "#f44336" : "#4caf50",
            color: "white",
            padding: "12px 24px",
            borderRadius: 12,
            zIndex: 9999,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            animation: "slideIn 0.3s ease",
          }}
        >
          {toast.message}
        </div>
      )}

      {/* REGISTER PAGE */}
      {page === "register" && (
        <div style={{ padding: "100px 20px 60px", display: "flex", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 24, padding: 40, maxWidth: 450, width: "100%", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <span style={{ fontSize: 50, display: "block", marginBottom: 15 }}>🤝</span>
              <h2 style={{ fontSize: 28, fontWeight: "800", color: "#1a1a2e", marginBottom: 10 }}>Đăng ký CTV</h2>
              <p style={{ color: "#666", fontSize: 14 }}>Trở thành cộng tác viên bán sách cùng NTA</p>
            </div>

            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 }}>Họ tên *</label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  placeholder="Nhập họ tên của bạn"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 12,
                    fontSize: 14,
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 }}>Email *</label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 12,
                    fontSize: 14,
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 }}>Số điện thoại</label>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  placeholder="0912345678"
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 12,
                    fontSize: 14,
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>

              <div style={{ marginBottom: 25 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 }}>Mật khẩu *</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  placeholder="Nhập mật khẩu"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 12,
                    fontSize: 14,
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: loading ? "#ccc" : "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? "Đang xử lý..." : "🚀 Đăng ký ngay"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <span style={{ color: "#666", fontSize: 14 }}>Đã có tài khoản? </span>
              <button
                onClick={() => setPage("login")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#e53935",
                  fontSize: 14,
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN PAGE */}
      {page === "login" && (
        <div style={{ padding: "100px 20px 60px", display: "flex", justifyContent: "center" }}>
          <div style={{ background: "white", borderRadius: 24, padding: 40, maxWidth: 450, width: "100%", boxShadow: "0 10px 40px rgba(0,0,0,0.08)" }}>
            <div style={{ textAlign: "center", marginBottom: 30 }}>
              <span style={{ fontSize: 50, display: "block", marginBottom: 15 }}>🔐</span>
              <h2 style={{ fontSize: 28, fontWeight: "800", color: "#1a1a2e", marginBottom: 10 }}>Đăng nhập CTV</h2>
              <p style={{ color: "#666", fontSize: 14 }}>Chào mừng trở lại!</p>
            </div>

            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 }}>Email *</label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  placeholder="email@example.com"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 12,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: 25 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 8 }}>Mật khẩu *</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="Nhập mật khẩu"
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 12,
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: loading ? "#ccc" : "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Đang xử lý..." : "🚀 Đăng nhập"}
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <span style={{ color: "#666", fontSize: 14 }}>Chưa có tài khoản? </span>
              <button
                onClick={() => setPage("register")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#e53935",
                  fontSize: 14,
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {page === "dashboard" && user && ctvInfo && !selectedProduct && (
        <div style={{ padding: "100px 20px 60px", maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: "800", color: "#1a1a2e", marginBottom: 5 }}>CTV Dashboard</h1>
              <p style={{ color: "#666", fontSize: 14 }}>Chào mừng, {user.ho_ten}! 👋</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 14, color: "#666" }}>{user.email}</p>
                <p style={{ fontSize: 12, color: "#999" }}>Mã CTV: {ctvInfo.ma_gioi_thieu}</p>
              </div>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 20, fontWeight: "bold" }}>
                {user.ho_ten.charAt(0)}
              </div>
              <button
                onClick={handleLogout}
                style={{ padding: "10px 20px", background: "#f5f5f5", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14 }}
              >
                Đăng xuất
              </button>
            </div>
          </div>

          {/* Referral Link Section */}
          <div style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)", borderRadius: 20, padding: 25, marginBottom: 30, color: "white" }}>
            <h3 style={{ fontSize: 16, fontWeight: "600", marginBottom: 15, opacity: 0.9 }}>🔗 Link giới thiệu của bạn</h3>
            <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
              <input
                value={getReferralLink()}
                readOnly
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 14,
                  background: "white",
                  color: "#333",
                }}
              />
              <button
                onClick={() => copyToClipboard(getReferralLink())}
                style={{
                  padding: "14px 24px",
                  background: "#e53935",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                📋 Copy link
              </button>
            </div>
            <p style={{ fontSize: 13, opacity: 0.7 }}>Chia sẻ link này để kiếm hoa hồng khi có người mua hàng qua link của bạn!</p>
          </div>

          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 30 }}>
            <div
              onClick={() => setShowRevenue(true)}
              style={{ background: "white", borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.3s ease", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>💰 Tổng doanh thu</p>
              <p style={{ fontSize: 28, fontWeight: "800", color: "#e53935" }}>{formatCurrency(stats.totalRevenue)}</p>
              <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>Click để xem chi tiết</p>
            </div>

            <div
              onClick={() => { setSelectedLevel("F1"); setShowUsers(true); }}
              style={{ background: "white", borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.3s ease", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>👥 F1 (Trực tiếp)</p>
              <p style={{ fontSize: 28, fontWeight: "800", color: "#4caf50" }}>{stats.f1Count}</p>
              <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>Hoa hồng {COMMISSION_RATES.F1}%</p>
            </div>

            <div
              onClick={() => { setSelectedLevel("F2"); setShowUsers(true); }}
              style={{ background: "white", borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.3s ease", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>👥👥 F2 (Gián tiếp)</p>
              <p style={{ fontSize: 28, fontWeight: "800", color: "#2196f3" }}>{stats.f2Count}</p>
              <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>Hoa hồng {COMMISSION_RATES.F2}%</p>
            </div>

            <div
              onClick={() => { setSelectedLevel("F3"); setShowUsers(true); }}
              style={{ background: "white", borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.3s ease", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
            >
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>👥👥👥 F3</p>
              <p style={{ fontSize: 28, fontWeight: "800", color: "#9c27b0" }}>{stats.f3Count}</p>
              <p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>Hoa hồng {COMMISSION_RATES.F3}%</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: 15, marginBottom: 30 }}>
            <button
              onClick={() => setShowWithdraw(true)}
              style={{
                padding: "16px 30px",
                background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              💸 Rút tiền
            </button>
            <button
              onClick={() => { setShowBankForm(true); setShowWithdraw(true); }}
              style={{
                padding: "16px 30px",
                background: "white",
                color: "#333",
                border: "2px solid #e0e0e0",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              🏦 Cập nhật thông tin ngân hàng
            </button>
          </div>

          {/* Commission Info */}
          <div style={{ background: "#fff3e0", borderRadius: 16, padding: 20, marginBottom: 30, border: "1px solid #ffe0b2" }}>
            <h4 style={{ fontSize: 14, fontWeight: "700", color: "#e65100", marginBottom: 12 }}>📊 Quy định hoa hồng</h4>
            <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
              <div><span style={{ color: "#4caf50", fontWeight: "700" }}>F1:</span> {COMMISSION_RATES.F1}%</div>
              <div><span style={{ color: "#2196f3", fontWeight: "700" }}>F2:</span> {COMMISSION_RATES.F2}%</div>
              <div><span style={{ color: "#9c27b0", fontWeight: "700" }}>F3:</span> {COMMISSION_RATES.F3}%</div>
              <div><span style={{ color: "#666", fontWeight: "700" }}>Rút tiền:</span> Tối thiểu {formatCurrency(MIN_WITHDRAW)}, Phí {formatCurrency(WITHDRAW_FEE)}</div>
            </div>
          </div>

          {/* Products for Sharing */}
          <div>
            <h3 style={{ fontSize: 20, fontWeight: "700", color: "#1a1a2e", marginBottom: 20 }}>📚 Sản phẩm để chia sẻ</h3>
            
            {/* Category Filter Tabs */}
            <div style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 25,
              justifyContent: "center",
            }}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    background: activeCategory === cat.id 
                      ? "linear-gradient(135deg, #e53935 0%, #c62828 100%)" 
                      : "white",
                    color: activeCategory === cat.id ? "white" : "#666",
                    border: activeCategory === cat.id ? "none" : "2px solid #e0e0e0",
                    padding: "10px 24px",
                    borderRadius: 50,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    if (activeCategory !== cat.id) {
                      e.target.style.borderColor = "#e53935";
                      e.target.style.color = "#e53935";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCategory !== cat.id) {
                      e.target.style.borderColor = "#e0e0e0";
                      e.target.style.color = "#666";
                    }
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.ten_loai}</span>
                </button>
              ))}
            </div>

            {/* Product Count */}
            <p style={{
              fontSize: 14,
              color: "#888",
              marginBottom: 20,
            }}>
              Hiển thị {filteredProducts.length} sản phẩm
            </p>

            {loadingProducts ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <span style={{ fontSize: 40, display: "block", marginBottom: 15 }}>⏳</span>
                <p style={{ color: "#666" }}>Đang tải sản phẩm...</p>
              </div>
            ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: "white",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-4px)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                >
                  <div style={{ height: 160, background: "linear-gradient(135deg, #fff5f5 0%, #ffe4e8 100%)", display: "flex", alignItems: "center", justifyContent: "center", overflow: 'hidden' }}>
                    {product.image && product.image.includes('.') ? (
                      <img 
                        src={`http://localhost:5000/uploads/${product.image}`} 
                        alt={product.title}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span 
                      style={{ 
                        fontSize: 60,
                        display: (product.image && product.image.includes('.')) ? 'none' : 'block'
                      }}
                    >
                      {product.image || '📚'}
                    </span>
                  </div>
                  <div style={{ padding: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: "700", color: "#1a1a2e", marginBottom: 8, lineHeight: 1.3 }}>{product.title}</h4>
                    <p style={{ fontSize: 18, fontWeight: "800", color: "#e53935", marginBottom: 12 }}>{formatCurrency(product.price)}</p>
                    
                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 8 }}>
                      {/* Buy Now Button */}
                      <button
                        onClick={() => handleBuyNow(product)}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                          color: "white",
                          border: "none",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                        onMouseEnter={(e) => { e.target.style.transform = "scale(1.02)"; e.target.style.boxShadow = "0 4px 12px rgba(229, 57, 53, 0.4)"; }}
                        onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "none"; }}
                      >
                        🛒 Mua ngay
                      </button>
                      
                      {/* Share Button */}
                      <button
                        onClick={() => copyToClipboard(getReferralLink(product.id))}
                        style={{
                          flex: 1,
                          padding: "10px 12px",
                          background: "#f5f5f5",
                          color: "#333",
                          border: "none",
                          borderRadius: 10,
                          fontSize: 13,
                          fontWeight: "600",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                        onMouseEnter={(e) => { e.target.style.background = "#e53935"; e.target.style.color = "white"; }}
                        onMouseLeave={(e) => { e.target.style.background = "#f5f5f5"; e.target.style.color = "#333"; }}
                      >
                        🔗 Chia sẻ
                      </button>
                    </div>
                    
                    {/* View Details Link */}
                    <button
                      onClick={() => handleViewProduct(product)}
                      style={{
                        width: "100%",
                        padding: "8px",
                        marginTop: 8,
                        background: "transparent",
                        color: "#e53935",
                        border: "1px solid #e53935",
                        borderRadius: 10,
                        fontSize: 12,
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => { e.target.style.background = "#fff5f5"; }}
                      onMouseLeave={(e) => { e.target.style.background = "transparent"; }}
                    >
                      👁️ Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdraw && (
        <Modal onClose={() => setShowWithdraw(false)} title="💸 Rút tiền">
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6 }}>Ngân hàng</label>
            <input
              value={bankInfo.bankName}
              onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
              style={{ width: "100%", padding: "12px", border: "2px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6 }}>Tên tài khoản</label>
            <input
              value={bankInfo.accountName}
              onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
              placeholder="NGUYEN VAN A"
              style={{ width: "100%", padding: "12px", border: "2px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6 }}>Số tài khoản</label>
            <input
              value={bankInfo.accountNumber}
              onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
              placeholder="1234567890"
              style={{ width: "100%", padding: "12px", border: "2px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 13, color: "#666", marginBottom: 6 }}>Số tiền rút</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="Nhập số tiền"
              style={{ width: "100%", padding: "12px", border: "2px solid #e0e0e0", borderRadius: 10, fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
          <div style={{ background: "#f5f5f5", borderRadius: 10, padding: 15, marginBottom: 20, fontSize: 13 }}>
            <p style={{ marginBottom: 5, color: "#666" }}>💰 Số dư khả dụng: <strong>{formatCurrency(stats.totalRevenue)}</strong></p>
            <p style={{ marginBottom: 5, color: "#666" }}>📝 Tối thiểu: <strong>{formatCurrency(MIN_WITHDRAW)}</strong></p>
            <p style={{ marginBottom: 5, color: "#666" }}>💸 Phí rút tiền: <strong>{formatCurrency(WITHDRAW_FEE)}</strong></p>
            <p style={{ color: "#e53935" }}>✅ Tối đa có thể rút: <strong>{formatCurrency(stats.totalRevenue - WITHDRAW_FEE)}</strong></p>
          </div>
          <button
            onClick={handleWithdraw}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ✅ Xác nhận rút tiền
          </button>
        </Modal>
      )}

      {/* REVENUE MODAL */}
      {showRevenue && (
        <Modal onClose={() => setShowRevenue(false)} title="💰 Lịch sử doanh thu">
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "10px 8px", textAlign: "left", borderBottom: "1px solid #ddd" }}>ID</th>
                <th style={{ padding: "10px 8px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Sản phẩm</th>
                <th style={{ padding: "10px 8px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Giá</th>
                <th style={{ padding: "10px 8px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Hoa hồng</th>
                <th style={{ padding: "10px 8px", textAlign: "center", borderBottom: "1px solid" }}>Cấp</th>
                <th style={{ padding: "10px 8px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((commission) => (
                <tr key={commission.id}>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>#{commission.id}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{commission.donHang?.ma_don_hang || "N/A"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee", textAlign: "right" }}>{formatCurrency(commission.donHang?.tong_tien)}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee", textAlign: "right", color: "#4caf50", fontWeight: "600" }}>+{formatCurrency(commission.tien_hoa_hong)}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                    <span style={{ background: commission.cap_do === 1 ? "#e8f5e9" : commission.cap_do === 2 ? "#e3f2fd" : "#f3e5f5", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: "600" }}>F{commission.cap_do}</span>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee", textAlign: "center", color: "#666" }}>{new Date(commission.created_at).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => { setShowRevenue(false); setShowWithdrawHistory(true); }}
            style={{ marginTop: 15, background: "none", border: "none", color: "#e53935", fontSize: 14, fontWeight: "600", cursor: "pointer" }}
          >
            📋 Xem lịch sử rút tiền →
          </button>
        </Modal>
      )}

      {/* WITHDRAW HISTORY MODAL */}
      {showWithdrawHistory && (
        <Modal onClose={() => setShowWithdrawHistory(false)} title="📋 Lịch sử rút tiền">
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "10px 8px", textAlign: "left", borderBottom: "1px solid #ddd" }}>ID</th>
                <th style={{ padding: "10px 8px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Số tiền</th>
                <th style={{ padding: "10px 8px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Phí</th>
                <th style={{ padding: "10px 8px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Trạng thái</th>
                <th style={{ padding: "10px 8px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((withdraw) => (
                <tr key={withdraw.id}>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee" }}>#{withdraw.id}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", textAlign: "right", fontWeight: "600" }}>{formatCurrency(withdraw.so_tien)}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", textAlign: "right", color: "#666" }}>{formatCurrency(WITHDRAW_FEE)}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", textAlign: "center" }}>
                    <span style={{ 
                      background: withdraw.trang_thai === "da_duyet" ? "#e8f5e9" : withdraw.trang_thai === "cho_duyet" ? "#fff3e0" : "#ffebee",
                      color: withdraw.trang_thai === "da_duyet" ? "#4caf50" : withdraw.trang_thai === "cho_duyet" ? "#e65100" : "#f44336",
                      padding: "4px 10px", 
                      borderRadius: 20, 
                      fontSize: 11, 
                      fontWeight: "600" 
                    }}>
                      {withdraw.trang_thai === "da_duyet" ? "✅ Đã duyệt" : withdraw.trang_thai === "cho_duyet" ? "⏳ Chờ duyệt" : "❌ Từ chối"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", textAlign: "center", color: "#666" }}>{new Date(withdraw.ngay_yeu_cau).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}

      {/* USERS MODAL (Downline) */}
      {showUsers && (
        <Modal onClose={() => { setShowUsers(false); setSelectedLevel(null); }} title={`👥 Danh sách ${selectedLevel || "tuyến dưới"}`}>
          <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: "10px 8px", textAlign: "left", borderBottom: "1px solid #ddd" }}>ID</th>
                <th style={{ padding: "10px 8px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Tên</th>
                <th style={{ padding: "10px 8px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Email</th>
                <th style={{ padding: "10px 8px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Ngày tham gia</th>
              </tr>
            </thead>
            <tbody>
              {(selectedLevel === "F1" ? downline.f1 : selectedLevel === "F2" ? downline.f2 : downline.f3).map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee" }}>#{u.id}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", fontWeight: "600" }}>{u.nguoiDung?.ho_ten || "N/A"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", color: "#666" }}>{u.nguoiDung?.email || "N/A"}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", textAlign: "center", color: "#666" }}>{new Date(u.created_at).toLocaleDateString("vi-VN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (max-width: 900px) {
          [style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          [style*="grid-template-columns: repeat(3"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          [style*="grid-template-columns: repeat(4"] {
            grid-template-columns: 1fr !important;
          }
          [style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          [style*="maxWidth: 450"] {
            padding: 20px !important;
          }
        }
      `}</style>

      {/* Product Detail View */}
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          onBack={handleBackFromProduct}
          relatedProducts={filteredProducts.filter(p => p.id !== selectedProduct.id).slice(0, 4)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Checkout Drawer */}
      <CheckoutDrawer
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        onBack={() => {
          setCheckoutOpen(false);
          setCartOpen(true);
        }}
        onOrderSuccess={() => {
          setCart([]);
          setCheckoutOpen(false);
        }}
      />

      {/* Footer */}
      {page === "dashboard" && <Footer />}
    </div>
  );
}

// Modal Component
function Modal({ children, onClose, title }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 25,
          width: "100%",
          maxWidth: 600,
          maxHeight: "80vh",
          overflow: "auto",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 15,
            right: 15,
            background: "#f5f5f5",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>
        <h3 style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e", marginBottom: 20, paddingRight: 30 }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}
