import { useState, useEffect, Fragment } from "react";
import { testAPI, examAPI, lmsAPI } from "../../api";

const TRANG_THAI_CFG = {
  cho_test:   { label: "Chờ test",    bg: "#fef3c7", color: "#92400e" },
  dang_test:  { label: "Đang test",   bg: "#dbeafe", color: "#1d4ed8" },
  hoan_thanh: { label: "Hoàn thành", bg: "#d1fae5", color: "#065f46" },
  huy:        { label: "Đã hủy",     bg: "#fee2e2", color: "#991b1b" },
};

const KQ_TRANG_THAI = {
  chua_lam:    { label: "Chưa làm",     bg: "#f3f4f6", color: "#6b7280" },
  dang_lam:    { label: "Đang làm",     bg: "#dbeafe", color: "#1d4ed8" },
  chua_cham:   { label: "Chờ chấm",     bg: "#fef3c7", color: "#92400e" },
  da_cham:     { label: "Đã chấm",      bg: "#d1fae5", color: "#065f46" },
  hoan_thanh:  { label: "Hoàn thành",   bg: "#d1fae5", color: "#065f46" },
};

const EMPTY_FORM = {
  ho_ten_hv: "", sdt_hv: "", email_hv: "",
  giao_vien_id: "", de_thi_id: "",
  dia_diem: "", thoi_gian: "", ghi_chu: "",
};

const fmtDT = (s) => s ? new Date(s).toLocaleString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";

