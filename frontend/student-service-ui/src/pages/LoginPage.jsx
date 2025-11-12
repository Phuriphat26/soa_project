import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // 👈 Import useLocation
import useAuthStore from '../stores/authStore';
import { loginUser } from '../api/auth'; // สมมติว่ามีไฟล์นี้

function LoginPage() {
  const [username, setUsername] = useState('student01'); // ค่าเริ่มต้นสำหรับทดสอบ
  const [password, setPassword] = useState('password123'); // ค่าเริ่มต้นสำหรับทดสอบ
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); // 👈 ประกาศใช้งาน
  
  // ดึงฟังก์ชัน setUser และ user จาก Store
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  // ถ้ามีการ Login อยู่แล้ว ให้ Redirect ไป Dashboard
  if (user) {
    // ใช้ navigate แทน return navigate(...) เพื่อหลีกเลี่ยง Warning
    navigate('/', { replace: true });
    return null; // ต้อง return null เพื่อไม่ให้เกิดการ render ซ้ำซ้อน
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userData = await loginUser(username, password);
      
      // 1. เก็บข้อมูลผู้ใช้และ token ลงใน Store
      setUser(userData);
      
      // 2. Redirect ไปหน้าเดิมที่ผู้ใช้พยายามเข้า (ถ้ามี) หรือไปหน้าหลัก
      const from = location.state?.from?.pathname || '/'; // ใช้ location ที่ประกาศไว้
      navigate(from, { replace: true });

    } catch (err) {
      // API Login ล้มเหลว
      console.error("Login Failed:", err);
      // ตรวจสอบโครงสร้าง Error จาก API เพื่อแสดงผลที่เหมาะสม
      if (err.response && err.response.status === 401) {
          setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      } else {
          setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>เข้าสู่ระบบ</h1>
      
      {error && (
        <p style={{ color: 'red', textAlign: 'center', marginBottom: '15px', padding: '10px', backgroundColor: '#fee', borderRadius: '4px' }}>
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
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
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;