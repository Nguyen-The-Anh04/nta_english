import { useState } from "react";

const testAppointments = [
  { id: "TEST001", name: "Nguyễn Văn A", phone: "0912 345 678", date: "2024-04-25", time: "09:00", level: "IELTS 5.5", status: "cho-test" },
  { id: "TEST002", name: "Trần Thị B", phone: "0987 654 321", date: "2024-04-25", time: "14:00", level: "TOEFL iBT", status: "da-test" },
  { id: "TEST003", name: "Lê Văn C", phone: "0934 567 890", date: "2024-04-26", time: "10:00", level: "IELTS Beginner", status: "cho-test" },
  { id: "TEST004", name: "Phạm Thị D", phone: "0901 234 567", date: "2024-04-26", time: "15:30", level: "TOEIC 750", status: "huy-test" },
];

const statusConfig = {
  "cho-test": { label: "Chờ test", color: "#f59e0b", bg: "#fef3c7" },
  "da-test": { label: "Đã test", color: "#10b981", bg: "#d1fae5" },
  "huy-test": { label: "Hủy test", color: "#ef4444", bg: "#fee2e2" },
};

export default function TestAppointments() {
  const [selectedDate, setSelectedDate] = useState("2024-04-25");
  const days = [
    { date: "2024-04-22", day: "T2", dayNum: 22 },
    { date: "2024-04-23", day: "T3", dayNum: 23 },
    { date: "2024-04-24", day: "T4", dayNum: 24 },
    { date: "2024-04-25", day: "T5", dayNum: 25 },
    { date: "2024-04-26", day: "T6", dayNum: 26 },
    { date: "2024-04-27", day: "T7", dayNum: 27 },
    { date: "2024-04-28", day: "CN", dayNum: 28 },
  ];
  const todayAppointments = testAppointments.filter((apt) => apt.date === selectedDate);

  return (
    <div>
      {/* Calendar Header */}
      <div style={{ background: "white", borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: "bold", color: "black" }}>Lịch test đầu vào</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#666" }}>Tháng 4/2024</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #ddd", background: "white", cursor: "pointer", color: "#666" }}>◀</button>
            <button style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid #ddd", background: "white", cursor: "pointer", color: "#666" }}>▶</button>
          </div>
        </div>

        {/* Days */}
        <div style={{ display: "flex", gap: 8 }}>
          {days.map((day) => {
            const isSelected = day.date === selectedDate;
            const hasAppointment = testAppointments.some((apt) => apt.date === day.date);
            return (
              <div key={day.date} onClick={() => setSelectedDate(day.date)} style={{ flex: 1, textAlign: "center", padding: "14px 8px", borderRadius: 8, cursor: "pointer", background: isSelected ? "#e11d48" : hasAppointment ? "#ffe4e6" : "#f5f5f5", border: isSelected ? "none" : hasAppointment ? "1px solid #fecdd3" : "1px solid #ddd" }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: "600", color: isSelected ? "white" : "#666" }}>{day.day}</p>
                <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: "bold", color: isSelected ? "white" : "black" }}>{day.dayNum}</p>
                {hasAppointment && <div style={{ width: 6, height: 6, borderRadius: "50%", background: isSelected ? "white" : "#e11d48", margin: "6px auto 0" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointments List */}
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: "bold", color: "black" }}>Danh sách test ngày {selectedDate}</h3>
          <span style={{ fontSize: 13, color: "#666" }}>{todayAppointments.length} lịch hẹn</span>
        </div>

        {todayAppointments.length === 0 ? (
          <div style={{ background: "white", borderRadius: 8, padding: 40, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 14, color: "#666" }}>Không có lịch test nào</p>
          </div>
        ) : (
          todayAppointments.map((apt) => {
            const status = statusConfig[apt.status];
            return (
              <div key={apt.id} style={{ background: "white", borderRadius: 8, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", gap: 14, flex: 1, minWidth: 200 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: "#ffe4e6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>👤</div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: "600", color: "black" }}>{apt.name}</h4>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>{apt.phone}</p>
                    <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: "#666" }}>📅 {apt.date}</span>
                      <span style={{ fontSize: 12, color: "#666" }}>🕐 {apt.time}</span>
                      <span style={{ fontSize: 12, color: "#666" }}>📚 {apt.level}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ display: "inline-flex", padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: "600", background: status.bg, color: status.color }}>{status.label}</span>
                  {apt.status === "cho-test" && (
                    <button style={{ padding: "8px 16px", background: "#e11d48", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: "600", color: "white" }}>Cập nhật kết quả</button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 20 }}>
        {Object.entries(statusConfig).map(([key, status]) => {
          const count = testAppointments.filter((apt) => apt.status === key).length;
          return (
            <div key={key} style={{ background: "white", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: status.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 18 }}>{key === "cho-test" ? "⏳" : key === "da-test" ? "✅" : "❌"}</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{status.label}</p>
                  <p style={{ margin: 0, fontSize: 22, fontWeight: "bold", color: "black" }}>{count}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
