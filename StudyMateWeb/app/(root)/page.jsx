"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  PlusIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  BookOpenIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

// Auth fonksiyonlarını doğrudan burada tanımlayalım
const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("token");
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

  if (!token || !user) {
    return false;
  }

  try {
    JSON.parse(user);
    return true;
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return false;
  }
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
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
      return null;
    }

    return response;
  } catch (error) {
    console.error("API call error:", error);
    return null;
  }
};

const Page = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalEvents: 0,
    todayEvents: 0,
    completedTasks: 0,
    totalTasks: 0,
  });
  const [todayEvents, setTodayEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!checkAuth()) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    fetchStats();
    fetchTodayEvents();

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timeInterval);
  }, [router]);

  const fetchStats = async () => {
    try {
      const eventsResponse = await apiCall("http://localhost:5000/api/events");
      const tasksResponse = await apiCall("http://localhost:5000/api/tasks");

      if (eventsResponse && tasksResponse) {
        const events = await eventsResponse.json();
        const tasks = await tasksResponse.json();

        const today = new Date().toISOString().split("T")[0];
        const todayEventsCount = events.filter(
          (event) => event.date.split("T")[0] === today
        ).length;

        setStats({
          totalEvents: events.length,
          todayEvents: todayEventsCount,
          completedTasks: tasks.filter((task) => task.completed).length,
          totalTasks: tasks.length,
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchTodayEvents = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await apiCall(
        `http://localhost:5000/api/events/date/${today}`
      );

      if (response) {
        const events = await response.json();
        setTodayEvents(events.slice(0, 3)); // Show only first 3 events
      }
    } catch (error) {
      console.error("Error fetching today's events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi öğleden sonra";
    return "İyi akşamlar";
  };

  const formatTime = (time) => {
    return currentTime.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color,
    gradient,
  }) => (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 bg-white/20 rounded-xl backdrop-blur-sm`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({
    icon: Icon,
    title,
    description,
    onClick,
    gradient,
  }) => (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-left w-full group`}
    >
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{title}</h3>
          <p className="text-white/80 text-sm">{description}</p>
        </div>
      </div>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="flex items-center space-x-3">
            <svg
              className="animate-spin h-6 w-6 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="text-gray-700 font-medium">Yükleniyor...</span>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                StudyMate
              </h1>
              <p className="text-purple-200">Çalışma Programınız</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/profile")}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <UserIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Çıkış</span>
            </button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {getGreeting()}, {user?.name || "Kullanıcı"}! 👋
              </h2>
              <p className="text-purple-200 text-lg">
                Bugün {formatDate(new Date())} - Hedeflerinize odaklanın
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <BookOpenIcon className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={CalendarIcon}
            title="Toplam Etkinlik"
            value={stats.totalEvents}
            subtitle="Bu ay"
            color="text-blue-400"
            gradient="from-blue-600 to-cyan-600"
          />
          <StatCard
            icon={ClockIcon}
            title="Çalışma Saati"
            value={`${stats.studyHours}h`}
            subtitle="Bu hafta"
            color="text-green-400"
            gradient="from-green-600 to-emerald-600"
          />
          <StatCard
            icon={CheckCircleIcon}
            title="Tamamlanan"
            value={stats.completedTasks}
            subtitle="Görev"
            color="text-purple-400"
            gradient="from-purple-600 to-pink-600"
          />
          <StatCard
            icon={ChartBarIcon}
            title="Başarı Oranı"
            value={`${stats.successRate}%`}
            subtitle="Bu ay"
            color="text-yellow-400"
            gradient="from-yellow-600 to-orange-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <QuickActionCard
            icon={PlusIcon}
            title="Yeni Etkinlik"
            description="Hızlıca etkinlik ekleyin"
            onClick={() => router.push("/schedule")}
            gradient="from-purple-600 to-blue-600"
          />
          <QuickActionCard
            icon={CalendarIcon}
            title="Takvimi Görüntüle"
            description="Aylık programınızı inceleyin"
            onClick={() => router.push("/schedule")}
            gradient="from-blue-600 to-cyan-600"
          />
          <QuickActionCard
            icon={ChartBarIcon}
            title="İstatistikler"
            description="İlerlemenizi takip edin"
            onClick={() => router.push("/statistics")}
            gradient="from-green-600 to-emerald-600"
          />
        </div>

        {/* Today's Events */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
              <CalendarIcon className="w-6 h-6 text-purple-300" />
              <span>Bugünün Etkinlikleri</span>
            </h3>
            <button
              onClick={() => router.push("/schedule")}
              className="px-4 py-2 bg-white/10 text-purple-200 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
            >
              <span>Tümünü Gör</span>
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>

          {todayEvents.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-purple-300 mx-auto mb-4 opacity-50" />
              <p className="text-purple-200 text-lg mb-4">
                Bugün için planlanmış etkinlik yok
              </p>
              <button
                onClick={() => router.push("/schedule")}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
              >
                İlk Etkinliğinizi Ekleyin
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {todayEvents.slice(0, 3).map((event) => (
                <div
                  key={event._id}
                  className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div
                    className={`p-3 rounded-xl ${getCategoryColor(
                      event.category
                    )}`}
                  >
                    <ClockIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{event.title}</h4>
                    <p className="text-purple-200 text-sm">
                      {formatTime(event.startTime)} -{" "}
                      {formatTime(event.endTime)}
                    </p>
                    <p className="text-purple-300 text-sm">
                      {getCategoryName(event.category)}
                    </p>
                  </div>
                  <div className="text-purple-300">
                    <ChevronRightIcon className="w-5 h-5" />
                  </div>
                </div>
              ))}
              {todayEvents.length > 3 && (
                <div className="text-center pt-4">
                  <button
                    onClick={() => router.push("/schedule")}
                    className="text-purple-300 hover:text-white transition-colors"
                  >
                    +{todayEvents.length - 3} etkinlik daha
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => router.push("/schedule")}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40"
      >
        <PlusIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

const getCategoryColor = (category) => {
  const colors = {
    study: "bg-blue-500",
    exam: "bg-red-500",
    homework: "bg-yellow-500",
    break: "bg-green-500",
    sport: "bg-purple-500",
    social: "bg-pink-500",
  };
  return colors[category] || "bg-gray-500";
};

const getCategoryName = (categoryId) => {
  const categories = {
    study: "Ders Çalışma",
    exam: "Sınav",
    homework: "Ödev",
    break: "Mola",
    sport: "Spor",
    social: "Sosyal",
  };
  return categories[categoryId] || categoryId;
};

export default Page;
