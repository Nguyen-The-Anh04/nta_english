import { useState } from "react";
import teacher1 from "../assets/teacher/tạo_ảnh_nữ_202603191641 (1).jpeg";
import teacher2 from "../assets/teacher/Tạo_ảnh_profile_202603191639 (1).jpeg";
import teacher3 from "../assets/teacher/tạo_ảnh_nữ_202603191641.jpeg";
import teacher4 from "../assets/teacher/Tạo_ảnh_profile_202603191639.jpeg";

function Teachers() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const teachersPerPage = 3;

  const teachers = [
    {
      id: 1,
      name: "Mr. Hoàng Long",
      title: "",
      band: "IELTS 8.0",
      experience: "8 năm kinh nghiệm",
      students: "Nhiều học viên đạt 7.0+",
      achievement: "IELTS 8.0",
      description: "Tốt nghiệp khoa Kinh tế đối ngoại, Đại học Ngoại thương. 8 năm kinh nghiệm giảng dạy IELTS, nhiều học viên đạt band điểm 7.0+. Chứng chỉ IELTS Training tại British Council (Hội đồng Anh) và IDP.",
      stars: 5,
      avatar: teacher1,
      color: "#e53935",
    },
    {
      id: 2,
      name: "Ms. Diệu Nga",
      title: "",
      band: "IELTS 8.0",
      experience: "5 năm kinh nghiệm",
      students: "Nhiều học viên đạt 7.0+",
      achievement: "IELTS 8.0",
      description: "IELTS 8.0 Overall. Chứng chỉ TESOL. Giải nhì hùng biện Tiếng Anh trường Đại học Y Thái Bình.",
      stars: 5,
      avatar: teacher2,
      color: "#ff7043",
    },
    {
      id: 3,
      name: "Mr. Đăng Hiếu",
      title: "",
      band: "IELTS 8.0",
      experience: "Nhiều kinh nghiệm",
      students: "Nhiều học viên đạt điểm cao",
      achievement: "IELTS 8.0",
      description: "IELTS 8.0 Overall. Tốt nghiệp ngành Ngôn ngữ Anh, Đại học Kinh tế Quốc dân. Phong cách giảng dạy nhiệt tình, sáng tạo, thấu hiểu tâm lý học trò.",
      stars: 5,
      avatar: teacher3,
      color: "#c62828",
    },
    {
      id: 4,
      name: "Mr. Phan Huy",
      title: "",
      band: "IELTS 8.5",
      experience: "5 năm kinh nghiệm",
      students: "Nhiều học viên đạt điểm cao",
      achievement: "IELTS 8.5",
      description: "IELTS 8.5 Overall và điểm tuyệt đối 9.0 Reading & Listening. 990 TOEIC. Tốt nghiệp Đại học Ngoại thương.",
      stars: 5,
      avatar: teacher4,
      color: "#d32f2f",
    },
    {
      id: 5,
      name: "Ms. Mai Trần",
      title: "",
      band: "IELTS 7.5",
      experience: "Nhiều kinh nghiệm",
      students: "Nhiều học viên",
      achievement: "IELTS 7.5",
      description: "IELTS 7.5 Overall. Phong cách giảng dạy tận tâm, tỉ mỉ, nhiệt huyết. Chứng chỉ kế toán quốc tế CPA Australia.",
      stars: 4,
      avatar: teacher1,
      color: "#e53935",
    },
    {
      id: 6,
      name: "Mr. Phúc Anh",
      title: "",
      band: "IELTS 8.0",
      experience: "5 năm kinh nghiệm",
      students: "Nhiều học sinh yêu thích",
      achievement: "IELTS 8.0",
      description: "Tốt nghiệp đại học Greenwich. 5 năm kinh nghiệm giảng dạy Tiếng Anh và IELTS. Cách dạy dễ hiểu, đơn giản hoá những điều phức tạp.",
      stars: 5,
      avatar: teacher2,
      color: "#ff7043",
    },
  ];

  const visibleTeachers = teachers.slice(currentIndex, currentIndex + teachersPerPage);
  const totalPages = Math.ceil(teachers.length / teachersPerPage);

  const goToPrev = () => {
    setCurrentIndex(prev => Math.max(0, prev - teachersPerPage));
  };

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(teachers.length - teachersPerPage, prev + teachersPerPage));
  };

  return (
    <section id="teachers" style={{
      padding: "80px 40px",
      background: "linear-gradient(180deg, #fff0f5 0%, #ffe4ec 100%)",
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
            background: "linear-gradient(135deg, #d32f2f 0%, #c62828 100%)",
            color: "white",
            padding: "10px 25px",
            borderRadius: 30,
            fontSize: 14,
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: 1.5,
          }}>
            👨‍🏫 Đội ngũ giáo viên
          </span>
          <h2 style={{
            fontSize: 42,
            fontWeight: "800",
            marginTop: 20,
            marginBottom: 15,
          }}>
            Học với <span style={{ color: "#e53935" }}>chuyên gia</span>
          </h2>
          <p style={{
            fontSize: 18,
            color: "#666",
            maxWidth: 600,
            margin: "0 auto",
            lineHeight: 1.8,
          }}>
            Đội ngũ giáo viên giàu kinh nghiệm, tận tâm và chuyên môn cao
          </p>
        </div>

        {/* Navigation Arrows */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 30,
        }}>
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              border: "none",
              background: currentIndex === 0 ? "#ddd" : "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
              color: currentIndex === 0 ? "#999" : "white",
              fontSize: 24,
              cursor: currentIndex === 0 ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: currentIndex === 0 ? "none" : "0 5px 20px rgba(229, 57, 53, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (currentIndex !== 0) {
                e.target.style.transform = "scale(1.1)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
            }}
          >
            ❮
          </button>

          {/* Page Indicators */}
          <div style={{
            display: "flex",
            gap: 10,
          }}>
            {[...Array(totalPages)].map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: currentIndex / teachersPerPage === idx ? 30 : 10,
                  height: 10,
                  borderRadius: 5,
                  background: currentIndex / teachersPerPage === idx 
                    ? "linear-gradient(135deg, #e53935 0%, #c62828 100%)" 
                    : "#ddd",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          <button
            onClick={goToNext}
            disabled={currentIndex >= teachers.length - teachersPerPage}
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              border: "none",
              background: currentIndex >= teachers.length - teachersPerPage 
                ? "#ddd" 
                : "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
              color: currentIndex >= teachers.length - teachersPerPage ? "#999" : "white",
              fontSize: 24,
              cursor: currentIndex >= teachers.length - teachersPerPage ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
              boxShadow: currentIndex >= teachers.length - teachersPerPage ? "none" : "0 5px 20px rgba(229, 57, 53, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => {
              if (currentIndex < teachers.length - teachersPerPage) {
                e.target.style.transform = "scale(1.1)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
            }}
          >
            ❯
          </button>
        </div>

        {/* Teachers Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 30,
        }}>
          {visibleTeachers.map((teacher, idx) => (
            <div
              key={teacher.id}
              style={{
                background: "white",
                borderRadius: 25,
                overflow: "hidden",
                boxShadow: "0 15px 50px rgba(211, 47, 47, 0.12)",
                transition: "all 0.4s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-15px)";
                e.currentTarget.style.boxShadow = "0 25px 70px rgba(211, 47, 47, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 15px 50px rgba(211, 47, 47, 0.12)";
              }}
            >
              {/* Avatar Section */}
              <div style={{
                background: `linear-gradient(135deg, ${teacher.color} 0%, ${teacher.color}99 100%)`,
                padding: 40,
                textAlign: "center",
                position: "relative",
              }}>
                <div style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  margin: "0 auto",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                  position: "relative",
                }}>
                  <img 
                    src={teacher.avatar} 
                    alt={teacher.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: 25, textAlign: "center" }}>
                <h3 style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  color: "#1a1a2e",
                  marginBottom: 5,
                }}>
                  {teacher.name}
                </h3>
                
                {/* Band Score */}
                <p style={{
                  fontSize: 16,
                  color: teacher.color,
                  fontWeight: 700,
                  marginBottom: 12,
                }}>
                  {teacher.band}
                </p>

                {/* Description/Bio */}
                <p style={{
                  fontSize: 13,
                  color: "#555",
                  lineHeight: 1.6,
                  marginBottom: 15,
                  minHeight: 60,
                }}>
                  {teacher.description}
                </p>

                {/* Stats - Experience & Students */}
                <div style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 15,
                  marginBottom: 15,
                  paddingBottom: 15,
                  borderBottom: "1px solid #eee",
                }}>
                  <div>
                    <span style={{
                      display: "block",
                      fontSize: 16,
                      fontWeight: "bold",
                      color: teacher.color,
                    }}>
                      {teacher.experience}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: "#999",
                    }}>
                      Kinh nghiệm
                    </span>
                  </div>
                  <div style={{ width: 1, background: "#eee" }}></div>
                  <div>
                    <span style={{
                      display: "block",
                      fontSize: 16,
                      fontWeight: "bold",
                      color: teacher.color,
                    }}>
                      {teacher.students}
                    </span>
                    <span style={{
                      fontSize: 11,
                      color: "#999",
                    }}>
                      Học viên
                    </span>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{
          textAlign: "center",
          marginTop: 60,
        }}>
          <button style={{
            background: "linear-gradient(135deg, #d32f2f 0%, #c62828 100%)",
            color: "white",
            border: "none",
            padding: "18px 50px",
            fontSize: 16,
            fontWeight: "bold",
            borderRadius: 50,
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 10px 30px rgba(211, 47, 47, 0.4)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-3px)";
            e.target.style.boxShadow = "0 15px 40px rgba(211, 47, 47, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 10px 30px rgba(211, 47, 47, 0.4)";
          }}
          >
            Gặp gỡ tất cả giáo viên 👥
          </button>
        </div>
      </div>
    </section>
  );
}

export default Teachers;
