import { useState, useEffect } from "react";
import { lmsAPI } from "../../api";

const THU_ORDER = ["Thu2","Thu3","Thu4","Thu5","Thu6","Thu7","CNhat"];
const THU_LABEL = { Thu2:"Thứ Hai", Thu3:"Thứ Ba", Thu4:"Thứ Tư", Thu5:"Thứ Năm", Thu6:"Thứ Sáu", Thu7:"Thứ Bảy", CNhat:"Chủ Nhật" };
const THU_SHORT = { Thu2:"T2", Thu3:"T3", Thu4:"T4", Thu5:"T5", Thu6:"T6", Thu7:"T7", CNhat:"CN" };

const KHOA_COLOR = (name = "") => {
  const n = (name || "").toLowerCase();
  if (n.includes("base"))  return { bg:"#dcfce7", border:"#16a34a", text:"#15803d", dot:"#22c55e" };
  if (n.includes("pre"))   return { bg:"#dbeafe", border:"#2563eb", text:"#1d4ed8", dot:"#3b82f6" };
  if (n.includes("found")) return { bg:"#fef9c3", border:"#ca8a04", text:"#92400e", dot:"#eab308" };
  if (n.includes("stand")) return { bg:"#ede9fe", border:"#7c3aed", text:"#5b21b6", dot:"#8b5cf6" };
  if (n.includes("com"))   return { bg:"#fee2e2", border:"#dc2626", text:"#991b1b", dot:"#ef4444" };
  return { bg:"#f3f4f6", border:"#6b7280", text:"#374151", dot:"#9ca3af" };
};

function getMonthDays(year, month) {
  // month: 0-indexed
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  // Start from Monday of the first week
  const startDow = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const days = [];
  for (let i = -startDow; i <= lastDay.getDate() - 1 + (6 - (lastDay.getDay() === 0 ? 6 : lastDay.getDay() - 1)); i++) {
    const d = new Date(year, month, 1 + i);
    days.push(d);
  }
  return days;
}

function getWeekDays(baseMonday) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseMonday);
    d.setDate(baseMonday.getDate() + i);
    return d;
  });
}

function getMonday(d) {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const m = new Date(d);
  m.setDate(d.getDate() + diff);
  m.setHours(0,0,0,0);
  return m;
}

