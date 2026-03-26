import { useState } from "react";

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Mock data
  const products = [
    { id: 1, name: "Cambridge IELTS 18 Academic", category: "ielts", price: 189000, oldPrice: 250000, stock: 50, sold: 234, image: "📚", status: "active", author: "Cambridge University Press" },
    { id: 2, name: "Official TOEIC Test Vol 9", category: "toeic", price: 159000, oldPrice: 220000, stock: 35, sold: 189, image: "📝", status: "active", author: "ETS" },
    { id: 3, name: "IELTS Speaking Booster", category: "ielts", price: 199000, oldPrice: 280000, stock: 0, sold: 156, image: "🎤", status: "out_of_stock", author: "National Geographic" },
    { id: 4, name: "Target TOEIC 900", category: "toeic", price: 175000, oldPrice: 230000, stock: 28, sold: 145, image: "🎯", status: "active", author: "Lougheed" },
    { id: 5, name: "Cambridge KET Practice Tests", category: "cambridge", price: 145000, oldPrice: 180000, stock: 42, sold: 98, image: "🏫", status: "active", author: "Cambridge University Press" },
    { id: 6, name: "English Grammar in Use", category: "ngu-phap", price: 165000, oldPrice: 210000, stock: 15, sold: 312, image: "📖", status: "active", author: "Raymond Murphy" },
    { id: 7, name: "Vocabulary for IELTS", category: "tu-vung", price: 135000, oldPrice: 180000, stock: 60, sold: 87, image: "💡", status: "active", author: "Cambridge University Press" },
    { id: 8, name: "600 Essential Words for TOEIC", category: "toeic", price: 99000, oldPrice: 140000, stock: 25, sold: 76, image: "🔤", status: "active", author: "Lougheed" },
  ];

  const categories = [
    { id: "all", label: "Tất cả" },
    { id: "ielts", label: "IELTS" },
    { id: "toeic", label: "TOEIC" },
    { id: "cambridge", label: "Cambridge" },
    { id: "ngu-phap", label: "Ngữ pháp" },
    { id: "tu-vung", label: "Từ vựng" },
  ];

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("vi-VN") + " đ";
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: "#e8f5e9", color: "#4caf50", text: "Hoạt động" },
      out_of_stock: { bg: "#ffebee", color: "#f44336", text: "Hết hàng" },
      hidden: { bg: "#f5f5f5", color: "#666", text: "Ẩn" },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span
        style={{
          background: config.bg,
          color: config.color,
          padding: "5px 12px",
          borderRadius: 20,
          fontSize: 12,
          fontWeight: "600",
        }}
      >
        {config.text}
      </span>
    );
  };

  // Stats
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalSold = products.reduce((sum, p) => sum + p.sold, 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.sold * p.price), 0);

  return (
    <div>
      {/* Actions Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 }}>
        <div style={{ display: "flex", gap: 15 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "12px 15px 12px 45px",
                borderRadius: 10,
                border: "1px solid #e0e0e0",
                width: 300,
                fontSize: 14,
                outline: "none",
              }}
            />
            <span style={{ position: "absolute", left: 15, top: "50%", transform: "translateY(-50%)", color: "#999" }}>
              🔍
            </span>
          </div>

          {/* Filter Category */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{
              padding: "12px 15px",
              borderRadius: 10,
              border: "1px solid #e0e0e0",
              fontSize: 14,
              outline: "none",
              cursor: "pointer",
            }}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        <button
          style={{
            padding: "12px 25px",
            background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          + Thêm sản phẩm
        </button>
      </div>

      {/* Stats Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15, marginBottom: 25 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Tổng sản phẩm</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: "#2196f3" }}>{totalProducts}</p>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Tổng tồn kho</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: "#4caf50" }}>{totalStock}</p>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Đã bán</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: "#ff9800" }}>{totalSold}</p>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Doanh thu</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: "#e53935" }}>{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Products Table */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
              <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>Sản phẩm</th>
              <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>Danh mục</th>
              <th style={{ padding: "12px 8px", textAlign: "right", color: "#666", fontSize: 13 }}>Giá</th>
              <th style={{ padding: "12px 8px", textAlign: "right", color: "#666", fontSize: 13 }}>Giá cũ</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Tồn kho</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Đã bán</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Trạng thái</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "12px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: 8,
                        background: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 24,
                      }}
                    >
                      {product.image}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#333", maxWidth: 200 }}>{product.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{product.author}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <span
                    style={{
                      background: "#e3f2fd",
                      color: "#1976d2",
                      padding: "5px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: "600",
                      textTransform: "capitalize",
                    }}
                  >
                    {product.category}
                  </span>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "700", color: "#e53935", fontSize: 15 }}>
                  {formatCurrency(product.price)}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", color: "#999", textDecoration: "line-through" }}>
                  {formatCurrency(product.oldPrice)}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  <span
                    style={{
                      color: product.stock === 0 ? "#f44336" : product.stock < 10 ? "#ff9800" : "#4caf50",
                      fontWeight: "700",
                    }}
                  >
                    {product.stock}
                  </span>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: "600", color: "#666" }}>{product.sold}</td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>{getStatusBadge(product.status)}</td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <button
                      style={{
                        padding: "6px 12px",
                        background: "#e3f2fd",
                        border: "none",
                        borderRadius: 6,
                        color: "#1976d2",
                        fontSize: 12,
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      style={{
                        padding: "6px 12px",
                        background: "#f5f5f5",
                        border: "none",
                        borderRadius: 6,
                        color: "#666",
                        fontSize: 12,
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      👁️ Xem
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
