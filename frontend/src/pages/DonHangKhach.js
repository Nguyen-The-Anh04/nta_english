import { useState, useEffect } from "react";
import OrderDetail from "../components/OrderDetail";

const API = "http://localhost:5000/api";

const STATUS_MAP = {
  cho_tt: { label: "Chờ thanh toán", color: "#f59e0b", bg: "#fef3c7" },
  da_tt: { label: "Đã thanh toán", color: "#3b82f6", bg: "#dbeafe" },
  dang_giao: { label: "Đang giao hàng", color: "#8b5cf6", bg: "#ede9fe" },
  da_giao: { label: "Đã giao hàng", color: "#10b981", bg: "#d1fae5" },
  da_huy: { label: "Đã hủy", color: "#ef4444", bg: "#fee2e2" },
};

export default function DonHangKhach({ initialOrder }) {
  const [token, setToken] = useState(() => localStorage.getItem("kh_token") || "");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("kh_user") || "null"); } catch { return null; }
  });
  const [sdt, setSdt] = useState("");
  const [pass, setPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [logging, setLogging] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(initialOrder || null);

  // Nếu có initialOrder (từ localStorage sau đặt hàng), hiển thị luôn
  useEffect(() => {
    if (initialOrder) setSelectedOrder(initialOrder);
  }, [initialOrder]);

  // Load orders khi đã đăng nhập
  useEffect(() => {
    if (token && user) fetchOrders();
  }, [token, user]); // eslint-disable-line

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`${API}/books/orders?nguoi_dung_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOrders(data.data?.orders || []);
    } catch {}
    setLoadingOrders(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr("");
    setLogging(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdt: sdt.trim(), mat_khau: pass }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.data.token);
        setUser(data.data.user);
        localStorage.setItem("kh_token", data.data.token);
        localStorage.setItem("kh_user", JSON.stringify(data.data.user));
      } else {
        setLoginErr(data.message || "Sai số điện thoại hoặc mật khẩu");
      }
    } catch {
      setLoginErr("Lỗi kết nối, vui lòng thử lại");
    }
    setLogging(false);
  };

  const handleLogout = () => {
    setToken(""); setUser(null); setOrders([]); setSelectedOrder(null);
    localStorage.removeItem("kh_token");
    localStorage.removeItem("kh_user");
  };

  const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + " đ";
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

  const inp = {
    width: "100%", padding: "12px 16px", borderRadius: 8,
    border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  // Đang xem chi tiết 1 đơn
  if (selectedOrder) {
    return (
      <OrderDetail
        order={selectedOrder}
        onBack={() => setSelectedOrder(null)}
        onOrderCancelled={() => { setSelectedOrder(null); if (token) fetchOrders(); }}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ color: "#fff", textDecoration: "none", fontSize: 14 }}>← Trang chủ</a>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Đơn hàng của tôi</span>
        {user ? (
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>
            Đăng xuất
          </button>
        ) : <div style={{ width: 80 }} />}
      </div>

      <div style={{ maxWidth: 640, margin: "32px auto", padding: "0 16px" }}>
        {!token || !user ? (
          /* ---- FORM ĐĂNG NHẬP ---- */
          <div style={{ background: "#fff", borderRadius: 12, padding: 32, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Đăng nhập để xem đơn hàng</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
              Dùng số điện thoại đã đặt hàng và mật khẩu <strong>123456</strong> (mặc định)
            </div>
            <form onSubmit={handleLogin}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Số điện thoại</label>
                  <input
                    value={sdt} onChange={e => setSdt(e.target.value)}
                    placeholder="Nhập số điện thoại đặt hàng"
                    style={inp}
                    onFocus={e => e.target.style.borderColor = "#e11d48"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Mật khẩu</label>
                  <input
                    type="password" value={pass} onChange={e => setPass(e.target.value)}
                    placeholder="Mật khẩu (mặc định: 123456)"
                    style={inp}
                    onFocus={e => e.target.style.borderColor = "#e11d48"}
                    onBlur={e => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                {loginErr && <div style={{ color: "#ef4444", fontSize: 13 }}>{loginErr}</div>}
                <button type="submit" disabled={logging}
                  style={{ padding: "12px", background: logging ? "#ccc" : "#e11d48", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: logging ? "not-allowed" : "pointer" }}>
                  {logging ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </div>
            </form>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f3f4f6", textAlign: "center" }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>Chưa có đơn hàng? </span>
              <a href="/shop" style={{ fontSize: 13, color: "#e11d48", textDecoration: "none", fontWeight: 600 }}>Mua sắm ngay</a>
            </div>
          </div>
        ) : (
          /* ---- DANH SÁCH ĐƠN HÀNG ---- */
          <div>
            <div style={{ background: "#fff", borderRadius: 12, padding: "14px 20px", marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>👤</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{user.ho_ten || user.sdt}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{user.sdt}</div>
              </div>
            </div>

            {loadingOrders ? (
              <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontSize: 14 }}>Đang tải đơn hàng...</div>
            ) : orders.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Chưa có đơn hàng nào</div>
                <a href="/shop" style={{ fontSize: 13, color: "#e11d48", textDecoration: "none" }}>Mua sắm ngay →</a>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {orders.map(order => {
                  const st = STATUS_MAP[order.trang_thai] || { label: order.trang_thai, color: "#6b7280", bg: "#f3f4f6" };
                  return (
                    <div key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      style={{ background: "#fff", borderRadius: 12, padding: 18, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", cursor: "pointer", border: "1px solid #f3f4f6", transition: "box-shadow 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 6px rgba(0,0,0,0.06)"}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{order.ma_don_hang}</div>
                          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{fmtDate(order.created_at)}</div>
                        </div>
                        <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>
                        {(order.chiTiets || []).map(i => i.sach?.ten_sach).filter(Boolean).join(", ") || "—"}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>{(order.chiTiets || []).length} sản phẩm</span>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#e11d48" }}>{fmt(order.tong_tien)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
