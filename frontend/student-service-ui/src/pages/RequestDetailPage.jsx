import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    fetchRequestById, 
    updateRequestStatus, 
    uploadAttachment
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

    const canUpdateStatus = userRole === 'Advisor' || userRole === 'Staff (Registrar)' || userRole === 'Staff (Finance)';
    const canUploadFile = userRole === 'Student' && request?.status === 'Pending Approval';

    const loadRequest = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchRequestById(requestId);
            setRequest(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch request detail:", err);
            setError("ไม่สามารถดึงรายละเอียดคำร้องนี้ได้ (โปรดตรวจสอบ ID/สิทธิ์)");
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        loadRequest();
    }, [loadRequest]);

    const handleUpdateStatus = async (newStatus) => {
        const statusMap = {
            'APPROVED': 'อนุมัติ',
            'REJECTED': 'ปฏิเสธ',
            'IN_PROGRESS': 'กำลังดำเนินการ'
        };
        const actionText = statusMap[newStatus] || 'อัปเดต';
        const isConfirmed = window.confirm(`คุณแน่ใจหรือไม่ที่จะ ${actionText} คำร้อง ID: ${requestId}?`);

        if (!isConfirmed) return;

        setIsUpdating(true);
        try {
            await updateRequestStatus(requestId, newStatus);
            await loadRequest(); // โหลดข้อมูลใหม่เพื่อแสดง status ที่อัปเดต
            alert(`คำร้อง ID ${requestId} ถูก ${actionText} เรียบร้อยแล้ว`);
        } catch (err) {
            console.error("Failed to update status:", err);
            alert(`ไม่สามารถ ${actionText} คำร้องได้: ${err.detail || JSON.stringify(err) || 'เกิดข้อผิดพลาด'}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert("กรุณาเลือกไฟล์ก่อนอัปโหลด");
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            await uploadAttachment(requestId, formData);
            
            alert("อัปโหลดไฟล์สำเร็จ!");
            setSelectedFile(null);
            if (document.getElementById('file-input')) {
                document.getElementById('file-input').value = null;
            }
            
            loadRequest();

        } catch (err) {
            console.error("Failed to upload file:", err);
            alert(`อัปโหลดไฟล์ไม่สำเร็จ: ${err.detail || JSON.stringify(err) || 'เกิดข้อผิดพลาด'}`);
        } finally {
            setIsUploading(false);
        }
    };
    
    if (loading) return <div style={{ padding: '20px' }}>กำลังโหลดรายละเอียดคำร้อง...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
    if (!request) return <div style={{ padding: '20px' }}>ไม่พบข้อมูลคำร้อง</div>;

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Approved': return { color: 'white', backgroundColor: 'green', padding: '5px 10px', borderRadius: '4px' };
            case 'Rejected': return { color: 'white', backgroundColor: 'darkred', padding: '5px 10px', borderRadius: '4px' };
            case 'Pending Approval': return { color: 'black', backgroundColor: 'orange', padding: '5px 10px', borderRadius: '4px' };
            case 'In Progress': return { color: 'white', backgroundColor: 'blue', padding: '5px 10px', borderRadius: '4px' };
            default: return { color: 'black', backgroundColor: 'lightgray', padding: '5px 10px', borderRadius: '4px' };
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
                รายละเอียดคำร้อง: ID #{request.id}
            </h1>
            <button 
                onClick={() => navigate(-1)} 
                style={{ 
                    marginBottom: '20px', 
                    padding: '8px 15px', 
                    cursor: 'pointer',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                }}
            >
                ← กลับ
            </button>

            {/* ข้อมูลหลัก */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 2fr', 
                gap: '20px', 
                border: '1px solid #ddd', 
                padding: '20px', 
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                marginBottom: '20px'
            }}>
                <div>
                    <h3 style={{ marginTop: 0, borderBottom: '2px solid #007bff', paddingBottom: '5px' }}>ข้อมูลหลัก</h3>
                    {/* ⭐️ แก้: ใช้ request.student แทน request.user */}
                    <p><strong>ผู้ยื่น:</strong> {request.student?.first_name} {request.student?.last_name} ({request.student?.username})</p>
                    <p><strong>ประเภทคำร้อง:</strong> {request.request_type?.name || 'N/A'}</p>
                    <p>
                        <strong>สถานะ:</strong> 
                        <span style={{ ...getStatusStyle(request.status), marginLeft: '10px' }}>
                            {request.status}
                        </span>
                    </p>
                    <p><strong>วันที่ยื่น:</strong> {new Date(request.created_at).toLocaleString('th-TH')}</p>
                    <p><strong>อัปเดตล่าสุด:</strong> {new Date(request.updated_at).toLocaleString('th-TH')}</p>
                </div>
                
                <div style={{ background: '#fff', padding: '15px', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
                    <h3 style={{ marginTop: 0 }}>รายละเอียดที่ผู้ยื่นระบุ</h3>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {request.details}
                    </p>
                </div>
            </div>

            {/* ประวัติการดำเนินการ */}
            <div style={{ 
                border: '1px solid #ddd', 
                padding: '20px', 
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                marginBottom: '20px'
            }}>
                <h3 style={{ marginTop: 0, borderBottom: '2px solid #28a745', paddingBottom: '5px' }}>
                    ประวัติการดำเนินการ (History)
                </h3>
                {request.history && request.history.length > 0 ? (
                    <ul style={{ paddingLeft: '20px', margin: 0, listStyleType: 'disc' }}>
                        {/* ⭐️ แก้: ใช้ index เป็น key และใช้ item.user แทน item.actor.username */}
                        {request.history.map((item, index) => (
                            <li key={index} style={{ marginBottom: '10px' }}>
                                <strong>{new Date(item.timestamp).toLocaleString('th-TH')}:</strong>
                                <br />
                                {item.action} (โดย {item.user})
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>ยังไม่มีประวัติการดำเนินการ</p>
                )}
            </div>

            {/* ไฟล์แนบ */}
            <div style={{ 
                border: '1px solid #ddd', 
                padding: '20px', 
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                marginBottom: '20px'
            }}>
                <h3 style={{ marginTop: 0, borderBottom: '2px solid #ffc107', paddingBottom: '5px' }}>ไฟล์แนบ</h3>
                {request.attachments && request.attachments.length > 0 ? (
                    <ul style={{ paddingLeft: '20px', margin: 0, listStyleType: 'disc' }}>
                        {/* ⭐️ แก้: ใช้ file.file แทน file.file_url */}
                        {request.attachments.map(file => (
                            <li key={file.id} style={{ marginBottom: '10px' }}>
                                <a 
                                    href={file.file} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    style={{ color: '#007bff', textDecoration: 'underline' }}
                                >
                                    {file.file_name || 'ดาวน์โหลดไฟล์'}
                                </a>
                                <span style={{ color: '#666', fontSize: '0.9em', marginLeft: '10px' }}>
                                    ({new Date(file.uploaded_at).toLocaleString('th-TH')})
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>ไม่มีไฟล์แนบ</p>
                )}
            </div>
            
            {/* อัปโหลดไฟล์ (Student) */}
            {canUploadFile && (
                <div style={{ 
                    padding: '20px', 
                    border: '2px solid #007bff', 
                    borderRadius: '8px',
                    backgroundColor: '#e7f3ff',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ marginTop: 0 }}>📎 อัปโหลดไฟล์แนบเพิ่มเติม</h3>
                    <input 
                        id="file-input"
                        type="file" 
                        onChange={handleFileChange} 
                        style={{ display: 'block', marginBottom: '15px' }}
                        disabled={isUploading}
                    />
                    <button
                        onClick={handleFileUpload}
                        disabled={!selectedFile || isUploading}
                        style={{ 
                            padding: '10px 20px', 
                            background: !selectedFile || isUploading ? '#ccc' : '#007bff', 
                            color: 'white', 
                            border: 'none', 
                            cursor: !selectedFile || isUploading ? 'not-allowed' : 'pointer', 
                            borderRadius: '4px',
                            fontWeight: 'bold'
                        }}
                    >
                        {isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดไฟล์'}
                    </button>
                    {selectedFile && !isUploading && (
                        <p style={{ marginTop: '10px', fontSize: 'small', color: '#333' }}>
                            ไฟล์ที่เลือก: <strong>{selectedFile.name}</strong>
                        </p>
                    )}
                </div>
            )}

            {/* จัดการคำร้อง (Advisor/Staff) */}
            {canUpdateStatus && request.status === 'Pending Approval' && (
                <div style={{ 
                    padding: '20px', 
                    border: '2px solid #ff9800', 
                    borderRadius: '8px',
                    backgroundColor: '#fff3e0'
                }}>
                    <h3 style={{ marginTop: 0 }}>⚙️ การจัดการคำร้อง (สำหรับ {userRole})</h3>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                        <button 
                            onClick={() => handleUpdateStatus('APPROVED')}
                            disabled={isUploading || isUpdating}
                            style={{ 
                                padding: '10px 20px', 
                                background: isUpdating ? '#ccc' : 'green', 
                                color: 'white', 
                                border: 'none', 
                                cursor: isUpdating ? 'not-allowed' : 'pointer', 
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}
                        >
                            {isUpdating ? 'กำลังอนุมัติ...' : '✅ อนุมัติ'}
                        </button>
                        <button 
                            onClick={() => handleUpdateStatus('IN_PROGRESS')}
                            disabled={isUploading || isUpdating}
                            style={{ 
                                padding: '10px 20px', 
                                background: isUpdating ? '#ccc' : 'blue', 
                                color: 'white', 
                                border: 'none', 
                                cursor: isUpdating ? 'not-allowed' : 'pointer', 
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}
                        >
                            {isUpdating ? 'กำลังอัปเดต...' : '🔄 กำลังดำเนินการ'}
                        </button>
                        <button 
                            onClick={() => handleUpdateStatus('REJECTED')}
                            disabled={isUploading || isUpdating}
                            style={{ 
                                padding: '10px 20px', 
                                background: isUpdating ? '#ccc' : 'darkred', 
                                color: 'white', 
                                border: 'none', 
                                cursor: isUpdating ? 'not-allowed' : 'pointer', 
                                borderRadius: '4px',
                                fontWeight: 'bold'
                            }}
                        >
                            {isUpdating ? 'กำลังปฏิเสธ...' : '❌ ปฏิเสธ'}
                        </button>
                    </div>
                </div>
            )}
            
            {canUpdateStatus && request.status !== 'Pending Approval' && (
                 <div style={{ 
                     padding: '15px', 
                     border: '1px solid #ccc', 
                     borderRadius: '4px', 
                     background: '#f0f0f0',
                     textAlign: 'center'
                 }}>
                     <p style={{ margin: 0 }}>
                         คำร้องนี้ถูกดำเนินการแล้ว: <strong style={{ color: '#333' }}>{request.status}</strong>
                     </p>
                 </div>
            )}
        </div>
    );
}

export default RequestDetailPage;