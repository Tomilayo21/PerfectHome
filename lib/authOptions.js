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

        const isMatch = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isMatch) throw new Error("Invalid email or password");

        return {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.imageUrl,
          username: user.username,
          imagePublicId: user.imagePublicId,
          authProvider: "credentials",
        };
      },
    }),

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
          id: profile.sub,
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
    // ------------------------------------------------------
    // SIGN IN
    // ------------------------------------------------------
    async signIn({ user }) {
      await connectDB();

      let existing = await User.findOne({ email: user.email.toLowerCase() });

      if (!existing) {
        existing = await User.create({
          _id: new mongoose.Types.ObjectId().toString(),
          name: user.name,
          email: user.email.toLowerCase(),
          username: user.email.split("@")[0],
          imageUrl: user.image || null,
          emailVerified: true,
          role: "user",
          authProvider: user.authProvider,
        });
      }

      user.id = existing._id;
      return true;
    },

    // ------------------------------------------------------
    // JWT
    // ------------------------------------------------------
    async jwt({ token, user }) {
      await connectDB();

      if (user) {
        // Just attach user info to token; don't create a session here
        token.id = user.id;
        token.role = user.role || "user";
        token.username = user.username;
        token.image = user.image || null;
        token.imagePublicId = user.imagePublicId || null;
        token.authProvider = user.authProvider || "credentials";

        return token;
      }

      // Returning user, verify token
      const dbUser = await User.findById(token.id).lean();
      if (!dbUser) return {};

      token.role = dbUser.role;
      token.username = dbUser.username;
      token.image = dbUser.imageUrl || null;
      token.imagePublicId = dbUser.imagePublicId;
      token.authProvider = dbUser.authProvider;

      return token;
    },

    // async jwt({ token, user }) {
    //   await connectDB();

    //   if (user) {
    //     // On login, create a new session token
    //     const dbUser = await User.findById(user.id);

    //     // Generate new token for this session
    //     const newSessionToken = crypto.randomUUID();

    //     dbUser.sessions.push({
    //       token: newSessionToken,
    //       os: user.os || "Unknown",
    //       browser: user.browser || "Unknown",
    //       ip: user.ip || "Unknown",
    //       city: user.city || "",
    //       country: user.country || "",
    //       lastActive: new Date(),
    //     });

    //     await dbUser.save();

    //     token.id = user.id;
    //     token.role = user.role || "user";
    //     token.image = user.image || null;
    //     token.username = user.username;
    //     token.imagePublicId = user.imagePublicId || null;
    //     token.authProvider = user.authProvider || "credentials";
    //     token.sessionToken = newSessionToken;

    //     token.accessToken = jwt.sign(
    //       { id: user.id, sessionToken: newSessionToken },
    //       process.env.NEXTAUTH_SECRET
    //     );

    //     return token;
    //   }

    //   // Verify existing JWT is still valid
    //   const dbUser = await User.findById(token.id).lean();
    //   if (!dbUser) return {};

    //   const validSession = dbUser.sessions.find(s => s.token === token.sessionToken);
    //   if (!validSession) return {}; // session was removed → invalidate token

    //   token.role = dbUser.role;
    //   token.image = dbUser.imageUrl || null;
    //   token.username = dbUser.username;
    //   token.imagePublicId = dbUser.imagePublicId;
    //   token.authProvider = dbUser.authProvider;

    //   return token;
    // },


    // ------------------------------------------------------
    // SESSION OBJECT SENT TO CLIENT
    // ------------------------------------------------------
    
    async session({ session, token }) {
      if (!token?.id) return null;

      session.user.id = token.id;
      session.user.role = token.role;
      session.user.image = token.image;
      session.user.username = token.username;
      session.user.imagePublicId = token.imagePublicId;
      session.user.authProvider = token.authProvider;

      session.accessToken = token.accessToken;

      await connectDB();
      const dbUser = await User.findById(token.id).lean();
      session.user.sessions = dbUser?.sessions || [];

      return session;
    },
  },
};
