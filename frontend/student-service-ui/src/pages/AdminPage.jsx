import React, { useState, useEffect } from 'react';
import {
  fetchAllUsers,
  updateRole,
  createNewUser,
  deleteUser,
  updateUser,
} from '../api/requests';

function CreateUserModal({ show, onClose, onSubmit }) {
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'Student',
  });
  const [error, setError] = useState(null);

  if (!show) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!newUserData.username || !newUserData.password) {
      setError('Username และ Password ห้ามว่าง');
      return;
    }
    try {
      await onSubmit(newUserData);
      onClose();
    } catch (err) {
      if (err.username) {
        setError('Username นี้ถูกใช้แล้ว: ' + err.username.join(', '));
      } else if (err.email) {
        setError('Email นี้ถูกใช้แล้ว: ' + err.email.join(', '));
      } else {
        setError(
          'เกิดข้อผิดพลาดในการสร้างผู้ใช้: ' + (err.detail || err.message)
        );
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '400px',
        }}
      >
        <form onSubmit={handleSubmit}>
          <h2>เพิ่มผู้ใช้ใหม่</h2>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div className="mb-3">
            <label className="form-label">Username (จำเป็น)</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={newUserData.username}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={newUserData.email}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password (จำเป็น)</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={newUserData.password}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Role</label>
            <select
              name="role"
              className="form-select"
              value={newUserData.role}
              onChange={handleChange}
            >
              <option value="Student">Student</option>
              <option value="Advisor">Advisor</option>
              <option value="Staff (Registrar)">Staff (Registrar)</option>
              <option value="Staff (Finance)">Staff (Finance)</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary">
              สร้างผู้ใช้
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, show, onClose, onSubmit }) {
  const [editData, setEditData] = useState({
    username: '',
    email: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setEditData({
        username: user.username,
        email: user.email || '',
      });
      setError(null);
    }
  }, [user, show]);

  if (!show || !user) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!editData.username) {
      setError('Username ห้ามว่าง');
      return;
    }
    try {
      await onSubmit(user.id, editData);
      onClose();
    } catch (err) {
      if (err.username) {
        setError('Username นี้ถูกใช้แล้ว: ' + err.username.join(', '));
      } else if (err.email) {
        setError('Email นี้ถูกใช้แล้ว: ' + err.email.join(', '));
      } else {
        setError(
          'เกิดข้อผิดพลาดในการแก้ไขผู้ใช้: ' + (err.detail || err.message)
        );
      }
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '400px',
        }}
      >
        <form onSubmit={handleSubmit}>
          <h2>แก้ไขข้อมูล: {user.username}</h2>
          <p>
            (คุณไม่สามารถแก้ไข Password หรือ Role ได้ที่นี่.
            ใช้ตารางหลักเพื่อเปลี่ยน Role.)
          </p>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div className="mb-3">
            <label className="form-label">Username (จำเป็น)</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={editData.username}
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={editData.email}
              onChange={handleChange}
            />
          </div>
          <div
            style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              ยกเลิก
            </button>
            <button type="submit" className="btn btn-primary">
              บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllUsers();
      const userData = Array.isArray(data) ? data : data.results || [];
      setUsers(userData);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('ไม่สามารถดึงข้อมูลผู้ใช้งานได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

 
  const handleRoleChange = async (userId, newRole) => {
  
    if (!newRole || newRole === '') {
      alert('กรุณาเลือก Role ที่ถูกต้อง');
      return;
    }


    console.log('🔍 Changing role:');
    console.log('  userId:', userId, typeof userId);
    console.log('  newRole:', newRole, typeof newRole);
    console.log('  newRole length:', newRole.length);
    console.log('  newRole charCodes:', [...newRole].map(c => c.charCodeAt(0)));

    if (
      !window.confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยน Role ของผู้ใช้นี้เป็น "${newRole}"?`
      )
    ) {
   
      await loadUsers();
      return;
    }
    try {
      console.log('📤 Sending API request...');
      const response = await updateRole(userId, newRole);
      console.log('✅ Success response:', response);
      alert('อัปเดต Role สำเร็จ!');
      await loadUsers();
    } catch (err) {
      console.error('❌ Error updating role:', err);
      console.log('❌ Error details:', JSON.stringify(err, null, 2));
      alert('เกิดข้อผิดพลาดในการอัปเดต Role: ' + (err.error || err.detail || err.message || 'Unknown error'));
   
      await loadUsers();
    }
  };

  const handleCreateUserSubmit = async (newUserData) => {
    try {
      await createNewUser(newUserData);
      alert('สร้างผู้ใช้ใหม่สำเร็จ!');
      await loadUsers();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  };

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(
        `คุณแน่ใจ 100% หรือไม่ว่าต้องการลบผู้ใช้: ${user.username}? \n(การกระทำนี้ไม่สามารถย้อนกลับได้)`
      )
    ) {
      return;
    }
    try {
      await deleteUser(user.id);
      alert('ลบผู้ใช้สำเร็จ!');
      await loadUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('เกิดข้อผิดพลาดในการลบผู้ใช้: ' + (err.detail || err.message));
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleEditUserSubmit = async (userId, updatedData) => {
    try {
      await updateUser(userId, updatedData);
      alert('แก้ไขข้อมูลผู้ใช้สำเร็จ!');
      await loadUsers();
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <CreateUserModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUserSubmit}
      />
      
      <EditUserModal
        user={editingUser}
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSubmit={handleEditUserSubmit}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2>จัดการผู้ใช้งาน (Admin Only)</h2>
        <button
          className="btn btn-success"
          onClick={() => setShowCreateModal(true)}
        >
          + เพิ่มผู้ใช้ใหม่
        </button>
      </div>

      {loading && <p>กำลังโหลด...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && (
        <table
          className="table table-striped table-bordered"
          style={{ marginTop: '20px' }}
        >
          <thead className="table-dark">
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role ปัจจุบัน</th>
              <th>เปลี่ยน Role เป็น</th>
              <th style={{width: '180px'}}>การกระทำ (Actions)</th> 
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  ไม่พบข้อมูลผู้ใช้
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 'bold',
                        color:
                          user.profile?.role === 'Admin'
                            ? 'purple'
                            : user.profile?.role === 'Advisor'
                            ? 'blue'
                            : '#333',
                      }}
                    >
                      {user.profile?.role || 'N/A'}
                    </span>
                  </td>
                  <td>
                   
                    <select
                      className="form-select"
                      defaultValue={user.profile?.role || 'STUDENT'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      style={{ maxWidth: '220px' }}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="ADVISOR">Advisor</option>
                      <option value="STAFF_REGISTRAR">Staff (Registrar)</option>
                      <option value="STAFF_FINANCE">Staff (Finance)</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleEditClick(user)}
                      style={{ marginRight: '5px' }}
                    >
                      แก้ไข
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(user)}
                    >
                      ลบ
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPage;