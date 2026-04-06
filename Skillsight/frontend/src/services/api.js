import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://skillsight-backend-ylix.onrender.com";

console.log("Using API:", BASE_URL);

const API = axios.create({
  baseURL: BASE_URL,
});

// attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;