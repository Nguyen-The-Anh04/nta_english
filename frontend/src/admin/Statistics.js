import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';
const fmt = n => (n||0).toLocaleString('vi-VN')+'đ';
const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const CARD = ({ label, value, color, icon }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: '18px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', flex: 1 }}>
    <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
    <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
  </div>
);

export default function Statistics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nam, setNam] = useState(new Date().getFullYear());
  const [tab, setTab] = useState('revenue');

  useEffect(() => { loadData(); }, [nam]);

  const loadData = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/affiliate/admin/statistics?nam=${nam}`, { headers: authHeader() });
      const d = await r.json();
      setData(d.data || d);
    } catch { setData(null); } finally { setLoading(false); }
  };

  const tq = data?.tong_quan || {};
  const months = data?.doanh_thu_thang || [];
  const maxRev = Math.max(...months.map(m => m.doanh_thu || 0), 1);
  const topSP = data?.top_san_pham || [];
  const topCTV = data?.top_ctv || [];

  const btn = (active) => ({
    padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
    background: active ? '#e11d48' : '#f3f4f6', color: active ? '#fff' : '#374151', fontFamily: 'system-ui'
  });

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>📊 Thống kê</h2>
        <div style={{ flex: 1 }} />
        <select value={nam} onChange={e => setNam(+e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14 }}>
          {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        {['revenue','products','ctv'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={btn(tab===t)}>
            {t==='revenue'?'📈 Doanh thu':t==='products'?'📚 Sản phẩm':'👥 CTV'}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
        <CARD icon="💰" label="Tổng doanh thu" value={fmt(tq.tong_doanh_thu)} color="#10b981" />
        <CARD icon="👥" label="Tổng CTV" value={(tq.tong_ctv||0).toLocaleString()} color="#8b5cf6" />
        <CARD icon="💸" label="Hoa hồng đã trả" value={fmt(tq.tong_hoa_hong_da_tra)} color="#e11d48" />
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Đang tải...</div>}

      {/* Tab: Revenue bar chart */}
      {!loading && tab === 'revenue' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16 }}>Doanh thu theo tháng {nam}</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>
            {Array.from({ length: 12 }, (_, i) => {
              const m = months.find(x => +x.thang === i+1) || {};
              const h = maxRev > 0 ? Math.round(((m.doanh_thu||0)/maxRev)*180) : 0;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <div title={fmt(m.doanh_thu)} style={{
                      height: h, background: 'linear-gradient(180deg,#e11d48,#fb7185)',
                      borderRadius: '4px 4px 0 0', width: '100%', minHeight: 4,
                      cursor: 'pointer', transition: 'opacity .2s'
                    }}
                      onMouseEnter={e => { e.currentTarget.style.opacity='0.8'; }}
                      onMouseLeave={e => { e.currentTarget.style.opacity='1'; }}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>T{i+1}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
            * Hover vào cột để xem số tiền
          </div>
        </div>
      )}

      {/* Tab: Top products */}
      {!loading && tab === 'products' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Top 10 sản phẩm bán chạy</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#ef4444' }}>
                {['STT','Tên sản phẩm','Đã bán','Doanh thu','Tỉ lệ'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'center', fontSize: 13, color: '#ffffff', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.2)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topSP.map((sp, i) => {
                const maxSold = Math.max(...topSP.map(x => x.da_ban||0), 1);
                return (
                  <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}
                    onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                    <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: 13 }}>{i+1}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{sp.ten_sach||sp.ten_san_pham}</td>
                    <td style={{ padding: '10px 14px' }}>{(sp.da_ban||0).toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', color: '#10b981', fontWeight: 600 }}>{fmt(sp.doanh_thu)}</td>
                    <td style={{ padding: '10px 14px', width: 140 }}>
                      <div style={{ background: '#f3f4f6', borderRadius: 4, height: 8 }}>
                        <div style={{ width: `${Math.round(((sp.da_ban||0)/maxSold)*100)}%`, background: '#e11d48', height: 8, borderRadius: 4 }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {topSP.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Top CTV */}
      {!loading && tab === 'ctv' && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>Top 10 CTV</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#ef4444' }}>
                {['STT','Tên','Email','Tổng hoa hồng','Downline'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'center', fontSize: 13, color: '#ffffff', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.2)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCTV.map((c, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                  <td style={{ padding: '10px 14px', color: '#9ca3af', fontSize: 13 }}>{i+1}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{c.ho_ten}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#6b7280' }}>{c.email}</td>
                  <td style={{ padding: '10px 14px', color: '#10b981', fontWeight: 600 }}>{fmt(c.tong_hoa_hong)}</td>
                  <td style={{ padding: '10px 14px' }}>{(c.downline||0).toLocaleString()}</td>
                </tr>
              ))}
              {topCTV.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
