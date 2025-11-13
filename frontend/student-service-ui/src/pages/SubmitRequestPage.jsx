import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchCategories,
  fetchRequestTypes,
  submitNewRequest,
  uploadAttachment, // ⭐️ 1. Import `uploadAttachment` เข้ามา
} from '../api/requests';

function SubmitRequestPage() {
  const navigate = useNavigate();

  // State
  const [categories, setCategories] = useState([]);
  const [requestTypes, setRequestTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRequestType, setSelectedRequestType] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ⭐️ 2. เพิ่ม State สำหรับไฟล์ และสถานะการส่ง
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Logic (โหลดหมวดหมู่)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats || []);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('ไม่สามารถดึงข้อมูลหมวดหมู่ได้');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData(); 
  }, []);

  // Logic (ดึงประเภทคำร้อง)
  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSelectedRequestType('');
    setRequestTypes([]);

    if (categoryId) {
      try {
        const types = await fetchRequestTypes(categoryId);
        setRequestTypes(types || []);
      } catch (err) {
        console.error('Failed to load request types:', err);
        setError('ไม่สามารถดึงประเภทคำร้องได้');
      }
    }
  };

  // ⭐️ 3. แก้ไข handleSubmit ให้เป็นแบบ 2-Step (ส่ง Text -> ส่ง File)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true); // ⭐️ เริ่มการส่ง

    if (!selectedRequestType || !details) {
      setError('กรุณาเลือกประเภทคำร้องและใส่รายละเอียดให้ครบถ้วน');
      setIsSubmitting(false); // ⭐️ หยุด
      return;
    }

    let newRequestId = null;

    try {
      // --- ขั้นตอนที่ 1: ส่งข้อมูล Text (คำร้อง) ก่อน ---
      const newRequest = await submitNewRequest(selectedRequestType, details);
      newRequestId = newRequest.id; // ⭐️ เก็บ ID ของคำร้องที่เพิ่งสร้าง

      // --- ขั้นตอนที่ 2: ถ้ามีไฟล์แนบ, ให้อัปโหลดตามไป ---
      if (selectedFile && newRequestId) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('request', newRequestId); // ⭐️ (สำคัญ) ต้องส่ง 'request' ID ไปใน FormData

        // เรียก API อัปโหลดไฟล์ (ที่เราแก้ไขในขั้นตอนก่อน)
        await uploadAttachment(newRequestId, formData);
      }

      // --- ขั้นตอนที่ 3: สำเร็จทั้งหมด ---
      setSuccess(true);
      setDetails('');
      setSelectedRequestType('');
      setSelectedCategory('');
      setSelectedFile(null); // ⭐️ เคลียร์ไฟล์
      if (document.getElementById('file-input')) {
        document.getElementById('file-input').value = null; // ⭐️ เคลียร์ input
      }
    } catch (err) {
      console.error('Submission failed:', err);
      
      // ⭐️ แจ้ง Error ให้ชัดเจนขึ้น
      const errorAction = newRequestId
        ? 'ยื่นคำร้องสำเร็จ แต่แนบไฟล์ไม่สำเร็จ' // (เคสที่ 1 สำเร็จ, เคสที่ 2 ล้มเหลว)
        : 'ยื่นคำร้องไม่สำเร็จ'; // (เคสที่ 1 ล้มเหลว)

      // (ดึง Error message จาก Backend)
      let specificErrorMessage = '';
      if (err && typeof err === 'object' && !Array.isArray(err)) {
        const errorKey = Object.keys(err)[0];
        if (errorKey && Array.isArray(err[errorKey]) && err[errorKey].length > 0) {
          specificErrorMessage = `${errorKey}: ${err[errorKey][0]}`;
        } else if (err.detail) {
          specificErrorMessage = err.detail;
        }
      }
      setError(
        `${errorAction}: ${
          specificErrorMessage || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์'
        }`
      );
    } finally {
      setIsSubmitting(false); // ⭐️ คืนค่าปุ่ม
    }
  };

  // --- ส่วนแสดงผล (Render) ---

  if (loading) {
    return (
      <div className="card" style={{ maxWidth: '700px' }}>
        <div
          className="card-body text-center"
          style={{ padding: '30px' }}
        >
          กำลังโหลดแบบฟอร์ม...
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ maxWidth: '700px' }}>
      <div className="card-header">
        <h1>ยื่นคำร้องใหม่</h1>
      </div>

      <div className="card-body">
        {success && (
          <div
            className="alert alert-success"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>ยื่นคำร้องสำเร็จแล้ว!</span>
            <button
              onClick={() => navigate('/')}
              className="btn btn-secondary btn-sm"
            >
              กลับสู่ Dashboard
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 1. หมวดหมู่หลัก */}
          <div className="form-group">
            <label htmlFor="category">หมวดหมู่หลัก:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="form-control"
              required
              // ⭐️ 4. ปิดการใช้งานปุ่มขณะส่ง
              disabled={isSubmitting || success} 
            >
              <option value="">-- กรุณาเลือกหมวดหมู่ --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. เลือกประเภทคำร้อง */}
          {selectedCategory && (
            <div className="form-group">
              <label htmlFor="request-type">ประเภทคำร้อง (ฟอร์ม):</label>
              <select
                id="request-type"
                value={selectedRequestType}
                onChange={(e) => setSelectedRequestType(e.target.value)}
                className="form-control"
                required
                disabled={requestTypes.length === 0 || isSubmitting || success}
              >
                <option value="">-- กรุณาเลือกประเภทคำร้อง --</option>
                {requestTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {requestTypes.length === 0 && !success && (
                <small
                  className="text-muted"
                  style={{ display: 'block', marginTop: '5px' }}
                >
                  *ไม่พบฟอร์มในหมวดหมู่นี้
                </small>
              )}
            </div>
          )}

          {/* 3. รายละเอียดคำร้อง */}
          <div className="form-group">
            <label htmlFor="details">รายละเอียดเพิ่มเติม:</label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows="5"
              className="form-control"
              required
              disabled={isSubmitting || success}
              placeholder="เช่น ขอถอนรายวิชา SOA101 เนื่องจาก..."
            />
          </div>

          {/* ⭐️ 5. เพิ่มช่องแนบไฟล์ */}
          <div className="form-group">
            <label htmlFor="file-input">แนบไฟล์ (ถ้ามี):</label>
            <input
              type="file"
              id="file-input"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="form-control"
              disabled={isSubmitting || success}
            />
          </div>

          {/* ⭐️ 6. เปลี่ยนปุ่ม Submit */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '10px' }}
            disabled={isSubmitting || success} // ⭐️ 7. อัปเดตเงื่อนไข disabled
          >
            {isSubmitting ? 'กำลังส่งคำร้อง...' : 'ส่งคำร้อง'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubmitRequestPage;