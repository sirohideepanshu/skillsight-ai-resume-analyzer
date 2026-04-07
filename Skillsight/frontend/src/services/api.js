import axios from "axios";

const API = axios.create({
  baseURL: "https://skillsight-backend-ylix.onrender.com/api",
});

/* DEBUG (remove later) */
console.log("API BASE URL:", API.defaults.baseURL);

/* attach token */
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
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