import mongoose from "mongoose";

const ReturnPolicySchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
    },
    subheading: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const ReturnPolicy =
  mongoose.models.ReturnPolicy ||
  mongoose.model("ReturnPolicy", ReturnPolicySchema);

export default ReturnPolicy;
