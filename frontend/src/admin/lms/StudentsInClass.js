import { useState, useEffect } from "react";
import { lmsAPI } from "../../api";

const TH = { padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:700, color:"#fff", background:"#e11d48", borderRight:"1px solid rgba(255,255,255,0.2)", whiteSpace:"nowrap" };
const TD = { padding:"10px 14px", fontSize:13, borderBottom:"1px solid #f3f4f6", verticalAlign:"middle" };

const PAGE_SIZE = 30;

export default function StudentsInClass() {
  const [dks, setDks] = useState([]);
  const [lops, setLops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      lmsAPI.getLopHocs({}),
      lmsAPI.getHocViens({ limit: 200 }),
    ]).then(([lRes, hvRes]) => {
      const lopArr = Array.isArray(lRes) ? lRes : (lRes.data || []);
      setLops(lopArr);
      // Lấy dk từ tất cả lớp
      return Promise.all(lopArr.map(l => lmsAPI.getDangKyByLop(l.id).then(r => ({ lop: l, dks: Array.isArray(r) ? r : (r.data || []) }))));
    }).then(results => {
      const all = [];
      results.forEach(({ lop, dks: dkArr }) => {
        dkArr.forEach(dk => all.push({ ...dk, lopInfo: lop }));
      });
      setDks(all);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = dks.filter(dk => {
    const hv = dk.hocVien || {};
    const q = search.toLowerCase();
    return !q || (hv.ho_ten||"").toLowerCase().includes(q) || (hv.sdt||"").includes(q) || (hv.email||"").toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const fmtMoney = n => n ? Number(n).toLocaleString("vi-VN") : "—";

  return (
    <div style={{ fontFamily:"system-ui,sans-serif" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize:12, color:"#9ca3af", marginBottom:16 }}>
        Thông tin học &nbsp;/&nbsp; Danh sách học viên &nbsp;/&nbsp; <strong style={{ color:"#111827" }}>Học viên trong lớp</strong>
      </div>

      {/* Search */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, border:"1px solid #d1d5db", borderRadius:6, padding:"6px 12px", background:"#fff", width:280 }}>
          <span style={{ color:"#9ca3af" }}>▼</span>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Tìm kiếm"
            style={{ border:"none", outline:"none", fontSize:13, flex:1 }} />
          <span style={{ color:"#9ca3af" }}>🔍</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:8, border:"1px solid #e5e7eb", overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
            <thead>
              <tr>
                <th style={{...TH, width:32}}></th>
                <th style={TH}>Thông tin</th>
                <th style={TH}>Liên hệ</th>
                <th style={TH}>Loại học viên</th>
                <th style={TH}>Lớp</th>
                <th style={{...TH, borderRight:"none"}}>Loại lớp</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Đang tải...</td></tr>
                : paged.length === 0
                  ? <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Không có dữ liệu</td></tr>
                  : paged.map((dk, i) => {
                    const hv = dk.hocVien || {};
                    const lop = dk.lopInfo || {};
                    const maHV = `HV${String(hv.id||0).padStart(10,"0")}`;
                    return (
                      <tr key={dk.id||i} style={{ borderBottom:"1px solid #f3f4f6" }}>
                        <td style={{...TD, color:"#9ca3af", fontSize:16, cursor:"pointer" }}>+</td>
                        <td style={TD}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <div style={{ width:36, height:36, borderRadius:"50%", background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>👤</div>
                            <div>
                              <div style={{ fontWeight:600, color:"#111827", fontSize:14 }}>{hv.ho_ten||"—"}</div>
                              <div style={{ fontSize:11, color:"#9ca3af" }}>{maHV}</div>
                            </div>
                          </div>
                        </td>
                        <td style={TD}>
                          <div style={{ fontSize:12, color:"#374151" }}>Điện thoại: {hv.sdt||"—"}</div>
                          <div style={{ fontSize:12, color:"#374151" }}>Email: {hv.email||"—"}</div>
                        </td>
                        <td style={TD}>
                          <span style={{ padding:"3px 10px", borderRadius:4, fontSize:12, fontWeight:700, background:"#d1fae5", color:"#065f46" }}>Chính thức</span>
                        </td>
                        <td style={{...TD, color:"#2563eb", fontWeight:600, cursor:"pointer"}}>{lop.ma_lop||"—"}</td>
                        <td style={{...TD, borderRight:"none"}}>
                          <span style={{ padding:"3px 10px", borderRadius:4, fontSize:12, fontWeight:700, background:"#d1fae5", color:"#065f46" }}>Offline</span>
                        </td>
                      </tr>
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
          {totalPages > 5 && <span>···</span>}
          {totalPages > 5 && <button onClick={()=>setPage(totalPages)} style={{ width:28, height:28, border:"1px solid #d1d5db", borderRadius:4, background:"#fff", cursor:"pointer" }}>{totalPages}</button>}
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
            style={{ width:28, height:28, border:"1px solid #d1d5db", borderRadius:4, background:"#fff", cursor:"pointer" }}>›</button>
        </div>
      </div>
    </div>
  );
}
