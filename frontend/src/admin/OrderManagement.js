import { useState, useEffect } from "react";
import { fetchOrders, fetchOrderStats, fetchOrderById } from "../api";

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    all: 0,
    cho_tt: 0,
    da_tt: 0,
    dang_giao: 0,
    da_giao: 0,
    da_huy: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ordersData, statsData] = await Promise.all([
        fetchOrders(),
        fetchOrderStats()
      ]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("vi-VN") + " đ";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.ma_don_hang?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.nguoiMua?.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.ctv?.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || order.trang_thai === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      cho_tt: { bg: "#fff3e0", color: "#ff9800", text: "Chờ thanh toán" },
      da_tt: { bg: "#e8f5e9", color: "#4caf50", text: "Đã thanh toán" },
      dang_giao: { bg: "#e3f2fd", color: "#2196f3", text: "Đang giao" },
      da_giao: { bg: "#f3e5f5", color: "#9c27b0", text: "Đã giao" },
      da_huy: { bg: "#ffebee", color: "#f44336", text: "Đã hủy" },
    };
    const config = statusConfig[status] || statusConfig.cho_tt;
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

  const getPaymentMethod = (method) => {
    const methodConfig = {
      cod: "Tiền mặt",
      vnpay: "VNPay",
      momo: "MoMo",
      chuyen_khoan: "Chuyển khoản",
    };
    return methodConfig[method] || method;
  };

  const handleViewDetail = async (orderId) => {
    try {
      const orderDetail = await fetchOrderById(orderId);
      setSelectedOrder(orderDetail);
      setShowDetail(true);
    } catch (error) {
      console.error("Error fetching order detail:", error);
    }
  };

  // Stats
  const totalRevenue = orders.filter(o => o.trang_thai === "da_giao").reduce((sum, o) => sum + parseFloat(o.tong_tien || 0), 0);
  const pendingOrders = stats.cho_tt || 0;

  const tabs = [
    { key: "all", label: "Tất cả", count: stats.all || 0 },
    { key: "cho_tt", label: "Chờ thanh toán", count: stats.cho_tt || 0 },
    { key: "da_tt", label: "Đã thanh toán", count: stats.da_tt || 0 },
    { key: "dang_giao", label: "Đang giao", count: stats.dang_giao || 0 },
    { key: "da_giao", label: "Đã giao", count: stats.da_giao || 0 },
    { key: "da_huy", label: "Đã hủy", count: stats.da_huy || 0 },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <div style={{ fontSize: 16, color: "#666" }}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 10, marginBottom: 25, borderBottom: "2px solid #f0f0f0", paddingBottom: 15 }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: filterStatus === tab.key ? "none" : "1px solid #e0e0e0",
              background: filterStatus === tab.key ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "white",
              color: filterStatus === tab.key ? "white" : "#666",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 0.3s ease",
            }}
          >
            {tab.label}
            <span
              style={{
                background: filterStatus === tab.key ? "rgba(255,255,255,0.3)" : "#f0f0f0",
                padding: "2px 8px",
                borderRadius: 12,
                fontSize: 12,
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

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
          <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: "#2196f3" }}>{stats.all || 0}</p>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Doanh thu</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: "#4caf50" }}>{formatCurrency(totalRevenue)}</p>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Đã giao</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: "#9c27b0" }}>{stats.da_giao || 0}</p>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Chờ thanh toán</p>
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
              <th style={{ padding: "12px 8px", textAlign: "right", color: "#666", fontSize: 13 }}>Tổng tiền</th>
              <th style={{ padding: "12px 8px", textAlign: "right", color: "#666", fontSize: 13 }}>Giảm giá</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Thanh toán</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Trạng thái</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Ngày</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ padding: 40, textAlign: "center", color: "#999" }}>
                  Không có đơn hàng nào
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 8px", fontWeight: "700", color: "#1a1a2e" }}>#{order.ma_don_hang}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#333" }}>
                        {order.nguoiMua?.ho_ten || "Khách vãng lai"}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{order.nguoiMua?.email}</p>
                    </div>
                  </td>
                  <td style={{ padding: "12px 8px" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, color: "#333" }}>
                        {order.ctv?.ho_ten || "Không có"}
                      </p>
                    </div>
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "600", color: "#333" }}>
                    {formatCurrency(order.tong_tien)}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "600", color: "#e53935" }}>
                    {order.giam_gia > 0 ? `-${formatCurrency(order.giam_gia)}` : "0 đ"}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>
                    {getPaymentMethod(order.phuong_thuc_tt)}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>{getStatusBadge(order.trang_thai)}</td>
                  <td style={{ padding: "12px 8px", textAlign: "center", color: "#888", fontSize: 13 }}>
                    {formatDate(order.created_at)}
                  </td>
                  <td style={{ padding: "12px 8px", textAlign: "center" }}>
                    <button
                      onClick={() => handleViewDetail(order.id)}
                      style={{
                        padding: "6px 12px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: "600",
                        cursor: "pointer"
                      }}
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {showDetail && selectedOrder && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white",
            borderRadius: 16,
            padding: 30,
            width: "80%",
            maxWidth: 800,
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0 }}>Chi tiết đơn hàng #{selectedOrder.ma_don_hang}</h2>
              <button
                onClick={() => setShowDetail(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: "#999"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              <div>
                <p style={{ margin: "0 0 5px 0", fontSize: 13, color: "#666" }}>Khách hàng</p>
                <p style={{ margin: 0, fontWeight: "600" }}>{selectedOrder.nguoiMua?.ho_ten || "Khách vãng lai"}</p>
                <p style={{ margin: 0, fontSize: 13, color: "#888" }}>{selectedOrder.nguoiMua?.email}</p>
                <p style={{ margin: 0, fontSize: 13, color: "#888" }}>{selectedOrder.nguoiMua?.sdt}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 5px 0", fontSize: 13, color: "#666" }}>CTV giới thiệu</p>
                <p style={{ margin: 0, fontWeight: "600" }}>{selectedOrder.ctv?.ho_ten || "Không có"}</p>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ margin: "0 0 10px 0", fontSize: 13, color: "#666" }}>Sản phẩm</p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
                    <th style={{ padding: "10px 8px", textAlign: "left", fontSize: 13 }}>Sản phẩm</th>
                    <th style={{ padding: "10px 8px", textAlign: "right", fontSize: 13 }}>Đơn giá</th>
                    <th style={{ padding: "10px 8px", textAlign: "right", fontSize: 13 }}>Số lượng</th>
                    <th style={{ padding: "10px 8px", textAlign: "right", fontSize: 13 }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.chiTiets?.map((item, index) => (
                    <tr key={index} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "10px 8px" }}>{item.sach?.ten_sach}</td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>{formatCurrency(item.gia_sp)}</td>
                      <td style={{ padding: "10px 8px", textAlign: "right" }}>{item.so_luong}</td>
                      <td style={{ padding: "10px 8px", textAlign: "right", fontWeight: "600" }}>{formatCurrency(item.thanh_tien)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
              <div>
                <p style={{ margin: "0 0 5px 0", fontSize: 13, color: "#666" }}>Tổng tiền gốc</p>
                <p style={{ margin: 0, fontWeight: "600", fontSize: 18 }}>{formatCurrency(selectedOrder.tong_tien_goc)}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 5px 0", fontSize: 13, color: "#666" }}>Giảm giá</p>
                <p style={{ margin: 0, fontWeight: "600", fontSize: 18, color: "#e53935" }}>-{formatCurrency(selectedOrder.giam_gia)}</p>
              </div>
              <div>
                <p style={{ margin: "0 0 5px 0", fontSize: 13, color: "#666" }}>Tổng thanh toán</p>
                <p style={{ margin: 0, fontWeight: "600", fontSize: 18, color: "#4caf50" }}>{formatCurrency(selectedOrder.tong_tien)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
