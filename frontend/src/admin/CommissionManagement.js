import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';
const fmt = n => (n||0).toLocaleString('vi-VN')+'đ';
const fmtDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const STATUS_CFG = {
  cho_xac_nhan: { color: '#f59e0b', text: 'Chờ xác nhận' },
  da_tra: { color: '#10b981', text: 'Đã trả' },
  da_huy: { color: '#e11d48', text: 'Đã hủy' },
};

const LEVEL_CFG = { 
  1: { color: '#e11d48', text: 'F1 (Trực tiếp)' }, 
  2: { color: '#3b82f6', text: 'F2 (Gián tiếp)' }, 
  3: { color: '#8b5cf6', text: 'F3 (Gián tiếp cấp 2)' } 
};

const badge = (text, color) => (
  <span style={{ background: color+'22', color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{text}</span>
);

export default function CommissionManagement() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all'); // F1/F2/F3 filter
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { load(); }, [filter, levelFilter, page]);

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ 
        page, limit: 20, 
        ...(filter !== 'all' ? { trang_thai: filter } : {}),
        ...(levelFilter !== 'all' ? { cap_do: levelFilter } : {})
      });
      const r = await fetch(`${API}/affiliate/admin/commissions?${q}`, { headers: authHeader() });
      const d = await r.json();
      setCommissions(d.data?.commissions || d.commissions || []);
      setTotalPages(d.data?.pagination?.totalPages || d.pagination?.totalPages || 1);
    } catch { setCommissions([]); } finally { setLoading(false); }
  };

  const updateStatus = async (id, trang_thai) => {
    await fetch(`${API}/affiliate/admin/commissions/${id}/status`, {
      method: 'PUT', headers: authHeader(), body: JSON.stringify({ trang_thai })
    });
    load();
  };

  const counts = {
    all: commissions.length,
    cho_xac_nhan: commissions.filter(c => c.trang_thai === 'cho_xac_nhan').length,
    da_tra: commissions.filter(c => c.trang_thai === 'da_tra').length,
    da_huy: commissions.filter(c => c.trang_thai === 'da_huy').length,
  };

  const stats = {
    cho: commissions.filter(c => c.trang_thai==='cho_xac_nhan').reduce((s,c) => s+(+c.tien_hoa_hong||0), 0),
    da_tra: commissions.filter(c => c.trang_thai==='da_tra').reduce((s,c) => s+(+c.tien_hoa_hong||0), 0),
    da_huy: commissions.filter(c => c.trang_thai==='da_huy').reduce((s,c) => s+(+c.tien_hoa_hong||0), 0),
  };

  const TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'cho_xac_nhan', label: 'Chờ xác nhận' },
    { key: 'da_tra', label: 'Đã trả' },
    { key: 'da_huy', label: 'Đã hủy' },
  ];

  const LEVEL_TABS = [
    { key: 'all', label: 'Tất cả cấp' },
    { key: '1', label: 'F1' },
    { key: '2', label: 'F2' },
    { key: '3', label: 'F3' },
  ];

  const btn = (bg, color='#fff') => ({ padding: '6px 12px', background: bg, color, border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: 'system-ui' });

  // Stats by level
  const levelStats = {
    f1: commissions.filter(c => c.cap_do == 1).reduce((s,c) => s+(+c.tien_hoa_hong||0), 0),
    f2: commissions.filter(c => c.cap_do == 2).reduce((s,c) => s+(+c.tien_hoa_hong||0), 0),
    f3: commissions.filter(c => c.cap_do == 3).reduce((s,c) => s+(+c.tien_hoa_hong||0), 0),
  };

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 800 }}>💰 Quản lý hoa hồng Affiliate</h2>

      {/* Filter tabs by status */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 15, borderBottom: '2px solid #f3f4f6', paddingBottom: 12 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => { setFilter(t.key); setPage(1); }} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            background: filter===t.key ? '#e11d48' : '#f3f4f6', color: filter===t.key ? '#fff' : '#374151', fontFamily: 'system-ui'
          }}>
            {t.label}
            <span style={{ marginLeft: 6, background: filter===t.key?'rgba(255,255,255,0.3)':'#e5e7eb', padding: '1px 7px', borderRadius: 12, fontSize: 11 }}>
              {counts[t.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Filter tabs by level F1/F2/F3 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {LEVEL_TABS.map(t => (
          <button key={t.key} onClick={() => { setLevelFilter(t.key); setPage(1); }} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            background: levelFilter===t.key ? '#3b82f6' : '#f3f4f6', color: levelFilter===t.key ? '#fff' : '#374151', fontFamily: 'system-ui'
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Stats by status */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Chờ xác nhận', value: fmt(stats.cho), color: '#f59e0b' },
          { label: 'Đã trả', value: fmt(stats.da_tra), color: '#10b981' },
          { label: 'Đã hủy', value: fmt(stats.da_huy), color: '#e11d48' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', flex: 1 }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Stats by level F1/F2/F3 */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'F1 (Trực tiếp)', value: fmt(levelStats.f1), color: '#e11d48' },
          { label: 'F2 (Gián tiếp)', value: fmt(levelStats.f2), color: '#3b82f6' },
          { label: 'F3 (Cấp 2)', value: fmt(levelStats.f3), color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', flex: 1 }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['STT','CTV','Đơn hàng','Cấp độ','Tỉ lệ%','Hoa hồng','Trạng thái','Ngày tạo','Thao tác'].map(h => (
                  <th key={h} style={{ padding: '11px 13px', textAlign: 'left', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {commissions.map((c, i) => (
                <tr key={c.id} style={{ borderTop: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                  <td style={{ padding: '11px 13px', color: '#9ca3af', fontSize: 13 }}>{(page-1)*20+i+1}</td>
                  <td style={{ padding: '11px 13px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.ctv?.ho_ten || c.ho_ten}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{c.ctv?.email || c.email}</div>
                  </td>
                  <td style={{ padding: '11px 13px', fontSize: 13, fontWeight: 600 }}>#{c.ma_don_hang || c.don_hang_id}</td>
                  <td style={{ padding: '11px 13px' }}>{badge((LEVEL_CFG[c.cap_do]||{text:'—'}).text, (LEVEL_CFG[c.cap_do]||{color:'#6b7280'}).color)}</td>
                  <td style={{ padding: '11px 13px', fontSize: 13 }}>{c.ti_le_phan_tram || c.ti_le}%</td>
                  <td style={{ padding: '11px 13px', fontWeight: 700, color: '#10b981' }}>{fmt(c.tien_hoa_hong)}</td>
                  <td style={{ padding: '11px 13px' }}>{badge((STATUS_CFG[c.trang_thai]||{text:c.trang_thai}).text, (STATUS_CFG[c.trang_thai]||{color:'#6b7280'}).color)}</td>
                  <td style={{ padding: '11px 13px', fontSize: 13, color: '#6b7280' }}>{fmtDate(c.created_at)}</td>
                  <td style={{ padding: '11px 13px' }}>
                    {c.trang_thai === 'cho_xac_nhan' && (
                      <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={() => updateStatus(c.id, 'da_tra')} style={btn('#10b981')}>✅ Duyệt</button>
                        <button onClick={() => updateStatus(c.id, 'da_huy')} style={btn('#e11d48')}>❌ Hủy</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {commissions.length === 0 && <tr><td colSpan={9} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600,
              background: p===page ? '#e11d48' : '#f3f4f6', color: p===page ? '#fff' : '#374151'
            }}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
