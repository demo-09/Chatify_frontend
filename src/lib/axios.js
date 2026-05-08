import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: "https://chatify-backend-shes.onrender.com/api",
    withCredentials: true,
});