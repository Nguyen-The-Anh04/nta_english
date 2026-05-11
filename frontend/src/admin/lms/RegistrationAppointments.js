import { useState, useEffect } from "react";
import { lmsAPI } from "../../api";

const TH = { padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:700, color:"#fff", background:"#e11d48", borderRight:"1px solid rgba(255,255,255,0.2)", whiteSpace:"nowrap" };
const TD = { padding:"10px 14px", fontSize:13, borderBottom:"1px solid #f3f4f6", verticalAlign:"middle" };

const TRANG_THAI = {
  cho_xep_lop: { label:"Chờ xếp lớp", bg:"#fef3c7", color:"#92400e" },
  da_xep_lop:  { label:"Đã xếp lớp",  bg:"#d1fae5", color:"#065f46" },
  huy:         { label:"Đã hủy",       bg:"#fee2e2", color:"#991b1b" },
};

const PAGE_SIZE = 20;

export default function RegistrationAppointments() {
  const [hds, setHds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    lmsAPI.getHopDongs({}).then(r => {
      setHds(Array.isArray(r) ? r : (r.data || []));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = hds.filter(hd => {
    const q = search.toLowerCase();
    const hv = hd.hocVien || {};
    return !q || (hv.ho_ten||"").toLowerCase().includes(q) || (hv.sdt||"").includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const fmtMoney = n => n ? Number(n).toLocaleString("vi-VN") : "0";
  const fmtDate = s => { if (!s) return "—"; const d = new Date(s); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`; };

  return (
    <div style={{ fontFamily:"system-ui,sans-serif" }}>
      <div style={{ fontSize:12, color:"#9ca3af", marginBottom:16 }}>
        Thông tin học &nbsp;/&nbsp; <strong style={{ color:"#111827" }}>Hẹn đăng ký</strong>
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, border:"1px solid #d1d5db", borderRadius:6, padding:"6px 12px", background:"#fff", width:280 }}>
          <span style={{ color:"#9ca3af" }}>▼</span>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Tìm kiếm"
            style={{ border:"none", outline:"none", fontSize:13, flex:1 }} />
          <span style={{ color:"#9ca3af" }}>🔍</span>
        </div>
        <button style={{ padding:"8px 18px", background:"#2563eb", color:"#fff", border:"none", borderRadius:6, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
          ↪ Xếp lớp
        </button>
      </div>

      <div style={{ background:"#fff", borderRadius:8, border:"1px solid #e5e7eb", overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:800 }}>
            <thead>
              <tr>
                <th style={{...TH, width:32}}></th>
                <th style={TH}>Thông tin</th>
                <th style={TH}>Trung tâm</th>
                <th style={TH}>Chương trình</th>
                <th style={TH}>Số tiền</th>
                <th style={TH}>Trạng thái</th>
                <th style={{...TH, borderRight:"none"}}>Ngày đ.</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Đang tải...</td></tr>
                : paged.length === 0
                  ? <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Không có dữ liệu</td></tr>
                  : paged.map((hd, i) => {
                    const hv = hd.hocVien || {};
                    const kh = hd.khoaHoc || {};
                    const maHV = `HV${String(hv.id||0).padStart(10,"0")}`;
                    const tt = hd.trang_thai === "hoan_thanh" ? "da_xep_lop" : hd.trang_thai === "huy" ? "huy" : "cho_xep_lop";
                    const ttCfg = TRANG_THAI[tt] || TRANG_THAI.cho_xep_lop;
                    return (
                      <tr key={hd.id||i} style={{ borderBottom:"1px solid #f3f4f6" }}>
                        <td style={{...TD, color:"#9ca3af", fontSize:16, cursor:"pointer"}}>+</td>
                        <td style={TD}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:36, height:36, borderRadius:"50%", background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>👤</div>
                            <div>
                              <div style={{ fontWeight:600, color:"#111827", fontSize:14 }}>{hv.ho_ten||"—"}</div>
                              <div style={{ fontSize:11, color:"#9ca3af" }}>{maHV}</div>
                            </div>
                          </div>
                        </td>
                        <td style={TD}>CS Mỹ Hảo</td>
                        <td style={TD}>{kh.ten_khoa||"—"}</td>
                        <td style={{...TD, color:"#2563eb", fontWeight:600}}>{fmtMoney(hd.tong_tien)}</td>
                        <td style={TD}>
                          <span style={{ padding:"3px 10px", borderRadius:4, fontSize:12, fontWeight:700, background:ttCfg.bg, color:ttCfg.color }}>{ttCfg.label}</span>
                        </td>
                        <td style={{...TD, borderRight:"none", color:"#6b7280"}}>{fmtDate(hd.created_at)}</td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
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
    </div>
  );
}
