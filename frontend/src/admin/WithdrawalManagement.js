import { useState, useEffect } from 'react';
import { fetchAllWithdrawals, approveWithdrawal, rejectWithdrawal, getWithdrawalQR } from '../api';

const fmt = n => Number(n||0).toLocaleString('vi-VN') + ' đ';
const fmtDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '—';

const STATUS_CFG = {
  cho_duyet: { color: '#f59e0b', text: 'Chờ duyệt' },
  da_duyet: { color: '#10b981', text: 'Đã duyệt' },
  da_tu_choi: { color: '#e11d48', text: 'Từ chối' },
};

const badge = (text, color) => (
  <span style={{ background: color+'22', color, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{text}</span>
);

const maskAccount = (acc) => {
  if (!acc || acc.length < 4) return acc;
  return '****' + acc.slice(-4);
};

export default function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [rejectModal, setRejectModal] = useState({ show: false, id: null, reason: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const d = await fetchAllWithdrawals();
      setWithdrawals(d.data || d.withdrawals || []);
    } catch { setWithdrawals([]); } finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Duyệt yêu cầu rút tiền này?')) return;
    try {
      const result = await approveWithdrawal(id);
      const data = result?.data || result;
      // Nếu là MoMo và có QR → hiện QR cho admin quét chuyển tiền
      if (data?.qr_url || data?.method === 'momo') {
        const w = withdrawals.find(x => x.id === id);
        const soTien = w ? w.so_tien - (w.phi_rut || 1000) : 0;
        const soTk = w?.so_tk_ngan_hang || '';
        const tenTk = w?.ten_chu_tk || '';
        const qrUrl = data?.qr_url || `https://img.vietqr.io/image/MOMO-${soTk}-compact2.png?amount=${soTien}&addInfo=${encodeURIComponent('Rut tien CTV ' + tenTk)}&accountName=${encodeURIComponent(tenTk)}`;
        setQrData({
          qr_url: qrUrl,
          ngan_hang: 'MoMo',
          so_tai_khoan: soTk,
          ten_tai_khoan: tenTk,
          so_tien: soTien,
          noi_dung: `Rut tien CTV ${tenTk}`,
        });
        setShowQR(true);
      }
      load();
    } catch (e) {
      alert('Lỗi duyệt: ' + e.message);
    }
  };

  const handleReject = async () => {
    await rejectWithdrawal(rejectModal.id, rejectModal.reason);
    setRejectModal({ show: false, id: null, reason: '' });
    load();
  };

  const handleShowQR = async (id) => {
    const d = await getWithdrawalQR(id);
    setQrData(d.data || d);
    setShowQR(true);
  };

  const filtered = withdrawals.filter(w => {
    const s = search.toLowerCase();
    const matchSearch = !s || w.ho_ten?.toLowerCase().includes(s) || w.email?.toLowerCase().includes(s);
    const matchFilter = filter === 'all' || w.trang_thai === filter;
    return matchSearch && matchFilter;
  });

  const stats = {
    cho: { count: withdrawals.filter(w => w.trang_thai==='cho_duyet').length, total: withdrawals.filter(w => w.trang_thai==='cho_duyet').reduce((s,w) => s+(+w.so_tien||0), 0) },
    da_duyet: { count: withdrawals.filter(w => w.trang_thai==='da_duyet').length, total: withdrawals.filter(w => w.trang_thai==='da_duyet').reduce((s,w) => s+(+w.so_tien||0), 0) },
    tu_choi: { count: withdrawals.filter(w => w.trang_thai==='da_tu_choi').length, total: withdrawals.filter(w => w.trang_thai==='da_tu_choi').reduce((s,w) => s+(+w.so_tien||0), 0) },
  };

  const TABS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'cho_duyet', label: 'Chờ duyệt' },
    { key: 'da_duyet', label: 'Đã duyệt' },
    { key: 'da_tu_choi', label: 'Từ chối' },
  ];

  const btn = (bg, color='#fff') => ({ padding: '6px 12px', background: bg, color, border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: 'system-ui' });

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>💸 Quản lý rút tiền</h2>
        <div style={{ flex: 1 }} />
        <input placeholder="🔍 Tìm CTV..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', width: 200 }} />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '2px solid #f3f4f6', paddingBottom: 12 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)} style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
            background: filter===t.key ? '#e11d48' : '#f3f4f6', color: filter===t.key ? '#fff' : '#374151', fontFamily: 'system-ui'
          }}>{t.label}</button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Chờ duyệt', count: stats.cho.count, total: stats.cho.total, color: '#f59e0b' },
          { label: 'Đã duyệt', count: stats.da_duyet.count, total: stats.da_duyet.total, color: '#10b981' },
          { label: 'Từ chối', count: stats.tu_choi.count, total: stats.tu_choi.total, color: '#e11d48' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', flex: 1, borderLeft: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.count} <span style={{ fontSize: 13, fontWeight: 500, color: '#9ca3af' }}>yêu cầu</span></div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', marginTop: 4 }}>{fmt(s.total)}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'auto' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#ef4444' }}>
                {['STT','CTV','Ngân hàng','Phương thức','Số tiền','Phí','Thực nhận','Trạng thái','Ngày YC','Thao tác'].map(h => (
                  <th key={h} style={{ padding: '11px 12px', textAlign: 'center', fontSize: 12, color: '#ffffff', fontWeight: 600, whiteSpace: 'nowrap', textShadow: '0 1px 2px rgba(0,0,0,0.2)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((w, i) => (
                <tr key={w.id} style={{ borderTop: '1px solid #f3f4f6' }}
                  onMouseEnter={e => e.currentTarget.style.background='#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.background='#fff'}>
                  <td style={{ padding: '11px 12px', color: '#9ca3af', fontSize: 13 }}>{i+1}</td>
                  <td style={{ padding: '11px 12px' }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{w.ctv?.nguoiDung?.ho_ten || w.ho_ten || 'N/A'}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>CTV ID: {w.ctv_id}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>{w.ctv?.nguoiDung?.email || w.email}</div>
                  </td>
                  <td style={{ padding: '11px 12px', fontSize: 13 }}>
                    <div>{w.ten_ngan_hang || w.ngan_hang}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'monospace' }}>{maskAccount(w.so_tai_khoan)}</div>
                  </td>
                  <td style={{ padding: '11px 12px' }}>
                    {badge(w.phuong_thuc==='momo'?'MoMo':'Bank', w.phuong_thuc==='momo'?'#e11d48':'#3b82f6')}
                  </td>
                  <td style={{ padding: '11px 12px', fontWeight: 800, fontSize: 14, color: '#111827', whiteSpace: 'nowrap' }}>
                    {fmt(w.so_tien)}
                  </td>
                  <td style={{ padding: '11px 12px', color: '#e11d48', fontSize: 13, whiteSpace: 'nowrap' }}>
                    {fmt(w.phi_rut || 0)}
                  </td>
                  <td style={{ padding: '11px 12px', fontWeight: 800, fontSize: 14, color: '#10b981', whiteSpace: 'nowrap', background: '#f0fdf4' }}>
                    {fmt((+w.so_tien||0)-(+w.phi_rut||0))}
                  </td>
                  <td style={{ padding: '11px 12px' }}>{badge((STATUS_CFG[w.trang_thai]||{text:w.trang_thai}).text, (STATUS_CFG[w.trang_thai]||{color:'#6b7280'}).color)}</td>
                  <td style={{ padding: '11px 12px', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap' }}>{fmtDate(w.ngay_yeu_cau)}</td>
                  <td style={{ padding: '11px 12px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
                      {w.trang_thai === 'cho_duyet' && <>
                        <button onClick={() => handleApprove(w.id)} style={btn('#10b981')}>✅</button>
                        <button onClick={() => setRejectModal({ show: true, id: w.id, reason: '' })} style={btn('#e11d48')}>❌</button>
                      </>}
                      <button onClick={() => handleShowQR(w.id)} style={btn('#3b82f6')}>QR</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={10} style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>Không có dữ liệu</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.show && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 16px' }}>❌ Từ chối yêu cầu</h3>
            <label style={{ fontSize: 13, color: '#374151', display: 'block', marginBottom: 6 }}>Lý do từ chối</label>
            <textarea rows={4} value={rejectModal.reason} onChange={e => setRejectModal(p => ({ ...p, reason: e.target.value }))}
              placeholder="Nhập lý do..." style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setRejectModal({ show: false, id: null, reason: '' })} style={btn('#f3f4f6','#374151')}>Hủy</button>
              <button onClick={handleReject} style={btn('#e11d48')}>Xác nhận từ chối</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal — Admin quét để chuyển tiền MoMo cho CTV */}
      {showQR && qrData && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 400, boxShadow: '0 8px 40px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#7c3aed' }}>📱 Quét QR chuyển tiền MoMo</h3>
              <button onClick={() => setShowQR(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9ca3af' }}>×</button>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Mở app MoMo → Quét mã → Xác nhận chuyển tiền cho CTV</div>
            {qrData.qr_url && (
              <div style={{ background: '#faf5ff', border: '2px solid #e9d5ff', borderRadius: 12, padding: 16, marginBottom: 16, display: 'inline-block' }}>
                <img src={qrData.qr_url} alt="QR MoMo"
                  style={{ width: 220, height: 220, borderRadius: 8, display: 'block' }}
                  onError={e => { e.target.style.display = 'none'; e.target.parentNode.innerHTML += '<div style="color:#9ca3af;padding:40px 20px;font-size:13px">QR không tải được.<br/>Dùng thông tin bên dưới để chuyển thủ công.</div>'; }} />
              </div>
            )}
            <div style={{ textAlign: 'left', background: '#f9fafb', borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 16 }}>
              {[['Số MoMo', qrData.so_tai_khoan], ['Tên TK', qrData.ten_tai_khoan], ['Số tiền', fmt(qrData.so_tien)], ['Nội dung', qrData.noi_dung]].map(([k, v]) => v && (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#9ca3af' }}>{k}:</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#92400e' }}>
              Sau khi chuyển tiền xong, CTV sẽ nhận được thông báo từ MoMo.
            </div>
            <button onClick={() => setShowQR(false)}
              style={{ width: '100%', padding: '12px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Đã chuyển tiền xong
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
