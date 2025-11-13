import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchNotifications, markNotificationAsRead } from '../api/requests'; // (ปรับ path ถ้าจำเป็น)

// ⭐️ (CSS) เราจะใส่ Style ไว้ที่นี่เพื่อง่ายต่อการใช้งาน
// คุณสามารถย้ายไปไว้ใน index.css ของคุณได้ถ้าต้องการ
const styles = `
  .notification-bell {
    position: relative;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px; /* ขนาดพื้นที่คลิก */
    height: 40px; /* ขนาดพื้นที่คลิก */
  }
  .notification-badge {
    position: absolute;
    top: 5px;   /* ปรับตำแหน่ง Badge */
    right: 5px; /* ปรับตำแหน่ง Badge */
    background: #dc3545; /* สีแดง */
    color: white;
    border-radius: 50%;
    padding: 2px 6px;
    font-size: 10px;
    font-weight: bold;
    border: 1px solid white;
  }
  .notification-dropdown {
    position: absolute;
    top: 120%; /* ให้มันอยู่ต่ำลงมาจาก Nav */
    right: 0;
    width: 320px;
    background: white;
    border: 1px solid #ddd;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-radius: 8px;
    max-height: 400px;
    overflow-y: auto;
    z-index: 1001; /* ให้อยู่เหนือทุกอย่าง */
    color: #333; /* สีตัวอักษรปกติ */
  }
  .notification-header {
    padding: 10px 15px;
    font-weight: bold;
    border-bottom: 1px solid #eee;
  }
  .notification-item {
    display: block;
    padding: 12px 15px;
    border-bottom: 1px solid #eee;
    font-size: 13px;
    text-decoration: none;
    color: inherit;
  }
  .notification-item:last-child {
    border-bottom: none;
  }
  .notification-item.unread {
    background: #f0f7ff; /* สีฟ้าอ่อนสำหรับ unread */
  }
  .notification-item:hover {
    background: #f9f9f9;
  }
  .notification-item p {
    margin: 0 0 5px 0;
    line-height: 1.4;
  }
  .notification-item small {
    color: #007bff; /* สีฟ้าสำหรับวันที่ */
    font-size: 11px;
  }
`;

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  // 1. ฟังก์ชันโหลดข้อมูล (เราจะเรียกใช้ซ้ำๆ)
  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();

      const sortedData = data?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || [];
      setNotifications(sortedData);
      setError(null);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('ไม่สามารถโหลดแจ้งเตือนได้');
    }
  };

  // 2. โหลดข้อมูลครั้งแรก และตั้งเวลาโหลดซ้ำ (Polling)
  useEffect(() => {
    loadNotifications(); // โหลดครั้งแรก
    const interval = setInterval(loadNotifications, 30000); // โหลดใหม่ทุก 30 วินาที
    return () => clearInterval(interval); // (Cleanup เมื่อ component หายไป)
  }, []);

  // 3. นับจำนวนที่ยังไม่อ่าน
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // 4. เปิด/ปิด Dropdown
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) { // (ถ้ากำลังจะเปิด)
      loadNotifications(); // (โหลดใหม่ทันที)
    }
  };

  // 5. เมื่อคลิกที่รายการแจ้งเตือน
  const handleItemClick = async (notification) => {
    // (มาร์คว่าอ่านแล้ว เฉพาะอันที่ยังไม่อ่าน)
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        loadNotifications(); // โหลดข้อมูลใหม่หลังมาร์ค
      } catch (err) {
        console.error('Failed to mark as read', err);
      }
    }
    setIsOpen(false); // ปิด Dropdown
    // (การ Redirect จะทำงานโดย <Link>)
  };

  return (
    <>
      <style>{styles}</style> {/* (ฝัง Style ไว้ตรงนี้เลย) */}
      <div className="notification-bell" onClick={handleToggle}>
        <span style={{ fontSize: '24px' }}>🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}

        {isOpen && (
          <div className="notification-dropdown">
            <div className="notification-header">การแจ้งเตือน</div>
            {error && <div className="notification-item">{error}</div>}
            {notifications.length === 0 && !error && (
              <div className="notification-item" style={{ textAlign: 'center', color: '#888' }}>
                ไม่มีแจ้งเตือน
              </div>
            )}
            {notifications.map(n => (
              <Link
                key={n.id}
                // ⭐️ (สำคัญ) เราจะ Link ไปที่ Request ID
                to={`/requests/${n.request_id}`} 
                className={`notification-item ${n.is_read ? '' : 'unread'}`}
                onClick={() => handleItemClick(n)}
              >
                <p>{n.message}</p>
                <small>{new Date(n.created_at).toLocaleString('th-TH')}</small>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default NotificationBell;