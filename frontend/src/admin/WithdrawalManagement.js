import { useState } from "react";

export default function WithdrawalManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedWithdrawals, setSelectedWithdrawals] = useState([]);

  // Mock data
  const withdrawals = [
    { id: 126087, userId: 33311, userName: "Nguyễn Văn A", email: "a@example.com", phone: "0912345678", amount: 500000, fee: 1000, receiveAmount: 499000, bankName: "MB BANK", accountNumber: "53775825964855", accountName: "NGUYEN VAN A", status: "pending", requestDate: "2024-04-20", processDate: null },
    { id: 126088, userId: 33466, userName: "Trần Thị B", email: "b@example.com", phone: "0923456789", amount: 300000, fee: 1000, receiveAmount: 299000, bankName: "Vietcombank", accountNumber: "1234567890", accountName: "TRAN THI B", status: "pending", requestDate: "2024-04-20", processDate: null },
    { id: 140392, userId: 33467, userName: "Lê Văn C", email: "c@example.com", phone: "0934567890", amount: 200000, fee: 1000, receiveAmount: 199000, bankName: "Techcombank", accountNumber: "9876543210", accountName: "LE VAN C", status: "completed", requestDate: "2024-04-19", processDate: "2024-04-19" },
    { id: 140393, userId: 33468, userName: "Phạm Thị D", email: "d@example.com", phone: "0945678901", amount: 150000, fee: 1000, receiveAmount: 149000, bankName: "Agribank", accountNumber: "4567891230", accountName: "PHAM THI D", status: "completed", requestDate: "2024-04-18", processDate: "2024-04-18" },
    { id: 140394, userId: 33469, userName: "Ngô Văn E", email: "e@example.com", phone: "0956789012", amount: 100000, fee: 1000, receiveAmount: 99000, bankName: "BIDV", accountNumber: "3216549870", accountName: "NGO VAN E", status: "rejected", requestDate: "2024-04-17", processDate: "2024-04-17", rejectReason: "Số tài khoản không chính xác" },
    { id: 140395, userId: 33470, userName: "Vũ Thị F", email: "f@example.com", phone: "0967890123", amount: 80000, fee: 1000, receiveAmount: 79000, bankName: "VPBank", accountNumber: "6543217890", accountName: "VU THI F", status: "completed", requestDate: "2024-04-16", processDate: "2024-04-16" },
  ];

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("vi-VN") + " đ";
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    const matchesSearch = 
      w.id.toString().includes(searchTerm) ||
      w.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || w.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: "#fff3e0", color: "#ff9800", text: "Chờ duyệt" },
      completed: { bg: "#e8f5e9", color: "#4caf50", text: "Đã chuyển" },
      rejected: { bg: "#ffebee", color: "#f44336", text: "Từ chối" },
    };
    const config = statusConfig[status] || statusConfig.pending;
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

  const handleApprove = (id) => {
    if (window.confirm(`Bạn có chắc duyệt yêu cầu rút tiền #${id}?`)) {
      alert(`Đã duyệt yêu cầu #${id}`);
    }
  };

  const handleReject = (id) => {
    const reason = window.prompt("Nhập lý do từ chối:");
    if (reason) {
      alert(`Đã từ chối yêu cầu #${id} với lý do: ${reason}`);
    }
  };

  // Stats
  const totalPending = withdrawals.filter(w => w.status === "pending").length;
  const totalPendingAmount = withdrawals.filter(w => w.status === "pending").reduce((sum, w) => sum + w.amount, 0);
  const totalCompleted = withdrawals.filter(w => w.status === "completed").length;
  const totalCompletedAmount = withdrawals.filter(w => w.status === "completed").reduce((sum, w) => sum + w.amount, 0);

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
                    <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#333" }}>{withdrawal.userName}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{withdrawal.email}</p>
                  </div>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, color: "#333" }}>{withdrawal.bankName}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#888" }}>****{withdrawal.accountNumber.slice(-4)}</p>
                  </div>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "700", color: "#e53935" }}>
                  {formatCurrency(withdrawal.amount)}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", color: "#888" }}>
                  {formatCurrency(withdrawal.fee)}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "700", color: "#4caf50" }}>
                  {formatCurrency(withdrawal.receiveAmount)}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>{getStatusBadge(withdrawal.status)}</td>
                <td style={{ padding: "12px 8px", textAlign: "center", color: "#888", fontSize: 13 }}>{withdrawal.requestDate}</td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>
                  {withdrawal.status === "pending" ? (
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <button
                        onClick={() => handleApprove(withdrawal.id)}
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
    </div>
  );
}