export default function TestAppointments({ pendingLeads = [], onClearPending }) {
  const [list, setList]           = useState([]);
  const [deThi, setDeThi]         = useState([]);
  const [giaoViens, setGiaoViens] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentLeadData, setCurrentLeadData] = useState(null);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch]       = useState("");
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [noteModal, setNoteModal] = useState(null); // { id, note }
  const [phuHuynhForm, setPhuHuynhForm] = useState({ ten_phu_huynh: "", sdt_phu_huynh: "", quan_he_phu_huynh: "me" });
  const [ketQuaModal, setKetQuaModal] = useState(null); // { lichId, data: [...] }
  const [ketQuaLoading, setKetQuaLoading] = useState(false);
  const [ketQuaCache, setKetQuaCache] = useState({}); // { [lichId]: [...KetQuaDeThi] }

  useEffect(() => { load(); loadDeThi(); loadGiaoVien(); }, []); // eslint-disable-line
  useEffect(() => { load(); }, [filterStatus, search, pagination.page]); // eslint-disable-line

  useEffect(() => {
    if (pendingLeads && pendingLeads.length > 0) {
      const lead = pendingLeads[pendingLeads.length - 1];
      setCurrentLeadData(lead);
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
      setDeThi(Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []));
    } catch { setDeThi([]); }
  };

  const loadGiaoVien = async () => {
    try { const res = await lmsAPI.getGiaoViens(); setGiaoViens(res.data || res || []); }
    catch { setGiaoViens([]); }
  };

  const handleOpenModal = (lead = null) => {
    if (lead) {
      setCurrentLeadData(lead);
      setForm({ ...EMPTY_FORM, ho_ten_hv: lead.ho_ten || "", sdt_hv: lead.sdt || "", email_hv: lead.email || "" });
    } else {
      setCurrentLeadData(null);
      setForm(EMPTY_FORM);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.ho_ten_hv || !form.sdt_hv) { alert("Vui lòng nhập họ tên và SĐT học viên!"); return; }
    try {
      await testAPI.createLichHen({ ...form, ...phuHuynhForm });
      setShowModal(false); setForm(EMPTY_FORM); setCurrentLeadData(null);
      setPhuHuynhForm({ ten_phu_huynh: "", sdt_phu_huynh: "", quan_he_phu_huynh: "me" });
      load();
      if (pendingLeads.length > 0 && onClearPending) onClearPending();
    } catch (e) { alert("Lỗi: " + e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xác nhận xóa lịch hẹn này?")) return;
    await testAPI.deleteLichHen(id); load();
  };

  const handleStatusChange = async (id, status) => {
    setList(prev => prev.map(r => r.id === id ? { ...r, trang_thai: status } : r));
    try { await testAPI.updateLichHen(id, { trang_thai: status }); } catch { load(); }
  };

  const handleSaveNote = async () => {
    if (!noteModal) return;
    try {
      await testAPI.updateLichHen(noteModal.id, { ghi_chu: noteModal.note });
      setNoteModal(null); load();
    } catch { alert("Lỗi lưu ghi chú"); }
  };

  const toggleExpand = async (id) => {
    const newId = id === expandedId ? null : id;
    setExpandedId(newId);
    if (newId && !ketQuaCache[newId]) {
      try {
        const res = await examAPI.getKetQuaByLich(newId);
        const data = res.data || res;
        setKetQuaCache(prev => ({ ...prev, [newId]: Array.isArray(data) ? data : [] }));
      } catch { setKetQuaCache(prev => ({ ...prev, [newId]: [] })); }
    }
  };

  const handleXemKetQua = async (lichId) => {
    setKetQuaLoading(true);
    setKetQuaModal({ lichId, data: null });
    try {
      const res = await examAPI.getKetQuaByLich(lichId);
      const data = res.data || res;
      setKetQuaModal({ lichId, data: Array.isArray(data) ? data : [] });
    } catch (e) {
      alert("Lỗi tải kết quả: " + e.message);
      setKetQuaModal(null);
    }
    setKetQuaLoading(false);
  };

  const lbl = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 };
  const inp = { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, boxSizing: "border-box", outline: "none" };

  return (
    <div style={{ padding: "20px 24px", background: "#f9fafb", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#e11d48" }}>Hẹn test</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input placeholder="Tìm kiếm học viên..." value={search}
            onChange={e => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            style={{ padding: "8px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, width: 220, outline: "none" }} />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, outline: "none" }}>
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(TRANG_THAI_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <button onClick={() => handleOpenModal()}
            style={{ padding: "8px 18px", background: "#e11d48", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            + Tạo bài kiểm tra
          </button>
        </div>
      </div>

      {/* Pending lead bar */}
      {currentLeadData && !showModal && (
        <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 10, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Lead chờ tạo lịch:</span>
          <span style={{ fontSize: 13, color: "#78350f" }}><strong>{currentLeadData.ho_ten}</strong> — {currentLeadData.sdt}</span>
          {currentLeadData.muc_tieu && <span style={{ fontSize: 12, color: "#92400e", background: "#fde68a", padding: "2px 8px", borderRadius: 10 }}>{currentLeadData.muc_tieu}</span>}
          <button onClick={() => handleOpenModal(currentLeadData)}
            style={{ padding: "6px 14px", background: "#e11d48", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", marginLeft: "auto" }}>
            Tạo bài kiểm tra ngay
          </button>
          <button onClick={() => setCurrentLeadData(null)}
            style={{ padding: "4px 8px", background: "none", border: "none", color: "#92400e", cursor: "pointer", fontSize: 16 }}>×</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
            <thead>
              <tr style={{ background: "#e11d48" }}>
                <th style={{ width: 36, padding: "12px 10px", color: "#fff", fontSize: 12, fontWeight: 700 }}></th>
                <th style={{ padding: "12px 14px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "left" }}>Học viên</th>
                <th style={{ padding: "12px 14px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "left" }}>Thông tin liên hệ</th>
                <th style={{ padding: "12px 14px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "left" }}>Tên đăng nhập</th>
                <th style={{ padding: "12px 14px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "left" }}>Địa điểm</th>
                <th style={{ padding: "12px 14px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "left" }}>Thời gian</th>
                <th style={{ padding: "12px 14px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "left" }}>Trạng thái</th>
                <th style={{ padding: "12px 14px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "left",
                  position: "sticky", right: 0, background: "#e11d48", zIndex: 3, boxShadow: "-3px 0 8px rgba(0,0,0,0.15)" }}>
                  Chức năng
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Đang tải...</td></tr>
              ) : list.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Chưa có lịch hẹn nào</td></tr>
              ) : list.map((row, idx) => {
                const st = TRANG_THAI_CFG[row.trang_thai] || TRANG_THAI_CFG.cho_test;
                const isExpanded = expandedId === row.id;
                return (
                  <Fragment key={row.id}>
                    <tr style={{ borderBottom: "1px solid #f3f4f6", background: isExpanded ? "#fff8f8" : "#fff", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                      onMouseLeave={e => e.currentTarget.style.background = isExpanded ? "#fff8f8" : "#fff"}>
                      {/* Expand toggle */}
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <button onClick={() => toggleExpand(row.id)}
                          style={{ width: 26, height: 26, borderRadius: 5, border: "1px solid #e5e7eb", background: isExpanded ? "#e11d48" : "#fff",
                            color: isExpanded ? "#fff" : "#374151", cursor: "pointer", fontSize: 14, fontWeight: 700, lineHeight: 1 }}>
                          {isExpanded ? "−" : "+"}
                        </button>
                      </td>
                      {/* Học viên */}
                      <td style={{ padding: "12px 14px", minWidth: 160 }}>
                        <div style={{ fontWeight: 700, color: "#e11d48", fontSize: 14 }}>{row.hocVien?.ho_ten || row.ho_ten_hv || "—"}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Mã: {row.hocVien?.ma_hoc_vien || `HV${String(row.id).padStart(4,"0")}`}</div>
                      </td>
                      {/* Thông tin liên hệ */}
                      <td style={{ padding: "12px 14px", minWidth: 200 }}>
                        <div style={{ fontSize: 13, color: "#374151" }}>Điện thoại: <strong>{row.hocVien?.sdt || row.sdt_hv || "—"}</strong></div>
                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>Email: {row.hocVien?.email || row.email_hv || "—"}</div>
                      </td>
                      {/* Tên đăng nhập */}
                      <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: "#374151" }}>
                        {row.hocVien?.sdt || row.sdt_hv || "—"}
                      </td>
                      {/* Địa điểm */}
                      <td style={{ padding: "12px 14px", minWidth: 160 }}>
                        <div style={{ fontSize: 13, color: "#374151" }}>
                          {row.dia_diem ? `Trung tâm: ${row.dia_diem}` : "—"}
                        </div>
                        {row.deThi && (
                          <span style={{ display: "inline-block", marginTop: 4, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: "#fef3c7", color: "#92400e" }}>
                            Làm bài trực tuyến
                          </span>
                        )}
                      </td>
                      {/* Thời gian */}
                      <td style={{ padding: "12px 14px", fontSize: 12, color: "#6b7280", whiteSpace: "nowrap" }}>
                        {fmtDT(row.thoi_gian)}
                      </td>
                      {/* Trạng thái */}
                      <td style={{ padding: "12px 14px" }}>
                        <select value={row.trang_thai || "cho_test"} onChange={e => handleStatusChange(row.id, e.target.value)}
                          style={{ padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: `1px solid ${st.color}44`,
                            cursor: "pointer", background: st.bg, color: st.color, outline: "none" }}>
                          {Object.entries(TRANG_THAI_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      </td>
                      {/* Chức năng */}
                      <td style={{ padding: "12px 14px", position: "sticky", right: 0, background: "#fff", zIndex: 1, boxShadow: "-3px 0 8px rgba(0,0,0,0.06)" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {/* Sửa */}
                          <button onClick={() => { setCurrentLeadData(row); setForm({ ho_ten_hv: row.ho_ten_hv||"", sdt_hv: row.sdt_hv||"", email_hv: row.email_hv||"", giao_vien_id: row.giao_vien_id||"", de_thi_id: row.de_thi_id||"", dia_diem: row.dia_diem||"", thoi_gian: row.thoi_gian||"", ghi_chu: row.ghi_chu||"" }); setShowModal(true); }}
                            title="Sửa" style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", color: "#f59e0b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          {/* Xóa */}
                          <button onClick={() => handleDelete(row.id)} title="Xóa"
                            style={{ width: 30, height: 30, borderRadius: 6, border: "1px solid #fca5a5", background: "#fff", cursor: "pointer", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded — kết quả làm bài */}
                    {isExpanded && (
                      <tr key={`exp-${row.id}`}>
                        <td colSpan={8} style={{ padding: "0 0 0 46px", background: "#fffbf0", borderBottom: "2px solid #fcd34d" }}>
                          <div style={{ padding: "16px 20px 16px 0" }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 12 }}>Kết quả làm bài</div>
                            {(() => {
                              const kqList = ketQuaCache[row.id];
                              if (kqList === undefined) return <div style={{ color: "#9ca3af", fontSize: 13 }}>Đang tải...</div>;
                              if (kqList.length === 0) return <div style={{ color: "#9ca3af", fontSize: 13, padding: "8px 0" }}>Chưa có kết quả làm bài trực tuyến</div>;
                              return (
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                                  <thead>
                                    <tr style={{ background: "#e11d48" }}>
                                      {["Ngày làm", "Điểm Nghe", "Điểm Đọc", "Tổng điểm", "Thời gian làm", "Đề", "Trạng thái", ""].map((h, i) => (
                                        <th key={i} style={{ padding: "9px 12px", color: "#fff", fontWeight: 700, textAlign: "left", fontSize: 12 }}>{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {kqList.map((kq, ki) => {
                                      const kqSt = KQ_TRANG_THAI[kq.trang_thai] || { label: kq.trang_thai || "—", bg: "#f3f4f6", color: "#374151" };
                                      const fmtGiay = (s) => s != null ? `${Math.floor(s/60)}p ${s%60}s` : "—";
                                      return (
                                        <tr key={ki} style={{ borderBottom: "1px solid #f3f4f6", background: ki % 2 === 0 ? "#fff" : "#fafafa" }}>
                                          <td style={{ padding: "9px 12px" }}>{fmtDT(kq.hoan_thanh_luc || kq.bat_dau_luc)}</td>
                                          <td style={{ padding: "9px 12px", fontWeight: 700, color: "#1d4ed8" }}>
                                            {kq.diem_nghe != null ? kq.diem_nghe : "—"}
                                          </td>
                                          <td style={{ padding: "9px 12px", fontWeight: 700, color: "#92400e" }}>
                                            {kq.diem_doc != null ? kq.diem_doc : "—"}
                                          </td>
                                          <td style={{ padding: "9px 12px", fontWeight: 800, color: "#111827", fontSize: 15 }}>
                                            {kq.diem_tong != null ? kq.diem_tong : "—"}
                                          </td>
                                          <td style={{ padding: "9px 12px" }}>{fmtGiay(kq.thoi_gian_lam)}</td>
                                          <td style={{ padding: "9px 12px" }}>{kq.deThi?.ten_de || row.deThi?.ten_de || "—"}</td>
                                          <td style={{ padding: "9px 12px" }}>
                                            <span style={{ padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: kqSt.bg, color: kqSt.color }}>
                                              {kqSt.label}
                                            </span>
                                          </td>
                                          <td style={{ padding: "9px 12px" }}>
                                            <button
                                              onClick={() => handleXemKetQua(row.id)}
                                              style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "#10b981", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                              👁 Xem chi tiết
                                            </button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              );
                            })()}
                            {/* Ghi chú */}
                            {row.ghi_chu && (
                              <div style={{ marginTop: 12, padding: "8px 12px", background: "#f9fafb", borderRadius: 6, fontSize: 13, color: "#374151", border: "1px solid #e5e7eb" }}>
                                <span style={{ fontWeight: 600, color: "#6b7280" }}>Ghi chú: </span>{row.ghi_chu}
                              </div>
                            )}
                            <button onClick={() => setNoteModal({ id: row.id, note: row.ghi_chu || "" })}
                              style={{ marginTop: 12, padding: "7px 18px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                              Thêm ghi chú
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fafafa" }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Tổng: <strong>{pagination.total || list.length}</strong> lịch hẹn</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page-1) }))} disabled={pagination.page === 1}
              style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", fontSize: 12, cursor: "pointer", opacity: pagination.page===1?0.4:1 }}>‹</button>
            <span style={{ padding: "5px 10px", fontSize: 12, color: "#6b7280" }}>Trang {pagination.page} / {pagination.totalPages||1}</span>
            <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages||1, p.page+1) }))} disabled={pagination.page>=(pagination.totalPages||1)}
              style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #d1d5db", background: "#fff", fontSize: 12, cursor: "pointer", opacity: pagination.page>=(pagination.totalPages||1)?0.4:1 }}>›</button>
          </div>
        </div>
      </div>

      {/* Modal tạo/sửa bài kiểm tra */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 580, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#e11d48", marginBottom: 20 }}>Tạo bài kiểm tra</div>

            {/* Info học viên từ Lead */}
            {currentLeadData && (
              <div style={{ marginBottom: 18, padding: 14, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", marginBottom: 8 }}>Thông tin học viên từ Lead</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 13, color: "#374151" }}>
                  <div><span style={{ fontWeight: 600 }}>Họ tên:</span> {currentLeadData.ho_ten || "—"}</div>
                  <div><span style={{ fontWeight: 600 }}>SĐT:</span> {currentLeadData.sdt || "—"}</div>
                  <div><span style={{ fontWeight: 600 }}>Email:</span> {currentLeadData.email || "—"}</div>
                  <div><span style={{ fontWeight: 600 }}>Mục tiêu:</span> {currentLeadData.muc_tieu || "—"}</div>
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={lbl}>Họ tên học viên *</label>
                <input value={form.ho_ten_hv} onChange={e => setForm(p => ({ ...p, ho_ten_hv: e.target.value }))} placeholder="Nhập họ tên" style={inp} />
              </div>
              <div>
                <label style={lbl}>Số điện thoại *</label>
                <input value={form.sdt_hv} onChange={e => setForm(p => ({ ...p, sdt_hv: e.target.value }))} placeholder="0912345678" style={inp} />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input type="email" value={form.email_hv} onChange={e => setForm(p => ({ ...p, email_hv: e.target.value }))} placeholder="email@example.com" style={inp} />
              </div>
              <div>
                <label style={lbl}>Giáo viên</label>
                <select value={form.giao_vien_id} onChange={e => setForm(p => ({ ...p, giao_vien_id: e.target.value }))} style={inp}>
                  <option value="">-- Chọn giáo viên --</option>
                  {giaoViens.map(gv => <option key={gv.id} value={gv.id}>{gv.ten_giao_vien || gv.ho_ten}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Đề thi (làm bài trực tuyến)</label>
                <select value={form.de_thi_id} onChange={e => setForm(p => ({ ...p, de_thi_id: e.target.value }))} style={inp}>
                  <option value="">-- Chọn đề thi --</option>
                  {deThi.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.ten_de} ({d.loai?.toUpperCase()}{d.so_cau_nghe ? ` — Nghe: ${d.so_cau_nghe}` : ""}{d.so_cau_doc ? `, Đọc: ${d.so_cau_doc}` : ""})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Địa điểm</label>
                <input value={form.dia_diem} onChange={e => setForm(p => ({ ...p, dia_diem: e.target.value }))} placeholder="CS Mỹ Hào, CS Hà Nội..." style={inp} />
              </div>
              <div>
                <label style={lbl}>Thời gian</label>
                <input type="datetime-local" value={form.thoi_gian} onChange={e => setForm(p => ({ ...p, thoi_gian: e.target.value }))} style={inp} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Ghi chú</label>
                <textarea value={form.ghi_chu} onChange={e => setForm(p => ({ ...p, ghi_chu: e.target.value }))} rows={3} placeholder="Ghi chú thêm..." style={{ ...inp, resize: "vertical" }} />
              </div>
            </div>

            {/* Thông tin phụ huynh */}
            <div style={{ marginTop: 16, padding: "14px 16px", background: "#eff6ff", borderRadius: 10, border: "1px solid #bfdbfe" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8", marginBottom: 12 }}>👨‍👩‍👧 Thông tin phụ huynh (tùy chọn)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lbl}>Họ tên phụ huynh</label>
                  <input value={phuHuynhForm.ten_phu_huynh} onChange={e => setPhuHuynhForm(p => ({ ...p, ten_phu_huynh: e.target.value }))}
                    placeholder="Nguyễn Văn A" style={inp} />
                </div>
                <div>
                  <label style={lbl}>SĐT phụ huynh</label>
                  <input value={phuHuynhForm.sdt_phu_huynh} onChange={e => setPhuHuynhForm(p => ({ ...p, sdt_phu_huynh: e.target.value }))}
                    placeholder="0912345678" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Quan hệ với học viên</label>
                  <select value={phuHuynhForm.quan_he_phu_huynh} onChange={e => setPhuHuynhForm(p => ({ ...p, quan_he_phu_huynh: e.target.value }))} style={inp}>
                    <option value="bo">Bố</option>
                    <option value="me">Mẹ</option>
                    <option value="ong">Ông</option>
                    <option value="ba">Bà</option>
                    <option value="anh">Anh</option>
                    <option value="chi">Chị</option>
                    <option value="nguoi_giam_ho">Người giám hộ</option>
                  </select>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#f0fdf4", borderRadius: 6, fontSize: 12, color: "#065f46" }}>
              Tài khoản học viên tự động tạo: username = SĐT, password = 123456
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "8px 20px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>Hủy</button>
              <button onClick={handleSave} style={{ padding: "8px 20px", background: "#e11d48", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ghi chú */}
      {noteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setNoteModal(null); }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, width: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 14 }}>Thêm ghi chú</div>
            <textarea value={noteModal.note} onChange={e => setNoteModal(p => ({ ...p, note: e.target.value }))}
              rows={4} placeholder="Nhập ghi chú..."
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 13, resize: "vertical", boxSizing: "border-box", outline: "none" }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
              <button onClick={() => setNoteModal(null)} style={{ padding: "8px 18px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>Hủy</button>
              <button onClick={handleSaveNote} style={{ padding: "8px 18px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Lưu ghi chú</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem kết quả chi tiết */}
      {ketQuaModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setKetQuaModal(null); }}>
          <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 900, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
            {/* Header */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: "#e11d48" }}>📊 Kết quả làm bài chi tiết</div>
              <button onClick={() => setKetQuaModal(null)}
                style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 18, color: "#6b7280", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            <div style={{ padding: "20px 24px" }}>
              {ketQuaLoading ? (
                <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Đang tải...</div>
              ) : !ketQuaModal.data || ketQuaModal.data.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <div>Học viên chưa làm bài trực tuyến</div>
                </div>
              ) : ketQuaModal.data.map((kq, ki) => {
                const baiLams = kq.baiLams || [];
                const cauNghe = baiLams.filter(b => b.cauHoi?.phan === "nghe");
                const cauDoc  = baiLams.filter(b => b.cauHoi?.phan === "doc");
                const cauViet = baiLams.filter(b => b.cauHoi?.phan === "viet");
                const soDungNghe = cauNghe.filter(b => b.dung_sai).length;
                const soDungDoc  = cauDoc.filter(b => b.dung_sai).length;
                const fmtGiay = (s) => s != null ? `${Math.floor(s/60)} phút ${s%60} giây` : "—";

                return (
                  <div key={ki} style={{ marginBottom: ki < ketQuaModal.data.length - 1 ? 32 : 0 }}>
                    {/* Tóm tắt điểm */}
                    <div style={{ background: "#f9fafb", borderRadius: 10, padding: 16, marginBottom: 16, border: "1px solid #e5e7eb" }}>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Đề thi</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{kq.deThi?.ten_de || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Học viên</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{kq.hocVien?.ho_ten || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Thời gian làm</div>
                          <div style={{ fontSize: 13, color: "#374151" }}>{fmtGiay(kq.thoi_gian_lam)}</div>
                        </div>
                        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
                          {cauNghe.length > 0 && (
                            <div style={{ textAlign: "center", padding: "8px 16px", background: "#dbeafe", borderRadius: 8 }}>
                              <div style={{ fontSize: 11, color: "#1d4ed8", fontWeight: 700 }}>NGHE</div>
                              <div style={{ fontSize: 20, fontWeight: 800, color: "#1d4ed8" }}>{kq.diem_nghe ?? "—"}</div>
                              <div style={{ fontSize: 11, color: "#6b7280" }}>{soDungNghe}/{cauNghe.length} đúng</div>
                            </div>
                          )}
                          {cauDoc.length > 0 && (
                            <div style={{ textAlign: "center", padding: "8px 16px", background: "#fef3c7", borderRadius: 8 }}>
                              <div style={{ fontSize: 11, color: "#92400e", fontWeight: 700 }}>ĐỌC</div>
                              <div style={{ fontSize: 20, fontWeight: 800, color: "#92400e" }}>{kq.diem_doc ?? "—"}</div>
                              <div style={{ fontSize: 11, color: "#6b7280" }}>{soDungDoc}/{cauDoc.length} đúng</div>
                            </div>
                          )}
                          <div style={{ textAlign: "center", padding: "8px 16px", background: "#111827", borderRadius: 8 }}>
                            <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700 }}>TỔNG</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{kq.diem_tong ?? "—"}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bảng chi tiết từng câu */}
                    {baiLams.length > 0 ? (
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ background: "#f3f4f6" }}>
                            {["STT", "Phần", "Câu hỏi", "Bạn chọn", "Đáp án đúng", "Kết quả", "Điểm"].map((h, i) => (
                              <th key={i} style={{ padding: "9px 12px", fontWeight: 700, textAlign: "left", border: "1px solid #e5e7eb", color: "#374151", fontSize: 12 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {baiLams.map((b, bi) => {
                            const phan = b.cauHoi?.phan || "doc";
                            const phanCfg = phan === "nghe"
                              ? { label: "Nghe", bg: "#dbeafe", color: "#1d4ed8" }
                              : phan === "viet"
                              ? { label: "Viết", bg: "#d1fae5", color: "#065f46" }
                              : { label: "Đọc", bg: "#fef3c7", color: "#92400e" };
                            const isDung = b.dung_sai;
                            const noiDung = b.cauHoi?.noi_dung || "";
                            return (
                              <tr key={bi} style={{ borderBottom: "1px solid #f3f4f6", background: isDung ? "#f0fdf4" : bi % 2 === 0 ? "#fff" : "#fafafa" }}>
                                <td style={{ padding: "8px 12px", border: "1px solid #e5e7eb", fontWeight: 700, color: "#6b7280" }}>
                                  {b.cauHoi?.stt || bi + 1}
                                </td>
                                <td style={{ padding: "8px 12px", border: "1px solid #e5e7eb" }}>
                                  <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: phanCfg.bg, color: phanCfg.color }}>
                                    {phanCfg.label}
                                  </span>
                                </td>
                                <td style={{ padding: "8px 12px", border: "1px solid #e5e7eb", maxWidth: 260, color: "#374151" }}>
                                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={noiDung}>
                                    {noiDung.length > 70 ? noiDung.slice(0, 70) + "…" : noiDung}
                                  </div>
                                </td>
                                <td style={{ padding: "8px 12px", border: "1px solid #e5e7eb", fontWeight: 600, color: isDung ? "#059669" : "#dc2626" }}>
                                  {b.dap_an_chon || <span style={{ color: "#9ca3af" }}>—</span>}
                                </td>
                                <td style={{ padding: "8px 12px", border: "1px solid #e5e7eb", fontWeight: 700, color: "#059669" }}>
                                  {b.cauHoi?.dap_an_dung || "—"}
                                </td>
                                <td style={{ padding: "8px 12px", border: "1px solid #e5e7eb", textAlign: "center", fontSize: 18 }}>
                                  {isDung
                                    ? <span style={{ color: "#059669" }}>✓</span>
                                    : <span style={{ color: "#dc2626" }}>✗</span>}
                                </td>
                                <td style={{ padding: "8px 12px", border: "1px solid #e5e7eb", fontWeight: 700, color: isDung ? "#059669" : "#9ca3af", textAlign: "center" }}>
                                  {isDung ? `+${b.diem_duoc ?? b.cauHoi?.diem ?? 1}` : "0"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div style={{ color: "#9ca3af", fontSize: 13, padding: 12 }}>Không có dữ liệu bài làm</div>
                    )}

                    {/* Writing nếu có */}
                    {cauViet.length > 0 && (
                      <div style={{ marginTop: 12, padding: 12, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#065f46", marginBottom: 8 }}>✍️ Bài viết (chờ giáo viên chấm)</div>
                        {cauViet.map((b, i) => (
                          <div key={i} style={{ marginBottom: 8, padding: "8px 12px", background: "#fff", borderRadius: 6, border: "1px solid #d1fae5" }}>
                            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>Câu {b.cauHoi?.stt || i+1}: {b.cauHoi?.noi_dung}</div>
                            <div style={{ fontSize: 13, color: "#374151", whiteSpace: "pre-wrap" }}>{b.dap_an_chon || <em style={{ color: "#9ca3af" }}>Chưa trả lời</em>}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
