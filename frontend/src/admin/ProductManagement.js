import { useState, useEffect } from "react";
import { fetchBooks, fetchCategories, createBook, updateBook, deleteBook, uploadBookImage } from "../api";

export default function ProductManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", label: "Tất cả" }]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    loai_sach_id: "",
    ma_sach: "",
    ten_sach: "",
    tac_gia: "",
    nha_xuat_ban: "",
    gia_nhap: "",
    gia_ban: "",
    so_luong_ton: 0,
    hinh_anh: "",
    mo_ta: "",
    trang_thai: "co_san",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [booksData, categoriesData] = await Promise.all([
        fetchBooks(),
        fetchCategories(),
      ]);

      // Map books
      const mappedProducts = booksData.map(book => ({
        id: book.id,
        name: book.ten_sach,
        category: book.loaiSach?.ten_loai?.toLowerCase() || "other",
        categoryId: book.loai_sach_id,
        price: parseFloat(book.gia_ban),
        oldPrice: parseFloat(book.gia_ban) * 1.2,
        stock: book.so_luong_ton,
        sold: 0, // TODO: Calculate from orders
        image: book.hinh_anh || "📚",
        status: book.trang_thai === "het_hang" ? "out_of_stock" : "active",
        author: book.tac_gia || "NXB",
        publisher: book.nha_xuat_ban || "NXB",
        ma_sach: book.ma_sach,
        mo_ta: book.mo_ta,
        gia_nhap: parseFloat(book.gia_nhap) || 0,
      }));
      setProducts(mappedProducts);

      // Map categories
      const mappedCategories = [
        { id: "all", label: "Tất cả" },
        ...categoriesData.map(cat => ({
          id: cat.ten_loai.toLowerCase(),
          label: cat.ten_loai,
          dbId: cat.id,
        })),
      ];
      setCategories(mappedCategories);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("vi-VN") + " đ";
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.ma_sach?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        loai_sach_id: product.categoryId || "",
        ma_sach: product.ma_sach || "",
        ten_sach: product.name || "",
        tac_gia: product.author || "",
        nha_xuat_ban: product.publisher || "",
        gia_nhap: product.gia_nhap || "",
        gia_ban: product.price || "",
        so_luong_ton: product.stock || 0,
        hinh_anh: product.image || "",
        mo_ta: product.mo_ta || "",
        trang_thai: product.status === "active" ? "co_san" : "het_hang",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        loai_sach_id: "",
        ma_sach: "",
        ten_sach: "",
        tac_gia: "",
        nha_xuat_ban: "",
        gia_nhap: "",
        gia_ban: "",
        so_luong_ton: 0,
        hinh_anh: "",
        mo_ta: "",
        trang_thai: "co_san",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const result = await uploadBookImage(file);
      if (result.success && result.data?.url) {
        setFormData(prev => ({ ...prev, hinh_anh: result.data.url }));
        alert("Tải ảnh thành công!");
      } else {
        alert(result.message || "Tải ảnh thất bại!");
      }
    } catch (error) {
      console.error("Lỗi tải ảnh:", error);
      alert("Có lỗi xảy ra khi tải ảnh!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.ten_sach || !formData.ma_sach || !formData.gia_ban) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      let result;
      if (editingProduct) {
        result = await updateBook(editingProduct.id, formData);
      } else {
        result = await createBook(formData);
      }
      
      if (result.success || result.data) {
        alert(editingProduct ? "Cập nhật sách thành công!" : "Thêm sách thành công!");
        handleCloseModal();
        loadData(); // Reload to get fresh data from server
      } else {
        alert(result.message || "Lưu thất bại!");
      }
    } catch (error) {
      console.error("Lỗi lưu sách:", error);
      alert("Có lỗi xảy ra khi lưu sách!");
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sách này?")) {
      return;
    }

    try {
      const result = await deleteBook(productId);
      if (result.success) {
        alert("Xóa sách thành công!");
        loadData(); // Reload to get fresh data from server
      } else {
        alert(result.message || "Xóa thất bại!");
      }
    } catch (error) {
      console.error("Lỗi xóa sách:", error);
      alert("Có lỗi xảy ra khi xóa sách!");
    }
  };

  // Stats
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalSold = products.reduce((sum, p) => sum + p.sold, 0);
  const totalRevenue = products.reduce((sum, p) => sum + (p.sold * p.price), 0);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

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
          onClick={() => handleOpenModal()}
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
                      {product.image && product.image.includes('.') ? (
                        <img 
                          src={`http://localhost:5000${product.image}`} 
                          alt={product.name}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          }}
                          onError={(e) => {
                            console.log('Image load error for:', e.target.src);
                            e.target.style.display = 'none';
                            e.target.nextSibling && (e.target.nextSibling.style.display = 'block');
                          }}
                        />
                      ) : null}
                      <span 
                        style={{ 
                          fontSize: 24,
                          display: (product.image && product.image.includes('.')) ? 'none' : 'block'
                        }}
                      >
                        {product.image || '📚'}
                      </span>
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
                      onClick={() => handleOpenModal(product)}
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
                      onClick={() => handleDelete(product.id)}
                      style={{
                        padding: "6px 12px",
                        background: "#ffebee",
                        border: "none",
                        borderRadius: 6,
                        color: "#f44336",
                        fontSize: 12,
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <>
          <div
            onClick={handleCloseModal}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              borderRadius: 16,
              padding: 30,
              width: 600,
              maxHeight: "90vh",
              overflowY: "auto",
              zIndex: 1001,
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <h2 style={{ margin: "0 0 20px 0", fontSize: 20, fontWeight: "800" }}>
              {editingProduct ? "✏️ Chỉnh sửa sách" : "➕ Thêm sách mới"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                <div>
                  <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "600", color: "#666" }}>
                    Mã sách *
                  </label>
                  <input
                    name="ma_sach"
                    value={formData.ma_sach}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #e0e0e0",
                      fontSize: 14,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "600", color: "#666" }}>
                    Tên sách *
                  </label>
                  <input
                    name="ten_sach"
                    value={formData.ten_sach}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #e0e0e0",
                      fontSize: 14,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "600", color: "#666" }}>
                    Loại sách
                  </label>
                  <select
                    name="loai_sach_id"
                    value={formData.loai_sach_id}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #e0e0e0",
                      fontSize: 14,
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">Chọn loại sách</option>
                    {categories.filter(c => c.id !== "all").map((cat) => (
                      <option key={cat.dbId} value={cat.dbId}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "600", color: "#666" }}>
                    Tác giả
                  </label>
                  <input
                    name="tac_gia"
                    value={formData.tac_gia}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #e0e0e0",
                      fontSize: 14,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "600", color: "#666" }}>
                    Nhà xuất bản
                  </label>
                  <input
                    name="nha_xuat_ban"
                    value={formData.nha_xuat_ban}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #e0e0e0",
                      fontSize: 14,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "600", color: "#666" }}>
                    Giá nhập
                  </label>
                  <input
                    name="gia_nhap"
                    type="number"
                    value={formData.gia_nhap}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #e0e0e0",
                      fontSize: 14,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "600", color: "#666" }}>
                    Giá bán *
                  </label>
                  <input
                    name="gia_ban"
                    type="number"
                    value={formData.gia_ban}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #e0e0e0",
                      fontSize: 14,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "600", color: "#666" }}>
                    Số lượng tồn
                  </label>
                  <input
                    name="so_luong_ton"
                    type="number"
                    value={formData.so_luong_ton}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #e0e0e0",
                      fontSize: 14,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "600", color: "#666" }}>
                    Trạng thái
                  </label>
                  <select
                    name="trang_thai"
                    value={formData.trang_thai}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #e0e0e0",
                      fontSize: 14,
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="co_san">Còn hàng</option>
                    <option value="ban_chay">Bán chạy</option>
                    <option value="het_hang">Hết hàng</option>
                  </select>
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "600", color: "#666" }}>
                    Hình ảnh
                  </label>
                  <p style={{ fontSize: 11, color: '#999', marginTop: -2, marginBottom: 8 }}>Chọn file ảnh (jpg, png, gif, webp) - Max 5MB</p>
                  <input
                    type="file"
                    accept="image/*,.jfif"
                    onChange={handleImageChange}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #e0e0e0",
                      fontSize: 14,
                      boxSizing: "border-box",
                      maxWidth: 250
                    }}
                  />
                  {formData.hinh_anh && (
                    <span style={{ fontSize: 12, color: '#666', marginLeft: 10 }}>{formData.hinh_anh}</span>
                  )}
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <label style={{ display: "block", marginBottom: 5, fontSize: 13, fontWeight: "600", color: "#666" }}>
                    Mô tả
                  </label>
                  <textarea
                    name="mo_ta"
                    value={formData.mo_ta}
                    onChange={handleInputChange}
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #e0e0e0",
                      fontSize: 14,
                      boxSizing: "border-box",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  style={{
                    padding: "10px 20px",
                    background: "#f5f5f5",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
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
                  {editingProduct ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
