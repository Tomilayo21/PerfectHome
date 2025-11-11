// // /app/api/current-user/route.js
// import { auth } from "@clerk/nextjs/server"; 
// import connectDB from "@/config/db";
// import User from "@/models/User";

// export async function GET() {
//   const { userId } = auth();
//   if (!userId) return new Response(JSON.stringify({}), { status: 401 });

//   await connectDB();
//   const user = await User.findOne({ clerkId: userId });
//   if (!user) return new Response(JSON.stringify({}), { status: 404 });

//   return new Response(JSON.stringify({ role: user.role }), { status: 200 });
// }















import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // ✅ get current user ID
import connectDB from "@/config/db";
import User from "@/models/User";

export async function GET() {
  try {
    const { userId } = auth(); // Clerk ID of signed-in user
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Find the user in your MongoDB
    const localUser = await User.findOne({ clerkId: userId });

    if (!localUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ role: localUser.role }, { status: 200 });
  } catch (error) {
    console.error("Server error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
