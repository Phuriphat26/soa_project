import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// 1. Import API สำหรับดึง "คำร้องของฉัน" (Path นี้ถูกต้องเทียบกับ src/components/)
import { fetchRequests } from '../api/requests';

function RequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. โหลดข้อมูลคำร้องเมื่อเปิดหน้า
  const loadMyRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRequests(); // 👈 API นี้จะดึงเฉพาะของ Student ที่ Login
      setRequests(data);
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

  // 3. ฟังก์ชันสำหรับแปลง Status เป็นสี
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'green';
      case 'Rejected':
        return 'red';
      case 'Pending':
        return 'orange';
      default:
        return 'grey';
    }
  };

  if (loading) return <p>กำลังโหลดรายการคำร้อง...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <table
      className="table table-striped table-bordered"
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
        {requests.length === 0 ? (
          <tr>
            <td colSpan="5" style={{ textAlign: 'center' }}>
              คุณยังไม่เคยยื่นคำร้องใดๆ
            </td>
          </tr>
        ) : (
          requests.map((req) => (
            <tr key={req.id}>
              <td>{req.id}</td>
              {/* ⭐️ หมายเหตุ: API (RequestSerializer) ของคุณ
                  ส่ง request_type และ user มาเป็น Object ย่อย
              */}
              <td>{req.request_type?.name || 'N/A'}</td>
              <td>
                <span
                  style={{
                    fontWeight: 'bold',
                    color: getStatusColor(req.status),
                  }}
                >
                  {req.status}
                </span>
              </td>
              <td>{new Date(req.created_at).toLocaleDateString('th-TH')}</td>
              <td>
                <Link
                  to={`/requests/${req.id}`}
                  className="btn btn-info btn-sm"
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