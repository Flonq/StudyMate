import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authService } from "../../services/api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !formData.username ||
      !formData.name ||
      !formData.email ||
      !formData.password
    ) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register({
        username: formData.username,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      Alert.alert("Başarılı", "Kayıt işlemi başarıyla tamamlandı", [
        { text: "Giriş Yap", onPress: () => navigation.navigate("login") },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Kayıt Başarısız",
        error.response?.data?.message || "Bir hata oluştu"
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
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.logoContainer}>
            <Text style={styles.appName}>StudyMate</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Yeni Hesap Oluştur</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kullanıcı Adı</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(text) =>
                  setFormData({ ...formData, username: text })
                }
                placeholder="Kullanıcı adı girin"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Ad Soyad</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
                placeholder="Ad soyad girin"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>E-posta</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                placeholder="E-posta adresinizi girin"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Şifre</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(text) =>
                  setFormData({ ...formData, password: text })
                }
                placeholder="Şifre oluşturun"
                secureTextEntry
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Şifre Tekrar</Text>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  setFormData({ ...formData, confirmPassword: text })
                }
                placeholder="Şifreyi tekrar girin"
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? "Kayıt Yapılıyor..." : "Kayıt Ol"}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Zaten hesabınız var mı? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("login")}>
                <Text style={styles.loginLink}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
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
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
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
  registerButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    color: "#666",
  },
  loginLink: {
    color: "#2563eb",
    fontWeight: "500",
  },
});
