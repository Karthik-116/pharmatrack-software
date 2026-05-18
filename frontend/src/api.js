import axios from 'axios';

const api = axios.create({
  baseURL: 'https://pharmatrack-software.onrender.com',
});

export default api;