const fmtD = (d) => `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
const fmtShort = (d) => `${d.getDate()}/${d.getMonth()+1}`;
const thuToIdx = { Thu2:0, Thu3:1, Thu4:2, Thu5:3, Thu6:4, Thu7:5, CNhat:6 };

export default function LichHocPage({ onNavigate }) {
  const [lops, setLops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("thang"); // thang | tuan
  const [baseDate, setBaseDate] = useState(new Date());
  const [tooltip, setTooltip] = useState(null); // { item, x, y }

  const gvUser = (() => { try { return JSON.parse(localStorage.getItem("gv_user")||"null"); } catch { return null; } })();
  const isGV = gvUser?.chuc_vu_id === 3 && !localStorage.getItem("adminUser");

  useEffect(() => {
    setLoading(true);
    const params = isGV ? { giao_vien_id: gvUser.id } : {};
    lmsAPI.getLopHocs(params)
      .then(res => setLops(Array.isArray(res) ? res : (res.data || [])))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  // Navigation
  const goToday = () => setBaseDate(new Date());
  const goPrev  = () => {
    const d = new Date(baseDate);
    if (viewMode === "thang") d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setBaseDate(d);
  };
  const goNext  = () => {
    const d = new Date(baseDate);
    if (viewMode === "thang") d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setBaseDate(d);
  };

  // Title
  const title = viewMode === "thang"
    ? `Tháng ${baseDate.getMonth()+1}/${baseDate.getFullYear()}`
    : (() => {
        const mon = getMonday(baseDate);
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
        return `${fmtD(mon)} – ${fmtD(sun)}`;
      })();

  // Build events per day
  const buildEvents = (days) => {
    const map = {};
    days.forEach(d => { map[d.toDateString()] = []; });
    lops.forEach(lop => {
      const tenKhoa = lop.khoaHoc?.ten_khoa || lop.ten_khoa_hoc || lop.ma_lop || "";
      const c = KHOA_COLOR(tenKhoa);
      (lop.lichHocs || lop.lich_hocs || []).forEach(lich => {
        const idx = thuToIdx[lich.thu_trong_tuan || lich.thu];
        if (idx === undefined) return;
        days.forEach(d => {
          const dow = d.getDay() === 0 ? 6 : d.getDay() - 1;
          if (dow === idx) {
            const key = d.toDateString();
            if (map[key]) map[key].push({ lop, lich, c, tenKhoa });
          }
        });
      });
    });
    // Sort by time
    Object.values(map).forEach(arr => arr.sort((a,b) => (a.lich.gio_bat_dau||"").localeCompare(b.lich.gio_bat_dau||"")));
    return map;
  };

  const today = new Date(); today.setHours(0,0,0,0);

  const handleClickLop = (lop) => {
    setTooltip(null);
    if (onNavigate) onNavigate("class-detail", { lopId: lop.id, lopData: lop });
  };

  const handleEventClick = (e, item) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ item, x: rect.left, y: rect.bottom + 8 });
  };

  // ── THÁNG VIEW ──
  const renderThang = () => {
    const days = getMonthDays(baseDate.getFullYear(), baseDate.getMonth());
    const events = buildEvents(days);
    const curMonth = baseDate.getMonth();

    return (
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", overflow:"hidden" }}>
        {/* Header row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", background:"#1d6fdb" }}>
          {["Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy","Chủ Nhật"].map(t => (
            <div key={t} style={{ padding:"12px 8px", textAlign:"center", color:"#fff", fontSize:13, fontWeight:700 }}>{t}</div>
          ))}
        </div>
        {/* Days grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)" }}>
          {days.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            const isOtherMonth = d.getMonth() !== curMonth;
            const evs = events[d.toDateString()] || [];
            return (
              <div key={i} style={{
                minHeight:110, padding:"6px 4px",
                borderRight: i%7<6 ? "1px solid #f0f0f0" : "none",
                borderBottom:"1px solid #f0f0f0",
                background: isToday ? "#eff6ff" : isOtherMonth ? "#fafafa" : "#fff",
              }}>
                <div style={{
                  fontSize:13, fontWeight: isToday ? 800 : 500,
                  color: isToday ? "#fff" : isOtherMonth ? "#d1d5db" : "#374151",
                  width:24, height:24, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                  background: isToday ? "#1d6fdb" : "transparent",
                  marginBottom:4,
                }}>{d.getDate()}</div>
                {evs.slice(0,3).map((ev, j) => (
                  <div key={j} onClick={e => handleEventClick(e, ev)}
                    style={{
                      display:"flex", alignItems:"center", gap:4, padding:"2px 6px",
                      background: ev.c.bg, border:`1px solid ${ev.c.border}`,
                      borderRadius:4, marginBottom:2, cursor:"pointer",
                      fontSize:11, color: ev.c.text, fontWeight:600,
                    }}>
                    <span style={{ background: ev.c.dot, width:6, height:6, borderRadius:"50%", flexShrink:0 }} />
                    <span style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                      {(ev.lich.gio_bat_dau||"").slice(0,5)} {ev.lop.ma_lop}
                    </span>
                  </div>
                ))}
                {evs.length > 3 && (
                  <div style={{ fontSize:10, color:"#6b7280", paddingLeft:4 }}>+{evs.length-3} lớp</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── TUẦN VIEW ──
  const renderTuan = () => {
    const mon = getMonday(baseDate);
    const days = getWeekDays(mon);
    const events = buildEvents(days);

    return (
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", background:"#1d6fdb" }}>
          {days.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            return (
              <div key={i} style={{ padding:"10px 8px", textAlign:"center", borderRight: i<6?"1px solid rgba(255,255,255,0.2)":"none" }}>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.8)", marginBottom:4 }}>{["Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy","Chủ Nhật"][i]}</div>
                <div style={{
                  fontSize:18, fontWeight:800, color:"#fff",
                  width:32, height:32, borderRadius:"50%", display:"inline-flex", alignItems:"center", justifyContent:"center",
                  background: isToday ? "rgba(255,255,255,0.3)" : "transparent",
                }}>{d.getDate()}</div>
              </div>
            );
          })}
        </div>
        {/* Events */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", minHeight:400 }}>
          {days.map((d, i) => {
            const isToday = d.toDateString() === today.toDateString();
            const evs = events[d.toDateString()] || [];
            return (
              <div key={i} style={{
                padding:"8px 6px", minHeight:200,
                background: isToday ? "#f0f7ff" : "#fff",
                borderRight: i<6 ? "1px solid #f0f0f0" : "none",
                borderTop:"1px solid #f0f0f0",
              }}>
                {evs.length === 0
                  ? <div style={{ textAlign:"center", color:"#e5e7eb", marginTop:20, fontSize:18 }}>—</div>
                  : evs.map((ev, j) => (
                    <div key={j} onClick={e => handleEventClick(e, ev)}
                      style={{
                        background: ev.c.bg, border:`1.5px solid ${ev.c.border}`,
                        borderRadius:8, padding:"6px 8px", marginBottom:6, cursor:"pointer",
                        transition:"transform 0.1s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform="scale(1.02)"}
                      onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
                      <div style={{ display:"flex", gap:4, marginBottom:3 }}>
                        <span style={{ padding:"1px 6px", background: ev.c.border, color:"#fff", borderRadius:4, fontSize:11, fontWeight:700 }}>
                          {(ev.lich.gio_bat_dau||"").slice(0,5)}
                        </span>
                        <span style={{ padding:"1px 6px", background: ev.c.border, color:"#fff", borderRadius:4, fontSize:11, fontWeight:700 }}>
                          {(ev.lich.gio_ket_thuc||"").slice(0,5)}
                        </span>
                        {ev.lop.giaoVien?.avatar && (
                          <div style={{ width:18, height:18, borderRadius:"50%", background:"#e5e7eb", marginLeft:"auto" }} />
                        )}
                      </div>
                      <div style={{ fontSize:12, fontWeight:700, color: ev.c.text }}>Lớp: {ev.lop.ma_lop}</div>
                      {!isGV && ev.lop.giaoVien?.ho_ten && (
                        <div style={{ fontSize:10, color: ev.c.text, opacity:0.75, marginTop:2 }}>
                          GV: {ev.lop.giaoVien.ho_ten}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding:24, fontFamily:"system-ui,sans-serif", background:"#f9fafb", minHeight:"100vh" }}
      onClick={() => setTooltip(null)}>

      {/* Breadcrumb */}
      <div style={{ fontSize:13, color:"#6b7280", marginBottom:16 }}>
        Lớp học &nbsp;/&nbsp; <span style={{ color:"#111827", fontWeight:600 }}>Lịch học</span>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20, flexWrap:"wrap" }}>
        {/* Nav */}
        <button onClick={goPrev} style={{ width:34, height:34, border:"1px solid #d1d5db", borderRadius:8, background:"#fff", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
        <button onClick={goToday} style={{ padding:"7px 16px", border:"1px solid #d1d5db", borderRadius:8, background:"#fff", cursor:"pointer", fontSize:13, fontWeight:600 }}>Hôm nay</button>
        <button onClick={goNext} style={{ width:34, height:34, border:"1px solid #d1d5db", borderRadius:8, background:"#fff", cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>

        {/* Title */}
        <span style={{ fontSize:18, fontWeight:700, color:"#111827", flex:1, textAlign:"center" }}>{title}</span>

        {/* View toggle */}
        <div style={{ display:"flex", border:"1px solid #d1d5db", borderRadius:8, overflow:"hidden" }}>
          {[["thang","Tháng"],["tuan","Tuần"]].map(([v,l]) => (
            <button key={v} onClick={() => setViewMode(v)}
              style={{ padding:"7px 18px", border:"none", cursor:"pointer", fontSize:13, fontWeight:700,
                background: viewMode===v ? "#1d6fdb" : "#fff", color: viewMode===v ? "#fff" : "#374151" }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:"center", padding:80, color:"#9ca3af" }}>Đang tải lịch học...</div>
      ) : (
        viewMode === "thang" ? renderThang() : renderTuan()
      )}

      {/* Tooltip popup khi hover/click event */}
      {tooltip && (
        <div style={{
          position:"fixed", left: Math.min(tooltip.x, window.innerWidth - 260), top: tooltip.y,
          background:"#fff", border:"1px solid #e5e7eb", borderRadius:10,
          boxShadow:"0 8px 24px rgba(0,0,0,0.15)", padding:16, zIndex:9999, width:240,
        }} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize:14, fontWeight:800, color:"#111827", marginBottom:8 }}>{tooltip.item.lop.ma_lop}</div>
          <div style={{ fontSize:12, color:"#6b7280", marginBottom:4 }}>
            🕐 {(tooltip.item.lich.gio_bat_dau||"").slice(0,5)} – {(tooltip.item.lich.gio_ket_thuc||"").slice(0,5)}
          </div>
          <div style={{ fontSize:12, color:"#374151", marginBottom:2 }}>
            <strong>Khóa:</strong> {tooltip.item.tenKhoa || "—"}
          </div>
          {tooltip.item.lop.giaoVien?.ho_ten && (
            <div style={{ fontSize:12, color:"#374151", marginBottom:2 }}>
              <strong>GV:</strong> {tooltip.item.lop.giaoVien.ho_ten}
            </div>
          )}
          {tooltip.item.lop.phongHoc?.ma_phong && (
            <div style={{ fontSize:12, color:"#374151", marginBottom:2 }}>
              <strong>Phòng:</strong> {tooltip.item.lop.phongHoc.ma_phong}
            </div>
          )}
          <div style={{ fontSize:12, color:"#374151", marginBottom:12 }}>
            <strong>Sĩ số:</strong> {tooltip.item.lop.si_so_hien_tai||0}/{tooltip.item.lop.si_so_toi_da||12}
          </div>
          <button onClick={() => handleClickLop(tooltip.item.lop)}
            style={{ width:"100%", padding:"8px", background:"#1d6fdb", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>
            Xem chi tiết lớp →
          </button>
        </div>
      )}
    </div>
  );
}
