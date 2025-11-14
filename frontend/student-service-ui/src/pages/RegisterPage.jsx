

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth'; 

function RegisterPage() {

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await registerUser(formData);
            
            alert('สมัครสมาชิกสำเร็จ! คุณถูกลงทะเบียนในฐานะนักศึกษา กรุณาเข้าสู่ระบบ');
            navigate('/login'); 

        } catch (err) {
            console.error("Registration failed:", err);
            
            let errorMessage = "การสมัครสมาชิกไม่สำเร็จ";
            if (err.username) {
                errorMessage = `ชื่อผู้ใช้: ${err.username[0]}`;
            } else if (err.password) {
                errorMessage = `รหัสผ่าน: ${err.password[0]}`;
            } else if (err.detail) {
                errorMessage = err.detail;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h1>สมัครสมาชิก (Register)</h1>
            <p style={{ color: 'blue', border: '1px solid #99d', padding: '10px', borderRadius: '4px' }}>
                *ผู้ใช้ใหม่ทั้งหมดจะถูกลงทะเบียนในฐานะนักศึกษา (STUDENT)
            </p>
            {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>Error: {error}</p>}

            <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
                
            
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>ชื่อผู้ใช้ (Username)</label>
                    <input 
                        type="text" 
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                </div>

           
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>รหัสผ่าน (Password)</label>
                    <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                </div>

             
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>ชื่อจริง (First Name)</label>
                    <input 
                        type="text" 
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                </div>

            
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>นามสกุล (Last Name)</label>
                    <input 
                        type="text" 
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                    />
                </div>
                
        
                <button 
                    type="submit" 
                    disabled={loading}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        backgroundColor: loading ? '#999' : '#28a745', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: loading ? 'not-allowed' : 'pointer' 
                    }}
                >
                    {loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิก'}
                </button>
            </form>
            
            <p style={{ textAlign: 'center', marginTop: '15px' }}>
                มีบัญชีอยู่แล้ว? <a href="/login">เข้าสู่ระบบ</a>
            </p>
        </div>
    );
}

export default RegisterPage;