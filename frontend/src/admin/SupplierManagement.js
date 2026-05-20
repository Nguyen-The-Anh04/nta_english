import { useState, useEffect } from "react";

const API = "http://localhost:5000/api/supplier";
const token = () => localStorage.getItem("token");
const authGet = (url) => fetch(url, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json());
const authPost = (url, data) => fetch(url, { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token()}` }, body:JSON.stringify(data) }).then(r=>r.json());
const authPut = (url, data) => fetch(url, { method:"PUT", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${token()}` }, body:JSON.stringify(data) }).then(r=>r.json());
const authDel = (url) => fetch(url, { method:"DELETE", headers:{ Authorization:`Bearer ${token()}` } }).then(r=>r.json());

const inp = { width:"100%", padding:"9px 12px", border:"1px solid #d1d5db", borderRadius:6, fontSize:13, outline:"none", boxSizing:"border-box" };
const lbl = { display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:4 };
const TH = { padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:700, color:"#fff", background:"#e11d48", borderRight:"1px solid rgba(255,255,255,0.2)" };
const TD = { padding:"10px 14px", fontSize:13, borderBottom:"1px solid #f3f4f6", borderRight:"1px solid #e5e7eb", verticalAlign:"middle" };
const fmtMoney = n => n ? Number(n).toLocaleString("vi-VN")+"đ" : "0đ";

const emptyForm = { ten_ncc:"", nguoi_lien_he:"", sdt:"", email:"", dia_chi:"", ghi_chu:"", trang_thai:"hoat_dong" };

