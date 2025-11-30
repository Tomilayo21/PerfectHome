// // models/Partner.js
// import mongoose from "mongoose";

// const partnerSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   name: { type: String, required: true },
//   imageUrl: { type: String, required: false },
//   comment: { type: String, required: true },
//   approved: { type: Boolean, default: false },
//   position: { type: Number, default: 0 },
// }, { timestamps: true });

// export default mongoose.models.Partner || mongoose.model("Partner", partnerSchema);















import mongoose from "mongoose";

const partnerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  imageUrl: { type: [String], required: false, default: [] },  // <-- change here
  comment: { type: String, required: true },
  approved: { type: Boolean, default: false },
  position: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Partner || mongoose.model("Partner", partnerSchema);
