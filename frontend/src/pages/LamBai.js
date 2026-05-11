import { useState, useEffect, useRef } from "react";
import { examAPI } from "../api";

const PHAN_CFG = {
  nghe: { label: "Listening", color: "#3b82f6", bg: "#dbeafe", icon: "👂" },
  doc:  { label: "Reading",   color: "#f59e0b", bg: "#fef3c7", icon: "📖" },
  viet: { label: "Writing",   color: "#10b981", bg: "#d1fae5", icon: "✍️" },
};

export default function LamBai({ deThiId, lichHenTestId, onHoanThanh }) {
  const [deThi, setDeThi]         = useState(null);
  const [ketQuaId, setKetQuaId]   = useState(null);
  const [daDone, setDaDone]       = useState({});
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ketQua, setKetQua]       = useState(null);
  const [currentPhan, setCurrentPhan] = useState("nghe");
  const [thoiGian, setThoiGian]   = useState(null); // giây còn lại
  const [showChiTiet, setShowChiTiet] = useState(false);
  const [writingText, setWritingText] = useState({});
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await examAPI.batDau({ de_thi_id: deThiId, lich_hen_test_id: lichHenTestId });
        const data = res.data || res;
        const deThiData = data.de_thi || data.deThi || data;
        setDeThi(deThiData);
        setKetQuaId(data.ket_qua_id || data.ketQuaId);
        setDaDone(data.da_tra_loi || {});
        const giay = (deThiData?.thoi_gian_phut || 60) * 60;
        setThoiGian(giay);
        const cauHois = deThiData?.cauHois || [];
        const hasNghe = cauHois.some(c => c.phan === "nghe");
        setCurrentPhan(hasNghe ? "nghe" : "doc");
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []); // eslint-disable-line

  // Timer
  useEffect(() => {
    if (thoiGian === null || ketQua) return;
    if (thoiGian <= 0) { handleNopBai(true); return; }
    timerRef.current = setTimeout(() => setThoiGian(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [thoiGian, ketQua]); // eslint-disable-line

  const handleChonDapAn = async (cauHoiId, dapAn) => {
    setDaDone(prev => ({ ...prev, [cauHoiId]: dapAn }));
    try { await examAPI.traLoi({ ket_qua_de_thi_id: ketQuaId, cau_hoi_id: cauHoiId, dap_an_chon: dapAn }); }
    catch (e) { console.error(e); }
  };

  const handleNopBai = async (auto = false) => {
    if (!auto && !window.confirm("Bạn có chắc chắn muốn nộp bài?")) return;
    setSubmitting(true);
    clearTimeout(timerRef.current);
    try {
      const res = await examAPI.nopBai({ ket_qua_de_thi_id: ketQuaId });
      setKetQua(res.data || res);
    } catch (e) { alert("Lỗi nộp bài: " + e.message); }
    setSubmitting(false);
  };

  const fmtTime = (s) => {
    if (s === null) return "--:--";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  };

  const cauHois = deThi?.cauHois || [];
  const passages = deThi?.passages || [];
  const cauNghe = cauHois.filter(c => c.phan === "nghe");
  const cauDoc  = cauHois.filter(c => c.phan === "doc");
  const cauViet = cauHois.filter(c => c.phan === "viet");
  const daDoneCount = Object.keys(daDone).length;
  const isLow = thoiGian !== null && thoiGian < 300;

  // Lấy passages cho Reading
  const readingPassages = passages.filter(p => p.section_type === "reading" || !p.section_type);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#f9fafb" }}>
      <div style={{ fontSize:14, color:"#6b7280" }}>Đang tải đề thi...</div>
    </div>
  );

  /* ---- KẾT QUẢ ---- */
  if (ketQua) {
    const kq = ketQua;
    return (
      <div style={{ background:"#f9fafb", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ background:"#fff", borderRadius:16, padding:32, width:"100%", maxWidth:700, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ fontSize:48, marginBottom:8 }}>🎉</div>
            <div style={{ fontSize:22, fontWeight:800, color:"#111827" }}>Kết quả bài kiểm tra</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>
            {[
              { label:"NGHE", dung:kq.so_dung_nghe, tong:kq.tong_nghe, diem:kq.diem_nghe, color:"#3b82f6" },
              { label:"ĐỌC",  dung:kq.so_dung_doc,  tong:kq.tong_doc,  diem:kq.diem_doc,  color:"#f59e0b" },
            ].map(s => (
              <div key={s.label} style={{ border:"1px solid #e5e7eb", borderRadius:10, padding:20, textAlign:"center" }}>
                <div style={{ fontSize:11, fontWeight:700, color:s.color, letterSpacing:1, marginBottom:8 }}>{s.label}</div>
                <div style={{ fontSize:13, color:"#6b7280", marginBottom:6 }}>{s.dung ?? "—"} / {s.tong ?? "—"} câu đúng</div>
                <div style={{ fontSize:32, fontWeight:700, color:s.color }}>{s.diem ?? "—"}</div>
              </div>
            ))}
          </div>
          {kq.diem_viet !== undefined && (
            <div style={{ border:"1px solid #e5e7eb", borderRadius:10, padding:16, textAlign:"center", marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#10b981", letterSpacing:1, marginBottom:4 }}>VIẾT</div>
              <div style={{ fontSize:13, color:"#6b7280" }}>{kq.diem_viet != null ? `${kq.diem_viet} điểm` : "Chờ giáo viên chấm"}</div>
            </div>
          )}
          <div style={{ textAlign:"center", marginBottom:16 }}>
            <div style={{ fontSize:13, color:"#6b7280", marginBottom:4 }}>Tổng điểm</div>
            <div style={{ fontSize:40, fontWeight:800, color:"#111827" }}>{kq.diem_tong ?? "—"}</div>
          </div>
          <div style={{ textAlign:"center", fontSize:13, color:"#6b7280", marginBottom:24 }}>
            Thời gian làm: {Math.floor((kq.thoi_gian_lam||0)/60)} phút {(kq.thoi_gian_lam||0)%60} giây
          </div>
          <div style={{ borderTop:"1px solid #e5e7eb", paddingTop:16 }}>
            <button onClick={() => setShowChiTiet(v => !v)}
              style={{ padding:"7px 14px", border:"1px solid #d1d5db", borderRadius:6, background:"#fff", fontSize:13, cursor:"pointer", marginBottom:12 }}>
              {showChiTiet ? "Ẩn chi tiết" : "Xem chi tiết từng câu"}
            </button>
            {showChiTiet && kq.chi_tiet && (
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr>{["STT","Phần","Câu hỏi","Bạn chọn","Đáp án đúng","Kết quả"].map((h,i) => (
                    <th key={i} style={{ padding:"7px 10px", background:"#f3f4f6", fontWeight:600, textAlign:"left", border:"1px solid #e5e7eb" }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {kq.chi_tiet.map((ct, i) => (
                    <tr key={i} style={{ background: i%2===0?"#fff":"#f9fafb" }}>
                      <td style={{ padding:"6px 10px", border:"1px solid #e5e7eb" }}>{i+1}</td>
                      <td style={{ padding:"6px 10px", border:"1px solid #e5e7eb" }}>
                        <span style={{ padding:"2px 8px", borderRadius:4, fontSize:11, fontWeight:600,
                          background: ct.phan==="nghe"?"#dbeafe":ct.phan==="viet"?"#d1fae5":"#fef3c7",
                          color: ct.phan==="nghe"?"#1d4ed8":ct.phan==="viet"?"#065f46":"#92400e" }}>
                          {ct.phan === "nghe" ? "Nghe" : ct.phan === "viet" ? "Viết" : "Đọc"}
                        </span>
                      </td>
                      <td style={{ padding:"6px 10px", border:"1px solid #e5e7eb", maxWidth:220, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {(ct.noi_dung||"").slice(0,60)}{(ct.noi_dung||"").length>60?"...":""}
                      </td>
                      <td style={{ padding:"6px 10px", border:"1px solid #e5e7eb", fontWeight:600,
                        color: ct.dung?"#059669":"#dc2626" }}>{ct.dap_an_chon||"—"}</td>
                      <td style={{ padding:"6px 10px", border:"1px solid #e5e7eb", fontWeight:600, color:"#059669" }}>{ct.dap_an_dung}</td>
                      <td style={{ padding:"6px 10px", border:"1px solid #e5e7eb", fontSize:16, textAlign:"center" }}>
                        {ct.dung ? <span style={{ color:"#059669" }}>✓</span> : <span style={{ color:"#dc2626" }}>✗</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ display:"flex", justifyContent:"center", marginTop:24 }}>
            <button onClick={onHoanThanh}
              style={{ padding:"10px 28px", background:"#e11d48", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer" }}>
              Hoàn thành
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- RENDER CÂU HỎI ---- */
  const renderCauHoi = (cau, idx, globalIdx) => {
    const luaChonRaw = cau.lua_chon || {};
    const luaChon = typeof luaChonRaw === "string" ? (() => { try { return JSON.parse(luaChonRaw); } catch { return {}; } })() : luaChonRaw;
    const loai = cau.loai_cau || "mcq";
    const selected = daDone[cau.id];

    return (
      <div key={cau.id} id={`cau-${cau.id}`}
        style={{ background:"#fff", borderRadius:8, padding:18, marginBottom:12, border:"1px solid #e5e7eb", boxShadow:"0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <span style={{ width:26, height:26, borderRadius:"50%", background:"#e11d48", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, flexShrink:0 }}>
            {globalIdx + 1}
          </span>
          {cau.huong_dan && <span style={{ fontSize:12, color:"#6b7280", fontStyle:"italic" }}>{cau.huong_dan}</span>}
        </div>
        <div style={{ fontSize:14, lineHeight:1.7, color:"#374151", marginBottom:12 }}>{cau.noi_dung}</div>

        {/* MCQ */}
        {(loai === "mcq" || loai === "multiple_choice") && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {["A","B","C","D"].map(opt => {
              const val = luaChon[opt] || cau[`lua_chon_${opt.toLowerCase()}`];
              if (!val) return null;
              const isSel = selected === opt;
              return (
                <div key={opt} onClick={() => handleChonDapAn(cau.id, opt)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:8, cursor:"pointer",
                    border:`2px solid ${isSel ? "#e11d48" : "#e5e7eb"}`,
                    background: isSel ? "#fef2f2" : "#fff",
                    transition:"all 0.1s" }}
                  onMouseEnter={e => { if (!isSel) e.currentTarget.style.background="#f9fafb"; }}
                  onMouseLeave={e => { if (!isSel) e.currentTarget.style.background="#fff"; }}>
                  <span style={{ width:24, height:24, borderRadius:"50%", border:`2px solid ${isSel?"#e11d48":"#d1d5db"}`,
                    background: isSel?"#e11d48":"#fff", display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:11, fontWeight:700, color: isSel?"#fff":"#374151", flexShrink:0 }}>{opt}</span>
                  <span style={{ fontSize:13, color: isSel?"#e11d48":"#374151" }}>{val}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* True/False */}
        {loai === "true_false" && (
          <div style={{ display:"flex", gap:10 }}>
            {["T","F"].map(opt => {
              const isSel = selected === opt;
              return (
                <button key={opt} onClick={() => handleChonDapAn(cau.id, opt)}
                  style={{ padding:"8px 20px", borderRadius:8, border:`2px solid ${isSel?"#e11d48":"#e5e7eb"}`,
                    background: isSel?"#e11d48":"#fff", color: isSel?"#fff":"#374151",
                    fontWeight:700, fontSize:13, cursor:"pointer" }}>
                  {opt === "T" ? "True ✓" : "False ✗"}
                </button>
              );
            })}
          </div>
        )}

        {/* Fill blank */}
        {loai === "fill_blank" && (
          <input value={selected || ""} onChange={e => handleChonDapAn(cau.id, e.target.value)}
            placeholder="Điền câu trả lời..."
            style={{ width:"100%", padding:"9px 12px", border:`1.5px solid ${selected?"#e11d48":"#e5e7eb"}`, borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box" }} />
        )}

        {/* Essay */}
        {loai === "essay" && (
          <textarea value={writingText[cau.id] || ""} rows={8}
            onChange={e => {
              setWritingText(p => ({ ...p, [cau.id]: e.target.value }));
              handleChonDapAn(cau.id, e.target.value.substring(0, 10) + "...");
            }}
            placeholder="Viết bài của bạn tại đây..."
            style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.7 }} />
        )}
      </div>
    );
  };

  /* ---- LAYOUT READING: passage trái + câu hỏi phải ---- */
  const renderReading = () => {
    if (readingPassages.length > 0) {
      // Có passages từ DB
      return (
        <div style={{ display:"flex", gap:0, height:"calc(100vh - 120px)" }}>
          {/* Passage panel */}
          <div style={{ flex:"0 0 48%", overflowY:"auto", padding:"20px 24px", borderRight:"2px solid #e5e7eb", background:"#fff" }}>
            {readingPassages.map((p, pi) => (
              <div key={p.id} style={{ marginBottom:32 }}>
                {p.title && <div style={{ fontSize:16, fontWeight:700, color:"#111827", marginBottom:12 }}>{p.title}</div>}
                <div style={{ fontSize:14, lineHeight:1.9, color:"#374151" }}
                  dangerouslySetInnerHTML={{ __html: p.content || "" }} />
              </div>
            ))}
          </div>
          {/* Questions panel */}
          <div style={{ flex:1, overflowY:"auto", padding:"20px 24px", background:"#f9fafb" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#6b7280", marginBottom:16, textTransform:"uppercase", letterSpacing:0.5 }}>
              Câu hỏi ({cauDoc.length} câu)
            </div>
            {cauDoc.map((c, i) => renderCauHoi(c, i, i))}
          </div>
        </div>
      );
    }

    // Không có passages — fallback: hiển thị passage inline từ cau.passage
    const passageGroups = {};
    cauDoc.forEach(c => {
      const key = c.bai_tap_id || c.passage || "default";
      if (!passageGroups[key]) passageGroups[key] = { passage: c.passage, cauHois: [] };
      passageGroups[key].cauHois.push(c);
    });

    const groups = Object.values(passageGroups);
    if (groups.length > 0 && groups[0].passage) {
      return (
        <div style={{ display:"flex", gap:0, height:"calc(100vh - 120px)" }}>
          <div style={{ flex:"0 0 48%", overflowY:"auto", padding:"20px 24px", borderRight:"2px solid #e5e7eb", background:"#fff" }}>
            {groups.map((g, gi) => g.passage && (
              <div key={gi} style={{ marginBottom:32 }}>
                <div style={{ fontSize:14, lineHeight:1.9, color:"#374151" }}>{g.passage}</div>
              </div>
            ))}
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"20px 24px", background:"#f9fafb" }}>
            {cauDoc.map((c, i) => renderCauHoi(c, i, i))}
          </div>
        </div>
      );
    }

    // Không có passage — hiển thị thẳng
    return (
      <div style={{ padding:"20px 24px" }}>
        {cauDoc.map((c, i) => renderCauHoi(c, i, i))}
        {cauDoc.length === 0 && <div style={{ color:"#9ca3af", fontSize:13 }}>Không có câu hỏi đọc</div>}
      </div>
    );
  };

  return (
    <div style={{ background:"#f9fafb", minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      {/* Sticky header */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:"#111827", color:"#fff", padding:"10px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <span style={{ fontSize:14, fontWeight:600 }}>{deThi?.ten_de || "Bài kiểm tra"}</span>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <span style={{ fontSize:16, fontWeight:700, fontFamily:"monospace", color: isLow?"#fca5a5":"#fff", display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:11, color: isLow?"#fca5a5":"#9ca3af", fontFamily:"sans-serif", fontWeight:400 }}>
              {thoiGian !== null && thoiGian >= 3600 ? "giờ:phút:giây" : "phút:giây"}
            </span>
            {fmtTime(thoiGian)}
          </span>
          <span style={{ fontSize:13, color:"#9ca3af" }}>{daDoneCount}/{cauHois.length} câu đã trả lời</span>
          <button onClick={() => handleNopBai(false)} disabled={submitting}
            style={{ padding:"6px 16px", background:"#e11d48", color:"#fff", border:"none", borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer", opacity:submitting?0.6:1 }}>
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </button>
        </div>
      </div>

      {/* Skill tabs */}
      <div style={{ background:"#fff", borderBottom:"2px solid #e5e7eb", display:"flex", padding:"0 24px", flexShrink:0 }}>
        {[
          { id:"nghe", label:`Listening (${cauNghe.length})`, show: cauNghe.length > 0 },
          { id:"doc",  label:`Reading (${cauDoc.length})`,   show: cauDoc.length > 0 },
          { id:"viet", label:`Writing (${cauViet.length})`,  show: cauViet.length > 0 },
        ].filter(t => t.show).map(tab => {
          const cfg = PHAN_CFG[tab.id];
          return (
            <button key={tab.id} onClick={() => setCurrentPhan(tab.id)}
              style={{ padding:"12px 20px", border:"none", cursor:"pointer", fontSize:14, fontWeight:600, background:"transparent",
                color: currentPhan===tab.id ? cfg.color : "#9ca3af",
                borderBottom: currentPhan===tab.id ? `3px solid ${cfg.color}` : "3px solid transparent",
                marginBottom:-2 }}>
              {cfg.icon} {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ flex:1, overflow:"hidden" }}>
        {/* LISTENING */}
        {currentPhan === "nghe" && (
          <div style={{ height:"100%", overflowY:"auto" }}>
            {deThi?.file_audio ? (
              <div style={{ background:"#1f2937", padding:"16px 24px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span style={{ fontSize:20 }}>🎧</span>
                  <span style={{ color:"#e5e7eb", fontSize:14, fontWeight:600 }}>Audio bài nghe</span>
                  <span style={{ fontSize:12, color:"#6b7280", marginLeft:"auto" }}>Bạn có thể nghe lại nhiều lần</span>
                </div>
                <audio
                  controls
                  controlsList="nodownload"
                  style={{ width:"100%", height:44, borderRadius:8, outline:"none" }}
                >
                  <source src={`http://localhost:5000/uploads/${deThi.file_audio}`} type="audio/mpeg" />
                  <source src={`http://localhost:5000/uploads/${deThi.file_audio}`} type="audio/ogg" />
                  <source src={`http://localhost:5000/uploads/${deThi.file_audio}`} type="audio/wav" />
                  Trình duyệt không hỗ trợ audio.
                </audio>
                <div style={{ fontSize:12, color:"#9ca3af", marginTop:8 }}>
                  📁 {deThi.file_audio}
                </div>
              </div>
            ) : (
              <div style={{ background:"#fef3c7", padding:"10px 24px", fontSize:13, color:"#92400e" }}>
                ⚠️ Đề thi này chưa có file audio. Vui lòng liên hệ giáo viên.
              </div>
            )}
            <div style={{ padding:"20px 24px" }}>
              {cauNghe.map((c, i) => renderCauHoi(c, i, i))}
              {cauNghe.length === 0 && <div style={{ color:"#9ca3af", fontSize:13 }}>Không có câu hỏi nghe</div>}
            </div>
          </div>
        )}

        {/* READING — layout 2 cột */}
        {currentPhan === "doc" && renderReading()}

        {/* WRITING */}
        {currentPhan === "viet" && (
          <div style={{ height:"100%", overflowY:"auto", padding:"20px 24px" }}>
            {cauViet.map((c, i) => renderCauHoi(c, i, i))}
            {cauViet.length === 0 && <div style={{ color:"#9ca3af", fontSize:13 }}>Không có câu hỏi viết</div>}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ background:"#fff", borderTop:"1px solid #e5e7eb", padding:"8px 24px", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {cauHois.map((c, i) => {
            const done = !!daDone[c.id];
            const cfg = PHAN_CFG[c.phan] || PHAN_CFG.doc;
            return (
              <button key={c.id} onClick={() => {
                setCurrentPhan(c.phan);
                setTimeout(() => document.getElementById(`cau-${c.id}`)?.scrollIntoView({ behavior:"smooth", block:"center" }), 100);
              }}
                style={{ width:28, height:28, borderRadius:4, border:`1px solid ${done?cfg.color:"#e5e7eb"}`,
                  background: done?cfg.color:"#fff", color: done?"#fff":"#374151",
                  fontSize:11, fontWeight:600, cursor:"pointer" }}>
                {i+1}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize:12, color:"#9ca3af" }}>
          {daDoneCount}/{cauHois.length} câu
        </div>
      </div>
    </div>
  );
}
