import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { statsService } from "../../services/api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StatisticsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await statsService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>İstatistikler</Text>
        </View>

        {stats && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Genel Bakış</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalStudyHours}</Text>
                  <Text style={styles.statLabel}>Toplam Çalışma Saati</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.completedTasks}</Text>
                  <Text style={styles.statLabel}>Tamamlanan Görevler</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {stats.averageEfficiency}%
                  </Text>
                  <Text style={styles.statLabel}>Ortalama Verimlilik</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.streak} gün</Text>
                  <Text style={styles.statLabel}>Çalışma Serisi</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Haftalık Özet</Text>
              <View style={styles.weeklyStats}>
                {/* Burada haftalık çalışma grafiği eklenebilir */}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Kategori Dağılımı</Text>
              <View style={styles.categoryStats}>
                {/* Burada kategori dağılım grafiği eklenebilir */}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: "white",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  section: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  statCard: {
    width: "48%",
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  weeklyStats: {
    height: 200,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
  },
  categoryStats: {
    height: 200,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
  },
});
