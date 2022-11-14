import axios from 'axios';
// config
import { AUTH_API } from '../config';

// ----------------------------------------------------------------------

console.log(AUTH_API);

const axiosInstance = axios.create({
  baseURL: AUTH_API,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;
