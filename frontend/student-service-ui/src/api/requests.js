import axiosClient from './axiosClient';

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

export const fetchAllRequests = async () => {
  try {
    const response = await axiosClient.get('/requests/');
    const data = response.data;
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const fetchCategories = async () => {
  try {
    const response = await axiosClient.get('/categories/');
    const data = response.data;
    return Array.isArray(data) ? data : data.results || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};


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


export const addRequestType = async (requestTypeData) => {
  try {
    const response = await axiosClient.post('/request-types/', requestTypeData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const deleteRequestType = async (typeId) => {
  try {
    const response = await axiosClient.delete(`/request-types/${typeId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const updateRequestType = async (typeId, data) => {
  try {
    const response = await axiosClient.patch(`/request-types/${typeId}/`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


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


export const deleteRequest = async (requestId) => {
  try {
    const response = await axiosClient.delete(`/requests/${requestId}/`);
    return response.data; 
  } catch (error) {
    throw error.response?.data || error;
  }
};


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


export const fetchAllUsers = async () => {
  try {
    const response = await axiosClient.get('/users/');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


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


export const fetchRequestById = async (requestId) => {
  try {
    const response = await axiosClient.get(`/requests/${requestId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


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


export const deleteCategory = async (categoryId) => {
  try {
    const response = await axiosClient.delete(`/categories/${categoryId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


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


export const createNewUser = async (userData) => {
  try {
    const response = await axiosClient.post('/users/create/', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const deleteUser = async (userId) => {
  try {
    const response = await axiosClient.delete(`/users/${userId}/`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const updateUser = async (userId, userData) => {
  try {
    const response = await axiosClient.put(`/users/${userId}/`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export const fetchNotifications = async () => {
  try {
    const response = await axiosClient.get('/notifications/');
    return response.data.results;
  } catch (error) {
    throw error.response?.data || error;
  }
};


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