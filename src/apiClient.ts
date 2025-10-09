import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://heatmap-backend-eight.vercel.app/api/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add token to requests if available
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // localStorage.removeItem('access_token');
      // localStorage.removeItem('user');
      // window.location.href = '/login';
      console.log(
        'something went wrong that might refresh the page and push too login'
      );
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
