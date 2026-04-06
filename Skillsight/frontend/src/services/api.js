import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

console.log("API BASE URL:", import.meta.env.VITE_API_URL);

if (!BASE_URL) {
  console.error("❌ VITE_API_URL is NOT defined. Check Vercel env settings.");
}

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
