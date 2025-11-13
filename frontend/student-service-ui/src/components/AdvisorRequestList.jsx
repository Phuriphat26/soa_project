import React, { useState, useEffect } from 'react';
// ⭐️ 1. Import deleteRequest
import { fetchAllRequests, updateRequestStatus, deleteRequest } from '../api/requests';
import { useNavigate } from 'react-router-dom';

function AdvisorRequestList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false); 
    const navigate = useNavigate(); 

    // ฟังก์ชันดึงข้อมูลหลัก
    const loadRequests = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAllRequests();
            setRequests(data); 
        } catch (err) {
            console.error("Failed to fetch all requests:", err);
            setError("ไม่สามารถดึงรายการคำร้องทั้งหมดได้");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);
    
    // ฟังก์ชันสำหรับจัดการการอนุมัติ/ปฏิเสธ
    const handleUpdateStatus = async (requestId, newStatus) => {
        const actionText = newStatus === 'APPROVED' ? 'อนุมัติ' : 'ปฏิเสธ';
        
        const isConfirmed = window.confirm(`คุณแน่ใจหรือไม่ที่จะ ${actionText} คำร้อง ID: ${requestId}?`);

        if (!isConfirmed) {
            return;
        }

        setIsUpdating(true);
        try {
            await updateRequestStatus(requestId, newStatus);
            await loadRequests(); 
            alert(`คำร้อง ID ${requestId} ถูก ${actionText} เรียบร้อยแล้ว`);
        } catch (err) {
            console.error("Status update failed:", err);
            const errorMessage = err.response?.data?.detail || err.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์';
            alert(`ไม่สามารถ ${actionText} คำร้องได้: ${errorMessage}`);
        } finally {
            setIsUpdating(false);
        }
    };

    // ⭐️ 2. เพิ่มฟังก์ชันสำหรับลบคำร้อง
    const handleDelete = async (requestId) => {
        const isConfirmed = window.confirm(`คุณแน่ใจหรือไม่ที่จะลบคำร้อง ID: ${requestId}? การกระทำนี้ไม่สามารถย้อนกลับได้`);

        if (!isConfirmed) {
            return;
        }

        setIsUpdating(true); // ใช้ state 'isUpdating' ร่วมกันเพื่อ disable ปุ่ม
        try {
            await deleteRequest(requestId);
            // โหลดข้อมูลใหม่
            await loadRequests(); 
            alert(`คำร้อง ID ${requestId} ถูกลบเรียบร้อยแล้ว`);
        } catch (err) {
            console.error("Delete failed:", err);
            const errorMessage = err.response?.data?.detail || err.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์';
            alert(`ไม่สามารถลบคำร้องได้: ${errorMessage}`);
        } finally {
            setIsUpdating(false);
        }
    };
    
    // ฟังก์ชันนำทางไปหน้า Detail
    const handleRowClick = (requestId) => {
        navigate(`/requests/${requestId}`);
    };

    if (loading) return <p>กำลังโหลดรายการคำร้อง...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
    if (requests.length === 0) return <p>ไม่พบรายการคำร้องที่ต้องดำเนินการ</p>;

    return (
        <div style={{ padding: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '14px' }}>
                <thead>
                    <tr style={{ background: '#f2f2f2' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ผู้ยื่น</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ประเภทคำร้อง</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>สถานะ</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(req => (
                        <tr key={req.id}>
                            <td 
                                style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer', color: 'blue', fontWeight: 'bold' }}
                                onClick={() => handleRowClick(req.id)} 
                            >
                                {req.id}
                            </td>
                            
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {req.user?.first_name} {req.user?.last_name || '(ไม่มีข้อมูลผู้ใช้)'}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {req.request_type?.name || '(ไม่มีข้อมูลประเภท)'}
                            </td>
                            
                            <td style={{ border: '1px solid #ddd', padding: '8px', color: req.status === 'Pending Approval' ? 'orange' : (req.status === 'Rejected' ? 'red' : 'green') }}>
                                {req.status}
                            </td>

                            {/* ⭐️ 3. แก้ไขคอลัมน์ "จัดการ" */}
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {req.status === 'Pending Approval' ? (
                                    <>
                                        {/* ปุ่ม อนุมัติ */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req.id, 'APPROVED'); }}
                                            style={{ 
                                                padding: '5px 10px', 
                                                background: 'darkgreen', 
                                                color: 'white', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                borderRadius: '3px',
                                                marginRight: '5px' 
                                            }}
                                            disabled={isUpdating}
                                        >
                                            {isUpdating ? 'กำลัง...' : 'อนุมัติ'}
                                        </button>
                                        
                                        {/* ปุ่ม ปฏิเสธ */}
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(req.id, 'REJECTED'); }}
                                            style={{ 
                                                padding: '5px 10px', 
                                                background: 'darkred', 
                                                color: 'white', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                borderRadius: '3px' 
                                            }}
                                            disabled={isUpdating}
                                        >
                                            ปฏิเสธ
                                        </button>
                                    </>
                                ) : (
                                    <span onClick={() => handleRowClick(req.id)} style={{ cursor: 'pointer', color: 'blue', marginRight: '5px' }}>ดูรายละเอียด</span>
                                )}
                                
                                {/* ปุ่ม "ลบ" (จะแสดงผลทุกสถานะ) */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(req.id); }}
                                    style={{ 
                                        padding: '5px 10px', 
                                        background: '#B22222', // สีแดงที่เข้มกว่า 'ปฏิเสธ'
                                        color: 'white', 
                                        border: 'none', 
                                        cursor: 'pointer', 
                                        borderRadius: '3px',
                                        marginLeft: '5px' // เพิ่มระยะห่าง
                                    }}
                                    disabled={isUpdating}
                                >
                                    ลบ
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdvisorRequestList;