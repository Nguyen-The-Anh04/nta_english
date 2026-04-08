import { useState, useEffect } from 'react';
import { hvPortalAPI } from '../api';
import { login } from '../api';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => (Number(n) || 0).toLocaleString('vi-VN') + 'đ';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const loaiBaiLabel = { homework: 'Bài tập', speaking: 'Speaking', writing: 'Writing' };
const trangThaiDiemDanh = {
  co_mat: { label: 'Có mặt', color: '#27ae60' },
  tre:    { label: 'Đi trễ',  color: '#f39c12' },
  vang_mat: { label: 'Vắng', color: '#e74c3c' },
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'error' ? '#e74c3c' : '#27ae60',
          color: '#fff', padding: '10px 18px', borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,.2)', fontSize: 14, minWidth: 220,
        }}>{t.msg}</div>
      ))}
    </div>
  );
}

// ── Star Rating ───────────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <span key={i} onClick={() => onChange(i)}
          style={{ fontSize: 24, cursor: 'pointer', color: i <= value ? '#f1c40f' : '#ccc' }}>★</span>
      ))}
    </span>
  );
}

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    
    // Demo accounts for student portal
    const demoStudents = {
      "hocvien@nta.com": { id: 1, ho_ten: "Nguyễn Văn Học Viên", email: "hocvien@nta.com", chuc_vu_id: 5 },
      "phuhuynh@nta.com": { id: 2, ho_ten: "Phụ huynh học viên", email: "phuhuynh@nta.com", chuc_vu_id: 5 },
    };
    
    // Check demo accounts first (password: admin123)
    if (demoStudents[email] && password === "admin123") {
      const user = demoStudents[email];
      localStorage.setItem('hv_token', 'demo_token_' + Date.now());
      localStorage.setItem('hv_user', JSON.stringify(user));
      localStorage.setItem('chuc_vu_id', '5');
      localStorage.setItem('user_name', user.ho_ten);
      onLogin(user, 'demo_token');
      setLoading(false);
      return;
    }
    
    // Otherwise, try API login
    try {
      const res = await login(email, password);
      if (res.token) {
        localStorage.setItem('hv_token', res.token);
        localStorage.setItem('hv_user', JSON.stringify(res.user));
        onLogin(res.user, res.token);
      } else {
        setErr(res.message || 'Đăng nhập thất bại');
      }
    } catch {
      setErr('Lỗi kết nối máy chủ');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', borderRadius: 12, padding: '40px 36px',
        boxShadow: '0 4px 24px rgba(0,0,0,.1)', width: 360,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40 }}>🎓</div>
          <h2 style={{ margin: '8px 0 4px', color: '#1e3a5f' }}>Portal Học Viên</h2>
          <p style={{ color: '#888', fontSize: 13, margin: 0 }}>Đăng nhập để tiếp tục</p>
        </div>
        {err && <div style={{ background: '#fdecea', color: '#e74c3c', padding: '8px 12px', borderRadius: 6, marginBottom: 14, fontSize: 13 }}>{err}</div>}
        <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="email" required
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, marginBottom: 14, fontSize: 14, boxSizing: 'border-box' }} />
        <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Mật khẩu</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" required
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, marginBottom: 20, fontSize: 14, boxSizing: 'border-box' }} />
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '10px', background: '#1e3a5f', color: '#fff',
          border: 'none', borderRadius: 6, fontSize: 15, cursor: 'pointer', fontWeight: 600,
        }}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        
        {/* Demo accounts info */}
        <div style={{ marginTop: 16, padding: 12, background: '#f5f6fa', borderRadius: 6, fontSize: 11, color: '#666', textAlign: 'center' }}>
          <strong>📌 Demo:</strong> hocvien@nta.com hoặc phuhuynh@nta.com<br/>
          <strong>Mật khẩu:</strong> admin123
        </div>
      </form>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const MENU = [
  { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { key: 'lop-hoc',   icon: '📚', label: 'Lớp học' },
  { key: 'bai-tap',   icon: '📝', label: 'Bài tập' },
  { key: 'diem-so',   icon: '📊', label: 'Điểm số' },
  { key: 'diem-danh', icon: '📋', label: 'Điểm danh' },
  { key: 'hoc-phi',   icon: '💰', label: 'Học phí' },
  { key: 'danh-gia',  icon: '⭐', label: 'Đánh giá GV' },
];

function Sidebar({ user, tab, setTab, onLogout, open, setOpen }) {
  const sideStyle = {
    width: 220, background: '#1e3a5f', color: '#fff',
    display: 'flex', flexDirection: 'column', minHeight: '100vh',
    position: 'fixed', top: 0, left: open ? 0 : -220,
    transition: 'left .25s', zIndex: 200,
  };
  return (
    <>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 199 }} />}
      <div style={sideStyle}>
        <div style={{ padding: '24px 16px 16px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#3a6ea5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 8 }}>
            {(user?.ho_ten || 'U')[0].toUpperCase()}
          </div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.ho_ten || 'Học viên'}</div>
          <div style={{ fontSize: 12, opacity: .7 }}>{user?.email}</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {MENU.map(m => (
            <div key={m.key} onClick={() => { setTab(m.key); setOpen(false); }}
              style={{
                padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                background: tab === m.key ? 'rgba(255,255,255,.15)' : 'transparent',
                borderLeft: tab === m.key ? '3px solid #5dade2' : '3px solid transparent',
                fontSize: 14, transition: 'background .15s',
              }}>
              <span>{m.icon}</span><span>{m.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px' }}>
          <button onClick={onLogout} style={{
            width: '100%', padding: '8px', background: 'rgba(255,255,255,.1)',
            color: '#fff', border: '1px solid rgba(255,255,255,.2)', borderRadius: 6,
            cursor: 'pointer', fontSize: 13,
          }}>🚪 Đăng xuất</button>
        </div>
      </div>
    </>
  );
}

// ── Tab: Dashboard ────────────────────────────────────────────────────────────
function TabDashboard({ user, data, loading }) {
  const d = data || {};
  const stats = [
    { label: 'Lớp đang học',       value: d.lop_dang_hoc ?? '—',       color: '#3498db' },
    { label: 'Bài tập chưa nộp',   value: d.bai_tap_chua_nop ?? '—',   color: '#e67e22' },
    { label: 'Có mặt tháng này',   value: d.co_mat_thang ?? '—',       color: '#27ae60' },
    { label: 'Vắng mặt tháng này', value: d.vang_mat_thang ?? '—',     color: '#e74c3c' },
  ];
  const diemGanNhat = d.diem_gan_nhat || [];
  const lichHoc = (d.lop_hoc || []).flatMap(lh =>
    (lh.lopHoc?.lichHocs || []).map(l => ({ ...l, tenLop: lh.lopHoc?.ten_lop }))
  );

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div>;
  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: '#1e3a5f' }}>Xin chào, {user?.ho_ten}! 👋</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,.07)', borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,.07)', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', color: '#1e3a5f', fontSize: 15 }}>📊 Điểm gần nhất</h3>
        {diemGanNhat.length === 0 ? <p style={{ color: '#aaa', fontSize: 13 }}>Chưa có điểm</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: '#f5f6fa' }}>
              {['Bài tập','Loại','Điểm','Band','Nhận xét','Ngày chấm'].map(h => (
                <th key={h} style={{ padding: '7px 10px', textAlign: 'left', color: '#555', fontWeight: 600 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{diemGanNhat.map((d, i) => (
              <tr key={i} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '7px 10px' }}>{d.baiTap?.ten_bai || '—'}</td>
                <td style={{ padding: '7px 10px' }}>{loaiBaiLabel[d.baiTap?.loai] || d.baiTap?.loai}</td>
                <td style={{ padding: '7px 10px', fontWeight: 600, color: d.diem >= 7 ? '#27ae60' : d.diem >= 5 ? '#e67e22' : '#e74c3c' }}>{d.diem ?? '—'}</td>
                <td style={{ padding: '7px 10px' }}>{d.band_score ?? '—'}</td>
                <td style={{ padding: '7px 10px', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nhan_xet || '—'}</td>
                <td style={{ padding: '7px 10px' }}>{fmtDate(d.ngay_cham)}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,.07)' }}>
        <h3 style={{ margin: '0 0 12px', color: '#1e3a5f', fontSize: 15 }}>📅 Lịch học tuần này</h3>
        {lichHoc.length === 0 ? <p style={{ color: '#aaa', fontSize: 13 }}>Không có lịch học</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lichHoc.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f5f6fa', borderRadius: 6, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: '#1e3a5f', minWidth: 60 }}>{l.thu}</span>
                <span>{l.gio_bat_dau} – {l.gio_ket_thuc}</span>
                <span style={{ color: '#888' }}>{l.tenLop}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab: Lớp học ──────────────────────────────────────────────────────────────
function TabLopHoc({ data, loading }) {
  const list = data || [];
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div>;
  if (!list.length) return <p style={{ color: '#aaa' }}>Chưa có lớp học nào.</p>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
      {list.map((item, i) => {
        const lh = item.lopHoc || item;
        const lich = lh.lichHocs || [];
        const trangThai = lh.trang_thai || 'dang_hoc';
        const badgeColor = trangThai === 'dang_hoc' ? '#27ae60' : trangThai === 'ket_thuc' ? '#95a5a6' : '#e67e22';
        return (
          <div key={i} style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: 16 }}>{lh.khoaHoc?.ten_khoa || lh.ten_lop}</h3>
              <span style={{ background: badgeColor, color: '#fff', fontSize: 11, padding: '2px 8px', borderRadius: 10 }}>{trangThai}</span>
            </div>
            <div style={{ fontSize: 13, color: '#666', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span>🏷️ Mã lớp: <b>{lh.ma_lop || '—'}</b></span>
              <span>👨‍🏫 Giảng viên: <b>{lh.giangVien?.ho_ten || '—'}</b></span>
              <span>🏫 Phòng học: <b>{lh.phong_hoc || '—'}</b></span>
              <span>📅 {fmtDate(lh.ngay_bat_dau)} → {fmtDate(lh.ngay_ket_thuc)}</span>
            </div>
            {lich.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Lịch học:</div>
                {lich.map((l, j) => (
                  <div key={j} style={{ fontSize: 12, background: '#f5f6fa', borderRadius: 4, padding: '3px 8px', marginBottom: 3 }}>
                    {l.thu} · {l.gio_bat_dau}–{l.gio_ket_thuc}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Bài tập ──────────────────────────────────────────────────────────────
function TabBaiTap({ data, loading, addToast, reload }) {
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null); // { baiTapId }
  const [ghiChu, setGhiChu] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const list = data || [];
  const filtered = list.filter(b => {
    if (filter === 'chua_nop') return !b.nopBai;
    if (filter === 'da_nop') return !!b.nopBai;
    if (filter === 'co_diem') return b.nopBai?.diem != null;
    return true;
  });

  const handleNopBai = async () => {
    setSubmitting(true);
    try {
      await hvPortalAPI.nopBai({ bai_tap_id: modal.baiTapId, ghi_chu: ghiChu });
      addToast('Nộp bài thành công!');
      setModal(null); setGhiChu('');
      reload('bai-tap');
    } catch { addToast('Lỗi khi nộp bài', 'error'); }
    finally { setSubmitting(false); }
  };

  const FILTERS = [['all','Tất cả'],['chua_nop','Chưa nộp'],['da_nop','Đã nộp'],['co_diem','Có điểm']];
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div>;
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 13,
            background: filter === k ? '#1e3a5f' : '#e8ecf0', color: filter === k ? '#fff' : '#555',
          }}>{l}</button>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr style={{ background: '#f5f6fa' }}>
            {['Tên bài','Lớp','Loại','Hạn nộp','Trạng thái','Điểm',''].map(h => (
              <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#555', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{filtered.map((b, i) => {
            const conHan = b.han_nop && new Date(b.han_nop) > new Date();
            const daNop = !!b.nopBai;
            const coDiem = b.nopBai?.diem != null;
            return (
              <tr key={i} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: '9px 12px', fontWeight: 500 }}>{b.ten_bai}</td>
                <td style={{ padding: '9px 12px', color: '#666' }}>{b.lopHoc?.ten_lop || '—'}</td>
                <td style={{ padding: '9px 12px' }}>{loaiBaiLabel[b.loai] || b.loai}</td>
                <td style={{ padding: '9px 12px', color: conHan ? '#27ae60' : '#e74c3c' }}>{fmtDate(b.han_nop)}</td>
                <td style={{ padding: '9px 12px' }}>
                  {daNop ? <span style={{ background: '#eafaf1', color: '#27ae60', padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>✅ Đã nộp</span>
                         : <span style={{ background: '#fef9e7', color: '#e67e22', padding: '2px 8px', borderRadius: 10, fontSize: 12 }}>⏳ Chưa nộp</span>}
                </td>
                <td style={{ padding: '9px 12px' }}>
                  {coDiem ? <span style={{ fontWeight: 600, color: b.nopBai.diem >= 7 ? '#27ae60' : b.nopBai.diem >= 5 ? '#e67e22' : '#e74c3c' }}>
                    {b.nopBai.diem} {b.nopBai.band_score ? `(${b.nopBai.band_score})` : ''}
                  </span> : '—'}
                </td>
                <td style={{ padding: '9px 12px' }}>
                  {!daNop && conHan && (
                    <button onClick={() => { setModal({ baiTapId: b.id }); setGhiChu(''); }} style={{
                      padding: '4px 10px', background: '#1e3a5f', color: '#fff', border: 'none',
                      borderRadius: 5, cursor: 'pointer', fontSize: 12,
                    }}>📤 Nộp bài</button>
                  )}
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 380, boxShadow: '0 4px 24px rgba(0,0,0,.15)' }}>
            <h3 style={{ margin: '0 0 14px', color: '#1e3a5f' }}>📤 Nộp bài</h3>
            <textarea value={ghiChu} onChange={e => setGhiChu(e.target.value)} placeholder="Ghi chú (tuỳ chọn)..."
              style={{ width: '100%', height: 100, padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={() => setModal(null)} style={{ padding: '7px 16px', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', background: '#fff' }}>Hủy</button>
              <button onClick={handleNopBai} disabled={submitting} style={{ padding: '7px 16px', background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                {submitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Điểm số ──────────────────────────────────────────────────────────────
function TabDiemSo({ data, loading }) {
  const list = data || [];
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div>;
  if (!list.length) return <p style={{ color: '#aaa' }}>Chưa có điểm nào.</p>;

  // Group by khoaHoc.ten_khoa
  const groups = {};
  list.forEach(d => {
    const key = d.baiTap?.lopHoc?.khoaHoc?.ten_khoa || d.baiTap?.lopHoc?.ten_lop || 'Khác';
    if (!groups[key]) groups[key] = [];
    groups[key].push(d);
  });

  const diemColor = (v) => v >= 7 ? '#27ae60' : v >= 5 ? '#e67e22' : '#e74c3c';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Object.entries(groups).map(([ten, items]) => {
        const tb = items.filter(d => d.diem != null).reduce((s, d, _, a) => s + d.diem / a.length, 0);
        return (
          <div key={ten} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}>
            <div style={{ background: '#1e3a5f', color: '#fff', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{ten}</span>
              {items.some(d => d.diem != null) && (
                <span style={{ fontSize: 13, background: 'rgba(255,255,255,.15)', padding: '2px 10px', borderRadius: 10 }}>
                  TB: <b style={{ color: diemColor(tb) === '#27ae60' ? '#a8e6cf' : diemColor(tb) === '#e67e22' ? '#ffd89b' : '#ffb3b3' }}>{tb.toFixed(1)}</b>
                </span>
              )}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ background: '#f5f6fa' }}>
                {['Bài tập','Loại','Điểm','Band','Nhận xét','Ngày chấm'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#555', fontWeight: 600 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{items.map((d, i) => (
                <tr key={i} style={{ borderTop: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '8px 12px' }}>{d.baiTap?.ten_bai || '—'}</td>
                  <td style={{ padding: '8px 12px' }}>{loaiBaiLabel[d.baiTap?.loai] || d.baiTap?.loai}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: d.diem != null ? diemColor(d.diem) : '#aaa' }}>{d.diem ?? '—'}</td>
                  <td style={{ padding: '8px 12px' }}>{d.band_score ?? '—'}</td>
                  <td style={{ padding: '8px 12px', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nhan_xet || '—'}</td>
                  <td style={{ padding: '8px 12px' }}>{fmtDate(d.ngay_cham)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Điểm danh ────────────────────────────────────────────────────────────
function TabDiemDanh({ data, loading }) {
  const list = data || [];
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div>;
  if (!list.length) return <p style={{ color: '#aaa' }}>Chưa có dữ liệu điểm danh.</p>;

  // Group by lop
  const groups = {};
  list.forEach(d => {
    const key = d.lopHoc?.ten_lop || d.lop_hoc_id || 'Lớp';
    if (!groups[key]) groups[key] = [];
    groups[key].push(d);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Object.entries(groups).map(([tenLop, items]) => {
        const co_mat = items.filter(d => d.trang_thai === 'co_mat').length;
        const tre = items.filter(d => d.trang_thai === 'tre').length;
        const vang = items.filter(d => d.trang_thai === 'vang_mat').length;
        const total = items.length;
        const tiLe = total ? Math.round((co_mat / total) * 100) : 0;
        return (
          <div key={tenLop} style={{ background: '#fff', borderRadius: 10, boxShadow: '0 1px 6px rgba(0,0,0,.07)', overflow: 'hidden' }}>
            <div style={{ background: '#1e3a5f', color: '#fff', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{tenLop}</span>
              <span style={{ fontSize: 13 }}>Có mặt: {tiLe}%</span>
            </div>
            <div style={{ padding: '10px 18px', display: 'flex', gap: 16, fontSize: 13, borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
              <span style={{ color: '#27ae60' }}>✅ Có mặt: {co_mat}</span>
              <span style={{ color: '#f39c12' }}>⏰ Đi trễ: {tre}</span>
              <span style={{ color: '#e74c3c' }}>❌ Vắng: {vang}</span>
              <span style={{ color: '#888' }}>Tổng: {total} buổi</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ background: '#f5f6fa' }}>
                {['Ngày','Thứ','Trạng thái','Ghi chú'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#555', fontWeight: 600 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{items.sort((a,b) => new Date(b.ngay) - new Date(a.ngay)).map((d, i) => {
                const tt = trangThaiDiemDanh[d.trang_thai] || { label: d.trang_thai, color: '#888' };
                const ngay = new Date(d.ngay);
                const thu = ['CN','T2','T3','T4','T5','T6','T7'][ngay.getDay()];
                return (
                  <tr key={i} style={{ borderTop: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px 12px' }}>{fmtDate(d.ngay)}</td>
                    <td style={{ padding: '8px 12px' }}>{thu}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ color: tt.color, fontWeight: 500 }}>
                        {d.trang_thai === 'co_mat' ? '✅' : d.trang_thai === 'tre' ? '⏰' : '❌'} {tt.label}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px', color: '#888' }}>{d.ghi_chu || '—'}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Học phí ──────────────────────────────────────────────────────────────
function TabHocPhi({ data, loading }) {
  const list = data || [];
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div>;
  if (!list.length) return <p style={{ color: '#aaa' }}>Chưa có thông tin học phí.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {list.map((hp, i) => {
        const tong = Number(hp.tong_tien) || 0;
        const daTra = Number(hp.da_tra) || 0;
        const conNo = tong - daTra;
        const pct = tong ? Math.min(100, Math.round((daTra / tong) * 100)) : 0;
        const payments = hp.thanhToans || hp.payments || [];
        return (
          <div key={i} style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: '#1e3a5f', fontSize: 15 }}>{hp.lopHoc?.khoaHoc?.ten_khoa || hp.lopHoc?.ten_lop || 'Khóa học'}</h3>
              {conNo <= 0
                ? <span style={{ background: '#eafaf1', color: '#27ae60', padding: '3px 10px', borderRadius: 10, fontSize: 12 }}>✅ Đã thanh toán đủ</span>
                : <span style={{ background: '#fef9e7', color: '#e67e22', padding: '3px 10px', borderRadius: 10, fontSize: 12 }}>⚠️ Còn nợ {fmt(conNo)}</span>
              }
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, marginBottom: 12, flexWrap: 'wrap' }}>
              <span>Tổng: <b>{fmt(tong)}</b></span>
              <span style={{ color: '#27ae60' }}>Đã trả: <b>{fmt(daTra)}</b></span>
              {conNo > 0 && <span style={{ color: '#e74c3c' }}>Còn nợ: <b>{fmt(conNo)}</b></span>}
            </div>
            <div style={{ background: '#f0f0f0', borderRadius: 20, height: 8, marginBottom: 14 }}>
              <div style={{ width: `${pct}%`, background: pct === 100 ? '#27ae60' : '#3498db', height: '100%', borderRadius: 20, transition: 'width .4s' }} />
            </div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{pct}% đã thanh toán</div>
            {payments.length > 0 && (
              <>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>Lịch sử thanh toán</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead><tr style={{ background: '#f5f6fa' }}>
                    {['Ngày','Số tiền','Phương thức'].map(h => (
                      <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: '#666', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>{payments.map((p, j) => (
                    <tr key={j} style={{ borderTop: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '6px 10px' }}>{fmtDate(p.ngay_thu || p.created_at)}</td>
                      <td style={{ padding: '6px 10px', color: '#27ae60', fontWeight: 600 }}>{fmt(p.so_tien)}</td>
                      <td style={{ padding: '6px 10px', color: '#666' }}>{p.phuong_thuc || '—'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Đánh giá GV ─────────────────────────────────────────────────────────
function TabDanhGia({ lopHocData, addToast }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    lop_hoc_id: '', giao_vien_id: '', buoi_hoc_ngay: today,
    diem_giang_day: 5, diem_thai_do: 5, nhan_xet: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const lopList = lopHocData || [];

  const handleLopChange = (e) => {
    const id = e.target.value;
    const lh = lopList.find(l => String((l.lopHoc || l).id) === String(id));
    const gvId = lh ? ((lh.lopHoc || lh).giao_vien_id || (lh.lopHoc || lh).giangVien?.id || '') : '';
    setForm(f => ({ ...f, lop_hoc_id: id, giao_vien_id: gvId }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lop_hoc_id) { addToast('Vui lòng chọn lớp học', 'error'); return; }
    setSubmitting(true);
    try {
      await hvPortalAPI.danhGia(form);
      addToast('Gửi đánh giá thành công! ⭐');
      setForm({ lop_hoc_id: '', giao_vien_id: '', buoi_hoc_ngay: today, diem_giang_day: 5, diem_thai_do: 5, nhan_xet: '' });
    } catch { addToast('Lỗi khi gửi đánh giá', 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 28, boxShadow: '0 1px 6px rgba(0,0,0,.07)' }}>
        <h3 style={{ margin: '0 0 20px', color: '#1e3a5f' }}>⭐ Đánh giá giảng viên</h3>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Lớp học</label>
          <select value={form.lop_hoc_id} onChange={handleLopChange} required
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, marginBottom: 14, fontSize: 14, boxSizing: 'border-box' }}>
            <option value="">-- Chọn lớp --</option>
            {lopList.map((l, i) => {
              const lh = l.lopHoc || l;
              return <option key={i} value={lh.id}>{lh.khoaHoc?.ten_khoa || lh.ten_lop} ({lh.ma_lop})</option>;
            })}
          </select>

          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Ngày buổi học</label>
          <input type="date" value={form.buoi_hoc_ngay} onChange={e => setForm(f => ({ ...f, buoi_hoc_ngay: e.target.value }))}
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, marginBottom: 14, fontSize: 14, boxSizing: 'border-box' }} />

          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>Chất lượng giảng dạy</label>
          <div style={{ marginBottom: 14 }}>
            <StarRating value={form.diem_giang_day} onChange={v => setForm(f => ({ ...f, diem_giang_day: v }))} />
            <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>{form.diem_giang_day}/5</span>
          </div>

          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 6 }}>Thái độ giảng viên</label>
          <div style={{ marginBottom: 14 }}>
            <StarRating value={form.diem_thai_do} onChange={v => setForm(f => ({ ...f, diem_thai_do: v }))} />
            <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>{form.diem_thai_do}/5</span>
          </div>

          <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Nhận xét</label>
          <textarea value={form.nhan_xet} onChange={e => setForm(f => ({ ...f, nhan_xet: e.target.value }))}
            placeholder="Chia sẻ cảm nhận của bạn..." rows={4}
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #ddd', borderRadius: 6, marginBottom: 18, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />

          <button type="submit" disabled={submitting} style={{
            width: '100%', padding: '10px', background: '#1e3a5f', color: '#fff',
            border: 'none', borderRadius: 6, fontSize: 15, cursor: 'pointer', fontWeight: 600,
          }}>{submitting ? 'Đang gửi...' : '⭐ Gửi đánh giá'}</button>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function HocVienPortal() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hv_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('hv_token'));
  const [tab, setTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [toasts, setToasts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadedTabs] = useState(() => new Set());

  const addToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const loadTab = async (tabKey, force = false) => {
    if (!force && loadedTabs.has(tabKey)) return;
    loadedTabs.add(tabKey);
    setLoading(true);
    try {
      let res;
      if (tabKey === 'dashboard') res = await hvPortalAPI.getDashboard();
      else if (tabKey === 'lop-hoc') res = await hvPortalAPI.getLopHoc();
      else if (tabKey === 'bai-tap') res = await hvPortalAPI.getBaiTap();
      else if (tabKey === 'diem-so') res = await hvPortalAPI.getDiemSo();
      else if (tabKey === 'diem-danh') res = await hvPortalAPI.getDiemDanh();
      else if (tabKey === 'hoc-phi') res = await hvPortalAPI.getHocPhi();
      else if (tabKey === 'danh-gia') res = await hvPortalAPI.getLopHoc();
      if (res) setData(d => ({ ...d, [tabKey]: res.data ?? res }));
    } catch { addToast('Lỗi tải dữ liệu', 'error'); }
    finally { setLoading(false); }
  };

  const reload = (tabKey) => {
    loadedTabs.delete(tabKey);
    loadTab(tabKey, true);
  };

  useEffect(() => {
    if (user && token) loadTab('dashboard');
  }, [user, token]); // eslint-disable-line

  useEffect(() => {
    if (user && token) loadTab(tab);
  }, [tab]); // eslint-disable-line

  const handleLogin = (u, t) => {
    setUser(u); setToken(t);
  };

  const handleLogout = () => {
    localStorage.removeItem('hv_token');
    localStorage.removeItem('hv_user');
    setUser(null); setToken(null);
    setData({}); loadedTabs.clear();
  };

  if (!user || !token) return <><LoginForm onLogin={handleLogin} /><Toast toasts={toasts} /></>;

  const renderContent = () => {
    const isLoading = loading && !data[tab];
    if (tab === 'dashboard') return <TabDashboard user={user} data={data['dashboard']} loading={isLoading} />;
    if (tab === 'lop-hoc')   return <TabLopHoc data={data['lop-hoc']} loading={isLoading} />;
    if (tab === 'bai-tap')   return <TabBaiTap data={data['bai-tap']} loading={isLoading} addToast={addToast} reload={reload} />;
    if (tab === 'diem-so')   return <TabDiemSo data={data['diem-so']} loading={isLoading} />;
    if (tab === 'diem-danh') return <TabDiemDanh data={data['diem-danh']} loading={isLoading} />;
    if (tab === 'hoc-phi')   return <TabHocPhi data={data['hoc-phi']} loading={isLoading} />;
    if (tab === 'danh-gia')  return <TabDanhGia lopHocData={data['danh-gia'] || data['lop-hoc']} addToast={addToast} />;
    return null;
  };

  const tabLabel = MENU.find(m => m.key === tab);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      <Toast toasts={toasts} />

      {/* Hamburger for mobile */}
      <button onClick={() => setSidebarOpen(true)} style={{
        display: 'none', position: 'fixed', top: 12, left: 12, zIndex: 300,
        background: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 6,
        padding: '6px 10px', cursor: 'pointer', fontSize: 18,
        // show on mobile via media query workaround
      }} id="hv-hamburger">☰</button>

      <style>{`
        @media (max-width: 768px) {
          #hv-hamburger { display: block !important; }
          #hv-main-content { margin-left: 0 !important; }
        }
      `}</style>

      <Sidebar user={user} tab={tab} setTab={setTab} onLogout={handleLogout} open={sidebarOpen} setOpen={setSidebarOpen} />

      <div id="hv-main-content" style={{ flex: 1, marginLeft: 220, background: '#f5f6fa', minHeight: '100vh' }}>
        <div style={{ background: '#fff', padding: '14px 24px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{tabLabel?.icon}</span>
          <span style={{ fontWeight: 600, color: '#1e3a5f', fontSize: 16 }}>{tabLabel?.label}</span>
        </div>
        <div style={{ padding: 24 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
