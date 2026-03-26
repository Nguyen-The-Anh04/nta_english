import { useState } from "react";

const initialLeads = [
  {
    id: "LD001",
    name: "Nguyễn Văn A",
    phone: "0912 345 678",
    email: "nguyenvana@gmail.com",
    status: "can-tu-van",
    staff: "Nguyễn Thị Mai",
    date: "2024-04-20",
    source: "Facebook",
    note: "Học IELTS 5.5, cần tư vấn lộ trình",
  },
  {
    id: "LD002",
    name: "Trần Thị B",
    phone: "0987 654 321",
    email: "tranthib@yahoo.com",
    status: "da-hen-test",
    staff: "Lê Văn Hùng",
    date: "2024-04-19",
    source: "Google",
    note: "Hẹn test ngày 25/04/2024",
  },
  {
    id: "LD003",
    name: "Lê Văn C",
    phone: "0934 567 890",
    email: "levanc@gmail.com",
    status: "lien-he-sau",
    staff: "Nguyễn Thị Mai",
    date: "2024-04-18",
    source: "Giới thiệu",
    note: "Đang cân nhắc, liên hệ lại tuần sau",
  },
  {
    id: "LD004",
    name: "Phạm Thị D",
    phone: "0901 234 567",
    email: "phamthid@gmail.com",
    status: "uu-tien",
    staff: "Trần Văn Đức",
    date: "2024-04-20",
    source: "Zalo",
    note: "Khách hàng tiềm năng cao, có ngân sách",
  },
  {
    id: "LD005",
    name: "Ngô Văn E",
    phone: "0978 901 234",
    email: "ngovane@gmail.com",
    status: "khach-chi-hoi",
    staff: "Nguyễn Thị Mai",
    date: "2024-04-17",
    source: "Website",
    note: "Chỉ hỏi thông tin, chưa có nhu cầu rõ ràng",
  },
  {
    id: "LD006",
    name: "Vũ Thị F",
    phone: "0965 432 109",
    email: "vuthif@gmail.com",
    status: "da-den-trung-tam",
    staff: "Lê Văn Hùng",
    date: "2024-04-20",
    source: "Facebook",
    note: "Đã đến tư vấn, chờ quyết định",
  },
];

const statusConfig = {
  "can-tu-van": { label: "Cần tư vấn", color: "#f59e0b", bg: "#fef3c7" },
  "da-hen-test": { label: "Đã hẹn test", color: "#3b82f6", bg: "#dbeafe" },
  "lien-he-sau": { label: "Liên hệ sau", color: "#666", bg: "#f5f5f5" },
  "uu-tien": { label: "Ưu tiên", color: "#e11d48", bg: "#ffe4e6" },
  "khach-chi-hoi": { label: "Khách chỉ hỏi", color: "#8b5cf6", bg: "#ede9fe" },
  "da-den-trung-tam": { label: "Đã đến TT", color: "#10b981", bg: "#d1fae5" },
};

export default function Leads() {
  const [leads] = useState(initialLeads);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filters = [
    { id: "all", label: "Tất cả", count: 6 },
    { id: "can-tu-van", label: "Cần tư vấn", count: 1 },
    { id: "da-hen-test", label: "Đã hẹn test", count: 1 },
    { id: "lien-he-sau", label: "Liên hệ sau", count: 1 },
    { id: "uu-tien", label: "Ưu tiên", count: 1 },
    { id: "khach-chi-hoi", label: "Khách chỉ hỏi", count: 1 },
    { id: "da-den-trung-tam", label: "Đã đến TT", count: 1 },
  ];

  const filteredLeads = leads.filter((lead) => {
    const matchesFilter = activeFilter === "all" || lead.status === activeFilter;
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      {/* Action Bar */}
      <div
        style={{
          background: "white",
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "#f5f5f5",
              borderRadius: 8,
              padding: "8px 14px",
              border: "1px solid #ddd",
              flex: 1,
              maxWidth: 350,
            }}
          >
            <span style={{ color: "#888" }}>🔍</span>
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
                color: "black",
                width: "100%",
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "#f5f5f5",
                border: "1px solid #ddd",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                color: "black",
              }}
            >
              📥 Import
            </button>
            <button
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "#f5f5f5",
                border: "1px solid #ddd",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                color: "black",
              }}
            >
              📤 Xuất file
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "#e11d48",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: "600",
                color: "white",
              }}
            >
              + Thêm lead
            </button>
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          overflowX: "auto",
        }}
      >
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            style={{
              padding: "8px 14px",
              background: activeFilter === filter.id ? "#e11d48" : "white",
              border: `1px solid ${activeFilter === filter.id ? "#e11d48" : "#ddd"}`,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              color: activeFilter === filter.id ? "white" : "black",
              whiteSpace: "nowrap",
            }}
          >
            {filter.label}
            <span
              style={{
                marginLeft: 6,
                padding: "2px 8px",
                background: activeFilter === filter.id ? "rgba(255,255,255,0.2)" : "#f5f5f5",
                borderRadius: 20,
                fontSize: 11,
              }}
            >
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          background: "white",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Thông tin</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Liên hệ</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Trạng thái</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>NV phụ trách</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => {
              const status = statusConfig[lead.status];
              return (
                <tr key={lead.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "black" }}>{lead.name}</p>
                      <p style={{ margin: "4px 0 0", fontSize: 11, color: "#888" }}>{lead.id} • {lead.date}</p>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 13, color: "black" }}>📞 {lead.phone}</span>
                      <span style={{ fontSize: 12, color: "#666" }}>✉️ {lead.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: "600",
                        background: status.bg,
                        color: status.color,
                      }}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 13, color: "black" }}>{lead.staff}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                      <button style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", color: "#666" }}>✏️</button>
                      <button style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", color: "#666" }}>💬</button>
                      <button style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", color: "#666" }}>⋯</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#666" }}>Hiển thị 1-{filteredLeads.length} của {leads.length} leads</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: 12, color: "#666" }}>Trước</button>
            <button style={{ padding: "6px 12px", borderRadius: 6, background: "#e11d48", border: "none", cursor: "pointer", fontSize: 12, color: "white", fontWeight: "600" }}>1</button>
            <button style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: 12, color: "#666" }}>Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
