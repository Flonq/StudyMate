const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔍 DB Connection Debug:");
    console.log("MONGO_URI type:", typeof process.env.MONGO_URI);
    console.log("MONGO_URI value:", process.env.MONGO_URI);
    console.log(
      "MONGO_URI length:",
      process.env.MONGO_URI ? process.env.MONGO_URI.length : 0
    );

    if (!process.env.MONGO_URI || process.env.MONGO_URI === "undefined") {
      console.error("❌ MONGO_URI is undefined or empty!");

      // Fallback URI kullan
      const fallbackUri = "mongodb://localhost:27017/studymate";
      console.log("🔄 Using fallback URI:", fallbackUri);

      const conn = await mongoose.connect(fallbackUri);

      console.log(
        `✅ MongoDB Bağlantısı Başarılı (Fallback): ${conn.connection.host}`
      );
      console.log(`📊 Database Name: ${conn.connection.db.databaseName}`);
      return;
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.db.databaseName}`);

    // Koleksiyonları listele
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(
      "📋 Available Collections:",
      collections.map((c) => c.name)
    );
  } catch (error) {
    console.error(`❌ MongoDB Bağlantı Hatası: ${error.message}`);

    // MongoDB yoksa alternatif çözüm öner
    if (error.message.includes("ECONNREFUSED")) {
      console.error("💡 MongoDB çalışmıyor. Alternatif çözümler:");
      console.error("   1. MongoDB'yi başlatın: mongod");
      console.error("   2. MongoDB Compass'ı açın");
      console.error("   3. Veya MongoDB Atlas kullanın");
    }

    process.exit(1);
  }
};

module.exports = connectDB;
