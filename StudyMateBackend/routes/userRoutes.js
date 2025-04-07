const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { sendResetEmail } = require("../utils/emailService");
const multer = require("multer");
const path = require("path");

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
    const { username, name, email, password } = req.body;

    // Username kontrolü
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res
        .status(400)
        .json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
    }

    // Email kontrolü
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Bu email zaten kayıtlı" });
    }

    // Şifreyi hashleme
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yeni kullanıcı oluşturma
    const user = await User.create({
      username,
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Kayıt başarılı",
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Giriş yapma
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcı kontrolü
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Kullanıcı bulunamadı" });
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Geçersiz şifre" });
    }

    // JWT token oluşturma
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

// Kullanıcı bilgilerini getiren middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token bulunamadı" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Geçersiz token" });
  }
};

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
    const { name, username, email } = req.body;
    const userId = req.user._id;

    // Email ve username benzersizlik kontrolü
    if (email !== req.user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res
          .status(400)
          .json({ message: "Bu e-posta adresi zaten kullanımda" });
      }
    }

    if (username !== req.user.username) {
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

    // Kullanıcı bilgilerini güncelle
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, username, email },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profil başarıyla güncellendi",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Profil güncellenirken bir hata oluştu" });
  }
});

module.exports = router;
