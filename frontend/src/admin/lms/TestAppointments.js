import { useState, useEffect } from "react";

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

const levelOptions = ["IELTS Beginner", "IELTS 5.5", "IELTS 6.0", "IELTS 6.5", "IELTS 7.0+", "TOEIC 450", "TOEIC 600", "TOEIC 750", "TOEIC 900", "TOEFL iBT"];

export default function TestAppointments({ pendingLeads = [], onClearPending }) {
  const [selectedDate, setSelectedDate] = useState("2024-04-25");
  const [appointments, setAppointments] = useState(testAppointments);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    date: "",
    time: "09:00",
    level: "IELTS 5.5",
  });
  
  // Track which pending leads have been booked
  const [bookedLeadIds, setBookedLeadIds] = useState([]);

  const days = [
    { date: "2024-04-22", day: "T2", dayNum: 22 },
    { date: "2024-04-23", day: "T3", dayNum: 23 },
    { date: "2024-04-24", day: "T4", dayNum: 24 },
    { date: "2024-04-25", day: "T5", dayNum: 25 },
    { date: "2024-04-26", day: "T6", dayNum: 26 },
    { date: "2024-04-27", day: "T7", dayNum: 27 },
    { date: "2024-04-28", day: "CN", dayNum: 28 },
  ];

  const todayAppointments = appointments.filter((apt) => apt.date === selectedDate);

  // Filter pending leads that haven't been booked yet
  const availablePendingLeads = pendingLeads.filter(lead => !bookedLeadIds.includes(lead.tempId));

  // Open booking modal for a pending lead
  const openBookingModal = (lead) => {
    setSelectedLead(lead);
    setBookingForm({
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      level: "IELTS 5.5",
    });
    setShowBookingModal(true);
  };

  // Handle booking
  const handleBookTest = () => {
    if (!bookingForm.date) {
      alert("Vui lòng chọn ngày test!");
      return;
    }

    const newAppointment = {
      id: `TEST${String(appointments.length + 1).padStart(3, "0")}`,
      name: selectedLead.name,
      phone: selectedLead.phone,
      date: bookingForm.date,
      time: bookingForm.time,
      level: bookingForm.level,
      status: "cho-test",
    };

    setAppointments([...appointments, newAppointment]);
    setBookedLeadIds([...bookedLeadIds, selectedLead.tempId]);
    setShowBookingModal(false);
    
    // Change selected date to show the new appointment
    setSelectedDate(bookingForm.date);
  };

  // Mark test as completed
  const markAsCompleted = (aptId) => {
    setAppointments(appointments.map(apt => 
      apt.id === aptId ? { ...apt, status: "da-test" } : apt
    ));
  };

  // Cancel test
  const cancelTest = (aptId) => {
    setAppointments(appointments.map(apt => 
      apt.id === aptId ? { ...apt, status: "huy-test" } : apt
    ));
  };

  return (
    <div>
      {/* Pending Leads from Leads page */}
      {availablePendingLeads.length > 0 && (
        <div style={{ background: "white", borderRadius: 8, padding: 20, marginBottom: 20, border: "2px solid #3b82f6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>📋</span>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: "600", color: "#1a1a2e" }}>Lead chờ đặt lịch test</h3>
            <span style={{ background: "#3b82f6", color: "white", padding: "2px 8px", borderRadius: 12, fontSize: 12, fontWeight: "600" }}>
              {availablePendingLeads.length}
            </span>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
            {availablePendingLeads.map((lead) => (
              <div key={lead.tempId} style={{ padding: 16, background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#1a1a2e" }}>{lead.name}</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>{lead.phone}</p>
                  </div>
                  <button
                    onClick={() => openBookingModal(lead)}
                    style={{ padding: "6px 12px", background: "#3b82f6", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: "600", color: "white" }}
                  >
                    📅 Đặt lịch
                  </button>
                </div>
                {lead.note && (
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontStyle: "italic" }}>Ghi chú: {lead.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
            const hasAppointment = appointments.some((apt) => apt.date === day.date);
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
                    <>
                      <button 
                        onClick={() => markAsCompleted(apt.id)}
                        style={{ padding: "8px 16px", background: "#10b981", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: "600", color: "white" }}>
                        ✅ Hoàn thành
                      </button>
                      <button 
                        onClick={() => cancelTest(apt.id)}
                        style={{ padding: "8px 16px", background: "#ef4444", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: "600", color: "white" }}>
                        ❌ Hủy
                      </button>
                    </>
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
          const count = appointments.filter((apt) => apt.status === key).length;
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

      {/* Booking Modal */}
      {showBookingModal && selectedLead && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }} onClick={() => setShowBookingModal(false)}>
          <div style={{
            background: "white",
            borderRadius: 16,
            padding: 24,
            width: "90%",
            maxWidth: 450,
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: "bold", color: "#1a1a2e" }}>📅 Đặt lịch test</h2>
              <button onClick={() => setShowBookingModal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#666" }}>×</button>
            </div>

            {/* Lead Info */}
            <div style={{ padding: 16, background: "#f8fafc", borderRadius: 8, marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#1a1a2e" }}>{selectedLead.name}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>{selectedLead.phone}</p>
              {selectedLead.email && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>{selectedLead.email}</p>}
            </div>

            {/* Form */}
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Ngày test *</label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Giờ test</label>
                <select
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                >
                  <option value="08:00">08:00</option>
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                  <option value="18:00">18:00</option>
                  <option value="19:00">19:00</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: "600", color: "#333", marginBottom: 6 }}>Trình độ</label>
                <select
                  value={bookingForm.level}
                  onChange={(e) => setBookingForm({ ...bookingForm, level: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #ddd", borderRadius: 8, fontSize: 14 }}
                >
                  {levelOptions.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowBookingModal(false)}
                style={{ padding: "10px 20px", border: "1px solid #ddd", borderRadius: 8, background: "white", cursor: "pointer", fontSize: 14, color: "#666" }}
              >
                Hủy
              </button>
              <button
                onClick={handleBookTest}
                style={{ padding: "10px 20px", border: "none", borderRadius: 8, background: "#3b82f6", cursor: "pointer", fontSize: 14, fontWeight: "600", color: "white" }}
              >
                ✅ Xác nhận đặt lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
