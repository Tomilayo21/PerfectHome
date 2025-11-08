// // app/api/auth/[...nextauth]/route.js
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import connectDB from "@/config/db";
// import User from "@/models/User";
// import bcrypt from "bcryptjs";

// export const authOptions = {
//   providers: [
//     // Email + Password
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
//         timeout: 10000, // 10 seconds timeout for Google API requests
//       },
//     }),
//   ],

//   session: { strategy: "jwt" },
//   pages: { signIn: "/login" },

//   callbacks: {
//     // Always redirect to homepage after login
//     async redirect({ url, baseUrl }) {
//       return baseUrl; // forces redirect to "/"
//     },

//     // Handle Google sign in (auto create user if not exists)
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

//     // Attach extra info into JWT
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//         token.image = user.image || null;
//         token.username = user.username;
//         token.imagePublicId = user.imagePublicId || null;
//       } else {
//         await connectDB();
//         const dbUser = await User.findById(token.id).lean();
//         if (dbUser) {
//           token.role = dbUser.role;
//           token.image = dbUser.imageUrl || null;
//           token.username = dbUser.username;
//           token.imagePublicId = dbUser.imagePublicId || null;
//         }
//       }
//       return token;
//     },

//     // Attach info into session
//     async session({ session, token }) {
//       if (token) {
//         session.user.id = token.id;
//         session.user.role = token.role;
//         session.user.image = token.image;
//         session.user.username = token.username;
//         session.user.imagePublicId = token.imagePublicId;
//       }
//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };








































// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
