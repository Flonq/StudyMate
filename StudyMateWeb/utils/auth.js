"use client";

export const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};

  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const checkAuth = () => {
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
    return false;
  }
};

export const logout = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const apiCall = async (url, options = {}) => {
  try {
    const token = localStorage.getItem("token");

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    // Token süresi dolmuşsa logout yap
    if (response.status === 401) {
      logout();
      window.location.href = "/login";
      throw new Error("Oturum süresi dolmuş");
    }

    // Response'u kontrol et
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API call error:", error);
    throw error;
  }
};
