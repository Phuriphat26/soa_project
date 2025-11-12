import axiosClient from './axiosClient';

/**
 * ดึงรายการคำร้องทั้งหมดของ User ที่ Login อยู่ (สำหรับ Student Dashboard)
 */
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
 * (หมายเหตุ: Backend logic เดียวกับ fetchRequests, Django จะกรองตาม Role ให้เอง)
 */
export const fetchAllRequests = async () => {
    try {
        const response = await axiosClient.get('/requests/');
        // ⭐️ Backend (RequestSerializer) ที่แก้ไขแล้วจะส่ง JSON ที่ถูกต้องมาให้
        return response.data.results; 
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
        return response.data.results; 
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * ดึงรายการประเภทคำร้อง (ฟอร์มย่อย) ตาม Category ID (Dropdown 2)
 */
export const fetchRequestTypes = async (categoryId) => {
    try {
        const response = await axiosClient.get(`/request-types/?category=${categoryId}`);
        return response.data.results; 
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
            details: details
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * ⭐️⭐️⭐️ ฟังก์ชันนี้ถูกต้องแล้ว ⭐️⭐️⭐️
 * อัปเดตสถานะคำร้อง (สำหรับ Advisor/Staff)
 * มันจะเรียก 'partial_update' ใน RequestViewSet ที่เราเพิ่งแก้ไข
 */
export const updateRequestStatus = async (requestId, newStatus) => {
    try {
        // ใช้ .patch('/requests/123/', { status: 'Approved' })
        const response = await axiosClient.patch(`/requests/${requestId}/`, { 
            status: newStatus 
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * (เพิ่มฟังก์ชันที่ขาดไป) อัปโหลดไฟล์แนบ
 */
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
export const fetchAllUsers = async () => {
    try {
        const response = await axiosClient.get('/users/'); 
        return response.data.results || response.data; 
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * ⭐️ ฟังก์ชันใหม่: เปลี่ยน Role ของผู้ใช้ (Role Promotion)
 */
export const updateRole = async (userId, newRole) => {
    try {
        const response = await axiosClient.post(`/users/${userId}/set_role/`, { 
            role: newRole
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