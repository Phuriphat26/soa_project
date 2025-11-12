import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import useAuthStore from './stores/authStore';

// Student Components
import DashboardPage from './pages/DashboardPage';
import SubmitRequestPage from './pages/SubmitRequestPage';

// Advisor Component
import AdvisorDashboard from './pages/AdvisorDashboard';

// Auth Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Guard Component
import RoleGuard from './components/RoleGuard';


function App() {
  const user = useAuthStore((state) => state.user);

  // สำหรับ Logout
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // ล้าง token ใน store และ localStorage
    navigate('/login'); // กลับไปหน้า Login
  };

  return (
    <div>
      {/* 🔹 Navigation Bar */}
      <nav style={{ padding: '10px', background: '#eee' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Dashboard</Link>

        {/* 🔹 แสดง “ยื่นคำร้อง” เฉพาะเมื่อเป็น Student */}
        {user && user.profile?.role === 'STUDENT' && (
          <Link to="/submit" style={{ marginRight: '10px' }}>ยื่นคำร้อง</Link>
        )}

        {/* 🔹 ปุ่ม Login/Register จะแสดงเมื่อยังไม่ได้ Login */}
        {!user && (
          <>
            <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {/* 🔹 ปุ่ม Logout จะแสดงเมื่อ Login แล้ว */}
        {user && (
          <button
            onClick={handleLogout}
            style={{
              marginLeft: '10px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'red'
            }}
          >
            (Logout)
          </button>
        )}
      </nav>

      <hr />

      {/* 🔹 Routes */}
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student Route */}
        <Route
          path="/submit"
          element={
            <RoleGuard allowedRoles={['STUDENT']}>
              <SubmitRequestPage />
            </RoleGuard>
          }
        />

        {/* Advisor Route */}
        <Route
          path="/advisor/dashboard"
          element={
            <RoleGuard allowedRoles={['ADVISOR']}>
              <AdvisorDashboard />
            </RoleGuard>
          }
        />

        {/* Default Route (/) */}
        <Route
          path="/"
          element={
            <RoleGuard allowedRoles={['STUDENT', 'ADVISOR']}>
              {user?.profile?.role === 'ADVISOR' ? (
                <Navigate to="/advisor/dashboard" replace />
              ) : (
                <DashboardPage />
              )}
            </RoleGuard>
          }
        />

        {/* 404 Not Found */}
        <Route
          path="*"
          element={
            <div style={{ padding: '20px' }}>
              ไม่พบหน้าเว็บนี้ (404)
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
