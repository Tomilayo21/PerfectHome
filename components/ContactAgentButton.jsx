"use client";

import React, { useState } from "react";
import { ArrowRight, Phone, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function ContactAgentButton({ property }) {
  // -----------------------------
  // Number cleanup
  // -----------------------------
  const normalizeNumber = (raw) => {
    if (!raw) return "";
    let n = String(raw).trim().replace(/[^\d+]/g, "");
    if (/^0\d+/.test(n)) n = "234" + n.slice(1);
    n = n.replace(/^\++/, "+");
    if (!n.startsWith("+")) n = "+" + n;
    return n;
  };

  const agentNumberRaw = "08100515622";
  const phone = normalizeNumber(agentNumberRaw);

  const messageText = `Hello, I'm reaching out regarding your listed property ${
    property?.title || "your property"
  } located at ${
    property?.address || "the listed address"
  }. Is it still available?`;
  const encoded = encodeURIComponent(messageText);

  const whatsappLink =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      ? `https://wa.me/${phone.replace("+", "")}?text=${encoded}`
      : `https://web.whatsapp.com/send?phone=${phone.replace(
          "+",
          ""
        )}&text=${encoded}`;

  const smsHref = `sms:${phone}?body=${encoded}`;

  // -----------------------------
  // Smart Call Logic
  // -----------------------------
  const [copied, setCopied] = useState(false);

    const handleInitialCallTap = async () => {
    try {
        await navigator.clipboard.writeText(phone);
        setCopied(true);

        toast.custom(
        (t) => (
            <div
            className={`max-w-md w-full bg-blue-50 dark:bg-blue-900 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
                t.visible
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
            >
            <Phone className="text-blue-600 dark:text-blue-300" size={20} />
            <p className="text-sm font-medium text-blue-700 dark:text-blue-200">
                Number copied!
            </p>
            </div>
        ),
        {
            duration: 3000,
            position: "top-right",
        }
        );
    } catch (e) {
        setCopied(true);
    }
    };


  return (
    <div className="flex flex-col gap-4">

      {/* Main Button Row */}
      <div className="flex gap-2 flex-wrap">
        {/* WhatsApp */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition"
        >
          WhatsApp <ArrowRight size={16} />
        </a>

        {/* Smart Call */}
        <button
          onClick={handleInitialCallTap}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
        >
          <Phone size={16} /> Call
        </button>

        {/* SMS */}
        <a
          href={smsHref}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md shadow hover:bg-gray-900 transition"
        >
          Message <MessageSquare size={16} />
        </a>
      </div>

      {/* Animated Popup After Copy */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
            className="bg-white border border-gray-200 shadow-lg rounded-lg p-4 text-sm"
          >
            <p className="mb-2 text-gray-700">
              Number copied: <strong>{phone}</strong>
            </p>

            <a
              href={`tel:${phone}`}
              className="inline-block mt-1 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
            >
              Continue to Call
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
