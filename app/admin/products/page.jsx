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
import PropertyListPanel from "@/components/admin/PropertyListPanel";
import HeroVideoSettings from "@/components/admin/HeroVideoSettings";
import AddProperty from "@/components/AddProperty";
import FeaturedSlideEditor from "@/components/admin/FeaturedSlideEditor";

const settingsTabs = [
  { key: 'property', label: 'Products & Reviews', icon: <Box className="w-4 h-4" /> },
];

export default function AdminSettings() {

  const [activeTab, setActiveTab] = useState('property');
  const [propertyPanel, setPropertyPanel] = useState(null);

  
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 text-gray-700 dark:text-gray-300 dark:bg-black">
      <h2 className="text-2xl font-normal text-gray-800 text-gray-700 dark:text-gray-300 dark:bg-black">Products</h2>

      {/* Content Area */}
      <div className="bg-white p-6 rounded shadow border dark:text-gray-300 dark:bg-black">
        {activeTab === 'property' && (
            <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                {!propertyPanel && (
                    <motion.div
                    key="property-main"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                    >
                    {/* <h3 className="font-normal text-lg">Product Settings</h3> */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                      <button
                        onClick={() => setPropertyPanel('add')}
                        className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl shadow 
                        dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <PlusCircle className="w-5 h-5" />
                          <span className="font-thin">Add Property</span>
                        </div>
                          <p className="text-xs font-thin text-left">
                            Create a new property, upload images, set prices, and manage availability.
                        </p>
                      </button>
                      <button
                        onClick={() => setPropertyPanel('list')}
                        className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl shadow
                         dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <List className="w-5 h-5" />
                          <span className="font-thin">Product List</span>
                        </div>
                      <p className="text-xs font-thin text-left">
                          View and manage your existing product catalog, edit or delete items.
                        </p>
                      </button>

                      <button
                        onClick={() => setPropertyPanel('hero')}
                        className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl shadow
                         dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <MonitorPlay className="w-5 h-5" />
                          <span className="font-thin">HeroSection</span>
                        </div>
                      <p className="text-xs font-thin text-left">
                          View and manage your existing video on homepage hero section, edit or delete items.
                        </p>
                      </button>

                      <button
                        onClick={() => setPropertyPanel('property')}
                        className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl shadow
                                  dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                                  dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <LayoutDashboard className="w-5 h-5" />
                          <span className="font-thin">Property Slider</span>
                        </div>
                        <p className="text-xs font-thin text-left">
                          View and manage your existing promo product on properties page, edit or delete items.
                        </p>
                      </button>
                    </div>
                    </motion.div>
                )}
                {propertyPanel && (
                  <motion.div
                  key="property-sub"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                  >
                  <button onClick={() => setPropertyPanel(null)} className="flex items-center text-sm text-gray-600 hover:text-black
                   dark:text-white dark:hover:text-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg">
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>

                  {propertyPanel === 'add' && <AddProperty />}
                  {propertyPanel === 'list' && <PropertyListPanel />}
                  {propertyPanel === 'hero' && <HeroVideoSettings />}
                  {propertyPanel === 'property' && <FeaturedSlideEditor />}
                  </motion.div>
              )}
              </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}