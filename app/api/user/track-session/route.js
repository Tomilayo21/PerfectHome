// /app/api/user/track-session/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/config/db";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const { os, browser, city, country, ip } = await req.json();

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) return new Response("User not found", { status: 404 });

    // Check if a session with same OS, browser, and IP exists
    const existingSession = user.sessions.find(
      (s) => s.os === os && s.browser === browser && s.ip === ip
    );

    if (existingSession) {
      // Update lastActive and location for existing session
      existingSession.lastActive = new Date();
      existingSession.city = city;
      existingSession.country = country;
    } else {
      // Add new session if not found
      user.sessions.push({
        token: crypto.randomUUID(),
        os,
        browser,
        ip,
        city,
        country,
        lastActive: new Date(),
      });
    }

    await user.save();

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed" }), { status: 500 });
  }
}
