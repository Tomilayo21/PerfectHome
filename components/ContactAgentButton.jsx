"use client";

import { ArrowRight, Phone, MessageSquare } from "lucide-react";

export default function ContactAgentButton({ property }) {
  // Fallbacks if property info is missing
  const propertyTitle = property?.title || "the property";
  const propertyAddress = property?.address
    ? `${property.address}, ${property.city}, ${property.state}, ${property.country}`
    : "the listed address";

  // Agent's fixed number
  const agentNumber = "08100515622";

  // Convert to international format for WhatsApp & tel
  const formattedNumber = agentNumber.startsWith("0")
    ? "234" + agentNumber.slice(1)
    : agentNumber.startsWith("+")
    ? agentNumber.slice(1)
    : agentNumber;

  // Preloaded professional message
  const messageText = `Hello, I'm reaching out regarding your listed property *${propertyTitle}* located at ${propertyAddress}. Is it still available? I would love to get more details and possibly schedule a viewing. Thank you!`;

  const encodedMessage = encodeURIComponent(messageText);

  // WhatsApp: mobile vs desktop
  const isMobile = typeof navigator !== "undefined" && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const whatsappLink = isMobile
    ? `https://wa.me/${formattedNumber}?text=${encodedMessage}`
    : `https://web.whatsapp.com/send?phone=${formattedNumber}&text=${encodedMessage}`;

  const callLink = `tel:${formattedNumber}`;
  const smsLink = `sms:${formattedNumber}?body=${encodedMessage}`;

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
      <a
        href={callLink}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600 transition"
      >
        Call <Phone size={16} />
      </a>

      {/* SMS */}
      <a
        href={smsLink}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md shadow hover:bg-gray-900 transition"
      >
        Message <MessageSquare size={16} />
      </a>
    </div>
  );
}
