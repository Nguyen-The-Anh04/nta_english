import React, { useState, useEffect } from 'react';
import { keToanAPI } from '../../api';

const fmt = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';

export default function KeToanDashboard({ onNavigate }) {
  const now = new Date();
  const [thang, setThang] = useState(now.getMonth() + 1);
  const [nam, setNam] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    keToanAPI.getTongQuan(thang, nam)
      .then(res => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [thang, nam]);

  const loiNhuan = data ? (data.tong_thu || 0) - (data.tong_chi || 0) : 0;
  const chartData = data?.doanh_thu_theo_thang || [];
  const maxVal = Math.max(...chartData.map(d => Math.max(d.thu || 0, d.chi || 0)), 1);

  const cardStyle = (bg) => ({
    background: bg, borderRadius: 12, padding: '20px 24px',
    color: '#fff', flex: 1, minWidth: 160,
  });
  const labelStyle = { fontSize: 13, opacity: 0.85, marginBottom: 6 };
  const valStyle = { fontSize: 22, fontWeight: 700 };

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#f5f6fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>💰 Tổng quan kế toán</h2>
        <select value={thang} onChange={e => setThang(+e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(m =>
            <option key={m} value={m}>Tháng {m}</option>)}
        </select>
        <select value={nam} onChange={e => setNam(+e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {loading && <span style={{ color: '#888', fontSize: 13 }}>Đang tải...</span>}
      </div>

      {/* Row 1 cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={cardStyle('#27ae60')}>
          <div style={labelStyle}>Tổng thu</div>
          <div style={valStyle}>{fmt(data?.tong_thu)}</div>
        </div>
        <div style={cardStyle('#e74c3c')}>
          <div style={labelStyle}>Tổng chi</div>
          <div style={valStyle}>{fmt(data?.tong_chi)}</div>
        </div>
        <div style={cardStyle(loiNhuan >= 0 ? '#2980b9' : '#c0392b')}>
          <div style={labelStyle}>Lợi nhuận</div>
          <div style={valStyle}>{fmt(loiNhuan)}</div>
        </div>
      </div>

      {/* Row 2 cards */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <div style={cardStyle('#e67e22')}>
          <div style={labelStyle}>Tổng công nợ</div>
          <div style={valStyle}>{fmt(data?.tong_con_no)}</div>
        </div>
        <div style={cardStyle('#8e44ad')}>
          <div style={labelStyle}>Số HV còn nợ</div>
          <div style={valStyle}>{data?.so_hv_con_no || 0} học viên</div>
        </div>
        <div style={{ flex: 1, minWidth: 160 }} />
      </div>

      {/* Bar Chart */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>📊 Doanh thu theo tháng</div>
        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 12, fontSize: 13 }}>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#27ae60', borderRadius: 2, marginRight: 4 }} />Thu</span>
          <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#e74c3c', borderRadius: 2, marginRight: 4 }} />Chi</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, overflowX: 'auto' }}>
          {chartData.slice(0, 6).map((d, i) => {
            const thuH = Math.round(((d.thu || 0) / maxVal) * 130);
            const chiH = Math.round(((d.chi || 0) / maxVal) * 130);
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 130 }}>
                  <div title={fmt(d.thu)} style={{ width: 20, height: thuH || 2, background: '#27ae60', borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }} />
                  <div title={fmt(d.chi)} style={{ width: 20, height: chiH || 2, background: '#e74c3c', borderRadius: '3px 3px 0 0', transition: 'height 0.3s' }} />
                </div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>T{d.thang}</div>
              </div>
            );
          })}
          {chartData.length === 0 && (
            <div style={{ color: '#aaa', fontSize: 13, alignSelf: 'center' }}>Không có dữ liệu</div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={() => onNavigate ? onNavigate('cong-no') : (window.location.hash = '#cong-no')}
          style={{ padding: '10px 20px', background: '#e67e22', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          📋 Xem công nợ
        </button>
        <button onClick={() => onNavigate ? onNavigate('phieu-thu-chi') : (window.location.hash = '#phieu-thu-chi')}
          style={{ padding: '10px 20px', background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          📄 Xem phiếu thu/chi
        </button>
      </div>
    </div>
  );
}
