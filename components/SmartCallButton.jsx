"use client";

import React, { useState } from "react";
import { Phone } from "lucide-react";

export default function SmartCallButton({ number = "08100515622" }) {
  const [copied, setCopied] = useState(false);
  const phone = normalize(number);

  function normalize(raw) {
    let n = raw.trim().replace(/[^\d]/g, "");
    if (n.startsWith("0")) n = "234" + n.slice(1);
    return "+" + n;
  }

  const handleInitialClick = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
    } catch (e) {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Step 1: First click only copies */}
      <button
        onClick={handleInitialClick}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        <Phone size={16} /> Call
      </button>

      {/* Step 2: After tap, show the real call link */}
      {copied && (
        <div className="p-3 bg-gray-100 rounded-md border text-black text-sm">
          Number copied: <strong>{phone}</strong>
          <br />
          Tap below to open your call app:
          <br />
          <a
            href={`tel:${phone}`}
            className="text-blue-600 underline mt-2 inline-block"
          >
            Continue to Call
          </a>
        </div>
      )}
    </div>
  );
}
