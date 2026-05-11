import { useState, useEffect } from "react";
import { lmsAPI, lmsAPI2 } from "../../api";

const SIDEBAR_ITEMS = [
  { id:"lich-hoc",    icon:"📅", label:"Lịch học" },
  { id:"hoc-vien",   icon:"👥", label:"Học viên" },
  { id:"buoi-hoc",   icon:"📋", label:"Các buổi học" },
  { id:"bai-tap",    icon:"📝", label:"Bài tập" },
  { id:"tai-lieu",   icon:"📁", label:"Tài liệu" },
  { id:"diem-danh",  icon:"✅", label:"Điểm danh" },
  { id:"bang-diem",  icon:"📊", label:"Bảng điểm" },
  { id:"diem-danh-gv",icon:"👨‍🏫",label:"Điểm danh giáo viên" },
  { id:"phan-hoi",   icon:"💬", label:"Phản hồi buổi học" },
  { id:"thong-bao",  icon:"🔔", label:"Thông báo" },
];

const KHOA_COLOR = (name = "") => {
  const n = (name || "").toLowerCase();
  if (n.includes("base"))  return { bg:"#dcfce7", border:"#16a34a", text:"#15803d" };
  if (n.includes("pre"))   return { bg:"#dbeafe", border:"#2563eb", text:"#1d4ed8" };
  if (n.includes("found")) return { bg:"#fef9c3", border:"#ca8a04", text:"#92400e" };
  if (n.includes("stand")) return { bg:"#ede9fe", border:"#7c3aed", text:"#5b21b6" };
  if (n.includes("com"))   return { bg:"#fee2e2", border:"#dc2626", text:"#991b1b" };
  return { bg:"#f3f4f6", border:"#6b7280", text:"#374151" };
};

const fmtDate = (s) => { if (!s) return "—"; const d = new Date(s); return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; };
const fmtMoney = (n) => n ? Number(n).toLocaleString("vi-VN") + "đ" : "—";
const thuToIdx = { Thu2:0, Thu3:1, Thu4:2, Thu5:3, Thu6:4, Thu7:5, CNhat:6 };

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days = [];
  for (let i = -startDow; i <= lastDay.getDate() - 1 + (6 - (lastDay.getDay() === 0 ? 6 : lastDay.getDay() - 1)); i++) {
    days.push(new Date(year, month, 1 + i));
  }
  return days;
}

function getMonday(d) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d); m.setDate(d.getDate() + diff); m.setHours(0,0,0,0);
  return m;
}

