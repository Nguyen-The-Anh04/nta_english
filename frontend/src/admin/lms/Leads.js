import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { fetchLeads, updateLead, deleteLead, createLead } from "../../api";

const STATUS_OPTIONS = [
  { id: "moi", label: "Mới", color: "#3b82f6", bg: "#dbeafe" },
  { id: "da_tiep_nhan", label: "Đã tiếp nhận", color: "#f59e0b", bg: "#fef3c7" },
  { id: "da_hen_test", label: "Đã hẹn test", color: "#8b5cf6", bg: "#ede9fe" },
  { id: "da_test", label: "Đã test", color: "#10b981", bg: "#d1fae5" },
  { id: "da_dk_hoc", label: "Đã đăng ký học", color: "#059669", bg: "#dcfce7" },
  { id: "khong_phu_hop", label: "Không phù hợp", color: "#9ca3af", bg: "#f3f4f6" },
];

const NGUON_OPTIONS = [
  { id: "landing_page", label: "Landing Page" },
  { id: "fb_ads", label: "Facebook Ads" },
  { id: "zalo", label: "Zalo" },
  { id: "walkin", label: "Tự đến" },
  { id: "gioi_thieu", label: "Giới thiệu" },
  { id: "khac", label: "Khác" },
];

const EMPTY_FORM = {
  ho_ten: "", sdt: "", email: "", trang_thai: "moi",
  nguon_lead: "landing_page", muc_tieu: "", thoi_gian_hoc: "", ghi_chu: "",
};

const fmtDate = (s) => s ? new Date(s).toLocaleDateString("vi-VN") : "";

const getStatus = (id) => STATUS_OPTIONS.find(s => s.id === id) || STATUS_OPTIONS[0];

