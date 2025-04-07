"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Calendar,
  Trophy,
  Target,
  BarChart3,
  BookOpen,
  GraduationCap,
  Timer,
  Pencil,
  X,
  Save,
  Settings,
  ListTodo,
  PieChart,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({
    username: "",
    name: "",
    email: "",
    profileImage: "",
  });
  const [showLargeImage, setShowLargeImage] = useState(false);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) return;

      const response = await fetch("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setEditForm({
          name: userData.name,
          username: userData.username,
          email: userData.email,
        });
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(
        "http://localhost:5000/api/users/profile-image",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser((prev) => ({ ...prev, profileImage: data.profileImage }));
      }
    } catch (error) {
      console.error("Resim yükleme hatası:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Sayfa dışı tıklamaları dinle
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLargeImage) {
        setShowLargeImage(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLargeImage]);

  // Örnek veriler (daha sonra backend'den alınacak)
  const userStats = {
    totalStudyTime: "124 saat",
    weeklyAverage: "18 saat",
    longestStreak: "12 gün",
    totalTasks: "156",
    completedTasks: "134",
    efficiency: "86%",
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: user.name,
      username: user.username,
      email: user.email,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(
        "http://localhost:5000/api/users/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editForm),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setSuccess("Profil başarıyla güncellendi");
        setIsEditing(false);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Bir hata oluştu");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profil Başlığı */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <GraduationCap className="w-10 h-10 text-blue-600" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg hover:bg-gray-100"
                >
                  <Pencil className="w-4 h-4 text-gray-600" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.username}
                </h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>

            {/* Ayarlar Butonu */}
            <button
              onClick={() => router.push("/settings")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Profil Ayarları"
            >
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Büyük Resim Modal */}
        {showLargeImage && user.profileImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="relative max-w-2xl max-h-2xl">
              <button
                onClick={() => setShowLargeImage(false)}
                className="absolute top-4 right-4 text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <Image
                src={user.profileImage}
                alt="Profil"
                width={500}
                height={500}
                className="rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Yükleme Göstergesi */}
        {isUploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg">Resim yükleniyor...</div>
          </div>
        )}

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm text-gray-500">Bugünkü Görevler</h3>
                <p className="text-2xl font-semibold">12</p>
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
                <p className="text-2xl font-semibold">85%</p>
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
                <p className="text-2xl font-semibold">24s</p>
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
                <p className="text-2xl font-semibold">92%</p>
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
            <button
              onClick={() => router.push("/schedule")}
              className="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-600 font-medium transition-colors"
            >
              Çalışma Planı Oluştur
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-600 font-medium transition-colors">
              Takvimi Görüntüle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
