function Collab({ onAccessAffiliate }) {
  const benefits = [
    {
      icon: "💰",
      title: "Hoa hồng hấp dẫn",
      description: "Hoa hồng lên đến 30% cho mỗi đơn hàng thành công",
    },
    {
      icon: "🎁",
      title: "Quà tặng thường xuyên",
      description: "Nhận quà tặng giá trị vào các dịp đặc biệt",
    },
    {
      icon: "⏰",
      title: "Linh hoạt thời gian",
      description: "Làm việc bất kỳ lúc nào, bất kỳ nơi đâu",
    },
    {
      icon: "📚",
      title: "Hỗ trợ đào tạo",
      description: "Được đào tạo kiến thức và kỹ năng bán hàng miễn phí",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Đăng ký",
      description: "Điền thông tin cá nhân vào form đăng ký bên dưới",
    },
    {
      number: "02",
      title: "Duyệt hồ sơ",
      description: "Đội ngũ NTA sẽ liên hệ xác nhận trong 24 giờ",
    },
    {
      number: "03",
      title: "Nhận tài liệu",
      description: "Nhận bộ tài liệu hướng dẫn và link affiliate",
    },
    {
      number: "04",
      title: "Bắt đầu bán",
      description: "Chia sẻ link và bắt đầu kiếm hoa hồng ngay",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #fff5f5 0%, #fff 100%)",
      paddingBottom: 60,
    }}>
      {/* Hero Section */}
      <section style={{
        padding: "80px 40px 40px",
        textAlign: "center",
      }}>
        {/* Label */}
        <span style={{
          background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
          color: "white",
          padding: "10px 24px",
          borderRadius: 25,
          fontSize: 14,
          fontWeight: "700",
          textTransform: "uppercase",
          letterSpacing: 2,
          display: "inline-block",
          marginBottom: 25,
        }}>
          🤝 Cộng tác viên
        </span>

        {/* Main Heading */}
        <h1 style={{
          fontSize: 52,
          fontWeight: "800",
          color: "#1a1a2e",
          marginBottom: 20,
          lineHeight: 1.2,
          maxWidth: 800,
          margin: "0 auto 20px",
        }}>
          Trở thành{' '}
          <span style={{ color: "#e53935" }}>CTV bán sách</span>{' '}
          cùng NTA
        </h1>

        {/* Subtext */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: 30,
          flexWrap: "wrap",
          marginBottom: 20,
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#555",
            fontSize: 16,
          }}>
            <span style={{ fontSize: 24 }}>💵</span>
            <span>Thu nhập thụ động</span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#555",
            fontSize: 16,
          }}>
            <span style={{ fontSize: 24 }}>🏦</span>
            <span>Không cần vốn</span>
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#555",
            fontSize: 16,
          }}>
            <span style={{ fontSize: 24 }}>📦</span>
            <span>Không nhập hàng</span>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{
        padding: "40px 40px 60px",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: 32,
            fontWeight: "800",
            color: "#1a1a2e",
            marginBottom: 40,
          }}>
            🎯 Lợi ích khi trở thành CTV
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 25,
          }}>
            {benefits.map((benefit, idx) => (
              <div key={idx} style={{
                background: "white",
                borderRadius: 20,
                padding: 30,
                textAlign: "center",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(229, 57, 53, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.08)";
              }}>
                <div style={{
                  fontSize: 48,
                  marginBottom: 20,
                }}>
                  {benefit.icon}
                </div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#1a1a2e",
                  marginBottom: 12,
                }}>
                  {benefit.title}
                </h3>
                <p style={{
                  fontSize: 14,
                  color: "#666",
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section style={{
        padding: "40px 40px 60px",
        background: "#fff",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{
            textAlign: "center",
            fontSize: 32,
            fontWeight: "800",
            color: "#1a1a2e",
            marginBottom: 50,
          }}>
            📋 Quy trình tham gia
          </h2>

          {/* CTA after steps */}
          <div style={{
            textAlign: "center",
            marginTop: 50,
          }}>
            <p style={{
              fontSize: 18,
              color: "#555",
              marginBottom: 25,
            }}>
              Sẵn sàng bắt đầu? Đăng ký ngay!
            </p>
            <button
              onClick={() => document.getElementById("collab-form")?.scrollIntoView({ behavior: "smooth" })}
              style={{
                background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                color: "white",
                border: "none",
                padding: "16px 50px",
                fontSize: 16,
                fontWeight: "700",
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
              🚀 Đăng ký ngay
            </button>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 25,
            position: "relative",
          }}>
            {/* Connection Line */}
            <div style={{
              position: "absolute",
              top: 50,
              left: 80,
              right: 80,
              height: 2,
              background: "linear-gradient(90deg, #e53935 0%, #ff7043 100%)",
              opacity: 0.3,
            }}></div>

            {steps.map((step, idx) => (
              <div key={idx} style={{
                position: "relative",
                zIndex: 1,
                textAlign: "center",
              }}>
                {/* Number Circle */}
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                  color: "white",
                  fontSize: 24,
                  fontWeight: "800",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  boxShadow: "0 10px 30px rgba(229, 57, 53, 0.3)",
                }}>
                  {step.number}
                </div>

                {/* Step Card */}
                <div style={{
                  background: "#fff5f5",
                  borderRadius: 16,
                  padding: 25,
                  border: "2px solid #ffe4e8",
                }}>
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: 10,
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: 13,
                    color: "#666",
                    lineHeight: 1.5,
                    margin: 0,
                  }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section id="collab-form" style={{
        padding: "60px 40px",
      }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          {/* Form Header */}
          <div style={{
            background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
            borderRadius: "24px 24px 0 0",
            padding: "30px 40px",
            textAlign: "center",
          }}>
            <h2 style={{
              color: "white",
              fontSize: 26,
              fontWeight: "800",
              margin: 0,
            }}>
              📝 Đăng ký CTV ngay hôm nay
            </h2>
            <p style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 14,
              marginTop: 8,
            }}>
              Tham gia cộng đồng CTV của NTA English Center
            </p>
          </div>

          {/* Form Body */}
          <div style={{
            background: "white",
            borderRadius: "0 0 24px 24px",
            padding: 40,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          }}>
            <form onSubmit={(e) => e.preventDefault()}>
              {/* Họ tên */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#1a1a2e",
                  marginBottom: 8,
                }}>
                  👤 Họ và tên
                </label>
                <input type="text" placeholder="Nhập họ và tên" style={{
                  width: "100%",
                  padding: "14px 18px",
                  borderRadius: 12,
                  border: "2px solid #e0e0e0",
                  fontSize: 15,
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#e53935"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>

              {/* SĐT và Email */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 15,
                marginBottom: 20,
              }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#1a1a2e",
                    marginBottom: 8,
                  }}>
                    📱 Số điện thoại
                  </label>
                  <input type="tel" placeholder="Nhập SĐT" style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: 12,
                    border: "2px solid #e0e0e0",
                    fontSize: 15,
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#e53935"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#1a1a2e",
                    marginBottom: 8,
                  }}>
                    📧 Email
                  </label>
                  <input type="email" placeholder="Nhập email" style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: 12,
                    border: "2px solid #e0e0e0",
                    fontSize: 15,
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#e53935"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                  />
                </div>
              </div>

              {/* Tỉnh/Thành và Nghề nghiệp */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 15,
                marginBottom: 20,
              }}>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#1a1a2e",
                    marginBottom: 8,
                  }}>
                    🏙️ Tỉnh/Thành
                  </label>
                  <select style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: 12,
                    border: "2px solid #e0e0e0",
                    fontSize: 15,
                    outline: "none",
                    transition: "all 0.3s ease",
                    background: "white",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#e53935"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}>
                    <option value="">Chọn Tỉnh/TP</option>
                    <option value="hcm">TP. Hồ Chí Minh</option>
                    <option value="hn">TP. Hà Nội</option>
                    <option value="dn">TP. Đà Nẵng</option>
                    <option value="hp">TP. Hải Phòng</option>
                    <option value="ct">TP. Cần Thơ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#1a1a2e",
                    marginBottom: 8,
                  }}>
                    💼 Nghề nghiệp
                  </label>
                  <select style={{
                    width: "100%",
                    padding: "14px 18px",
                    borderRadius: 12,
                    border: "2px solid #e0e0e0",
                    fontSize: 15,
                    outline: "none",
                    transition: "all 0.3s ease",
                    background: "white",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#e53935"}
                  onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}>
                    <option value="">Chọn nghề nghiệp</option>
                    <option value="student">Học sinh/Sinh viên</option>
                    <option value="teacher">Giáo viên</option>
                    <option value="employee">Nhân viên văn phòng</option>
                    <option value="freelancer">Freelancer</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              {/* Link MXH */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#1a1a2e",
                  marginBottom: 8,
                }}>
                  🔗 Link Facebook/Zalo
                </label>
                <input type="text" placeholder="Nhập link Facebook hoặc Zalo" style={{
                  width: "100%",
                  padding: "14px 18px",
                  borderRadius: 12,
                  border: "2px solid #e0e0e0",
                  fontSize: 15,
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#e53935"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>

              {/* Lý do */}
              <div style={{ marginBottom: 30 }}>
                <label style={{
                  display: "block",
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#1a1a2e",
                  marginBottom: 8,
                }}>
                  ✍️ Lý do muốn trở thành CTV
                </label>
                <textarea placeholder="Chia sẻ lý do bạn muốn tham gia..." rows={4} style={{
                  width: "100%",
                  padding: "14px 18px",
                  borderRadius: 12,
                  border: "2px solid #e0e0e0",
                  fontSize: 15,
                  outline: "none",
                  transition: "all 0.3s ease",
                  resize: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#e53935"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
                />
              </div>

              {/* Submit Button */}
              <button style={{
                width: "100%",
                background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                color: "white",
                border: "none",
                padding: "18px 40px",
                fontSize: 18,
                fontWeight: "700",
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
              }}>
                🚀 Đăng ký làm CTV
              </button>
            </form>

            {/* Button to access Affiliate System */}
            {onAccessAffiliate && (
              <div style={{ marginTop: 25, textAlign: "center", paddingTop: 20, borderTop: "1px dashed #ddd" }}>
                <p style={{ fontSize: 14, color: "#666", marginBottom: 15 }}>Đã có tài khoản CTV?</p>
                <button
                  onClick={() => window.navigateToAffiliate("login")}
                  style={{
                    width: "100%",
                    padding: "16px",
                    background: "white",
                    color: "#1a1a2e",
                    border: "3px solid #1a1a2e",
                    borderRadius: 14,
                    fontSize: 16,
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#1a1a2e";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "white";
                    e.target.style.color = "#1a1a2e";
                  }}
                >
                  📊 Truy cập Dashboard CTV
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1024px) {
          .benefits-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .steps-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          .benefits-grid {
            grid-template-columns: 1fr !important;
          }
          .steps-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <style>{`
        @media (max-width: 1024px) {
          [style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          [style*="grid-template-columns: repeat(4"] {
            grid-template-columns: 1fr !important;
          }
          [style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Collab;
