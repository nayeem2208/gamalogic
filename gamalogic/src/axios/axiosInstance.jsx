import axios from "axios";

// const baseURL ="http://localhost:3000/api/"
// const baseURL='https://app.gamalogic.com/api/'
const baseURL='https://beta.gamalogic.com/api/'
const axiosInstance = axios.create({
  baseURL,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('Gamalogic_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default axiosInstance;