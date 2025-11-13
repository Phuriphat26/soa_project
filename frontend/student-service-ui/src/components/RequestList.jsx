import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // ⭐️ 1. Import useNavigate
import { fetchRequests } from '../api/requests';

// ⭐️ 2. รับ prop 'filterStatus' จาก DashboardPage
function RequestList({ filterStatus }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // ⭐️ 3. (แนะนำ) ใช้ useNavigate เพื่อให้คลิกทั้งแถวได้

  // (โค้ดโหลดข้อมูลเหมือนเดิม)
  const loadMyRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRequests();
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching my requests:', err);
      setError('ไม่สามารถดึงข้อมูลคำร้องได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyRequests();
  }, []);

  // ⭐️ 4. แก้ไขฟังก์ชัน getStatus (ใช้ Style object ดีกว่า)
  //    (เพื่อให้ตรงกับสถานะจริง: 'Pending Approval', 'In Progress' ฯลฯ)
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return { 
          backgroundColor: '#d4edda', 
          color: '#155724', 
          padding: '3px 8px', 
          borderRadius: '4px' 
        };
      case 'Rejected':
        return { 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '3px 8px', 
          borderRadius: '4px' 
        };
      case 'Pending Approval':
        return { 
          backgroundColor: '#fff3cd', 
          color: '#856404', 
          padding: '3px 8px', 
          borderRadius: '4px' 
        };
      case 'In Progress':
        return { 
          backgroundColor: '#cce5ff', 
          color: '#004085', 
          padding: '3px 8px', 
          borderRadius: '4px' 
        };
      default:
        return { 
          backgroundColor: '#e9ecef', 
          color: '#212529', 
          padding: '3px 8px', 
          borderRadius: '4px' 
        };
    }
  };

  // ⭐️ 5. สร้าง Array ใหม่ที่กรองแล้ว (จาก prop ที่ได้รับมา)
  const filteredRequests = (requests || []).filter(req => {
    if (!filterStatus || filterStatus === 'All') {
      return true; // ถ้าไม่มีตัวกรอง หรือ เลือก 'All' ให้แสดงทั้งหมด
    }
    return req.status === filterStatus; // กรองตามสถานะที่เลือก
  });


  if (loading) return <p>กำลังโหลดรายการคำร้อง...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>; // (ใช้ alert สวยกว่า)

  return (
    // ⭐️ 6. (แนะนำ) ใช้ .table-hover เพื่อให้สวยงาม
    <table
      className="table table-hover table-bordered"
      style={{ marginTop: '20px' }}
    >
      <thead className="table-dark">
        <tr>
          <th>ID</th>
          <th>ประเภทคำร้อง</th>
          <th>สถานะ</th>
          <th>วันที่ยื่น</th>
          <th>ดูรายละเอียด</th>
        </tr>
      </thead>
      <tbody>
        {/* ⭐️ 7. ใช้ 'filteredRequests' มา .map() */}
        {filteredRequests.length === 0 ? (
          <tr>
            <td colSpan="5" className="text-center text-muted" style={{ padding: '20px' }}>
              {requests.length === 0 
                ? 'คุณยังไม่เคยยื่นคำร้องใดๆ' 
                : 'ไม่พบรายการคำร้อง (ตามตัวกรองที่เลือก)'}
            </td>
          </tr>
        ) : (
          filteredRequests.map((req) => (
            <tr 
              key={req.id} 
              // ⭐️ 8. (แนะนำ) ทำให้คลิกได้ทั้งแถว
              onClick={() => navigate(`/requests/${req.id}`)} 
              style={{ cursor: 'pointer' }}
            >
              <td>#{req.id}</td>
              <td>{req.request_type?.name || 'N/A'}</td>
              <td>
                <span style={getStatusStyle(req.status)}>
                  {req.status}
                </span>
              </td>
              <td>{new Date(req.created_at).toLocaleDateString('th-TH')}</td>
              <td>
                <Link
                  to={`/requests/${req.id}`}
                  className="btn btn-info btn-sm"
                  onClick={(e) => e.stopPropagation()} // (ป้องกันการคลิกทับซ้อน)
                >
                  ดูรายละเอียด
                </Link>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default RequestList;