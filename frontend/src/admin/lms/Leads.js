import { useState, useEffect } from "react";
import { fetchLeads, updateLead, deleteLead, createLead } from "../../api";

const STATUS_OPTIONS = [
  { id: "moi", label: "Moi" },
  { id: "da_tiep_nhan", label: "Da tiep nhan" },
  { id: "da_hen_test", label: "Da hen test" },
  { id: "da_test", label: "Da test" },
  { id: "da_dk_hoc", label: "Da dang ky hoc" },
  { id: "khong_phu_hop", label: "Khong phu hop" },
];

const STATUS_COLOR = {
  moi: { bg: "#dbeafe", color: "#1d4ed8" },
  da_tiep_nhan: { bg: "#fef3c7", color: "#92400e" },
  da_hen_test: { bg: "#ede9fe", color: "#5b21b6" },
  da_test: { bg: "#d1fae5", color: "#065f46" },
  da_dk_hoc: { bg: "#dcfce7", color: "#14532d" },
  khong_phu_hop: { bg: "#f3f4f6", color: "#9ca3af" },
};

const STATUS_LABEL = {
  moi: "Moi", da_tiep_nhan: "Da tiep nhan", da_hen_test: "Da hen test",
  da_test: "Da test", da_dk_hoc: "Da dang ky hoc", khong_phu_hop: "Khong phu hop",
};

const NGUON_OPTIONS = [
  { id: "landing_page", label: "Landing Page" },
  { id: "fb_ads", label: "Facebook Ads" },
  { id: "zalo", label: "Zalo" },
  { id: "walkin", label: "Tu den" },
  { id: "gioi_thieu", label: "Gioi thieu" },
  { id: "khac", label: "Khac" },
];

const EMPTY_FORM = {
  ho_ten: "", sdt: "", email: "", trang_thai: "moi",
  nguon_lead: "landing_page", muc_tieu: "", thoi_gian_hoc: "", ghi_chu: "",
};

