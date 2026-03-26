import { useState, useEffect } from "react";
import CartDrawer from "./CartDrawer";
import CheckoutDrawer from "./CheckoutDrawer";
import { fetchBooks, fetchCategories } from "../api";

function Shop() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const books = await fetchBooks();
      // Map database fields to frontend format
      const mappedProducts = books.map(book => ({
        id: book.id,
        name: book.ten_sach,
        category: book.loaiSach?.ten_loai?.toLowerCase() || "other",
        description: book.mo_ta || "Sách luyện thi tiếng Anh",
        price: parseFloat(book.gia_ban),
        oldPrice: parseFloat(book.gia_ban) * 1.2,
        discount: 20,
        image: book.hinh_anh || "📚",
        tag: book.loaiSach?.ten_loai || "Sách",
        author: book.tac_gia || "NXB",
        publisher: book.nha_xuat_ban || "NXB",
        stock: book.so_luong_ton,
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error("Lỗi tải sách:", error);
      // Fallback to empty array
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const categories = [
    { id: "all", label: "Tất cả" },
  ];

  // Products loaded from API

  const filteredProducts = activeCategory === "all" 
    ? products 
    : products.filter(p => p.category === activeCategory || p.category?.toLowerCase() === activeCategory);

  const formatPrice = (price) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prev => prev.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8f9fa",
    }}>
      {/* Header */}
      <header style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "white",
        boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
        padding: "0 40px",
      }}>
        <div style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 70,
        }}>
          {/* Logo */}
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: 10,
              cursor: "pointer"
            }}
            onClick={() => window.navigateTo("books")}
          >
            <span style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#e53935",
            }}>
              ← Quay lại
            </span>
          </div>

          {/* Logo Center */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 10,
          }}>
            <span style={{
              fontSize: 28,
            }}>📚</span>
            <span style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#1a1a2e",
            }}>
              NTA <span style={{ color: "#e53935" }}>Books</span>
            </span>
          </div>

          {/* Search Bar */}
          <div style={{
            flex: 1,
            maxWidth: 400,
            margin: "0 30px",
          }}>
            <div style={{
              position: "relative",
            }}>
              <input 
                type="text" 
                placeholder="Tìm kiếm sách..." 
                style={{
                  width: "100%",
                  padding: "12px 20px 12px 45px",
                  borderRadius: 50,
                  border: "2px solid #e0e0e0",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => e.target.style.borderColor = "#e53935"}
                onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
              />
              <span style={{
                position: "absolute",
                left: 18,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: 18,
              }}>🔍</span>
            </div>
          </div>

          {/* Cart */}
          <div 
            onClick={() => setCartOpen(true)}
            style={{
              position: "relative",
              cursor: "pointer",
              padding: "10px",
            }}
          >
            <span style={{ fontSize: 28 }}>🛒</span>
            {cartCount > 0 && (
              <span style={{
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
              }}>
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ marginTop: 90, padding: "30px 40px 60px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          
          {/* Category Filter */}
          <div style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 40,
            justifyContent: "center",
          }}>
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
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Count */}
          <p style={{
            fontSize: 14,
            color: "#888",
            marginBottom: 20,
          }}>
            Hiển thị {filteredProducts.length} sản phẩm
          </p>

          {/* Product Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 25,
          }}>
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                style={{
                  background: "white",
                  borderRadius: 20,
                  overflow: "hidden",
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
                onClick={() => window.navigateTo("product-detail", product)}
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
                <div style={{
                  position: "relative",
                  height: 200,
                  background: "linear-gradient(135deg, #fff5f5 0%, #ffe4e8 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  {/* Category Tag */}
                  <span style={{
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
                  }}>
                    {product.tag}
                  </span>

                  {/* Discount Badge */}
                  <span style={{
                    position: "absolute",
                    top: 15,
                    right: 15,
                    background: "#e53935",
                    color: "white",
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: "700",
                  }}>
                    -{product.discount}%
                  </span>

                  {/* Product Image */}
                  <span style={{ fontSize: 80 }}>{product.image}</span>
                </div>

                {/* Content */}
                <div style={{ padding: 20 }}>
                  <h3 style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#1a1a2e",
                    marginBottom: 8,
                    lineHeight: 1.3,
                  }}>
                    {product.name}
                  </h3>
                  
                  <p style={{
                    fontSize: 13,
                    color: "#888",
                    marginBottom: 15,
                    lineHeight: 1.4,
                  }}>
                    {product.description}
                  </p>

                  {/* Price */}
                  <div style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    marginBottom: 18,
                  }}>
                    <span style={{
                      fontSize: 20,
                      fontWeight: "800",
                      color: "#e53935",
                    }}>
                      {formatPrice(product.price)}
                    </span>
                    <span style={{
                      fontSize: 14,
                      color: "#999",
                      textDecoration: "line-through",
                    }}>
                      {formatPrice(product.oldPrice)}
                    </span>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={() => addToCart(product)}
                    style={{
                      width: "100%",
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
                    🛒 Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
            }}>
              <span style={{ fontSize: 60, display: "block", marginBottom: 20 }}>📭</span>
              <h3 style={{ fontSize: 20, color: "#1a1a2e", marginBottom: 10 }}>
                Không tìm thấy sản phẩm
              </h3>
              <p style={{ color: "#888" }}>
                Vui lòng chọn danh mục khác
              </p>
            </div>
          )}
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
      />

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 1200px) {
          [style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
        @media (max-width: 900px) {
          [style*="grid-template-columns: repeat(4"] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          [style*="maxWidth: 400"] {
            display: none !important;
          }
        }
        @media (max-width: 600px) {
          [style*="grid-template-columns: repeat(4"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Shop;
