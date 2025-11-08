

"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function PartnerEditor() {
  // Your existing states
  const { user, isLoaded } = useUser();
  const [partners , setPartners ] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // New states for modal
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  // Form state inside modal
  const [form, setForm] = useState({
    username: "",
    name: "",
    comment: "",
    images: [], // File[]
    existingImages: [], // string URLs
  });

  useEffect(() => {
    if (!isLoaded) return;

    const fetchPartners = async () => {
      try {
        const res = await fetch("/api/partners");
        if (!res.ok) throw new Error("Failed to fetch partners ");
        const data = await res.json();
        data.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        setPartners(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [isLoaded]);

  // ... your existing handlers (handleDragEnd, handleSaveOrder, toggleApprove)...
    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const approved = partners.filter((t) => t.approved);
        const oldIndex = approved.findIndex((t) => t._id === active.id);
        const newIndex = approved.findIndex((t) => t._id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        const newApproved = arrayMove(approved, oldIndex, newIndex);
        const unapproved = partners.filter((t) => !t.approved);
        setPartners([...newApproved, ...unapproved]);
    };

  const handleSaveOrder = async () => {
        setIsSaving(true);
        setSaved(false);

        const payload = partners
        .filter((t) => t.approved)
        .map((t, i) => ({ id: t._id, position: i }));

        try {
        const res = await fetch("/api/partners", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: payload }),
        });
        if (!res.ok) throw new Error("Failed to save order");
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        } catch (err) {
        console.error(err);
        alert("Failed to save order.");
        } finally {
        setIsSaving(false);
        }
    };

  const toggleApprove = async (id, approve) => {
    if (approve && approvedCount >= 5) {
      alert("You can only approve up to 5 testimonials.");
      return;
    }

    setPartners((prev) =>
      prev.map((t) => (t._id === id ? { ...t, approved: approve } : t))
    );

    try {
      const res = await fetch(`/api/partners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved: approve }), // we will handle this in PUT below
      });
      if (!res.ok) throw new Error("Failed to update approval");
    } catch (err) {
      console.error(err);
      alert("Failed to update approval on server. Reverting.");
      setPartners ((prev) =>
        prev.map((t) => (t._id === id ? { ...t, approved: !approve } : t))
      );
    }
  };

  // Open modal for Add or Edit
  const openModalForAdd = () => {
    setEditingPartner(null);
    setForm({ username: "", name: "", comment: "", images: [], existingImages: [] });
    setShowModal(true);
  };

  const openModalForEdit = (partner) => {
    setEditingPartner(partner);
    setForm({
      username: partner.username || "",
      name: partner.name || "",
      comment: partner.comment || "",
      images: [],
      existingImages: Array.isArray(partner.imageUrl) ? partner.imageUrl : partner.imageUrl ? [partner.imageUrl] : [],
    });
    setShowModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file input change
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setForm((prev) => ({ ...prev, images: files }));
  };

  // Remove existing image from array
  const removeExistingImage = (url) => {
    setForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((img) => img !== url),
    }));
  };

  // Submit handler (Add or Edit)
  const handleSubmit = async () => {
    if (!form.username || !form.name || !form.comment) {
      return alert("Username, name, and comment are required.");
    }

    const formData = new FormData();
    formData.append("username", form.username);
    formData.append("name", form.name);
    formData.append("comment", form.comment);

    form.existingImages.forEach((url) => {
      formData.append("existingImages", JSON.stringify(form.existingImages));
    });

    form.images.forEach((file) => {
      formData.append("images", file);
    });

    try {
      let res;
      if (editingPartner) {
        formData.append("id", editingPartner._id);
        res = await fetch("/api/partners", {
          method: "PUT",
          body: formData,
        });
      } else {
        res = await fetch("/api/partners", {
          method: "POST",
          body: formData,
        });
      }
      if (!res.ok) throw new Error("Failed to save partner");
      const savedPartner = await res.json();

      setPartners((prev) => {
        if (editingPartner) {
          return prev.map((p) => (p._id === savedPartner._id ? savedPartner : p));
        }
        return [...prev, savedPartner];
      });

      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save partner");
    }
  };

  // Delete handler ...
    const handleDelete = async (id) => {
        if (!confirm("Delete this partner?")) return;

        try {
        const res = await fetch("/api/partners", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error("Failed to delete partner");
        setPartners((prev) => prev.filter((t) => t._id !== id));
        } catch (err) {
        console.error(err);
        alert("Failed to delete partner");
        }
    };

  // Your existing render code, replace buttons to use modal instead of prompt:
  if (loading) return <div className="p-6">Loading partners...</div>;

  const approved = partners
    .filter((t) => t.approved)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const pending = partners.filter((t) => !t.approved);
  const approvedCount = approved.length;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-semibold">Partners</h2>

      <div className="flex items-center justify-between">
        <div>
          <strong>Approved:</strong> {approvedCount} / 5
        </div>
        <div>
          <button
            onClick={handleSaveOrder}
            disabled={isSaving}
            className={`px-3 py-1 rounded text-white transition-colors duration-200 ${
              isSaving
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSaving ? "Saving..." : saved ? "Saved" : "Save Approved Order"}
          </button>
        </div>
        <div>
          <button
            onClick={openModalForAdd}
            className="ml-4 px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            + Add Partner
          </button>
        </div>
      </div>

      {/* Partners list code unchanged, but pass onEdit={openModalForEdit} */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Approved (drag to reorder)</h3>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={approved.map((t) => t._id)}
              strategy={verticalListSortingStrategy}
            >
              {approved.map((partner) => (
                <SortablePartner
                  key={partner._id}
                  partner={partner}
                  onToggleApprove={toggleApprove}
                  onEdit={openModalForEdit}
                  onDelete={handleDelete}
                  isApprovedSection
                />
              ))}
            </SortableContext>
          </DndContext>

          {approved.length === 0 && (
            <p className="text-sm text-gray-500">No approved partners yet.</p>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Pending</h3>
          <div className="space-y-3">
            {pending.map((partner) => (
              <PartnerCard
                key={partner._id}
                partner={partner}
                onToggleApprove={toggleApprove}
                onEdit={openModalForEdit}
                onDelete={handleDelete}
                disableApprove={approvedCount >= 5}
              />
            ))}
            {pending.length === 0 && (
              <p className="text-sm text-gray-500">No pending partner.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white p-6 rounded max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4">
              {editingPartner ? "Edit Partner" : "Add Partner"}
            </h3>

            <label className="block mb-2">
              Username
              <input
                name="username"
                value={form.username}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </label>

            <label className="block mb-2">
              Name
              <input
                name="name"
                value={form.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </label>

            <label className="block mb-2">
              Comment
              <textarea
                name="comment"
                value={form.comment}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                rows={4}
              />
            </label>

            <label className="block mb-2">
              Images (you can upload multiple)
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>

            {/* Show existing images with remove button */}
            {form.existingImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {form.existingImages.map((url) => (
                  <div key={url} className="relative">
                    <img
                      src={url}
                      alt="Existing"
                      className="w-20 h-20 object-cover rounded"
                    />
                    <button
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full px-1"
                      type="button"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 rounded bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortablePartner({
  partner,
  onToggleApprove,
  onEdit,
  onDelete,
  isApprovedSection,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: partner._id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #ddd",
    padding: "1rem",
    borderRadius: "0.5rem",
    marginBottom: "0.75rem",
    backgroundColor: "white",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          {partner.imageUrl && (
            <img
              src={partner.imageUrl}
              alt={partner.username || "User"}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <p className="font-semibold">{partner.name || partner.username}</p>
            <p className="text-yellow-600 font-bold">{`Rating: ${partner.rating || "N/A"} ⭐`}</p>
            <p className="mt-2 text-sm">{partner.comment}</p>
          </div>
        </div>

        <div className="ml-4 flex flex-col items-end gap-2">
          {isApprovedSection && (
            <button
              {...listeners}
              className="px-2 py-1 border rounded text-sm cursor-grab"
              title="Drag to reorder"
            >
              ☰
            </button>
          )}

          <button
            onClick={() => onToggleApprove(partner._id, !partner.approved)}
            className={`px-3 py-1 rounded text-white ${
              partner.approved ? "bg-red-600" : "bg-green-600 hover:bg-green-700"
            } text-sm`}
          >
            {partner.approved ? "Unapprove" : "Approve"}
          </button>

          <button
            onClick={() => onEdit(partner)}
            className="px-3 py-1 rounded bg-yellow-500 text-white text-sm hover:bg-yellow-600"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(partner._id)}
            className="px-3 py-1 rounded bg-red-700 text-white text-sm hover:bg-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function PartnerCard({
  partner,
  onToggleApprove,
  onEdit,
  onDelete,
  disableApprove,
}) {
  return (
    <div className="border p-4 rounded bg-white flex gap-3">
      {partner.imageUrl && (
        <img
          src={partner.imageUrl}
          alt={partner.username || "User"}
          className="w-10 h-10 rounded-full object-cover"
        />
      )}
      <div className="flex-1">
        <p className="font-semibold">{partner.name || partner.username}</p>
        <p className="text-yellow-600 font-bold">{`Rating: ${partner.rating || "N/A"} ⭐`}</p>
        <p className="mt-2 text-sm">{partner.comment}</p>

        <div className="mt-3 flex gap-2 justify-end">
          <button
            onClick={() => onToggleApprove(partner._id, true)}
            disabled={disableApprove}
            className={`px-3 py-1 rounded text-white ${
              disableApprove
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Approve
          </button>

          <button
            onClick={() => onEdit(partner)}
            className="px-3 py-1 rounded bg-yellow-500 text-white text-sm hover:bg-yellow-600"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(partner._id)}
            className="px-3 py-1 rounded bg-red-700 text-white text-sm hover:bg-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
