"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  Calendar,
  Target,
  TrendingUp,
  User,
  Mail,
  Edit3,
  Save,
  X,
  Camera,
  BookOpen,
  Eye,
  EyeOff,
  Check,
  Lock,
  Home,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  CalendarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  ChartBarIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log("📊 User data received:", data); // Debug için
        setUserData({
          name: data.name || data.username,
          username: data.username,
          email: data.email,
          profileImage: data.profileImage || "",
          createdAt: data.createdAt,
        });
      } else {
        setError("Kullanıcı bilgileri alınamadı.");
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        }
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu 5MB'dan küçük olmalıdır.");
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith("image/")) {
      setError("Lütfen sadece resim dosyası seçin.");
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const token = localStorage.getItem("token");
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
        const updatedUser = await response.json();
        console.log("✅ Profile image updated:", updatedUser);
        setSuccess("Profil fotoğrafı başarıyla güncellendi!");
        fetchUserData(); // Verileri yenile
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Profil fotoğrafı yüklenemedi.");
      }
    } catch (err) {
      console.error("❌ Image upload error:", err);
      setError("Profil fotoğrafı yüklenirken bir hata oluştu.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      username: userData.username,
      email: userData.email,
      password: "",
    });
    setPassword("");
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
    setPassword("");
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!editData.password) {
      setError("Değişiklikleri kaydetmek için şifrenizi girmelisiniz.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:5000/api/users/update-profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: editData.username,
            email: editData.email,
            password: editData.password,
          }),
        }
      );

      if (response.ok) {
        setSuccess("Profil başarıyla güncellendi.");
        setIsEditing(false);
        fetchUserData();
        setEditData({});
      } else {
        const errorData = await response.json();
        setError(
          errorData.message ||
            "Güncelleme başarısız. Şifrenizi doğru girdiğinizden emin olun."
        );
      }
    } catch (err) {
      console.error("❌ Update error:", err);
      setError("Bir hata oluştu.");
    }
  };

  // Tarih formatlama fonksiyonu
  const formatDate = (dateString) => {
    if (!dateString) return "Bilinmiyor";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Bilinmiyor";

      return date.toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("❌ Date formatting error:", error);
      return "Bilinmiyor";
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Profil yükleniyor...</p>
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

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4">
            Profil
          </h1>
          <p className="text-purple-200 text-lg">Hesap bilgilerinizi yönetin</p>
        </div>

        <div className="grid gap-8">
          {/* Profile Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    {userData.profileImage ? (
                      <img
                        src={userData.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-16 h-16 text-purple-300" />
                    )}
                  </div>
                </div>
                <button
                  onClick={() =>
                    document.getElementById("profileImageInput").click()
                  }
                  className="absolute bottom-0 right-0 p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                >
                  <CameraIcon className="w-5 h-5" />
                </button>
                <input
                  id="profileImageInput"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {userData.name || "Kullanıcı"}
                </h2>
                <p className="text-purple-200 text-lg mb-1">
                  @{userData.username || "username"}
                </p>
                <p className="text-purple-300 mb-4">
                  {userData.email || "email@example.com"}
                </p>
                <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-purple-300">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Üye: {formatDate(userData.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
                  >
                    <PencilIcon className="w-5 h-5" />
                    <span>Düzenle</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors"
                    >
                      Kaydet
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <UserIcon className="w-6 h-6 text-purple-300" />
              <span>Kişisel Bilgiler</span>
            </h3>

            {!isEditing ? (
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Ad Soyad
                    </label>
                    <p className="text-white text-lg">
                      {userData.name || "Belirtilmemiş"}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Kullanıcı Adı
                    </label>
                    <p className="text-white text-lg">
                      {userData.username || "Belirtilmemiş"}
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    E-posta Adresi
                  </label>
                  <p className="text-white text-lg">
                    {userData.email || "Belirtilmemiş"}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    Üyelik Tarihi
                  </label>
                  <p className="text-white text-lg">
                    {formatDate(userData.createdAt)}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Ad Soyad
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Adınızı girin"
                    />
                  </div>
                  <div>
                    <label className="block text-purple-200 text-sm font-medium mb-2">
                      Kullanıcı Adı
                    </label>
                    <input
                      type="text"
                      value={editData.username}
                      onChange={(e) =>
                        setEditData({ ...editData, username: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Kullanıcı adınızı girin"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-purple-200 text-sm font-medium mb-2">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="E-posta adresinizi girin"
                  />
                </div>
              </form>
            )}
          </div>

          {/* Statistics */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
              <ChartBarIcon className="w-6 h-6 text-purple-300" />
              <span>İstatistikler</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl font-bold text-blue-400 mb-2">24</div>
                <div className="text-purple-200">Toplam Etkinlik</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl font-bold text-green-400 mb-2">18</div>
                <div className="text-purple-200">Tamamlanan</div>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  75%
                </div>
                <div className="text-purple-200">Başarı Oranı</div>
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
