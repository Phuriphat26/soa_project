import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';

/**
 * Component สำหรับตรวจสอบสิทธิ์การเข้าถึง Route
 * @param {object} props
 * @param {Array<string>} [props.allowedRoles] - รายการ roles ที่ได้รับอนุญาต เช่น ['STUDENT', 'ADVISOR']
 * @param {React.ReactNode} props.children - Child elements ที่จะแสดงเมื่อผ่านการตรวจสอบ
 * * หากไม่ระบุ allowedRoles จะถือว่าต้องการเพียงแค่ "Login แล้ว" (Authenticated)
 */
function RoleGuard({ allowedRoles, children }) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  // 1. ถ้ายังไม่ได้ Login (Unauthenticated)
  // ให้ Redirect ไปหน้า Login พร้อมเก็บตำแหน่งปัจจุบันไว้ (state: { from: location })
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. ถ้า Login แล้ว แต่มีการกำหนด allowedRoles
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.profile?.role;

    // ตรวจสอบว่า Role ของผู้ใช้อยู่ในรายการที่อนุญาตหรือไม่
    if (!userRole || !allowedRoles.includes(userRole)) {
      // ถ้า Role ไม่ตรงตามที่กำหนด ให้ Redirect ไปหน้าหลัก (Home) หรือหน้า 403 (Unauthorized)
      // ในตัวอย่างนี้เลือกพาไปหน้า Home เพื่อความเรียบง่าย
      console.log(`Access Denied: User role (${userRole}) not in allowed roles (${allowedRoles.join(', ')})`);
      
      // อาจจะเปลี่ยนไปหน้า 403 ที่คุณสร้างขึ้น
      return <Navigate to="/" replace />; 
    }
  }

  // 3. ผ่านการตรวจสอบทั้งหมด (Authenticated และ Role ถูกต้อง)
  return <>{children}</>;
}

export default RoleGuard;