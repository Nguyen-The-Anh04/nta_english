import React, { useState, useEffect } from "react";
import { lmsAPI } from "../../api";

const inp = { width:"100%", padding:"10px 14px", border:"1px solid #d1d5db", borderRadius:8, fontSize:14, outline:"none", boxSizing:"border-box" };
const lbl = { display:"block", fontSize:13, fontWeight:600, color:"#374151", marginBottom:6 };
const fmtMoney = n => n ? Number(n).toLocaleString("vi-VN") : "0";
const fmtDate = s => { if (!s) return "—"; const d = new Date(s); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")} ${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; };

const TH = { padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:700, color:"#fff", background:"#e11d48", borderRight:"1px solid rgba(255,255,255,0.2)", whiteSpace:"nowrap" };
const TD = { padding:"10px 14px", fontSize:13, borderBottom:"1px solid #f3f4f6", verticalAlign:"top" };

const PAGE_SIZE = 30;

const PHUONG_THUC = ["tien_mat","chuyen_khoan","vnpay","momo"];
const PHUONG_THUC_LABEL = { tien_mat:"Tiền mặt", chuyen_khoan:"Chuyển khoản", vnpay:"VNPay", momo:"MoMo" };

export default function PaymentManagement() {
  const [hds, setHds] = useState([]);
  const [hvList, setHvList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(null); // id hợp đồng đang mở

  // Modal chi tiết
  const [detailHd, setDetailHd] = useState(null);

  // Modal tạo phiên thanh toán
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ hoc_vien_id:"", trung_tam:"CS Mỹ Hảo", so_tien:"", ghi_chu:"" });

  // Modal thanh toán
  const [showPay, setShowPay] = useState(null); // hd object
  const [payForm, setPayForm] = useState({ so_tien:"", phuong_thuc:"", ngay_tiep_theo:"", ngay_tt:"", ghi_chu:"" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      lmsAPI.getHopDongs({}),
      lmsAPI.getHocViens({ limit:200 }),
    ]).then(([hdRes, hvRes]) => {
      setHds(Array.isArray(hdRes) ? hdRes : (hdRes.data || []));
      const hvData = hvRes.data || hvRes;
      setHvList(Array.isArray(hvData) ? hvData : (hvData.hocViens || []));
    }).finally(() => setLoading(false));
  }, []);

  const reload = () => {
    lmsAPI.getHopDongs({}).then(r => setHds(Array.isArray(r) ? r : (r.data || [])));
  };

  const filtered = hds.filter(hd => {
    const q = search.toLowerCase();
    const hv = hd.hocVien || {};
    return !q || (hv.ho_ten||"").toLowerCase().includes(q) || (hd.ma_hd||"").toLowerCase().includes(q) || (hv.sdt||"").includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const handlePay = async () => {
    if (!payForm.so_tien || !payForm.phuong_thuc || !payForm.ngay_tt) { alert("Vui lòng điền đầy đủ thông tin bắt buộc"); return; }
    setSaving(true);
    try {
      await lmsAPI.createThanhToan({
        hop_dong_id: showPay.id,
        hoc_vien_id: showPay.hoc_vien_id,
        so_tien: Number(payForm.so_tien),
        phuong_thuc: payForm.phuong_thuc,
        nguoi_nop_id: showPay.hoc_vien_id,
        ghi_chu: payForm.ghi_chu,
      });
      setShowPay(null);
      reload();
    } catch(e) { alert("Lỗi: " + e.message); }
    setSaving(false);
  };

  const handleCreate = async () => {
    if (!createForm.hoc_vien_id || !createForm.so_tien) { alert("Vui lòng điền đầy đủ thông tin bắt buộc"); return; }
    setSaving(true);
    try {
      const maHd = "B" + Date.now().toString().slice(-10);
      await lmsAPI.createHopDong({
        ma_hd: maHd,
        hoc_vien_id: Number(createForm.hoc_vien_id),
        khoa_hoc_id: 1,
        tong_tien: Number(createForm.so_tien),
        da_tra: 0,
        ghi_chu: createForm.ghi_chu,
      });
      setShowCreate(false);
      setCreateForm({ hoc_vien_id:"", trung_tam:"CS Mỹ Hảo", so_tien:"", ghi_chu:"" });
      reload();
    } catch(e) { alert("Lỗi: " + e.message); }
    setSaving(false);
  };

  return (
    <div style={{ fontFamily:"system-ui,sans-serif" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize:12, color:"#9ca3af", marginBottom:16 }}>
        Tài chính &nbsp;/&nbsp; <strong style={{ color:"#111827" }}>Quản lý thanh toán</strong>
      </div>

      {/* Filter bar */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, border:"1px solid #d1d5db", borderRadius:6, padding:"6px 12px", background:"#fff", minWidth:200 }}>
          <span style={{ color:"#9ca3af", fontSize:13 }}>▼</span>
          <span style={{ fontSize:13, color:"#374151" }}>Tất cả ({filtered.length})</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, border:"1px solid #d1d5db", borderRadius:6, padding:"6px 12px", background:"#fff", flex:1, maxWidth:320 }}>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Tìm kiếm"
            style={{ border:"none", outline:"none", fontSize:13, flex:1 }} />
          <span style={{ color:"#9ca3af" }}>🔍</span>
        </div>
        <button onClick={()=>setShowCreate(true)}
          style={{ marginLeft:"auto", padding:"8px 18px", background:"#16a34a", color:"#fff", border:"none", borderRadius:6, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
          ⊕ Thêm mới
        </button>
      </div>

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:8, border:"1px solid #e5e7eb", overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
            <thead>
              <tr>
                <th style={{...TH, width:32}}></th>
                <th style={TH}></th>
                <th style={TH}>Người thanh toán</th>
                <th style={TH}>Thanh toán</th>
                <th style={TH}>Giảm giá</th>
                <th style={{...TH, borderRight:"none"}}></th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Đang tải...</td></tr>
                : paged.length === 0
                  ? <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Không có dữ liệu</td></tr>
                  : paged.map((hd, i) => {
                    const hv = hd.hocVien || {};
                    const maHV = `HV${String(hv.id||0).padStart(10,"0")}`;
                    const conNo = Math.max(0, Number(hd.tong_tien||0) - Number(hd.da_tra||0));
                    const isExpanded = expanded === hd.id;
                    return (
                      <React.Fragment key={hd.id}>
                        <tr style={{ background: isExpanded ? "#fffbeb" : i%2===0?"#fff":"#fafafa", cursor:"pointer" }}
                          onClick={() => setExpanded(isExpanded ? null : hd.id)}>
                          <td style={{...TD, fontSize:16, color:"#9ca3af", textAlign:"center" }}>{isExpanded ? "−" : "+"}</td>
                          <td style={TD}>
                            <div style={{ fontSize:12, color:"#374151", fontWeight:600 }}>Mã: {hd.ma_hd}</div>
                            <span style={{ padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:700, background:"#dbeafe", color:"#1d4ed8" }}>Đăng ký học</span>
                          </td>
                          <td style={TD}>
                            <div style={{ color:"#2563eb", fontWeight:600, cursor:"pointer" }}>{hv.ho_ten||"—"}</div>
                            <div style={{ fontSize:11, color:"#9ca3af" }}>Mã: {maHV}</div>
                          </td>
                          <td style={TD}>
                            <div style={{ fontSize:13 }}>Tổng: <span style={{ color:"#e11d48", fontWeight:700 }}>{fmtMoney(hd.tong_tien)}</span></div>
                            <div style={{ fontSize:13 }}>Đã thanh toán: <span style={{ color:"#e11d48", fontWeight:700 }}>{fmtMoney(hd.da_tra)}</span></div>
                            <div style={{ fontSize:13 }}>Chưa thanh toán: <span style={{ color: conNo>0?"#e11d48":"#374151", fontWeight:700 }}>{fmtMoney(conNo)}</span></div>
                          </td>
                          <td style={TD}>
                            {hd.ghi_chu && <div style={{ fontSize:12, color:"#374151" }}>{hd.ghi_chu}</div>}
                          </td>
                          <td style={{...TD, borderRight:"none"}}>
                            <div style={{ display:"flex", gap:6, justifyContent:"flex-end" }}>
                              <button onClick={e=>{e.stopPropagation();setDetailHd(hd);}}
                                style={{ width:28, height:28, borderRadius:"50%", background:"#e11d48", border:"none", color:"#fff", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>ℹ</button>
                              <button onClick={e=>{e.stopPropagation();setShowPay(hd);setPayForm({so_tien:"",phuong_thuc:"",ngay_tiep_theo:"",ngay_tt:"",ghi_chu:""});}}
                                style={{ width:28, height:28, borderRadius:4, background:"#2563eb", border:"none", color:"#fff", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>💳</button>
                            </div>
                          </td>
                        </tr>
                        {/* Expanded row */}
                        {isExpanded && (
                          <tr key={`exp-${hd.id}`}>
                            <td colSpan={6} style={{ padding:"0 16px 16px 48px", background:"#fffbeb" }}>
                              {hd.ghi_chu && <div style={{ fontSize:13, color:"#374151", marginBottom:12 }}><strong>Ghi chú:</strong> {hd.ghi_chu}</div>}
                              <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #e5e7eb", borderRadius:6, overflow:"hidden" }}>
                                <thead>
                                  <tr>
                                    {["Lớp","Chương trình học","Giá tiền","Tổng số tiền","Số lượng"].map(h=>(
                                      <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:12, fontWeight:700, color:"#fff", background:"#e11d48", borderRight:"1px solid rgba(255,255,255,0.2)" }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td style={{ padding:"8px 12px", fontSize:13, color:"#2563eb", fontWeight:600 }}>—</td>
                                    <td style={{ padding:"8px 12px", fontSize:13, color:"#2563eb" }}>{hd.khoaHoc?.ten_khoa||"—"}</td>
                                    <td style={{ padding:"8px 12px", fontSize:13 }}>{fmtMoney(hd.tong_tien)}</td>
                                    <td style={{ padding:"8px 12px", fontSize:13 }}>{fmtMoney(hd.tong_tien)}</td>
                                    <td style={{ padding:"8px 12px", fontSize:13 }}>1</td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:6, padding:"12px 16px", borderTop:"1px solid #f3f4f6", fontSize:13, color:"#6b7280" }}>
          <span>Tổng cộng: {filtered.length}</span>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
            style={{ width:28, height:28, border:"1px solid #d1d5db", borderRadius:4, background:"#fff", cursor:"pointer" }}>‹</button>
          {Array.from({length:Math.min(5,totalPages)},(_,i)=>i+1).map(p=>(
            <button key={p} onClick={()=>setPage(p)}
              style={{ width:28, height:28, border:`1px solid ${page===p?"#e11d48":"#d1d5db"}`, borderRadius:4, background:"#fff", cursor:"pointer", fontWeight:page===p?700:400, color:page===p?"#e11d48":"#374151" }}>{p}</button>
          ))}
          {totalPages > 5 && <><span>···</span><button onClick={()=>setPage(totalPages)} style={{ width:28, height:28, border:"1px solid #d1d5db", borderRadius:4, background:"#fff", cursor:"pointer" }}>{totalPages}</button></>}
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
            style={{ width:28, height:28, border:"1px solid #d1d5db", borderRadius:4, background:"#fff", cursor:"pointer" }}>›</button>
        </div>
      </div>

      {/* ── Modal chi tiết ── */}
      {detailHd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={()=>setDetailHd(null)}>
          <div style={{ background:"#fff", borderRadius:12, padding:32, width:520, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div style={{ fontSize:18, fontWeight:800, color:"#111827" }}>Mã đơn: {detailHd.ma_hd}</div>
              <button onClick={()=>setDetailHd(null)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>✕</button>
            </div>
            <div style={{ marginBottom:16, paddingBottom:16, borderBottom:"1px solid #f3f4f6" }}>
              <div style={{ fontSize:14, marginBottom:6 }}>Tổng tiền: <strong>{fmtMoney(detailHd.tong_tien)}</strong></div>
              <div style={{ fontSize:14, marginBottom:6 }}>Đã thanh toán: <strong>{fmtMoney(detailHd.da_tra)}</strong></div>
              <div style={{ fontSize:14 }}>Chưa thanh toán: <strong>{fmtMoney(Math.max(0,Number(detailHd.tong_tien)-Number(detailHd.da_tra)))}</strong></div>
            </div>
            {detailHd.ghi_chu && (
              <div style={{ marginBottom:16, paddingBottom:16, borderBottom:"1px solid #f3f4f6" }}>
                <div style={{ fontSize:14 }}>Mã giảm giá: <strong>{detailHd.ghi_chu}</strong></div>
                <div style={{ fontSize:14 }}>Giảm giá: <strong>—</strong></div>
              </div>
            )}
            {[
              { icon:"👤", label:"Người thanh toán", val: `${detailHd.hocVien?.ho_ten||"—"}`, sub:`Mã: HV${String(detailHd.hoc_vien_id||0).padStart(10,"0")}` },
              { icon:"👤+", label:"Người tạo", val:"NTA ENGLISH", sub:`Ngày tạo: ${fmtDate(detailHd.created_at)}` },
              { icon:"👤✏", label:"Cập nhật gần nhất", val:"NTA ENGLISH", sub:`Thời gian: ${fmtDate(detailHd.created_at)}` },
            ].map((item,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:16 }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>👤</div>
                <div>
                  <div style={{ fontSize:13, color:"#374151" }}>{item.label}: <strong>{item.val}</strong></div>
                  <div style={{ fontSize:12, color:"#9ca3af" }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal tạo phiên thanh toán ── */}
      {showCreate && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={()=>setShowCreate(false)}>
          <div style={{ background:"#fff", borderRadius:12, padding:32, width:560, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div style={{ fontSize:18, fontWeight:800, color:"#111827" }}>Tạo phiên thanh toán</div>
              <button onClick={()=>setShowCreate(false)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>✕</button>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Học viên <span style={{ color:"#e11d48" }}>*</span></label>
              <select style={inp} value={createForm.hoc_vien_id} onChange={e=>setCreateForm(f=>({...f,hoc_vien_id:e.target.value}))}>
                <option value="">Chọn học viên</option>
                {hvList.map(hv=><option key={hv.id} value={hv.id}>{hv.ho_ten} - {hv.sdt||hv.email}</option>)}
              </select>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <div>
                <label style={lbl}>Trung tâm thanh toán <span style={{ color:"#e11d48" }}>*</span></label>
                <select style={inp} value={createForm.trung_tam} onChange={e=>setCreateForm(f=>({...f,trung_tam:e.target.value}))}>
                  <option>CS Mỹ Hảo</option>
                  <option>CS Khác</option>
                </select>
              </div>
              <div>
                <label style={lbl}>Số tiền</label>
                <input type="number" style={inp} value={createForm.so_tien} onChange={e=>setCreateForm(f=>({...f,so_tien:e.target.value}))} placeholder="Nhập số tiền" />
              </div>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={lbl}>Ghi chú</label>
              <textarea style={{...inp, height:120, resize:"vertical"}} value={createForm.ghi_chu} onChange={e=>setCreateForm(f=>({...f,ghi_chu:e.target.value}))} />
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:12 }}>
              <button onClick={()=>setShowCreate(false)}
                style={{ padding:"10px 28px", background:"#e11d48", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                ⊗ Hủy
              </button>
              <button onClick={handleCreate} disabled={saving}
                style={{ padding:"10px 28px", background:"#2563eb", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, opacity:saving?0.7:1 }}>
                💾 Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal thanh toán ── */}
      {showPay && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={()=>setShowPay(null)}>
          <div style={{ background:"#fff", borderRadius:12, padding:32, width:560, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div style={{ fontSize:18, fontWeight:800, color:"#111827" }}>Thanh toán</div>
              <button onClick={()=>setShowPay(null)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>✕</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
              <div>
                <label style={lbl}>Số tiền thanh toán</label>
                <input type="number" style={inp} value={payForm.so_tien} onChange={e=>setPayForm(f=>({...f,so_tien:e.target.value}))} placeholder="Số tiền thanh toán" />
              </div>
              <div>
                <label style={lbl}>Phương thức thanh toán <span style={{ color:"#e11d48" }}>*</span></label>
                <select style={inp} value={payForm.phuong_thuc} onChange={e=>setPayForm(f=>({...f,phuong_thuc:e.target.value}))}>
                  <option value="">Chọn phương thức</option>
                  {PHUONG_THUC.map(p=><option key={p} value={p}>{PHUONG_THUC_LABEL[p]}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Ngày thanh toán tiếp theo</label>
              <div style={{ position:"relative" }}>
                <input type="date" style={inp} value={payForm.ngay_tiep_theo} onChange={e=>setPayForm(f=>({...f,ngay_tiep_theo:e.target.value}))} placeholder="Chọn ngày" />
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={lbl}>Ngày thanh toán <span style={{ color:"#e11d48" }}>*</span></label>
              <input type="date" style={inp} value={payForm.ngay_tt} onChange={e=>setPayForm(f=>({...f,ngay_tt:e.target.value}))} placeholder="Chọn ngày" />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={lbl}>Ghi chú</label>
              <textarea style={{...inp, height:120, resize:"vertical"}} value={payForm.ghi_chu} onChange={e=>setPayForm(f=>({...f,ghi_chu:e.target.value}))} />
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:12 }}>
              <button onClick={()=>setShowPay(null)}
                style={{ padding:"10px 28px", background:"#e11d48", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
                ⊗ Hủy
              </button>
              <button onClick={handlePay} disabled={saving}
                style={{ padding:"10px 28px", background:"#2563eb", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6, opacity:saving?0.7:1 }}>
                💾 Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
