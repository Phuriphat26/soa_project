import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchRequestById,
  updateRequestStatus,
  uploadAttachment,
} from '../api/requests';
import useAuthStore from '../stores/authStore';

function RequestDetailPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.profile?.role;

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ⭐️ 1. เพิ่ม State สำหรับแสดงข้อความ Success/Error (แทน alert)
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);

  const canUpdateStatus =
    userRole === 'Advisor' ||
    userRole === 'Staff (Registrar)' ||
    userRole === 'Staff (Finance)' ||
    userRole === 'Admin' || // ⭐️ เพิ่ม Admin ให้จัดการได้ด้วย
    userRole === 'Staff'; // ⭐️ เพิ่ม Staff (ทั่วไป)

  const canUploadFile =
    userRole === 'Student' && request?.status === 'Pending Approval';

  // --- Logic (เหมือนเดิม) ---
  const loadRequest = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchRequestById(requestId);
      setRequest(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch request detail:', err);
      setError('ไม่สามารถดึงรายละเอียดคำร้องนี้ได้ (โปรดตรวจสอบ ID/สิทธิ์)');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  // --- ⭐️ (ปรับปรุง) Logic การอัปเดตสถานะ (ลบ confirm/alert) ---
  const handleUpdateStatus = async (newStatus) => {
    const statusMap = {
      APPROVED: 'อนุมัติ',
      REJECTED: 'ปฏิเสธ',
      IN_PROGRESS: 'กำลังดำเนินการ',
    };
    const actionText = statusMap[newStatus] || 'อัปเดต';

    // ⭐️ (ลบ) const isConfirmed = window.confirm(...);

    // ⭐️ 2. ล้างข้อความแจ้งเตือนเก่า
    setActionSuccess(null);
    setActionError(null);
    setIsUpdating(true);

    try {
      await updateRequestStatus(requestId, newStatus);
      await loadRequest(); // โหลดข้อมูลใหม่
      // ⭐️ 3. แสดงข้อความ Success
      setActionSuccess(`คำร้อง ID ${requestId} ถูก ${actionText} เรียบร้อยแล้ว`);
    } catch (err) {
      console.error('Failed to update status:', err);
      const errorMsg =
        err.detail || JSON.stringify(err) || 'เกิดข้อผิดพลาด';
      // ⭐️ 3. แสดงข้อความ Error
      setActionError(`ไม่สามารถ ${actionText} คำร้องได้: ${errorMsg}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // --- ⭐️ (ปรับปรุง) Logic การอัปโหลดไฟล์ (ลบ alert) ---
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    // ⭐️ 2. ล้างข้อความแจ้งเตือนเก่า
    setActionSuccess(null);
    setActionError(null);

    if (!selectedFile) {
      // ⭐️ 3. แสดงข้อความ Error
      setActionError('กรุณาเลือกไฟล์ก่อนอัปโหลด');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('request', requestId);
      await uploadAttachment(requestId, formData);

      // ⭐️ 3. แสดงข้อความ Success
      setActionSuccess('อัปโหลดไฟล์สำเร็จ!');
      setSelectedFile(null);
      if (document.getElementById('file-input')) {
        document.getElementById('file-input').value = null;
      }
      loadRequest();
    } catch (err) {
      console.error('Failed to upload file:', err);
      const errorMsg =
        err.detail || JSON.stringify(err) || 'เกิดข้อผิดพลาด';
      // ⭐️ 3. แสดงข้อความ Error
      setActionError(`อัปโหลดไฟล์ไม่สำเร็จ: ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  // --- ⭐️ (คงไว้) Logic การแสดงสีสถานะ ---
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Approved':
        return {
          color: 'white',
          backgroundColor: '#28a745',
          padding: '5px 10px',
          borderRadius: '4px',
        };
      case 'Rejected':
        return {
          color: 'white',
          backgroundColor: '#dc3545',
          padding: '5px 10px',
          borderRadius: '4px',
        };
      case 'Pending Approval':
        return {
          color: '#212529',
          backgroundColor: '#ffc107',
          padding: '5px 10px',
          borderRadius: '4px',
        };
      case 'In Progress':
        return {
          color: 'white',
          backgroundColor: '#007bff',
          padding: '5px 10px',
          borderRadius: '4px',
        };
      default:
        return {
          color: '#212529',
          backgroundColor: '#e9ecef',
          padding: '5px 10px',
          borderRadius: '4px',
        };
    }
  };

  // --- ⭐️ (ปรับปรุง) Render Loading/Error ---
  if (loading) {
    return (
      <div className="card" style={{ maxWidth: '700px' }}>
        <div className="card-body text-center">
          กำลังโหลดรายละเอียดคำร้อง...
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="card" style={{ maxWidth: '700px' }}>
        <div className="card-body">
          <div className="alert alert-danger">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary mt-4"
          >
            ← กลับ
          </button>
        </div>
      </div>
    );
  }
  if (!request) {
    return (
      <div className="card" style={{ maxWidth: '700px' }}>
        <div className="card-body text-center">ไม่พบข้อมูลคำร้อง</div>
      </div>
    );
  }

  // --- ⭐️ (ปรับปรุง) Render หน้าหลัก ---
  return (
    // ⭐️ 4. ใช้ .card เป็นกรอบหลัก
    <div className="card" style={{ maxWidth: '900px' }}>
      {/* ⭐️ 5. ใช้ .card-header */}
      <div className="card-header">
        <h1>รายละเอียดคำร้อง: ID #{request.id}</h1>
      </div>

      {/* ⭐️ 6. ใช้ .card-body */}
      <div className="card-body">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary mb-4" // ⭐️ ใช้ .btn
        >
          ← กลับ
        </button>

        {/* ⭐️ 7. แสดงข้อความแจ้งเตือน (แทน alert) */}
        {actionSuccess && (
          <div className="alert alert-success">{actionSuccess}</div>
        )}
        {actionError && <div className="alert alert-danger">{actionError}</div>}

        {/* ⭐️ 8. (ปรับปรุง) แยกข้อมูลเป็น Card ย่อยๆ */}
        {/* ข้อมูลหลัก */}
        <div className="card mb-4">
          <div className="card-header">
            <h3>ข้อมูลหลัก</h3>
          </div>
          <div className="card-body">
            <p>
              <strong>ผู้ยื่น:</strong> {request.student?.first_name}{' '}
              {request.student?.last_name} ({request.student?.username})
            </p>
            <p>
              <strong>ประเภทคำร้อง:</strong>{' '}
              {request.request_type?.name || 'N/A'}
            </p>
            <p>
              <strong>สถานะ:</strong>
              <span style={{ ...getStatusStyle(request.status), marginLeft: '10px' }}>
                {request.status}
              </span>
            </p>
            <p>
              <strong>วันที่ยื่น:</strong>{' '}
              {new Date(request.created_at).toLocaleString('th-TH')}
            </p>
            <p>
              <strong>อัปเดตล่าสุด:</strong>{' '}
              {new Date(request.updated_at).toLocaleString('th-TH')}
            </p>
          </div>
        </div>

        {/* รายละเอียด */}
        <div className="card mb-4">
          <div className="card-header">
            <h3>รายละเอียดที่ผู้ยื่นระบุ</h3>
          </div>
          <div
            className="card-body"
            style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
          >
            {request.details}
          </div>
        </div>

        {/* ประวัติการดำเนินการ */}
        <div className="card mb-4">
          <div className="card-header">
            <h3>ประวัติการดำเนินการ (History)</h3>
          </div>
          <div className="card-body">
            {request.history && request.history.length > 0 ? (
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {request.history.map((item, index) => (
                  <li key={index} style={{ marginBottom: '10px' }}>
                    <strong>{new Date(item.timestamp).toLocaleString('th-TH')}:</strong>
                    <br />
                    {item.action} (โดย {item.user})
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted" style={{ fontStyle: 'italic' }}>
                ยังไม่มีประวัติการดำเนินการ
              </p>
            )}
          </div>
        </div>

        {/* ไฟล์แนบ */}
        <div className="card mb-4">
          <div className="card-header">
            <h3>ไฟล์แนบ</h3>
          </div>
          <div className="card-body">
            {request.attachments && request.attachments.length > 0 ? (
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {request.attachments.map((file) => (
                  <li key={file.id} style={{ marginBottom: '10px' }}>
                    <a
                      href={file.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#007bff', textDecoration: 'underline' }}
                    >
                      {file.file_name || 'ดาวน์โหลดไฟล์'}
                    </a>
                    <span
                      style={{
                        color: '#666',
                        fontSize: '0.9em',
                        marginLeft: '10px',
                      }}
                    >
                      ({new Date(file.uploaded_at).toLocaleString('th-TH')})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted" style={{ fontStyle: 'italic' }}>
                ไม่มีไฟล์แนบ
              </p>
            )}
          </div>
        </div>

        {/* อัปโหลดไฟล์ (Student) */}
        {canUploadFile && (
          <div className="card mb-4">
            <div className="card-header" style={{backgroundColor: '#e7f3ff'}}>
              <h3>📎 อัปโหลดไฟล์แนบเพิ่มเติม</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <input
                  id="file-input"
                  type="file"
                  onChange={handleFileChange}
                  className="form-control" // ⭐️ ใช้ .form-control
                  disabled={isUploading}
                />
              </div>
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || isUploading}
                className="btn btn-primary" // ⭐️ ใช้ .btn
              >
                {isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดไฟล์'}
              </button>
              {selectedFile && !isUploading && (
                <p
                  className="text-muted"
                  style={{ marginTop: '10px', fontSize: 'small' }}
                >
                  ไฟล์ที่เลือก: <strong>{selectedFile.name}</strong>
                </p>
              )}
            </div>
          </div>
        )}

        {/* จัดการคำร้อง (Advisor/Staff) */}
        {canUpdateStatus && request.status === 'Pending Approval' && (
          <div className="card mb-4">
            <div className="card-header" style={{backgroundColor: '#fff3e0'}}>
              <h3>⚙️ การจัดการคำร้อง (สำหรับ {userRole})</h3>
            </div>
            <div
              className="card-body"
              style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}
            >
              <button
                onClick={() => handleUpdateStatus('APPROVED')}
                disabled={isUploading || isUpdating}
                className="btn btn-success" // ⭐️ ใช้ .btn
              >
                {isUpdating ? 'กำลังอนุมัติ...' : '✅ อนุมัติ'}
              </button>
              <button
                onClick={() => handleUpdateStatus('IN_PROGRESS')}
                disabled={isUploading || isUpdating}
                className="btn btn-primary" // ⭐️ ใช้ .btn
              >
                {isUpdating ? 'กำลังอัปเดต...' : '🔄 กำลังดำเนินการ'}
              </button>
              <button
                onClick={() => handleUpdateStatus('REJECTED')}
                disabled={isUploading || isUpdating}
                className="btn btn-danger" // ⭐️ ใช้ .btn
              >
                {isUpdating ? 'กำลังปฏิเสธ...' : '❌ ปฏิเสธ'}
              </button>
            </div>
          </div>
        )}

        {/* (ดำเนินการแล้ว) */}
        {canUpdateStatus && request.status !== 'Pending Approval' && (
          <div className="alert alert-info text-center">
            <p style={{ margin: 0 }}>
              คำร้องนี้ถูกดำเนินการแล้ว:{' '}
              <strong>{request.status}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestDetailPage;