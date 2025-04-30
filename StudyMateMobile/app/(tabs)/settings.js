import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { authService } from "../../services/api";
import { getUserData, removeUserToken } from "../../utils/storage";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    studyReminders: true,
    examReminders: true,
    weeklyReport: true,
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      if (response.data) {
        setUser(response.data);
        setEditForm({
          name: response.data.name,
          username: response.data.username,
          email: response.data.email,
        });
      }
    } catch (error) {
      console.error("Kullanıcı bilgileri alınamadı:", error);
      // Yedek olarak lokalde saklanan bilgileri kullan
      const userData = await getUserData();
      if (userData) {
        setUser(userData);
        setEditForm({
          name: userData.name,
          username: userData.username,
          email: userData.email,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: user.name,
      username: user.username,
      email: user.email,
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await authService.updateProfile(editForm);
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsEditing(false);
        Alert.alert("Başarılı", "Profil bilgileriniz güncellendi");
      }
    } catch (error) {
      console.error("Profil güncellenirken hata:", error);
      Alert.alert(
        "Hata",
        error.response?.data?.message ||
          "Profil güncellenirken bir sorun oluştu"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            await removeUserToken();
            navigation.reset({
              index: 0,
              routes: [{ name: "login" }],
            });
          },
        },
      ]
    );
  };

  const toggleNotification = (key) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key],
    });
  };

  const renderSettingsSection = () => {
    if (isEditing) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Bilgileri</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              value={editForm.name}
              onChangeText={(text) => setEditForm({ ...editForm, name: text })}
              placeholder="Ad Soyad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Kullanıcı Adı</Text>
            <TextInput
              style={styles.input}
              value={editForm.username}
              onChangeText={(text) =>
                setEditForm({ ...editForm, username: text })
              }
              placeholder="Kullanıcı Adı"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              value={editForm.email}
              onChangeText={(text) => setEditForm({ ...editForm, email: text })}
              placeholder="E-posta"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.editButtonsContainer}>
            <TouchableOpacity
              style={[styles.editButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.editButton, styles.saveButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={handleEdit}
          >
            <Ionicons name="pencil" size={16} color="#2563eb" />
            <Text style={styles.editProfileButtonText}>Düzenle</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Ad Soyad</Text>
          <Text style={styles.profileValue}>{user.name}</Text>
        </View>

        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>Kullanıcı Adı</Text>
          <Text style={styles.profileValue}>{user.username}</Text>
        </View>

        <View style={styles.profileItem}>
          <Text style={styles.profileLabel}>E-posta</Text>
          <Text style={styles.profileValue}>{user.email}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
            <Text style={styles.backButtonText}>Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ayarlar</Text>
        </View>

        {renderSettingsSection()}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bildirim Ayarları</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Çalışma Hatırlatıcıları</Text>
              <Text style={styles.settingDescription}>
                Planladığınız çalışmalar için bildirimler alın
              </Text>
            </View>
            <Switch
              value={notificationSettings.studyReminders}
              onValueChange={() => toggleNotification("studyReminders")}
              trackColor={{ false: "#ddd", true: "#a5d6a7" }}
              thumbColor={
                notificationSettings.studyReminders ? "#2e7d32" : "#f4f3f4"
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Sınav Hatırlatıcıları</Text>
              <Text style={styles.settingDescription}>
                Yaklaşan sınavlarınız için bildirimler alın
              </Text>
            </View>
            <Switch
              value={notificationSettings.examReminders}
              onValueChange={() => toggleNotification("examReminders")}
              trackColor={{ false: "#ddd", true: "#a5d6a7" }}
              thumbColor={
                notificationSettings.examReminders ? "#2e7d32" : "#f4f3f4"
              }
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Haftalık Rapor</Text>
              <Text style={styles.settingDescription}>
                Haftalık çalışma istatistiklerinizi alın
              </Text>
            </View>
            <Switch
              value={notificationSettings.weeklyReport}
              onValueChange={() => toggleNotification("weeklyReport")}
              trackColor={{ false: "#ddd", true: "#a5d6a7" }}
              thumbColor={
                notificationSettings.weeklyReport ? "#2e7d32" : "#f4f3f4"
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hesap</Text>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#dc2626" />
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 16,
  },
  section: {
    backgroundColor: "white",
    marginTop: 16,
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  editProfileButtonText: {
    color: "#2563eb",
    marginLeft: 4,
    fontWeight: "500",
  },
  profileItem: {
    marginBottom: 16,
  },
  profileLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    color: "#333",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  editButtonsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#2563eb",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "500",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  logoutButtonText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});
