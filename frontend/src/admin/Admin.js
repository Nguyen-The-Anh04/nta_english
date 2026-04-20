import { useState } from "react";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import UserManagement from "./UserManagement";
import OrderManagement from "./OrderManagement";
import WithdrawalManagement from "./WithdrawalManagement";
import ProductManagement from "./ProductManagement";
import Statistics from "./Statistics";
import CTVManagement from "./CTVManagement";
import CustomerManagement from "./CustomerManagement";
import CommissionManagement from "./CommissionManagement";

// LMS Components
import LMSAdminLayout from "./lms/LMSAdminLayout";
import StudentPortal from "./lms/StudentPortal";
import Leads from "./lms/Leads";
import TestAppointments from "./lms/TestAppointments";
import StudentList from "./lms/StudentList";
import StudentsInClass from "./lms/StudentsInClass";
import PausedStudents from "./lms/PausedStudents";
import TransferredStudents from "./lms/TransferredStudents";
import RegistrationAppointments from "./lms/RegistrationAppointments";
import StudentFeedback from "./lms/StudentFeedback";
import PaymentManagement from "./lms/PaymentManagement";
import ClassManagement from "./lms/ClassManagement";
import StudentManagement from "./lms/StudentManagement";
import QuanLyDeThi from "./lms/QuanLyDeThi";
import DiemDanh from "./lms/DiemDanh";
import BaiTap from "./lms/BaiTap";
import BangDiem from "./lms/BangDiem";
import KeToanDashboard from "./lms/KeToanDashboard";
import CongNo from "./lms/CongNo";
import PhieuThuChi from "./lms/PhieuThuChi";

export default function Admin({ onLogout }) {
  // Lấy role từ localStorage (được lưu khi login thành công)
  // Mặc định là 1 (admin) nếu không có
  const userRole = parseInt(localStorage.getItem("chuc_vu_id") || "1");
  const userName = localStorage.getItem("user_name") || "Admin NTA";
  
  // Set initial page based on role
  // Role 1: Admin -> dashboard (full access)
  // Role 2,3,4: Staff -> go to LMS directly
  // Role 5: Student -> StudentPortal (handled separately)
  const getInitialPage = () => {
    if (userRole === 5) return "student-portal"; // StudentPortal
    if (userRole >= 2 && userRole <= 4) return "lms"; // LMS for staff
    return "dashboard"; // Default to dashboard for admin
  };
  
  const [activePage, setActivePage] = useState(getInitialPage());
  
  // Logout handler - pass to layout
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      // Clear localStorage
      localStorage.removeItem("adminLoggedIn");
      localStorage.removeItem("chuc_vu_id");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
      localStorage.removeItem("adminUser");
      if (onLogout) {
        onLogout();
      }
      window.navigateTo && window.navigateTo("admin");
    }
  };
  
  // Set initial LMS page based on role
  const getInitialLmsPage = () => {
    if (userRole === 3) return "class-management"; // Teacher
    if (userRole === 4) return "ke-toan"; // Accountant
    return "leads"; // Default for Sale and Admin
  };
  
  const [lmsActivePage, setLmsActivePage] = useState(getInitialLmsPage());
  const [pendingLeads, setPendingLeads] = useState([]); // Leads chờ book lịch test

  // Function to add lead to pending list for test appointment
  const addLeadToTest = (lead) => {
    setPendingLeads((prev) => [...prev, { ...lead, tempId: Date.now() }]);
  };

  // Render LMS page content
  const renderLmsPage = () => {
    switch (lmsActivePage) {
      case "leads":
        return <Leads onNavigateToTest={handleLmsNavigate} />;
      case "test-appointment":
        return <TestAppointments pendingLeads={pendingLeads} onClearPending={() => setPendingLeads([])} />;
      case "students":
        return <StudentList />;
      case "students-in-class":
        return <StudentsInClass />;
      case "paused-students":
        return <PausedStudents />;
      case "transferred-students":
        return <TransferredStudents />;
      case "registration":
        return <RegistrationAppointments />;
      case "payment":
        return <PaymentManagement />;
      case "feedback":
        return <StudentFeedback />;
      case "class-management":
        return <ClassManagement />;
      case "student-management":
        return <StudentManagement />;
      case "diem-danh":
        return <DiemDanh />;
      case "bai-tap":
        return <BaiTap />;
      case "bang-diem":
        return <BangDiem />;
      case "ke-toan":
        return <KeToanDashboard onNavigate={handleLmsNavigate} />;
      case "cong-no":
        return <CongNo />;
      case "phieu-thu-chi":
        return <PhieuThuChi />;
      default:
        return <Leads />;
    }
  };

  const handleLmsNavigate = (page, leadData = null) => {
    if (page === "main-admin") {
      setActivePage("dashboard");
    } else if (page === "test-appointment" && leadData) {
      // Add lead to pending list when navigating from leads
      setPendingLeads((prev) => [...prev, { ...leadData, tempId: Date.now() }]);
    }
    setLmsActivePage(page);
    setActivePage("lms");
  };

  const renderPage = () => {
    switch (activePage) {
      case "student-portal":
        return <StudentPortal onLogout={handleLogout} />;
      case "dashboard":
        return <AdminDashboard onNavigate={setActivePage} />;
      case "users":
        return <UserManagement />;
      case "orders":
        return <OrderManagement />;
      case "withdrawals":
        return <WithdrawalManagement />;
      case "products":
        return <ProductManagement />;
      case "ctv":
        return <CTVManagement />;
      case "customers":
        return <CustomerManagement />;
      case "statistics":
      case "stats-revenue":
      case "stats-products":
      case "stats-affiliates":
        return <Statistics />;
      case "lms":
        return (
          <LMSAdminLayout 
            activePage={lmsActivePage} 
            onNavigate={handleLmsNavigate} 
            onLogout={handleLogout}
            role={userRole}
            userName={userName}
          >
            {renderLmsPage()}
          </LMSAdminLayout>
        );
      case "commissions":
        return <CommissionManagement />;
      case "settings":
        return (
          <div style={{ textAlign: "center", padding: 60 }}>
            <span style={{ fontSize: 64, display: "block", marginBottom: 20 }}>⚙️</span>
            <h2 style={{ color: "#333", marginBottom: 10 }}>Cài đặt hệ thống</h2>
            <p style={{ color: "#666" }}>Tính năng đang được phát triển...</p>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  // Use a simpler layout for LMS pages
  // Role 2/3/4: luôn dùng LMSAdminLayout
  if (activePage === "lms" || (userRole >= 2 && userRole <= 4)) {
    if (userRole === 5) {
      return <StudentPortal onLogout={handleLogout} />;
    }
    return (
      <LMSAdminLayout
        activePage={lmsActivePage}
        onNavigate={handleLmsNavigate}
        onLogout={handleLogout}
        role={userRole}
        userName={userName}
      >
        {renderLmsPage()}
      </LMSAdminLayout>
    );
  }

  return (
    <AdminLayout activePage={activePage} onNavigate={setActivePage}>
      {renderPage()}
    </AdminLayout>
  );
}
