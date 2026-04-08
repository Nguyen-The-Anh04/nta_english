import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';
const fmt = n => (n||0).toLocaleString('vi-VN')+'đ';
const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const badge = (text, color) => (
  <span style={{ background: color+'22', color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{text}</span>
);

const LEVEL_COLOR = { 1: '#e11d48', 2: '#3b82f6', 3: '#8b5cf6' };

export default function CTVManagement() {
  const [ctvs, setCtvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCTV, setSelectedCTV] = useState(null);

  useEffect(() => { load(); }, [page, search]);

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 20, search });
      const r = await fetch(`${API}/affiliate/admin/ctvs?${q}`, { headers: authHeader() });
      const d = await r.json();
      setCtvs(d.data?.ctvs || d.ctvs || []);
      setTotalPages(d.data?.pagination?.totalPages || d.pagination?.totalPages || 1);
    } catch { setCtvs([]); } finally { setLoading(false); }
  };

  const toggleStatus = async (ctv) => {
    const newStatus = ctv.trang_thai === 'hoat_dong' ? 'tam_dung' : 'hoat_dong';
    await fetch(`${API}/affiliate/admin/ctvs/${ctv.id}/status`, { method: 'PUT', headers: authHeader(), body: JSON.stringify({ trang_thai: newStatus }) });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa CTV này?')) return;
    await fetch(`${API}/affiliate/admin/ctvs/${id}`, { method: 'DELETE', headers: authHeader() });
    load();
  };

  const stats = {
    total: ctvs.length,
    f1: ctvs.filter(c => c.cap_do === 1).length,
    f2: ctvs.filter(c => c.cap_do === 2).length,
    f3: ctvs.filter(c => c.cap_do === 3).length,
  };

  const btn = (bg, color='#fff') => ({ padding: '5px 10px', background: bg, color, border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: 'system-ui' });

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>👥 Quản lý CTV</h2>
        <div style={{ flex: 1 }} />
        <input placeholder="🔍 Tìm kiếm CTV..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', width: 220 }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Tổng CTV', value: stats.total, color: '#3b82f6' },
          { label: 'Cấp F1', value: stats.f1, color: '#e11d48' },
          { label: 'Cấp F2', value: stats.f2, color: '#3b82f6' },
          { label: 'Cấp F3', value: stats.f3, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', flex: 1 }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['STT','CTV','Cấp độ','F1/F2/F3','Tổng hoa hồng','Trạng thái','Thao tác'].map(h => (
                  <th key={h} style={{ padding: '11px 13px', textAlign: 'left', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ctvs.map((c, i) => (
                <tr key={c.id} style={{ borderTop: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                  <td style={{ padding: '11px 13px', color: '#9ca3af', fontSize: 13 }}>{(page-1)*20+i+1}</td>
                  <td style={{ padding: '11px 13px' }}>
                    <div style={{ fontWeight: 600 }}>{c.nguoiDung?.ho_ten || c.ho_ten || "CTV"}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{c.nguoiDung?.email || c.email}</div>
                    <div style={{ fontSize: 11, color: '#06b6d4', fontFamily: 'monospace' }}>#{c.ma_gioi_thieu}</div>
                  </td>
                  <td style={{ padding: '11px 13px' }}>{badge(`F${c.cap_do||1}`, LEVEL_COLOR[c.cap_do||1])}</td>
                  <td style={{ padding: '11px 13px', fontSize: 13 }}>
                    <span style={{ color: '#e11d48' }}>{c.tong_f1 || c.f1_count || 0}</span> /
                    <span style={{ color: '#3b82f6' }}> {c.tong_f2 || c.f2_count || 0}</span> /
                    <span style={{ color: '#8b5cf6' }}> {c.tong_f3 || c.f3_count || 0}</span>
                  </td>
                  <td style={{ padding: '11px 13px', fontWeight: 700, color: '#10b981' }}>{fmt(c.tong_hoa_hong || 0)}</td>
                  <td style={{ padding: '11px 13px' }}>{badge(c.trang_thai==='hoat_dong'?'Hoạt động':'Tạm dừng', c.trang_thai==='hoat_dong'?'#10b981':'#9ca3af')}</td>
                  <td style={{ padding: '11px 13px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button onClick={() => toggleStatus(c)} style={btn(c.trang_thai==='hoat_dong'?'#f59e0b':'#10b981')}>
                        {c.trang_thai==='hoat_dong'?'⏸️':'▶️'}
                      </button>
                      <button onClick={() => { setSelectedCTV(c); setShowDetail(true); }} style={btn('#3b82f6')}>👁️</button>
                      <button onClick={() => handleDelete(c.id)} style={btn('#e11d48')}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {ctvs.length === 0 && <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>Không có dữ liệu</td></tr>}
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

      {/* Detail Modal */}
      {showDetail && selectedCTV && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 560, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>👤 Chi tiết CTV</h3>
              <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[['Họ tên', selectedCTV.ho_ten],['Email', selectedCTV.email],['SĐT', selectedCTV.sdt||'—'],['Mã GT', '#'+selectedCTV.ma_gioi_thieu],['Cấp độ', `F${selectedCTV.cap_do||1}`],['Tổng HH', fmt(selectedCTV.tong_hoa_hong)]].map(([k,v]) => (
                <div key={k} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{v}</div>
                </div>
              ))}
            </div>
            <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>Downline</h4>
            {[['F1', selectedCTV.f1_list||[], '#e11d48'],['F2', selectedCTV.f2_list||[], '#3b82f6'],['F3', selectedCTV.f3_list||[], '#8b5cf6']].map(([level, list, color]) => (
              <div key={level} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 6 }}>{level} ({list.length} người)</div>
                {list.length > 0 ? list.map((m, i) => (
                  <div key={i} style={{ fontSize: 13, padding: '4px 10px', background: '#f9fafb', borderRadius: 6, marginBottom: 4 }}>{m.ho_ten} — {m.email}</div>
                )) : <div style={{ fontSize: 13, color: '#9ca3af' }}>Chưa có</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
