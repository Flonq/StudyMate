const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const authMiddleware = require("../middleware/authMiddleware");

// Tüm etkinlikleri getir
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Fetching all events for userId: ${userId}`);

    const events = await Event.find({ userId: userId }).sort({
      date: 1,
      startTime: 1,
    });

    // Date object'leri string'e çevir
    const formattedEvents = events.map((event) => ({
      ...event.toObject(),
      date:
        event.date instanceof Date
          ? event.date.toISOString().split("T")[0]
          : event.date,
    }));

    console.log(
      `Found ${formattedEvents.length} total events:`,
      formattedEvents
    );
    res.json(formattedEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Belirli bir tarihteki etkinlikleri getir
router.get("/date/:date", authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    console.log("📅 Requested date:", date);
    console.log("👤 User ID:", req.user.id);

    // Tarih string'ini Date object'e çevir
    const requestedDate = new Date(date + "T00:00:00.000Z");

    if (isNaN(requestedDate.getTime())) {
      return res.status(400).json({ message: "Geçersiz tarih formatı" });
    }

    const startOfDay = new Date(requestedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(requestedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log("📅 Date range:", { startOfDay, endOfDay });

    const events = await Event.find({
      userId: req.user.id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ startTime: 1 });

    console.log("📊 Found events:", events.length);
    console.log("📋 Events details:", events);

    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching events by date:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Yeni etkinlik ekle - düzeltildi
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      date,
      category,
      color,
      reminder,
    } = req.body;

    if (!title || !startTime || !endTime || !date || !category) {
      return res.status(400).json({ message: "Gerekli alanlar eksik" });
    }

    // Tarih formatını düzelt
    const eventDate = new Date(date + "T00:00:00.000Z");

    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ message: "Geçersiz tarih formatı" });
    }

    const newEvent = new Event({
      title,
      description,
      startTime,
      endTime,
      date: eventDate, // Date object olarak kaydet
      category,
      color,
      reminder,
      userId: req.user.id,
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Etkinlik eklenirken hata:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Etkinlik güncelle - düzeltildi
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startTime,
      endTime,
      date,
      category,
      color,
      reminder,
    } = req.body;

    const event = await Event.findOne({ _id: id, userId: req.user.id });
    if (!event) {
      return res.status(404).json({ message: "Etkinlik bulunamadı" });
    }

    // Tarih formatını düzelt
    const eventDate = new Date(date + "T00:00:00.000Z");

    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({ message: "Geçersiz tarih formatı" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        title,
        description,
        startTime,
        endTime,
        date: eventDate, // Date object olarak kaydet
        category,
        color,
        reminder,
      },
      { new: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    console.error("Etkinlik güncellenirken hata:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Etkinlik sil
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({ _id: id, userId: req.user.id });
    if (!event) {
      return res.status(404).json({ message: "Etkinlik bulunamadı" });
    }

    await Event.findByIdAndDelete(id);
    res.json({ message: "Etkinlik başarıyla silindi" });
  } catch (error) {
    console.error("Etkinlik silinirken hata:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// Test endpoint
router.get("/debug/all", async (req, res) => {
  try {
    const allEvents = await Event.find({}).sort({ date: 1 });
    console.log("🔍 All events in database:", allEvents);
    res.json({
      total: allEvents.length,
      events: allEvents,
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ message: "Debug error" });
  }
});

module.exports = router;
