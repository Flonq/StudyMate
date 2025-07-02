import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authService, eventService } from "../../services/api";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { userService } from "../../services/api";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    todayEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
  });
  const [todayEvents, setTodayEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchUserData(), fetchStats(), fetchTodayEvents()]);
  };

  const fetchUserData = async () => {
    try {
      const response = await userService.getProfile();
      setUser(response);
    } catch (error) {
      console.error("❌ Kullanıcı bilgileri alınamadı:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await userService.getStats();
      setStats(response);
    } catch (error) {
      console.error("❌ İstatistikler alınamadı:", error);
    }
  };

  const fetchTodayEvents = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await eventService.getByDate(today);
      setTodayEvents(response.slice(0, 3) || []);
    } catch (error) {
      setTodayEvents([]);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigation.reset({
        index: 0,
        routes: [{ name: "(auth)" }],
      });
    } catch (error) {
      Alert.alert("Hata", "Çıkış yapılırken bir hata oluştu");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
  };

  const formatTime = (time) => {
    return time;
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "study":
        return "#3B82F6";
      case "exam":
        return "#EF4444";
      case "homework":
        return "#F59E0B";
      case "break":
        return "#10B981";
      case "sport":
        return "#8B5CF6";
      case "social":
        return "#EC4899";
      default:
        return "#6B7280";
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case "study":
        return "Ders Çalışma";
      case "exam":
        return "Sınav";
      case "homework":
        return "Ödev";
      case "break":
        return "Mola";
      case "sport":
        return "Spor";
      case "social":
        return "Sosyal";
      default:
        return "Diğer";
    }
  };

  const StatCard = ({ icon, title, value, subtitle, gradient }) => (
    <LinearGradient colors={gradient} style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </View>
    </LinearGradient>
  );

  const QuickActionCard = ({ icon, title, description, onPress, gradient }) => (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient colors={gradient} style={styles.actionCard}>
        <View style={styles.actionIcon}>
          <Ionicons name={icon} size={28} color="white" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionDescription}>{description}</Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color="rgba(255,255,255,0.7)"
        />
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                {getGreeting()} {user?.name ? user.name.split(" ")[0] : ""}! 👋
              </Text>
              <Text style={styles.subtitle}>
                Bugün nasıl bir gün geçirelim?
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* İstatistik Kartları */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <StatCard
                icon="calendar-outline"
                title="Toplam Etkinlik"
                value={stats.totalEvents}
                gradient={["#667eea", "#764ba2"]}
              />
              <StatCard
                icon="today-outline"
                title="Bugünkü Etkinlik"
                value={stats.todayEvents}
                gradient={["#f093fb", "#f5576c"]}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                icon="trending-up-outline"
                title="Yaklaşan"
                value={stats.upcomingEvents}
                gradient={["#4facfe", "#00f2fe"]}
              />
              <StatCard
                icon="checkmark-circle-outline"
                title="Tamamlanan"
                value={stats.completedEvents}
                gradient={["#43e97b", "#38f9d7"]}
              />
            </View>
          </View>

          {/* Bugünkü Etkinlikler */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bugünkü Etkinlikler</Text>
            {todayEvents.length > 0 ? (
              <View style={styles.eventsContainer}>
                {todayEvents.map((event, index) => (
                  <View key={index} style={styles.eventCard}>
                    <View
                      style={[
                        styles.eventColorBar,
                        { backgroundColor: getCategoryColor(event.category) },
                      ]}
                    />
                    <View style={styles.eventContent}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Text style={styles.eventCategory}>
                        {getCategoryName(event.category)}
                      </Text>
                      <Text style={styles.eventTime}>
                        {formatTime(event.startTime)} -{" "}
                        {formatTime(event.endTime)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="calendar-outline"
                  size={48}
                  color="rgba(255,255,255,0.5)"
                />
                <Text style={styles.emptyText}>Bugün için etkinlik yok</Text>
                <Text style={styles.emptySubtext}>
                  Yeni etkinlik eklemek için takvime gidin
                </Text>
              </View>
            )}
          </View>

          {/* Hızlı İşlemler */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
            <View style={styles.actionsContainer}>
              <QuickActionCard
                icon="add-circle-outline"
                title="Yeni Etkinlik"
                description="Takvime etkinlik ekle"
                onPress={() => navigation.navigate("schedule")}
                gradient={["#667eea", "#764ba2"]}
              />
              <QuickActionCard
                icon="stats-chart-outline"
                title="İstatistikler"
                description="Performansını görüntüle"
                onPress={() => navigation.navigate("statistics")}
                gradient={["#f093fb", "#f5576c"]}
              />
              <QuickActionCard
                icon="person-outline"
                title="Profil"
                description="Hesap ayarlarını yönet"
                onPress={() => navigation.navigate("profile")}
                gradient={["#4facfe", "#00f2fe"]}
              />
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  statTitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
    marginTop: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  eventsContainer: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  eventColorBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 4,
  },
  eventCategory: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginTop: 12,
    fontWeight: "500",
  },
  emptySubtext: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
    textAlign: "center",
  },
  actionsContainer: {
    gap: 12,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
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
    color: "white",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
});
