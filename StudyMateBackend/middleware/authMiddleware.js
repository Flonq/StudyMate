const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    // Authorization header'ını al
    const authHeader = req.header("Authorization");

    console.log(
      "🔐 Auth header:",
      authHeader ? authHeader.substring(0, 20) + "..." : "None"
    );

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No valid auth header");
      return res.status(401).json({ message: "Yetkisiz - Token bulunamadı" });
    }

    // "Bearer " kısmını çıkar
    const token = authHeader.replace("Bearer ", "");

    console.log("🔍 Extracted token:", token.substring(0, 20) + "...");

    // JWT_SECRET kontrolü
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET not found in environment");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded for user ID:", decoded.userId);

    // Kullanıcıyı bul - id yerine _id kullan
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      console.log("❌ User not found for ID:", decoded.userId);
      return res
        .status(401)
        .json({ message: "Yetkisiz - Kullanıcı bulunamadı" });
    }

    console.log("✅ User authenticated:", user.email);
    // req.user.id'nin çalışması için hem _id hem id'yi ekle
    req.user = {
      ...user.toObject(),
      id: user._id.toString(),
    };
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Yetkisiz - Geçersiz token" });
    } else if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Yetkisiz - Token süresi dolmuş" });
    }
    return res.status(401).json({ message: "Yetkisiz" });
  }
};

module.exports = authMiddleware;
