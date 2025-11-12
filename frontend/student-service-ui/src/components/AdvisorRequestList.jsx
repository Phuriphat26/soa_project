import React, { useState, useEffect } from 'react';
import { fetchAllRequests, updateRequestStatus } from '../api/requests';

function AdvisorRequestList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false); // State สำหรับป้องกันการคลิกซ้ำ

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
        const actionText = newStatus === 'Approved' ? 'อนุมัติ' : 'ปฏิเสธ';
        
        // ใช้ window.confirm แทน confirm() (ตามข้อกำหนดของ React)
        const isConfirmed = window.confirm(`คุณแน่ใจหรือไม่ที่จะ ${actionText} คำร้อง ID: ${requestId}?`);

        if (!isConfirmed) {
            return;
        }

        setIsUpdating(true);
        try {
            await updateRequestStatus(requestId, newStatus);
            // ถ้าสำเร็จ ให้ดึงข้อมูลใหม่มาแสดงผลทันที
            await loadRequests(); 
            // ใช้ window.alert แทน alert() (ตามข้อกำหนดของ React)
            window.alert(`${actionText} คำร้อง ID: ${requestId} สำเร็จแล้ว!`);
        } catch (err) {
            console.error(`Error updating status to ${newStatus}:`, err);
            window.alert(`เกิดข้อผิดพลาดในการ ${actionText} คำร้อง: ${err.detail || 'โปรดตรวจสอบสิทธิ์และสถานะคำร้อง'}`);
        } finally {
            setIsUpdating(false);
        }
    };


    if (loading) {
        return <p>กำลังโหลดรายการคำร้องทั้งหมด...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    if (requests.length === 0) {
        return <p>ไม่มีคำร้องใดๆ ที่รอการดำเนินการในขณะนี้</p>;
    }
    
    // ฟังก์ชันสำหรับเปลี่ยนสีสถานะ
    const getStatusStyle = (status) => {
        let color = 'black';
        let background = '#f2f2ff';
        if (status === 'Pending Approval') {
            color = 'darkorange';
            background = '#fff8e1';
        } else if (status === 'Approved') {
            color = 'darkgreen';
            background = '#e8f5e9';
        } else if (status === 'Rejected') {
            color = 'darkred';
            background = '#ffebee';
        }
        return { color, background, padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' };
    };

    return (
        <div>
            <p>รายการคำร้องที่รอการดำเนินการทั้งหมด: <strong>{requests.length} รายการ</strong></p>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                    <tr style={{ background: '#0056b3', color: 'white' }}>
                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>ID</th>
                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>สถานะ</th>
                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>ประเภทคำร้อง</th>
                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>ผู้ยื่นคำร้อง (Student)</th>
                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>รายละเอียด</th>
                        <th style={{ border: '1px solid #ddd', padding: '10px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(req => (
                        <tr key={req.id} style={{ background: req.status === 'Pending Approval' ? '#fffdee' : 'white' }}>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>{req.id}</td>
                            <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                                <span style={getStatusStyle(req.status)}>{req.status}</span>
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                {req.request_type.name}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                {req.student.first_name} {req.student.last_name} ({req.student.username})
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '10px', fontSize: 'small' }}>
                                {req.details.substring(0, 70)}...
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                                <button 
                                    onClick={() => handleUpdateStatus(req.id, 'Approved')}
                                    style={{ 
                                        padding: '5px 10px', 
                                        background: 'green', 
                                        color: 'white', 
                                        border: 'none', 
                                        cursor: 'pointer', 
                                        borderRadius: '3px',
                                        marginRight: '5px' 
                                    }}
                                    disabled={req.status !== 'Pending Approval' || isUpdating}
                                >
                                    {isUpdating ? 'กำลัง...' : 'อนุมัติ'}
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(req.id, 'Rejected')}
                                    style={{ 
                                        padding: '5px 10px', 
                                        background: 'darkred', 
                                        color: 'white', 
                                        border: 'none', 
                                        cursor: 'pointer', 
                                        borderRadius: '3px' 
                                    }}
                                    disabled={req.status !== 'Pending Approval' || isUpdating}
                                >
                                    ปฏิเสธ
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