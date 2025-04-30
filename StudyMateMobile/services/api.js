import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API temel URL - kendi IP adresinizi kullanın
const API_URL = "http://172.20.10.2:5000"; // X yerine kendi IP adresinizin son kısmını yazın

// API istemci instance'ı oluştur
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// İstek yapılmadan önce token ekle
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth servisler
export const authService = {
  // Giriş yapma
  login: async (username, password) => {
    const response = await apiClient.post("/api/users/login", {
      username,
      password,
    });
    if (response.data.token) {
      await AsyncStorage.setItem("userToken", response.data.token);
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(response.data.user)
      );
    }
    return response;
  },

  // Kayıt olma
  register: async (userData) => {
    const response = await apiClient.post("/api/users/register", {
      username: userData.username,
      name: userData.name,
      email: userData.email,
      password: userData.password,
    });
    return response;
  },

  // Şifre sıfırlama isteği
  forgotPassword: (email) =>
    apiClient.post("/api/users/forgot-password", { email }),

  // Şifre sıfırlama
  resetPassword: (token, password) =>
    apiClient.post("/api/users/reset-password", { token, password }),

  // Profil bilgilerini getir
  getProfile: () => apiClient.get("/api/users/me"),

  // Profil güncelleme
  updateProfile: (userData) =>
    apiClient.put("/api/users/update-profile", userData),

  // Profil resmi yükleme
  uploadProfileImage: async (imageFile) => {
    const formData = new FormData();
    formData.append("profileImage", {
      uri: imageFile.uri,
      type: "image/jpeg",
      name: "profile-image.jpg",
    });

    return await apiClient.post("/api/users/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// Schedule servisler
export const scheduleService = {
  getEvents: () => apiClient.get("/api/schedule/events"),
  addEvent: (eventData) => apiClient.post("/api/schedule/events", eventData),
  updateEvent: (id, eventData) =>
    apiClient.put(`/api/schedule/events/${id}`, eventData),
  deleteEvent: (id) => apiClient.delete(`/api/schedule/events/${id}`),
};

// Statistics servisler
export const statsService = {
  getStats: () => apiClient.get("/api/users/stats"),
};
