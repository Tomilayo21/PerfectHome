"use client"
import { useState } from 'react';
import {
  Box,
  ArrowLeft,
  PlusCircle, 
  List, 
  Star,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AddProductPanel from "@/components/admin/settings/products/AddProductPanel";
import ProductListPanel from "@/components/admin/settings/products/ProductListPanel";
import ReviewPanel from "@/components/admin/settings/products/ReviewPanel";

const settingsTabs = [
  { key: 'product', label: 'Products & Reviews', icon: <Box className="w-4 h-4" /> },
];

export default function AdminSettings() {

  const [activeTab, setActiveTab] = useState('product');
  const [productPanel, setProductPanel] = useState(null);

  
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 text-gray-700 dark:text-gray-300 dark:bg-black">
      <h2 className="text-2xl font-normal text-gray-800 text-gray-700 dark:text-gray-300 dark:bg-black">Products & Reviews</h2>

      {/* Content Area */}
      <div className="bg-white p-6 rounded shadow border dark:text-gray-300 dark:bg-black">
        {activeTab === 'product' && (
            <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                {!productPanel && (
                    <motion.div
                    key="product-main"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                    >
                    {/* <h3 className="font-normal text-lg">Product Settings</h3> */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <button
                        onClick={() => setProductPanel('add')}
                        className="flex flex-col items-start bg-orange-100 hover:bg-orange-200 text-orange-800 p-4 rounded-xl shadow 
                        dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <PlusCircle className="w-5 h-5" />
                          <span className="font-thin">Add Product</span>
                        </div>
                        <p className="text-xs font-thin text-left">
                          Create a new product, upload images, set prices, and manage availability.
                      </p>
                      </button>
                      <button
                        onClick={() => setProductPanel('list')}
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
                        onClick={() => setProductPanel('reviews')}
                        className="flex flex-col items-start bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-xl shadow
                         dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-5 h-5" />
                          <span className="font-thin">Reviews</span>
                        </div>
                        <p className="text-xs font-thin text-left">
                        Monitor and approve customer reviews and ratings on products.
                        </p>
                      </button>
                    </div>
                    </motion.div>
                )}
                {productPanel && (
                  <motion.div
                  key="product-sub"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                  >
                  <button onClick={() => setProductPanel(null)} className="flex items-center text-sm text-gray-600 hover:text-black
                   dark:text-white dark:hover:text-grey-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg">
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>

                  {productPanel === 'add' && <AddProductPanel />}
                  {productPanel === 'list' && <ProductListPanel />}
                  {productPanel === 'reviews' && <ReviewPanel />}
                  </motion.div>
              )}
              </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}