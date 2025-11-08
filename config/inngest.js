import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/User";
import Order from "@/models/Order";
import Broadcast from "@/models/Broadcast";
import Subscriber from "@/models/Subscriber";
import nodemailer from "nodemailer";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "cuscedang" });

// Inngest Function to save  user data to a database
export const syncUserCreation = inngest.createFunction(
    {
        id : 'sync-user-from-clerk'
    },
    { event : 'clerk/user.created' },
    async ({event}) => {
        const {  id, first_name, last_name, email_addresses, image_url, username } = event.data
        const userData = {
            _id : id,
            email : email_addresses[0].email_address,
            name : first_name + ' ' + last_name,
            username : username,
            imageUrl : image_url
        }
        await connectDB()
        await User.create(userData)
    }
)


// Inngest Function to update user data in database
export const syncUserUpdation = inngest.createFunction (
    {
        id : 'update-user-from-clerk'
    },
    {
        event : 'clerk/user.updated'
    },
    async ({ event }) => {
        const {  id, first_name, last_name, email_addresses, image_url, username} = event.data
        const userData = {
            _id : id,
            email : email_addresses[0].email_address,
            name : first_name + ' ' + last_name,            
            username : username,
            imageUrl : image_url
        }
        await connectDB()
        await User.findByIdAndUpdate( id, userData)
    }
)


//Inngest Function to delete user from database
export const syncUserDeletion = inngest.createFunction(
    {
        id : 'delete-user-with-clerk'
    },
    {
        event : 'clerk/user.deleted'
    },
    async ({ event }) => {
        const { id } = event.data
        await connectDB()
        await User.findByIdAndDelete(id)
    }
)

// Inngest function to create user's order in the database
export const createUserOrder = inngest.createFunction(
  { id: "create-user-order" },
  { event: "order/created" },
  async ({ event }) => {
    await connectDB();

    const orderData = {
      userId: event.data.userId,
      items: event.data.items,
      amount: event.data.amount,
      address: event.data.address, // must be ObjectId
      date: event.data.date,
      paymentMethod: event.data.paymentMethod,
      orderStatus: event.data.status || "Order Placed",
      proofOfPaymentUrl: event.data.proofOfPaymentUrl || null,
    };

    const order = await Order.create(orderData);

    return { success: true, orderId: order._id.toString() };
  }
);

export const scheduledBroadcastSender = inngest.createFunction(
  { id: "scheduled-broadcast-sender" },
  { cron: "*/5 * * * *" }, // Every 5 minutes
  async () => {
    await connectDB();

    const now = new Date();
    const broadcasts = await Broadcast.find({
      status: "scheduled",
      scheduledFor: { $lte: now },
      sentAt: new Date(),
    });

    if (!broadcasts.length) {
      return { message: "No scheduled broadcasts due." };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    for (const broadcast of broadcasts) {
      const subscribers = await Subscriber.find();
      const recipientEmails = subscribers.map((s) => s.email);

      const attachments = (broadcast.attachment || []).map((url, index) => ({
        filename: `attachment-${index + 1}`,
        path: url,
        cid: url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)
          ? `inline-img-${index}`
          : undefined,
      }));

      const attachmentsHtml = (broadcast.attachment || [])
        .map((url, index) => {
          const isImage = url.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
          if (isImage) {
            return `<img src="cid:inline-img-${index}" alt="attachment" style="max-width:100%; height:auto; margin-bottom: 10px;" />`;
          } else {
            return `<p><a href="${url}" target="_blank" rel="noopener noreferrer">View Attachment ${index + 1}</a></p>`;
          }
        })
        .join("");

      const results = [];

      for (const email of recipientEmails) {
        try {
          await transporter.sendMail({
            from: `"Cusceda NG" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: broadcast.subject,
            html: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                <!-- Body -->
                <div style="padding: 30px 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                  <h2 style="color: #9CA3AF;">${broadcast.subject}</h2>
                  <div style="white-space: pre-wrap;">${broadcast.message}</div>

                  ${attachmentsHtml}

                  <p>Cheers,<br/>The Cusceda NG Team</p>
                </div>

                <!-- Footer -->
                <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888888;">
                  <p style="margin: 0;">&copy; ${new Date().getFullYear()} Cusceda NG. All rights reserved.</p>
                  <p style="margin: 5px 0 0;">
                    If you did not subscribe to this newsletter, you can safely ignore this email.
                  </p>
                  <p style="margin: 10px 0 0;">
                    You can unsubscribe
                    <a href="https://quick-carty.vercel.app/unsubscribe?email=${encodeURIComponent(
                      email
                    )}" style="color: #0070f3; text-decoration: none;">here</a>
                  </p>
                </div>
              </div>
            `,
            attachments,
          });

          results.push({ email, status: "sent" });
        } catch (err) {
          console.error("Failed to send to", email, err.message);
          results.push({ email, status: "failed", error: err.message });
        }
      }

      // Update broadcast status
      broadcast.status = "sent";
      broadcast.recipients = results;
      await broadcast.save();
    }

    return { message: "Scheduled broadcasts sent." };
  }
);
