"use client"
import { useState } from 'react';
import {
  CloudDownload,
} from 'lucide-react';
import FormatDatabase from '@/components/admin/FormatDatabase';
import BackupModal from '@/components/admin/BackupModal';
import RestoreModal from '@/components/admin/RestoreModal';
import ExportUserCSV from '@/components/admin/settings/users/ExportUsersCSV';
import ExportProductsCSV from '@/components/admin/settings/products/ExportProductsCSV';
import ExportOrdersCSV from '@/components/admin/settings/orders/ExportOrdersCSV';

const settingsTabs = [
  { key: 'backup', label: 'Backup / Export', icon: <CloudDownload className="w-4 h-4" /> },
];

export default function AdminSettings() {

  const [activeTab, setActiveTab] = useState('backup');
  const [showModal, setShowModal] = useState(false);
  const [open, setOpen] = useState(false);
  const orders = []; 
  const filteredProducts = [];
  const users = []; 
  const logActivity = async (action, detail) => {
    await fetch("/api/activity-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, detail }),
    });
  };
  
  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 text-gray-700 dark:text-gray-300 dark:bg-black">
      <h2 className="text-2xl font-normal text-gray-800 text-gray-700 dark:text-gray-300 dark:bg-black">Backup & Export</h2>

      {/* Content Area */}
      <div className="bg-white p-6 rounded shadow border dark:text-gray-300 dark:bg-black">
        {activeTab === 'backup' && (
          <div className="space-y-6">
            {/* <h3 className="font-semibold text-lg">Backup & Export</h3> */}

            {/* Export Orders */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Download all order records in CSV format.</p>
              <ExportOrdersCSV orders={orders} />
            </div>

            {/* Export Products */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Download product inventory as CSV.</p>
              {/* <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                Export Products CSV
              </button> */}
              <ExportProductsCSV filteredProducts={filteredProducts} />
            </div>

            {/* Export Users */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Download user list in CSV format.</p>
              {/* <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                Export Users CSV
              </button> */}
              <ExportUserCSV users={users} logActivity={logActivity} />

            </div>

            {/* Database Backup */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Generate and download a full database backup.</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Database Backup
              </button>
              {showModal && <BackupModal onClose={() => setShowModal(false)} />}
            </div>

            {/* Restore From Backup */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Restore data from a backup file.</p>
              {/* <input type="file" className="block mb-2" /> */}
              <button
                onClick={() => setOpen(true)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                🛠 Restore Backup
              </button>

              {/* <RestoreModal isOpen={open} onClose={() => setOpen(false)}/> */}
              <RestoreModal isOpen={open} onClose={() => setOpen(false)} />
            </div>

            {/* Format (Wipe Database) */}
            <div className="pt-4 border-t border-red-200">
              <h4 className="text-red-600 font-semibold">Danger Zone</h4>
              <p className="text-sm text-gray-600 mb-2">
                This will permanently erase all data (orders, products, users, etc). This action cannot be undone.
              </p>
              <FormatDatabase
                onSuccess={() => {
                  // Optional: trigger refetch or redirect
                  console.log("Database cleared.");
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}