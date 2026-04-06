import { useState, useEffect } from "react";
import { fetchAllWithdrawals, approveWithdrawal, rejectWithdrawal, getWithdrawalQR } from "../api";

export default function WithdrawalManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedWithdrawals, setSelectedWithdrawals] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Load data
  useEffect(() => {
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const result = await fetchAllWithdrawals();
      if (result.success) {
        setWithdrawals(result.data);
      }
    } catch (error) {
      console.error("Error loading withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data (fallback)
  const mockWithdrawals = [
    { id: 126087, userId: 33311, userName: "Nguyễn Văn A", email: "a@example.com", phone: "0912345678", amount: 500000, fee: 1000, receiveAmount: 499000, bankName: "MB BANK", accountNumber: "53775825964855", accountName: "NGUYEN VAN A", status: "pending", requestDate: "2024-04-20", processDate: null },
    { id: 126088, userId: 33466, userName: "Trần Thị B", email: "b@example.com", phone: "0923456789", amount: 300000, fee: 1000, receiveAmount: 299000, bankName: "Vietcombank", accountNumber: "1234567890", accountName: "TRAN THI B", status: "pending", requestDate: "2024-04-20", processDate: null },
    { id: 140392, userId: 33467, userName: "Lê Văn C", email: "c@example.com", phone: "0934567890", amount: 200000, fee: 1000, receiveAmount: 199000, bankName: "Techcombank", accountNumber: "9876543210", accountName: "LE VAN C", status: "completed", requestDate: "2024-04-19", processDate: "2024-04-19" },
    { id: 140393, userId: 33468, userName: "Phạm Thị D", email: "d@example.com", phone: "0945678901", amount: 150000, fee: 1000, receiveAmount: 149000, bankName: "Agribank", accountNumber: "4567891230", accountName: "PHAM THI D", status: "completed", requestDate: "2024-04-18", processDate: "2024-04-18" },
    { id: 140394, userId: 33469, userName: "Ngô Văn E", email: "e@example.com", phone: "0956789012", amount: 100000, fee: 1000, receiveAmount: 99000, bankName: "BIDV", accountNumber: "3216549870", accountName: "NGO VAN E", status: "rejected", requestDate: "2024-04-17", processDate: "2024-04-17", rejectReason: "Số tài khoản không chính xác" },
    { id: 140395, userId: 33470, userName: "Vũ Thị F", email: "f@example.com", phone: "0967890123", amount: 80000, fee: 1000, receiveAmount: 79000, bankName: "VPBank", accountNumber: "6543217890", accountName: "VU THI F", status: "completed", requestDate: "2024-04-16", processDate: "2024-04-16" },
  ];

  // Use mock data if API returns empty
  const displayData = withdrawals.length > 0 ? withdrawals : mockWithdrawals;

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("vi-VN") + " đ";
  };

  const filteredWithdrawals = displayData.filter((w) => {
    const matchesSearch = 
      w.id.toString().includes(searchTerm) ||
      (w.userName || w.ctv?.nguoiDung?.ho_ten || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.email || w.ctv?.nguoiDung?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || w.trang_thai === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      cho_duyet: { bg: "#fff3e0", color: "#ff9800", text: "Chờ duyệt" },
      da_duyet: { bg: "#e8f5e9", color: "#4caf50", text: "Đã chuyển" },
      da_tu_choi: { bg: "#ffebee", color: "#f44336", text: "Từ chối" },
      // legacy fallback
      pending: { bg: "#fff3e0", color: "#ff9800", text: "Chờ duyệt" },
      completed: { bg: "#e8f5e9", color: "#4caf50", text: "Đã chuyển" },
      rejected: { bg: "#ffebee", color: "#f44336", text: "Từ chối" },
    };
    const config = statusConfig[status] || statusConfig.cho_duyet;
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

  // Show confirm approve modal
  const handleApproveClick = (id) => {
    setSelectedId(id);
    setShowMethodModal(true);
  };

  // Confirm approve (CTV đã chọn phương thức rồi)
  const handleConfirmApprove = async () => {
    try {
      const result = await approveWithdrawal(selectedId);
      if (result.success) {
        alert(`✅ Đã duyệt yêu cầu #${selectedId}\nMã giao dịch: ${result.transactionId}`);
        
        // Get QR code nếu CTV chọn MoMo
        const qrResult = await getWithdrawalQR(selectedId);
        if (qrResult.success && qrResult.data.qrUrl) {
          setQrData(qrResult.data);
          setShowQRModal(true);
        }
        
        loadWithdrawals();
      } else {
        alert(`❌ Thất bại: ${result.message}`);
      }
    } catch (error) {
      console.error("Approve error:", error);
      alert("Có lỗi xảy ra khi duyệt yêu cầu");
    }
    setShowMethodModal(false);
    setSelectedId(null);
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Nhập lý do từ chối:");
    if (reason) {
      try {
        const result = await rejectWithdrawal(id, reason);
        if (result.success) {
          alert(`Đã từ chối yêu cầu #${id}`);
          loadWithdrawals();
        }
      } catch (error) {
        console.error("Reject error:", error);
      }
    }
  };

  // Close QR modal
  const handleCloseQR = () => {
    setShowQRModal(false);
    setQrData(null);
  };

  // Stats
  const totalPending = displayData.filter(w => w.trang_thai === "cho_duyet" || w.status === "pending").length;
  const totalPendingAmount = displayData.filter(w => w.trang_thai === "cho_duyet" || w.status === "pending").reduce((sum, w) => sum + (w.so_tien || w.amount), 0);
  const totalCompleted = displayData.filter(w => w.trang_thai === "da_duyet" || w.trang_thai === "completed").length;
  const totalCompletedAmount = displayData.filter(w => w.trang_thai === "da_duyet" || w.trang_thai === "completed").reduce((sum, w) => sum + (w.so_tien || w.amount), 0);

  return (
    <div>
      {/* Actions Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 }}>
        <div style={{ display: "flex", gap: 15 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Tìm kiếm yêu cầu..."
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

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "12px 15px",
              borderRadius: 10,
              border: "1px solid #e0e0e0",
              fontSize: 14,
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="completed">Đã chuyển</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15, marginBottom: 25 }}>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Chờ duyệt</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: "#ff9800" }}>{totalPending}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{formatCurrency(totalPendingAmount)}</p>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Đã chuyển (tháng)</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: "#4caf50" }}>{totalCompleted}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{formatCurrency(totalCompletedAmount)}</p>
        </div>
        <div style={{ background: "white", borderRadius: 12, padding: 20, boxShadow: "0 2px 10px rgba(0,0,0,0.05)", gridColumn: "span 2" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#666", marginBottom: 10 }}>Thao tác hàng loạt</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{
                padding: "10px 20px",
                background: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ✅ Duyệt tất cả
            </button>
            <button
              style={{
                padding: "10px 20px",
                background: "#f44336",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ❌ Từ chối tất cả
            </button>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
              <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>Mã rút</th>
              <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>CTV</th>
              <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>Ngân hàng</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Nhận qua</th>
              <th style={{ padding: "12px 8px", textAlign: "right", color: "#666", fontSize: 13 }}>Số tiền</th>
              <th style={{ padding: "12px 8px", textAlign: "right", color: "#666", fontSize: 13 }}>Phí</th>
              <th style={{ padding: "12px 8px", textAlign: "right", color: "#666", fontSize: 13 }}>Thực nhận</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Trạng thái</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Ngày yêu cầu</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredWithdrawals.map((withdrawal) => (
              <tr key={withdrawal.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "12px 8px", fontWeight: "700", color: "#1a1a2e" }}>#{withdrawal.id}</td>
                <td style={{ padding: "12px 8px" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#333" }}>{withdrawal.userName || withdrawal.ctv?.nguoiDung?.ho_ten || "N/A"}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{withdrawal.email || withdrawal.ctv?.nguoiDung?.email || "N/A"}</p>
                  </div>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: "#333" }}>{withdrawal.ten_ngan_hang || withdrawal.bankName || "N/A"}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#888" }}>****{withdrawal.so_tk_ngan_hang?.slice(-4) || withdrawal.accountNumber?.slice(-4) || "0000"}</p>
                  </div>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  <span style={{
                    background: (withdrawal.phuong_thuc === "momo") ? "#f3e5f5" : "#e3f2fd",
                    color: (withdrawal.phuong_thuc === "momo") ? "#8e24aa" : "#1e88e5",
                    padding: "4px 10px",
                    borderRadius: 15,
                    fontSize: 11,
                    fontWeight: "600"
                  }}>
                    {withdrawal.phuong_thuc === "momo" ? "💰 MoMo" : "🏦 NH"}
                  </span>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "700", color: "#e53935" }}>
                  {formatCurrency(withdrawal.so_tien || withdrawal.amount)}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", color: "#888" }}>
                  {formatCurrency(withdrawal.phi || withdrawal.fee || 1000)}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "700", color: "#4caf50" }}>
                  {formatCurrency((withdrawal.so_tien || withdrawal.amount) - (withdrawal.phi || withdrawal.fee || 1000))}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>{getStatusBadge(withdrawal.trang_thai || withdrawal.status)}</td>
                <td style={{ padding: "12px 8px", textAlign: "center", color: "#888", fontSize: 13 }}>{withdrawal.ngay_yeu_cau?.split('T')[0] || withdrawal.requestDate}</td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  {(withdrawal.trang_thai === "cho_duyet" || withdrawal.status === "pending") ? (
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button
                        onClick={() => handleApproveClick(withdrawal.id)}
                        style={{
                          padding: "6px 12px",
                          background: "#4caf50",
                          border: "none",
                          borderRadius: 6,
                          color: "white",
                          fontSize: 12,
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        ✅ Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(withdrawal.id)}
                        style={{
                          padding: "6px 12px",
                          background: "#f44336",
                          border: "none",
                          borderRadius: 6,
                          color: "white",
                          fontSize: 12,
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        ❌ Từ chối
                      </button>
                    </div>
                  ) : (
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
                      👁️ Chi tiết
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm Modal */}
      {showMethodModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ background: "white", padding: 30, borderRadius: 16, maxWidth: 400, width: "90%" }}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: 18 }}>Xác nhận duyệt rút tiền</h3>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 20 }}>
              Bạn có chắc muốn duyệt yêu cầu rút tiền #{selectedId}?
            </p>
            <div style={{ display: "flex", gap: 15 }}>
              <button
                onClick={handleConfirmApprove}
                style={{
                  flex: 1, padding: "12px 20px", background: "#4caf50", color: "white",
                  border: "none", borderRadius: 8, fontSize: 14, fontWeight: "600", cursor: "pointer"
                }}
              >
                ✅ Duyệt
              </button>
              <button
                onClick={() => setShowMethodModal(false)}
                style={{
                  flex: 1, padding: "12px 20px", background: "#f5f5f5", color: "#666",
                  border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer"
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && qrData && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{ background: "white", padding: 30, borderRadius: 16, maxWidth: 450, width: "90%", textAlign: "center" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: 18, color: "#8e24aa" }}>💰 QR Code Rút Tiền</h3>
            <img src={qrData.qrUrl} alt="QR Code" style={{ width: 250, height: 250, marginBottom: 20 }} />
            <div style={{ textAlign: "left", background: "#f5f5f5", padding: 15, borderRadius: 10, marginBottom: 20 }}>
              <p style={{ margin: "0 0 8px 0", fontSize: 14 }}><strong>Ngân hàng:</strong> {qrData.bankName}</p>
              <p style={{ margin: "0 0 8px 0", fontSize: 14 }}><strong>Số tài khoản:</strong> {qrData.accountNumber}</p>
              <p style={{ margin: "0 0 8px 0", fontSize: 14 }}><strong>Tên chủ TK:</strong> {qrData.accountName}</p>
              <p style={{ margin: "0 0 8px 0", fontSize: 14, color: "#e53935" }}><strong>Số tiền:</strong> {formatCurrency(qrData.amount)}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}><strong>Mã rút tiền:</strong> {qrData.withdrawalId}</p>
            </div>
            <p style={{ fontSize: 12, color: "#666", marginBottom: 15 }}>
              CTV có thể quét mã QR này để nhận tiền qua MoMo
            </p>
            <button
              onClick={handleCloseQR}
              style={{
                padding: "12px 30px", background: "#4caf50", color: "white",
                border: "none", borderRadius: 8, fontSize: 14, fontWeight: "600", cursor: "pointer"
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
