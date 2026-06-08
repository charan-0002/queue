import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://fresh-islands-hunt.loca.lt";
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ 
  baseURL: API,
  headers: {
    'Bypass-Tunnel-Reminder': 'true' // In case localtunnel is used
  }
});

api.interceptors.request.use((config) => {
  const session = localStorage.getItem("docqueue_session");
  if (session) {
    const { token } = JSON.parse(session);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const listHospitals = (params) => api.get("/hospitals", { params }).then(r => r.data);
export const getHospital = (id) => api.get(`/hospitals/${id}`).then(r => r.data);
export const checkin = (id, payload) => api.post(`/patients/checkin`, { ...payload, hospitalId: id }).then(r => r.data);
export const trackToken = (token) => api.get(`/queue/${token}`).then(r => r.data);
export const adminQueue = (id) => api.get(`/hospitals/${id}/queue`).then(r => r.data);
export const callEntry = (entryId) => api.put(`/hospitals/advance`, { patientId: entryId, newStatus: 'in-consultation' }).then(r => r.data);
export const completeEntry = (entryId) => api.put(`/hospitals/advance`, { patientId: entryId, newStatus: 'completed' }).then(r => r.data);
export const skipEntry = (entryId) => api.delete(`/patients/${entryId}/leave`).then(r => r.data);
export const deleteEntry = (entryId) => api.delete(`/patients/${entryId}`).then(r => r.data);
export const updateHospitalSettings = (id, payload) => api.put(`/hospitals/${id}/settings`, payload).then(r => r.data);
export const listCities = () => api.get("/cities").then(r => r.data);
export const listSpecialties = () => api.get("/specialties").then(r => r.data);
export const login = (credentials) => api.post("/auth/login", credentials).then(r => r.data);
export const registerHospital = (hospitalData) => api.post("/hospitals/register", hospitalData).then(r => r.data);
