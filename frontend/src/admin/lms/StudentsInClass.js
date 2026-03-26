import { useState } from "react";
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  ChevronDown,
  ChevronUp,
  Search
} from "lucide-react";

const classes = [
  {
    id: "IELTS25-01",
    name: "IELTS 5.5",
    teacher: "Nguyễn Thị Mai",
    schedule: "T2 - T4 - T6",
    time: "18:00 - 20:30",
    totalSessions: 40,
    completedSessions: 12,
    students: [
      { id: "HV001", name: "Nguyễn Văn A", avatar: "👨", attendance: 11, status: "normal" },
      { id: "HV003", name: "Lê Văn C", avatar: "👨", attendance: 10, status: "normal" },
      { id: "HV008", name: "Hoàng Thị H", avatar: "👩", attendance: 12, status: "excellent" },
      { id: "HV009", name: "Bùi Văn I", avatar: "👨", attendance: 8, status: "warning" },
    ],
  },
  {
    id: "TOEIC25-02",
    name: "TOEIC 750",
    teacher: "Lê Văn Hùng",
    schedule: "T3 - T5 - T7",
    time: "19:00 - 21:30",
    totalSessions: 35,
    completedSessions: 8,
    students: [
      { id: "HV002", name: "Trần Thị B", avatar: "👩", attendance: 8, status: "normal" },
      { id: "HV005", name: "Ngô Văn E", avatar: "👨", attendance: 7, status: "normal" },
      { id: "HV010", name: "Trương Văn J", avatar: "👨", attendance: 8, status: "excellent" },
    ],
  },
  {
    id: "IELTS25-02",
    name: "IELTS Beginner",
    teacher: "Trần Văn Đức",
    schedule: "T2 - T5",
    time: "17:00 - 19:00",
    totalSessions: 30,
    completedSessions: 5,
    students: [
      { id: "HV005", name: "Ngô Văn E", avatar: "👨", attendance: 5, status: "normal" },
      { id: "HV011", name: "Lý Thị K", avatar: "👩", attendance: 4, status: "warning" },
    ],
  },
  {
    id: "GE25-01",
    name: "General English",
    teacher: "Phạm Thị Lan",
    schedule: "T4 - T7",
    time: "09:00 - 11:00",
    totalSessions: 25,
    completedSessions: 15,
    students: [
      { id: "HV006", name: "Vũ Thị F", avatar: "👩", attendance: 14, status: "normal" },
    ],
  },
];

const statusConfig = {
  normal: { label: "Bình thường", color: "#10b981", bg: "#d1fae5", icon: CheckCircle },
  excellent: { label: "Xuất sắc", color: "#3b82f6", bg: "#dbeafe", icon: CheckCircle },
  warning: { label: "Cần chú ý", color: "#f59e0b", bg: "#fef3c7", icon: AlertCircle },
};

