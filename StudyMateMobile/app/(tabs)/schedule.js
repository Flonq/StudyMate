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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { scheduleService } from "../../services/api";
import { SafeAreaView } from "react-native-safe-area-context";

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

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await scheduleService.getEvents();
      const eventsData = response.data || [];
      setEvents(eventsData);

      // Tarih işaretlemelerini oluştur
      const marks = {};
      eventsData.forEach((event) => {
        marks[event.date] = {
          marked: true,
          dotColor: getCategoryColor(event.category),
        };
      });
      setMarkedDates(marks);
    } catch (error) {
      console.error("Etkinlikler yüklenirken hata:", error);
      Alert.alert("Hata", "Etkinlikler yüklenirken bir sorun oluştu");
    } finally {
      setLoading(false);
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
    if (!currentEvent.title || !currentEvent.date) {
      Alert.alert("Hata", "Başlık ve tarih alanları zorunludur");
      return;
    }

    try {
      setLoading(true);

      if (modalMode === "add") {
        await scheduleService.addEvent(currentEvent);
        Alert.alert("Başarılı", "Etkinlik başarıyla eklendi");
      } else {
        await scheduleService.updateEvent(currentEvent.id, currentEvent);
        Alert.alert("Başarılı", "Etkinlik başarıyla güncellendi");
      }

      setIsModalVisible(false);
      fetchEvents();
    } catch (error) {
      console.error("Etkinlik kaydedilirken hata:", error);
      Alert.alert("Hata", "Etkinlik kaydedilirken bir sorun oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    Alert.alert(
      "Etkinliği Sil",
      "Bu etkinliği silmek istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await scheduleService.deleteEvent(eventId);
              fetchEvents();
              Alert.alert("Başarılı", "Etkinlik başarıyla silindi");
            } catch (error) {
              console.error("Etkinlik silinirken hata:", error);
              Alert.alert("Hata", "Etkinlik silinirken bir sorun oluştu");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filteredEvents = events.filter((event) => event.date === selectedDate);

  const EventItem = ({ event }) => {
    return (
      <TouchableOpacity
        style={[
          styles.eventItem,
          { borderLeftColor: getCategoryColor(event.category) },
        ]}
        onPress={() => openEditEventModal(event)}
      >
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <View style={styles.eventActions}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteEvent(event.id)}
            >
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.eventTimeContainer}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.eventTime}>
            {event.startTime} - {event.endTime}
          </Text>
        </View>

        <View style={styles.eventCategoryContainer}>
          <Ionicons
            name={getCategoryIcon(event.category)}
            size={16}
            color="#666"
          />
          <Text style={styles.eventCategory}>
            {getCategoryName(event.category)}
          </Text>
        </View>

        {event.description ? (
          <Text style={styles.eventDescription}>{event.description}</Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Çizelge</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddEventModal}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Calendar
        current={selectedDate}
        onDayPress={handleDateSelect}
        markedDates={{
          ...markedDates,
          [selectedDate]: {
            selected: true,
            selectedColor: "#2563eb",
            marked: markedDates[selectedDate]?.marked,
            dotColor: markedDates[selectedDate]?.dotColor,
          },
        }}
        theme={{
          todayTextColor: "#2563eb",
          selectedDayBackgroundColor: "#2563eb",
          arrowColor: "#2563eb",
        }}
      />

      <View style={styles.eventListHeader}>
        <Text style={styles.selectedDateText}>
          {new Date(selectedDate).toLocaleDateString("tr-TR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.eventCountText}>
          {filteredEvents.length} etkinlik
        </Text>
      </View>

      <ScrollView style={styles.eventList}>
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={50} color="#ccc" />
            <Text style={styles.emptyStateText}>
              Bu tarihte etkinlik bulunmuyor
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={openAddEventModal}
            >
              <Text style={styles.emptyStateButtonText}>Etkinlik Ekle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredEvents.map((event) => (
            <EventItem key={event.id} event={event} />
          ))
        )}
      </ScrollView>

      {/* Etkinlik Ekleme/Düzenleme Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalMode === "add" ? "Yeni Etkinlik" : "Etkinliği Düzenle"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Başlık</Text>
                <TextInput
                  style={styles.input}
                  value={currentEvent.title}
                  onChangeText={(text) =>
                    setCurrentEvent({ ...currentEvent, title: text })
                  }
                  placeholder="Etkinlik başlığı"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Açıklama</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={currentEvent.description}
                  onChangeText={(text) =>
                    setCurrentEvent({ ...currentEvent, description: text })
                  }
                  placeholder="Etkinlik açıklaması"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Başlangıç Saati</Text>
                  <TextInput
                    style={styles.input}
                    value={currentEvent.startTime}
                    onChangeText={(text) =>
                      setCurrentEvent({ ...currentEvent, startTime: text })
                    }
                    placeholder="09:00"
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Bitiş Saati</Text>
                  <TextInput
                    style={styles.input}
                    value={currentEvent.endTime}
                    onChangeText={(text) =>
                      setCurrentEvent({ ...currentEvent, endTime: text })
                    }
                    placeholder="10:30"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Kategori</Text>
                <View style={styles.categoryButtons}>
                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      currentEvent.category === "study" &&
                        styles.categoryButtonActive,
                    ]}
                    onPress={() =>
                      setCurrentEvent({ ...currentEvent, category: "study" })
                    }
                  >
                    <Ionicons
                      name="book-outline"
                      size={20}
                      color={
                        currentEvent.category === "study" ? "white" : "#2563eb"
                      }
                    />
                    <Text
                      style={[
                        styles.categoryButtonText,
                        currentEvent.category === "study" &&
                          styles.categoryButtonTextActive,
                      ]}
                    >
                      Çalışma
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      currentEvent.category === "exam" &&
                        styles.categoryButtonActive,
                      { borderColor: "#dc2626" },
                    ]}
                    onPress={() =>
                      setCurrentEvent({ ...currentEvent, category: "exam" })
                    }
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={
                        currentEvent.category === "exam" ? "white" : "#dc2626"
                      }
                    />
                    <Text
                      style={[
                        styles.categoryButtonText,
                        { color: "#dc2626" },
                        currentEvent.category === "exam" &&
                          styles.categoryButtonTextActive,
                      ]}
                    >
                      Sınav
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      currentEvent.category === "assignment" &&
                        styles.categoryButtonActive,
                      { borderColor: "#f59e0b" },
                    ]}
                    onPress={() =>
                      setCurrentEvent({
                        ...currentEvent,
                        category: "assignment",
                      })
                    }
                  >
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color={
                        currentEvent.category === "assignment"
                          ? "white"
                          : "#f59e0b"
                      }
                    />
                    <Text
                      style={[
                        styles.categoryButtonText,
                        { color: "#f59e0b" },
                        currentEvent.category === "assignment" &&
                          styles.categoryButtonTextActive,
                      ]}
                    >
                      Ödev
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.categoryButton,
                      currentEvent.category === "meeting" &&
                        styles.categoryButtonActive,
                      { borderColor: "#8b5cf6" },
                    ]}
                    onPress={() =>
                      setCurrentEvent({ ...currentEvent, category: "meeting" })
                    }
                  >
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color={
                        currentEvent.category === "meeting"
                          ? "white"
                          : "#8b5cf6"
                      }
                    />
                    <Text
                      style={[
                        styles.categoryButtonText,
                        { color: "#8b5cf6" },
                        currentEvent.category === "meeting" &&
                          styles.categoryButtonTextActive,
                      ]}
                    >
                      Toplantı
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveEvent}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#2563eb",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  eventListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  eventCountText: {
    fontSize: 14,
    color: "#666",
  },
  eventList: {
    flex: 1,
    padding: 16,
  },
  eventItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  eventActions: {
    flexDirection: "row",
  },
  deleteButton: {
    padding: 5,
  },
  eventTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  eventCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  eventCategory: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  emptyStateButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "white",
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#2563eb",
    borderRadius: 8,
    marginBottom: 8,
    width: "48%",
  },
  categoryButtonActive: {
    backgroundColor: "#2563eb",
  },
  categoryButtonText: {
    marginLeft: 4,
    color: "#2563eb",
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: "white",
  },
  saveButton: {
    backgroundColor: "#2563eb",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
