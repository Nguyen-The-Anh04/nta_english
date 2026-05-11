import React, { useState, useEffect } from 'react';
import { lmsAPI } from '../../api';
import { lmsAPI2 } from '../../api';

const loaiBaiConfig = {
  homework: { label: 'Bài tập', color: '#3b82f6' },
  speaking: { label: 'Speaking', color: '#8b5cf6' },
  writing: { label: 'Writing', color: '#10b981' },
};

const emptyForm = () => ({
  ten_bai: '', lop_hoc_id: '', giao_vien_id: 1,
  loai_bai: 'homework', noi_dung: '', han_nop: '', trang_thai: 'dang_mo',
});

export default function BaiTap() {
  const [lops, setLops] = useState([]);
  const [selectedLopId, setSelectedLopId] = useState('');
  const [baiTaps, setBaiTaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedBT, setSelectedBT] = useState(null);
  const [editingBT, setEditingBT] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [chamDiemForm, setChamDiemForm] = useState({ nop_bai_id: '', bai_tap_id: '', hoc_vien_id: '', diem: '', band_score: '', nhan_xet: '' });
  const [showChamDiem, setShowChamDiem] = useState(null); // hoc_vien_id being graded

  useEffect(() => {
    const gvUser = (() => { try { return JSON.parse(localStorage.getItem("gv_user") || "null"); } catch { return null; } })();
    const params = (gvUser?.chuc_vu_id === 3) ? { giao_vien_id: gvUser.id } : {};
    lmsAPI.getLopHocs(params).then(res => setLops(res.data || res || []));
  }, []);

  useEffect(() => {
    if (!selectedLopId) { setBaiTaps([]); return; }
    setLoading(true);
    lmsAPI2.getBaiTaps({ lop_hoc_id: selectedLopId })
      .then(res => setBaiTaps(res.data || res || []))
      .finally(() => setLoading(false));
  }, [selectedLopId]);

  const handleSave = async () => {
    try {
      if (editingBT) {
        await lmsAPI2.updateBaiTap(editingBT.id, form);
      } else {
        await lmsAPI2.createBaiTap(form);
      }
      setShowModal(false);
      setForm(emptyForm());
      setEditingBT(null);
      if (selectedLopId) {
        const res = await lmsAPI2.getBaiTaps({ lop_hoc_id: selectedLopId });
        setBaiTaps(res.data || res || []);
      }
    } catch (e) {
      alert('Lỗi khi lưu bài tập');
    }
  };

  const openDetail = async (bt) => {
    try {
      const res = await lmsAPI2.getBaiTapById(bt.id);
      setSelectedBT(res.data || res);
      setShowDetail(true);
    } catch (e) {
      alert('Không tải được chi tiết');
    }
  };

  const handleChamDiem = async () => {
    try {
      await lmsAPI2.chamDiem(chamDiemForm);
      setShowChamDiem(null);
      setChamDiemForm({ nop_bai_id: '', bai_tap_id: '', hoc_vien_id: '', diem: '', band_score: '', nhan_xet: '' });
      if (selectedBT) {
        const res = await lmsAPI2.getBaiTapById(selectedBT.id);
        setSelectedBT(res.data || res);
      }
    } catch (e) {
      alert('Lỗi khi chấm điểm');
    }
  };

  const stats = {
    tong: baiTaps.length,
    dangMo: baiTaps.filter(b => b.trang_thai === 'dang_mo').length,
    hetHan: baiTaps.filter(b => b.trang_thai === 'het_han' || (b.han_nop && new Date(b.han_nop) < new Date())).length,
  };

  const inputStyle = { padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { display: 'block', marginBottom: '4px', fontWeight: 500, fontSize: '13px', color: '#374151' };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '22px', margin: 0 }}>📚 Bài tập</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select value={selectedLopId} onChange={e => setSelectedLopId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '180px' }}>
            <option value=''>-- Chọn lớp --</option>
            {lops.map(l => <option key={l.id} value={l.id}>{l.ten_lop}</option>)}
          </select>
          <button onClick={() => { setForm(emptyForm()); setEditingBT(null); setShowModal(true); }}
            style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
            + Tạo bài tập
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        {[{ label: 'Tổng bài', val: stats.tong, bg: '#eff6ff', color: '#1d4ed8' },
          { label: 'Đang mở', val: stats.dangMo, bg: '#d1fae5', color: '#065f46' },
          { label: 'Hết hạn', val: stats.hetHan, bg: '#fee2e2', color: '#991b1b' }].map(s => (
          <div key={s.label} style={{ padding: '8px 16px', borderRadius: '8px', background: s.bg, color: s.color, fontWeight: 600 }}>{s.label}: {s.val}</div>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              {['Tên bài', 'Loại', 'Hạn nộp', 'Đã nộp/Tổng', 'Trạng thái', 'Actions'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>Đang tải...</td></tr>
            ) : baiTaps.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>Chưa có bài tập</td></tr>
            ) : baiTaps.map(bt => {
              const cfg = loaiBaiConfig[bt.loai_bai] || loaiBaiConfig.homework;
              return (
                <tr key={bt.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>{bt.ten_bai}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', background: cfg.color + '20', color: cfg.color, fontSize: '12px', fontWeight: 600 }}>{cfg.label}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#6b7280' }}>{bt.han_nop ? new Date(bt.han_nop).toLocaleString('vi-VN') : '—'}</td>
                  <td style={{ padding: '10px 12px' }}>{bt.so_da_nop ?? 0}/{bt.tong_hoc_vien ?? 0}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                      background: bt.trang_thai === 'dang_mo' ? '#d1fae5' : '#fee2e2',
                      color: bt.trang_thai === 'dang_mo' ? '#065f46' : '#991b1b' }}>
                      {bt.trang_thai === 'dang_mo' ? 'Đang mở' : 'Hết hạn'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button onClick={() => openDetail(bt)} style={{ marginRight: '6px', padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', background: '#fff' }}>👁️ Xem</button>
                    <button onClick={() => { setForm({ ten_bai: bt.ten_bai, lop_hoc_id: bt.lop_hoc_id, giao_vien_id: bt.giao_vien_id || 1, loai_bai: bt.loai_bai, noi_dung: bt.noi_dung || '', han_nop: bt.han_nop ? bt.han_nop.slice(0,16) : '', trang_thai: bt.trang_thai }); setEditingBT(bt); setShowModal(true); }}
                      style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', background: '#fff' }}>✏️ Sửa</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal tạo/sửa */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>{editingBT ? 'Sửa bài tập' : 'Tạo bài tập mới'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><label style={labelStyle}>Tên bài *</label>
                <input value={form.ten_bai} onChange={e => setForm(f => ({ ...f, ten_bai: e.target.value }))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Lớp học</label>
                <select value={form.lop_hoc_id} onChange={e => setForm(f => ({ ...f, lop_hoc_id: e.target.value }))} style={inputStyle}>
                  <option value=''>-- Chọn lớp --</option>
                  {lops.map(l => <option key={l.id} value={l.id}>{l.ten_lop}</option>)}
                </select></div>
              <div><label style={labelStyle}>Loại bài</label>
                <select value={form.loai_bai} onChange={e => setForm(f => ({ ...f, loai_bai: e.target.value }))} style={inputStyle}>
                  <option value='homework'>Bài tập (Homework)</option>
                  <option value='speaking'>Speaking</option>
                  <option value='writing'>Writing</option>
                </select></div>
              <div><label style={labelStyle}>Nội dung</label>
                <textarea value={form.noi_dung} onChange={e => setForm(f => ({ ...f, noi_dung: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} /></div>
              <div><label style={labelStyle}>Hạn nộp</label>
                <input type='datetime-local' value={form.han_nop} onChange={e => setForm(f => ({ ...f, han_nop: e.target.value }))} style={inputStyle} /></div>
              <div><label style={labelStyle}>Trạng thái</label>
                <select value={form.trang_thai} onChange={e => setForm(f => ({ ...f, trang_thai: e.target.value }))} style={inputStyle}>
                  <option value='dang_mo'>Đang mở</option>
                  <option value='het_han'>Hết hạn</option>
                </select></div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowModal(false); setEditingBT(null); }} style={{ padding: '8px 18px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', background: '#fff' }}>Hủy</button>
              <button onClick={handleSave} style={{ padding: '8px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>💾 Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Panel chi tiết */}
      {showDetail && selectedBT && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '700px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0 }}>{selectedBT.ten_bai}</h3>
                <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '13px' }}>
                  {loaiBaiConfig[selectedBT.loai_bai]?.label} · Hạn: {selectedBT.han_nop ? new Date(selectedBT.han_nop).toLocaleString('vi-VN') : '—'}
                </p>
              </div>
              <button onClick={() => { setShowDetail(false); setShowChamDiem(null); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            {selectedBT.noi_dung && <p style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{selectedBT.noi_dung}</p>}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  {['Họ tên', 'Trạng thái nộp', 'Điểm', 'Band score', 'Nhận xét', ''].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(selectedBT.hoc_viens || selectedBT.nop_bais || []).map(hv => (
                  <React.Fragment key={hv.hoc_vien_id || hv.id}>
                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 500 }}>{hv.ho_ten || hv.hoc_vien?.ho_ten}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                          background: hv.da_nop ? '#d1fae5' : '#f3f4f6', color: hv.da_nop ? '#065f46' : '#6b7280' }}>
                          {hv.da_nop ? 'Đã nộp' : 'Chưa nộp'}
                        </span>
                      </td>
                      <td style={{ padding: '8px 10px' }}>{hv.diem ?? '—'}</td>
                      <td style={{ padding: '8px 10px' }}>{hv.band_score ?? '—'}</td>
                      <td style={{ padding: '8px 10px', color: '#6b7280', fontSize: '13px' }}>{hv.nhan_xet || '—'}</td>
                      <td style={{ padding: '8px 10px' }}>
                        <button onClick={() => { setShowChamDiem(hv.hoc_vien_id || hv.id); setChamDiemForm({ nop_bai_id: hv.id || '', bai_tap_id: selectedBT.id, hoc_vien_id: hv.hoc_vien_id || hv.id, diem: hv.diem || '', band_score: hv.band_score || '', nhan_xet: hv.nhan_xet || '' }); }}
                          style={{ padding: '4px 10px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Chấm điểm</button>
                      </td>
                    </tr>
                    {showChamDiem === (hv.hoc_vien_id || hv.id) && (
                      <tr style={{ background: '#faf5ff' }}>
                        <td colSpan={6} style={{ padding: '12px 10px' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <input type='number' placeholder='Điểm (0-10)' value={chamDiemForm.diem} onChange={e => setChamDiemForm(f => ({ ...f, diem: e.target.value }))} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', width: '110px' }} />
                            <input placeholder='Band score' value={chamDiemForm.band_score} onChange={e => setChamDiemForm(f => ({ ...f, band_score: e.target.value }))} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', width: '110px' }} />
                            <input placeholder='Nhận xét' value={chamDiemForm.nhan_xet} onChange={e => setChamDiemForm(f => ({ ...f, nhan_xet: e.target.value }))} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', flex: 1, minWidth: '160px' }} />
                            <button onClick={handleChamDiem} style={{ padding: '6px 14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>Lưu</button>
                            <button onClick={() => setShowChamDiem(null)} style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', background: '#fff' }}>Hủy</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
