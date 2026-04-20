import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api';
const fmt = n => (n||0).toLocaleString('vi-VN')+'đ';
const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const badge = (text, color) => (
  <span style={{ background: color+'22', color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{text}</span>
);

const INIT_FORM = { san_pham_id: '', f1_percent: 10, f2_percent: 5, f3_percent: 2, trang_thai: 'hoat_dong' };

export default function CommissionProductsManagement() {
  const [items, setItems] = useState([]);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(INIT_FORM);

  useEffect(() => { load(); loadBooks(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/affiliate/admin/commission-products`, { headers: authHeader() });
      const d = await r.json();
      setItems(d.data || d.items || []);
    } catch { setItems([]); } finally { setLoading(false); }
  };

  const loadBooks = async () => {
    try {
      const r = await fetch(`${API}/books`);
      const d = await r.json();
      setBooks(d.data?.books || d.data || []);
    } catch { setBooks([]); }
  };

  const openAdd = () => { setEditingItem(null); setForm(INIT_FORM); setShowModal(true); };
  const openEdit = (item) => {
    setEditingItem(item);
    setForm({ san_pham_id: item.san_pham_id, f1_percent: item.f1_percent, f2_percent: item.f2_percent, f3_percent: item.f3_percent, trang_thai: item.trang_thai });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingItem) {
        await fetch(`${API}/affiliate/admin/commission-products/${editingItem.id}`, { method: 'PUT', headers: authHeader(), body: JSON.stringify(form) });
      } else {
        await fetch(`${API}/affiliate/admin/commission-products`, { method: 'POST', headers: authHeader(), body: JSON.stringify(form) });
      }
      setShowModal(false); load();
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa cấu hình này?')) return;
    await fetch(`${API}/affiliate/admin/commission-products/${id}`, { method: 'DELETE', headers: authHeader() });
    load();
  };

  const inp = { padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', fontFamily: 'system-ui', width: '100%', boxSizing: 'border-box' };
  const btn = (bg, color='#fff') => ({ padding: '7px 14px', background: bg, color, border: 'none', borderRadius: 7, fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: 'system-ui' });

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>⚙️ Cấu hình hoa hồng sản phẩm</h2>
        <div style={{ flex: 1 }} />
        <button onClick={openAdd} style={{ ...btn('#e11d48'), padding: '9px 18px', fontSize: 13 }}>+ Thêm cấu hình</button>
      </div>

      {/* Info box */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#1d4ed8' }}>
        💡 <strong>F1</strong> = Người giới thiệu trực tiếp &nbsp;|&nbsp; <strong>F2</strong> = Cấp 2 (người giới thiệu F1) &nbsp;|&nbsp; <strong>F3</strong> = Cấp 3
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#ef4444' }}>
                {['STT','Sản phẩm','F1%','F2%','F3%','Trạng thái','Thao tác'].map(h => (
                  <th key={h} style={{ padding: '11px 14px', textAlign: 'center', fontSize: 13, color: '#ffffff', fontWeight: 600, textShadow: '0 1px 2px rgba(0,0,0,0.2)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={item.id} style={{ borderTop: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                  <td style={{ padding: '11px 14px', color: '#9ca3af', fontSize: 13 }}>{i+1}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ fontWeight: 600 }}>{item.ten_sach || item.ten_san_pham}</div>
                    <div style={{ fontSize: 12, color: '#10b981' }}>{fmt(item.gia_ban)}</div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>{badge(`${item.f1_percent}%`, '#e11d48')}</td>
                  <td style={{ padding: '11px 14px' }}>{badge(`${item.f2_percent}%`, '#3b82f6')}</td>
                  <td style={{ padding: '11px 14px' }}>{badge(`${item.f3_percent}%`, '#8b5cf6')}</td>
                  <td style={{ padding: '11px 14px' }}>{badge(item.trang_thai==='hoat_dong'?'Hoạt động':'Tạm dừng', item.trang_thai==='hoat_dong'?'#10b981':'#9ca3af')}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(item)} style={btn('#3b82f6')}>✏️ Sửa</button>
                      <button onClick={() => handleDelete(item.id)} style={btn('#e11d48')}>🗑️ Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>Chưa có cấu hình nào</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18 }}>{editingItem ? '✏️ Sửa cấu hình' : '➕ Thêm cấu hình'}</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 5 }}>Sản phẩm</label>
              <select value={form.san_pham_id} onChange={e => setForm(p => ({ ...p, san_pham_id: e.target.value }))} style={inp}>
                <option value="">-- Chọn sản phẩm --</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.ten_sach} — {fmt(b.gia_ban)}</option>)}
              </select>
            </div>
            {[['F1% (Trực tiếp)','f1_percent'],['F2% (Cấp 2)','f2_percent'],['F3% (Cấp 3)','f3_percent']].map(([label, key]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
                <input type="number" min={0} max={100} step={0.5} value={form[key]}
                  onChange={e => setForm(p => ({ ...p, [key]: +e.target.value }))} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 5 }}>Trạng thái</label>
              <select value={form.trang_thai} onChange={e => setForm(p => ({ ...p, trang_thai: e.target.value }))} style={inp}>
                <option value="hoat_dong">Hoạt động</option>
                <option value="tam_dung">Tạm dừng</option>
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
