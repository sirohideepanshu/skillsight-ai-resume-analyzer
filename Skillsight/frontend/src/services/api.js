import axios from "axios";
import { clearAuthSession } from "../utils/authSession";

const DEFAULT_API_URL = import.meta.env.DEV
  ? "http://localhost:5050/api"
  : "https://skillsight-backend-ylix.onrender.com/api";

/*
 * Normalize whatever VITE_API_URL is configured in the deploy env. We've hit
 * misconfigured values like "https://host.onrender.com " (trailing space) or
 * one missing the "/api" suffix, which produce unparseable request URLs such
 * as "https://host.onrender.com /auth/login". Trim surrounding whitespace,
 * drop any trailing slashes, and guarantee the "/api" suffix so endpoints like
 * "/auth/login" always resolve correctly.
 */
function normalizeApiBaseUrl(raw) {
  const value = (raw || "").trim();
  if (!value) return DEFAULT_API_URL;

  const withoutTrailingSlash = value.replace(/\/+$/, "");

  if (/\/api$/i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  return `${withoutTrailingSlash}/api`;
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

/*
 * The backend runs on Render's free tier, which spins the instance down after
 * ~15 min of inactivity. The first request after that (or right after a deploy)
 * fails with a network error / 502-503 while the instance cold-starts, which
 * used to surface to users as "server down". We instead retry transparently
 * with backoff for ~90s and broadcast lifecycle events so the UI can show a
 * non-blocking "waking up" notice rather than an error.
 */
const MAX_RETRIES = 6;
const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 15000, 20000];

const COLD_START_STATUSES = new Set([429, 502, 503, 504]);

function isColdStartError(err) {
  // No response at all => network error / connection refused / timeout.
  if (!err.response) return true;
  return COLD_START_STATUSES.has(err.response.status);
}

function emit(name) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(name));
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const API = axios.create({
  baseURL: API_BASE_URL,
  // Per-attempt cap so a hung cold-starting instance fails fast and we can retry.
  timeout: 30000,
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
  (res) => {
    // A successful response means the server is awake again.
    emit("server:awake");
    return res;
  },
  async (err) => {
    const config = err.config;

    // Retry cold-start failures transparently.
    if (config && isColdStartError(err)) {
      config.__retryCount = config.__retryCount || 0;

      if (config.__retryCount < MAX_RETRIES) {
        const attempt = config.__retryCount;
        config.__retryCount += 1;

        emit("server:waking");
        await delay(RETRY_DELAYS_MS[attempt] ?? 20000);

        return API(config);
      }

      // Retries exhausted: the server is genuinely unreachable.
      emit("server:down");
    }

    console.error("API ERROR:", err.response?.data || err.message);

    if (err.response?.status === 401 && typeof window !== "undefined") {
      clearAuthSession();

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default API;
