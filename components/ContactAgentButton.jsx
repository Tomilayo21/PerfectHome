// "use client";

// import { ArrowRight, Phone, MessageSquare } from "lucide-react";

// export default function ContactAgentButton({ property }) {
//   // Fallbacks if property info is missing
//   const propertyTitle = property?.title || "the property";
//   const propertyAddress = property?.address
//     ? `${property.address}, ${property.city}, ${property.state}, ${property.country}`
//     : "the listed address";

//   // Agent's fixed number
//   const agentNumber = "08100515622";

//   // Convert to international format for WhatsApp & tel
//   const formattedNumber = agentNumber.startsWith("0")
//     ? "234" + agentNumber.slice(1)
//     : agentNumber.startsWith("+")
//     ? agentNumber.slice(1)
//     : agentNumber;

//   // Preloaded professional message
//   const messageText = `Hello, I'm reaching out regarding your listed property *${propertyTitle}* located at ${propertyAddress}. Is it still available? I would love to get more details and possibly schedule an inspection. Thank you!`;

//   const encodedMessage = encodeURIComponent(messageText);

//   // WhatsApp: mobile vs desktop
//   const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

//   const whatsappLink = isMobile
//     ? `https://wa.me/${formattedNumber}?text=${encodedMessage}`
//     : `https://web.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;

//   const callLink = `tel:+${formattedNumber}`;
//   const smsLink = `sms:+${formattedNumber}?body=${encodedMessage}`;


//   return (
//     <div className="flex gap-2 flex-wrap">
//       {/* WhatsApp */}
//       <a
//         href={whatsappLink}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition"
//       >
//         WhatsApp <ArrowRight size={16} />
//       </a>

//       {/* Call */}
//       <a
//         href={callLink}
//         className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition"
//       >
//         Call <Phone size={16} />
//       </a>

//       {/* SMS */}
//       <a
//         href={smsLink}
//         className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md shadow hover:bg-gray-900 transition"
//       >
//         Message <MessageSquare size={16} />
//       </a>
//     </div>
//   );
// }
























"use client";

import React from "react";
import { ArrowRight, Phone, MessageSquare } from "lucide-react";

export default function ContactAgentButton({ property }) {
  const propertyTitle = property?.title || "the property";
  const propertyAddress = property?.address
    ? `${property.address}, ${property.city || ""}, ${property.state || ""}, ${property.country || ""}`.replace(/\s+,/g, ",")
    : "the listed address";

  const agentNumberRaw = "08100515622"; // source number

  // Helper: strip anything except digits and plus
  const normalizeNumber = (raw) => {
    if (!raw) return "";
    // remove spaces, parentheses, dashes, etc.
    let n = String(raw).trim().replace(/[^\d+]/g, "");
    // if it starts with a single 0 (local Nigerian), convert to international without leading 0
    if (/^0\d+/.test(n)) {
      n = "234" + n.slice(1);
    }
    // ensure it doesn't contain multiple pluses
    n = n.replace(/^\++/, "+");
    // finally ensure we have leading +
    if (!n.startsWith("+")) n = "+" + n;
    return n;
  };

  const agentNumber = normalizeNumber(agentNumberRaw); // e.g. +2348100515622

  const messageText = `Hello, I'm reaching out regarding your listed property ${propertyTitle} located at ${propertyAddress}. Is it still available? I would love to get more details and possibly schedule an inspection. Thank you!`;
  const encodedMessage = encodeURIComponent(messageText);

  // Links
  const whatsappLink = (typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    ? `https://wa.me/${agentNumber.replace(/^\+/, "")}?text=${encodedMessage}`
    : `https://web.whatsapp.com/send?phone=${agentNumber.replace(/^\+/, "")}&text=${encodedMessage}`;

  const callHref = `tel:${agentNumber}`;
  const smsHref = `sms:${agentNumber}?body=${encodedMessage}`;

  // onClick fallback tries to force the dialer if the anchor behavior is inconsistent
  const handleCallClick = (e) => {
    // let the anchor try first; we still provide JS fallback
    try {
      // Fallback: attempt to open tel: via location assign (some browsers handle this differently)
      window.location.href = callHref;
      // On Android webview cases where tel: doesn't prefill, try intent: (safe to attempt only on Android)
      if (/Android/i.test(navigator.userAgent)) {
        // Android intent example — action=DIAL ensures it opens dialer with number prefilled
        // Note: some browsers may ignore intent: URLs; it's a last-resort fallback.
        const intentUri = `intent:${callHref}#Intent;action=android.intent.action.DIAL;end`;
        window.location.href = intentUri;
      }
    } catch (err) {
      // swallow — browser will normally handle tel: automatically
      console.warn("Call fallback error:", err);
    }
  };

  return (
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

      {/* Call */}
      {/* Use both href and onClick fallback */}
      <a
        href={callHref}
        onClick={(e) => {
          // allow normal anchor navigation but also fire fallback to be safe
          // We *do not* call e.preventDefault() so the anchor still does its job.
          handleCallClick(e);
        }}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition"
        role="button"
        aria-label={`Call agent at ${agentNumber}`}
      >
        Call <Phone size={16} />
      </a>

      {/* SMS */}
      <a
        href={smsHref}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md shadow hover:bg-gray-900 transition"
      >
        Message <MessageSquare size={16} />
      </a>
    </div>
  );
}
