"use client";

import React, { useState } from "react";
import { Phone } from "lucide-react";

function normalizeNumber(raw) {
  if (!raw) return "";
  let n = String(raw).trim().replace(/[^\d+]/g, "");
  if (/^0\d+/.test(n)) n = "234" + n.slice(1); // example: Nigerian local -> 234...
  n = n.replace(/^\++/, "+");
  if (!n.startsWith("+")) n = "+" + n;
  return n;
}

export default function SmartCallButton({ number = "08100515622" }) {
  const [copied, setCopied] = useState(false);
  const [lastAction, setLastAction] = useState("");

  const phone = normalizeNumber(number); // +2348100515622

  const tryOpenTel = (uri) => {
    // Attempt to open a URI by assigning location or opening a window
    try {
      // If called from click handler, this should be allowed by the browser as a user gesture
      window.location.href = uri;
      return true;
    } catch (err) {
      try {
        window.open(uri);
        return true;
      } catch (e) {
        return false;
      }
    }
  };

  const handleCall = async (e) => {
    e && e.preventDefault();
    setLastAction("attempting");

    // 1) try tel: (normal)
    const tel = `tel:${phone}`;
    tryOpenTel(tel);

    // small delay allows the native handler to run in some browsers; but don't block UX
    // 2) Android intent fallback
    if (/Android/i.test(navigator.userAgent)) {
      const intent = `intent:${tel}#Intent;action=android.intent.action.DIAL;end`;
      tryOpenTel(intent);
      setLastAction("intent");
      // still may not prefill in some dialers
    }

    // 3) iOS legacy fallback (some devices responded better historically)
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      const telprompt = `telprompt:${phone}`;
      tryOpenTel(telprompt);
      setLastAction("telprompt");
    }

    // 4) Wait a tick and then check visibility / fallback to copying if nothing obvious happened.
    // We can't reliably detect "did the dialer open", so we present a safe fallback: copy number.
    // Copy to clipboard and show user a message
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setLastAction("copied");
      // Offer instructions — user can tap shown tel: link in UI
    } catch (err) {
      // Clipboard may be blocked in some contexts — show fallback UI anyway
      setCopied(false);
      setLastAction("show-copy-manual");
    }
  };

  return (
    <div className="flex flex-col gap-2 items-start">
      <button
        onClick={handleCall}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md"
        aria-label={`Call ${phone}`}
      >
        <Phone size={16} /> Call
      </button>

      {/* Visible fallback UI */}
      <div className="text-sm text-gray-700">
        <div>Number: <strong>{phone}</strong></div>

        {/* Clicking this link still uses tel: and might work as a final tap target */}
        <div className="mt-2">
          <a href={`tel:${phone}`} className="underline">
            Tap here to call
          </a>
        </div>

        {copied && (
          <div className="mt-2 text-green-600">
            Number copied to clipboard — paste it in your dialer or tap the "Tap here to call" link above.
          </div>
        )}

        {!copied && lastAction === "show-copy-manual" && (
          <div className="mt-2 text-yellow-600">
            Unable to copy automatically. Please long-press the number and copy it manually.
          </div>
        )}
      </div>
    </div>
  );
}
