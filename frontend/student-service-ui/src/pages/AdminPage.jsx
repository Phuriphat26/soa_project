// ไฟล์: src/pages/AdminPage.jsx

import React from 'react';
import useAuthStore from '../stores/authStore';
import AdminUserList from '../components/AdminUserList'; // ⭐️ Import Component ที่กำลังจะสร้าง

function AdminPage() {
    const user = useAuthStore((state) => state.user);

    if (!user) return null; // RoleGuard ควรจะป้องกันไว้แล้ว

    return (
        <div style={{ padding: '20px' }}>
            <h1>หน้าผู้ดูแลระบบ (User Management)</h1>
            <p>
                <strong>ผู้เข้าใช้งาน:</strong> {user.first_name} ({user.profile?.role})
                <span style={{ color: 'red', marginLeft: '10px' }}>*ใช้หน้านี้เพื่อเปลี่ยน Role จาก STUDENT เป็น STAFF</span>
            </p>
            <hr />
            
            {/* Component หลักสำหรับแสดงรายการและจัดการผู้ใช้ */}
            <AdminUserList />

        </div>
    );
}

export default AdminPage;