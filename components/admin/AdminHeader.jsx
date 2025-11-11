"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import {
  Users,
  Calendar,
  Clock,
  Sun,
  Sunrise,
  Moon,
} from "lucide-react";

const AdminHeader = () => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [greeting, setGreeting] = useState("");
  const [tagline, setTagline] = useState({ text: "", icon: null });

  const { data: session } = useSession();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      setDate(formattedDate);
      setTime(formattedTime);

      const hours = now.getHours();
      if (hours < 12) {
        setGreeting("Good Morning");
        setTagline({
          text: "Start your day strong",
          icon: <Sunrise className="w-4 h-4 text-yellow-300" />,
        });
      } else if (hours < 18) {
        setGreeting("Good Afternoon");
        setTagline({
          text: "Keep pushing forward",
          icon: <Sun className="w-4 h-4 text-orange-300" />,
        });
      } else {
        setGreeting("Good Evening");
        setTagline({
          text: "You did great today, recharge for tomorrow",
          icon: <Moon className="w-4 h-4 text-indigo-300" />,
        });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const user = session?.user;

  return (
    <div
      className="bg-gradient-to-r from-orange-50 via-white to-orange-50
                 border border-orange-100 text-gray-900 rounded-2xl p-6 mb-6
                 shadow-md hover:shadow-lg transition-shadow 
                 flex flex-col md:flex-row items-start md:items-center justify-between
                 dark:from-gray-900 dark:via-black dark:to-gray-900 dark:border-gray-800 dark:text-gray-200"
    >
      {/* Left Section */}
      <div className="flex items-center gap-4  mb-4 md:mb-0">
        <div>
          {user ? (
            <>
              <h2 className="text-2xl font-semibold tracking-tight">
                <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 text-transparent bg-clip-text">
                  {greeting},
                </span>{" "}
                <span className="font-normal dark:text-white bg-gradient-to-r from-gray-800 to-gray-500 text-transparent bg-clip-text">
                  {user.name || user.email}
                </span>
              </h2>

              <p className="flex items-center dark:text-white gap-2 text-sm mt-1 bg-gradient-to-r from-gray-600 to-gray-400 text-transparent bg-clip-text">
                {tagline.icon} {tagline.text}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Admin Dashboard
              </h2>
              <p className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                {tagline.icon} {tagline.text}
              </p>
              <button
                onClick={() => signIn()} // opens NextAuth sign-in modal or redirects
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-sm font-medium transition text-orange-700"
              >
                <Users className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6 text-sm font-normal text-gray-600 dark:text-white">
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span>{date}</span>
        </span>
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-500 animate-spin-slow" />
          <span>{time}</span>
        </span>
      </div>
    </div>
  );
};

export default AdminHeader;
