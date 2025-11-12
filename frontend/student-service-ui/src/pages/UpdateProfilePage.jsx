import React, { useState, useEffect } from 'react';
import useAuthStore from '../stores/authStore.js'; // ⭐️ ใช้ .js
import axiosClient from '../api/axiosClient.js'; // ⭐️ ใช้ .js

/**
 * Component สำหรับหน้าแก้ไขข้อมูลส่วนตัว (Update Profile Page)
 * อนุญาตให้ผู้ใช้แก้ไข ชื่อ, นามสกุล, และอีเมล
 */
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

    // 1. โหลดข้อมูลผู้ใช้ปัจจุบันลงในฟอร์มเมื่อ Component ถูกโหลด
    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
            });
        }
    }, [user]);

    // การจัดการการเปลี่ยนแปลงของฟอร์ม
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setSuccessMessage('');
        setErrorMessage('');
    };

    // การส่งฟอร์มเพื่อแก้ไขข้อมูล
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            // API Call: PATCH /users/me/ เพื่ออัพเดทข้อมูลผู้ใช้
            // เราใช้ PATCH เพื่อส่งเฉพาะฟิลด์ที่มีการเปลี่ยนแปลง
            const response = await axiosClient.patch(`/users/me/`, {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                // ไม่ส่ง username เพราะไม่สามารถแก้ไขได้
            });

            // 2. อัพเดทข้อมูลผู้ใช้ใน Global Store ด้วยข้อมูลใหม่ที่ได้รับจาก Backend
            // (Backend ควรคืนค่า User object ที่อัพเดทแล้วมาให้)
            setUser({
                ...user, // เก็บ token เดิมไว้
                ...response.data, // ใช้ข้อมูล User ใหม่
            });
            
            setSuccessMessage('อัพเดทข้อมูลส่วนตัวสำเร็จแล้ว!');

        } catch (error) {
            console.error("Profile update failed:", error);
            const msg = error.response?.data?.detail || 
                        error.response?.data?.email?.[0] || 
                        "ไม่สามารถอัพเดทข้อมูลได้ โปรดลองอีกครั้ง";
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div style={{ padding: '20px', color: 'red' }}>ไม่พบข้อมูลผู้ใช้ โปรดเข้าสู่ระบบ</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
                แก้ไขข้อมูลส่วนตัว
            </h1>

            <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                
                <div style={{ marginBottom: '15px' }}>
                    <label style={formLabelStyle}>ชื่อผู้ใช้ (Username):</label>
                    <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{user.username}</p>
                    <small style={{ color: '#888' }}>* ไม่สามารถแก้ไขได้</small>
                </div>
                
                <div style={formGroupStyle}>
                    <label htmlFor="first_name" style={formLabelStyle}>ชื่อ:</label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                </div>

                <div style={formGroupStyle}>
                    <label htmlFor="last_name" style={formLabelStyle}>นามสกุล:</label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                </div>

                <div style={formGroupStyle}>
                    <label htmlFor="email" style={formLabelStyle}>อีเมล:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    />
                </div>

                {successMessage && (
                    <div style={successMessageStyle}>{successMessage}</div>
                )}
                {errorMessage && (
                    <div style={errorMessageStyle}>{errorMessage}</div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={buttonStyle(loading)}
                >
                    {loading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
            </form>
            
            <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ccc' }}>
                <p><strong>Role ปัจจุบัน:</strong> {user.profile?.role}</p>
            </div>
        </div>
    );
}

// Inline Styles
const formGroupStyle = {
    marginBottom: '15px',
};

const formLabelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
};

const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontSize: '16px'
};

const buttonStyle = (loading) => ({
    width: '100%',
    padding: '10px',
    backgroundColor: loading ? '#999' : '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '16px',
    marginTop: '10px'
});

const successMessageStyle = {
    padding: '10px',
    marginBottom: '15px',
    backgroundColor: '#d4edda',
    color: '#155724',
    border: '1px solid #c3e6cb',
    borderRadius: '4px',
};

const errorMessageStyle = {
    padding: '10px',
    marginBottom: '15px',
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: '1px solid #f5c6cb',
    borderRadius: '4px',
};

export default UpdateProfilePage;