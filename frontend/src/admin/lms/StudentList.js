import { useState } from "react";

const students = [
  { id: "HV001", name: "Nguyễn Văn A", email: "nguyenvana@gmail.com", phone: "0912 345 678", course: "IELTS 5.5", class: "IELTS25-01", status: "dang-hoc", registerDate: "2024-01-15", avatar: "👨" },
  { id: "HV002", name: "Trần Thị B", email: "tranthib@yahoo.com", phone: "0987 654 321", course: "TOEIC 750", class: "TOEIC25-02", status: "dang-hoc", registerDate: "2024-02-01", avatar: "👩" },
  { id: "HV003", name: "Lê Văn C", email: "levanc@gmail.com", phone: "0934 567 890", course: "IELTS 6.5", class: "IELTS25-01", status: "hoan-thanh", registerDate: "2023-11-10", avatar: "👨" },
  { id: "HV004", name: "Phạm Thị D", email: "phamthid@gmail.com", phone: "0901 234 567", course: "General English", class: "GE25-01", status: "bao-luu", registerDate: "2024-03-05", avatar: "👩" },
  { id: "HV005", name: "Ngô Văn E", email: "ngovane@gmail.com", phone: "0978 901 234", course: "IELTS Beginner", class: "IELTS25-02", status: "dang-hoc", registerDate: "2024-04-01", avatar: "👨" },
];

const statusConfig = {
  "dang-hoc": { label: "Đang học", color: "#10b981", bg: "#d1fae5" },
  "hoan-thanh": { label: "Hoàn thành", color: "#3b82f6", bg: "#dbeafe" },
  "bao-luu": { label: "Bảo lưu", color: "#f59e0b", bg: "#fef3c7" },
  "nghi-hoc": { label: "Nghỉ học", color: "#ef4444", bg: "#fee2e2" },
};

export default function StudentList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredStudents = students.filter((student) => {
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Action Bar */}
      <div style={{ background: "white", borderRadius: 8, padding: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f5f5f5", borderRadius: 8, padding: "8px 14px", border: "1px solid #ddd", flex: 1, maxWidth: 350 }}>
            <span style={{ color: "#888" }}>🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 14, color: "black", width: "100%" }}
            />
          </div>

          {/* Filters & Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #ddd", fontSize: 13, color: "black", background: "white" }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="dang-hoc">Đang học</option>
              <option value="hoan-thanh">Hoàn thành</option>
              <option value="bao-luu">Bảo lưu</option>
            </select>

            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#f5f5f5", border: "1px solid #ddd", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "black" }}>
              📤 Xuất file
            </button>

            <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#e11d48", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: "600", color: "white" }}>
              + Thêm học viên
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "white", borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Tổng học viên</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: "black" }}>{students.length}</p>
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📚</div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Đang học</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: "black" }}>{students.filter(s => s.status === "dang-hoc").length}</p>
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⏸️</div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Bảo lưu</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: "black" }}>{students.filter(s => s.status === "bao-luu").length}</p>
            </div>
          </div>
        </div>

        <div style={{ background: "white", borderRadius: 8, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 8, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✅</div>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Hoàn thành</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: "bold", color: "black" }}>{students.filter(s => s.status === "hoan-thanh").length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Học viên</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Khóa học</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Lớp</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Trạng thái</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Ngày đăng ký</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: "bold", color: "#666", textTransform: "uppercase" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => {
              const status = statusConfig[student.status];
              return (
                <tr key={student.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: "#ffe4e6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{student.avatar}</div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "black" }}>{student.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#888" }}>{student.id}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 13, color: "black", fontWeight: "500" }}>{student.course}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "4px 10px", background: "#f5f5f5", borderRadius: 6, fontSize: 12, color: "#666" }}>{student.class}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: "600", background: status.bg, color: status.color }}>{status.label}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 13, color: "#666" }}>{student.registerDate}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                      <button style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", color: "#666" }}>👁️</button>
                      <button style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", color: "#666" }}>✏️</button>
                      <button style={{ width: 32, height: 32, borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", color: "#ef4444" }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #ddd", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#666" }}>Hiển thị 1-{filteredStudents.length} của {students.length} học viên</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: 12, color: "#666" }}>Trước</button>
            <button style={{ padding: "6px 12px", borderRadius: 6, background: "#e11d48", border: "none", cursor: "pointer", fontSize: 12, color: "white", fontWeight: "600" }}>1</button>
            <button style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer", fontSize: 12, color: "#666" }}>Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
