import { useState, useEffect } from 'react';
import { examAPI } from '../../api';

const S = {
  page: { padding: '24px', background: '#f9fafb', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 },
  btnPrimary: { background: '#111827', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnSecondary: { background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, marginRight: 6 },
  btnDanger: { background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 24 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#111827', color: '#fff', padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600 },
  td: { padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6' },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: (w) => ({ background: '#fff', borderRadius: 10, padding: 28, width: w, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }),
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 },
  input: { width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box', outline: 'none' },
  select: { width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box', background: '#fff' },
  textarea: { width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box', resize: 'vertical', minHeight: 72 },
  formRow: { marginBottom: 14 },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #f3f4f6' },
};

export default function QuanLyDeThi() {
  const [deThis, setDeThis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCauHoiModal, setShowCauHoiModal] = useState(false);
  const [selectedDeThi, setSelectedDeThi] = useState(null);
  const [cauHois, setCauHois] = useState([]);
  const [showKetQua, setShowKetQua] = useState(false);
  const [ketQuas, setKetQuas] = useState([]);
  const [form, setForm] = useState({ ten_de: '', mo_ta: '', loai: 'ielts', thoi_gian_phut: 60, file_pdf: null, file_audio: null });
  const [cauHoiForm, setCauHoiForm] = useState({ ky_nang: 'doc', noi_dung: '', lua_chon: ['', '', '', ''], dap_an_dung: 'A', diem: 1 });
  const [hoverRow, setHoverRow] = useState(null);

  useEffect(() => { loadDeThis(); }, []);

  const loadDeThis = async () => {
    setLoading(true);
    try { const res = await examAPI.getAllDeThi(); setDeThis(res.data || []); } catch (e) { console.error(e); }
    setLoading(false);
  };

  const loadCauHois = async (deThiId) => {
    try { const res = await examAPI.getDeThiById(deThiId); setCauHois(res.data?.cauHois || []); } catch (e) { console.error(e); }
  };

  const handleCreateDeThi = async () => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null) fd.append(k, v); });
    try { 
      await examAPI.createDeThi(fd); 
      setShowModal(false); 
      setForm({ ten_de: '', mo_ta: '', loai: 'ielts', thoi_gian_phut: 60, file_pdf: null, file_audio: null }); 
      loadDeThis(); 
    } catch (e) { console.error(e); }
  };

  const handleAddCauHoi = async () => {
    try { await examAPI.addCauHoi(selectedDeThi.id, cauHoiForm); setShowCauHoiModal(false); setCauHoiForm({ ky_nang: 'doc', noi_dung: '', lua_chon: ['', '', '', ''], dap_an_dung: 'A', diem: 1 }); loadCauHois(selectedDeThi.id); } catch (e) { console.error(e); }
  };

  const handleDeleteCauHoi = async (id) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    try { await examAPI.deleteCauHoi(id); loadCauHois(selectedDeThi.id); } catch (e) { console.error(e); }
  };

  const handleDeleteDeThi = async (id) => {
    if (!window.confirm('Xóa đề thi này?')) return;
    try { await examAPI.deleteDeThi(id); loadDeThis(); } catch (e) { console.error(e); }
  };

  const loadKetQua = async (deThiId) => {
    try { const res = await examAPI.getAllKetQua({ de_thi_id: deThiId }); setKetQuas(res.data || []); setShowKetQua(true); } catch (e) { console.error(e); }
  };

  const loaiLabel = { ielts: 'IELTS', toeic: 'TOEIC', giao_tiep: 'Giao tiếp', khac: 'Khác' };
  const kyNangLabel = { doc: 'Đọc', nghe: 'Nghe', noi: 'Nói', viet: 'Viết' };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <h1 style={S.title}>Quản lý đề thi</h1>
        <button style={S.btnPrimary} onClick={() => setShowModal(true)}>+ Tạo đề thi</button>
      </div>

      {/* Table đề thi */}
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>{['#','Tên đề','Loại','Thời gian (phút)','Số câu','Trạng thái','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#9ca3af' }}>Đang tải...</td></tr>
            ) : deThis.length === 0 ? (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#9ca3af' }}>Chưa có đề thi nào</td></tr>
            ) : deThis.map((dt, i) => (
              <tr key={dt.id} onMouseEnter={() => setHoverRow(dt.id)} onMouseLeave={() => setHoverRow(null)}
                style={{ background: hoverRow === dt.id ? '#f9fafb' : '#fff' }}>
                <td style={S.td}>{i + 1}</td>
                <td style={{ ...S.td, fontWeight: 600 }}>{dt.ten_de}</td>
                <td style={S.td}><span style={{ ...S.badge, background: '#eff6ff', color: '#1d4ed8' }}>{loaiLabel[dt.loai] || dt.loai}</span></td>
                <td style={S.td}>{dt.thoi_gian_phut}</td>
                <td style={S.td}>{dt.so_cau || 0}</td>
                <td style={S.td}><span style={{ ...S.badge, background: '#f0fdf4', color: '#16a34a' }}>Hoạt động</span></td>
                <td style={S.td}>
                  <button style={S.btnSecondary} onClick={() => { setSelectedDeThi(dt); setShowKetQua(false); loadCauHois(dt.id); }}>Câu hỏi</button>
                  <button style={S.btnSecondary} onClick={() => { setSelectedDeThi(dt); loadKetQua(dt.id); }}>Kết quả</button>
                  <button style={S.btnDanger} onClick={() => handleDeleteDeThi(dt.id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Panel câu hỏi */}
      {selectedDeThi && !showKetQua && (
        <div style={S.card}>
          <div style={S.panelHeader}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Câu hỏi — {selectedDeThi.ten_de}</span>
            <div>
              <button style={S.btnPrimary} onClick={() => setShowCauHoiModal(true)}>Thêm câu hỏi</button>
              <button style={{ ...S.btnSecondary, marginLeft: 8 }} onClick={() => setSelectedDeThi(null)}>Đóng</button>
            </div>
          </div>
          <table style={S.table}>
            <thead><tr>{['STT','Kỹ năng','Nội dung','Đáp án đúng','Điểm','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {cauHois.length === 0 ? (
                <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#9ca3af' }}>Chưa có câu hỏi</td></tr>
              ) : cauHois.map((c, i) => (
                <tr key={c.id}>
                  <td style={S.td}>{i + 1}</td>
                  <td style={S.td}><span style={{ ...S.badge, background: '#fef3c7', color: '#92400e' }}>{kyNangLabel[c.ky_nang] || c.ky_nang}</span></td>
                  <td style={S.td}>{c.noi_dung?.length > 60 ? c.noi_dung.slice(0, 60) + '…' : c.noi_dung}</td>
                  <td style={{ ...S.td, fontWeight: 700 }}>{c.dap_an_dung}</td>
                  <td style={S.td}>{c.diem}</td>
                  <td style={S.td}><button style={S.btnDanger} onClick={() => handleDeleteCauHoi(c.id)}>Xóa</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Panel kết quả */}
      {showKetQua && (
        <div style={S.card}>
          <div style={S.panelHeader}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Kết quả thi</span>
            <button style={S.btnSecondary} onClick={() => { setShowKetQua(false); setSelectedDeThi(null); }}>Đóng</button>
          </div>
          <table style={S.table}>
            <thead><tr>{['STT','Học viên','SĐT','Điểm','Thời gian làm (phút)','Ngày hoàn thành'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {ketQuas.length === 0 ? (
                <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#9ca3af' }}>Chưa có kết quả</td></tr>
              ) : ketQuas.map((k, i) => (
                <tr key={k.id}>
                  <td style={S.td}>{i + 1}</td>
                  <td style={{ ...S.td, fontWeight: 600 }}>{k.ten_hoc_vien || k.ho_ten}</td>
                  <td style={S.td}>{k.so_dien_thoai}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: '#111827' }}>{k.diem_tong}</td>
                  <td style={S.td}>{k.thoi_gian_lam}</td>
                  <td style={S.td}>{k.ngay_hoan_thanh ? new Date(k.ngay_hoan_thanh).toLocaleString('vi-VN') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal tạo đề thi */}
      {showModal && (
        <div style={S.overlay} onClick={() => setShowModal(false)}>
          <div style={S.modal(480)} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>Tạo đề thi mới</h2>
            <div style={S.formRow}><label style={S.label}>Tên đề *</label><input style={S.input} value={form.ten_de} onChange={e => setForm(f => ({ ...f, ten_de: e.target.value }))} placeholder="Nhập tên đề thi" /></div>
            <div style={S.formRow}><label style={S.label}>Loại</label>
              <select style={S.select} value={form.loai} onChange={e => setForm(f => ({ ...f, loai: e.target.value }))}>
                <option value="ielts">IELTS</option><option value="toeic">TOEIC</option><option value="giao_tiep">Giao tiếp</option><option value="khac">Khác</option>
              </select>
            </div>
            <div style={S.formRow}><label style={S.label}>Thời gian làm bài (phút)</label><input style={S.input} type="number" value={form.thoi_gian_phut} onChange={e => setForm(f => ({ ...f, thoi_gian_phut: +e.target.value }))} /></div>
            <div style={S.formRow}><label style={S.label}>Mô tả</label><textarea style={S.textarea} value={form.mo_ta} onChange={e => setForm(f => ({ ...f, mo_ta: e.target.value }))} placeholder="Mô tả đề thi..." /></div>
            <div style={S.formRow}><label style={S.label}>Upload PDF đề (tùy chọn)</label><input type="file" accept=".pdf" onChange={e => setForm(f => ({ ...f, file_pdf: e.target.files[0] || null }))} /></div>
            <div style={S.formRow}><label style={S.label}>Upload Audio nghe (mp3) (tùy chọn)</label><input type="file" accept=".mp3,.wav,audio/*" onChange={e => setForm(f => ({ ...f, file_audio: e.target.files[0] || null }))} /></div>
            <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 6, fontSize: 12, color: '#065f46', marginBottom: 16 }}>
              📝 <b>Quy trình tạo đề test online:</b><br/>
              1. Tạo đề thi → 2. Thêm câu hỏi Nghe + Đọc → 3. Tạo lịch hẹn test gắn đề thi → 4. Học viên vào làm bài
            </div>
            <div style={S.modalFooter}>
              <button style={S.btnSecondary} onClick={() => setShowModal(false)}>Hủy</button>
              <button style={S.btnPrimary} onClick={handleCreateDeThi}>Tạo đề</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm câu hỏi */}
      {showCauHoiModal && (
        <div style={S.overlay} onClick={() => setShowCauHoiModal(false)}>
          <div style={S.modal(560)} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>Thêm câu hỏi</h2>
            <div style={S.formRow}><label style={S.label}>Kỹ năng</label>
              <select style={S.select} value={cauHoiForm.ky_nang} onChange={e => setCauHoiForm(f => ({ ...f, ky_nang: e.target.value }))}>
                <option value="doc">Đọc</option><option value="nghe">Nghe</option><option value="noi">Nói</option><option value="viet">Viết</option>
              </select>
            </div>
            <div style={S.formRow}><label style={S.label}>Nội dung câu hỏi *</label><textarea style={S.textarea} value={cauHoiForm.noi_dung} onChange={e => setCauHoiForm(f => ({ ...f, noi_dung: e.target.value }))} placeholder="Nhập nội dung câu hỏi..." /></div>
            {['A','B','C','D'].map((lbl, idx) => (
              <div key={lbl} style={S.formRow}>
                <label style={S.label}>{lbl}.</label>
                <input style={S.input} value={cauHoiForm.lua_chon[idx]} onChange={e => { const arr = [...cauHoiForm.lua_chon]; arr[idx] = e.target.value; setCauHoiForm(f => ({ ...f, lua_chon: arr })); }} placeholder={`Lựa chọn ${lbl}`} />
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={S.formRow}><label style={S.label}>Đáp án đúng</label>
                <select style={S.select} value={cauHoiForm.dap_an_dung} onChange={e => setCauHoiForm(f => ({ ...f, dap_an_dung: e.target.value }))}>
                  {['A','B','C','D'].map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div style={S.formRow}><label style={S.label}>Điểm</label><input style={S.input} type="number" min={1} value={cauHoiForm.diem} onChange={e => setCauHoiForm(f => ({ ...f, diem: +e.target.value }))} /></div>
            </div>
            <div style={S.modalFooter}>
              <button style={S.btnSecondary} onClick={() => setShowCauHoiModal(false)}>Hủy</button>
              <button style={S.btnPrimary} onClick={handleAddCauHoi}>Thêm câu hỏi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
