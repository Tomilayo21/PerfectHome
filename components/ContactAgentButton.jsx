"use client";

import { useState } from "react";
import { ArrowRight, Phone, MessageSquare } from "lucide-react";

export default function ContactAgentButton({ property, agentNumber }) {
  const [open, setOpen] = useState(false);

  // Fallbacks if property info is missing
  const propertyTitle = property?.title || "the property";
  const propertyAddress = property?.address
    ? `${property.address}, ${property.city}, ${property.state}, ${property.country}`
    : "the listed address";

  // Function to convert local Nigerian numbers to international format
  const formatNumberForWhatsApp = (number) => {
    if (!number) return "";
    let num = number.trim();
    if (num.startsWith("0")) {
      num = "234" + num.slice(1); // Replace leading 0 with country code
    } else if (num.startsWith("+")) {
      num = num.slice(1); // Remove any + if accidentally included
    }
    return num;
  };

  const formattedNumber = formatNumberForWhatsApp(agentNumber);

  // Professional preloaded message
  const message = encodeURIComponent(
    `Hello, I'm reaching out regarding your listed property *${propertyTitle}* located at ${propertyAddress}. Is it still available? I would love to get more details and possibly schedule an inspection. Thank you!`
  );

  const whatsappLink = `https://wa.me/${formattedNumber}?text=${message}`;
  const callLink = `tel:${formattedNumber}`;
  const smsLink = `sms:${formattedNumber}?body=${message}`;

  return (
    <div className="flex gap-2">
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
