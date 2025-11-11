import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/config/db";
import { requireAdmin } from "@/lib/authAdmin"; // ✅ Use your new NextAuth-based admin check

const ADMIN_PASSWORD = process.env.ADMIN_BACKUP_PASSWORD || "changeme";

export async function POST(request) {
  try {
    // ✅ 1️⃣ Authenticate admin via NextAuth session
    const adminUser = await requireAdmin(request);
    if (adminUser instanceof NextResponse) {
      // If requireAdmin already returned a response (401 or 403)
      return adminUser;
    }

    // ✅ 2️⃣ Verify backup password from request body
    const { password } = await request.json();
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ message: "Invalid password" }, { status: 403 });
    }

    // ✅ 3️⃣ Connect to the database
    await connectDB();

    // ✅ 4️⃣ Export all collections to JSON
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backupData = {};

    for (const { name } of collections) {
      backupData[name] = await mongoose.connection.db.collection(name).find().toArray();
    }

    // ✅ 5️⃣ Return JSON file as downloadable response
    const json = JSON.stringify(backupData, null, 2);

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": 'attachment; filename="backup.json"',
      },
    });
  } catch (error) {
    console.error("Backup error:", error);
    return NextResponse.json(
      { message: "Backup failed", error: error.message },
      { status: 500 }
    );
  }
}
