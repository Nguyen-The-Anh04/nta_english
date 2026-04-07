import React, { useState, useEffect, useCallback } from 'react';
import { lmsAPI } from '../../api';

const s = {
  wrap: { padding: 24, fontFamily: 'sans-serif' },
  toolbar: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' },
  input: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
  btn: { padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 },
  card: { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.08)', textAlign: 'center' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  th: { background: '#f9fafb', padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 14 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 12, padding: 28, width: 440 },
  panel: { position: 'fixed', top: 0, right: 0, width: 520, height: '100vh', background: '#fff', boxShadow: '-4px 0 20px rgba(0,0,0,.15)', zIndex: 1000, overflowY: 'auto', padding: 24 },
  label: { display: 'block', fontSize: 13, color: '#374151', marginBottom: 4, fontWeight: 500 },
  formInput: { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', marginBottom: 14 },
  select: { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box', marginBottom: 14 },
};

const emptyHVForm = () => ({ ho_ten: '', email: '', sdt: '', mat_khau: '' });
const emptyHDForm = () => ({ hoc_vien_id: '', khoa_hoc_id: '', tong_tien: '', ngay_ky: '', so_ky_nop: 1 });
const emptyTTForm = () => ({ hop_dong_id: '', hoc_vien_id: '', so_tien: '', phuong_thuc: 'tien_mat', nguoi_nop_id: 1 });

export default function StudentManagement() {
  const [hocViens, setHocViens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingHV, setEditingHV] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0 });
  const [showHopDong, setShowHopDong] = useState(false);
  const [selectedHV, setSelectedHV] = useState(null);
  const [hopDongs, setHopDongs] = useState([]);
  const [showThanhToan, setShowThanhToan] = useState(false);
  const [hopDongForm, setHopDongForm] = useState(emptyHDForm());
  const [thanhToanForm, setThanhToanForm] = useState(emptyTTForm());
  const [khoaHocs, setKhoaHocs] = useState([]);

  const loadHocViens = useCallback(async () => {
    setLoading(true);
    try {
      const res = await lmsAPI.getHocViens({ search, page: pagination.page, limit: 20 });
      setHocViens(res.data || res || []);
      if (res.total) setPagination(p => ({ ...p, total: res.total }));
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [search, pagination.page]);

  useEffect(() => { loadHocViens(); }, [search]);
  useEffect(() => { lmsAPI.getKhoaHocs().then(r => setKhoaHocs(r.data || r || [])); }, []);

  const handleCreate = async (form) => {
    await lmsAPI.createHocVien(form);
    setShowModal(false); loadHocViens();
  };
  const handleUpdate = async (form) => {
    const { mat_khau, ...data } = form;
    await lmsAPI.updateHocVien(editingHV.id, data);
    setShowModal(false); loadHocViens();
  };

  const openHopDong = async (hv) => {
    setSelectedHV(hv);
    const res = await lmsAPI.getHopDongs({ hoc_vien_id: hv.id });
    setHopDongs(res.data || res || []);
    setHopDongForm({ ...emptyHDForm(), hoc_vien_id: hv.id });
    setShowHopDong(true);
  };

  const handleCreateHopDong = async () => {
    await lmsAPI.createHopDong(hopDongForm);
    const res = await lmsAPI.getHopDongs({ hoc_vien_id: selectedHV.id });
    setHopDongs(res.data || res || []);
    setHopDongForm({ ...emptyHDForm(), hoc_vien_id: selectedHV.id });
  };

  const handleThanhToan = async () => {
    await lmsAPI.createThanhToan({ ...thanhToanForm, nguoi_nop_id: 1 });
    const res = await lmsAPI.getHopDongs({ hoc_vien_id: selectedHV.id });
    setHopDongs(res.data || res || []);
    setShowThanhToan(false); setThanhToanForm(emptyTTForm());
  };

  const openThanhToan = (hd) => {
    setThanhToanForm({ ...emptyTTForm(), hop_dong_id: hd.id, hoc_vien_id: selectedHV.id });
    setShowThanhToan(true);
  };

  const now = new Date();
  const thangNay = hocViens.filter(hv => {
    if (!hv.created_at) return false;
    const d = new Date(hv.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const [hvForm, setHvForm] = useState(emptyHVForm());

  const openCreate = () => { setEditingHV(null); setHvForm(emptyHVForm()); setShowModal(true); };
  const openEdit = (hv) => { setEditingHV(hv); setHvForm({ ho_ten: hv.ho_ten, email: hv.email, sdt: hv.sdt || '', mat_khau: '' }); setShowModal(true); };
  const handleSaveHV = () => editingHV ? handleUpdate(hvForm) : handleCreate(hvForm);

  return (
    <div style={s.wrap}>
      <div style={s.toolbar}>
        <input style={s.input} placeholder="Tìm học viên..." value={search} onChange={e => setSearch(e.target.value)} />
        <button style={{ ...s.btn, background: '#3b82f6', color: '#fff', marginLeft: 'auto' }} onClick={openCreate}>+ Thêm học viên</button>
      </div>

      <div style={s.statsRow}>
        {[['Tổng học viên', hocViens.length, '#3b82f6'], ['Đang học', hocViens.filter(h => h.trang_thai === 'dang_hoc').length, '#10b981'], ['Mới tháng này', thangNay, '#f59e0b']].map(([label, val, color]) => (
          <div key={label} style={s.card}>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{val}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <table style={s.table}>
        <thead>
          <tr>{['STT', 'Họ tên', 'Email', 'SĐT', 'Lớp đang học', 'Trạng thái', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {loading ? <tr><td colSpan={7} style={{ ...s.td, textAlign: 'center' }}>Đang tải...</td></tr>
            : hocViens.map((hv, i) => (
              <tr key={hv.id}>
                <td style={s.td}>{i + 1}</td>
                <td style={s.td}><strong>{hv.ho_ten}</strong></td>
                <td style={s.td}>{hv.email}</td>
                <td style={s.td}>{hv.sdt || '—'}</td>
                <td style={s.td}>{hv.lop_hien_tai || '—'}</td>
                <td style={s.td}><span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: hv.trang_thai === 'dang_hoc' ? '#d1fae5' : '#f3f4f6', color: hv.trang_thai === 'dang_hoc' ? '#065f46' : '#6b7280' }}>{hv.trang_thai || 'Chưa xác định'}</span></td>
                <td style={s.td}>
                  <button style={{ ...s.btn, background: '#fef3c7', color: '#92400e', marginRight: 6 }} onClick={() => openEdit(hv)}>✏️</button>
                  <button style={{ ...s.btn, background: '#d1fae5', color: '#065f46' }} onClick={() => openHopDong(hv)}>💰</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <h3 style={{ margin: '0 0 20px', fontSize: 17 }}>{editingHV ? 'Sửa học viên' : 'Thêm học viên'}</h3>
            {[['Họ tên', 'ho_ten', 'text'], ['Email', 'email', 'email'], ['SĐT', 'sdt', 'tel']].map(([label, key, type]) => (
              <div key={key}><label style={s.label}>{label}</label><input type={type} style={s.formInput} value={hvForm[key]} onChange={e => setHvForm(f => ({ ...f, [key]: e.target.value }))} /></div>
            ))}
            {!editingHV && <div><label style={s.label}>Mật khẩu</label><input type="password" style={s.formInput} value={hvForm.mat_khau} onChange={e => setHvForm(f => ({ ...f, mat_khau: e.target.value }))} /></div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
              <button style={{ ...s.btn, background: '#f3f4f6', color: '#374151' }} onClick={() => setShowModal(false)}>Hủy</button>
              <button style={{ ...s.btn, background: '#3b82f6', color: '#fff' }} onClick={handleSaveHV}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {showHopDong && selectedHV && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowHopDong(false)}>
          <div style={s.panel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Hợp đồng — {selectedHV.ho_ten}</h3>
              <button style={{ ...s.btn, background: '#f3f4f6' }} onClick={() => setShowHopDong(false)}>✕</button>
            </div>

            <div style={{ marginBottom: 20 }}>
              {hopDongs.length === 0 ? <p style={{ color: '#9ca3af' }}>Chưa có hợp đồng</p>
                : hopDongs.map(hd => (
                  <div key={hd.id} style={{ background: '#f9fafb', borderRadius: 8, padding: 14, marginBottom: 12, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{hd.ma_hop_dong || `HD-${hd.id}`}</strong>
                      <span style={{ fontSize: 13, color: '#6b7280' }}>{hd.ngay_ky ? new Date(hd.ngay_ky).toLocaleDateString('vi-VN') : ''}</span>
                    </div>
                    <div style={{ fontSize: 13, marginTop: 6 }}>Tổng tiền: <strong>{Number(hd.tong_tien || 0).toLocaleString('vi-VN')}đ</strong> | Còn nợ: <strong style={{ color: '#ef4444' }}>{Number(hd.con_no || 0).toLocaleString('vi-VN')}đ</strong></div>
                    {(hd.con_no > 0 || !hd.da_thanh_toan) && (
                      <button style={{ ...s.btn, background: '#3b82f6', color: '#fff', marginTop: 8, fontSize: 13 }} onClick={() => openThanhToan(hd)}>Ghi nhận thanh toán</button>
                    )}
                  </div>
                ))}
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>Tạo hợp đồng mới</h4>
              <label style={s.label}>Khóa học</label>
              <select style={s.select} value={hopDongForm.khoa_hoc_id} onChange={e => setHopDongForm(f => ({ ...f, khoa_hoc_id: e.target.value }))}>
                <option value="">-- Chọn khóa học --</option>
                {khoaHocs.map(k => <option key={k.id} value={k.id}>{k.ten_khoa_hoc}</option>)}
              </select>
              <label style={s.label}>Tổng tiền</label>
              <input type="number" style={s.formInput} value={hopDongForm.tong_tien} onChange={e => setHopDongForm(f => ({ ...f, tong_tien: e.target.value }))} />
              <label style={s.label}>Ngày ký</label>
              <input type="date" style={s.formInput} value={hopDongForm.ngay_ky} onChange={e => setHopDongForm(f => ({ ...f, ngay_ky: e.target.value }))} />
              <label style={s.label}>Số kỳ nộp</label>
              <input type="number" style={s.formInput} value={hopDongForm.so_ky_nop} onChange={e => setHopDongForm(f => ({ ...f, so_ky_nop: e.target.value }))} />
              <button style={{ ...s.btn, background: '#10b981', color: '#fff', width: '100%' }} onClick={handleCreateHopDong}>Tạo hợp đồng</button>
            </div>
          </div>
        </div>
      )}

      {showThanhToan && (
        <div style={{ ...s.overlay, zIndex: 1100 }} onClick={e => e.target === e.currentTarget && setShowThanhToan(false)}>
          <div style={s.modal}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Ghi nhận thanh toán</h3>
            <label style={s.label}>Số tiền</label>
            <input type="number" style={s.formInput} value={thanhToanForm.so_tien} onChange={e => setThanhToanForm(f => ({ ...f, so_tien: e.target.value }))} />
            <label style={s.label}>Phương thức</label>
            <select style={s.select} value={thanhToanForm.phuong_thuc} onChange={e => setThanhToanForm(f => ({ ...f, phuong_thuc: e.target.value }))}>
              {['tien_mat', 'chuyen_khoan', 'the_ngan_hang', 'momo'].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={{ ...s.btn, background: '#f3f4f6', color: '#374151' }} onClick={() => setShowThanhToan(false)}>Hủy</button>
              <button style={{ ...s.btn, background: '#10b981', color: '#fff' }} onClick={handleThanhToan}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
