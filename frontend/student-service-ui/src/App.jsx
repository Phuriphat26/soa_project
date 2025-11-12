import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import useAuthStore from './stores/authStore.js';
import React, { useEffect } from 'react'; 
import AdminPage from './pages/AdminPage.jsx';
import RequestDetailPage from './pages/RequestDetailPage.jsx';
// Student Components
import DashboardPage from './pages/DashboardPage.jsx';
import SubmitRequestPage from './pages/SubmitRequestPage.jsx';

// Advisor Component
import AdvisorDashboard from './pages/AdvisorDashboard.jsx';
import UpdateProfilePage from './pages/UpdateProfilePage.jsx';

// Auth Pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

// Guard Component
import RoleGuard from './components/RoleGuard.jsx';


function App() {
  const user = useAuthStore((state) => state.user);
  

  const loadUserFromToken = useAuthStore((state) => state.loadUserFromToken); 

  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  useEffect(() => {
    // แก้ไข: ไม่ให้เรียก loadUserFromToken ถ้า user มีค่าแล้ว
    // เพื่อป้องกันการเรียกซ้ำซ้อน
    if (!user && useAuthStore.getState().token) {
        loadUserFromToken();
    }
  }, [loadUserFromToken, user]);

  // ⭐️ 1. ฟังก์ชัน Logout ปกติ
  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };
  
  // ⭐️ 2. ฟังก์ชัน "บังคับ" Logout (สำหรับแก้ปัญหาหน้าค้าง/หน้าขาว)
  const handleHardLogout = () => {
    console.log("HARD LOGOUT: Clearing session and storage...");
    
    // 1. เรียก logout จาก Store (เพื่อล้าง state ใน App)
    if (logout) logout(); 
    
    // 2. "บังคับ" ล้าง localStorage (สำคัญมาก)
    localStorage.clear(); 
    sessionStorage.clear(); // ล้าง sessionStorage ด้วย (ถ้ามี)
    
    // 3. บังคับย้ายไปหน้า login และ Reload (ล้าง state ที่ค้างทั้งหมด)
    window.location.href = '/login'; 
  };


  // การจัดการ Loading State
  // (ย้ายไปอยู่ใน RootHandler ด้านล่าง)

  // Helper สำหรับตรวจสอบ Role (ย้ายไปอยู่ใน RootHandler ด้านล่าง)

  return (
    <div>
      {/* 🔹 Navigation Bar */}
      <nav style={{ padding: '10px', background: '#eee', display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ marginRight: '15px', fontWeight: 'bold', textDecoration: 'none', color: '#0056b3' }}>
            ระบบคำร้องออนไลน์
        </Link>

        {/* 🔹 แสดง “ยื่นคำร้อง” เฉพาะเมื่อเป็น STUDENT */}
        {user && user.profile?.role === 'Student' && (
          <Link to="/submit" style={{ marginRight: '15px' }}>ยื่นคำร้อง</Link>
        )}
        
        {/* 🔹 แสดง "จัดการผู้ใช้" เฉพาะเมื่อเป็น STAFF หรือ ADVISOR */}
        {/* (ต้องเช็ก Role ให้ตรงกับฐานข้อมูล: 'Advisor' หรือ 'advisor') */}
        {user && (user.profile?.role === 'STAFF' || user.profile?.role === 'Advisor') && (
          <Link to="/admin" style={{ marginRight: '15px', fontWeight: 'bold', color: 'darkblue' }}>จัดการผู้ใช้</Link>
        )}
        
        {/* 🔹 Link สำหรับแก้ไข Profile (แสดงทุกคนที่ Login) */}
        {user && (
            <Link to="/profile/edit" style={{ marginRight: '15px', color: '#333' }}>แก้ไขโปรไฟล์</Link>
        )}

        {/* 🔹 แยกส่วนขวา (Auth Status) */}
        <div style={{ marginLeft: 'auto' }}>
            {/* 🔹 ปุ่ม Login/Register จะแสดงเมื่อยังไม่ได้ Login */}
            {!user && (
            <>
                <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>
                <Link to="/register">Register</Link>
            </>
            )}

            {/* 🔹 ปุ่ม Logout จะแสดงเมื่อ Login แล้ว */}
            {user && (
            <>
              {/* ปุ่ม Logout ปกติ */}
              <button
                  onClick={handleLogout}
                  style={{
                  marginLeft: '10px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'red', fontWeight: 'bold'
                  }}
              >
                  (Logout)
              </button>

              {/* ⭐️ 3. ปุ่ม "บังคับ" Logout (แก้ปัญหาหน้าขาว) ⭐️ */}
              <button
                onClick={handleHardLogout} // เรียกใช้ฟังก์ชันใหม่
                style={{ 
                  marginLeft: '10px', 
                  background: '#D32F2F', // สีแดง
                  color: 'white',
                  border: 'none',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  borderRadius: '4px'
                }}
              >
                บังคับ Logout (ล้าง Token)
              </button>
            </>
            )}
        </div>
      </nav>

      <hr />

      {/* 🔹 Routes */}
      <Routes>
        {/* Auth Routes: หน้า Login / Register ควรอยู่นอกสุด */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* ⭐️ 4. แก้ไข: Route "/" (หน้าแรก) ⭐️ */}
        {/* ใช้ Component RootHandler เพื่อ "คัดแยก" */}
        <Route
          path="/"
          element={
            <RootHandler /> 
          }
        />

        {/* ⭐️ 5. เพิ่ม: Route "/dashboard" สำหรับ Student ⭐️ */}
        {/* (ย้ายมาจาก path="/") */}
        <Route
          path="/dashboard"
          element={
            <RoleGuard allowedRoles={['Student']}>
              <DashboardPage />
            </RoleGuard>
          }
        />

        {/* --- Protected Routes (ที่เหลือเหมือนเดิม) --- */}
        
        <Route
          path="/profile/edit"
          element={
            <RoleGuard> 
              <UpdateProfilePage />
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
        <Route
          path="/requests/:requestId"
          element={
            <RoleGuard> 
              <RequestDetailPage />
            </RoleGuard>
          }
        />
        
        {/* Advisor Route (เช็ก Role ให้ตรง: 'Advisor' หรือ 'advisor') */}
        <Route
          path="/advisor/dashboard"
          element={
            <RoleGuard allowedRoles={['Advisor', 'STAFF']}> 
              <AdvisorDashboard />
            </RoleGuard>
          }
        />
        
        {/* Admin/Staff Route (เช็ก Role ให้ตรง: 'Advisor' หรือ 'advisor') */}
        <Route
          path="/admin"
          element={
            <RoleGuard allowedRoles={['STAFF', 'Advisor']}> 
              <AdminPage />
            </RoleGuard>
          }
        />

        {/* 404 Not Found (เหมือนเดิม) */}
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


// ⭐️ 6. เพิ่ม Component นี้เข้าไปในไฟล์ App.jsx ⭐️
// (วางไว้ข้างนอก function App() แต่ก่อน export default)
//
// **!!สำคัญ!!**
// ในโค้ดนี้ ผมใช้ 'Advisor' (A พิมพ์ใหญ่) และ 'Student' (S พิมพ์ใหญ่)
// คุณต้องแก้ไขให้ตรงกับ Role ในฐานข้อมูลของคุณนะครับ

function RootHandler() {
  const user = useAuthStore((state) => state.user);
  const loadingUser = useAuthStore((state) => state.loadingUser); 
  
  // 1. ถ้ากำลังโหลดข้อมูลผู้ใช้ (เช่น เช็ก token) ให้รอ
  if (!user && (useAuthStore.getState().token || loadingUser)) {
    return <div style={{ padding: '20px' }}>กำลังโหลดข้อมูลผู้ใช้...</div>;
  }

  // 2. ถ้าไม่ได้ Login, ให้เด้งไป /login
  if (!user) {
    // นี่คือสิ่งที่ทำให้ระบบเริ่มที่หน้า Login เสมอ
    return <Navigate to="/login" replace />;
  }

  // 3. ถ้า Login แล้ว, ให้เด้งไปตาม Role
  const userRole = user.profile?.role;
  
  // (แก้ 'Advisor' ให้ตรงกับฐานข้อมูลของคุณ)
  const isStaffOrAdvisor = userRole === 'STAFF' || userRole === 'Advisor'; 

  if (isStaffOrAdvisor) {
    return <Navigate to="/advisor/dashboard" replace />;
  } else if (userRole === 'Student') {
    // (แก้ 'Student' ให้ตรงกับฐานข้อมูลของคุณ)
    return <Navigate to="/dashboard" replace />; 
  } else {
    // กันเหนียว: ถ้ามี Role แปลกๆ ให้ไปหน้า Login
    console.error("Unknown user role:", userRole);
    localStorage.clear(); // ล้าง token ที่อาจมีปัญหา
    return <Navigate to="/login" replace />;
  }
}

export default App;