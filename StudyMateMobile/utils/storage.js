import AsyncStorage from "@react-native-async-storage/async-storage";

// Token kaydetme
export const storeUserToken = async (token) => {
  try {
    await AsyncStorage.setItem("userToken", token);
    return true;
  } catch (e) {
    console.error("Token kaydedilirken hata:", e);
    return false;
  }
};

// Token alma
export const getUserToken = async () => {
  try {
    return await AsyncStorage.getItem("userToken");
  } catch (e) {
    console.error("Token alınırken hata:", e);
    return null;
  }
};

// Token silme (çıkış yapma)
export const removeUserToken = async () => {
  try {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
    return true;
  } catch (e) {
    console.error("Token silinirken hata:", e);
    return false;
  }
};

// Kullanıcı verilerini kaydetme
export const storeUserData = async (userData) => {
  try {
    await AsyncStorage.setItem("userData", JSON.stringify(userData));
    return true;
  } catch (e) {
    console.error("Kullanıcı verileri kaydedilirken hata:", e);
    return false;
  }
};

// Kullanıcı verilerini alma
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.error("Kullanıcı verileri alınırken hata:", e);
    return null;
  }
};
