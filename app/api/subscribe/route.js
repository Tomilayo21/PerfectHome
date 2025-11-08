import nodemailer from "nodemailer";
import Subscriber from "@/models/Subscriber";
import connectDB from "@/config/db";

export async function POST(req) {
  await connectDB();
  const { email } = await req.json();

  if (!email) {
    return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
  }

  const existing = await Subscriber.findOne({ email });
  if (existing) {
    return new Response(JSON.stringify({ message: "You’re already subscribed.", alreadySubscribed: true }), { status: 200 });
  }

  const newSubscriber = new Subscriber({ email });
  await newSubscriber.save();

  // Send welcome email
  const transporter = nodemailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Cusceda NG" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Welcome to Cusceda NG!",
      html: `
        <div style="max-width: 600px; margin: 30px auto; padding: 30px; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; font-family: 'Segoe UI', Arial, sans-serif; color: #333; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
  
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 25px;">
            <h1 style="color: #2c3e50; font-size: 24px; margin: 0;">🎉 Welcome to <span style="color:#007BFF;">Cusceda NG</span>!</h1>
            <p style="font-size: 16px; margin-top: 10px; color:#555;">Thanks for subscribing to our newsletter.</p>
          </div>

          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

          <!-- Body -->
          <div>
            <p style="font-size: 15px; line-height: 1.7; margin: 0 0 15px;">
              We're thrilled to have you on board! Here's what you'll enjoy:
            </p>
            <ul style="padding-left: 0; list-style: none; font-size: 15px; line-height: 1.7; margin: 0;">
              <li>📰 <strong>Updates</strong> on new products & services</li>
              <li>💡 <strong>Expert tips</strong> and insights</li>
              <li>🎁 <strong>Exclusive deals</strong> for subscribers only</li>
            </ul>
            <p style="font-size: 15px; line-height: 1.7; margin-top: 15px;">
              We promise to deliver only high-value content — no spam, ever.
            </p>
          </div>

          <!-- Quick Links -->
          <div style="margin-top: 30px;">
            <h3 style="color: #2c3e50; font-size: 18px; margin-bottom: 15px;">🔗 Quick Links</h3>
            <ul style="list-style: none; padding: 0; font-size: 15px; line-height: 1.8; margin: 0;">
              <li><a href="https://cusceda.ng/blog" style="color: #007BFF; text-decoration: none;">📝 Our Blog</a></li>
              <li><a href="https://cusceda.ng/products" style="color: #007BFF; text-decoration: none;">🛍️ View Products</a></li>
              <li><a href="https://cusceda.ng/contact" style="color: #007BFF; text-decoration: none;">📞 Contact Support</a></li>
            </ul>
          </div>

          <!-- Socials -->
          <div style="margin-top: 35px; text-align: center;">
            <p style="font-size: 15px; margin-bottom: 10px;">Follow us on social media:</p>
            <div>
              <a href="https://facebook.com/cusceda" style="margin: 0 8px; display:inline-block;"><img src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" alt="Facebook" width="28" /></a>
              <a href="https://twitter.com/cusceda" style="margin: 0 8px; display:inline-block;"><img src="https://img.freepik.com/free-vector/new-2023-twitter-logo-x-icon-design_1017-45418.jpg" alt="Twitter" width="28" /></a>
              <a href="https://instagram.com/cusceda" style="margin: 0 8px; display:inline-block;"><img src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg" alt="Instagram" width="28" /></a>
              <a href="https://linkedin.com/company/cusceda" style="margin: 0 8px; display:inline-block;"><img src="https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg" alt="LinkedIn" width="28" /></a>
            </div>
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; font-size: 13px; color: #777; text-align: center; line-height: 1.6;">
            <p>If you didn’t sign up for this, you can <a href="https://quick-carty.vercel.app/unsubscribe?email=${encodeURIComponent(email)}" style="color: #007BFF; text-decoration: none;">unsubscribe here</a>.</p>
            <p>&copy; ${new Date().getFullYear()} <strong>Cusceda NG</strong>. All rights reserved.</p>
          </div>
        </div>

      `
    });
  } catch (err) {
    console.error("Failed to send welcome email:", err.message);
    return new Response(JSON.stringify({ message: "Subscription saved, but failed to send welcome email." }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Subscribed successfully!" }), { status: 201 });
}
