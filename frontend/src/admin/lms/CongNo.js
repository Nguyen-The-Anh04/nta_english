import React, { useState, useEffect } from 'react';
import { keToanAPI } from '../../api';

const fmt = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';
const today = () => new Date().toISOString().split('T')[0];

export default function CongNo() {
  const [hopDongs, setHopDongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedHD, setSelectedHD] = useState(null);
  const [phieuThuForm, setPhieuThuForm] = useState({
    hop_dong_id: '', nguoi_nop_id: '', tong_tien: '',
    phuong_thuc: 'tien_mat', noi_dung: '', ngay_thu: today(),
  });

  const load = () => {
    setLoading(true);
    keToanAPI.getCongNo(search)
      .then(res => setHopDongs(Array.isArray(res) ? res : (res.data || [])))
      .catch(() => setHopDongs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]); // eslint-disable-line

  const openModal = (hd) => {
    setSelectedHD(hd);
    setPhieuThuForm({
      hop_dong_id: hd.id,
      nguoi_nop_id: hd.hoc_vien?.id || '',
      tong_tien: hd.con_no || '',
      phuong_thuc: 'tien_mat',
      noi_dung: `Thu tiền học phí - ${hd.hoc_vien?.ho_ten || ''}`,
      ngay_thu: today(),
    });
    setShowModal(true);
  };

  const handleCreatePhieuThu = async () => {
    try {
      await keToanAPI.createPhieuThu(phieuThuForm);
      setShowModal(false);
      load();
    } catch (e) { alert('Lỗi tạo phiếu thu'); }
  };

  const tongNo = hopDongs.reduce((s, h) => s + (h.con_no || 0), 0);
  const daTraDu = hopDongs.filter(h => (h.con_no || 0) <= 0).length;

  const barColor = (pct) => pct >= 80 ? '#27ae60' : pct >= 50 ? '#f39c12' : '#e74c3c';

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#f5f6fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>📋 Quản lý công nợ</h2>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm học viên, SĐT..."
          style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, width: 240 }} />
        {loading && <span style={{ color: '#888', fontSize: 13 }}>Đang tải...</span>}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: 'Tổng HV nợ', val: hopDongs.length + ' HV', bg: '#8e44ad' },
          { label: 'Tổng tiền nợ', val: fmt(tongNo), bg: '#e74c3c' },
          { label: 'HV đã trả đủ', val: daTraDu + ' HV', bg: '#27ae60' },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 10, padding: '16px 22px', color: '#fff', flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              {['STT','Học viên','Khóa học','Tổng tiền','Đã trả','Còn nợ','% Đã trả','Hạn cuối',''].map((h, i) => (
                <th key={i} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hopDongs.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: '#aaa' }}>Không có dữ liệu</td></tr>
            )}
            {hopDongs.map((hd, idx) => {
              const pct = hd.tong_tien > 0 ? Math.round(((hd.da_tra || 0) / hd.tong_tien) * 100) : 0;
              return (
                <tr key={hd.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 14px', color: '#888' }}>{idx + 1}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 600 }}>{hd.hoc_vien?.ho_ten || '—'}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{hd.hoc_vien?.so_dien_thoai || ''}</div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>{hd.khoa_hoc?.ten_khoa || hd.ten_khoa || '—'}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{fmt(hd.tong_tien)}</td>
                  <td style={{ padding: '10px 14px', color: '#27ae60' }}>{fmt(hd.da_tra)}</td>
                  <td style={{ padding: '10px 14px', color: '#e74c3c', fontWeight: 600 }}>{fmt(hd.con_no)}</td>
                  <td style={{ padding: '10px 14px', minWidth: 120 }}>
                    <div style={{ fontSize: 12, marginBottom: 4, color: '#555' }}>{pct}%</div>
                    <div style={{ background: '#eee', borderRadius: 4, height: 8, width: '100%' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: barColor(pct), borderRadius: 4, transition: 'width 0.3s' }} />
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#888' }}>
                    {hd.han_cuoi ? new Date(hd.han_cuoi).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button onClick={() => openModal(hd)}
                      style={{ padding: '6px 14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
                      💳 Thu tiền
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal thu tiền */}
      {showModal && selectedHD && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 440, maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 18 }}>💳 Thu tiền học phí</h3>
            <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>
              <div><b>Học viên:</b> {selectedHD.hoc_vien?.ho_ten}</div>
              <div><b>SĐT:</b> {selectedHD.hoc_vien?.so_dien_thoai}</div>
              <div><b>Khóa học:</b> {selectedHD.khoa_hoc?.ten_khoa || selectedHD.ten_khoa}</div>
              <div><b>Còn nợ:</b> <span style={{ color: '#e74c3c', fontWeight: 700 }}>{fmt(selectedHD.con_no)}</span></div>
            </div>
            {[
              { label: 'Số tiền (đ)', key: 'tong_tien', type: 'number' },
              { label: 'Nội dung', key: 'noi_dung', type: 'text' },
              { label: 'Ngày thu', key: 'ngay_thu', type: 'date' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input type={f.type} value={phieuThuForm[f.key]}
                  onChange={e => setPhieuThuForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Phương thức</label>
              <select value={phieuThuForm.phuong_thuc}
                onChange={e => setPhieuThuForm(p => ({ ...p, phuong_thuc: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                <option value="tien_mat">Tiền mặt</option>
                <option value="chuyen_khoan">Chuyển khoản</option>
                <option value="momo">MoMo</option>
                <option value="vnpay">VNPay</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 }}>Hủy</button>
              <button onClick={handleCreatePhieuThu}
                style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#27ae60', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
