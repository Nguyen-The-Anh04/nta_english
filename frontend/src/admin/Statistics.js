import { useState } from "react";

export default function Statistics() {
  const [activeTab, setActiveTab] = useState("revenue");

  // Mock data for revenue chart (monthly)
  const monthlyRevenue = [
    { month: "T1", revenue: 120000000, orders: 145 },
    { month: "T2", revenue: 145000000, orders: 168 },
    { month: "T3", revenue: 132000000, orders: 155 },
    { month: "T4", revenue: 178000000, orders: 198 },
    { month: "T5", revenue: 165000000, orders: 182 },
    { month: "T6", revenue: 189000000, orders: 215 },
    { month: "T7", revenue: 210000000, orders: 245 },
    { month: "T8", revenue: 195000000, orders: 228 },
    { month: "T9", revenue: 225000000, orders: 260 },
    { month: "T10", revenue: 198000000, orders: 235 },
    { month: "T11", revenue: 235000000, orders: 275 },
    { month: "T12", revenue: 268000000, orders: 310 },
  ];

  // Mock data for daily revenue (last 7 days)
  const dailyRevenue = [
    { day: "T2", revenue: 8500000, orders: 28 },
    { day: "T3", revenue: 7200000, orders: 24 },
    { day: "T4", revenue: 9800000, orders: 32 },
    { day: "T5", revenue: 8900000, orders: 29 },
    { day: "T6", revenue: 11500000, orders: 38 },
    { day: "T7", revenue: 13200000, orders: 42 },
    { day: "CN", revenue: 6800000, orders: 22 },
  ];

  // Mock data for products
  const bestSellingProducts = [
    { id: 1, name: "Cambridge IELTS 18", sold: 312, revenue: 58968000, stock: 45, trend: "up" },
    { id: 2, name: "IELTS Speaking Booster", sold: 287, revenue: 57133000, stock: 62, trend: "up" },
    { id: 3, name: "Target TOEIC 900", sold: 265, revenue: 46375000, stock: 38, trend: "up" },
    { id: 4, name: "English Grammar in Use", sold: 234, revenue: 38610000, stock: 78, trend: "stable" },
    { id: 5, name: "Vocabulary for IELTS", sold: 198, revenue: 26730000, stock: 95, trend: "down" },
  ];

  const slowMovingProducts = [
    { id: 6, name: "Business English", sold: 23, revenue: 3450000, stock: 150, trend: "down" },
    { id: 7, name: "TOEFL Preparation", sold: 18, revenue: 2340000, stock: 200, trend: "down" },
    { id: 8, name: "Advanced Writing", sold: 12, revenue: 1560000, stock: 180, trend: "down" },
    { id: 9, name: "Listening Practice", sold: 8, revenue: 960000, stock: 220, trend: "down" },
    { id: 10, name: "Pronunciation Guide", sold: 5, revenue: 450000, stock: 250, trend: "down" },
  ];

  // Mock data for best sale CTV
  const topAffiliates = [
    { rank: 1, name: "Nguyễn Văn A", avatar: "👨", orders: 145, revenue: 28900000, commission: 2890000, rate: 10 },
    { rank: 2, name: "Trần Thị B", avatar: "👩", orders: 132, revenue: 26500000, commission: 2650000, rate: 10 },
    { rank: 3, name: "Lê Văn C", avatar: "👨", orders: 118, revenue: 23400000, commission: 2340000, rate: 10 },
    { rank: 4, name: "Phạm Thị D", avatar: "👩", orders: 98, revenue: 19800000, commission: 1980000, rate: 10 },
    { rank: 5, name: "Ngô Văn E", avatar: "👨", orders: 87, revenue: 17500000, commission: 1750000, rate: 10 },
    { rank: 6, name: "Hoàng Thị F", avatar: "👩", orders: 76, revenue: 15200000, commission: 1520000, rate: 10 },
    { rank: 7, name: "Đặng Văn G", avatar: "👨", orders: 65, revenue: 13100000, commission: 1310000, rate: 10 },
  ];

  const formatCurrency = (amount) => {
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + "B";
    } else if (amount >= 1000000) {
      return (amount / 1000000).toFixed(0) + "M";
    }
    return amount.toLocaleString("vi-VN");
  };

  const getMaxRevenue = (data) => Math.max(...data.map((d) => d.revenue));

  const tabs = [
    { id: "revenue", label: "Doanh thu", icon: "💰" },
    { id: "products", label: "Sản phẩm", icon: "📦" },
    { id: "affiliates", label: "Best Sale CTV", icon: "👑" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: "700", color: "#1a1a2e", marginBottom: 8 }}>
          📈 Thống kê
        </h1>
        <p style={{ color: "#666", fontSize: 14 }}>Theo dõi doanh thu, sản phẩm và CTV</p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          background: "white",
          padding: 8,
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: activeTab === tab.id ? "#e11d48" : "transparent",
              color: activeTab === tab.id ? "white" : "#666",
              transition: "all 0.2s",
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Revenue Tab */}
      {activeTab === "revenue" && (
        <div>
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 24 }}>
            <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>Doanh thu tháng này</p>
              <p style={{ fontSize: 24, fontWeight: "800", color: "#4caf50", margin: 0 }}>{formatCurrency(268000000)}</p>
              <p style={{ fontSize: 12, color: "#4caf50", marginTop: 4 }}>↑ +14% so với tháng trước</p>
            </div>
            <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>Doanh thu năm</p>
              <p style={{ fontSize: 24, fontWeight: "800", color: "#2196f3", margin: 0 }}>{formatCurrency(2180000000)}</p>
              <p style={{ fontSize: 12, color: "#4caf50", marginTop: 4 }}>↑ +23% so với năm trước</p>
            </div>
            <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>Đơn hàng tháng này</p>
              <p style={{ fontSize: 24, fontWeight: "800", color: "#ff9800", margin: 0 }}>310</p>
              <p style={{ fontSize: 12, color: "#4caf50", marginTop: 4 }}>↑ +12% so với tháng trước</p>
            </div>
            <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>Giá trị đơn TB</p>
              <p style={{ fontSize: 24, fontWeight: "800", color: "#9c27b0", margin: 0 }}>865K</p>
              <p style={{ fontSize: 12, color: "#4caf50", marginTop: 4 }}>↑ +2% so với tháng trước</p>
            </div>
          </div>

          {/* Monthly Revenue Chart */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.05)", marginBottom: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e", marginBottom: 20 }}>Doanh thu theo tháng</h3>
            <div style={{ height: 250, display: "flex", alignItems: "flex-end", gap: 12, paddingBottom: 30, position: "relative" }}>
              {/* Grid lines */}
              <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 30, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none" }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} style={{ borderBottom: "1px dashed #e0e0e0", width: "100%" }}></div>
                ))}
              </div>
              {monthlyRevenue.map((item, index) => {
                const height = (item.revenue / getMaxRevenue(monthlyRevenue)) * 200;
                return (
                  <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                    <div
                      style={{
                        width: "100%",
                        height: height,
                        background: "linear-gradient(180deg, #e11d48 0%, #ff6b6b 100%)",
                        borderRadius: "6px 6px 0 0",
                        transition: "all 0.3s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.8)}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: -25,
                          left: "50%",
                          transform: "translateX(-50%)",
                          background: "#1a1a2e",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: "600",
                          whiteSpace: "nowrap",
                          opacity: 0,
                          transition: "opacity 0.2s",
                        }}
                        className="tooltip"
                      >
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                    <span style={{ position: "absolute", bottom: 5, fontSize: 11, color: "#666" }}>{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Revenue Chart */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e", marginBottom: 20 }}>Doanh thu 7 ngày gần nhất</h3>
            <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 20, paddingBottom: 30 }}>
              {dailyRevenue.map((item, index) => {
                const height = (item.revenue / getMaxRevenue(dailyRevenue)) * 150;
                return (
                  <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: "100%",
                        height: height,
                        background: "#4caf50",
                        borderRadius: "6px 6px 0 0",
                      }}
                    ></div>
                    <span style={{ marginTop: 8, fontSize: 11, color: "#666" }}>{item.day}</span>
                    <span style={{ fontSize: 10, color: "#999" }}>{formatCurrency(item.revenue)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Best Selling */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              🔥 Sản phẩm bán chạy
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {bestSellingProducts.map((product, index) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    background: index === 0 ? "linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)" : "#f8f9fa",
                    borderRadius: 10,
                    border: index === 0 ? "2px solid #ffc107" : "2px solid transparent",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: index === 0 ? "#ffc107" : index === 1 ? "#9e9e9e" : index === 2 ? "#cd7f32" : "#e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: "bold",
                      color: index < 3 ? "#333" : "#666",
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#333" }}>{product.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Đã bán: {product.sold}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: "700", color: "#4caf50" }}>{formatCurrency(product.revenue)}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#888" }}>Tồn: {product.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slow Moving */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              📉 Sản phẩm bán ế
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {slowMovingProducts.map((product, index) => (
                <div
                  key={product.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    background: "#fff5f5",
                    borderRadius: 10,
                    border: "2px solid #ffebee",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#ffcdd2",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: "bold",
                      color: "#c62828",
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#333" }}>{product.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Đã bán: {product.sold}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: "700", color: "#e53935" }}>{formatCurrency(product.revenue)}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#888" }}>Tồn: {product.stock}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: 16, background: "#fff3e0", borderRadius: 10, border: "2px solid #ffe0b2" }}>
              <p style={{ margin: 0, fontSize: 13, color: "#e65100", fontWeight: "600" }}>💡 Khuyến nghị</p>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: "#666" }}>Các sản phẩm bán ế nên được giảm giá hoặc khuyến mãi để kích cầu.</p>
            </div>
          </div>
        </div>
      )}

      {/* Best Sale CTV Tab */}
      {activeTab === "affiliates" && (
        <div>
          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 24 }}>
            <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>Tổng CTV tích cực</p>
              <p style={{ fontSize: 24, fontWeight: "800", color: "#e11d48", margin: 0 }}>127</p>
            </div>
            <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>Doanh thu từ CTV</p>
              <p style={{ fontSize: 24, fontWeight: "800", color: "#4caf50", margin: 0 }}>{formatCurrency(154400000)}</p>
            </div>
            <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>Hoa hồng đã trả</p>
              <p style={{ fontSize: 24, fontWeight: "800", color: "#ff9800", margin: 0 }}>{formatCurrency(15440000)}</p>
            </div>
          </div>

          {/* Top CTV Table */}
          <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              👑 Top CTV xuất sắc nhất
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                  <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>Hạng</th>
                  <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>CTV</th>
                  <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Đơn hàng</th>
                  <th style={{ padding: "12px 8px", textAlign: "right", color: "#666", fontSize: 13 }}>Doanh thu</th>
                  <th style={{ padding: "12px 8px", textAlign: "right", color: "#666", fontSize: 13 }}>Hoa hồng</th>
                </tr>
              </thead>
              <tbody>
                {topAffiliates.map((affiliate) => (
                  <tr
                    key={affiliate.rank}
                    style={{
                      borderBottom: "1px solid #f5f5f5",
                      background: affiliate.rank <= 3 ? (affiliate.rank === 1 ? "linear-gradient(90deg, #fff8e1 0%, transparent 100%)" : affiliate.rank === 2 ? "linear-gradient(90deg, #f5f5f5 0%, transparent 100%)" : affiliate.rank === 3 ? "linear-gradient(90deg, #ffe0b2 0%, transparent 100%)" : "transparent") : "transparent",
                    }}
                  >
                    <td style={{ padding: "16px 8px" }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: affiliate.rank === 1 ? "#ffd700" : affiliate.rank === 2 ? "#c0c0c0" : affiliate.rank === 3 ? "#cd7f32" : "#f5f5f5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          fontWeight: "bold",
                          color: affiliate.rank <= 3 ? "#333" : "#666",
                        }}
                      >
                        {affiliate.rank <= 3 ? "🏆" : affiliate.rank}
                      </div>
                    </td>
                    <td style={{ padding: "16px 8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 28 }}>{affiliate.avatar}</span>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#333" }}>{affiliate.name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: "#888" }}>Hoa hồng: {affiliate.rate}%</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 8px", textAlign: "center", fontWeight: "600", color: "#333" }}>
                      {affiliate.orders}
                    </td>
                    <td style={{ padding: "16px 8px", textAlign: "right", fontWeight: "700", color: "#4caf50" }}>
                      {formatCurrency(affiliate.revenue)}
                    </td>
                    <td style={{ padding: "16px 8px", textAlign: "right", fontWeight: "600", color: "#ff9800" }}>
                      {formatCurrency(affiliate.commission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .tooltip {
          pointer-events: none;
        }
        div:hover .tooltip {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
