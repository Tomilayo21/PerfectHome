"use client"
import { useState, useEffect } from 'react';
import {
  CreditCard,
  ArrowLeft,
  PackageSearch,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import OrderPanel from '@/components/admin/settings/orders/OrderPanel';
import TransactionPanel from '@/components/admin/settings/orders/TransactionPanel';

const settingsTabs = [
  { key: 'orders', label: 'Orders & Payments', icon: <CreditCard className="w-4 h-4" /> },
];

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('orders');
    const [orderPanel, setOrderPanel] = useState(null);

  
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 text-gray-700 dark:text-gray-300 dark:bg-black">
      <h2 className="text-2xl font-normal text-gray-800 text-gray-700 dark:text-gray-300 dark:bg-black">Payments & Orders</h2>


      {/* Content Area */}
      <div className="bg-white p-6 rounded shadow border dark:text-gray-300 dark:bg-black">
        {activeTab === 'orders' && (
            <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                {!orderPanel && (
                    <motion.div
                    key="orders-main"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                    >
                    {/* <h3 className="font-normal text-lg">Orders & Payments</h3> */}

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <button
                        onClick={() => setOrderPanel('transactions')}
                        className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl 
                        shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5" />
                          <span className="font-normal">Payments</span>
                        </div>
                        <p className="text-xs font-thin text-left">
                          Monitor all payment records, verify receipts, and check transaction types.
                        </p>
                      </button>

                      <button
                        onClick={() => setOrderPanel('orders')}
                        className="flex flex-col items-start bg-orange-100 hover:bg-orange-200 text-orange-800 p-4 rounded-xl 
                        shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <PackageSearch className="w-5 h-5" />
                          <span className="font-normal">Orders</span>
                        </div>
                        <p className="text-xs font-thin text-left">
                          Browse all placed orders, track delivery status, and update order stages.
                        </p>
                      </button>
                     </div> 


                     {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                       <button
                        onClick={() => setOrderPanel('orders')}
                        className="flex flex-col items-start bg-orange-100 hover:bg-orange-200 text-orange-800 p-4 rounded-xl 
                        shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <PackageSearch className="w-5 h-5" /> 
                          <span className="font-normal">View Orders</span>
                        </div>
                        <p className="text-xs font-thin text-left">
                          Browse all placed orders, track delivery status, and update order stages.
                        </p>
                      </button>

                      <button
                        onClick={() => setOrderPanel('transactions')}
                        className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl 
                        shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5" />
                          <span className="font-normal">View Transactions</span>
                        </div>
                        <p className="text-x font-thin text-left">
                          Monitor all payment records, verify receipts, and check transaction types.
                        </p>
                      </button>


                      <div className="flex flex-col items-start bg-gray-100 text-gray-500 p-4 rounded-xl 
                      shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg italic">
                        <span className="font-medium mb-1">More Coming Soon</span>
                        <p className="text-xs font-thin">
                          Stay tuned for additional features in this section.
                        </p>
                      </div>
                    </div> */}
                    </motion.div>
                 )}

                 {orderPanel && (
                    <motion.div
                    key="orders-sub"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                    >
                    <button
                        onClick={() => setOrderPanel(null)}
                        className="flex items-center text-sm text-gray-600 hover:text-black"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </button>

                    {orderPanel === 'orders' && <OrderPanel />}
                    {orderPanel === 'transactions' && <TransactionPanel />}
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        )}
      </div>
    </div>
  );
}