import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCategories, fetchRequestTypes, submitNewRequest } from '../api/requests';

function SubmitRequestPage() {
    const navigate = useNavigate();
    
    // State สำหรับ Dropdown และ Input
    const [categories, setCategories] = useState([]);      
    const [requestTypes, setRequestTypes] = useState([]);  
    
    const [selectedCategory, setSelectedCategory] = useState('');    
    const [selectedRequestType, setSelectedRequestType] = useState(''); 
    const [details, setDetails] = useState('');            
    
    // State สำหรับการจัดการสถานะ
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // useEffect: ดึงรายการหมวดหมู่หลักเมื่อโหลดหน้า
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const cats = await fetchCategories();
                setCategories(cats);
            } catch (err) {
                console.error("Failed to load initial data:", err);
                setError("ไม่สามารถดึงข้อมูลหมวดหมู่ได้");
            } finally {
                setLoading(false); 
            }
        };
        loadInitialData();
    }, []);

    // Logic สำหรับการเลือกหมวดหมู่: ดึง RequestTypes ตาม Category ID
    const handleCategoryChange = async (e) => {
        const categoryId = e.target.value;
        setSelectedCategory(categoryId);
        setSelectedRequestType(''); 
        setRequestTypes([]); 

        if (categoryId) {
            try {
                const types = await fetchRequestTypes(categoryId);
                setRequestTypes(types);
            } catch (err) {
                console.error("Failed to load request types:", err);
                setError("ไม่สามารถดึงประเภทคำร้องได้");
            }
        }
    };

    // Logic สำหรับการยื่นคำร้อง (POST /api/requests/)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (!selectedRequestType || !details) {
            setError('กรุณาเลือกประเภทคำร้องและใส่รายละเอียดให้ครบถ้วน');
            return;
        }

        try {
            await submitNewRequest(selectedRequestType, details);
            
            setSuccess(true);
            setDetails(''); 
            setSelectedRequestType(''); 
            setSelectedCategory(''); 

        } catch (err) {
            console.error("Submission failed:", err); // err คือ Object ที่ Django ส่งมา
            
            // ⭐️⭐️⭐️ (โค้ดที่อัปเดต) ⭐️⭐️⭐️
            // DRF Validation Errors (400) จะมาในรูปแบบ { field_name: ["message"] }
            // เราจะดึงข้อความ Error แรกที่เจอออกมาแสดง
            let specificErrorMessage = '';
            if (err && typeof err === 'object' && !Array.isArray(err)) {
                // วนลูปหา Key แรก (เช่น "request_type", "user", "details")
                const errorKey = Object.keys(err)[0]; 
                if (errorKey && Array.isArray(err[errorKey]) && err[errorKey].length > 0) {
                    // ดึงข้อความแรกออกมา
                    specificErrorMessage = `${errorKey}: ${err[errorKey][0]}`;
                } else if (err.detail) {
                    // (เผื่อไว้สำหรับ Error แบบ 401 หรือ 403)
                    specificErrorMessage = err.detail;
                }
            }
            
            setError(`ยื่นคำร้องไม่สำเร็จ: ${specificErrorMessage || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์'}`);
            // ⭐️⭐️⭐️ จบการแก้ไข ⭐️⭐️⭐️
        }
    };

    // ส่วนแสดงผล (Render)
    if (loading) return <div style={{ padding: '20px' }}>กำลังโหลดแบบฟอร์ม...</div>;

    // ⭐️ (ปรับปรุง) แสดง Error แม้ว่าจะ Success แล้ว (เผื่อกด Submit ซ้ำ)
    if (error) {
        // ไม่ต้องเช็ค !success
    }

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>ยื่นคำร้องใหม่</h1>
            
            {success && (
                <div style={{ background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb', padding: '10px', marginBottom: '20px' }}>
                    ยื่นคำร้องสำเร็จแล้ว! <button onClick={() => navigate('/')}>กลับสู่ Dashboard</button>
                </div>
            )}
            
            {/* ⭐️ (เพิ่ม) แสดง Error ที่ดักจับได้ ⭐️ */}
            {error && (
                <div style={{ background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', padding: '10px', marginBottom: '20px' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* 1. เลือกหมวดหมู่หลัก */}
                <div>
                    <label style={{ display: 'block', marginBottom: '5px' }}>หมวดหมู่หลัก:</label>
                    <select 
                        value={selectedCategory} 
                        onChange={handleCategoryChange} 
                        style={{ width: '100%', padding: '8px' }}
                        required
                        disabled={success} // ⭐️ (ปรับปรุง) Disable หลังยื่นสำเร็จ
                    >
                        <option value="">-- กรุณาเลือกหมวดหมู่ --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                {/* 2. เลือกประเภทคำร้อง */}
                {selectedCategory && (
                    <div style={{ marginTop: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>ประเภทคำร้อง (ฟอร์ม):</label>
                        <select 
                            value={selectedRequestType} 
                            onChange={(e) => setSelectedRequestType(e.target.value)} 
                            style={{ width: '100%', padding: '8px' }}
                            required
                            disabled={requestTypes.length === 0 || success} // ⭐️ (ปรับปรุง)
                        >
                            <option value="">-- กรุณาเลือกประเภทคำร้อง --</option>
                            {requestTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                        {requestTypes.length === 0 && !success && <p style={{ color: 'gray', fontSize: 'small' }}>*ไม่พบฟอร์มในหมวดหมู่นี้</p>}
                    </div>
                )}

                {/* 3. รายละเอียดคำร้อง */}
                <div style={{ marginTop: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>รายละเอียดเพิ่มเติม:</label>
                    <textarea 
                        value={details} 
                        onChange={(e) => setDetails(e.target.value)} 
                        rows="5"
                        style={{ width: '100%', padding: '8px', resize: 'vertical' }}
                        required
                        disabled={success} // ⭐️ (ปรับปรุง)
                        placeholder="เช่น ขอถอนรายวิชา SOA101 เนื่องจาก..."
                    />
                </div>

                <button 
                    type="submit" 
                    style={{ 
                        marginTop: '20px', 
                        padding: '10px 20px', 
                        background: 'blue', 
                        color: 'white', 
                        border: 'none', 
                        cursor: 'pointer',
                        opacity: success ? 0.5 : 1 // ⭐️ (ปรับปรุง)
                    }}
                    disabled={success} // ⭐️ (ปรับปรุง)
                >
                    ส่งคำร้อง
                </button>
            </form>
        </div>
    );
}

export default SubmitRequestPage;