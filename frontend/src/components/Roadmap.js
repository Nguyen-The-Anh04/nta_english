import roadMapImg from "../assets/icons/lộ trình.jpg";

function Roadmap() {
  const roadmapItems = [
    {
      level: "0 - 3.5",
      title: "Nền tảng",
      subtitle: "Base + Pre IELTS",
      hours: "128 giờ học",
      description: "Xây dựng nền tảng phát âm - từ vựng - ngữ pháp căn bản. Thực hành nghe - nói qua 10 chủ đề giao tiếp quen thuộc.",
      color: "#e53935",
    },
    {
      level: "3.5 - 4.5",
      title: "Khởi động",
      subtitle: "IELTS Foundation",
      hours: "72 giờ học",
      description: "Làm quen với cấu trúc và các dạng bài trong đề thi IELTS. Mở rộng hệ thống từ vựng, ngữ pháp trong IELTS. Luyện tập toàn diện 4 kỹ năng.",
      color: "#ff7043",
    },
    {
      level: "4.5 - 5.5",
      title: "Tăng tốc",
      subtitle: "IELTS Standard",
      hours: "68 giờ học",
      description: "Nâng cao từ vựng, đào sâu các kỹ thuật làm bài. Phát triển kỹ năng Speaking Part 2, 3. Phát triển kỹ năng Writing chuyên sâu.",
      color: "#f4511e",
    },
    {
      level: "5.5 - 6.5",
      title: "Thành công",
      subtitle: "IELTS Complete",
      hours: "68 giờ học",
      description: "Mở rộng hệ thống từ vựng tới 3500 từ. Hoàn thiện 4 kỹ năng ở band điểm 6.5 - 7.0. Luyện đề và chấm chữa lỗi sai chi tiết, đặc biệt 2 phần Speaking & Writing.",
      color: "#c62828",
    },
    {
      level: "6.5 - 7.0+",
      title: "Đỉnh cao",
      subtitle: "IELTS Intensive",
      hours: "48 giờ học",
      description: "Tập trung chuyên sâu vào 2 kỹ năng khó Writing & Speaking. Nâng cấp từ vựng đa dạng. Tăng tốc luyện đề để thành thục cách làm bài, rèn luyện tâm lý vững vàng để đạt band điểm 7.0+.",
      color: "#8e0000",
    },
  ];

  return (
    <section id="roadmap" style={{
      padding: "80px 40px",
      background: "linear-gradient(180deg, #fff8f0 0%, #fff0f5 100%)",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        {/* Section Header */}
        <div style={{
          textAlign: "center",
          marginBottom: 40,
        }}>
          <span style={{
            background: "linear-gradient(135deg, #f4511e 0%, #e53935 100%)",
            color: "white",
            padding: "10px 25px",
            borderRadius: 30,
            fontSize: 14,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}>
            🗺️ Lộ trình học
          </span>
          <h2 style={{
            fontSize: 42,
            fontWeight: "800",
            marginTop: 20,
            marginBottom: 15,
          }}>
            Lộ trình chinh phục <span style={{ color: "#e53935" }}>IELTS</span>
          </h2>
          <p style={{
            fontSize: 18,
            color: "#666",
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.8,
          }}>
            Từ nền tảng cơ bản đến đỉnh cao IELTS 7.0+
          </p>
        </div>

        {/* Roadmap Image */}
        <div style={{
          textAlign: "center",
          marginBottom: 50,
        }}>
          <img 
            src={roadMapImg} 
            alt="Lộ trình IELTS"
            style={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: 20,
              boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
            }}
          />
        </div>

        {/* Timeline with alternating layout */}
        <div style={{
          position: "relative",
          paddingBottom: 30,
        }}>
          {/* Center Line */}
          <div style={{
            position: "absolute",
            left: "50%",
            top: 30,
            bottom: 0,
            width: 4,
            background: "linear-gradient(180deg, #f4511e 0%, #ff7043 50%, #e53935 100%)",
            borderRadius: 2,
            transform: "translateX(-50%)",
          }}></div>

          {roadmapItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: idx % 2 === 0 ? "flex-start" : "flex-end",
                marginBottom: 25,
                position: "relative",
              }}
            >
              {/* Content Card */}
              <div style={{
                width: "45%",
                background: "white",
                borderRadius: 20,
                padding: 20,
                boxShadow: "0 10px 40px rgba(244, 81, 30, 0.1)",
                borderTop: `4px solid ${item.color}`,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 15px 50px rgba(244, 81, 30, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(244, 81, 30, 0.1)";
              }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}>
                  <span style={{
                    background: item.color,
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                  }}>
                    {item.level}
                  </span>
                  <span style={{
                    fontSize: 11,
                    color: item.color,
                    fontWeight: 600,
                  }}>
                    {item.hours}
                  </span>
                </div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1a1a2e",
                  marginBottom: 3,
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: 12,
                  color: item.color,
                  fontWeight: 600,
                  marginBottom: 8,
                }}>
                  {item.subtitle}
                </p>
                <p style={{
                  fontSize: 12,
                  color: "#666",
                  lineHeight: 1.6,
                }}>
                  {item.description}
                </p>
              </div>

              {/* Center Circle */}
              <div style={{
                width: 50,
                height: 50,
                background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: "bold",
                color: "white",
                flexShrink: 0,
                zIndex: 1,
                boxShadow: `0 5px 20px ${item.color}66`,
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                marginTop: 20,
              }}>
                {idx + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{
          textAlign: "center",
          marginTop: 50,
        }}>
          <button style={{
            background: "linear-gradient(135deg, #f4511e 0%, #e53935 100%)",
            color: "white",
            border: "none",
            padding: "18px 50px",
            fontSize: 16,
            fontWeight: "bold",
            borderRadius: 50,
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 10px 30px rgba(244, 81, 30, 0.4)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-3px)";
            e.target.style.boxShadow = "0 15px 40px rgba(244, 81, 30, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 10px 30px rgba(244, 81, 30, 0.4)";
          }}
          >
            Bắt đầu ngay hôm nay 🚀
          </button>
        </div>
      </div>
    </section>
  );
}

export default Roadmap;
