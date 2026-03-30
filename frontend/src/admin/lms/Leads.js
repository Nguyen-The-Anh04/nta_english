import { useState, useEffect } from "react";
import { fetchLeads, updateLead, deleteLead, createLead } from "../../api";

const statusConfig = {
  "moi": { label: "Mới", color: "#3b82f6", bg: "#dbeafe" },
  "da_goi": { label: "Đã gọi", color: "#f59e0b", bg: "#fef3c7" },
  "da_tu_van": { label: "Đã tư vấn", color: "#8b5cf6", bg: "#ede9fe" },
  "da_test": { label: "Đã test", color: "#10b981", bg: "#d1fae5" },
  "da_dk_hoc": { label: "Đã ĐK học", color: "#22c55e", bg: "#dcfce7" },
  "khong_phu_hop": { label: "Không phù hợp", color: "#ef4444", bg: "#fee2e2" },
};

const nguonConfig = {
  "landing_page": { label: "Landing Page", color: "#3b82f6" },
  "fb_ads": { label: "Facebook Ads", color: "#1877f2" },
  "zalo": { label: "Zalo", color: "#0068ff" },
  "walkin": { label: "Walk-in", color: "#22c55e" },
};

const statusOptions = [
  { id: "moi", label: "Mới" },
  { id: "da_goi", label: "Đã gọi" },
  { id: "da_tu_van", label: "Đã tư vấn" },
  { id: "da_test", label: "Đã test" },
  { id: "da_dk_hoc", label: "Đã ĐK học" },
  { id: "khong_phu_hop", label: "Không phù hợp" },
];

const nguonOptions = [
  { id: "landing_page", label: "Landing Page" },
  { id: "fb_ads", label: "Facebook Ads" },
  { id: "zalo", label: "Zalo" },
  { id: "walkin", label: "Walk-in" },
];

