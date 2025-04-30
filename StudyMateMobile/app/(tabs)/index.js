import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { statsService } from "../../services/api";
import { useNavigation } from "@react-navigation/native";
import { removeUserToken } from "../../utils/storage";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    todayTasks: 0,
    completedPercentage: 0,
    totalHours: 0,
    efficiency: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const response = await statsService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleLogout = async () => {
    await removeUserToken();
    navigation.reset({
      index: 0,
      routes: [{ name: "(auth)" }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchStats} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>StudyMate</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutText}>Çıkış</Text>
          </TouchableOpacity>
        </View>

        {/* Karşılama */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Hoş Geldiniz 👋</Text>
          <Text style={styles.welcomeSubtitle}>
            Çizelge takip sisteminizi yönetin
          </Text>
        </View>

        {/* İstatistik Kartları */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E1F0FF" }]}>
              <Ionicons name="calendar-outline" size={24} color="#2563EB" />
            </View>
            <View>
              <Text style={styles.statLabel}>Bugünkü Görevler</Text>
              <Text style={styles.statValue}>{stats.todayTasks}</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#E1FAEF" }]}>
              <Ionicons name="list-outline" size={24} color="#10B981" />
            </View>
            <View>
              <Text style={styles.statLabel}>Tamamlanan</Text>
              <Text style={styles.statValue}>{stats.completedPercentage}%</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#F3E8FF" }]}>
              <Ionicons name="time-outline" size={24} color="#8B5CF6" />
            </View>
            <View>
              <Text style={styles.statLabel}>Toplam Süre</Text>
              <Text style={styles.statValue}>{stats.totalHours}s</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="pie-chart-outline" size={24} color="#F59E0B" />
            </View>
            <View>
              <Text style={styles.statLabel}>Verimlilik</Text>
              <Text style={styles.statValue}>{stats.efficiency}%</Text>
            </View>
          </View>
        </View>

        {/* Hızlı İşlemler */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={[styles.actionButtonText, { color: "#2563EB" }]}>
                Yeni Görev Ekle
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={[styles.actionButtonText, { color: "#10B981" }]}>
                Rapor Oluştur
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={[styles.actionButtonText, { color: "#8B5CF6" }]}>
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
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    marginLeft: 6,
    color: "#FF3B30",
    fontWeight: "500",
  },
  welcomeSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  statCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  quickActions: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: "column",
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  actionButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
});
