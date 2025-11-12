import React, { useState, useEffect } from 'react';
import { fetchRequests } from '../api/requests';

function RequestList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadRequests = async () => {
            try {
                const data = await fetchRequests();
                setRequests(data);
            } catch (err) {
                console.error("Failed to fetch requests:", err);
                setError("ไม่สามารถดึงรายการคำร้องได้");
            } finally {
                setLoading(false);
            }
        };

        loadRequests();
    }, []);

    if (loading) {
        return <p>กำลังโหลดรายการคำร้อง...</p>;
    }

    if (error) {
        return <p style={{ color: 'red' }}>Error: {error}</p>;
    }

    if (requests.length === 0) {
        return <p>คุณยังไม่มีคำร้องที่ยื่นไว้ในระบบ</p>;
    }

    return (
        <div>
            <h2>รายการคำร้องทั้งหมด ({requests.length} รายการ)</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                    <tr style={{ background: '#f2f2f2' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>ประเภทคำร้อง</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>สถานะ</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>รายละเอียด</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(req => (
                        <tr key={req.id}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{req.id}</td>
                            {/* req.request_type เป็น object จาก Backend */}
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{req.request_type.name}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px', color: req.status === 'Pending Approval' ? 'orange' : 'green' }}>
                                {req.status}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{req.details.substring(0, 50)}...</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RequestList;