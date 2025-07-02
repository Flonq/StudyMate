import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { authService } from "../../services/api";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import * as ImagePicker from "expo-image-picker";
import { userService } from "../../services/api";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    profileImage: "",
    createdAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      console.log("👤 Kullanıcı bilgileri getiriliyor...");

      // userService.getProfile kullan, authService.getProfile değil
      const response = await userService.getProfile();
      console.log("✅ Kullanıcı bilgileri alındı:", response);

      setUser(response);
      setEditData({
        username: response.username || "",
        email: response.email || "",
        password: "",
      });
    } catch (error) {
      console.error("❌ Kullanıcı bilgileri alınamadı:", error);
      Alert.alert("Hata", "Kullanıcı bilgileri alınamadı");
    }
  };

  const handleImagePick = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

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
    } catch (error) {
      console.error("❌ Resim seçme hatası:", error);
      Alert.alert("Hata", "Resim seçilirken bir hata oluştu");
    }
  };

  const uploadProfileImage = async (imageFile) => {
    try {
      setLoading(true);
      // Burada profil resmi yükleme işlemi yapılacak
      // Şimdilik sadece local state'i güncelliyoruz
      setUser((prev) => ({ ...prev, profileImage: imageFile.uri }));
      Alert.alert("Başarılı", "Profil resmi güncellendi");
    } catch (error) {
      console.error("❌ Resim yükleme hatası:", error);
      Alert.alert("Hata", "Resim yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditData({
      username: user.username || "",
      email: user.email || "",
      password: "",
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    try {
      if (
        !editData.username.trim() ||
        !editData.email.trim() ||
        !editData.password.trim()
      ) {
        Alert.alert("Hata", "Lütfen tüm alanları doldurun");
        return;
      }

      setLoading(true);

      const response = await authService.updateProfile(editData);
      console.log("✅ Profil güncellendi:", response);

      setUser(response.user);
      setShowEditModal(false);
      Alert.alert("Başarılı", "Profil bilgileri güncellendi");
    } catch (error) {
      console.error("❌ Profil güncellenemedi:", error);
      Alert.alert(
        "Hata",
        error.message || "Profil güncellenirken bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Çıkış Yap", "Çıkış yapmak istediğinizden emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Bilinmiyor";
    try {
      return format(new Date(dateString), "d MMMM yyyy", { locale: tr });
    } catch (error) {
      return "Bilinmiyor";
    }
  };

  const ProfileInfoCard = ({ icon, title, value, onPress }) => (
    <TouchableOpacity style={styles.infoCard} onPress={onPress}>
      <View style={styles.infoCardContent}>
        <View style={styles.infoIcon}>
          <Ionicons name={icon} size={24} color="#667eea" />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>{title}</Text>
          <Text style={styles.infoValue}>{value}</Text>
        </View>
        {onPress && (
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
  );

  const ActionCard = ({
    icon,
    title,
    description,
    onPress,
    gradient,
    textColor = "white",
  }) => (
    <TouchableOpacity onPress={onPress} style={styles.actionCard}>
      <LinearGradient colors={gradient} style={styles.actionGradient}>
        <View style={styles.actionIcon}>
          <Ionicons name={icon} size={24} color={textColor} />
        </View>
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, { color: textColor }]}>
            {title}
          </Text>
          <Text
            style={[
              styles.actionDescription,
              { color: textColor, opacity: 0.8 },
            ]}
          >
            {description}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={textColor} />
      </LinearGradient>
    </TouchableOpacity>
  );

  if (loading && !user.name) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Profil bilgileri yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profil</Text>
            <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
              <Ionicons name="create-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Profil Resmi ve Temel Bilgiler */}
        <View style={styles.profileSection}>
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
                <View style={styles.defaultProfileImage}>
                  <Ionicons name="person" size={60} color="#9CA3AF" />
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user.name || "Kullanıcı"}</Text>
          <Text style={styles.userUsername}>
            @{user.username || "username"}
          </Text>
          <Text style={styles.memberSince}>
            Üye olma tarihi: {formatDate(user.createdAt)}
          </Text>
        </View>

        {/* Kullanıcı Bilgileri */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>👤 Kişisel Bilgiler</Text>
          <View style={styles.infoCards}>
            <ProfileInfoCard
              icon="person-outline"
              title="Ad Soyad"
              value={user.name || "Belirtilmemiş"}
            />
            <ProfileInfoCard
              icon="at-outline"
              title="Kullanıcı Adı"
              value={user.username || "Belirtilmemiş"}
            />
            <ProfileInfoCard
              icon="mail-outline"
              title="E-posta"
              value={user.email || "Belirtilmemiş"}
            />
            <ProfileInfoCard
              icon="calendar-outline"
              title="Üyelik Tarihi"
              value={formatDate(user.createdAt)}
            />
          </View>
        </View>

        {/* Hızlı Eylemler */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>⚡ Hızlı Eylemler</Text>
          <View style={styles.actionsList}>
            <ActionCard
              icon="create-outline"
              title="Profili Düzenle"
              description="Kişisel bilgilerinizi güncelleyin"
              onPress={handleEdit}
              gradient={["#667eea", "#764ba2"]}
            />
            <ActionCard
              icon="calendar-outline"
              title="Takvimi Görüntüle"
              description="Etkinliklerinizi inceleyin"
              onPress={() => router.push("/(tabs)/schedule")}
              gradient={["#4facfe", "#00f2fe"]}
            />
            <ActionCard
              icon="settings-outline"
              title="Uygulama Ayarları"
              description="Tercihleri özelleştirin"
              onPress={() => router.push("/(tabs)/settings")}
              gradient={["#43e97b", "#38f9d7"]}
            />
            <ActionCard
              icon="log-out-outline"
              title="Çıkış Yap"
              description="Hesabınızdan güvenli çıkış yapın"
              onPress={handleLogout}
              gradient={["#ff6b6b", "#ee5a52"]}
            />
          </View>
        </View>

        {/* Alt boşluk */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Düzenleme Modal'ı */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancelButton}>İptal</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Profili Düzenle</Text>
            <TouchableOpacity onPress={handleSave} disabled={loading}>
              <Text
                style={[
                  styles.modalSaveButton,
                  loading && styles.disabledButton,
                ]}
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Kullanıcı Adı</Text>
              <TextInput
                style={styles.input}
                value={editData.username}
                onChangeText={(text) =>
                  setEditData((prev) => ({ ...prev, username: text }))
                }
                placeholder="Kullanıcı adınızı girin"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-posta</Text>
              <TextInput
                style={styles.input}
                value={editData.email}
                onChangeText={(text) =>
                  setEditData((prev) => ({ ...prev, email: text }))
                }
                placeholder="E-posta adresinizi girin"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mevcut Şifre</Text>
              <TextInput
                style={styles.input}
                value={editData.password}
                onChangeText={(text) =>
                  setEditData((prev) => ({ ...prev, password: text }))
                }
                placeholder="Mevcut şifrenizi girin"
                secureTextEntry
              />
              <Text style={styles.inputHelper}>
                Değişiklikleri kaydetmek için mevcut şifrenizi girmeniz
                gerekiyor
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  editButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  defaultProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  memberSince: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  infoCards: {
    gap: 12,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F0F4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionsList: {
    gap: 12,
  },
  actionCard: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
  },
  bottomSpacing: {
    height: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "white",
  },
  modalCancelButton: {
    fontSize: 16,
    color: "#6B7280",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  modalSaveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
  },
  disabledButton: {
    opacity: 0.5,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1F2937",
  },
  inputHelper: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
});
