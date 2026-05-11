import { useState, useEffect, useCallback, Fragment } from 'react';
import { lmsAPI } from '../../api';

const fmtDT = (s) => s ? new Date(s).toLocaleString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" }) : "—";
const maHV = (id) => `HV${String(id).padStart(10, "0")}`;

const TRANG_THAI_CFG = {
  hoat_dong:  { label: "Đang hoạt động", bg: "#d1fae5", color: "#065f46" },
  khoa:       { label: "Đã khóa",        bg: "#fee2e2", color: "#991b1b" },
  tam_ngung:  { label: "Tạm ngưng",      bg: "#fef3c7", color: "#92400e" },
};
const TRANG_THAI_HOC_CFG = {
  dang_hoc:   { label: "Đang học",   bg: "#fef3c7", color: "#92400e" },
  hoan_thanh: { label: "Hoàn thành", bg: "#d1fae5", color: "#065f46" },
  bao_luu:    { label: "Bảo lưu",    bg: "#dbeafe", color: "#1d4ed8" },
  nghi_hoc:   { label: "Nghỉ học",   bg: "#f3f4f6", color: "#6b7280" },
};
const GIOI_TINH_CFG = {
  "Nữ":  { label: "Nữ",  bg: "#fce7f3", color: "#9d174d" },
  "Nam": { label: "Nam", bg: "#dbeafe", color: "#1d4ed8" },
  "Khác":{ label: "Khác",bg: "#f3f4f6", color: "#374151" },
};

const inp = { padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 13, outline: "none", boxSizing: "border-box" };
const btn = (bg, color = "#fff") => ({ padding: "8px 16px", background: bg, color, border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 });

