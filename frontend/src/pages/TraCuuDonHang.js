import { useState } from "react";

const API = "http://localhost:5000/api";

const STATUS_MAP = {
  cho_tt: { label: "Chờ thanh toán", color: "#f59e0b", bg: "#fef3c7" },
  da_tt: { label: "Đã thanh toán", color: "#3b82f6", bg: "#dbeafe" },
  dang_giao: { label: "Đang giao hàng", color: "#8b5cf6", bg: "#ede9fe" },
  da_giao: { label: "Đã giao hàng", color: "#10b981", bg: "#d1fae5" },
  da_huy: { label: "Đã hủy", color: "#ef4444", bg: "#fee2e2" },
};

const STEPS = [
  { key: "cho_tt", label: "Đặt hàng" },
  { key: "da_tt", label: "Thanh toán" },
  { key: "dang_giao", label: "Đang giao" },
  { key: "da_giao", label: "Đã giao" },
];

function getStepIndex(status) {
  const idx = STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default function TraCuuDonHang() {
  const [maDon, setMaDon] = useState("");
  const [sdt, setSdt] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!maDon.trim() || !sdt.trim()) {
      setError("Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại");
      return;
    }
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`${API}/books/orders/tra-cuu?ma_don_hang=${maDon.trim()}&sdt=${sdt.trim()}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      } else {
        setError(data.message || "Không tìm thấy đơn hàng");
      }
    } catch {
      setError("Lỗi kết nối, vui lòng thử lại");
    }
    setLoading(false);
  };

  const fmt = (n) => Number(n || 0).toLocaleString("vi-VN") + " đ";
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const inp = {
    width: "100%", padding: "12px 16px", borderRadius: 8,
    border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)", padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/" style={{ color: "#fff", textDecoration: "none", fontSize: 14 }}>← Trang chủ</a>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>|</span>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Tra cứu đơn hàng</span>
      </div>

      <div style={{ maxWidth: 680, margin: "40px auto", padding: "0 16px" }}>
        {/* Search box */}
        <div style={{ background: "#fff", borderRadius: 12, padding: 28, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#111827", marginBottom: 6 }}>Tra cứu đơn hàng</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>Nhập mã đơn hàng và số điện thoại đặt hàng để kiểm tra trạng thái</div>
          <form onSubmit={handleSearch}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                value={maDon}
                onChange={e => setMaDon(e.target.value)}
                placeholder="Mã đơn hàng (VD: DH1234567890)"
                style={inp}
                onFocus={e => e.target.style.borderColor = "#e11d48"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
              <input
                value={sdt}
                onChange={e => setSdt(e.target.value)}
                placeholder="Số điện thoại đặt hàng"
                style={inp}
                onFocus={e => e.target.style.borderColor = "#e11d48"}
                onBlur={e => e.target.style.borderColor = "#e5e7eb"}
              />
              {error && <div style={{ color: "#ef4444", fontSize: 13 }}>{error}</div>}
              <button type="submit" disabled={loading}
                style={{ padding: "12px", background: loading ? "#ccc" : "#e11d48", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Đang tìm..." : "Tra cứu"}
              </button>
            </div>
          </form>
        </div>

        {/* Result */}
        {order && <OrderResult order={order} fmt={fmt} fmtDate={fmtDate} />}
      </div>
    </div>
  );
}

function OrderResult({ order, fmt, fmtDate }) {
  const st = STATUS_MAP[order.trang_thai] || { label: order.trang_thai, color: "#6b7280", bg: "#f3f4f6" };
  const stepIdx = getStepIndex(order.trang_thai);
  const isCancelled = order.trang_thai === "da_huy";

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
      {/* Order header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>Mã đơn hàng</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{order.ma_don_hang}</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{fmtDate(order.created_at)}</div>
        </div>
        <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, background: st.bg, color: st.color }}>
          {st.label}
        </span>
      </div>

      {/* Progress steps */}
      {!isCancelled && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {STEPS.map((step, i) => (
              <div key={step.key} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: i <= stepIdx ? "#e11d48" : "#e5e7eb",
                    color: i <= stepIdx ? "#fff" : "#9ca3af",
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {i < stepIdx ? "✓" : i + 1}
                  </div>
                  <div style={{ fontSize: 11, color: i <= stepIdx ? "#e11d48" : "#9ca3af", fontWeight: i <= stepIdx ? 600 : 400, whiteSpace: "nowrap" }}>
                    {step.label}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < stepIdx ? "#e11d48" : "#e5e7eb", margin: "0 4px", marginBottom: 20 }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery address */}
      <div style={{ background: "#f9fafb", borderRadius: 8, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>ĐỊA CHỈ GIAO HÀNG</div>
        <div style={{ fontSize: 13, color: "#374151" }}>{order.dia_chi_giao || "—"}</div>
      </div>

      {/* Items */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 10 }}>SẢN PHẨM</div>
        {(order.chiTiets || []).map((item, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {item.sach?.hinh_anh && (
                <img
                  src={item.sach.hinh_anh.startsWith("/uploads/") ? `http://localhost:5000${item.sach.hinh_anh}` : `http://localhost:5000/uploads/${item.sach.hinh_anh}`}
                  alt={item.sach.ten_sach}
                  style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }}
                  onError={e => { e.target.style.display = "none"; }}
                />
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.sach?.ten_sach || "Sản phẩm"}</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>x{item.so_luong}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{fmt(item.thanh_tien)}</div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #e5e7eb" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Tổng cộng</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#e11d48" }}>{fmt(order.tong_tien)}</span>
      </div>

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <a href="/" style={{ fontSize: 13, color: "#e11d48", textDecoration: "none" }}>← Tiếp tục mua sắm</a>
      </div>
    </div>
  );
}
