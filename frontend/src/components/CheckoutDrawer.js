import { useState } from "react";
import { createOrder, apDungKhuyenMai, createMoMoPayment, createVNPayPayment } from "../api";

function CheckoutDrawer({ isOpen, onClose, cart, onBack, onOrderSuccess }) {
  const [payment, setPayment] = useState("cod");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    country: "Việt Nam",
    province: "",
    district: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [maKhuyenMai, setMaKhuyenMai] = useState("");
  const [appliedKhuyenMai, setAppliedKhuyenMai] = useState(null);
  const [giamGia, setGiamGia] = useState(0);
  const [applyingPromotion, setApplyingPromotion] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

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
    
    if (!formData.name || !formData.phone || !formData.province || !formData.district || !formData.address) {
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
        dia_chi_giao: `${formData.name} - ${formData.phone} - ${formData.address}, ${formData.district}, ${formData.province}, ${formData.country}`,
        ghi_chu: "",
        phi_van_chuyen: shippingFee,
        tong_tien: finalTotal,
        khuyen_mai_id: appliedKhuyenMai?.id || null,
        ma_khoa: appliedKhuyenMai?.ma_khoa || null,
        giam_gia: giamGia,
      };

      // Xử lý thanh toán online (MoMo hoặc VNPAY)
      if (payment === "momo" || payment === "vnpay") {
        // Tạo đơn hàng trước
        const orderResult = await createOrder(orderData);
        
        if (!orderResult.success) {
          alert(orderResult.message || "Đặt hàng thất bại!");
          return;
        }

        const orderId = orderResult.data.ma_don_hang;
        const amount = finalTotal;
        const orderInfo = `Thanh toán đơn hàng ${orderId} - NTA English`;

        setPaymentLoading(true);

        try {
          let paymentResult;
          
          if (payment === "momo") {
            // Gọi API MOMO
            paymentResult = await createMoMoPayment({
              order_id: orderId,
              amount: amount,
              order_info: orderInfo,
              redirect_url: `${window.location.origin}/payment-result`,
              ipn_url: `http://localhost:5000/api/payment/momo/ipn`,
            });
          } else {
            // Gọi API VNPAY
            paymentResult = await createVNPayPayment({
              order_id: orderId,
              amount: amount,
              order_info: orderInfo,
              ip_addr: "127.0.0.1",
            });
          }

          if (paymentResult.success) {
            // Hiển thị QR code
            setQrCodeData({
              orderId: orderId,
              amount: amount,
              orderInfo: orderInfo,
              paymentUrl: paymentResult.data.payUrl || paymentResult.data.paymentUrl,
              qrCode: paymentResult.data.qrCode || paymentResult.data.paymentUrl,
              paymentMethod: payment,
            });
            setShowQRCode(true);
          } else {
            alert(paymentResult.message || "Tạo thanh toán thất bại!");
          }
        } catch (paymentError) {
          console.error("Lỗi tạo thanh toán:", paymentError);
          alert("Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại!");
        } finally {
          setPaymentLoading(false);
        }
      } else {
        // Thanh toán COD
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
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Quốc gia"
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
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                placeholder="Tỉnh/Thành phố"
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
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Quận/Huyện/Xã"
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
                placeholder="Địa chỉ nhận hàng (số nhà, tên đường)"
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

          {/* Delivery Estimate */}
          <div style={{
            background: "#e3f2fd",
            borderRadius: 12,
            padding: 15,
            marginBottom: 25,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>🚚</span>
            <div>
              <p style={{
                margin: 0,
                fontSize: 14,
                color: "#1565c0",
                fontWeight: "600",
              }}>
                Dự kiến giao hàng khoảng 2-3 ngày
              </p>
              <p style={{
                margin: "4px 0 0 0",
                fontSize: 13,
                color: "#1976d2",
              }}>
                {(() => {
                  const today = new Date();
                  const deliveryDate = new Date(today);
                  deliveryDate.setDate(today.getDate() + 3);
                  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                  return `Dự kiến: ${deliveryDate.toLocaleDateString('vi-VN', options)}`;
                })()}
              </p>
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

              {/* VNPAY */}
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                borderRadius: 12,
                border: payment === "vnpay" ? "2px solid #e53935" : "2px solid #e0e0e0",
                background: payment === "vnpay" ? "#fff5f5" : "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}>
                <input
                  type="radio"
                  name="payment"
                  checked={payment === "vnpay"}
                  onChange={() => setPayment("vnpay")}
                  style={{ display: "none" }}
                />
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: payment === "vnpay" ? "6px solid #e53935" : "2px solid #ccc",
                  flexShrink: 0,
                }}></span>
                <span style={{ fontSize: 24 }}>💳</span>
                <div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#1a1a2e",
                  }}>
                    VNPAY
                  </div>
                  <div style={{
                    fontSize: 12,
                    color: "#888",
                  }}>
                    Thanh toán qua VNPAY
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
            disabled={loading || paymentLoading}
            style={{
              width: "100%",
              background: (loading || paymentLoading) ? "#ccc" : "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
              color: "white",
              border: "none",
              padding: "16px",
              fontSize: 16,
              fontWeight: "700",
              borderRadius: 12,
              cursor: (loading || paymentLoading) ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: (loading || paymentLoading) ? "none" : "0 8px 20px rgba(229, 57, 53, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!loading && !paymentLoading) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 12px 30px rgba(229, 57, 53, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && !paymentLoading) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 20px rgba(229, 57, 53, 0.3)";
              }
            }}
          >
            {loading || paymentLoading ? "Đang xử lý..." : "✓ Xác nhận đặt hàng"}
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

      {/* QR Code Modal */}
      {showQRCode && qrCodeData && (
        <>
          {/* Overlay */}
          <div 
            onClick={() => setShowQRCode(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.7)",
              zIndex: 1005,
              animation: "fadeIn 0.3s ease",
            }}
          />

          {/* QR Code Modal */}
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            maxWidth: "90vw",
            background: "white",
            borderRadius: 20,
            zIndex: 1006,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            animation: "fadeIn 0.3s ease",
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              background: qrCodeData.paymentMethod === "momo" 
                ? "linear-gradient(135deg, #d82d8b 0%, #ff6b9d 100%)" 
                : "linear-gradient(135deg, #0066b3 0%, #0099ff 100%)",
              padding: "20px 25px",
              color: "white",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>
                {qrCodeData.paymentMethod === "momo" ? "📱" : "💳"}
              </div>
              <h3 style={{
                fontSize: 20,
                fontWeight: "700",
                margin: 0,
              }}>
                {qrCodeData.paymentMethod === "momo" 
                  ? "Thanh toán MoMo" 
                  : "Thanh toán VNPAY"}
              </h3>
            </div>

            {/* Content */}
            <div style={{ padding: "25px" }}>
              {/* Order Info */}
              <div style={{
                background: "#f8f9fa",
                borderRadius: 12,
                padding: 15,
                marginBottom: 20,
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}>
                  <span style={{ fontSize: 14, color: "#666" }}>Mã đơn hàng:</span>
                  <span style={{ fontSize: 14, fontWeight: "600", color: "#1a1a2e" }}>
                    {qrCodeData.orderId}
                  </span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}>
                  <span style={{ fontSize: 14, color: "#666" }}>Thông tin:</span>
                  <span style={{ fontSize: 14, fontWeight: "600", color: "#1a1a2e", textAlign: "right", maxWidth: "60%" }}>
                    {qrCodeData.orderInfo}
                  </span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: 8,
                  borderTop: "1px solid #e0e0e0",
                }}>
                  <span style={{ fontSize: 16, color: "#666", fontWeight: "600" }}>Tổng tiền:</span>
                  <span style={{ fontSize: 20, fontWeight: "800", color: "#e53935" }}>
                    {formatPrice(qrCodeData.amount)}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              <div style={{
                textAlign: "center",
                marginBottom: 20,
              }}>
                <div style={{
                  background: "white",
                  padding: 15,
                  borderRadius: 12,
                  border: "2px solid #e0e0e0",
                  display: "inline-block",
                }}>
                  {/* QR Code Image - Using iframe for demo, replace with actual QR library */}
                  <iframe
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData.qrCode)}`}
                    style={{
                      width: 200,
                      height: 200,
                      border: "none",
                    }}
                    title="QR Code"
                  />
                </div>
                <p style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: "#666",
                  fontWeight: "500",
                }}>
                  Quét mã QR bằng ứng dụng {qrCodeData.paymentMethod === "momo" ? "MoMo" : "VNPAY"}
                </p>
              </div>

              {/* Payment URL */}
              <div style={{
                background: "#fff8e1",
                borderRadius: 12,
                padding: 15,
                marginBottom: 20,
              }}>
                <p style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#f57c00",
                  fontWeight: "500",
                  marginBottom: 8,
                }}>
                  💡 Hoặc nhấp vào link bên dưới để thanh toán:
                </p>
                <a
                  href={qrCodeData.paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    background: qrCodeData.paymentMethod === "momo" ? "#d82d8b" : "#0066b3",
                    color: "white",
                    padding: "12px 20px",
                    borderRadius: 8,
                    textAlign: "center",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: 14,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = "0.9";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = "1";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Mở trang thanh toán {qrCodeData.paymentMethod === "momo" ? "MoMo" : "VNPAY"}
                </a>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    setShowQRCode(false);
                    onClose();
                    if (onOrderSuccess) {
                      onOrderSuccess();
                    }
                  }}
                  style={{
                    flex: 1,
                    background: "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "14px",
                    fontSize: 14,
                    fontWeight: "600",
                    borderRadius: 12,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#45a049"}
                  onMouseLeave={(e) => e.target.style.background = "#4CAF50"}
                >
                  ✓ Đã thanh toán
                </button>
                <button
                  onClick={() => setShowQRCode(false)}
                  style={{
                    flex: 1,
                    background: "#f44336",
                    color: "white",
                    border: "none",
                    padding: "14px",
                    fontSize: 14,
                    fontWeight: "600",
                    borderRadius: 12,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => e.target.style.background = "#d32f2f"}
                  onMouseLeave={(e) => e.target.style.background = "#f44336"}
                >
                  ✕ Đóng
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default CheckoutDrawer;
