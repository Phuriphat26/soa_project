import axios from 'axios';
import useAuthStore from '../stores/authStore';

// 1. สร้าง Instance ของ Axios Client 
const axiosClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // ต้องตรงกับ URL ของ Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor: ดักจับทุก Request ก่อนส่งออกไป
axiosClient.interceptors.request.use(
  (config) => {
    // ดึง Token ปัจจุบันจาก Global Store
    const token = useAuthStore.getState().token; 
    
    // ถ้ามี Token อยู่ ให้เพิ่ม Authorization Header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor: ดักจับทุก Response เพื่อจัดการ Error เช่น 401
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // ถ้าเจอ Error 401 (Token หมดอายุ/ไม่ถูกต้อง) ให้บังคับ Logout
    if (error.response && error.response.status === 401) {
      // ใช้ action logout จาก Global Store
      useAuthStore.getState().logout(); 
      // นำผู้ใช้ไปหน้า Login
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default axiosClient;