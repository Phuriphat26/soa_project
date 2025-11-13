// ไฟล์: src/components/AdminUserList.jsx

import React, { useState, useEffect } from 'react';
import { fetchAllUsers, updateRole } from '../api/requests';

function AdminUserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingUserId, setUpdatingUserId] = useState(null); 

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllUsers();
            setUsers(data || []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
            setError("ไม่สามารถดึงรายการผู้ใช้ทั้งหมดได้ (โปรดตรวจสอบ Backend/สิทธิ์ Admin)");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleUpdateRole = async (userId, currentRole, newRole) => {
        if (currentRole === newRole) {
            alert(`ผู้ใช้รายนี้มี Role เป็น ${newRole} อยู่แล้ว`);
            return;
        }

        const isConfirmed = window.confirm(`คุณแน่ใจหรือไม่ที่จะเปลี่ยน Role ของ User ID: ${userId} จาก ${currentRole} เป็น ${newRole}?`);

        if (!isConfirmed) {
            return;
        }

        setUpdatingUserId(userId);
        try {
            // เรียก API เพื่อเปลี่ยน Role
            const updatedUser = await updateRole(userId, newRole);
            
            // อัปเดตรายการ User ใน State ทันที
            setUsers(users.map(user => 
                user.id === updatedUser.id ? updatedUser : user
            ));

        } catch (err) {
            console.error("Failed to update role:", err);
            alert(`ไม่สามารถเปลี่ยน Role ได้: ${err.detail || "เกิดข้อผิดพลาด"}`);
        } finally {
            setUpdatingUserId(null);
        }
    };

    if (loading) return <p>กำลังโหลดรายการผู้ใช้...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div style={{ padding: '10px' }}>
            <h3>รายการผู้ใช้ทั้งหมด ({users.length} รายการ)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px' }}>
                <thead>
                    <tr style={{ background: '#f2f2f2' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Username</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ชื่อ-สกุล</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role ปัจจุบัน</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action (เปลี่ยน Role)</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.id}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.username}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.first_name} {user.last_name}</td>
                            {/* ⭐️ ต้องตรวจสอบว่ามี profile ก่อนเข้าถึง role */}
                            <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>{user.profile?.role || 'N/A'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button 
                                    onClick={() => handleUpdateRole(user.id, user.profile?.role, 'STAFF')}
                                    disabled={user.profile?.role === 'STAFF' || updatingUserId === user.id}
                                    style={{ padding: '5px 10px', background: '#ffc107', color: 'black', border: 'none', cursor: 'pointer', borderRadius: '3px', marginRight: '5px' }}
                                >
                                    {updatingUserId === user.id ? 'กำลัง...' : 'เป็น STAFF'}
                                </button>
                                <button 
                                    onClick={() => handleUpdateRole(user.id, user.profile?.role, 'STUDENT')}
                                    disabled={user.profile?.role === 'STUDENT' || updatingUserId === user.id}
                                    style={{ padding: '5px 10px', background: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '3px' }}
                                >
                                    เป็น STUDENT
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminUserList;