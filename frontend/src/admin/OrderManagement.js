import { useState, useEffect, useRef } from 'react';

const API = 'http://localhost:5000/api/books';
const API_AFF = 'http://localhost:5000/api/affiliate';
const API_AFF2 = 'http://localhost:5000/api/affiliate/admin/ctvs';
const fmt = n => Number(n||0).toLocaleString('vi-VN') + ' đ';
const fmtDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const authHeader = () => ({ 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

const STATUS_CFG = {
  cho_tt:    { color: '#f59e0b', text: 'Chờ TT' },
  da_tt:     { color: '#3b82f6', text: 'Đã TT' },
  dang_giao: { color: '#8b5cf6', text: 'Đang giao' },
  da_giao:   { color: '#10b981', text: 'Đã giao' },
  da_huy:    { color: '#e11d48', text: 'Đã hủy' },
};
const STATUS_OPTIONS = Object.entries(STATUS_CFG).map(([key, v]) => ({ key, label: v.text }));
const PAYMENT_MAP = { cod: 'Tiền mặt', vnpay: 'VNPay', momo: 'MoMo', chuyen_khoan: 'CK', bank: 'CK' };

const badge = (text, color) => (
  <span style={{ background: color+'22', color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{text}</span>
);
const IconEye = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
const IconPrint = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>;

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [ctvMap, setCtvMap] = useState({}); // ctv_id → ho_ten
  const [stats, setStats] = useState({ all:0, cho_tt:0, da_tt:0, dang_giao:0, da_giao:0, da_huy:0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const printRef = useRef();

  useEffect(() => { load(); loadCTVs(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/orders?limit=200`, { headers: authHeader() });
      const d = await r.json();
      const data = d.data?.orders || d.orders || [];
      setOrders(data);
      const s = { all:0, cho_tt:0, da_tt:0, dang_giao:0, da_giao:0, da_huy:0 };
      data.forEach(o => { s[o.trang_thai] = (s[o.trang_thai]||0)+1; s.all++; });
      setStats(s);
    } catch { setOrders([]); } finally { setLoading(false); }
  };

  // Load CTV list để map ctv_id → tên
  const loadCTVs = async () => {
    try {
      const r = await fetch(`${API_AFF2}?limit=200`, { headers: authHeader() });
      const d = await r.json();
      const list = d.data?.ctvs || [];
      const map = {};
      list.forEach(c => {
        map[c.id] = c.nguoiDung?.ho_ten || '—';
        // map cả nguoi_dung_id
        if (c.nguoi_dung_id) map[`u_${c.nguoi_dung_id}`] = c.nguoiDung?.ho_ten || '—';
      });
      setCtvMap(map);
    } catch {}
  };

  const getCTVName = (order) => {
    if (!order.ctv_id) return '—';
    // Từ detail response có ctvGioiThieu
    if (order.ctvGioiThieu?.ho_ten) return order.ctvGioiThieu.ho_ten;
    // Thử map theo ctv_id từ danh sách CTV đã load
    if (ctvMap[order.ctv_id]) return ctvMap[order.ctv_id];
    if (ctvMap[`u_${order.ctv_id}`]) return ctvMap[`u_${order.ctv_id}`];
    return `CTV #${order.ctv_id}`;
  };

  const fetchOrderById = async (id) => {
    const r = await fetch(`${API}/orders/${id}`, { headers: authHeader() });
    return r.json();
  };

  const updateOrderStatus = async (id, status) => {
    const r = await fetch(`${API}/orders/${id}/status`, {
      method: 'PUT', headers: authHeader(), body: JSON.stringify({ trang_thai: status })
    });
    return r.json();
  };

  const handleApproveAll = async () => {
    if (!window.confirm('Duyệt TẤT CẢ đơn chờ thanh toán?')) return;
    const pending = orders.filter(o => o.trang_thai === 'cho_tt');
    let count = 0;
    for (const o of pending) { const r = await updateOrderStatus(o.id, 'da_tt'); if (r.success) count++; }
    alert(`✅ Đã duyệt ${count} đơn`); load();
  };

  const handleBackfill = async () => {
    if (!window.confirm('Đồng bộ hoa hồng?')) return;
    try {
      const r = await fetch(`${API_AFF}/admin/backfill-commissions`, { method: 'POST', headers: authHeader() });
      const d = await r.json(); alert(d.message || 'Hoàn tất'); load();
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  const handleFixCapDo = async () => {
    if (!window.confirm('Tính lại F1/F2/F3?')) return;
    try {
      const r = await fetch(`${API_AFF}/admin/fix-cap-do`, { method: 'POST', headers: authHeader() });
      const d = await r.json(); alert(d.message || 'Hoàn tất');
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  const handleViewDetail = async (id) => {
    try {
      const d = await fetchOrderById(id);
      setSelectedOrder(d.data || d);
      setShowDetail(true);
    } catch { alert('Không tải được chi tiết đơn'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa đơn hàng này?')) return;
    try {
      const r = await fetch(`${API}/orders/${id}`, { method: 'DELETE', headers: authHeader() });
      const d = await r.json();
      if (d.success) { load(); } else { alert(d.message || 'Xóa thất bại'); }
    } catch (e) { alert('Lỗi: ' + e.message); }
  };

  const handleQuickStatusChange = async (id, status) => {
    const r = await updateOrderStatus(id, status);
    if (r.success) {
      load();
      if (showDetail && selectedOrder?.id === id) {
        setSelectedOrder(prev => ({ ...prev, trang_thai: status }));
      }
    }
  };

  // In hóa đơn PDF
  const handlePrint = () => {
    const o = selectedOrder;
    if (!o) return;
    const barcodeUrl = `https://barcodeapi.org/api/128/${encodeURIComponent(o.ma_don_hang)}`;
    const items = (o.chiTiets || []).map((item, i) => `
      <tr>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${i+1}</td>
        <td style="padding:8px;border:1px solid #e5e7eb">${item.sach?.ten_sach || '—'}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right">${Number(item.gia_sp||0).toLocaleString('vi-VN')} đ</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:center">${item.so_luong}</td>
        <td style="padding:8px;border:1px solid #e5e7eb;text-align:right;font-weight:700">${Number(item.thanh_tien||0).toLocaleString('vi-VN')} đ</td>
      </tr>`).join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Hóa đơn ${o.ma_don_hang}</title>
    <style>body{font-family:Arial,sans-serif;padding:24px;color:#111}h2{color:#e11d48}table{width:100%;border-collapse:collapse}th{background:#f3f4f6;padding:8px;border:1px solid #e5e7eb;font-size:13px}td{font-size:13px}.total{font-size:16px;font-weight:800;color:#e11d48}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}.info-item{background:#f9fafb;padding:10px;border-radius:6px}.info-label{font-size:11px;color:#9ca3af;margin-bottom:2px}.info-value{font-weight:600;font-size:14px}</style>
    </head><body>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px">
      <div><h2 style="margin:0">NTA ENGLISH CENTER</h2><div style="color:#6b7280;font-size:13px">Hóa đơn bán hàng</div></div>
      <img src="${barcodeUrl}" alt="barcode" style="height:60px" />
    </div>
    <div style="background:#fef2f2;padding:12px 16px;border-radius:8px;margin-bottom:16px">
      <div style="font-size:18px;font-weight:800;color:#e11d48">Mã đơn: ${o.ma_don_hang}</div>
      <div style="font-size:13px;color:#6b7280">Ngày đặt: ${fmtDate(o.created_at)} | Trạng thái: ${STATUS_CFG[o.trang_thai]?.text || o.trang_thai}</div>
    </div>
    <div class="info-grid">
      <div class="info-item"><div class="info-label">Khách hàng</div><div class="info-value">${o.nguoiMua?.ho_ten || 'Khách vãng lai'}</div></div>
      <div class="info-item"><div class="info-label">Số điện thoại</div><div class="info-value">${o.nguoiMua?.sdt || '—'}</div></div>
      <div class="info-item" style="grid-column:1/-1"><div class="info-label">Địa chỉ giao hàng</div><div class="info-value">${o.dia_chi_giao || '—'}</div></div>
      <div class="info-item"><div class="info-label">Phương thức TT</div><div class="info-value">${PAYMENT_MAP[o.phuong_thuc_tt] || o.phuong_thuc_tt}</div></div>
      <div class="info-item"><div class="info-label">CTV giới thiệu</div><div class="info-value">${getCTVName(o)}</div></div>
    </div>
    <table><thead><tr><th>STT</th><th>Sản phẩm</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr></thead><tbody>${items}</tbody></table>
    <div style="margin-top:16px;text-align:right">
      ${o.giam_gia > 0 ? `<div style="font-size:14px;color:#e11d48;margin-bottom:4px">Giảm giá: -${Number(o.giam_gia).toLocaleString('vi-VN')} đ</div>` : ''}
      <div class="total">TỔNG CỘNG: ${Number(o.tong_tien).toLocaleString('vi-VN')} đ</div>
    </div>
    <div style="margin-top:24px;text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:12px">Cảm ơn quý khách đã mua hàng tại NTA English Center!</div>
    <script>window.onload=()=>{window.print();}</script></body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  };

  const filtered = orders.filter(o => {
    const s = search.toLowerCase();
    return (filterStatus === 'all' || o.trang_thai === filterStatus)
      && (!s || o.ma_don_hang?.toLowerCase().includes(s) || o.nguoiMua?.ho_ten?.toLowerCase().includes(s));
  });

  const totalRevenue = orders.filter(o => o.trang_thai === 'da_giao').reduce((s, o) => s+(+o.tong_tien||0), 0);
  const TABS = [
    { key:'all', label:'Tất cả' }, { key:'cho_tt', label:'Chờ TT' }, { key:'da_tt', label:'Đã TT' },
    { key:'dang_giao', label:'Đang giao' }, { key:'da_giao', label:'Đã giao' }, { key:'da_huy', label:'Đã hủy' },
  ];
  const btn = (bg, color='#fff') => ({ padding:'8px 16px', background:bg, color, border:'none', borderRadius:8, fontWeight:600, cursor:'pointer', fontSize:13, fontFamily:'system-ui', display:'inline-flex', alignItems:'center', gap:6 });
  const btnOutline = (color) => ({ padding:'6px 10px', background:'transparent', color, border:`1px solid ${color}`, borderRadius:6, fontWeight:600, cursor:'pointer', fontSize:12, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:4 });
  const lbl = { display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:5 };
  const inp = { padding:'10px 12px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:14, width:'100%', boxSizing:'border-box' };

  return (
    <div style={{ fontFamily:'system-ui', padding:24 }}>
      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20, borderBottom:'2px solid #f3f4f6', paddingBottom:12, flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setFilterStatus(t.key)} style={{
            padding:'8px 16px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:600, fontSize:13,
            background: filterStatus===t.key ? '#e11d48' : '#f3f4f6',
            color: filterStatus===t.key ? '#fff' : '#374151'
          }}>
            {t.label}
            <span style={{ marginLeft:6, background: filterStatus===t.key?'rgba(255,255,255,0.3)':'#e5e7eb', padding:'1px 7px', borderRadius:12, fontSize:11 }}>
              {t.key==='all' ? stats.all : (stats[t.key]||0)}
            </span>
          </button>
        ))}
      </div>

      {/* Action bar */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <input placeholder="🔍 Tìm đơn hàng..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding:'9px 14px', borderRadius:8, border:'1px solid #e5e7eb', fontSize:14, outline:'none', width:240 }} />
        <div style={{ flex:1 }} />
        <button onClick={handleApproveAll} style={btn('#10b981')}>✅ Duyệt tất cả</button>
        <button onClick={handleBackfill} style={btn('#f59e0b')}>🔄 Đồng bộ HH</button>
        <button onClick={handleFixCapDo} style={btn('#8b5cf6')}>🔧 Fix F1/F2/F3</button>
      </div>

      {/* Stats */}
      <div style={{ display:'flex', gap:14, marginBottom:20 }}>
        {[
          { label:'Tổng đơn', value:stats.all, color:'#3b82f6' },
          { label:'Doanh thu đã giao', value:fmt(totalRevenue), color:'#10b981' },
          { label:'Đã giao', value:stats.da_giao||0, color:'#8b5cf6' },
          { label:'Chờ TT', value:stats.cho_tt||0, color:'#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ background:'#fff', borderRadius:12, padding:'16px 20px', boxShadow:'0 2px 8px rgba(0,0,0,0.07)', flex:1, borderLeft:`4px solid ${s.color}` }}>
            <div style={{ fontSize:12, color:'#888', marginBottom:4, fontWeight:600 }}>{s.label}</div>
            <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 2px 8px rgba(0,0,0,0.07)', overflow:'auto' }}>
        {loading ? <div style={{ padding:40, textAlign:'center', color:'#888' }}>Đang tải...</div> : (
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900 }}>
            <thead>
              <tr style={{ background:'#ef4444' }}>
                {['Mã đơn','Khách hàng','CTV giới thiệu','Tổng tiền','Giảm giá','Thanh toán','Trạng thái','Ngày','Thao tác'].map(h => (
                  <th key={h} style={{ padding:'11px 12px', textAlign:'center', fontSize:12, color:'#fff', fontWeight:700, whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id} style={{ borderTop:'1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                  <td style={{ padding:'11px 12px', fontWeight:700, color:'#1a1a2e', fontSize:12 }}>{o.ma_don_hang}</td>
                  <td style={{ padding:'11px 12px' }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{o.nguoiMua?.ho_ten || 'Khách vãng lai'}</div>
                    <div style={{ fontSize:11, color:'#9ca3af' }}>{o.nguoiMua?.sdt || o.nguoiMua?.email}</div>
                  </td>
                  <td style={{ padding:'11px 12px', fontSize:13, color:'#374151' }}>{getCTVName(o)}</td>
                  <td style={{ padding:'11px 12px', fontWeight:700, fontSize:13, color:'#111827' }}>{fmt(o.tong_tien)}</td>
                  <td style={{ padding:'11px 12px', fontSize:13, color:'#e11d48' }}>{o.giam_gia > 0 ? `-${fmt(o.giam_gia)}` : '—'}</td>
                  <td style={{ padding:'11px 12px', fontSize:12, color:'#6b7280' }}>{PAYMENT_MAP[o.phuong_thuc_tt] || o.phuong_thuc_tt}</td>
                  <td style={{ padding:'11px 12px' }}>
                    <select value={o.trang_thai} onChange={e => handleQuickStatusChange(o.id, e.target.value)}
                      style={{ padding:'5px 8px', borderRadius:6, border:'1px solid #e5e7eb', fontSize:12, fontWeight:600,
                        background:(STATUS_CFG[o.trang_thai]||{}).color+'22', color:(STATUS_CFG[o.trang_thai]||{}).color, cursor:'pointer' }}>
                      {STATUS_OPTIONS.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                    </select>
                  </td>
                  <td style={{ padding:'11px 12px', fontSize:12, color:'#9ca3af', whiteSpace:'nowrap' }}>{fmtDate(o.created_at)}</td>
                  <td style={{ padding:'11px 12px' }}>
                    <div style={{ display:'flex', gap:5 }}>
                      <button onClick={() => handleViewDetail(o.id)} style={btnOutline('#3b82f6')}><IconEye /> Xem</button>
                      <button onClick={() => handleDelete(o.id)} style={btnOutline('#e11d48')}><IconTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={9} style={{ padding:32, textAlign:'center', color:'#9ca3af' }}>Không có đơn hàng</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {showDetail && selectedOrder && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div style={{ background:'#fff', borderRadius:16, padding:28, width:'90%', maxWidth:800, maxHeight:'90vh', overflow:'auto', boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:'#111827' }}>📦 Chi tiết đơn hàng</div>
                <div style={{ fontSize:13, color:'#e11d48', fontWeight:700, marginTop:2 }}>{selectedOrder.ma_don_hang}</div>
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <button onClick={handlePrint} style={btn('#e11d48')}><IconPrint /> In hóa đơn</button>
                <button onClick={() => setShowDetail(false)} style={{ background:'none', border:'none', fontSize:24, cursor:'pointer', color:'#9ca3af' }}>×</button>
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div style={{ background:'#f0fdf4', borderRadius:12, padding:'16px 20px', marginBottom:16, border:'1px solid #86efac' }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#166534', marginBottom:12 }}>👤 THÔNG TIN KHÁCH HÀNG</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <div style={{ fontSize:11, color:'#15803d', marginBottom:2 }}>Họ tên</div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{selectedOrder.nguoiMua?.ho_ten || 'Khách vãng lai'}</div>
                </div>
                <div>
                  <div style={{ fontSize:11, color:'#15803d', marginBottom:2 }}>Số điện thoại</div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{selectedOrder.nguoiMua?.sdt || '—'}</div>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <div style={{ fontSize:11, color:'#15803d', marginBottom:2 }}>Địa chỉ giao hàng</div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{selectedOrder.dia_chi_giao || selectedOrder.nguoiMua?.dia_chi || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize:11, color:'#15803d', marginBottom:2 }}>Email</div>
                  <div style={{ fontSize:13 }}>{selectedOrder.nguoiMua?.email || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize:11, color:'#15803d', marginBottom:2 }}>CTV giới thiệu</div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{getCTVName(selectedOrder)}</div>
                </div>
              </div>
            </div>

            {/* Sản phẩm */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:10 }}>📚 DANH SÁCH SẢN PHẨM</div>
              <table style={{ width:'100%', borderCollapse:'collapse', borderRadius:8, overflow:'hidden' }}>
                <thead>
                  <tr style={{ background:'#f3f4f6' }}>
                    {['STT','Tên sản phẩm','Đơn giá','SL','Thành tiền'].map((h,i) => (
                      <th key={h} style={{ padding:'9px 12px', textAlign:i>=2?'right':'left', fontSize:12, color:'#6b7280', fontWeight:600, border:'1px solid #e5e7eb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(selectedOrder.chiTiets||[]).length === 0 ? (
                    <tr><td colSpan={5} style={{ padding:16, textAlign:'center', color:'#9ca3af', fontSize:13 }}>Không có sản phẩm</td></tr>
                  ) : (selectedOrder.chiTiets||[]).map((item, i) => (
                    <tr key={i} style={{ borderTop:'1px solid #e5e7eb' }}>
                      <td style={{ padding:'9px 12px', fontSize:13, color:'#9ca3af', border:'1px solid #e5e7eb' }}>{i+1}</td>
                      <td style={{ padding:'9px 12px', fontSize:14, fontWeight:600, border:'1px solid #e5e7eb' }}>
                        <div>{item.sach?.ten_sach || '—'}</div>
                        {item.sach?.tac_gia && <div style={{ fontSize:11, color:'#9ca3af' }}>Tác giả: {item.sach.tac_gia}</div>}
                      </td>
                      <td style={{ padding:'9px 12px', fontSize:13, textAlign:'right', border:'1px solid #e5e7eb' }}>{fmt(item.gia_sp)}</td>
                      <td style={{ padding:'9px 12px', fontSize:13, textAlign:'center', fontWeight:700, color:'#8b5cf6', border:'1px solid #e5e7eb' }}>{item.so_luong}</td>
                      <td style={{ padding:'9px 12px', fontSize:13, fontWeight:800, color:'#10b981', textAlign:'right', border:'1px solid #e5e7eb' }}>{fmt(item.thanh_tien)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tổng tiền */}
            <div style={{ display:'flex', gap:12, marginBottom:16 }}>
              <div style={{ flex:1, background:'#f9fafb', borderRadius:10, padding:'12px 16px' }}>
                <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3 }}>Tổng tiền gốc</div>
                <div style={{ fontWeight:800, fontSize:17 }}>{fmt(selectedOrder.tong_tien_goc || selectedOrder.tong_tien)}</div>
              </div>
              <div style={{ flex:1, background:'#fef2f2', borderRadius:10, padding:'12px 16px', border:'1px solid #fecaca' }}>
                <div style={{ fontSize:11, color:'#dc2626', marginBottom:3 }}>Giảm giá</div>
                <div style={{ fontWeight:800, fontSize:17, color:'#dc2626' }}>-{fmt(selectedOrder.giam_gia||0)}</div>
              </div>
              <div style={{ flex:1, background:'#dcfce7', borderRadius:10, padding:'12px 16px', border:'1px solid #bbf7d0' }}>
                <div style={{ fontSize:11, color:'#16a34a', marginBottom:3 }}>Thành tiền</div>
                <div style={{ fontWeight:800, fontSize:17, color:'#16a34a' }}>{fmt(selectedOrder.tong_tien)}</div>
              </div>
            </div>

            {/* Thanh toán & ghi chú */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              <div style={{ background:'#f9fafb', borderRadius:10, padding:'12px 16px' }}>
                <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3 }}>Phương thức thanh toán</div>
                <div style={{ fontWeight:700, fontSize:14 }}>{PAYMENT_MAP[selectedOrder.phuong_thuc_tt] || selectedOrder.phuong_thuc_tt}</div>
              </div>
              <div style={{ background:'#f9fafb', borderRadius:10, padding:'12px 16px' }}>
                <div style={{ fontSize:11, color:'#9ca3af', marginBottom:3 }}>Ghi chú</div>
                <div style={{ fontSize:13 }}>{selectedOrder.ghi_chu || '—'}</div>
              </div>
            </div>

            {/* Đổi trạng thái */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', paddingTop:16, borderTop:'1px solid #f3f4f6' }}>
              <span style={{ fontSize:13, color:'#6b7280', fontWeight:600 }}>Đổi trạng thái:</span>
              {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                <button key={key} onClick={() => handleQuickStatusChange(selectedOrder.id, key)}
                  disabled={selectedOrder.trang_thai === key}
                  style={{ padding:'6px 14px', background: selectedOrder.trang_thai===key?'#f3f4f6':cfg.color+'22', color: selectedOrder.trang_thai===key?'#9ca3af':cfg.color, border:`1px solid ${cfg.color}44`, borderRadius:8, fontWeight:600, cursor: selectedOrder.trang_thai===key?'default':'pointer', fontSize:12 }}>
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
