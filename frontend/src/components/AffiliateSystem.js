import { useState, useEffect } from "react";

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
  const [page, setPage] = useState(initialPage); // register, login, dashboard
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showRevenue, setShowRevenue] = useState(false);
  const [showWithdrawHistory, setShowWithdrawHistory] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankInfo, setBankInfo] = useState({
    bankName: "MB BANK",
    accountName: "",
    accountNumber: "",
  });

  // Mock data
  const [mockUsers, setMockUsers] = useState([
    { id: 33311, name: "Nguyễn Thị Thảo", email: "thao@example.com", joinDate: "2024-03-23", parentId: null },
    { id: 33466, name: "Trần Thị Quỳnh", email: "quynh@example.com", joinDate: "2024-03-24", parentId: null },
  ]);

  const [mockOrders, setMockOrders] = useState([
    { id: 46242, userId: 33311, userName: "Nguyễn Văn A", userEmail: "a@gmail.com", product: "Cambridge IELTS 18", price: 189000, commission: 18900, status: "completed", date: "2024-04-15", level: "F1" },
    { id: 46243, userId: 33311, userName: "Nguyễn Văn B", userEmail: "b@gmail.com", product: "IELTS Speaking Booster", price: 199000, commission: 19900, status: "completed", date: "2024-04-16", level: "F1" },
    { id: 46244, userId: 33466, userName: "Nguyễn Văn C", userEmail: "c@gmail.com", product: "Target TOEIC 900", price: 175000, commission: 8750, status: "completed", date: "2024-04-17", level: "F2" },
  ]);

  const [mockWithdrawals, setMockWithdrawals] = useState([
    { id: 126087, amount: 200000, fee: 1000, status: "completed", date: "2024-04-27", bankInfo: "MB BANK - ****8555" },
    { id: 140392, amount: 300000, fee: 1000, status: "completed", date: "2024-05-18", bankInfo: "MB BANK - ****8555" },
  ]);

  // Products for sharing
  const products = [
    { id: 1, title: "Cambridge IELTS 18 Academic", price: 189000, image: "📚", category: "ielts" },
    { id: 2, title: "Official TOEIC Test Vol 9", price: 159000, image: "📝", category: "toeic" },
    { id: 3, title: "IELTS Speaking Booster", price: 199000, image: "🎤", category: "ielts" },
    { id: 4, title: "Target TOEIC 900", price: 175000, image: "🎯", category: "toeic" },
    { id: 5, title: "Cambridge KET Practice Tests", price: 145000, image: "🏫", category: "cambridge" },
    { id: 6, title: "English Grammar in Use", price: 165000, image: "📖", category: "ngu-phap" },
  ];

  // Calculate stats
  const calculateStats = () => {
    if (!user) return { totalRevenue: 0, f1Count: 0, f2Count: 0, f3Count: 0, pendingCommission: 0 };

    // Get user's downline
    const f1Users = mockUsers.filter(u => u.parentId === user.id);
    const f2Users = f1Users.flatMap(f1 => mockUsers.filter(u => u.parentId === f1.id));
    const f3Users = f2Users.flatMap(f2 => mockUsers.filter(u => u.parentId === f2.id));

    // Calculate revenue from orders
    const userOrders = mockOrders.filter(o => o.userId === user.id);
    const totalRevenue = userOrders.reduce((sum, o) => sum + o.commission, 0);

    return {
      totalRevenue,
      f1Count: f1Users.length,
      f2Count: f2Users.length,
      f3Count: f3Users.length,
      pendingCommission: 0,
    };
  };

  const stats = calculateStats();

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
  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newUser = {
        id: Math.floor(Math.random() * 90000) + 10000,
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        refCode: generateRefCode(),
        parentId: null, // Could be set from URL parameter
        joinDate: new Date().toISOString().split("T")[0],
      };
      
      setUser(newUser);
      setMockUsers([...mockUsers, newUser]);
      setPage("dashboard");
      setLoading(false);
      showToast("Đăng ký thành công! Chào mừng bạn đến với NTA Books!");
    }, 1000);
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const foundUser = mockUsers.find(u => u.email === loginForm.email);
      if (foundUser) {
        setUser(foundUser);
        setPage("dashboard");
        showToast("Đăng nhập thành công!");
      } else {
        // Create demo user for login
        const demoUser = {
          id: 12345,
          name: "Nguyễn Văn Demo",
          email: loginForm.email,
          phone: "0912345678",
          refCode: "REF" + Math.random().toString(36).substr(2, 6).toUpperCase(),
          parentId: null,
          joinDate: "2024-01-01",
        };
        setUser(demoUser);
        setPage("dashboard");
      }
      setLoading(false);
    }, 1000);
  };

  // Handle withdraw
  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (isNaN(amount) || amount < MIN_WITHDRAW) {
      showToast(`Số tiền tối thiểu là ${MIN_WITHDRAW.toLocaleString("vi-VN")} đ`, "error");
      return;
    }
    if (amount > stats.totalRevenue - WITHDRAW_FEE) {
      showToast("Số tiền vượt quá số dư khả dụng", "error");
      return;
    }

    const newWithdrawal = {
      id: Math.floor(Math.random() * 900000) + 100000,
      amount,
      fee: WITHDRAW_FEE,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
      bankInfo: `${bankInfo.bankName} - ****${bankInfo.accountNumber.slice(-4)}`,
    };

    setMockWithdrawals([newWithdrawal, ...mockWithdrawals]);
    setShowWithdraw(false);
    setWithdrawAmount("");
    showToast("Yêu cầu rút tiền đã được gửi! Chờ duyệt trong 24-48h");
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Đã copy vào clipboard!");
  };

  // Get referral link
  const getReferralLink = (productId = null) => {
    const baseUrl = window.location.origin;
    const refParam = user ? `?ref=${user.refCode}` : "";
    const productParam = productId ? `/product/${productId}` : "";
    return `${baseUrl}/shop${productParam}${refParam}`;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("vi-VN") + " đ";
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
                onClick={() => window.navigateTo("collab")}
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
      {page === "dashboard" && user && (
        <div style={{ padding: "100px 20px 60px", maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: "800", color: "#1a1a2e", marginBottom: 5 }}>CTV Dashboard</h1>
              <p style={{ color: "#666", fontSize: 14 }}>Chào mừng, {user.name}! 👋</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 14, color: "#666" }}>{user.email}</p>
                <p style={{ fontSize: 12, color: "#999" }}>Mã CTV: {user.refCode}</p>
              </div>
              <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 20, fontWeight: "bold" }}>
                {user.name.charAt(0)}
              </div>
              <button
                onClick={() => { setUser(null); setPage("login"); }}
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
              {products.map((product) => (
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
                  <div style={{ height: 160, background: "linear-gradient(135deg, #fff5f5 0%, #ffe4e8 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 60 }}>{product.image}</span>
                  </div>
                  <div style={{ padding: 16 }}>
                    <h4 style={{ fontSize: 14, fontWeight: "700", color: "#1a1a2e", marginBottom: 8, lineHeight: 1.3 }}>{product.title}</h4>
                    <p style={{ fontSize: 18, fontWeight: "800", color: "#e53935", marginBottom: 12 }}>{formatCurrency(product.price)}</p>
                    <button
                      onClick={() => copyToClipboard(getReferralLink(product.id))}
                      style={{
                        width: "100%",
                        padding: "10px",
                        background: "#f5f5f5",
                        color: "#333",
                        border: "none",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => { e.target.style.background = "#e53935"; e.target.style.color = "white"; }}
                      onMouseLeave={(e) => { e.target.style.background = "#f5f5f5"; e.target.style.color = "#333"; }}
                    >
                      📋 Sao chép link
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
                <th style={{ padding: "10px 8px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Cấp</th>
                <th style={{ padding: "10px 8px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => (
                <tr key={order.id}>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>#{order.id}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee" }}>{order.product}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee", textAlign: "right" }}>{formatCurrency(order.price)}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee", textAlign: "right", color: "#4caf50", fontWeight: "600" }}>+{formatCurrency(order.commission)}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee", textAlign: "center" }}>
                    <span style={{ background: order.level === "F1" ? "#e8f5e9" : order.level === "F2" ? "#e3f2fd" : "#f3e5f5", padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: "600" }}>{order.level}</span>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "1px solid #eee", textAlign: "center", color: "#666" }}>{order.date}</td>
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
              {mockWithdrawals.map((withdraw) => (
                <tr key={withdraw.id}>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee" }}>#{withdraw.id}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", textAlign: "right", fontWeight: "600" }}>{formatCurrency(withdraw.amount)}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", textAlign: "right", color: "#666" }}>{formatCurrency(withdraw.fee)}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", textAlign: "center" }}>
                    <span style={{ 
                      background: withdraw.status === "completed" ? "#e8f5e9" : "#fff3e0", 
                      color: withdraw.status === "completed" ? "#4caf50" : "#e65100",
                      padding: "4px 10px", 
                      borderRadius: 20, 
                      fontSize: 11, 
                      fontWeight: "600" 
                    }}>
                      {withdraw.status === "completed" ? "✅ Hoàn thành" : "⏳ Chờ duyệt"}
                    </span>
                  </td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", textAlign: "center", color: "#666" }}>{withdraw.date}</td>
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
              {mockUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee" }}>#{u.id}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", fontWeight: "600" }}>{u.name}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", color: "#666" }}>{u.email}</td>
                  <td style={{ padding: "10px 8px", borderBottom: "#eee", textAlign: "center", color: "#666" }}>{u.joinDate}</td>
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
