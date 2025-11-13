// src/pages/DashboardPage.jsx

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
    // ⭐️ 1. ใช้ .container เพื่อจัดเนื้อหาให้อยู่ตรงกลางและมีขอบที่สวยงาม
    <div className="container">
      <h1>ยินดีต้อนรับสู่ Dashboard!</h1>

      {user ? (
        // ⭐️ 2. เปลี่ยน div ข้อมูลผู้ใช้เป็น .card
        <div className="card">
          {/* ⭐️ 3. เพิ่ม .card-header สีฟ้าอ่อน */}
          <div className="card-header">
            <h3>ข้อมูลผู้ใช้ที่เข้าสู่ระบบ</h3>
          </div>
          {/* ⭐️ 4. ใช้ .card-body และจัดวางปุ่ม Logout ไปทางขวา */}
          <div
            className="card-body"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p style={{ margin: '0 0 5px 0' }}>
                <strong>Username:</strong> {user.username}
              </p>
              <p style={{ margin: '0 0 5px 0' }}>
                <strong>Role:</strong> {user.profile?.role}
              </p>
              <p style={{ margin: '0 0 5px 0' }}>
                <strong>ชื่อ-สกุล:</strong> {user.first_name} {user.last_name}
              </p>
            </div>
            {/* ⭐️ 5. เปลี่ยนปุ่ม Logout เป็น .btn .btn-danger */}
            <button onClick={handleLogout} className="btn btn-danger">
              ออกจากระบบ
            </button>
          </div>
        </div>
      ) : (
        <p>กำลังโหลดข้อมูล...</p>
      )}

      {/* ⭐️ 6. ปรับปุ่มยื่นคำร้องใหม่ */}
      <div style={{ margin: '30px 0' }}>
        <Link to="/submit">
          {/* ⭐️ 7. ใช้ .btn .btn-primary และคงขนาดใหญ่ไว้ */}
          <button
            className="btn btn-primary"
            style={{
              padding: '12px 25px',
              fontSize: '1.1rem',
            }}
          >
            + ยื่นคำร้องใหม่
          </button>
        </Link>
      </div>

      <hr style={{ margin: '30px 0' }} />

      <h2>รายการคำร้องทั้งหมด</h2>

      {/* ⭐️ หมายเหตุ: RequestList (ซึ่งเป็นตาราง) 
        จะสวยงามขึ้นโดยอัตโนมัติ 
        เพราะไฟล์ index.css ที่ผมให้ไป
        ได้จัดสไตล์ของ <table>, <thead>, <tbody> ไว้แล้ว 
      */}
      {user && <RequestList />}
    </div>
  );
}

export default DashboardPage;