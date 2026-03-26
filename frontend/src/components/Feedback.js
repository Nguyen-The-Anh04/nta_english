import student1 from "../assets/students/tạo_ảnh_chân_202603191659 (1).jpeg";
import student2 from "../assets/students/tạo_ảnh_chân_202603191659 (2).jpeg";
import student3 from "../assets/students/tạo_ảnh_chân_202603191659.jpeg";

function Feedback() {
  const feedbacks = [
    {
      id: 1,
      name: "Nguyễn Văn Anh",
      avatar: student1,
      course: "IELTS 7.0+",
      rating: 5,
      content: "Mình đạt được IELTS 7.5 sau 4 tháng học tại NTA. Giáo viên rất nhiệt tình, phương pháp dạy hiệu quả. Cảm ơn NTA đã giúp mình đạt mục tiêu!",
      location: "TP. Hồ Chí Minh",
    },
    {
      id: 2,
      name: "Trần Tuấn Anh",
      avatar: student2,
      course: "TOEIC 850",
      rating: 5,
      content: "Từ 450 TOEIC, mình đã đạt 850 điểm chỉ sau 3 tháng. Tài liệu phong phú, lớp học online rất tiện lợi. Highly recommend!",
      location: "Hà Nội",
    },
    {
      id: 3,
      name: "Lê Văn Cường",
      avatar: student3,
      course: "Giao Tiếp",
      rating: 5,
      content: "Trước mình sợ giao tiếp tiếng Anh, sau khóa học ở NTA, mình tự tin giao tiếp với người nước ngoài. Giáo viên native rất tuyệt!",
      location: "Đà Nẵng",
    },
  ];

  return (
    <section style={{
      padding: "80px 40px",
      background: "linear-gradient(180deg, #fff5f5 0%, #ffe8eb 100%)",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        {/* Section Header */}
        <div style={{
          textAlign: "center",
          marginBottom: 60,
        }}>
          <span style={{
            background: "linear-gradient(135deg, #c62828 0%, #e53935 100%)",
            color: "white",
            padding: "10px 25px",
            borderRadius: 30,
            fontSize: 14,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}>
            ⭐ Đánh giá học viên
          </span>
          <h2 style={{
            fontSize: 42,
            fontWeight: "800",
            marginTop: 20,
            marginBottom: 15,
          }}>
            Học viên nói gì về <span style={{ color: "#e53935" }}>NTA</span>
          </h2>
          <p style={{
            fontSize: 18,
            color: "#666",
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.8,
          }}>
            Chia sẻ trải nghiệm học tập từ các học viên đã đạt được mục tiêu tiếng Anh
          </p>
        </div>

        {/* Feedback Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 30,
        }}>
          {feedbacks.map((fb, idx) => (
            <div
              key={idx}
              style={{
                background: "white",
                borderRadius: 25,
                padding: 30,
                transition: "all 0.3s ease",
                border: "1px solid rgba(198, 40, 40, 0.1)",
                boxShadow: "0 10px 40px rgba(198, 40, 40, 0.08)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-10px)";
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(198, 40, 40, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(198, 40, 40, 0.08)";
              }}
            >
              {/* Stars */}
              <div style={{
                display: "flex",
                gap: 4,
                marginBottom: 20,
              }}>
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 20,
                      color: i < fb.rating ? "#ff7043" : "#ddd",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Content */}
              <p style={{
                fontSize: 16,
                color: "#555",
                lineHeight: 1.8,
                marginBottom: 25,
                fontStyle: "italic",
              }}>
                "{fb.content}"
              </p>

              {/* Author */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
                paddingTop: 20,
                borderTop: "1px solid rgba(198, 40, 40, 0.1)",
              }}>
                <div style={{
                  width: 55,
                  height: 55,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "2px solid #c62828",
                }}>
                  <img 
                    src={fb.avatar} 
                    alt={fb.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <div>
                  <h4 style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#1a1a2e",
                    marginBottom: 4,
                  }}>
                    {fb.name}
                  </h4>
                  <p style={{
                    fontSize: 13,
                    color: "#c62828",
                    fontWeight: 600,
                    marginBottom: 2,
                  }}>
                    {fb.course}
                  </p>
                  <p style={{
                    fontSize: 12,
                    color: "#999",
                  }}>
                    📍 {fb.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* All Reviews CTA */}
        <div style={{
          textAlign: "center",
          marginTop: 50,
        }}>
          <button style={{
            background: "white",
            color: "#c62828",
            border: "2px solid #c62828",
            padding: "15px 40px",
            fontSize: 16,
            fontWeight: "bold",
            borderRadius: 50,
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#c62828";
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "white";
            e.target.style.color = "#c62828";
          }}
          >
            Xem tất cả đánh giá 📝
          </button>
        </div>
      </div>
    </section>
  );
}

export default Feedback;
