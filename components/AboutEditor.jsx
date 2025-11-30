"use client";

import { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Dialog } from "@headlessui/react";
import { GripVertical, PlusCircle } from "lucide-react";
import TiptapEditor from "./TiptapEditor";
import QuillEditor from "./QuillEditor";


export default function AboutEditor() {
  const [entries, setEntries] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const [selectedEntry, setSelectedEntry] = useState({
    heading: "",
    subheading: "",
    section: "",
    description: "",
    image: [],
  });
  const handleClose = () => {
    setModalOpen(false);
    setSelectedEntry({
      heading: "",
      subheading: "",
      section: "",
      description: "",
      image: [],
    });
  };
  
  

  useEffect(() => {
    fetch("/api/about")
      .then((res) => res.json())
      .then(setEntries);
  }, []);

  const openEditor = (entry) => {
    setSelectedEntry(entry || {
      heading: "",
      subheading: "",
      section: "",
      description: "",
      image: [],
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    const method = selectedEntry._id ? "PUT" : "POST";
    const url = selectedEntry._id
      ? `/api/about/${selectedEntry._id}`
      : "/api/about";

    const { heading, section, description, subheading, image } = selectedEntry;

    if (!heading || !description || !subheading) {
      return;
    }

    setSaveState("saving");

    const formData = new FormData();
    formData.append("heading", heading);
    formData.append("subheading", subheading);
    formData.append("section", section);
    formData.append("description", description);

    image.forEach((img) => {
      if (img instanceof File) {
        formData.append("images", img);
      }
    });

    const existingUrls = image.filter((img) => typeof img === "string");
    formData.append("existingImages", JSON.stringify(existingUrls));

    const res = await fetch(url, {
      method,
      body: formData,
    });

    if (!res.ok) {
      setSaveState("idle");
      return;
    }

    const refreshed = await fetch("/api/about").then((res) => res.json());
    setEntries(refreshed);
    setModalOpen(false);
    setSaveState("saved");

    setTimeout(() => setSaveState("idle"), 2000);
  };

  const handleDelete = async (id) => {
    await fetch(`/api/about/${id}`, { method: "DELETE" });
    const refreshed = await fetch("/api/about").then((res) => res.json());
    setEntries(refreshed);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeEntry = entries.find((e) => e._id === active.id);
    const section = activeEntry.section;

    const sectionItems = entries.filter((e) => e.section === section);
    const oldIndex = sectionItems.findIndex((e) => e._id === active.id);
    const newIndex = sectionItems.findIndex((e) => e._id === over.id);

    const reorderedSection = arrayMove(sectionItems, oldIndex, newIndex);
    const otherEntries = entries.filter((e) => e.section !== section);
    const updated = [...otherEntries, ...reorderedSection];

    setEntries(updated);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    setSaved(false);

    const payload = entries.map((entry, index) => ({
      _id: entry._id,
      position: index,
    }));

    const res = await fetch("/api/about", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    setSaved(true);

    setTimeout(() => setSaved(false), 2000);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedEntry((prev) => ({
      ...prev,
      image: [...prev.image, ...files],
    }));
  };

  const grouped = entries.reduce((acc, item) => {
    acc[item.section] = acc[item.section] || [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage "About Us"</h2>
        <button
          onClick={() => openEditor(null)}
          className="flex items-center gap-1 text-sm text-blue-600"
        >
          <PlusCircle className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section}>
            <h3 className="text-lg font-medium">{section}</h3>
            <SortableContext
              items={items.map((i) => i._id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map((entry) => (
                <SortableItem
                  key={entry._id}
                  entry={entry}
                  onEdit={() => openEditor(entry)}
                  onDelete={() => handleDelete(entry._id)}
                />
              ))}
            </SortableContext>
          </div>
        ))}
      </DndContext>

      <div className="flex justify-end">
        <button
          onClick={handleSaveOrder}
          disabled={isSaving}
          className={`flex items-center gap-2 px-4 py-2 rounded text-white transition-colors duration-200 ${
            isSaving
              ? "bg-green-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isSaving ? "Saving..." : saved ? "Saved" : "Save Order"}
        </button>
      </div>

      <Dialog open={modalOpen} onClose={handleClose} className="relative z-50">
        {/* Dark overlay */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Scrollable container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="bg-white p-6 w-full max-w-md rounded space-y-4 relative max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 transition"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Title */}
              <Dialog.Title className="text-lg font-medium">Edit Entry</Dialog.Title>

              {/* Form Inputs */}
              <input
                type="text"
                placeholder="Heading"
                value={selectedEntry?.heading || ""}
                onChange={(e) => setSelectedEntry({ ...selectedEntry, heading: e.target.value })}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                placeholder="Subheading"
                value={selectedEntry?.subheading || ""}
                onChange={(e) => setSelectedEntry({ ...selectedEntry, subheading: e.target.value })}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                placeholder="Section (e.g. Team)"
                value={selectedEntry?.section || ""}
                onChange={(e) => setSelectedEntry({ ...selectedEntry, section: e.target.value })}
                className="w-full border p-2 rounded"
              />

              {/* Tiptap Editor */}
              {/* <TiptapEditor
                description={selectedEntry?.description || ""}
                setDescription={(value) =>
                  setSelectedEntry((prev) => ({ ...prev, description: value }))
                }
                placeholder="Description"
              /> */}
              <QuillEditor
                  description={selectedEntry?.description || ""}
                  setDescription={(value) =>
                    setSelectedEntry((prev) => ({ ...prev, description: value }))
                  }
                  placeholder="Description"
                />


              {/* Images */}
              <div>
                <input type="file" multiple onChange={handleImageChange} />
                {selectedEntry?.image?.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {selectedEntry.image.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={typeof img === "string" ? img : URL.createObjectURL(img)}
                          alt={`preview-${index}`}
                          className="w-32 h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = selectedEntry.image.filter((_, i) => i !== index);
                            setSelectedEntry({ ...selectedEntry, image: updated });
                          }}
                          className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saveState === "saving"}
                className={`w-full py-2 rounded text-white transition-colors duration-200 ${
                  saveState === "saving"
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-blue-700"
                }`}
              >
                {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Save"}
              </button>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>


    </div>
  );
}

function SortableItem({ entry, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: entry._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex justify-between items-center border p-2 rounded bg-white my-1"
    >
      <div className="flex items-center gap-3 cursor-move" {...attributes} {...listeners}>
        <GripVertical className="w-4 h-4 text-gray-500" />
        <div>
          <p className="font-medium">{entry.heading}</p>
          {/* <p className="text-sm text-gray-500">
            {entry.description
              ? entry.description.replace(/<[^>]+>/g, "").slice(0, 80) + "..."
              : ""}
          </p> */}
          <div
          className="text-sm text-gray-700 prose max-w-none line-clamp-3"
          dangerouslySetInnerHTML={{
            __html: entry.description || "",
          }}
        ></div>

          {/* <div className="text-xs text-gray-400">
            {entry.image[0]}
          </div> */}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="text-blue-600 text-sm">Edit</button>
        <button onClick={onDelete} className="text-red-600 text-sm">Delete</button>
      </div>
    </div>
  );

}



























// "use client";

// import { useEffect, useState } from "react";
// import { DndContext, closestCenter } from "@dnd-kit/core";
// import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Dialog } from "@headlessui/react";
// import { GripVertical, PlusCircle } from "lucide-react";
// import QuillEditor from "./QuillEditor";

// export default function AboutEditor() {
//   const [entries, setEntries] = useState([]);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedEntry, setSelectedEntry] = useState({ heading: "", subheading: "", section: "", description: "", image: [] });
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//     fetch("/api/about").then((res) => res.json()).then(setEntries);
//   }, []);

//   const openEditor = (entry) => {
//     setSelectedEntry(entry || { heading: "", subheading: "", section: "", description: "", image: [] });
//     setModalOpen(true);
//   };

//   const handleSave = async () => {
//     if (!selectedEntry.heading || !selectedEntry.description || !selectedEntry.subheading) return;
//     const method = selectedEntry._id ? "PUT" : "POST";
//     const url = selectedEntry._id ? `/api/about/${selectedEntry._id}` : "/api/about";

//     const formData = new FormData();
//     formData.append("heading", selectedEntry.heading);
//     formData.append("subheading", selectedEntry.subheading);
//     formData.append("section", selectedEntry.section);
//     formData.append("description", selectedEntry.description);
//     selectedEntry.image.forEach((img) => { if (img instanceof File) formData.append("images", img); });
//     formData.append("existingImages", JSON.stringify(selectedEntry.image.filter((i) => typeof i === "string")));

//     await fetch(url, { method, body: formData });
//     const refreshed = await fetch("/api/about").then((res) => res.json());
//     setEntries(refreshed);
//     setModalOpen(false);
//   };

//   const handleDelete = async (id) => {
//     await fetch(`/api/about/${id}`, { method: "DELETE" });
//     const refreshed = await fetch("/api/about").then((res) => res.json());
//     setEntries(refreshed);
//   };

//   const handleDragEnd = (event) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;
//     const activeEntry = entries.find((e) => e._id === active.id);
//     const sectionItems = entries.filter((e) => e.section === activeEntry.section);
//     const oldIndex = sectionItems.findIndex((e) => e._id === active.id);
//     const newIndex = sectionItems.findIndex((e) => e._id === over.id);
//     const reordered = arrayMove(sectionItems, oldIndex, newIndex);
//     const others = entries.filter((e) => e.section !== activeEntry.section);
//     setEntries([...others, ...reordered]);
//   };

//   const grouped = entries.reduce((acc, item) => { acc[item.section] = acc[item.section] || []; acc[item.section].push(item); return acc; }, {});

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-semibold">Manage "About Us"</h2>
//         <button onClick={() => openEditor(null)} className="flex items-center gap-1 text-sm text-blue-600">
//           <PlusCircle className="w-4 h-4" /> Add Entry
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         {Object.entries(grouped).map(([section, items]) => (
//           <div key={section}>
//             <h3 className="text-lg font-medium">{section}</h3>
//             <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
//               {items.map((entry) => (
//                 <SortableItem key={entry._id} entry={entry} onEdit={() => openEditor(entry)} onDelete={() => handleDelete(entry._id)} />
//               ))}
//             </SortableContext>
//           </div>
//         ))}
//       </DndContext>

//       {mounted && modalOpen && (
//         <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-50">
//           <div className="fixed inset-0 bg-black/30" />
//           <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
//             <Dialog.Panel className="bg-white p-6 w-full max-w-md rounded max-h-[90vh] overflow-y-auto space-y-4 relative">
//               <button onClick={() => setModalOpen(false)} className="absolute top-3 right-3 text-gray-500">✕</button>
//               <Dialog.Title className="text-lg font-medium">Edit Entry</Dialog.Title>

//               <input type="text" placeholder="Heading" value={selectedEntry.heading} onChange={(e) => setSelectedEntry({ ...selectedEntry, heading: e.target.value })} className="w-full border p-2 rounded" />
//               <input type="text" placeholder="Subheading" value={selectedEntry.subheading} onChange={(e) => setSelectedEntry({ ...selectedEntry, subheading: e.target.value })} className="w-full border p-2 rounded" />
//               <input type="text" placeholder="Section" value={selectedEntry.section} onChange={(e) => setSelectedEntry({ ...selectedEntry, section: e.target.value })} className="w-full border p-2 rounded" />

//               <QuillEditor description={selectedEntry.description} setDescription={(value) => setSelectedEntry({ ...selectedEntry, description: value })} />

//               <button onClick={handleSave} className="w-full py-2 rounded bg-blue-600 text-white">Save</button>
//             </Dialog.Panel>
//           </div>
//         </Dialog>
//       )}
//     </div>
//   );
// }

// function SortableItem({ entry, onEdit, onDelete }) {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: entry._id });
//   const style = { transform: CSS.Transform.toString(transform), transition };
//   return (
//     <div ref={setNodeRef} style={style} className="flex justify-between items-center border p-2 rounded bg-white my-1">
//       <div className="flex items-center gap-3 cursor-move" {...attributes} {...listeners}>
//         <GripVertical className="w-4 h-4 text-gray-500" />
//         <div>
//           <p className="font-medium">{entry.heading}</p>
//           <div className="text-sm text-gray-700 prose max-w-none line-clamp-3" dangerouslySetInnerHTML={{ __html: entry.description }} />
//         </div>
//       </div>
//       <div className="flex gap-2">
//         <button onClick={onEdit} className="text-blue-600 text-sm">Edit</button>
//         <button onClick={onDelete} className="text-red-600 text-sm">Delete</button>
//       </div>
//     </div>
//   );
// }









































































// "use client";

// import { useEffect, useState } from "react";
// import { DndContext, closestCenter } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   useSortable,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";
// import { Dialog } from "@headlessui/react";
// import { GripVertical, PlusCircle } from "lucide-react";
// import dynamic from "next/dynamic";

// // Dynamically import QuillEditor to avoid SSR issues
// const QuillEditor = dynamic(() => import("./QuillEditor"), { ssr: false });

// export default function AboutEditor() {
//   const [entries, setEntries] = useState([]);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedEntry, setSelectedEntry] = useState({
//     heading: "",
//     subheading: "",
//     section: "",
//     description: "",
//     image: [],
//   });
//   const [saveState, setSaveState] = useState("idle");

//   // Fetch entries on mount
//   useEffect(() => {
//     fetch("/api/about")
//       .then((res) => res.json())
//       .then(setEntries);
//   }, []);

//   const openEditor = (entry) => {
//     setSelectedEntry(
//       entry || { heading: "", subheading: "", section: "", description: "", image: [] }
//     );
//     setModalOpen(true);
//   };

//   const handleSave = async () => {
//     if (!selectedEntry.heading || !selectedEntry.description || !selectedEntry.subheading)
//       return;

//     setSaveState("saving");

//     const method = selectedEntry._id ? "PUT" : "POST";
//     const url = selectedEntry._id ? `/api/about/${selectedEntry._id}` : "/api/about";

//     const formData = new FormData();
//     formData.append("heading", selectedEntry.heading);
//     formData.append("subheading", selectedEntry.subheading);
//     formData.append("section", selectedEntry.section);
//     formData.append("description", selectedEntry.description);

//     selectedEntry.image.forEach((img) => {
//       if (img instanceof File) formData.append("images", img);
//     });

//     const existingUrls = selectedEntry.image.filter((img) => typeof img === "string");
//     formData.append("existingImages", JSON.stringify(existingUrls));

//     const res = await fetch(url, { method, body: formData });
//     if (!res.ok) {
//       setSaveState("idle");
//       return;
//     }

//     const refreshed = await fetch("/api/about").then((res) => res.json());
//     setEntries(refreshed);
//     setModalOpen(false);
//     setSaveState("saved");
//     setTimeout(() => setSaveState("idle"), 2000);
//   };

//   const handleDelete = async (id) => {
//     await fetch(`/api/about/${id}`, { method: "DELETE" });
//     const refreshed = await fetch("/api/about").then((res) => res.json());
//     setEntries(refreshed);
//   };

//   const handleDragEnd = (event) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;

//     const activeEntry = entries.find((e) => e._id === active.id);
//     const section = activeEntry.section;
//     const sectionItems = entries.filter((e) => e.section === section);
//     const oldIndex = sectionItems.findIndex((e) => e._id === active.id);
//     const newIndex = sectionItems.findIndex((e) => e._id === over.id);

//     const reorderedSection = arrayMove(sectionItems, oldIndex, newIndex);
//     const otherEntries = entries.filter((e) => e.section !== section);
//     setEntries([...otherEntries, ...reorderedSection]);
//   };

//   const grouped = entries.reduce((acc, item) => {
//     acc[item.section] = acc[item.section] || [];
//     acc[item.section].push(item);
//     return acc;
//   }, {});

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     setSelectedEntry((prev) => ({ ...prev, image: [...prev.image, ...files] }));
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-xl font-semibold">Manage "About Us"</h2>
//         <button onClick={() => openEditor(null)} className="flex items-center gap-1 text-sm text-blue-600">
//           <PlusCircle className="w-4 h-4" /> Add Entry
//         </button>
//       </div>

//       <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//         {Object.entries(grouped).map(([section, items]) => (
//           <div key={section}>
//             <h3 className="text-lg font-medium">{section}</h3>
//             <SortableContext items={items.map((i) => i._id)} strategy={verticalListSortingStrategy}>
//               {items.map((entry) => (
//                 <SortableItem
//                   key={entry._id}
//                   entry={entry}
//                   onEdit={() => openEditor(entry)}
//                   onDelete={() => handleDelete(entry._id)}
//                 />
//               ))}
//             </SortableContext>
//           </div>
//         ))}
//       </DndContext>

//       <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-50">
//         <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
//         <div className="fixed inset-0 overflow-y-auto">
//           <div className="flex min-h-full items-center justify-center p-4">
//             <Dialog.Panel className="bg-white p-6 w-full max-w-md rounded space-y-4 relative max-h-[90vh] overflow-y-auto">
//               <button
//                 onClick={() => setModalOpen(false)}
//                 className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
//               >
//                 ✕
//               </button>

//               <Dialog.Title className="text-lg font-medium">Edit Entry</Dialog.Title>

//               <input
//                 type="text"
//                 placeholder="Heading"
//                 value={selectedEntry.heading}
//                 onChange={(e) => setSelectedEntry({ ...selectedEntry, heading: e.target.value })}
//                 className="w-full border p-2 rounded"
//               />
//               <input
//                 type="text"
//                 placeholder="Subheading"
//                 value={selectedEntry.subheading}
//                 onChange={(e) => setSelectedEntry({ ...selectedEntry, subheading: e.target.value })}
//                 className="w-full border p-2 rounded"
//               />
//               <input
//                 type="text"
//                 placeholder="Section"
//                 value={selectedEntry.section}
//                 onChange={(e) => setSelectedEntry({ ...selectedEntry, section: e.target.value })}
//                 className="w-full border p-2 rounded"
//               />

//               <QuillEditor
//                 description={selectedEntry.description}
//                 setDescription={(value) => setSelectedEntry({ ...selectedEntry, description: value })}
//                 placeholder="Description"
//               />

//               <div>
//                 <input type="file" multiple onChange={handleImageChange} />
//                 <div className="flex gap-2 flex-wrap mt-2">
//                   {selectedEntry.image.map((img, i) => (
//                     <div key={i} className="relative">
//                       <img
//                         src={typeof img === "string" ? img : URL.createObjectURL(img)}
//                         alt={`preview-${i}`}
//                         className="w-32 h-32 object-cover rounded"
//                       />
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setSelectedEntry({ ...selectedEntry, image: selectedEntry.image.filter((_, idx) => idx !== i) })
//                         }
//                         className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <button
//                 onClick={handleSave}
//                 disabled={saveState === "saving"}
//                 className={`w-full py-2 rounded text-white transition-colors duration-200 ${
//                   saveState === "saving" ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
//                 }`}
//               >
//                 {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Save"}
//               </button>
//             </Dialog.Panel>
//           </div>
//         </div>
//       </Dialog>
//     </div>
//   );
// }

// // SortableItem Component
// function SortableItem({ entry, onEdit, onDelete }) {
//   const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: entry._id });
//   const style = { transform: CSS.Transform.toString(transform), transition };

//   return (
//     <div ref={setNodeRef} style={style} className="flex justify-between items-center border p-2 rounded bg-white my-1">
//       <div className="flex items-center gap-3 cursor-move" {...attributes} {...listeners}>
//         <GripVertical className="w-4 h-4 text-gray-500" />
//         <div>
//           <p className="font-medium">{entry.heading}</p>
//           <div
//             className="text-sm text-gray-700 prose max-w-none line-clamp-3"
//             dangerouslySetInnerHTML={{ __html: entry.description }}
//           />
//         </div>
//       </div>
//       <div className="flex gap-2">
//         <button onClick={onEdit} className="text-blue-600 text-sm">Edit</button>
//         <button onClick={onDelete} className="text-red-600 text-sm">Delete</button>
//       </div>
//     </div>
//   );
// }
