import { useState } from "react";
import {
  Search,
  ArrowRightCircle,
  Calendar,
  FileText,
  MoreHorizontal,
  CheckCircle
} from "lucide-react";

const transferredStudents = [
  {
    id: "HV014",
    name: "Lê Văn H",
    email: "levanh@gmail.com",
    phone: "0934 567 123",
    oldClass: "IELTS25-01",
    newClass: "IELTS25-02",
    oldCourse: "IELTS 5.5",
    newCourse: "IELTS 6.5",
    transferDate: "2024-04-15",
    reason: "Chuyển lên level cao hơn",
    approvedBy: "Nguyễn Thị Mai",
  },
  {
    id: "HV015",
    name: "Trần Thị I",
    email: "tranthii@gmail.com",
    phone: "0987 654 987",
    oldClass: "GE25-01",
    newClass: "IELTS25-01",
    oldCourse: "General English",
    newCourse: "IELTS 5.5",
    transferDate: "2024-04-10",
    reason: "Chuyển khóa học",
    approvedBy: "Lê Văn Hùng",
  },
  {
    id: "HV016",
    name: "Phạm Văn J",
    email: "phamvanj@gmail.com",
    phone: "0912 345 987",
    oldClass: "TOEIC25-01",
    newClass: "TOEIC25-02",
    oldCourse: "TOEIC 600",
    newCourse: "TOEIC 750",
    transferDate: "2024-04-05",
    reason: "Lên lớp theo lộ trình",
    approvedBy: "Trần Văn Đức",
  },
];

export default function TransferredStudents() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStudents = transferredStudents.filter((student) =>
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
              Học viên chuyển lớp
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "#64748b" }}>
              Lịch sử chuyển lớp của học viên
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
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ArrowRightCircle size={24} color="#3b82f6" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Tổng chuyển lớp</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: "800", color: "#1e293b" }}>{transferredStudents.length}</p>
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
              <CheckCircle size={24} color="#10b981" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Tháng này</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: "800", color: "#1e293b" }}>{transferredStudents.length}</p>
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
              <ArrowRightCircle size={24} color="#e11d48" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Chuyển khóa</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: "800", color: "#1e293b" }}>2</p>
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
              <th style={{ padding: "16px 20px", textAlign: "left", fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Lớp cũ</th>
              <th style={{ padding: "16px 20px", textAlign: "center", fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}></th>
              <th style={{ padding: "16px 20px", textAlign: "left", fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Lớp mới</th>
              <th style={{ padding: "16px 20px", textAlign: "left", fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Ngày chuyển</th>
              <th style={{ padding: "16px 20px", textAlign: "center", fontSize: 12, fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                      👨
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 15, fontWeight: "600", color: "#1e293b" }}>{student.name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{student.id}</p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: "500", color: "#64748b" }}>{student.oldCourse}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{student.oldClass}</p>
                </td>
                <td style={{ padding: "16px 20px", textAlign: "center" }}>
                  <ArrowRightCircle size={20} color="#e11d48" />
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: "500", color: "#10b981" }}>{student.newCourse}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94a3b8" }}>{student.newClass}</p>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span style={{ fontSize: 14, color: "#64748b" }}>{student.transferDate}</span>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
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
                        color: "#3b82f6",
                      }}
                      title="Xem chi tiết"
                    >
                      <FileText size={16} />
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
