const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

// Tüm görevleri getir (kullanıcıya özel)
router.get("/", authMiddleware, async (req, res) => {
  const tasks = await Task.find({ user: req.user._id }).sort({ dueDate: 1 });
  res.json(tasks);
});

// Görev ekle
router.post("/", authMiddleware, async (req, res) => {
  const { title, description, category, dueDate, color } = req.body;
  const task = new Task({
    user: req.user._id,
    title,
    description,
    category,
    dueDate,
    color,
  });
  await task.save();
  res.status(201).json(task);
});

// Görev güncelle
router.put("/:id", authMiddleware, async (req, res) => {
  const { title, description, category, dueDate, completed, color } = req.body;
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { title, description, category, dueDate, completed, color },
    { new: true }
  );
  if (!task) return res.status(404).json({ message: "Görev bulunamadı" });
  res.json(task);
});

// Görev sil
router.delete("/:id", authMiddleware, async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!task) return res.status(404).json({ message: "Görev bulunamadı" });
  res.json({ message: "Görev silindi" });
});

module.exports = router;
