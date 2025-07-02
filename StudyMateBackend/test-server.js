require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();

// Geçici in-memory kullanıcı veritabanı
let users = [
  {
    _id: "1",
    name: "Test Kullanıcı",
    email: "test@test.com",
    password: "$2b$10$rQZ8kHWKtGKVQZ8kHWKtGOeKVQZ8kHWKtGKVQZ8kHWKtGKVQZ8kHW", // "123456"
  },
];

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Debug için request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.send("StudyMate Test Backend Running 🚀");
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend çalışıyor!",
    timestamp: new Date(),
    status: "OK",
  });
});

// Kayıt olma
app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("📝 Register attempt:", { name, email });

    // Kullanıcı zaten var mı kontrol et
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "Bu email zaten kayıtlı" });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcı oluştur
    const newUser = {
      _id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
    };

    users.push(newUser);

    // Token oluştur
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || "your-secret-key"
    );

    console.log("✅ User registered:", { id: newUser._id, email });

    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Giriş yapma
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", { email });

    // Kullanıcıyı bul
    const user = users.find((u) => u.email === email);

    if (!user) {
      console.log("❌ User not found");
      return res.status(400).json({ message: "Kullanıcı bulunamadı" });
    }

    // Şifre kontrolü
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(400).json({ message: "Şifre hatalı" });
    }

    // Token oluştur
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key"
    );

    console.log("✅ Login successful");
    res.json({
      message: "Giriş başarılı",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Kullanıcı bilgilerini getir
app.get("/api/users/me", (req, res) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Yetkisiz - Token bulunamadı" });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    const user = users.find((u) => u._id === decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Yetkisiz" });
  }
});

// Tüm kullanıcıları listele (debug için)
app.get("/api/users", (req, res) => {
  const safeUsers = users.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
  }));
  res.json(safeUsers);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Bir şeyler yanlış gitti!" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Test Server running on port ${PORT}`);
  console.log(`📧 Test kullanıcı: test@test.com / 123456`);
});
