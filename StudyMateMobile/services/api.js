import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// API base URL - mobil için düzelt
const API_BASE_URL = "http://192.168.1.100:5000"; // Android emulator için
// const API_BASE_URL = "http://localhost:5000"; // iOS simulator için
// const API_BASE_URL = "http://192.168.1.XXX:5000"; // Gerçek cihaz için (IP adresinizi yazın)

// API Client - Header formatını düzelt
const apiClient = {
  get: async (url, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...options.headers, // headers'ı doğru şekilde geç
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  post: async (url, data, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options.headers, // headers'ı doğru şekilde geç
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  put: async (url, data, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...options.headers, // headers'ı doğru şekilde geç
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  delete: async (url, options = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...options.headers, // headers'ı doğru şekilde geç
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

// Auth servisler
export const authService = {
  // Giriş yapma
  login: async (username, password) => {
    try {
      console.log("🔐 Giriş yapılıyor...", { username, password: "***" });
      const response = await apiClient.post("/api/users/login", {
        username,
        password,
      });

      console.log("✅ Giriş başarılı:", response);

      // Token'ı kaydet
      await AsyncStorage.setItem("userToken", response.token);
      await AsyncStorage.setItem("userData", JSON.stringify(response.user));

      console.log("💾 Token ve kullanıcı verisi kaydedildi");
      return response;
    } catch (error) {
      console.error("❌ Giriş hatası:", error);
      throw error;
    }
  },

  // Kayıt olma
  register: async (userData) => {
    try {
      const response = await apiClient.post("/api/users/register", userData);

      // Token'ı kaydet
      await AsyncStorage.setItem("userToken", response.token);
      await AsyncStorage.setItem("userData", JSON.stringify(response.user));

      return response;
    } catch (error) {
      console.error("❌ Kayıt hatası:", error);
      throw error;
    }
  },

  // Çıkış yapma
  logout: async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      console.log("🚪 Çıkış yapıldı");
    } catch (error) {
      console.error("❌ Çıkış hatası:", error);
    }
  },

  // Kullanıcı bilgileri
  getUserData: async () => {
    const userData = await AsyncStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  },

  // Eski fonksiyonları kaldır - artık kullanılmıyor
  /*
  getProfile: async () => { ... },
  updateProfile: async (userData) => { ... },
  getStats: async () => { ... },
  */
};

// Event servisler
export const eventService = {
  // Tüm etkinlikleri getir
  getAll: async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("Token bulunamadı");
      }

      console.log("🔍 Tüm etkinlikler getiriliyor...");
      const response = await apiClient.get("/api/events", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("📊 Tüm etkinlikler yanıtı:", response);
      return response;
    } catch (error) {
      console.error("❌ API Hatası:", error);
      throw error;
    }
  },

  // getByDate metodunu kaldır - sadece getEventsByDate kullan
  getEvents: async () => {
    return await eventService.getAll();
  },

  getEventsByDate: async (date) => {
    try {
      console.log("🔍 API: Tarih bazlı etkinlikler getiriliyor:", date);
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        throw new Error("Token bulunamadı");
      }

      console.log("🔑 Token gönderiliyor:", token.substring(0, 20) + "...");

      const response = await apiClient.get(`/api/events/date/${date}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📊 API Yanıtı:", response);
      return response;
    } catch (error) {
      console.error("❌ API Hatası:", error);
      throw error;
    }
  },

  // Etkinlik ekle
  createEvent: async (eventData) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("Token bulunamadı");
      }

      const response = await apiClient.post("/api/events", eventData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Etkinlik oluşturma hatası:", error);
      throw error;
    }
  },

  // Etkinlik güncelle
  updateEvent: async (eventId, eventData) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("Token bulunamadı");
      }

      const response = await apiClient.put(
        `/api/events/${eventId}`,
        eventData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("❌ Etkinlik güncelleme hatası:", error);
      throw error;
    }
  },

  // Etkinlik sil
  deleteEvent: async (eventId) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("Token bulunamadı");
      }

      const response = await apiClient.delete(`/api/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("❌ Etkinlik silme hatası:", error);
      throw error;
    }
  },
};

// AI servisler
export const aiService = {
  generateSchedule: async (date, message) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("Token bulunamadı");
      }

      console.log("🤖 AI isteği gönderiliyor:", { date, message });

      const response = await apiClient.post(
        "/api/ai/generate-schedule",
        { date, message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("🤖 AI yanıtı:", response);
      return response;
    } catch (error) {
      console.error("❌ AI isteği hatası:", error);
      throw error;
    }
  },

  // chat fonksiyonunu düzelt
  chat: async (message, date) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("Token bulunamadı");
      }

      const response = await apiClient.post(
        "/api/ai/generate-schedule",
        { date, message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response;
    } catch (error) {
      console.error("❌ AI chat hatası:", error);
      throw error;
    }
  },

  // Eski fonksiyonları kaldır
  /*
  generateSuggestions: async (date, userMessage) => { ... },
  */
};

// User servisler
export const userService = {
  // Profil bilgilerini getir
  getProfile: async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("Token bulunamadı");
      }

      const response = await apiClient.get("/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      console.error("❌ Profil getirme hatası:", error);
      throw error;
    }
  },

  // Profil güncelle
  updateProfile: async (userData) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("Token bulunamadı");
      }

      const response = await apiClient.put(
        "/api/users/update-profile",
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response;
    } catch (error) {
      console.error("❌ Profil güncelleme hatası:", error);
      throw error;
    }
  },

  // İstatistikleri getir
  getStats: async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        throw new Error("Token bulunamadı");
      }

      const response = await apiClient.get("/api/users/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response;
    } catch (error) {
      console.error("❌ İstatistik getirme hatası:", error);
      throw error;
    }
  },
};

// Test bağlantısı
export const testConnection = async () => {
  try {
    const response = await apiClient.get("/api/test");
    return true;
  } catch (error) {
    return false;
  }
};

// Test bağlantısı - AI
export const testAIConnection = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) {
      return false;
    }

    const response = await apiClient.get("/api/ai/test", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return true;
  } catch (error) {
    return false;
  }
};

// Debug fonksiyonu - temizle
export const debugStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log("🔍 AsyncStorage keys:", keys);
  } catch (error) {
    console.error("❌ Debug storage error:", error);
  }
};
