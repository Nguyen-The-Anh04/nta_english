import { useState } from "react";
import { createOrder, apDungKhuyenMai } from "../api";

function CheckoutDrawer({ isOpen, onClose, cart, onBack, onOrderSuccess }) {
  const [payment, setPayment] = useState("cod");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [maKhuyenMai, setMaKhuyenMai] = useState("");
  const [appliedKhuyenMai, setAppliedKhuyenMai] = useState(null);
  const [giamGia, setGiamGia] = useState(0);
  const [applyingPromotion, setApplyingPromotion] = useState(false);

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = payment === "cod" ? 10000 : 0;
  const finalTotal = total + shippingFee - giamGia;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApDungKhuyenMai = async () => {
    if (!maKhuyenMai.trim()) {
      alert("Vui lòng nhập mã khuyến mại");
      return;
    }

    setApplyingPromotion(true);
    try {
      const result = await apDungKhuyenMai({
        ma_khoa: maKhuyenMai,
        tong_tien: total,
        so_luong: totalItems,
        danh_muc_id: cart[0]?.categoryId,
        san_pham_id: cart[0]?.id,
      });

      if (result.success) {
        setAppliedKhuyenMai(result.data.khuyen_mai);
        setGiamGia(result.data.giam_gia);
        alert("Áp dụng khuyến mại thành công!");
      } else {
        alert(result.message || "Không thể áp dụng khuyến mại");
      }
    } catch (error) {
      console.error("Lỗi áp dụng khuyến mại:", error);
      alert("Lỗi khi áp dụng khuyến mại");
    } finally {
      setApplyingPromotion(false);
    }
  };

  const handleHuyKhuyenMai = () => {
    setAppliedKhuyenMai(null);
    setGiamGia(0);
    setMaKhuyenMai("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address) {
      alert("Vui lòng điền đầy đủ thông tin nhận hàng!");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        sach_ids: cart.map(item => ({
          sach_id: item.id,
          so_luong: item.quantity,
        })),
        phuong_thuc_tt: payment,
        dia_chi_giao: `${formData.name} - ${formData.phone} - ${formData.address}`,
        ghi_chu: "",
        phi_van_chuyen: shippingFee,
        tong_tien: finalTotal,
        khuyen_mai_id: appliedKhuyenMai?.id || null,
        ma_khoa: appliedKhuyenMai?.ma_khoa || null,
        giam_gia: giamGia,
      };

      const result = await createOrder(orderData);
      
      if (result.success) {
        alert(`Đặt hàng thành công!\nMã đơn hàng: ${result.data.ma_don_hang}\nTổng tiền: ${formatPrice(result.data.tong_tien)}`);
        onClose();
        if (onOrderSuccess) {
          onOrderSuccess();
        }
      } else {
        alert(result.message || "Đặt hàng thất bại!");
      }
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);
      alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.5)",
          zIndex: 1003,
          animation: "fadeIn 0.3s ease",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed",
        right: 0,
        top: 0,
        width: 420,
        maxWidth: "100vw",
        height: "100%",
        background: "white",
        zIndex: 1004,
        display: "flex",
        flexDirection: "column",
        boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.2)",
        animation: "slideIn 0.3s ease",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 25px",
          borderBottom: "1px solid #eee",
          background: "#fff5f5",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={onBack}
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#666",
                padding: 5,
              }}
            >
              ←
            </button>
            <h2 style={{
              fontSize: 20,
              fontWeight: "800",
              color: "#1a1a2e",
              margin: 0,
            }}>
              Thanh toán
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#666",
              padding: 5,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "25px",
        }}>
          {/* Customer Info */}
          <div style={{ marginBottom: 25 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#1a1a2e",
              marginBottom: 15,
            }}>
              📦 Thông tin nhận hàng
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Họ và tên"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "2px solid #e0e0e0",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#e53935"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Số điện thoại"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "2px solid #e0e0e0",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#e53935"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
              <input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Địa chỉ chi tiết"
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "2px solid #e0e0e0",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#e53935"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: 25 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#1a1a2e",
              marginBottom: 15,
            }}>
              💳 Phương thức thanh toán
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* COD */}
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 12,
                border: payment === "cod" ? "2px solid #e53935" : "2px solid #e0e0e0",
                background: payment === "cod" ? "#fff5f5" : "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={payment === "cod"}
                  onChange={() => setPayment("cod")}
                  style={{ display: "none" }}
                />
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: payment === "cod" ? "6px solid #e53935" : "2px solid #ccc",
                  flexShrink: 0,
                }}></span>
                <span style={{ fontSize: 24 }}>📦</span>
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#1a1a2e",
                  }}>
                    Thanh toán khi nhận hàng (COD)
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "#888",
                  }}>
                    Trả tiền mặt khi nhận sách
                  </div>
                </div>
              </label>

              {/* MoMo */}
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 12,
                border: payment === "momo" ? "2px solid #e53935" : "2px solid #e0e0e0",
                background: payment === "momo" ? "#fff5f5" : "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={payment === "momo"}
                  onChange={() => setPayment("momo")}
                  style={{ display: "none" }}
                />
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: payment === "momo" ? "6px solid #e53935" : "2px solid #ccc",
                  flexShrink: 0,
                }}></span>
                <span style={{ fontSize: 24 }}>📱</span>
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#1a1a2e",
                  }}>
                    Ví MoMo
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "#888",
                  }}>
                    Thanh toán qua ứng dụng MoMo
                  </div>
                </div>
              </label>

              {/* Bank Transfer */}
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 12,
                border: payment === "bank" ? "2px solid #e53935" : "2px solid #e0e0e0",
                background: payment === "bank" ? "#fff5f5" : "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={payment === "bank"}
                  onChange={() => setPayment("bank")}
                  style={{ display: "none" }}
                />
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: payment === "bank" ? "6px solid #e53935" : "2px solid #ccc",
                  flexShrink: 0,
                }}></span>
                <span style={{ fontSize: 24 }}>🏦</span>
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#1a1a2e",
                  }}>
                    Chuyển khoản ngân hàng
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "#888",
                  }}>
                    Chuyển khoản theo số tài khoản
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Promotion Hint */}
          <div style={{
            background: "#fff8e1",
            borderRadius: 12,
            padding: 15,
            marginBottom: 25,
          }}>
            <p style={{
              margin: 0,
              fontSize: 13,
              color: "#f57c00",
              fontWeight: "500",
            }}>
              💡 Mua 2 sản phẩm giảm 10% - Nhập mã GIAM10
            </p>
          </div>

          {/* Promotion Code Input */}
          <div style={{ marginBottom: 25 }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: "700",
              color: "#1a1a2e",
              marginBottom: 15,
            }}>
              🎁 Mã khuyến mại
            </h3>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                value={maKhuyenMai}
                onChange={(e) => setMaKhuyenMai(e.target.value.toUpperCase())}
                placeholder="Nhập mã khuyến mại"
                disabled={appliedKhuyenMai !== null}
                style={{
                  flex: 1,
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: appliedKhuyenMai ? "2px solid #4CAF50" : "2px solid #e0e0e0",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                  background: appliedKhuyenMai ? "#f1f8f1" : "white",
                }}
                onFocus={(e) => !appliedKhuyenMai && (e.target.style.borderColor = "#e53935")}
                onBlur={(e) => !appliedKhuyenMai && (e.target.style.borderColor = "#e0e0e0")}
              />
              {appliedKhuyenMai ? (
                <button
                  onClick={handleHuyKhuyenMai}
                  style={{
                    padding: "14px 20px",
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#d32f2f"}
                  onMouseLeave={(e) => e.target.style.background = "#f44336"}
                >
                  Hủy
                </button>
              ) : (
                <button
                  onClick={handleApDungKhuyenMai}
                  disabled={applyingPromotion}
                  style={{
                    padding: "14px 20px",
                    background: applyingPromotion ? "#ccc" : "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 14,
                    fontWeight: "600",
                    cursor: applyingPromotion ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => !applyingPromotion && (e.target.style.background = "#45a049")}
                  onMouseLeave={(e) => !applyingPromotion && (e.target.style.background = "#4CAF50")}
                >
                  {applyingPromotion ? "Đang áp dụng..." : "Áp dụng"}
                </button>
              )}
            </div>
            {appliedKhuyenMai && (
              <div style={{
                marginTop: 10,
                padding: "10px 12px",
                background: "#e8f5e9",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{ color: "#4CAF50", fontSize: 16 }}>✓</span>
                <span style={{ fontSize: 13, color: "#2e7d32", fontWeight: "500" }}>
                  Đã áp dụng: {appliedKhuyenMai.ten_khoa} - Giảm {formatPrice(giamGia)}
                </span>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div style={{
            background: "#f8f9fa",
            borderRadius: 12,
            padding: 15,
          }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#666",
              marginBottom: 12,
            }}>
              📋 Đơn hàng ({totalItems} sản phẩm)
            </h3>
            {cart.map((item) => (
              <div key={item.id} style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                color: "#666",
                marginBottom: 6,
              }}>
                <span>{item.name} x{item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "20px 25px",
          borderTop: "1px solid #eee",
          background: "white",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}>
            <span style={{
              fontSize: 14,
              color: "#666",
              fontWeight: "500",
            }}>
              Tiền hàng:
            </span>
            <span style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#1a1a2e",
            }}>
              {formatPrice(total)}
            </span>
          </div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}>
            <span style={{
              fontSize: 14,
              color: "#666",
              fontWeight: "500",
            }}>
              Phí vận chuyển:
            </span>
            <span style={{
              fontSize: 16,
              fontWeight: "600",
              color: shippingFee > 0 ? "#e53935" : "#4CAF50",
            }}>
              {shippingFee > 0 ? formatPrice(shippingFee) : "Miễn phí"}
            </span>
          </div>
          {giamGia > 0 && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}>
              <span style={{
                fontSize: 14,
                color: "#666",
                fontWeight: "500",
              }}>
                Giảm giá:
              </span>
              <span style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#4CAF50",
              }}>
                -{formatPrice(giamGia)}
              </span>
            </div>
          )}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
            paddingTop: 10,
            borderTop: "1px solid #eee",
          }}>
            <span style={{
              fontSize: 16,
              color: "#666",
              fontWeight: "500",
            }}>
              Tổng cộng:
            </span>
            <span style={{
              fontSize: 26,
              fontWeight: "800",
              color: "#e53935",
            }}>
              {formatPrice(finalTotal)}
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%",
              background: loading ? "#ccc" : "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
              color: "white",
              border: "none",
              padding: "16px",
              fontSize: 16,
              fontWeight: "700",
              borderRadius: 12,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: loading ? "none" : "0 8px 20px rgba(229, 57, 53, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 12px 30px rgba(229, 57, 53, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 20px rgba(229, 57, 53, 0.3)";
              }
            }}
          >
            {loading ? "Đang xử lý..." : "✓ Xác nhận đặt hàng"}
          </button>
        </div>

        {/* CSS Animations */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </div>
    </>
  );
}

export default CheckoutDrawer;
