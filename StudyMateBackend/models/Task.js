const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String }, // ör: "Ders", "Kişisel", "İş"
    dueDate: { type: Date },
    completed: { type: Boolean, default: false },
    color: { type: String, default: "#6366f1" }, // Tailwind renk kodu gibi
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
