"use client";

import { useState } from "react";

export default function BroadcastPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);

  const handleSend = async () => {
    setStatus("sending");
    const res = await fetch("/api/admin/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, message }),
    });

    const data = await res.json();
    setStatus(data.success ? "sent" : "error");
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Broadcast Message</h1>
      <input
        type="text"
        placeholder="Subject"
        className="border p-2 w-full mb-2"
        value={subject}
        onChange={e => setSubject(e.target.value)}
      />
      <textarea
        rows={6}
        placeholder="Your message..."
        className="border p-2 w-full mb-2"
        value={message}
        onChange={e => setMessage(e.target.value)}
      />
      <button onClick={handleSend} className="bg-black text-white px-4 py-2 rounded">
        Send
      </button>
      {status === "sending" && <p className="text-blue-500 mt-2">Sending...</p>}
      {status === "sent" && <p className="text-green-500 mt-2">Sent successfully!</p>}
      {status === "error" && <p className="text-red-500 mt-2">Error sending message.</p>}
    </div>
  );
}
