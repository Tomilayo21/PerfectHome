'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function BackupModal({ onClose }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    if (!password) return toast.error('Password is required');

    setLoading(true);
    try {
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) throw new Error('Backup failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mongodb-backup.zip';
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('Backup downloaded');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Invalid password or error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-md w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-3">Confirm Admin Password</h2>
        <input
          type="password"
          className="w-full border rounded px-3 py-2 mb-4"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="text-gray-500 hover:underline">Cancel</button>
          <button
            onClick={handleBackup}
            disabled={loading}
            className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
          >
            {loading ? 'Processing...' : 'Download Backup'}
          </button>
        </div>
      </div>
    </div>
  );
}