const fmtDate = (s) => s ? new Date(s).toLocaleDateString("vi-VN") : "";

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
    if (!form.ho_ten || !form.sdt) { alert("Vui long nhap ten va so dien thoai!"); return; }
    try {
      if (editingLead) await updateLead(editingLead.id, form);
      else await createLead(form);
      setShowModal(false); loadLeads();
    } catch (e) { alert("Co loi xay ra!"); }
  };

  const handleDelete = async (lead) => {
    try { await deleteLead(lead.id); setDeleteConfirm(null); loadLeads(); }
    catch (e) { alert("Co loi khi xoa!"); }
  };

  const handleStatusChange = async (lead, status) => {
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, trang_thai: status } : l));
    try { await updateLead(lead.id, { ...lead, trang_thai: status }); }
    catch (e) { loadLeads(); }
  };

  const handleScheduleTest = (lead) => {
    if (onNavigateToTest) onNavigateToTest("test-appointment", { ...lead });
  };

  const FILTERS = [
    { id: "all", label: "Tat ca" },
    ...STATUS_OPTIONS,
  ];

  const inp = { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 };
  const thS = { padding: "11px 14px", fontSize: 12, fontWeight: 700, color: "#fff", background: "#e11d48", textAlign: "left", whiteSpace: "nowrap" };
  const tdS = { padding: "10px 14px", fontSize: 13, color: "#374151", borderBottom: "1px solid #e5e7eb", verticalAlign: "middle" };

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#e11d48" }}>Quan ly Lead</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            placeholder="Tim kiem ho ten, sdt..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            style={{ padding: "7px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, width: 220 }}
          />
          <button onClick={openAdd}
            style={{ padding: "7px 16px", background: "#e11d48", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + Them lead
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => { setFilterStatus(f.id); setPagination(p => ({ ...p, page: 1 })); }}
            style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid #d1d5db", fontSize: 12, cursor: "pointer",
              background: filterStatus === f.id ? "#e11d48" : "#fff",
              color: filterStatus === f.id ? "#fff" : "#374151", fontWeight: filterStatus === f.id ? 600 : 400 }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thS}>#</th>
                <th style={thS}>Ho ten / ID</th>
                <th style={thS}>SDT / Email</th>
                <th style={thS}>Muc tieu</th>
                <th style={thS}>Trang thai</th>
                <th style={thS}>Nguon</th>
                <th style={thS}>Ngay tao</th>
                <th style={{ ...thS, position: "sticky", right: 0, zIndex: 2, boxShadow: "-2px 0 6px rgba(0,0,0,0.08)" }}>Hanh dong</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ ...tdS, textAlign: "center", color: "#9ca3af", padding: 32 }}>Dang tai du lieu...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={8} style={{ ...tdS, textAlign: "center", color: "#9ca3af", padding: 32 }}>Chua co lead nao</td></tr>
              ) : leads.map((lead, idx) => {
                const sc = STATUS_COLOR[lead.trang_thai] || STATUS_COLOR.moi;
                return (
                  <tr key={lead.id}
                    style={{ background: idx % 2 === 0 ? "#fff" : "#f9fafb" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#f9fafb"}>
                    <td style={{ ...tdS, color: "#9ca3af", fontSize: 12 }}>{(pagination.page - 1) * 20 + idx + 1}</td>
                    <td style={tdS}>
                      <div style={{ fontWeight: 600, color: "#e11d48", fontSize: 13 }}>{lead.ho_ten}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>#{lead.id}</div>
                    </td>
                    <td style={tdS}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{lead.sdt}</div>
                      {lead.email && <div style={{ fontSize: 12, color: "#6b7280" }}>{lead.email}</div>}
                    </td>
                    <td style={{ ...tdS, maxWidth: 160 }}>
                      <div style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lead.muc_tieu || "—"}</div>
                      {lead.thoi_gian_hoc && <div style={{ fontSize: 11, color: "#9ca3af" }}>{lead.thoi_gian_hoc}</div>}
                    </td>
                    <td style={tdS}>
                      <select value={lead.trang_thai || "moi"} onChange={e => handleStatusChange(lead, e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: "1px solid #e5e7eb",
                          cursor: "pointer", background: sc.bg, color: sc.color, width: "100%" }}>
                        {STATUS_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                      </select>
                    </td>
                    <td style={tdS}>
                      <select value={lead.nguon_lead || "landing_page"} onChange={e => updateLead(lead.id, { ...lead, nguon_lead: e.target.value }).then(loadLeads)}
                        style={{ padding: "4px 8px", borderRadius: 6, fontSize: 12, border: "1px solid #e5e7eb", cursor: "pointer", width: "100%" }}>
                        {NGUON_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                      </select>
                    </td>
                    <td style={{ ...tdS, fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>{fmtDate(lead.created_at)}</td>
                    <td style={{ ...tdS, position: "sticky", right: 0, background: "#fff", boxShadow: "-2px 0 6px rgba(0,0,0,0.06)" }}>
                      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <button onClick={() => openEdit(lead)} title="Sua"
                          style={{ width: 28, height: 28, borderRadius: 5, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 13, color: "#374151" }}>
                          &#9998;
                        </button>
                        <button onClick={() => setDeleteConfirm(lead)} title="Xoa"
                          style={{ width: 28, height: 28, borderRadius: 5, border: "1px solid #fca5a5", background: "#fff", cursor: "pointer", fontSize: 13, color: "#dc2626" }}>
                          &#10005;
                        </button>
                        <button onClick={() => handleScheduleTest(lead)}
                          style={{ padding: "4px 8px", borderRadius: 5, border: "none", background: "#e11d48", color: "#fff", cursor: "pointer", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                          Hen test
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
        <div style={{ padding: "10px 16px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>Hien thi {leads.length} / {pagination.total} leads</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1}
              style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid #d1d5db", background: "#fff", fontSize: 12, cursor: "pointer", opacity: pagination.page === 1 ? 0.4 : 1 }}>
              Truoc
            </button>
            <span style={{ padding: "5px 10px", fontSize: 12, color: "#6b7280" }}>Trang {pagination.page} / {pagination.totalPages || 1}</span>
            <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages || 1, p.page + 1) }))} disabled={pagination.page >= (pagination.totalPages || 1)}
              style={{ padding: "5px 12px", borderRadius: 5, border: "1px solid #d1d5db", background: "#fff", fontSize: 12, cursor: "pointer", opacity: pagination.page >= (pagination.totalPages || 1) ? 0.4 : 1 }}>
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 28, width: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e11d48", marginBottom: 20 }}>{editingLead ? "Chinh sua Lead" : "Them Lead moi"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Ho ten *</label>
                <input type="text" value={form.ho_ten} onChange={e => setForm(p => ({ ...p, ho_ten: e.target.value }))} placeholder="Nhap ho ten" style={inp} />
              </div>
              <div>
                <label style={lbl}>So dien thoai *</label>
                <input type="tel" value={form.sdt} onChange={e => setForm(p => ({ ...p, sdt: e.target.value }))} placeholder="0912345678" style={inp} />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" style={inp} />
              </div>
              <div>
                <label style={lbl}>Trang thai</label>
                <select value={form.trang_thai} onChange={e => setForm(p => ({ ...p, trang_thai: e.target.value }))} style={inp}>
                  {STATUS_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Nguon</label>
                <select value={form.nguon_lead} onChange={e => setForm(p => ({ ...p, nguon_lead: e.target.value }))} style={inp}>
                  {NGUON_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Muc tieu</label>
                <input type="text" value={form.muc_tieu} onChange={e => setForm(p => ({ ...p, muc_tieu: e.target.value }))} placeholder="IELTS 6.5, TOEIC 700..." style={inp} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Thoi gian hoc</label>
                <input type="text" value={form.thoi_gian_hoc} onChange={e => setForm(p => ({ ...p, thoi_gian_hoc: e.target.value }))} placeholder="Toi 2-4-6, sang thu 7..." style={inp} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Ghi chu</label>
                <textarea value={form.ghi_chu} onChange={e => setForm(p => ({ ...p, ghi_chu: e.target.value }))} rows={3} placeholder="Ghi chu them..." style={{ ...inp, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "8px 18px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer" }}>Huy</button>
              <button onClick={handleSave} style={{ padding: "8px 18px", background: "#e11d48", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Luu</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 24, width: 400, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e11d48", marginBottom: 12 }}>Xac nhan xoa</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Ban co chac chan muon xoa lead "{deleteConfirm.ho_ten}"?</div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ padding: "7px 16px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer" }}>Huy</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ padding: "7px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Xoa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
