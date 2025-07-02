// Farklı yöntemlerle .env dosyasını yüklemeyi dene
const path = require("path");
const fs = require("fs");

// .env dosyasının varlığını kontrol et
const envPath = path.join(__dirname, ".env");
console.log("🔍 .env file path:", envPath);
console.log("🔍 .env file exists:", fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  console.log("🔍 .env file size:", envContent.length, "bytes");
  console.log("🔍 .env file content:");
  console.log("'" + envContent + "'");
  console.log("🔍 .env file lines:", envContent.split("\n").length);
}

// Dotenv'i yükle
require("dotenv").config({ path: envPath });

// Debug: Environment variables kontrolü
console.log("🔍 Environment Variables Debug:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Exists" : "❌ Missing");

const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const eventRoutes = require("./routes/eventRoutes");
const taskRoutes = require("./routes/taskRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();
connectDB();

app.use(express.json());
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Debug için request logger ekleyelim
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("StudyMate Backend Running 🚀");
});

// Test endpoint ekleyelim
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend çalışıyor!",
    timestamp: new Date(),
    status: "OK",
  });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ai", aiRoutes);

// Uploads klasörünü statik olarak serve et
app.use("/uploads", express.static("uploads"));

// Uploads klasörünü oluştur
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Bir şeyler yanlış gitti!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
