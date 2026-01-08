import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });

    return response.data;
};

export const getEmployees = async () => {
    const response = await api.get('/employees');
    return response.data;
};

export const getEmployee = async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
};

export const getMonthlyTimecard = async (employeeId, month) => {
    const response = await api.get(`/workday/${employeeId}/${month}`);
    return response.data;
};

export const generateWorkdays = async (employeeId, startDate, endDate) => {
    const response = await api.post(`/workday/${employeeId}/generate`, {
        startDate,
        endDate
    });
    return response.data;
};

export const updateWorkday = async (workdayId, updates) => {
    const response = await api.put(`/workday/${workdayId}`, updates);
    return response.data;
};

export const getWorkdayHistory = async (workdayId) => {
    const response = await api.get(`/workday/${workdayId}/history`);
    return response.data;
};

export const downloadPDF = (employeeId, month) => {
    window.open(`${API_BASE_URL}/export/pdf/${employeeId}/${month}`, '_blank');
};

export const downloadExcel = (employeeId, month) => {
    window.open(`${API_BASE_URL}/export/excel/${employeeId}/${month}`, '_blank');
};

export default api;
