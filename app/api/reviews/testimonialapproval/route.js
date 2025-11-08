// // app/api/reviews/testimonialapproval/route.js
// import { NextResponse } from "next/server";
// import connectDB from "@/config/db";
// import Review from "@/models/Review";
// import { getServerSession } from "next-auth/next";
// import authAdmin from "@/lib/authAdmin";
// import { authOptions } from "@/lib/authOptions";

// export async function PATCH(req) {
//   try {
//     await connectDB();

//     const { order } = await req.json();
//     if (!order || !Array.isArray(order)) {
//       return NextResponse.json(
//         { message: "Invalid format. Expected { order: [ {id, position} ] }" },
//         { status: 400 }
//       );
//     }

//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
//     }

//     const isAdmin = await authAdmin(session.user.id);
//     if (!isAdmin) {
//       return NextResponse.json({ message: "Not authorized" }, { status: 403 });
//     }

//     // bulkWrite to save all positions
//     const bulkOps = order.map(({ id, position }) => ({
//       updateOne: {
//         filter: { _id: id },
//         update: { $set: { position } },
//       },
//     }));

//     if (bulkOps.length > 0) {
//       await Review.bulkWrite(bulkOps);
//     }

//     return NextResponse.json({ message: "Order updated successfully" }, { status: 200 });
//   } catch (error) {
//     console.error("PATCH /api/reviews/testimonialapproval error:", error);
//     return NextResponse.json(
//       { message: "Internal server error", error: error.message },
//       { status: 500 }
//     );
//   }
// }


























// app/api/reviews/testimonialapproval/route.js
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Review from "@/models/Review";
import { requireAdmin } from "@/lib/authAdmin";

export async function PATCH(req) {
  try {
    await connectDB();

    const { order } = await req.json();
    if (!order || !Array.isArray(order)) {
      return NextResponse.json(
        { message: "Invalid format. Expected { order: [ {id, position} ] }" },
        { status: 400 }
      );
    }

    // ✅ Enforce admin access via requireAdmin
    const adminUser = await requireAdmin(req);
    if (adminUser instanceof NextResponse) {
      // If requireAdmin returned a response (unauthorized or forbidden), return it
      return adminUser;
    }

    // ✅ Update review order positions in bulk
    const bulkOps = order.map(({ id, position }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { position } },
      },
    }));

    if (bulkOps.length > 0) {
      await Review.bulkWrite(bulkOps);
    }

    return NextResponse.json({ message: "Order updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/reviews/testimonialapproval error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
