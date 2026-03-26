import { useState, useEffect, useRef } from "react";
import axios from "axios";

function CTAForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    course: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [animate, setAnimate] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Countdown timer - set to 1 hour 45 minutes 43 seconds
  const [timeLeft, setTimeLeft] = useState({
    hours: 1,
    minutes: 45,
    seconds: 43
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const courses = [
    { value: "", label: "Chọn khóa học quan tâm" },
    { value: "ielts-foundation", label: "IELTS Foundation (5.0-6.5)" },
    { value: "ielts-advanced", label: "IELTS Advanced (7.0+)" },
    { value: "ielts-junior", label: "IELTS Junior (12-17 tuổi)" },
    { value: "cambridge", label: "Cambridge (KET/PET)" },
    { value: "toeic", label: "TOEIC Master" },
    { value: "giao-tiep", label: "Giao Tiếp Cơ Bản" },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^0\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    if (!formData.course) {
      newErrors.course = "Vui lòng chọn khóa học";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await axios.post('/api/registrations', formData);
        
        if (response.data.success) {
          setIsSubmitted(true);
        } else {
          setSubmitError(response.data.message || "Đăng ký thất bại. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Form submission error:", error);
        if (error.response) {
          setSubmitError(error.response.data.message || "Server error. Vui lòng thử lại sau.");
        } else if (error.request) {
          setSubmitError("Không thể kết nối server. Vui lòng kiểm tra kết nối mạng.");
        } else {
          setSubmitError("Đăng ký thất bại. Vui lòng thử lại.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  if (isSubmitted) {
    return (
      <section id="cta" style={{
        padding: "80px 40px",
        background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
      }}>
        <div style={{
          maxWidth: 600,
          margin: "0 auto",
          textAlign: "center",
          color: "white",
        }}>
          <div style={{
            width: 100,
            height: 100,
            background: "white",
            borderRadius: "50%",
            margin: "0 auto 30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 50,
          }}>
            ✅
          </div>
          <h2 style={{
            fontSize: 36,
            fontWeight: "bold",
            marginBottom: 15,
          }}>
            Đăng ký thành công!
          </h2>
          <p style={{
            fontSize: 18,
            opacity: 0.9,
            lineHeight: 1.8,
            marginBottom: 30,
          }}>
            Cảm ơn bạn đã đăng ký. Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ tới.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            style={{
              background: "white",
              color: "#e53935",
              border: "none",
              padding: "15px 40px",
              fontSize: 16,
              fontWeight: "bold",
              borderRadius: 50,
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            Đăng ký thêm
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="cta" ref={sectionRef} style={{
      padding: "80px 40px",
      background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Decorative elements */}
      <div style={{
        position: "absolute",
        top: -50,
        left: -50,
        width: 200,
        height: 200,
        background: "rgba(255,255,255,0.1)",
        borderRadius: "50%",
      }}></div>
      <div style={{
        position: "absolute",
        bottom: -80,
        right: -80,
        width: 300,
        height: 300,
        background: "rgba(255,255,255,0.08)",
        borderRadius: "50%",
      }}></div>

      <div style={{
        maxWidth: 1000,
        margin: "0 auto",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Countdown Timer */}
        <div style={{
          textAlign: "center",
          marginBottom: 30,
        }}>
          <div style={{
            display: "inline-flex",
            background: "rgba(0,0,0,0.2)",
            padding: "15px 30px",
            borderRadius: 20,
            backdropFilter: "blur(10px)",
          }}>
            <span style={{
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              marginRight: 15,
            }}>
              ⏰ Ưu đãi kết thúc sau:
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { value: timeLeft.hours, label: "Giờ" },
                { value: timeLeft.minutes, label: "Phút" },
                { value: timeLeft.seconds, label: "Giây" },
              ].map((item, idx) => (
                <div key={idx} style={{
                  background: "white",
                  borderRadius: 10,
                  padding: "8px 12px",
                  minWidth: 50,
                  textAlign: "center",
                }}>
                  <div style={{
                    fontSize: 24,
                    fontWeight: "900",
                    color: "#e53935",
                    lineHeight: 1,
                  }}>
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: "#666",
                    fontWeight: 600,
                    textTransform: "uppercase",
                  }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
          alignItems: "center",
        }}>
          {/* Left Content - Slide from left */}
          <div style={{ 
            color: "white",
            opacity: animate ? 1 : 0,
            transform: animate ? "translateX(0)" : "translateX(-100px)",
            transition: "all 0.8s ease-out",
          }}>
            <span style={{
              background: "rgba(255,255,255,0.2)",
              padding: "8px 20px",
              borderRadius: 25,
              fontSize: 14,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}>
              🎯 Đăng ký ngay
            </span>
            <h2 style={{
              fontSize: 42,
              fontWeight: "bold",
              marginTop: 20,
              marginBottom: 20,
            }}>
              Bắt đầu hành trình <span style={{ color: "#ffd700" }}>tiếng Anh</span> ngay hôm nay
            </h2>
            <p style={{
              fontSize: 18,
              opacity: 0.9,
              lineHeight: 1.8,
              marginBottom: 30,
            }}>
              Đăng ký ngay để nhận tư vấn miễn phí và trải nghiệm học thử. 
              Ưu đãi giảm 30% cho 100 học viên đầu tiên!
            </p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { icon: "✓", text: "Tư vấn miễn phí 1-1" },
                { icon: "✓", text: "Học thử 1 buổi" },
                { icon: "✓", text: "Giảm 30% học phí" },
                { icon: "✓", text: "Tài liệu học tập miễn phí" },
              ].map((item, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 16,
                }}>
                  <span style={{
                    width: 28,
                    height: 28,
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                  }}>
                    {item.icon}
                  </span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right Form - Slide from right */}
          <div style={{
            background: "white",
            borderRadius: 25,
            padding: 40,
            boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
            opacity: animate ? 1 : 0,
            transform: animate ? "translateX(0)" : "translateX(100px)",
            transition: "all 0.8s ease-out",
            transitionDelay: "0.2s",
          }}>
            <h3 style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#1a1a2e",
              marginBottom: 8,
              textAlign: "center",
            }}>
              Đăng ký tư vấn
            </h3>
            <p style={{
              fontSize: 14,
              color: "#666",
              textAlign: "center",
              marginBottom: 30,
            }}>
              Điền thông tin để nhận tư vấn miễn phí
            </p>

            <form onSubmit={handleSubmit}>
              {/* Name Input */}
              <div style={{ marginBottom: 20 }}>
                <input
                  type="text"
                  name="name"
                  placeholder="Họ và tên"
                  value={formData.name}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    border: errors.name ? "2px solid #e53935" : "2px solid #eee",
                    borderRadius: 15,
                    fontSize: 15,
                    transition: "all 0.3s ease",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.name && (
                  <p style={{ color: "#e53935", fontSize: 13, marginTop: 8, margin: "8px 0 0" }}>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Phone & Email Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15, marginBottom: 20 }}>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Số điện thoại"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "16px 20px",
                      border: errors.phone ? "2px solid #e53935" : "2px solid #eee",
                      borderRadius: 15,
                      fontSize: 15,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {errors.phone && (
                    <p style={{ color: "#e53935", fontSize: 13, marginTop: 8, margin: "8px 0 0" }}>
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "16px 20px",
                      border: errors.email ? "2px solid #e53935" : "2px solid #eee",
                      borderRadius: 15,
                      fontSize: 15,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {errors.email && (
                    <p style={{ color: "#e53935", fontSize: 13, marginTop: 8, margin: "8px 0 0" }}>
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Course Select */}
              <div style={{ marginBottom: 20 }}>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    border: errors.course ? "2px solid #e53935" : "2px solid #eee",
                    borderRadius: 15,
                    fontSize: 15,
                    outline: "none",
                    background: "white",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  {courses.map((course, idx) => (
                    <option key={idx} value={course.value}>
                      {course.label}
                    </option>
                  ))}
                </select>
                {errors.course && (
                  <p style={{ color: "#e53935", fontSize: 13, marginTop: 8, margin: "8px 0 0" }}>
                    {errors.course}
                  </p>
                )}
              </div>

              {/* Message */}
              <div style={{ marginBottom: 25 }}>
                <textarea
                  name="message"
                  placeholder="Tin nhắn (tùy chọn)"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "16px 20px",
                    border: "2px solid #eee",
                    borderRadius: 15,
                    fontSize: 15,
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Error Message */}
              {submitError && (
                <div style={{
                  background: "#ffebee",
                  color: "#c62828",
                  padding: "12px 16px",
                  borderRadius: 10,
                  marginBottom: 20,
                  textAlign: "center",
                  fontSize: 14,
                }}>
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: "100%",
                  background: isLoading ? "#ccc" : "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                  color: "white",
                  border: "none",
                  padding: "18px",
                  fontSize: 16,
                  fontWeight: "bold",
                  borderRadius: 15,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: isLoading ? "none" : "0 10px 30px rgba(229, 57, 53, 0.4)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 15px 40px rgba(229, 57, 53, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 10px 30px rgba(229, 57, 53, 0.4)";
                  }
                }}
              >
                {isLoading ? "Đang gửi..." : "Đăng ký ngay"}
              </button>

              <p style={{
                fontSize: 12,
                color: "#999",
                textAlign: "center",
                marginTop: 15,
              }}>
                Bằng việc đăng ký, bạn đồng ý với chính sách bảo mật của NTA
              </p>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cta-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

export default CTAForm;
