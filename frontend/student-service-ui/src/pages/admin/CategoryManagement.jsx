import React, { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import {
  fetchCategories,
  addCategory,
  deleteCategory,
  updateCategory,
} from '../../api/requests';

function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  
 
  const navigate = useNavigate();

  const loadCategories = async () => {
 
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCategories();
      const categoryData = Array.isArray(data) ? data : data.results || [];
      categoryData.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(categoryData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('ไม่สามารถดึงข้อมูลหมวดหมู่ได้');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e) => {

    e.preventDefault();
    if (!newCategoryName.trim()) {
      setError('ชื่อหมวดหมู่ห้ามว่าง');
      return;
    }
    try {
      setError(null);
      await addCategory(newCategoryName);
      setNewCategoryName('');
      loadCategories(); 
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err.name?.[0] || 'ไม่สามารถเพิ่มหมวดหมู่ได้');
    }
  };

  const handleDeleteCategory = async (categoryId) => {

    if (window.confirm('คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่นี้? (ประเภทคำร้องที่อยู่ภายในจะถูกลบไปด้วย)')) {
      try {
        await deleteCategory(categoryId);
        loadCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        setError('ไม่สามารถลบหมวดหมู่ได้');
      }
    }
  };

  
  const handleEditClick = (category) => {
   
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleCancelEdit = () => {
   
    setEditingCategoryId(null);
    setEditingCategoryName('');
  };

  const handleSaveEdit = async () => {
   
    try {
      await updateCategory(editingCategoryId, editingCategoryName);
      setEditingCategoryId(null);
      setEditingCategoryName('');
      loadCategories(); 
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.name?.[0] || 'ไม่สามารถอัปเดตหมวดหมู่ได้');
    }
  };


  return (
    <div className="card" style={{ maxWidth: '800px' }}>
      <div className="card-header">
        <h2>จัดการหมวดหมู่คำร้อง (Categories)</h2>
      </div>
      <div className="card-body">
      
        <form onSubmit={handleAddCategory} className="mb-4">
          <div className="form-group">
            <label htmlFor="newCategoryName">เพิ่มหมวดหมู่ใหม่:</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                id="newCategoryName"
                className="form-control"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="เช่น ทะเบียน, การเงิน, ทุนการศึกษา"
                style={{ flexGrow: 1 }}
              />
              <button type="submit" className="btn btn-primary">
                เพิ่ม
              </button>
            </div>
          </div>
        </form>

        {error && <div className="alert alert-danger">{error}</div>}
        {loading && <p>กำลังโหลด...</p>}
        
        {!loading && (
          <ul className="list-group">
            {categories.map((category) => (
              <li
                key={category.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                {editingCategoryId === category.id ? (
                 
                  <>
                    <input
                      type="text"
                      className="form-control"
                      value={editingCategoryName}
                      onChange={(e) => setEditingCategoryName(e.target.value)}
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
                    <span>{category.name}</span>
                    <div style={{ whiteSpace: 'nowrap' }}>
                    
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => navigate(`/admin/categories/${category.id}/types`)}
                        style={{ marginRight: '5px' }}
                      >
                        จัดการประเภท
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleEditClick(category)}
                        style={{ marginRight: '5px' }}
                      >
                        แก้ไข (ชื่อ)
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        ลบ
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CategoryManagement;