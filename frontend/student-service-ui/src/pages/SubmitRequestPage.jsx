import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchCategories,
  fetchRequestTypes,
  submitNewRequest,
} from '../api/requests';

function SubmitRequestPage() {
  const navigate = useNavigate();

  // State (เหมือนเดิม)
  const [categories, setCategories] = useState([]);
  const [requestTypes, setRequestTypes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRequestType, setSelectedRequestType] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Logic (เหมือนเดิม)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError('ไม่สามารถดึงข้อมูลหมวดหมู่ได้');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    setSelectedCategory(categoryId);
    setSelectedRequestType('');
    setRequestTypes([]);

    if (categoryId) {
      try {
        const types = await fetchRequestTypes(categoryId);
        setRequestTypes(types);
      } catch (err) {
        console.error('Failed to load request types:', err);
        setError('ไม่สามารถดึงประเภทคำร้องได้');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedRequestType || !details) {
      setError('กรุณาเลือกประเภทคำร้องและใส่รายละเอียดให้ครบถ้วน');
      return;
    }

    try {
      await submitNewRequest(selectedRequestType, details);
      setSuccess(true);
      setDetails('');
      setSelectedRequestType('');
      setSelectedCategory('');
    } catch (err) {
      console.error('Submission failed:', err);
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
        `ยื่นคำร้องไม่สำเร็จ: ${
          specificErrorMessage || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์'
        }`
      );
    }
  };

  // --- ⭐️ ส่วนแสดงผล (Render) ที่ปรับปรุงใหม่ ⭐️ ---

  if (loading) {
    // ⭐️ 1. แสดง Loading ภายใน Card ที่สวยงาม
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
    // ⭐️ 2. ใช้ .card เป็นกรอบหลัก (ขยายความกว้างเล็กน้อยสำหรับฟอร์ม)
    <div className="card" style={{ maxWidth: '700px' }}>
      {/* ⭐️ 3. ใช้ .card-header สีฟ้าอ่อน */}
      <div className="card-header">
        <h1>ยื่นคำร้องใหม่</h1>
      </div>

      {/* ⭐️ 4. ใช้ .card-body สำหรับเนื้อหาฟอร์ม */}
      <div className="card-body">
        {/* ⭐️ 5. เปลี่ยน Success Message เป็น .alert .alert-success */}
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

        {/* ⭐️ 6. เปลี่ยน Error Message เป็น .alert .alert-danger */}
        {error && (
          <div className="alert alert-danger">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ⭐️ 7. ใช้ .form-group หุ้ม Label และ Input */}
          <div className="form-group">
            <label htmlFor="category">หมวดหมู่หลัก:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="form-control" // ⭐️ 8. ใช้ .form-control
              required
              disabled={success}
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
                className="form-control" // ⭐️ 8. ใช้ .form-control
                required
                disabled={requestTypes.length === 0 || success}
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
              className="form-control" // ⭐️ 8. ใช้ .form-control
              required
              disabled={success}
              placeholder="เช่น ขอถอนรายวิชา SOA101 เนื่องจาก..."
            />
          </div>

          {/* ⭐️ 9. เปลี่ยนปุ่มเป็น .btn .btn-primary */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '10px' }}
            disabled={success}
          >
            ส่งคำร้อง
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubmitRequestPage;