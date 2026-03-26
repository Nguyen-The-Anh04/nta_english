import logo from "../assets/logo/Logo.jpeg";
import facebookIcon from "../assets/icons/facebook.png";
import youtubeIcon from "../assets/icons/youtube.png";
import igIcon from "../assets/icons/ig.jfif";
import zaloIcon from "../assets/icons/zalo.png";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: "linear-gradient(135deg, #c62828 0%, #8e0000 50%, #b71c1c 100%)",
      color: "white",
      padding: "60px 40px 30px",
      marginTop: 60,
    }}>
      <div style={{
        maxWidth: 1400,
        margin: "0 auto",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 40,
          marginBottom: 40,
        }}>
          {/* Brand Column */}
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}>
              <img 
                src={logo} 
                alt="NTA English Center Logo" 
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid white",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.3)",
                  background: "white",
                }}
              />
              <span style={{
                fontSize: 24,
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}>
                NTA English Center
              </span>
            </div>
            <p style={{
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.8,
              fontSize: 15,
            }}>
              Chinh phục tiếng Anh cùng bạn. Chúng tôi cam kết mang đến chất lượng giáo dục tốt nhất cho học viên.
            </p>
            <div style={{
              display: "flex",
              gap: 15,
              marginTop: 20,
            }}>
              {[
                { icon: facebookIcon, name: "Facebook", url: "#" },
                { icon: youtubeIcon, name: "YouTube", url: "#" },
                { icon: igIcon, name: "Instagram", url: "#" },
                { icon: zaloIcon, name: "Zalo", url: "#" }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.url}
                  title={social.name}
                  style={{
                    width: 45,
                    height: 45,
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    padding: 8,
                    border: "2px solid rgba(255,255,255,0.2)",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <img 
                    src={social.icon} 
                    alt={social.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 20,
              position: "relative",
            }}>
              Liên kết nhanh
              <span style={{
                position: "absolute",
                bottom: -8,
                left: 0,
                width: 40,
                height: 3,
                background: "linear-gradient(90deg, #e53935, #ff7043)",
                borderRadius: 2,
              }}></span>
            </h4>
            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}>
              {["Trang chủ", "Về chúng tôi", "Khóa học", "Lộ trình học", "Giáo viên", "Tin tức"].map((item, idx) => (
                <li key={idx} style={{ marginBottom: 12 }}>
                  <a
                    href="#"
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      textDecoration: "none",
                      fontSize: 15,
                      transition: "all 0.3s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.color = "#ff7043";
                      e.target.style.paddingLeft = 5;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.color = "rgba(255,255,255,0.7)";
                      e.target.style.paddingLeft = 0;
                    }}
                  >
                    <span style={{ color: "#ff7043" }}>▸</span> {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4 style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 20,
              position: "relative",
            }}>
              Khóa học
              <span style={{
                position: "absolute",
                bottom: -8,
                left: 0,
                width: 40,
                height: 3,
                background: "linear-gradient(90deg, #e53935, #ff7043)",
                borderRadius: 2,
              }}></span>
            </h4>
            <ul style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}>
              {["IELTS 5.0-7.0+", "TOEIC 450-990", "Cambridge English", "Giao tiếp cơ bản", "Tiếng Anh thiếu nhi", "Tiếng Anh doanh nghiệp"].map((item, idx) => (
                <li key={idx} style={{ marginBottom: 12 }}>
                  <a
                    href="#"
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      textDecoration: "none",
                      fontSize: 15,
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => e.target.style.color = "#ff7043"}
                    onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.7)"}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 20,
              position: "relative",
            }}>
              Liên hệ
              <span style={{
                position: "absolute",
                bottom: -8,
                left: 0,
                width: 40,
                height: 3,
                background: "linear-gradient(90deg, #e53935, #ff7043)",
                borderRadius: 2,
              }}></span>
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  width: 36,
                  height: 36,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>📍</span>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                  123 Đường Nguyễn ThiệN Thuật, Phường Mỹ Hào, Tỉnh Hưng yên
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  width: 36,
                  height: 36,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>📞</span>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                  1900 08 04
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  width: 36,
                  height: 36,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>✉️</span>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                  contact@nta.edu.vn
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  width: 36,
                  height: 36,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>🌐</span>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>
                  www.nta_center.edu.vn
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: 25,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 15,
        }}>
          <p style={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 14,
            margin: 0,
          }}>
            © {currentYear} NTA English Center. All rights reserved.
          </p>
          <div style={{
            display: "flex",
            gap: 25,
          }}>
            {["Chính sách bảo mật", "Điều khoản sử dụng", "Chính sách hoàn tiền"].map((item, idx) => (
              <a
                key={idx}
                href="#"
                style={{
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  fontSize: 14,
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) => e.target.style.color = "#ff7043"}
                onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
