import React, { useState, useEffect } from 'react';
import { lmsAPI } from '../../api';
import { lmsAPI2 } from '../../api';

const trangThaiColors = {
  co_mat: { bg: '#d1fae5', color: '#065f46' },
  tre: { bg: '#fef3c7', color: '#92400e' },
  vang_mat: { bg: '#fee2e2', color: '#991b1b' },
};

export default function DiemDanh() {
  const today = new Date().toISOString().split('T')[0];
  const [lops, setLops] = useState([]);
  const [selectedLop, setSelectedLop] = useState(null);
  const [selectedNgay, setSelectedNgay] = useState(today);
  const [danhSach, setDanhSach] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    lmsAPI.getLopHocs().then(res => setLops(res.data || res || []));
  }, []);

  const handleLoadDanhSach = async () => {
    if (!selectedLop) return;
    setLoading(true);
    try {
      const res = await lmsAPI2.getDiemDanh(selectedLop.id, selectedNgay);
      setDanhSach(res.data || res || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDiemDanh = (dkId, trangThai) => {
    setDanhSach(prev =>
      prev.map(d => d.dk_lop_hoc_id === dkId ? { ...d, trang_thai: trangThai } : d)
    );
  };

  const handleGhiChu = (dkId, ghiChu) => {
    setDanhSach(prev =>
      prev.map(d => d.dk_lop_hoc_id === dkId ? { ...d, ghi_chu: ghiChu } : d)
    );
  };

  const handleSave = async () => {
    if (!selectedLop || danhSach.length === 0) return;
    setSaving(true);
    try {
      await lmsAPI2.diemDanhBulk({
        lop_hoc_id: selectedLop.id,
        ngay: selectedNgay,
        danh_sach: danhSach.map(d => ({
          dk_lop_hoc_id: d.dk_lop_hoc_id,
          trang_thai: d.trang_thai || 'co_mat',
          ghi_chu: d.ghi_chu || '',
        })),
      });
      alert('Lưu điểm danh thành công!');
    } catch (e) {
      alert('Lỗi khi lưu điểm danh');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    co_mat: danhSach.filter(d => (d.trang_thai || 'co_mat') === 'co_mat').length,
    tre: danhSach.filter(d => d.trang_thai === 'tre').length,
    vang_mat: danhSach.filter(d => d.trang_thai === 'vang_mat').length,
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '20px', fontSize: '22px' }}>📋 Điểm danh</h2>

      {/* Row 1: Controls */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          value={selectedLop?.id || ''}
          onChange={e => setSelectedLop(lops.find(l => String(l.id) === e.target.value) || null)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '200px' }}
        >
          <option value=''>-- Chọn lớp --</option>
          {lops.map(l => <option key={l.id} value={l.id}>{l.ten_lop}</option>)}
        </select>
        <input
          type='date'
          value={selectedNgay}
          onChange={e => setSelectedNgay(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
        />
        <button
          onClick={handleLoadDanhSach}
          disabled={!selectedLop || loading}
          style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {loading ? 'Đang tải...' : 'Tải danh sách'}
        </button>
      </div>

      {/* Stats */}
      {danhSach.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: 'Có mặt', val: stats.co_mat, ...trangThaiColors.co_mat },
            { label: 'Đi trễ', val: stats.tre, ...trangThaiColors.tre },
            { label: 'Vắng mặt', val: stats.vang_mat, ...trangThaiColors.vang_mat },
          ].map(s => (
            <div key={s.label} style={{ padding: '8px 16px', borderRadius: '8px', background: s.bg, color: s.color, fontWeight: 600 }}>
              {s.label}: {s.val}
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {danhSach.length > 0 && (
        <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                {['STT', 'Họ tên', 'Email', 'Trạng thái', 'Ghi chú'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {danhSach.map((d, i) => {
                const tt = d.trang_thai || 'co_mat';
                const clr = trangThaiColors[tt] || trangThaiColors.co_mat;
                return (
                  <tr key={d.dk_lop_hoc_id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px' }}>{i + 1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{d.hoc_vien?.ho_ten}</td>
                    <td style={{ padding: '10px 12px', color: '#6b7280' }}>{d.hoc_vien?.email}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[
                          { key: 'co_mat', label: '✅ Có mặt' },
                          { key: 'tre', label: '⏰ Đi trễ' },
                          { key: 'vang_mat', label: '❌ Vắng' },
                        ].map(btn => (
                          <button
                            key={btn.key}
                            onClick={() => handleDiemDanh(d.dk_lop_hoc_id, btn.key)}
                            style={{
                              padding: '4px 10px', borderRadius: '6px', border: '2px solid',
                              borderColor: tt === btn.key ? trangThaiColors[btn.key].color : '#e5e7eb',
                              background: tt === btn.key ? trangThaiColors[btn.key].bg : '#fff',
                              color: tt === btn.key ? trangThaiColors[btn.key].color : '#374151',
                              cursor: 'pointer', fontSize: '12px', fontWeight: tt === btn.key ? 700 : 400,
                            }}
                          >{btn.label}</button>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <input
                        value={d.ghi_chu || ''}
                        onChange={e => handleGhiChu(d.dk_lop_hoc_id, e.target.value)}
                        placeholder='Ghi chú...'
                        style={{ padding: '4px 8px', border: '1px solid #d1d5db', borderRadius: '4px', width: '140px' }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={danhSach.length === 0 || saving}
        style={{
          padding: '10px 24px', background: danhSach.length === 0 ? '#9ca3af' : '#10b981',
          color: '#fff', border: 'none', borderRadius: '8px', cursor: danhSach.length === 0 ? 'not-allowed' : 'pointer',
          fontWeight: 600, fontSize: '15px',
        }}
      >
        {saving ? 'Đang lưu...' : '💾 Lưu điểm danh'}
      </button>
    </div>
  );
}
