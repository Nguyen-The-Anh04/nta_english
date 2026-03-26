import { useState } from "react";

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Mock data
  const users = [
    { id: 33311, name: "Nguyễn Văn A", email: "a@example.com", phone: "0912345678", refCode: "REFABC123", joinDate: "2024-03-23", status: "active", f1: 5, f2: 3, f3: 1, totalRevenue: 1200000 },
    { id: 33466, name: "Trần Thị B", email: "b@example.com", phone: "0923456789", refCode: "REFDEF456", joinDate: "2024-03-24", status: "active", f1: 3, f2: 2, f3: 0, totalRevenue: 980000 },
    { id: 33467, name: "Lê Văn C", email: "c@example.com", phone: "0934567890", refCode: "REFGHI789", joinDate: "2024-03-25", status: "active", f1: 4, f2: 1, f3: 2, totalRevenue: 850000 },
    { id: 33468, name: "Phạm Thị D", email: "d@example.com", phone: "0945678901", refCode: "REFJKL012", joinDate: "2024-03-26", status: "inactive", f1: 2, f2: 0, f3: 0, totalRevenue: 320000 },
    { id: 33469, name: "Ngô Văn E", email: "e@example.com", phone: "0956789012", refCode: "REFMNO345", joinDate: "2024-03-27", status: "active", f1: 6, f2: 4, f3: 2, totalRevenue: 1500000 },
    { id: 33470, name: "Vũ Thị F", email: "f@example.com", phone: "0967890123", refCode: "REFPQR678", joinDate: "2024-03-28", status: "pending", f1: 0, f2: 0, f3: 0, totalRevenue: 0 },
  ];

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString("vi-VN") + " đ";
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.refCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: "#e8f5e9", color: "#4caf50", text: "Hoạt động" },
      inactive: { bg: "#ffebee", color: "#f44336", text: "Khóa" },
      pending: { bg: "#fff3e0", color: "#ff9800", text: "Chờ duyệt" },
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

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id));
    }
  };

  return (
    <div>
      {/* Actions Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 25 }}>
        <div style={{ display: "flex", gap: 15 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Tìm kiếm CTV..."
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

          {/* Filter */}
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
            <option value="active">Hoạt động</option>
            <option value="inactive">Khóa</option>
            <option value="pending">Chờ duyệt</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {selectedUsers.length > 0 && (
            <>
              <button
                style={{
                  padding: "12px 20px",
                  background: "#ff9800",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Khóa ({selectedUsers.length})
              </button>
              <button
                style={{
                  padding: "12px 20px",
                  background: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Kích hoạt ({selectedUsers.length})
              </button>
            </>
          )}
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
            + Thêm CTV
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 15, marginBottom: 25 }}>
        {[
          { label: "Tổng CTV", value: users.length, color: "#2196f3" },
          { label: "Đang hoạt động", value: users.filter((u) => u.status === "active").length, color: "#4caf50" },
          { label: "Chờ duyệt", value: users.filter((u) => u.status === "pending").length, color: "#ff9800" },
          { label: "Bị khóa", value: users.filter((u) => u.status === "inactive").length, color: "#f44336" },
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: "white",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ margin: 0, fontSize: 13, color: "#666" }}>{stat.label}</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: "800", color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #f0f0f0" }}>
              <th style={{ padding: "12px 8px", textAlign: "left" }}>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                  style={{ cursor: "pointer" }}
                />
              </th>
              <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>CTV</th>
              <th style={{ padding: "12px 8px", textAlign: "left", color: "#666", fontSize: 13 }}>Mã giới thiệu</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>F1</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>F2</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>F3</th>
              <th style={{ padding: "12px 8px", textAlign: "right", color: "#666", fontSize: 13 }}>Doanh thu</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Trạng thái</th>
              <th style={{ padding: "12px 8px", textAlign: "center", color: "#666", fontSize: 13 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "12px 8px" }}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                    style={{ cursor: "pointer" }}
                  />
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #e53935 0%, #c62828 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: "bold",
                      }}
                    >
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#333" }}>{user.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{user.email}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <span
                    style={{
                      background: "#f5f5f5",
                      padding: "5px 10px",
                      borderRadius: 6,
                      fontSize: 12,
                      fontFamily: "monospace",
                      fontWeight: "600",
                    }}
                  >
                    {user.refCode}
                  </span>
                </td>
                <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: "600", color: "#4caf50" }}>{user.f1}</td>
                <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: "600", color: "#2196f3" }}>{user.f2}</td>
                <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: "600", color: "#9c27b0" }}>{user.f3}</td>
                <td style={{ padding: "12px 8px", textAlign: "right", fontWeight: "700", color: "#e53935" }}>
                  {formatCurrency(user.totalRevenue)}
                </td>
                <td style={{ padding: "12px 8px", textAlign: "center" }}>{getStatusBadge(user.status)}</td>
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

        {filteredUsers.length === 0 && (
          <div style={{ textAlign: "center", padding: 40 }}>
            <span style={{ fontSize: 48, display: "block", marginBottom: 15 }}>🔍</span>
            <p style={{ color: "#666" }}>Không tìm thấy CTV nào</p>
          </div>
        )}
      </div>
    </div>
  );
}
