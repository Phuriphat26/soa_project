import axiosClient from './axiosClient';

/**
 * ดึงรายการคำร้องทั้งหมดของ User ที่ Login อยู่ (สำหรับ Student Dashboard)
 */
export const fetchRequests = async () => {
  try {
    const response = await axiosClient.get('/requests/');
    return response.data;
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
    return response.data;
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
export const fetchRequestTypes = async (categoryId) => {
  try {
    const response = await axiosClient.get(
      `/request-types/?category=${categoryId}`
    );
    // ⭐️ [แก้ไข] เปลี่ยนจาก response.data.results เป็นแบบนี้
    const data = response.data;
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- ⭐️ [เพิ่มใหม่] ฟังก์ชันสำหรับ RequestTypeManagement ⭐️ ---

/**
 * ⭐️ [เพิ่มใหม่] เพิ่มประเภทคำร้องใหม่ (สำหรับ Staff/Advisor)
 * รับข้อมูลเป็น Object
 */
export const addRequestType = async (requestTypeData) => {
  try {
    // requestTypeData คือ { name: '...', category: 1 }
    const response = await axiosClient.post('/request-types/', requestTypeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ⭐️ [เพิ่มใหม่] ลบประเภทคำร้อง (สำหรับ Staff/Advisor)
 */
export const deleteRequestType = async (typeId) => {
  try {
    const response = await axiosClient.delete(`/request-types/${typeId}/`);
    return response.data; // ปกติจะคืนค่าว่าง (204)
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ⭐️ [เพิ่มใหม่] อัปเดตประเภทคำร้อง (สำหรับ Staff/Advisor)
 * (ใช้ PATCH เพื่ออัปเดตแค่บางฟิลด์ เช่น ชื่อ)
 */
export const updateRequestType = async (typeId, data) => {
  try {
    // data คือ { name: 'ชื่อใหม่' }
    const response = await axiosClient.patch(`/request-types/${typeId}/`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- ⭐️ (โค้ดเดิมของคุณ) ⭐️ ---

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


// ⭐️⭐️⭐️ [เพิ่มโค้ดนี้] ⭐️⭐️⭐️
/**
 * ⭐️ [เพิ่มใหม่] ลบคำร้อง (สำหรับ Admin/Staff)
 */
export const deleteRequest = async (requestId) => {
  try {
    const response = await axiosClient.delete(`/requests/${requestId}/`);
    return response.data; 
  } catch (error) {
    throw error.response?.data || error;
  }
};
// ⭐️⭐️⭐️ [สิ้นสุดโค้ดที่เพิ่ม] ⭐️⭐️⭐️


/**
 * อัปโหลดไฟล์แนบ
 */
export const uploadAttachment = async (requestId, formData) => {
  try {
    // ⭐️ [แก้ไข 1/3] เปลี่ยน URL
    const response = await axiosClient.post(
      `/attachments/`, // ✅ URL นี้ถูกต้อง
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

export const fetchNotifications = async () => {
  try {
    const response = await axiosClient.get('/notifications/');
    // ✅ แกะเอาเฉพาะ Array ที่ชื่อ 'results' ออกมา
    return response.data.results;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * ⭐️ ฟังก์ชันใหม่: มาร์คว่าอ่านแล้ว
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    // (NotificationViewSet ของคุณมี @action 'mark_as_read' อยู่แล้ว)
    const response = await axiosClient.post(
      `/notifications/${notificationId}/mark_as_read/`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};