import { useState, useEffect } from "react";

const API = "http://localhost:5000/api/supplier";
const BOOKS_API = "http://localhost:5000/api/books";
const token = () => localStorage.getItem("token");
const get = (url) => fetch(url, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json());
const post = (path, data) => fetch(`${API}${path}`, { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token()}` }, body:JSON.stringify(data) }).then(r=>r.json());
const del = (path) => fetch(`${API}${path}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token()}` } }).then(r=>r.json());

const fmtMoney = n => n ? Number(n).toLocaleString("vi-VN")+"đ" : "0đ";
const fmtDate = s => { if(!s) return "—"; const d=new Date(s); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; };
const TH = { padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:700, color:"#fff", background:"#e11d48", borderRight:"1px solid rgba(255,255,255,0.2)" };
const TD = { padding:"10px 14px", fontSize:13, borderBottom:"1px solid #f3f4f6", borderRight:"1px solid #e5e7eb", verticalAlign:"middle" };
const inp = { width:"100%", padding:"9px 12px", border:"1px solid #d1d5db", borderRadius:6, fontSize:13, outline:"none", boxSizing:"border-box" };
const lbl = { display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:4 };

export default function ImportInvoice() {
  const [list, setList] = useState([]);
  const [nccs, setNccs] = useState([]);
  const [sachs, setSachs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [filterNcc, setFilterNcc] = useState("");
  const [form, setForm] = useState({
    nha_cung_cap_id: "", ngay_nhap: new Date().toISOString().split("T")[0],
    ghi_chu: "", chi_tiets: [{ sach_id:"", so_luong:1, don_gia:"" }]
  });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      get(`${API}/hoa-don-nhap`),
      get(`${API}/nha-cung-cap`),
      fetch(BOOKS_API).then(r=>r.json()),
    ]).then(([hdnRes, nccRes, sachRes]) => {
      setList(hdnRes.data || []);
      setNccs(nccRes.data || []);
      const books = sachRes.data?.books || sachRes.data || (Array.isArray(sachRes) ? sachRes : []);
      setSachs(books);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Khi chọn NCC → lọc sách của NCC đó
  const sachOfSelectedNcc = form.nha_cung_cap_id
    ? sachs.filter(s => s.nha_cung_cap_id === Number(form.nha_cung_cap_id))
    : sachs;

  const addItem = () => setForm(f => ({ ...f, chi_tiets: [...f.chi_tiets, { sach_id:"", so_luong:1, don_gia:"" }] }));
  const removeItem = (i) => setForm(f => ({ ...f, chi_tiets: f.chi_tiets.filter((_,idx)=>idx!==i) }));
  const updateItem = (i, k, v) => {
    setForm(f => {
      const items = f.chi_tiets.map((item,idx) => {
        if (idx !== i) return item;
        const updated = { ...item, [k]: v };
        // Tự điền giá nhập khi chọn sách
        if (k === "sach_id" && v) {
          const sach = sachs.find(s => s.id === Number(v));
          if (sach && !item.don_gia) updated.don_gia = sach.gia_nhap || "";
        }
        return updated;
      });
      return { ...f, chi_tiets: items };
    });
  };

  const tongTien = form.chi_tiets.reduce((s,item) => s + Number(item.so_luong||0)*Number(item.don_gia||0), 0);

  const handleSave = async () => {
    if (!form.nha_cung_cap_id || !form.ngay_nhap) { alert("Vui lòng chọn nhà cung cấp và ngày nhập"); return; }
    if (form.chi_tiets.some(i => !i.sach_id || !i.don_gia)) { alert("Vui lòng điền đầy đủ thông tin sách"); return; }
    setSaving(true);
    try {
      const res = await post("/hoa-don-nhap", form);
      if (res.success) {
        setShowModal(false);
        load();
        alert("✅ " + res.message + "\nTồn kho đã được cập nhật tự động.");
      } else alert("Lỗi: " + res.message);
    } catch(e) { alert("Lỗi: " + e.message); }
    setSaving(false);
  };

  const handleDelete = async (id, ma) => {
    if (!window.confirm(`Xóa hoá đơn ${ma}?\nTồn kho sẽ được hoàn lại.`)) return;
    const res = await del(`/hoa-don-nhap/${id}`);
    if (res.success) { load(); alert("✅ " + res.message); }
    else alert("Lỗi: " + res.message);
  };

  const openDetail = async (id) => {
    const res = await get(`${API}/hoa-don-nhap/${id}`);
    if (res.success) setShowDetail(res.data);
  };

  const filtered = filterNcc ? list.filter(h => h.nha_cung_cap_id === Number(filterNcc)) : list;
  const tongNhap = filtered.reduce((s,h) => s+Number(h.tong_tien||0), 0);

  return (
    <div style={{ fontFamily:"system-ui,sans-serif" }}>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
        {[
          { label:"Tổng hoá đơn", val:filtered.length, color:"#1d4ed8" },
          { label:"Tổng giá trị nhập", val:fmtMoney(tongNhap), color:"#16a34a" },
          { label:"Nhà cung cấp", val:nccs.length, color:"#e11d48" },
        ].map(s=>(
          <div key={s.label} style={{ background:"#fff", borderRadius:8, padding:"14px 18px", border:"1px solid #e5e7eb" }}>
            <div style={{ fontSize:12, color:"#6b7280" }}>{s.label}</div>
            <div style={{ fontSize:20, fontWeight:800, color:s.color, marginTop:4 }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filter + Button */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, gap:10 }}>
        <select value={filterNcc} onChange={e=>setFilterNcc(e.target.value)}
          style={{ padding:"7px 12px", border:"1px solid #d1d5db", borderRadius:6, fontSize:13, outline:"none", minWidth:220 }}>
          <option value="">Tất cả nhà cung cấp</option>
          {nccs.map(n=><option key={n.id} value={n.id}>{n.ten_ncc}</option>)}
        </select>
        <button onClick={()=>{ setForm({ nha_cung_cap_id:"", ngay_nhap:new Date().toISOString().split("T")[0], ghi_chu:"", chi_tiets:[{sach_id:"",so_luong:1,don_gia:""}] }); setShowModal(true); }}
          style={{ padding:"8px 18px", background:"#e11d48", color:"#fff", border:"none", borderRadius:6, fontSize:13, fontWeight:700, cursor:"pointer" }}>
          + Tạo hoá đơn nhập
        </button>
      </div>

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:8, border:"1px solid #e5e7eb", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <th style={TH}>Mã hoá đơn</th>
              <th style={TH}>Nhà cung cấp</th>
              <th style={TH}>Ngày nhập</th>
              <th style={TH}>Số loại sách</th>
              <th style={TH}>Tổng tiền</th>
              <th style={TH}>Trạng thái</th>
              <th style={{...TH, borderRight:"none"}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Đang tải...</td></tr>
              : filtered.length === 0
                ? <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Chưa có hoá đơn nhập</td></tr>
                : filtered.map((hdn, i) => (
                  <tr key={hdn.id} style={{ background: i%2===0?"#fff":"#fafafa" }}>
                    <td style={{...TD, fontWeight:700, color:"#e11d48"}}>{hdn.ma_hdn}</td>
                    <td style={{...TD, fontWeight:600}}>{hdn.ten_ncc||"—"}</td>
                    <td style={TD}>{fmtDate(hdn.ngay_nhap)}</td>
                    <td style={{...TD, textAlign:"center"}}>—</td>
                    <td style={{...TD, fontWeight:700, color:"#16a34a"}}>{fmtMoney(hdn.tong_tien)}</td>
                    <td style={TD}>
                      <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700, background:"#d1fae5", color:"#065f46" }}>Đã nhập</span>
                    </td>
                    <td style={{...TD, borderRight:"none"}}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={()=>openDetail(hdn.id)}
                          style={{ padding:"4px 10px", background:"#dbeafe", color:"#1d4ed8", border:"none", borderRadius:4, fontSize:12, cursor:"pointer" }}>👁 Chi tiết</button>
                        <button onClick={()=>handleDelete(hdn.id, hdn.ma_hdn)}
                          style={{ padding:"4px 10px", background:"#fee2e2", color:"#991b1b", border:"none", borderRadius:4, fontSize:12, cursor:"pointer" }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Modal tạo hoá đơn */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
          onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={{ background:"#fff", borderRadius:12, padding:28, width:720, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:17, fontWeight:800, color:"#e11d48", marginBottom:20 }}>Tạo hoá đơn nhập hàng</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
              <div>
                <label style={lbl}>Nhà cung cấp *</label>
                <select style={inp} value={form.nha_cung_cap_id} onChange={e=>setForm(f=>({...f,nha_cung_cap_id:e.target.value,chi_tiets:[{sach_id:"",so_luong:1,don_gia:""}]}))}>
                  <option value="">-- Chọn nhà cung cấp --</option>
                  {nccs.map(n=><option key={n.id} value={n.id}>{n.ma_ncc} - {n.ten_ncc}</option>)}
                </select>
                {form.nha_cung_cap_id && (
                  <div style={{ fontSize:11, color:"#6b7280", marginTop:4 }}>
                    Hiển thị {sachOfSelectedNcc.length} sản phẩm của NCC này
                  </div>
                )}
              </div>
              <div>
                <label style={lbl}>Ngày nhập *</label>
                <input type="date" style={inp} value={form.ngay_nhap} onChange={e=>setForm(f=>({...f,ngay_nhap:e.target.value}))} />
              </div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={lbl}>Ghi chú</label>
                <input style={inp} value={form.ghi_chu} onChange={e=>setForm(f=>({...f,ghi_chu:e.target.value}))} placeholder="Ghi chú hoá đơn..." />
              </div>
            </div>

            {/* Chi tiết sách */}
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ fontSize:14, fontWeight:700 }}>Danh sách sách nhập</span>
                <button onClick={addItem} style={{ padding:"5px 12px", background:"#dbeafe", color:"#1d4ed8", border:"none", borderRadius:6, fontSize:12, fontWeight:700, cursor:"pointer" }}>+ Thêm sách</button>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #e5e7eb" }}>
                <thead>
                  <tr style={{ background:"#f9fafb" }}>
                    {["Sách","Tồn kho hiện tại","Số lượng nhập","Đơn giá nhập","Thành tiền",""].map(h=>(
                      <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:12, fontWeight:700, color:"#6b7280", borderBottom:"1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {form.chi_tiets.map((item, i) => {
                    const selectedSach = sachs.find(s => s.id === Number(item.sach_id));
                    return (
                      <tr key={i}>
                        <td style={{ padding:"6px 8px", minWidth:200 }}>
                          <select style={{...inp}} value={item.sach_id} onChange={e=>updateItem(i,"sach_id",e.target.value)}>
                            <option value="">-- Chọn sách --</option>
                            {sachOfSelectedNcc.map(s=>(
                              <option key={s.id} value={s.id}>{s.ten_sach} {s.so_luong_ton<=5?"⚠️":""}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ padding:"6px 8px", width:100, textAlign:"center" }}>
                          {selectedSach ? (
                            <span style={{ fontWeight:700, color: selectedSach.so_luong_ton<=5?"#dc2626":"#16a34a" }}>
                              {selectedSach.so_luong_ton}
                            </span>
                          ) : "—"}
                        </td>
                        <td style={{ padding:"6px 8px", width:90 }}>
                          <input type="number" style={inp} value={item.so_luong} min={1} onChange={e=>updateItem(i,"so_luong",e.target.value)} />
                        </td>
                        <td style={{ padding:"6px 8px", width:140 }}>
                          <input type="number" style={inp} value={item.don_gia} placeholder="VD: 85000" onChange={e=>updateItem(i,"don_gia",e.target.value)} />
                        </td>
                        <td style={{ padding:"6px 8px", width:120, fontWeight:600, color:"#16a34a" }}>
                          {fmtMoney(Number(item.so_luong||0)*Number(item.don_gia||0))}
                        </td>
                        <td style={{ padding:"6px 8px", width:40 }}>
                          {form.chi_tiets.length > 1 && (
                            <button onClick={()=>removeItem(i)} style={{ background:"#fee2e2", border:"none", borderRadius:4, color:"#dc2626", cursor:"pointer", padding:"4px 8px" }}>✕</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div style={{ textAlign:"right", marginTop:10, fontSize:15, fontWeight:700 }}>
                Tổng cộng: <span style={{ color:"#e11d48" }}>{fmtMoney(tongTien)}</span>
              </div>
            </div>

            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:12, marginBottom:16, fontSize:12, color:"#92400e" }}>
              ⚠️ Sau khi xác nhận, tồn kho của các sách sẽ được cộng thêm số lượng nhập tương ứng.
            </div>

            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
              <button onClick={()=>setShowModal(false)} style={{ padding:"8px 20px", border:"1px solid #d1d5db", borderRadius:8, background:"#fff", cursor:"pointer" }}>Hủy</button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding:"8px 20px", background:"#e11d48", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", opacity:saving?0.7:1 }}>
                {saving?"Đang lưu...":"✅ Xác nhận nhập hàng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết hoá đơn */}
      {showDetail && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={()=>setShowDetail(null)}>
          <div style={{ background:"#fff", borderRadius:12, padding:28, width:640, maxHeight:"85vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:"#e11d48" }}>Hoá đơn nhập: {showDetail.ma_hdn}</div>
                <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Ngày nhập: {fmtDate(showDetail.ngay_nhap)}</div>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <button
                  onClick={() => {
                    const printContent = document.getElementById("print-invoice");
                    const w = window.open("", "_blank", "width=800,height=600");
                    w.document.write(`
                      <html><head><title>Hoá đơn nhập ${showDetail.ma_hdn}</title>
                      <style>
                        body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
                        h2 { color: #e11d48; margin-bottom: 4px; }
                        .sub { color: #888; font-size: 13px; margin-bottom: 20px; }
                        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
                        .info-label { font-size: 11px; color: #9ca3af; margin-bottom: 2px; }
                        .info-val { font-weight: 700; font-size: 14px; }
                        .info-sub { font-size: 12px; color: #6b7280; }
                        .total-val { font-size: 18px; font-weight: 800; color: #16a34a; }
                        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                        th { background: #e11d48; color: #fff; padding: 10px 12px; text-align: left; font-size: 13px; }
                        td { padding: 9px 12px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
                        tr:nth-child(even) td { background: #fafafa; }
                        .tfoot td { font-weight: 800; font-size: 15px; background: #f9fafb; border-top: 2px solid #e5e7eb; }
                        .tfoot .total { color: #16a34a; }
                        .footer { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: center; }
                        .footer .sig-label { font-size: 13px; font-weight: 700; margin-bottom: 60px; }
                        .footer .sig-line { border-top: 1px solid #ccc; padding-top: 6px; font-size: 12px; color: #888; }
                        @media print { body { padding: 16px; } }
                      </style></head><body>
                      ${printContent.innerHTML}
                      </body></html>
                    `);
                    w.document.close();
                    w.focus();
                    setTimeout(() => { w.print(); }, 400);
                  }}
                  style={{ padding:"6px 14px", background:"#1d4ed8", color:"#fff", border:"none", borderRadius:6, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}
                >
                  🖨️ In / PDF
                </button>
                <button onClick={()=>setShowDetail(null)} style={{ background:"none", border:"none", fontSize:22, cursor:"pointer", color:"#9ca3af" }}>✕</button>
              </div>
            </div>

            {/* Nội dung in */}
            <div id="print-invoice">
              <h2 style={{ color:"#e11d48", margin:"0 0 4px" }}>PHIẾU NHẬP HÀNG</h2>
              <div style={{ fontSize:13, color:"#888", marginBottom:20 }}>
                Mã hoá đơn: <b>{showDetail.ma_hdn}</b> &nbsp;|&nbsp; Ngày nhập: <b>{fmtDate(showDetail.ngay_nhap)}</b>
              </div>

              {/* Thông tin NCC */}
              <div style={{ background:"#f9fafb", borderRadius:8, padding:16, marginBottom:16, display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                <div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>Nhà cung cấp</div>
                  <div style={{ fontWeight:700, fontSize:15 }}>{showDetail.ten_ncc}</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>{showDetail.ma_ncc}</div>
                </div>
                <div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>Liên hệ</div>
                  <div style={{ fontSize:13 }}>{showDetail.sdt||"—"}</div>
                  <div style={{ fontSize:12, color:"#6b7280" }}>{showDetail.email||"—"}</div>
                </div>
                <div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>Tổng giá trị</div>
                  <div style={{ fontWeight:800, fontSize:18, color:"#16a34a" }}>{fmtMoney(showDetail.tong_tien)}</div>
                </div>
                <div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>Ghi chú</div>
                  <div style={{ fontSize:13 }}>{showDetail.ghi_chu||"—"}</div>
                </div>
              </div>

              {/* Chi tiết sách */}
              <div style={{ fontSize:14, fontWeight:700, marginBottom:10 }}>Chi tiết sách nhập</div>
              <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #e5e7eb" }}>
                <thead>
                  <tr style={{ background:"#e11d48" }}>
                    {["#","Tên sách","Số lượng","Đơn giá","Thành tiền"].map(h=>(
                      <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:12, fontWeight:700, color:"#fff" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(showDetail.chi_tiets||[]).map((ct, i) => (
                    <tr key={i} style={{ borderBottom:"1px solid #f3f4f6", background:i%2===0?"#fff":"#fafafa" }}>
                      <td style={{ padding:"8px 12px", fontSize:13, color:"#9ca3af" }}>{i+1}</td>
                      <td style={{ padding:"8px 12px", fontSize:13, fontWeight:600 }}>{ct.ten_sach}</td>
                      <td style={{ padding:"8px 12px", fontSize:13, fontWeight:700, color:"#1d4ed8" }}>{ct.so_luong}</td>
                      <td style={{ padding:"8px 12px", fontSize:13 }}>{fmtMoney(ct.don_gia)}</td>
                      <td style={{ padding:"8px 12px", fontSize:13, fontWeight:700, color:"#16a34a" }}>{fmtMoney(Number(ct.so_luong)*Number(ct.don_gia))}</td>
                    </tr>
                  ))}
                  <tr style={{ background:"#f9fafb", borderTop:"2px solid #e5e7eb" }}>
                    <td colSpan={4} style={{ padding:"10px 12px", fontSize:14, fontWeight:700, textAlign:"right" }}>Tổng cộng:</td>
                    <td style={{ padding:"10px 12px", fontSize:16, fontWeight:800, color:"#16a34a" }}>{fmtMoney(showDetail.tong_tien)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Chữ ký */}
              <div style={{ marginTop:40, display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, textAlign:"center" }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:60 }}>Người lập phiếu</div>
                  <div style={{ borderTop:"1px solid #ccc", paddingTop:6, fontSize:12, color:"#888" }}>(Ký, ghi rõ họ tên)</div>
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, marginBottom:60 }}>Người giao hàng</div>
                  <div style={{ borderTop:"1px solid #ccc", paddingTop:6, fontSize:12, color:"#888" }}>(Ký, ghi rõ họ tên)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
