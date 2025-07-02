const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { sendResetEmail } = require("../utils/emailService");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");

// Tüm kullanıcıları getir
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni kullanıcı ekle
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;
  const newUser = new User({ name, email, password });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Kayıt olma
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Kullanıcı adı zaten var mı kontrol et
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res
        .status(400)
        .json({ message: "Bu kullanıcı adı zaten alınmış" });
    }

    // Email zaten var mı kontrol et
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Bu email zaten kayıtlı" });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // Token oluştur
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || "your-secret-key"
    );

    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Giriş yapma - Username ile (case-insensitive)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log("🔐 Login attempt:", {
      username,
      password: password ? "***" : "empty",
    });

    // Kullanıcıyı username ile bul (case-insensitive)
    const user = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });

    console.log(
      "👤 User found:",
      user
        ? { id: user._id, username: user.username, email: user.email }
        : "No user found"
    );

    if (!user) {
      console.log("❌ User not found");
      return res
        .status(400)
        .json({ message: "Kullanıcı adı veya şifre hatalı" });
    }

    // Şifre kontrolü
    console.log("🔑 Comparing passwords...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔑 Password match:", isMatch);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res
        .status(400)
        .json({ message: "Kullanıcı adı veya şifre hatalı" });
    }

    // Token oluştur
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key"
    );

    console.log("✅ Login successful for user:", user.username);
    res.json({
      message: "Giriş başarılı",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Şifre sıfırlama isteği
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Şifre sıfırlama isteği alındı:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı",
      });
    }

    // Rastgele token oluştur
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 saat
    await user.save();

    // E-posta gönder
    const emailSent = await sendResetEmail(user.email, resetToken);

    if (emailSent) {
      res.json({
        message: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi",
      });
    } else {
      // E-posta gönderilemezse token'ı sil
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      res.status(500).json({
        message: "E-posta gönderilemedi, lütfen daha sonra tekrar deneyin",
      });
    }
  } catch (error) {
    console.error("Şifre sıfırlama hatası:", error);
    res.status(500).json({
      message: "Bir hata oluştu, lütfen daha sonra tekrar deneyin",
    });
  }
});

// Şifre sıfırlama
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Geçersiz veya süresi dolmuş token" });
    }

    // Yeni şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Şifreniz başarıyla değiştirildi" });
  } catch (error) {
    res.status(500).json({ message: "Şifre değiştirilemedi" });
  }
});

// Kullanıcı bilgilerini getiren endpoint
router.get("/me", authMiddleware, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Multer yapılandırması
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // uploads klasörüne kaydet
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // benzersiz isim
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Sadece resim dosyaları yüklenebilir."));
    }
  },
});

// Profil resmi yükleme endpoint'i
router.post(
  "/profile-image",
  authMiddleware,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Dosya yüklenemedi" });
      }

      const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { profileImage: imageUrl },
        { new: true }
      ).select("-password");

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Profil güncelleme endpoint'i
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const userId = req.user._id;

    // Şifre kontrolü
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Şifreyi kontrol et
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Şifre yanlış" });
    }

    // Username benzersizlik kontrolü
    if (username !== user.username) {
      const usernameExists = await User.findOne({
        username,
        _id: { $ne: userId },
      });
      if (usernameExists) {
        return res
          .status(400)
          .json({ message: "Bu kullanıcı adı zaten kullanımda" });
      }
    }

    // Email benzersizlik kontrolü
    if (email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res
          .status(400)
          .json({ message: "Bu e-posta adresi zaten kullanımda" });
      }
    }

    // Kullanıcı bilgilerini güncelle
    user.username = username;
    user.email = email;
    await user.save();

    res.json({
      message: "Profil başarıyla güncellendi",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Profil güncellenirken bir hata oluştu" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Çıkış başarılı" });
});

// Test endpoint - kullanıcıyı username ile bul
router.get("/test-user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });

    if (user) {
      res.json({
        found: true,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          email: user.email,
          hasPassword: !!user.password,
        },
      });
    } else {
      res.json({ found: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint - tüm kullanıcı detaylarını göster
router.get("/debug-users", async (req, res) => {
  try {
    const users = await User.find({}).select("+password");

    const userDetails = users.map((user) => ({
      id: user._id,
      username: user.username,
      usernameType: typeof user.username,
      usernameLength: user.username ? user.username.length : 0,
      name: user.name,
      email: user.email,
      hasPassword: !!user.password,
      createdAt: user.createdAt,
    }));

    res.json({
      totalUsers: users.length,
      users: userDetails,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint - username ile arama test et
router.get("/debug-search/:username", async (req, res) => {
  try {
    const { username } = req.params;
    console.log(
      "🔍 Searching for username:",
      username,
      "Type:",
      typeof username
    );

    // Farklı arama yöntemleri dene
    const exactMatch = await User.findOne({ username: username });
    const caseInsensitive = await User.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });
    const allUsers = await User.find({});

    res.json({
      searchTerm: username,
      exactMatch: exactMatch
        ? { id: exactMatch._id, username: exactMatch.username }
        : null,
      caseInsensitive: caseInsensitive
        ? { id: caseInsensitive._id, username: caseInsensitive.username }
        : null,
      allUsernames: allUsers.map((u) => ({
        id: u._id,
        username: u.username,
        email: u.email,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Geçici: Email'den username oluştur
router.post("/fix-username", async (req, res) => {
  try {
    const { email, newUsername } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    user.username = newUsername;
    await user.save();

    res.json({
      message: "Username başarıyla eklendi",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Database debug endpoint
router.get("/debug-db", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const db = mongoose.connection.db;

    // Tüm koleksiyonları listele
    const collections = await db.listCollections().toArray();

    // Her koleksiyondaki döküman sayısını say
    const collectionStats = {};
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      collectionStats[collection.name] = count;
    }

    // Users koleksiyonundaki tüm dökümanları getir
    const usersCollection = db.collection("users");
    const allUsers = await usersCollection.find({}).toArray();

    res.json({
      databaseName: db.databaseName,
      collections: collections.map((c) => c.name),
      collectionStats,
      usersInUsersCollection: allUsers.length,
      sampleUsers: allUsers.slice(0, 3), // İlk 3 kullanıcıyı göster
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// İstatistikleri getir
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Event modelini import et
    const Event = require("../models/Event");

    // Bugünün tarihi
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // İstatistikleri hesapla
    const totalEvents = await Event.countDocuments({ userId });
    const todayEvents = await Event.countDocuments({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    const upcomingEvents = await Event.countDocuments({
      userId,
      date: { $gt: new Date() },
    });

    const stats = {
      totalEvents,
      todayEvents,
      upcomingEvents,
      completedEvents: 0, // Bu özellik henüz yok
    };

    res.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "İstatistikler alınırken hata oluştu" });
  }
});

module.exports = router;
