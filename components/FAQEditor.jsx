"use client";

import { useEffect, useState } from "react";

export default function FAQEditor() {
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetch("/api/faq")
      .then(res => res.json())
      .then(setFaqs);
  }, []);

  const handleAdd = async () => {
    const body = JSON.stringify({ question, answer });
    const res = await fetch("/api/faq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const newFaq = await res.json();
    setFaqs(prev => [newFaq, ...prev]);
    setQuestion("");
    setAnswer("");
  };

  const handleUpdate = async () => {
    const body = JSON.stringify({ id: editingId, question, answer });
    const res = await fetch("/api/faq", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const updatedFaq = await res.json();
    setFaqs(prev => prev.map(f => (f._id === updatedFaq._id ? updatedFaq : f)));
    setQuestion("");
    setAnswer("");
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/faq?id=${id}`, { method: "DELETE" });
    setFaqs(prev => prev.filter(f => f._id !== id));
  };

  const startEdit = (faq) => {
    setEditingId(faq._id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setQuestion("");
    setAnswer("");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="FAQ Question"
          className="w-full border px-2 py-1 rounded dark:bg-black"
        />
        <textarea
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          placeholder="FAQ Answer"
          rows={4}
          className="w-full border px-2 py-1 rounded dark:bg-black"
        />

        {editingId ? (
          <div className="space-x-2">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded dark:bg-black"
            >
              Update FAQ
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
            Add FAQ
          </button>
        )}
      </div>

      <div className="divide-y">
        {faqs.map((faq) => (
          <div key={faq._id} className="py-2 flex justify-between items-start">
            <div>
              <h4 className="font-normal">{faq.question}</h4>
              <p className="text-sm font-light text-gray-700">{faq.answer}</p>
            </div>
            <div className="space-x-2">
              <button onClick={() => startEdit(faq)} className="text-orange-600 text-sm dark:text-orange-400 dark:hover:text-orange-300">
                Edit
              </button>
              <button onClick={() => handleDelete(faq._id)} className="text-red-600 text-sm dark:text-red-400 dark:hover:text-red-300">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
