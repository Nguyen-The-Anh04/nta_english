import React, { useState, useEffect } from 'react';
import { lmsAPI } from '../../api';
import ClassDetail from './ClassDetail';

const trangThaiConfig = {
  dang_lap: { label: 'Đang lập', color: '#f59e0b', bg: '#fef3c7' },
  dang_dien_ra: { label: 'Đang học', color: '#10b981', bg: '#d1fae5' },
  ket_thuc: { label: 'Kết thúc', color: '#6b7280', bg: '#f3f4f6' },
  huy: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
};
const thuOptions = ['Thu2', 'Thu3', 'Thu4', 'Thu5', 'Thu6', 'Thu7', 'CNhat'];

const emptyForm = () => ({
  ma_lop: 'LOP' + String(Date.now()).slice(-6),
  khoa_hoc_id: '', giao_vien_id: '', phong_hoc_id: '',
  ngay_bat_dau: '', ngay_ket_thuc: '', trang_thai: 'dang_lap', lich_hocs: [],
});

export default function ClassManagement() {
  const [lops, setLops] = useState([]);
  const [khoaHocs, setKhoaHocs] = useState([]);
  const [phongHocs, setPhongHocs] = useState([]);
  const [giaoViens, setGiaoViens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedLop, setSelectedLop] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm());

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [l, k, p, g] = await Promise.all([
        lmsAPI.getLopHocs(), lmsAPI.getKhoaHocs(),
        lmsAPI.getPhongHocs(), lmsAPI.getGiaoViens(),
      ]);
      setLops(l.data || l || []);
      setKhoaHocs(k.data || k || []);
      setPhongHocs(p.data || p || []);
      setGiaoViens(g.data || g || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const openCreate = () => { setForm(emptyForm()); setShowModal(true); };
  const openEdit = (lop) => {
    setForm({ ...lop, lich_hocs: lop.lich_hocs || [] });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (form.id) await lmsAPI.updateLopHoc(form.id, form);
      else await lmsAPI.createLopHoc(form);
      setShowModal(false); loadAll();
    } catch (e) { alert('Lỗi lưu lớp học'); }
  };

  const openDetail = async (lop) => {
    const res = await lmsAPI.getLopHocById(lop.id);
    setSelectedLop(res.data || res);
    setShowDetail(true);
  };

  const addLich = () => setForm(f => ({ ...f, lich_hocs: [...f.lich_hocs, { thu: 'Thu2', gio_bat_dau: '08:00', gio_ket_thuc: '10:00' }] }));
  const removeLich = (i) => setForm(f => ({ ...f, lich_hocs: f.lich_hocs.filter((_, idx) => idx !== i) }));
  const updateLich = (i, key, val) => setForm(f => ({
    ...f, lich_hocs: f.lich_hocs.map((l, idx) => idx === i ? { ...l, [key]: val } : l),
  }));

  if (showDetail) return <ClassDetail lop={selectedLop} onBack={() => { setShowDetail(false); loadAll(); }} />;

  const filtered = lops.filter(l =>
    (!filterStatus || l.trang_thai === filterStatus) &&
    (!search || l.ma_lop?.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    tong: lops.length,
    dangHoc: lops.filter(l => l.trang_thai === 'dang_dien_ra').length,
    dangLap: lops.filter(l => l.trang_thai === 'dang_lap').length,
    ketThuc: lops.filter(l => l.trang_thai === 'ket_thuc').length,
  };

  const s = {
    wrap: { padding: 24, fontFamily: 'sans-serif' },
    toolbar: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' },
    input: { padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
    btn: { padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14 },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 },
    card: { background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,.08)', textAlign: 'center' },
    table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
    th: { background: '#f9fafb', padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #e5e7eb' },
    td: { padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 14 },
    badge: (tt) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, color: trangThaiConfig[tt]?.color || '#333', background: trangThaiConfig[tt]?.bg || '#eee' }),
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: '#fff', borderRadius: 12, padding: 28, width: 640, maxHeight: '90vh', overflowY: 'auto' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    label: { display: 'block', fontSize: 13, color: '#374151', marginBottom: 4, fontWeight: 500 },
    select: { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 },
  };

  return (
    <div style={s.wrap}>
      <div style={s.toolbar}>
        <input style={s.input} placeholder="Tìm mã lớp..." value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.input} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {Object.entries(trangThaiConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button style={{ ...s.btn, background: '#3b82f6', color: '#fff', marginLeft: 'auto' }} onClick={openCreate}>+ Tạo lớp học</button>
      </div>

      <div style={s.statsRow}>
        {[['Tổng lớp', stats.tong, '#3b82f6'], ['Đang học', stats.dangHoc, '#10b981'], ['Đang lập', stats.dangLap, '#f59e0b'], ['Kết thúc', stats.ketThuc, '#6b7280']].map(([label, val, color]) => (
          <div key={label} style={s.card}>
            <div style={{ fontSize: 28, fontWeight: 700, color }}>{val}</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <table style={s.table}>
        <thead>
          <tr>{['Mã lớp', 'Khóa học', 'Giảng viên', 'Phòng', 'Sĩ số', 'Lịch học', 'Trạng thái', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {loading ? <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center' }}>Đang tải...</td></tr>
            : filtered.map(lop => (
              <tr key={lop.id}>
                <td style={s.td}><strong>{lop.ma_lop}</strong></td>
                <td style={s.td}>{lop.ten_khoa_hoc || lop.khoa_hoc?.ten_khoa_hoc || '—'}</td>
                <td style={s.td}>{lop.ten_giao_vien || lop.giao_vien?.ho_ten || '—'}</td>
                <td style={s.td}>{lop.ten_phong || lop.phong_hoc?.ten_phong || '—'}</td>
                <td style={s.td}>{lop.si_so || 0}</td>
                <td style={s.td}>{(lop.lich_hocs || []).map(l => l.thu).join(', ') || '—'}</td>
                <td style={s.td}><span style={s.badge(lop.trang_thai)}>{trangThaiConfig[lop.trang_thai]?.label || lop.trang_thai}</span></td>
                <td style={s.td}>
                  <button style={{ ...s.btn, background: '#ede9fe', color: '#7c3aed', marginRight: 6 }} onClick={() => openDetail(lop)}>👥 HV</button>
                  <button style={{ ...s.btn, background: '#fef3c7', color: '#92400e' }} onClick={() => openEdit(lop)}>✏️</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {showModal && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>{form.id ? 'Sửa lớp học' : 'Tạo lớp học'}</h3>
            <div style={s.grid2}>
              <div><label style={s.label}>Mã lớp</label><input style={{ ...s.input, width: '100%', boxSizing: 'border-box' }} value={form.ma_lop} onChange={e => setForm(f => ({ ...f, ma_lop: e.target.value }))} /></div>
              <div><label style={s.label}>Trạng thái</label><select style={s.select} value={form.trang_thai} onChange={e => setForm(f => ({ ...f, trang_thai: e.target.value }))}>{Object.entries(trangThaiConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
            </div>
            <div style={{ marginTop: 16 }}><label style={s.label}>Khóa học</label>
              <select style={s.select} value={form.khoa_hoc_id} onChange={e => setForm(f => ({ ...f, khoa_hoc_id: e.target.value }))}>
                <option value="">-- Chọn khóa học --</option>
                {khoaHocs.map(k => <option key={k.id} value={k.id}>{k.ten_khoa_hoc}</option>)}
              </select>
            </div>
            <div style={{ ...s.grid2, marginTop: 16 }}>
              <div><label style={s.label}>Giảng viên</label><select style={s.select} value={form.giao_vien_id} onChange={e => setForm(f => ({ ...f, giao_vien_id: e.target.value }))}><option value="">-- Chọn --</option>{giaoViens.map(g => <option key={g.id} value={g.id}>{g.ho_ten}</option>)}</select></div>
              <div><label style={s.label}>Phòng học</label><select style={s.select} value={form.phong_hoc_id} onChange={e => setForm(f => ({ ...f, phong_hoc_id: e.target.value }))}><option value="">-- Chọn --</option>{phongHocs.map(p => <option key={p.id} value={p.id}>{p.ten_phong}</option>)}</select></div>
              <div><label style={s.label}>Ngày bắt đầu</label><input type="date" style={{ ...s.input, width: '100%', boxSizing: 'border-box' }} value={form.ngay_bat_dau} onChange={e => setForm(f => ({ ...f, ngay_bat_dau: e.target.value }))} /></div>
              <div><label style={s.label}>Ngày kết thúc</label><input type="date" style={{ ...s.input, width: '100%', boxSizing: 'border-box' }} value={form.ngay_ket_thuc} onChange={e => setForm(f => ({ ...f, ngay_ket_thuc: e.target.value }))} /></div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong style={{ fontSize: 14 }}>Lịch học</strong>
                <button style={{ ...s.btn, background: '#e0f2fe', color: '#0369a1', fontSize: 13 }} onClick={addLich}>+ Thêm buổi</button>
              </div>
              {form.lich_hocs.map((l, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <select style={{ ...s.select, width: 110 }} value={l.thu} onChange={e => updateLich(i, 'thu', e.target.value)}>{thuOptions.map(t => <option key={t} value={t}>{t}</option>)}</select>
                  <input type="time" style={s.input} value={l.gio_bat_dau} onChange={e => updateLich(i, 'gio_bat_dau', e.target.value)} />
                  <input type="time" style={s.input} value={l.gio_ket_thuc} onChange={e => updateLich(i, 'gio_ket_thuc', e.target.value)} />
                  <button style={{ ...s.btn, background: '#fee2e2', color: '#dc2626' }} onClick={() => removeLich(i)}>✕</button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button style={{ ...s.btn, background: '#f3f4f6', color: '#374151' }} onClick={() => setShowModal(false)}>Hủy</button>
              <button style={{ ...s.btn, background: '#3b82f6', color: '#fff' }} onClick={handleSave}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
