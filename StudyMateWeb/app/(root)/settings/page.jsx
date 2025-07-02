"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  LanguageIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

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
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setSuccess("Profil başarıyla güncellendi");
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError("Bir hata oluştu");
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

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
            Ayarlar
          </h1>
          <p className="text-purple-200 text-lg">
            Hesap bilgilerinizi ve tercihlerinizi yönetin
          </p>
        </div>

        <div className="grid gap-8">
          {/* Profile Settings */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <UserIcon className="w-6 h-6 text-purple-300" />
              <h2 className="text-2xl font-semibold text-white">
                Profil Bilgileri
              </h2>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-purple-200 text-sm">Kullanıcı Adı</p>
                    <p className="text-white font-medium">{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-purple-200 text-sm">E-posta</p>
                    <p className="text-white font-medium">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                  Düzenle
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Mevcut Şifre (Doğrulama için)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Değişiklikleri kaydetmek için şifrenizi girin"
                    required
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center space-x-2"
                  >
                    <XMarkIcon className="w-5 h-5" />
                    <span>İptal</span>
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <CheckIcon className="w-5 h-5" />
                    <span>Kaydet</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Preferences */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <BellIcon className="w-6 h-6 text-purple-300" />
              <h2 className="text-2xl font-semibold text-white">Tercihler</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center space-x-3">
                  <BellIcon className="w-5 h-5 text-purple-300" />
                  <div>
                    <p className="text-white font-medium">Bildirimler</p>
                    <p className="text-purple-200 text-sm">
                      Etkinlik hatırlatmaları
                    </p>
                  </div>
                </div>
                <button className="w-12 h-6 bg-purple-600 rounded-full relative transition-colors">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center space-x-3">
                  <MoonIcon className="w-5 h-5 text-purple-300" />
                  <div>
                    <p className="text-white font-medium">Karanlık Tema</p>
                    <p className="text-purple-200 text-sm">Gece modu</p>
                  </div>
                </div>
                <button className="w-12 h-6 bg-purple-600 rounded-full relative transition-colors">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center space-x-3">
                  <LanguageIcon className="w-5 h-5 text-purple-300" />
                  <div>
                    <p className="text-white font-medium">Dil</p>
                    <p className="text-purple-200 text-sm">Türkçe</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-white/10 text-purple-200 rounded-lg hover:bg-white/20 transition-colors">
                  Değiştir
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <ShieldCheckIcon className="w-6 h-6 text-purple-300" />
              <h2 className="text-2xl font-semibold text-white">Güvenlik</h2>
            </div>

            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <KeyIcon className="w-5 h-5 text-purple-300" />
                  <div className="text-left">
                    <p className="text-white font-medium">Şifre Değiştir</p>
                    <p className="text-purple-200 text-sm">
                      Hesap güvenliğinizi artırın
                    </p>
                  </div>
                </div>
                <div className="text-purple-300">→</div>
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                router.push("/login");
              }}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all duration-300"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button - Home */}
      <button
        onClick={() => router.push("/")}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40"
      >
        <HomeIcon className="w-6 h-6" />
      </button>
    </div>
  );
}
