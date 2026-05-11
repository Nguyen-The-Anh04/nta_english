import { useState, useEffect } from 'react';
import { examAPI } from '../../api';

const S = {
  page: { padding: '24px', background: '#f9fafb', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 },
  btnPrimary: { background: '#e11d48', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  btnSecondary: { background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12, marginRight: 6 },
  btnSuccess: { background: '#059669', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  btnWarning: { background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  btnDanger: { background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 12 },
  card: { background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 24 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { background: '#e11d48', color: '#fff', padding: '10px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600, borderRight: '1px solid rgba(255,255,255,0.2)' },
  td: { padding: '10px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600 },
  badgeSuccess: { background: '#d1fae5', color: '#065f46' },
  badgeWarning: { background: '#fef3c7', color: '#92400e' },
  badgeDanger: { background: '#fee2e2', color: '#991b1b' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: (w) => ({ background: '#fff', borderRadius: 10, padding: 28, width: w, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }),
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 },
  input: { width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box', outline: 'none' },
  select: { width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box', background: '#fff' },
  textarea: { width: '100%', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 13, boxSizing: 'border-box', resize: 'vertical', minHeight: 72 },
  formRow: { marginBottom: 14 },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid #f3f4f6' },
  tabBtn: (active) => ({
    padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    background: active ? '#e11d48' : '#f3f4f6', color: active ? '#fff' : '#374151',
    borderRadius: 6, marginRight: 8
  }),
};

export default function QuanLyDeThi() {
  const [deThis, setDeThis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCauHoiModal, setShowCauHoiModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeThi, setSelectedDeThi] = useState(null);
  const [cauHois, setCauHois] = useState([]);
  const [showKetQua, setShowKetQua] = useState(false);
  const [ketQuas, setKetQuas] = useState([]);
  const [form, setForm] = useState({ ten_de: '', mo_ta: '', loai: 'ielts', thoi_gian_phut: 60, file_pdf: null, file_audio: null });
  const [editForm, setEditForm] = useState({ ten_de: '', mo_ta: '', loai: 'ielts', thoi_gian_phut: 60, file_pdf: null, file_audio: null, json_data: '' });
  const [cauHoiForm, setCauHoiForm] = useState({ 
    ky_nang: 'doc', 
    noi_dung: '', 
    lua_chon: ['', '', '', ''], 
    dap_an_dung: 'A', 
    diem: 1,
    loai_cau: 'mcq', // mcq, fill_blank, true_false, essay
    passage: '',
    huong_dan: ''
  });
  const [hoverRow, setHoverRow] = useState(null);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [jsonFile, setJsonFile] = useState(null);
  const [jsonAudio, setJsonAudio] = useState(null);
  const [jsonUploading, setJsonUploading] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [excelAudio, setExcelAudio] = useState(null);
  const [excelForm, setExcelForm] = useState({ ten_de: '', thoi_gian_phut: 90, loai: 'khac' });
  const [excelUploading, setExcelUploading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { loadDeThis(); }, []);

  const loadDeThis = async () => {
    setLoading(true);
    try { 
      const res = await examAPI.getAllDeThi(); 
      setDeThis(res.data || []); 
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleDownloadTemplate = () => {
    window.open('http://localhost:5000/api/exam/de-thi/template', '_blank');
  };

  const handlePublish = async (id, currentStatus) => {
    const newStatus = currentStatus === 'hoat_dong' ? 'tam_dung' : 'hoat_dong';
    if (!window.confirm(newStatus === 'hoat_dong' ? 'Công bố đề thi để học viên có thể làm bài?' : 'Tạm dừng đề thi?')) return;
    try {
      const res = await examAPI.publishDeThi(id, newStatus);
      if (res.success) {
        alert(res.message);
        loadDeThis();
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  const handleUploadJSON = async () => {
    if (!jsonFile) { alert('Vui lòng chọn file JSON!'); return; }
    setJsonUploading(true);
    try {
      const fd = new FormData();
      fd.append('file_json', jsonFile);
      if (jsonAudio) fd.append('file_audio', jsonAudio);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/exam/de-thi/upload-json', {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        setShowJsonModal(false); setJsonFile(null); setJsonAudio(null);
        loadDeThis();
      } else { alert('Lỗi: ' + data.message); }
    } catch (e) { alert('Lỗi upload: ' + e.message); }
    setJsonUploading(false);
  };

  const handleUploadExcel = async () => {
    if (!excelFile) { alert('Vui lòng chọn file Excel!'); return; }
    if (!excelForm.ten_de) { alert('Vui lòng nhập tên đề thi!'); return; }
    setExcelUploading(true);
    try {
      const fd = new FormData();
      fd.append('file_excel', excelFile);
      if (excelAudio) fd.append('file_audio', excelAudio);
      fd.append('ten_de', excelForm.ten_de);
      fd.append('thoi_gian_phut', excelForm.thoi_gian_phut);
      fd.append('loai', excelForm.loai);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/exam/de-thi/upload-excel', {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: fd,
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        setShowExcelModal(false); setExcelFile(null); setExcelAudio(null);
        setExcelForm({ ten_de: '', thoi_gian_phut: 90, loai: 'khac' });
        loadDeThis();
      } else { alert('Lỗi: ' + data.message); }
    } catch (e) { alert('Lỗi upload: ' + e.message); }
    setExcelUploading(false);
  };

  const loadCauHois = async (deThiId) => {
    try { 
      const res = await examAPI.getDeThiById(deThiId); 
      setCauHois(res.data?.cauHois || []); 
    } catch (e) { console.error(e); }
  };

  const handleCreateDeThi = async () => {
    if (!form.ten_de) { alert('Vui lòng nhập tên đề thi!'); return; }
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== null) fd.append(k, v); });
    try { 
      await examAPI.createDeThi(fd); 
      setShowModal(false); 
      setForm({ ten_de: '', mo_ta: '', loai: 'ielts', thoi_gian_phut: 60, file_pdf: null, file_audio: null }); 
      loadDeThis(); 
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  const handleEditDeThi = (dt) => {
    setSelectedDeThi(dt);
    setEditForm({
      ten_de: dt.ten_de || '',
      mo_ta: dt.mo_ta || '',
      loai: dt.loai || 'ielts',
      thoi_gian_phut: dt.thoi_gian_phut || 60,
      file_pdf: null,
      file_audio: null,
      json_data: dt.json_data || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateDeThi = async () => {
    if (!editForm.ten_de) { alert('Vui lòng nhập tên đề thi!'); return; }
    const fd = new FormData();
    Object.entries(editForm).forEach(([k, v]) => { 
      if (v !== null && v !== '') fd.append(k, v); 
    });
    try {
      const res = await examAPI.updateDeThi(selectedDeThi.id, fd);
      if (res.success) {
        alert('Cập nhật thành công!');
        setShowEditModal(false);
        loadDeThis();
      } else {
        alert('Lỗi: ' + res.message);
      }
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  const handleAddCauHoi = async () => {
    if (!cauHoiForm.noi_dung) { alert('Vui lòng nhập nội dung câu hỏi!'); return; }
    try { 
      await examAPI.addCauHoi(selectedDeThi.id, cauHoiForm); 
      setShowCauHoiModal(false); 
      setCauHoiForm({ 
        ky_nang: 'doc', 
        noi_dung: '', 
        lua_chon: ['', '', '', ''], 
        dap_an_dung: 'A', 
        diem: 1,
        loai_cau: 'mcq',
        passage: '',
        huong_dan: ''
      }); 
      loadCauHois(selectedDeThi.id); 
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  const handleDeleteCauHoi = async (id) => {
    if (!window.confirm('Xóa câu hỏi này?')) return;
    try { await examAPI.deleteCauHoi(id); loadCauHois(selectedDeThi.id); } catch (e) { alert('Lỗi: ' + e.message); }
  };

  const handleDeleteDeThi = async (id) => {
    if (!window.confirm('Xóa đề thi này?')) return;
    try { await examAPI.deleteDeThi(id); loadDeThis(); } catch (e) { alert('Lỗi: ' + e.message); }
  };

  const loadKetQua = async (deThiId) => {
    try { const res = await examAPI.getAllKetQua({ de_thi_id: deThiId }); setKetQuas(res.data || []); setShowKetQua(true); } catch (e) { console.error(e); }
  };

  const loaiLabel = { ielts: 'IELTS', toeic: 'TOEIC', giao_tiep: 'Giao tiếp', khac: 'Khác' };
  const kyNangLabel = { doc: 'Đọc', nghe: 'Nghe', noi: 'Nói', viet: 'Viết' };
  const trangThaiLabel = { hoat_dong: 'Hoạt động', tam_dung: 'Tạm dừng' };

  const filteredDeThi = filterStatus === 'all' ? deThis : deThis.filter(dt => dt.trang_thai === filterStatus);

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <h1 style={S.title}>📝 Quản lý đề thi</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleDownloadTemplate}
            style={{ ...S.btnSecondary, background: '#f0fdf4', color: '#065f46', border: '1px solid #86efac', padding: '8px 14px' }}>
            📥 Tải template JSON
          </button>
          <button onClick={() => window.open('http://localhost:5000/api/exam/de-thi/template-excel', '_blank')}
            style={{ ...S.btnSecondary, background: '#fff5f5', color: '#e11d48', border: '1px solid #fca5a5', padding: '8px 14px' }}>
            📊 Tải template Excel
          </button>
          <button onClick={() => setShowJsonModal(true)}
            style={{ ...S.btnPrimary, background: '#e11d48', padding: '8px 16px' }}>
            📤 Upload JSON đề thi
          </button>
          <button onClick={() => setShowExcelModal(true)}
            style={{ ...S.btnPrimary, background: '#be123c', padding: '8px 16px' }}>
            📊 Upload Excel đề thi
          </button>
          <button style={S.btnPrimary} onClick={() => setShowModal(true)}>+ Tạo đề thi</button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <button style={S.tabBtn(filterStatus === 'all')} onClick={() => setFilterStatus('all')}>Tất cả</button>
        <button style={S.tabBtn(filterStatus === 'hoat_dong')} onClick={() => setFilterStatus('hoat_dong')}>Hoạt động</button>
        <button style={S.tabBtn(filterStatus === 'tam_dung')} onClick={() => setFilterStatus('tam_dung')}>Tạm dừng</button>
      </div>

      {/* Table đề thi */}
      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>{['#','Tên đề','Loại','Thời gian','Số câu','Trạng thái','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#9ca3af' }}>Đang tải...</td></tr>
            ) : filteredDeThi.length === 0 ? (
              <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#9ca3af' }}>Chưa có đề thi nào</td></tr>
            ) : filteredDeThi.map((dt, i) => (
              <tr key={dt.id} onMouseEnter={() => setHoverRow(dt.id)} onMouseLeave={() => setHoverRow(null)}
                style={{ background: hoverRow === dt.id ? '#f9fafb' : '#fff' }}>
                <td style={S.td}>{i + 1}</td>
                <td style={{ ...S.td, fontWeight: 600 }}>{dt.ten_de}</td>
                <td style={S.td}><span style={{ ...S.badge, background: '#fff5f5', color: '#e11d48' }}>{loaiLabel[dt.loai] || dt.loai}</span></td>
                <td style={S.td}>{dt.thoi_gian_phut} phút</td>
                <td style={S.td}>{dt.so_cau || 0}</td>
                <td style={S.td}>
                  <span style={{ 
                    ...S.badge, 
                    background: dt.trang_thai === 'hoat_dong' ? '#d1fae5' : '#fee2e2', 
                    color: dt.trang_thai === 'hoat_dong' ? '#065f46' : '#991b1b' 
                  }}>
                    {trangThaiLabel[dt.trang_thai] || dt.trang_thai}
                  </span>
                </td>
                <td style={S.td}>
                  <button style={S.btnSecondary} onClick={() => { setSelectedDeThi(dt); setShowKetQua(false); loadCauHois(dt.id); }}>Câu hỏi</button>
                  <button style={S.btnSecondary} onClick={() => { setSelectedDeThi(dt); loadKetQua(dt.id); }}>Kết quả</button>
                  <button style={S.btnSecondary} onClick={() => handleEditDeThi(dt)}>Sửa</button>
                  <button 
                    style={dt.trang_thai === 'hoat_dong' ? S.btnWarning : S.btnSuccess} 
                    onClick={() => handlePublish(dt.id, dt.trang_thai)}
                  >
                    {dt.trang_thai === 'hoat_dong' ? '⏸ Dừng' : '✅ Công bố'}
                  </button>
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
            <thead><tr>{['STT','Kỹ năng','Loại','Nội dung','Đáp án đúng','Điểm','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {cauHois.length === 0 ? (
                <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#9ca3af' }}>Chưa có câu hỏi</td></tr>
              ) : cauHois.map((c, i) => (
                <tr key={c.id}>
                  <td style={S.td}>{i + 1}</td>
                  <td style={S.td}><span style={{ ...S.badge, background: '#fef3c7', color: '#92400e' }}>{kyNangLabel[c.ky_nang] || c.ky_nang}</span></td>
                  <td style={S.td}><span style={{ ...S.badge, background: '#e0e7ff', color: '#3730a3', fontSize: 10 }}>{c.loai_cau || 'mcq'}</span></td>
                  <td style={S.td}>{c.noi_dung?.length > 50 ? c.noi_dung.slice(0, 50) + '…' : c.noi_dung}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: '#059669' }}>{c.dap_an_dung}</td>
                  <td style={S.td}>{c.diem}</td>
                  <td style={S.td}><button style={S.btnDanger} onClick={() => handleDeleteCauHoi(c.id)}>Xóa</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Panel kết quả */}
      {showKetQua && selectedDeThi && (
        <div style={S.card}>
          <div style={S.panelHeader}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Kết quả thi — {selectedDeThi.ten_de}</span>
            <button style={S.btnSecondary} onClick={() => { setShowKetQua(false); setSelectedDeThi(null); }}>Đóng</button>
          </div>
          <table style={S.table}>
            <thead><tr>{['STT','Học viên','SĐT','Điểm','Thời gian làm','Ngày hoàn thành'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
            <tbody>
              {ketQuas.length === 0 ? (
                <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#9ca3af' }}>Chưa có học viên làm bài</td></tr>
              ) : ketQuas.map((k, i) => (
                <tr key={k.id}>
                  <td style={S.td}>{i + 1}</td>
                  <td style={{ ...S.td, fontWeight: 600 }}>{k.ten_hoc_vien || k.ho_ten || 'Học viên'}</td>
                  <td style={S.td}>{k.so_dien_thoai || '—'}</td>
                  <td style={{ ...S.td, fontWeight: 700, color: '#e11d48', fontSize: 15 }}>{k.diem_tong || '—'}</td>
                  <td style={S.td}>{k.thoi_gian_lam ? Math.floor(k.thoi_gian_lam/60) + ' phút' : '—'}</td>
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
          <div style={S.modal(500)} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>➕ Tạo đề thi mới</h2>
            <div style={S.formRow}>
              <label style={S.label}>Tên đề thi *</label>
              <input style={S.input} value={form.ten_de} onChange={e => setForm(f => ({ ...f, ten_de: e.target.value }))} placeholder="VD: IELTS Reading Test 1" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={S.formRow}>
                <label style={S.label}>Loại</label>
                <select style={S.select} value={form.loai} onChange={e => setForm(f => ({ ...f, loai: e.target.value }))}>
                  <option value="ielts">IELTS</option>
                  <option value="toeic">TOEIC</option>
                  <option value="giao_tiep">Giao tiếp</option>
                  <option value="khac">Khác</option>
                </select>
              </div>
              <div style={S.formRow}>
                <label style={S.label}>Thời gian (phút)</label>
                <input style={S.input} type="number" value={form.thoi_gian_phut} onChange={e => setForm(f => ({ ...f, thoi_gian_phut: +e.target.value }))} />
              </div>
            </div>
            <div style={S.formRow}>
              <label style={S.label}>Mô tả</label>
              <textarea style={S.textarea} value={form.mo_ta} onChange={e => setForm(f => ({ ...f, mo_ta: e.target.value }))} placeholder="Mô tả đề thi..." />
            </div>
            <div style={S.formRow}>
              <label style={S.label}>📄 Upload PDF đề (tùy chọn)</label>
              <input type="file" accept=".pdf" onChange={e => setForm(f => ({ ...f, file_pdf: e.target.files[0] || null }))} style={{ fontSize: 12 }} />
            </div>
            <div style={S.formRow}>
              <label style={S.label}>🎵 Upload Audio nghe (mp3) (tùy chọn)</label>
              <input type="file" accept=".mp3,.wav,audio/*" onChange={e => setForm(f => ({ ...f, file_audio: e.target.files[0] || null }))} style={{ fontSize: 12 }} />
            </div>
            <div style={{ padding: '10px 14px', background: '#f0fdf4', borderRadius: 6, fontSize: 12, color: '#065f46', marginBottom: 16 }}>
              📝 <b>Quy trình:</b> Tạo đề → Thêm câu hỏi → Công bố → Học viên làm bài
            </div>
            <div style={S.modalFooter}>
              <button style={S.btnSecondary} onClick={() => setShowModal(false)}>Hủy</button>
              <button style={S.btnPrimary} onClick={handleCreateDeThi}>Tạo đề</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal sửa đề thi */}
      {showEditModal && (
        <div style={S.overlay} onClick={() => setShowEditModal(false)}>
          <div style={S.modal(550)} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>✏️ Cập nhật đề thi</h2>
            <div style={S.formRow}>
              <label style={S.label}>Tên đề thi *</label>
              <input style={S.input} value={editForm.ten_de} onChange={e => setEditForm(f => ({ ...f, ten_de: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={S.formRow}>
                <label style={S.label}>Loại</label>
                <select style={S.select} value={editForm.loai} onChange={e => setEditForm(f => ({ ...f, loai: e.target.value }))}>
                  <option value="ielts">IELTS</option>
                  <option value="toeic">TOEIC</option>
                  <option value="giao_tiep">Giao tiếp</option>
                  <option value="khac">Khác</option>
                </select>
              </div>
              <div style={S.formRow}>
                <label style={S.label}>Thời gian (phút)</label>
                <input style={S.input} type="number" value={editForm.thoi_gian_phut} onChange={e => setEditForm(f => ({ ...f, thoi_gian_phut: +e.target.value }))} />
              </div>
            </div>
            <div style={S.formRow}>
              <label style={S.label}>Mô tả</label>
              <textarea style={S.textarea} value={editForm.mo_ta} onChange={e => setEditForm(f => ({ ...f, mo_ta: e.target.value }))} />
            </div>
            <div style={S.formRow}>
              <label style={S.label}>📄 Thay đổi PDF (để trống nếu giữ nguyên)</label>
              <input type="file" accept=".pdf" onChange={e => setEditForm(f => ({ ...f, file_pdf: e.target.files[0] || null }))} style={{ fontSize: 12 }} />
            </div>
            <div style={S.formRow}>
              <label style={S.label}>🎵 Thay đổi Audio (để trống nếu giữ nguyên)</label>
              <input type="file" accept=".mp3,.wav,audio/*" onChange={e => setEditForm(f => ({ ...f, file_audio: e.target.files[0] || null }))} style={{ fontSize: 12 }} />
            </div>
            <div style={S.formRow}>
              <label style={S.label}>📝 JSON Data (Passage, audio info)</label>
              <textarea style={{ ...S.textarea, minHeight: 120, fontFamily: 'monospace', fontSize: 11 }} 
                value={editForm.json_data} onChange={e => setEditForm(f => ({ ...f, json_data: e.target.value }))} 
                placeholder='{"ten_de": "...", "ky_nang": [...]}' />
            </div>
            <div style={S.modalFooter}>
              <button style={S.btnSecondary} onClick={() => setShowEditModal(false)}>Hủy</button>
              <button style={S.btnPrimary} onClick={handleUpdateDeThi}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thêm câu hỏi */}
      {showCauHoiModal && (
        <div style={S.overlay} onClick={() => setShowCauHoiModal(false)}>
          <div style={S.modal(600)} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 20px', fontSize: 17, fontWeight: 700 }}>➕ Thêm câu hỏi</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={S.formRow}>
                <label style={S.label}>Kỹ năng</label>
                <select style={S.select} value={cauHoiForm.ky_nang} onChange={e => setCauHoiForm(f => ({ ...f, ky_nang: e.target.value }))}>
                  <option value="nghe">🎧 Nghe (Listening)</option>
                  <option value="doc">📖 Đọc (Reading)</option>
                  <option value="viet">✍️ Viết (Writing)</option>
                </select>
              </div>
              <div style={S.formRow}>
                <label style={S.label}>Loại câu hỏi</label>
                <select style={S.select} value={cauHoiForm.loai_cau} onChange={e => setCauHoiForm(f => ({ ...f, loai_cau: e.target.value }))}>
                  <option value="mcq">Trắc nghiệm A/B/C/D</option>
                  <option value="true_false">Đúng/Sai/Not Given</option>
                  <option value="fill_blank">Điền từ</option>
                  <option value="essay">Tự luận/Viết bài</option>
                </select>
              </div>
            </div>

            {/* Passage for Reading */}
            {cauHoiForm.ky_nang === 'doc' && (
              <div style={S.formRow}>
                <label style={S.label}>📖 Passage (Đoạn văn đọc)</label>
                <textarea style={{ ...S.textarea, minHeight: 100 }} value={cauHoiForm.passage} 
                  onChange={e => setCauHoiForm(f => ({ ...f, passage: e.target.value }))} 
                  placeholder="Nhập đoạn văn đọc..." />
              </div>
            )}

            {/* Hướng dẫn */}
            <div style={S.formRow}>
              <label style={S.label}>📋 Hướng dẫn (tùy chọn)</label>
              <input style={S.input} value={cauHoiForm.huong_dan} 
                onChange={e => setCauHoiForm(f => ({ ...f, huong_dan: e.target.value }))} 
                placeholder="VD: Chọn đáp án đúng nhất" />
            </div>

            {/* Nội dung câu hỏi */}
            <div style={S.formRow}>
              <label style={S.label}>Nội dung câu hỏi *</label>
              <textarea style={S.textarea} value={cauHoiForm.noi_dung} 
                onChange={e => setCauHoiForm(f => ({ ...f, noi_dung: e.target.value }))} 
                placeholder="Nhập nội dung câu hỏi..." />
            </div>

            {/* Options for MCQ */}
            {cauHoiForm.loai_cau === 'mcq' && (
              <>
                {['A','B','C','D'].map((lbl, idx) => (
                  <div key={lbl} style={S.formRow}>
                    <label style={S.label}>{lbl}.</label>
                    <input style={S.input} value={cauHoiForm.lua_chon[idx]} 
                      onChange={e => { const arr = [...cauHoiForm.lua_chon]; arr[idx] = e.target.value; setCauHoiForm(f => ({ ...f, lua_chon: arr })); }} 
                      placeholder={`Lựa chọn ${lbl}`} />
                  </div>
                ))}
              </>
            )}

            {/* Đáp án đúng */}
            {cauHoiForm.loai_cau !== 'essay' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={S.formRow}>
                  <label style={S.label}>Đáp án đúng</label>
                  {cauHoiForm.loai_cau === 'true_false' ? (
                    <select style={S.select} value={cauHoiForm.dap_an_dung} onChange={e => setCauHoiForm(f => ({ ...f, dap_an_dung: e.target.value }))}>
                      <option value="TRUE">TRUE</option>
                      <option value="FALSE">FALSE</option>
                      <option value="NOT GIVEN">NOT GIVEN</option>
                    </select>
                  ) : (
                    <select style={S.select} value={cauHoiForm.dap_an_dung} onChange={e => setCauHoiForm(f => ({ ...f, dap_an_dung: e.target.value }))}>
                      {['A','B','C','D'].map(x => <option key={x} value={x}>{x}</option>)}
                    </select>
                  )}
                </div>
                <div style={S.formRow}>
                  <label style={S.label}>Điểm</label>
                  <input style={S.input} type="number" min={1} value={cauHoiForm.diem} onChange={e => setCauHoiForm(f => ({ ...f, diem: +e.target.value }))} />
                </div>
              </div>
            )}

            {cauHoiForm.loai_cau === 'essay' && (
              <div style={S.formRow}>
                <label style={S.label}>Điểm tối đa</label>
                <input style={S.input} type="number" min={1} value={cauHoiForm.diem} onChange={e => setCauHoiForm(f => ({ ...f, diem: +e.target.value }))} />
              </div>
            )}

            <div style={S.modalFooter}>
              <button style={S.btnSecondary} onClick={() => setShowCauHoiModal(false)}>Hủy</button>
              <button style={S.btnPrimary} onClick={handleAddCauHoi}>Thêm câu hỏi</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload Excel */}
      {showExcelModal && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setShowExcelModal(false); }}>
          <div style={S.modal(520)}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#e11d48', marginBottom: 6 }}>📊 Upload đề thi từ file Excel</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
              Tải template Excel mẫu, điền câu hỏi, rồi upload lên đây.
            </div>

            <div style={S.formRow}>
              <label style={S.label}>Tên đề thi *</label>
              <input value={excelForm.ten_de} onChange={e => setExcelForm(f => ({ ...f, ten_de: e.target.value }))}
                placeholder="VD: Test Đầu Vào - Tháng 4/2026" style={S.input} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={S.label}>Thời gian làm bài (phút)</label>
                <input type="number" value={excelForm.thoi_gian_phut} onChange={e => setExcelForm(f => ({ ...f, thoi_gian_phut: +e.target.value }))} style={S.input} />
              </div>
              <div>
                <label style={S.label}>Loại đề</label>
                <select value={excelForm.loai} onChange={e => setExcelForm(f => ({ ...f, loai: e.target.value }))} style={S.select}>
                  <option value="khac">Khác</option>
                  <option value="ielts">IELTS</option>
                  <option value="toeic">TOEIC</option>
                  <option value="giao_tiep">Giao tiếp</option>
                </select>
              </div>
            </div>

            <div style={S.formRow}>
              <label style={S.label}>File Excel câu hỏi (.xlsx) *</label>
              <input type="file" accept=".xlsx,.xls" onChange={e => setExcelFile(e.target.files[0] || null)}
                style={{ ...S.input, padding: '6px' }} />
              {excelFile && <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>✓ {excelFile.name}</div>}
            </div>

            <div style={S.formRow}>
              <label style={S.label}>File Audio nghe (MP3) — tùy chọn</label>
              <input type="file" accept=".mp3,.wav,audio/*" onChange={e => setExcelAudio(e.target.files[0] || null)}
                style={{ ...S.input, padding: '6px' }} />
              {excelAudio && <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>✓ {excelAudio.name}</div>}
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontSize: 12, color: '#1e40af' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Cột trong Excel:</div>
              <div>ky_nang | loai_cau | bai_tap_id | huong_dan | passage | noi_dung_cau | lua_chon_A/B/C/D | dap_an | diem</div>
              <div style={{ marginTop: 6 }}>
                <button onClick={() => window.open('http://localhost:5000/api/exam/de-thi/template-excel', '_blank')}
                  style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: 0 }}>
                  📊 Tải file template Excel mẫu →
                </button>
              </div>
            </div>

            <div style={S.modalFooter}>
              <button style={S.btnSecondary} onClick={() => setShowExcelModal(false)}>Hủy</button>
              <button disabled={excelUploading || !excelFile} onClick={handleUploadExcel}
                style={{ ...S.btnPrimary, background: '#e11d48', opacity: excelUploading || !excelFile ? 0.6 : 1 }}>
                {excelUploading ? 'Đang upload...' : '📊 Upload đề thi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload JSON */}      {showJsonModal && (
        <div style={S.overlay} onClick={e => { if (e.target === e.currentTarget) setShowJsonModal(false); }}>
          <div style={S.modal(500)}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#e11d48', marginBottom: 6 }}>📤 Upload đề thi từ file JSON</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
              Tải template JSON mẫu, điền nội dung đề thi, rồi upload lên đây.
            </div>

            <div style={S.formRow}>
              <label style={S.label}>File JSON đề thi *</label>
              <input type="file" accept=".json" onChange={e => setJsonFile(e.target.files[0] || null)}
                style={{ ...S.input, padding: '6px' }} />
              {jsonFile && <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>✓ {jsonFile.name}</div>}
            </div>

            <div style={S.formRow}>
              <label style={S.label}>File Audio nghe (MP3) — tùy chọn</label>
              <input type="file" accept=".mp3,.wav,audio/*" onChange={e => setJsonAudio(e.target.files[0] || null)}
                style={{ ...S.input, padding: '6px' }} />
              {jsonAudio && <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>✓ {jsonAudio.name}</div>}
            </div>

            <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8, padding: '12px 14px', marginBottom: 20, fontSize: 12, color: '#6b21a8' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Cấu trúc JSON hỗ trợ:</div>
              <div>• <b>mcq</b> — Trắc nghiệm A/B/C/D</div>
              <div>• <b>true_false</b> — Đúng/Sai/Not Given</div>
              <div>• <b>fill_blank</b> — Điền từ</div>
              <div>• <b>essay</b> — Viết bài (Writing)</div>
              <div style={{ marginTop: 6 }}>
                <button onClick={handleDownloadTemplate}
                  style={{ background: 'none', border: 'none', color: '#e11d48', cursor: 'pointer', fontSize: 12, fontWeight: 700, padding: 0 }}>
                  📥 Tải file template mẫu →
                </button>
              </div>
            </div>

            <div style={S.modalFooter}>
              <button style={S.btnSecondary} onClick={() => setShowJsonModal(false)}>Hủy</button>
              <button disabled={jsonUploading || !jsonFile} onClick={handleUploadJSON}
                style={{ ...S.btnPrimary, background: '#e11d48', opacity: jsonUploading || !jsonFile ? 0.6 : 1 }}>
                {jsonUploading ? 'Đang upload...' : '📤 Upload đề thi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
