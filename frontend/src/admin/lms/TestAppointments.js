import { useState, useEffect, Fragment } from "react";
import { testAPI, examAPI } from "../../api";
import { lmsAPI } from "../../api";

const TRANG_THAI_CFG = {
  cho_test: { label: "Cho test", bg: "#fef3c7", color: "#92400e" },
  dang_test: { label: "Dang test", bg: "#dbeafe", color: "#1d4ed8" },
  hoan_thanh: { label: "Hoan thanh", bg: "#d1fae5", color: "#065f46" },
  huy: { label: "Da huy", bg: "#fee2e2", color: "#991b1b" },
};

const EMPTY_FORM = {
  ho_ten_hv: "", sdt_hv: "", email_hv: "",
  giao_vien_id: "", de_thi_id: "",
  dia_diem: "", thoi_gian: "", ghi_chu: "",
};

export default function TestAppointments({ pendingLeads = [], onClearPending }) {
  const [list, setList] = useState([]);
  const [deThi, setDeThi] = useState([]);
  const [giaoViens, setGiaoViens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentLeadData, setCurrentLeadData] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  useEffect(() => { load(); loadDeThi(); loadGiaoVien(); }, []); // eslint-disable-line
  useEffect(() => { load(); }, [filterStatus, search, pagination.page]); // eslint-disable-line

  useEffect(() => {
    if (pendingLeads && pendingLeads.length > 0) {
      setCurrentLeadData(pendingLeads[pendingLeads.length - 1]);
    }
  }, [pendingLeads.length]); // eslint-disable-line

  const load = async () => {
    setLoading(true);
    try {
      const params = { page: pagination.page, search };
      if (filterStatus !== "all") params.trang_thai = filterStatus;
      const res = await testAPI.getLichHen(params);
      const data = res.data || res;
      const arr = Array.isArray(data) ? data : (data.list || []);
      setList(arr);
      if (data.pagination) setPagination(p => ({ ...p, ...data.pagination }));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadDeThi = async () => {
    try {
      const res = await examAPI.getAllDeThi();
      const data = Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []);
      setDeThi(data);
    } catch (e) { setDeThi([]); }
  };

  const loadGiaoVien = async () => {
    try { const res = await lmsAPI.getGiaoViens(); setGiaoViens(res.data || res || []); }
    catch (e) { setGiaoViens([]); }
  };

  const handleOpenModal = (lead = null) => {
    if (lead) {
      setCurrentLeadData(lead);
      setForm({ ...EMPTY_FORM, ho_ten_hv: lead.ho_ten || "", sdt_hv: lead.sdt || "", email_hv: lead.email || "" });
    } else {
      setForm(EMPTY_FORM);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await testAPI.createLichHen(form);
      setShowModal(false); setForm(EMPTY_FORM); setCurrentLeadData(null);
      load();
      if (pendingLeads.length > 0 && onClearPending) onClearPending();
    } catch (e) { alert("Loi ket noi: " + e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xac nhan xoa lich hen nay?")) return;
    await testAPI.deleteLichHen(id); load();
  };

  const handleStatusChange = async (id, status) => {
    setList(prev => prev.map(r => r.id === id ? { ...r, trang_thai: status } : r));
    try { await testAPI.updateLichHen(id, { trang_thai: status }); } catch (e) { load(); }
  };

  const toggleExpand = (id) => setExpandedId(id === expandedId ? null : id);

  const thS = { padding: "11px 14px", fontSize: 12, fontWeight: 700, color: "#fff", background: "#e11d48", textAlign: "left", whiteSpace: "nowrap" };
  const tdS = { padding: "10px 14px", fontSize: 13, color: "#374151", borderBottom: "1px solid #e5e7eb", verticalAlign: "middle" };
  const lbl = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 };
  const inp = { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box" };

  return (
    <div style={{ padding: 24, background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: "#e11d48" }}>Lich hen test</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input placeholder="Tim kiem hoc vien..." value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            style={{ padding: "7px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, width: 200 }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13 }}>
            <option value="all">Tat ca trang thai</option>
            {Object.entries(TRANG_THAI_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={() => handleOpenModal()}
            style={{ padding: "7px 16px", background: "#e11d48", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Tao bai kiem tra
          </button>
        </div>
      </div>

      {/* Pending lead bar */}
      {currentLeadData && !showModal && (
        <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>Lead cho tao lich:</span>
          <span style={{ fontSize: 13, color: "#78350f" }}>{currentLeadData.ho_ten} — {currentLeadData.sdt}</span>
          <button onClick={() => handleOpenModal(currentLeadData)}
            style={{ padding: "4px 12px", background: "#92400e", color: "#fff", border: "none", borderRadius: 5, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            Tao bai kiem tra ngay
          </button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Hoc vien", "Giao vien", "De thi", "Dia diem", "Thoi gian", "Trang thai", "Hanh dong"].map((h, i) => (
                  <th key={i} style={{ ...thS, ...(i === 7 ? { position: "sticky", right: 0, zIndex: 2, boxShadow: "-2px 0 6px rgba(0,0,0,0.08)" } : {}) }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ ...tdS, textAlign: "center", color: "#9ca3af", padding: 32 }}>Dang tai...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={8} style={{ ...tdS, textAlign: "center", color: "#9ca3af", padding: 32 }}>Chua co lich hen nao</td></tr>
              ) : list.map((row, idx) => (
                <Fragment key={row.id}>
                  <tr style={{ background: idx % 2 === 0 ? "#fff" : "#f9fafb" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f3f4f6"}
                    onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#f9fafb"}>
                    <td style={{ ...tdS, color: "#9ca3af", fontSize: 12 }}>{(pagination.page - 1) * 20 + idx + 1}</td>
                    <td style={tdS}>
                      <div style={{ fontWeight: 600, color: "#e11d48" }}>{row.hocVien?.ho_ten || row.ho_ten_hv || "—"}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{row.hocVien?.sdt || row.sdt_hv || ""}</div>
                    </td>
                    <td style={tdS}>{row.giaoVien?.ho_ten || "—"}</td>
                    <td style={tdS}>{row.deThi?.ten_de || "—"}</td>
                    <td style={tdS}>{row.dia_diem || "—"}</td>
                    <td style={{ ...tdS, whiteSpace: "nowrap" }}>
                      {row.thoi_gian ? new Date(row.thoi_gian).toLocaleString("vi-VN") : "—"}
                    </td>
                    <td style={tdS}>
                      <select value={row.trang_thai || "cho_test"} onChange={e => handleStatusChange(row.id, e.target.value)}
                        style={{ padding: "4px 8px", borderRadius: 12, fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                          background: TRANG_THAI_CFG[row.trang_thai]?.bg || "#f3f4f6",
                          color: TRANG_THAI_CFG[row.trang_thai]?.color || "#374151" }}>
                        {Object.entries(TRANG_THAI_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                    <td style={{ ...tdS, position: "sticky", right: 0, background: "#fff", boxShadow: "-2px 0 6px rgba(0,0,0,0.06)" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => toggleExpand(row.id)}
                          style={{ padding: "4px 10px", border: "1px solid #d1d5db", borderRadius: 5, fontSize: 13, cursor: "pointer",
                            background: expandedId === row.id ? "#e11d48" : "#fff",
                            color: expandedId === row.id ? "#fff" : "#374151" }}>+</button>
                        <button onClick={() => handleDelete(row.id)}
                          style={{ padding: "4px 10px", border: "1px solid #fca5a5", borderRadius: 5, background: "#fff", color: "#dc2626", cursor: "pointer", fontSize: 13 }}>&#10005;</button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === row.id && (
                    <tr key={`exp-${row.id}`}>
                      <td colSpan={8} style={{ padding: "14px 24px", background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Ket qua bai test</div>
                        {row.ketQuas && row.ketQuas.length > 0 ? (
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                            <thead>
                              <tr>
                                {["Ngay lam", "Diem tong", "Nghe", "Doc", "Thoi gian", "Trang thai"].map((h, i) => (
                                  <th key={i} style={{ padding: "6px 10px", background: "#f3f4f6", color: "#374151", fontWeight: 600, textAlign: "left", border: "1px solid #e5e7eb" }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {row.ketQuas.map((kq, ki) => (
                                <tr key={ki}>
                                  <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>{kq.ngay_lam ? new Date(kq.ngay_lam).toLocaleDateString("vi-VN") : "—"}</td>
                                  <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb", fontWeight: 600 }}>{kq.diem_tong ?? "—"}</td>
                                  <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>
                                    {kq.so_dung_nghe != null ? `${kq.so_dung_nghe}/${kq.tong_nghe}` : (kq.diem_nghe ?? "—")}
                                  </td>
                                  <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>
                                    {kq.so_dung_doc != null ? `${kq.so_dung_doc}/${kq.tong_doc}` : (kq.diem_doc ?? "—")}
                                  </td>
                                  <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>{kq.thoi_gian_lam ?? "—"}</td>
                                  <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>{kq.trang_thai || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div style={{ color: "#9ca3af", fontSize: 13 }}>Chua co ket qua</div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal tao bai kiem tra */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) { setShowModal(false); } }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 28, width: 560, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e11d48", marginBottom: 20 }}>Tao bai kiem tra</div>

            {/* Info box hoc vien */}
            {currentLeadData && (
              <div style={{ marginBottom: 18, padding: 14, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", marginBottom: 8 }}>Thong tin hoc vien tu Lead</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: "#374151" }}>
                  <div><span style={{ fontWeight: 600 }}>Ho ten:</span> {currentLeadData.ho_ten || "—"}</div>
                  <div><span style={{ fontWeight: 600 }}>SDT:</span> {currentLeadData.sdt || "—"}</div>
                  <div><span style={{ fontWeight: 600 }}>Email:</span> {currentLeadData.email || "—"}</div>
                  <div><span style={{ fontWeight: 600 }}>Muc tieu:</span> {currentLeadData.muc_tieu || "—"}</div>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>Ho ten hoc vien</label>
                <input type="text" value={form.ho_ten_hv} onChange={e => setForm(p => ({ ...p, ho_ten_hv: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={lbl}>SDT hoc vien</label>
                <input type="text" value={form.sdt_hv} onChange={e => setForm(p => ({ ...p, sdt_hv: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Email hoc vien</label>
                <input type="email" value={form.email_hv} onChange={e => setForm(p => ({ ...p, email_hv: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Giao vien</label>
                <select value={form.giao_vien_id} onChange={e => setForm(p => ({ ...p, giao_vien_id: e.target.value }))} style={inp}>
                  <option value="">-- Chon giao vien --</option>
                  {giaoViens.map(gv => <option key={gv.id} value={gv.id}>{gv.ten_giao_vien || gv.ho_ten}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>De thi</label>
                <select value={form.de_thi_id} onChange={e => setForm(p => ({ ...p, de_thi_id: e.target.value }))} style={inp}>
                  <option value="">-- Chon de thi --</option>
                  {deThi.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.ten_de} ({d.loai?.toUpperCase()}{d.so_cau_nghe ? ` — Nghe: ${d.so_cau_nghe}` : ""}{d.so_cau_doc ? `, Doc: ${d.so_cau_doc}` : ""})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Dia diem</label>
                <input type="text" value={form.dia_diem} onChange={e => setForm(p => ({ ...p, dia_diem: e.target.value }))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Thoi gian</label>
                <input type="datetime-local" value={form.thoi_gian} onChange={e => setForm(p => ({ ...p, thoi_gian: e.target.value }))} style={inp} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Ghi chu</label>
                <textarea value={form.ghi_chu} onChange={e => setForm(p => ({ ...p, ghi_chu: e.target.value }))} rows={3} style={{ ...inp, resize: "vertical" }} />
              </div>
            </div>
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#f0fdf4", borderRadius: 6, fontSize: 12, color: "#065f46" }}>
              Tai khoan hoc vien tu dong tao: username = SDT, password = 123456
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setShowModal(false); }} style={{ padding: "8px 18px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer" }}>Huy</button>
              <button onClick={handleSave} style={{ padding: "8px 18px", background: "#e11d48", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Luu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
