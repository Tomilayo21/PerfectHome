"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Footer from "@/components/admin/Footer";
import Link from "next/link";
import { Trash2, RefreshCw, CheckCircle2, XCircle, Clock, Scroll, History } from "lucide-react";



export default function ViewBroadcastButton({ setUserPanel }) {
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
    <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 p-4 sm:p-6 rounded-xl shadow-lg space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
        <Scroll className="w-5 h-5 text-gray-700" /> Broadcast History
      </h1>

      {logs.length === 0 ? (
        <p className="text-gray-500 text-sm sm:text-base">No broadcasts found.</p>
      ) : (
        <ul className="space-y-4">
          {logs.map((log) => (
            <li
              key={log._id}
              className="relative border border-gray-200 dark:border-neutral-700 p-4 sm:p-5 rounded-lg shadow-sm bg-white dark:bg-neutral-800 hover:shadow-md transition"
            >
              {/* Header: Subject + Delete */}
              <div className="flex justify-between items-start gap-2">
                <p className="font-semibold text-base sm:text-lg break-words">
                  {log.subject}
                </p>
                <button
                  onClick={() => deleteMessage(log._id)}
                  className="text-gray-400 hover:text-red-500 transition flex-shrink-0"
                  title="Delete message"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Meta info */}
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {new Date(log.createdAt).toLocaleString()} •{" "}
                {log.recipients.length} recipients •{" "}
                <span className="italic">{log.status}</span>
              </p>

              {/* Message Preview */}
              <div
                className="text-gray-700 dark:text-gray-300 mt-3 whitespace-pre-line line-clamp-3 sm:line-clamp-4 cursor-pointer text-sm sm:text-base"
                onClick={() => setFullMessage(log.message)}
                title="Click to read full message"
              >
                <div dangerouslySetInnerHTML={{ __html: log.message }} />
              </div>

              {/* Recipients */}
              <div className="mt-4 space-y-2">
                {log.recipients.map((r, idx) => {
                  const key = `${log._id}:${r.email}`;
                  const attempts = resendCounts[key] || 0;
                  const canResend = r.status === "failed" && attempts < 3;

                  let statusIcon =
                    r.status === "sent" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : r.status === "failed" ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    );

                  return (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs border-b border-gray-100 dark:border-neutral-700 pb-2 gap-1"
                    >
                      <span className="truncate">{r.email}</span>

                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <span className="flex items-center gap-1">
                          {statusIcon}
                          {r.status}
                        </span>
                        {r.status === "sent" && r.sentAt && (
                          <span className="text-gray-500 text-[11px]">
                            at {new Date(r.sentAt).toLocaleTimeString()}
                          </span>
                        )}
                        {canResend && (
                          <button
                            onClick={() => resendEmail(log._id, r.email)}
                            disabled={resending[key]}
                            className="w-full sm:w-auto px-2 py-1 bg-black text-white text-xs rounded flex items-center justify-center gap-1 hover:bg-gray-800 disabled:opacity-50"
                            title="Resend email"
                          >
                            {resending[key] ? (
                              <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full"></span>
                            ) : (
                              <RefreshCw className="w-3 h-3" />
                            )}
                            Resend
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2 sm:gap-4 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-200 dark:bg-neutral-700 disabled:opacity-40 hover:bg-gray-300 dark:hover:bg-neutral-600 transition"
          >
            Prev
          </button>
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-200 dark:bg-neutral-700 disabled:opacity-40 hover:bg-gray-300 dark:hover:bg-neutral-600 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Full Message Modal */}
      {fullMessage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4">
          <div className="bg-white dark:bg-neutral-900 p-4 sm:p-6 rounded-xl shadow-xl w-full max-w-lg sm:max-w-2xl h-[90vh] sm:h-auto overflow-y-auto relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition"
              onClick={() => setFullMessage(null)}
            >
              ✖
            </button>
            <h2 className="text-base sm:text-lg font-semibold mb-3">📩 Full Message</h2>
            <div
              className="prose dark:prose-invert max-h-[70vh] sm:max-h-[60vh] overflow-y-auto whitespace-pre-line text-xs sm:text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: fullMessage }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
