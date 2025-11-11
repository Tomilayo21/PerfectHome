"use client"
import { useState } from 'react';
import {
  ShieldCheck,
  Users,
  ArrowLeft,
  Mail,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ViewBroadcastButton from '@/components/admin/settings/users/ViewBroadcastButton';
import UserListPanel from "@/components/admin/settings/users/UserListPanel";
import SubscribersPage from "@/components/admin/settings/users/SubscribersPage";
import RegUsers from "@/components/admin/RegUsers";

const settingsTabs = [
  { key: 'users', label: 'Users, Subscribers & Roles', icon: <Users className="w-4 h-4" /> },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('users');
  const [userPanel, setUserPanel] = useState("main");
      

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 text-gray-700 dark:text-gray-300 dark:bg-black">
      <h2 className="text-2xl font-normal text-gray-800 text-gray-700 dark:text-gray-300 dark:bg-black">Users Management</h2>

      {/* Content Area */}
      <div className="bg-white p-6 rounded shadow border dark:text-gray-300 dark:bg-black">
        {activeTab === "users" && (
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              {userPanel === "main" && (
                <motion.div
                  key="user-main"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* <h3 className="font-thin text-lg">Users & Subscribers</h3> */}
                  <p className="text-sm dark:text-white text-gray-600">
                    Role assignments, user lists, and subscriber communication tools.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <button
                      onClick={() => setUserPanel("list")}
                      className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl 
                      shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-5 h-5" />
                        <span className="font-normal">View Users</span>
                      </div>
                      <p className="text-xs text-left font-thin">
                        Browse and manage all registered users, including profile info and activity.
                      </p>
                    </button>

                      <button
                      onClick={() => setUserPanel("subscribers")}
                      className="flex flex-col items-start bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-xl 
                      shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-5 h-5" />
                        <span className="font-normal">Subscribers</span>
                      </div>
                      <p className="text-xs text-left font-thin">
                        View and export newsletter subscribers and manage email outreach.
                      </p>
                    </button>

                    <button
                      onClick={() => setUserPanel("roles")}
                      className="flex flex-col items-start bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-xl 
                      shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="font-normal">Roles & Permissions</span>
                      </div>
                      <p className="text-xs text-left font-thin">
                        Assign roles to users, configure access levels, and manage permissions.
                      </p>
                    </button>
                  </div>
                </motion.div>
                )}
                {userPanel === "list" && (
                <motion.div
                  key="user-list"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button onClick={() => setUserPanel("main")} className="flex items-center text-sm text-gray-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <RegUsers />
                </motion.div>
                )}
                {userPanel === "subscribers" && (
                <motion.div
                  key="user-subscribers"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button onClick={() => setUserPanel("main")} className="flex items-center text-sm text-gray-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <button onClick={() => setUserPanel("broadcast")} className="bg-orange-600 text-white px-4 py-2 rounded">
                    View Broadcast History
                  </button>
                  <SubscribersPage />
                </motion.div>
                )}
                {userPanel === "broadcast" && (
                <motion.div
                  key="user-broadcast"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button onClick={() => setUserPanel("subscribers")} className="flex items-center text-sm text-gray-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <ViewBroadcastButton />
                </motion.div>
                )}
                {userPanel === "roles" && (
                <motion.div
                  key="user-subscribers"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button onClick={() => setUserPanel("main")} className="flex items-center text-sm text-gray-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <UserListPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}