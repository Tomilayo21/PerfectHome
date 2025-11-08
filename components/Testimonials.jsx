

// File: TestimonialAdmin.jsx
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

export default function TestimonialAdmin() {
  const { user, isLoaded } = useUser();
  const [reviews, setReviews] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/reviews");
        if (!res.ok) throw new Error("Failed to fetch reviews");
        const data = await res.json();
        const list = data.reviews ?? data;
        list.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        setReviews(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [isLoaded]);

  const approvedCount = reviews.filter((r) => r.approved).length;

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const approved = reviews.filter((r) => r.approved);
    const oldIndex = approved.findIndex((r) => r._id === active.id);
    const newIndex = approved.findIndex((r) => r._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newApproved = arrayMove(approved, oldIndex, newIndex);
    const unapproved = reviews.filter((r) => !r.approved);
    setReviews([...newApproved, ...unapproved]);
  };

    const handleSaveOrder = async () => {
    setIsSaving(true);
    setSaved(false);

    const payload = reviews
        .filter((r) => r.approved) // keep only approved reviews
        .map((review, index) => ({
        id: review._id, // matches API expectation
        position: index
        }));

    try {
        const res = await fetch("/api/reviews/testimonialapproval", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: payload }), // matches API expectation
        });

        if (!res.ok) {
        throw new Error("Failed to save order");
        }

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

    setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, approved: approve } : r)));

    try {
      const res = await fetch(`/api/reviews/testimonialapproval/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: approve }),
      });

      if (!res.ok) throw new Error("Failed to update review");
    } catch (err) {
      console.error(err);
      alert("Failed to update approval on server. Reverting.");
      setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, approved: !approve } : r)));
    }
  };

  if (loading) return <div className="p-6">Loading testimonials...</div>;

  const approved = reviews.filter((r) => r.approved).sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const pending = reviews.filter((r) => !r.approved);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-semibold">Customers Testimonials </h2>

      <div className="flex items-center justify-between">
        <div>
          <strong>Approved:</strong> {approved.length} / 5
        </div>
        <div>
          <button
            onClick={handleSaveOrder}
            disabled={isSaving}
            className={`px-3 py-1 rounded text-white transition-colors duration-200 ${
              isSaving ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isSaving ? "Saving..." : saved ? "Saved" : "Save Approved Order"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Approved (drag to reorder)</h3>

          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={approved.map((r) => r._id)} strategy={verticalListSortingStrategy}>
              {approved.map((review) => (
                <SortableAdminReview
                  key={review._id}
                  review={review}
                  onToggleApprove={toggleApprove}
                  isApprovedSection
                />
              ))}
            </SortableContext>
          </DndContext>

          {approved.length === 0 && <p className="text-sm text-gray-500">No approved testimonials yet.</p>}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Pending</h3>
          <div className="space-y-3">
            {pending.map((review) => (
              <AdminReviewCard key={review._id} review={review} onToggleApprove={toggleApprove} disableApprove={approvedCount >= 5} />
            ))}

            {pending.length === 0 && <p className="text-sm text-gray-500">No pending testimonials.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}


function SortableAdminReview({ review, onToggleApprove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: review._id });
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
          {/* 🔹 Added user image */}
          {review.imageUrl && (
            <img
              src={review.imageUrl}
              alt={review.username || "User"}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <p className="font-semibold">{review.username || "Anonymous"}</p>
            <p className="text-yellow-600 font-bold">{`Rating: ${review.rating} ⭐`}</p>
            <p className="mt-2 text-sm">{review.comment}</p>
          </div>
        </div>

        <div className="ml-4 flex flex-col items-end gap-2">
          <button
            {...listeners}
            className="px-2 py-1 border rounded text-sm cursor-grab"
            title="Drag to reorder"
          >
            ☰
          </button>

          <button
            onClick={() => onToggleApprove(review._id, false)}
            className="px-3 py-1 rounded bg-red-600 text-white text-sm"
          >
            Unapprove
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminReviewCard({ review, onToggleApprove, disableApprove }) {
  return (
    <div className="border p-4 rounded bg-white flex gap-3">
      {/* 🔹 Added user image */}
      {review.imageUrl && (
        <img
          src={review.imageUrl}
          alt={review.username || "User"}
          className="w-10 h-10 rounded-full object-cover"
        />
      )}
      <div className="flex-1">
        <p className="font-semibold">{review.username || "Anonymous"}</p>
        <p className="text-yellow-600 font-bold">{`Rating: ${review.rating} ⭐`}</p>
        <p className="mt-2 text-sm">{review.comment}</p>

        <div className="mt-3 flex gap-2 justify-end">
          <button
            onClick={() => onToggleApprove(review._id, true)}
            disabled={disableApprove}
            className={`px-3 py-1 rounded text-white ${
              disableApprove ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
}


