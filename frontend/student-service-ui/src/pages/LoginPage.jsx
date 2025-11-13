// ไฟล์: src/pages/LoginPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { loginUser } from '../api/auth';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userData = await loginUser(username, password);
      await setUser(userData);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err.detail || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    // ⭐️ ใช้ .container เพื่อให้มี padding สวยงาม
    return <div className="container">กำลังพากลับไปหน้าเดิม...</div>;
  }

  return (
    // ⭐️ 1. เปลี่ยน div รอบนอกสุดให้เป็น "card" และจัดกลางหน้าจอ
    <div
      className="card"
      style={{ maxWidth: '450px', margin: '40px auto' }}
    >
      {/* ⭐️ 2. เพิ่ม .card-header สีฟ้าอ่อนสำหรับหัวข้อ */}
      <div className="card-header">
        <h2>เข้าสู่ระบบ</h2>
      </div>

      {/* ⭐️ 3. เนื้อหาฟอร์มอยู่ใน .card-body */}
      <div className="card-body">
        {/* ⭐️ 4. เปลี่ยน p สีแดง เป็น .alert .alert-danger */}
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* ⭐️ 5. ใช้ .form-group สำหรับจัดกลุ่ม label และ input */}
          <div className="form-group">
            <label htmlFor="username">ชื่อผู้ใช้ (Username)</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-control" // ⭐️ 6. ใช้ .form-control
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน (Password)</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-control" // ⭐️ 6. ใช้ .form-control
            />
          </div>

          {/* ⭐️ 7. เปลี่ยน button เป็น .btn .btn-primary .btn-block */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;