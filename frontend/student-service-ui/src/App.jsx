import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
  useLocation,
  Outlet,
} from 'react-router-dom';
import useAuthStore from './stores/authStore.js';

// ⭐ Import CSS หลัก
import './index.css';

// ⭐ Import Pages
import AdminPage from './pages/AdminPage.jsx';
import RequestDetailPage from './pages/RequestDetailPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SubmitRequestPage from './pages/SubmitRequestPage.jsx';
import AdvisorDashboard from './pages/AdvisorDashboard.jsx';
import UpdateProfilePage from './pages/UpdateProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import CategoryManagement from './pages/admin/CategoryManagement.jsx';

// ⭐ Guard Component
import RoleGuard from './components/RoleGuard.jsx';


// ─────────────────────────────────────────────
// 🧩 Layout Component
// ─────────────────────────────────────────────
function PageLayout() {
  const location = useLocation();

  const centeredPages = [
    '/',
    '/login',
    '/register',
    '/access-denied',
    '/404',
    '/submit',
    '/profile/edit',
    '/dashboard',
    '/advisor/dashboard',
    '/admin/dashboard',
  ];

  const isCenteredPage =
    centeredPages.includes(location.pathname) || location.state?.is404;

  return isCenteredPage ? (
    <div className="page-content-wrapper">
      <Outlet />
    </div>
  ) : (
    <div className="container" style={{ paddingTop: 20, paddingBottom: 20 }}>
      <Outlet />
    </div>
  );
}

// ─────────────────────────────────────────────
// 🚫 Access Denied Page
// ─────────────────────────────────────────────
const AccessDeniedPage = () => (
  <div className="card" style={{ maxWidth: 500, textAlign: 'center', margin: 'auto' }}>
    <div className="card-header">
      <h2>🚫 Access Denied</h2>
    </div>
    <div className="card-body">
      <p>คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
        กลับสู่หน้าแรก
      </Link>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// 🕳️ Not Found Page
// ─────────────────────────────────────────────
const NotFoundPage = () => (
  <div className="card" style={{ maxWidth: 500, textAlign: 'center', margin: 'auto' }}>
    <div className="card-header">
      <h2>404 - Not Found</h2>
    </div>
    <div className="card-body">
      <p>ขออภัย, ไม่พบหน้าที่คุณร้องขอ</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
        กลับสู่หน้าแรก
      </Link>
    </div>
  </div>
);


// ─────────────────────────────────────────────
// 🌐 Main App Component
// ─────────────────────────────────────────────
function App() {
  const user = useAuthStore((state) => state.user);
  const loadUserFromToken = useAuthStore((state) => state.loadUserFromToken);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user && useAuthStore.getState().token) {
      loadUserFromToken();
    }
  }, [user, loadUserFromToken]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path, exact = false) => {
    return exact ? location.pathname === path : location.pathname.startsWith(path);
  };

  return (
    <>
      {/* ──────────────── 🔹 Navigation Bar ──────────────── */}
      <nav className="app-nav">
        <Link to="/" className="brand-logo">
          ระบบคำร้อง<span>ออนไลน์</span>
        </Link>

        <div className="nav-links">
          {!user && (
            <>
              <Link
                to="/login"
                className={`btn-nav ${isActive('/login', true) ? 'active' : ''}`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`btn-nav ${isActive('/register', true) ? 'active' : ''}`}
              >
                Register
              </Link>
            </>
          )}

          {user && (
            <>
              {/* 🔹 Student Links */}
              {user.profile?.role === 'Student' && (
                <>
                  <Link
                    to="/dashboard"
                    className={isActive('/dashboard', true) ? 'active' : ''}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/submit"
                    className={isActive('/submit', true) ? 'active' : ''}
                  >
                    ยื่นคำร้อง
                  </Link>
                </>
              )}

              {/* 🔹 Advisor / Staff Links */}
              {(user.profile?.role === 'Advisor' || user.profile?.role === 'Staff') && (
                <Link
                  to="/advisor/dashboard"
                  className={isActive('/advisor/dashboard', true) ? 'active' : ''}
                >
                  Advisor Dashboard
                </Link>
              )}

              {/* 🔹 Admin Links */}
              {user.profile?.role === 'Admin' && (
                <Link
                  to="/admin/dashboard"
                  className={isActive('/admin', false) ? 'active' : ''}
                >
                  แผงควบคุม Admin
                </Link>
              )}

              {/* 🔹 Profile Edit */}
              <Link
                to="/profile/edit"
                className={isActive('/profile/edit', true) ? 'active' : ''}
              >
                แก้ไขโปรไฟล์
              </Link>

              {/* 🔹 Logout */}
              <button onClick={handleLogout} className="btn-nav logout-btn">
                ออกจากระบบ
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ──────────────── 📜 Routes ──────────────── */}
      <Routes>
        <Route element={<PageLayout />}>
          {/* Root */}
          <Route path="/" element={<RootHandler />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* Student */}
          <Route
            path="/dashboard"
            element={
              <RoleGuard allowedRoles={['Student']}>
                <DashboardPage />
              </RoleGuard>
            }
          />
          <Route
            path="/submit"
            element={
              <RoleGuard allowedRoles={['Student']}>
                <SubmitRequestPage />
              </RoleGuard>
            }
          />

          {/* Advisor / Staff */}
          <Route
            path="/advisor/dashboard"
            element={
              <RoleGuard allowedRoles={['Advisor', 'Staff', 'Admin']}>
                <AdvisorDashboard />
              </RoleGuard>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <RoleGuard allowedRoles={['Admin']}>
                <AdminPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <RoleGuard allowedRoles={['Admin']}>
                <AdminDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <RoleGuard allowedRoles={['Admin']}>
                <CategoryManagement />
              </RoleGuard>
            }
          />

          {/* Common */}
          <Route
            path="/profile/edit"
            element={
              <RoleGuard>
                <UpdateProfilePage />
              </RoleGuard>
            }
          />
          <Route
            path="/requests/:requestId"
            element={
              <RoleGuard>
                <RequestDetailPage />
              </RoleGuard>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={<Navigate to="/404" replace state={{ is404: true }} />}
          />
          <Route path="/404" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

// ─────────────────────────────────────────────
// 🧭 Root Handler (Redirect ตาม Role)
// ─────────────────────────────────────────────
function RootHandler() {
  const user = useAuthStore((state) => state.user);
  const loadingUser = useAuthStore((state) => state.loadingUser);

  if (!user && (useAuthStore.getState().token || loadingUser)) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลดข้อมูลผู้ใช้...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.profile?.role;

  if (userRole === 'Admin') return <Navigate to="/admin/dashboard" replace />;
  if (userRole === 'Advisor' || userRole === 'Staff')
    return <Navigate to="/advisor/dashboard" replace />;
  if (userRole === 'Student') return <Navigate to="/dashboard" replace />;

  console.error('Unknown user role:', userRole);
  localStorage.clear();
  return <Navigate to="/login" replace />;
}

export default App;
