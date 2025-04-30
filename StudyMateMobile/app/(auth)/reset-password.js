import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { authService } from "../../services/api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const { token } = useLocalSearchParams();
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!passwords.password) {
      Alert.alert("Hata", "Lütfen yeni şifrenizi girin");
      return;
    }

    if (passwords.password !== passwords.confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(
        token,
        passwords.password
      );
      Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi", [
        { text: "Giriş Yap", onPress: () => navigation.navigate("login") },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert(
        "İşlem Başarısız",
        error.response?.data?.message || "Geçersiz veya süresi dolmuş token"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.appName}>StudyMate</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Yeni Şifre Belirleme</Text>
          <Text style={styles.subtitle}>Lütfen yeni şifrenizi belirleyin.</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Yeni Şifre</Text>
            <TextInput
              style={styles.input}
              value={passwords.password}
              onChangeText={(text) =>
                setPasswords({ ...passwords, password: text })
              }
              placeholder="Yeni şifrenizi girin"
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Şifre Tekrar</Text>
            <TextInput
              style={styles.input}
              value={passwords.confirmPassword}
              onChangeText={(text) =>
                setPasswords({ ...passwords, confirmPassword: text })
              }
              placeholder="Şifrenizi tekrar girin"
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.submitButtonText}>
              {isLoading ? "İşleniyor..." : "Şifreyi Değiştir"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2563eb",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
