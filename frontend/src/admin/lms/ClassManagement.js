import { useState, useEffect, Fragment } from 'react';
import { lmsAPI } from '../../api';

const TRANG_THAI = {
  dang_lap:     { label: 'Sắp diễn ra',  color: '#f59e0b', bg: '#fef3c7' },
  dang_dien_ra: { label: 'Đang diễn ra', color: '#10b981', bg: '#d1fae5' },
  ket_thuc:     { label: 'Kết thúc',     color: '#6b7280', bg: '#f3f4f6' },
  huy:          { label: 'Đã hủy',       color: '#ef4444', bg: '#fee2e2' },
};
const THU_OPTIONS = ['Thu2','Thu3','Thu4','Thu5','Thu6','Thu7','CNhat'];
const fmtDate = (s) => { if (!s) return '—'; const d = new Date(s); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; };
const fmtMoney = (n) => n ? Number(n).toLocaleString('vi-VN') + 'đ' : '—';
const KHOA_COLOR = (name='') => { const n=name.toLowerCase(); if(n.includes('pre')) return {bg:'#dbeafe',border:'#3b82f6'}; if(n.includes('found')) return {bg:'#d1fae5',border:'#10b981'}; if(n.includes('stand')) return {bg:'#ede9fe',border:'#8b5cf6'}; if(n.includes('com')) return {bg:'#fee2e2',border:'#e11d48'}; return {bg:'#fef3c7',border:'#f59e0b'}; };
const emptyClassForm = () => ({ ma_lop:'LOP'+String(Date.now()).slice(-6), khoa_hoc_id:'', giao_vien_id:'', phong_hoc_id:'', ngay_bat_dau:'', ngay_ket_thuc:'', so_buoi_tong:30, hoc_phi:'', trang_thai:'dang_lap', lich_hocs:[] });
const emptyDKForm = () => ({ hoc_vien_id:'', hoc_vien_search:'', khoa_hoc_id:'', tong_tien:'', da_tra:'', so_ky_nop:1, co_cam_ket:false, ghi_chu:'', so_khoa_dang_ky:1, phuong_thuc:'tien_mat', ngay_sinh:'', ma_giam_gia:'', ngay_hen_tra:'' });
const inp = { padding:'8px 10px', border:'1px solid #d1d5db', borderRadius:6, fontSize:13, outline:'none', boxSizing:'border-box', width:'100%' };
const lbl = { display:'block', fontSize:12, fontWeight:600, color:'#374151', marginBottom:4 };

