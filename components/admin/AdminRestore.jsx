'use client';

import { useState } from 'react';

export default function RestoreBackup() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleRestore = async () => {
    if (!file || !password) {
      setStatus('Please provide both file and password');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    setLoading(true);
    setStatus('');

    try {
      const res = await fetch('/api/admin/restore', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || 'Restore failed');
      } else {
        setStatus('✅ Restore successful!');
      }
    } catch (error) {
      console.error(error);
      setStatus('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow p-4 rounded-md w-full max-w-md">
      <p className="text-sm text-gray-600 mb-2">Restore data from a backup file.</p>
      <input
        type="file"
        accept=".zip"
        className="block mb-2"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <input
        type="password"
        placeholder="Enter admin password"
        className="block mb-2 w-full px-2 py-1 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleRestore}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Restoring...' : 'Import Backup'}
      </button>
      {status && (
        <p className="mt-2 text-sm text-red-600">
          {status}
        </p>
      )}
    </div>
  );
}
