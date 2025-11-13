import React from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  // ⭐️ หน้านี้ถูกจัดกึ่งกลาง (centered) โดย PageLayout ใน App.jsx แล้ว
  return (
    // ⭐️ 1. ใช้ .card เป็นกรอบหลัก (ขยายความกว้างสำหรับเมนู)
    <div className="card" style={{ maxWidth: '800px' }}>
      {/* ⭐️ 2. ใช้ .card-header สีฟ้าอ่อน */}
      <div className="card-header">
        <h2>แผงควบคุมผู้ดูแลระบบ (ADMIN)</h2>
      </div>

      {/* ⭐️ 3. ใช้ .card-body */}
      <div className="card-body">
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
          ยินดีต้อนรับ, Admin!
        </p>

        {/* ⭐️ 4. (ปรับปรุง) 
          เราไม่มีสไตล์ .list-group ใน index.css 
          ดังนั้นเราจะใช้ .card ย่อยๆ แทน
        */}
        <div className="card">
          <div className="card-header" style={{ backgroundColor: '#f8f9fa' }}>
            <h4>เครื่องมือตั้งค่าระบบ</h4>
          </div>
          
          {/* ⭐️ 5. (ปรับปรุง) แปลง Link 
              เป็นปุ่ม .btn ที่เต็มความกว้างและชิดซ้าย 
          */}
          <div className="card-body" style={{ padding: '1rem' }}>
            <Link
              to="/admin/categories"
              className="btn btn-primary btn-block"
              style={{ 
                marginBottom: '10px', 
                textAlign: 'left', // ⭐️ ชิดซ้าย
                fontWeight: '500' // ⭐️ ไม่หนาเกินไป
              }}
            >
              จัดการหมวดหมู่คำร้อง (Category Management)
            </Link>

            <Link
              to="/admin" // 👈 Path นี้จะไปที่ AdminPage.jsx
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
              className="btn btn-secondary btn-block" // ⭐️ สีเทา (Secondary)
              style={{ 
                marginBottom: '10px', 
                textAlign: 'left',
                fontWeight: '500'
              }}
            >
              ดูหน้าจัดการคำร้อง (Advisor View)
            </Link>

            <button
              className="btn btn-secondary btn-block" // ⭐️ สีเทา
              style={{ 
                textAlign: 'left',
                fontWeight: '500'
              }}
              disabled // ⭐️ ปิดการใช้งาน
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