// src/pages/DashboardPage.jsx

import React from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ⭐️ 1. เพิ่ม 'Link'
import useAuthStore from '../stores/authStore';
import RequestList from '../components/RequestList'; 

function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
      <h1>ยินดีต้อนรับสู่ Dashboard!</h1>
      
      {/* ส่วนแสดงข้อมูลผู้ใช้ที่ Login อยู่ */}
      {user ? (
        <div style={{ 
            border: '1px solid #ccc', 
            padding: '15px', 
            marginTop: '15px', 
            borderRadius: '8px', 
            backgroundColor: '#f9f9f9' 
        }}>
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

      {/* ⭐️ 2. เพิ่มปุ่มสำหรับไปหน้ายื่นคำร้อง */}
      <div style={{ margin: '30px 0' }}>
        <Link to="/submit">
          <button style={{ 
              padding: '12px 25px', 
              fontSize: '1.1rem', 
              backgroundColor: '#007bff', // สีน้ำเงิน
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontWeight: 'bold'
          }}>
            + ยื่นคำร้องใหม่
          </button>
        </Link>
      </div>

      <hr style={{ margin: '30px 0' }} />

      {/* ⭐️ 3. เพิ่มหัวข้อให้ตาราง (เหมือนใน Screenshot) */}
      <h2>รายการคำร้องทั้งหมด</h2> 

      {/* ส่วนแสดงรายการคำร้องของ User คนนี้ */}
      {user && <RequestList />}
      
    </div>
  );
}

export default DashboardPage;