import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import AdvisorRequestList from '../components/AdvisorRequestList'; 

function AdvisorDashboard() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); 
        navigate('/login'); 
    };

    // ⭐️ แก้ไข (1): เพิ่มการตรวจสอบ loadingUser จาก store
    //เผื่อว่า user ยังเป็น null แต่กำลังโหลดอยู่
    const loadingUser = useAuthStore((state) => state.loadingUser);
    
    if (!user && loadingUser) {
        return <div style={{ padding: '20px' }}>กำลังโหลดข้อมูลผู้ใช้...</div>;
    }
    
    // ⭐️ แก้ไข (2): ถ้าโหลดจบแล้ว แต่ user ยังคงเป็น null (เช่น token หมดอายุ)
    // ให้แสดง Error หรือเด้งไปหน้า login (ในที่นี้แสดง Error)
    if (!user) {
        return (
          <div style={{ padding: '20px', color: 'red' }}>
             ไม่พบข้อมูลผู้ใช้ (Session อาจหมดอายุ) 
             <button onClick={() => window.location.href = '/login'}>
               กลับไปหน้า Login
             </button>
          </div>
        );
    }

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
                    {/* ⭐️⭐️⭐️ แก้ไข 3: ใช้ ?. เพื่อความปลอดภัย ⭐️⭐️⭐️ */}
                    <p style={{ margin: '0' }}>
                      <strong>ยินดีต้อนรับ, {user?.first_name || ''} {user?.last_name || '(ผู้ใช้)'}</strong>
                    </p>
                    <p style={{ margin: '5px 0 0 0' }}>
                      <strong>Role:</strong> {user.profile?.role}
                    </p>
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
            
            {/* ปัญหาหน้าขาว อยู่ใน Component นี้ (ไฟล์ AdvisorRequestList.jsx) */}
            <AdvisorRequestList />
            
        </div>
    );
}

export default AdvisorDashboard;