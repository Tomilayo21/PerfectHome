'use client';

import { useState } from 'react';

export default function SuperAdminUnlock({ onSuccess, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/verify-admin-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(); // Grant access
      } else {
        setError('Incorrect password.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white border rounded shadow-md w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-2">Enter Admin Password</h2>

        <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Super admin password"
        className="w-full p-2 border rounded mb-2"
        />

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full bg-purple-700 text-white py-1 rounded hover:bg-purple-800 transition mb-2"
        >
        {loading ? 'Verifying...' : 'Verify'}
        </button>

        <button
        onClick={onCancel}
        disabled={loading}
        className="w-full bg-gray-200 text-gray-800 py-1 rounded hover:bg-gray-300 transition"
        >
        Cancel
        </button>
    </div>
    );

}
