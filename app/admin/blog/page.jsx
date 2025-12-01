"use client"
import { useState } from 'react';
import {
  Box,
  ArrowLeft,
  PlusCircle, 
  List, 
  Star, 
  MonitorPlay,
  LayoutDashboard,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import BlogEditor from "@/components/admin/BlogEditor";
import BlogPage from "@/components/admin/BlogPage";

const settingsTabs = [
  { key: 'blog', label: 'Blog Posts', icon: <Box className="w-4 h-4" /> },
];

export default function AdminBlogPage() {

  const [activeTab, setActiveTab] = useState('blog');
  const [blogPanel, setBlogPanel] = useState(null);

  
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 text-gray-700 dark:text-gray-300 dark:bg-black">
      <h2 className="text-2xl font-normal text-gray-800 text-gray-700 dark:text-gray-300 dark:bg-black">Blog Post</h2>

      {/* Content Area */}
      <div className="bg-white p-6 rounded shadow border dark:text-gray-300 dark:bg-black">
        {activeTab === 'blog' && (
            <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                {!blogPanel && (
                    <motion.div
                    key="blog-main"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                    >
                    {/* <h3 className="font-normal text-lg">Product Settings</h3> */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <button
                        onClick={() => setBlogPanel('add')}
                        className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl shadow 
                        dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <PlusCircle className="w-5 h-5" />
                          <span className="font-thin">Add Blog Post</span>
                        </div>
                          <p className="text-xs font-thin text-left">
                            Create a new post.
                        </p>
                      </button>
                      <button
                        onClick={() => setBlogPanel('list')}
                        className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl shadow
                         dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <List className="w-5 h-5" />
                          <span className="font-thin">Published Posts</span>
                        </div>
                      <p className="text-xs font-thin text-left">
                          View and manage your existing blog posts.
                        </p>
                      </button>

                    </div>
                    </motion.div>
                )}
                {blogPanel && (
                  <motion.div
                  key="blog-sub"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                  >
                  <button onClick={() => setBlogPanel(null)} className="flex items-center text-sm text-gray-600 hover:text-black
                   dark:text-white dark:hover:text-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg">
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>

                  {blogPanel === 'add' && <BlogEditor />}
                  {blogPanel === 'list' && <BlogPage />}
                  </motion.div>
              )}
              </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}