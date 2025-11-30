import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema(
  {
    heading: String,
    subheading : String,
    description: String,
    section: String,
    image: {
      type: [String],
      required: true,
    },

    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Team || mongoose.model("Team", TeamSchema);
