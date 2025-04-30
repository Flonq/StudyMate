require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
connectDB();

app.use(express.json());
app.use(
  cors({
    origin: "*",
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

app.get("/", (req, res) => {
  res.send("StudyMate Backend Running 🚀");
});

// Routes
app.use("/api/users", require("./routes/userRoutes"));

// Uploads klasörünü statik olarak serve et
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
