"use client";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ListTodo,
  PieChart,
  LogOut,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    todayTasks: 0,
    completedPercentage: 0,
    totalHours: 0,
    efficiency: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/users/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("İstatistikler yüklenirken hata oluştu:", error);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    // Token'ı sil
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    // Login sayfasına yönlendir
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Bölümü */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">StudyMate</h1>
            <div className="flex items-center space-x-4">
              <div
                className="flex items-center space-x-2 text-gray-600 cursor-pointer hover:text-gray-800"
                onClick={() => router.push("/profile")}
              >
                <User className="w-6 h-6" />
                <span>Profilim</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="w-6 h-6" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Ana İçerik */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mevcut Dashboard içeriği */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Hoş Geldiniz 👋</h2>
          <p className="text-gray-600">Çizelge takip sisteminizi yönetin</p>
        </div>

        {/* Ana Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* İstatistik Kartları */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Bugünkü Görevler</h3>
                <p className="text-2xl font-semibold">{stats.todayTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <ListTodo className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Tamamlanan</h3>
                <p className="text-2xl font-semibold">
                  {stats.completedPercentage}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Toplam Süre</h3>
                <p className="text-2xl font-semibold">{stats.totalHours}s</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <PieChart className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Verimlilik</h3>
                <p className="text-2xl font-semibold">{stats.efficiency}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı İşlemler */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Hızlı İşlemler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 font-medium transition-colors">
              Yeni Görev Ekle
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-600 font-medium transition-colors">
              Rapor Oluştur
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-600 font-medium transition-colors">
              Takvimi Görüntüle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
