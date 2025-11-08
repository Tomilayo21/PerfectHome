// import mongoose from "mongoose";

// const PrivacyPolicySchema = new mongoose.Schema(
//   {
//     content: {
//       type: String,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// const PrivacyPolicy = mongoose.models.PrivacyPolicy || mongoose.model("PrivacyPolicy", PrivacyPolicySchema);

// export default PrivacyPolicy;













// import mongoose from "mongoose";

// const PrivacyPolicySchema = new mongoose.Schema({
//   heading: {
//     type: String,
//     required: true,
//   },
//   subheading: {
//     type: String,
//     required: true,
//   },
// });

// const PrivacyPolicy = mongoose.models.PrivacyPolicy || mongoose.model("PrivacyPolicy", PrivacyPolicySchema);
// export default PrivacyPolicy;




























import mongoose from "mongoose";

const PrivacySchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
  },
  subheading: {
    type: String,
    required: true,
  },
});

const Privacy = mongoose.models.Privacy || mongoose.model("Privacy", PrivacySchema);
export default Privacy;
