import { useState } from "react";

const initialPayments = [
  {
    id: "HD001",
    studentName: "Nguyễn Văn A",
    phone: "0912 345 678",
    courses: [{ name: "IELTS 5.5", price: 3500000 }],
    total: 3500000,
    paid: 3500000,
    remaining: 0,
    discount: 0,
    discountCode: null,
    status: "paid",
    createdAt: "2024-04-01",
    payments: [{ date: "2024-04-01", amount: 3500000, method: "Tiền mặt", note: "Thanh toán đầy đủ" }],
    note: "Học viên đăng ký trực tiếp",
  },
  {
    id: "HD002",
    studentName: "Trần Thị B",
    phone: "0987 654 321",
    courses: [{ name: "TOEIC 750", price: 2800000 }],
    total: 2800000,
    paid: 1400000,
    remaining: 1400000,
    discount: 0,
    discountCode: null,
    status: "partial",
    createdAt: "2024-04-05",
    payments: [{ date: "2024-04-05", amount: 1400000, method: "Chuyển khoản", note: "Đặt cọc trước" }],
    note: "Thanh toán 2 đợt",
  },
  {
    id: "HD003",
    studentName: "Lê Văn C",
    phone: "0934 567 890",
    courses: [{ name: "IELTS 6.5", price: 4200000 }],
    total: 4200000,
    paid: 0,
    remaining: 4200000,
    discount: 420000,
    discountCode: "IELTS2024",
    status: "unpaid",
    createdAt: "2024-04-10",
    payments: [],
    note: "Áp dụng giảm giá 10%",
  },
  {
    id: "HD004",
    studentName: "Phạm Thị D",
    phone: "0901 234 567",
    courses: [
      { name: "General English", price: 2500000 },
      { name: "IELTS Beginner", price: 2000000 },
    ],
    total: 4500000,
    paid: 4500000,
    remaining: 0,
    discount: 225000,
    discountCode: "SUMMER24",
    status: "paid",
    createdAt: "2024-04-12",
    payments: [
      { date: "2024-04-12", amount: 2250000, method: "Tiền mặt", note: "Đợt 1" },
      { date: "2024-04-20", amount: 2250000, method: "Chuyển khoản", note: "Đợt 2" },
    ],
    note: "Đăng ký 2 khóa",
  },
  {
    id: "HD005",
    studentName: "Ngô Văn E",
    phone: "0978 901 234",
    courses: [{ name: "Business English", price: 5000000 }],
    total: 5000000,
    paid: 1000000,
    remaining: 4000000,
    discount: 0,
    discountCode: null,
    status: "partial",
    createdAt: "2024-04-15",
    payments: [{ date: "2024-04-15", amount: 1000000, method: "Quẹt thẻ", note: "Đặt cọc" }],
    note: "Thanh toán 5 đợt",
  },
];

const statusConfig = {
  paid: { label: "Đã thanh toán", color: "#10b981", bg: "#d1fae5" },
  partial: { label: "Thanh toán một phần", color: "#f59e0b", bg: "#fef3c7" },
  unpaid: { label: "Chưa thanh toán", color: "#ef4444", bg: "#fee2e2" },
};

