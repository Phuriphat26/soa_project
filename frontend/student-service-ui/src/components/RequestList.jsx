import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchRequests } from '../api/requests';


function RequestList({ filterStatus }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 


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

  
   const filteredRequests = Array.isArray(requests) 
    ? requests.filter(req => {
        if (!filterStatus || filterStatus === 'All') {
          return true; 
        }
        return req.status === filterStatus; 
      })
    : [];


  if (loading) return <p>กำลังโหลดรายการคำร้อง...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>; 

  return (
   
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
                  onClick={(e) => e.stopPropagation()} 
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