// "use client";

// import React from "react";
// import ReactQuill from "react-quill-new";
// import "react-quill-new/dist/quill.snow.css";
// import "react-quill-new/dist/quill.bubble.css";
// import sanitizeHtml from "sanitize-html";

// // Toolbar setup
// const modules = {
//   toolbar: [
//     [{ header: [2, 3, false] }], // H2, H3
//     ["bold", "italic", "underline"],
//     [{ list: "ordered" }, { list: "bullet" }],
//     ["link"],
//     ["clean"], // clear formatting
//   ],
// };

// const formats = [
//   "header",
//   "bold",
//   "italic",
//   "underline",
//   "list",
//   "bullet",
//   "link",
// ];

// /** 🔧 Helper to clean Quill's messy HTML */
// function cleanQuillHTML(html) {
//   if (!html) return "";

//   // Remove Quill's list markers & spans
//   let cleaned = html
//     .replace(/<span class="ql-ui"[^>]*><\/span>/g, "")
//     .replace(/data-list="[^"]*"/g, "");

//   // Flatten <li><p>text</p></li> to <li>text</li>
//   cleaned = cleaned.replace(/<li>\s*<p>/g, "<li>").replace(/<\/p>\s*<\/li>/g, "</li>");

//   // Sanitize it
//   return DOMPurify.sanitize(cleaned, {
//     ALLOWED_TAGS: [
//       "p", "br", "ul", "ol", "li",
//       "strong", "em", "u", "h1", "h2", "h3",
//       "a", "b", "i", "u",
//     ],
//     ALLOWED_ATTR: ["href"],
//   });
// }

// export default function QuillEditor({ description, setDescription }) {
//   const handleChange = (html) => {
//     const cleaned = cleanQuillHTML(html);
//     setDescription(cleaned);
//   };

//   return (
//     <div className="flex flex-col">
//       <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
//         Description
//       </label>

//       <div className="border border-gray-300 rounded-md bg-white dark:bg-gray-900 dark:border-gray-700 overflow-hidden">
//         <ReactQuill
//           theme="snow"
//           value={description || ""}
//           onChange={handleChange}
//           modules={modules}
//           formats={formats}
//           placeholder="Type your content here..."
//           className="min-h-[150px] max-h-[400px] overflow-y-auto"
//         />
//       </div>
//     </div>
//   );
// }





































// "use client";

// import React, { useState, useEffect } from "react";
// import dynamic from "next/dynamic";
// import sanitizeHtml from "sanitize-html";
// import "react-quill-new/dist/quill.snow.css";

// // dynamically import ReactQuill for client-side only
// const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// const modules = {
//   toolbar: [
//     [{ header: [2, 3, false] }], // H2, H3
//     ["bold", "italic", "underline"],
//     [{ list: "ordered" }, { list: "bullet" }],
//     ["link"],
//     ["clean"],
//   ],
// };

// const formats = ["header", "bold", "italic", "underline", "list", "bullet", "link"];

// function cleanQuillHTML(html) {
//   if (!html) return "";

//   // Remove Quill's span wrappers and data attributes
//   let cleaned = html
//     .replace(/<span class="ql-ui"[^>]*><\/span>/g, "")
//     .replace(/data-list="[^"]*"/g, "");

//   // Flatten <li><p>text</p></li> to <li>text</li>
//   cleaned = cleaned.replace(/<li>\s*<p>/g, "<li>").replace(/<\/p>\s*<\/li>/g, "</li>");

//   // Sanitize using sanitize-html
//   return sanitizeHtml(cleaned, {
//     allowedTags: ["p", "br", "ul", "ol", "li", "strong", "em", "u", "h1", "h2", "h3", "a"],
//     allowedAttributes: {
//       a: ["href"],
//     },
//   });
// }

// export default function QuillEditor({ description, setDescription }) {
//   const [mounted, setMounted] = useState(false);

//   // Only render editor on client
//   useEffect(() => setMounted(true), []);
//   if (!mounted) return null;

//   const handleChange = (html) => {
//     const cleaned = cleanQuillHTML(html);
//     setDescription(cleaned);
//   };

