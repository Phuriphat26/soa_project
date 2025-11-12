// src/api/auth.js

// เปลี่ยนจาก import axios เป็น import axiosClient
import axiosClient from './axiosClient'; 

// *** ฟังก์ชัน Login (POST /api/token/) - ใช้ axiosClient ได้เลย ***
export const loginUser = async (username, password) => {
  try {
    // ไม่ต้องระบุ URL เต็ม เพราะ axiosClient มี baseURL แล้ว
    const response = await axiosClient.post(`/token/`, { 
      username: username,
      password: password,
    });
    return response.data; 

  } catch (error) {
    throw error.response.data; 
  }
};

// *** ฟังก์ชัน Fetch User (GET /api/users/me/) - ไม่ต้องส่ง Token อีกแล้ว ***
export const fetchCurrentUser = async () => { // ลบ (token) ออก
  try {
    const response = await axiosClient.get(`/users/me/`); // ไม่ต้องใส่ headers แล้ว
    return response.data; 

  } catch (error) {
    throw error.response.data; 
  }
};