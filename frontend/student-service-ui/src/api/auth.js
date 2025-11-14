import axiosClient from './axiosClient'; 

const DEFAULT_REGISTER_ROLE = 'student'; 


export const loginUser = async (username, password) => {
  try {

    const tokenResponse = await axiosClient.post(`/token/`, { 
      username: username,
      password: password,
    });

    const tokens = tokenResponse.data; 


    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;

 
    const userResponse = await axiosClient.get(`/users/me/`);
    
    console.log('🔍 API /users/me/ response:', userResponse.data);
    console.log('🔍 User role from API:', userResponse.data.profile?.role);

   
    return {
      access: tokens.access,
      refresh: tokens.refresh,
      ...userResponse.data, 
    };

  } catch (error) {
    throw error.response?.data || error; 
  }
};


export const fetchCurrentUser = async () => { 
  try {
    const response = await axiosClient.get(`/users/me/`); 
    return response.data; 

  } catch (error) {
    throw error.response?.data || error; 
  }
};


export const registerUser = async (userData) => { 
   
    const endpoint = `/register/${DEFAULT_REGISTER_ROLE}/`; 
    
    try {
        const response = await axiosClient.post(endpoint, userData); 
        return response.data; 
    } catch (error) {
        throw error.response?.data || error; 
    }
};