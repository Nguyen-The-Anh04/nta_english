import { useState, useEffect } from "react";
import { fetchCommissionProducts, createCommissionProduct, updateCommissionProduct, deleteCommissionProduct } from "../api";

export default function CommissionProductsManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    san_pham_id: "",
    f1_percent: 10,
    f2_percent: 5,
    f3_percent: 2,
    trang_thai: "hoat_dong",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const result = await fetchCommissionProducts(token);

      if (result.success) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error("Error loading commission products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let result;

      if (editingProduct) {
        result = await updateCommissionProduct(editingProduct.id, formData, token);
      } else {
        result = await createCommissionProduct(formData, token);
      }

      if (result.success) {
        loadProducts();
        setShowModal(false);
        setEditingProduct(null);
        setFormData({
          san_pham_id: "",
          f1_percent: 10,
          f2_percent: 5,
          f3_percent: 2,
          trang_thai: "hoat_dong",
        });
        alert(editingProduct ? "Cập nhật thành công!" : "Tạo mới thành công!");
      } else {
        alert(result.message || "Thao tác thất bại");
      }
    } catch (error) {
      console.error("Error saving commission product:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      san_pham_id: product.san_pham_id,
      f1_percent: product.f1_percent,
      f2_percent: product.f2_percent,
      f3_percent: product.f3_percent,
      trang_thai: product.trang_thai,
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cấu hình này?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const result = await deleteCommissionProduct(productId, token);

      if (result.success) {
        loadProducts();
        alert("Xóa thành công!");
      } else {
        alert(result.message || "Xóa thất bại");
      }
    } catch (error) {
      console.error("Error deleting commission product:", error);
      alert("Có lỗi xảy ra");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, fontWeight: "800" }}>
          ⚙️ Cấu hình hoa hồng theo sản phẩm
        </h1>
        <button
          onClick={() => {
            setEditingProduct(null);
            setFormData({
              san_pham_id: "",
              f1_percent: 10,
              f2_percent: 5,
              f3_percent: 2,
              trang_thai: "hoat_dong",
            });
            setShowModal(true);
          }}
          style={{
            padding: "12px 24px",
            background: "#e53935",
            color: "white",
            border: "none",
            borderRadius: 10,
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          ➕ Thêm cấu hình
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: 15, textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>ID</th>
              <th style={{ padding: 15, textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Sản phẩm</th>
              <th style={{ padding: 15, textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>F1 (%)</th>
              <th style={{ padding: 15, textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>F2 (%)</th>
              <th style={{ padding: 15, textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>F3 (%)</th>
              <th style={{ padding: 15, textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Trạng thái</th>
              <th style={{ padding: 15, textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center" }}>
                  Đang tải...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 40, textAlign: "center" }}>
                  Chưa có cấu hình nào
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 15 }}>#{product.id}</td>
                  <td style={{ padding: 15, fontWeight: "600" }}>
                    {product.sanPham?.ten_sach || "N/A"}
                  </td>
                  <td style={{ padding: 15, textAlign: "center", fontWeight: "600", color: "#4caf50" }}>
                    {product.f1_percent}%
                  </td>
                  <td style={{ padding: 15, textAlign: "center", fontWeight: "600", color: "#2196f3" }}>
                    {product.f2_percent}%
                  </td>
                  <td style={{ padding: 15, textAlign: "center", fontWeight: "600", color: "#9c27b0" }}>
                    {product.f3_percent}%
                  </td>
                  <td style={{ padding: 15, textAlign: "center" }}>
                    <span style={{
                      background: product.trang_thai === "hoat_dong" ? "#e8f5e9" : "#ffebee",
                      color: product.trang_thai === "hoat_dong" ? "#4caf50" : "#f44336",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: "600",
                    }}>
                      {product.trang_thai === "hoat_dong" ? "✅ Hoạt động" : "❌ Tạm dừng"}
                    </span>
                  </td>
                  <td style={{ padding: 15, textAlign: "center" }}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={{
                        padding: "6px 12px",
                        background: "#2196f3",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: "pointer",
                        marginRight: 5,
                      }}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{
                        padding: "6px 12px",
                        background: "#f44336",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 30,
              width: "100%",
              maxWidth: 500,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 24, fontWeight: "800", marginBottom: 20 }}>
              {editingProduct ? "✏️ Sửa cấu hình" : "➕ Thêm cấu hình"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: 5 }}>
                  Sản phẩm ID
                </label>
                <input
                  type="number"
                  value={formData.san_pham_id}
                  onChange={(e) => setFormData({ ...formData, san_pham_id: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 10,
                    fontSize: 14,
                  }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15, marginBottom: 15 }}>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: 5 }}>
                    F1 (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.f1_percent}
                    onChange={(e) => setFormData({ ...formData, f1_percent: parseFloat(e.target.value) })}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 10,
                      fontSize: 14,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: 5 }}>
                    F2 (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.f2_percent}
                    onChange={(e) => setFormData({ ...formData, f2_percent: parseFloat(e.target.value) })}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 10,
                      fontSize: 14,
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: "600", marginBottom: 5 }}>
                    F3 (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.f3_percent}
                    onChange={(e) => setFormData({ ...formData, f3_percent: parseFloat(e.target.value) })}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "2px solid #e0e0e0",
                      borderRadius: 10,
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontWeight: "600", marginBottom: 5 }}>
                  Trạng thái
                </label>
                <select
                  value={formData.trang_thai}
                  onChange={(e) => setFormData({ ...formData, trang_thai: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "2px solid #e0e0e0",
                    borderRadius: 10,
                    fontSize: 14,
                  }}
                >
                  <option value="hoat_dong">✅ Hoạt động</option>
                  <option value="tam_dung">❌ Tạm dừng</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#e53935",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  {editingProduct ? "💾 Lưu thay đổi" : "➕ Tạo mới"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "#f5f5f5",
                    color: "#333",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
