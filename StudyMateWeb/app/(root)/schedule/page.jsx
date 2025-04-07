"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Palette,
  Trash2,
  Edit2,
  Coffee,
  ChevronLeft,
  ChevronRight,
  X,
  Bell,
  Tag,
  Search,
  Filter,
  Grid,
  List,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isBefore,
  isToday,
  isSameMonth,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  parseISO,
  addDays,
  subDays,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";
import { tr } from "date-fns/locale";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date("2025-04-04"));
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "ders", // ders, aktivite, diğer
    startTime: "09:00",
    endTime: "10:00",
    color: "#4F46E5",
    description: "",
    category: "ders",
    reminder: "15",
  });
  const [events, setEvents] = useState([]);
  const [view, setView] = useState("month"); // 'month', 'week', 'day'
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [weekStart, setWeekStart] = useState(currentDate);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Takvim hesaplamaları
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Ay değiştirme işleyicileri
  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => addMonths(prevDate, 1));
  };

  // Önceki ve sonraki ay
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  // Önceden tanımlanmış kategoriler
  const categories = [
    { id: "ders", name: "Ders Çalışma", color: "#4F46E5" },
    { id: "sinav", name: "Sınav Hazırlık", color: "#DC2626" },
    { id: "odev", name: "Ödev", color: "#2563EB" },
    { id: "dinlenme", name: "Dinlenme", color: "#059669" },
    { id: "spor", name: "Spor", color: "#D97706" },
    { id: "sosyal", name: "Sosyal Aktivite", color: "#7C3AED" },
  ];

  // Hatırlatıcı süreleri
  const reminderOptions = [
    { value: "0", label: "Hatırlatıcı yok" },
    { value: "5", label: "5 dakika önce" },
    { value: "15", label: "15 dakika önce" },
    { value: "30", label: "30 dakika önce" },
    { value: "60", label: "1 saat önce" },
  ];

  // Kategori döngüsü için fonksiyon
  const cycleCategory = () => {
    const categoryOrder = ["all", ...categories.map((cat) => cat.id)];
    const currentIndex = categoryOrder.indexOf(selectedCategory);
    const nextIndex = (currentIndex + 1) % categoryOrder.length;
    setSelectedCategory(categoryOrder[nextIndex]);
  };

  // Kategori filtresi butonunu güncelleyelim
  const FilterButton = () => {
    // Seçili kategorinin rengini ve adını bulalım
    let buttonColor = "#6B7280"; // Varsayılan renk (gri)
    let buttonText = "Tüm Kategoriler";
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-700";

    if (selectedCategory !== "all") {
      const category = categories.find((cat) => cat.id === selectedCategory);
      if (category) {
        buttonColor = category.color;
        buttonText = category.name;
        bgColor = `bg-opacity-20`;
        textColor = "text-gray-900";
      }
    }

    return (
      <button
        onClick={cycleCategory}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:opacity-80`}
        style={{
          backgroundColor: `${buttonColor}20`,
          borderColor: buttonColor,
          borderWidth: "1px",
        }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: buttonColor }}
        />
        <span style={{ color: buttonColor }}>{buttonText}</span>
      </button>
    );
  };

  // FilterBar bileşenini güncelleyelim
  const FilterBar = () => (
    <div className="flex justify-end mb-6">
      <FilterButton />
    </div>
  );

  // Hatırlatıcı ayarlama
  const setReminder = (eventDate, eventTime, reminderMinutes) => {
    if (reminderMinutes === "0") return;

    const eventDateTime = new Date(
      `${format(eventDate, "yyyy-MM-dd")}T${eventTime}`
    );
    const reminderTime = new Date(
      eventDateTime.getTime() - parseInt(reminderMinutes) * 60000
    );

    // Tarayıcı bildirimi için izin iste
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const timeUntilReminder = reminderTime.getTime() - new Date().getTime();

    if (timeUntilReminder > 0) {
      setTimeout(() => {
        new Notification("Çalışma Planı Hatırlatıcısı", {
          body: `${newEvent.title} etkinliğiniz ${reminderMinutes} dakika sonra başlayacak!`,
          icon: "/path/to/your/icon.png", // Bildirim ikonu ekleyebilirsiniz
        });
        toast.success(`${newEvent.title} etkinliğiniz yaklaşıyor!`);
      }, timeUntilReminder);
    }
  };

  // Başlangıç form durumu
  const initialEventState = {
    title: "",
    startTime: "09:00",
    endTime: "10:00",
    color: categories[0].color,
    description: "",
    category: categories[0].id,
    reminder: "15",
  };

  // Etkinlik ekleme fonksiyonu
  const handleAddEvent = (eventData) => {
    const newEventWithId = {
      ...eventData,
      id: Date.now(),
      date: selectedDate,
    };

    setEvents([...events, newEventWithId]);
    setShowEventModal(false);
    setNewEvent(initialEventState);
    toast.success("Etkinlik başarıyla eklendi!");
  };

  // Etkinlik Düzenleme
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      color: event.color,
      description: event.description,
      category: event.category,
      reminder: event.reminder || "0",
    });
    setShowEventModal(true);
  };

  // Etkinlik Güncelleme
  const handleUpdateEvent = (e) => {
    e.preventDefault();
    const updatedEvents = events.map((event) =>
      event.id === selectedEvent.id
        ? { ...newEvent, id: event.id, date: selectedDate }
        : event
    );
    setEvents(updatedEvents);
    setShowEventModal(false);
    setSelectedEvent(null);
    toast.success("Etkinlik güncellendi!");
  };

  // Etkinlik Silme
  const handleDeleteEvent = (eventId) => {
    if (window.confirm("Bu etkinliği silmek istediğinizden emin misiniz?")) {
      setEvents(events.filter((event) => event.id !== eventId));
      toast.success("Etkinlik silindi!");
    }
  };

  // useEffect ile filtrelemeyi yönetelim
  useEffect(() => {
    const filtered = events.filter((event) => {
      return selectedCategory === "all" || event.category === selectedCategory;
    });
    setFilteredEvents(filtered);
  }, [selectedCategory, events]);

  // Haftalık görünüm için günleri hesapla
  const getWeekDays = (startDate) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startDate, i));
    }
    return days;
  };

  // Hafta değiştirme işleyicileri
  const handlePrevWeek = () => {
    setWeekStart((prevDate) => subDays(prevDate, 7));
    setCurrentDate((prevDate) => subDays(prevDate, 7));
  };

  const handleNextWeek = () => {
    setWeekStart((prevDate) => addDays(prevDate, 7));
    setCurrentDate((prevDate) => addDays(prevDate, 7));
  };

  // useEffect ile weekStart'ı currentDate ile senkronize edelim
  useEffect(() => {
    if (view === "week") {
      setWeekStart(currentDate);
    }
  }, [currentDate, view]);

  // Tarih aralığı metni
  const dateRangeText = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy", { locale: tr });
    } else {
      const weekEnd = addDays(weekStart, 6);
      return `${format(weekStart, "d MMMM", { locale: tr })} - ${format(
        weekEnd,
        "d MMMM yyyy",
        { locale: tr }
      )}`;
    }
  };

  // Görünüm bileşenleri
  const ViewControls = () => (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={() => setView("month")}
        className={`px-3 py-1 rounded ${
          view === "month" ? "bg-blue-600 text-white" : "bg-gray-100"
        }`}
      >
        <Grid className="w-4 h-4" />
        Aylık
      </button>
      <button
        onClick={() => setView("week")}
        className={`px-3 py-1 rounded ${
          view === "week" ? "bg-blue-600 text-white" : "bg-gray-100"
        }`}
      >
        <List className="w-4 h-4" />
        Haftalık
      </button>
    </div>
  );

  // Haftalık görünüm
  const WeeklyView = () => {
    const weekDays = getWeekDays(weekStart);

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 divide-y">
          {weekDays.map((day) => {
            const dayEvents = filteredEvents.filter(
              (event) =>
                format(new Date(event.date), "yyyy-MM-dd") ===
                format(day, "yyyy-MM-dd")
            );

            const isToday = isSameDay(day, currentDate);

            return (
              <div
                key={day.toString()}
                className={`p-4 ${
                  isToday ? "bg-blue-50" : ""
                } cursor-pointer hover:bg-gray-50 transition-colors`}
                onClick={() => {
                  setSelectedDate(day);
                  setShowEventModal(true);
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className={`font-semibold ${
                      isToday ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {format(day, "EEEE, d MMMM", { locale: tr })}
                  </h3>
                  {isToday && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      Bugün
                    </span>
                  )}
                </div>

                {dayEvents.length > 0 ? (
                  <div className="space-y-2">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-2 rounded hover:shadow-md transition-shadow"
                        style={{ backgroundColor: `${event.color}15` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(event);
                          setShowEventModal(true);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                          <span className="font-medium">{event.title}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-600">
                            {event.startTime} - {event.endTime}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                                setShowEventModal(true);
                              }}
                              className="p-1 hover:bg-white rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.id);
                              }}
                              className="p-1 hover:bg-white rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-16 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500">
                      Etkinlik eklemek için tıklayın
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Etkinlik Modalı */}
        {showEventModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setShowEventModal(false);
              setSelectedEvent(null);
            }}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4">
                {selectedEvent ? "Etkinliği Düzenle" : "Yeni Etkinlik"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="w-full border rounded-md p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.name}
                        type="button"
                        className={`p-2 rounded-md text-sm font-medium ${
                          newEvent.category === cat.name
                            ? "ring-2 ring-offset-2 ring-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                        style={{
                          backgroundColor:
                            newEvent.category === cat.name
                              ? `${cat.color}30`
                              : "transparent",
                          color: cat.color,
                        }}
                        onClick={() => handleCategoryChange(cat)}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Başlangıç
                    </label>
                    <input
                      type="time"
                      value={newEvent.startTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, startTime: e.target.value })
                      }
                      className="w-full border rounded-md p-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bitiş
                    </label>
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, endTime: e.target.value })
                      }
                      className="w-full border rounded-md p-2"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    className="w-full border rounded-md p-2"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventModal(false);
                      setSelectedEvent(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  >
                    {selectedEvent ? "Güncelle" : "Ekle"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Kategori değiştirme fonksiyonu
  const handleCategoryChange = (categoryId) => {
    const selectedCategory = categories.find((cat) => cat.id === categoryId);
    if (selectedCategory) {
      setNewEvent({
        ...newEvent,
        category: categoryId,
        color: selectedCategory.color,
      });
    }
  };

  // Takvim hesaplamaları için yardımcı fonksiyonlar
  const getCalendarDays = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    // Ayın ilk gününün haftasının başlangıcını bul (Pazartesi)
    let firstDay = startOfWeek(start, { weekStartsOn: 1 });

    // Ayın son gününün haftasının sonunu bul (Pazar)
    const lastDay = endOfWeek(end, { weekStartsOn: 1 });

    const days = [];
    while (firstDay <= lastDay) {
      days.push(firstDay);
      firstDay = addDays(firstDay, 1);
    }

    return days;
  };

  // Etkinlik ekleme/düzenleme işleyicisi
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const eventData = {
        ...newEvent,
        date: format(selectedDate, "yyyy-MM-dd"),
        id: selectedEvent ? selectedEvent.id : Date.now().toString(),
      };

      if (selectedEvent) {
        // Mevcut etkinliği güncelle
        const updatedEvents = events.map((event) =>
          event.id === selectedEvent.id ? eventData : event
        );
        setEvents(updatedEvents);
      } else {
        // Yeni etkinlik ekle
        setEvents([...events, eventData]);
      }

      // Formu sıfırla ve modalı kapat
      setNewEvent({
        title: "",
        startTime: "",
        endTime: "",
        description: "",
        category: "",
        color: "",
      });
      setSelectedEvent(null);
      setShowEventModal(false);
    } catch (error) {
      console.error("Etkinlik eklenirken hata oluştu:", error);
    }
  };

  // Modal açıldığında seçili etkinlik varsa form alanlarını doldur
  useEffect(() => {
    if (selectedEvent) {
      setNewEvent({
        title: selectedEvent.title,
        startTime: selectedEvent.startTime,
        endTime: selectedEvent.endTime,
        description: selectedEvent.description,
        category: selectedEvent.category,
        color: selectedEvent.color,
      });
    }
  }, [selectedEvent]);

  // EventFormModal bileşenini güncelleyelim
  const EventFormModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState(
      selectedEvent
        ? {
            title: selectedEvent.title,
            startTime: selectedEvent.startTime,
            endTime: selectedEvent.endTime,
            description: selectedEvent.description,
            category: selectedEvent.category,
            color: selectedEvent.color,
            reminder: selectedEvent.reminder || "15",
          }
        : initialEventState
    );

    useEffect(() => {
      if (selectedEvent) {
        setFormData({
          title: selectedEvent.title,
          startTime: selectedEvent.startTime,
          endTime: selectedEvent.endTime,
          description: selectedEvent.description,
          category: selectedEvent.category,
          color: selectedEvent.color,
          reminder: selectedEvent.reminder || "15",
        });
      } else {
        setFormData(initialEventState);
      }
    }, [selectedEvent]);

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleCategorySelect = (cat) => {
      setFormData((prev) => ({
        ...prev,
        category: cat.id,
        color: cat.color,
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      try {
        const eventData = {
          ...formData,
          date: format(selectedDate, "yyyy-MM-dd"),
          id: selectedEvent?.id || Date.now().toString(),
        };

        if (selectedEvent) {
          const updatedEvents = events.map((event) =>
            event.id === selectedEvent.id ? eventData : event
          );
          setEvents(updatedEvents);
          toast.success("Etkinlik güncellendi!");
        } else {
          setEvents((prev) => [...prev, eventData]);
          toast.success("Etkinlik eklendi!");
        }

        onClose();
      } catch (error) {
        toast.error("Bir hata oluştu!");
        console.error("Etkinlik işlemi sırasında hata:", error);
      }
    };

    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-4">
            {selectedEvent ? "Etkinliği Düzenle" : "Yeni Etkinlik"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Başlık
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2"
                required
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`p-2 rounded-md text-sm font-medium ${
                      formData.category === cat.id
                        ? "ring-2 ring-offset-2 ring-blue-500"
                        : "hover:bg-gray-50"
                    }`}
                    style={{
                      backgroundColor:
                        formData.category === cat.id
                          ? `${cat.color}30`
                          : "transparent",
                      color: cat.color,
                    }}
                    onClick={() => handleCategorySelect(cat)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Başlangıç
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2"
                  required
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bitiş
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2"
                  required
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2"
                rows="3"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                {selectedEvent ? "Güncelle" : "Ekle"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Üst Bar */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Çalışma Planı</h1>
          <div className="flex items-center gap-4">
            <FilterButton />
            <ViewControls />
          </div>
        </div>

        {/* Navigasyon */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={view === "month" ? handlePrevMonth : handlePrevWeek}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium">{dateRangeText()}</span>
            <button
              onClick={view === "month" ? handleNextMonth : handleNextWeek}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Takvim/Haftalık Görünüm */}
        {view === "week" ? (
          <WeeklyView />
        ) : (
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {/* Gün isimleri */}
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
              <div
                key={day}
                className="bg-white py-2 px-4 text-center font-semibold text-sm"
              >
                {day}
              </div>
            ))}

            {/* Takvim günleri */}
            {getCalendarDays(currentDate).map((day) => {
              const isCurrentMonth =
                format(day, "M") === format(currentDate, "M");
              const isBeforeToday = isBefore(day, new Date()) && !isToday(day);
              const dayEvents = filteredEvents.filter(
                (event) =>
                  format(new Date(event.date), "yyyy-MM-dd") ===
                  format(day, "yyyy-MM-dd")
              );

              return (
                <button
                  key={day.toString()}
                  onClick={() => {
                    if (!isBeforeToday && isCurrentMonth) {
                      setSelectedDate(day);
                      setShowEventModal(true);
                    }
                  }}
                  disabled={!isCurrentMonth}
                  className={`
                    bg-white p-2 min-h-[90px] relative flex flex-col
                    ${!isCurrentMonth ? "opacity-30 cursor-not-allowed" : ""}
                    ${
                      isBeforeToday && isCurrentMonth
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                    ${
                      isCurrentMonth && !isBeforeToday ? "hover:bg-gray-50" : ""
                    }
                    ${isToday(day) ? "ring-2 ring-blue-500" : ""}
                  `}
                >
                  <span
                    className={`
                    text-sm 
                    ${
                      isToday(day)
                        ? "text-blue-600 font-bold"
                        : isCurrentMonth
                        ? "text-gray-700"
                        : "text-gray-400"
                    }
                  `}
                  >
                    {format(day, "d")}
                  </span>

                  <div className="mt-1 space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded truncate flex justify-between items-center"
                        style={{ backgroundColor: `${event.color}15` }}
                      >
                        <span className="truncate">{event.title}</span>
                        {isCurrentMonth && (
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditEvent(event);
                              }}
                              className="p-0.5 hover:bg-white rounded"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteEvent(event.id);
                              }}
                              className="p-0.5 hover:bg-white rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Etkinlik Ekleme Modalı */}
        <EventFormModal
          isOpen={showEventModal}
          onClose={() => {
            setShowEventModal(false);
            setSelectedEvent(null);
          }}
        />
      </div>
    </div>
  );
}
