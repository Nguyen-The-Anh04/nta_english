import { useState, useEffect } from "react";
import { fetchOrders, fetchAllWithdrawals, fetchCTVs } from "../api";

const API = "http://localhost:5000/api";
const token = () => localStorage.getItem("token");
const authH = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + " đ";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

const STATUS_CFG = {
  cho_tt:    { bg: "#fff3e0", color: "#f59e0b", text: "Chờ TT" },
  da_tt:     { bg: "#dbeafe", color: "#3b82f6", text: "Đã TT" },
  dang_giao: { bg: "#ede9fe", color: "#8b5cf6", text: "Đang giao" },
  da_giao:   { bg: "#d1fae5", color: "#10b981", text: "Đã giao" },
  da_huy:    { bg: "#fee2e2", color: "#ef4444", text: "Đã hủy" },
  completed: { bg: "#d1fae5", color: "#10b981", text: "Hoàn thành" },
  pending:   { bg: "#fff3e0", color: "#f59e0b", text: "Chờ xử lý" },
  cancelled: { bg: "#fee2e2", color: "#ef4444", text: "Đã hủy" },
};

const Badge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  return (
    <span style={{ background: cfg.bg, color: cfg.color, padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {cfg.text}
    </span>
  );
};

const imgSrc = (hinh_anh) => {
  if (!hinh_anh) return null;
  if (hinh_anh.startsWith("http")) return hinh_anh;
  if (hinh_anh.startsWith("/uploads/")) return `http://localhost:5000${hinh_anh}`;
  return `http://localhost:5000/uploads/${hinh_anh}`;
};

export default function AdminDashboard({ onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({ totalCTV: 0, totalOrders: 0, revenue: 0, pendingWithdraw: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [topCTVs, setTopCTVs] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ordersRes, withdrawRes, ctvRes] = await Promise.all([
          fetch(`${API}/books/orders?limit=100`, { headers: authH() }).then(r => r.json()),
          fetch(`${API}/affiliate/admin/withdrawals`, { headers: authH() }).then(r => r.json()),
          fetch(`${API}/affiliate/admin/ctvs?limit=100`, { headers: authH() }).then(r => r.json()),
        ]);

        const orders = ordersRes.data?.orders || [];
        const withdrawals = Array.isArray(withdrawRes.data) ? withdrawRes.data : (withdrawRes.data?.withdrawals || []);
        const ctvs = ctvRes.data?.ctvs || [];

        // Stats
        const revenue = orders.filter(o => o.trang_thai === "da_tt" || o.trang_thai === "da_giao")
          .reduce((s, o) => s + parseFloat(o.tong_tien || 0), 0);
        const pendingW = withdrawals.filter(w => w.trang_thai === "cho_duyet").length;

        setStatsData({ totalCTV: ctvRes.data?.pagination?.total || ctvs.length, totalOrders: orders.length, revenue, pendingWithdraw: pendingW });

        // Recent orders — sort by created_at desc, take 5
        const sorted = [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
        setRecentOrders(sorted);

        // Recent withdrawals
        const sortedW = [...withdrawals].sort((a, b) => new Date(b.ngay_yeu_cau || b.created_at || 0) - new Date(a.ngay_yeu_cau || a.created_at || 0)).slice(0, 4);
        setRecentWithdrawals(sortedW);

        // Top CTVs by tong_hoa_hong
        const sortedCTV = [...ctvs].sort((a, b) => (b.tong_hoa_hong || 0) - (a.tong_hoa_hong || 0)).slice(0, 5);
        setTopCTVs(sortedCTV);
      } catch (e) {
        console.error("Dashboard load error:", e);
      }
      setLoading(false);
    };
    load();
  }, []);

  const STAT_CARDS = [
    { label: "Tổng CTV", value: statsData.totalCTV.toLocaleString("vi-VN"), icon: "👥", color: "#10b981" },
    { label: "Tổng đơn hàng", value: statsData.totalOrders.toLocaleString("vi-VN"), icon: "📦", color: "#3b82f6" },
    { label: "Doanh thu (đã TT)", value: fmt(statsData.revenue), icon: "💰", color: "#e11d48", small: true },
    { label: "Chờ duyệt rút tiền", value: statsData.pendingWithdraw.toLocaleString("vi-VN"), icon: "⏳", color: "#f59e0b" },
  ];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ fontSize: 14, color: "#9ca3af" }}>Đang tải dữ liệu...</div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {STAT_CARDS.map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>{s.label}</span>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: s.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: s.small ? 20 : 28, fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Orders + Top CTV */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Recent Orders */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Đơn hàng gần đây</span>
            <button onClick={() => onNavigate && onNavigate("orders")}
              style={{ background: "none", border: "none", color: "#e11d48", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Xem tất cả →
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fef2f2" }}>
                {["Mã đơn", "Khách hàng", "Sản phẩm", "Giá trị", "Trạng thái"].map((h, i) => (
                  <th key={i} style={{ padding: "9px 10px", textAlign: i >= 3 ? "right" : "left", fontSize: 12, fontWeight: 700, color: "#ef4444", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Chưa có đơn hàng</td></tr>
              )}
              {recentOrders.map((order) => {
                const item0 = order.chiTiets?.[0];
                const sach = item0?.sach;
                const khach = order.nguoiMua?.ho_ten || order.dia_chi_giao?.split(" - ")?.[0] || "Khách vãng lai";
                return (
                  <tr key={order.id} style={{ borderBottom: "1px solid #f9fafb" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <td style={{ padding: "10px 10px", fontWeight: 700, color: "#111827", fontSize: 12, whiteSpace: "nowrap" }}>
                      {order.ma_don_hang}
                    </td>
                    <td style={{ padding: "10px 10px", fontSize: 13, color: "#374151", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {khach}
                    </td>
                    <td style={{ padding: "10px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {sach?.hinh_anh ? (
                          <img src={imgSrc(sach.hinh_anh)} alt={sach.ten_sach}
                            style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover", border: "1px solid #e5e7eb", flexShrink: 0 }}
                            onError={e => { e.target.style.display = "none"; }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: 6, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>📚</div>
                        )}
                        <span style={{ fontSize: 12, color: "#374151", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {sach?.ten_sach || "Sản phẩm"}
                          {(order.chiTiets?.length || 0) > 1 && <span style={{ color: "#9ca3af" }}> +{order.chiTiets.length - 1}</span>}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700, color: "#e11d48", fontSize: 13, whiteSpace: "nowrap" }}>
                      {fmt(order.tong_tien)}
                    </td>
                    <td style={{ padding: "10px 10px", textAlign: "right" }}>
                      <Badge status={order.trang_thai} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Top CTV */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", display: "block", marginBottom: 18 }}>Top CTV tháng</span>
          {topCTVs.length === 0 && <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: 20 }}>Chưa có dữ liệu</div>}
          {topCTVs.map((ctv, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < topCTVs.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: i === 0 ? "#fbbf24" : i === 1 ? "#9ca3af" : i === 2 ? "#d97706" : "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: i < 3 ? "#fff" : "#6b7280", flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {["👨", "👩", "👴", "👵", "🧑"][i] || "👤"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ctv.nguoiDung?.ho_ten || "CTV"}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{(ctv.tong_f1 || 0) + (ctv.tong_f2 || 0) + (ctv.tong_f3 || 0)} downline</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981", whiteSpace: "nowrap" }}>
                {fmt(ctv.tong_hoa_hong)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawals + Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent Withdrawals */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Yêu cầu rút tiền</span>
            <button onClick={() => onNavigate && onNavigate("withdrawals")}
              style={{ background: "none", border: "none", color: "#e11d48", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Xem tất cả →
            </button>
          </div>
          {recentWithdrawals.length === 0 && <div style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: 20 }}>Chưa có yêu cầu</div>}
          {recentWithdrawals.map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < recentWithdrawals.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{w.ctv?.nguoiDung?.ho_ten || "CTV"}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{w.ten_ngan_hang || "Ngân hàng"} • {fmtDate(w.ngay_yeu_cau)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#e11d48" }}>{fmt(w.so_tien)}</span>
                <Badge status={w.trang_thai === "cho_duyet" ? "pending" : w.trang_thai === "da_duyet" ? "completed" : "cancelled"} />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 22, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", display: "block", marginBottom: 18 }}>Thao tác nhanh</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { icon: "👥", label: "Quản lý CTV", color: "#10b981", action: "ctv" },
              { icon: "📦", label: "Đơn hàng", color: "#3b82f6", action: "orders" },
              { icon: "💸", label: "Duyệt rút tiền", color: "#f59e0b", action: "withdrawals" },
              { icon: "📚", label: "Sản phẩm", color: "#8b5cf6", action: "products" },
            ].map((a, i) => (
              <button key={i} onClick={() => onNavigate && onNavigate(a.action)}
                style={{ padding: "18px 12px", background: a.color + "0d", border: `1.5px solid ${a.color}30`, borderRadius: 12, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = a.color + "20"; e.currentTarget.style.borderColor = a.color; }}
                onMouseLeave={e => { e.currentTarget.style.background = a.color + "0d"; e.currentTarget.style.borderColor = a.color + "30"; }}>
                <span style={{ fontSize: 26 }}>{a.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: a.color }}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
