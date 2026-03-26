function CartDrawer({ isOpen, onClose, cart, updateQuantity, removeFromCart, onCheckout }) {
  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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
          zIndex: 1001,
          animation: "fadeIn 0.3s ease",
        }}
      />

      {/* Cart Panel */}
      <div style={{
        position: "fixed",
        right: 0,
        top: 0,
        width: 400,
        maxWidth: "100vw",
        height: "100%",
        background: "white",
        zIndex: 1002,
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
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
            <span style={{ fontSize: 24 }}>🛒</span>
            <h2 style={{
              fontSize: 20,
              fontWeight: "800",
              color: "#1a1a2e",
              margin: 0,
            }}>
              Giỏ hàng
            </h2>
            {totalItems > 0 && (
              <span style={{
                background: "#e53935",
                color: "white",
                padding: "2px 10px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: "700",
              }}>
                {totalItems}
              </span>
            )}
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

        {/* Cart Items */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 25px",
        }}>
          {cart.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
            }}>
              <span style={{ fontSize: 60, display: "block", marginBottom: 20 }}>🛒</span>
              <h3 style={{ fontSize: 18, color: "#1a1a2e", marginBottom: 10 }}>
                Giỏ hàng trống
              </h3>
              <p style={{ color: "#888", fontSize: 14 }}>
                Hãy thêm sách vào giỏ hàng nhé!
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} style={{
                display: "flex",
                gap: 15,
                padding: "15px 0",
                borderBottom: "1px solid #f0f0f0",
              }}>
                {/* Image */}
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #fff5f5 0%, #ffe4e8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  flexShrink: 0,
                }}>
                  {item.image}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: "#1a1a2e",
                    margin: "0 0 6px 0",
                    lineHeight: 1.3,
                  }}>
                    {item.name}
                  </h4>
                  <p style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#e53935",
                    margin: "0 0 10px 0",
                  }}>
                    {formatPrice(item.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0,
                      borderRadius: 8,
                      overflow: "hidden",
                      border: "1px solid #e0e0e0",
                    }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{
                          width: 32,
                          height: 32,
                          border: "none",
                          background: "#f5f5f5",
                          cursor: item.quantity <= 1 ? "not-allowed" : "pointer",
                          color: item.quantity <= 1 ? "#ccc" : "#333",
                          fontSize: 16,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        −
                      </button>
                      <span style={{
                        width: 40,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#1a1a2e",
                        background: "white",
                        borderLeft: "1px solid #e0e0e0",
                        borderRight: "1px solid #e0e0e0",
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: 32,
                          height: 32,
                          border: "none",
                          background: "#f5f5f5",
                          cursor: "pointer",
                          color: "#333",
                          fontSize: 16,
                          fontWeight: "bold",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        +
                      </button>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 18,
                        padding: 5,
                      }}
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer - Total & Checkout */}
        {cart.length > 0 && (
          <div style={{
            padding: "20px 25px",
            borderTop: "1px solid #eee",
            background: "white",
          }}>
            {/* Total */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}>
              <span style={{
                fontSize: 16,
                color: "#666",
                fontWeight: "500",
              }}>
                Tổng tiền:
              </span>
              <span style={{
                fontSize: 24,
                fontWeight: "800",
                color: "#e53935",
              }}>
                {formatPrice(total)}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={onCheckout}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                color: "white",
                border: "none",
                padding: "16px",
                fontSize: 16,
                fontWeight: "700",
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 8px 20px rgba(229, 57, 53, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 12px 30px rgba(229, 57, 53, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 8px 20px rgba(229, 57, 53, 0.3)";
              }}
            >
              📦 Đặt hàng ({totalItems} cuốn)
            </button>
          </div>
        )}

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

export default CartDrawer;
