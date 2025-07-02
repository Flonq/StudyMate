"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  BookOpenIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CoffeeIcon,
  HeartIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { format, parseISO, isBefore, startOfDay } from "date-fns";
import { tr } from "date-fns/locale";

// Auth fonksiyonlarını güncelleyelim
const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
  console.log("🔑 Token check:", token ? "Token var" : "Token yok");
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };
};

const checkAuth = () => {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  console.log("🔍 Auth check - Token:", token ? "✅" : "❌");
  console.log("🔍 Auth check - User:", user ? "✅" : "❌");

  if (!token) {
    console.log("❌ No token found, redirecting to login");
    window.location.href = "/login";
    return false;
  }
  return true;
};

const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
};

const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (response.status === 401) {
      logout();
      throw new Error("Unauthorized");
    }

    return response;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

// Categories tanımını ekleyin
const categories = [
  {
    id: "study",
    name: "Ders Çalışma",
    icon: "📚",
    color: "bg-blue-500",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "exam",
    name: "Sınav",
    icon: "📝",
    color: "bg-red-500",
    gradient: "from-red-500 to-red-600",
  },
  {
    id: "homework",
    name: "Ödev",
    icon: "📋",
    color: "bg-yellow-500",
    gradient: "from-yellow-500 to-yellow-600",
  },
  {
    id: "break",
    name: "Mola",
    icon: "☕",
    color: "bg-green-500",
    gradient: "from-green-500 to-green-600",
  },
  {
    id: "sport",
    name: "Spor",
    icon: "⚽",
    color: "bg-purple-500",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    id: "social",
    name: "Sosyal",
    icon: "👥",
    color: "bg-pink-500",
    gradient: "from-pink-500 to-pink-600",
  },
];

const reminderOptions = [
  { value: "none", label: "Hatırlatıcı Yok" },
  { value: "5", label: "5 dakika önce" },
  { value: "15", label: "15 dakika önce" },
  { value: "30", label: "30 dakika önce" },
  { value: "60", label: "1 saat önce" },
];

