// ไฟล์: src/pages/LoginPage.jsx

import React, { useState, useEffect } from 'react'; // 👈 1. เพิ่ม useEffect
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { loginUser } from '../api/auth'; 

function LoginPage() {
  const [username, setUsername] = useState(''); // 👈 แก้ไขเป็นค่าว่าง
  const [password, setPassword] = useState(''); // 👈 แก้ไขเป็นค่าว่าง
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); 
  
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  // ⭐️ 2. ย้าย Logic การ Redirect มาไว้ใน useEffect
  useEffect(() => {
    // ถ้ามีการ Login อยู่แล้ว (user มีค่า) ให้ Redirect
    if (user) {
      // ดึงหน้าที่ควรไป (อาจจะมาจาก /login หรือ /)
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]); // 👈 ให้ Hook นี้ทำงานเมื่อ user เปลี่ยน


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userData = await loginUser(username, password);
      
      // 1. เก็บข้อมูลผู้ใช้และ token ลงใน Store (เรียกใช้ Logic ใน authStore.js)
      await setUser(userData); // 👈 เพิ่ม await เพื่อรอให้ setUser ทำงานเสร็จ
      
      // 2. Redirect ไปยังหน้าที่ต้องการ (ย้าย Logic มาจาก useEffect ไม่ได้ เพราะนี่คือหลัง Submit)
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });

    } catch (err) {
      // จัดการ Error เช่น username/password ไม่ถูกต้อง
      const errorMessage = err.detail || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ⭐️ 3. ถ้า user มีค่าแล้ว (กำลังจะ Redirect) ให้แสดง Loading
  //    ป้องกันการกระพริบเห็นฟอร์ม Login
  if (user) {
    return <div style={{ padding: '20px' }}>กำลังพากลับไปหน้าเดิม...</div>;
  }

  // ⭐️ 4. คืนค่าฟอร์ม Login ตามปกติ (ถ้า user ยังไม่มีค่า)
  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h2>เข้าสู่ระบบ</h2>
      {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>Error: {error}</p>}
      
      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ชื่อผู้ใช้ (Username)</label>
          <input 
            type="text" 
            id="username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>รหัสผ่าน (Password)</label>
          <input 
            type="password" 
            id="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: loading ? '#999' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: loading ? 'not-allowed' : 'pointer' 
          }}
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;