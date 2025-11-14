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

      const response = await loginUser(username, password);
      
      console.log('✅ Login success:', response);
     
      await setUser(response);
      

      if (response.user) {
        await setUser(response.user);
      }
      
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err.detail || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      setError(errorMessage);
      console.error('❌ Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <div className="container">กำลังพากลับไปหน้าเดิม...</div>;
  }

  return (
    <div
      className="card"
      style={{ maxWidth: '450px', margin: '40px auto' }}
    >
      <div className="card-header">
        <h2>เข้าสู่ระบบ</h2>
      </div>

      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">ชื่อผู้ใช้ (Username)</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-control"
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
              className="form-control"
            />
          </div>

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