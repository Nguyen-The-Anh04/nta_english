import { useState, useEffect, useRef } from "react";
import img7 from "../assets/images/7.png";

// CSS for animations
const animationStyles = `
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-100px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
  }
  .animate-left { animation: slideInLeft 0.8s ease-out forwards; }
  .animate-right { animation: slideInRight 0.8s ease-out forwards; }
`;

function About() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const sectionRef = useRef(null);

  // Stats with target values
  const statsData = [
    { target: 5000, suffix: "+", label: "Học viên" },
    { target: 200, suffix: "+", label: "Khóa học" },
    { target: 98, suffix: "%", label: "Hài lòng" },
    { target: 50, suffix: "+", label: "Giáo viên" },
  ];

  const [counters, setCounters] = useState(statsData.map(() => 0));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setIsVisible(true);
          setHasStarted(true);
          setAnimate(true);
          startAnimation();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  const startAnimation = () => {
    statsData.forEach((stat, index) => {
      const duration = 2000;
      const steps = 60;
      const increment = stat.target / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(stat.target, Math.round(increment * step));
        setCounters(prev => {
          const newCounters = [...prev];
          newCounters[index] = current;
          return newCounters;
        });

        if (step >= steps) {
          clearInterval(timer);
          setCounters(prev => {
            const newCounters = [...prev];
            newCounters[index] = stat.target;
            return newCounters;
          });
        }
      }, duration / steps);
    });
  };

  const values = [
    {
      icon: "💖",
      title: "TÂM",
      subtitle: "Tận tâm",
      description: "Thể hiện ở dịch vụ chăm sóc khách hàng của đội ngũ cán bộ nhân viên đối với các đối tác, các bậc phụ huynh và các bạn học viên; thể hiện ở công tác giảng dạy & đào tạo của các thầy cô trong trung tâm đến từng cá nhân người học và cả tập thể; thể hiện ở sự quan tâm của ban lãnh đạo công ty tới tất cả tập thể cán bộ nhân viên để luôn cung cấp cho mọi người một môi trường làm việc vui vẻ, năng suất nhất có thể; tất cả luôn hướng về một mục tiêu làm sao để người học được trải nghiệm một môi trường giáo dục toàn diện, nơi vừa đưa người học đến được mục tiêu của mình, vừa cho họ một góc nhìn phấn khởi, tích cực về giáo dục của địa phương và khu vực.",
      gradient: "linear-gradient(135deg, #e53935 0%, #ff7043 100%)",
    },
    {
      icon: "🎯",
      title: "TẦM",
      subtitle: "Tầm nhìn",
      description: "Được bộc lộ từ sứ mệnh muốn nâng tầm kiến thức, đặc biệt về ngoại ngữ cho hàng ngàn học sinh trên địa bàn tỉnh Hưng Yên và các khu vực khác; ngoài ra còn thể hiện ở tầm nhìn & định hướng của ban lãnh đạo công ty về việc mở rộng các loại hình đào tạo khác như đào tạo kỹ năng mềm, tư vấn du học, hỗ trợ toàn diện người học trong quá trình học lên cao hơn cho tới lúc đi làm,… tất cả với mong muốn cháy bỏng trở thành đơn vị số 1 trên địa bàn tỉnh về mảng đào tạo tiếng Anh toàn diện và các loại hình đào tạo con người khác.",
      gradient: "linear-gradient(135deg, #ff7043 0%, #feca57 100%)",
    },
    {
      icon: "🤝",
      title: "TÍN",
      subtitle: "Tín nhiệm",
      description: "Thể hiện ở slogan của trung tâm \"Luyện thi IELTS cam kết đầu ra\"; với việc biết rằng IELTS là một kỳ thi rất khó đối với hầu hết các bạn học sinh, đặc biệt trong môi trường tỉnh lẻ, khó hơn rất nhiều so với kì thi đại học môn tiếng Anh. Trong khi không trường đào tạo chính quy nào có thể nói cam kết cho mọi học sinh tham gia được 9 điểm thi đại học, thì trung tâm bằng việc đào tạo chuyên sâu, cá nhân hóa, thể hiện chữ Tín trong chất lượng đào tạo bằng việc cam kết đầu ra cho mọi học sinh tham gia học tại trung tâm, với mức hỗ trợ cao nhất có thể tìm thấy trên thị trường hiện nay.",
      gradient: "linear-gradient(135deg, #c62828 0%, #e53935 100%)",
    },
  ];

  const advantages = [
    {
      icon: "🏆",
      title: "Top 1 IELTS",
      description: "Chất lượng hàng đầu",
      color: "#e53935",
    },
    {
      icon: "🚀",
      title: "Lộ trình rõ ràng",
      description: "Cá nhân hóa theo năng lực",
      color: "#ff7043",
    },
    {
      icon: "💯",
      title: "Cam kết đầu ra",
      description: "Hoàn tiền nếu không đạt",
      color: "#c62828",
    },
    {
      icon: "📱",
      title: "Học mọi lúc",
      description: "Online & Offline linh hoạt",
      color: "#d32f2f",
    },
  ];

  return (
    <section 
      id="about" 
      ref={sectionRef}
      style={{
        padding: "80px 40px",
        background: "linear-gradient(180deg, #fff5f5 0%, #ffe4e8 100%)",
        position: "relative",
      }}
    >
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        {/* Header */}
        <div style={{
          textAlign: "center",
          marginBottom: 50,
        }}>
          <span style={{
            background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
            color: "white",
            padding: "10px 25px",
            borderRadius: 30,
            fontSize: 14,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 1.5,
            display: "inline-block",
            marginBottom: 25,
          }}>
            ✨ Về chúng tôi
          </span>
          
          <h2 style={{
            fontSize: 42,
            fontWeight: "800",
            marginBottom: 25,
            letterSpacing: "-0.5px",
          }}>
            Chào mừng bạn đến với <span style={{ color: "#e53935" }}>NTA</span> <span style={{ color: "#1a1a2e" }}>English</span>
          </h2>

          {/* Image & Form */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            alignItems: "center",
            marginTop: 30,
            marginBottom: 40,
          }}>
            {/* Image 7 - Slide from left */}
            <div style={{
              position: "relative",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
              opacity: animate ? 1 : 0,
              transform: animate ? "translateX(0)" : "translateX(-100px)",
              transition: "all 0.8s ease-out",
            }}>
              <img 
                src={img7} 
                alt="NTA English"
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                  maxHeight: 450,
                  objectFit: "cover",
                }}
              />
            </div>

            {/* Registration Form - Slide from right */}
            <div style={{
              background: "white",
              borderRadius: 25,
              padding: 35,
              boxShadow: "0 20px 60px rgba(229, 57, 53, 0.15)",
              opacity: animate ? 1 : 0,
              transform: animate ? "translateX(0)" : "translateX(100px)",
              transition: "all 0.8s ease-out",
              transitionDelay: "0.2s",
            }}>
              <h3 style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#1a1a2e",
                marginBottom: 8,
                textAlign: "center",
              }}>
                📝 Đăng ký tư vấn miễn phí
              </h3>
              <p style={{
                fontSize: 14,
                color: "#666",
                textAlign: "center",
                marginBottom: 25,
              }}>
                Nhận tư vấn lộ trình học IELTS phù hợp với bạn
              </p>

              <form>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    border: "2px solid #eee",
                    borderRadius: 12,
                    fontSize: 14,
                    marginBottom: 15,
                    boxSizing: "border-box",
                  }}
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    border: "2px solid #eee",
                    borderRadius: 12,
                    fontSize: 14,
                    marginBottom: 15,
                    boxSizing: "border-box",
                  }}
                />
                <input
                  type="email"
                  placeholder="Email"
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    border: "2px solid #eee",
                    borderRadius: 12,
                    fontSize: 14,
                    marginBottom: 15,
                    boxSizing: "border-box",
                  }}
                />
                <select
                  style={{
                    width: "100%",
                    padding: "14px 18px",
                    border: "2px solid #eee",
                    borderRadius: 12,
                    fontSize: 14,
                    marginBottom: 20,
                    boxSizing: "border-box",
                    background: "white",
                  }}
                >
                  <option value="">Chọn khóa học quan tâm</option>
                  <option value="ielts-foundation">IELTS Foundation (5.0-6.5)</option>
                  <option value="ielts-advanced">IELTS Advanced (7.0+)</option>
                  <option value="ielts-junior">IELTS Junior (12-17 tuổi)</option>
                  <option value="cambridge">Cambridge (KET/PET)</option>
                  <option value="toeic">TOEIC Master</option>
                  <option value="giao-tiep">Giao Tiếp Cơ Bản</option>
                </select>
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                    color: "white",
                    border: "none",
                    padding: "16px",
                    fontSize: 15,
                    fontWeight: "bold",
                    borderRadius: 12,
                    cursor: "pointer",
                    boxShadow: "0 8px 25px rgba(229, 57, 53, 0.4)",
                  }}
                >
                  🚀 Đăng ký ngay
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          background: "white",
          borderRadius: 30,
          padding: 50,
          marginBottom: 50,
          boxShadow: "0 15px 50px rgba(229, 57, 53, 0.1)",
        }}>
          <p style={{
            fontSize: 17,
            color: "#444",
            lineHeight: 1.9,
            marginBottom: 20,
            textAlign: "center",
            fontWeight: 500,
          }}>
            Trung tâm ngoại ngữ NTA English là đơn vị cung cấp dịch vụ học ngoại ngữ và luyện thi IELTS uy tín cho học viên tại khu vực tỉnh Hưng Yên. Chúng tôi đã và đang cố gắng nỗ lực không ngừng mỗi ngày để giúp các bạn học viên ôn luyện IELTS dễ dàng hơn, cùng chinh phục được đỉnh cao IELTS phục vụ các mục tiêu phía trước.
          </p>
          <p style={{
            fontSize: 17,
            color: "#444",
            lineHeight: 1.9,
            marginBottom: 25,
            textAlign: "center",
          }}>
            Với đội ngũ giáo viên chuyên môn giỏi, nhiều kinh nghiệm trong lĩnh vực luyện thi IELTS và đội ngũ trợ giảng nhiệt huyết, sáng tạo từ các trường học uy tín. NTA English định hướng phương pháp giảng dạy phù hợp, hiệu quả, linh hoạt.
          </p>

          {/* Stats with Animation */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            marginTop: 40,
          }}>
            {statsData.map((stat, idx) => {
              const gradients = [
                { from: "#e53935", to: "#ff6b6b" },
                { from: "#ff7043", to: "#ffab91" },
                { from: "#c62828", to: "#e53935" },
                { from: "#d32f2f", to: "#ff5252" },
              ];
              const gradient = gradients[idx];

              return (
                <div key={idx} style={{
                  background: isVisible 
                    ? "linear-gradient(180deg, #fff5f5 0%, #ffe4e8 100%)" 
                    : "#f5f5f5",
                  borderRadius: 20,
                  padding: "30px 20px",
                  textAlign: "center",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                  transition: "all 0.4s ease",
                  border: `2px solid ${gradient.from}20`,
                }}>
                  <div style={{
                    fontSize: 42,
                    fontWeight: "900",
                    background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1,
                  }}>
                    {counters[idx].toLocaleString()}{stat.suffix}
                  </div>
                  <div style={{
                    fontSize: 14,
                    color: "#666",
                    marginTop: 8,
                    fontWeight: "600",
                  }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mục tiêu đào tạo */}
        <div style={{
          marginBottom: 60,
          textAlign: "center",
        }}>
          <h3 style={{
            fontSize: 32,
            fontWeight: "800",
            color: "#1a1a2e",
            marginBottom: 25,
            position: "relative",
            display: "inline-block",
          }}>
            <span style={{
              background: "linear-gradient(135deg, #e53935 0%, #ff7043 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Mục tiêu đào tạo
            </span>
            <div style={{
              width: 70,
              height: 4,
              background: "linear-gradient(90deg, #e53935, #ff7043)",
              margin: "15px auto 0",
              borderRadius: 2,
            }}></div>
          </h3>
          <p style={{
            fontSize: 17,
            color: "#555",
            lineHeight: 1.9,
            maxWidth: 800,
            margin: "0 auto",
          }}>
            Mục tiêu cốt lõi của hệ thống đào tạo tại NTA là đưa học sinh đến với đỉnh cao của tiếng Anh một cách thực chất, bao gồm điểm số các kỳ thi IELTS, KET, PET cao và khả năng sử dụng tiếng Anh hiệu quả trong thực tế.
          </p>
        </div>

        {/* Giá trị cốt lõi - 3T */}
        <div style={{ marginBottom: 60 }}>
          <h3 style={{
            fontSize: 32,
            fontWeight: "800",
            color: "#1a1a2e",
            textAlign: "center",
            marginBottom: 40,
          }}>
            <span style={{
              background: "linear-gradient(135deg, #e53935 0%, #ff7043 50%, #c62828 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Giá trị cốt lõi - 3T
            </span>
            <div style={{
              width: 80,
              height: 4,
              background: "linear-gradient(90deg, #e53935, #ff7043)",
              margin: "15px auto 0",
              borderRadius: 2,
            }}></div>
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: 30,
          }}>
            {values.map((value, idx) => (
              <div key={idx} style={{
                background: "white",
                borderRadius: 25,
                padding: 40,
                boxShadow: "0 15px 50px rgba(0, 0, 0, 0.08)",
                border: "3px solid transparent",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-15px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 25px 70px rgba(229, 57, 53, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 15px 50px rgba(0, 0, 0, 0.08)";
              }}>
                <div style={{
                  width: 70,
                  height: 70,
                  background: value.gradient,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 25,
                  fontSize: 35,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                }}>
                  {value.icon}
                </div>
                
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                  marginBottom: 15,
                }}>
                  <h4 style={{
                    fontSize: 32,
                    fontWeight: "800",
                    background: value.gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    margin: 0,
                  }}>
                    {value.title}
                  </h4>
                  <span style={{
                    background: "rgba(0,0,0,0.05)",
                    padding: "5px 15px",
                    borderRadius: 20,
                    fontSize: 13,
                    color: "#666",
                    fontWeight: 500,
                  }}>
                    {value.subtitle}
                  </span>
                </div>
                
                <p style={{
                  fontSize: 14,
                  color: "#555",
                  lineHeight: 1.9,
                  margin: 0,
                  textAlign: "justify",
                }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tại sao chọn NTA */}
        <div>
          <h3 style={{
            fontSize: 32,
            fontWeight: "800",
            color: "#1a1a2e",
            textAlign: "center",
            marginBottom: 40,
          }}>
            <span style={{
              background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Tại sao chọn NTA English?
            </span>
            <div style={{
              width: 80,
              height: 4,
              background: "linear-gradient(90deg, #e53935, #c62828)",
              margin: "15px auto 0",
              borderRadius: 2,
            }}></div>
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 25,
          }}>
            {advantages.map((adv, idx) => (
              <div key={idx} style={{
                background: "white",
                borderRadius: 25,
                padding: "30px 25px",
                textAlign: "center",
                boxShadow: "0 15px 50px rgba(0, 0, 0, 0.08)",
                border: `2px solid ${adv.color}20`,
                transition: "all 0.4s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = `0 25px 60px ${adv.color}20`;
                e.currentTarget.style.borderColor = adv.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 15px 50px rgba(0, 0, 0, 0.08)";
                e.currentTarget.style.borderColor = `${adv.color}20`;
              }}>
                <div style={{
                  width: 70,
                  height: 70,
                  background: `${adv.color}15`,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: 32,
                  border: `2px solid ${adv.color}30`,
                }}>
                  {adv.icon}
                </div>
                <h4 style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: "#1a1a2e",
                  marginBottom: 10,
                }}>
                  {adv.title}
                </h4>
                <p style={{
                  fontSize: 14,
                  color: "#666",
                  margin: 0,
                  lineHeight: 1.6,
                }}>
                  {adv.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
