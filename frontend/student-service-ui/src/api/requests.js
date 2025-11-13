import axiosClient from './axiosClient';

/**
 * ดึงรายการคำร้องทั้งหมดของ User ที่ Login อยู่ (สำหรับ Student Dashboard)
 */
// ... (existing code) ...
export const fetchRequests = async () => {
  try {
    const response = await axiosClient.get('/requests/');
    return response.data.results;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ดึงรายการคำร้องทั้งหมดสำหรับ Staff/Advisor
 */
// ... (existing code) ...
export const fetchAllRequests = async () => {
  try {
    const response = await axiosClient.get('/requests/');
    return response.data.results;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ดึงรายการหมวดหมู่หลักทั้งหมด (Dropdown 1)
 */
// ... (existing code) ...
export const fetchCategories = async () => {
  try {
    const response = await axiosClient.get('/categories/');
    // ⭐️ Backend (CategoryViewSet) ที่อัปเดตแล้วจะส่ง Array ตรงๆ
    const data = response.data;
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ดึงรายการประเภทคำร้อง (ฟอร์มย่อย) ตาม Category ID (Dropdown 2)
 */
// ... (existing code) ...
export const fetchRequestTypes = async (categoryId) => {
  try {
    const response = await axiosClient.get(
      `/request-types/?category=${categoryId}`
    );
    return response.data.results;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ยื่นคำร้องใหม่ (POST)
 */
// ... (existing code) ...
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
// ... (existing code) ...
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
 * (เพิ่มฟังก์ชันที่ขาดไป) อัปโหลดไฟล์แนบ
 */
// ... (existing code) ...
export const uploadAttachment = async (requestId, formData) => {
  try {
    const response = await axiosClient.post(
      `/requests/${requestId}/attachments/`,
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

// ⭐️ ฟังก์ชันใหม่: ดึงรายชื่อผู้ใช้ทั้งหมด (สำหรับ Admin/Staff)
// ... (existing code) ...
export const fetchAllUsers = async () => {
  try {
    const response = await axiosClient.get('/users/');
    // ⭐️ UserListView ที่เราสร้างใน Django จะส่ง Array ตรงๆ
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ⭐️ ฟังก์ชันใหม่: เปลี่ยน Role ของผู้ใช้ (Role Promotion)
 */
// ... (existing code) ...
export const updateRole = async (userId, newRole) => {
  try {
    // ⭐️ เรียก API (SetUserRoleView) ที่เราสร้างใน Django
    const response = await axiosClient.post(`/users/${userId}/set_role/`, {
      role: newRole,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ⭐️ ฟังก์ชันใหม่: ดึงรายละเอียดคำร้องตาม ID
 */
// ... (existing code) ...
export const fetchRequestById = async (requestId) => {
  try {
    const response = await axiosClient.get(`/requests/${requestId}/`);
    return response.data; // คืนค่า Object คำร้อง
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ⭐️ ฟังก์ชันใหม่: เพิ่มหมวดหมู่ใหม่ (สำหรับ Staff/Advisor)
 */
// ... (existing code) ...
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
 * ⭐️ ฟังก์ชันใหม่: ลบหมวดหมู่ (สำหรับ Staff/Advisor)
 */
// ... (existing code) ...
export const deleteCategory = async (categoryId) => {
  try {
    const response = await axiosClient.delete(`/categories/${categoryId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ⭐️ ฟังก์ชันใหม่: อัปเดตชื่อหมวดหมู่ (สำหรับ Staff/Advisor)
 */
// ... (existing code) ...
export const updateCategory = async (categoryId, newName) => {
  try {
    // ⭐️ 2. เปลี่ยนกลับไปใช้ PUT (เพราะ Django ModelViewSet รองรับ PUT)
    const response = await axiosClient.put(`/categories/${categoryId}/`, {
      name: newName,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- ⭐️ 1. เพิ่มฟังก์ชันนี้สำหรับสร้าง User ใหม่ ⭐️ ---
// ... (existing code) ...
export const createNewUser = async (userData) => {
  try {
    // ⭐️ เราจะ POST ไปที่ Endpoint /api/users/create/ ที่เราจะสร้างใน Backend
    const response = await axiosClient.post('/users/create/', userData);
    return response.data;
  } catch (error) {
    // ⭐️ จัดการ Error ที่ Backend อาจส่งกลับมา (เช่น Username ซ้ำ)
    throw error.response?.data || error;
  }
};

// --- ⭐️ 2. เพิ่มฟังก์ชันสำหรับ "ลบ" และ "แก้ไข" User ⭐️ ---

/**
 * ลบผู้ใช้งาน (สำหรับ Admin)
 */
export const deleteUser = async (userId) => {
  try {
    // เราจะ DELETE ไปที่ Endpoint /api/users/<id>/ ที่เราจะสร้างใน Backend
    const response = await axiosClient.delete(`/users/${userId}/`);
    return response.data; // (ปกติจะคืนค่าว่าง 204)
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * แก้ไขข้อมูลผู้ใช้งาน (สำหรับ Admin)
 * (userData ควรมีแค่ username และ email)
 */
export const updateUser = async (userId, userData) => {
  try {
    // เราจะ PUT (หรือ PATCH) ไปที่ Endpoint /api/users/<id>/
    const response = await axiosClient.put(`/users/${userId}/`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};