import { useState, useEffect } from "react";
import { registerAffiliate, fetchBooks, fetchCategories, updateUserProfile, changePassword, generateAffiliateLink, getUserProfile } from "../api";

function Collab({ onAccessAffiliate }) {
  const [activeTab, setActiveTab] = useState("register");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    province: "",
    occupation: "",
    socialLink: "",
    reason: "",
    referralCode: "",
  });
  const [profileData, setProfileData] = useState({
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [productsLoading, setProductsLoading] = useState(false);
  const [affiliateLinks, setAffiliateLinks] = useState({});
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
      loadUserProfile();
    }
  }, []);

  // Load products when tab changes to share
  useEffect(() => {
    if (activeTab === "share" && products.length === 0) {
      loadProducts();
      loadCategories();
    }
  }, [activeTab]);

  // Lấy mã giới thiệu từ URL khi component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode }));
      // Lưu cookie 7 ngày
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `ref=${refCode}; expires=${expires.toUTCString()}; path=/`;
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const result = await getUserProfile();
      if (result.success && result.data) {
        setProfileData(prev => ({
          ...prev,
          phone: result.data.sdt || "",
        }));
      }
    } catch (error) {
      console.error("Lỗi tải thông tin người dùng:", error);
    }
  };

  const loadProducts = async () => {
    setProductsLoading(true);
    try {
      const books = await fetchBooks();
      const mappedProducts = books.map(book => ({
        id: book.id,
        name: book.ten_sach,
        category: book.loaiSach?.ten_loai?.toLowerCase() || "other",
        categoryId: book.loai_sach_id,
        description: book.mo_ta || "Sách luyện thi tiếng Anh",
        price: parseFloat(book.gia_ban),
        oldPrice: parseFloat(book.gia_ban) * 1.2,
        discount: 20,
        image: book.hinh_anh || "📚",
        tag: book.loaiSach?.ten_loai || "Sách",
        author: book.tac_gia || "NXB",
        publisher: book.nha_xuat_ban || "NXB",
        stock: book.so_luong_ton,
        commission: book.loaiSach?.ten_loai?.toLowerCase().includes("ielts") ? 10 : 5,
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error("Lỗi tải sách:", error);
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await fetchCategories();
      const allCategories = [
        { id: "all", ten_loai: "Tất cả", icon: "📚" },
        ...categoriesData.map(cat => ({
          id: cat.id,
          ten_loai: cat.ten_loai,
          icon: cat.ten_loai.toLowerCase().includes("ielts") ? "🎯" : 
                cat.ten_loai.toLowerCase().includes("toeic") ? "📝" : "💬"
        }))
      ];
      setCategories(allCategories);
    } catch (error) {
      console.error("Lỗi tải categories:", error);
      setCategories([
        { id: "all", ten_loai: "Tất cả", icon: "📚" },
        { id: 1, ten_loai: "Sách IELTS", icon: "🎯" },
        { id: 2, ten_loai: "Sách TOEIC", icon: "📝" },
        { id: 3, ten_loai: "Sách Giao tiếp", icon: "💬" },
      ]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập họ và tên" });
      return false;
    }
    if (!formData.phone.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập số điện thoại" });
      return false;
    }
    if (!formData.email.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập email" });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: "error", text: "Email không hợp lệ" });
      return false;
    }
    if (!formData.password) {
      setMessage({ type: "error", text: "Vui lòng nhập mật khẩu" });
      return false;
    }
    if (formData.password.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu phải có ít nhất 6 ký tự" });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp" });
      return false;
    }
    if (!formData.province) {
      setMessage({ type: "error", text: "Vui lòng chọn Tỉnh/Thành phố" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await registerAffiliate({
        ho_ten: formData.name,
        email: formData.email,
        mat_khau: formData.password,
        sdt: formData.phone,
        tinh_thanh: formData.province,
        nghe_nghiep: formData.occupation,
        link_mxh: formData.socialLink,
        ly_do: formData.reason,
        ma_gioi_thieu: formData.referralCode || null,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: "Đăng ký thành công! Vui lòng đăng nhập.",
        });
        setFormData({
          name: "",
          phone: "",
          email: "",
          password: "",
          confirmPassword: "",
          province: "",
          occupation: "",
          socialLink: "",
          reason: "",
          referralCode: "",
        });
        setTimeout(() => {
          if (window.navigateToAffiliate) {
            window.navigateToAffiliate("login");
          }
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: result.message || "Đăng ký thất bại",
        });
      }
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      setMessage({
        type: "error",
        text: "Có lỗi xảy ra. Vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!profileData.phone.trim()) {
      setMessage({ type: "error", text: "Vui lòng nhập số điện thoại" });
      return;
    }

    setLoading(true);
    try {
      const result = await updateUserProfile({ sdt: profileData.phone });
      if (result.success) {
        setMessage({ type: "success", text: "Cập nhật số điện thoại thành công!" });
      } else {
        setMessage({ type: "error", text: result.message || "Cập nhật thất bại" });
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      setMessage({ type: "error", text: "Có lỗi xảy ra. Vui lòng thử lại!" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!profileData.currentPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập mật khẩu hiện tại" });
      return;
    }
    if (!profileData.newPassword) {
      setMessage({ type: "error", text: "Vui lòng nhập mật khẩu mới" });
      return;
    }
    if (profileData.newPassword.length < 6) {
      setMessage({ type: "error", text: "Mật khẩu mới phải có ít nhất 6 ký tự" });
      return;
    }
    if (profileData.newPassword !== profileData.confirmNewPassword) {
      setMessage({ type: "error", text: "Mật khẩu xác nhận không khớp" });
      return;
    }

    setLoading(true);
    try {
      const result = await changePassword({
        mat_khau_cu: profileData.currentPassword,
        mat_khau_moi: profileData.newPassword,
      });
      if (result.success) {
        setMessage({ type: "success", text: "Đổi mật khẩu thành công!" });
        setProfileData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        }));
      } else {
        setMessage({ type: "error", text: result.message || "Đổi mật khẩu thất bại" });
      }
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      setMessage({ type: "error", text: "Có lỗi xảy ra. Vui lòng thử lại!" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async (productId) => {
    try {
      const result = await generateAffiliateLink(productId);
      if (result.success && result.data?.link) {
        setAffiliateLinks(prev => ({
          ...prev,
          [productId]: result.data.link,
        }));
        setMessage({ type: "success", text: "Tạo link affiliate thành công!" });
      } else {
        setMessage({ type: "error", text: result.message || "Tạo link thất bại" });
      }
    } catch (error) {
      console.error("Lỗi tạo link:", error);
      setMessage({ type: "error", text: "Có lỗi xảy ra. Vui lòng thử lại!" });
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    setMessage({ type: "success", text: "Đã sao chép link!" });
  };

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.categoryId === activeCategory);

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

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

  const tabs = [
    { id: "register", label: "Đăng ký CTV", icon: "📝" },
    { id: "profile", label: "Thông tin cá nhân", icon: "👤" },
    { id: "share", label: "Chia sẻ sản phẩm", icon: "🔗" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fff5f5 0%, #fff 100%)",
        paddingBottom: 60,
      }}
    >
      {/* Hero Section */}
      <section
        style={{
          padding: "80px 40px 40px",
          textAlign: "center",
        }}
      >
        <span
          style={{
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
          }}
        >
          🤝 Cộng tác viên
        </span>

        <h1
          style={{
            fontSize: 52,
            fontWeight: "800",
            color: "#1a1a2e",
            marginBottom: 20,
            lineHeight: 1.2,
            maxWidth: 800,
            margin: "0 auto 20px",
          }}
        >
          Trở thành <span style={{ color: "#e53935" }}>CTV bán sách</span> cùng
          NTA
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 30,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#555",
              fontSize: 16,
            }}
          >
            <span style={{ fontSize: 24 }}>💵</span>
            <span>Thu nhập thụ động</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#555",
              fontSize: 16,
            }}
          >
            <span style={{ fontSize: 24 }}>🏦</span>
            <span>Không cần vốn</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#555",
              fontSize: 16,
            }}
          >
            <span style={{ fontSize: 24 }}>📦</span>
            <span>Không nhập hàng</span>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section
        style={{
          padding: "0 40px",
          marginBottom: 40,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id 
                    ? "linear-gradient(135deg, #e53935 0%, #c62828 100%)" 
                    : "white",
                  color: activeTab === tab.id ? "white" : "#666",
                  border: activeTab === tab.id ? "none" : "2px solid #e0e0e0",
                  padding: "14px 28px",
                  borderRadius: 50,
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.borderColor = "#e53935";
                    e.target.style.color = "#e53935";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.borderColor = "#e0e0e0";
                    e.target.style.color = "#666";
                  }
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Message Display */}
      {message.text && (
        <section style={{ padding: "0 40px", marginBottom: 20 }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: 8,
                background: message.type === "error" ? "#ffebee" : "#e8f5e9",
                color: message.type === "error" ? "#c62828" : "#2e7d32",
                fontSize: 14,
                fontWeight: "500",
                textAlign: "center",
              }}
            >
              {message.text}
            </div>
          </div>
        </section>
      )}

      {/* Tab Content */}
      {activeTab === "register" && (
        <>
          {/* Benefits Section */}
          <section
            style={{
              padding: "40px 40px 60px",
            }}
          >
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: 32,
                  fontWeight: "800",
                  color: "#1a1a2e",
                  marginBottom: 40,
                }}
              >
                🎯 Lợi ích khi trở thành CTV
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 25,
                }}
              >
                {benefits.map((benefit, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "white",
                      borderRadius: 20,
                      padding: 30,
                      textAlign: "center",
                      boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 50px rgba(229, 57, 53, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 40px rgba(0, 0, 0, 0.08)";
                    }}
                  >
                    <div
                      style={{
                        fontSize: 48,
                        marginBottom: 20,
                      }}
                    >
                      {benefit.icon}
                    </div>
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#1a1a2e",
                        marginBottom: 12,
                      }}
                    >
                      {benefit.title}
                    </h3>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#666",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      {benefit.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Steps Section */}
          <section
            style={{
              padding: "40px 40px 60px",
              background: "#fff",
            }}
          >
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: 32,
                  fontWeight: "800",
                  color: "#1a1a2e",
                  marginBottom: 50,
                }}
              >
                📋 Quy trình tham gia
              </h2>

              <div
                style={{
                  textAlign: "center",
                  marginTop: 50,
                }}
              >
                <p
                  style={{
                    fontSize: 18,
                    color: "#555",
                    marginBottom: 25,
                  }}
                >
                  Sẵn sàng bắt đầu? Đăng ký ngay!
                </p>
                <button
                  onClick={() =>
                    document
                      .getElementById("collab-form")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  style={{
                    background:
                      "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
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
                    e.target.style.boxShadow =
                      "0 15px 40px rgba(229, 57, 53, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 10px 30px rgba(229, 57, 53, 0.4)";
                  }}
                >
                  🚀 Đăng ký ngay
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 25,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 50,
                    left: 80,
                    right: 80,
                    height: 2,
                    background:
                      "linear-gradient(90deg, #e53935 0%, #ff7043 100%)",
                    opacity: 0.3,
                  }}
                ></div>

                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      zIndex: 1,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: "50%",
                        background:
                          "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                        color: "white",
                        fontSize: 24,
                        fontWeight: "800",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 20px",
                        boxShadow: "0 10px 30px rgba(229, 57, 53, 0.3)",
                      }}
                    >
                      {step.number}
                    </div>

                    <div
                      style={{
                        background: "#fff5f5",
                        borderRadius: 16,
                        padding: 25,
                        border: "2px solid #ffe4e8",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 18,
                          fontWeight: "700",
                          color: "#1a1a2e",
                          marginBottom: 10,
                        }}
                      >
                        {step.title}
                      </h3>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#666",
                          lineHeight: 1.5,
                          margin: 0,
                        }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Registration Form Section */}
          <section
            id="collab-form"
            style={{
              padding: "60px 40px",
            }}
          >
            <div style={{ maxWidth: 600, margin: "0 auto" }}>
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                  borderRadius: "24px 24px 0 0",
                  padding: "30px 40px",
                  textAlign: "center",
                }}
              >
                <h2
                  style={{
                    color: "white",
                    fontSize: 26,
                    fontWeight: "800",
                    margin: 0,
                  }}
                >
                  📝 Đăng ký CTV ngay hôm nay
                </h2>
                <p
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontSize: 14,
                    marginTop: 8,
                  }}
                >
                  Tham gia cộng đồng CTV của NTA English Center
                </p>
              </div>

              <div
                style={{
                  background: "white",
                  borderRadius: "0 0 24px 24px",
                  padding: 40,
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
                }}
              >
                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 20 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#1a1a2e",
                        marginBottom: 8,
                      }}
                    >
                      👤 Họ và tên
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Nhập họ và tên"
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: "2px solid #e0e0e0",
                        fontSize: 15,
                        outline: "none",
                        transition: "all 0.3s ease",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 15,
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#1a1a2e",
                          marginBottom: 8,
                        }}
                      >
                        📱 Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Nhập SĐT"
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          borderRadius: 12,
                          border: "2px solid #e0e0e0",
                          fontSize: 15,
                          outline: "none",
                          transition: "all 0.3s ease",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#1a1a2e",
                          marginBottom: 8,
                        }}
                      >
                        📧 Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Nhập email"
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          borderRadius: 12,
                          border: "2px solid #e0e0e0",
                          fontSize: 15,
                          outline: "none",
                          transition: "all 0.3s ease",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 15,
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#1a1a2e",
                          marginBottom: 8,
                        }}
                      >
                        🔒 Mật khẩu
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Nhập mật khẩu"
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          borderRadius: 12,
                          border: "2px solid #e0e0e0",
                          fontSize: 15,
                          outline: "none",
                          transition: "all 0.3s ease",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#1a1a2e",
                          marginBottom: 8,
                        }}
                      >
                        🔒 Xác nhận mật khẩu
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Nhập lại mật khẩu"
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          borderRadius: 12,
                          border: "2px solid #e0e0e0",
                          fontSize: 15,
                          outline: "none",
                          transition: "all 0.3s ease",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 15,
                      marginBottom: 20,
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#1a1a2e",
                          marginBottom: 8,
                        }}
                      >
                        🏙️ Tỉnh/Thành
                      </label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        style={{
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
                        onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                      >
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
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#1a1a2e",
                          marginBottom: 8,
                        }}
                      >
                        💼 Nghề nghiệp
                      </label>
                      <select
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        style={{
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
                        onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                      >
                        <option value="">Chọn nghề nghiệp</option>
                        <option value="student">Học sinh/Sinh viên</option>
                        <option value="teacher">Giáo viên</option>
                        <option value="employee">Nhân viên văn phòng</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#1a1a2e",
                        marginBottom: 8,
                      }}
                    >
                      🎁 Mã giới thiệu (nếu có)
                    </label>
                    <input
                      type="text"
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={handleInputChange}
                      placeholder="Nhập mã giới thiệu"
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: "2px solid #e0e0e0",
                        fontSize: 15,
                        outline: "none",
                        transition: "all 0.3s ease",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                    />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#1a1a2e",
                        marginBottom: 8,
                      }}
                    >
                      🔗 Link Facebook/Zalo
                    </label>
                    <input
                      type="text"
                      name="socialLink"
                      value={formData.socialLink}
                      onChange={handleInputChange}
                      placeholder="Nhập link Facebook hoặc Zalo"
                      style={{
                        width: "100%",
                        padding: "14px 18px",
                        borderRadius: 12,
                        border: "2px solid #e0e0e0",
                        fontSize: 15,
                        outline: "none",
                        transition: "all 0.3s ease",
                        boxSizing: "border-box",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                    />
                  </div>

                  <div style={{ marginBottom: 30 }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: 14,
                        fontWeight: "600",
                        color: "#1a1a2e",
                        marginBottom: 8,
                      }}
                    >
                      ✍️ Lý do muốn trở thành CTV
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      placeholder="Chia sẻ lý do bạn muốn tham gia..."
                      rows={4}
                      style={{
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
                      onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                      onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: "100%",
                      background: loading
                        ? "#ccc"
                        : "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                      color: "white",
                      border: "none",
                      padding: "18px 40px",
                      fontSize: 18,
                      fontWeight: "700",
                      borderRadius: 50,
                      cursor: loading ? "not-allowed" : "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: loading
                        ? "none"
                        : "0 10px 30px rgba(229, 57, 53, 0.4)",
                    }}
                    onMouseEnter={(e) => {
                      if (!loading) {
                        e.target.style.transform = "translateY(-3px)";
                        e.target.style.boxShadow =
                          "0 15px 40px rgba(229, 57, 53, 0.5)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!loading) {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 10px 30px rgba(229, 57, 53, 0.4)";
                      }
                    }}
                  >
                    {loading ? "Đang xử lý..." : "🚀 Đăng ký làm CTV"}
                  </button>
                </form>

                {onAccessAffiliate && (
                  <div
                    style={{
                      marginTop: 25,
                      textAlign: "center",
                      paddingTop: 20,
                      borderTop: "1px dashed #ddd",
                    }}
                  >
                    <p style={{ fontSize: 14, color: "#666", marginBottom: 15 }}>
                      Đã có tài khoản CTV?
                    </p>
                    <button
                      onClick={() =>
                        window.navigateToAffiliate && window.navigateToAffiliate("login")
                      }
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
        </>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <section style={{ padding: "40px 40px 60px" }}>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            {!isLoggedIn ? (
              <div
                style={{
                  background: "white",
                  borderRadius: 24,
                  padding: 60,
                  textAlign: "center",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
                }}
              >
                <span style={{ fontSize: 60, display: "block", marginBottom: 20 }}>🔒</span>
                <h3 style={{ fontSize: 24, color: "#1a1a2e", marginBottom: 15 }}>
                  Vui lòng đăng nhập
                </h3>
                <p style={{ color: "#666", marginBottom: 25 }}>
                  Bạn cần đăng nhập để quản lý thông tin cá nhân
                </p>
                <button
                  onClick={() => window.navigateToAffiliate && window.navigateToAffiliate("login")}
                  style={{
                    background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                    color: "white",
                    border: "none",
                    padding: "16px 40px",
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
                  📊 Đăng nhập ngay
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
                {/* Update Phone */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 24,
                    padding: 40,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: "800",
                      color: "#1a1a2e",
                      marginBottom: 25,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    📱 Cập nhật số điện thoại
                  </h3>
                  <form onSubmit={handleUpdatePhone}>
                    <div style={{ marginBottom: 20 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#1a1a2e",
                          marginBottom: 8,
                        }}
                      >
                        Số điện thoại mới
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder="Nhập số điện thoại mới"
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          borderRadius: 12,
                          border: "2px solid #e0e0e0",
                          fontSize: 15,
                          outline: "none",
                          transition: "all 0.3s ease",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: "100%",
                        background: loading
                          ? "#ccc"
                          : "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                        color: "white",
                        border: "none",
                        padding: "14px",
                        fontSize: 15,
                        fontWeight: "700",
                        borderRadius: 12,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {loading ? "Đang xử lý..." : "Cập nhật SĐT"}
                    </button>
                  </form>
                </div>

                {/* Change Password */}
                <div
                  style={{
                    background: "white",
                    borderRadius: 24,
                    padding: 40,
                    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: 22,
                      fontWeight: "800",
                      color: "#1a1a2e",
                      marginBottom: 25,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    🔒 Đổi mật khẩu
                  </h3>
                  <form onSubmit={handleChangePassword}>
                    <div style={{ marginBottom: 15 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#1a1a2e",
                          marginBottom: 8,
                        }}
                      >
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={profileData.currentPassword}
                        onChange={handleProfileChange}
                        placeholder="Nhập mật khẩu hiện tại"
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          borderRadius: 12,
                          border: "2px solid #e0e0e0",
                          fontSize: 15,
                          outline: "none",
                          transition: "all 0.3s ease",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                      />
                    </div>
                    <div style={{ marginBottom: 15 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#1a1a2e",
                          marginBottom: 8,
                        }}
                      >
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={profileData.newPassword}
                        onChange={handleProfileChange}
                        placeholder="Nhập mật khẩu mới"
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          borderRadius: 12,
                          border: "2px solid #e0e0e0",
                          fontSize: 15,
                          outline: "none",
                          transition: "all 0.3s ease",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                      />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <label
                        style={{
                          display: "block",
                          fontSize: 14,
                          fontWeight: "600",
                          color: "#1a1a2e",
                          marginBottom: 8,
                        }}
                      >
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        name="confirmNewPassword"
                        value={profileData.confirmNewPassword}
                        onChange={handleProfileChange}
                        placeholder="Nhập lại mật khẩu mới"
                        style={{
                          width: "100%",
                          padding: "14px 18px",
                          borderRadius: 12,
                          border: "2px solid #e0e0e0",
                          fontSize: 15,
                          outline: "none",
                          transition: "all 0.3s ease",
                          boxSizing: "border-box",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#e53935")}
                        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        width: "100%",
                        background: loading
                          ? "#ccc"
                          : "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                        color: "white",
                        border: "none",
                        padding: "14px",
                        fontSize: 15,
                        fontWeight: "700",
                        borderRadius: 12,
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Share Products Tab */}
      {activeTab === "share" && (
        <section style={{ padding: "40px 40px 60px" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto" }}>
            {!isLoggedIn ? (
              <div
                style={{
                  background: "white",
                  borderRadius: 24,
                  padding: 60,
                  textAlign: "center",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
                }}
              >
                <span style={{ fontSize: 60, display: "block", marginBottom: 20 }}>🔒</span>
                <h3 style={{ fontSize: 24, color: "#1a1a2e", marginBottom: 15 }}>
                  Vui lòng đăng nhập
                </h3>
                <p style={{ color: "#666", marginBottom: 25 }}>
                  Bạn cần đăng nhập để chia sẻ sản phẩm và nhận hoa hồng
                </p>
                <button
                  onClick={() => window.navigateToAffiliate && window.navigateToAffiliate("login")}
                  style={{
                    background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                    color: "white",
                    border: "none",
                    padding: "16px 40px",
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
                  📊 Đăng nhập ngay
                </button>
              </div>
            ) : (
              <>
                {/* Category Filter */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 40,
                    justifyContent: "center",
                  }}
                >
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      style={{
                        background: activeCategory === cat.id 
                          ? "linear-gradient(135deg, #e53935 0%, #c62828 100%)" 
                          : "white",
                        color: activeCategory === cat.id ? "white" : "#666",
                        border: activeCategory === cat.id ? "none" : "2px solid #e0e0e0",
                        padding: "10px 24px",
                        borderRadius: 50,
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                      onMouseEnter={(e) => {
                        if (activeCategory !== cat.id) {
                          e.target.style.borderColor = "#e53935";
                          e.target.style.color = "#e53935";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeCategory !== cat.id) {
                          e.target.style.borderColor = "#e0e0e0";
                          e.target.style.color = "#666";
                        }
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.ten_loai}</span>
                    </button>
                  ))}
                </div>

                {/* Product Count */}
                <p
                  style={{
                    fontSize: 14,
                    color: "#888",
                    marginBottom: 20,
                    textAlign: "center",
                  }}
                >
                  Hiển thị {filteredProducts.length} sản phẩm
                </p>

                {/* Loading State */}
                {productsLoading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                    }}
                  >
                    <div style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
                    <div style={{ fontSize: 18, color: "#666" }}>Đang tải sản phẩm...</div>
                  </div>
                ) : (
                  /* Product Grid */
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 25,
                    }}
                  >
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        style={{
                          background: "white",
                          borderRadius: 20,
                          overflow: "hidden",
                          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-8px)";
                          e.currentTarget.style.boxShadow = "0 20px 50px rgba(229, 57, 53, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.08)";
                        }}
                      >
                        {/* Image Area */}
                        <div
                          style={{
                            position: "relative",
                            height: 180,
                            background: "linear-gradient(135deg, #fff5f5 0%, #ffe4e8 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {/* Category Tag */}
                          <span
                            style={{
                              position: "absolute",
                              top: 15,
                              left: 15,
                              background: "#1a1a2e",
                              color: "white",
                              padding: "5px 12px",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: "700",
                              textTransform: "uppercase",
                            }}
                          >
                            {product.tag}
                          </span>

                          {/* Commission Badge */}
                          <span
                            style={{
                              position: "absolute",
                              top: 15,
                              right: 15,
                              background: product.commission === 10 ? "#4caf50" : "#ff9800",
                              color: "white",
                              padding: "5px 12px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: "700",
                            }}
                          >
                            {product.commission}% hoa hồng
                          </span>

                          {/* Product Image */}
                          {product.image && product.image.includes('.') ? (
                            <img
                              src={`http://localhost:5000/uploads/${product.image}`}
                              alt={product.name}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                borderRadius: 8,
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          ) : null}
                          <span
                            style={{
                              fontSize: 60,
                              display: (product.image && product.image.includes('.')) ? 'none' : 'block'
                            }}
                          >
                            {product.image || '📚'}
                          </span>
                        </div>

                        {/* Content */}
                        <div style={{ padding: 20 }}>
                          <h3
                            style={{
                              fontSize: 16,
                              fontWeight: "700",
                              color: "#1a1a2e",
                              marginBottom: 8,
                              lineHeight: 1.3,
                            }}
                          >
                            {product.name}
                          </h3>

                          <p
                            style={{
                              fontSize: 13,
                              color: "#888",
                              marginBottom: 15,
                              lineHeight: 1.4,
                            }}
                          >
                            {product.description}
                          </p>

                          {/* Price */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: 10,
                              marginBottom: 15,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 20,
                                fontWeight: "800",
                                color: "#e53935",
                              }}
                            >
                              {formatPrice(product.price)}
                            </span>
                            <span
                              style={{
                                fontSize: 14,
                                color: "#999",
                                textDecoration: "line-through",
                              }}
                            >
                              {formatPrice(product.oldPrice)}
                            </span>
                          </div>

                          {/* Commission Info */}
                          <div
                            style={{
                              background: "#f5f5f5",
                              borderRadius: 10,
                              padding: "10px 15px",
                              marginBottom: 15,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span style={{ fontSize: 13, color: "#666" }}>
                              Hoa hồng dự kiến:
                            </span>
                            <span
                              style={{
                                fontSize: 16,
                                fontWeight: "700",
                                color: product.commission === 10 ? "#4caf50" : "#ff9800",
                              }}
                            >
                              {formatPrice(product.price * product.commission / 100)}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ display: "flex", gap: 10 }}>
                            {!affiliateLinks[product.id] ? (
                              <button
                                onClick={() => handleGenerateLink(product.id)}
                                style={{
                                  flex: 1,
                                  background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                                  color: "white",
                                  border: "none",
                                  padding: "12px",
                                  borderRadius: 12,
                                  fontSize: 14,
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  transition: "all 0.3s ease",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 8,
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.transform = "scale(1.02)";
                                  e.target.style.boxShadow = "0 8px 20px rgba(229, 57, 53, 0.4)";
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = "scale(1)";
                                  e.target.style.boxShadow = "none";
                                }}
                              >
                                🔗 Tạo link
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleCopyLink(affiliateLinks[product.id])}
                                  style={{
                                    flex: 1,
                                    background: "linear-gradient(135deg, #4caf50 0%, #388e3c 100%)",
                                    color: "white",
                                    border: "none",
                                    padding: "12px",
                                    borderRadius: 12,
                                    fontSize: 14,
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = "scale(1.02)";
                                    e.target.style.boxShadow = "0 8px 20px rgba(76, 175, 80, 0.4)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = "scale(1)";
                                    e.target.style.boxShadow = "none";
                                  }}
                                >
                                  📋 Sao chép link
                                </button>
                                <button
                                  onClick={() => {
                                    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(affiliateLinks[product.id])}`;
                                    window.open(shareUrl, '_blank');
                                  }}
                                  style={{
                                    background: "#1877f2",
                                    color: "white",
                                    border: "none",
                                    padding: "12px",
                                    borderRadius: 12,
                                    fontSize: 14,
                                    fontWeight: "700",
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.transform = "scale(1.02)";
                                    e.target.style.boxShadow = "0 8px 20px rgba(24, 119, 242, 0.4)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = "scale(1)";
                                    e.target.style.boxShadow = "none";
                                  }}
                                >
                                  📘
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {!productsLoading && filteredProducts.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "60px 20px",
                    }}
                  >
                    <span style={{ fontSize: 60, display: "block", marginBottom: 20 }}>📭</span>
                    <h3 style={{ fontSize: 20, color: "#1a1a2e", marginBottom: 10 }}>
                      Không tìm thấy sản phẩm
                    </h3>
                    <p style={{ color: "#888" }}>
                      Vui lòng chọn danh mục khác
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1024px) {
          [style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          [style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
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
