import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  /** Avoid hung “pending” requests when the reverse proxy or API is unreachable */
  timeout: 15_000,
});

export default api;
