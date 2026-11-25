import axios from "axios";
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });
const KEY = "plx_token"; // token only; passwords and secrets are never stored in the browser
api.interceptors.request.use((c) => { const t = sessionStorage.getItem(KEY) || localStorage.getItem(KEY); if (t) c.headers.Authorization = `Bearer ${t}`; return c; });
export const errMsg = (e: any) => e?.response?.data?.error || "Could not reach the server. Is the API running on port 4000?";
export const setSession = (token: string | null, remember = false) => {
  sessionStorage.removeItem(KEY); localStorage.removeItem(KEY);
  if (token) (remember ? localStorage : sessionStorage).setItem(KEY, token);
};
export const hasSession = () => !!(sessionStorage.getItem(KEY) || localStorage.getItem(KEY));