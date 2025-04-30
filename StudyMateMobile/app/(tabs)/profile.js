import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { authService } from "../../services/api";
import { useNavigation } from "@react-navigation/native";
import { getUserData, getUserToken } from "../../utils/storage";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState({
    username: "",
    name: "",
    email: "",
    profileImage: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getProfile();
      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Kullanıcı bilgileri alınamadı:", error);
      // Yedek olarak lokalde saklanan bilgileri kullan
      const userData = await getUserData();
      if (userData) {
        setUser(userData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePick = async () => {
    // Expo ImagePicker'ı yüklemeniz gerekebilir:
    // npx expo install expo-image-picker
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Galeriye erişim izni vermeniz gerekiyor");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadProfileImage(result.assets[0]);
    }
  };

  const uploadProfileImage = async (imageFile) => {
    try {
      setIsLoading(true);
      const formData = new FormData();

      // Dosya nesnesini oluştur
      const fileUri = imageFile.uri;
      const filename = fileUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image";

      formData.append("profileImage", {
        uri: Platform.OS === "ios" ? fileUri.replace("file://", "") : fileUri,
        name: filename,
        type,
      });

      const token = await getUserToken();

      const response = await fetch(
        "http://192.168.1.105:5000/api/users/profile-image",
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUser((prev) => ({ ...prev, profileImage: data.profileImage }));
        Alert.alert("Başarılı", "Profil resmi güncellendi");
      } else {
        Alert.alert("Hata", data.message || "Resim yüklenemedi");
      }
    } catch (error) {
      console.error("Profil resmi yükleme hatası:", error);
      Alert.alert("Hata", "Profil resmi yüklenirken bir sorun oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  // Örnek istatistik verileri
  const userStats = {
    totalStudyTime: "124 saat",
    weeklyAverage: "18 saat",
    longestStreak: "12 gün",
    totalTasks: "156",
    completedTasks: "134",
    efficiency: "86%",
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <ScrollView>
        {/* Profil Başlığı */}
        <View style={styles.header}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <TouchableOpacity
                onPress={handleImagePick}
                style={styles.profileImageWrapper}
              >
                {user.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={styles.profileImage}
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="person" size={40} color="#2563eb" />
                  </View>
                )}
                <View style={styles.editIcon}>
                  <Ionicons name="pencil" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.username}>
                {user.username || "Kullanıcı"}
              </Text>
              <Text style={styles.email}>{user.email || "Email"}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate("settings")}
          >
            <Ionicons name="settings-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* İstatistikler */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>İstatistiklerim</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={24} color="#2563eb" />
              <Text style={styles.statValue}>{userStats.totalStudyTime}</Text>
              <Text style={styles.statLabel}>Toplam Çalışma</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="analytics-outline" size={24} color="#8b5cf6" />
              <Text style={styles.statValue}>{userStats.weeklyAverage}</Text>
              <Text style={styles.statLabel}>Haftalık Ortalama</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="flame-outline" size={24} color="#f59e0b" />
              <Text style={styles.statValue}>{userStats.longestStreak}</Text>
              <Text style={styles.statLabel}>En Uzun Seri</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons
                name="checkmark-done-outline"
                size={24}
                color="#10b981"
              />
              <Text style={styles.statValue}>{userStats.efficiency}</Text>
              <Text style={styles.statLabel}>Verimlilik</Text>
            </View>
          </View>
        </View>

        {/* Hızlı İşlemler */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#e1f0ff" }]}
            >
              <Text style={[styles.actionButtonText, { color: "#2563eb" }]}>
                Yeni Görev Ekle
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#e1faef" }]}
              onPress={() => navigation.navigate("schedule")}
            >
              <Text style={[styles.actionButtonText, { color: "#10b981" }]}>
                Çalışma Planı Oluştur
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#f3e8ff" }]}
            >
              <Text style={[styles.actionButtonText, { color: "#8b5cf6" }]}>
                Takvimi Görüntüle
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImageWrapper: {
    position: "relative",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f0f0",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e1f0ff",
    justifyContent: "center",
    alignItems: "center",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#2563eb",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  email: {
    fontSize: 14,
    color: "#666",
  },
  settingsButton: {
    padding: 10,
  },
  statsContainer: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "48%",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  actionsContainer: {
    backgroundColor: "white",
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 30,
    borderRadius: 12,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
