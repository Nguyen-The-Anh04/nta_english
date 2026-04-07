import React, { useState, useEffect } from 'react';
import { lmsAPI } from '../../api';
import { lmsAPI2 } from '../../api';

const getDiemColor = (diem) => {
  if (diem === null || diem === undefined || diem === '') return { bg: '#f3f4f6', color: '#9ca3af' };
  const n = parseFloat(diem);
  if (n >= 7) return { bg: '#d1fae5', color: '#065f46' };
  if (n >= 5) return { bg: '#fef3c7', color: '#92400e' };
  return { bg: '#fee2e2', color: '#991b1b' };
};

export default function BangDiem() {
  const [lops, setLops] = useState([]);
  const [selectedLopId, setSelectedLopId] = useState('');
  const [baiTaps, setBaiTaps] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    lmsAPI.getLopHocs().then(res => setLops(res.data || res || []));
  }, []);

  useEffect(() => {
    if (!selectedLopId) { setBaiTaps([]); return; }
    setLoading(true);
    lmsAPI2.getDiemSoLop(selectedLopId)
      .then(res => setBaiTaps(res.data || res || []))
      .finally(() => setLoading(false));
  }, [selectedLopId]);

  // Pivot: baiTaps[].diemSos[] → { hocVienId: { ho_ten, email, diems: { baiTapId: diem } } }
  const pivot = () => {
    const hocVienMap = {};
    baiTaps.forEach(bt => {
      (bt.diemSos || []).forEach(ds => {
        const hvId = ds.hoc_vien_id;
        if (!hocVienMap[hvId]) {
          hocVienMap[hvId] = { id: hvId, ho_ten: ds.ho_ten || ds.hoc_vien?.ho_ten || '', email: ds.email || ds.hoc_vien?.email || '', diems: {} };
        }
        hocVienMap[hvId].diems[bt.id] = ds.diem !== undefined ? ds.diem : ds.band_score;
      });
    });
    return Object.values(hocVienMap);
  };

  const hocViens = pivot();

  const tinhTB = (diems) => {
    const vals = Object.values(diems).filter(v => v !== null && v !== undefined && v !== '');
    if (vals.length === 0) return null;
    const nums = vals.map(v => parseFloat(v)).filter(n => !isNaN(n));
    if (nums.length === 0) return null;
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
  };

  const shortName = (name) => name && name.length > 12 ? name.slice(0, 12) + '…' : (name || '');

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '22px', margin: 0 }}>📊 Bảng điểm</h2>
        <select value={selectedLopId} onChange={e => setSelectedLopId(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '200px' }}>
          <option value=''>-- Chọn lớp --</option>
          {lops.map(l => <option key={l.id} value={l.id}>{l.ten_lop}</option>)}
        </select>
      </div>

      {!selectedLopId ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '16px' }}>
          📋 Chọn lớp để xem bảng điểm
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Đang tải...</div>
      ) : baiTaps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Chưa có dữ liệu điểm</div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <table style={{ borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', minWidth: '40px' }}>STT</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', minWidth: '140px' }}>Họ tên</th>
                  {baiTaps.map(bt => (
                    <th key={bt.id} style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb', minWidth: '80px', maxWidth: '100px' }}>
                      <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 400 }}>{loaiBaiLabel(bt.loai_bai)}</div>
                      <div title={bt.ten_bai}>{shortName(bt.ten_bai)}</div>
                    </th>
                  ))}
                  <th style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', minWidth: '70px', background: '#eff6ff', color: '#1d4ed8' }}>Điểm TB</th>
                </tr>
              </thead>
              <tbody>
                {hocViens.map((hv, i) => {
                  const tb = tinhTB(hv.diems);
                  const tbClr = getDiemColor(tb);
                  return (
                    <tr key={hv.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 12px', textAlign: 'center', borderRight: '1px solid #f3f4f6', color: '#6b7280' }}>{i + 1}</td>
                      <td style={{ padding: '8px 12px', borderRight: '1px solid #f3f4f6' }}>
                        <div style={{ fontWeight: 500 }}>{hv.ho_ten}</div>
                        <div style={{ fontSize: '11px', color: '#9ca3af' }}>{hv.email}</div>
                      </td>
                      {baiTaps.map(bt => {
                        const d = hv.diems[bt.id];
                        const clr = getDiemColor(d);
                        return (
                          <td key={bt.id} style={{ padding: '8px', textAlign: 'center', borderRight: '1px solid #f3f4f6' }}>
                            {d !== null && d !== undefined && d !== '' ? (
                              <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', background: clr.bg, color: clr.color, fontWeight: 600, fontSize: '13px' }}>{d}</span>
                            ) : (
                              <span style={{ color: '#d1d5db' }}>—</span>
                            )}
                          </td>
                        );
                      })}
                      <td style={{ padding: '8px 12px', textAlign: 'center', background: '#f8faff' }}>
                        {tb !== null ? (
                          <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: '12px', background: tbClr.bg, color: tbClr.color, fontWeight: 700 }}>{tb}</span>
                        ) : <span style={{ color: '#d1d5db' }}>—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Chú thích */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px' }}>
            <span style={{ fontWeight: 600, color: '#374151' }}>Chú thích:</span>
            {[
              { label: '≥ 7 — Tốt', bg: '#d1fae5', color: '#065f46' },
              { label: '5–7 — Trung bình', bg: '#fef3c7', color: '#92400e' },
              { label: '< 5 — Yếu', bg: '#fee2e2', color: '#991b1b' },
              { label: 'Chưa có điểm', bg: '#f3f4f6', color: '#9ca3af' },
            ].map(c => (
              <span key={c.label} style={{ padding: '2px 10px', borderRadius: '12px', background: c.bg, color: c.color, fontWeight: 600 }}>{c.label}</span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function loaiBaiLabel(loai) {
  return { homework: 'Bài tập', speaking: 'Speaking', writing: 'Writing' }[loai] || loai || '';
}
