import axiosClient from './axiosClient';

/**
 * ดึงรายการคำร้องทั้งหมดของ User ที่ Login อยู่ (สำหรับ Student Dashboard)
 */
export const fetchRequests = async () => {
    try {
        const response = await axiosClient.get('/requests/');
        // คืนค่าเฉพาะ results (รายการคำร้อง)
        return response.data.results; 
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * ดึงรายการคำร้องทั้งหมดสำหรับ Staff/Advisor
 * Endpoint นี้จะถูกปกป้องด้วย is_advisor
 * @returns {Promise<Array>} รายการคำร้องทั้งหมด
 */
export const fetchAllRequests = async () => {
    try {
        // ใช้ Endpoint เดียวกับ Student แต่ Backend จะรู้ว่าต้องคืนค่าทั้งหมด
        const response = await axiosClient.get('/requests/');
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
        return response.data; 
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
            request_type_id: requestTypeId,
            details: details,
        });
        return response.data; 
    } catch (error) {
        throw error.response?.data || error;
    }
};