import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

function RoleGuard({ allowedRoles, children }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // 1. ถ้ายังไม่ได้ Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. ถ้า Login แล้ว แต่มีการกำหนด allowedRoles
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.profile?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.log(
        `Access Denied: User role (${userRole}) not in allowed roles (${allowedRoles.join(
          ', '
        )})`
      );

      // ⭐️⭐️⭐️ นี่คือส่วนที่แก้ไข ⭐️⭐️⭐️
      // เปลี่ยนจากการ Navigate กลับไปหน้า Login
      // เป็นการแสดงผล "หน้าจอแจ้งเตือน" แทน
      return (
        <div
          style={{
            padding: '30px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '40px auto',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fff9f9',
          }}
        >
          <h2 style={{ color: '#D32F2F' }}>🚫 Access Denied (ไม่มีสิทธิ์เข้าถึง)</h2>
          <p>คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้</p>
          <hr style={{ margin: '20px 0', borderColor: '#eee' }} />

          <p style={{ color: '#555', fontSize: '0.9em' }}>
            <strong>Role ของคุณคือ:</strong>
            <span
              style={{
                color: '#D32F2F',
                background: '#ffebee',
                padding: '2px 6px',
                borderRadius: '4px',
                marginLeft: '5px',
              }}
            >
              {userRole || 'N/A'}
            </span>
          </p>
          <p style={{ color: '#555', fontSize: '0.9em' }}>
            <strong>Role ที่หน้านี้อนุญาต:</strong>
            <span
              style={{
                color: 'green',
                background: '#e8f5e9',
                padding: '2px 6px',
                borderRadius: '4px',
                marginLeft: '5px',
              }}
            >
              {allowedRoles.join(' | ')}
            </span>
          </p>
        </div>
      );
      // ⭐️⭐️⭐️ สิ้นสุดส่วนที่แก้ไข ⭐️⭐️⭐️
    }
  }

  // 3. ผ่านการตรวจสอบทั้งหมด
  return <>{children}</>;
}

export default RoleGuard;