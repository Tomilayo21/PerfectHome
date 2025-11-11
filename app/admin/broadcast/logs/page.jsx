"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Footer from "@/components/admin/Footer";
import Link from "next/link";


export default function BroadcastLogsPage() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [resending, setResending] = useState({});
  const [resendCounts, setResendCounts] = useState({});
  const [fullMessage, setFullMessage] = useState(null);

  useEffect(() => {
    fetchBroadcasts();
  }, [page]);

  const fetchBroadcasts = async () => {
    try {
      const res = await fetch(`/api/admin/broadcast/logs?page=${page}`);
      const data = await res.json();
      setLogs(data.broadcasts || []);
      setTotal(data.total || 0);
    } catch {
      toast.error("Failed to load broadcasts");
    }
  };

  const resendEmail = async (broadcastId, email) => {
    const key = `${broadcastId}:${email}`;
    if ((resendCounts[key] || 0) >= 3) {
      toast.error(`Resend limit reached for ${email}`);
      return;
    }

    setResending((prev) => ({ ...prev, [key]: true }));

    try {
      const res = await fetch("/api/admin/broadcast/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: broadcastId, email }),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`Resent to ${email}`);
        setResendCounts((prev) => ({
          ...prev,
          [key]: (prev[key] || 0) + 1,
        }));

        setLogs((prevLogs) =>
          prevLogs.map((log) =>
            log._id === broadcastId
              ? {
                  ...log,
                  recipients: log.recipients.map((r) =>
                    r.email === email ? { ...r, status: "sent" } : r
                  ),
                }
              : log
          )
        );
      } else {
        toast.error(result.error || "Failed to resend");
      }
    } catch {
      toast.error("An error occurred");
    }

    setResending((prev) => ({ ...prev, [key]: false }));
  };

  const deleteMessage = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this message?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/admin/broadcast/${id}?force=true`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Broadcast deleted");
        setLogs((prev) => prev.filter((log) => log._id !== id));
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="w-full max-w-2xl bg-white p-4 rounded-md shadow space-y-1 text-sm sm:text-base">
      <Link href="/admin/subscribers">
        <div
          title="Go back to list of subscribers"
          // className="px-4 py-2 bg-gray-700 text-white rounded cursor-pointer text-center"
        > 
          Go Back
        </div>
      </Link>
      <h1 className="text-xl font-bold mb-4">📜 Broadcast History</h1>

      {logs.length === 0 ? (
        <p className="text-gray-500">No broadcasts found.</p>
      ) : (
        <ul className="space-y-6">
          {logs.map((log) => (
            <li
              key={log._id}
              className="relative border p-4 rounded bg-white shadow"
            >
              <p className="font-semibold">{log.subject}</p>
              <p className="text-sm text-gray-600 mb-1">
                {new Date(log.createdAt).toLocaleString()} —{" "}
                {log.recipients.length} recipients —{" "}
                <span className="italic">{log.status}</span>
              </p>
              <div
                className="text-gray-700 whitespace-pre-line line-clamp-6 cursor-pointer"
                onClick={() => setFullMessage(log.message)}
                title="Click to read full message"
              >
                <div dangerouslySetInnerHTML={{ __html: log.message }} />
              </div>

              {/* ✅ Delete Button */}
              <button
                onClick={() => deleteMessage(log._id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Delete message"
              >
                🗑️
              </button>

              <div className="mt-2 space-y-1">
                {log.recipients.map((r, idx) => {
                  const key = `${log._id}:${r.email}`;
                  const attempts = resendCounts[key] || 0;
                  const canResend = r.status === "failed" && attempts < 3;

                  return (
                    <div
                      key={idx}
                      className="text-xs flex justify-between items-center"
                    >
                      <span>{r.email}</span>
                      <span
                        className={
                          r.status === "failed"
                            ? "text-red-500"
                            : "text-green-600"
                        }
                      >
                        {r.status}
                        {r.status === "sent" && r.sentAt ? ` at ${new Date(r.sentAt).toLocaleString()}` : ""}
                      </span>
                      {canResend && (
                        <button
                          onClick={() => resendEmail(log._id, r.email)}
                          disabled={resending[key]}
                          className="ml-2 px-2 py-1 bg-black text-white text-xs rounded flex items-center gap-1"
                        >
                          {resending[key] ? (
                            <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                          ) : (
                            "Resend"
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      <div className="mt-6 flex justify-start items-center gap-3">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Modal for full message */}
      {fullMessage && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-lg shadow max-w-xl w-full relative">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
              onClick={() => setFullMessage(null)}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-2">Full Message</h2>
            <div
              className="prose max-h-[60vh] overflow-y-auto whitespace-pre-line text-sm"
              dangerouslySetInnerHTML={{ __html: fullMessage }}
            />
          </div>
        </div>
      )}

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
}
