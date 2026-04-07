import React, { useState, useEffect } from 'react';
import { lmsAPI } from '../../api';

const trangThaiDK = {
  dang_hoc: { label: 'Đang học', color: '#10b981', bg: '#d1fae5' },
  hoan_thanh: { label: 'Hoàn thành', color: '#3b82f6', bg: '#dbeafe' },
  nghi_hoc: { label: 'Nghỉ học', color: '#f59e0b', bg: '#fef3c7' },
  huy: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
};

const s = {
  wrap: { padding: 24, fontFamily: 'sans-serif' },
  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  backBtn: { padding: '8px 14px', border: '1px solid #d1d5db', borderRadius: 6, background: '#fff', cursor: 'pointer', fontSize: 14 },
  badge: (tt) => ({ display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, color: trangThaiDK[tt]?.color || '#333', background: trangThaiDK[tt]?.bg || '#eee' }),
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 },
  card: { background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  cardLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  cardVal: { fontSize: 15, fontWeight: 600, color: '#111827' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.08)' },
  th: { background: '#f9fafb', padding: '12px 16px', textAlign: 'left', fontSize: 13, color: '#6b7280', borderBottom: '1px solid #e5e7eb' },
  td: { padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: 14 },
  btn: { padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 12, padding: 28, width: 480, maxHeight: '80vh', overflowY: 'auto' },
  input: { width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, boxSizing: 'border-box' },
};

export default function ClassDetail({ lop: lopProp, onBack }) {
  const [lop, setLop] = useState(lopProp);
  const [hocViens, setHocViens] = useState([]);
  const [showAddHV, setShowAddHV] = useState(false);
  const [searchHV, setSearchHV] = useState('');

  useEffect(() => {
    lmsAPI.getHocViens({ limit: 200 }).then(r => setHocViens(r.data || r || []));
  }, []);

  const reloadLop = async () => {
    const res = await lmsAPI.getLopHocById(lop.id);
    setLop(res.data || res);
  };

  const handleAddHocVien = async (hvId) => {
    await lmsAPI.addHocVienVaoLop({ hoc_vien_id: hvId, lop_hoc_id: lop.id });
    await reloadLop();
    setShowAddHV(false);
  };

  const handleUpdateDangKy = async (dkId, trangThai) => {
    await lmsAPI.updateDangKy(dkId, { trang_thai: trangThai });
    await reloadLop();
  };

  const dangKys = lop.dang_kys || lop.hoc_viens || [];
  const danhSachHVTrongLop = new Set(dangKys.map(dk => dk.hoc_vien_id || dk.id));
  const hvChuaCoTrongLop = hocViens.filter(hv =>
    !danhSachHVTrongLop.has(hv.id) &&
    (!searchHV || hv.ho_ten?.toLowerCase().includes(searchHV.toLowerCase()) || hv.email?.toLowerCase().includes(searchHV.toLowerCase()))
  );

  const lichHocStr = (lop.lich_hocs || []).map(l => `${l.thu} ${l.gio_bat_dau}-${l.gio_ket_thuc}`).join(', ') || '—';

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <button style={s.backBtn} onClick={onBack}>← Quay lại</button>
        <h2 style={{ margin: 0, fontSize: 20 }}>{lop.ma_lop}</h2>
        <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: '#dbeafe', color: '#1d4ed8' }}>{lop.trang_thai}</span>
      </div>

      <div style={s.infoGrid}>
        {[
          ['Khóa học', lop.ten_khoa_hoc || lop.khoa_hoc?.ten_khoa_hoc || '—'],
          ['Giảng viên', lop.ten_giao_vien || lop.giao_vien?.ho_ten || '—'],
          ['Phòng học', lop.ten_phong || lop.phong_hoc?.ten_phong || '—'],
          ['Ngày bắt đầu', lop.ngay_bat_dau ? new Date(lop.ngay_bat_dau).toLocaleDateString('vi-VN') : '—'],
          ['Ngày kết thúc', lop.ngay_ket_thuc ? new Date(lop.ngay_ket_thuc).toLocaleDateString('vi-VN') : '—'],
          ['Lịch học', lichHocStr],
        ].map(([label, val]) => (
          <div key={label} style={s.card}>
            <div style={s.cardLabel}>{label}</div>
            <div style={s.cardVal}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Danh sách học viên ({dangKys.length})</h3>
        <button style={{ ...s.btn, background: '#3b82f6', color: '#fff' }} onClick={() => { setSearchHV(''); setShowAddHV(true); }}>+ Thêm học viên</button>
      </div>

      <table style={s.table}>
        <thead>
          <tr>{['STT', 'Họ tên', 'Email', 'SĐT', 'Trạng thái', 'Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {dangKys.length === 0
            ? <tr><td colSpan={6} style={{ ...s.td, textAlign: 'center', color: '#9ca3af' }}>Chưa có học viên</td></tr>
            : dangKys.map((dk, i) => {
              const hv = dk.hoc_vien || dk;
              const tt = dk.trang_thai || 'dang_hoc';
              return (
                <tr key={dk.id || i}>
                  <td style={s.td}>{i + 1}</td>
                  <td style={s.td}><strong>{hv.ho_ten}</strong></td>
                  <td style={s.td}>{hv.email}</td>
                  <td style={s.td}>{hv.sdt || '—'}</td>
                  <td style={s.td}><span style={s.badge(tt)}>{trangThaiDK[tt]?.label || tt}</span></td>
                  <td style={s.td}>
                    <select style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }}
                      value={tt} onChange={e => handleUpdateDangKy(dk.id, e.target.value)}>
                      {Object.entries(trangThaiDK).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>

      {showAddHV && (
        <div style={s.overlay} onClick={e => e.target === e.currentTarget && setShowAddHV(false)}>
          <div style={s.modal}>
            <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Thêm học viên vào lớp</h3>
            <input style={{ ...s.input, marginBottom: 14 }} placeholder="Tìm học viên..." value={searchHV} onChange={e => setSearchHV(e.target.value)} />
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {hvChuaCoTrongLop.length === 0
                ? <p style={{ color: '#9ca3af', textAlign: 'center' }}>Không tìm thấy học viên</p>
                : hvChuaCoTrongLop.map(hv => (
                  <div key={hv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{hv.ho_ten}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{hv.email}</div>
                    </div>
                    <button style={{ ...s.btn, background: '#d1fae5', color: '#065f46' }} onClick={() => handleAddHocVien(hv.id)}>Thêm</button>
                  </div>
                ))}
            </div>
            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <button style={{ ...s.btn, background: '#f3f4f6', color: '#374151' }} onClick={() => setShowAddHV(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
