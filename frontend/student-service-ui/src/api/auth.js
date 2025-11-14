import axiosClient from './axiosClient'; 

// ⭐️ กำหนดค่าเริ่มต้นของ Role สำหรับการลงทะเบียนอัตโนมัติ
// ล็อกให้เป็น 'student' เสมอ ตามแผน B
const DEFAULT_REGISTER_ROLE = 'student'; 

// *** ฟังก์ชัน Login ***
// ⭐️ แก้ไข: ดึง user data หลังจาก login
export const loginUser = async (username, password) => {
  try {
    // 1. Login ได้ token
    const tokenResponse = await axiosClient.post(`/token/`, { 
      username: username,
      password: password,
    });

    const tokens = tokenResponse.data; // { access, refresh }

    // 2. ตั้ง token ให้ axiosClient เพื่อใช้ในการ request ต่อไป
    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;

    // 3. ดึง user data เพิ่มเติม
    const userResponse = await axiosClient.get(`/users/me/`);

    // 4. Return ทั้ง token และ user data
    return {
      access: tokens.access,
      refresh: tokens.refresh,
      user: userResponse.data,
    };

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