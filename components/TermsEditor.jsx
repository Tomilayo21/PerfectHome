"use client";

import { useEffect, useState } from "react";

export default function TermsEditor() {
  const [terms, setTerms] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch("/api/terms")
      .then((res) => res.json())
      .then(setTerms);
  }, []);

  const handleAdd = async () => {
    const body = JSON.stringify({ title, content });
    const res = await fetch("/api/terms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (res.ok) {
      const newTerm = await res.json();
      setTerms((prev) => [newTerm, ...prev]);
      setTitle("");
      setContent("");
    } else {
      console.error("Failed to add term");
    }
  };

  const handleUpdate = async () => {
    const body = JSON.stringify({ id: editingId, title, content });
    const res = await fetch("/api/terms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (res.ok) {
      const updated = await res.json();
      setTerms((prev) =>
        prev.map((term) => (term._id === updated._id ? updated : term))
      );
      setTitle("");
      setContent("");
      setEditingId(null);
    } else {
      console.error("Failed to update term");
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/api/terms?id=${id}`, { method: "DELETE" });

    if (res.ok) {
      setTerms((prev) => prev.filter((term) => term._id !== id));
    } else {
      console.error("Failed to delete term");
    }
  };

  const startEdit = (term) => {
    setEditingId(term._id);
    setTitle(term.title);
    setContent(term.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Term Title"
          className="w-full border px-2 py-1 rounded dark:bg-black"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Term Content"
          rows={4}
          className="w-full border px-2 py-1 rounded dark:bg-black"
        />

        {editingId ? (
          <div className="space-x-2">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded dark:bg-black"
            >
              Update Term
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
            Add Term
          </button>
        )}
      </div>

      <div className="divide-y">
        {terms.map((term) => (
          <div
            key={term._id}
            className="py-2 flex justify-between items-start"
          >
            <div>
              <h4 className="font-semibold">{term.title}</h4>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {term.content}
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => startEdit(term)}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(term._id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
