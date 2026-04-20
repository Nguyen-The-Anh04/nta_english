import { useState, useEffect } from 'react';

const API = 'http://localhost:5000/api/books';
const API_AFF = 'http://localhost:5000/api/affiliate';
const fmt = n => Number(n||0).toLocaleString('vi-VN') + ' đ';
const fmtDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const STATUS_CFG = {
  cho_tt: { color: '#f59e0b', text: 'Chờ TT' },
  da_tt: { color: '#3b82f6', text: 'Đã TT' },
  dang_giao: { color: '#8b5cf6', text: 'Đang giao' },
  da_giao: { color: '#10b981', text: 'Đã giao' },
  da_huy: { color: '#e11d48', text: 'Đã hủy' },
};

const STATUS_OPTIONS = [
  { key: 'cho_tt', label: 'Chờ thanh toán' },
  { key: 'da_tt', label: 'Đã thanh toán' },
  { key: 'dang_giao', label: 'Đang giao' },
  { key: 'da_giao', label: 'Đã giao' },
  { key: 'da_huy', label: 'Đã hủy' },
];

const PAYMENT_MAP = { cod: 'Tiền mặt', vnpay: 'VNPay', momo: 'MoMo', chuyen_khoan: 'CK' };

const badge = (text, color) => (
  <span style={{ background: color+'22', color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{text}</span>
);

// Icons
const IconEye = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconClose = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ all: 0, cho_tt: 0, da_tt: 0, dang_giao: 0, da_giao: 0, da_huy: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/orders`, { headers: authHeader() });
      const d = await r.json();
      const data = d.data?.orders || d.orders || [];
      setOrders(data);
      const s = { all: 0, cho_tt: 0, da_tt: 0, dang_giao: 0, da_giao: 0, da_huy: 0 };
      (data).forEach(o => { s[o.trang_thai] = (s[o.trang_thai]||0)+1; s.all++; });
      setStats(s);
    } catch { setOrders([]); } finally { setLoading(false); }
  };

  const fetchOrderById = async (id) => {
    const r = await fetch(`${API}/orders/${id}`, { headers: authHeader() });
    return r.json();
  };

  const updateOrderStatus = async (id, status) => {
    const r = await fetch(`${API}/orders/${id}/status`, { 
      method: 'PUT', 
      headers: authHeader(), 
      body: JSON.stringify({ trang_thai: status }) 
    });
    return r.json();
  };

  const handleApproveAll = async () => {
    if (!window.confirm('Duyệt TẤT CẢ đơn chờ thanh toán?')) return;
    const pending = orders.filter(o => o.trang_thai === 'cho_tt');
    let count = 0;
    for (const o of pending) { 
      const r = await updateOrderStatus(o.id, 'da_tt'); 
      if (r.success) count++; 
    }
    alert(`✅ Đã duyệt ${count} đơn`); 
    load();
  };

  const handleBackfill = async () => {
    if (!window.confirm('Đồng bộ hoa hồng cho đơn đã TT chưa có HH?')) return;
    try {
      const r = await fetch(`${API_AFF}/admin/backfill-commissions`, { 
        method: 'POST', 
        headers: authHeader() 
      });
      const d = await r.json();
      alert(d.message || 'Hoàn tất');
      load();
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  const handleFixCapDo = async () => {
    if (!window.confirm('Tính lại cấp độ F1/F2/F3 cho toàn bộ CTV?')) return;
    try {
      const r = await fetch(`${API_AFF}/admin/fix-cap-do`, { 
        method: 'POST', 
        headers: authHeader() 
      });
      const d = await r.json();
      alert(d.message || 'Hoàn tất');
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  const handleViewDetail = async (id) => {
    const d = await fetchOrderById(id);
    setSelectedOrder(d.data || d);
    setShowDetail(true);
  };

  const handleAdd = () => {
    setSelectedOrder(null);
    setIsEditing(false);
    setFormData({
      ma_don_hang: 'DH' + Date.now(),
      nguoi_mua_id: '',
      ctv_id: '',
      tong_tien: 0,
      giam_gia: 0,
      phuong_thuc_tt: 'chuyen_khoan',
      trang_thai: 'cho_tt',
    });
    setShowAddEdit(true);
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setIsEditing(true);
    setFormData({
      id: order.id,
      ma_don_hang: order.ma_don_hang,
      nguoi_mua_id: order.nguoi_mua_id,
      ctv_id: order.ctv_id,
      tong_tien: order.tong_tien,
      giam_gia: order.giam_gia,
      phuong_thuc_tt: order.phuong_thuc_tt,
      trang_thai: order.trang_thai,
    });
    setShowAddEdit(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa đơn hàng này?')) return;
    try {
      const r = await fetch(`${API}/orders/${id}`, { method: 'DELETE', headers: authHeader() });
      const d = await r.json();
      if (d.success) {
        alert('Xóa thành công');
        load();
      } else {
        alert(d.message || 'Xóa thất bại');
      }
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEditing ? `${API}/orders/${selectedOrder.id}` : `${API}/orders`;
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: authHeader(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success || data.data) {
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

  const handleQuickStatusChange = async (id, status) => {
    const r = await updateOrderStatus(id, status);
    if (r.success) {
      load();
    }
  };

  const filtered = orders.filter(o => {
    const s = search.toLowerCase();
    return (filterStatus === 'all' || o.trang_thai === filterStatus)
      && (!s || o.ma_don_hang?.toLowerCase().includes(s) || o.nguoiMua?.ho_ten?.toLowerCase().includes(s) || o.nguoiCTV?.ho_ten?.toLowerCase().includes(s));
  });

  const totalRevenue = orders.filter(o => o.trang_thai === 'da_giao').reduce((s, o) => s+(+o.tong_tien||0), 0);

  const TABS = [
    { key: 'all', label: 'Tất cả' }, { key: 'cho_tt', label: 'Chờ TT' }, { key: 'da_tt', label: 'Đã TT' },
    { key: 'dang_giao', label: 'Đang giao' }, { key: 'da_giao', label: 'Đã giao' }, { key: 'da_huy', label: 'Đã hủy' },
  ];

  const btn = (bg, color='#fff') => ({ 
    padding: '8px 16px', background: bg, color, border: 'none', borderRadius: 8, 
    fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'system-ui',
    display: 'inline-flex', alignItems: 'center', gap: 6
  });

  const btnOutline = (bg, color=bg) => ({
    padding: '6px 10px', background: 'transparent', color, border: `1px solid ${color}`, 
    borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4
  });

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '2px solid #f3f4f6', paddingBottom: 12, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setFilterStatus(t.key)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            background: filterStatus===t.key ? '#e11d48' : '#f3f4f6', color: filterStatus===t.key ? '#fff' : '#374151', fontFamily: 'system-ui'
          }}>
            {t.label}
            <span style={{ marginLeft: 6, background: filterStatus===t.key?'rgba(255,255,255,0.3)':'#e5e7eb', padding: '1px 7px', borderRadius: 12, fontSize: 11 }}>
              {t.key === 'all' ? stats.all : (stats[t.key]||0)}
            </span>
          </button>
        ))}
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative' }}>
          <input placeholder="🔍 Tìm đơn hàng..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '9px 12px 9px 14px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', width: 240 }} />
        </div>
        <div style={{ flex: 1 }} />
        <button onClick={handleApproveAll} style={btn('#10b981')}>✅ Duyệt tất cả</button>
        <button onClick={handleBackfill} style={btn('#f59e0b')}>🔄 Đồng bộ HH</button>
        <button onClick={handleFixCapDo} style={btn('#8b5cf6')}>🔧 Fix F1/F2/F3</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Tổng đơn', value: stats.all, color: '#3b82f6' },
          { label: 'Doanh thu đã giao', value: fmt(totalRevenue), color: '#10b981' },
          { label: 'Đã giao', value: stats.da_giao||0, color: '#8b5cf6' },
          { label: 'Chờ TT', value: stats.cho_tt||0, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', flex: 1 }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'auto' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#ef4444' }}>
                {['Mã đơn','Khách hàng','CTV giới thiệu','Tổng tiền','Giảm giá','Thanh toán','Trạng thái','Ngày','Thao tác'].map(h => (
                  <th key={h} style={{ padding: '11px 12px', textAlign: 'center', fontSize: 12, color: '#ffffff', fontWeight: 600, whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.2)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} style={{ borderTop: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                  <td style={{ padding: '11px 12px', fontWeight: 700, color: '#1a1a2e', fontSize: 13 }}>#{o.ma_don_hang}</td>
                  <td style={{ padding: '11px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{o.nguoiMua?.ho_ten || 'Khách vãng lai'}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{o.nguoiMua?.email}</div>
                  </td>
                  <td style={{ padding: '11px 12px', fontSize: 13, color: '#6b7280' }}>{o.nguoiCTV?.ho_ten || '—'}</td>
                  <td style={{ padding: '11px 12px', fontWeight: 700, fontSize: 13 }}>{fmt(o.tong_tien)}</td>
                  <td style={{ padding: '11px 12px', fontSize: 13, color: '#e11d48' }}>{o.giam_gia > 0 ? `-${fmt(o.giam_gia)}` : '—'}</td>
                  <td style={{ padding: '11px 12px', fontSize: 12, color: '#6b7280' }}>{PAYMENT_MAP[o.phuong_thuc_tt] || o.phuong_thuc_tt}</td>
                  <td style={{ padding: '11px 12px' }}>
                    <select 
                      value={o.trang_thai} 
                      onChange={(e) => handleQuickStatusChange(o.id, e.target.value)}
                      style={{
                        padding: '5px 8px', borderRadius: 6, border: '1px solid #e5e7eb', 
                        fontSize: 12, fontWeight: 600, 
                        background: (STATUS_CFG[o.trang_thai]||{}).color + '22',
                        color: (STATUS_CFG[o.trang_thai]||{}).color,
                        cursor: 'pointer'
                      }}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '11px 12px', fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{fmtDate(o.created_at)}</td>
                  <td style={{ padding: '11px 12px' }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button onClick={() => handleViewDetail(o.id)} title="Xem chi tiết" style={btnOutline('#3b82f6', '#3b82f6')}>
                        <IconEye /> Xem
                      </button>
                      <button onClick={() => handleEdit(o)} title="Sửa" style={btnOutline('#8b5cf6', '#8b5cf6')}>
                        <IconEdit />
                      </button>
                      <button onClick={() => handleDelete(o.id)} title="Xóa" style={btnOutline('#e11d48', '#e11d48')}>
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>Không có đơn hàng</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '80%', maxWidth: 760, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>📦 Chi tiết đơn hàng #{selectedOrder.ma_don_hang}</h3>
              <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            
            {/* Thông tin khách hàng */}
            <div style={{ background: '#f0fdf4', borderRadius: 12, padding: '16px 20px', marginBottom: 16, border: '1px solid #86efac' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 12 }}>👤 THÔNG TIN KHÁCH HÀNG</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#15803d', marginBottom: 2 }}>Họ tên</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedOrder.nguoiMua?.ho_ten || 'Khách vãng lai'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#15803d', marginBottom: 2 }}>Số điện thoại</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedOrder.nguoiMua?.sdt || '—'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: 12, color: '#15803d', marginBottom: 2 }}>Địa chỉ giao hàng</div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedOrder.dia_chi_giao || selectedOrder.nguoiMua?.dia_chi || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#15803d', marginBottom: 2 }}>Email</div>
                  <div style={{ fontSize: 14 }}>{selectedOrder.nguoiMua?.email || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#15803d', marginBottom: 2 }}>CTV giới thiệu</div>
                  <div style={{ fontSize: 14 }}>{selectedOrder.nguoiCTV?.ho_ten || 'Không có'}</div>
                </div>
              </div>
            </div>
            
            {/* Danh sách sản phẩm */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 10 }}>📚 DANH SÁCH SẢN PHẨM</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>STT</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Tên sản phẩm</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Đơn giá</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>SL</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: '#6b7280', fontWeight: 600 }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.chiTiets||[]).map((item, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 12px', fontSize: 13, color: '#9ca3af' }}>{i+1}</td>
                      <td style={{ padding: '10px 12px', fontSize: 14, fontWeight: 600 }}>{item.sach?.ten_sach || item.ten_sach}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, textAlign: 'right' }}>{fmt(item.gia_sp)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, textAlign: 'center', fontWeight: 600, color: '#8b5cf6' }}>{item.so_luong}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: '#10b981', textAlign: 'right' }}>{fmt(item.thanh_tien)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Tổng tiền */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              <div style={{ flex: 1, background: '#f9fafb', borderRadius: 10, padding: '12px 16px' }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Tổng tiền gốc</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#374151' }}>{fmt(selectedOrder.tong_tien_goc)}</div>
              </div>
              <div style={{ flex: 1, background: '#fef2f2', borderRadius: 10, padding: '12px 16px', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: 12, color: '#dc2626', marginBottom: 4 }}>Giảm giá</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#dc2626' }}>-{fmt(selectedOrder.giam_gia || 0)}</div>
              </div>
              <div style={{ flex: 1, background: '#dcfce7', borderRadius: 10, padding: '12px 16px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: 12, color: '#16a34a', marginBottom: 4 }}>Thành tiền</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#16a34a' }}>{fmt(selectedOrder.tong_tien)}</div>
              </div>
            </div>
            
            {/* Thông tin thanh toán và ghi chú */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Phương thức thanh toán</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{PAYMENT_MAP[selectedOrder.phuong_thuc_tt] || selectedOrder.phuong_thuc_tt}</div>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Ghi chú</div>
                <div style={{ fontSize: 14 }}>{selectedOrder.ghi_chu || '—'}</div>
              </div>
            </div>
            
            {/* Đổi trạng thái */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>Đổi trạng thái:</span>
              {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                <button key={key} onClick={() => handleQuickStatusChange(selectedOrder.id, key)}
                  disabled={selectedOrder.trang_thai === key}
                  style={{ padding: '6px 14px', background: selectedOrder.trang_thai===key?'#f3f4f6':cfg.color+'22', color: selectedOrder.trang_thai===key?'#9ca3af':cfg.color, border: `1px solid ${cfg.color}44`, borderRadius: 8, fontWeight: 600, cursor: selectedOrder.trang_thai===key?'default':'pointer', fontSize: 12 }}>
                  {cfg.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 480, maxHeight: '80vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>{isEditing ? '✏️ Sửa đơn hàng' : '➕ Thêm đơn hàng mới'}</h3>
              <button onClick={() => setShowAddEdit(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Mã đơn hàng</label>
                <input 
                  type="text"
                  value={formData.ma_don_hang} 
                  onChange={e => setFormData({...formData, ma_don_hang: e.target.value})}
                  required
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Tổng tiền</label>
                <input 
                  type="number"
                  value={formData.tong_tien} 
                  onChange={e => setFormData({...formData, tong_tien: parseInt(e.target.value)})}
                  required
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Giảm giá</label>
                <input 
                  type="number"
                  value={formData.giam_gia || 0} 
                  onChange={e => setFormData({...formData, giam_gia: parseInt(e.target.value) || 0})}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Phương thức thanh toán</label>
                <select 
                  value={formData.phuong_thuc_tt} 
                  onChange={e => setFormData({...formData, phuong_thuc_tt: e.target.value})}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, width: '100%', boxSizing: 'border-box' }}
                >
                  <option value="chuyen_khoan">Chuyển khoản</option>
                  <option value="cod">Tiền mặt</option>
                  <option value="vnpay">VNPay</option>
                  <option value="momo">MoMo</option>
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Trạng thái</label>
                <select 
                  value={formData.trang_thai} 
                  onChange={e => setFormData({...formData, trang_thai: e.target.value})}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, width: '100%', boxSizing: 'border-box' }}
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.key} value={opt.key}>{opt.label}</option>
                  ))}
                </select>
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
