import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "—";
const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + " đ";

const QUAN_HE = { bo: "Bố", me: "Mẹ", ong: "Ông", ba: "Bà", anh: "Anh", chi: "Chị", nguoi_giam_ho: "Người giám hộ" };

export default function PhuHuynhPortal() {
  const [token, setToken] = useState(() => localStorage.getItem("ph_token") || "");
  const [user, setUser] = useState(() => { try { return JSON.parse(localStorage.getItem("ph_user") || "null"); } catch { return null; } });
  const [sdt, setSdt] = useState("");
  const [pass, setPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [logging, setLogging] = useState(false);
  const [children, setChildren] = useState([]); // danh sách con
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("lich_hoc"); // lich_hoc | ket_qua | diem_danh | bai_tap | hoc_phi

  useEffect(() => {
    if (token && user) loadChildren();
  }, [token, user]); // eslint-disable-line

  useEffect(() => {
    if (selectedChild) loadChildData(selectedChild);
  }, [selectedChild, tab]); // eslint-disable-line

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginErr(""); setLogging(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sdt: sdt.trim(), mat_khau: pass }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.data.token);
        setUser(data.data.user);
        localStorage.setItem("ph_token", data.data.token);
        localStorage.setItem("ph_user", JSON.stringify(data.data.user));
      } else {
        setLoginErr(data.message || "Sai số điện thoại hoặc mật khẩu");
      }
    } catch { setLoginErr("Lỗi kết nối"); }
    setLogging(false);
  };

  const loadChildren = async () => {
    try {
      // Lấy danh sách con từ bảng phu_huynh (tìm theo nguoi_dung_id của phụ huynh)
      const res = await fetch(`${API}/lms/phu-huynh?nguoi_dung_id=${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = data.data || [];
      setChildren(list);
      if (list.length > 0 && !selectedChild) setSelectedChild(list[0].hoc_vien_id);
    } catch {}
  };

  const loadChildData = async (hocVienId) => {
    if (!hocVienId) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [ketQuaRes, diemDanhRes, lichHocRes, baiTapRes] = await Promise.all([
        fetch(`${API}/exam/admin/ket-qua?hoc_vien_id=${hocVienId}`, { headers }),
        fetch(`${API}/lms/diem-danh?hoc_vien_id=${hocVienId}`, { headers }),
        fetch(`${API}/lms/phu-huynh/lich-hoc/${hocVienId}`, { headers }),
        fetch(`${API}/lms/phu-huynh/bai-tap/${hocVienId}`, { headers }),
      ]);
      const kq = await ketQuaRes.json();
      const dd = await diemDanhRes.json();
      const lh = await lichHocRes.json();
      const bt = await baiTapRes.json();
      setChildData({
        ket_qua: kq.data || [],
        diem_danh: dd.data || [],
        lich_hoc: lh.data || [],
        bai_tap: bt.data || [],
      });
    } catch {}
    setLoading(false);
  };

  const handleLogout = () => {
    setToken(""); setUser(null); setChildren([]); setSelectedChild(null); setChildData(null);
    localStorage.removeItem("ph_token"); localStorage.removeItem("ph_user");
  };

  const inp = { width: "100%", padding: "12px 16px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box" };

  const currentChild = children.find(c => c.hoc_vien_id === selectedChild);

  // ---- LOGIN ----
  if (!token || !user) {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #fef2f2 0%, #fff 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 36, maxWidth: 420, width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>👨‍👩‍👧</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#e11d48" }}>Cổng Phụ Huynh</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>NTA English Center</div>
          </div>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Số điện thoại</label>
              <input value={sdt} onChange={e => setSdt(e.target.value)} placeholder="Nhập SĐT đã đăng ký" style={inp}
                onFocus={e => e.target.style.borderColor = "#e11d48"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Mật khẩu</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Mật khẩu (mặc định: 123456)" style={inp}
                onFocus={e => e.target.style.borderColor = "#e11d48"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            {loginErr && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{loginErr}</div>}
            <div style={{ background: "#fef3c7", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: 12, color: "#92400e" }}>
              Tài khoản mặc định: SĐT / mật khẩu 123456
            </div>
            <button type="submit" disabled={logging}
              style={{ width: "100%", padding: "13px", background: logging ? "#ccc" : "#e11d48", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: logging ? "not-allowed" : "pointer" }}>
              {logging ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---- DASHBOARD ----
  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>👨‍👩‍👧</span>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Cổng Phụ Huynh</div>
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12 }}>Xin chào, {user.ho_ten || user.sdt}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: "7px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
          Đăng xuất
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: "24px auto", padding: "0 16px" }}>
        {/* Chọn con */}
        {children.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 12, padding: 40, textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>👶</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Chưa có thông tin học viên</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Vui lòng liên hệ trung tâm để liên kết tài khoản với học viên</div>
          </div>
        ) : (
          <>
            {/* Chọn học viên */}
            {children.length > 1 && (
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                {children.map(c => (
                  <button key={c.hoc_vien_id} onClick={() => setSelectedChild(c.hoc_vien_id)}
                    style={{ padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                      background: selectedChild === c.hoc_vien_id ? "#e11d48" : "#fff",
                      color: selectedChild === c.hoc_vien_id ? "#fff" : "#374151",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                    {c.hocVien?.ho_ten || `Học viên #${c.hoc_vien_id}`}
                    <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.8 }}>({QUAN_HE[c.quan_he] || c.quan_he})</span>
                  </button>
                ))}
              </div>
            )}

            {/* Thông tin học viên */}
            {currentChild && (
              <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👤</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{currentChild.hocVien?.ho_ten || "Học viên"}</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>SĐT: {currentChild.hocVien?.sdt || "—"} | Quan hệ: {QUAN_HE[currentChild.quan_he] || currentChild.quan_he}</div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#fff", borderRadius: 10, padding: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", flexWrap: "wrap" }}>
              {[
                { id: "lich_hoc",  label: "📅 Lịch học" },
                { id: "ket_qua",   label: "📝 Kết quả thi" },
                { id: "diem_danh", label: "📋 Điểm danh" },
                { id: "bai_tap",   label: "📚 Bài tập" },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ flex: 1, minWidth: 100, padding: "10px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13,
                    background: tab === t.id ? "#e11d48" : "transparent",
                    color: tab === t.id ? "#fff" : "#6b7280" }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Đang tải...</div>
            ) : (
              <>
                {/* Lịch học */}
                {tab === "lich_hoc" && (
                  <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>📅 Lịch học của con</div>
                    {(childData?.lich_hoc || []).length === 0 ? (
                      <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>Chưa có lịch học</div>
                    ) : (childData?.lich_hoc || []).map((dk, i) => {
                      const lh = dk.lopHoc || {};
                      const lichs = lh.lichHocs || [];
                      const thuOrder = { Thu2:1,Thu3:2,Thu4:3,Thu5:4,Thu6:5,Thu7:6,CNhat:7 };
                      const sortedLichs = [...lichs].sort((a,b) => (thuOrder[a.thu_trong_tuan]||9)-(thuOrder[b.thu_trong_tuan]||9));
                      return (
                        <div key={i} style={{ marginBottom: 16, padding: 16, border: "1px solid #e5e7eb", borderRadius: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <div>
                              <div style={{ fontWeight: 700, color: "#e11d48", fontSize: 15 }}>{lh.khoaHoc?.ten_khoa || lh.ma_lop}</div>
                              <div style={{ fontSize: 12, color: "#6b7280" }}>Mã lớp: {lh.ma_lop} · GV: {lh.giaoVien?.ho_ten || "—"}</div>
                            </div>
                            <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                              background: lh.trang_thai === "dang_dien_ra" ? "#d1fae5" : "#f3f4f6",
                              color: lh.trang_thai === "dang_dien_ra" ? "#065f46" : "#6b7280" }}>
                              {lh.trang_thai === "dang_dien_ra" ? "Đang học" : lh.trang_thai}
                            </span>
                          </div>
                          {sortedLichs.length > 0 ? sortedLichs.map((l, j) => (
                            <div key={j} style={{ display: "flex", gap: 12, padding: "7px 12px", background: "#f9fafb", borderRadius: 6, marginBottom: 4, fontSize: 13, borderLeft: "3px solid #e11d48" }}>
                              <span style={{ fontWeight: 700, color: "#e11d48", minWidth: 50 }}>{l.thu_trong_tuan}</span>
                              <span style={{ fontWeight: 600 }}>{l.gio_bat_dau?.slice(0,5)} – {l.gio_ket_thuc?.slice(0,5)}</span>
                              <span style={{ color: "#6b7280" }}>Phòng: {lh.phongHoc?.ma_phong || "—"}</span>
                            </div>
                          )) : <div style={{ fontSize: 13, color: "#9ca3af" }}>Chưa có lịch học cụ thể</div>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Kết quả bài thi */}
                {tab === "ket_qua" && (
                  <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Kết quả bài kiểm tra</div>
                    {(childData?.ket_qua || []).length === 0 ? (
                      <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>Chưa có kết quả bài thi</div>
                    ) : (
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#fef2f2" }}>
                            {["Đề thi", "Ngày làm", "Điểm Nghe", "Điểm Đọc", "Tổng điểm", "Trạng thái"].map((h, i) => (
                              <th key={i} style={{ padding: "10px 12px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#e11d48" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(childData?.ket_qua || []).map((kq, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                              <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 600 }}>{kq.deThi?.ten_de || "—"}</td>
                              <td style={{ padding: "10px 12px", fontSize: 12, color: "#6b7280" }}>{fmtDate(kq.hoan_thanh_luc)}</td>
                              <td style={{ padding: "10px 12px", fontSize: 13 }}>{kq.diem_nghe ?? "—"}</td>
                              <td style={{ padding: "10px 12px", fontSize: 13 }}>{kq.diem_doc ?? "—"}</td>
                              <td style={{ padding: "10px 12px", fontSize: 15, fontWeight: 800, color: "#e11d48" }}>{kq.diem_tong ?? "—"}</td>
                              <td style={{ padding: "10px 12px" }}>
                                <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                                  background: kq.trang_thai === "hoan_thanh" ? "#d1fae5" : "#fef3c7",
                                  color: kq.trang_thai === "hoan_thanh" ? "#065f46" : "#92400e" }}>
                                  {kq.trang_thai === "hoan_thanh" ? "Hoàn thành" : "Đang làm"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* Điểm danh */}
                {tab === "diem_danh" && (
                  <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Lịch sử điểm danh</div>
                    {(childData?.diem_danh || []).length === 0 ? (
                      <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>Chưa có dữ liệu điểm danh</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {(childData?.diem_danh || []).map((dd, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 8, background: "#f9fafb" }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{dd.lopHoc?.ten_lop || "—"}</div>
                              <div style={{ fontSize: 12, color: "#6b7280" }}>{fmtDate(dd.ngay_hoc)}</div>
                            </div>
                            <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                              background: dd.trang_thai === "co_mat" ? "#d1fae5" : dd.trang_thai === "vang_mat" ? "#fee2e2" : "#fef3c7",
                              color: dd.trang_thai === "co_mat" ? "#065f46" : dd.trang_thai === "vang_mat" ? "#991b1b" : "#92400e" }}>
                              {dd.trang_thai === "co_mat" ? "✓ Có mặt" : dd.trang_thai === "vang_mat" ? "✗ Vắng mặt" : "Đi muộn"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bài tập */}
                {tab === "bai_tap" && (
                  <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 16 }}>📚 Bài tập của con</div>
                    {(childData?.bai_tap || []).length === 0 ? (
                      <div style={{ textAlign: "center", padding: 32, color: "#9ca3af" }}>Chưa có bài tập</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {(childData?.bai_tap || []).map((bt, i) => {
                          const daNop = bt.da_nop;
                          const coDiem = bt.diem?.diem != null;
                          const qua = bt.han_nop && new Date(bt.han_nop) < new Date();
                          return (
                            <div key={i} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #e5e7eb",
                              borderLeft: `4px solid ${daNop ? "#10b981" : qua ? "#ef4444" : "#f59e0b"}` }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{bt.ten_bai}</div>
                                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                                    Lớp: {bt.lopHoc?.ma_lop || "—"} · Hạn: <span style={{ color: qua && !daNop ? "#ef4444" : "#374151" }}>{fmtDate(bt.han_nop)}</span>
                                  </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                                    background: daNop ? "#d1fae5" : "#fef3c7", color: daNop ? "#065f46" : "#92400e" }}>
                                    {daNop ? "✅ Đã nộp" : "⏳ Chưa nộp"}
                                  </span>
                                  {coDiem && (
                                    <span style={{ fontSize: 13, fontWeight: 800, color: bt.diem.diem >= 7 ? "#059669" : bt.diem.diem >= 5 ? "#d97706" : "#dc2626" }}>
                                      Điểm: {bt.diem.diem} {bt.diem.band_score ? `(${bt.diem.band_score})` : ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {bt.diem?.nhan_xet && (
                                <div style={{ marginTop: 8, fontSize: 12, color: "#374151", background: "#f9fafb", padding: "6px 10px", borderRadius: 6 }}>
                                  💬 Nhận xét: {bt.diem.nhan_xet}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
