import { useState } from "react";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import UserManagement from "./UserManagement";
import OrderManagement from "./OrderManagement";
import WithdrawalManagement from "./WithdrawalManagement";
import ProductManagement from "./ProductManagement";
import Statistics from "./Statistics";

// LMS Components
import LMSAdminLayout from "./lms/LMSAdminLayout";
import Leads from "./lms/Leads";
import TestAppointments from "./lms/TestAppointments";
import StudentList from "./lms/StudentList";
import StudentsInClass from "./lms/StudentsInClass";
import PausedStudents from "./lms/PausedStudents";
import TransferredStudents from "./lms/TransferredStudents";
import RegistrationAppointments from "./lms/RegistrationAppointments";
import StudentFeedback from "./lms/StudentFeedback";
import PaymentManagement from "./lms/PaymentManagement";

export default function Admin({ onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  
  // Logout handler - pass to layout
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      if (onLogout) {
        onLogout();
      }
      window.navigateTo && window.navigateTo("home");
    }
  };
  const [lmsActivePage, setLmsActivePage] = useState("leads");
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
      case "statistics":
      case "stats-revenue":
      case "stats-products":
      case "stats-affiliates":
        return <Statistics />;
      case "lms":
        return (
          <LMSAdminLayout activePage={lmsActivePage} onNavigate={handleLmsNavigate} onLogout={handleLogout}>
            {renderLmsPage()}
          </LMSAdminLayout>
        );
      case "commissions":
        return (
          <div style={{ textAlign: "center", padding: 60 }}>
            <span style={{ fontSize: 64, display: "block", marginBottom: 20 }}>💰</span>
            <h2 style={{ color: "#333", marginBottom: 10 }}>Quản lý hoa hồng</h2>
            <p style={{ color: "#666" }}>Tính năng đang được phát triển...</p>
          </div>
        );
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
  if (activePage === "lms") {
    return (
      <LMSAdminLayout activePage={lmsActivePage} onNavigate={handleLmsNavigate} onLogout={handleLogout}>
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
