import { useState, useEffect, useRef } from "react";
import { examAPI } from "../api";

export default function LamBai({ deThiId, lichHenTestId, onHoanThanh }) {
  const [deThi, setDeThi] = useState(null);
  const [ketQuaId, setKetQuaId] = useState(null);
  const [daDone, setDaDone] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ketQua, setKetQua] = useState(null);
  const [thoiGianConLai, setThoiGianConLai] = useState(null);
  const [currentPhan, setCurrentPhan] = useState("nghe");
  const [showChiTiet, setShowChiTiet] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await examAPI.batDau({ de_thi_id: deThiId, lich_hen_test_id: lichHenTestId });
        const data = res.data || res;
        console.log("[LamBai] Response:", data);
        // Backend trả về: { de_thi: de, da_tra_loi: doneMap, ket_qua_id }
        // Hoặc: { deThi: de, da_tra_loi: doneMap, ketQuaId }
        const deThiData = data.de_thi || data.deThi || data;
        setDeThi(deThiData);
        setKetQuaId(data.ket_qua_id || data.ketQuaId);
        setDaDone(data.da_tra_loi || data.da_tra_loi || {});
        const giay = (deThiData?.thoi_gian_phut || data.thoi_gian_phut || 60) * 60;
        setThoiGianConLai(giay);
        const cauNghe = (deThiData?.cauHois || data.cauHois || []).filter(c => c.phan === "nghe");
        setCurrentPhan(cauNghe.length > 0 ? "nghe" : "doc");
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (thoiGianConLai === null || ketQua) return;
    if (thoiGianConLai <= 0) { handleNopBai(true); return; }
    timerRef.current = setTimeout(() => setThoiGianConLai(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [thoiGianConLai, ketQua]); // eslint-disable-line

  const handleChonDapAn = async (cauHoiId, dapAn) => {
    setDaDone(prev => ({ ...prev, [cauHoiId]: dapAn }));
    try { await examAPI.traLoi({ ket_qua_de_thi_id: ketQuaId, cau_hoi_id: cauHoiId, dap_an_chon: dapAn }); }
    catch (e) { console.error(e); }
  };

  const handleNopBai = async (auto = false) => {
    if (!auto && !window.confirm("Ban co chac chan muon nop bai?")) return;
    setSubmitting(true);
    clearTimeout(timerRef.current);
    try {
      const res = await examAPI.nopBai({ ket_qua_de_thi_id: ketQuaId });
      setKetQua(res.data || res);
    } catch (e) { alert("Loi nop bai: " + e.message); }
    setSubmitting(false);
  };

  const fmtTime = (s) => {
    if (s === null) return "--:--";
    const m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const cauHois = deThi?.cauHois || [];
  const cauNghe = cauHois.filter(c => c.phan === "nghe");
  const cauDoc = cauHois.filter(c => c.phan === "doc");
  const daDoneCount = Object.keys(daDone).length;
  const isLow = thoiGianConLai !== null && thoiGianConLai < 300;

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f9fafb" }}>
      <div style={{ fontSize: 14, color: "#6b7280" }}>Dang tai de thi...</div>
    </div>
  );

  /* ---- KET QUA ---- */
  if (ketQua) {
    const kq = ketQua;
    const phutLam = Math.floor((kq.thoi_gian_lam || 0) / 60);
    const giayLam = (kq.thoi_gian_lam || 0) % 60;
    return (
      <div style={{ background: "#f9fafb", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 32, width: "100%", maxWidth: 700, boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 24 }}>Ket qua bai kiem tra</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            {[
              { label: "NGHE", dung: kq.so_dung_nghe, tong: kq.tong_nghe, diem: kq.diem_nghe },
              { label: "DOC", dung: kq.so_dung_doc, tong: kq.tong_doc, diem: kq.diem_doc },
            ].map(s => (
              <div key={s.label} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 1, marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{s.dung ?? "—"} / {s.tong ?? "—"} cau dung</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#059669" }}>{s.diem ?? "—"}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>Tong diem</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#111827" }}>{kq.diem_tong ?? "—"}</div>
          </div>
          <div style={{ textAlign: "center", fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
            Thoi gian lam: {phutLam} phut {giayLam} giay
          </div>

          {/* Chi tiet collapsible */}
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
            <button onClick={() => setShowChiTiet(v => !v)}
              style={{ padding: "7px 14px", border: "1px solid #d1d5db", borderRadius: 6, background: "#fff", fontSize: 13, cursor: "pointer", marginBottom: 12 }}>
              {showChiTiet ? "An chi tiet" : "Xem chi tiet tung cau"}
            </button>
            {showChiTiet && kq.chiTiet && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["STT", "Phan", "Cau hoi", "Ban chon", "Dap an dung", "Ket qua"].map((h, i) => (
                      <th key={i} style={{ padding: "7px 10px", background: "#f3f4f6", fontWeight: 600, textAlign: "left", border: "1px solid #e5e7eb" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kq.chiTiet.map((ct, i) => (
                    <tr key={i}>
                      <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>{i + 1}</td>
                      <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>{ct.phan === "nghe" ? "Nghe" : "Doc"}</td>
                      <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {(ct.noi_dung || "").slice(0, 50)}{(ct.noi_dung || "").length > 50 ? "..." : ""}
                      </td>
                      <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb" }}>{ct.dap_an_chon || "—"}</td>
                      <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb", fontWeight: 600, color: "#059669" }}>{ct.dap_an_dung}</td>
                      <td style={{ padding: "6px 10px", border: "1px solid #e5e7eb", fontSize: 14 }}>
                        {ct.dung ? <span style={{ color: "#059669" }}>&#10003;</span> : <span style={{ color: "#dc2626" }}>&#10007;</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
            <button onClick={onHoanThanh}
              style={{ padding: "10px 28px", background: "#111827", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Hoan thanh
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- DANG LAM BAI ---- */
  const renderCauHoi = (cau, idx) => (
    <div key={cau.id} id={`cau-${cau.id}`}
      style={{ background: "#fff", borderRadius: 8, padding: 20, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Cau {idx + 1}</span>
        <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600,
          background: cau.phan === "nghe" ? "#dbeafe" : "#fef3c7",
          color: cau.phan === "nghe" ? "#1d4ed8" : "#92400e" }}>
          {cau.phan === "nghe" ? "Nghe" : "Doc"}
        </span>
        {cau.diem && <span style={{ fontSize: 11, color: "#9ca3af" }}>{cau.diem} diem</span>}
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: "#374151", marginBottom: 14 }}>{cau.noi_dung}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {["A", "B", "C", "D"].map(opt => {
          const val = cau[`lua_chon_${opt.toLowerCase()}`] || cau[`dap_an_${opt.toLowerCase()}`];
          if (!val) return null;
          const selected = daDone[cau.id] === opt;
          return (
            <div key={opt} onClick={() => handleChonDapAn(cau.id, opt)}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 6, cursor: "pointer",
                border: `1px solid ${selected ? "#111827" : "#e5e7eb"}`,
                background: selected ? "#111827" : "#fff",
                color: selected ? "#fff" : "#374151",
                transition: "all 0.1s" }}
              onMouseEnter={e => { if (!selected) e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={e => { if (!selected) e.currentTarget.style.background = "#fff"; }}>
              <span style={{ fontWeight: 700, fontSize: 13, minWidth: 20 }}>{opt}.</span>
              <span style={{ fontSize: 13 }}>{val}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>
      {/* Sticky header */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "#111827", color: "#fff", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{deThi?.ten_de || "Bai kiem tra"}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Link mở PDF trong header */}
          {deThi?.file_pdf && (
            <a 
              href={`http://localhost:5000/uploads/${deThi.file_pdf}`}
              target="_blank"
              rel="noreferrer"
              style={{ padding: "4px 12px", background: "#059669", color: "#fff", borderRadius: 4, fontSize: 12, textDecoration: "none" }}
            >
              📄 Xem PDF
            </a>
          )}
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "monospace", color: isLow ? "#fca5a5" : "#fff" }}>
            {fmtTime(thoiGianConLai)}
          </span>
          <span style={{ fontSize: 13, color: "#9ca3af" }}>{daDoneCount}/{cauHois.length} cau da tra loi</span>
          <button onClick={() => handleNopBai(false)} disabled={submitting}
            style={{ padding: "6px 16px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Dang nop..." : "Nop bai"}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", maxWidth: 1100, margin: "0 auto", padding: "20px 16px", gap: 20 }}>
        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "2px solid #e5e7eb", marginBottom: 20 }}>
            {[{ id: "nghe", label: "Nghe", count: cauNghe.length }, { id: "doc", label: "Doc", count: cauDoc.length }].map(tab => (
              <button key={tab.id} onClick={() => setCurrentPhan(tab.id)}
                style={{ padding: "10px 20px", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600,
                  background: "transparent",
                  color: currentPhan === tab.id ? "#111827" : "#9ca3af",
                  borderBottom: currentPhan === tab.id ? "2px solid #111827" : "2px solid transparent",
                  marginBottom: -2 }}>
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Phan nghe */}
          {currentPhan === "nghe" && (
            <div>
              {deThi?.file_audio && (
                <div style={{ background: "#1f2937", borderRadius: 8, padding: 12, marginBottom: 20 }}>
                  <audio controls style={{ width: "100%" }} src={`http://localhost:5000/uploads/${deThi.file_audio}`} />
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}>Nghe audio va tra loi cac cau hoi ben duoi</div>
                </div>
              )}
              {cauNghe.map((c, i) => renderCauHoi(c, i))}
              {cauNghe.length === 0 && <div style={{ color: "#9ca3af", fontSize: 13, padding: 20 }}>Khong co cau hoi nghe</div>}
            </div>
          )}

          {/* Phan doc */}
          {currentPhan === "doc" && (
            <div>
              {/* Hien thi PDF de doc neu co */}
              {deThi?.file_pdf && (
                <div style={{ background: "#fef3c7", border: "1px solid #fcd34d", borderRadius: 8, padding: 16, marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#92400e", marginBottom: 8 }}>📄 Đề thi PDF</div>
                  <a 
                    href={`http://localhost:5000/uploads/${deThi.file_pdf}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: "inline-block", padding: "8px 16px", background: "#dc2626", color: "#fff", borderRadius: 6, fontSize: 13, textDecoration: "none" }}
                  >
                    📖 Mở file PDF để xem đề
                  </a>
                  <div style={{ fontSize: 12, color: "#78350f", marginTop: 8 }}>
                    Bạn có thể mở PDF để xem đề trong khi làm bài trắc nghiệm bên dưới
                  </div>
                </div>
              )}
              {cauDoc.map((c, i) => renderCauHoi(c, cauNghe.length + i))}
              {cauDoc.length === 0 && <div style={{ color: "#9ca3af", fontSize: 13, padding: 20 }}>Khong co cau hoi doc</div>}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width: 180, flexShrink: 0 }}>
          <div style={{ position: "sticky", top: 70, background: "#fff", borderRadius: 8, border: "1px solid #e5e7eb", padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Bang cau</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
              {cauHois.map((c, i) => {
                const done = !!daDone[c.id];
                return (
                  <button key={c.id} onClick={() => { document.getElementById(`cau-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); }}
                    style={{ width: "100%", aspectRatio: "1", borderRadius: 4, border: `1px solid ${done ? "#111827" : "#e5e7eb"}`,
                      background: done ? "#111827" : "#fff", color: done ? "#fff" : "#374151",
                      fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
