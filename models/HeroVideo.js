import mongoose from "mongoose";

const HeroVideoSchema = new mongoose.Schema(
  {
    videoUrl: { type: String, required: true },
    width: { type: String, default: "100%" },
    height: { type: String, default: "120vh" },
  },
  { timestamps: true }
);

export default mongoose.models.HeroVideo ||
  mongoose.model("HeroVideo", HeroVideoSchema);
