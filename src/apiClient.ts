import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000/api/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add token to requests if available
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
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
      // Only redirect if we're not already on the login page
      // and token exists (meaning it was rejected, not missing)
      const token = localStorage.getItem("access_token");
      const currentPath = window.location.pathname;
      
      if (token && currentPath !== "/login") {
        console.warn("[Auth] Received 401 - Token may be invalid or expired");
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        // Give a small delay to allow other async operations to complete
        setTimeout(() => {
          window.location.href = "/login";
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
