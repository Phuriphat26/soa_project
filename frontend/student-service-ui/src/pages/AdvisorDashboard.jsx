import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
// แก้ไข: เปลี่ยนจาก '../components/AdvisorRequestlist' เป็น '../components/AdvisorRequestList'
import AdvisorRequestList from '../components/AdvisorRequestList'; // Component แสดงตารางคำร้อง

function AdvisorDashboard() {
    // ดึงข้อมูลผู้ใช้และฟังก์ชัน Logout จาก Store
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); 
        navigate('/login'); // นำทางไปยังหน้า Login หลัง Logout
    };

    // แสดงสถานะกำลังโหลดถ้าข้อมูลผู้ใช้ยังไม่มา
    if (!user) return <div style={{ padding: '20px' }}>กำลังโหลดข้อมูลผู้ใช้...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1>Dashboard อาจารย์ที่ปรึกษา/เจ้าหน้าที่</h1>
            
            <div style={{ 
                border: '1px solid #0056b3', 
                padding: '15px', 
                background: '#e0f7ff', 
                borderRadius: '5px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
            }}>
                <div>
                    <p style={{ margin: '0' }}><strong>ยินดีต้อนรับ, {user.first_name} {user.last_name}</strong></p>
                    <p style={{ margin: '5px 0 0 0' }}><strong>Role:</strong> {user.profile?.role}</p>
                </div>
                <button 
                    onClick={handleLogout} 
                    style={{ 
                        background: '#0056b3', 
                        color: 'white', 
                        border: 'none', 
                        padding: '10px 15px', 
                        borderRadius: '5px', 
                        cursor: 'pointer' 
                    }}
                >
                    ออกจากระบบ
                </button>
            </div>

            <hr style={{ margin: '30px 0' }} />

            <h2>รายการคำร้องทั้งหมดที่ต้องดำเนินการ</h2>
            
            {/* Component หลักที่แสดงรายการคำร้องและการจัดการสถานะ */}
            <AdvisorRequestList />
            
        </div>
    );
}

export default AdvisorDashboard;