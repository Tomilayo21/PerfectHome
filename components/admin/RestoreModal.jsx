'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import confetti from "canvas-confetti";
import { useSession } from "next-auth/react";

export default function RestoreModal({ isOpen, onClose }) {
  const { data: session } = useSession();
    const isAdmin = session?.user?.role === 'admin';

  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleRestore = async () => {
    if (!file || !password) {
      setStatus('Please provide both file and password.');
      return;
    }

    setLoading(true);
    setStatus('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    try {
      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(`❌ ${data.error || 'Restore failed'}`);
      } else {
        setStatus('✅ Restore successful!');
        setFile(null);
        setPassword('');
      }
    } catch (err) {
      setStatus('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative z-50">
        <Dialog.Title className="text-lg font-semibold mb-2">Restore Backup</Dialog.Title>
        <p className="text-sm text-gray-600 mb-4">Upload a MongoDB backup (.zip) and enter password to restore.</p>

        <input
          type="file"
          accept=".zip"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full mb-3"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin Password"
          className="w-full px-3 py-2 border rounded mb-3"
        />

        {status && (
          <p className="text-sm mb-3 text-red-600">{status}</p>
        )}

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleRestore}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Restoring...' : 'Import Backup'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
