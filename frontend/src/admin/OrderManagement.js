import { useState, useEffect } from 'react';
import { fetchOrders, fetchOrderById, updateOrderStatus, backfillCommissions } from '../api';

const API = 'http://localhost:5000/api';
const fmt = n => (n||0).toLocaleString('vi-VN')+'đ';
const fmtDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const fixCapDo = async () => {
  const r = await fetch(`${API}/affiliate/admin/fix-cap-do`, { method: 'POST', headers: authHeader() });
  return r.json();
};

const STATUS_CFG = {
  cho_tt: { color: '#f59e0b', text: 'Chờ TT' },
  da_tt: { color: '#3b82f6', text: 'Đã TT' },
  dang_giao: { color: '#8b5cf6', text: 'Đang giao' },
  da_giao: { color: '#10b981', text: 'Đã giao' },
  da_huy: { color: '#e11d48', text: 'Đã hủy' },
};

const PAYMENT_MAP = { cod: 'Tiền mặt', vnpay: 'VNPay', momo: 'MoMo', chuyen_khoan: 'CK' };

const badge = (text, color) => (
  <span style={{ background: color+'22', color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{text}</span>
);

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ all: 0, cho_tt: 0, da_tt: 0, dang_giao: 0, da_giao: 0, da_huy: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data || []);
      const s = { all: 0, cho_tt: 0, da_tt: 0, dang_giao: 0, da_giao: 0, da_huy: 0 };
      (data || []).forEach(o => { s[o.trang_thai] = (s[o.trang_thai]||0)+1; s.all++; });
      setStats(s);
    } catch { setOrders([]); } finally { setLoading(false); }
  };

  const handleApproveAll = async () => {
    if (!window.confirm('Duyệt TẤT CẢ đơn chờ thanh toán?')) return;
    const pending = orders.filter(o => o.trang_thai === 'cho_tt');
    let count = 0;
    for (const o of pending) { const r = await updateOrderStatus(o.id, 'da_tt'); if (r.success) count++; }
    alert(`✅ Đã duyệt ${count} đơn`); load();
  };

  const handleBackfill = async () => {
    if (!window.confirm('Đồng bộ hoa hồng cho đơn đã TT chưa có HH?')) return;
    const r = await backfillCommissions();
    alert(r.message || 'Hoàn tất'); load();
  };

  const handleFixCapDo = async () => {
    if (!window.confirm('Tính lại cấp độ F1/F2/F3 cho toàn bộ CTV?')) return;
    const r = await fixCapDo();
    alert(r.message || 'Hoàn tất');
  };

  const handleViewDetail = async (id) => {
    const d = await fetchOrderById(id);
    setSelectedOrder(d); setShowDetail(true);
  };

  const handleChangeStatus = async (id, status) => {
    await updateOrderStatus(id, status);
    const d = await fetchOrderById(id);
    setSelectedOrder(d); load();
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

  const btn = (bg, color='#fff') => ({ padding: '8px 16px', background: bg, color, border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'system-ui' });

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
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Mã đơn','Khách hàng','CTV giới thiệu','Tổng tiền','Giảm giá','Thanh toán','Trạng thái','Ngày','Thao tác'].map(h => (
                  <th key={h} style={{ padding: '11px 12px', textAlign: 'left', fontSize: 12, color: '#6b7280', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
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
                  <td style={{ padding: '11px 12px' }}>{badge((STATUS_CFG[o.trang_thai]||{text:o.trang_thai}).text, (STATUS_CFG[o.trang_thai]||{color:'#6b7280'}).color)}</td>
                  <td style={{ padding: '11px 12px', fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap' }}>{fmtDate(o.created_at)}</td>
                  <td style={{ padding: '11px 12px' }}>
                    <button onClick={() => handleViewDetail(o.id)} style={{ padding: '5px 12px', background: '#e11d48', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Xem</button>
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
              <h3 style={{ margin: 0, fontSize: 18 }}>📦 Đơn hàng #{selectedOrder.ma_don_hang}</h3>
              <button onClick={() => setShowDetail(false)} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>Khách hàng</div>
                <div style={{ fontWeight: 700 }}>{selectedOrder.nguoiMua?.ho_ten || 'Khách vãng lai'}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{selectedOrder.nguoiMua?.email}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{selectedOrder.nguoiMua?.sdt}</div>
              </div>
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 6 }}>CTV giới thiệu</div>
                <div style={{ fontWeight: 700 }}>{selectedOrder.nguoiCTV?.ho_ten || '—'}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{selectedOrder.nguoiCTV?.email}</div>
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Sản phẩm','Đơn giá','SL','Thành tiền'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(selectedOrder.chiTiets||[]).map((item, i) => (
                  <tr key={i} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', fontSize: 14 }}>{item.sach?.ten_sach || item.ten_sach}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13 }}>{fmt(item.gia_sp)}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13 }}>{item.so_luong}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: '#10b981' }}>{fmt(item.thanh_tien)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
              {[['Tổng gốc', fmt(selectedOrder.tong_tien_goc), '#374151'],['Giảm giá', `-${fmt(selectedOrder.giam_gia)}`, '#e11d48'],['Thanh toán', fmt(selectedOrder.tong_tien), '#10b981']].map(([k,v,c]) => (
                <div key={k} style={{ flex: 1, background: '#f9fafb', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{k}</div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: c }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, color: '#6b7280', alignSelf: 'center' }}>Đổi trạng thái:</span>
              {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                <button key={key} onClick={() => handleChangeStatus(selectedOrder.id, key)}
                  disabled={selectedOrder.trang_thai === key}
                  style={{ padding: '6px 14px', background: selectedOrder.trang_thai===key?'#f3f4f6':cfg.color+'22', color: selectedOrder.trang_thai===key?'#9ca3af':cfg.color, border: `1px solid ${cfg.color}44`, borderRadius: 8, fontWeight: 600, cursor: selectedOrder.trang_thai===key?'default':'pointer', fontSize: 12 }}>
                  {cfg.text}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
