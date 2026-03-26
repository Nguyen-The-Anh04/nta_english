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

const sourceOptions = ["Facebook", "Google", "Zalo", "Website", "Giới thiệu", " hotline"];
const staffOptions = ["Nguyễn Thị Mai", "Lê Văn Hùng", "Trần Văn Đức", "Hoàng Thị Hương"];
const statusOptions = [
  { id: "can-tu-van", label: "Cần tư vấn" },
  { id: "da-hen-test", label: "Đã hẹn test" },
  { id: "lien-he-sau", label: "Liên hệ sau" },
  { id: "uu-tien", label: "Ưu tiên" },
  { id: "khach-chi-hoi", label: "Khách chỉ hỏi" },
  { id: "da-den-trung-tam", label: "Đã đến TT" },
];

export default function Leads({ onNavigateToTest }) {
  const [leads, setLeads] = useState(initialLeads);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    status: "can-tu-van",
    staff: "Nguyễn Thị Mai",
    date: new Date().toISOString().split("T")[0],
    source: "Facebook",
    note: "",
  });

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

  // Generate new ID
  const generateId = () => {
    const maxId = leads.reduce((max, lead) => {
      const num = parseInt(lead.id.replace("LD", ""));
      return num > max ? num : max;
    }, 0);
    return `LD${String(maxId + 1).padStart(3, "0")}`;
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal for adding
  const openAddModal = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      status: "can-tu-van",
      staff: "Nguyễn Thị Mai",
      date: new Date().toISOString().split("T")[0],
      source: "Facebook",
      note: "",
    });
    setEditingLead(null);
    setShowAddModal(true);
  };

  // Open modal for editing
  const openEditModal = (lead) => {
    setFormData({ ...lead });
    setEditingLead(lead);
    setShowAddModal(true);
  };

  // Save lead (add or update)
  const handleSave = () => {
    if (!formData.name || !formData.phone) {
      alert("Vui lòng nhập tên và số điện thoại!");
      return;
    }

    if (editingLead) {
      // Update existing
      setLeads((prev) =>
        prev.map((lead) => (lead.id === editingLead.id ? { ...formData } : lead))
      );
    } else {
      // Add new
      setLeads((prev) => [...prev, { ...formData, id: generateId() }]);
    }
    setShowAddModal(false);
  };

  // Delete lead
  const handleDelete = (lead) => {
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
    setDeleteConfirm(null);
  };

  // Schedule test - navigate to test-appointment
  const handleScheduleTest = (lead) => {
    if (onNavigateToTest) {
      onNavigateToTest("test-appointment", lead);
    }
  };

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
              onClick={openAddModal}
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
                      {/* Edit Button */}
                      <button 
                        onClick={() => openEditModal(lead)}
                        title="Chỉnh sửa"
                        style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        ✏️
                      </button>
                      {/* Delete Button */}
                      <button 
                        onClick={() => setDeleteConfirm(lead)}
                        title="Xóa"
                        style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        🗑️
                      </button>
                      {/* Schedule Test Button */}
                      <button 
                        onClick={() => handleScheduleTest(lead)}
                        title="Hẹn test"
                        style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #3b82f6", background: "#eff6ff", cursor: "pointer", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        📝
                      </button>
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            background: "white",
            borderRadius: 16,
            padding: 24,
            width: "90%",
            maxWidth: 600,
            maxHeight: "90vh",
            overflow: "auto",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: "bold", color: "#1a1a2e" }}>
                {editingLead ? "Chỉnh sửa Lead" : "Thêm Lead mới"}
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#666" }}>×</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Name */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Họ tên *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nhập họ tên"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Số điện thoại *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0912 345 678"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                />
              </div>

              {/* Status */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Source */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Nguồn</label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                >
                  {sourceOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Staff */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>NV phụ trách</label>
                <select
                  name="staff"
                  value={formData.staff}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                >
                  {staffOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Ngày tạo</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                />
              </div>

              {/* Note */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Ghi chú</label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Nhập ghi chú..."
                  rows={3}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14, resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ padding: "10px 20px", border: "1px solid #ddd", borderRadius: 8, background: "white", cursor: "pointer", fontSize: 14, color: "#666" }}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "#e11d48", cursor: "pointer", fontSize: 14, fontWeight: "600", color: "white" }}
              >
                {editingLead ? "Lưu thay đổi" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: "white",
            borderRadius: 16,
            padding: 24,
            width: "90%",
            maxWidth: 400,
          }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <span style={{ fontSize: 28 }}>⚠️</span>
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: "600", color: "#1a1a2e" }}>Xác nhận xóa</h3>
              <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
                Bạn có chắc muốn xóa lead <strong>{deleteConfirm.name}</strong>? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ padding: "10px 24px", border: "1px solid #ddd", borderRadius: 8, background: "white", cursor: "pointer", fontSize: 14, color: "#666" }}
              >
                Hủy
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{ padding: "10px 24px", border: "none", borderRadius: 8, background: "#ef4444", cursor: "pointer", fontSize: 14, fontWeight: "600", color: "white" }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
