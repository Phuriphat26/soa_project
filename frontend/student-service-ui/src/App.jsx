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
import React, { useEffect } from 'react';
import './index.css';

// Page Imports
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
import RequestTypeManagement from './pages/admin/RequestTypeManagement.jsx';

// ⭐️ Import กระดิ่งแจ้งเตือน
import NotificationBell from './components/NotificationBell.jsx';

// Guard Component
import RoleGuard from './components/RoleGuard.jsx';


// ⭐️ Layout สำหรับจัดหน้า
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

  const isCenteredPage = centeredPages.includes(location.pathname) || location.state?.is404;

  if (isCenteredPage) {
    return (
      <div className="page-content-wrapper">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <Outlet />
    </div>
  );
}


// ⭐️ Access Denied Page
const AccessDeniedPage = () => (
  <div className="card" style={{ maxWidth: '500px', textAlign: 'center', margin: 'auto', marginTop: '3rem' }}>
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


// ⭐️ 404 Page
const NotFoundPage = () => (
  <div className="card" style={{ maxWidth: '500px', textAlign: 'center', margin: 'auto', marginTop: '3rem' }}>
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


// ⭐️ Root Handler - เปลี่ยนเส้นทางตาม Role
function RootHandler() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.profile?.role || '';

  if (role === 'Student') {
    return <Navigate to="/dashboard" replace />;
  } else if (role === 'Advisor' || role.includes('Staff')) {
    return <Navigate to="/advisor/dashboard" replace />;
  } else if (role === 'Admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}


// ⭐️ Main App
function App() {
  const user = useAuthStore((state) => state.user);
  const loadUserFromToken = useAuthStore((state) => state.loadUserFromToken);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🔍 User:', user);
    console.log('🔍 Token:', useAuthStore.getState().token);
  }, [user]);

  useEffect(() => {
    if (!user && useAuthStore.getState().token) {
      loadUserFromToken();
    }
  }, [loadUserFromToken, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path, exact = false) => {
    return exact
      ? location.pathname === path
      : location.pathname.startsWith(path);
  };

  return (
    <>
      {/* ⭐️ Navigation Bar */}
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

              {(user.profile?.role === 'Advisor' ||
                user.profile?.role?.includes('Staff')) && (
                <Link
                  to="/advisor/dashboard"
                  className={isActive('/advisor/dashboard', true) ? 'active' : ''}
                >
                  จัดการคำร้อง
                </Link>
              )}

              {user.profile?.role === 'Admin' && (
                <Link
                  to="/admin/dashboard"
                  className={isActive('/admin', true) ? 'active' : ''}
                >
                  แผงควบคุม Admin
                </Link>
              )}

              <Link
                to="/profile/edit"
                className={isActive('/profile/edit', true) ? 'active' : ''}
              >
                แก้ไขโปรไฟล์
              </Link>

              {/* ⭐️ กระดิ่งแจ้งเตือน */}
              <NotificationBell />

              <button onClick={handleLogout} className="btn-nav logout-btn">
                ออกจากระบบ
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ⭐️ Routes */}
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={<RootHandler />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />

          {/* Student Routes */}
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
              <RoleGuard allowedRoles={['Advisor', 'Staff', 'Admin', 'Staff (Finance)']}>
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
          <Route
            path="/admin/categories/:categoryId/types"
            element={
              <RoleGuard allowedRoles={['Admin']}>
                <RequestTypeManagement />
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
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace state={{ is404: true }} />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