//   return (
//     <div className="flex flex-col">
//       <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
//         Description
//       </label>
//       <div className="border border-gray-300 rounded-md bg-white dark:bg-gray-900 dark:border-gray-700 overflow-hidden">
//         <ReactQuill
//           theme="snow"
//           value={description || ""}
//           onChange={handleChange}
//           modules={modules}
//           formats={formats}
//           placeholder="Type your content here..."
//           className="min-h-[150px] max-h-[400px] overflow-y-auto"
//         />
//       </div>
//     </div>
//   );
// }














































// "use client";

// import { useEffect, useState } from "react";
// import dynamic from "next/dynamic";
// import "react-quill-new/dist/quill.snow.css";

// // Dynamically import to avoid SSR issues
// const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

// export default function QuillEditor({ description, setDescription, placeholder }) {
//   const [value, setValue] = useState(description || "");

//   useEffect(() => {
//     setValue(description || "");
//   }, [description]);

//   const modules = {
//     toolbar: [
//       [{ header: [2, 3, false] }],
//       ["bold", "italic", "underline"],
//       [{ list: "ordered" }, { list: "bullet" }],
//       ["clean"],
//     ],
//   };

//   const formats = [
//     "header",
//     "bold",
//     "italic",
//     "underline",
//     "list",
//     "bullet",
//   ];

//   const handleChange = (html) => {
//     setValue(html);
//     if (typeof setDescription === "function") {
//       setDescription(html);
//     }
//   };

//   return (
//     <div className="border border-gray-300 rounded overflow-hidden">
//       <ReactQuill
//         theme="snow"
//         value={value}
//         onChange={handleChange}
//         modules={modules}
//         formats={formats}
//         placeholder={placeholder || "Type your content here..."}
//         className="bg-white dark:bg-white dark:text-black text-black min-h-[150px] max-h-[400px] overflow-y-auto"
//       />
//     </div>
//   );
// }




















// "use client";

// import React, { useState, useEffect } from "react";
// import dynamic from "next/dynamic";
// import sanitizeHtml from "sanitize-html";
// import "react-quill/dist/quill.snow.css";

// const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// const modules = {
//   toolbar: [
//     [{ header: [2, 3, false] }],
//     ["bold", "italic", "underline"],
//     [{ list: "ordered" }, { list: "bullet" }],
//     ["link"],
//     ["clean"],
//   ],
// };

// const formats = ["header", "bold", "italic", "underline", "list", "bullet", "link"];

// export default function QuillEditor({ description, setDescription }) {
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => setMounted(true), []);

//   if (!mounted) return null;

//     const handleChange = (html) => {
//     if (!html) return setDescription("");
//     const cleaned = sanitizeHtml(html, {
//         allowedTags: ["p","br","ul","ol","li","strong","em","u","h1","h2","h3","a"],
//         allowedAttributes: {
//         a: ["href"]
//         }
//     });
//     setDescription(cleaned);
//     };

//   return (
//     <div className="flex flex-col">
//       <label className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
//         Description
//       </label>
//       <div className="border border-gray-300 rounded-md bg-white dark:bg-gray-900 dark:border-gray-700 overflow-hidden">
//         <ReactQuill
//           theme="snow"
//           value={description || ""}
//           onChange={handleChange}
//           modules={modules}
//           formats={formats}
//           placeholder="Type your content here..."
//           className="min-h-[150px] max-h-[400px] overflow-y-auto"
//         />
//       </div>
//     </div>
//   );
// }














































































"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

// Dynamically import to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

export default function QuillEditor({ description, setDescription, placeholder }) {
  const [value, setValue] = useState(description || "");

  useEffect(() => {
    setValue(description || "");
  }, [description]);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }], // ✅ works without Bullet import
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: handleImageUpload,
      },
    }

  };

  formats=[
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",    // <-- handles both ordered & bullet
  "link",
  "image",
];


  const handleChange = (html) => {
    setValue(html);
    if (typeof setDescription === "function") {
      setDescription(html);
    }
  };

  return (
    <div className="border border-gray-300 rounded overflow-hidden">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Type your content here..."}
        className="bg-white dark:bg-white dark:text-black text-black min-h-[150px] max-h-[400px] overflow-y-auto"
      />
    </div>
  );
}