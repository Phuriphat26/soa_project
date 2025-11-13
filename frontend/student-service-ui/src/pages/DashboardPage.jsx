// src/pages/DashboardPage.jsx

import React, { useState } from 'react'; // ⭐️ 1. Import useState
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import RequestList from '../components/RequestList';

function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // ⭐️ 2. เพิ่ม State สำหรับ Filter
  const [filterStatus, setFilterStatus] = useState('All'); // (Default คือ 'ทั้งหมด')

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container">
      <h1>ยินดีต้อนรับสู่ Dashboard!</h1>

      {user ? (
        <div className="card">
          <div className="card-header">
            <h3>ข้อมูลผู้ใช้ที่เข้าสู่ระบบ</h3>
          </div>
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
            <button onClick={handleLogout} className="btn btn-danger">
              ออกจากระบบ
            </button>
          </div>
        </div>
      ) : (
        <p>กำลังโหลดข้อมูล...</p>
      )}

      <div style={{ margin: '30px 0' }}>
        <Link to="/submit">
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

      {/* ⭐️ 3. เพิ่ม Dropdown สำหรับ Filter (ก่อน RequestList) */}
      <div className="form-group" style={{ maxWidth: '250px', marginBottom: '1.5rem' }}>
        <label htmlFor="statusFilter">กรองตามสถานะ:</label>
        <select
          id="statusFilter"
          className="form-control"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">ทั้งหมด</option>
          {/* ⭐️ แก้ไข value ให้เป็นตัวพิมพ์ใหญ่ (KEY) ตาม models.py */}
          <option value="PENDING">รออนุมัติ</option>
          <option value="IN_PROGRESS">กำลังดำเนินการ</option>
          <option value="APPROVED">อนุมัติแล้ว</option>
          <option value="REJECTED">ปฏิเสธแล้ว</option>
        </select>
      </div>

      {/* ⭐️ 4. ส่ง filterStatus เป็น prop ลงไปให้ RequestList */}
      {user && <RequestList filterStatus={filterStatus} />}
    </div>
  );
}

export default DashboardPage;