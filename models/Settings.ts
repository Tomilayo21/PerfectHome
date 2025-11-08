import { ISettings } from "@/lib/Settings";
import mongoose, { Schema, Model, models } from "mongoose";


const SettingsSchema = new Schema<ISettings>({
  lightLogoUrl: String,
  darkLogoUrl: String,
  siteTitle: String,
  siteDescription: String,
  supportEmail: String,
  footerDescription: String,
  footerPhone: String,
  footerEmail: String,
  footerName: String,
  socialLinks: [
    {
      platform: String, 
      iconUrl: String,
      url: String, 
    },
  ],
});

const Settings: Model<ISettings> = models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
