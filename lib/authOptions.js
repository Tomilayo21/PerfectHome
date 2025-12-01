// lib/authOptions.js
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/config/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const authOptions = {
  providers: [
    // 👉 Email + Password Login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectDB();

        const email = credentials.email.toLowerCase();
        const user = await User.findOne({ email });

        if (!user) throw new Error("Invalid email or password");
        if (!user.emailVerified) throw new Error("Please verify your email");

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isMatch) throw new Error("Invalid email or password");

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.imageUrl,
          username: user.username,
          imagePublicId: user.imagePublicId,
        };
      },
    }),

    // 👉 Google OAuth Login
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
      async profile(profile) {
        return {
          id: profile.sub, // temp, will be replaced with DB id
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          emailVerified: true,
          role: "user",
          username: profile.email.split("@")[0],
          authProvider: "google",
        };
      },
    }),
  ],

  session: { strategy: "jwt" },
  pages: { signIn: "/signup" },

  callbacks: {
    async signIn({ user }) {
      await connectDB();

      const email = user.email.toLowerCase();
      let existing = await User.findOne({ email });

      // 👉 Create user if new
      if (!existing) {
        const newId = new mongoose.Types.ObjectId().toString();

        existing = await User.create({
          _id: newId,
          name: user.name,
          email,
          username: email.split("@")[0],
          imageUrl: user.image || null,
          emailVerified: true,
          role: "user",
          authProvider: "google",
        });
      }

      user.id = existing._id; // important for JWT
      return true;
    },

    async jwt({ token, user }) {
      await connectDB();

      // On first login
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
        token.image = user.image || null;
        token.username = user.username;
        token.imagePublicId = user.imagePublicId || null;
        token.authProvider = user.authProvider || "credentials";
        token.accessToken = jwt.sign(
          { id: user.id },
          process.env.NEXTAUTH_SECRET
        );
        return token;
      }

      // On subsequent logins
      const dbUser = await User.findById(token.id).lean();
      if (!dbUser) return {};

      token.role = dbUser.role;
      token.image = dbUser.imageUrl || null;
      token.username = dbUser.username;
      token.imagePublicId = dbUser.imagePublicId || null;
      token.authProvider = dbUser.authProvider || "credentials";

      return token;
    },

    async session({ session, token }) {
      if (!token?.id) return null;

      session.user.id = token.id;
      session.user.role = token.role;
      session.user.image = token.image;
      session.user.username = token.username;
      session.user.imagePublicId = token.imagePublicId;
      session.user.authProvider = token.authProvider;
      session.accessToken = token.accessToken;

      return session;
    },
  },
};
