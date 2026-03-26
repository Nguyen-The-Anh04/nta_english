import { useState } from "react";
import {
  Search,
  PauseCircle,
  Calendar,
  Phone,
  Mail,
  Play,
  FileText,
  MoreHorizontal,
  X
} from "lucide-react";

const pausedStudents = [
  {
    id: "HV004",
    name: "Phạm Thị D",
    email: "phamthid@gmail.com",
    phone: "0901 234 567",
    course: "General English",
    class: "GE25-01",
    pauseDate: "2024-04-01",
    expectedReturn: "2024-05-01",
    reason: "Bệnh",
    note: "Học viên bị ốm, cần nghỉ dưỡng 1 tháng",
  },
  {
    id: "HV012",
    name: "Đỗ Văn F",
    email: "dovanf@gmail.com",
    phone: "0932 109 876",
    course: "IELTS 5.5",
    class: "IELTS25-01",
    pauseDate: "2024-04-10",
    expectedReturn: "2024-04-25",
    reason: "Công việc",
    note: "Đi công tác nước ngoài 2 tuần",
  },
  {
    id: "HV013",
    name: "Nguyễn Thị G",
    email: "nguyenthig@gmail.com",
    phone: "0912 987 654",
    course: "TOEIC 750",
    class: "TOEIC25-02",
    pauseDate: "2024-04-15",
    expectedReturn: "2024-05-15",
    reason: "Cá nhân",
    note: "Gia đình có việc riêng",
  },
];

const reasonConfig = {
  "Bệnh": { color: "#ef4444", bg: "#fee2e2" },
  "Công việc": { color: "#3b82f6", bg: "#dbeafe" },
  "Cá nhân": { color: "#8b5cf6", bg: "#ede9fe" },
  "Khác": { color: "#64748b", bg: "#f1f5f9" },
};

export default function PausedStudents() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = pausedStudents.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone.includes(searchTerm) ||
    student.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 24,
          marginBottom: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: "700", color: "#1e293b" }}>
              Học viên bảo lưu
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              {pausedStudents.length} học viên đang bảo lưu
            </p>
          </div>

          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#f8fafc",
              borderRadius: 12,
              padding: "10px 16px",
              border: "1px solid #e2e8f0",
              minWidth: 300,
            }}
          >
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Tìm kiếm học viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: 14,
                color: "#1e293b",
                width: "100%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PauseCircle size={24} color="#f59e0b" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Đang bảo lưu</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: "800", color: "#1e293b" }}>{pausedStudents.length}</p>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={24} color="#10b981" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Sắp quay lại</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: "800", color: "#1e293b" }}>
                {pausedStudents.filter(s => new Date(s.expectedReturn) <= new Date()).length}
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#e11d4820", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Play size={24} color="#e11d48" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Đã quay lại</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: "800", color: "#1e293b" }}>0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              <th style={{ padding: "16px 20px", textAlign: "left", fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Học viên</th>
              <th style={{ padding: "16px 20px", textAlign: "left", fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Khóa/Lớp</th>
              <th style={{ padding: "16px 20px", textAlign: "left", fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Lý do</th>
              <th style={{ padding: "16px 20px", textAlign: "left", fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Ngày bảo lưu</th>
              <th style={{ padding: "16px 20px", textAlign: "left", fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Ngày quay lại</th>
              <th style={{ padding: "16px 20px", textAlign: "center", fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => {
              const reason = reasonConfig[student.reason] || reasonConfig["Khác"];
              const isOverdue = new Date(student.expectedReturn) <= new Date();
              
              return (
                <tr key={student.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                        👩
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: "600", color: "#1e293b" }}>{student.name}</p>
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>{student.id}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: "500", color: "#1e293b" }}>{student.course}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{student.class}</p>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: "600", background: reason.bg, color: reason.color }}>
                      {student.reason}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ fontSize: 14, color: "#64748b" }}>{student.pauseDate}</span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: isOverdue ? "700" : "500", color: isOverdue ? "#e11d48" : "#1e293b" }}>
                        {student.expectedReturn}
                      </span>
                      {isOverdue && (
                        <span style={{ padding: "2px 8px", background: "#fee2e2", color: "#ef4444", fontSize: 11, fontWeight: "600", borderRadius: 4 }}>
                          Quá hạn
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                      <button
                        style={{
                          padding: "8px 16px",
                          background: "#10b981",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: "600",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Play size={14} />
                        Kích hoạt
                      </button>
                      <button
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          border: "1px solid #e2e8f0",
                          background: "white",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#64748b",
                        }}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
