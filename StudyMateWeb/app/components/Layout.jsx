"use client";
import React from "react";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Layout({
  children,
  title = "StudyMate",
  showProfileButton = true,
}) {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-sky-50 to-cyan-50">
      {/* Header - Gradient arka plan */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              {title}
            </h1>

            {/* Sağ üst - Renkli düğmeler */}
            <div className="flex items-center space-x-3">
              {showProfileButton && (
                <button
                  onClick={() => router.push("/profile")}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  title="Profil"
                >
                  <User className="h-5 w-5" />
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ana içerik */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">{children}</div>
    </div>
  );
}
