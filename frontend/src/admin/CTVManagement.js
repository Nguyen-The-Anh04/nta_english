import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';
const fmt = n => (n||0).toLocaleString('vi-VN')+'đ';
const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const badge = (text, color) => (
  <span style={{ background: color+'22', color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{text}</span>
);

const LEVEL_COLOR = { 1: '#e11d48', 2: '#3b82f6', 3: '#8b5cf6' };

// Icons as SVG
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconEye = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconClose = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function CTVManagement() {
  const [ctvs, setCtvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showDetail, setShowDetail] = useState(false);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [selectedCTV, setSelectedCTV] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    nguoi_dung_id: '',
    ma_gioi_thieu: '',
    ctv_cha_id: '',
    cap_do: 1,
  });
  const [users, setUsers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [page, search]);
  useEffect(() => { if (showAddEdit) loadUsers(); }, [showAddEdit]);

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

  const loadUsers = async () => {
    try {
      const r = await fetch(`${API}/users`, { headers: authHeader() });
      const d = await r.json();
      if (d.data?.users) {
        setUsers(d.data.users);
      } else if (d.users) {
        setUsers(d.users);
      }
    } catch { setUsers([]); }
  };

  const toggleStatus = async (ctv) => {
    const newStatus = ctv.trang_thai === 'hoat_dong' ? 'tam_dung' : 'hoat_dong';
    await fetch(`${API}/affiliate/admin/ctvs/${ctv.id}/status`, { method: 'PUT', headers: authHeader(), body: JSON.stringify({ trang_thai: newStatus }) });
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa CTV này?')) return;
    try {
      await fetch(`${API}/affiliate/admin/ctvs/${id}`, { method: 'DELETE', headers: authHeader() });
      load();
    } catch (e) {
      alert('Xóa thất bại');
    }
  };

  const handleAdd = () => {
    setSelectedCTV(null);
    setIsEditing(false);
    setFormData({ nguoi_dung_id: '', ma_gioi_thieu: '', ctv_cha_id: '', cap_do: 1 });
    setShowAddEdit(true);
  };

  const handleEdit = (ctv) => {
    setSelectedCTV(ctv);
    setIsEditing(true);
    setFormData({
      nguoi_dung_id: ctv.nguoi_dung_id || '',
      ma_gioi_thieu: ctv.ma_gioi_thieu || '',
      ctv_cha_id: ctv.ctv_cha_id || '',
      cap_do: ctv.cap_do || 1,
    });
    setShowAddEdit(true);
  };

  const handleView = (ctv) => {
    setSelectedCTV(ctv);
    setShowDetail(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEditing 
        ? `${API}/affiliate/admin/ctvs/${selectedCTV.id}`
        : `${API}/affiliate/admin/ctvs`;
      const method = isEditing ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: authHeader(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        setShowAddEdit(false);
        load();
      } else {
        alert(data.message || 'Lỗi');
      }
    } catch (e) {
      alert('Lỗi kết nối');
    } finally {
      setSaving(false);
    }
  };

  const stats = {
    total: ctvs.length,
    f1: ctvs.filter(c => c.cap_do === 1).length,
    f2: ctvs.filter(c => c.cap_do === 2).length,
    f3: ctvs.filter(c => c.cap_do === 3).length,
  };

  const btn = (bg, color='#fff') => ({ 
    padding: '6px 10px', background: bg, color, border: 'none', borderRadius: 6, 
    fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: 'system-ui',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 4
  });

  const btnOutline = (bg, color=bg) => ({
    padding: '6px 10px', background: 'transparent', color, border: `1px solid ${color}`, 
    borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: 'system-ui',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4
  });

  const inputStyle = {
    padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, 
    outline: 'none', width: '100%', boxSizing: 'border-box'
  };

  const labelStyle = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>👥 Quản lý CTV</h2>
        <button onClick={handleAdd} style={btn('#10b981')}>
          <IconPlus /> Thêm mới
        </button>
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
                      <button onClick={() => handleEdit(c)} title="Sửa" style={btnOutline('#3b82f6')}>
                        <IconEdit /> Sửa
                      </button>
                      <button onClick={() => handleView(c)} title="Xem chi tiết" style={btnOutline('#8b5cf6')}>
                        <IconEye /> Xem
                      </button>
                      <button onClick={() => handleDelete(c.id)} title="Xóa" style={btnOutline('#e11d48')}>
                        <IconTrash /> Xóa
                      </button>
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

      {/* Add/Edit Modal */}
      {showAddEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 480, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>{isEditing ? '✏️ Sửa CTV' : '➕ Thêm CTV mới'}</h3>
              <button onClick={() => setShowAddEdit(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Chọn User *</label>
                <select 
                  value={formData.nguoi_dung_id} 
                  onChange={e => setFormData({...formData, nguoi_dung_id: e.target.value})}
                  required
                  disabled={isEditing}
                  style={inputStyle}
                >
                  <option value="">-- Chọn user --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.ho_ten} - {u.email}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Mã giới thiệu *</label>
                <input 
                  type="text"
                  value={formData.ma_gioi_thieu} 
                  onChange={e => setFormData({...formData, ma_gioi_thieu: e.target.value})}
                  required
                  placeholder="Nhập mã giới thiệu"
                  style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>CTV cha (nếu có)</label>
                <select 
                  value={formData.ctv_cha_id} 
                  onChange={e => setFormData({...formData, ctv_cha_id: e.target.value})}
                  style={inputStyle}
                >
                  <option value="">-- Không có --</option>
                  {ctvs.filter(c => c.id !== selectedCTV?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.nguoiDung?.ho_ten || c.ho_ten} - #{c.ma_gioi_thieu}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Cấp độ</label>
                <select 
                  value={formData.cap_do} 
                  onChange={e => setFormData({...formData, cap_do: parseInt(e.target.value)})}
                  style={inputStyle}
                >
                  <option value={1}>F1</option>
                  <option value={2}>F2</option>
                  <option value={3}>F3</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddEdit(false)} style={btnOutline('#6b7280')}>Hủy</button>
                <button type="submit" disabled={saving} style={btn('#10b981')}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
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
              {[['Họ tên', selectedCTV.nguoiDung?.ho_ten || selectedCTV.ho_ten],['Email', selectedCTV.nguoiDung?.email || selectedCTV.email],['SĐT', selectedCTV.nguoiDung?.sdt || selectedCTV.sdt || '—'],['Mã GT', '#'+selectedCTV.ma_gioi_thieu],['Cấp độ', `F${selectedCTV.cap_do||1}`],['Tổng HH', fmt(selectedCTV.tong_hoa_hong)]].map(([k,v]) => (
                <div key={k} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{v}</div>
                </div>
              ))}
            </div>
            <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>Downline</h4>
            {[['F1', selectedCTV.downline?.f1 || [], '#e11d48'],['F2', selectedCTV.downline?.f2 || [], '#3b82f6'],['F3', selectedCTV.downline?.f3 || [], '#8b5cf6']].map(([level, list, color]) => (
              <div key={level} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 6 }}>{level} ({list.length} người)</div>
                {list.length > 0 ? list.map((m, i) => (
                  <div key={i} style={{ fontSize: 13, padding: '4px 10px', background: '#f9fafb', borderRadius: 6, marginBottom: 4 }}>{m.ho_ten} — {m.email}</div>
                )) : <div style={{ fontSize: 13, color: '#9ca3af' }}>Chưa có</div>}
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setShowDetail(false)} style={btn('#6b7280')}>Đóng</button>
              <button onClick={() => { setShowDetail(false); handleEdit(selectedCTV); }} style={btn('#3b82f6')}>
                <IconEdit /> Sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
