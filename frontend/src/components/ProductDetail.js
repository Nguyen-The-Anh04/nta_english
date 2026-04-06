import { useState, useEffect } from "react";
import CartDrawer from "./CartDrawer";
import CheckoutDrawer from "./CheckoutDrawer";
import ReviewSection from "./ReviewSection";
import { fetchKhuyenMai, apDungKhuyenMai } from "../api";

function ProductDetail({ product, onBack, relatedProducts = [], onViewProduct }) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [activeTab, setActiveTab] = useState("description");
  const [khuyenMai, setKhuyenMai] = useState([]);
  const [appliedKhuyenMai, setAppliedKhuyenMai] = useState(null);
  const [maKhuyenMai, setMaKhuyenMai] = useState("");
  const [giamGia, setGiamGia] = useState(0);

  // Product images - generate different images for thumbnails
  const generateProductImages = (imageName) => {
    if (!imageName || !imageName.includes('.')) {
      return [imageName, imageName, imageName, imageName];
    }
    
    // Extract base name and extension
    const lastDotIndex = imageName.lastIndexOf('.');
    const baseName = imageName.substring(0, lastDotIndex);
    const extension = imageName.substring(lastDotIndex);
    
    // Extract number from base name (e.g., 'ielts1' -> 'ielts', 1)
    const match = baseName.match(/^([a-zA-Z]+)(\d+)$/);
    if (!match) {
      return [imageName, imageName, imageName, imageName];
    }
    
    const prefix = match[1];
    const startNum = parseInt(match[2]);
    
    // Generate 4 different images by incrementing the number
    // Use different extensions for different images to match actual files
    const extensions = ['.jpeg', '.jfif', '.jfif', '.jfif'];
    const images = [];
    for (let i = 0; i < 4; i++) {
      const newNum = startNum + i;
      const ext = i === 0 ? extension : extensions[i];
      images.push(`${prefix}${newNum}${ext}`);
    }
    
    return images;
  };

  const productImages = generateProductImages(product.image);

  // Fetch promotions when component mounts
  useEffect(() => {
    const loadKhuyenMai = async () => {
      try {
        const data = await fetchKhuyenMai({ trang_thai: 'hoat_dong' });
        setKhuyenMai(data || []);
      } catch (error) {
        console.error("Lỗi tải khuyến mại:", error);
      }
    };
    loadKhuyenMai();
  }, []);

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  const addToCart = (product, qty = 1) => {
    const cartItem = {
      ...product,
      quantity: qty,
      khuyen_mai: appliedKhuyenMai,
      giam_gia: giamGia,
      gia_sau_giam: product.price * qty - giamGia,
    };
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, cartItem];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const handleApDungKhuyenMai = async () => {
    if (!maKhuyenMai.trim()) {
      alert("Vui lòng nhập mã khuyến mại");
      return;
    }

    try {
      const result = await apDungKhuyenMai({
        ma_khoa: maKhuyenMai,
        tong_tien: product.price * quantity,
        so_luong: quantity,
        danh_muc_id: product.categoryId,
        san_pham_id: product.id,
      });

      if (result.success) {
        setAppliedKhuyenMai(result.data.khuyen_mai);
        setGiamGia(result.data.giam_gia);
        alert("Áp dụng khuyến mại thành công!");
      } else {
        alert(result.message || "Không thể áp dụng khuyến mại");
      }
    } catch (error) {
      console.error("Lỗi áp dụng khuyến mại:", error);
      alert("Lỗi khi áp dụng khuyến mại");
    }
  };

  const handleHuyKhuyenMai = () => {
    setAppliedKhuyenMai(null);
    setGiamGia(0);
    setMaKhuyenMai("");
  };

  const renderStars = (rating) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Header */}
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: "white",
          boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
          padding: "0 40px",
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 70,
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            onClick={onBack}
          >
            <span style={{ fontSize: 18, fontWeight: "bold", color: "#e53935" }}>
              ← Quay lại
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>📚</span>
            <span style={{ fontSize: 22, fontWeight: "800", color: "#1a1a2e" }}>
              NTA <span style={{ color: "#e53935" }}>Books</span>
            </span>
          </div>

          <div
            onClick={() => setCartOpen(true)}
            style={{ position: "relative", cursor: "pointer", padding: "10px" }}
          >
            <span style={{ fontSize: 28 }}>🛒</span>
            {cart.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: "#e53935",
                  color: "white",
                  fontSize: 12,
                  fontWeight: "bold",
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ marginTop: 90, padding: "30px 40px 60px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          
          {/* 🧩 1. BREADCRUMBS */}
          <div style={{ marginBottom: 25 }}>
            <nav style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
              <span 
                style={{ color: "#666", cursor: "pointer" }}
                onClick={() => window.navigateTo("/")}
              >
                Trang chủ
              </span>
              <span style={{ color: "#999" }}>/</span>
              <span 
                style={{ color: "#666", cursor: "pointer" }}
                onClick={() => window.navigateTo("/shop")}
              >
                {product.category || "Sách"}
              </span>
              <span style={{ color: "#999" }}>/</span>
              <span style={{ color: "#e53935", fontWeight: "600" }}>{product.name}</span>
            </nav>
          </div>

          {/* 🧩 2. HERO PRODUCT SECTION - Layout 2 cột */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 50,
              marginBottom: 40,
            }}
          >
            {/* CỘT TRÁI: Hình ảnh sản phẩm */}
            <div>
              {/* Ảnh chính */}
              <div
                style={{
                  position: "relative",
                  background: "white",
                  borderRadius: 20,
                  overflow: "hidden",
                  marginBottom: 15,
                  cursor: isZoomed ? "zoom-out" : "zoom-in",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <div
                  style={{
                    height: 450,
                    background: "linear-gradient(135deg, #fff5f5 0%, #ffe4e8 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transform: isZoomed ? "scale(1.5)" : "scale(1)",
                    transition: "transform 0.3s ease",
                  }}
                >
                  {product.image && product.image.includes('.') ? (
                    <img 
                      src={`http://localhost:5000/uploads/${product.image}`} 
                      alt={product.name}
                      style={{
                        maxWidth: '80%',
                        maxHeight: '80%',
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <span 
                    style={{ 
                      fontSize: 180,
                      display: (product.image && product.image.includes('.')) ? 'none' : 'block'
                    }}
                  >
                    {productImages[activeImage]}
                  </span>
                </div>
                {/* Discount Badge */}
                <span
                  style={{
                    position: "absolute",
                    top: 20,
                    left: 20,
                    background: "#e53935",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontSize: 14,
                    fontWeight: "700",
                  }}
                >
                  -{product.discount}%
                </span>
              </div>

              {/* Thumbnail nhỏ */}
              <div style={{ display: "flex", gap: 10 }}>
                {productImages.slice(0, 3).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    style={{
                      width: 80,
                      height: 80,
                      background:
                        activeImage === idx
                          ? "linear-gradient(135deg, #e53935 0%, #c62828 100%)"
                          : "white",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: activeImage === idx ? "none" : "2px solid #e0e0e0",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      overflow: "hidden",
                    }}
                  >
                    {img && img.includes('.') ? (
                      <img 
                        src={`http://localhost:5000/uploads/${img}`} 
                        alt={`Thumbnail ${idx + 1}`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span 
                      style={{ 
                        fontSize: 35,
                        display: (img && img.includes('.')) ? 'none' : 'block'
                      }}
                    >
                      {img || '📚'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CỘT PHẢI: Thông tin chính */}
            <div>
              {/* Tên sách */}
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: "#1a1a2e",
                  marginBottom: 15,
                  lineHeight: 1.3,
                }}
              >
                {product.name}
              </h1>

              {/* Thông tin cơ bản */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#666", fontSize: 14 }}>Tác giả:</span>
                    <span style={{ color: "#1a1a2e", fontWeight: "600", fontSize: 14 }}>
                      {product.author || "Đang cập nhật"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#666", fontSize: 14 }}>Nhà xuất bản:</span>
                    <span style={{ color: "#1a1a2e", fontWeight: "600", fontSize: 14 }}>
                      {product.publisher || "Đang cập nhật"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#666", fontSize: 14 }}>Mã sách:</span>
                    <span style={{ color: "#1a1a2e", fontWeight: "600", fontSize: 14 }}>
                      {product.id || "N/A"}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#666", fontSize: 14 }}>Danh mục:</span>
                    <span 
                      style={{ 
                        color: "#e53935", 
                        fontWeight: "600", 
                        fontSize: 14,
                        background: "#fff5f5",
                        padding: "2px 10px",
                        borderRadius: 12,
                      }}
                    >
                      {product.tag || product.category || "Sách"}
                    </span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#666", fontSize: 14 }}>Trạng thái:</span>
                    <span 
                      style={{ 
                        color: "#4CAF50", 
                        fontWeight: "600", 
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: "50%", 
                        background: "#4CAF50",
                        display: "inline-block",
                      }}></span>
                      Còn hàng
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#666", fontSize: 14 }}>Số lượng tồn:</span>
                    <span style={{ color: "#1a1a2e", fontWeight: "600", fontSize: 14 }}>
                      {product.stock || 0} sản phẩm
                    </span>
                  </div>
                </div>
              </div>

              {/* Giá */}
              <div 
                style={{ 
                  background: "linear-gradient(135deg, #fff5f5 0%, #ffe4e8 100%)",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 25,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 15, marginBottom: 10 }}>
                  <span
                    style={{
                      fontSize: 36,
                      fontWeight: "800",
                      color: "#e53935",
                    }}
                  >
                    {formatPrice(product.price * quantity - giamGia)}
                  </span>
                  {giamGia > 0 && (
                    <span
                      style={{
                        fontSize: 18,
                        color: "#999",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatPrice(product.price * quantity)}
                    </span>
                  )}
                  {product.oldPrice && !giamGia && (
                    <span
                      style={{
                        fontSize: 18,
                        color: "#999",
                        textDecoration: "line-through",
                      }}
                    >
                      {formatPrice(product.oldPrice * quantity)}
                    </span>
                  )}
                </div>
                {product.oldPrice && (
                  <span
                    style={{
                      fontSize: 14,
                      color: "#e53935",
                      fontWeight: "600",
                      background: "white",
                      padding: "4px 12px",
                      borderRadius: 20,
                    }}
                  >
                    Tiết kiệm {formatPrice(product.oldPrice - product.price)} ({product.discount}%)
                  </span>
                )}
              </div>

              {/* Khuyến mại */}
              <div style={{ marginBottom: 25 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 15 }}>
                  <span style={{ fontSize: 14, fontWeight: "600", color: "#666" }}>Mã khuyến mại:</span>
                  <input
                    type="text"
                    value={maKhuyenMai}
                    onChange={(e) => setMaKhuyenMai(e.target.value)}
                    placeholder="Nhập mã khuyến mại"
                    style={{
                      flex: 1,
                      padding: "10px 15px",
                      borderRadius: 8,
                      border: "2px solid #e0e0e0",
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={handleApDungKhuyenMai}
                    style={{
                      padding: "10px 20px",
                      background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: "600",
                      cursor: "pointer",
                    }}
                  >
                    Áp dụng
                  </button>
                </div>
                {appliedKhuyenMai && (
                  <div style={{
                    background: "#e8f5e9",
                    borderRadius: 8,
                    padding: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <div>
                      <span style={{ color: "#2e7d32", fontWeight: "600", fontSize: 14 }}>
                        ✓ {appliedKhuyenMai.ten_khoa}
                      </span>
                      <span style={{ color: "#666", fontSize: 12, marginLeft: 10 }}>
                        Giảm: {formatPrice(giamGia)}
                      </span>
                    </div>
                    <button
                      onClick={handleHuyKhuyenMai}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#c62828",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>

              {/* Số lượng */}
              <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 25 }}>
                <span style={{ fontSize: 14, fontWeight: "600", color: "#666" }}>Số lượng:</span>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "white",
                    borderRadius: 12,
                    border: "2px solid #e0e0e0",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{
                      width: 45,
                      height: 45,
                      border: "none",
                      background: "#f8f9fa",
                      cursor: "pointer",
                      fontSize: 20,
                      color: "#666",
                    }}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    style={{
                      width: 60,
                      height: 45,
                      border: "none",
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: "600",
                      outline: "none",
                    }}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    style={{
                      width: 45,
                      height: 45,
                      border: "none",
                      background: "#f8f9fa",
                      cursor: "pointer",
                      fontSize: 20,
                      color: "#666",
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTA Buttons */}
              <div style={{ display: "flex", gap: 15, marginBottom: 25 }}>
                <button
                  onClick={() => addToCart(product, quantity)}
                  style={{
                    flex: 1,
                    padding: "16px 24px",
                    background: "white",
                    color: "#e53935",
                    border: "2px solid #e53935",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#e53935";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "white";
                    e.target.style.color = "#e53935";
                  }}
                >
                  🛒 Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  style={{
                    flex: 1,
                    padding: "16px 24px",
                    background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 15,
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
                    e.target.style.boxShadow = "0 10px 30px rgba(229, 57, 53, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  ⚡ Mua ngay
                </button>
              </div>

              {/* Thông tin giao hàng */}
              <div
                style={{
                  background: "#f8f9fa",
                  borderRadius: 12,
                  padding: 15,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>🚚</span>
                    <span style={{ fontSize: 14, color: "#444" }}>Giao hàng toàn quốc trong 2-3 ngày</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>🔄</span>
                    <span style={{ fontSize: 14, color: "#444" }}>Đổi trả miễn phí trong 7 ngày</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>💵</span>
                    <span style={{ fontSize: 14, color: "#444" }}>Thanh toán khi nhận hàng (COD)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🧩 3. TABS THÔNG TIN */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              marginBottom: 40,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}
          >
            {/* Tab Headers */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              {[
                { id: "description", label: "Mô tả chi tiết" },
                { id: "specs", label: "Thông số kỹ thuật" },
                { id: "reviews", label: "Đánh giá & Bình luận" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: "18px 24px",
                    background: activeTab === tab.id ? "white" : "#f8f9fa",
                    border: "none",
                    borderBottom: activeTab === tab.id ? "3px solid #e53935" : "3px solid transparent",
                    fontSize: 15,
                    fontWeight: activeTab === tab.id ? "700" : "600",
                    color: activeTab === tab.id ? "#e53935" : "#666",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: 30 }}>
              {/* Tab 1: Mô tả chi tiết */}
              {activeTab === "description" && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e", marginBottom: 20 }}>
                    Giới thiệu sách
                  </h3>
                  <p style={{ fontSize: 15, color: "#444", lineHeight: 1.8, marginBottom: 25 }}>
                    {product.description || "Sách luyện thi tiếng Anh chất lượng cao, được biên soạn bởi các chuyên gia hàng đầu. Nội dung bám sát format thi mới nhất, giúp bạn đạt điểm cao trong kỳ thi."}
                  </p>

                  <h4 style={{ fontSize: 16, fontWeight: "700", color: "#1a1a2e", marginBottom: 15 }}>
                    Nội dung học được:
                  </h4>
                  <ul style={{ marginBottom: 25, paddingLeft: 20 }}>
                    {[
                      "Chiến lược làm bài hiệu quả cho từng phần thi",
                      "Từ vựng và ngữ pháp theo chủ đề thường gặp",
                      "Luyện tập với các đề thi thực tế",
                      "Hướng dẫn quản lý thời gian làm bài",
                      "Mẫu câu và cấu trúc hay sử dụng",
                      "Giải thích chi tiết đáp án",
                    ].map((item, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: 14,
                          color: "#444",
                          marginBottom: 10,
                          lineHeight: 1.6,
                        }}
                      >
                        <span style={{ color: "#e53935", marginRight: 8 }}>✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <h4 style={{ fontSize: 16, fontWeight: "700", color: "#1a1a2e", marginBottom: 15 }}>
                    Phù hợp với:
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {["Người mới bắt đầu", "Học sinh lớp 12", "Sinh viên", "Người đi làm"].map(
                      (item, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: "#f8f9fa",
                            padding: "8px 16px",
                            borderRadius: 20,
                            fontSize: 13,
                            color: "#666",
                            border: "1px solid #e0e0e0",
                          }}
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Thông số kỹ thuật */}
              {activeTab === "specs" && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e", marginBottom: 20 }}>
                    Thông số kỹ thuật
                  </h3>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      {[
                        { label: "Tác giả", value: product.author || "Đang cập nhật" },
                        { label: "Nhà xuất bản", value: product.publisher || "Đang cập nhật" },
                        { label: "Năm xuất bản", value: "2024" },
                        { label: "Số trang", value: product.pages || "300 trang" },
                        { label: "Ngôn ngữ", value: "Tiếng Anh / Tiếng Việt" },
                        { label: "Kích thước", value: product.dimensions || "21 x 29.7 cm" },
                        { label: "Loại bìa", value: "Bìa mềm" },
                        { label: "Trọng lượng", value: product.weight || "500g" },
                        { label: "Mã ISBN", value: "978-604-XXXX-XX-X" },
                        { label: "Danh mục", value: product.tag || product.category || "Sách luyện thi" },
                      ].map((spec, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: 14,
                              color: "#666",
                              fontWeight: "600",
                              width: "35%",
                              background: "#fafafa",
                            }}
                          >
                            {spec.label}
                          </td>
                          <td
                            style={{
                              padding: "14px 20px",
                              fontSize: 14,
                              color: "#1a1a2e",
                            }}
                          >
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Đánh giá & Bình luận */}
              {activeTab === "reviews" && (
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: "700", color: "#1a1a2e", marginBottom: 20 }}>
                    Đánh giá từ khách hàng
                  </h3>
                  
                  {/* Rating Summary */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 30,
                      marginBottom: 30,
                      padding: 25,
                      background: "#f8f9fa",
                      borderRadius: 16,
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 48, fontWeight: "800", color: "#1a1a2e" }}>4.8</div>
                      <div style={{ fontSize: 20, marginBottom: 5 }}>{renderStars(5)}</div>
                      <div style={{ fontSize: 13, color: "#888" }}>0 đánh giá</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div
                          key={star}
                          style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}
                        >
                          <span style={{ fontSize: 12, color: "#666", width: 15 }}>{star}</span>
                          <span style={{ color: "#e53935" }}>⭐</span>
                          <div
                            style={{
                              flex: 1,
                              height: 8,
                              background: "#e0e0e0",
                              borderRadius: 4,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: star === 5 ? "70%" : star === 4 ? "20%" : "10%",
                                height: "100%",
                                background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                                borderRadius: 4,
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews Section */}
                  <ReviewSection bookId={product.id} bookName={product.name} />
                </div>
              )}
            </div>
          </div>

          {/* 🧩 4. CHÍNH SÁCH */}
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 30,
              marginBottom: 40,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30 }}>
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div
                  style={{
                    width: 70,
                    height: 70,
                    background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 15px",
                  }}
                >
                  <span style={{ fontSize: 32 }}>🚚</span>
                </div>
                <h4 style={{ fontSize: 16, fontWeight: "700", color: "#1a1a2e", marginBottom: 8 }}>
                  Giao hàng toàn quốc
                </h4>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
                  Giao hàng nhanh chóng trong 2-3 ngày, freeship đơn từ 200K
                </p>
              </div>
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div
                  style={{
                    width: 70,
                    height: 70,
                    background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 15px",
                  }}
                >
                  <span style={{ fontSize: 32 }}>🔄</span>
                </div>
                <h4 style={{ fontSize: 16, fontWeight: "700", color: "#1a1a2e", marginBottom: 8 }}>
                  Đổi trả 7 ngày
                </h4>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
                  Đổi trả miễn phí trong 7 ngày nếu sản phẩm lỗi hoặc không đúng mô tả
                </p>
              </div>
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div
                  style={{
                    width: 70,
                    height: 70,
                    background: "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 15px",
                  }}
                >
                  <span style={{ fontSize: 32 }}>💵</span>
                </div>
                <h4 style={{ fontSize: 16, fontWeight: "700", color: "#1a1a2e", marginBottom: 8 }}>
                  Thanh toán COD
                </h4>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
                  Thanh toán khi nhận hàng, an toàn và tiện lợi
                </p>
              </div>
            </div>
          </div>

          {/* 🧩 5. SẢN PHẨM LIÊN QUAN */}
          <div>
            <h2
              style={{
                fontSize: 24,
                fontWeight: "800",
                color: "#1a1a2e",
                marginBottom: 30,
                position: "relative",
                paddingBottom: 15,
              }}
            >
              Sản phẩm liên quan
              <span
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: 60,
                  height: 4,
                  background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                  borderRadius: 2,
                }}
              ></span>
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 25,
              }}
            >
              {(relatedProducts.length > 0 ? relatedProducts : [
                products.find((p) => p.id !== product.id && p.category === product.category),
                products.find((p) => p.id !== product.id && p.category === product.category),
                products.find((p) => p.id !== product.id),
                products.find((p) => p.id !== product.id),
              ])
                .filter(Boolean)
                .slice(0, 4)
                .map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "white",
                      borderRadius: 20,
                      overflow: "hidden",
                      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      // Click card -> view product detail
                      if (onViewProduct) {
                        onViewProduct(item);
                      }
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
                      {item.image && item.image.includes('.') ? (
                        <img 
                          src={`http://localhost:5000/uploads/${item.image}`} 
                          alt={item.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <span 
                        style={{ 
                          fontSize: 70,
                          display: (item.image && item.image.includes('.')) ? 'none' : 'block'
                        }}
                      >
                        {item.image || '📚'}
                      </span>
                      <span
                        style={{
                          position: "absolute",
                          top: 15,
                          right: 15,
                          background: "#e53935",
                          color: "white",
                          padding: "5px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: "700",
                        }}
                      >
                        -{item.discount}%
                      </span>
                    </div>
                    <div style={{ padding: 18 }}>
                      <h4
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: "#1a1a2e",
                          marginBottom: 8,
                          lineHeight: 1.3,
                        }}
                      >
                        {item.name}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "baseline",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: "800",
                            color: "#e53935",
                          }}
                        >
                          {formatPrice(item.price)}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            color: "#999",
                            textDecoration: "line-through",
                          }}
                        >
                          {formatPrice(item.oldPrice)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      {/* Checkout Drawer */}
      <CheckoutDrawer
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cart={cart}
        onBack={() => {
          setCheckoutOpen(false);
          setCartOpen(true);
        }}
        onOrderSuccess={() => {
          setCart([]);
          window.navigateTo("orders");
        }}
      />

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1200px) {
          [style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 30px !important;
          }
          [style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 900px) {
          [style*="grid-template-columns: repeat(3"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          [style*="grid-template-columns: repeat(2"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          [style*="grid-template-columns: repeat(4"] {
            grid-template-columns: 1fr !important;
          }
          [style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
          [style*="grid-template-columns: repeat(3, 1fr"] {
            grid-template-columns: 1fr !important;
          }
          [style*="marginTop: 90"] {
            marginTop: 70px !important;
            padding: 20px !important;
          }
          h1[style*="font-size: 28"] {
            font-size: 22px !important;
          }
          [style*="font-size: 36"] {
            font-size: 28px !important;
          }
        }
      `}</style>
    </div>
  );
}

// Sample products for related products
const products = [
  {
    id: 1,
    name: "Cambridge IELTS 18 Academic",
    category: "ielts",
    description: "Bộ đề chính thức từ Cambridge 2023",
    price: 189000,
    oldPrice: 250000,
    discount: 24,
    image: "📚",
    tag: "IELTS",
    author: "Cambridge University Press",
    publisher: "Cambridge University Press",
    pages: 400,
    level: "IELTS 5.0 - 8.0",
    weight: "0.8 kg",
    dimensions: "21 x 30 cm",
  },
  {
    id: 2,
    name: "Official TOEIC Test Vol 9",
    category: "toeic",
    description: "Bộ đề ETS chính hãng mới nhất",
    price: 159000,
    oldPrice: 220000,
    discount: 28,
    image: "📝",
    tag: "TOEIC",
    author: "ETS",
    publisher: "ETS",
    pages: 380,
    level: "TOEIC 450 - 990",
    weight: "0.7 kg",
    dimensions: "21 x 28 cm",
  },
  {
    id: 3,
    name: "IELTS Speaking Booster",
    category: "ielts",
    description: "Hướng dẫn nói IELTS 8.0+",
    price: 199000,
    oldPrice: 280000,
    discount: 29,
    image: "🎤",
    tag: "IELTS",
    author: "National Geographic",
    publisher: "Cengage Learning",
    pages: 250,
    level: "IELTS 6.0 - 8.5",
    weight: "0.5 kg",
    dimensions: "19 x 26 cm",
  },
  {
    id: 4,
    name: "Target TOEIC 900",
    category: "toeic",
    description: "Luyện thi TOEIC 900 điểm",
    price: 175000,
    oldPrice: 230000,
    discount: 24,
    image: "🎯",
    tag: "TOEIC",
    author: "Lougheed",
    publisher: "Pearson",
    pages: 320,
    level: "TOEIC 700 - 900",
    weight: "0.6 kg",
    dimensions: "21 x 28 cm",
  },
];

export default ProductDetail;
