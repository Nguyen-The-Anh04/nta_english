import { useState } from "react";

const TH = { padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:700, color:"#fff", background:"#e11d48", borderRight:"1px solid rgba(255,255,255,0.2)", whiteSpace:"nowrap" };
const TD = { padding:"10px 14px", fontSize:13, borderBottom:"1px solid #f3f4f6", verticalAlign:"middle" };

const SAMPLE = [
  { id:1, an_danh:true,  ten:"Ẩn danh",        gui_cho:"cô Trang", ngay:"10/05/2026 10:05", loai:"Gửi cô Trang", noi_dung:"Cô dạy thật hay , thật tuyệt vời 😊🤩", rating:0, trang_thai:"da_xong" },
  { id:2, an_danh:false, ten:"Phạm Tuấn Hùng",  gui_cho:"Phản hồi",  ngay:"10/05/2026 10:05", loai:"Phản hồi",     noi_dung:"Ứng dụng hay quá rất hữu ích cho việc rèn luyện! 5 sao", rating:5, trang_thai:"da_xong" },
];

const PAGE_SIZE = 20;

function Stars({ count, max=5 }) {
  return (
    <span>
      {Array.from({length:max},(_,i)=>(
        <span key={i} style={{ color: i<count?"#f59e0b":"#d1d5db", fontSize:16 }}>★</span>
      ))}
    </span>
  );
}

export default function StudentFeedback() {
  const [data] = useState(SAMPLE);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const paged = data.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  return (
    <div style={{ fontFamily:"system-ui,sans-serif" }}>
      <div style={{ fontSize:12, color:"#9ca3af", marginBottom:16 }}>
        Thông tin học &nbsp;/&nbsp; <strong style={{ color:"#111827" }}>Phản hồi học viên</strong>
      </div>

      <div style={{ background:"#fff", borderRadius:8, border:"1px solid #e5e7eb", overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
            <thead>
              <tr>
                <th style={TH}>Tiêu đề</th>
                <th style={TH}>Nội dung</th>
                <th style={TH}>Rating</th>
                <th style={TH}>Trạng thái</th>
                <th style={{...TH, borderRight:"none"}}></th>
              </tr>
            </thead>
            <tbody>
              {paged.map((fb, i) => (
                <tr key={fb.id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                  {/* Tiêu đề */}
                  <td style={TD}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
                      <div style={{ width:36, height:36, borderRadius:"50%", background:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                        {fb.an_danh ? "👤" : "🧑"}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, color:"#111827", fontSize:14 }}>{fb.ten}</div>
                        <div style={{ fontSize:11, color:"#9ca3af" }}>{fb.ngay}</div>
                        <div style={{ fontSize:11, color:"#6b7280" }}>{fb.loai}</div>
                      </div>
                    </div>
                  </td>
                  {/* Nội dung */}
                  <td style={{...TD, maxWidth:320, color:"#374151"}}>{fb.noi_dung}</td>
                  {/* Rating */}
                  <td style={TD}><Stars count={fb.rating} /></td>
                  {/* Trạng thái */}
                  <td style={TD}>
                    <span style={{ padding:"3px 12px", borderRadius:4, fontSize:12, fontWeight:700, background:"#d1fae5", color:"#065f46" }}>Đã xong</span>
                  </td>
                  {/* Actions */}
                  <td style={{...TD, borderRight:"none"}}>
                    <div style={{ display:"flex", gap:8 }}>
                      <span style={{ fontSize:18, color:"#9ca3af", cursor:"pointer" }}>✓</span>
                      <span style={{ fontSize:18, color:"#f59e0b", cursor:"pointer" }}>👁</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:6, padding:"12px 16px", borderTop:"1px solid #f3f4f6", fontSize:13, color:"#6b7280" }}>
          <span>Tổng cộng: {data.length}</span>
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
