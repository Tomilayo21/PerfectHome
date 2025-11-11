import connectDB from "@/config/db";
import { requireAdmin } from "@/lib/authAdmin";
import { NextResponse } from "next/server";

// Import all models
import About from "@/models/About";
import ActivityLog from "@/models/ActivityLog";
import Address from "@/models/Address";
import Broadcast from "@/models/Broadcast";
import Contact from "@/models/Contact";
import FAQ from "@/models/FAQ";
import GeneralSettings from "@/models/GeneralSettings";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import Order from "@/models/Order";
import Otp from "@/models/Otp";
import Partner from "@/models/Partner";
import Privacy from "@/models/Privacy";
import ReturnPolicy from "@/models/ReturnPolicy";
import Review from "@/models/Review";
import Settings from "@/models/Settings";
import Subscriber from "@/models/Subscriber";
import Team from "@/models/Team";
import Terms from "@/models/Terms";
import { Transaction } from "@/models/Transaction";
import User from "@/models/User";
import UserSettings from "@/models/UserSettings";

export async function DELETE(request) {
  try {
    // ✅ 1️⃣ Verify admin using NextAuth session
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) {
      // requireAdmin already returned an error response
      return adminUser;
    }

    // ✅ 2️⃣ Connect to database
    await connectDB();

    // ✅ 3️⃣ Models to clear
    const models = [
      About, FAQ, GeneralSettings,
      Notification, Otp, Partner, Privacy, ReturnPolicy,
      Team, Terms,
    ];

    // ✅ 4️⃣ Wipe data
    for (const Model of models) {
      await Model.deleteMany({});
    }

    return NextResponse.json(
      { message: "Database formatted successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Error formatting DB:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