export default function StudentManagement() {
  const [hocViens, setHocViens]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState("");
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [expandedId, setExpandedId] = useState(null);
  const [ghiChuMap, setGhiChuMap]   = useState({}); // { hvId: [...] }
  const [ghiChuInput, setGhiChuInput] = useState(""); // input cho expanded row
  const [showModal, setShowModal]   = useState(false);
  const [editingHV, setEditingHV]   = useState(null);
  const [hvForm, setHvForm]         = useState({ ho_ten:"", email:"", sdt:"", gioi_tinh:"Nữ", mat_khau:"" });

  const loadHocViens = useCallback(async (page = pagination.page) => {
    setLoading(true);
    try {
      const res = await lmsAPI.getHocViens({ search, page, limit: 20 });
      const data = res.data || res;
      setHocViens(Array.isArray(data) ? data : (data.hocViens || []));
      if (data.pagination) setPagination(p => ({ ...p, ...data.pagination }));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, pagination.page]); // eslint-disable-line

  useEffect(() => { loadHocViens(1); }, [search]); // eslint-disable-line

  const toggleExpand = async (hv) => {
    if (expandedId === hv.id) { setExpandedId(null); return; }
    setExpandedId(hv.id);
    setGhiChuInput("");
    if (!ghiChuMap[hv.id]) {
      try {
        const res = await lmsAPI.getGhiChuHocVien(hv.id);
        setGhiChuMap(m => ({ ...m, [hv.id]: res.data || [] }));
      } catch { setGhiChuMap(m => ({ ...m, [hv.id]: [] })); }
    }
  };

  const handleAddGhiChu = async (hvId) => {
    if (!ghiChuInput.trim()) return;
    try {
      await lmsAPI.createGhiChuHocVien(hvId, { noi_dung: ghiChuInput.trim() });
      const res = await lmsAPI.getGhiChuHocVien(hvId);
      setGhiChuMap(m => ({ ...m, [hvId]: res.data || [] }));
      setGhiChuInput("");
    } catch { alert("Lỗi thêm ghi chú"); }
  };

  const handleDeleteGhiChu = async (hvId, gcId) => {
    if (!window.confirm("Xóa ghi chú này?")) return;
    await lmsAPI.deleteGhiChuHocVien(hvId, gcId);
    setGhiChuMap(m => ({ ...m, [hvId]: (m[hvId] || []).filter(g => g.id !== gcId) }));
  };

  const openCreate = () => { setEditingHV(null); setHvForm({ ho_ten:"", email:"", sdt:"", gioi_tinh:"Nữ", mat_khau:"" }); setShowModal(true); };
  const openEdit   = (hv) => { setEditingHV(hv); setHvForm({ ho_ten: hv.ho_ten, email: hv.email, sdt: hv.sdt||"", gioi_tinh: hv.gioi_tinh||"Nữ", mat_khau:"" }); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editingHV) await lmsAPI.updateHocVien(editingHV.id, hvForm);
      else await lmsAPI.createHocVien(hvForm);
      setShowModal(false); loadHocViens(1);
    } catch (e) { alert("Lỗi: " + e.message); }
  };

  const handleExport = () => {
    const rows = [["Mã HV","Họ tên","SĐT","Email","Giới tính","Trạng thái"]];
    hocViens.forEach(hv => rows.push([maHV(hv.id), hv.ho_ten, hv.sdt||"", hv.email, hv.gioi_tinh||"", hv.trang_thai||""]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csv);
    a.download = "danh_sach_hoc_vien.csv"; a.click();
  };

  const totalPages = pagination.totalPages || 1;
  const currentPage = pagination.page || 1;

  const renderPageNums = () => {
    const pages = [];
    const show = (p) => pages.push(
      <button key={p} onClick={() => { setPagination(prev => ({ ...prev, page: p })); loadHocViens(p); }}
        style={{ width: 28, height: 28, borderRadius: 4, border: "1px solid #d1d5db", background: p === currentPage ? "#e11d48" : "#fff",
          color: p === currentPage ? "#fff" : "#374151", cursor: "pointer", fontSize: 13, fontWeight: p === currentPage ? 700 : 400 }}>
        {p}
      </button>
    );
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) show(i); }
    else {
      show(1);
      if (currentPage > 3) pages.push(<span key="e1" style={{ padding: "0 4px", color: "#9ca3af" }}>...</span>);
      for (let i = Math.max(2, currentPage-1); i <= Math.min(totalPages-1, currentPage+1); i++) show(i);
      if (currentPage < totalPages - 2) pages.push(<span key="e2" style={{ padding: "0 4px", color: "#9ca3af" }}>...</span>);
      show(totalPages);
    }
    return pages;
  };

  return (
    <div style={{ padding: 24, fontFamily: "system-ui, sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
        Thông tin học &nbsp;/&nbsp; <span style={{ color: "#111827", fontWeight: 600 }}>Danh sách học viên</span>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", overflow: "hidden", flex: "0 0 260px" }}>
          <span style={{ padding: "0 10px", color: "#9ca3af", fontSize: 14 }}>▼</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm..."
            style={{ ...inp, border: "none", flex: 1, padding: "8px 4px" }} />
          <span style={{ padding: "0 10px", color: "#9ca3af" }}>🔍</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button style={btn("#3b82f6")} onClick={() => {}}>
            <span>⬇</span> File mẫu
          </button>
          <button style={btn("#f59e0b")}>
            <span>⚡</span> Tạo nhanh
          </button>
          <button style={btn("#10b981")} onClick={handleExport}>
            <span>📤</span> Xuất file
          </button>
          <button style={btn("#e11d48")} onClick={openCreate}>
            <span>＋</span> Tạo mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
            <thead>
              <tr style={{ background: "#e11d48" }}>
                <th style={{ width: 36, padding: "11px 10px" }}></th>
                <th style={{ padding: "11px 16px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "left" }}>Thông tin</th>
                <th style={{ padding: "11px 16px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "left" }}>Liên hệ</th>
                <th style={{ padding: "11px 16px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "center" }}>Giới tính</th>
                <th style={{ padding: "11px 16px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "left" }}>Trạng thái</th>
                <th style={{ padding: "11px 16px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "left" }}>Trạng thái học</th>
                <th style={{ padding: "11px 16px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "left" }}>Trường hiện tại</th>
                <th style={{ padding: "11px 16px", color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "center" }}>Chức năng</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Đang tải...</td></tr>
              ) : hocViens.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Không có học viên nào</td></tr>
              ) : hocViens.map(hv => {
                const isExpanded = expandedId === hv.id;
                const ttCfg = TRANG_THAI_CFG[hv.trang_thai] || { label: hv.trang_thai || "—", bg: "#f3f4f6", color: "#374151" };
                const lopDangHoc = (hv.dangKyLops || []).filter(dk => dk.lopHoc?.trang_thai === "dang_dien_ra");
                const trangThaiHoc = lopDangHoc.length > 0 ? "dang_hoc" : "nghi_hoc";
                const tthCfg = TRANG_THAI_HOC_CFG[trangThaiHoc];
                const gtCfg = GIOI_TINH_CFG[hv.gioi_tinh] || { label: hv.gioi_tinh || "—", bg: "#f3f4f6", color: "#374151" };
                const lopHienTai = lopDangHoc.map(dk => dk.lopHoc?.khoaHoc?.ten_khoa || dk.lopHoc?.ma_lop).filter(Boolean).join(", ") || "—";

                return (
                  <Fragment key={hv.id}>
                    <tr style={{ borderBottom: "1px solid #f3f4f6", background: isExpanded ? "#fffbf0" : "#fff" }}
                      onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = "#fef9f9"; }}
                      onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = "#fff"; }}>
                      {/* Expand */}
                      <td style={{ padding: "10px", textAlign: "center" }}>
                        <button onClick={() => toggleExpand(hv)}
                          style={{ width: 22, height: 22, borderRadius: 4, border: "1px solid #d1d5db",
                            background: isExpanded ? "#e11d48" : "#fff", color: isExpanded ? "#fff" : "#374151",
                            cursor: "pointer", fontSize: 13, fontWeight: 700, lineHeight: 1, padding: 0 }}>
                          {isExpanded ? "−" : "+"}
                        </button>
                      </td>
                      {/* Thông tin */}
                      <td style={{ padding: "10px 16px", minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6",
                            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                            👤
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{hv.ho_ten}</div>
                            <div style={{ fontSize: 12, color: "#9ca3af" }}>{maHV(hv.id)}</div>
                          </div>
                        </div>
                      </td>
                      {/* Liên hệ */}
                      <td style={{ padding: "10px 16px", minWidth: 200 }}>
                        <div style={{ fontSize: 13, color: "#374151" }}>Điện thoại: <strong>{hv.sdt || "—"}</strong></div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>Email: {hv.email || "—"}</div>
                      </td>
                      {/* Giới tính */}
                      <td style={{ padding: "10px 16px", textAlign: "center" }}>
                        <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: gtCfg.bg, color: gtCfg.color }}>
                          {gtCfg.label}
                        </span>
                      </td>
                      {/* Trạng thái */}
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: ttCfg.bg, color: ttCfg.color }}>
                          {ttCfg.label}
                        </span>
                      </td>
                      {/* Trạng thái học */}
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: tthCfg.bg, color: tthCfg.color }}>
                          {tthCfg.label}
                        </span>
                      </td>
                      {/* Trường hiện tại */}
                      <td style={{ padding: "10px 16px", fontSize: 13, color: "#374151", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lopHienTai}
                      </td>
                      {/* Chức năng */}
                      <td style={{ padding: "10px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <button title="Xem" style={{ width: 28, height: 28, borderRadius: 5, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", color: "#3b82f6", fontSize: 14 }}>👁</button>
                          <button title="Sửa" onClick={() => openEdit(hv)} style={{ width: 28, height: 28, borderRadius: 5, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", color: "#f59e0b", fontSize: 14 }}>✏️</button>
                          <button title="Xóa" style={{ width: 28, height: 28, borderRadius: 5, border: "1px solid #fca5a5", background: "#fff", cursor: "pointer", color: "#dc2626", fontSize: 14 }}>🗑</button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded — Ghi chú */}
                    {isExpanded && (
                      <tr key={`exp-${hv.id}`}>
                        <td colSpan={8} style={{ padding: "0 0 0 46px", background: "#fffbf0", borderBottom: "2px solid #fcd34d" }}>
                          <div style={{ padding: "14px 20px 14px 0" }}>
                            {/* Nút thêm ghi chú */}
                            <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
                              <button onClick={() => handleAddGhiChu(hv.id)}
                                style={{ padding: "6px 16px", background: "#f59e0b", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                                Thêm ghi chú
                              </button>
                              <input value={ghiChuInput} onChange={e => setGhiChuInput(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleAddGhiChu(hv.id)}
                                placeholder="Nhập ghi chú rồi nhấn Enter hoặc bấm Thêm..."
                                style={{ ...inp, flex: 1, background: "#fff" }} />
                            </div>

                            {/* Bảng ghi chú */}
                            {(ghiChuMap[hv.id] || []).length > 0 && (
                              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, background: "#fff", borderRadius: 8, overflow: "hidden" }}>
                                <thead>
                                  <tr style={{ background: "#f3f4f6" }}>
                                    {["Ghi chú", "Tạo ngày", "Người tạo", "Chức năng"].map((h, i) => (
                                      <th key={i} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 12, borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {(ghiChuMap[hv.id] || []).map((gc, i) => (
                                    <tr key={gc.id} style={{ borderBottom: "1px solid #f9fafb", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                                      <td style={{ padding: "8px 12px", color: "#374151" }}>{gc.noi_dung}</td>
                                      <td style={{ padding: "8px 12px", color: "#6b7280", whiteSpace: "nowrap" }}>{fmtDT(gc.created_at)}</td>
                                      <td style={{ padding: "8px 12px", fontWeight: 600, color: "#374151" }}>{gc.ten_nguoi_tao || "—"}</td>
                                      <td style={{ padding: "8px 12px" }}>
                                        <button onClick={() => handleDeleteGhiChu(hv.id, gc.id)}
                                          style={{ width: 26, height: 26, borderRadius: 5, border: "1px solid #fca5a5", background: "#fff", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>
                                          🗑
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                            {(ghiChuMap[hv.id] || []).length === 0 && (
                              <div style={{ fontSize: 13, color: "#9ca3af", padding: "4px 0" }}>Chưa có ghi chú nào</div>
                            )}
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
          <span style={{ fontSize: 13, color: "#6b7280" }}>Tổng cộng: <strong>{pagination.total || hocViens.length}</strong></span>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button onClick={() => { const p = Math.max(1, currentPage-1); setPagination(prev => ({ ...prev, page: p })); loadHocViens(p); }}
              disabled={currentPage === 1}
              style={{ width: 28, height: 28, borderRadius: 4, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", opacity: currentPage===1?0.4:1, fontSize: 14 }}>‹</button>
            {renderPageNums()}
            <button onClick={() => { const p = Math.min(totalPages, currentPage+1); setPagination(prev => ({ ...prev, page: p })); loadHocViens(p); }}
              disabled={currentPage >= totalPages}
              style={{ width: 28, height: 28, borderRadius: 4, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", opacity: currentPage>=totalPages?0.4:1, fontSize: 14 }}>›</button>
          </div>
        </div>
      </div>

      {/* Modal tạo/sửa */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#e11d48", marginBottom: 20 }}>
              {editingHV ? "Sửa học viên" : "Tạo học viên mới"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["Họ tên *","ho_ten","text"],["SĐT *","sdt","tel"],["Email","email","email"]].map(([label, key, type]) => (
                <div key={key} style={{ gridColumn: key === "ho_ten" ? "1 / -1" : "auto" }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>{label}</label>
                  <input type={type} value={hvForm[key]} onChange={e => setHvForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ ...inp, width: "100%" }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Giới tính</label>
                <select value={hvForm.gioi_tinh} onChange={e => setHvForm(f => ({ ...f, gioi_tinh: e.target.value }))}
                  style={{ ...inp, width: "100%" }}>
                  <option value="Nữ">Nữ</option>
                  <option value="Nam">Nam</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              {!editingHV && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Mật khẩu</label>
                  <input type="password" value={hvForm.mat_khau} onChange={e => setHvForm(f => ({ ...f, mat_khau: e.target.value }))}
                    placeholder="Mặc định: 123456" style={{ ...inp, width: "100%" }} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "8px 20px", border: "1px solid #d1d5db", borderRadius: 8, background: "#fff", fontSize: 13, cursor: "pointer" }}>Hủy</button>
              <button onClick={handleSave} style={{ padding: "8px 20px", background: "#e11d48", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
