import { useState } from "react";

export default function AdminDashboard({ onNavigate }) {
  // Mock data
  const stats = [
    { label: "Tổng CTV", value: "1,234", icon: "👥", color: "#4caf50", change: "+12%" },
    { label: "Tổng đơn hàng", value: "5,678", icon: "📦", color: "#2196f3", change: "+8%" },
    { label: "Doanh thu tháng", value: "2.5B", icon: "💰", color: "#e53935", change: "+15%" },
    { label: "Chờ duyệt rút tiền", value: "23", icon: "⏳", color: "#ff9800", change: "-5%" },
  ];

  const recentOrders = [
    { id: "#46242", user: "Nguyễn Văn A", product: "Cambridge IELTS 18", price: 189000, commission: 18900, status: "completed", date: "2024-04-20" },
    { id: "#46243", user: "Trần Thị B", product: "IELTS Speaking Booster", price: 199000, commission: 19900, status: "completed", date: "2024-04-20" },
    { id: "#46244", user: "Lê Văn C", product: "Target TOEIC 900", price: 175000, commission: 8750, status: "pending", date: "2024-04-19" },
    { id: "#46245", user: "Phạm Thị D", product: "English Grammar in Use", price: 165000, commission: 16500, status: "completed", date: "2024-04-19" },
    { id: "#46246", user: "Ngô Văn E", product: "Vocabulary for IELTS", price: 135000, commission: 6750, status: "cancelled", date: "2024-04-18" },
  ];

  const recentWithdrawals = [
    { id: "#WT001", user: "Nguyễn Văn A", amount: 500000, fee: 1000, status: "pending", date: "2024-04-20", bank: "MB BANK" },
    { id: "#WT002", user: "Trần Thị B", amount: 300000, fee: 1000, status: "completed", date: "2024-04-19", bank: "Vietcombank" },
    { id: "#WT003", user: "Lê Văn C", amount: 200000, fee: 1000, status: "completed", date: "2024-04-18", bank: "Techcombank" },
  ];

  const topCTVs = [
    { rank: 1, name: "Nguyễn Văn A", revenue: 1200000, orders: 45, avatar: "👨" },
    { rank: 2, name: "Trần Thị B", revenue: 980000, orders: 38, avatar: "👩" },
    { rank: 3, name: "Lê Văn C", revenue: 850000, orders: 32, avatar: "👨" },
    { rank: 4, name: "Phạm Thị D", revenue: 720000, orders: 28, avatar: "👩" },
    { rank: 5, name: "Ngô Văn E", revenue: 650000, orders: 25, avatar: "👨" },
  ];

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("vi-VN") + " đ";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: "#e8f5e9", color: "#4caf50", text: "Hoàn thành" },
      pending: { bg: "#fff3e0", color: "#ff9800", text: "Chờ xử lý" },
      cancelled: { bg: "#ffebee", color: "#f44336", text: "Đã hủy" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        style={{
          background: config.bg,
          color: config.color,
          padding: "5px 12px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: "600",
        }}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div>
      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 30 }}>
        {stats.map((stat, index) => (
          <div
            key={index}
            style={{
              background: "white",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 15 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 12,
                  background: stat.color + "20",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {stat.icon}
              </div>
              <span
                style={{
                  background: stat.change.includes("+") ? "#e8f5e9" : "#ffebee",
                  color: stat.change.includes("+") ? "#4caf50" : "#f44336",
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {stat.change}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "#666", marginBottom: 5 }}>{stat.label}</p>
            <p style={{ fontSize: 28, fontWeight: "800", color: "#1a1a2e", margin: 0 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts & Tables Row */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 30 }}>
        {/* Recent Orders */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e", margin: 0 }}>Đơn hàng gần đây</h3>
            <button style={{ background: "none", border: "none", color: "#e53935", fontWeight: "600", cursor: "pointer" }}>
              Xem tất cả →
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>Mã đơn</th>
                <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>Khách hàng</th>
                <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>Sản phẩm</th>
                <th style={{ padding: "12px 8px", textAlign: "right", color: "#666", fontSize: 13 }}>Giá trị</th>
                <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 8px", fontWeight: "600", color: "#1a1a2e" }}>{order.id}</td>
                  <td style={{ padding: "12px 8px", color: "#333" }}>{order.user}</td>
                  <td style={{ padding: "12px 8px", color: "#666" }}>{order.product}</td>
                  <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "600", color: "#e53935" }}>
                    {formatCurrency(order.price)}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>{getStatusBadge(order.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top CTV */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e", marginBottom: 20 }}>Top CTV tháng</h3>
          {topCTVs.map((ctv, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: index < 4 ? "1px solid #f5f5f5" : "none",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: index === 0 ? "#ffd700" : index === 1 ? "#c0c0c0" : index === 2 ? "#cd7f32" : "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: "bold",
                  color: index < 3 ? "#333" : "#666",
                }}
              >
                {ctv.rank}
              </div>
              <span style={{ fontSize: 24 }}>{ctv.avatar}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#333" }}>{ctv.name}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{ctv.orders} đơn hàng</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: "700", color: "#4caf50" }}>{formatCurrency(ctv.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Withdrawals & Activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent Withdrawals */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e", margin: 0 }}>Yêu cầu rút tiền gần đây</h3>
            <button style={{ background: "none", border: "none", color: "#e53935", fontWeight: "600", cursor: "pointer" }}>
              Xem tất cả →
            </button>
          </div>
          {recentWithdrawals.map((withdraw, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "15px 0",
                borderBottom: index < 2 ? "1px solid #f5f5f5" : "none",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#333" }}>{withdraw.user}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                  {withdraw.bank} • {withdraw.date}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: "700", color: "#e53935" }}>
                  -{formatCurrency(withdraw.amount)}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: "#888" }}>Phí: {formatCurrency(withdraw.fee)}</p>
              </div>
              {getStatusBadge(withdraw.status)}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e", marginBottom: 20 }}>Thao tác nhanh</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
            {[
              { icon: "👥", label: "Thêm CTV", color: "#4caf50", action: "users" },
              { icon: "📦", label: "Thêm đơn hàng", color: "#2196f3", action: "orders" },
              { icon: "💸", label: "Duyệt rút tiền", color: "#ff9800", action: "withdrawals" },
              { icon: "📚", label: "Thêm sản phẩm", color: "#9c27b0", action: "products" },
            ].map((action, index) => (
              <button
                key={index}
                style={{
                  padding: 20,
                  background: "white",
                  border: "2px solid #f0f0f0",
                  borderRadius: 12,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = action.color;
                  e.currentTarget.style.background = action.color + "10";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#f0f0f0";
                  e.currentTarget.style.background = "white";
                }}
                onClick={() => onNavigate && onNavigate(action.action)}
              >
                <span style={{ fontSize: 28 }}>{action.icon}</span>
                <span style={{ fontSize: 13, fontWeight: "600", color: "#333" }}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