export default function SupplierManagement() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal thêm/sửa NCC
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  // Modal xem sản phẩm của NCC
  const [showSachModal, setShowSachModal] = useState(null);
  const [sachOfNcc, setSachOfNcc] = useState([]);
  const [sachLoading, setSachLoading] = useState(false);

  // Modal nhập thêm hàng nhanh
  const [showNhapModal, setShowNhapModal] = useState(null); // sach object
  const [nhapForm, setNhapForm] = useState({ so_luong: 1, don_gia: "", ghi_chu: "" });
  const [nhapSaving, setNhapSaving] = useState(false);

  const load = () => {
    setLoading(true);
    authGet(`${API}/nha-cung-cap?search=${search}`)
      .then(r => setList(r.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]); // eslint-disable-line

  const loadSachOfNcc = (ncc) => {
    setShowSachModal(ncc);
    setSachOfNcc([]);
    setSachLoading(true);
    authGet(`${API}/nha-cung-cap/${ncc.id}/san-pham`)
      .then(r => setSachOfNcc(r.data || []))
      .finally(() => setSachLoading(false));
  };

  // Thêm/sửa NCC
  const openCreate = () => { setForm(emptyForm); setEditing(null); setShowModal(true); };
  const openEdit = (ncc) => { setForm({ ...ncc }); setEditing(ncc.id); setShowModal(true); };

  const handleSave = async () => {
    if (!form.ten_ncc) { alert("Vui lòng nhập tên nhà cung cấp"); return; }
    setSaving(true);
    try {
      const res = editing
        ? await authPut(`${API}/nha-cung-cap/${editing}`, form)
        : await authPost(`${API}/nha-cung-cap`, form);
      if (res.success) { setShowModal(false); load(); }
      else alert("Lỗi: " + res.message);
    } catch(e) { alert("Lỗi: " + e.message); }
    setSaving(false);
  };

  const handleDelete = async (id, ten) => {
    if (!window.confirm(`Xóa nhà cung cấp "${ten}"?\nCác sản phẩm liên kết sẽ không bị xóa.`)) return;
    const res = await authDel(`${API}/nha-cung-cap/${id}`);
    if (res.success) load();
    else alert("Lỗi: " + res.message);
  };

  // Nhập thêm hàng nhanh cho 1 sản phẩm
  const openNhap = (sach) => {
    setShowNhapModal(sach);
    setNhapForm({ so_luong: 10, don_gia: sach.gia_nhap || "", ghi_chu: `Nhập thêm ${sach.ten_sach}` });
  };

  const handleNhapHang = async () => {
    if (!nhapForm.so_luong || nhapForm.so_luong <= 0) { alert("Số lượng phải lớn hơn 0"); return; }
    if (!nhapForm.don_gia) { alert("Vui lòng nhập đơn giá"); return; }
    setNhapSaving(true);
    try {
      // Tạo hoá đơn nhập nhanh cho 1 sản phẩm
      const res = await authPost(`${API}/hoa-don-nhap`, {
        nha_cung_cap_id: showSachModal.id,
        ngay_nhap: new Date().toISOString().split("T")[0],
        ghi_chu: nhapForm.ghi_chu,
        chi_tiets: [{
          sach_id: showNhapModal.id,
          so_luong: Number(nhapForm.so_luong),
          don_gia: Number(nhapForm.don_gia),
        }]
      });
      if (res.success) {
        alert(`✅ Đã nhập thêm ${nhapForm.so_luong} cuốn "${showNhapModal.ten_sach}"\nTồn kho đã được cập nhật tự động.`);
        setShowNhapModal(null);
        // Reload sách của NCC
        loadSachOfNcc(showSachModal);
      } else alert("Lỗi: " + res.message);
    } catch(e) { alert("Lỗi: " + e.message); }
    setNhapSaving(false);
  };

  return (
    <div style={{ fontFamily:"system-ui,sans-serif" }}>
      {/* Toolbar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, border:"1px solid #d1d5db", borderRadius:6, padding:"6px 12px", background:"#fff", width:280 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm nhà cung cấp..."
            style={{ border:"none", outline:"none", fontSize:13, flex:1 }} />
          <span style={{ color:"#9ca3af" }}>🔍</span>
        </div>
        <button onClick={openCreate}
          style={{ padding:"8px 18px", background:"#e11d48", color:"#fff", border:"none", borderRadius:6, fontSize:13, fontWeight:700, cursor:"pointer" }}>
          + Thêm nhà cung cấp
        </button>
      </div>

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:8, border:"1px solid #e5e7eb", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <th style={TH}>Mã NCC</th>
              <th style={TH}>Tên nhà cung cấp</th>
              <th style={TH}>Người liên hệ</th>
              <th style={TH}>SĐT / Email</th>
              <th style={TH}>Sản phẩm cung cấp</th>
              <th style={TH}>Trạng thái</th>
              <th style={{...TH, borderRight:"none"}}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Đang tải...</td></tr>
              : list.length === 0
                ? <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Chưa có nhà cung cấp</td></tr>
                : list.map((ncc, i) => (
                  <tr key={ncc.id} style={{ background: i%2===0?"#fff":"#fafafa" }}>
                    <td style={{...TD, fontWeight:700, color:"#e11d48"}}>{ncc.ma_ncc}</td>
                    <td style={{...TD, fontWeight:600}}>{ncc.ten_ncc}</td>
                    <td style={TD}>{ncc.nguoi_lien_he||"—"}</td>
                    <td style={TD}>
                      <div style={{ fontSize:13 }}>{ncc.sdt||"—"}</div>
                      <div style={{ fontSize:11, color:"#9ca3af" }}>{ncc.email||"—"}</div>
                    </td>
                    <td style={TD}>
                      <button onClick={()=>loadSachOfNcc(ncc)}
                        style={{ padding:"4px 12px", background:"#dbeafe", color:"#1d4ed8", border:"none", borderRadius:4, fontSize:12, cursor:"pointer", fontWeight:600 }}>
                        📚 {ncc.so_san_pham||0} sản phẩm
                      </button>
                    </td>
                    <td style={TD}>
                      <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700,
                        background: ncc.trang_thai==="hoat_dong"?"#d1fae5":"#fee2e2",
                        color: ncc.trang_thai==="hoat_dong"?"#065f46":"#991b1b" }}>
                        {ncc.trang_thai==="hoat_dong"?"Hoạt động":"Ngừng"}
                      </span>
                    </td>
                    <td style={{...TD, borderRight:"none"}}>
                      <div style={{ display:"flex", gap:6 }}>
                        <button onClick={()=>openEdit(ncc)}
                          style={{ padding:"4px 10px", background:"#fef3c7", color:"#92400e", border:"none", borderRadius:4, fontSize:12, cursor:"pointer" }}>✏️ Sửa</button>
                        <button onClick={()=>handleDelete(ncc.id, ncc.ten_ncc)}
                          style={{ padding:"4px 10px", background:"#fee2e2", color:"#991b1b", border:"none", borderRadius:4, fontSize:12, cursor:"pointer" }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* ── Modal danh sách sản phẩm của NCC ── */}
      {showSachModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={()=>{ setShowSachModal(null); setShowNhapModal(null); }}>
          <div style={{ background:"#fff", borderRadius:12, padding:28, width:780, maxHeight:"85vh", overflowY:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:"#e11d48" }}>Sản phẩm của {showSachModal.ten_ncc}</div>
                <div style={{ fontSize:12, color:"#9ca3af" }}>Mã: {showSachModal.ma_ncc} · {showSachModal.sdt}</div>
              </div>
              <button onClick={()=>setShowSachModal(null)} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:"#9ca3af" }}>✕</button>
            </div>

            {/* Ghi chú nghiệp vụ */}
            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:10, marginBottom:14, fontSize:12, color:"#92400e" }}>
              💡 Khi sản phẩm hết hàng (tồn kho = 0), nhấn <strong>"Nhập thêm"</strong> để tạo hoá đơn nhập và tự động cộng tồn kho.
            </div>

            {sachLoading
              ? <div style={{ textAlign:"center", padding:40, color:"#9ca3af" }}>Đang tải...</div>
              : (
              <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #e5e7eb" }}>
                <thead>
                  <tr style={{ background:"#e11d48" }}>
                    {["#","Tên sách","Giá nhập","Giá bán","Tồn kho","Trạng thái","Nhập thêm"].map(h=>(
                      <th key={h} style={{ padding:"8px 12px", textAlign:"left", fontSize:12, fontWeight:700, color:"#fff" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sachOfNcc.length === 0
                    ? <tr><td colSpan={7} style={{ padding:30, textAlign:"center", color:"#9ca3af" }}>Chưa có sản phẩm</td></tr>
                    : sachOfNcc.map((s,i)=>(
                      <tr key={s.id} style={{ borderBottom:"1px solid #f3f4f6", background:i%2===0?"#fff":"#fafafa" }}>
                        <td style={{ padding:"8px 12px", fontSize:12, color:"#9ca3af" }}>{i+1}</td>
                        <td style={{ padding:"8px 12px", fontSize:13, fontWeight:600 }}>{s.ten_sach}</td>
                        <td style={{ padding:"8px 12px", fontSize:13 }}>{fmtMoney(s.gia_nhap)}</td>
                        <td style={{ padding:"8px 12px", fontSize:13, color:"#e11d48", fontWeight:600 }}>{fmtMoney(s.gia_ban)}</td>
                        <td style={{ padding:"8px 12px", fontSize:13 }}>
                          <span style={{ fontWeight:700, color: s.so_luong_ton===0?"#dc2626": s.so_luong_ton<=5?"#f59e0b":"#16a34a" }}>
                            {s.so_luong_ton}
                          </span>
                          {s.so_luong_ton===0 && <span style={{ marginLeft:6, fontSize:11, background:"#fee2e2", color:"#dc2626", padding:"1px 6px", borderRadius:10 }}>Hết hàng</span>}
                          {s.so_luong_ton>0 && s.so_luong_ton<=5 && <span style={{ marginLeft:6, fontSize:11, background:"#fef3c7", color:"#92400e", padding:"1px 6px", borderRadius:10 }}>Sắp hết</span>}
                        </td>
                        <td style={{ padding:"8px 12px" }}>
                          <span style={{ padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700,
                            background: s.trang_thai==="het_hang"?"#fee2e2":"#d1fae5",
                            color: s.trang_thai==="het_hang"?"#991b1b":"#065f46" }}>
                            {s.trang_thai==="het_hang"?"Hết hàng":"Còn hàng"}
                          </span>
                        </td>
                        <td style={{ padding:"8px 12px" }}>
                          <button onClick={()=>openNhap(s)}
                            style={{ padding:"4px 12px", background: s.so_luong_ton===0?"#e11d48":"#16a34a", color:"#fff", border:"none", borderRadius:4, fontSize:12, fontWeight:700, cursor:"pointer" }}>
                            {s.so_luong_ton===0?"🚨 Nhập ngay":"+ Nhập thêm"}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── Modal nhập thêm hàng nhanh ── */}
      {showNhapModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1100, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={e=>e.target===e.currentTarget&&setShowNhapModal(null)}>
          <div style={{ background:"#fff", borderRadius:12, padding:28, width:460, boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize:16, fontWeight:800, color:"#e11d48", marginBottom:4 }}>Nhập thêm hàng</div>
            <div style={{ fontSize:13, color:"#6b7280", marginBottom:20 }}>
              Sản phẩm: <strong>{showNhapModal.ten_sach}</strong><br/>
              Tồn kho hiện tại: <strong style={{ color: showNhapModal.so_luong_ton===0?"#dc2626":"#16a34a" }}>{showNhapModal.so_luong_ton}</strong>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
              <div>
                <label style={lbl}>Số lượng nhập *</label>
                <input type="number" style={inp} min={1} value={nhapForm.so_luong}
                  onChange={e=>setNhapForm(f=>({...f,so_luong:e.target.value}))} />
                <div style={{ fontSize:11, color:"#6b7280", marginTop:4 }}>
                  Sau nhập: <strong style={{ color:"#16a34a" }}>{Number(showNhapModal.so_luong_ton)+Number(nhapForm.so_luong||0)}</strong>
                </div>
              </div>
              <div>
                <label style={lbl}>Đơn giá nhập (đ) *</label>
                <input type="number" style={inp} value={nhapForm.don_gia}
                  onChange={e=>setNhapForm(f=>({...f,don_gia:e.target.value}))} placeholder="VD: 150000" />
                <div style={{ fontSize:11, color:"#6b7280", marginTop:4 }}>
                  Tổng: <strong style={{ color:"#e11d48" }}>{Number(nhapForm.so_luong||0)*Number(nhapForm.don_gia||0) > 0 ? (Number(nhapForm.so_luong)*Number(nhapForm.don_gia)).toLocaleString("vi-VN")+"đ" : "—"}</strong>
                </div>
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={lbl}>Ghi chú</label>
              <input style={inp} value={nhapForm.ghi_chu} onChange={e=>setNhapForm(f=>({...f,ghi_chu:e.target.value}))} />
            </div>
            <div style={{ background:"#f0fdf4", border:"1px solid #86efac", borderRadius:8, padding:10, marginBottom:16, fontSize:12, color:"#166534" }}>
              ✅ Sau khi xác nhận, tồn kho sẽ tự động tăng thêm <strong>{nhapForm.so_luong}</strong> và hoá đơn nhập sẽ được tạo.
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
              <button onClick={()=>setShowNhapModal(null)} style={{ padding:"8px 20px", border:"1px solid #d1d5db", borderRadius:8, background:"#fff", cursor:"pointer" }}>Hủy</button>
              <button onClick={handleNhapHang} disabled={nhapSaving}
                style={{ padding:"8px 20px", background:"#e11d48", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", opacity:nhapSaving?0.7:1 }}>
                {nhapSaving?"Đang xử lý...":"✅ Xác nhận nhập hàng"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal thêm/sửa NCC ── */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }}
          onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div style={{ background:"#fff", borderRadius:12, padding:28, width:560, boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:17, fontWeight:800, color:"#e11d48", marginBottom:20 }}>
              {editing ? "Sửa nhà cung cấp" : "Thêm nhà cung cấp"}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={lbl}>Tên nhà cung cấp *</label>
                <input style={inp} value={form.ten_ncc} onChange={e=>setForm(f=>({...f,ten_ncc:e.target.value}))} placeholder="VD: NXB Giáo Dục Việt Nam" />
              </div>
              <div>
                <label style={lbl}>Người liên hệ</label>
                <input style={inp} value={form.nguoi_lien_he||""} onChange={e=>setForm(f=>({...f,nguoi_lien_he:e.target.value}))} />
              </div>
              <div>
                <label style={lbl}>Số điện thoại</label>
                <input style={inp} value={form.sdt||""} onChange={e=>setForm(f=>({...f,sdt:e.target.value}))} />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input style={inp} value={form.email||""} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
              </div>
              <div>
                <label style={lbl}>Trạng thái</label>
                <select style={inp} value={form.trang_thai} onChange={e=>setForm(f=>({...f,trang_thai:e.target.value}))}>
                  <option value="hoat_dong">Hoạt động</option>
                  <option value="ngung">Ngừng hợp tác</option>
                </select>
              </div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={lbl}>Địa chỉ</label>
                <input style={inp} value={form.dia_chi||""} onChange={e=>setForm(f=>({...f,dia_chi:e.target.value}))} />
              </div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={lbl}>Ghi chú</label>
                <textarea style={{...inp,height:72,resize:"vertical"}} value={form.ghi_chu||""} onChange={e=>setForm(f=>({...f,ghi_chu:e.target.value}))} />
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:20 }}>
              <button onClick={()=>setShowModal(false)} style={{ padding:"8px 20px", border:"1px solid #d1d5db", borderRadius:8, background:"#fff", cursor:"pointer" }}>Hủy</button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding:"8px 20px", background:"#e11d48", color:"#fff", border:"none", borderRadius:8, fontWeight:700, cursor:"pointer", opacity:saving?0.7:1 }}>
                {saving?"Đang lưu...":"Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
