"use client";
import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  PaletteIcon,
  Trash2Icon,
  Edit2Icon,
  CoffeeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  BellIcon,
  TagIcon,
  SearchIcon,
  GridIcon,
  ListIcon,
  HomeIcon,
  BookOpenIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { useRouter, usePathname } from "next/navigation";
import { checkAuth, logout, apiCall } from "../../../utils/auth";
import {
  isBefore,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  format,
  startOfDay,
  isToday,
} from "date-fns";
import { tr } from "date-fns/locale";

const formatDate = (date, formatStr) => {
  return format(date, formatStr, { locale: tr });
};

export default function SchedulePage() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ay değiştirme işleyicileri
  const handlePrevMonth = () => {
    setCurrentDate((prevDate) => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prevDate) => addMonths(prevDate, 1));
  };

  // Auth kontrolü ekleyin
  useEffect(() => {
    if (!checkAuth()) {
      router.push("/login");
      return;
    }
  }, [router]);

  // Etkinlikleri veritabanından getir
  const fetchEvents = async () => {
    try {
      setLoading(true);

      // Ay başı ve sonu tarihlerini hesapla
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      // API'den tüm etkinlikleri al
      const response = await apiCall("http://localhost:5000/api/events");

      // Sadece bu aya ait etkinlikleri filtrele
      const monthEvents = response.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= startOfMonth && eventDate <= endOfMonth;
      });

      setEvents(monthEvents);
    } catch (error) {
      console.error("Etkinlikler yüklenirken hata:", error);
      toast.error("Etkinlikler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde etkinlikleri getir
  useEffect(() => {
    fetchEvents();
  }, []);

  // Pathname değiştiğinde (sayfa değiştiğinde) etkinlikleri yenile
  useEffect(() => {
    if (pathname === "/schedule") {
      console.log("Schedule page focused, refreshing events...");
      fetchEvents();
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Geçmiş tarih kontrolü
  const isPastDate = (date) => {
    return isBefore(startOfDay(date), startOfDay(new Date()));
  };

  // Takvim günlerini hesaplama
  const getCalendarDays = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const days = [];

    // Ayın ilk gününden önceki günleri ekle
    const firstDayOfWeek = start.getDay();
    const startDate = new Date(start);
    startDate.setDate(
      start.getDate() - (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1)
    );

    // 42 gün (6 hafta) ekle
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const handleDayClick = (day) => {
    console.log(
      "Clicked day:",
      day,
      "Date string:",
      formatDate(day, "yyyy-MM-dd")
    );

    // Auth kontrolü
    if (!checkAuth()) {
      console.log("❌ Auth failed for day click");
      return;
    }

    const dateString = formatDate(day, "yyyy-MM-dd");
    router.push(`/schedule/day/${dateString}`);
  };

  // Belirli bir gün için etkinlikleri getir
  const getEventsForDay = (day) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return isSameDay(eventDate, day);
    });
  };

  // Kategori rengini getir
  const getCategoryColor = (category) => {
    const colors = {
      study: "bg-blue-500",
      exam: "bg-red-500",
      homework: "bg-green-500",
      break: "bg-yellow-500",
      sport: "bg-purple-500",
      social: "bg-pink-500",
    };
    return colors[category] || "bg-gray-500";
  };

  // Takvim günü render et
  const renderCalendarDay = (day) => {
    if (!day) {
      return <div className="w-full h-full"></div>;
    }

    const dayEvents = getEventsForDay(day);
    const isTodayDate = isToday(day);
    const isPast = isPastDate(day);

    return (
      <button
        onClick={() => handleDayClick(day)}
        className={`
          w-full h-full p-3 rounded-xl transition-all duration-200 relative group
          ${
            isTodayDate
              ? "bg-white text-purple-900 shadow-lg transform scale-105"
              : isPast
              ? "bg-white/10 text-purple-400 hover:bg-white/15"
              : "bg-white/20 text-white hover:bg-white/30 hover:scale-105"
          }
        `}
      >
        <div className="flex flex-col h-full">
          <span
            className={`text-sm font-semibold ${
              isTodayDate ? "text-purple-900" : ""
            }`}
          >
            {day.getDate()}
          </span>
          <div className="flex-1 flex flex-col justify-end space-y-1 mt-2">
            {dayEvents.slice(0, 2).map((event, index) => (
              <div
                key={index}
                className={`w-full h-1 rounded-full ${getCategoryColor(
                  event.category
                )}`}
              />
            ))}
            {dayEvents.length > 2 && (
              <div
                className={`text-xs font-medium ${
                  isTodayDate ? "text-purple-700" : "text-purple-300"
                }`}
              >
                +{dayEvents.length - 2}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-50">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">
              Etkinlikler yükleniyor...
            </p>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-lg">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                StudyMate
              </h1>
              <p className="text-purple-200">Çalışma Takvimi</p>
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

        {/* Calendar Navigation */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-center space-x-8 mb-8">
            <button
              onClick={handlePrevMonth}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <ChevronLeftIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>

            <h2 className="text-3xl font-bold text-white text-center min-w-[200px]">
              {formatDate(currentDate, "MMMM yyyy")}
            </h2>

            <button
              onClick={handleNextMonth}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group"
            >
              <ChevronRightIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Takvim grid kısmını bulun ve değiştirin */}
          <div className="mb-8 max-w-4xl mx-auto">
            {/* Gün başlıkları */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
                <div
                  key={day}
                  className="h-10 flex items-center justify-center text-purple-200 font-medium text-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Takvim günleri */}
            <div className="grid grid-cols-7 gap-2">
              {getCalendarDays(currentDate).map((day, index) => (
                <div key={index} className="aspect-square">
                  {renderCalendarDay(day)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-200 text-sm">Bu Ay</p>
                <p className="text-2xl font-bold text-white">
                  {events.length} Etkinlik
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl">
                <ClockIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-200 text-sm">Bugün</p>
                <p className="text-2xl font-bold text-white">
                  {getEventsForDay(new Date()).length} Etkinlik
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                <BellIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-200 text-sm">Başarı</p>
                <p className="text-2xl font-bold text-white">85%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => router.push("/")}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40"
      >
        <HomeIcon className="w-6 h-6" />
      </button>
    </div>
  );
}
