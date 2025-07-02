const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Event = require("../models/Event");
const authMiddleware = require("../middleware/authMiddleware");

// Debug: API key kontrolü
console.log(
  "🔍 GEMINI_API_KEY check:",
  process.env.GEMINI_API_KEY ? "✅ Exists" : "❌ Missing"
);
console.log(
  "🔍 GEMINI_API_KEY length:",
  process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0
);

// Gemini AI yapılandırması
let genAI;
try {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("✅ Gemini AI initialized successfully");
  } else {
    console.error("❌ GEMINI_API_KEY not found");
  }
} catch (error) {
  console.error("❌ Gemini AI initialization failed:", error.message);
}

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const { message, date } = req.body;
    const userId = req.user.id;

    console.log("🤖 AI Chat Request received:", { message, date, userId });

    // API key kontrolü
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY is missing in request");
      return res.status(500).json({
        message: "AI servisi yapılandırılmamış - API key eksik",
        error: "GEMINI_API_KEY bulunamadı",
      });
    }

    if (!genAI) {
      console.error("❌ Gemini AI not initialized");
      return res.status(500).json({
        message: "AI servisi başlatılamadı",
        error: "Gemini AI initialization failed",
      });
    }

    // AI'dan yanıt al
    console.log("🔄 Calling Gemini API...");
    const aiResponse = await callGeminiAPI(message, date);
    console.log("🤖 AI Response received, length:", aiResponse.length);

    // AI yanıtından etkinlikleri parse et
    const events = parseEventsFromAI(aiResponse);
    console.log("📅 Parsed Events count:", events.length);

    // Etkinlikleri veritabanına kaydet
    const savedEvents = [];
    for (const eventData of events) {
      try {
        console.log("💾 Saving event:", eventData.title);
        const newEvent = new Event({
          ...eventData,
          date: new Date(date + "T00:00:00.000Z"),
          userId: userId,
        });

        const savedEvent = await newEvent.save();
        savedEvents.push(savedEvent);
        console.log("✅ Event saved successfully:", savedEvent.title);
      } catch (saveError) {
        console.error("❌ Error saving event:", saveError.message);
      }
    }

    console.log(`✅ Total events saved: ${savedEvents.length}`);

    res.json({
      message: `${savedEvents.length} etkinlik başarıyla eklendi!`,
      eventsCreated: savedEvents.length,
      events: savedEvents,
    });
  } catch (error) {
    console.error("❌ AI Chat Error Details:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      message: "AI ile iletişimde bir hata oluştu",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

async function callGeminiAPI(userMessage, date) {
  try {
    console.log("🔄 Getting Gemini model...");

    // Yeni model ismi: gemini-1.5-flash veya gemini-1.5-pro
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Sen bir çalışma planı asistanısın. Kullanıcının isteğine göre ${date} tarihi için etkinlikler öner ve JSON formatında döndür.

Kullanıcı mesajı: "${userMessage}"
Tarih: ${date}

Lütfen şu JSON formatında yanıt ver:
{
  "response": "Kullanıcıya verilecek açıklama mesajı",
  "events": [
    {
      "title": "Etkinlik başlığı",
      "description": "Etkinlik açıklaması",
      "startTime": "09:00",
      "endTime": "10:00",
      "category": "study",
      "color": "bg-blue-500"
    }
  ]
}

Kategoriler: study, exam, homework, break, sport, social
Renkler: bg-blue-500, bg-green-500, bg-red-500, bg-yellow-500, bg-purple-500, bg-pink-500

Sadece JSON formatında yanıt ver, başka açıklama ekleme.
`;

    console.log("🔄 Generating content with Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Gemini API call successful");
    return text;
  } catch (error) {
    console.error("❌ Gemini API Error Details:");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error status:", error.status);

    // Eğer model bulunamazsa alternatif model dene
    if (error.message.includes("not found") || error.message.includes("404")) {
      console.log("🔄 Trying alternative model: gemini-1.5-pro");
      try {
        const altModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await altModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (altError) {
        console.error("❌ Alternative model also failed:", altError.message);
        throw new Error(`Gemini API hatası: ${altError.message}`);
      }
    }

    throw new Error(`Gemini API hatası: ${error.message}`);
  }
}

function parseEventsFromAI(aiResponse) {
  try {
    console.log("🔄 Parsing AI response...");

    // JSON'u temizle ve parse et
    let cleanResponse = aiResponse.trim();

    // Markdown kod bloklarını temizle
    cleanResponse = cleanResponse
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");

    console.log(
      "🧹 Cleaned response preview:",
      cleanResponse.substring(0, 100) + "..."
    );

    const parsed = JSON.parse(cleanResponse);

    if (parsed.events && Array.isArray(parsed.events)) {
      console.log(`✅ Successfully parsed ${parsed.events.length} events`);
      return parsed.events;
    }

    console.log("⚠️ No events array found in response");
    return [];
  } catch (error) {
    console.error("❌ Parse Error:", error.message);
    console.log("📝 Raw AI Response:", aiResponse);
    return [];
  }
}

// Test endpoint
router.get("/test", authMiddleware, (req, res) => {
  res.json({
    message: "AI service is working",
    user: req.user.email,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
