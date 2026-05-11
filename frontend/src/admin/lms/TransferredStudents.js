import { useState } from "react";

const TH = { padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:700, color:"#fff", background:"#e11d48", borderRight:"1px solid rgba(255,255,255,0.2)", whiteSpace:"nowrap" };
const TD = { padding:"10px 14px", fontSize:13, borderBottom:"1px solid #f3f4f6", verticalAlign:"middle" };

// Dữ liệu mẫu
const SAMPLE = [
  { id:1, ho_ten:"Nguyễn Thị Thu Hà",  ma_hv:"HV2406280001", lop_cu:"COM03", lop_moi:"COM04", phi_cu:18000000, phi_moi:18000000, tien_da_thu:0, ghi_chu:"" },
  { id:2, ho_ten:"Nguyễn Đào Tường Vy", ma_hv:"HV2312170009", lop_cu:"COM03", lop_moi:"COM04", phi_cu:18000000, phi_moi:18000000, tien_da_thu:0, ghi_chu:"" },
];

const PAGE_SIZE = 20;

export default function TransferredStudents() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = SAMPLE.filter(r => {
    const q = search.toLowerCase();
    return !q || r.ho_ten.toLowerCase().includes(q) || r.ma_hv.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);
  const fmtMoney = n => Number(n).toLocaleString("vi-VN");

  return (
    <div style={{ fontFamily:"system-ui,sans-serif" }}>
      <div style={{ fontSize:12, color:"#9ca3af", marginBottom:16 }}>
        Thông tin học &nbsp;/&nbsp; <strong style={{ color:"#111827" }}>Học viên chuyển lớp</strong>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, border:"1px solid #d1d5db", borderRadius:6, padding:"6px 12px", background:"#fff", width:280 }}>
          <span style={{ color:"#9ca3af" }}>▼</span>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Tìm kiếm"
            style={{ border:"none", outline:"none", fontSize:13, flex:1 }} />
          <span style={{ color:"#9ca3af" }}>🔍</span>
        </div>
      </div>

      <div style={{ background:"#fff", borderRadius:8, border:"1px solid #e5e7eb", overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
            <thead>
              <tr>
                <th style={{...TH, width:32}}></th>
                <th style={TH}>Thông tin</th>
                <th style={TH}>Lớp cũ</th>
                <th style={TH}>Lớp mới</th>
                <th style={TH}>Tiền đã thu</th>
                <th style={TH}>Ghi chú</th>
                <th style={{...TH, borderRight:"none"}}></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0
                ? <tr><td colSpan={7} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Không có dữ liệu</td></tr>
                : paged.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                    <td style={{...TD, color:"#9ca3af", fontSize:16, cursor:"pointer"}}>+</td>
                    <td style={TD}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>👤</div>
                        <div>
                          <div style={{ fontWeight:600, color:"#111827", fontSize:14 }}>{r.ho_ten}</div>
                          <div style={{ fontSize:11, color:"#9ca3af" }}>{r.ma_hv}</div>
                        </div>
                      </div>
                    </td>
                    <td style={TD}>
                      <div style={{ color:"#2563eb", fontWeight:600 }}>{r.lop_cu}</div>
                      <div style={{ fontSize:12, color:"#6b7280" }}>{fmtMoney(r.phi_cu)}</div>
                    </td>
                    <td style={TD}>
                      <div style={{ color:"#2563eb", fontWeight:600 }}>{r.lop_moi}</div>
                      <div style={{ fontSize:12, color:"#6b7280" }}>{fmtMoney(r.phi_moi)}</div>
                    </td>
                    <td style={{...TD, color:"#16a34a", fontWeight:700}}>{r.tien_da_thu}</td>
                    <td style={TD}>{r.ghi_chu||""}</td>
                    <td style={{...TD, borderRight:"none"}}>
                      <span style={{ fontSize:20, color:"#f59e0b", cursor:"pointer" }}>👁</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:6, padding:"12px 16px", borderTop:"1px solid #f3f4f6", fontSize:13, color:"#6b7280" }}>
          <span>Tổng cộng: {filtered.length}</span>
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
            style={{ width:28, height:28, border:"1px solid #d1d5db", borderRadius:4, background:"#fff", cursor:"pointer" }}>‹</button>
          <span style={{ width:28, height:28, border:"1px solid #e11d48", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#e11d48" }}>{page}</span>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
            style={{ width:28, height:28, border:"1px solid #d1d5db", borderRadius:4, background:"#fff", cursor:"pointer" }}>›</button>
        </div>
      </div>
    </div>
  );
}