export default function DayPage() {
  const router = useRouter();
  const params = useParams();
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    category: "study",
  });
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Basit auth kontrol
  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  const getUser = () => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    if (params.date) {
      const parsedDate = new Date(params.date);
      console.log("📅 Parsed date:", parsedDate);
      setSelectedDate(parsedDate);
    }
  }, [params.date, router]);

  useEffect(() => {
    if (selectedDate) {
      fetchEvents();
    }
  }, [selectedDate]);

  const fetchEvents = async () => {
    if (!selectedDate) return;

    try {
      setLoading(true);
      const token = getToken();
      const dateString = selectedDate.toISOString().split("T")[0];

      console.log("🔄 Fetching events for:", dateString);

      const response = await fetch(
        `http://localhost:5000/api/events/date/${dateString}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Events fetched:", data);

        // Güvenli array kontrolü
        if (Array.isArray(data)) {
          setEvents(data);
        } else {
          console.warn("⚠️ Invalid events data format:", data);
          setEvents([]);
        }
      } else {
        console.error("❌ Fetch failed:", response.status);
        setEvents([]);
      }
    } catch (error) {
      console.error("💥 Fetch error:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Form submit handler - Basit versiyon
  const handleSubmit = async () => {
    console.log("🚀 Submit clicked!");

    const token = getToken();
    const user = getUser();

    if (!token || !user) {
      alert("Lütfen tekrar giriş yapın");
      router.push("/login");
      return;
    }

    if (!formData.title || !formData.startTime || !formData.endTime) {
      alert("Lütfen tüm gerekli alanları doldurun");
      return;
    }

    try {
      const eventData = {
        ...formData,
        date: selectedDate.toISOString().split("T")[0],
        userId: user.id || user._id,
      };

      console.log("📤 Sending data:", eventData);

      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      console.log("📡 Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Success:", result);

        // Form'u temizle
        setFormData({
          title: "",
          description: "",
          startTime: "",
          endTime: "",
          category: "study",
        });
        setShowForm(false);

        // Etkinlikleri yenile
        fetchEvents();

        alert("Etkinlik başarıyla eklendi!");
      } else {
        const errorData = await response.json();
        console.error("❌ Error:", errorData);
        alert(`Hata: ${errorData.message || "Etkinlik eklenemedi"}`);
      }
    } catch (error) {
      console.error("💥 Submit error:", error);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleEditEvent = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      const response = await apiCall(
        `http://localhost:5000/api/events/${editingEvent._id}`,
        {
          method: "PUT",
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setEditingEvent(null);
        setFormData({
          title: "",
          description: "",
          startTime: "",
          endTime: "",
          category: "study",
        });
        fetchEvents();
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await apiCall(
        `http://localhost:5000/api/events/${eventId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const startEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      startTime: event.startTime,
      endTime: event.endTime,
      category: event.category,
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      category: "study",
    });
    setShowForm(false);
  };

  const getCategoryInfo = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return (
      category || {
        id: "study",
        name: "Genel",
        icon: "📅",
        color: "bg-blue-500",
        gradient: "from-blue-500 to-blue-600",
      }
    );
  };

  const formatDate = (date) => {
    return format(date, "d MMMM yyyy, EEEE", { locale: tr });
  };

  const handleShowForm = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowForm(true);
  };

  const handleCancelEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    cancelEdit();
  };

  const handleStartEdit = (e, event) => {
    e.preventDefault();
    e.stopPropagation();
    startEdit(event);
  };

  const handleDelete = async (e, eventId) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm("Bu etkinliği silmek istediğinizden emin misiniz?")) {
      await handleDeleteEvent(eventId);
    }
  };

  // AI Chat fonksiyonu
  const handleAIChat = async () => {
    if (!aiMessage.trim()) {
      setAiError("Lütfen bir mesaj yazın");
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiResponse("");

    try {
      const dateString = selectedDate
        ? selectedDate.toISOString().split("T")[0]
        : "";

      console.log("🤖 Sending AI request:", {
        message: aiMessage,
        date: dateString,
        url: "http://localhost:5000/api/ai/chat",
      });

      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: aiMessage,
          date: dateString,
        }),
      });

      console.log("🤖 Response status:", response.status);
      console.log("🤖 Response headers:", response.headers);

      const data = await response.json();
      console.log("🤖 Response data:", data);

      if (!response.ok) {
        throw new Error(
          data.message || data.error || `HTTP ${response.status}`
        );
      }

      if (data.eventsCreated > 0) {
        setAiResponse(`✅ ${data.eventsCreated} etkinlik eklendi!`);
        await fetchEvents();
      } else {
        setAiResponse(data.message || "AI yanıt verdi ama etkinlik eklenmedi.");
      }

      setAiMessage("");
    } catch (error) {
      console.error("❌ AI Chat Error:", error);
      setAiError(`Hata: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/schedule")}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <ArrowLeftIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                {formatDate(new Date(params.date))}
              </h1>
              <p className="text-purple-200 mt-1">Günlük Program</p>
            </div>
          </div>

          <button
            onClick={handleShowForm}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Etkinlik Ekle</span>
          </button>
        </div>

        {/* Events List */}
        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto"></div>
              <p className="text-white/70 mt-2">Etkinlikler yükleniyor...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Henüz etkinlik yok
              </h3>
              <p className="text-white/70">
                Bu gün için henüz bir etkinlik eklenmemiş.
              </p>
            </div>
          ) : (
            events.map((event) => {
              const categoryInfo = getCategoryInfo(event.category);

              return (
                <div
                  key={event._id}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-2xl">
                          {categoryInfo?.icon || "📅"}
                        </span>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {event.title}
                          </h3>
                          <p className="text-white/70 text-sm">
                            {categoryInfo?.name || event.category}
                          </p>
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-white/80 mb-3">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 text-white/60">
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="w-4 h-4" />
                          <span className="text-sm">
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={(e) => handleStartEdit(e, event)}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                      >
                        <PencilIcon className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, event._id)}
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4 text-red-300" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add/Edit Event Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingEvent ? "Etkinliği Düzenle" : "Yeni Etkinlik"}
              </h2>

              <form
                onSubmit={editingEvent ? handleEditEvent : handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Başlık
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Etkinlik başlığı"
                    required
                  />
                </div>

                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="Etkinlik açıklaması"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Başlangıç
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Bitiş
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Kategori seçimi - Eski select'i kaldırın ve bu ile değiştirin */}
                <div className="mb-6">
                  <label className="block text-purple-200 text-sm font-medium mb-3">
                    Kategori
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      {
                        id: "study",
                        name: "Ders Çalışma",
                        icon: "📚",
                        color: "from-blue-500 to-blue-600",
                      },
                      {
                        id: "exam",
                        name: "Sınav",
                        icon: "📝",
                        color: "from-red-500 to-red-600",
                      },
                      {
                        id: "homework",
                        name: "Ödev",
                        icon: "✏️",
                        color: "from-green-500 to-green-600",
                      },
                      {
                        id: "break",
                        name: "Mola",
                        icon: "☕",
                        color: "from-yellow-500 to-yellow-600",
                      },
                      {
                        id: "sport",
                        name: "Spor",
                        icon: "🏃",
                        color: "from-purple-500 to-purple-600",
                      },
                      {
                        id: "social",
                        name: "Sosyal",
                        icon: "👥",
                        color: "from-pink-500 to-pink-600",
                      },
                    ].map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, category: category.id })
                        }
                        className={`
                          relative p-3 rounded-xl border-2 transition-all duration-300 group
                          ${
                            formData.category === category.id
                              ? `bg-gradient-to-r ${category.color} border-white/50 shadow-lg transform scale-105`
                              : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/40 hover:scale-105"
                          }
                        `}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-xl">{category.icon}</span>
                          <span
                            className={`text-xs font-medium text-center ${
                              formData.category === category.id
                                ? "text-white"
                                : "text-purple-200"
                            }`}
                          >
                            {category.name}
                          </span>
                        </div>

                        {/* Seçili durumda check işareti */}
                        {formData.category === category.id && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <svg
                              className="w-3 h-3 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={
                      editingEvent ? handleCancelEdit : () => setShowForm(false)
                    }
                    className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
                  >
                    {editingEvent ? "Güncelle" : "Ekle"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI Chat Modal */}
        {showAIModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🤖</span>
                    <h3 className="text-xl font-bold">AI Asistan</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowAIModal(false);
                      setAiMessage("");
                      setAiResponse("");
                      setAiError("");
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-green-100 mt-2">
                  {selectedDate && formatDate(selectedDate)} için etkinlik
                  önerisi alın
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ne yapmak istiyorsunuz?
                  </label>
                  <textarea
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    placeholder="Örn: Matematik sınavına hazırlanmak için 3 saatlik çalışma planı yap"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                {aiError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{aiError}</p>
                  </div>
                )}

                {aiResponse && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-sm whitespace-pre-wrap">
                      {aiResponse}
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleAIChat}
                    disabled={aiLoading || !aiMessage.trim()}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {aiLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>İşleniyor...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Etkinlik Öner</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAIModal(false);
                      setAiMessage("");
                      setAiResponse("");
                      setAiError("");
                    }}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Chat Floating Button */}
        <button
          onClick={() => setShowAIModal(true)}
          className="fixed bottom-20 right-6 p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40 group"
        >
          <span className="text-xl">🤖</span>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            AI Asistan
          </div>
        </button>
      </div>

      {/* Floating Action Button - Back to Schedule */}
      <button
        onClick={() => router.push("/schedule")}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40"
      >
        <CalendarIcon className="w-6 h-6" />
      </button>
    </div>
  );
}
