import { useState, useEffect } from "react";
import { fetchCommissions, updateCommissionStatus } from "../api";

export default function CommissionManagement() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCommissions();
  }, [currentPage, filter]);

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const result = await fetchCommissions({
        page: currentPage,
        limit: 20,
        trang_thai: filter === "all" ? undefined : filter,
      }, token);

      if (result.success) {
        setCommissions(result.data.commissions);
        setTotalPages(result.data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error loading commissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (commissionId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const result = await updateCommissionStatus(commissionId, newStatus, token);

      if (result.success) {
        loadCommissions();
        alert("Cập nhật trạng thái thành công!");
      } else {
        alert(result.message || "Cập nhật thất bại");
      }
    } catch (error) {
      console.error("Error updating commission status:", error);
      alert("Có lỗi xảy ra");
    }
  };

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("vi-VN") + " đ";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "cho_xac_nhan":
        return { bg: "#fff3e0", color: "#e65100", text: "⏳ Chờ xác nhận" };
      case "da_tra":
        return { bg: "#e8f5e9", color: "#4caf50", text: "✅ Đã thanh toán" };
      case "da_huy":
        return { bg: "#ffebee", color: "#f44336", text: "❌ Đã hủy" };
      default:
        return { bg: "#f5f5f5", color: "#666", text: status };
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ fontSize: 28, fontWeight: "800", marginBottom: 30 }}>
        💰 Quản lý hoa hồng
      </h1>

      {/* Filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "10px 20px",
            background: filter === "all" ? "#e53935" : "#f5f5f5",
            color: filter === "all" ? "white" : "#333",
            border: "none",
            borderRadius: 8,
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Tất cả
        </button>
        <button
          onClick={() => setFilter("cho_xac_nhan")}
          style={{
            padding: "10px 20px",
            background: filter === "cho_xac_nhan" ? "#e53935" : "#f5f5f5",
            color: filter === "cho_xac_nhan" ? "white" : "#333",
            border: "none",
            borderRadius: 8,
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          ⏳ Chờ xác nhận
        </button>
        <button
          onClick={() => setFilter("da_tra")}
          style={{
            padding: "10px 20px",
            background: filter === "da_tra" ? "#e53935" : "#f5f5f5",
            color: filter === "da_tra" ? "white" : "#333",
            border: "none",
            borderRadius: 8,
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          ✅ Đã thanh toán
        </button>
        <button
          onClick={() => setFilter("da_huy")}
          style={{
            padding: "10px 20px",
            background: filter === "da_huy" ? "#e53935" : "#f5f5f5",
            color: filter === "da_huy" ? "white" : "#333",
            border: "none",
            borderRadius: 8,
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          ❌ Đã hủy
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: 15, textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>ID</th>
              <th style={{ padding: 15, textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>CTV</th>
              <th style={{ padding: 15, textAlign: "left", borderBottom: "2px solid #e0e0e0" }}>Đơn hàng</th>
              <th style={{ padding: 15, textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Cấp</th>
              <th style={{ padding: 15, textAlign: "right", borderBottom: "2px solid #e0e0e0" }}>Tỷ lệ</th>
              <th style={{ padding: 15, textAlign: "right", borderBottom: "2px solid #e0e0e0" }}>Hoa hồng</th>
              <th style={{ padding: 15, textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Trạng thái</th>
              <th style={{ padding: 15, textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Ngày</th>
              <th style={{ padding: 15, textAlign: "center", borderBottom: "2px solid #e0e0e0" }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ padding: 40, textAlign: "center" }}>
                  Đang tải...
                </td>
              </tr>
            ) : commissions.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: 40, textAlign: "center" }}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              commissions.map((commission) => {
                const statusInfo = getStatusColor(commission.trang_thai);
                return (
                  <tr key={commission.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: 15 }}>#{commission.id}</td>
                    <td style={{ padding: 15, fontWeight: "600" }}>
                      {commission.ctv?.nguoiDung?.ho_ten || "N/A"}
                    </td>
                    <td style={{ padding: 15, color: "#666" }}>
                      {commission.donHang?.ma_don_hang || "N/A"}
                    </td>
                    <td style={{ padding: 15, textAlign: "center" }}>
                      <span style={{
                        background: commission.cap_do === 1 ? "#e8f5e9" : commission.cap_do === 2 ? "#e3f2fd" : "#f3e5f5",
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: "600",
                      }}>
                        F{commission.cap_do}
                      </span>
                    </td>
                    <td style={{ padding: 15, textAlign: "right" }}>
                      {commission.ty_le_pham_ram}%
                    </td>
                    <td style={{ padding: 15, textAlign: "right", fontWeight: "600", color: "#4caf50" }}>
                      {formatCurrency(commission.tien_hoa_hong)}
                    </td>
                    <td style={{ padding: 15, textAlign: "center" }}>
                      <span style={{
                        background: statusInfo.bg,
                        color: statusInfo.color,
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: "600",
                      }}>
                        {statusInfo.text}
                      </span>
                    </td>
                    <td style={{ padding: 15, textAlign: "center", color: "#666" }}>
                      {new Date(commission.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td style={{ padding: 15, textAlign: "center" }}>
                      {commission.trang_thai === "cho_xac_nhan" && (
                        <>
                          <button
                            onClick={() => handleStatusChange(commission.id, "da_tra")}
                            style={{
                              padding: "6px 12px",
                              background: "#4caf50",
                              color: "white",
                              border: "none",
                              borderRadius: 6,
                              fontSize: 12,
                              cursor: "pointer",
                              marginRight: 5,
                            }}
                          >
                            ✅ Duyệt
                          </button>
                          <button
                            onClick={() => handleStatusChange(commission.id, "da_huy")}
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
                            ❌ Từ chối
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
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
    </div>
  );
}
