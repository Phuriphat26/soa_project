import React, { useState, useEffect } from 'react';
import useAuthStore from '../stores/authStore.js';
import axiosClient from '../api/axiosClient.js';


function UpdateProfilePage() {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user]);


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setSuccessMessage('');
    setErrorMessage('');
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
 
      const response = await axiosClient.patch(`/users/me/`, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      });

    
      setUser({
        ...user,
        ...response.data,
      });

      setSuccessMessage('อัพเดทข้อมูลส่วนตัวสำเร็จแล้ว!');
    } catch (error) {
      console.error('Profile update failed:', error);
      const msg =
        error.response?.data?.detail ||
        error.response?.data?.email?.[0] ||
        'ไม่สามารถอัพเดทข้อมูลได้ โปรดลองอีกครั้ง';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };



  if (!user) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-danger">
            ไม่พบข้อมูลผู้ใช้ โปรดเข้าสู่ระบบ
          </div>
        </div>
      </div>
    );
  }

  return (
  
    <div className="card" style={{ maxWidth: '600px' }}>
      
      <div className="card-header">
        <h1>แก้ไขข้อมูลส่วนตัว</h1>
      </div>

  
      <div className="card-body">
        <form onSubmit={handleSubmit}>
         
          <div className="form-group">
            <label>ชื่อผู้ใช้ (Username):</label>
            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
              {user.username}
            </p>
            <small className="text-muted">* ไม่สามารถแก้ไขได้</small>
          </div>

          <div className="form-group">
            <label htmlFor="first_name">ชื่อ:</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="form-control" 
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">นามสกุล:</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="form-control" 
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">อีเมล:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-control" 
            />
          </div>

      
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}
        
          {errorMessage && (
            <div className="alert alert-danger">{errorMessage}</div>
          )}

          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-success btn-block"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        </form>

        <div
          style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #eee',
          }}
        >
          <p>
            <strong>Role ปัจจุบัน:</strong> {user.profile?.role}
          </p>
        </div>
      </div>
    </div>
  );
}



export default UpdateProfilePage;