import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
});

export const fetchUsers = () => apiClient.get('/users');
export const makePayment = (data: any) => apiClient.post('/payment', data);
