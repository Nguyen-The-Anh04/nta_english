import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api/customers';

const fmt = n => (n||0).toLocaleString('vi-VN')+'đ';
const fmtDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const STATUS_CFG = {
  moi: { color: '#3b82f6', text: 'Mới' },
  cho_xac_nhan: { color: '#f59e0b', text: 'Chờ xác nhận' },
  da_mua: { color: '#10b981', text: 'Đã mua' },
  huy: { color: '#ef4444', text: 'Hủy' },
};

const NGUON_KH = {
  landing_page: 'Landing Page',
  fb_ads: 'Facebook Ads',
  zalo_oa: 'Zalo OA',
  walkin: 'Walk-in',
  gioi_thieu: 'Giới thiệu',
  khac: 'Khác',
};

const GIOI_TINH = { 'Nam': 'Nam', 'Nữ': 'Nữ', 'Khác': 'Khác' };

const badge = (text, color) => (
  <span style={{ background: color+'22', color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{text}</span>
);

// Icons
const IconPlus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconEye = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconClose = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function CustomerManagement() {
  const [khachs, setKhachs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedKhach, setSelectedKhach] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [page, search]);

  const load = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 20, search });
      const r = await fetch(`${API}?${q}`, { headers: authHeader() });
      const d = await r.json();
      setKhachs(d.data?.customers || []);
      setTotalPages(d.data?.pagination?.totalPages || 1);
    } catch { setKhachs([]); } finally { setLoading(false); }
  };

  const handleAdd = () => {
    setSelectedKhach(null);
    setIsEditing(false);
    setFormData({
      ma_khach_hang: '',
      ten_khach_hang: '',
      so_dien_thoai: '',
      email: '',
      dia_chi: '',
      nguon_khach: 'landing_page',
      trang_thai: 'moi',
      ghi_chu: '',
    });
    setShowAddEdit(true);
  };

  const handleEdit = (khach) => {
    setSelectedKhach(khach);
    setIsEditing(true);
    setFormData({
      id: khach.id,
      ma_khach_hang: khach.ma_khach_hang,
      ten_khach_hang: khach.ten_khach_hang,
      so_dien_thoai: khach.so_dien_thoai || '',
      email: khach.email || '',
      dia_chi: khach.dia_chi || '',
      nguon_khach: khach.nguon_khach || 'landing_page',
      trang_thai: khach.trang_thai || 'moi',
      ghi_chu: khach.ghi_chu || '',
    });
    setShowAddEdit(true);
  };

  const handleView = (khach) => {
    setSelectedKhach(khach);
    setShowDetail(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa khách hàng này?')) return;
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE', headers: authHeader() });
      load();
    } catch { alert('Xóa thất bại'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEditing ? `${API}/${selectedKhach.id}` : `${API}`;
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
    } catch { alert('Lỗi kết nối'); } finally { setSaving(false); }
  };

  const handleQuickStatus = async (id, currentStatus) => {
    const statusOrder = ['moi', 'cho_xac_nhan', 'da_mua'];
    const currentIdx = statusOrder.indexOf(currentStatus);
    const nextStatus = currentIdx < statusOrder.length - 1 ? statusOrder[currentIdx + 1] : currentStatus;
    await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({ trang_thai: nextStatus })
    });
    load();
  };

  const stats = {
    total: khachs.length,
    moi: khachs.filter(k => k.trang_thai === 'moi').length,
    cho_xac_nhan: khachs.filter(k => k.trang_thai === 'cho_xac_nhan').length,
    da_mua: khachs.filter(k => k.trang_thai === 'da_mua').length,
  };

  const btn = (bg, color='#fff') => ({ 
    padding: '6px 12px', background: bg, color, border: 'none', borderRadius: 6, 
    fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: 'system-ui',
    display: 'inline-flex', alignItems: 'center', gap: 6
  });

  const btnOutline = (bg, color=bg) => ({
    padding: '6px 10px', background: 'transparent', color, border: `1px solid ${color}`, 
    borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4
  });

  const inputStyle = {
    padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, 
    outline: 'none', width: '100%', boxSizing: 'border-box'
  };

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>👥 Quản lý Khách hàng</h2>
        <button onClick={handleAdd} style={btn('#10b981')}>
          <IconPlus /> Thêm mới
        </button>
        <div style={{ flex: 1 }} />
        <input placeholder="🔍 Tìm khách hàng..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', width: 220 }} />
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Tổng KH', value: stats.total, color: '#3b82f6' },
          { label: 'Mới', value: stats.moi, color: '#3b82f6' },
          { label: 'Chờ xác nhận', value: stats.cho_xac_nhan, color: '#f59e0b' },
          { label: 'Đã mua', value: stats.da_mua, color: '#10b981' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', flex: 1 }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'auto' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ background: '#ef4444' }}>
                {['STT','Mã KH','Tên khách','SĐT','Email','Nguồn','Trạng thái','Thao tác'].map(h => (
                  <th key={h} style={{ padding: '11px 13px', textAlign: 'center', fontSize: 13, color: '#ffffff', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.2)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {khachs.map((k, i) => (
                <tr key={k.id} style={{ borderTop: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                  <td style={{ padding: '11px 13px', color: '#9ca3af', fontSize: 13 }}>{(page-1)*20+i+1}</td>
                  <td style={{ padding: '11px 13px', fontWeight: 600, fontSize: 13, color: '#06b6d4', fontFamily: 'monospace' }}>{k.ma_khach_hang}</td>
                  <td style={{ padding: '11px 13px', fontWeight: 600 }}>{k.ten_khach_hang}</td>
                  <td style={{ padding: '11px 13px', fontSize: 13 }}>{k.so_dien_thoai || '—'}</td>
                  <td style={{ padding: '11px 13px', fontSize: 13, color: '#6b7280' }}>{k.email || '—'}</td>
                  <td style={{ padding: '11px 13px', fontSize: 13 }}>{NGUON_KH[k.nguon_khach] || k.nguon_khach}</td>
                  <td style={{ padding: '11px 13px' }}>{badge((STATUS_CFG[k.trang_thai]||{text:k.trang_thai}).text, (STATUS_CFG[k.trang_thai]||{color:'#6b7280'}).color)}</td>
                  <td style={{ padding: '11px 13px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button onClick={() => handleEdit(k)} title="Sửa" style={btnOutline('#3b82f6', '#3b82f6')}>
                        <IconEdit /> Sửa
                      </button>
                      <button onClick={() => handleView(k)} title="Xem" style={btnOutline('#8b5cf6', '#8b5cf6')}>
                        <IconEye /> Xem
                      </button>
                      <button onClick={() => handleDelete(k.id)} title="Xóa" style={btnOutline('#e11d48', '#e11d48')}>
                        <IconTrash />
                      </button>
                      <button onClick={() => handleQuickStatus(k.id, k.trang_thai)} title={k.trang_thai==='hoat_dong'?'Khóa':'Mở khóa'} 
                        style={btnOutline(k.trang_thai==='hoat_dong'?'#f59e0b':'#10b981', k.trang_thai==='hoat_dong'?'#f59e0b':'#10b981')}>
                        {k.trang_thai==='hoat_dong'?'🔒':'🔓'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {khachs.length === 0 && <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>Không có dữ liệu</td></tr>}
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
      {showDetail && selectedKhach && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 500, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>👤 Chi tiết khách hàng</h3>
              <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Mã KH', selectedKhach.ma_khach_hang],['Tên KH', selectedKhach.ten_khach_hang],['SĐT', selectedKhach.so_dien_thoai||'—'],['Email', selectedKhach.email||'—'],['Nguồn', NGUON_KH[selectedKhach.nguon_khach]||selectedKhach.nguon_khach],['Trạng thái', (STATUS_CFG[selectedKhach.trang_thai]||{}).text]].map(([k,v]) => (
                <div key={k} style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{v}</div>
                </div>
              ))}
            </div>
            {selectedKhach.dia_chi && (
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>Địa chỉ</div>
                <div style={{ fontSize: 14 }}>{selectedKhach.dia_chi}</div>
              </div>
            )}
            {selectedKhach.ghi_chu && (
              <div style={{ background: '#f9fafb', borderRadius: 8, padding: '10px 14px', marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 2 }}>Ghi chú</div>
                <div style={{ fontSize: 14 }}>{selectedKhach.ghi_chu}</div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => { setShowDetail(false); handleEdit(selectedKhach); }} style={btn('#3b82f6')}>
                <IconEdit /> Sửa
              </button>
              <button onClick={() => setShowDetail(false)} style={btn('#6b7280')}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 480, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>{isEditing ? '✏️ Sửa khách hàng' : '➕ Thêm khách hàng mới'}</h3>
              <button onClick={() => setShowAddEdit(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mã KH</label>
                  <input type="text" value={formData.ma_khach_hang} onChange={e => setFormData({...formData, ma_khach_hang: e.target.value})}
                    placeholder="Tự động nếu để trống" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Tên khách hàng *</label>
                  <input type="text" value={formData.ten_khach_hang} onChange={e => setFormData({...formData, ten_khach_hang: e.target.value})}
                    required placeholder="Nhập tên khách hàng" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>SĐT *</label>
                  <input type="text" value={formData.so_dien_thoai} onChange={e => setFormData({...formData, so_dien_thoai: e.target.value})}
                    required placeholder="0123456789" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="email@example.com" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nguồn khách</label>
                  <select value={formData.nguon_khach} onChange={e => setFormData({...formData, nguon_khach: e.target.value})} style={inputStyle}>
                    <option value="landing_page">Landing Page</option>
                    <option value="fb_ads">Facebook Ads</option>
                    <option value="zalo_oa">Zalo OA</option>
                    <option value="walkin">Walk-in</option>
                    <option value="gioi_thieu">Giới thiệu</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Trạng thái</label>
                  <select value={formData.trang_thai} onChange={e => setFormData({...formData, trang_thai: e.target.value})} style={inputStyle}>
                    <option value="moi">Mới</option>
                    <option value="cho_xac_nhan">Chờ xác nhận</option>
                    <option value="da_mua">Đã mua</option>
                    <option value="huy">Hủy</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Địa chỉ</label>
                <input type="text" value={formData.dia_chi} onChange={e => setFormData({...formData, dia_chi: e.target.value})}
                  placeholder="Nhập địa chỉ" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Ghi chú</label>
                <textarea value={formData.ghi_chu} onChange={e => setFormData({...formData, ghi_chu: e.target.value})}
                  placeholder="Ghi chú thêm..." rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddEdit(false)} style={btnOutline('#6b7280', '#6b7280')}>Hủy</button>
                <button type="submit" disabled={saving} style={btn('#10b981')}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
