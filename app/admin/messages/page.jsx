"use client";

import React, { useEffect, useState } from "react";
// import { useUser } from "@clerk/nextjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const AdminMessagesDashboard = () => {
  const { data: session } = useSession();
  const user = session?.user;

  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [view, setView] = useState("inbox");
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMessage, setOpenMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [replies, setReplies] = useState([]);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null); 
  const [replyMessage, setReplyMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [cc, setCc] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const pageSize = 10;
  

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  // Whenever openMessage changes, set default subject
  useEffect(() => {
    if (openMessage) {
      setSubject(`Re: ${openMessage.subject}`);
    }
  }, [openMessage]);

  
  const fetchReplies = async () => {
    try {
      const res = await fetch("/api/contact/reply");
      const data = await res.json();

      if (Array.isArray(data.replies)) {
        // ✅ Deduplicate here
        const uniqueReplies = Array.from(new Map(data.replies.map(r => [r._id, r])).values());
        setReplies(uniqueReplies);
      } else {
        setReplies([]);
      }
    } catch (err) {
      console.error("Failed to fetch replies", err);
      toast.error("Failed to fetch replies");
    }
  };

  useEffect(() => {
    if (view === "replies") {
      const fetchReplies = async () => {
        try {
          const res = await fetch("/api/contact/reply");
          const data = await res.json();
          // Always REPLACE, never append
          setReplies(data.replies || []);
        } catch (err) {
          console.error("Failed to fetch replies", err);
          toast.error("Could not load replies.");
        }
      };

      fetchReplies(); // ✅ Only call it once
    }
  }, [view]); 


  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      router.push("/");
    } else {
      fetchMessages();
    }
  }, [user]);
  
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/contact/messages?view=${view}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []); // Safe fallback
    } catch (err) {
      toast.error("Failed to fetch messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [view]);


  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const bulkAction = async (action) => {
    try {
      for (const id of selectedIds) {
        let update = {};

        if (action === "read") update.read = true;
        else if (action === "unread") update.read = false;
        else if (action === "archive") update.archived = true;
        else if (action === "delete") update.deleted = true;
        else if (action === "restore") {
          update.archived = false;
          update.deleted = false;
        }
        else if (action === "permanentDelete") {
          await fetch(`/api/contact/messages/${id}?force=true`, {
            method: "DELETE",
          });
          continue;
        }

        // PATCH request
        if (Object.keys(update).length > 0) {
          await fetch(`/api/contact/messages/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(update),
          });
        }
      }

      toast.success("Successful");
      setSelectedIds([]);
      fetchMessages(); // Refresh UI
    } catch (err) {
      console.error("Bulk action failed:", err);
      toast.error("Failed");
    }
  };


  const handleMarkAsRead = async (msg) => {
    if (!msg.read) {
      await fetch(`/api/contact/messages/${msg._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      fetchMessages();
    }
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Subject", "Message", "Created At"];
    const rows = filteredMessages.map((msg) => [
      msg.name,
      msg.email,
      msg.subject,
      msg.message.replace(/\n/g, " "),
      new Date(msg.createdAt).toLocaleString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "messages.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMessages =
  view === "replies"
    ? replies.filter((msg) =>
        [msg.to, msg.cc, msg.subject, msg.message]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : messages
        .filter((msg) => {
          if (view === "inbox") return !msg.archived && !msg.deleted;
          if (view === "unread") return !msg.read && !msg.archived && !msg.deleted;
          if (view === "archived") return msg.archived && !msg.deleted;
          if (view === "deleted") return msg.deleted;
          return false;
        })
        .filter((msg) =>
          [msg.name, msg.email, msg.subject, msg.message]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase())
        );

  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const unreadCount = messages.filter(
    (msg) => !msg.read && !msg.archived && !msg.deleted
  ).length;
  const inboxCount = messages.filter(
    (msg) => !msg.archived && !msg.deleted
  ).length;
  const archivedCount = messages.filter(
    (msg) => msg.archived && !msg.deleted
  ).length;
  const deletedCount = messages.filter((msg) => msg.deleted).length;
  const repliesCount = replies?.length || 0;

  const totalPages = Math.ceil(filteredMessages.length / pageSize);

  const handleSelectAll = () => {
    const idsOnPage = paginatedMessages.map((msg) => msg._id);
    const allSelected = idsOnPage.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) =>
      allSelected ? prev.filter((id) => !idsOnPage.includes(id)) : [...new Set([...prev, ...idsOnPage])]
    );
  };

  const viewLabels = {
    inbox: "Inbox",
    unread: "Unread",
    archived: "Archived",
    deleted: "Deleted",
    replies: "Replies",
  };


  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Messages & Feedbacks</h1>
      {/* View Buttons */}
      {["inbox", "deleted"].includes(view) && selectedIds.length > 0 && (
        <p className="text-sm text-gray-600 mb-2">
          {selectedIds.length} message{selectedIds.length > 1 ? "s" : ""} selected
        </p>
      )}

      <div className="flex flex-wrap gap-2 sm:gap-4 mb-6">
        {Object.entries(viewLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setView(key);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded text-sm sm:text-base ${
              view === key ? "bg-black text-white" : "border"
            }`}
          >
            {label} (
              {({
                inbox: inboxCount,
                unread: unreadCount,
                archived: archivedCount,
                deleted: deletedCount,
                replies: repliesCount,
              }[key])}
            )
          </button>
        ))}

      </div>

      {/* Tools */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border px-3 py-2 rounded text-sm"
        />
        <button
          onClick={handleSelectAll}
          className="px-4 py-2 bg-white text-black border border-black rounded text-sm disabled:opacity-50"
        >
          {paginatedMessages.every((msg) => selectedIds.includes(msg._id))
            ? "Unselect All"
            : "Select All"}
        </button>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-gray-700 text-white rounded text-sm"
        >
          Export CSV
        </button>
      </div>

      {view === "inbox" && selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => bulkAction("read")}
            className="px-4 py-2 bg-white text-black border border-black rounded text-sm"
          >
            Mark as Read
          </button>
          <button
            onClick={() => bulkAction("unread")}
            className="px-4 py-2 bg-yellow-600 text-white rounded text-sm"
          >
            Mark as Unread
          </button>
          <button
            onClick={() => bulkAction("archive")}
            className="px-4 py-2 bg-orange-500 text-white rounded text-sm"
          >
            Archive Selected
          </button>
          <button
            onClick={() => bulkAction("delete")}
            className="px-4 py-2 bg-orange-600 text-white rounded text-sm"
          >
            Delete Selected
          </button>
        </div>
      )}
      {view === "deleted" && selectedIds.length > 0 && (
        <>
          <button
            onClick={() => bulkAction("restore")}
            className="px-4 py-2 mr-3 mb-3 bg-green-600 text-white rounded text-sm disabled:opacity-50 "
          >
            Restore Selected
          </button>
          <button
            onClick={() => bulkAction("permanentDelete")}
            className="px-4 py-2 bg-red-700 text-white rounded text-sm disabled:opacity-50"
          >
            Delete Permanently
          </button>
        </>
      )}
      {view === "archived" && selectedIds.length > 0 && (
        <>
          <button
            onClick={() => bulkAction("restore")}
            className="px-4 py-2 bg-white text-black border mr-3 mb-3 border-black rounded text-sm"
          >
            Restore to Inbox
          </button>
          <button
            onClick={() => bulkAction("delete")}
            className="px-4 py-2 bg-orange-600 text-white rounded text-sm"
          >
            Move to Deleted
          </button>
        </>
      )}
      {view === "unread" && selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => bulkAction("read")}
            className="px-4 py-2 bg-white text-black border border-black rounded text-sm"
          >
            Mark as Read
          </button>
          <button
            onClick={() => bulkAction("archive")}
            className="px-4 py-2 bg-orange-500 text-white rounded text-sm"
          >
            Archive Selected
          </button>
          <button
            onClick={() => bulkAction("delete")}
            className="px-4 py-2 bg-orange-600 text-white rounded text-sm"
          >
            Delete Selected
          </button>
        </div>
      )}
      {view === "replies" && (
        <div className="space-y-4 px-4">
          {replies.map((reply) => (
            <div
              key={reply._id}
              className="relative p-4 border rounded shadow hover:bg-gray-50 w-full max-w-2xl mx-auto"
            >
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingId(reply._id);
                }}
                className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm"
              >
                🗑️ Delete
              </button>

              {/* Clickable message body */}
              <div onClick={() => setOpenMessage({ ...reply, type: "reply" })} className="cursor-pointer">
                <p><strong>To:</strong> {reply.to}</p>
                {reply.cc && <p><strong>CC:</strong> {reply.cc}</p>}
                <p><strong>Subject:</strong> {reply.subject}</p>
                <p className="whitespace-pre-line overflow-hidden text-ellipsis line-clamp-3">
                  {reply.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Sent: {dayjs(reply.sentAt).fromNow()}
                </p>
              </div>

              {/* Confirmation popup */}
              {deletingId === reply._id && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col justify-center items-center text-center p-4 rounded z-10 shadow-inner">
                  <p className="text-sm text-gray-700 font-medium">
                    Are you sure you want to delete this reply?
                  </p>
                  <p className="text-xs text-red-500 mt-1">
                    This action is irreversible. Deleted messages cannot be restored.
                  </p>
                  <div className="mt-3 flex gap-4">
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const res = await fetch(`/api/contact/reply`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ id: reply._id }),
                          });

                          if (res.ok) {
                            setReplies((prev) => prev.filter((r) => r._id !== reply._id));
                            toast.success("Reply deleted");
                          } else {
                            toast.error("Failed to delete reply");
                          }
                        } catch (err) {
                          toast.error("Error deleting reply");
                        } finally {
                          setDeletingId(null);
                        }
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(null);
                      }}
                      className="px-3 py-1 border text-sm rounded hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Message List */}
      {view !== "replies" && (loading ? (
        <p className="text-gray-500">Loading messages...</p>
      ) : paginatedMessages.length ? (
        <div className="space-y-4">
          {paginatedMessages.map((msg) => (
            <div
              key={msg._id}
              onClick={() => {
                setOpenMessage({ ...msg, type: "inbox" });
                handleMarkAsRead(msg);
              }}
              className={`p-4 border rounded shadow flex flex-col sm:flex-row justify-between gap-4 cursor-pointer ${
                !msg.read ? "bg-orange-50" : ""
              }`}
            >
              <div className="w-full max-w-md mx-auto bg-white p-4 rounded-md shadow space-y-1 text-sm sm:text-base">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(msg._id)}
                  onChange={(e) => {
                    e.stopPropagation(); // Prevent opening the modal
                    toggleSelect(msg._id);
                  }}
                  className="mt-1 accent-orange-600"
                />
                <div className="space-y-1 text-sm sm:text-base">
                  <p>
                    <strong>Name:</strong> {msg.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {msg.email}
                  </p>
                  <p>
                    <strong>Subject:</strong> {msg.subject}
                  </p>
                  <p className="text-gray-700 whitespace-pre-line line-clamp-2">{msg.message}</p>
                  <p className="text-xs text-gray-500">
                    Sent: {dayjs(msg.createdAt).fromNow()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:flex-col items-start">
                {view !== "deleted" && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await fetch(`/api/contact/messages/${msg._id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ archived: !msg.archived }),
                      });
                      toast.success(
                        msg.archived ? "Message unarchived." : "Message archived."
                      );
                      fetchMessages();
                    }}
                    className="text-sm text-black hover:underline"
                  >
                    {msg.archived ? "Unarchive" : "Archive"}
                  </button>
                )}
                {view === "deleted" ? (
                  <>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await fetch(`/api/contact/messages/${msg._id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ deleted: false }),
                        });
                        toast.success("Message restored.");
                        fetchMessages();
                      }}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Restore
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await fetch(`/api/contact/messages/${msg._id}?force=true`, {
                          method: "DELETE",
                        });
                        toast.success("Message permanently deleted.");
                        fetchMessages();
                      }}
                      className="text-sm text-red-700 hover:underline"
                    >
                      Delete Permanently
                    </button>
                  </>
                ) : (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await fetch(`/api/contact/messages/${msg._id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ deleted: true }),
                      });
                      toast.success("Message deleted.");
                      fetchMessages();
                    }}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No messages found.</p>
      )
      )}
      
      {/* Pagination */}
      {/* {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded border ${
                currentPage === i + 1
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )} */}
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex flex-wrap gap-2 text-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 text-black dark:text-white"
            >
              Prev
            </button>

            {(() => {
              const range = [];
              const start = Math.max(1, currentPage - 2);
              const end = Math.min(totalPages, currentPage + 2);

              if (start > 1) {
                range.push(1);
                if (start > 2) range.push("ellipsis-start");
              }

              for (let i = start; i <= end; i++) {
                range.push(i);
              }

              if (end < totalPages) {
                if (end < totalPages - 1) range.push("ellipsis-end");
                range.push(totalPages);
              }

              return range.map((item, index) =>
                typeof item === "string" ? (
                  <span key={index} className="px-2 py-1 text-gray-500">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`px-3 py-1 rounded border ${
                      currentPage === item
                        ? "bg-black text-white"
                        : "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
                    }`}
                  >
                    {item}
                  </button>
                )
              );
            })()}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 text-black dark:text-white"
            >
              Next
            </button>
          </div>
        </div>
      )}


      {/* Message Modal */}
     {openMessage && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div
            className="bg-white rounded-lg p-6 max-w-lg w-full relative shadow-xl overflow-y-auto"
            style={{ maxHeight: "90vh" }}
          >
            <button
              onClick={() => setOpenMessage(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✖
            </button>

            <h2 className="text-lg font-bold mb-2">{openMessage.subject}</h2>

            {view === "replies" ? (
              <>
                <p className="text-sm text-gray-500 mb-1">
                  <strong>To:</strong> {openMessage.to}
                </p>

                {openMessage.cc && (
                  <p className="text-sm text-gray-500 mb-1">
                    <strong>CC:</strong> {openMessage.cc}
                  </p>
                )}

                <p className="text-xs text-gray-400 mb-4">
                  Sent {dayjs(openMessage.sentAt).fromNow()}
                </p>

                <p className="text-base whitespace-pre-line">{openMessage.message}</p>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-1">
                  From: {openMessage.name} ({openMessage.email})
                </p>

                {openMessage.device && (
                  <p className="text-xs text-gray-500 mb-1">
                    Sent from: {openMessage.device}
                  </p>
                )}

                {openMessage.location && (
                  <p className="text-xs text-gray-500 mb-1">
                    Location: {openMessage.location}
                  </p>
                )}

                <p className="text-xs text-gray-400 mb-4">
                  Sent {dayjs(openMessage.createdAt).fromNow()}
                </p>

                <p className="text-base whitespace-pre-line">{openMessage.message}</p>

                {/* Reply Button */}
                <button
                  onClick={() => {
                    setReplyTarget(openMessage);  
                    setShowReplyModal(true);      
                    setOpenMessage(null);   
                  }}

                  className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Reply
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && replyTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div
            className="bg-white rounded-lg p-6 max-w-lg w-full relative shadow-xl overflow-y-auto"
            style={{ maxHeight: "90vh" }}
          >
            <button
              onClick={() => {
                setShowReplyModal(false);
                setReplyTarget(null);
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✖
            </button>

            <h2 className="text-lg font-bold mb-4">Reply to Message</h2>

            <div className="mb-2">
              <label className="block text-sm font-medium">To</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded bg-gray-100 cursor-not-allowed"
                value={replyTarget.email || ""}
                readOnly
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium">CC</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div className="mb-2">
              <label className="block text-sm font-medium">Subject</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium">Message</label>
              <textarea
                className="w-full border p-2 rounded"
                rows={5}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write your reply..."
              />
            </div>

            <button
              onClick={async () => {
                await fetch("/api/contact/reply", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    to: replyTarget.email,
                    cc,
                    subject,
                    message: replyMessage,
                    originalMessageId: replyTarget._id,
                  }),
                });
                toast.success("Reply sent!");
                setReplyMessage("");
                setSubject(`Re: ${openMessage.subject}`);
                setCc("");
                setShowReplyModal(false);
                setOpenMessage(null);
              }}
              className="mt-3 bg-black text-white px-4 py-2 rounded"
            >
              Send Reply
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMessagesDashboard;
