import { useState, useEffect } from "react";
import { fetchUserOrders } from "../api";

function OrderHistory({ onBack, onViewOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await fetchUserOrders();
      setOrders(data || []);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString("vi-VN") + " đ";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      cho_tt: { label: "Chờ thanh toán", color: "#ff9800", bg: "#fff3e0" },
      da_tt: { label: "Đã thanh toán", color: "#2196f3", bg: "#e3f2fd" },
      dang_giao: { label: "Đang giao", color: "#9c27b0", bg: "#f3e5f5" },
      da_giao: { label: "Đã giao", color: "#4caf50", bg: "#e8f5e9" },
      da_huy: { label: "Đã hủy", color: "#f44336", bg: "#ffebee" },
    };
    return statusMap[status] || { label: status, color: "#666", bg: "#f5f5f5" };
  };

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((order) => order.trang_thai === filter);

  const statusCounts = {
    all: orders.length,
    cho_tt: orders.filter((o) => o.trang_thai === "cho_tt").length,
    da_tt: orders.filter((o) => o.trang_thai === "da_tt").length,
    dang_giao: orders.filter((o) => o.trang_thai === "dang_giao").length,
    da_giao: orders.filter((o) => o.trang_thai === "da_giao").length,
    da_huy: orders.filter((o) => o.trang_thai === "da_huy").length,
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 50,
              height: 50,
              border: "4px solid #e53935",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          />
          <p style={{ color: "#666" }}>Đang tải đơn hàng...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "white",
          boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
          padding: "0 40px",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 70,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
            onClick={onBack}
          >
            <span style={{ fontSize: 18, fontWeight: "bold", color: "#e53935" }}>
              ← Quay lại
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>📦</span>
            <span
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: "#1a1a2e",
              }}
            >
              Đơn hàng của tôi
            </span>
          </div>

          <div style={{ width: 100 }} />
        </div>
      </header>

      {/* Main Content */}
      <div style={{ marginTop: 90, padding: "30px 40px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Filter Tabs */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 30,
              overflowX: "auto",
              paddingBottom: 10,
            }}
          >
            {[
              { key: "all", label: "Tất cả" },
              { key: "cho_tt", label: "Chờ thanh toán" },
              { key: "da_tt", label: "Đã thanh toán" },
              { key: "dang_giao", label: "Đang giao" },
              { key: "da_giao", label: "Đã giao" },
              { key: "da_huy", label: "Đã hủy" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: "12px 24px",
                  borderRadius: 12,
                  border: filter === tab.key ? "none" : "2px solid #e0e0e0",
                  background:
                    filter === tab.key
                      ? "linear-gradient(135deg, #e53935 0%, #c62828 100%)"
                      : "white",
                  color: filter === tab.key ? "white" : "#666",
                  fontSize: 14,
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label} ({statusCounts[tab.key]})
              </button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                background: "white",
                borderRadius: 20,
              }}
            >
              <span style={{ fontSize: 60, display: "block", marginBottom: 20 }}>
                📦
              </span>
              <h3 style={{ fontSize: 20, color: "#1a1a2e", marginBottom: 10 }}>
                Chưa có đơn hàng nào
              </h3>
              <p style={{ color: "#888" }}>
                {filter === "all"
                  ? "Hãy mua sắm để có đơn hàng đầu tiên nhé!"
                  : "Không có đơn hàng trong trạng thái này"}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.trang_thai);
                return (
                  <div
                    key={order.id}
                    style={{
                      background: "white",
                      borderRadius: 20,
                      overflow: "hidden",
                      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => onViewOrder(order)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 35px rgba(0, 0, 0, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(0, 0, 0, 0.08)";
                    }}
                  >
                    {/* Order Header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "20px 25px",
                        borderBottom: "1px solid #f0f0f0",
                        background: "#fafafa",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: "#1a1a2e",
                            marginBottom: 5,
                          }}
                        >
                          {order.ma_don_hang}
                        </div>
                        <div style={{ fontSize: 13, color: "#888" }}>
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      <span
                        style={{
                          padding: "8px 16px",
                          borderRadius: 20,
                          fontSize: 13,
                          fontWeight: "600",
                          color: statusInfo.color,
                          background: statusInfo.bg,
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Order Items */}
                    <div style={{ padding: "20px 25px" }}>
                      {order.chiTiets?.slice(0, 2).map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            gap: 15,
                            marginBottom: idx < 1 ? 15 : 0,
                          }}
                        >
                          <div
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 12,
                              background:
                                "linear-gradient(135deg, #fff5f5 0%, #ffe4e8 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 28,
                              flexShrink: 0,
                            }}
                          >
                            {item.sach?.hinh_anh || "📚"}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: "#1a1a2e",
                                marginBottom: 5,
                              }}
                            >
                              {item.sach?.ten_sach || "Sách"}
                            </div>
                            <div style={{ fontSize: 13, color: "#888" }}>
                              x{item.so_luong}
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: "#e53935",
                            }}
                          >
                            {formatPrice(item.thanh_tien)}
                          </div>
                        </div>
                      ))}
                      {order.chiTiets?.length > 2 && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "#888",
                            marginTop: 10,
                          }}
                        >
                          +{order.chiTiets.length - 2} sản phẩm khác
                        </div>
                      )}
                    </div>

                    {/* Order Footer */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "15px 25px",
                        borderTop: "1px solid #f0f0f0",
                        background: "#fafafa",
                      }}
                    >
                      <div style={{ fontSize: 13, color: "#888" }}>
                        {order.chiTiets?.length || 0} sản phẩm
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 13, color: "#888" }}>
                          Tổng tiền:
                        </span>
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: "800",
                            color: "#e53935",
                          }}
                        >
                          {formatPrice(order.tong_tien)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          header {
            padding: 0 20px !important;
          }
          div[style*="marginTop: 90"] {
            padding: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default OrderHistory;
