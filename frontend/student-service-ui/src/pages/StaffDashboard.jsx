import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAllRequests } from '../api/requests'; 

function StaffDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  const loadAllRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching all requests:', err);
      setError('ไม่สามารถดึงข้อมูลคำร้องทั้งหมดได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllRequests();
  }, []);


  const getStatusStyle = (status) => {
    
    switch (status) {
      case 'Approved':
        return { backgroundColor: '#d4edda', color: '#155724', padding: '3px 8px', borderRadius: '4px' };
      case 'Rejected':
        return { backgroundColor: '#f8d7da', color: '#721c24', padding: '3px 8px', borderRadius: '4px' };
      case 'Pending Approval':
        return { backgroundColor: '#fff3cd', color: '#856404', padding: '3px 8px', borderRadius: '4px' };
      case 'In Progress':
        return { backgroundColor: '#cce5ff', color: '#004085', padding: '3px 8px', borderRadius: '4px' };
      default:
        return { backgroundColor: '#e9ecef', color: '#212529', padding: '3px 8px', borderRadius: '4px' };
    }
  };

  if (loading) return <p>กำลังโหลดรายการคำร้องทั้งหมด...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="card"> 
      <div className="card-header">
        <h3>จัดการคำร้อง (ทั้งหมด)</h3>
      </div>
      <div className="card-body">
        <table
          className="table table-hover table-bordered"
        >
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>ผู้ยื่น (Student)</th> 
              <th>ประเภทคำร้อง</th>
              <th>สถานะ</th>
              <th>วันที่ยื่น</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted" style={{ padding: '20px' }}>
                  ไม่พบคำร้องในระบบ
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr 
                  key={req.id} 
                  onClick={() => navigate(`/requests/${req.id}`)} 
                  style={{ cursor: 'pointer' }}
                >
                  <td>#{req.id}</td>
                  <td>
                 
                    {req.user?.first_name} {req.user?.last_name}
                  </td>
                  <td>{req.request_type?.name || 'N/A'}</td>
                  <td>
                    <span style={getStatusStyle(req.status)}>
                      {req.status}
                    </span>
                  </td>
                  <td>{new Date(req.created_at).toLocaleDateString('th-TH')}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        navigate(`/requests/${req.id}`);
                      }}
                    >
                      จัดการ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StaffDashboard;