export default function PaymentManagement() {
  const [payments] = useState(initialPayments);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const formatCurrency = (amount) => (amount || 0).toLocaleString("vi-VN") + " đ";

  const filteredPayments = payments.filter((payment) => {
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;
    const matchesSearch =
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Action Bar */}
      <div style={{ background: "white", borderRadius: 8, padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f5f5f5", borderRadius: 8, padding: "8px 14px", border: "1px solid #ddd", flex: 1, maxWidth: 350 }}>
            <span style={{ color: "#888" }}>🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, color: "black", width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, color: "black", background: "white" }}
            >
              <option value="all">Tất cả</option>
              <option value="paid">Đã thanh toán</option>
              <option value="partial">Thanh toán một phần</option>
              <option value="unpaid">Chưa thanh toán</option>
            </select>

            <button style={{ padding: "8px 16px", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "black" }}>📤 Xuất file</button>
            <button style={{ padding: "8px 16px", background: "#e11d48", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: "600", color: "white" }}>+ Tạo hóa đơn</button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "white", borderRadius: 8, padding: 16 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Tổng hóa đơn</p>
          <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: "bold", color: "black" }}>{payments.length}</p>
        </div>
        <div style={{ background: "white", borderRadius: 8, padding: 16 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Đã thanh toán</p>
          <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: "bold", color: "#10b981" }}>{formatCurrency(payments.filter(p => p.status === "paid").reduce((acc, p) => acc + p.paid, 0))}</p>
        </div>
        <div style={{ background: "white", borderRadius: 8, padding: 16 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Còn phải thu</p>
          <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: "bold", color: "#ef4444" }}>{formatCurrency(payments.filter(p => p.status !== "paid").reduce((acc, p) => acc + p.remaining, 0))}</p>
        </div>
        <div style={{ background: "white", borderRadius: 8, padding: 16 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Giảm giá</p>
          <p style={{ margin: "8px 0 0", fontSize: 24, fontWeight: "bold", color: "#e11d48" }}>{formatCurrency(payments.reduce((acc, p) => acc + p.discount, 0))}</p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 11, fontWeight: "bold", color: "#666", width: 30 }}></th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 11, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Mã đơn</th>
              <th style={{ padding: "12px", textAlign: "left", fontSize: 11, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Học viên</th>
              <th style={{ padding: "12px", textAlign: "right", fontSize: 11, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Tổng tiền</th>
              <th style={{ padding: "12px", textAlign: "right", fontSize: 11, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Đã thanh toán</th>
              <th style={{ padding: "12px", textAlign: "right", fontSize: 11, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Còn lại</th>
              <th style={{ padding: "12px", textAlign: "center", fontSize: 11, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Trạng thái</th>
              <th style={{ padding: "12px", textAlign: "center", fontSize: 11, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => {
              const status = statusConfig[payment.status];
              const isExpanded = expandedId === payment.id;
              return (
                <>
                  <tr key={payment.id} style={{ borderBottom: "1px solid #f5f5f5", background: isExpanded ? "#fafafa" : "white" }}>
                    <td style={{ padding: "12px" }}>
                      <button onClick={() => setExpandedId(isExpanded ? null : payment.id)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: 12 }}>{isExpanded ? "▼" : "▶"}</button>
                    </td>
                    <td style={{ padding: "12px" }}><span style={{ fontSize: 13, fontWeight: "600", color: "black" }}>{payment.id}</span></td>
                    <td style={{ padding: "12px" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: "600", color: "black" }}>{payment.studentName}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#888" }}>{payment.phone}</p>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}><span style={{ fontSize: 13, fontWeight: "600", color: "black" }}>{formatCurrency(payment.total)}</span></td>
                    <td style={{ padding: "12px", textAlign: "right" }}><span style={{ fontSize: 13, fontWeight: "600", color: "#10b981" }}>{formatCurrency(payment.paid)}</span></td>
                    <td style={{ padding: "12px", textAlign: "right" }}><span style={{ fontSize: 13, fontWeight: "600", color: payment.remaining > 0 ? "#ef4444" : "#666" }}>{formatCurrency(payment.remaining)}</span></td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: "600", background: status.bg, color: status.color }}>{status.label}</span>
                    </td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
                        {payment.status !== "paid" && (
                          <button style={{ padding: "4px 10px", background: "#10b981", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: "600", color: "white" }}>💳 Thanh toán</button>
                        )}
                        <button style={{ padding: "4px 10px", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", fontSize: 11, color: "#666" }}>🏷️ Giảm giá</button>
                        {payment.status === "unpaid" && (
                          <button style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", color: "#ef4444" }}>🗑️</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ background: "#fafafa" }}>
                      <td colSpan={8} style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                          <div style={{ background: "white", borderRadius: 8, padding: 14 }}>
                            <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: "bold", color: "black" }}>📋 Thông tin hóa đơn</h4>
                            <div style={{ display: "grid", gap: 8, fontSize: 12 }}>
                              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#666" }}>Mã hóa đơn:</span><span style={{ fontWeight: "600", color: "black" }}>{payment.id}</span></div>
                              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#666" }}>Ngày tạo:</span><span style={{ fontWeight: "600", color: "black" }}>{payment.createdAt}</span></div>
                              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#666" }}>Giảm giá:</span><span style={{ fontWeight: "600", color: "#e11d48" }}>{payment.discountCode ? `-${formatCurrency(payment.discount)} (${payment.discountCode})` : "0 đ"}</span></div>
                              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#666" }}>Ghi chú:</span><span style={{ color: "black" }}>{payment.note}</span></div>
                            </div>
                          </div>
                          <div style={{ background: "white", borderRadius: 8, padding: 14 }}>
                            <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: "bold", color: "black" }}>📚 Danh sách khóa học</h4>
                            <div style={{ display: "grid", gap: 6 }}>
                              {payment.courses.map((course, idx) => (
                                <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", background: "#f5f5f5", borderRadius: 6, fontSize: 12 }}>
                                  <span style={{ color: "black" }}>{course.name}</span>
                                  <span style={{ fontWeight: "600", color: "black" }}>{formatCurrency(course.price)}</span>
                                </div>
                              ))}
                              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#ffe4e6", borderRadius: 6, marginTop: 4 }}>
                                <span style={{ fontWeight: "bold", color: "black" }}>Tổng cộng:</span>
                                <span style={{ fontWeight: "bold", color: "#e11d48" }}>{formatCurrency(payment.total)}</span>
                              </div>
                            </div>
                          </div>
                          <div style={{ background: "white", borderRadius: 8, padding: 14, gridColumn: "span 2" }}>
                            <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: "bold", color: "black" }}>📜 Lịch sử thanh toán</h4>
                            {payment.payments.length === 0 ? (
                              <p style={{ margin: 0, fontSize: 12, color: "#888", textAlign: "center", padding: 16 }}>Chưa có thanh toán nào</p>
                            ) : (
                              <div style={{ display: "grid", gap: 6 }}>
                                {payment.payments.map((pay, idx) => (
                                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "#f5f5f5", borderRadius: 8, border: "1px solid #ddd" }}>
                                    <div>
                                      <p style={{ margin: 0, fontSize: 13, fontWeight: "600", color: "black" }}>{formatCurrency(pay.amount)}</p>
                                      <p style={{ margin: "4px 0 0", fontSize: 11, color: "#666" }}>{pay.date} • {pay.method}</p>
                                    </div>
                                    <span style={{ fontSize: 11, color: "#666", maxWidth: 120 }}>{pay.note}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
