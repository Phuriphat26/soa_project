import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import RequestList from '../components/RequestList'; // Import Component รายการคำร้อง

function DashboardPage() {
  // ดึงข้อมูล user และ action logout จาก Store
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // ล้าง Token ใน Store และ Local Storage
    navigate('/login'); // พาไปหน้า Login
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>ยินดีต้อนรับสู่ Dashboard!</h1>
      
      {/* ส่วนแสดงข้อมูลผู้ใช้ที่ Login อยู่ */}
      {user ? (
        <div style={{ border: '1px solid #ccc', padding: '15px', marginTop: '15px' }}>
          <h3>ข้อมูลผู้ใช้ที่เข้าสู่ระบบ</h3>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Role:</strong> {user.profile?.role}</p> 
          <p><strong>ชื่อ-สกุล:</strong> {user.first_name} {user.last_name}</p>
          <p><strong>Status:</strong> เข้าสู่ระบบสำเร็จ</p>
          
          <button 
            onClick={handleLogout} 
            style={{ 
              marginTop: '10px', 
              background: 'red', 
              color: 'white', 
              border: 'none', 
              padding: '5px 10px', 
              cursor: 'pointer' 
            }}
          >
            ออกจากระบบ (Logout)
          </button>
        </div>
      ) : (
        <p>กำลังโหลดข้อมูล...</p>
      )}

      <hr style={{ margin: '30px 0' }} />

      {/* ส่วนแสดงรายการคำร้องของ User คนนี้ */}
      {user && <RequestList />}
      
    </div>
  );
}

export default DashboardPage;