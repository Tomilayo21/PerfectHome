// models/FeaturedSlide.js
import mongoose from "mongoose";

const FeaturedSlideSchema = new mongoose.Schema(
  {
    propertyId: { type: String, required: true, index: true },
    // snapshot so ProductSlider doesn't need to call property API
    snapshot: {
      title: String,
      price: Number,
      location: String, // e.g. "Ikate, Lekki - Lagos"
      imgSrc: String,
      city: String,
      state: String,
      bedrooms: Number,
      bathrooms: Number,
      category: String,
    },

    // promotion fields
    deal: { type: String, default: "" }, // e.g. "Limited-Time Offer"
    sale: { type: String, default: "" }, // e.g. "5% Discount"
    offerEnd: { type: Date, default: null },

    // CTA
    buttonText: { type: String, default: "View Property" },
    buttonLink: { type: String, default: "" },

    // admin control
    active: { type: Boolean, default: true },
    position: { type: Number, default: 0 }, // ordering if you want multiple featured slides
  },
  { timestamps: true }
);

const FeaturedSlide = mongoose.models.FeaturedSlide || mongoose.model("FeaturedSlide", FeaturedSlideSchema);
export default FeaturedSlide;
