import { useState } from "react";

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("all");

  // Mock data
  const orders = [
    { id: 46242, userId: 33311, userName: "Nguyễn Văn A", userEmail: "a@example.com", ctvName: "Trần Thị B", product: "Cambridge IELTS 18 Academic", price: 189000, commission: 18900, level: "F1", status: "completed", refCode: "REFDEF456", date: "2024-04-20", paymentMethod: "Chuyển khoản" },
    { id: 46243, userId: 33466, userName: "Lê Văn C", userEmail: "c@example.com", ctvName: "Phạm Thị D", product: "IELTS Speaking Booster", price: 199000, commission: 9950, level: "F2", status: "completed", refCode: "REFJKL012", date: "2024-04-20", paymentMethod: "MoMo" },
    { id: 46244, userId: 33467, userName: "Vũ Văn E", userEmail: "e@example.com", ctvName: "Ngô Văn F", product: "Target TOEIC 900", price: 175000, commission: 8750, level: "F2", status: "pending", refCode: "REFMNO345", date: "2024-04-19", paymentMethod: "Tiền mặt" },
    { id: 46245, userId: 33468, userName: "Đặng Thị G", userEmail: "g@example.com", ctvName: "Nguyễn Văn A", product: "English Grammar in Use", price: 165000, commission: 16500, level: "F1", status: "completed", refCode: "REFABC123", date: "2024-04-19", paymentMethod: "Chuyển khoản" },
    { id: 46246, userId: 33469, userName: "Bùi Văn H", userEmail: "h@example.com", ctvName: "Trần Thị B", product: "Vocabulary for IELTS", price: 135000, commission: 6750, level: "F3", status: "cancelled", refCode: "REFDEF456", date: "2024-04-18", paymentMethod: "Chuyển khoản" },
    { id: 46247, userId: 33470, userName: "Lý Thị I", userEmail: "i@example.com", ctvName: "Lê Văn C", product: "Cambridge KET Practice Tests", price: 145000, commission: 7250, level: "F2", status: "completed", refCode: "REFGHI789", date: "2024-04-18", paymentMethod: "ZaloPay" },
    { id: 46248, userId: 33471, userName: "Trịnh Văn J", userEmail: "j@example.com", ctvName: "Phạm Thị D", product: "600 Essential Words for TOEIC", price: 99000, commission: 4950, level: "F3", status: "refunded", refCode: "REFJKL012", date: "2024-04-17", paymentMethod: "Chuyển khoản" },
  ];

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("vi-VN") + " đ";
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id.toString().includes(searchTerm) ||
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.ctvName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: "#e8f5e9", color: "#4caf50", text: "Hoàn thành" },
      pending: { bg: "#fff3e0", color: "#ff9800", text: "Chờ xử lý" },
      cancelled: { bg: "#ffebee", color: "#f44336", text: "Đã hủy" },
      refunded: { bg: "#f3e5f5", color: "#9c27b0", text: "Đã hoàn tiền" },
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

  const getLevelBadge = (level) => {
    const levelConfig = {
      F1: { bg: "#e8f5e9", color: "#4caf50" },
      F2: { bg: "#e3f2fd", color: "#2196f3" },
      F3: { bg: "#f3e5f5", color: "#9c27b0" },
    };
    const config = levelConfig[level] || levelConfig.F1;
    return (
      <span
        style={{
          background: config.bg,
          color: config.color,
          padding: "3px 10px",
          borderRadius: 20,
          fontSize: 11,
          fontWeight: "700",
        }}
      >
        {level}
      </span>
    );
  };

  // Stats
  const totalRevenue = orders.filter(o => o.status === "completed").reduce((sum, o) => sum + o.price, 0);
  const totalCommission = orders.filter(o => o.status === "completed").reduce((sum, o) => sum + o.commission, 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  return (
    <div>
      {/* Actions Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 }}>
        <div style={{ display: "flex", gap: 15 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Tìm kiếm đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "12px 15px 12px 45px",
                borderRadius: 10,
                border: "1px solid #e0e0e0",
                width: 300,
                fontSize: 14,
                outline: "none",
              }}
            />
            <span style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#999" }}>
              🔍
            </span>
          </div>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "12px 15px",
              borderRadius: 10,
              border: "1px solid #e0e0e0",
              fontSize: 14,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="completed">Hoàn thành</option>
            <option value="pending">Chờ xử lý</option>
            <option value="cancelled">Đã hủy</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        </div>

        <button
          style={{
            padding: "12px 25px",
            background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          📥 Export Excel
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15, marginBottom: 25 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Tổng đơn hàng</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: "#2196f3" }}>{orders.length}</p>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Doanh thu</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: "#4caf50" }}>{formatCurrency(totalRevenue)}</p>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Hoa hồng CTV</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: "#e53935" }}>{formatCurrency(totalCommission)}</p>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Chờ xử lý</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: "#ff9800" }}>{pendingOrders}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
              <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>Mã đơn</th>
              <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>Khách hàng</th>
              <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>CTV giới thiệu</th>
              <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>Sản phẩm</th>
              <th style={{ padding: "12px 8px", textAlign: "right", color: "#666", fontSize: 13 }}>Giá trị</th>
              <th style={{ padding: "12px 8px", textAlign: "right", color: "#666", fontSize: 13 }}>Hoa hồng</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Cấp</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Thanh toán</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Trạng thái</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Ngày</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "12px 8px", fontWeight: "700", color: "#1a1a2e" }}>#{order.id}</td>
                <td style={{ padding: "12px 8px" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#333" }}>{order.userName}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{order.userEmail}</p>
                  </div>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, color: "#333" }}>{order.ctvName}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#888" }}>{order.refCode}</p>
                  </div>
                </td>
                <td style={{ padding: "12px 8px", color: "#666", fontSize: 13 }}>{order.product}</td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "600", color: "#333" }}>
                  {formatCurrency(order.price)}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "700", color: "#4caf50" }}>
                  +{formatCurrency(order.commission)}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>{getLevelBadge(order.level)}</td>
                <td style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>{order.paymentMethod}</td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>{getStatusBadge(order.status)}</td>
                <td style={{ padding: "12px 8px", textAlign: "center", color: "#888", fontSize: 13 }}>{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
