import { useState, useEffect } from 'react';
import { hvPortalAPI } from '../api';
import { login, loginDemo } from '../api';
import { testAPI } from '../api';
import LamBai from './LamBai';

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
    
    // Demo accounts for student portal - use email to get user from backend
    const demoStudents = {
      "hocvien@nta.com": { id: 1, ho_ten: "Nguyễn Văn Học Viên", email: "hocvien@nta.com", chuc_vu_id: 5 },
      "phuhuynh@nta.com": { id: 2, ho_ten: "Phụ huynh học viên", email: "phuhuynh@nta.com", chuc_vu_id: 5 },
    };
    
    // Check demo accounts first (password: admin123)
    if (demoStudents[email] && password === "admin123") {
      const user = demoStudents[email];
      // Use loginDemo API to get valid JWT token
      try {
        const res = await loginDemo(email, user.id);
        if (res.success && res.data && res.data.token) {
          localStorage.setItem('hv_token', res.data.token);
          localStorage.setItem('hv_user', JSON.stringify(res.data.user));
          localStorage.setItem('chuc_vu_id', res.data.user.chuc_vu_id);
          localStorage.setItem('user_name', res.data.user.ho_ten);
          onLogin(res.data.user, res.data.token);
        } else {
          // Fallback if loginDemo fails
          localStorage.setItem('hv_token', 'demo_token_' + Date.now());
          localStorage.setItem('hv_user', JSON.stringify(user));
          localStorage.setItem('chuc_vu_id', '5');
          localStorage.setItem('user_name', user.ho_ten);
          onLogin(user, 'demo_token');
        }
      } catch (err) {
        // Fallback
        localStorage.setItem('hv_token', 'demo_token_' + Date.now());
        localStorage.setItem('hv_user', JSON.stringify(user));
        localStorage.setItem('chuc_vu_id', '5');
        localStorage.setItem('user_name', user.ho_ten);
        onLogin(user, 'demo_token');
      }
      setLoading(false);
      return;
    }
    
    // Otherwise, try API login (supports both email and phone number)
    try {
      // If input looks like phone number, use sdt field, otherwise use email
      const isPhone = /^\d{8,11}$/.test(email);
      const loginData = isPhone ? { sdt: email, mat_khau: password } : { email, mat_khau: password };
      
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      
      if (data.success && data.data && data.data.token) {
        localStorage.setItem('hv_token', data.data.token);
        localStorage.setItem('hv_user', JSON.stringify(data.data.user));
        onLogin(data.data.user, data.data.token);
      } else {
        setErr(data.message || 'Đăng nhập thất bại');
      }
    } catch {
      setErr('Lỗi kết nối máy chủ');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', borderRadius: 12, padding: '40px 36px',
        boxShadow: '0 4px 24px rgba(0,0,0,.15)', width: 360, border: '2px solid #e53935',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 40, color: '#e53935' }}>🎓</div>
          <h2 style={{ margin: '8px 0 4px', color: '#e53935', fontWeight: 'bold' }}>Portal Học Viên</h2>
          <p style={{ color: '#333', fontSize: 13, margin: 0 }}>Đăng nhập để tiếp tục</p>
        </div>
        {err && <div style={{ background: '#ffebee', color: '#c62828', padding: '8px 12px', borderRadius: 6, marginBottom: 14, fontSize: 13 }}>{err}</div>}
        <label style={{ fontSize: 13, color: '#333', display: 'block', marginBottom: 4, fontWeight: 600 }}>Email hoặc SĐT</label>
        <input value={email} onChange={e => setEmail(e.target.value)} type="text" required
          style={{ width: '100%', padding: '9px 12px', border: '2px solid #333', borderRadius: 6, marginBottom: 14, fontSize: 14, boxSizing: 'border-box', color: '#000' }} />
        <label style={{ fontSize: 13, color: '#333', display: 'block', marginBottom: 4, fontWeight: 600 }}>Mật khẩu</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" required
          style={{ width: '100%', padding: '9px 12px', border: '2px solid #333', borderRadius: 6, marginBottom: 20, fontSize: 14, boxSizing: 'border-box', color: '#000' }} />
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '10px', background: '#e53935', color: '#fff',
          border: 'none', borderRadius: 6, fontSize: 15, cursor: 'pointer', fontWeight: 600,
        }}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
        
        {/* Demo accounts info */}
        <div style={{ marginTop: 16, padding: 12, background: '#fafafa', borderRadius: 6, fontSize: 11, color: '#333', textAlign: 'center', border: '1px solid #ddd' }}>
          <strong>📌 Demo:</strong> hocvien@nta.com hoặc phuhuynh@nta.com<br/>
          <strong>Mật khẩu:</strong> admin123
        </div>
      </form>
    </div>
  );
}

