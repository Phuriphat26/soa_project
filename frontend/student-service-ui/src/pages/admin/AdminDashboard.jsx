import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  
  return (
  
    <div className="card" style={{ maxWidth: '800px' }}>
   
      <div className="card-header">
        <h2>แผงควบคุมผู้ดูแลระบบ (ADMIN)</h2>
      </div>


      <div className="card-body">
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
          ยินดีต้อนรับ, Admin!
        </p>

       
        <div className="card">
          <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
            <h4>เครื่องมือตั้งค่าระบบ</h4>
          </div>
          
          
          <div className="card-body" style={{ padding: '1rem' }}>
            <Link
              to="/admin/categories"
              className="btn btn-primary btn-block"
              style={{ 
                marginBottom: '10px', 
                textAlign: 'left', 
                fontWeight: '500' 
              }}
            >
              จัดการหมวดหมู่คำร้อง (Category Management)
            </Link>

            <Link
              to="/admin" 
              className="btn btn-primary btn-block"
              style={{ 
                marginBottom: '10px', 
                textAlign: 'left',
                fontWeight: '500'
              }}
            >
              จัดการสมาชิก (User Management)
            </Link>
            
            <Link
              to="/advisor/dashboard"
              className="btn btn-secondary btn-block" 
              style={{ 
                marginBottom: '10px', 
                textAlign: 'left',
                fontWeight: '500'
              }}
            >
              ดูหน้าจัดการคำร้อง (Advisor View)
            </Link>

            <button
              className="btn btn-secondary btn-block" 
              style={{ 
                textAlign: 'left',
                fontWeight: '500'
              }}
              disabled 
            >
              ตั้งค่าระบบอื่นๆ (เร็วๆ นี้)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;