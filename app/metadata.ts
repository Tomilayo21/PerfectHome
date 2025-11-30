import connectDB from "@/config/db";
import Settings from "@/models/Settings";

export async function generateMetadata() {
  try {
    await connectDB(); // ensure connection

    const settings = await Settings.findOne(); // underline should now disappear
    return {
      title: settings?.siteTitle || "Perfect Home Premium Real Estate",
      description: settings?.siteDescription || "Innovative, Resilient, Growing",
    };
  } catch (error) {
    console.error("Metadata fetch failed:", error);
    return {
      title: "Perfect Home Premium Real Estate",
      description: "Innovative, Resilient, Growing",
    };
  }
}