export default function ClassManagement() {
  const [lops, setLops] = useState([]);
  const [khoaHocs, setKhoaHocs] = useState([]);
  const [phongHocs, setPhongHocs] = useState([]);
  const [giaoViens, setGiaoViens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [viewMode, setViewMode] = useState('card');
  const [filterTab, setFilterTab] = useState('all');
  const [search, setSearch] = useState('');
  const [showClassModal, setShowClassModal] = useState(false);
  const [classForm, setClassForm] = useState(emptyClassForm());
  const [showDKModal, setShowDKModal] = useState(false);
  const [dkLop, setDkLop] = useState(null);
  const [dkForm, setDkForm] = useState(emptyDKForm());
  const [hvResults, setHvResults] = useState([]);
  const [hvSearching, setHvSearching] = useState(false);
  const [dkSaving, setDkSaving] = useState(false);
  const [showHVModal, setShowHVModal] = useState(false);
  const [hvLop, setHvLop] = useState(null);
  const [hvList, setHvList] = useState([]);
  const [hvLoading, setHvLoading] = useState(false);

  const gvUser = (() => { try { return JSON.parse(localStorage.getItem('gv_user')||'null'); } catch { return null; } })();
  const isGV = gvUser?.chuc_vu_id === 3 && !!localStorage.getItem('gv_token') && !localStorage.getItem('adminUser');

  useEffect(() => { loadAll(); }, []); // eslint-disable-line

  const loadAll = async () => {
    setLoading(true);
    setApiError('');
    try {
      const params = isGV ? { giao_vien_id: gvUser.id } : {};
      const [l,k,p,g] = await Promise.all([
        lmsAPI.getLopHocs(params),
        lmsAPI.getKhoaHocs(),
        lmsAPI.getPhongHocs(),
        lmsAPI.getGiaoViens()
      ]);
      // Kiểm tra lỗi auth
      if (l && l.success === false) {
        setApiError(`Lỗi API: ${l.message || 'Không xác định'}`);
        setLoading(false); return;
      }
      setLops(Array.isArray(l) ? l : (l?.data || []));
      setKhoaHocs(Array.isArray(k) ? k : (k?.data || []));
      setPhongHocs(Array.isArray(p) ? p : (p?.data || []));
      setGiaoViens(Array.isArray(g) ? g : (g?.data || []));
    } catch(e) {
      setApiError(`Không kết nối được server: ${e.message}`);
      console.error(e);
    }
    setLoading(false);
  };

  const openCreate = () => { setClassForm(emptyClassForm()); setShowClassModal(true); };
  const openEdit = (lop, e) => { e.stopPropagation(); setClassForm({...lop, lich_hocs:lop.lichHocs||lop.lich_hocs||[], so_buoi_tong:lop.so_buoi_tong||30, hoc_phi:lop.hoc_phi||''}); setShowClassModal(true); };
  const handleSaveClass = async () => {
    try {
      if (classForm.id) await lmsAPI.updateLopHoc(classForm.id, classForm);
      else await lmsAPI.createLopHoc(classForm);
      setShowClassModal(false); loadAll();
    } catch(e) { alert('Lỗi: '+e.message); }
  };
  const addLich = () => setClassForm(f=>({...f, lich_hocs:[...f.lich_hocs,{thu:'Thu2',gio_bat_dau:'08:00',gio_ket_thuc:'10:00'}]}));
  const removeLich = (i) => setClassForm(f=>({...f, lich_hocs:f.lich_hocs.filter((_,idx)=>idx!==i)}));
  const updateLich = (i,k,v) => setClassForm(f=>({...f, lich_hocs:f.lich_hocs.map((l,idx)=>idx===i?{...l,[k]:v}:l)}));

  const openDangKy = (lop, e) => {
    e.stopPropagation();
    setDkLop(lop);
    const kh = khoaHocs.find(k=>k.id===lop.khoa_hoc_id);
    setDkForm({...emptyDKForm(), khoa_hoc_id:lop.khoa_hoc_id||'', tong_tien:kh?.hoc_phi||lop.hoc_phi||''});
    setHvResults([]); setShowDKModal(true);
  };

  const searchHV = async (q) => {
    setDkForm(f=>({...f, hoc_vien_search:q, hoc_vien_id:''}));
    if (!q||q.length<2) { setHvResults([]); return; }
    setHvSearching(true);
    try {
      const res = await lmsAPI.getHocViens({search:q, limit:10});
      const data = res.data||res;
      setHvResults(Array.isArray(data)?data:(data.hocViens||[]));
    } catch { setHvResults([]); }
    setHvSearching(false);
  };

  const selectHV = (hv) => { setDkForm(f=>({...f, hoc_vien_id:hv.id, hoc_vien_search:`${hv.ho_ten}${hv.sdt?' - '+hv.sdt:''}`})); setHvResults([]); };

  const handleSoDKChange = (val) => {
    const n = parseInt(val)||1;
    setDkForm(f=>({...f, so_khoa_dang_ky:n, co_cam_ket:n>=2?true:f.co_cam_ket}));
  };

  const congNo = () => Math.max(0, Number(dkForm.tong_tien||0) - Number(dkForm.da_tra||0));

  const handleSaveDK = async () => {
    if (!dkForm.hoc_vien_id) { alert('Vui lòng chọn học viên'); return; }
    if (!dkForm.tong_tien) { alert('Vui lòng nhập học phí'); return; }
    setDkSaving(true);
    try {
      await lmsAPI.addHocVienVaoLop({ hoc_vien_id: dkForm.hoc_vien_id, lop_hoc_id: dkLop.id });
      const hdRes = await lmsAPI.createHopDong({
        hoc_vien_id: dkForm.hoc_vien_id,
        lop_hoc_id: dkLop.id,
        khoa_hoc_id: dkForm.khoa_hoc_id || dkLop.khoa_hoc_id,
        tong_tien: Number(dkForm.tong_tien),
        da_tra: Number(dkForm.da_tra)||0,
        so_ky_nop: dkForm.so_ky_nop,
        co_cam_ket: dkForm.co_cam_ket,
        so_khoa_dang_ky: dkForm.so_khoa_dang_ky,
        ghi_chu: dkForm.ghi_chu,
      });
      if (Number(dkForm.da_tra)>0) {
        const hdId = hdRes?.data?.id || hdRes?.id;
        if (hdId) await lmsAPI.createThanhToan({ hop_dong_id:hdId, hoc_vien_id:dkForm.hoc_vien_id, so_tien:Number(dkForm.da_tra), phuong_thuc: dkForm.phuong_thuc||'tien_mat', nguoi_nop_id:dkForm.hoc_vien_id });
      }
      setShowDKModal(false); loadAll();
      alert('✅ Đăng ký học viên thành công!');
    } catch(e) { alert('Lỗi: '+e.message); }
    setDkSaving(false);
  };

  const openHocVien = async (lop, e) => {
    e.stopPropagation();
    setHvLop(lop);
    setHvList([]);
    setShowHVModal(true);
    setHvLoading(true);
    try {
      const res = await lmsAPI.getDangKyByLop(lop.id);
      setHvList(Array.isArray(res) ? res : (res.data || []));
    } catch { setHvList([]); }
    setHvLoading(false);
  };

  const TAB_FILTER = { all:null, dang_lap:'dang_lap', dang_dien_ra:'dang_dien_ra', ket_thuc:'ket_thuc' };
  const filtered = lops.filter(l => {
    const matchTab = !TAB_FILTER[filterTab] || l.trang_thai === TAB_FILTER[filterTab];
    const matchSearch = !search || l.ma_lop?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const stats = { tong:lops.length, sapDienRa:lops.filter(l=>l.trang_thai==='dang_lap').length, dangDienRa:lops.filter(l=>l.trang_thai==='dang_dien_ra').length, ketThuc:lops.filter(l=>l.trang_thai==='ket_thuc').length };

  return (
    <div style={{ padding:24, fontFamily:'system-ui,sans-serif', background:'#f9fafb', minHeight:'100vh' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize:13, color:'#6b7280', marginBottom:16 }}>Lớp học &nbsp;/&nbsp; <span style={{ color:'#111827', fontWeight:600 }}>Danh sách lớp học</span></div>

      {/* Filter tabs + view toggle */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:4, background:'#fff', borderRadius:8, padding:4, border:'1px solid #e5e7eb' }}>
          {[['all',`Tất cả (${stats.tong})`],['dang_lap',`Sắp diễn ra (${stats.sapDienRa})`],['dang_dien_ra',`Đang diễn ra (${stats.dangDienRa})`],['ket_thuc',`Kết thúc (${stats.ketThuc})`]].map(([k,l])=>(
            <button key={k} onClick={()=>setFilterTab(k)}
              style={{ padding:'7px 14px', borderRadius:6, border:'none', cursor:'pointer', fontSize:13, fontWeight:600,
                background:filterTab===k?'#e11d48':'transparent', color:filterTab===k?'#fff':'#374151' }}>{l}</button>
          ))}
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm mã lớp..."
            style={{ padding:'7px 12px', border:'1px solid #d1d5db', borderRadius:8, fontSize:13, outline:'none', width:160 }} />
          <div style={{ display:'flex', border:'1px solid #d1d5db', borderRadius:8, overflow:'hidden' }}>
            {[['card','⊞'],['list','≡']].map(([v,icon])=>(
              <button key={v} onClick={()=>setViewMode(v)}
                style={{ width:36, height:34, border:'none', cursor:'pointer', fontSize:16,
                  background:viewMode===v?'#e11d48':'#fff', color:viewMode===v?'#fff':'#374151' }}>{icon}</button>
            ))}
          </div>
          <button onClick={openCreate}
            style={{ padding:'7px 16px', background:'#e11d48', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>
            + Tạo lớp học
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'#9ca3af' }}>Đang tải...</div>
      ) : apiError ? (
        <div style={{ textAlign:'center', padding:60 }}>
          <div style={{ fontSize:32, marginBottom:12 }}>⚠️</div>
          <div style={{ color:'#dc2626', fontWeight:600, marginBottom:8 }}>{apiError}</div>
          <div style={{ color:'#6b7280', fontSize:13, marginBottom:16 }}>Hãy đảm bảo server backend đang chạy tại <code>localhost:5000</code></div>
          <button onClick={loadAll} style={{ padding:'8px 20px', background:'#e11d48', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 }}>🔄 Thử lại</button>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:60, color:'#9ca3af' }}>Không có lớp học nào</div>
      ) : viewMode === 'card' ? (
        /* ── CARD VIEW ── */
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
          {filtered.map(lop => {
            const kh = khoaHocs.find(k=>k.id===lop.khoa_hoc_id);
            const gv = giaoViens.find(g=>g.id===lop.giao_vien_id);
            const tenKhoa = lop.khoaHoc?.ten_khoa || kh?.ten_khoa || lop.ten_khoa_hoc || '';
            const tenGV = lop.giaoVien?.ho_ten || gv?.ho_ten || '—';
            const c = KHOA_COLOR(tenKhoa || lop.ma_lop);
            const tt = TRANG_THAI[lop.trang_thai] || TRANG_THAI.dang_lap;
            const lichStr = (lop.lichHocs||lop.lich_hocs||[]).map(l=>`${l.thu_trong_tuan||l.thu} ${(l.gio_bat_dau||'').slice(0,5)}`).join(' · ');
            return (
              <div key={lop.id} style={{ background:'#fff', borderRadius:12, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', border:`1px solid ${c.border}30` }}>
                {/* Banner */}
                <div style={{ background:`linear-gradient(135deg, ${c.border}, ${c.border}99)`, padding:'20px 16px', position:'relative', minHeight:80 }}>
                  <span style={{ position:'absolute', top:10, left:10, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700, background:'rgba(255,255,255,0.9)', color:c.border }}>
                    {tt.label}
                  </span>
                  <div style={{ textAlign:'center', color:'#fff', marginTop:8 }}>
                    <div style={{ fontSize:22, fontWeight:900, letterSpacing:1 }}>{tenKhoa.toUpperCase()}</div>
                    {lop.so_buoi_tong > 0 && <div style={{ fontSize:12, opacity:0.85, marginTop:4 }}>{lop.so_buoi_tong} buổi học</div>}
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding:'14px 16px' }}>
                  <div style={{ fontSize:16, fontWeight:800, color:'#111827', marginBottom:4 }}>{lop.ma_lop}</div>
                  <div style={{ fontSize:12, color:'#6b7280', marginBottom:2 }}>{fmtDate(lop.ngay_bat_dau)} – {fmtDate(lop.ngay_ket_thuc)}</div>
                  <div style={{ fontSize:13, color:'#374151', marginBottom:2 }}>Giảng viên: <strong>{tenGV}</strong></div>
                  {lop.so_buoi_da_hoc > 0 && <div style={{ fontSize:12, color:'#6b7280' }}>Đã học: {lop.so_buoi_da_hoc} / {lop.so_buoi_tong||'?'} buổi</div>}
                  {lichStr && <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>🕐 {lichStr}</div>}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12, paddingTop:10, borderTop:'1px solid #f3f4f6' }}>
                    <span style={{ fontSize:13, color:'#374151', cursor:'pointer', textDecoration:'underline', textDecorationStyle:'dotted' }}
                      onClick={e=>openHocVien(lop,e)}>
                      👥 <strong>{lop.si_so_hien_tai||0}</strong> / {lop.si_so_toi_da||12}
                    </span>
                    <span style={{ fontSize:14, fontWeight:700, color:c.border }}>{fmtMoney(lop.hoc_phi||kh?.hoc_phi)}</span>
                  </div>
                  <div style={{ display:'flex', gap:8, marginTop:12 }}>
                    <button onClick={e=>openDangKy(lop,e)}
                      style={{ flex:1, padding:'7px', background:'#e11d48', color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:700, cursor:'pointer' }}>
                      + Đăng ký HV
                    </button>
                    <button onClick={e=>openEdit(lop,e)}
                      style={{ padding:'7px 12px', background:'#f9fafb', color:'#374151', border:'1px solid #e5e7eb', borderRadius:6, fontSize:12, cursor:'pointer' }}>
                      ✏️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── LIST VIEW ── */
        <div style={{ background:'#fff', borderRadius:10, border:'1px solid #e5e7eb', overflow:'hidden' }}>
          {filtered.map((lop, i) => {
            const kh = khoaHocs.find(k=>k.id===lop.khoa_hoc_id);
            const gv = giaoViens.find(g=>g.id===lop.giao_vien_id);
            const tenKhoa = lop.khoaHoc?.ten_khoa || kh?.ten_khoa || lop.ten_khoa_hoc || '';
            const tenGV = lop.giaoVien?.ho_ten || gv?.ho_ten || '—';
            const c = KHOA_COLOR(tenKhoa || lop.ma_lop);
            const tt = TRANG_THAI[lop.trang_thai] || TRANG_THAI.dang_lap;
            return (
              <div key={lop.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 20px', borderBottom: i<filtered.length-1?'1px solid #f3f4f6':'none' }}>
                <div style={{ width:56, height:56, borderRadius:8, background:`linear-gradient(135deg,${c.border},${c.border}88)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <span style={{ fontSize:11, fontWeight:900, color:'#fff', textAlign:'center', lineHeight:1.2 }}>{tenKhoa.slice(0,4).toUpperCase()}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15, color:'#111827' }}>{lop.ma_lop}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>Giảng viên: {tenGV}</div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>Bắt đầu: {fmtDate(lop.ngay_bat_dau)} · Kết thúc: {fmtDate(lop.ngay_ket_thuc)}</div>
                  <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:700, background:tt.bg, color:tt.color }}>{tt.label}</span>
                </div>
                <div style={{ textAlign:'right', minWidth:120 }}>
                  <div style={{ fontSize:13, color:'#374151' }}>Giá: <strong>{fmtMoney(lop.hoc_phi||kh?.hoc_phi)}</strong></div>
                  <div style={{ fontSize:12, color:'#6b7280' }}>Đã học: {lop.so_buoi_da_hoc||0} / {lop.so_buoi_tong||'?'} buổi</div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={e=>openDangKy(lop,e)} style={{ padding:'6px 12px', background:'#e11d48', color:'#fff', border:'none', borderRadius:6, fontSize:12, fontWeight:700, cursor:'pointer' }}>+ ĐK</button>
                  <button onClick={e=>openEdit(lop,e)} style={{ padding:'6px 10px', background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:6, fontSize:12, cursor:'pointer' }}>✏️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Modal đăng ký học viên ── */}
      {showDKModal && dkLop && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
          onClick={e=>e.target===e.currentTarget&&setShowDKModal(false)}>
          <div style={{ background:'#f5f6fa', borderRadius:12, width:900, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.25)' }}>
            {/* Header */}
            <div style={{ background:'#fff', padding:'16px 24px', borderBottom:'1px solid #e5e7eb', display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius:'12px 12px 0 0' }}>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:'#111827' }}>Đăng ký học viên</div>
                <div style={{ fontSize:12, color:'#6b7280', marginTop:2 }}>Lớp: <strong>{dkLop.ma_lop}</strong> · {khoaHocs.find(k=>k.id===dkLop.khoa_hoc_id)?.ten_khoa||''}</div>
              </div>
              <button onClick={()=>setShowDKModal(false)} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#9ca3af' }}>✕</button>
            </div>

            <div style={{ padding:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {/* CỘT TRÁI */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* Thông tin cá nhân */}
                <div style={{ background:'#fff', borderRadius:10, padding:20, border:'1px solid #e5e7eb' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:14 }}>Thông tin cá nhân</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    {/* Học viên - search */}
                    <div style={{ gridColumn:'1/-1', position:'relative' }}>
                      <label style={lbl}>Học viên *</label>
                      <input style={inp} value={dkForm.hoc_vien_search} onChange={e=>searchHV(e.target.value)}
                        placeholder="Tìm theo tên, SĐT, email..." />
                      {hvSearching && <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff', border:'1px solid #e5e7eb', borderRadius:6, padding:8, fontSize:12, color:'#9ca3af', zIndex:10 }}>Đang tìm...</div>}
                      {hvResults.length > 0 && (
                        <div style={{ position:'absolute', top:'100%', left:0, right:0, background:'#fff', border:'1px solid #e5e7eb', borderRadius:6, boxShadow:'0 4px 12px rgba(0,0,0,0.1)', zIndex:10, maxHeight:200, overflowY:'auto' }}>
                          {hvResults.map(hv=>(
                            <div key={hv.id} onClick={()=>selectHV(hv)}
                              style={{ padding:'8px 12px', cursor:'pointer', fontSize:13, borderBottom:'1px solid #f3f4f6' }}
                              onMouseEnter={e=>e.currentTarget.style.background='#f9fafb'}
                              onMouseLeave={e=>e.currentTarget.style.background='#fff'}>
                              <strong>{hv.ho_ten}</strong>
                              {hv.sdt && <span style={{ color:'#6b7280', marginLeft:8 }}>{hv.sdt}</span>}
                              {hv.email && <div style={{ fontSize:11, color:'#9ca3af' }}>{hv.email}</div>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={lbl}>Email</label>
                      <input style={{...inp, background:'#f9fafb', color:'#6b7280'}}
                        value={hvResults.length===0&&dkForm.hoc_vien_id ? (hvResults.find?.(h=>h.id===dkForm.hoc_vien_id)?.email||'') : ''}
                        readOnly placeholder="Tự động điền" />
                    </div>
                    <div>
                      <label style={lbl}>Số điện thoại</label>
                      <input style={{...inp, background:'#f9fafb', color:'#6b7280'}}
                        value={''} readOnly placeholder="Tự động điền" />
                    </div>
                    <div>
                      <label style={lbl}>Ngày sinh</label>
                      <input type="date" style={inp} value={dkForm.ngay_sinh||''} onChange={e=>setDkForm(f=>({...f,ngay_sinh:e.target.value}))} />
                    </div>
                  </div>
                </div>

                {/* Đăng ký học */}
                <div style={{ background:'#fff', borderRadius:10, padding:20, border:'1px solid #e5e7eb' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:14, borderBottom:'2px solid #e11d48', paddingBottom:8 }}>Đăng ký học</div>
                  {/* Lớp học */}
                  <div style={{ marginBottom:12 }}>
                    <label style={lbl}>Lớp học</label>
                    <div style={{ padding:'10px 12px', background:'#f0fdf4', border:'1px solid #86efac', borderRadius:6, fontSize:13 }}>
                      <strong>{dkLop.ma_lop}</strong>
                      <span style={{ color:'#6b7280', marginLeft:8 }}>{khoaHocs.find(k=>k.id===dkLop.khoa_hoc_id)?.ten_khoa}</span>
                      <span style={{ float:'right', color:'#16a34a', fontWeight:700 }}>{fmtMoney(dkLop.hoc_phi)}</span>
                    </div>
                  </div>
                  {/* Số kỳ & cam kết */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                    <div>
                      <label style={lbl}>Số kỳ đóng</label>
                      <select style={inp} value={dkForm.so_ky_nop} onChange={e=>setDkForm(f=>({...f,so_ky_nop:+e.target.value}))}>
                        {[1,2,3,4].map(n=><option key={n} value={n}>{n} kỳ</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Số khóa đăng ký</label>
                      <select style={inp} value={dkForm.so_khoa_dang_ky} onChange={e=>handleSoDKChange(e.target.value)}>
                        {[1,2,3,4,5].map(n=><option key={n} value={n}>{n} khóa</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Cam kết */}
                  <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, cursor:'pointer', marginBottom:4 }}>
                    <input type="checkbox" checked={dkForm.co_cam_ket} onChange={e=>setDkForm(f=>({...f,co_cam_ket:e.target.checked}))} />
                    Có cam kết học {dkForm.so_khoa_dang_ky > 1 && <span style={{ color:'#e11d48', fontSize:11 }}>(bắt buộc khi đăng ký ≥2 khóa)</span>}
                  </label>
                </div>
              </div>

              {/* CỘT PHẢI */}
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* Phương thức thanh toán */}
                <div style={{ background:'#fff', borderRadius:10, padding:20, border:'1px solid #e5e7eb' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:14 }}>Phương thức thanh toán *</div>
                  <div style={{ display:'flex', gap:12, marginBottom:16 }}>
                    {[['chuyen_khoan','💳 Chuyển khoản'],['tien_mat','💵 Tiền mặt']].map(([val,label])=>(
                      <div key={val} onClick={()=>setDkForm(f=>({...f,phuong_thuc:val}))}
                        style={{ flex:1, padding:'12px', border:`2px solid ${dkForm.phuong_thuc===val?'#3b82f6':'#e5e7eb'}`,
                          borderRadius:8, cursor:'pointer', textAlign:'center', fontSize:13, fontWeight:600,
                          background: dkForm.phuong_thuc===val?'#eff6ff':'#fff', color: dkForm.phuong_thuc===val?'#1d4ed8':'#374151' }}>
                        {label}
                      </div>
                    ))}
                  </div>

                  {/* Tổng tiền */}
                  <div style={{ borderTop:'1px solid #f3f4f6', paddingTop:12 }}>
                    {[
                      ['Sản phẩm', fmtMoney(dkLop.hoc_phi)],
                      ['Tổng', fmtMoney(Number(dkForm.tong_tien)||0)],
                    ].map(([k,v])=>(
                      <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
                        <span style={{ color:'#6b7280' }}>{k}</span>
                        <span style={{ fontWeight:600, color:'#e11d48' }}>{v}</span>
                      </div>
                    ))}

                    {/* Mã giảm giá */}
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:12 }}>
                      <span style={{ color:'#6b7280' }}>Mã giảm giá</span>
                      <input style={{ width:140, padding:'4px 8px', border:'1px solid #d1d5db', borderRadius:6, fontSize:12, textAlign:'right' }}
                        value={dkForm.ma_giam_gia||''} onChange={e=>setDkForm(f=>({...f,ma_giam_gia:e.target.value}))} placeholder="Nhập mã..." />
                    </div>

                    <div style={{ marginBottom:10 }}>
                      <label style={lbl}>Thanh toán (đã đặt cọc)</label>
                      <input type="number" style={inp} value={dkForm.da_tra}
                        onChange={e=>setDkForm(f=>({...f,da_tra:e.target.value}))} placeholder="Nhập số tiền thanh toán" />
                    </div>

                    <div style={{ marginBottom:10 }}>
                      <label style={lbl}>Ngày hẹn trả</label>
                      <input type="date" style={inp} value={dkForm.ngay_hen_tra||''} onChange={e=>setDkForm(f=>({...f,ngay_hen_tra:e.target.value}))} />
                    </div>

                    <div style={{ marginBottom:10 }}>
                      <label style={lbl}>Ghi chú</label>
                      <textarea style={{...inp, height:72, resize:'vertical'}} value={dkForm.ghi_chu}
                        onChange={e=>setDkForm(f=>({...f,ghi_chu:e.target.value}))} placeholder="Ghi chú thêm..." />
                    </div>

                    {/* Còn lại */}
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, fontWeight:700, paddingTop:10, borderTop:'1px solid #f3f4f6' }}>
                      <span>Còn lại</span>
                      <span style={{ color:'#e11d48' }}>{fmtMoney(congNo())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ background:'#fff', padding:'14px 24px', borderTop:'1px solid #e5e7eb', display:'flex', justifyContent:'flex-end', gap:10, borderRadius:'0 0 12px 12px' }}>
              <button onClick={()=>setShowDKModal(false)} style={{ padding:'9px 24px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff', fontSize:13, cursor:'pointer' }}>Hủy</button>
              <button onClick={handleSaveDK} disabled={dkSaving}
                style={{ padding:'9px 28px', background:'#e11d48', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer', opacity:dkSaving?0.7:1 }}>
                {dkSaving ? 'Đang lưu...' : '✅ Xác nhận đăng ký'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal tạo/sửa lớp ── */}
      {showClassModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e=>e.target===e.currentTarget&&setShowClassModal(false)}>
          <div style={{ background:'#fff', borderRadius:12, padding:28, width:640, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize:17, fontWeight:800, color:'#e11d48', marginBottom:20 }}>{classForm.id?'Sửa lớp học':'Tạo lớp học mới'}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div><label style={lbl}>Mã lớp *</label><input style={inp} value={classForm.ma_lop} onChange={e=>setClassForm(f=>({...f,ma_lop:e.target.value}))} /></div>
              <div><label style={lbl}>Trạng thái</label>
                <select style={inp} value={classForm.trang_thai} onChange={e=>setClassForm(f=>({...f,trang_thai:e.target.value}))}>
                  {Object.entries(TRANG_THAI).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:'1/-1' }}><label style={lbl}>Khóa học *</label>
                <select style={inp} value={classForm.khoa_hoc_id} onChange={e=>setClassForm(f=>({...f,khoa_hoc_id:e.target.value}))}>
                  <option value="">-- Chọn khóa học --</option>
                  {khoaHocs.map(k=><option key={k.id} value={k.id}>{k.ten_khoa} {k.hoc_phi?`(${fmtMoney(k.hoc_phi)})`:''}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Giảng viên</label>
                <select style={inp} value={classForm.giao_vien_id} onChange={e=>setClassForm(f=>({...f,giao_vien_id:e.target.value}))}>
                  <option value="">-- Chọn --</option>
                  {giaoViens.map(g=><option key={g.id} value={g.id}>{g.ho_ten}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Phòng học</label>
                <select style={inp} value={classForm.phong_hoc_id} onChange={e=>setClassForm(f=>({...f,phong_hoc_id:e.target.value}))}>
                  <option value="">-- Chọn --</option>
                  {phongHocs.map(p=><option key={p.id} value={p.id}>{p.ma_phong}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Ngày bắt đầu</label><input type="date" style={inp} value={classForm.ngay_bat_dau} onChange={e=>setClassForm(f=>({...f,ngay_bat_dau:e.target.value}))} /></div>
              <div><label style={lbl}>Ngày kết thúc</label><input type="date" style={inp} value={classForm.ngay_ket_thuc} onChange={e=>setClassForm(f=>({...f,ngay_ket_thuc:e.target.value}))} /></div>
              <div><label style={lbl}>Tổng số buổi</label><input type="number" style={inp} value={classForm.so_buoi_tong} onChange={e=>setClassForm(f=>({...f,so_buoi_tong:+e.target.value}))} /></div>
              <div><label style={lbl}>Học phí (đ)</label><input type="number" style={inp} value={classForm.hoc_phi} onChange={e=>setClassForm(f=>({...f,hoc_phi:e.target.value}))} placeholder="VD: 8000000" /></div>
            </div>
            {/* Lịch học */}
            <div style={{ marginTop:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ fontSize:13, fontWeight:700, color:'#374151' }}>Lịch học hàng tuần</span>
                <button onClick={addLich} style={{ padding:'5px 12px', background:'#dbeafe', color:'#1d4ed8', border:'none', borderRadius:6, fontSize:12, fontWeight:700, cursor:'pointer' }}>+ Thêm</button>
              </div>
              {classForm.lich_hocs.map((l,i)=>(
                <div key={i} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
                  <select style={{ ...inp, width:100 }} value={l.thu||l.thu_trong_tuan} onChange={e=>updateLich(i,'thu',e.target.value)}>
                    {THU_OPTIONS.map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                  <input type="time" style={{ ...inp, width:110 }} value={l.gio_bat_dau} onChange={e=>updateLich(i,'gio_bat_dau',e.target.value)} />
                  <span style={{ color:'#9ca3af' }}>–</span>
                  <input type="time" style={{ ...inp, width:110 }} value={l.gio_ket_thuc} onChange={e=>updateLich(i,'gio_ket_thuc',e.target.value)} />
                  <button onClick={()=>removeLich(i)} style={{ padding:'5px 10px', background:'#fee2e2', color:'#dc2626', border:'none', borderRadius:6, cursor:'pointer' }}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10, marginTop:24 }}>
              <button onClick={()=>setShowClassModal(false)} style={{ padding:'8px 20px', border:'1px solid #d1d5db', borderRadius:8, background:'#fff', fontSize:13, cursor:'pointer' }}>Hủy</button>
              <button onClick={handleSaveClass} style={{ padding:'8px 20px', background:'#e11d48', color:'#fff', border:'none', borderRadius:8, fontSize:13, fontWeight:700, cursor:'pointer' }}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal xem danh sách học viên ── */}
      {showHVModal && hvLop && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e=>e.target===e.currentTarget&&setShowHVModal(false)}>
          <div style={{ background:'#fff', borderRadius:12, padding:28, width:560, maxHeight:'80vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <div style={{ fontSize:17, fontWeight:800, color:'#e11d48' }}>Danh sách học viên</div>
                <div style={{ fontSize:13, color:'#6b7280', marginTop:2 }}>{hvLop.ma_lop} · {hvList.length}/{hvLop.si_so_toi_da||12} học viên</div>
              </div>
              <button onClick={()=>setShowHVModal(false)} style={{ background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#9ca3af' }}>✕</button>
            </div>
            {hvLoading ? (
              <div style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Đang tải...</div>
            ) : hvList.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>Chưa có học viên nào trong lớp này</div>
            ) : (
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'#f9fafb' }}>
                    <th style={{ padding:'8px 12px', textAlign:'left', fontWeight:700, color:'#374151', borderBottom:'1px solid #e5e7eb' }}>#</th>
                    <th style={{ padding:'8px 12px', textAlign:'left', fontWeight:700, color:'#374151', borderBottom:'1px solid #e5e7eb' }}>Họ tên</th>
                    <th style={{ padding:'8px 12px', textAlign:'left', fontWeight:700, color:'#374151', borderBottom:'1px solid #e5e7eb' }}>SĐT</th>
                    <th style={{ padding:'8px 12px', textAlign:'left', fontWeight:700, color:'#374151', borderBottom:'1px solid #e5e7eb' }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {hvList.map((dk, i) => {
                    const hv = dk.hocVien || dk;
                    return (
                      <tr key={dk.id||i} style={{ borderBottom:'1px solid #f3f4f6' }}>
                        <td style={{ padding:'10px 12px', color:'#9ca3af' }}>{i+1}</td>
                        <td style={{ padding:'10px 12px', fontWeight:600, color:'#111827' }}>{hv.ho_ten||'—'}</td>
                        <td style={{ padding:'10px 12px', color:'#6b7280' }}>{hv.sdt||'—'}</td>
                        <td style={{ padding:'10px 12px' }}>
                          <span style={{ padding:'2px 8px', borderRadius:20, fontSize:11, fontWeight:700,
                            background: dk.trang_thai==='da_xac_nhan'?'#d1fae5':'#fef3c7',
                            color: dk.trang_thai==='da_xac_nhan'?'#065f46':'#92400e' }}>
                            {dk.trang_thai==='da_xac_nhan'?'Đã xác nhận':'Chờ xác nhận'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
