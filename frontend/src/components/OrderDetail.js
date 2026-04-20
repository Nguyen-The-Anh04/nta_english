import { useState } from "react";
import { cancelOrder } from "../api";

function OrderDetail({ order, onBack, onOrderCancelled }) {
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
      cho_tt: { label: "Chờ thanh toán", color: "#ff9800", bg: "#fff3e0", icon: "⏳" },
      da_tt: { label: "Đã thanh toán", color: "#2196f3", bg: "#e3f2fd", icon: "✓" },
      dang_giao: { label: "Đang giao", color: "#9c27b0", bg: "#f3e5f5", icon: "🚚" },
      da_giao: { label: "Đã giao", color: "#4caf50", bg: "#e8f5e9", icon: "📦" },
      da_huy: { label: "Đã hủy", color: "#f44336", bg: "#ffebee", icon: "✕" },
    };
    return statusMap[status] || { label: status, color: "#666", bg: "#f5f5f5", icon: "?" };
  };

  const getPaymentMethod = (method) => {
    const methodMap = {
      cod: { label: "Thanh toán khi nhận hàng (COD)", icon: "📦" },
      momo: { label: "Ví MoMo", icon: "📱" },
      vnpay: { label: "VNPay", icon: "💳" },
      chuyen_khoan: { label: "Chuyển khoản ngân hàng", icon: "🏦" },
    };
    return methodMap[method] || { label: method, icon: "💳" };
  };

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await cancelOrder(order.id);
      setShowCancelConfirm(false);
      if (onOrderCancelled) {
        onOrderCancelled();
      }
    } catch (error) {
      console.error("Lỗi hủy đơn hàng:", error);
      alert("Không thể hủy đơn hàng. Vui lòng thử lại!");
    } finally {
      setCancelling(false);
    }
  };

  const statusInfo = getStatusInfo(order.trang_thai);
  const paymentInfo = getPaymentMethod(order.phuong_thuc_tt);

  // Timeline steps
  const steps = [
    { key: "cho_tt", label: "Đặt hàng", icon: "📝" },
    { key: "da_tt", label: "Thanh toán", icon: "💳" },
    { key: "dang_giao", label: "Đang giao", icon: "🚚" },
    { key: "da_giao", label: "Đã giao", icon: "📦" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.trang_thai);

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
            maxWidth: 1200,
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
            <span style={{ fontSize: 28 }}>📋</span>
            <span
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: "#1a1a2e",
              }}
            >
              Chi tiết đơn hàng
            </span>
          </div>

          <div style={{ width: 100 }} />
        </div>
      </header>

      {/* Main Content */}
      <div style={{ marginTop: 90, padding: "30px 40px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Order Status Card */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 30,
              marginBottom: 25,
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 25,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: "800",
                    color: "#1a1a2e",
                    marginBottom: 8,
                  }}
                >
                  {order.ma_don_hang}
                </div>
                <div style={{ fontSize: 14, color: "#888" }}>
                  Đặt ngày: {formatDate(order.created_at)}
                </div>
              </div>
              <span
                style={{
                  padding: "12px 24px",
                  borderRadius: 25,
                  fontSize: 15,
                  fontWeight: "700",
                  color: statusInfo.color,
                  background: statusInfo.bg,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {statusInfo.icon} {statusInfo.label}
              </span>
            </div>

            {/* Timeline */}
            {order.trang_thai !== "da_huy" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  position: "relative",
                  padding: "20px 0",
                }}
              >
                {/* Progress Line */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    right: 0,
                    height: 4,
                    background: "#e0e0e0",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg, #e53935, #c62828)",
                      width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>

                {/* Steps */}
                {steps.map((step, idx) => (
                  <div
                    key={step.key}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      zIndex: 2,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        background:
                          idx <= currentStepIndex
                            ? "linear-gradient(135deg, #e53935 0%, #c62828 100%)"
                            : "#e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                        marginBottom: 10,
                        boxShadow:
                          idx <= currentStepIndex
                            ? "0 4px 15px rgba(229, 57, 53, 0.4)"
                            : "none",
                      }}
                    >
                      {step.icon}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: idx <= currentStepIndex ? "700" : "500",
                        color: idx <= currentStepIndex ? "#1a1a2e" : "#888",
                        textAlign: "center",
                      }}
                    >
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 25 }}>
            {/* Left Column - Order Items */}
            <div>
              {/* Products */}
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 25,
                  marginBottom: 25,
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                }}
              >
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: 20,
                  }}
                >
                  📚 Sản phẩm ({order.chiTiets?.length || 0})
                </h3>

                {order.chiTiets?.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: 15,
                      padding: "15px 0",
                      borderBottom:
                        idx < order.chiTiets.length - 1
                          ? "1px solid #f0f0f0"
                          : "none",
                    }}
                  >
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #fff5f5 0%, #ffe4e8 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 36,
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {item.sach?.hinh_anh && !item.sach.hinh_anh.startsWith("📚") ? (
                      <img
                        src={
                          item.sach.hinh_anh.startsWith("http")
                            ? item.sach.hinh_anh
                            : item.sach.hinh_anh.startsWith("/uploads/")
                            ? `http://localhost:5000${item.sach.hinh_anh}`
                            : `http://localhost:5000/uploads/${item.sach.hinh_anh}`
                        }
                        alt={item.sach.ten_sach}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { e.target.style.display = "none"; e.target.parentNode.innerHTML = "📚"; }}
                      />
                    ) : "📚"}
                  </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: "#1a1a2e",
                          marginBottom: 8,
                        }}
                      >
                        {item.sach?.ten_sach || "Sách"}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#888",
                          marginBottom: 8,
                        }}
                      >
                        Tác giả: {item.sach?.tac_gia || "N/A"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span style={{ fontSize: 14, color: "#666" }}>
                          {formatPrice(item.gia_sp)} x {item.so_luong}
                        </span>
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: "#e53935",
                          }}
                        >
                          {formatPrice(item.thanh_tien)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Note */}
              {order.ghi_chu && (
                <div
                  style={{
                    background: "white",
                    borderRadius: 20,
                    padding: 25,
                    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 16,
                      fontWeight: "700",
                      color: "#1a1a2e",
                      marginBottom: 15,
                    }}
                  >
                    📝 Ghi chú đơn hàng
                  </h3>
                  <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
                    {order.ghi_chu}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Summary */}
            <div>
              {/* Payment Info */}
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 25,
                  marginBottom: 25,
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: 20,
                  }}
                >
                  💳 Thông tin thanh toán
                </h3>

                <div style={{ marginBottom: 15 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 16px",
                      background: "#f8f9fa",
                      borderRadius: 12,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{paymentInfo.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: "600", color: "#1a1a2e" }}>
                      {paymentInfo.label}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 14, color: "#888" }}>Tạm tính:</span>
                  <span style={{ fontSize: 14, color: "#1a1a2e" }}>
                    {formatPrice(order.tong_tien)}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 14, color: "#888" }}>Phí vận chuyển:</span>
                  <span style={{ fontSize: 14, color: "#4caf50" }}>Miễn phí</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 15,
                    borderTop: "2px solid #f0f0f0",
                  }}
                >
                  <span style={{ fontSize: 16, fontWeight: "700", color: "#1a1a2e" }}>
                    Tổng cộng:
                  </span>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: "800",
                      color: "#e53935",
                    }}
                  >
                    {formatPrice(order.tong_tien)}
                  </span>
                </div>
              </div>

              {/* Shipping Info */}
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 25,
                  marginBottom: 25,
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: 20,
                  }}
                >
                  📍 Địa chỉ giao hàng
                </h3>

                {order.nguoiMua && (
                  <div style={{ marginBottom: 15 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: "#1a1a2e",
                        marginBottom: 8,
                      }}
                    >
                      {order.nguoiMua.ho_ten}
                    </div>
                    <div style={{ fontSize: 14, color: "#666", marginBottom: 5 }}>
                      📞 {order.nguoiMua.sdt}
                    </div>
                    <div style={{ fontSize: 14, color: "#666" }}>
                      📧 {order.nguoiMua.email}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    padding: "12px 16px",
                    background: "#f8f9fa",
                    borderRadius: 12,
                    fontSize: 14,
                    color: "#666",
                    lineHeight: 1.5,
                  }}
                >
                  {order.dia_chi_giao || "Chưa có địa chỉ"}
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  background: "white",
                  borderRadius: 20,
                  padding: 25,
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                }}
              >
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: 20,
                  }}
                >
                  ⚡ Thao tác
                </h3>

                {order.trang_thai === "cho_tt" && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "white",
                      color: "#f44336",
                      border: "2px solid #f44336",
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#f44336";
                      e.target.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "white";
                      e.target.style.color = "#f44336";
                    }}
                  >
                    ✕ Hủy đơn hàng
                  </button>
                )}

                {order.trang_thai === "da_giao" && (
                  <button
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    ⭐ Đánh giá đơn hàng
                  </button>
                )}

                {order.trang_thai === "dang_giao" && (
                  <button
                    style={{
                      width: "100%",
                      padding: "14px",
                      background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: 12,
                      fontSize: 15,
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                    }}
                  >
                    📦 Xác nhận đã nhận hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 30,
              maxWidth: 400,
              width: "90%",
              animation: "slideUp 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: 25 }}>
              <span style={{ fontSize: 50, display: "block", marginBottom: 15 }}>
                ⚠️
              </span>
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: "#1a1a2e",
                  marginBottom: 10,
                }}
              >
                Xác nhận hủy đơn hàng
              </h3>
              <p style={{ fontSize: 14, color: "#666" }}>
                Bạn có chắc chắn muốn hủy đơn hàng {order.ma_don_hang}?
              </p>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowCancelConfirm(false)}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#f5f5f5",
                  color: "#666",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Không
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                style={{
                  flex: 1,
                  padding: "14px",
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: "600",
                  cursor: cancelling ? "not-allowed" : "pointer",
                  opacity: cancelling ? 0.7 : 1,
                }}
              >
                {cancelling ? "Đang hủy..." : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 400px"] {
            grid-template-columns: 1fr !important;
          }
        }
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

export default OrderDetail;
