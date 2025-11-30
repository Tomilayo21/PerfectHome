"use client";

import { useEffect, useState } from "react";

export default function PrivacyEditor() {
  const [policies, setPolicies] = useState([]);
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch("/api/privacy")
      .then(res => res.json())
      .then(data => {
        if (data) {
          const list = Array.isArray(data) ? data : [data];
          setPolicies(list);
        }
      });
  }, []);

  const handleAdd = async () => {
    const body = JSON.stringify({ heading, subheading });
    const res = await fetch("/api/privacy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const newPolicy = await res.json();
    setPolicies(prev => [newPolicy, ...prev]);
    setHeading("");
    setSubheading("");
  };

  const handleUpdate = async () => {
    const body = JSON.stringify({ id: editingId, heading, subheading });
    const res = await fetch("/api/privacy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const updated = await res.json();
    setPolicies(prev => prev.map(p => (p._id === updated._id ? updated : p)));
    setHeading("");
    setSubheading("");
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/privacy?id=${id}`, { method: "DELETE" });
    setPolicies(prev => prev.filter(p => p._id !== id));
  };

  const startEdit = (policy) => {
    setEditingId(policy._id);
    setHeading(policy.heading);
    setSubheading(policy.subheading);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setHeading("");
    setSubheading("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          value={heading}
          onChange={e => setHeading(e.target.value)}
          placeholder="Policy Heading"
          className="w-full border px-2 py-1 rounded dark:bg-black"
        />
        <textarea
          value={subheading}
          onChange={e => setSubheading(e.target.value)}
          placeholder="Policy Subheading"
          rows={6}
          className="w-full border px-2 py-1 rounded dark:bg-black"
        />
        {editingId ? (
          <div className="space-x-2">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded dark:bg-black"
            >
              Update Policy
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-400 text-white rounded dark:bg-black"
            >
              Cancel Edit
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-orange-600 text-white rounded dark:bg-black dark:border dark:hover:bg-gray-800"
          >
            Add Policy
          </button>
        )}
      </div>

      <div className="divide-y">
        {policies.map((policy) => (
          <div key={policy._id} className="py-2 flex justify-between items-start">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              <h4 className="font-semibold">{policy.heading}</h4>
              <p>{policy.subheading}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => startEdit(policy)} className="text-blue-600 text-sm">
                Edit
              </button>
              <button onClick={() => handleDelete(policy._id)} className="text-red-600 text-sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
