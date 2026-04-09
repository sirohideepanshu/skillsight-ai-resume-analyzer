import axios from "axios";

const API = axios.create({
  baseURL: "https://skillsight-backend-ylix.onrender.com/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* handle errors globally */
API.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API ERROR:", err.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default API;
