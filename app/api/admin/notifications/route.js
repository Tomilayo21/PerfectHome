import connectDB from "@/config/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Notification from "@/models/Notification";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Review from "@/models/Review";
import Contact from "@/models/Contact";

export async function GET() {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const userId = session.user.id; // string ID
    const updates = [];

    // 1️⃣ New Orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(10).lean();
    for (const order of recentOrders) {
      const message = ` New order ${order.orderId} received.`;
      updates.push(
        Notification.updateOne(
          { userId, type: "order", message },
          { userId, type: "order", message, isRead: false, createdAt: order.createdAt },
          { upsert: true }
        )
      );

      // Status change
      if (["Shipped", "Delivered", "Cancelled"].includes(order.orderStatus)) {
        const statusMessage = ` Order ${order.orderId} has been ${order.orderStatus}.`;
        updates.push(
          Notification.updateOne(
            { userId, type: "order", message: statusMessage },
            { userId, type: "order", message: statusMessage, isRead: false, createdAt: order.updatedAt },
            { upsert: true }
          )
        );
      }
    }

    // 2️⃣ Low Stock Alerts
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } }).lean();
    for (const p of lowStockProducts) {
      const message = ` Only ${p.stock} units left of ${p.name}.`;
      updates.push(
        Notification.updateOne(
          { userId, type: "stock", message },
          { userId, type: "stock", message, isRead: false, createdAt: p.updatedAt },
          { upsert: true }
        )
      );
    }

    // 3️⃣ Pending Reviews
    const pendingReviews = await Review.find({ approved: false })
      .populate("productId", "name")
      .lean();
    for (const r of pendingReviews) {
      const message = ` New review submitted for ${r.productId?.name || "a product"}.`;
      updates.push(
        Notification.updateOne(
          { userId, type: "review", message },
          { userId, type: "review", message, isRead: false, createdAt: r.createdAt },
          { upsert: true }
        )
      );
    }

    // 4️⃣ New Users
    const newUsers = await User.find().sort({ createdAt: -1 }).limit(5).lean();
    for (const u of newUsers) {
      const message = ` ${u.name || "A user"} just signed up.`;
      updates.push(
        Notification.updateOne(
          { userId, type: "user", message },
          { userId, type: "user", message, isRead: false, createdAt: u.createdAt },
          { upsert: true }
        )
      );
    }

    // 5️⃣ Contact Messages
    const unreadContacts = await Contact.find({ read: false, archived: false }).lean();
    for (const c of unreadContacts) {
      const message = ` New support message from ${c.name}.`;
      updates.push(
        Notification.updateOne(
          { userId, type: "message", message },
          { userId, type: "message", message, isRead: false, createdAt: c.createdAt },
          { upsert: true }
        )
      );
    }

    // Commit changes
    await Promise.all(updates);

    // ✅ Fetch notifications
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!notifications.length) {
      return new Response(
        JSON.stringify({
          success: true,
          data: [
            {
              _id: "placeholder",
              type: "info",
              message: "No notifications yet.",
              isRead: true,
              createdAt: new Date(),
            },
          ],
        }),
        { status: 200 }
      );
    }

    return new Response(JSON.stringify({ success: true, data: notifications }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Server error" }),
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "Notification ID required" }),
        { status: 400 }
      );
    }

    const updated = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!updated) {
      return new Response(
        JSON.stringify({ success: false, error: "Notification not found" }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({ success: true, data: updated }), {
      status: 200,
    });
  } catch (err) {
    console.error("Error marking notification as read:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Failed to mark as read" }),
      { status: 500 }
    );
  }
}