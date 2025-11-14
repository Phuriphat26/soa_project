import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchCategories,
  fetchRequestTypes,
  submitNewRequest,
  uploadAttachment, 
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

  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


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


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true); 

    if (!selectedRequestType || !details) {
      setError('กรุณาเลือกประเภทคำร้องและใส่รายละเอียดให้ครบถ้วน');
      setIsSubmitting(false); 
      return;
    }

    let newRequestId = null;

    try {

      const newRequest = await submitNewRequest(selectedRequestType, details);
      newRequestId = newRequest.id; 


      if (selectedFile && newRequestId) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('request', newRequestId); 


        await uploadAttachment(newRequestId, formData);
      }


      setSuccess(true);
      setDetails('');
      setSelectedRequestType('');
      setSelectedCategory('');
      setSelectedFile(null); 
      if (document.getElementById('file-input')) {
        document.getElementById('file-input').value = null; 
      }
    } catch (err) {
      console.error('Submission failed:', err);
      
      
      const errorAction = newRequestId
        ? 'ยื่นคำร้องสำเร็จ แต่แนบไฟล์ไม่สำเร็จ' 
        : 'ยื่นคำร้องไม่สำเร็จ'; 


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
      setIsSubmitting(false); 
    }
  };



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
     
          <div className="form-group">
            <label htmlFor="category">หมวดหมู่หลัก:</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="form-control"
              required
          
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

     
          <button
            type="submit"
            className="btn btn-primary"
            style={{ marginTop: '10px' }}
            disabled={isSubmitting || success} 
          >
            {isSubmitting ? 'กำลังส่งคำร้อง...' : 'ส่งคำร้อง'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SubmitRequestPage;