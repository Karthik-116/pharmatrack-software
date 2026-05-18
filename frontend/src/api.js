import axios from 'axios';

// Vite automatically sets import.meta.env.PROD to true when compiling for Vercel
const api = axios.create({
  baseURL: import.meta.env.PROD
    ? 'https://pharmatrack-software.onrender.com' // 🚀 Your Live Cloud Backend (Render)
    : 'http://localhost:8000',                    // 💻 Your Local Development Backend (Uvicorn)
});

export default api;