export default function StudentsInClass() {
  const [expandedClass, setExpandedClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  const toggleExpand = (classId) => {
    setExpandedClass(expandedClass === classId ? null : classId);
  };

  const openAttendance = (cls) => {
    setSelectedClass(cls);
    setShowAttendanceModal(true);
  };

  return (
    <div>
      {/* Header Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#e11d4820",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BookOpen size={24} color="#e11d48" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Tổng số lớp</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: "800", color: "#1e293b" }}>
                {classes.length}
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
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Users size={24} color="#10b981" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Tổng học viên</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: "800", color: "#1e293b" }}>
                {classes.reduce((acc, cls) => acc + cls.students.length, 0)}
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
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Calendar size={24} color="#3b82f6" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Buổi đã dạy</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: "800", color: "#1e293b" }}>
                {classes.reduce((acc, cls) => acc + cls.completedSessions, 0)}
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
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Clock size={24} color="#f59e0b" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>Buổi còn lại</p>
              <p style={{ margin: 0, fontSize: 28, fontWeight: "800", color: "#1e293b" }}>
                {classes.reduce((acc, cls) => acc + (cls.totalSessions - cls.completedSessions), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Class Cards */}
      <div style={{ display: "grid", gap: 16 }}>
        {classes.map((cls) => {
          const progress = Math.round((cls.completedSessions / cls.totalSessions) * 100);
          const isExpanded = expandedClass === cls.id;

          return (
            <div
              key={cls.id}
              style={{
                background: "white",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
              }}
            >
              {/* Class Header */}
              <div
                style={{
                  padding: 20,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: isExpanded ? "#fafafa" : "white",
                }}
                onClick={() => toggleExpand(cls.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      background: "linear-gradient(135deg, #e11d48 0%, #be123c 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <BookOpen size={28} color="white" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: "700", color: "#1e293b" }}>
                      {cls.name}
                    </h3>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                      {cls.id} • GV: {cls.teacher}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <div style={{ display: "flex", gap: 20, textAlign: "center" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Lịch học</p>
                      <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: "600", color: "#1e293b" }}>
                        {cls.schedule}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Giờ học</p>
                      <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: "600", color: "#1e293b" }}>
                        {cls.time}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>Học viên</p>
                      <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: "600", color: "#1e293b" }}>
                        {cls.students.length} người
                      </p>
                    </div>
                  </div>

                  {/* Progress */}
                  <div style={{ minWidth: 150 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Tiến độ</span>
                      <span style={{ fontSize: 12, fontWeight: "600", color: "#1e293b" }}>
                        {progress}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        background: "#e2e8f0",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${progress}%`,
                          background: "linear-gradient(90deg, #e11d48 0%, #f43f5e 100%)",
                          borderRadius: 4,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>
                      {cls.completedSessions}/{cls.totalSessions} buổi
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAttendance(cls);
                      }}
                      style={{
                        padding: "10px 16px",
                        background: "#e11d48",
                        border: "none",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: "600",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <CheckCircle size={16} />
                      Điểm danh
                    </button>
                    <button
                      style={{
                        width: 40,
                        height: 40,
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
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Student List */}
              {isExpanded && (
                <div
                  style={{
                    borderTop: "1px solid #e2e8f0",
                    padding: 20,
                    background: "#fafafa",
                  }}
                >
                  <h4 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: "600", color: "#1e293b" }}>
                    Danh sách học viên ({cls.students.length})
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                    {cls.students.map((student) => {
                      const status = statusConfig[student.status];
                      const StatusIcon = status.icon;
                      const attendanceRate = Math.round((student.attendance / cls.completedSessions) * 100);

                      return (
                        <div
                          key={student.id}
                          style={{
                            background: "white",
                            borderRadius: 12,
                            padding: 16,
                            border: "1px solid #e2e8f0",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              background: "#fef2f2",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 20,
                            }}
                          >
                            {student.avatar}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#1e293b" }}>
                                {student.name}
                              </p>
                              <StatusIcon size={16} color={status.color} />
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                              <div
                                style={{
                                  flex: 1,
                                  height: 4,
                                  background: "#e2e8f0",
                                  borderRadius: 2,
                                  overflow: "hidden",
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    width: `${attendanceRate}%`,
                                    background: status.color,
                                    borderRadius: 2,
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: 12, color: "#64748b", minWidth: 40 }}>
                                {student.attendance}/{cls.completedSessions}
                              </span>
                            </div>
                          </div>
                          <button
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: "1px solid #e2e8f0",
                              background: "white",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#3b82f6",
                            }}
                            title="Xem tiến độ"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && selectedClass && (
        <div
          style={{
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
          }}
          onClick={() => setShowAttendanceModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              width: "90%",
              maxWidth: 600,
              maxHeight: "80vh",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: "700", color: "#1e293b" }}>
                  Điểm danh lớp {selectedClass.name}
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
                  Ngày {new Date().toLocaleDateString("vi-VN")}
                </p>
              </div>
              <button
                onClick={() => setShowAttendanceModal(false)}
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
                ✕
              </button>
            </div>

            <div style={{ padding: 24, overflow: "auto", maxHeight: "calc(80vh - 140px)" }}>
              {selectedClass.students.map((student) => (
                <div
                  key={student.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    background: "#f8fafc",
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{student.avatar}</span>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: "600", color: "#1e293b" }}>
                        {student.name}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>{student.id}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      style={{
                        padding: "8px 20px",
                        background: "#10b981",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: "600",
                        color: "white",
                      }}
                    >
                      Có mặt
                    </button>
                    <button
                      style={{
                        padding: "8px 20px",
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: "500",
                        color: "#64748b",
                      }}
                    >
                      Vắng
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
              }}
            >
              <button
                onClick={() => setShowAttendanceModal(false)}
                style={{
                  padding: "10px 20px",
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#64748b",
                }}
              >
                Hủy
              </button>
              <button
                style={{
                  padding: "10px 24px",
                  background: "#e11d48",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: "600",
                  color: "white",
                }}
              >
                Lưu điểm danh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
