import React, { useState, useEffect } from 'react';
import { keToanAPI } from '../../api';

const fmt = (n) => (n || 0).toLocaleString('vi-VN') + 'đ';
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const today = () => new Date().toISOString().split('T')[0];
const firstOfMonth = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0]; };

const initThuForm = { nguoi_nop_id: '', tong_tien: '', phuong_thuc: 'tien_mat', noi_dung: '', ngay_thu: today() };
const initChiForm = { nguoi_nhan_id: '', tong_tien: '', loai_chi: 'luong', noi_dung: '', ngay_chi: today() };

export default function PhieuThuChi() {
  const [tab, setTab] = useState('thu');
  const [phieuThus, setPhieuThus] = useState([]);
  const [phieuChis, setPhieuChis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [thuForm, setThuForm] = useState(initThuForm);
  const [chiForm, setChiForm] = useState(initChiForm);
  const [tuNgay, setTuNgay] = useState(firstOfMonth());
  const [denNgay, setDenNgay] = useState(today());
  const [tongThu, setTongThu] = useState(0);
  const [tongChi, setTongChi] = useState(0);

  const load = () => {
    setLoading(true);
    const params = { tu_ngay: tuNgay, den_ngay: denNgay };
    if (tab === 'thu') {
      keToanAPI.getPhieuThus(params)
        .then(res => {
          const list = Array.isArray(res) ? res : (res.data || []);
          setPhieuThus(list);
          setTongThu(list.reduce((s, p) => s + (p.tong_tien || 0), 0));
        })
        .catch(() => setPhieuThus([]))
        .finally(() => setLoading(false));
    } else {
      keToanAPI.getPhieuChis(params)
        .then(res => {
          const list = Array.isArray(res) ? res : (res.data || []);
          setPhieuChis(list);
          setTongChi(list.reduce((s, p) => s + (p.tong_tien || 0), 0));
        })
        .catch(() => setPhieuChis([]))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => { load(); }, [tab, tuNgay, denNgay]); // eslint-disable-line

  const handleCreateThu = async () => {
    try { await keToanAPI.createPhieuThu(thuForm); setShowModal(false); setThuForm(initThuForm); load(); }
    catch { alert('Lỗi tạo phiếu thu'); }
  };
  const handleCreateChi = async () => {
    try { await keToanAPI.createPhieuChi(chiForm); setShowModal(false); setChiForm(initChiForm); load(); }
    catch { alert('Lỗi tạo phiếu chi'); }
  };

  const chenh = tongThu - tongChi;
  const tabBtn = (t, label) => ({
    padding: '8px 22px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
    background: tab === t ? (t === 'thu' ? '#27ae60' : '#e74c3c') : '#eee',
    color: tab === t ? '#fff' : '#555',
  });

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#f5f6fa', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>📄 Phiếu thu / Chi</h2>
        <button style={tabBtn('thu', 'Thu')} onClick={() => setTab('thu')}>💰 Thu</button>
        <button style={tabBtn('chi', 'Chi')} onClick={() => setTab('chi')}>💸 Chi</button>
        <input type="date" value={tuNgay} onChange={e => setTuNgay(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
        <span style={{ color: '#888' }}>→</span>
        <input type="date" value={denNgay} onChange={e => setDenNgay(e.target.value)}
          style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
        <button onClick={() => setShowModal(true)}
          style={{ padding: '8px 18px', background: '#2980b9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600, marginLeft: 'auto' }}>
          + Tạo phiếu
        </button>
        {loading && <span style={{ color: '#888', fontSize: 13 }}>Đang tải...</span>}
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ background: '#27ae60', borderRadius: 10, padding: '14px 22px', color: '#fff', flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Tổng thu</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{fmt(tongThu)}</div>
        </div>
        <div style={{ background: '#e74c3c', borderRadius: 10, padding: '14px 22px', color: '#fff', flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Tổng chi</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{fmt(tongChi)}</div>
        </div>
        <div style={{ background: chenh >= 0 ? '#2980b9' : '#c0392b', borderRadius: 10, padding: '14px 22px', color: '#fff', flex: 1, minWidth: 140 }}>
          <div style={{ fontSize: 12, opacity: 0.85 }}>Chênh lệch</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{chenh >= 0 ? '+' : ''}{fmt(chenh)}</div>
        </div>
      </div>

      {/* Table phiếu thu */}
      {tab === 'thu' && (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Mã phiếu','Người nộp','Hợp đồng / Khóa học','Số tiền','Phương thức','Ngày thu','Nội dung'].map((h, i) => (
                  <th key={i} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {phieuThus.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#aaa' }}>Không có phiếu thu</td></tr>
              )}
              {phieuThus.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 14px', color: '#2980b9', fontWeight: 600 }}>#{p.id}</td>
                  <td style={{ padding: '10px 14px' }}>{p.nguoi_nop?.ho_ten || p.nguoi_nop_id || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>{p.hop_dong?.ten_khoa || p.ten_khoa || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#27ae60', fontWeight: 600 }}>{fmt(p.tong_tien)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: '#e8f5e9', color: '#27ae60', padding: '3px 10px', borderRadius: 12, fontSize: 12 }}>
                      {p.phuong_thuc || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#888' }}>{fmtDate(p.ngay_thu)}</td>
                  <td style={{ padding: '10px 14px', color: '#555' }}>{p.noi_dung || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Table phiếu chi */}
      {tab === 'chi' && (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Mã phiếu','Người nhận','Loại chi','Số tiền','Ngày chi','Nội dung'].map((h, i) => (
                  <th key={i} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {phieuChis.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#aaa' }}>Không có phiếu chi</td></tr>
              )}
              {phieuChis.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 14px', color: '#e74c3c', fontWeight: 600 }}>#{p.id}</td>
                  <td style={{ padding: '10px 14px' }}>{p.nguoi_nhan?.ho_ten || p.nguoi_nhan_id || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: '#fdecea', color: '#e74c3c', padding: '3px 10px', borderRadius: 12, fontSize: 12 }}>
                      {p.loai_chi || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#e74c3c', fontWeight: 600 }}>{fmt(p.tong_tien)}</td>
                  <td style={{ padding: '10px 14px', color: '#888' }}>{fmtDate(p.ngay_chi)}</td>
                  <td style={{ padding: '10px 14px', color: '#555' }}>{p.noi_dung || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal tạo phiếu */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: 420, maxWidth: '95vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <h3 style={{ margin: '0 0 18px', fontSize: 18 }}>{tab === 'thu' ? '💰 Tạo phiếu thu' : '💸 Tạo phiếu chi'}</h3>

            {tab === 'thu' && (
              <>
                {[
                  { label: 'Tên người nộp', key: 'nguoi_nop_id', type: 'text' },
                  { label: 'Số tiền (đ)', key: 'tong_tien', type: 'number' },
                  { label: 'Nội dung', key: 'noi_dung', type: 'text' },
                  { label: 'Ngày thu', key: 'ngay_thu', type: 'date' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>{f.label}</label>
                    <input type={f.type} value={thuForm[f.key]}
                      onChange={e => setThuForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Phương thức</label>
                  <select value={thuForm.phuong_thuc} onChange={e => setThuForm(p => ({ ...p, phuong_thuc: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                    <option value="tien_mat">Tiền mặt</option>
                    <option value="chuyen_khoan">Chuyển khoản</option>
                    <option value="momo">MoMo</option>
                    <option value="vnpay">VNPay</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowModal(false)}
                    style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 }}>Hủy</button>
                  <button onClick={handleCreateThu}
                    style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#27ae60', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Tạo phiếu</button>
                </div>
              </>
            )}

            {tab === 'chi' && (
              <>
                {[
                  { label: 'Người nhận (ID hoặc tên)', key: 'nguoi_nhan_id', type: 'text' },
                  { label: 'Số tiền (đ)', key: 'tong_tien', type: 'number' },
                  { label: 'Nội dung', key: 'noi_dung', type: 'text' },
                  { label: 'Ngày chi', key: 'ngay_chi', type: 'date' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>{f.label}</label>
                    <input type={f.type} value={chiForm[f.key]}
                      onChange={e => setChiForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: '#555', display: 'block', marginBottom: 4 }}>Loại chi</label>
                  <select value={chiForm.loai_chi} onChange={e => setChiForm(p => ({ ...p, loai_chi: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}>
                    <option value="luong">Lương</option>
                    <option value="hoa_hong">Hoa hồng</option>
                    <option value="van_phong">Văn phòng</option>
                    <option value="khac">Khác</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowModal(false)}
                    style={{ padding: '9px 20px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 14 }}>Hủy</button>
                  <button onClick={handleCreateChi}
                    style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#e74c3c', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Tạo phiếu</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
