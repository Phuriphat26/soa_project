// ไฟล์: src/api/auth.js

import axiosClient from './axiosClient'; 

// ⭐️ กำหนดค่าเริ่มต้นของ Role สำหรับการลงทะเบียนอัตโนมัติ
// ล็อกให้เป็น 'student' เสมอ ตามแผน B
const DEFAULT_REGISTER_ROLE = 'student'; 

// *** ฟังก์ชัน Login ***
export const loginUser = async (username, password) => {
  try {
    const response = await axiosClient.post(`/token/`, { 
      username: username,
      password: password,
    });
    return response.data; 

  } catch (error) {
    throw error.response?.data || error; 
  }
};

// *** ฟังก์ชัน Fetch User ***
export const fetchCurrentUser = async () => { 
  try {
    const response = await axiosClient.get(`/users/me/`); 
    return response.data; 

  } catch (error) {
    throw error.response?.data || error; 
  }
};

// ⭐️ ฟังก์ชัน Register User (ใช้ Role ที่ถูกล็อกไว้)
export const registerUser = async (userData) => { 
    // Endpoint จะถูกล็อกเป็น /register/student/
    const endpoint = `/register/${DEFAULT_REGISTER_ROLE}/`; 
    
    try {
        const response = await axiosClient.post(endpoint, userData); 
        return response.data; 
    } catch (error) {
        throw error.response?.data || error; 
    }
};