export default function Leads({ onNavigateToTest }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [nguonFilter, setNguonFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  // Form state
  const [formData, setFormData] = useState({
    ho_ten: "",
    sdt: "",
    email: "",
    trang_thai: "moi",
    nguon_lead: "landing_page",
    muc_tieu: "",
    thoi_gian_hoc: "",
    ghi_chu: "",
  });

  // Fetch leads from API
  useEffect(() => {
    loadLeads();
  }, [activeFilter, nguonFilter, searchTerm, pagination.page]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (activeFilter !== "all") {
        params.status = activeFilter;
      }
      if (nguonFilter !== "all") {
        params.nguon = nguonFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const data = await fetchLeads(params);
      setLeads(data.leads || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Error loading leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const filters = [
    { id: "all", label: "Tất cả", count: pagination.total },
    { id: "moi", label: "Mới", count: leads.filter(l => l.trang_thai === "moi").length },
    { id: "da_goi", label: "Đã gọi", count: leads.filter(l => l.trang_thai === "da_goi").length },
    { id: "da_tu_van", label: "Đã tư vấn", count: leads.filter(l => l.trang_thai === "da_tu_van").length },
    { id: "da_test", label: "Đã test", count: leads.filter(l => l.trang_thai === "da_test").length },
    { id: "da_dk_hoc", label: "Đã ĐK học", count: leads.filter(l => l.trang_thai === "da_dk_hoc").length },
    { id: "khong_phu_hop", label: "Không phù hợp", count: leads.filter(l => l.trang_thai === "khong_phu_hop").length },
  ];

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal for adding
  const openAddModal = () => {
    setFormData({
      ho_ten: "",
      sdt: "",
      email: "",
      trang_thai: "moi",
      nguon_lead: "landing_page",
      muc_tieu: "",
      thoi_gian_hoc: "",
      ghi_chu: "",
    });
    setEditingLead(null);
    setShowAddModal(true);
  };

  // Open modal for editing
  const openEditModal = (lead) => {
    setFormData({
      ho_ten: lead.ho_ten || "",
      sdt: lead.sdt || "",
      email: lead.email || "",
      trang_thai: lead.trang_thai || "moi",
      nguon_lead: lead.nguon_lead || "landing_page",
      muc_tieu: lead.muc_tieu || "",
      thoi_gian_hoc: lead.thoi_gian_hoc || "",
      ghi_chu: lead.ghi_chu || "",
    });
    setEditingLead(lead);
    setShowAddModal(true);
  };

  // Save lead (add or update)
  const handleSave = async () => {
    if (!formData.ho_ten || !formData.sdt) {
      alert("Vui lòng nhập tên và số điện thoại!");
      return;
    }

    try {
      if (editingLead) {
        // Update existing
        await updateLead(editingLead.id, formData);
      } else {
        // Create new lead
        await createLead(formData);
      }
      setShowAddModal(false);
      loadLeads(); // Reload data
    } catch (error) {
      console.error("Error saving lead:", error);
      alert("Có lỗi xảy ra khi lưu!");
    }
  };

  // Delete lead
  const handleDelete = async (lead) => {
    try {
      await deleteLead(lead.id);
      setDeleteConfirm(null);
      loadLeads(); // Reload data
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Có lỗi xảy ra khi xóa!");
    }
  };

  // Schedule test - navigate to test-appointment
  const handleScheduleTest = (lead) => {
    if (onNavigateToTest) {
      onNavigateToTest("test-appointment", lead);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Export to Excel
  const exportToExcel = () => {
    // Prepare data for export
    const exportData = leads.map((lead) => ({
      "ID": lead.id,
      "Họ tên": lead.ho_ten || "",
      "Số điện thoại": lead.sdt || "",
      "Email": lead.email || "",
      "Trạng thái": statusConfig[lead.trang_thai]?.label || lead.trang_thai || "",
      "Nguồn": nguonConfig[lead.nguon_lead]?.label || lead.nguon_lead || "",
      "Mục tiêu": lead.muc_tieu || "",
      "Thời gian học": lead.thoi_gian_hoc || "",
      "Ghi chú": lead.ghi_chu || "",
      "Ngày tạo": formatDate(lead.created_at),
    }));

    // Convert to CSV
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(","),
      ...exportData.map((row) =>
        headers.map((header) => {
          const value = String(row[header] || "");
          // Escape quotes and wrap in quotes if contains comma or quote
          if (value.includes(",") || value.includes("\"")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      ),
    ].join("\n");

    // Add BOM for UTF-8
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `leads_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import from Excel
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const lines = text.split("\n").filter((line) => line.trim());
        if (lines.length < 2) {
          alert("File không có dữ liệu!");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
          const row = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          data.push(row);
        }

        // Map CSV columns to lead fields
        const fieldMapping = {
          "Họ tên": "ho_ten",
          "Số điện thoại": "sdt",
          "Email": "email",
          "Trạng thái": "trang_thai",
          "Nguồn": "nguon_lead",
          "Mục tiêu": "muc_tieu",
          "Thời gian học": "thoi_gian_hoc",
          "Ghi chú": "ghi_chu",
        };

        // Reverse mapping for status and source
        const statusReverseMap = {};
        Object.entries(statusConfig).forEach(([key, value]) => {
          statusReverseMap[value.label] = key;
        });

        const nguonReverseMap = {};
        Object.entries(nguonConfig).forEach(([key, value]) => {
          nguonReverseMap[value.label] = key;
        });

        let successCount = 0;
        let errorCount = 0;

        for (const row of data) {
          const leadData = {};
          Object.entries(fieldMapping).forEach(([csvField, leadField]) => {
            if (row[csvField]) {
              if (leadField === "trang_thai") {
                leadData[leadField] = statusReverseMap[row[csvField]] || "moi";
              } else if (leadField === "nguon_lead") {
                leadData[leadField] = nguonReverseMap[row[csvField]] || "landing_page";
              } else {
                leadData[leadField] = row[csvField];
              }
            }
          });

          // Validate required fields
          if (leadData.ho_ten && leadData.sdt) {
            try {
              await createLead(leadData);
              successCount++;
            } catch (error) {
              console.error("Error importing lead:", error);
              errorCount++;
            }
          } else {
            errorCount++;
          }
        }

        alert(`Import hoàn tất!\nThành công: ${successCount}\nLỗi: ${errorCount}`);
        loadLeads();
      } catch (error) {
        console.error("Error parsing file:", error);
        alert("Lỗi khi đọc file!");
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = "";
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
            <label
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
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                style={{ display: "none" }}
              />
            </label>
            <button
              onClick={exportToExcel}
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

      {/* Source Filter */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          overflowX: "auto",
        }}
      >
        <button
          onClick={() => setNguonFilter("all")}
          style={{
            padding: "6px 12px",
            background: nguonFilter === "all" ? "#3b82f6" : "white",
            border: `1px solid ${nguonFilter === "all" ? "#3b82f6" : "#ddd"}`,
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            color: nguonFilter === "all" ? "white" : "black",
          }}
        >
          Tất cả nguồn
        </button>
        {nguonOptions.map((nguon) => (
          <button
            key={nguon.id}
            onClick={() => setNguonFilter(nguon.id)}
            style={{
              padding: "6px 12px",
              background: nguonFilter === nguon.id ? nguonConfig[nguon.id].color : "white",
              border: `1px solid ${nguonFilter === nguon.id ? nguonConfig[nguon.id].color : "#ddd"}`,
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              color: nguonFilter === nguon.id ? "white" : "black",
            }}
          >
            {nguon.label}
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
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
            Đang tải dữ liệu...
          </div>
        ) : (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Thông tin</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Liên hệ</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Mục tiêu</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Trạng thái</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Nguồn</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const status = statusConfig[lead.trang_thai] || statusConfig["moi"];
                  const nguon = nguonConfig[lead.nguon_lead] || nguonConfig["landing_page"];
                  return (
                    <tr key={lead.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "black" }}>{lead.ho_ten}</p>
                          <p style={{ margin: "4px 0 0", fontSize: 11, color: "#888" }}>ID: {lead.id} • {formatDate(lead.created_at)}</p>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: 13, color: "black" }}>📞 {lead.sdt}</span>
                          {lead.email && <span style={{ fontSize: 12, color: "#666" }}>✉️ {lead.email}</span>}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: 13, color: "black" }}>
                          {lead.muc_tieu || "Chưa xác định"}
                        </div>
                        {lead.thoi_gian_hoc && (
                          <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>
                            ⏰ {lead.thoi_gian_hoc}
                          </div>
                        )}
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
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: "600",
                            background: `${nguon.color}20`,
                            color: nguon.color,
                          }}
                        >
                          {nguon.label}
                        </span>
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
              <span style={{ fontSize: 13, color: "#666" }}>
                Hiển thị {leads.length} / {pagination.total} leads
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    background: pagination.page === 1 ? "#f5f5f5" : "white",
                    cursor: pagination.page === 1 ? "not-allowed" : "pointer",
                    fontSize: 12,
                    color: "#666",
                  }}
                >
                  Trước
                </button>
                <span style={{ padding: "6px 12px", fontSize: 12, color: "#666" }}>
                  Trang {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    border: "1px solid #ddd",
                    background: pagination.page === pagination.totalPages ? "#f5f5f5" : "white",
                    cursor: pagination.page === pagination.totalPages ? "not-allowed" : "pointer",
                    fontSize: 12,
                    color: "#666",
                  }}
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
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
                  name="ho_ten"
                  value={formData.ho_ten}
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
                  name="sdt"
                  value={formData.sdt}
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
                  name="trang_thai"
                  value={formData.trang_thai}
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
                  name="nguon_lead"
                  value={formData.nguon_lead}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                >
                  {nguonOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Goal */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Mục tiêu</label>
                <input
                  type="text"
                  name="muc_tieu"
                  value={formData.muc_tieu}
                  onChange={handleInputChange}
                  placeholder="IELTS 6.5, TOEIC 700..."
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                />
              </div>

              {/* Study Time */}
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Thời gian học</label>
                <input
                  type="text"
                  name="thoi_gian_hoc"
                  value={formData.thoi_gian_hoc}
                  onChange={handleInputChange}
                  placeholder="3 tháng, 6 tháng..."
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                />
              </div>

              {/* Note */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Ghi chú</label>
                <textarea
                  name="ghi_chu"
                  value={formData.ghi_chu}
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
                Bạn có chắc muốn xóa lead <strong>{deleteConfirm.ho_ten}</strong>? Hành động này không thể hoàn tác.
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