// ── Tab: Lịch học (calendar của riêng lớp này) ──
function TabLichHoc({ lop }) {
  const [viewMode, setViewMode] = useState("thang");
  const [baseDate, setBaseDate] = useState(new Date());
  const today = new Date(); today.setHours(0,0,0,0);

  const lichs = lop.lichHocs || lop.lich_hocs || [];
  const tenKhoa = lop.khoaHoc?.ten_khoa || "";
  const c = KHOA_COLOR(tenKhoa || lop.ma_lop);

  const goPrev = () => { const d = new Date(baseDate); viewMode==="thang" ? d.setMonth(d.getMonth()-1) : d.setDate(d.getDate()-7); setBaseDate(d); };
  const goNext = () => { const d = new Date(baseDate); viewMode==="thang" ? d.setMonth(d.getMonth()+1) : d.setDate(d.getDate()+7); setBaseDate(d); };

  const getEventsForDay = (d) => {
    const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
    return lichs.filter(l => thuToIdx[l.thu_trong_tuan || l.thu] === dow);
  };

  const title = viewMode === "thang"
    ? `Tháng ${baseDate.getMonth()+1}/${baseDate.getFullYear()}`
    : (() => {
        const mon = getMonday(baseDate);
        const sun = new Date(mon); sun.setDate(mon.getDate()+6);
        return `${fmtDate(mon)} – ${fmtDate(sun)}`;
      })();

  const renderDayCell = (d, isOtherMonth = false) => {
    const isToday = d.toDateString() === today.toDateString();
    const evs = getEventsForDay(d);
    return (
      <div style={{
        minHeight: viewMode==="thang" ? 90 : 120, padding:"6px 4px",
        background: isToday ? "#eff6ff" : isOtherMonth ? "#fafafa" : "#fff",
        borderRight:"1px solid #f0f0f0", borderBottom:"1px solid #f0f0f0",
      }}>
        <div style={{
          fontSize:13, fontWeight: isToday?800:500,
          color: isToday?"#fff": isOtherMonth?"#d1d5db":"#374151",
          width:24, height:24, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
          background: isToday?"#1d6fdb":"transparent", marginBottom:4,
        }}>{d.getDate()}</div>
        {evs.map((l, j) => (
          <div key={j} style={{
            display:"flex", gap:4, padding:"2px 6px",
            background: c.bg, border:`1px solid ${c.border}`,
            borderRadius:4, marginBottom:2, fontSize:11, fontWeight:700, color: c.text,
          }}>
            <span style={{ background: c.border, color:"#fff", padding:"0 4px", borderRadius:3 }}>{(l.gio_bat_dau||"").slice(0,5)}</span>
            <span style={{ background: c.border, color:"#fff", padding:"0 4px", borderRadius:3 }}>{(l.gio_ket_thuc||"").slice(0,5)}</span>
          </div>
        ))}
      </div>
    );
  };

  const days = viewMode === "thang"
    ? getMonthDays(baseDate.getFullYear(), baseDate.getMonth())
    : (() => { const m = getMonday(baseDate); return Array.from({length:7},(_,i)=>{ const d=new Date(m); d.setDate(m.getDate()+i); return d; }); })();

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <button onClick={goPrev} style={{ width:32, height:32, border:"1px solid #d1d5db", borderRadius:8, background:"#fff", cursor:"pointer", fontSize:16 }}>‹</button>
        <button onClick={()=>setBaseDate(new Date())} style={{ padding:"6px 14px", border:"1px solid #d1d5db", borderRadius:8, background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>Hôm nay</button>
        <button onClick={goNext} style={{ width:32, height:32, border:"1px solid #d1d5db", borderRadius:8, background:"#fff", cursor:"pointer", fontSize:16 }}>›</button>
        <span style={{ flex:1, textAlign:"center", fontSize:16, fontWeight:700, color:"#111827" }}>{title}</span>
        <div style={{ display:"flex", border:"1px solid #d1d5db", borderRadius:8, overflow:"hidden" }}>
          {[["thang","Tháng"],["tuan","Tuần"]].map(([v,l])=>(
            <button key={v} onClick={()=>setViewMode(v)} style={{ padding:"6px 16px", border:"none", cursor:"pointer", fontSize:13, fontWeight:700, background:viewMode===v?"#1d6fdb":"#fff", color:viewMode===v?"#fff":"#374151" }}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", background:"#1d6fdb" }}>
          {["Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy","Chủ Nhật"].map(t=>(
            <div key={t} style={{ padding:"10px 4px", textAlign:"center", color:"#fff", fontSize:12, fontWeight:700 }}>{t}</div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
          {viewMode==="thang"
            ? days.map((d,i) => <div key={i}>{renderDayCell(d, d.getMonth()!==baseDate.getMonth())}</div>)
            : days.map((d,i) => <div key={i}>{renderDayCell(d)}</div>)
          }
        </div>
      </div>
    </div>
  );
}

// ── Tab: Học viên ──
function TabHocVien({ lop, onAddHV }) {
  const [dks, setDks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lmsAPI.getDangKyByLop(lop.id)
      .then(r => setDks(Array.isArray(r) ? r : (r.data || [])))
      .finally(() => setLoading(false));
  }, [lop.id]);

  if (loading) return <div style={{ textAlign:"center", padding:40, color:"#9ca3af" }}>Đang tải...</div>;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:15, fontWeight:700, color:"#111827" }}>Danh sách học viên ({dks.length}/{lop.si_so_toi_da||12})</div>
        <button onClick={onAddHV} style={{ padding:"7px 16px", background:"#e11d48", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>+ Thêm học viên</button>
      </div>
      <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#f9fafb" }}>
              {["#","Họ tên","SĐT","Email","Trạng thái","Ngày đăng ký"].map(h=>(
                <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:12, fontWeight:700, color:"#6b7280", borderBottom:"1px solid #e5e7eb" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dks.length === 0
              ? <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Chưa có học viên</td></tr>
              : dks.map((dk, i) => {
                const hv = dk.hocVien || dk;
                return (
                  <tr key={dk.id||i} style={{ borderBottom:"1px solid #f3f4f6" }}>
                    <td style={{ padding:"10px 14px", color:"#9ca3af", fontSize:13 }}>{i+1}</td>
                    <td style={{ padding:"10px 14px", fontWeight:600, fontSize:14 }}>{hv.ho_ten||"—"}</td>
                    <td style={{ padding:"10px 14px", fontSize:13, color:"#6b7280" }}>{hv.sdt||"—"}</td>
                    <td style={{ padding:"10px 14px", fontSize:13, color:"#6b7280" }}>{hv.email||"—"}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700,
                        background: dk.trang_thai==="da_xac_nhan"?"#d1fae5": dk.trang_thai==="hoan_thanh"?"#dbeafe":"#fef3c7",
                        color: dk.trang_thai==="da_xac_nhan"?"#065f46": dk.trang_thai==="hoan_thanh"?"#1d4ed8":"#92400e" }}>
                        {dk.trang_thai==="da_xac_nhan"?"Đang học": dk.trang_thai==="hoan_thanh"?"Hoàn thành":"Chờ xác nhận"}
                      </span>
                    </td>
                    <td style={{ padding:"10px 14px", fontSize:12, color:"#9ca3af" }}>{dk.ngay_dk ? fmtDate(dk.ngay_dk) : "—"}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tính ngày các buổi học từ lịch học + ngày bắt đầu ──
function buildBuoiList(lop) {
  const lichs = lop.lichHocs || lop.lich_hocs || [];
  const total = lop.so_buoi_tong || 0;
  if (!lichs.length || !lop.ngay_bat_dau) return Array.from({length:total},(_,i)=>({so:i+1,ngay:null,gio_bat:"",gio_ket:""}));

  const thuMap = { Thu2:1, Thu3:2, Thu4:3, Thu5:4, Thu6:5, Thu7:6, CNhat:0 };
  const start = new Date(lop.ngay_bat_dau);
  const buois = [];
  let cur = new Date(start);
  cur.setHours(0,0,0,0);

  while (buois.length < total) {
    const dow = cur.getDay();
    lichs.forEach(l => {
      if (buois.length >= total) return;
      const thuDow = thuMap[l.thu_trong_tuan || l.thu];
      if (thuDow === dow) {
        buois.push({ so: buois.length+1, ngay: new Date(cur), gio_bat: l.gio_bat_dau||"", gio_ket: l.gio_ket_thuc||"" });
      }
    });
    cur.setDate(cur.getDate()+1);
    if (cur > new Date(cur.getFullYear()+2, 0, 1)) break; // safety
  }
  return buois;
}

// ── Tab: Các buổi học — grid tròn như ảnh ──
function TabBuoiHoc({ lop }) {
  const buois = buildBuoiList(lop);
  const done  = lop.so_buoi_da_hoc || 0;

  const fmtBuoi = (d) => {
    if (!d) return "—";
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
  };

  return (
    <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:24 }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:24 }}>
        {buois.map((b, i) => {
          const isDone = i < done;
          return (
            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
              {/* Circle */}
              <div style={{
                width:56, height:56, borderRadius:"50%",
                background: isDone ? "#1d6fdb" : "#e5e7eb",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18, fontWeight:800, color: isDone ? "#fff" : "#9ca3af",
                boxShadow: isDone ? "0 4px 12px rgba(29,111,219,0.35)" : "none",
              }}>{b.so}</div>
              {/* Date */}
              <div style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{fmtBuoi(b.ngay)}</div>
              {/* Time */}
              <div style={{ fontSize:11, color:"#6b7280", textAlign:"center" }}>
                {b.gio_bat.slice(0,5)} - {b.gio_ket.slice(0,5)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Bài tập — bảng như ảnh ──
function TabBaiTap({ lop }) {
  const [baiTaps, setBaiTaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    lmsAPI2.getBaiTaps({ lop_hoc_id: lop.id })
      .then(r => setBaiTaps(Array.isArray(r) ? r : (r.data || [])))
      .finally(() => setLoading(false));
  }, [lop.id]);

  const totalPages = Math.max(1, Math.ceil(baiTaps.length / PAGE_SIZE));
  const paged = baiTaps.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const TH = { padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:700, color:"#fff", background:"#e11d48", borderRight:"1px solid rgba(255,255,255,0.2)" };
  const TD = { padding:"10px 14px", fontSize:13, borderBottom:"1px solid #f3f4f6", borderRight:"1px solid #f3f4f6" };

  return (
    <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:20 }}>
      <div style={{ fontSize:15, fontWeight:700, color:"#111827", marginBottom:16 }}>Bài tập</div>
      {loading ? <div style={{ textAlign:"center", padding:40, color:"#9ca3af" }}>Đang tải...</div> : (
        <>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #e5e7eb" }}>
              <thead>
                <tr>
                  <th style={TH}>Tên bài</th>
                  <th style={TH}>Bắt đầu</th>
                  <th style={TH}>Kết thúc</th>
                  <th style={TH}>Đề</th>
                  <th style={TH}>GV chấm</th>
                  <th style={{...TH, borderRight:"none"}}></th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0
                  ? <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Chưa có bài tập</td></tr>
                  : paged.map((bt, i) => (
                    <tr key={bt.id||i} style={{ background: i%2===0?"#fff":"#fafafa" }}>
                      <td style={{...TD, color:"#2563eb", fontWeight:600, cursor:"pointer"}}>{bt.ten_bai||bt.loai_bai||"—"}</td>
                      <td style={TD}>{bt.ngay_bat_dau ? fmtDate(bt.ngay_bat_dau) : "—"}</td>
                      <td style={TD}>{bt.han_nop ? fmtDate(bt.han_nop) : "—"}</td>
                      <td style={{...TD, color:"#e11d48", fontWeight:600}}>{bt.mo_ta ? bt.mo_ta.slice(0,25)+"..." : "—"}</td>
                      <td style={TD}>{bt.giaoVien?.ho_ten || lop.giaoVien?.ho_ten || "—"}</td>
                      <td style={{...TD, borderRight:"none"}}>
                        <span style={{ fontSize:18 }}>👥</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:8, marginTop:12, fontSize:13, color:"#6b7280" }}>
            <span>Tổng cộng: {baiTaps.length}</span>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
              style={{ width:28, height:28, border:"1px solid #d1d5db", borderRadius:4, background:"#fff", cursor:"pointer", fontSize:14 }}>‹</button>
            <span style={{ width:28, height:28, border:"1px solid #e11d48", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#e11d48" }}>{page}</span>
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
              style={{ width:28, height:28, border:"1px solid #d1d5db", borderRadius:4, background:"#fff", cursor:"pointer", fontSize:14 }}>›</button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Tab: Điểm danh — chọn buổi, điểm danh từng HV ──
function TabDiemDanh({ lop }) {
  const buois = buildBuoiList(lop);
  const [selBuoi, setSelBuoi] = useState(0); // index
  const [dks, setDks] = useState([]);
  const [diemDanh, setDiemDanh] = useState({}); // { dk_id: { trang_thai, ghi_chu } }
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    lmsAPI.getDangKyByLop(lop.id)
      .then(r => setDks(Array.isArray(r) ? r : (r.data || [])));
  }, [lop.id]);

  // Init điểm danh mặc định "co_mat"
  useEffect(() => {
    const init = {};
    dks.forEach(dk => { init[dk.id] = { trang_thai:"co_mat", ghi_chu:"" }; });
    setDiemDanh(init);
  }, [dks]);

  const buoi = buois[selBuoi];
  const buoiLabel = buoi
    ? `[Buổi ${buoi.so}][${buoi.ngay ? `${String(buoi.ngay.getDate()).padStart(2,"0")}/${String(buoi.ngay.getMonth()+1).padStart(2,"0")}` : ""}] ${buoi.gio_bat.slice(0,5)} - ${buoi.gio_ket.slice(0,5)}`
    : "";

  const setAllCoMat = () => {
    const updated = {};
    dks.forEach(dk => { updated[dk.id] = { ...diemDanh[dk.id], trang_thai:"co_mat" }; });
    setDiemDanh(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ngay = buoi?.ngay ? buoi.ngay.toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
      const danh_sach = dks.map(dk => ({
        dk_lop_hoc_id: dk.id,
        trang_thai: diemDanh[dk.id]?.trang_thai || "co_mat",
        ghi_chu: diemDanh[dk.id]?.ghi_chu || "",
      }));
      await lmsAPI2.diemDanhBulk({ lop_hoc_id: lop.id, ngay, danh_sach });
      alert("✅ Điểm danh thành công!");
    } catch(e) { alert("Lỗi: " + e.message); }
    setSaving(false);
  };

  const totalPages = Math.max(1, Math.ceil(dks.length / PAGE_SIZE));
  const paged = dks.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const TH = { padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:700, color:"#fff", background:"#e11d48", borderRight:"1px solid rgba(255,255,255,0.2)" };
  const TD = { padding:"10px 14px", fontSize:13, borderBottom:"1px solid #f3f4f6", borderRight:"1px solid #f3f4f6" };

  const TRANG_THAI_DD = [
    { value:"co_mat",      label:"Có mặt" },
    { value:"vang_co_phep",label:"Vắng có phép" },
    { value:"vang_khong_phep",label:"Vắng không phép" },
    { value:"di_muon",     label:"Đi muộn" },
  ];

  return (
    <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:20 }}>
      {/* Header controls */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Buổi học:</span>
          <select value={selBuoi} onChange={e=>{ setSelBuoi(+e.target.value); setPage(1); }}
            style={{ padding:"6px 12px", border:"1px solid #d1d5db", borderRadius:6, fontSize:13, outline:"none", minWidth:260 }}>
            {buois.map((b,i) => (
              <option key={i} value={i}>
                {`[Buổi ${b.so}][${b.ngay ? `${String(b.ngay.getDate()).padStart(2,"0")}/${String(b.ngay.getMonth()+1).padStart(2,"0")}` : ""}] ${b.gio_bat.slice(0,5)} - ${b.gio_ket.slice(0,5)}`}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button onClick={setAllCoMat}
            style={{ padding:"7px 16px", background:"#2563eb", color:"#fff", border:"none", borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            👥 Tất cả có mặt
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding:"7px 16px", background:"#e5e7eb", color:"#374151", border:"none", borderRadius:6, fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, opacity:saving?0.7:1 }}>
            📋 {saving?"Đang lưu...":"Điểm danh"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #e5e7eb" }}>
          <thead>
            <tr>
              <th style={TH}>Học viên</th>
              <th style={TH}>Điểm danh</th>
              <th style={{...TH, borderRight:"none"}}>Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0
              ? <tr><td colSpan={3} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Chưa có học viên</td></tr>
              : paged.map((dk, i) => {
                const hv = dk.hocVien || dk;
                const dd = diemDanh[dk.id] || { trang_thai:"co_mat", ghi_chu:"" };
                return (
                  <tr key={dk.id||i} style={{ background: i%2===0?"#fff":"#fafafa" }}>
                    <td style={{...TD, color:"#2563eb", fontWeight:600}}>{hv.ho_ten||"—"}</td>
                    <td style={TD}>
                      <select value={dd.trang_thai}
                        onChange={e => setDiemDanh(prev=>({...prev,[dk.id]:{...prev[dk.id],trang_thai:e.target.value}}))}
                        style={{ padding:"5px 10px", border:"1px solid #d1d5db", borderRadius:6, fontSize:13, outline:"none", minWidth:160 }}>
                        {TRANG_THAI_DD.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </td>
                    <td style={{...TD, borderRight:"none"}}>
                      <input value={dd.ghi_chu||""} placeholder="Nhận xét..."
                        onChange={e => setDiemDanh(prev=>({...prev,[dk.id]:{...prev[dk.id],ghi_chu:e.target.value}}))}
                        style={{ width:"100%", padding:"5px 10px", border:"1px solid #d1d5db", borderRadius:6, fontSize:13, outline:"none", boxSizing:"border-box" }} />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:8, marginTop:12, fontSize:13, color:"#6b7280" }}>
        <span>Tổng cộng: {dks.length}</span>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
          style={{ width:28, height:28, border:"1px solid #d1d5db", borderRadius:4, background:"#fff", cursor:"pointer" }}>‹</button>
        <span style={{ width:28, height:28, border:"1px solid #e11d48", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#e11d48" }}>{page}</span>
        <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
          style={{ width:28, height:28, border:"1px solid #d1d5db", borderRadius:4, background:"#fff", cursor:"pointer" }}>›</button>
      </div>
    </div>
  );
}

// ── Tab: Điểm danh giáo viên — bảng lịch sử ──
function TabDiemDanhGV({ lop }) {
  const buois = buildBuoiList(lop);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;
  const tenGV = lop.giaoVien?.ho_ten || "—";

  // Tạo dữ liệu từ buổi đã học
  const done = lop.so_buoi_da_hoc || 0;
  const records = buois.slice(0, done);

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const paged = records.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE);

  const fmtNgay = (d) => {
    if (!d) return "—";
    return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
  };

  const TH = { padding:"10px 14px", textAlign:"left", fontSize:13, fontWeight:700, color:"#fff", background:"#e11d48", borderRight:"1px solid rgba(255,255,255,0.2)" };
  const TD = { padding:"10px 14px", fontSize:13, borderBottom:"1px solid #f3f4f6", borderRight:"1px solid #f3f4f6", color:"#374151" };

  return (
    <div style={{ background:"#fff", borderRadius:10, border:"1px solid #e5e7eb", padding:20 }}>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", border:"1px solid #e5e7eb" }}>
          <thead>
            <tr>
              <th style={TH}>Giáo viên</th>
              <th style={TH}>Ngày</th>
              <th style={TH}>Thời gian học</th>
              <th style={{...TH, borderRight:"none"}}>Điểm danh</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0
              ? <tr><td colSpan={4} style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>Chưa có dữ liệu</td></tr>
              : paged.map((b, i) => (
                <tr key={i} style={{ background: i%2===0?"#fff":"#fafafa" }}>
                  <td style={{...TD, color:"#2563eb", fontWeight:600}}>{tenGV}</td>
                  <td style={TD}>{fmtNgay(b.ngay)}</td>
                  <td style={TD}>{b.gio_bat.slice(0,5)} - {b.gio_ket.slice(0,5)}</td>
                  <td style={{...TD, borderRight:"none"}}>
                    <span style={{ color:"#374151" }}>Đã điểm danh</span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", alignItems:"center", gap:8, marginTop:12, fontSize:13, color:"#6b7280" }}>
        <span>Tổng cộng: {records.length}</span>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}
          style={{ width:28, height:28, border:"1px solid #d1d5db", borderRadius:4, background:"#fff", cursor:"pointer" }}>‹</button>
        <span style={{ width:28, height:28, border:"1px solid #e11d48", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#e11d48" }}>{page}</span>
        <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
          style={{ width:28, height:28, border:"1px solid #d1d5db", borderRadius:4, background:"#fff", cursor:"pointer" }}>›</button>
      </div>
    </div>
  );
}

// ── Tab placeholder ──
function TabPlaceholder({ label }) {
  return (
    <div style={{ textAlign:"center", padding:80, color:"#9ca3af" }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🚧</div>
      <div style={{ fontSize:16, fontWeight:600 }}>Tính năng {label} đang phát triển</div>
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function ClassDetailPage({ lopId, lopData, onBack, onNavigate }) {
  const [lop, setLop] = useState(lopData || null);
  const [loading, setLoading] = useState(!lopData);
  const [activeTab, setActiveTab] = useState("lich-hoc");

  useEffect(() => {
    if (!lop && lopId) {
      setLoading(true);
      lmsAPI.getLopHocById(lopId)
        .then(r => setLop(r.data || r))
        .finally(() => setLoading(false));
    }
  }, [lopId]); // eslint-disable-line

  if (loading) return <div style={{ textAlign:"center", padding:80, color:"#9ca3af" }}>Đang tải...</div>;
  if (!lop) return <div style={{ textAlign:"center", padding:80, color:"#ef4444" }}>Không tìm thấy lớp học</div>;

  const tenKhoa = lop.khoaHoc?.ten_khoa || lop.ten_khoa_hoc || "";
  const c = KHOA_COLOR(tenKhoa || lop.ma_lop);
  const tenGV = lop.giaoVien?.ho_ten || "—";
  const lichs = lop.lichHocs || lop.lich_hocs || [];
  const lichStr = lichs.map(l => `${l.thu_trong_tuan||l.thu} ${(l.gio_bat_dau||"").slice(0,5)}-${(l.gio_ket_thuc||"").slice(0,5)}`).join(" · ") || "—";

  const renderContent = () => {
    switch (activeTab) {
      case "lich-hoc":     return <TabLichHoc lop={lop} />;
      case "hoc-vien":     return <TabHocVien lop={lop} onAddHV={() => {}} />;
      case "buoi-hoc":     return <TabBuoiHoc lop={lop} />;
      case "bai-tap":      return <TabBaiTap lop={lop} />;
      case "tai-lieu":     return <TabPlaceholder label="Tài liệu" />;
      case "diem-danh":    return <TabDiemDanh lop={lop} />;
      case "bang-diem":    return <TabPlaceholder label="Bảng điểm" />;
      case "diem-danh-gv": return <TabDiemDanhGV lop={lop} />;
      case "phan-hoi":     return <TabPlaceholder label="Phản hồi buổi học" />;
      case "thong-bao":    return <TabPlaceholder label="Thông báo" />;
      default: return null;
    }
  };

  return (
    <div style={{ display:"flex", height:"100vh", fontFamily:"system-ui,sans-serif", background:"#f9fafb" }}>
      {/* ── SIDEBAR ── */}
      <div style={{ width:220, background:"#fff", borderRight:"1px solid #e5e7eb", display:"flex", flexDirection:"column", flexShrink:0 }}>
        {/* Lớp info */}
        <div style={{ padding:"20px 16px", borderBottom:"1px solid #e5e7eb" }}>
          <div style={{ fontSize:11, color:"#9ca3af", marginBottom:4 }}>
            <span style={{ cursor:"pointer", color:"#6b7280" }} onClick={onBack}>Lớp học</span>
            {" / "}
            <span style={{ cursor:"pointer", color:"#6b7280" }} onClick={onBack}>Danh sách</span>
            {" / "}
            <span style={{ color:"#111827", fontWeight:600 }}>{lop.ma_lop}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10 }}>
            <div style={{ width:40, height:40, borderRadius:8, background:`linear-gradient(135deg,${c.border},${c.border}88)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontSize:11, fontWeight:900, color:"#fff" }}>{tenKhoa.slice(0,3).toUpperCase()}</span>
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:800, color:"#111827" }}>{lop.ma_lop}</div>
              <div style={{ fontSize:11, color:"#6b7280" }}>{tenKhoa}</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex:1, padding:"12px 8px", overflowY:"auto" }}>
          {SIDEBAR_ITEMS.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              style={{
                width:"100%", display:"flex", alignItems:"center", gap:10,
                padding:"10px 12px", borderRadius:8, border:"none", cursor:"pointer",
                background: activeTab===item.id ? "#eff6ff" : "transparent",
                color: activeTab===item.id ? "#1d6fdb" : "#374151",
                fontWeight: activeTab===item.id ? 700 : 500,
                fontSize:13, marginBottom:2, textAlign:"left",
                borderLeft: activeTab===item.id ? "3px solid #1d6fdb" : "3px solid transparent",
              }}>
              <span style={{ fontSize:16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Lớp meta */}
        <div style={{ padding:"12px 16px", borderTop:"1px solid #e5e7eb", fontSize:11, color:"#9ca3af" }}>
          <div style={{ marginBottom:4 }}>👨‍🏫 {tenGV}</div>
          <div style={{ marginBottom:4 }}>📅 {fmtDate(lop.ngay_bat_dau)} → {fmtDate(lop.ngay_ket_thuc)}</div>
          <div>👥 {lop.si_so_hien_tai||0}/{lop.si_so_toi_da||12} học viên</div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex:1, overflowY:"auto", padding:28 }}>
        {/* Breadcrumb + title */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:12, color:"#9ca3af", marginBottom:8 }}>
            <span style={{ cursor:"pointer" }} onClick={onBack}>Lớp học</span>
            {" / "}
            <span style={{ cursor:"pointer" }} onClick={onBack}>Danh sách lớp học</span>
            {" / "}
            <span style={{ color:"#111827", fontWeight:600 }}>{lop.ma_lop}</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:20, fontWeight:800, color:"#111827" }}>
              {SIDEBAR_ITEMS.find(s=>s.id===activeTab)?.icon} {SIDEBAR_ITEMS.find(s=>s.id===activeTab)?.label}
            </div>
            <span style={{ padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:700, background: c.bg, color: c.text, border:`1px solid ${c.border}` }}>
              {lop.trang_thai === "dang_dien_ra" ? "Đang diễn ra" : lop.trang_thai === "dang_lap" ? "Sắp diễn ra" : "Kết thúc"}
            </span>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
}
