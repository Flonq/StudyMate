import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { eventService, aiService } from "../../services/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

const { width } = Dimensions.get("window");

// Kategoriler tanımı
const categories = [
  {
    id: "study",
    name: "Ders Çalışma",
    icon: "📚",
    color: "#3B82F6",
    gradient: ["#3B82F6", "#1D4ED8"],
  },
  {
    id: "exam",
    name: "Sınav",
    icon: "📝",
    color: "#EF4444",
    gradient: ["#EF4444", "#DC2626"],
  },
  {
    id: "homework",
    name: "Ödev",
    icon: "📋",
    color: "#F59E0B",
    gradient: ["#F59E0B", "#D97706"],
  },
  {
    id: "break",
    name: "Mola",
    icon: "☕",
    color: "#10B981",
    gradient: ["#10B981", "#059669"],
  },
  {
    id: "sport",
    name: "Spor",
    icon: "⚽",
    color: "#8B5CF6",
    gradient: ["#8B5CF6", "#7C3AED"],
  },
  {
    id: "social",
    name: "Sosyal",
    icon: "👥",
    color: "#EC4899",
    gradient: ["#EC4899", "#DB2777"],
  },
];

export default function ScheduleScreen() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [events, setEvents] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    category: "study", // çalışma, sınav, ödev, vs.
  });
  const [modalMode, setModalMode] = useState("add"); // "add" veya "edit"
  const [loading, setLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // AI states
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    console.log("📅 Seçili tarih değişti:", selectedDate);
    fetchEvents();
  }, [selectedDate]);

  useEffect(() => {
    console.log("🔄 Component mount edildi");
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      console.log("🔍 Etkinlikler getiriliyor...");
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        console.log("❌ Token bulunamadı");
        return;
      }

      const response = await eventService.getEventsByDate(selectedDate);
      console.log("📊 Getirilen etkinlikler:", response);

      // Etkinlikleri state'e set et
      setEvents(response || []);
      console.log("✅ Etkinlikler state'e set edildi:", response?.length || 0);
    } catch (error) {
      console.error("❌ Etkinlik getirme hatası:", error);
      setEvents([]); // Hata durumunda boş array set et
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "study":
        return "#2563eb";
      case "exam":
        return "#dc2626";
      case "assignment":
        return "#f59e0b";
      case "meeting":
        return "#8b5cf6";
      default:
        return "#10b981";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "study":
        return "book-outline";
      case "exam":
        return "document-text-outline";
      case "assignment":
        return "create-outline";
      case "meeting":
        return "people-outline";
      default:
        return "calendar-outline";
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case "study":
        return "Çalışma";
      case "exam":
        return "Sınav";
      case "assignment":
        return "Ödev";
      case "meeting":
        return "Toplantı";
      default:
        return "Diğer";
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.dateString);
  };

  const openAddEventModal = () => {
    setCurrentEvent({
      title: "",
      description: "",
      date: selectedDate,
      startTime: "",
      endTime: "",
      category: "study",
    });
    setModalMode("add");
    setIsModalVisible(true);
  };

  const openEditEventModal = (event) => {
    setCurrentEvent({
      ...event,
    });
    setModalMode("edit");
    setIsModalVisible(true);
  };

  const handleSaveEvent = async () => {
    try {
      if (!currentEvent.title.trim()) {
        Alert.alert("Hata", "Etkinlik başlığı gerekli");
        return;
      }

      setLoading(true);

      const eventData = {
        ...currentEvent,
        date: selectedDate,
      };

      if (editingEvent) {
        await eventService.updateEvent(editingEvent._id, eventData);
      } else {
        await eventService.createEvent(eventData);
      }

      setIsModalVisible(false);
      await fetchEvents();

      Alert.alert(
        "Başarılı",
        editingEvent ? "Etkinlik güncellendi" : "Etkinlik eklendi"
      );
    } catch (error) {
      console.error("❌ Etkinlik kaydedilemedi:", error);
      Alert.alert("Hata", "Etkinlik kaydedilirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      Alert.alert(
        "Etkinliği Sil",
        "Bu etkinliği silmek istediğinizden emin misiniz?",
        [
          { text: "İptal", style: "cancel" },
          {
            text: "Sil",
            style: "destructive",
            onPress: async () => {
              try {
                setLoading(true);
                await eventService.deleteEvent(eventId);
                await fetchEvents();
                Alert.alert("Başarılı", "Etkinlik silindi");
              } catch (error) {
                console.error("❌ Etkinlik silinemedi:", error);
                Alert.alert("Hata", "Etkinlik silinirken bir hata oluştu");
              } finally {
                setLoading(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("❌ Silme hatası:", error);
    }
  };

  const filteredEvents = events.filter((event) => {
    const eventDate = event.date.split("T")[0];
    return eventDate === selectedDate;
  });

  console.log("🔍 Filtreleme:", {
    selectedDate,
    totalEvents: events.length,
    filteredEvents: filteredEvents.length,
    sampleEventDate: events[0]?.date,
  });

  const EventItem = ({ event }) => {
    const categoryColor = getCategoryColor(event.category);
    const categoryIcon = getCategoryIcon(event.category);
    const categoryName = getCategoryName(event.category);

    return (
      <TouchableOpacity
        style={[styles.eventItem, { borderLeftColor: categoryColor }]}
        onPress={() => openEditEventModal(event)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
          style={styles.eventGradient}
        >
          <View style={styles.eventHeader}>
            <View style={styles.eventTitleContainer}>
              <View
                style={[styles.categoryDot, { backgroundColor: categoryColor }]}
              />
              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.title}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteEvent(event._id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>

          <View style={styles.eventDetails}>
            <View style={styles.eventTimeContainer}>
              <View style={styles.timeIconContainer}>
                <Ionicons name="time-outline" size={16} color={categoryColor} />
              </View>
              <Text style={styles.eventTime}>
                {event.startTime} - {event.endTime}
              </Text>
            </View>

            <View style={styles.eventCategoryContainer}>
              <View style={styles.categoryIconContainer}>
                <Ionicons name={categoryIcon} size={16} color={categoryColor} />
              </View>
              <Text style={styles.eventCategory}>{categoryName}</Text>
            </View>
          </View>

          {event.description ? (
            <Text style={styles.eventDescription} numberOfLines={2}>
              {event.description}
            </Text>
          ) : null}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find((cat) => cat.id === categoryId) || categories[0];
  };

  // AI Chat fonksiyonu - düzeltildi
  const handleAIChat = async () => {
    if (!aiMessage.trim()) {
      setAiError("Lütfen bir mesaj yazın");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiResponse("");

    try {
      const response = await aiService.generateSchedule(
        selectedDate,
        aiMessage
      );

      if (response.eventsCreated && response.eventsCreated > 0) {
        setAiResponse(
          `✅ ${response.eventsCreated} etkinlik başarıyla eklendi!`
        );
        setTimeout(() => {
          setShowAIModal(false);
          setAiMessage("");
          setAiResponse("");
          fetchEvents();
        }, 2000);
      } else {
        setAiError("Etkinlik oluşturulamadı");
      }
    } catch (error) {
      console.error("❌ AI Chat hatası:", error);
      setAiError(error.message || "AI ile iletişimde bir hata oluştu");
    } finally {
      setAiLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), "d MMMM yyyy, EEEE", { locale: tr });
    } catch {
      return dateString;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📅 Çizelge</Text>
          <TouchableOpacity
            style={styles.aiButton}
            onPress={() => setShowAIModal(true)}
          >
            <LinearGradient
              colors={["#10b981", "#059669"]}
              style={styles.aiButtonGradient}
            >
              <Ionicons name="sparkles" size={20} color="white" />
              <Text style={styles.aiButtonText}>AI</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            onDayPress={handleDateSelect}
            markedDates={{
              ...markedDates,
              [selectedDate]: {
                selected: true,
                selectedColor: "#667eea",
                marked: markedDates[selectedDate]?.marked,
                dotColor: markedDates[selectedDate]?.dotColor,
              },
            }}
            theme={{
              backgroundColor: "transparent",
              calendarBackground: "transparent",
              textSectionTitleColor: "#667eea",
              selectedDayBackgroundColor: "#667eea",
              selectedDayTextColor: "#ffffff",
              todayTextColor: "#667eea",
              dayTextColor: "#2d3748",
              textDisabledColor: "#a0aec0",
              dotColor: "#667eea",
              selectedDotColor: "#ffffff",
              arrowColor: "#667eea",
              disabledArrowColor: "#d3d3d3",
              monthTextColor: "#2d3748",
              indicatorColor: "#667eea",
              textDayFontFamily: "System",
              textMonthFontFamily: "System",
              textDayHeaderFontFamily: "System",
              textDayFontWeight: "400",
              textMonthFontWeight: "600",
              textDayHeaderFontWeight: "600",
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
            style={styles.calendar}
          />
        </View>

        <View style={styles.selectedDateContainer}>
          <LinearGradient
            colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
            style={styles.selectedDateGradient}
          >
            <View style={styles.selectedDateContent}>
              <View>
                <Text style={styles.selectedDateText}>
                  {new Date(selectedDate).toLocaleDateString("tr-TR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </Text>
                <Text style={styles.eventCountText}>
                  {filteredEvents.length} etkinlik
                </Text>
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={openAddEventModal}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#667eea", "#764ba2"]}
                  style={styles.addButtonGradient}
                >
                  <Ionicons name="add" size={24} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.eventListContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
              <Text style={styles.loadingText}>Etkinlikler yükleniyor...</Text>
            </View>
          ) : filteredEvents.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={64} color="#a0aec0" />
              <Text style={styles.emptyText}>Bu gün için etkinlik yok</Text>
              <Text style={styles.emptySubText}>
                Yeni etkinlik eklemek için + butonuna basın
              </Text>
            </View>
          ) : (
            <View style={styles.eventList}>
              {filteredEvents.map((event, index) => (
                <EventItem key={event._id} event={event} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={showEventModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingEvent ? "Etkinliği Düzenle" : "Yeni Etkinlik"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Etkinlik başlığı"
              placeholderTextColor="#999"
              value={currentEvent.title}
              onChangeText={(text) =>
                setCurrentEvent({ ...currentEvent, title: text })
              }
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Açıklama (opsiyonel)"
              placeholderTextColor="#999"
              value={currentEvent.description}
              onChangeText={(text) =>
                setCurrentEvent({ ...currentEvent, description: text })
              }
              multiline
              numberOfLines={3}
            />

            <View style={styles.timeContainer}>
              <TextInput
                style={[styles.input, styles.timeInput]}
                placeholder="09:00"
                placeholderTextColor="#999"
                value={currentEvent.startTime}
                onChangeText={(text) =>
                  setCurrentEvent({ ...currentEvent, startTime: text })
                }
              />
              <Text style={styles.timeSeparator}>-</Text>
              <TextInput
                style={[styles.input, styles.timeInput]}
                placeholder="10:00"
                placeholderTextColor="#999"
                value={currentEvent.endTime}
                onChangeText={(text) =>
                  setCurrentEvent({ ...currentEvent, endTime: text })
                }
              />
            </View>

            <Text style={styles.categoryLabel}>Kategori</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    currentEvent.category === category.id &&
                      styles.selectedCategory,
                  ]}
                  onPress={() =>
                    setCurrentEvent({
                      ...currentEvent,
                      category: category.id,
                    })
                  }
                >
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEventModal(false)}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEvent}
              >
                <Text style={styles.saveButtonText}>
                  {editingEvent ? "Güncelle" : "Kaydet"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showAIModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.aiHeader}>
              <Text style={styles.aiTitle}>🤖 AI Asistan</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowAIModal(false);
                  setAiMessage("");
                  setAiResponse("");
                  setAiError("");
                }}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.aiSubtitle}>
              {formatDate(selectedDate)} için etkinlik önerisi alın
            </Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Örn: Matematik sınavına hazırlanmak için 3 saatlik çalışma planı yap"
              placeholderTextColor="#999"
              value={aiMessage}
              onChangeText={setAiMessage}
              multiline
              numberOfLines={4}
            />

            {aiError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{aiError}</Text>
              </View>
            )}

            {aiResponse && (
              <View style={styles.successContainer}>
                <Text style={styles.successText}>{aiResponse}</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAIModal(false);
                  setAiMessage("");
                  setAiResponse("");
                  setAiError("");
                }}
              >
                <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.aiSendButton,
                  (aiLoading || !aiMessage.trim()) && styles.disabledButton,
                ]}
                onPress={handleAIChat}
                disabled={aiLoading || !aiMessage.trim()}
              >
                {aiLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.aiSendButtonText}>✨ Etkinlik Öner</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  aiButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  aiButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  aiButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendar: {
    borderRadius: 16,
  },
  selectedDateContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedDateGradient: {
    padding: 20,
  },
  selectedDateContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d3748",
    textTransform: "capitalize",
  },
  eventCountText: {
    fontSize: 14,
    color: "#667eea",
    marginTop: 4,
    fontWeight: "500",
  },
  addButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  addButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  eventListContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  eventList: {
    gap: 12,
  },
  eventItem: {
    borderRadius: 16,
    overflow: "hidden",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventGradient: {
    padding: 16,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  eventTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d3748",
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  eventDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  eventTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  timeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  eventTime: {
    fontSize: 14,
    color: "#4a5568",
    fontWeight: "500",
  },
  eventCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  categoryIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(102, 126, 234, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  eventCategory: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  eventDescription: {
    fontSize: 14,
    color: "#718096",
    lineHeight: 20,
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#667eea",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a5568",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  timeInput: {
    flex: 1,
    marginBottom: 0,
  },
  timeSeparator: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 10,
    color: "#333",
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryItem: {
    alignItems: "center",
    padding: 10,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: "#8B5CF6",
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 12,
    textAlign: "center",
    color: "#333",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#8B5CF6",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600",
  },
  aiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  aiTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  aiSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: "#dcfce7",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  successText: {
    color: "#16a34a",
    fontSize: 14,
  },
  aiSendButton: {
    backgroundColor: "#10b981",
  },
  aiSendButtonText: {
    color: "white",
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