export default function Leads({ onNavigateToTest }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 20 });
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => { loadLeads(); }, [filterStatus, search, pagination.page]); // eslint-disable-line

  const loadLeads = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, limit: 20 };
      if (search) params.search = search;
      if (filterStatus !== "all") params.status = filterStatus;
      const data = await fetchLeads(params);
      setLeads(data.leads || []);
      if (data.pagination) setPagination(p => ({ ...p, ...data.pagination }));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openAdd = () => { setForm(EMPTY_FORM); setEditingLead(null); setShowModal(true); };
  const openEdit = (lead) => {
    setForm({ ho_ten: lead.ho_ten || "", sdt: lead.sdt || "", email: lead.email || "",
      trang_thai: lead.trang_thai || "moi", nguon_lead: lead.nguon_lead || "landing_page",
      muc_tieu: lead.muc_tieu || "", thoi_gian_hoc: lead.thoi_gian_hoc || "", ghi_chu: lead.ghi_chu || "" });
    setEditingLead(lead); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.ho_ten || !form.sdt) { alert("Vui lòng nhập tên và số điện thoại!"); return; }
    try {
      if (editingLead) await updateLead(editingLead.id, form);
      else await createLead(form);
      setShowModal(false); loadLeads();
    } catch (e) { alert("Có lỗi xảy ra!"); }
  };

  const handleDelete = async (lead) => {
    try { await deleteLead(lead.id); setDeleteConfirm(null); loadLeads(); }
    catch (e) { alert("Có lỗi khi xóa!"); }
  };

  const handleStatusChange = async (lead, status) => {
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, trang_thai: status } : l));
    try { await updateLead(lead.id, { ...lead, trang_thai: status }); }
    catch (e) { loadLeads(); }
  };

  const handleScheduleTest = (lead) => {
    if (onNavigateToTest) onNavigateToTest("test-appointment", { ...lead });
  };

  const handleExportExcel = () => {
    const STATUS_LABEL = { moi: "Mới", da_tiep_nhan: "Đã tiếp nhận", da_hen_test: "Đã hẹn test", da_test: "Đã test", da_dk_hoc: "Đã đăng ký học", khong_phu_hop: "Không phù hợp" };
    const NGUON_LABEL = { landing_page: "Landing Page", fb_ads: "Facebook Ads", zalo: "Zalo", walkin: "Tự đến", gioi_thieu: "Giới thiệu", khac: "Khác" };
    const rows = leads.map((l, i) => ({
      "STT": i + 1,
      "Họ tên": l.ho_ten || "",
      "Số điện thoại": l.sdt || "",
      "Email": l.email || "",
      "Mục tiêu": l.muc_tieu || "",
      "Thời gian học": l.thoi_gian_hoc || "",
      "Trạng thái": STATUS_LABEL[l.trang_thai] || l.trang_thai || "",
      "Nguồn": NGUON_LABEL[l.nguon_lead] || l.nguon_lead || "",
      "Ghi chú": l.ghi_chu || "",
      "Ngày tạo": fmtDate(l.created_at),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    // Set column widths
    ws["!cols"] = [{ wch: 5 }, { wch: 22 }, { wch: 14 }, { wch: 28 }, { wch: 22 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 30 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `leads_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // Count per status
  const countByStatus = (sid) => leads.filter(l => l.trang_thai === sid).length;

  const FILTERS = [
    { id: "all", label: "Tất cả", count: pagination.total },
    ...STATUS_OPTIONS.map(s => ({ ...s, count: countByStatus(s.id) })),
  ];

  const inp = { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box", outline: "none" };
  const lbl = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 };

  return (
    <div style={{ padding: "20px 24px", background: "#f9fafb", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#e11d48" }}>Quản lý Lead</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            placeholder="Tìm kiếm họ tên, sdt..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, width: 240, outline: "none" }}
          />
          <button onClick={handleExportExcel}
            style={{ padding: "8px 16px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Xuất Excel
          </button>
          <button onClick={openAdd}
            style={{ padding: "8px 18px", background: "#e11d48", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            + Thêm lead
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => { setFilterStatus(f.id); setPagination(p => ({ ...p, page: 1 })); }}
            style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 13, cursor: "pointer", fontWeight: filterStatus === f.id ? 700 : 400,
              border: filterStatus === f.id ? "none" : "1px solid #d1d5db",
              background: filterStatus === f.id ? "#e11d48" : "#fff",
              color: filterStatus === f.id ? "#fff" : "#374151",
              transition: "all 0.15s"
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div style={{ overflowX: "auto", position: "relative" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ background: "#e11d48" }}>
                {["#", "Họ tên / ID", "SDT / Email", "Mục tiêu", "Trạng thái", "Nguồn", "Ngày tạo"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#fff", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
                <th style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#fff", textAlign: "left", whiteSpace: "nowrap",
                  position: "sticky", right: 0, zIndex: 3, background: "#e11d48", boxShadow: "-3px 0 8px rgba(0,0,0,0.15)" }}>
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Đang tải dữ liệu...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Chưa có lead nào</td></tr>
              ) : leads.map((lead, idx) => {
                const st = getStatus(lead.trang_thai);
                return (
                  <tr key={lead.id}
                    style={{ borderBottom: "1px solid #f3f4f6", background: "#fff", transition: "background 0.1s" }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#fef2f2";
                      const stickyTd = e.currentTarget.querySelector('td[data-sticky]');
                      if (stickyTd) stickyTd.style.background = "#fef2f2";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#fff";
                      const stickyTd = e.currentTarget.querySelector('td[data-sticky]');
                      if (stickyTd) stickyTd.style.background = "#fff";
                    }}>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#9ca3af", width: 40 }}>
                      {(pagination.page - 1) * 20 + idx + 1}
                    </td>
                    <td style={{ padding: "12px 14px", minWidth: 140 }}>
                      <div style={{ fontWeight: 700, color: "#e11d48", fontSize: 14, cursor: "pointer" }} onClick={() => openEdit(lead)}>
                        {lead.ho_ten}
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>#{lead.id}</div>
                    </td>
                    <td style={{ padding: "12px 14px", minWidth: 160 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{lead.sdt}</div>
                      {lead.email && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{lead.email}</div>}
                    </td>
                    <td style={{ padding: "12px 14px", maxWidth: 180 }}>
                      <div style={{ fontSize: 13, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lead.muc_tieu || "—"}
                      </div>
                      {lead.thoi_gian_hoc && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{lead.thoi_gian_hoc}</div>}
                    </td>
                    <td style={{ padding: "12px 14px", minWidth: 140 }}>
                      <select value={lead.trang_thai || "moi"} onChange={e => handleStatusChange(lead, e.target.value)}
                        style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: `1px solid ${st.color}44`,
                          cursor: "pointer", background: st.bg, color: st.color, outline: "none" }}>
                        {STATUS_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "12px 14px", minWidth: 120 }}>
                      <select value={lead.nguon_lead || "landing_page"}
                        onChange={e => updateLead(lead.id, { ...lead, nguon_lead: e.target.value }).then(loadLeads)}
                        style={{ padding: "5px 8px", borderRadius: 6, fontSize: 12, border: "1px solid #e5e7eb", cursor: "pointer", outline: "none", maxWidth: 110 }}>
                        {NGUON_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>
                      {fmtDate(lead.created_at)}
                    </td>
                    <td data-sticky="true" style={{ padding: "12px 14px", position: "sticky", right: 0, background: "#fff", boxShadow: "-3px 0 8px rgba(0,0,0,0.08)", zIndex: 1 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <button onClick={() => openEdit(lead)} title="Sửa"
                          style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", color: "#f59e0b", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => setDeleteConfirm(lead)} title="Xóa"
                          style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #fca5a5", background: "#fff", cursor: "pointer", color: "#dc2626", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                        <button onClick={() => handleScheduleTest(lead)}
                          style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#e11d48", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                          Hẹn test
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>
            Tổng cộng: <strong>{pagination.total}</strong> leads
          </span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1}
              style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", fontSize: 12, cursor: "pointer", opacity: pagination.page === 1 ? 0.4 : 1 }}>
              ‹
            </button>
            {Array.from({ length: Math.min(5, pagination.totalPages || 1) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                  style={{ width: 30, height: 30, borderRadius: 6, border: "none", fontSize: 12, cursor: "pointer", fontWeight: pagination.page === p ? 700 : 400,
                    background: pagination.page === p ? "#e11d48" : "#fff", color: pagination.page === p ? "#fff" : "#374151",
                    border: pagination.page === p ? "none" : "1px solid #d1d5db" }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages || 1, p.page + 1) }))} disabled={pagination.page >= (pagination.totalPages || 1)}
              style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", fontSize: 12, cursor: "pointer", opacity: pagination.page >= (pagination.totalPages || 1) ? 0.4 : 1 }}>
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#e11d48", marginBottom: 20 }}>
              {editingLead ? "Chỉnh sửa Lead" : "Thêm Lead mới"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Họ tên *</label>
                <input value={form.ho_ten} onChange={e => setForm(p => ({ ...p, ho_ten: e.target.value }))} placeholder="Nhập họ tên" style={inp} />
              </div>
              <div>
                <label style={lbl}>Số điện thoại *</label>
                <input type="tel" value={form.sdt} onChange={e => setForm(p => ({ ...p, sdt: e.target.value }))} placeholder="0912345678" style={inp} />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" style={inp} />
              </div>
              <div>
                <label style={lbl}>Trạng thái</label>
                <select value={form.trang_thai} onChange={e => setForm(p => ({ ...p, trang_thai: e.target.value }))} style={inp}>
                  {STATUS_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Nguồn</label>
                <select value={form.nguon_lead} onChange={e => setForm(p => ({ ...p, nguon_lead: e.target.value }))} style={inp}>
                  {NGUON_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Mục tiêu</label>
                <input value={form.muc_tieu} onChange={e => setForm(p => ({ ...p, muc_tieu: e.target.value }))} placeholder="IELTS 6.5, TOEIC 700..." style={inp} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Thời gian học</label>
                <input value={form.thoi_gian_hoc} onChange={e => setForm(p => ({ ...p, thoi_gian_hoc: e.target.value }))} placeholder="Tối 2-4-6, sáng thứ 7..." style={inp} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Ghi chú</label>
                <textarea value={form.ghi_chu} onChange={e => setForm(p => ({ ...p, ghi_chu: e.target.value }))} rows={3} placeholder="Ghi chú thêm..." style={{ ...inp, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: "8px 20px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>
                Hủy
              </button>
              <button onClick={handleSave}
                style={{ padding: "8px 20px", background: "#e11d48", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Xác nhận xóa</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
              Bạn có chắc muốn xóa lead <strong>"{deleteConfirm.ho_ten}"</strong>?
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)}
                style={{ padding: "8px 20px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>
                Hủy
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                style={{ padding: "8px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
