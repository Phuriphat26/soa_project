import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  fetchRequestTypes,
  addRequestType,
  deleteRequestType,
  updateRequestType,
  fetchCategories,
} from '../../api/requests';

function RequestTypeManagement() {

  const { categoryId } = useParams();

  const [category, setCategory] = useState(null);
  const [requestTypes, setRequestTypes] = useState([]);

  const [newTypeName, setNewTypeName] = useState('');
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editingTypeName, setEditingTypeName] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {

      const allCategories = await fetchCategories();
      const currentCategory = allCategories.find(c => c.id.toString() === categoryId);
      setCategory(currentCategory || { name: 'ไม่พบหมวดหมู่' });

  
      const data = await fetchRequestTypes(categoryId);
      const types = Array.isArray(data) ? data : (data?.results || []);
      types.sort((a, b) => a.name.localeCompare(b.name));

      setRequestTypes(types);
    } catch (err) {
      console.error('Error fetching request types:', err);
      setError('ไม่สามารถดึงข้อมูลประเภทคำร้องได้');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const handleAddType = async (e) => {
    e.preventDefault();
    if (!newTypeName.trim()) {
      setError('ชื่อประเภทคำร้องห้ามเว้นว่าง');
      return;
    }

    try {
      setError(null);
      
 
      await addRequestType({
        name: newTypeName,
        category: parseInt(categoryId, 10)
      });

      setNewTypeName('');
      await loadData();
    } catch (err) {
      console.error('Error adding type:', err);
      const errorMsg = err?.name?.[0] || err?.message || 'ไม่สามารถเพิ่มประเภทคำร้องได้';
      setError(errorMsg);
    }
  };


  const handleDeleteType = async (typeId) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบประเภทคำร้องนี้?')) return;
    try {
      await deleteRequestType(typeId);
      await loadData();
    } catch (err) {
      console.error('Error deleting type:', err);
      setError('ไม่สามารถลบประเภทคำร้องได้');
    }
  };


  const handleEditClick = (type) => {
    setEditingTypeId(type.id);
    setEditingTypeName(type.name);
  };

  const handleCancelEdit = () => {
    setEditingTypeId(null);
    setEditingTypeName('');
  };

  const handleSaveEdit = async () => {
    if (!editingTypeName.trim()) {
      setError('ชื่อประเภทคำร้องห้ามเว้นว่าง');
      return;
    }

    try {
      
 
      await updateRequestType(editingTypeId, { name: editingTypeName });

      setEditingTypeId(null);
      setEditingTypeName('');
      await loadData();
    } catch (err) {
      console.error('Error updating type:', err);
      const errorMsg = err?.name?.[0] || err?.message || 'ไม่สามารถอัปเดตประเภทคำร้องได้';
      setError(errorMsg);
    }
  };


  return (
    <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card-header">
        <h2>จัดการประเภทคำร้อง</h2>
        {category && <p style={{ margin: '0.5rem 0 0', color: '#666' }}>หมวด: {category.name}</p>}
      </div>

      <div className="card-body">
        <Link to="/admin/categories" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem' }}>
          ← กลับไปหน้าหมวดหมู่หลัก
        </Link>

   
        <form onSubmit={handleAddType} style={{ marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label htmlFor="newTypeName">เพิ่มประเภทคำร้องใหม่:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                id="newTypeName"
                className="form-control"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="เช่น ขอถอนรายวิชา, ขอผ่อนผันค่าเทอม"
                style={{ flexGrow: 1 }}
              />
              <button type="submit" className="btn btn-primary">เพิ่ม</button>
            </div>
          </div>
        </form>

        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <p style={{ textAlign: 'center' }}>⏳ กำลังโหลดข้อมูล...</p>}

        {!loading && (
          <ul className="list-group">
            {requestTypes.length === 0 ? (
              <li className="list-group-item" style={{ textAlign: 'center', color: '#999' }}>
                ยังไม่มีประเภทคำร้องในหมวดหมู่นี้
              </li>
            ) : (
              requestTypes.map((type) => (
                <li
                  key={type.id}
                  className="list-group-item"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  {editingTypeId === type.id ? (
                    <>
                      <input
                        type="text"
                        className="form-control"
                        value={editingTypeName}
                        onChange={(e) => setEditingTypeName(e.target.value)}
                        style={{ flexGrow: 1 }}
                      />
                      <div style={{ whiteSpace: 'nowrap', marginLeft: '10px' }}>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={handleSaveEdit}
                          style={{ marginRight: '5px' }}
                        >
                          บันทึก
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={handleCancelEdit}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span>{type.name}</span>
                      <div style={{ whiteSpace: 'nowrap' }}>
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleEditClick(type)}
                          style={{ marginRight: '5px' }}
                        >
                          แก้ไข
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteType(type.id)}
                        >
                          ลบ
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RequestTypeManagement;