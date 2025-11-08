// // lib/authOptions.js
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import connectDB from "@/config/db";
// import User from "@/models/User";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// export const authOptions = {
//   providers: [
//     // Email + Password login
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         await connectDB();

//         const user = await User.findOne({ email: credentials.email });
//         if (!user) throw new Error("Invalid email or password");
//         if (!user.emailVerified) throw new Error("Please verify your email");

//         const isMatch = await bcrypt.compare(
//           credentials.password,
//           user.passwordHash
//         );
//         if (!isMatch) throw new Error("Invalid email or password");

//         return {
//           id: user._id.toString(),
//           name: user.name,
//           email: user.email,
//           role: user.role,
//           image: user.imageUrl || null,
//           username: user.username,
//           imagePublicId: user.imagePublicId || null,
//         };
//       },
//     }),

//     // Google OAuth
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       authorization: {
//         params: {
//           prompt: "consent",
//           access_type: "offline",
//           response_type: "code",
//         },
//       },
//       httpOptions: {
//         timeout: 10000,
//       },
//     }),
//   ],

//   session: { strategy: "jwt" },
//   pages: { signIn: "/login" },

//   callbacks: {
//     async redirect({ baseUrl }) {
//       return baseUrl;
//     },

//     async signIn({ user, account }) {
//       if (account?.provider === "google") {
//         await connectDB();
//         const existingUser = await User.findOne({ email: user.email });

//         if (!existingUser) {
//           await User.create({
//             _id: Date.now().toString(),
//             name: user.name,
//             email: user.email,
//             username: user.email.split("@")[0],
//             emailVerified: true,
//             role: "user",
//           });
//         }
//       }
//       return true;
//     },

//     // 🧠 FIXED jwt callback — handles deleted accounts
//     async jwt({ token, user }) {
//       await connectDB();

//       // When user first logs in
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.image = user.image || null;
//         token.username = user.username;
//         token.imagePublicId = user.imagePublicId || null;
//         token.accessToken = jwt.sign({ id: user.id }, process.env.NEXTAUTH_SECRET);
//         return token;
//       }

//       // ✅ Check if user still exists in DB
//       const dbUser = await User.findById(token.id).lean();

//       if (!dbUser) {
//         // ❌ If user no longer exists, clear token
//         return {};
//       }

//       // Otherwise refresh user data
//       token.role = dbUser.role;
//       token.image = dbUser.imageUrl || null;
//       token.username = dbUser.username;
//       token.imagePublicId = dbUser.imagePublicId || null;

//       return token;
//     },

//     // 🧠 Session callback – prevents ghost sessions
//     async session({ session, token }) {
//       // If the token is empty (user deleted), invalidate session
//       if (!token || !token.id) {
//         return null;
//       }

//       session.user.id = token.id;
//       session.user.role = token.role;
//       session.user.image = token.image;
//       session.user.username = token.username;
//       session.user.imagePublicId = token.imagePublicId;
//       session.accessToken = token.accessToken || null;

//       return session;
//     },
//   },
// };





































// lib/authOptions.js
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/config/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ADMIN_EMAILS = process.env.ADMIN_EMAILS
  ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
  : [];

export const authOptions = {
  providers: [
    // ✅ Email + Password login (Admins only)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) throw new Error("Invalid email or password");
        if (!user.emailVerified) throw new Error("Please verify your email");

        // ✅ Reject non-admins
        if (!ADMIN_EMAILS.includes(user.email.toLowerCase())) {
          throw new Error("Access denied. Admins only.");
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isMatch) throw new Error("Invalid email or password");

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: "admin", // Force admin role
          image: user.imageUrl || null,
          username: user.username,
          imagePublicId: user.imagePublicId || null,
        };
      },
    }),

    // ✅ Google OAuth (Admins only)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      httpOptions: { timeout: 10000 },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  callbacks: {
    async redirect({ baseUrl }) {
      return baseUrl;
    },

    // ✅ Enforce admin check during Google sign-in
    async signIn({ user, account }) {
      await connectDB();

      const userEmail = user.email.toLowerCase();

      // Reject Google logins that aren't admin emails
      if (account?.provider === "google" && !ADMIN_EMAILS.includes(userEmail)) {
        throw new Error("Access denied. Admins only.");
      }

      // Create or update admin user
      const existingUser = await User.findOne({ email: userEmail });
      if (!existingUser) {
        await User.create({
          name: user.name,
          email: userEmail,
          username: userEmail.split("@")[0],
          emailVerified: true,
          role: "admin",
        });
      } else if (existingUser.role !== "admin") {
        existingUser.role = "admin";
        await existingUser.save();
      }

      return true;
    },

    async jwt({ token, user }) {
      await connectDB();

      if (user) {
        token.id = user.id;
        token.role = "admin";
        token.image = user.image || null;
        token.username = user.username;
        token.imagePublicId = user.imagePublicId || null;
        token.accessToken = jwt.sign({ id: user.id }, process.env.NEXTAUTH_SECRET);
        return token;
      }

      const dbUser = await User.findById(token.id).lean();
      if (!dbUser) return {};

      token.role = dbUser.role || "admin";
      token.image = dbUser.imageUrl || null;
      token.username = dbUser.username;
      token.imagePublicId = dbUser.imagePublicId || null;

      return token;
    },

    async session({ session, token }) {
      if (!token || !token.id) return null;

      session.user.id = token.id;
      session.user.role = token.role || "admin";
      session.user.image = token.image;
      session.user.username = token.username;
      session.user.imagePublicId = token.imagePublicId;
      session.accessToken = token.accessToken || null;

      return session;
    },
  },
};
