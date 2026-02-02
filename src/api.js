import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Points to your Node.js backend
});

// Automatically add the Token to requests if logged in
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
