// app/api/admin/users/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.clerk.com/v1/users", {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY!}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Clerk error:", errorText);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    const users = await response.json();
    const total = users.length;

    return NextResponse.json({ total }); // 👈 return only the count
  } catch (error: any) {
    console.error("Server error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
