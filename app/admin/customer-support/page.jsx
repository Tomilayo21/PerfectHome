
"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { format, isToday, isYesterday, parseISO } from "date-fns";
// import { Send, Paperclip } from "lucide-react";
import { Send, Paperclip, Camera, Image, FileText } from "lucide-react";



export default function AdminChat() {
  const [messages, setMessages] = useState([]);
  const [replyMap, setReplyMap] = useState({});
  const [expandedChats, setExpandedChats] = useState({});
  const ref = useRef(null);
  const [adminStatus, setAdminStatus] = useState("offline");
  const [unreadMap, setUnreadMap] = useState({});
  const scrollContainerRef = useRef(null);
  const [justSent, setJustSent] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState({});


  const updateStatus = async (newStatus) => {
    setAdminStatus(newStatus);
    await fetch("/api/admin-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newStatus }),
    });
  };

  const fetchMessages = async () => {
    const res = await axios.get("/api/messages");
    const allMessages = res.data;
    setMessages(allMessages);

    const undelivered = allMessages.filter(
      (msg) => msg.isAdmin && msg.status !== "delivered"
    );
    if (undelivered.length > 0) {
      await axios.post("/api/messages/deliver", {
        ids: undelivered.map((msg) => msg._id),
      });
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const sendReply = async (chatId) => {
    const reply = replyMap[chatId];
    if (!reply?.trim()) return;

    await axios.post("/api/messages", {
      content: reply,
      senderName: "Admin",
      isAdmin: true,
      chatId,
    });

    setReplyMap((prev) => ({ ...prev, [chatId]: "" }));
    setJustSent(true);
    fetchMessages();
  };

  const scrollToBottom = () => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    const isNearBottom = () => {
      if (!container) return false;
      return container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    };

    if (justSent || isNearBottom()) {
      scrollToBottom();
    }

    setJustSent(false);
  }, [messages]);

  const handleToggle = (chatId) => {
    setExpandedChats((prev) => {
      const isNowOpen = !prev[chatId];
      if (isNowOpen) {
        setUnreadMap((prevUnread) => ({
          ...prevUnread,
          [chatId]: 0,
        }));
      }
      return {
        ...prev,
        [chatId]: isNowOpen,
      };
    });
  };

  const grouped = messages.reduce((acc, msg) => {
    const id = msg.chatId;
    if (!acc[id]) acc[id] = [];
    acc[id].push(msg);
    return acc;
  }, {});

  useEffect(() => {
    const newUnreadMap = {};
    Object.entries(grouped).forEach(([chatId, msgs]) => {
      let count = 0;
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].isAdmin) break;
        count++;
      }
      if (!expandedChats[chatId]) {
        newUnreadMap[chatId] = count;
      }
    });
    setUnreadMap(newUnreadMap);
  }, [grouped, expandedChats]);

  const handleView = (chatId) => {
    if (!expandedChats[chatId]) {
      setExpandedChats((prev) => ({ ...prev, [chatId]: true }));
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Admin Chat Panel</h2>

      <div className="flex items-center gap-2 mb-4">
        <span className="font-semibold">Admin Status:</span>
        {["online", "away", "offline"].map((s) => (
          <button
            key={s}
            onClick={() => updateStatus(s)}
            className={`px-3 py-1 rounded text-sm capitalize border ${
              adminStatus === s ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3 border p-2 rounded h-[500px] overflow-y-auto">
          <h3 className="font-bold mb-2">User Chats</h3>
          {Object.entries(grouped).map(([chatId, msgs]) => {
            const last = msgs[msgs.length - 1];
            const firstUserMessage = msgs.find((m) => !m.isAdmin);
            const unreadCount = unreadMap[chatId] || 0;
            const isUnread = unreadCount > 0 && !expandedChats[chatId];

            return (
              <div
                key={chatId}
                onClick={() => handleView(chatId)}
                className="p-2 mb-2 rounded cursor-pointer bg-gray-100"
              >
                <div className="text-sm font-semibold flex justify-between items-center">
                  <span>{firstUserMessage?.senderName || "User"}</span>
                  {isUnread && (
                    <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {last.content}
                </div>
              </div>
            );
          })}
        </div>

        <div ref={scrollContainerRef} className="w-full lg:w-2/3 border p-4 rounded h-[500px] overflow-y-auto">
          {Object.entries(grouped).map(([chatId, msgs]) => {
            const firstUserMessage = msgs.find((m) => !m.isAdmin);
            const isOpen = expandedChats[chatId];

            if (!isOpen) return null;

            const groupedByDate = {};
            msgs.forEach((msg) => {
              const dateKey = format(new Date(msg.createdAt), "yyyy-MM-dd");
              if (!groupedByDate[dateKey]) groupedByDate[dateKey] = [];
              groupedByDate[dateKey].push(msg);
            });

            return (
              <div key={chatId} className="mb-6 border-b pb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-semibold text-sm">
                    {firstUserMessage?.senderName || "User"}
                  </div>
                  <button
                    onClick={() => handleToggle(chatId)}
                    className="text-sm text-blue-600"
                  >
                    Collapse
                  </button>
                </div>

                <div className="space-y-2 mb-2 max-h-72 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                  {Object.entries(groupedByDate).map(([dateKey, dateMsgs]) => {
                    const date = parseISO(dateKey + "T00:00:00Z");
                    let label = format(date, "MMMM d, yyyy");
                    if (isToday(date)) label = "Today";
                    else if (isYesterday(date)) label = "Yesterday";

                    return (
                      <div key={dateKey}>
                        <div className="text-center text-xs text-gray-500 my-2">{label}</div>
                        <div className="space-y-2">
                          {dateMsgs.map((msg) => (
                            <div
                              key={msg._id}
                              className={`p-2 rounded text-sm max-w-[75%] ${
                                msg.isAdmin ? "bg-blue-100 ml-auto" : "bg-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span>{msg.content}</span>
                                <div className="flex flex-col items-end">
                                  {msg.isAdmin && (
                                    <span className="text-xs text-gray-500">
                                      {msg.status === "delivered" ? "✓✓" : "✓"}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-gray-400 mt-1">
                                    {format(new Date(msg.createdAt), "h:mm a")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={ref}></div>
                </div>

                {/* <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyMap[chatId] || ""}
                    onChange={(e) =>
                      setReplyMap((prev) => ({
                        ...prev,
                        [chatId]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply(chatId);
                      }
                    }}
                    placeholder="Type reply..."
                    className="flex-1 p-2 border rounded"
                  />

                  <button
                    onClick={() => {
                      if ((replyMap[chatId] || "").trim().length > 0) {
                        sendReply(chatId);
                      } else {
                        setShowAttachmentMenu((prev) => ({
                          ...prev,
                          [chatId]: !prev[chatId], // toggle for this chat
                        }));
                      }
                    }}
                    className="bg-orange-600 text-white p-3 rounded-full hover:bg-orange-700 transition relative"
                  >
                    {(replyMap[chatId] || "").trim().length > 0 ? (
                      <Send size={18} />
                    ) : (
                      <Paperclip size={18} />
                    )}
                  </button>

                  {showAttachmentMenu[chatId] && (
                    <div className="absolute bottom-20 right-20 bg-white shadow-lg rounded-lg p-2 w-40 animate-fadeIn">
                      <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded">
                        <Camera className="w-5 h-5" /> Camera
                      </button>
                      <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded">
                        <Image className="w-5 h-5" /> Gallery
                      </button>
                      <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded">
                        <FileText className="w-5 h-5" /> Document
                      </button>
                    </div>
                  )}



                </div> */}
                <div className="flex gap-2 relative"> {/* make relative for popup positioning */}
                  <input
                    type="text"
                    value={replyMap[chatId] || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      setReplyMap((prev) => ({
                        ...prev,
                        [chatId]: value,
                      }));

                      // Hide attachment menu while typing
                      if (value.trim().length > 0 && showAttachmentMenu[chatId]) {
                        setShowAttachmentMenu((prev) => ({
                          ...prev,
                          [chatId]: false,
                        }));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply(chatId);
                      }
                    }}
                    placeholder="Type reply..."
                    className="flex-1 p-2 border rounded"
                  />

                  <button
                    onClick={() => {
                      if ((replyMap[chatId] || "").trim().length > 0) {
                        sendReply(chatId);
                      } else {
                        setShowAttachmentMenu((prev) => ({
                          ...prev,
                          [chatId]: !prev[chatId], // toggle for this chat
                        }));
                      }
                    }}
                    className="bg-orange-600 text-white p-3 rounded-full hover:bg-orange-700 transition relative"
                  >
                    {(replyMap[chatId] || "").trim().length > 0 ? (
                      <Send size={18} />
                    ) : (
                      <Paperclip size={18} />
                    )}
                  </button>

                  {showAttachmentMenu[chatId] && (
                    <div className="absolute bottom-20 right-20 bg-white shadow-lg rounded-lg p-2 w-40 animate-fadeIn">
                      <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded">
                        <Camera className="w-5 h-5" /> Camera
                      </button>
                      <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded">
                        <Image className="w-5 h-5" /> Gallery
                      </button>
                      <button className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 rounded">
                        <FileText className="w-5 h-5" /> Document
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
