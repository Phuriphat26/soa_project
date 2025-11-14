import axiosClient from './axiosClient';

/**
 * ดึงรายการคำร้องทั้งหมดของ User ที่ Login อยู่ (สำหรับ Student Dashboard)
 */
export const fetchRequests = async () => {
  try {
    const response = await axiosClient.get('/requests/');
    // ⭐️ แก้ไข: ตรวจสอบว่า response.data เป็น Array หรือ Object ที่มี results
    const data = response.data;
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ดึงรายการคำร้องทั้งหมดสำหรับ Staff/Advisor
 */
export const fetchAllRequests = async () => {
  try {
    const response = await axiosClient.get('/requests/');
    const data = response.data;
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ดึงรายการหมวดหมู่หลักทั้งหมด (Dropdown 1)
 */
export const fetchCategories = async () => {
  try {
    const response = await axiosClient.get('/categories/');
    const data = response.data;
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ดึงรายการประเภทคำร้อง (ฟอร์มย่อย) ตาม Category ID (Dropdown 2)
 */
export const fetchRequestTypes = async (categoryId) => {
  try {
    const response = await axiosClient.get(
      `/request-types/?category=${categoryId}`
    );
    const data = response.data;
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * เพิ่มประเภทคำร้องใหม่ (สำหรับ Staff/Advisor)
 */
export const addRequestType = async (requestTypeData) => {
  try {
    const response = await axiosClient.post('/request-types/', requestTypeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ลบประเภทคำร้อง (สำหรับ Staff/Advisor)
 */
export const deleteRequestType = async (typeId) => {
  try {
    const response = await axiosClient.delete(`/request-types/${typeId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * อัปเดตประเภทคำร้อง (สำหรับ Staff/Advisor)
 */
export const updateRequestType = async (typeId, data) => {
  try {
    const response = await axiosClient.patch(`/request-types/${typeId}/`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ยื่นคำร้องใหม่ (POST)
 */
export const submitNewRequest = async (requestTypeId, details) => {
  try {
    const response = await axiosClient.post('/requests/', {
      request_type_id: parseInt(requestTypeId, 10),
      details: details,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * อัปเดตสถานะคำร้อง (สำหรับ Advisor/Staff)
 */
export const updateRequestStatus = async (requestId, newStatus) => {
  try {
    const response = await axiosClient.patch(`/requests/${requestId}/`, {
      status: newStatus,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ลบคำร้อง (สำหรับ Admin/Staff)
 */
export const deleteRequest = async (requestId) => {
  try {
    const response = await axiosClient.delete(`/requests/${requestId}/`);
    return response.data; 
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * อัปโหลดไฟล์แนบ
 */
export const uploadAttachment = async (requestId, formData) => {
  try {
    const response = await axiosClient.post(
      `/attachments/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ดึงรายชื่อผู้ใช้ทั้งหมด (สำหรับ Admin/Staff)
 */
export const fetchAllUsers = async () => {
  try {
    const response = await axiosClient.get('/users/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * เปลี่ยน Role ของผู้ใช้ (Role Promotion)
 */
export const updateRole = async (userId, newRole) => {
  try {
    console.log('🔍 updateRole API called:', { userId, newRole });
    
    const payload = { role: newRole };
    console.log('📤 Sending payload:', JSON.stringify(payload));
    
    const response = await axiosClient.post(`/users/${userId}/set_role/`, payload);
    
    console.log('✅ API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API Error:', error);
    console.error('❌ Error response:', error.response?.data);
    throw error.response?.data || error;
  }
};

/**
 * ดึงรายละเอียดคำร้องตาม ID
 */
export const fetchRequestById = async (requestId) => {
  try {
    const response = await axiosClient.get(`/requests/${requestId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * เพิ่มหมวดหมู่ใหม่ (สำหรับ Staff/Advisor)
 */
export const addCategory = async (categoryName) => {
  try {
    const response = await axiosClient.post('/categories/', {
      name: categoryName,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ลบหมวดหมู่ (สำหรับ Staff/Advisor)
 */
export const deleteCategory = async (categoryId) => {
  try {
    const response = await axiosClient.delete(`/categories/${categoryId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * อัปเดตชื่อหมวดหมู่ (สำหรับ Staff/Advisor)
 */
export const updateCategory = async (categoryId, newName) => {
  try {
    const response = await axiosClient.put(`/categories/${categoryId}/`, {
      name: newName,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * สร้าง User ใหม่
 */
export const createNewUser = async (userData) => {
  try {
    const response = await axiosClient.post('/users/create/', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ลบผู้ใช้งาน (สำหรับ Admin)
 */
export const deleteUser = async (userId) => {
  try {
    const response = await axiosClient.delete(`/users/${userId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * แก้ไขข้อมูลผู้ใช้งาน (สำหรับ Admin)
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosClient.put(`/users/${userId}/`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ดึงการแจ้งเตือน
 */
export const fetchNotifications = async () => {
  try {
    const response = await axiosClient.get('/notifications/');
    return response.data.results;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * มาร์คว่าอ่านแล้ว
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axiosClient.post(
      `/notifications/${notificationId}/mark_as_read/`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};