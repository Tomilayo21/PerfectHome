// components/LayoutStyleSelector.jsx
"use client";

import { useAppContext } from "@/context/AppContext";
import { useState } from "react";

export default function LayoutStyleSelector() {
  const {
    layoutStyle,
    currentLayout,
    setPreviewLayoutStyle,
    saveLayoutStyle,
    cancelPreview,
  } = useAppContext();

  const [localStyle, setLocalStyle] = useState(currentLayout);

  const handlePreview = (value) => {
    setLocalStyle(value);
    setPreviewLayoutStyle(value);
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">Layout Style</label>
      <select
        value={localStyle}
        onChange={(e) => handlePreview(e.target.value)}
        className="w-full border p-2 rounded dark:bg-black"
      >
        <option value="default">Default</option>
        <option value="compact">Compact</option>
        <option value="spacious">Spacious</option>
      </select>

      {localStyle !== currentLayout && (
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => saveLayoutStyle(localStyle)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded"
          >
            Save
          </button>
          <button
            onClick={cancelPreview}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
