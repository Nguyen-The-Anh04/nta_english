import { useState } from "react";
import {
  Search,
  ClipboardList,
  Calendar,
  Clock,
  DollarSign,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  FileText,
  Bell
} from "lucide-react";

const registrationAppointments = [
  {
    id: "REG001",
    name: "Nguyễn Văn A",
    phone: "0912 345 678",
    email: "nguyenvana@gmail.com",
    course: "IELTS 5.5",
    expectedDate: "2024-04-22",
    amount: 3500000,
    staff: "Nguyễn Thị Mai",
    status: "sap-den",
    note: "Học viên xác nhận sẽ đóng tiền vào ngày mai",
  },
  {
    id: "REG002",
    name: "Trần Thị B",
    phone: "0987 654 321",
    email: "tranthib@yahoo.com",
    course: "TOEIC 750",
    expectedDate: "2024-04-23",
    amount: 2800000,
    staff: "Lê Văn Hùng",
    status: "chua-xac-nhan",
    note: "Chờ học viên xác nhận lại",
  },
  {
    id: "REG003",
    name: "Lê Văn C",
    phone: "0934 567 890",
    email: "levanc@gmail.com",
    course: "IELTS 6.5",
    expectedDate: "2024-04-21",
    amount: 4200000,
    staff: "NguyỆn Thị Mai",
    status: "qua-han",
    note: "Đã quá hạn 1 ngày, cần liên hệ lại",
  },
  {
    id: "REG004",
    name: "Phạm Thị D",
    phone: "0901 234 567",
    email: "phamthid@gmail.com",
    course: "General English",
    expectedDate: "2024-04-25",
    amount: 2500000,
    staff: "Trần Văn Đức",
    status: "sap-den",
    note: "Học viên sẽ đóng tiền vào cuối tuần",
  },
  {
    id: "REG005",
    name: "Ngô Văn E",
    phone: "0978 901 234",
    email: "ngovane@gmail.com",
    course: "Business English",
    expectedDate: "2024-04-24",
    amount: 5000000,
    staff: "Lê Văn Hùng",
    status: "da-thanh-toan",
    note: "Đã thanh toán đầy đủ",
  },
];

const statusConfig = {
  "sap-den": { label: "Sắp đến hạn", color: "#3b82f6", bg: "#dbeafe", icon: Clock },
  "chua-xac-nhan": { label: "Chưa xác nhận", color: "#f59e0b", bg: "#fef3c7", icon: AlertCircle },
  "qua-han": { label: "Quá hạn", color: "#ef4444", bg: "#fee2e2", icon: AlertCircle },
  "da-thanh-toan": { label: "Đã thanh toán", color: "#10b981", bg: "#d1fae5", icon: CheckCircle },
};

export default function RegistrationAppointments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredAppointments = registrationAppointments.filter((apt) => {
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    const matchesSearch =
      apt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.phone.includes(searchTerm) ||
      apt.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatCurrency = (amount) => {
    return amount.toLocaleString("vi-VN") + " đ";
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: "700", color: "#1e293b" }}>
              Hẹn đăng ký
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Danh sách khách hàng sắp đóng tiền
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid #e2e8f0",
                fontSize: 14,
                color: "#1e293b",
                background: "white",
                cursor: "pointer",
              }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="sap-den">Sắp đến hạn</option>
              <option value="chua-xac-nhan">Chưa xác nhận</option>
              <option value="qua-han">Quá hạn</option>
              <option value="da-thanh-toan">Đã thanh toán</option>
            </select>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                background: "#f8fafc",
                borderRadius: 12,
                padding: "10px 16px",
                border: "1px solid #e2e8f0",
                minWidth: 250,
              }}
            >
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontSize: 14,
                  color: "#1e293b",
                  width: "100%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {Object.entries(statusConfig).map(([key, status]) => {
          const count = registrationAppointments.filter((apt) => apt.status === key).length;
          const total = registrationAppointments
            .filter((apt) => apt.status === key)
            .reduce((acc, apt) => acc + apt.amount, 0);
          
          return (
            <div
              key={key}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                borderLeft: `4px solid ${status.color}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <status.icon size={20} color={status.color} />
                <span style={{ fontSize: 13, color: "#64748b" }}>{status.label}</span>
              </div>
              <p style={{ margin: 0, fontSize: 28, fontWeight: "800", color: "#1e293b" }}>{count}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>{formatCurrency(total)}</p>
            </div>
          );
        })}
      </div>

      {/* Cards */}
      <div style={{ display: "grid", gap: 16 }}>
        {filteredAppointments.map((apt) => {
          const status = statusConfig[apt.status];
          const StatusIcon = status.icon;
          const isUrgent = apt.status === "qua-han" || apt.status === "chua-xac-nhan";

          return (
            <div
              key={apt.id}
              style={{
                background: "white",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                borderLeft: isUrgent ? "4px solid #e11d48" : "4px solid transparent",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", gap: 16, flex: 1, minWidth: 250 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: isUrgent ? "#fee2e2" : status.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ClipboardList size={28} color={isUrgent ? "#e11d48" : status.color} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: "700", color: "#1e293b" }}>{apt.name}</h3>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: "600",
                        background: status.bg,
                        color: status.color,
                      }}
                    >
                      <StatusIcon size={14} />
                      {status.label}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                    {apt.course} • {apt.id}
                  </p>
                  <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Phone size={14} color="#94a3b8" />
                      <span style={{ fontSize: 13, color: "#64748b" }}>{apt.phone}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Mail size={14} color="#94a3b8" />
                      <span style={{ fontSize: 13, color: "#64748b" }}>{apt.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: "800", color: "#10b981" }}>
                    {formatCurrency(apt.amount)}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, justifyContent: "flex-end" }}>
                    <Calendar size={14} color="#94a3b8" />
                    <span style={{ fontSize: 13, color: apt.status === "qua-han" ? "#ef4444" : "#64748b", fontWeight: apt.status === "qua-han" ? "600" : "400" }}>
                      {apt.expectedDate}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>NV: {apt.staff}</p>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    style={{
                      padding: "10px 16px",
                      background: apt.status === "da-thanh-toan" ? "#f1f5f9" : "#e11d48",
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: "600",
                      color: apt.status === "da-thanh-toan" ? "#64748b" : "white",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <FileText size={16} />
                    {apt.status === "da-thanh-toan" ? "Xem hóa đơn" : "Xác nhận"}
                  </button>
                  <button
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      background: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#3b82f6",
                    }}
                    title="Gửi nhắc nhở"
                  >
                    <Bell size={16} />
                  </button>
                  <button
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                      background: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#64748b",
                    }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