// ── Menu Configuration ─────────────────────────────────────────────────────────
const MENU = [
  { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { key: 'lop-hoc',   icon: '📚', label: 'Lớp học' },
  { key: 'bai-tap',   icon: '📝', label: 'Bài tập' },
  { key: 'diem-so',   icon: '📊', label: 'Điểm số' },
  { key: 'diem-danh', icon: '📋', label: 'Điểm danh' },
  { key: 'hoc-phi',   icon: '💰', label: 'Học phí' },
  { key: 'lich-test', icon: '🗓️', label: 'Lịch test' },
  { key: 'thong-bao', icon: '🔔', label: 'Thông báo' },
  { key: 'danh-gia',  icon: '⭐', label: 'Đánh giá GV' },
];

// ── Tab: Dashboard ────────────────────────────────────────────────────────────
function TabDashboard({ user, data, loading }) {
  const d = data || {};
  const stats = [
    { label: 'Lớp đang học',       value: d.lop_dang_hoc ?? '—',       color: '#3498db' },
    { label: 'Bài tập chưa nộp',   value: d.bai_tap_chua_nop ?? '—',   color: '#e67e22' },
    { label: 'Có mặt tháng này',   value: d.co_mat_thang ?? '—',       color: '#27ae60' },
    { label: 'Vắng mặt tháng này', value: d.vang_mat_thang ?? '—',     color: '#e74c3c' },
  ];
  const diemGanNhat = Array.isArray(d.diem_gan_nhat) ? d.diem_gan_nhat : [];
  const lopHocArray = Array.isArray(d.lop_hoc) ? d.lop_hoc : [];
  const lichHoc = lopHocArray.flatMap(lh =>
    (Array.isArray(lh.lopHoc?.lichHocs) ? lh.lopHoc.lichHocs : []).map(l => ({
      ...l,
      thu: l.thu_trong_tuan || l.thu,
      tenLop: lh.lopHoc?.khoaHoc?.ten_khoa || lh.lopHoc?.ma_lop || '—',
      giaoVien: lh.lopHoc?.giaoVien?.ho_ten || '—',
      maLop: lh.lopHoc?.ma_lop || '—',
    }))
  ).sort((a, b) => {
    const order = { Thu2:1, Thu3:2, Thu4:3, Thu5:4, Thu6:5, Thu7:6, CNhat:7 };
    return (order[a.thu] || 9) - (order[b.thu] || 9);
  });

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div>;
  return (
    <div>
      <h2 style={{ margin: '0 0 20px', color: '#e53935' }}>Xin chào, {user?.ho_ten}! 👋</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 10, padding: '18px 20px', boxShadow: '0 1px 6px rgba(0,0,0,.07)', borderTop: `4px solid ${s.color}` }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 10, padding: 20, boxShadow: '0 1px 6px rgba(0,0,0,.07)', marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px', color: '#e53935', fontSize: 15 }}>📊 Điểm gần nhất</h3>
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
        <h3 style={{ margin: '0 0 12px', color: '#e53935', fontSize: 15 }}>📅 Lịch học tuần này</h3>
        {lichHoc.length === 0 ? <p style={{ color: '#aaa', fontSize: 13 }}>Không có lịch học</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lichHoc.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f5f6fa', borderRadius: 8, fontSize: 13, borderLeft: '3px solid #e53935' }}>
                <span style={{ fontWeight: 700, color: '#e53935', minWidth: 52, fontSize: 12 }}>{l.thu}</span>
                <span style={{ fontWeight: 600, color: '#111', minWidth: 110 }}>{l.gio_bat_dau?.slice(0,5)} – {l.gio_ket_thuc?.slice(0,5)}</span>
                <span style={{ color: '#374151', flex: 1 }}>{l.tenLop}</span>
                <span style={{ color: '#6b7280', fontSize: 12 }}>GV: {l.giaoVien}</span>
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
  const list = Array.isArray(data) ? data : [];
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
              <h3 style={{ margin: 0, color: '#e53935', fontSize: 16 }}>{lh.khoaHoc?.ten_khoa || lh.ten_lop}</h3>
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
  const [modal, setModal] = useState(null); // { baiTapId, tenBai }
  const [ghiChu, setGhiChu] = useState('');
  const [fileNop, setFileNop] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const list = Array.isArray(data) ? data : [];
  const filtered = list.filter(b => {
    if (filter === 'chua_nop') return !b.nopBai;
    if (filter === 'da_nop') return !!b.nopBai;
    if (filter === 'co_diem') return b.nopBai?.diem != null;
    return true;
  });

  const handleNopBai = async () => {
    setSubmitting(true);
    try {
      await hvPortalAPI.nopBai({ bai_tap_id: modal.baiTapId, ghi_chu: ghiChu, file_nop: fileNop });
      addToast('Nộp bài thành công!');
      setModal(null); setGhiChu(''); setFileNop(null);
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
            background: filter === k ? '#e53935' : '#e8ecf0', color: filter === k ? '#fff' : '#555',
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
                    <button onClick={() => { setModal({ baiTapId: b.id, tenBai: b.ten_bai }); setGhiChu(''); setFileNop(null); }} style={{
                      padding: '4px 10px', background: '#e53935', color: '#fff', border: 'none',
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
          <div style={{ background: '#fff', borderRadius: 10, padding: 28, width: 420, boxShadow: '0 4px 24px rgba(0,0,0,.15)' }}>
            <h3 style={{ margin: '0 0 4px', color: '#e53935' }}>📤 Nộp bài</h3>
            <p style={{ margin: '0 0 16px', fontSize: 13, color: '#666' }}>{modal.tenBai}</p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                📎 Đính kèm file (PDF, Word, ảnh...)
              </label>
              <input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp3,.mp4"
                onChange={e => setFileNop(e.target.files[0] || null)}
                style={{ fontSize: 13, width: '100%' }} />
              {fileNop && <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>✓ {fileNop.name}</div>}
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                💬 Ghi chú (tuỳ chọn)
              </label>
              <textarea value={ghiChu} onChange={e => setGhiChu(e.target.value)} placeholder="Nhập ghi chú..."
                style={{ width: '100%', height: 80, padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setModal(null); setFileNop(null); }} style={{ padding: '7px 16px', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer', background: '#fff' }}>Hủy</button>
              <button onClick={handleNopBai} disabled={submitting} style={{ padding: '7px 16px', background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
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
  const list = Array.isArray(data) ? data : [];
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
            <div style={{ background: '#e53935', color: '#fff', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
  const list = Array.isArray(data) ? data : [];
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
            <div style={{ background: '#e53935', color: '#fff', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
  const list = Array.isArray(data) ? data : [];
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
              <h3 style={{ margin: 0, color: '#e53935', fontSize: 15 }}>{hp.lopHoc?.khoaHoc?.ten_khoa || hp.lopHoc?.ten_lop || 'Khóa học'}</h3>
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

// ── Tab: Lịch test ───────────────────────────────────────────────────────────
function TabLichTest({ user }) {
  const [lichTests, setLichTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLich, setSelectedLich] = useState(null);
  const [dangLamBai, setDangLamBai] = useState(null);

  useEffect(() => {
    loadLichTests();
  }, []);

   const loadLichTests = async () => {
     setLoading(true);
     try {
       const res = await testAPI.getMyLichTest();
       const data = res.data || res;
       setLichTests(Array.isArray(data) ? data : []);
     } catch (e) { console.error(e); setLichTests([]); }
     setLoading(false);
   };

  const TRANG_THAI_CFG = {
    cho_test: { label: "Chờ test", bg: "#fef3c7", color: "#92400e" },
    dang_test: { label: "Đang test", bg: "#dbeafe", color: "#1d4ed8" },
    hoan_thanh: { label: "Hoàn thành", bg: "#d1fae5", color: "#065f46" },
    huy: { label: "Đã hủy", bg: "#fee2e2", color: "#991b1b" },
  };

  const cardStyle = {
    background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: 20, marginBottom: 14,
  };

  // Chi tiết lịch test
  if (selectedLich) {
    const lich = selectedLich;
    
    // Đang lam bai - hien thi giao dien LamBai
    if (dangLamBai) {
      return (
        <LamBai 
          deThiId={lich.deThi?.id} 
          lichHenTestId={lich.id}
          onHoanThanh={() => {
            setDangLamBai(null);
            setSelectedLich(prev => prev ? { ...prev, trang_thai: "hoan_thanh" } : null);
            loadLichTests();
          }}
        />
      );
    }
    
    return (
      <div style={{ minHeight: "100vh", background: "#f9fafb", padding: 24 }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <button
            onClick={() => setSelectedLich(null)}
            style={{ padding: "7px 16px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151", marginBottom: 20 }}
          >
            ← Quay lại
          </button>

          <div style={cardStyle}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#e53935", marginBottom: 16 }}>{lich.deThi?.ten_de || "Bài kiểm tra đầu vào"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Giáo viên", value: lich.giaoVien?.ho_ten || "—" },
                { label: "Địa điểm", value: lich.dia_diem || "—" },
                { label: "Thời gian", value: lich.thoi_gian ? new Date(lich.thoi_gian).toLocaleString("vi-VN") : "—" },
                { label: "Loại đề", value: lich.deThi?.loai?.toUpperCase() || "—" },
              ].map((item, i) => (
                <div key={i}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: "#111827" }}>{item.value}</div>
                </div>
              ))}
            </div>
            {lich.ghi_chu && (
              <div style={{ padding: "10px 14px", background: "#f9fafb", borderRadius: 6, fontSize: 13, color: "#374151", marginBottom: 16 }}>
                <span style={{ fontWeight: 600 }}>Ghi chú: </span>{lich.ghi_chu}
              </div>
            )}
            {lich.deThi?.file_pdf && (
              <a
                href={`http://localhost:5000/uploads/${lich.deThi.file_pdf}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-block", padding: "8px 18px", background: "#e53935", color: "#fff", borderRadius: 6, fontSize: 13, textDecoration: "none", marginBottom: 16, marginRight: 8 }}
              >
                Xem đề thi (PDF)
              </a>
            )}
            {lich.deThi?.file_audio && (
              <a
                href={`http://localhost:5000/uploads/${lich.deThi.file_audio}`}
                target="_blank"
                rel="noreferrer"
                style={{ display: "inline-block", padding: "8px 18px", background: "#1d4ed8", color: "#fff", borderRadius: 6, fontSize: 13, textDecoration: "none", marginBottom: 16 }}
              >
                Nghe audio
              </a>
            )}
            {/* Nut lam bai test online */}
            {lich.deThi && lich.trang_thai !== 'hoan_thanh' && lich.trang_thai !== 'huy' && (
              <div style={{ marginTop: 8, marginBottom: 16 }}>
                <button
                  onClick={() => setDangLamBai(true)}
                  style={{ padding: "10px 24px", background: "#059669", color: "#fff", border: "none", borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
                >
                  🎧 Bắt đầu làm bài test online
                </button>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                  Có audio nghe và câu hỏi trắc nghiệm Nghe + Đọc
                </div>
              </div>
            )}
          </div>

          {/* Kết quả */}
          <div style={cardStyle}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Kết quả bài test</div>
            {lich.ketQuas && lich.ketQuas.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr>
                    {["Ngày làm", "Điểm tổng", "Nghe", "Đọc", "Nói", "Viết", "Thời gian (phút)"].map((h, i) => (
                      <th key={i} style={{ padding: "8px 10px", background: "#f3f4f6", color: "#374151", fontWeight: 600, textAlign: "left", border: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lich.ketQuas.map((kq, i) => (
                    <tr key={i}>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb" }}>{kq.ngay_lam ? new Date(kq.ngay_lam).toLocaleDateString("vi-VN") : "—"}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb", fontWeight: 700, color: "#111827" }}>{kq.diem_tong ?? "—"}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb" }}>{kq.diem_nghe ?? "—"}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb" }}>{kq.diem_doc ?? "—"}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb" }}>{kq.diem_noi ?? "—"}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb" }}>{kq.diem_viet ?? "—"}</td>
                      <td style={{ padding: "8px 10px", border: "1px solid #e5e7eb" }}>{kq.thoi_gian_lam ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: "16px", background: "#f9fafb", borderRadius: 8, fontSize: 13, color: "#6b7280", textAlign: "center" }}>
                Vui lòng đến trung tâm để làm bài test
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Danh sách lịch test
  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Đang tải...</div>;
  if (lichTests.length === 0) return <p style={{ color: "#aaa" }}>Chưa có lịch kiểm tra nào</p>;

  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#e53935", marginBottom: 16 }}>Lịch kiểm tra của bạn</div>
      {lichTests.map(lich => {
        const cfg = TRANG_THAI_CFG[lich.trang_thai] || { label: lich.trang_thai, bg: "#f3f4f6", color: "#374151" };
        return (
          <div key={lich.id} style={cardStyle}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{lich.deThi?.ten_de || "Bài kiểm tra đầu vào"}</div>
              <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, background: cfg.bg, color: cfg.color, whiteSpace: "nowrap" }}>
                {cfg.label}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Giáo viên</div>
                <div style={{ fontSize: 13, color: "#374151" }}>{lich.giaoVien?.ho_ten || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Địa điểm</div>
                <div style={{ fontSize: 13, color: "#374151" }}>{lich.dia_diem || "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>Thời gian</div>
                <div style={{ fontSize: 13, color: "#374151" }}>{lich.thoi_gian ? new Date(lich.thoi_gian).toLocaleString("vi-VN") : "—"}</div>
              </div>
            </div>
            <button
              onClick={() => setSelectedLich(lich)}
              style={{ padding: "7px 18px", background: "#e53935", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer" }}
            >
              Xem chi tiết / Bắt đầu làm bài
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Tab: Thông báo ────────────────────────────────────────────────────────────
function TabThongBao({ data, loading, reload }) {
  const list = Array.isArray(data) ? data : [];
  const loaiCfg = {
    thong_bao: { label: 'Thông báo', bg: '#dbeafe', color: '#1d4ed8', icon: '📢' },
    bai_tap:   { label: 'Bài tập',   bg: '#fef3c7', color: '#92400e', icon: '📝' },
    diem_so:   { label: 'Điểm số',   bg: '#d1fae5', color: '#065f46', icon: '📊' },
    hoc_phi:   { label: 'Học phí',   bg: '#fee2e2', color: '#991b1b', icon: '💰' },
    he_thong:  { label: 'Hệ thống',  bg: '#f3f4f6', color: '#374151', icon: '⚙️' },
  };
  const handleDoc = async (id) => {
    try { await hvPortalAPI.danhDauDaDoc(id); reload('thong-bao'); } catch {}
  };
  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Đang tải...</div>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: '#e53935', fontSize: 18 }}>🔔 Thông báo</h2>
        <span style={{ fontSize: 13, color: '#6b7280' }}>{list.filter(t => !t.da_doc).length} chưa đọc</span>
      </div>
      {list.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 10, padding: 40, textAlign: 'center', color: '#aaa' }}>
          Chưa có thông báo nào
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map((tb, i) => {
            const cfg = loaiCfg[tb.loai] || loaiCfg.thong_bao;
            return (
              <div key={i} onClick={() => !tb.da_doc && handleDoc(tb.id)}
                style={{ background: tb.da_doc ? '#fff' : '#fef2f2', borderRadius: 10, padding: '14px 18px',
                  boxShadow: '0 1px 4px rgba(0,0,0,.06)', cursor: tb.da_doc ? 'default' : 'pointer',
                  borderLeft: `4px solid ${tb.da_doc ? '#e5e7eb' : '#e53935'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                  <span style={{ fontWeight: 700, color: '#111827', flex: 1, fontSize: 14 }}>{tb.tieu_de}</span>
                  {!tb.da_doc && <span style={{ fontSize: 11, background: '#e53935', color: '#fff', padding: '2px 8px', borderRadius: 10 }}>Mới</span>}
                  <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                </div>
                {tb.noi_dung && <p style={{ margin: '0 0 6px', fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{tb.noi_dung}</p>}
                <div style={{ fontSize: 11, color: '#9ca3af' }}>
                  {tb.created_at ? new Date(tb.created_at).toLocaleString('vi-VN') : ''}
                  {!tb.da_doc && <span style={{ marginLeft: 8, color: '#e53935' }}>· Nhấn để đánh dấu đã đọc</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
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

  const lopList = Array.isArray(lopHocData) ? lopHocData : [];

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
        <h3 style={{ margin: '0 0 20px', color: '#e53935' }}>⭐ Đánh giá giảng viên</h3>
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
            width: '100%', padding: '10px', background: '#e53935', color: '#fff',
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
      else if (tabKey === 'thong-bao') res = await hvPortalAPI.getThongBao();
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
    if (tab === 'lich-test') return <TabLichTest user={user} />;
    if (tab === 'danh-gia')  return <TabDanhGia lopHocData={data['danh-gia'] || data['lop-hoc']} addToast={addToast} />;
    if (tab === 'thong-bao') return <TabThongBao data={data['thong-bao']} loading={isLoading} reload={reload} />;
    return null;
  };

  const tabLabel = MENU.find(m => m.key === tab);

   return (
     <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
       <Toast toasts={toasts} />

       <style>{`
         @media (max-width: 768px) {
           #hv-sidebar {
             width: 60px !important;
           }
           #hv-sidebar .sidebar-text {
             display: none !important;
           }
           #hv-sidebar .sidebar-user-info {
             padding: 12px 8px !important;
           }
           #hv-sidebar .sidebar-user-avatar {
             width: 36px !important;
             height: 36px !important;
             font-size: 16px !important;
             margin-bottom: 4px !important;
           }
           #hv-sidebar .sidebar-nav-item {
             padding: 10px 8px !important;
             justify-content: center !important;
           }
           #hv-sidebar .sidebar-nav-item span:first-child {
             font-size: 18px !important;
           }
           #hv-sidebar .sidebar-logout-btn {
             padding: 8px !important;
             font-size: 16px !important;
           }
           #hv-sidebar .sidebar-logout-text {
             display: none !important;
           }
           #hv-main-content {
             margin-left: 60px !important;
           }
           #hv-main-content > div:first-child {
             padding: 10px 16px !important;
           }
           #hv-main-content > div:last-child {
             padding: 16px !important;
           }
         }
       `}</style>

       {/* Sidebar - always visible on all screens */}
      <div id="hv-sidebar" style={{
        width: 220, background: '#e53935', color: '#fff',
        display: 'flex', flexDirection: 'column', minHeight: '100vh',
        position: 'fixed', top: 0, left: 0, zIndex: 200,
      }}>
        <div className="sidebar-user-info" style={{ padding: '24px 16px 16px', borderBottom: '1px solid rgba(255,255,255,.1)' }}>
          <div className="sidebar-user-avatar" style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 8, color: '#e53935', fontWeight: 'bold' }}>
            {(user?.ho_ten || 'U')[0].toUpperCase()}
          </div>
          <div className="sidebar-text" style={{ fontWeight: 600, fontSize: 14 }}>{user?.ho_ten || 'Học viên'}</div>
          <div className="sidebar-text" style={{ fontSize: 12, opacity: .7 }}>{user?.email}</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
          {MENU.map(m => (
            <div key={m.key} onClick={() => setTab(m.key)}
              className="sidebar-nav-item"
              title={m.label}
              style={{
                padding: '10px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                background: tab === m.key ? 'rgba(255,255,255,.15)' : 'transparent',
                borderLeft: tab === m.key ? '3px solid #fff' : '3px solid transparent',
                fontSize: 14, transition: 'background .15s',
              }}>
              <span>{m.icon}</span><span className="sidebar-text">{m.label}</span>
            </div>
          ))}
        </nav>
        <div style={{ padding: '16px' }}>
          <button className="sidebar-logout-btn" title="Đăng xuất" onClick={handleLogout} style={{
            width: '100%', padding: '8px', background: '#333',
            color: '#fff', border: 'none', borderRadius: 6,
            cursor: 'pointer', fontSize: 13,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              🚪 <span className="sidebar-logout-text">Đăng xuất</span>
            </span>
          </button>
        </div>
      </div>

      {/* Main content - always shifted for sidebar */}
      <div id="hv-main-content" style={{ flex: 1, marginLeft: 220, background: '#f5f6fa', minHeight: '100vh' }}>
        <div style={{ background: '#fff', padding: '14px 24px', boxShadow: '0 1px 4px rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{tabLabel?.icon}</span>
          <span style={{ fontWeight: 600, color: '#e53935', fontSize: 16 }}>{tabLabel?.label}</span>
        </div>
        <div style={{ padding: 24 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
