function Courses() {
  const scrollToCTA = () => {
    const ctaSection = document.getElementById("cta");
    if (ctaSection) {
      ctaSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const courses = [
    {
      id: 1,
      title: "IELTS Foundation",
      level: "IELTS 5.0 - 6.5",
      discount: "15%",
      duration: "3 tháng",
      lessons: "60 buổi",
      features: [
        "Luyện đề chuyên sâu",
        "Giáo viên 8+ năm kinh nghiệm",
        "Hỗ trợ 24/7",
        "Tài liệu miễn phí",
      ],
      popular: false,
      color: "#e53935",
      icon: "🎯",
    },
    {
      id: 2,
      title: "IELTS Advanced",
      level: "IELTS 7.0+",
      discount: "20%",
      duration: "4 tháng",
      lessons: "80 buổi",
      features: [
        "Luyện chiến lược nâng cao",
        "Giáo viên native speaker",
        "Thi thử miễn phí",
        "Cam kết đầu ra",
      ],
      popular: true,
      color: "#ff7043",
      icon: "🏆",
    },
    {
      id: 3,
      title: "IELTS Junior",
      level: "Dành cho học sinh 12-17 tuổi",
      discount: "10%",
      duration: "3 tháng",
      lessons: "48 buổi",
      features: [
        "Phương pháp học phù hợp lứa tuổi",
        "Giáo viên chuyên trẻ em",
        "Lớp học nhỏ 8-10 học viên",
        "Theo dõi tiến độ chi tiết",
      ],
      popular: false,
      color: "#ff5252",
      icon: "👦",
    },
    {
      id: 4,
      title: "Cambridge (KET/PET)",
      level: "A2 - B1",
      discount: "5%",
      duration: "3.5 tháng",
      lessons: "56 buổi",
      features: [
        "Chuẩn bị thi Cambridge",
        "Luyện 4 kỹ năng toàn diện",
        "Tài liệu Cambridge chính thức",
        "Thi thử định kỳ",
      ],
      popular: false,
      color: "#1976d2",
      icon: "📘",
    },
    {
      id: 5,
      title: "TOEIC Master",
      level: "450 - 850+",
      discount: "12%",
      duration: "2.5 tháng",
      lessons: "50 buổi",
      features: [
        "Chiến lược làm bài nhanh",
        "Mẹo đạt điểm cao",
        "Học online & offline",
        "Bài tập thực hành",
      ],
      popular: false,
      color: "#c62828",
      icon: "💼",
    },
    {
      id: 6,
      title: "Giao Tiếp",
      level: "Cơ bản - Nâng cao",
      discount: "8%",
      duration: "2 tháng",
      lessons: "40 buổi",
      features: [
        "Phát âm chuẩn",
        "Thực hành hàng ngày",
        "Giao tiếp với giáo viên",
        "100% tiếng Anh",
      ],
      popular: false,
      color: "#d32f2f",
      icon: "💬",
    },
  ];

  return (
    <section
      id="courses"
      style={{
        padding: "80px 40px",
        background: "linear-gradient(180deg, #fff0f3 0%, #fff8fa 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          background: "linear-gradient(135deg, #ff704320, #ffab9120)",
          borderRadius: "50%",
          filter: "blur(80px)",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          background: "linear-gradient(135deg, #ffab9120, #ff704320)",
          borderRadius: "50%",
          filter: "blur(100px)",
        }}
      ></div>

      <div
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <span
            style={{
              background:
                "linear-gradient(135deg, #ff7043 0%, #e53935 100%)",
              color: "white",
              padding: "10px 25px",
              borderRadius: 30,
              fontSize: 14,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              boxShadow: "0 10px 30px rgba(255, 112, 67, 0.3)",
            }}
          >
            📚 Khóa học
          </span>
          <h2
            style={{
              fontSize: 48,
              fontWeight: "800",
              marginTop: 25,
              marginBottom: 20,
              letterSpacing: "-1px",
            }}
          >
            Chọn <span style={{ color: "#e53935" }}>khóa học</span> <span style={{ color: "#1a1a2e" }}>phù hợp</span>
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "#666",
              maxWidth: 700,
              margin: "0 auto",
              lineHeight: 1.9,
            }}
          >
            Các khóa học được thiết kế phù hợp với mọi trình độ và mục tiêu học tập
          </p>
        </div>

        {/* Courses Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 35,
          }}
        >
          {courses.map((course, idx) => (
            <div
              key={idx}
              className="course-card"
              style={{
                background: "white",
                borderRadius: 30,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
                border: course.popular ? `3px solid ${course.color}` : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-20px) scale(1.02)";
                e.currentTarget.style.boxShadow = "0 30px 80px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.08)";
              }}
            >
              {/* Popular Badge */}
              {course.popular && (
                <div
                  style={{
                    position: "absolute",
                    top: 25,
                    right: -35,
                    background: `linear-gradient(135deg, ${course.color}, ${course.color}dd)`,
                    color: "white",
                    padding: "10px 45px",
                    fontSize: 13,
                    fontWeight: "800",
                    transform: "rotate(45deg)",
                    zIndex: 10,
                    boxShadow: "0 5px 20px rgba(0, 0, 0, 0.2)",
                    letterSpacing: "1px",
                  }}
                >
                  ⭐ POPULAR
                </div>
              )}

              {/* Header */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${course.color} 0%, ${course.color}dd 100%)`,
                  padding: "40px 30px",
                  textAlign: "center",
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Decorative circle */}
                <div
                  style={{
                    position: "absolute",
                    top: -50,
                    right: -50,
                    width: 150,
                    height: 150,
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "50%",
                  }}
                ></div>

                {/* Icon */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: 40,
                    backdropFilter: "blur(10px)",
                    border: "3px solid rgba(255, 255, 255, 0.3)",
                  }}
                >
                  {course.icon}
                </div>

                <h3
                  style={{
                    fontSize: 26,
                    fontWeight: "800",
                    marginBottom: 10,
                    position: "relative",
                  }}
                >
                  {course.title}
                </h3>
                <p
                  style={{
                    fontSize: 15,
                    opacity: 0.95,
                    fontWeight: 500,
                  }}
                >
                  {course.level}
                </p>
              </div>

              {/* Content */}
              <div style={{ padding: 30 }}>
                {/* Discount Badge */}
                <div style={{ textAlign: "center", marginBottom: 25 }}>
                  <div
                    style={{
                      display: "inline-block",
                      background: `linear-gradient(135deg, ${course.color} 0%, ${course.color}dd 100%)`,
                      color: "white",
                      padding: "12px 30px",
                      borderRadius: 50,
                      fontSize: 28,
                      fontWeight: "800",
                      boxShadow: `0 8px 25px ${course.color}40`,
                    }}
                  >
                    🎉 GIẢM {course.discount}
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: "#666",
                      marginTop: 15,
                      fontWeight: 500,
                    }}
                  >
                    🔥 Ưu đãi có hạn sử dụng
                  </p>
                </div>

                {/* Stats */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 20,
                    marginBottom: 25,
                    paddingBottom: 20,
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <span
                      style={{ fontSize: 20, fontWeight: "bold", color: course.color }}
                    >
                      {course.lessons}
                    </span>
                    <p style={{ fontSize: 12, color: "#999", margin: 0 }}>buổi</p>
                  </div>
                  <div style={{ width: 1, background: "#eee" }}></div>
                  <div style={{ textAlign: "center" }}>
                    <span
                      style={{ fontSize: 20, fontWeight: "bold", color: course.color }}
                    >
                      {course.duration}
                    </span>
                    <p style={{ fontSize: 12, color: "#999", margin: 0 }}>thời gian</p>
                  </div>
                </div>

                {/* Features */}
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 25px 0",
                  }}
                >
                  {course.features.map((feature, fIdx) => (
                    <li
                      key={fIdx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 12,
                        fontSize: 14,
                        color: "#555",
                      }}
                    >
                      <span
                        style={{
                          width: 24,
                          height: 24,
                          background: `${course.color}15`,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: course.color,
                          fontSize: 12,
                          flexShrink: 0,
                        }}
                      >
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={scrollToCTA}
                  style={{
                    width: "100%",
                    background: course.popular
                      ? `linear-gradient(135deg, ${course.color} 0%, ${course.color}dd 100%)`
                      : "white",
                    color: course.popular ? "white" : course.color,
                    border: `3px solid ${course.color}`,
                    padding: "18px",
                    fontSize: 17,
                    fontWeight: "800",
                    borderRadius: 20,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    boxShadow: course.popular ? `0 10px 30px ${course.color}40` : "none",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = `linear-gradient(135deg, ${course.color}, ${course.color}dd)`;
                    e.target.style.color = "white";
                    e.target.style.transform = "translateY(-3px)";
                    e.target.style.boxShadow = `0 15px 40px ${course.color}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = course.popular
                      ? `linear-gradient(135deg, ${course.color} 0%, ${course.color}dd 100%)`
                      : "white";
                    e.target.style.color = course.popular ? "white" : course.color;
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = course.popular
                      ? `0 10px 30px ${course.color}40`
                      : "none";
                  }}
                >
                  🚀 Đăng ký ngay
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div
          style={{
            textAlign: "center",
            marginTop: 60,
            padding: "50px 30px",
            background: "linear-gradient(135deg, #fff0f3 0%, #ffffff 100%)",
            borderRadius: 30,
            boxShadow: "0 20px 60px rgba(255, 112, 67, 0.1)",
          }}
        >
          <p
            style={{
              fontSize: 20,
              color: "#333",
              marginBottom: 25,
              fontWeight: 600,
            }}
          >
            💡 Bạn cần tư vấn để chọn khóa học phù hợp?
          </p>
          <button
            onClick={scrollToCTA}
            style={{
              background: "linear-gradient(135deg, #ff7043 0%, #e53935 100%)",
              color: "white",
              border: "none",
              padding: "18px 50px",
              fontSize: 17,
              fontWeight: "800",
              borderRadius: 50,
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 15px 40px rgba(255, 112, 67, 0.3)",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-5px) scale(1.05)";
              e.target.style.boxShadow = "0 20px 50px rgba(255, 112, 67, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0) scale(1)";
              e.target.style.boxShadow = "0 15px 40px rgba(255, 112, 67, 0.3)";
            }}
          >
            📞 Liên hệ tư vấn miễn phí
          </button>
        </div>
      </div>
    </section>
  );
}

export default Courses;
