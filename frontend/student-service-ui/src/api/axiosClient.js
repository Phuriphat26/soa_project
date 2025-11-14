import axios from 'axios';
import useAuthStore from '../stores/authStore';


const axiosClient = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});


axiosClient.interceptors.request.use(
  (config) => {

    const token = useAuthStore.getState().token; 
    

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    if (error.response && error.response.status === 401) {

      useAuthStore.getState().logout(); 

      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default axiosClient;