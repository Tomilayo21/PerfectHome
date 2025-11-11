"use client";

import React, { useEffect, useState } from "react";
import SubscriberExportButton from "@/components/SubscriberExportButton";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import TiptapEditor from "@/components/TiptapEditor";
import { Mail, Send, X, Megaphone, FileText, FileSpreadsheet, FileImage, ImagePlus, Clock } from "lucide-react";
dayjs.extend(relativeTime);


const SubscribersPage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [scheduledFor, setScheduledFor] = useState("");
  const [broadcasts, setBroadcasts] = useState([]);
  const [showBroadcastHistoryModal, setShowBroadcastHistoryModal] = useState(false);
  const [attachments, setAttachments] = useState([]); 

  const pageSize = 15;

  useEffect(() => {
    const fetchBroadcasts = async () => {
      try {
        const res = await fetch("/api/admin/broadcast/logs");
        const data = await res.json();
        setBroadcasts(data.broadcasts || []);
      } catch (err) {
        console.error("Failed to fetch broadcasts:", err);
        setBroadcasts([]);
      }
    };

    fetchBroadcasts();
  }, []);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const res = await fetch("/api/admin/subscribers");
        const data = await res.json();
        // setSubscribers(data.subscribers || []);
        setSubscribers(Array.isArray(data) ? data : []);

      } catch (error) {
        console.error("Error fetching subscribers:", error);
        setSubscribers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  const totalPages = Math.ceil(subscribers.length / pageSize);
  const paginatedSubscribers = subscribers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  const handleSend = async () => {
    setStatus("sending");

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("message", message);
    formData.append("scheduledFor", scheduledFor || "");

    attachments.forEach((file) => {
      formData.append("attachment", file);
    });

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setStatus(data.success ? "sent" : "error");

      if (data.success) {
        setTimeout(() => {
          setShowBroadcastModal(false);
          setStatus(null);
          setSubject("");
          setMessage("");
          setScheduledFor("");
          setAttachments([]);
        }, 1500);
      }
    } catch (err) {
      console.error("Broadcast send error:", err);
      setStatus("error");
    }
  };

  return (
    // <div className="max-w-4xl flex-1 overflow-scroll flex flex-col">
    //   <h1 className="text-lg  md:text-2xl font-bold mb-4">Subscribers</h1>
    //   <div className="flex items-center gap-4 mb-4">
    //     <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0 mb-4">
    //       <SubscriberExportButton />
    //       <button
    //         onClick={() => setShowBroadcastModal(true)}
    //         className="px-4 py-2 bg-black text-white rounded"
    //       >
    //         📢 Send Broadcast
    //       </button>
    //     </div>

    //     {/* Broadcast History Modal */}
    //     {Array.isArray(broadcasts) && showBroadcastHistoryModal && (
    //       <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    //         <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
    //           <button
    //             onClick={() => setShowBroadcastHistoryModal(false)}
    //             className="absolute top-2 right-2 text-gray-600 hover:text-black dark:hover:text-white"
    //           >
    //             ✖
    //           </button>

              
    //           <h2 className="text-xl font-bold mb-4">🗂️ Recent Broadcasts</h2>

    //           {broadcasts.slice(0, 10).map((broadcast, index) => (
    //             <div
    //               key={index}
    //               className="border p-4 rounded mb-3 bg-white dark:bg-neutral-800"
    //             >
    //               <h3 className="font-semibold">{broadcast.subject}</h3>
    //               <p>
    //                 Status: <span className="font-medium">{broadcast.status}</span>
    //               </p>
    //               <p>
    //                 Scheduled For:{" "}
    //                 {broadcast.scheduledFor
    //                   ? new Date(broadcast.scheduledFor).toLocaleString()
    //                   : "—"}
    //               </p>
    //               {broadcast.sentAt && (
    //                 // <p>Sent At: {new Date(broadcast.sentAt).toLocaleString()}</p>
    //                 <p>
    //                   Sent At: {new Date(broadcast.sentAt).toLocaleString()}{" "}
    //                   (
    //                   {(() => {
    //                     const now = new Date();
    //                     const sent = new Date(broadcast.sentAt);
    //                     const diffMs = now - sent;
    //                     const diffMinutes = Math.floor(diffMs / (1000 * 60));
    //                     const diffHours = Math.floor(diffMinutes / 60);
    //                     const diffDays = Math.floor(diffHours / 24);

    //                     if (diffMinutes < 1) return "just now";
    //                     if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
    //                     if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    //                     return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    //                   })()}
    //                   )
    //                 </p>
    //               )}
    //             </div>
    //           ))}
    //         </div>
    //       </div>
    //     )}
    //   </div>

    //   {loading ? (
    //     <p className="text-gray-500 mt-4">Loading subscribers...</p>
    //   ) : !Array.isArray(subscribers) || subscribers.length === 0 ? (
    //     <p className="text-gray-500 mt-6">No subscribers found.</p>
    //   ) : (
    //     <div className="mt-6">
    //       {/* Table for md+ screens */}
    //       <div className="hidden md:block">
    //         <table className="w-full border-collapse border border-gray-300 text-sm">
    //           <thead>
    //             <tr className="bg-gray-100">
    //               <th className="border p-2 text-left">Email</th>
    //               <th className="border p-2 text-left">Subscribed At</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {Array.isArray(paginatedSubscribers) &&
    //               paginatedSubscribers.map((sub, index) => (
    //                 <tr key={index} className="hover:bg-gray-50">
    //                   <td className="border p-2">{sub.email}</td>
    //                   <td className="border p-2">
    //                     {new Date(sub.subscribedAt).toLocaleString()} •{" "}
    //                     {dayjs(sub.subscribedAt).fromNow()}
    //                   </td>
    //                 </tr>
    //               ))}
    //           </tbody>
    //         </table>
    //       </div>

    //       {/* Cards for small screens */}
    //       <div className="md:hidden flex flex-col gap-4">
    //         {Array.isArray(paginatedSubscribers) &&
    //           paginatedSubscribers.map((sub, index) => (
    //             <div
    //               key={index}
    //               className="border border-gray-300 p-4 rounded shadow-sm bg-white dark:bg-neutral-900"
    //             >
    //               <p className="font-medium break-words text-sm text-black dark:text-white">
    //                 📧 {sub.email}
    //               </p>
    //               <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
    //                 {new Date(sub.subscribedAt).toLocaleString()} •{" "}
    //                 {dayjs(sub.subscribedAt).fromNow()}
    //               </p>
    //             </div>
    //           ))}
    //       </div>

    //       {/* Pagination */}
    //       {totalPages > 1 && (
    //         <div className="mt-6 flex justify-center items-center gap-2">
    //           <button
    //             disabled={page === 1}
    //             onClick={() => setPage((p) => Math.max(p - 1, 1))}
    //             className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
    //           >
    //             Prev
    //           </button>
    //           <button
    //             disabled={page === totalPages}
    //             onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
    //             className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
    //           >
    //             Next
    //           </button>
    //         </div>
    //       )}
    //     </div>
    //   )}

    //   {/* Broadcast Modal */}
    //   {showBroadcastModal && (
    //     <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    //       <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
    //         <input
    //           type="datetime-local"
    //           className="border p-2 w-full mb-2 rounded"
    //           value={scheduledFor}
    //           onChange={(e) => setScheduledFor(e.target.value)}
    //         />

    //         <button
    //           onClick={() => {
    //             setShowBroadcastModal(false);
    //             setStatus(null);
    //             setSubject("");
    //             setMessage("");
    //             setAttachments([]);
    //           }}
    //           className="absolute top-2 right-2 text-gray-600 hover:text-black dark:hover:text-white"
    //         >
    //           ✖
    //         </button>
    //         <h2 className="text-lg font-bold mb-4">📢 Send Broadcast</h2>
    //         <p className="text-sm text-gray-500 mb-4">
    //           Total recipients: <strong>{subscribers.length}</strong>
    //         </p>
    //         <p className="text-sm text-gray-500 mb-4">Subject</p>
    //         <input
    //           type="text"
    //           placeholder="Subject"
    //           className="border p-2 w-full mb-2 rounded"
    //           value={subject}
    //           onChange={(e) => setSubject(e.target.value)}
    //         />
    //         <p className="text-sm text-gray-500 mb-4">Message</p>
    //         <TiptapEditor
    //           description={message}
    //           setDescription={setMessage}
    //           placeholder="Type your message here..."
    //         />

    //         {/* Attachments Preview + File Input */}
    //         <div className="flex flex-wrap items-start gap-3 mt-2">
    //           {Array.isArray(attachments) &&
    //             attachments.map((file, index) => {
    //               const fileType = file.type;

    //               const isImage = fileType.startsWith("image/");
    //               const isPdf = fileType === "application/pdf";
    //               const isCsv =
    //                 fileType.includes("csv") || file.name.toLowerCase().endsWith(".csv");

    //               return (
    //                 <div
    //                   key={index}
    //                   className="relative w-24 h-24 flex-shrink-0"
    //                 >
    //                   <div className="w-24 h-24 border border-gray-300 rounded overflow-hidden relative bg-white dark:bg-neutral-800 flex items-center justify-center">
    //                     {isImage ? (
    //                       <img
    //                         src={URL.createObjectURL(file)}
    //                         alt={`preview-${index}`}
    //                         className="object-cover w-full h-full"
    //                       />
    //                     ) : isPdf ? (
    //                       <div className="flex flex-col items-center text-red-600">
    //                         <FileText className="w-6 h-6" />
    //                         <span className="text-xs">PDF</span>
    //                       </div>
    //                     ) : isCsv ? (
    //                       <div className="flex flex-col items-center text-green-600">
    //                         <FileSpreadsheet className="w-6 h-6" />
    //                         <span className="text-xs">CSV</span>
    //                       </div>
    //                     ) : (
    //                       <div className="flex flex-col items-center text-gray-500">
    //                         <FileImage className="w-6 h-6" />
    //                         <span className="text-xs">File</span>
    //                       </div>
    //                     )}

    //                     {/* Remove button */}
    //                     <button
    //                       onClick={() => {
    //                         const updated = [...attachments];
    //                         updated.splice(index, 1);
    //                         setAttachments(updated);
    //                       }}
    //                       className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-800"
    //                       title="Remove"
    //                     >
    //                       –
    //                     </button>
    //                   </div>
    //                 </div>
    //               );
    //             })}

    //           {attachments.length < 10 && (
    //             <label className="w-24 h-24 border border-dashed border-gray-300 rounded cursor-pointer flex items-center justify-center overflow-hidden">
    //               <input
    //                 type="file"
    //                 hidden
    //                 multiple
    //                 accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.csv,.xls,.xlsx"
    //                 onChange={(e) => {
    //                   const newFiles = Array.from(e.target.files);
    //                   setAttachments([...attachments, ...newFiles]);
    //                 }}
    //               />
    //               <ImagePlus className="w-6 h-6 text-gray-500" />
    //             </label>
    //           )}
    //         </div>

    //         <button
    //           onClick={handleSend}
    //           className="bg-black text-white px-4 py-2 rounded mt-4"
    //         >
    //           Send
    //         </button>
    //         {status === "sending" && (
    //           <p className="text-blue-500 mt-2">Sending...</p>
    //         )}
    //         {status === "sent" && (
    //           <p className="text-green-500 mt-2">Sent successfully!</p>
    //         )}
    //         {status === "error" && (
    //           <p className="text-red-500 mt-2">Error sending message.</p>
    //         )}
    //       </div>
    //     </div>
    //   )}

    // </div>

    <div className="max-w-5xl flex-1 overflow-y-auto flex flex-col px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Mail className="w-6 h-6 text-orange-600" /> Subscribers
      </h1>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-3">
          <SubscriberExportButton />
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg shadow hover:bg-orange-600 transition"
          >
            <Megaphone className="w-4 h-4" /> Send Broadcast
          </button>
        </div>
        {/* <button
          onClick={() => setShowBroadcastHistoryModal(true)}
          className="text-sm text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white underline"
        >
          View Broadcast History
        </button> */}
      </div>

      {/* Broadcast History Modal */}
      {Array.isArray(broadcasts) && showBroadcastHistoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowBroadcastHistoryModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" /> Recent Broadcasts
            </h2>

            {broadcasts.slice(0, 10).map((broadcast, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 mb-3 bg-gray-50 dark:bg-neutral-800 shadow-sm"
              >
                <h3 className="font-semibold">{broadcast.subject}</h3>
                <p className="text-sm text-gray-600">
                  Status:{" "}
                  <span
                    className={`font-medium ${
                      broadcast.status === "sent"
                        ? "text-green-600"
                        : broadcast.status === "scheduled"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }`}
                  >
                    {broadcast.status}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Scheduled For:{" "}
                  {broadcast.scheduledFor
                    ? new Date(broadcast.scheduledFor).toLocaleString()
                    : "—"}
                </p>
                {broadcast.sentAt && (
                  <p className="text-sm text-gray-600">
                    Sent At: {new Date(broadcast.sentAt).toLocaleString()} (
                    {(() => {
                      const now = new Date();
                      const sent = new Date(broadcast.sentAt);
                      const diffMs = now.getTime() - sent.getTime();
                      const diffMinutes = Math.floor(diffMs / (1000 * 60));
                      const diffHours = Math.floor(diffMinutes / 60);
                      const diffDays = Math.floor(diffHours / 24);

                      if (diffMinutes < 1) return "just now";
                      if (diffMinutes < 60)
                        return `${diffMinutes} minute${
                          diffMinutes === 1 ? "" : "s"
                        } ago`;
                      if (diffHours < 24)
                        return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
                      return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
                    })()}
                    )
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscribers */}
      {loading ? (
        <p className="text-gray-500 mt-6">Loading subscribers...</p>
      ) : !Array.isArray(subscribers) || subscribers.length === 0 ? (
        <p className="text-gray-500 mt-6">No subscribers found.</p>
      ) : (
        <div className="mt-6">
          {/* Table (md+) */}
          <div className="hidden md:block">
            <table className="w-full border-collapse text-sm shadow-sm rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Subscribed At</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubscribers.map((sub, index) => (
                  <tr
                    key={index}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{sub.email}</td>
                    <td className="p-3 text-gray-600">
                      {new Date(sub.subscribedAt).toLocaleString()} •{" "}
                      {dayjs(sub.subscribedAt).fromNow()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile) */}
          <div className="md:hidden flex flex-col gap-3">
            {paginatedSubscribers.map((sub, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 shadow-sm bg-white dark:bg-neutral-900"
              >
                <p className="font-medium text-sm break-words flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-600" /> {sub.email}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                  {new Date(sub.subscribedAt).toLocaleString()} •{" "}
                  {dayjs(sub.subscribedAt).fromNow()}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-sm"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3 py-1 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-xl max-w-lg w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowBroadcastModal(false);
                setStatus(null);
                setSubject("");
                setMessage("");
                setAttachments([]);
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-orange-600" /> Send Broadcast
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Total recipients: <strong>{subscribers.length}</strong>
            </p>

            {/* Subject */}
            <label className="text-sm text-gray-600 mb-1 block">Subject</label>
            <input
              type="text"
              placeholder="Subject"
              className="border rounded-lg px-3 py-2 w-full mb-3"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            {/* Message */}
            <label className="text-sm text-gray-600 mb-1 block">Message</label>
            <TiptapEditor
              description={message}
              setDescription={setMessage}
              placeholder="Type your message here..."
            />

            {/* Attachments */}
            <div className="flex flex-wrap items-start gap-3 mt-4">
              {attachments.map((file, index) => {
                const fileType = file.type;
                const isImage = fileType.startsWith("image/");
                const isPdf = fileType === "application/pdf";
                const isCsv =
                  fileType.includes("csv") ||
                  file.name.toLowerCase().endsWith(".csv");

                return (
                  <div
                    key={index}
                    className="relative w-24 h-24 flex-shrink-0"
                  >
                    <div className="w-24 h-24 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-neutral-800">
                      {isImage ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${index}`}
                          className="object-cover w-full h-full"
                        />
                      ) : isPdf ? (
                        <div className="flex flex-col items-center text-red-600">
                          <FileText className="w-6 h-6" />
                          <span className="text-xs">PDF</span>
                        </div>
                      ) : isCsv ? (
                        <div className="flex flex-col items-center text-green-600">
                          <FileSpreadsheet className="w-6 h-6" />
                          <span className="text-xs">CSV</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-gray-500">
                          <FileImage className="w-6 h-6" />
                          <span className="text-xs">File</span>
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        onClick={() => {
                          const updated = [...attachments];
                          updated.splice(index, 1);
                          setAttachments(updated);
                        }}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {attachments.length < 10 && (
                <label className="w-24 h-24 border border-dashed border-gray-300 rounded-lg cursor-pointer flex items-center justify-center bg-gray-50 dark:bg-neutral-800">
                  <input
                    type="file"
                    hidden
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.csv,.xls,.xlsx"
                    onChange={(e) => {
                      const newFiles = Array.from(e.target.files);
                      setAttachments([...attachments, ...newFiles]);
                    }}
                  />
                  <ImagePlus className="w-6 h-6 text-gray-500" />
                </label>
              )}
            </div>

            {/* Send button */}
            <button
              onClick={handleSend}
              className="bg-black text-white px-5 py-2 rounded-lg mt-6 w-full hover:bg-orange-600 transition flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Send
            </button>

            {/* Status messages */}
            {status === "sending" && (
              <p className="text-blue-500 mt-3 text-sm">Sending...</p>
            )}
            {status === "sent" && (
              <p className="text-green-600 mt-3 text-sm">Sent successfully!</p>
            )}
            {status === "error" && (
              <p className="text-red-600 mt-3 text-sm">Error sending message.</p>
            )}
          </div>
        </div>
      )}
    </div>

  );
};

export default SubscribersPage;