import { create } from 'zustand';

// โค้ดนี้ใช้สำหรับการจัดการสถานะการ Login/Logout ทั่วทั้งแอปพลิเคชัน
const useAuthStore = create((set) => ({
    // 1. สถานะเริ่มต้น
    token: localStorage.getItem('access_token') || null, // อ่าน Token จาก Local Storage
    user: null, // ข้อมูล User ที่ Login เข้ามา

    // 2. Action: ฟังก์ชัน Login
    login: (access_token, user_data) => {
        // บันทึก Token ลง Local Storage ทันที เพื่อให้คงอยู่แม้ปิดหน้าเว็บ
        localStorage.setItem('access_token', access_token);
        
        set({ 
            token: access_token, 
            user: user_data 
        });
    },

    // 3. Action: ฟังก์ชัน Logout
    logout: () => {
        // ลบ Token ออกจาก Local Storage
        localStorage.removeItem('access_token');
        
        set({ 
            token: null, 
            user: null 
        });
    },
}));

export default useAuthStore;