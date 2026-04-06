import { useState, useEffect } from "react";
import { fetchCTVs, updateCTVStatus, deleteCTV } from "../api";

export default function CTVManagement() {
  const [ctvs, setCtvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCTV, setSelectedCTV] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadCTVs();
  }, [currentPage, searchTerm]);

  const loadCTVs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const result = await fetchCTVs({
        page: currentPage,
        limit: 20,
        search: searchTerm,
      }, token);

      if (result.success) {
        setCtvs(result.data.ctvs);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error loading CTVs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ctvId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const result = await updateCTVStatus(ctvId, newStatus, token);

      if (result.success) {
        loadCTVs();
        alert("Cập nhật trạng thái thành công!");
      } else {
        alert(result.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating CTV status:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const handleDelete = async (ctvId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa CTV này?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const result = await deleteCTV(ctvId, token);

      if (result.success) {
        loadCTVs();
        alert("Xóa CTV thành công!");
      } else {
        alert(result.message || "Xóa thất bại");
      }
    } catch (error) {
      console.error("Error deleting CTV:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("vi-VN") + " đ";
  };

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ fontSize: 28, fontWeight: "800", marginBottom: 30 }}>
        👥 Quản lý CTV
      </h1>

      {/* Search and Filter */}
      <div style={{ display: "flex", gap: 15, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email, mã CTV..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "2px solid #e0e0e0",
            borderRadius: 10,
            fontSize: 14,
          }}
        />
        <button
          onClick={loadCTVs}
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
          🔍 Tìm kiếm
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: 15, textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>ID</th>
              <th style={{ padding: 15, textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Tên</th>
              <th style={{ padding: 15, textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Email</th>
              <th style={{ padding: 15, textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Mã CTV</th>
              <th style={{ padding: 15, textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Cấp</th>
              <th style={{ padding: 15, textAlign: "right", borderBottom: "2px solid #e0e0e0" }}>Tổng hoa hồng</th>
              <th style={{ padding: 15, textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Trạng thái</th>
              <th style={{ padding: 15, textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: "center" }}>
                  Đang tải...
                </td>
              </tr>
            ) : ctvs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 40, textAlign: "center" }}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              ctvs.map((ctv) => (
                <tr key={ctv.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 15 }}>#{ctv.id}</td>
                  <td style={{ padding: 15, fontWeight: "600" }}>{ctv.nguoiDung?.ho_ten || "N/A"}</td>
                  <td style={{ padding: 15, color: "#666" }}>{ctv.nguoiDung?.email || "N/A"}</td>
                  <td style={{ padding: 15, fontWeight: "600", color: "#e53935" }}>{ctv.ma_gioi_thieu}</td>
                  <td style={{ padding: 15, textAlign: "center" }}>
                    <span style={{
                      background: ctv.cap_do === 1 ? "#e8f5e9" : ctv.cap_do === 2 ? "#e3f2fd" : "#f3e5f5",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: "600",
                    }}>
                      F{ctv.cap_do}
                    </span>
                  </td>
                  <td style={{ padding: 15, textAlign: "right", fontWeight: "600", color: "#4caf50" }}>
                    {formatCurrency(ctv.tong_hoa_hong)}
                  </td>
                  <td style={{ padding: 15, textAlign: "center" }}>
                    <span style={{
                      background: ctv.trang_thai === "hoat_dong" ? "#e8f5e9" : "#ffebee",
                      color: ctv.trang_thai === "hoat_dong" ? "#4caf50" : "#f44336",
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: "600",
                    }}>
                      {ctv.trang_thai === "hoat_dong" ? "✅ Hoạt động" : "❌ Tạm dừng"}
                    </span>
                  </td>
                  <td style={{ padding: 15, textAlign: "center" }}>
                    <button
                      onClick={() => { setSelectedCTV(ctv); setShowModal(true); }}
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
                      👁️ Xem
                    </button>
                    <button
                      onClick={() => handleStatusChange(ctv.id, ctv.trang_thai === "hoat_dong" ? "tam_dung" : "hoat_dong")}
                      style={{
                        padding: "6px 12px",
                        background: ctv.trang_thai === "hoat_dong" ? "#ff9800" : "#4caf50",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: "pointer",
                        marginRight: 5,
                      }}
                    >
                      {ctv.trang_thai === "hoat_dong" ? "⏸️ Tạm dừng" : "▶️ Kích hoạt"}
                    </button>
                    <button
                      onClick={() => handleDelete(ctv.id)}
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

      {/* Pagination */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 20 }}>
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          style={{
            padding: "8px 16px",
            background: currentPage === 1 ? "#ccc" : "#e53935",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
          }}
        >
          ← Trước
        </button>
        <span style={{ padding: "8px 16px", fontWeight: "600" }}>
          Trang {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          style={{
            padding: "8px 16px",
            background: currentPage === totalPages ? "#ccc" : "#e53935",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          }}
        >
          Sau →
        </button>
      </div>

      {/* Detail Modal */}
      {showModal && selectedCTV && (
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
              maxWidth: 600,
              maxHeight: "80vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 24, fontWeight: "800", marginBottom: 20 }}>
              Chi tiết CTV #{selectedCTV.id}
            </h2>
            <div style={{ display: "grid", gap: 15 }}>
              <div>
                <label style={{ fontWeight: "600", color: "#666" }}>Tên:</label>
                <p style={{ fontSize: 16, marginTop: 5 }}>{selectedCTV.nguoiDung?.ho_ten || "N/A"}</p>
              </div>
              <div>
                <label style={{ fontWeight: "600", color: "#666" }}>Email:</label>
                <p style={{ fontSize: 16, marginTop: 5 }}>{selectedCTV.nguoiDung?.email || "N/A"}</p>
              </div>
              <div>
                <label style={{ fontWeight: "600", color: "#666" }}>Mã CTV:</label>
                <p style={{ fontSize: 16, marginTop: 5, fontWeight: "600", color: "#e53935" }}>{selectedCTV.ma_gioi_thieu}</p>
              </div>
              <div>
                <label style={{ fontWeight: "600", color: "#666" }}>Cấp độ:</label>
                <p style={{ fontSize: 16, marginTop: 5 }}>F{selectedCTV.cap_do}</p>
              </div>
              <div>
                <label style={{ fontWeight: "600", color: "#666" }}>Tổng hoa hồng:</label>
                <p style={{ fontSize: 16, marginTop: 5, fontWeight: "600", color: "#4caf50" }}>
                  {formatCurrency(selectedCTV.tong_hoa_hong)}
                </p>
              </div>
              <div>
                <label style={{ fontWeight: "600", color: "#666" }}>Số downline:</label>
                <p style={{ fontSize: 16, marginTop: 5 }}>{selectedCTV.tong_downline}</p>
              </div>
              
              {/* Downline F1, F2, F3 */}
              {selectedCTV.downline && (
                <div style={{ marginTop: 15, paddingTop: 15, borderTop: "1px solid #eee" }}>
                  <label style={{ fontWeight: "600", color: "#666", display: "block", marginBottom: 10 }}>
                    Cấu trúc downline:
                  </label>
                  
                  {/* F1 */}
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontWeight: "600", color: "#4caf50" }}>F1: </span>
                    <span>{selectedCTV.tong_f1 || selectedCTV.downline.f1?.length || 0} người</span>
                    {selectedCTV.downline.f1 && selectedCTV.downline.f1.length > 0 && (
                      <div style={{ marginLeft: 10, fontSize: 13, color: "#666" }}>
                        {selectedCTV.downline.f1.slice(0, 3).map(f => f.ho_ten || f.email).join(", ")}
                        {selectedCTV.downline.f1.length > 3 && ` +${selectedCTV.downline.f1.length - 3} người`}
                      </div>
                    )}
                  </div>
                  
                  {/* F2 */}
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontWeight: "600", color: "#2196f3" }}>F2: </span>
                    <span>{selectedCTV.tong_f2 || selectedCTV.downline.f2?.length || 0} người</span>
                    {selectedCTV.downline.f2 && selectedCTV.downline.f2.length > 0 && (
                      <div style={{ marginLeft: 10, fontSize: 13, color: "#666" }}>
                        {selectedCTV.downline.f2.slice(0, 3).map(f => f.ho_ten || f.email).join(", ")}
                        {selectedCTV.downline.f2.length > 3 && ` +${selectedCTV.downline.f2.length - 3} người`}
                      </div>
                    )}
                  </div>
                  
                  {/* F3 */}
                  <div>
                    <span style={{ fontWeight: "600", color: "#9c27b0" }}>F3: </span>
                    <span>{selectedCTV.tong_f3 || selectedCTV.downline.f3?.length || 0} người</span>
                    {selectedCTV.downline.f3 && selectedCTV.downline.f3.length > 0 && (
                      <div style={{ marginLeft: 10, fontSize: 13, color: "#666" }}>
                        {selectedCTV.downline.f3.slice(0, 3).map(f => f.ho_ten || f.email).join(", ")}
                        {selectedCTV.downline.f3.length > 3 && ` +${selectedCTV.downline.f3.length - 3} người`}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div>
                <label style={{ fontWeight: "600", color: "#666" }}>Ngày tham gia:</label>
                <p style={{ fontSize: 16, marginTop: 5 }}>
                  {new Date(selectedCTV.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: 20,
                padding: "12px 24px",
                background: "#e53935",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
