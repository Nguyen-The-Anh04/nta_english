import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';
const fmt = n => (n||0).toLocaleString('vi-VN')+'đ';
const fmtDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const ROLE_COLORS = {
  admin: '#e11d48', nhanvien_kd: '#3b82f6', giaovien: '#8b5cf6',
  ketoan: '#f59e0b', hocvien: '#10b981', ctv: '#06b6d4'
};

const badge = (text, color) => (
  <span style={{ background: color+'22', color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{text}</span>
);

const STATUS_CFG = {
  hoat_dong: { color: '#10b981', text: 'Hoạt động' },
  bi_khoa: { color: '#e11d48', text: 'Bị khóa' },
  cho_duyet: { color: '#f59e0b', text: 'Chờ duyệt' },
};

const CARD = ({ label, value, color }) => (
  <div style={{ background: '#fff', borderRadius: 12, padding: '18px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', flex: 1 }}>
    <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
  </div>
);

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ email: '', mat_khau: '', ho_ten: '', sdt: '', chuc_vu_id: '' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  useEffect(() => { loadRoles(); }, []);
  useEffect(() => { loadUsers(); }, [pagination.page, search, filterRole, filterStatus]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page: pagination.page, limit: 20, search, chuc_vu_id: filterRole, trang_thai: filterStatus });
      const r = await fetch(`${API}/users?${q}`, { headers: authHeader() });
      const d = await r.json();
      setUsers(d.data?.users || d.data || []);
      if (d.data?.pagination) setPagination(p => ({ ...p, ...d.data.pagination }));
    } catch { setUsers([]); } finally { setLoading(false); }
  };

  const loadRoles = async () => {
    try {
      const r = await fetch(`${API}/users/roles`, { headers: authHeader() });
      const d = await r.json();
      setRoles(d.data || []);
    } catch { setRoles([]); }
  };

  const openAdd = () => { setEditingUser(null); setForm({ email: '', mat_khau: '', ho_ten: '', sdt: '', chuc_vu_id: '' }); setShowModal(true); };
  const openEdit = (u) => { setEditingUser(u); setForm({ email: u.email, ho_ten: u.ho_ten, sdt: u.sdt||'', chuc_vu_id: u.chuc_vu_id||'' }); setShowModal(true); };

  const handleSave = async () => {
    try {
      if (editingUser) {
        await fetch(`${API}/users/${editingUser.id}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify({ ho_ten: form.ho_ten, sdt: form.sdt, chuc_vu_id: form.chuc_vu_id }) });
      } else {
        await fetch(`${API}/users`, { method: 'POST', headers: authHeader(), body: JSON.stringify(form) });
      }
      setShowModal(false); loadUsers();
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  const handleToggle = async (u) => {
    const newStatus = u.trang_thai === 'hoat_dong' ? 'bi_khoa' : 'hoat_dong';
    await fetch(`${API}/users/${u.id}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify({ trang_thai: newStatus }) });
    loadUsers();
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.trang_thai === 'hoat_dong').length,
    locked: users.filter(u => u.trang_thai === 'bi_khoa').length,
    pending: users.filter(u => u.trang_thai === 'cho_duyet').length,
  };

  const filtered = users.filter(u => {
    const s = search.toLowerCase();
    return (!s || u.ho_ten?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s))
      && (!filterRole || String(u.chuc_vu_id) === filterRole)
      && (!filterStatus || u.trang_thai === filterStatus);
  });

  const inp = { padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: 'system-ui' };
  const btn = (bg, color='#fff') => ({ padding: '9px 18px', background: bg, color, border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'system-ui' });

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>👥 Quản lý người dùng</h2>
        <div style={{ flex: 1 }} />
        <input placeholder="🔍 Tìm kiếm..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, width: 200 }} />
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={inp}>
          <option value="">Tất cả vai trò</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.ten_chuc_vu}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={inp}>
          <option value="">Tất cả trạng thái</option>
          <option value="hoat_dong">Hoạt động</option>
          <option value="bi_khoa">Bị khóa</option>
          <option value="cho_duyet">Chờ duyệt</option>
        </select>
        <button onClick={openAdd} style={btn('#e11d48')}>+ Thêm người dùng</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        <CARD label="Tổng người dùng" value={stats.total} color="#3b82f6" />
        <CARD label="Hoạt động" value={stats.active} color="#10b981" />
        <CARD label="Bị khóa" value={stats.locked} color="#e11d48" />
        <CARD label="Chờ duyệt" value={stats.pending} color="#f59e0b" />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#ef4444' }}>
                {['STT','Họ tên / Email','SĐT','Vai trò','Trạng thái','Ngày tạo','Thao tác'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, color: '#ffffff', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.2)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} style={{ borderTop: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                  <td style={{ padding: '11px 14px', color: '#9ca3af', fontSize: 13 }}>{i+1}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{u.ho_ten}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13 }}>{u.sdt || '—'}</td>
                  <td style={{ padding: '11px 14px' }}>{badge(u.ten_chuc_vu || u.chuc_vu || '—', ROLE_COLORS[u.chuc_vu] || '#6b7280')}</td>
                  <td style={{ padding: '11px 14px' }}>{badge((STATUS_CFG[u.trang_thai]||{text:'—'}).text, (STATUS_CFG[u.trang_thai]||{color:'#6b7280'}).color)}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#6b7280' }}>{fmtDate(u.created_at)}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(u)} style={{ ...btn('#3b82f6'), padding: '5px 10px', fontSize: 12 }}>✏️</button>
                      <button onClick={() => handleToggle(u)} style={{ ...btn(u.trang_thai==='hoat_dong'?'#f59e0b':'#10b981'), padding: '5px 10px', fontSize: 12 }}>
                        {u.trang_thai==='hoat_dong'?'🔒':'🔓'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i+1).map(p => (
            <button key={p} onClick={() => setPagination(prev => ({ ...prev, page: p }))}
              style={{ ...btn(p===pagination.page?'#e11d48':'#f3f4f6', p===pagination.page?'#fff':'#374151'), padding: '6px 14px' }}>{p}</button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>{editingUser ? '✏️ Sửa người dùng' : '➕ Thêm người dùng'}</h3>
            {[
              { label: 'Email', key: 'email', type: 'email', disabled: !!editingUser },
              ...(!editingUser ? [{ label: 'Mật khẩu', key: 'mat_khau', type: 'password' }] : []),
              { label: 'Họ tên', key: 'ho_ten' },
              { label: 'Số điện thoại', key: 'sdt' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 5 }}>{f.label}</label>
                <input type={f.type||'text'} value={form[f.key]||''} disabled={f.disabled}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ ...inp, width: '100%', boxSizing: 'border-box', background: f.disabled?'#f9fafb':'#fff' }} />
              </div>
            ))}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 5 }}>Vai trò</label>
              <select value={form.chuc_vu_id} onChange={e => setForm(p => ({ ...p, chuc_vu_id: e.target.value }))} style={{ ...inp, width: '100%' }}>
                <option value="">-- Chọn vai trò --</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.ten_chuc_vu}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={btn('#f3f4f6','#374151')}>Hủy</button>
              <button onClick={handleSave} style={btn('#e11d48')}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
