function Books() {
  const features = [
    {
      icon: "📚",
      title: "Sách chính hãng",
      description: "100% sách nhập khẩu chính hãng từ các nhà xuất bản uy tín",
    },
    {
      icon: "🚚",
      title: "Giao hàng toàn quốc",
      description: "Miễn phí giao hàng toàn quốc, giao nhanh trong 2-3 ngày",
    },
    {
      icon: "🔄",
      title: "Đổi trả dễ dàng",
      description: "Đổi trả miễn phí trong 7 ngày nếu sách có lỗi từ nhà sản xuất",
    },
    {
      icon: "💰",
      title: "Giá ưu đãi",
      description: "Giá cạnh tranh nhất thị trường, nhiều ưu đãi hấp dẫn",
    },
  ];

  return (
    <section id="books" style={{
      padding: "80px 40px",
      background: "linear-gradient(180deg, #fff5f5 0%, #ffe4e8 100%)",
      position: "relative",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        {/* Two Column Layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
          alignItems: "center",
        }}>
          {/* Left Content */}
          <div>
            {/* Eyebrow */}
            <span style={{
              background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
              color: "white",
              padding: "8px 20px",
              borderRadius: 25,
              fontSize: 13,
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: 1.5,
              display: "inline-block",
              marginBottom: 20,
            }}>
              📖 Sách luyện thi
            </span>

            {/* Main Heading */}
            <h2 style={{
              fontSize: 42,
              fontWeight: "800",
              color: "#1a1a2e",
              marginBottom: 20,
              lineHeight: 1.2,
            }}>
              Kho sách luyện thi{' '}
              <span style={{ color: "#e53935" }}>phong phú</span>
            </h2>

            {/* Description */}
            <p style={{
              fontSize: 17,
              color: "#555",
              lineHeight: 1.8,
              marginBottom: 30,
            }}>
              Tuyển chọn các đầu sách luyện thi Tiếng Anh chất lượng cao: IELTS, TOEIC, TOEFL, Cambridge KET/PET. Giúp bạn tự học hiệu quả tại nhà.
            </p>

            {/* Feature List - 2x2 Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginBottom: 35,
            }}>
              {features.map((feature, idx) => (
                <div key={idx} style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 15px 40px rgba(229, 57, 53, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.08)";
                }}>
                  <div style={{
                    fontSize: 32,
                    marginBottom: 12,
                  }}>
                    {feature.icon}
                  </div>
                  <h4 style={{
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: 8,
                  }}>
                    {feature.title}
                  </h4>
                  <p style={{
                    fontSize: 13,
                    color: "#666",
                    lineHeight: 1.5,
                    margin: 0,
                  }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button 
              onClick={() => {
                // Thử dùng navigateTo trước, fallback sang window.location
                if (window.navigateTo) {
                  window.navigateTo("shop");
                } else if (window.location) {
                  window.location.href = "/shop";
                }
              }}
              style={{
              background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
              color: "white",
              border: "none",
              padding: "16px 40px",
              fontSize: 16,
              fontWeight: "bold",
              borderRadius: 50,
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 10px 30px rgba(229, 57, 53, 0.4)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-3px)";
              e.target.style.boxShadow = "0 15px 40px rgba(229, 57, 53, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 10px 30px rgba(229, 57, 53, 0.4)";
            }}
            >
              🛒 Mua sách ngay
            </button>
          </div>

          {/* Right - Image Gallery */}
          <div style={{
            position: "relative",
          }}>
            {/* Badge */}
            <div style={{
              position: "absolute",
              top: -20,
              right: -10,
              background: "linear-gradient(135deg, #ff7043 0%, #e53935 100%)",
              color: "white",
              padding: "15px 25px",
              borderRadius: 50,
              fontSize: 15,
              fontWeight: "800",
              boxShadow: "0 10px 30px rgba(229, 57, 53, 0.4)",
              zIndex: 10,
            }}>
              📚 500+ đầu sách
            </div>

            {/* Image Grid - 2 columns */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr",
              gridTemplateRows: "repeat(2, 1fr)",
              gap: 15,
            }}>
              {/* Large Image */}
              <div style={{
                gridRow: "span 2",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.15)",
                height: 400,
                background: "linear-gradient(135deg, #fff5f5 0%, #ffe4e8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{
                  textAlign: "center",
                  color: "#e53935",
                }}>
                  <div style={{ fontSize: 80, marginBottom: 15 }}>📖</div>
                  <div style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#1a1a2e",
                  }}>
                    Sách IELTS
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: "#666",
                  }}>
                    Cam kết chất lượng
                  </div>
                </div>
              </div>

              {/* Small Image 1 */}
              <div style={{
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 15px 40px rgba(0, 0, 0, 0.1)",
                height: 190,
                background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 50 }}>📝</div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#1a1a2e",
                  }}>
                    TOEIC
                  </div>
                </div>
              </div>

              {/* Small Image 2 */}
              <div style={{
                borderRadius: 20,
                overflow: "hidden",
                boxShadow: "0 15px 40px rgba(0, 0, 0, 0.1)",
                height: 190,
                background: "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 50 }}>🎯</div>
                  <div style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#1a1a2e",
                  }}>
                    Cambridge
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #books > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

export default Books;
