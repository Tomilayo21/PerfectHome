'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { saveAs } from 'file-saver';
import { Trash2, FileDown, CheckCircle, Star, Search, XCircle } from "lucide-react";
import { useRouter } from 'next/navigation';


const ReviewsPanel = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const reviewsPerPage = 10;
  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);


  useEffect(() => {
    if (status === 'authenticated' && !isAdmin) {
      router.replace('/'); // redirect non-admin users
    }
  }, [status, isAdmin, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !isAdmin) return;
    fetchReviews();
  }, [status, isAdmin]);


  useEffect(() => {
    let updated = [...reviews];

    if (search) {
      updated = updated.filter(r =>
        r.username.toLowerCase().includes(search.toLowerCase()) ||
        r.productId.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (ratingFilter) {
      updated = updated.filter(r => r.rating === parseInt(ratingFilter));
    }

    updated.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredReviews(updated);
    setPage(1);
  }, [search, reviews, sortField, sortOrder, ratingFilter]);

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      // data is an array, not { success, reviews }
      if (Array.isArray(data)) setReviews(data);
      else toast.error('Unexpected response');
    } catch (error) {
      toast.error('Failed to fetch reviews');
    }
    setLoading(false);
  }

  async function toggleApproval(reviewId, approved) {
    try {
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, approved }),
      });

      if (res.ok) {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
            >
              <CheckCircle className="text-orange-500" size={22} />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Review {approved ? "approved" : "disapproved"}!
              </p>
            </div>
          ),
          { duration: 3500, position: "top-right" }
        );
        fetchReviews();
      } else {
        const err = await res.json();
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
            >
              <XCircle className="text-red-500" size={22} />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {err.message || "Error toggling approval"}
              </p>
            </div>
          ),
          { duration: 3500, position: "top-right" }
        );
      }
    } catch (error) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
          >
            <XCircle className="text-red-500" size={22} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {error.message}
            </p>
          </div>
        ),
        { duration: 3500, position: "top-right" }
      );
    }
  }

  async function deleteReview(reviewId) {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await fetch("/api/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });

      if (res.ok) {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
            >
              <CheckCircle className="text-orange-500" size={22} />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Review deleted!
              </p>
            </div>
          ),
          { duration: 3500, position: "top-right" }
        );
        fetchReviews();
      } else {
        const err = await res.json();
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
            >
              <XCircle className="text-red-500" size={22} />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {err.message || "Error deleting review"}
              </p>
            </div>
          ),
          { duration: 3500, position: "top-right" }
        );
      }
    } catch (error) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
          >
            <XCircle className="text-red-500" size={22} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {error.message}
            </p>
          </div>
        ),
        { duration: 3500, position: "top-right" }
      );
    }
  }

  async function approveAll() {
    const unapprovedIds = filteredReviews.filter(r => !r.approved).map(r => r._id);
    for (const id of unapprovedIds) {
      await toggleApproval(id, true);
    }
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
        >
          <CheckCircle className="text-orange-500" size={22} />
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            All reviews approved!
          </p>
        </div>
      ),
      { duration: 3500, position: "top-right" }
    );
  }

  function exportToCSV() {
    const headers = ['User', 'Product ID', 'Rating', 'Comment', 'Approved', 'Date'];
    const rows = filteredReviews.map(r => [
      r.username,
      r.productId,
      r.rating,
      r.comment,
      r.approved ? 'Yes' : 'No',
      new Date(r.createdAt).toLocaleString()
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'reviews.csv');
  }


  if (status === 'loading') return <p>Loading...</p>;
  if (!isAdmin) return <p className="p-8 text-center text-red-500">Access denied. You are not an admin.</p>;

  const paginatedReviews = filteredReviews.slice((page - 1) * reviewsPerPage, page * reviewsPerPage);
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  return (
    <div className="p-4 max-w-6xl flex-1 overflow-y-auto mx-auto">
      <h1 className="text-2xl md:text-3xl font-normal mb-6 text-gray-800">
        Manage Reviews
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative w-full sm:w-60">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by user, product, or comment"
            className="border border-gray-300 pl-9 pr-3 py-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
        >
          <option value="">All Ratings</option>
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>
              {r} Stars
            </option>
          ))}
        </select>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
        >
          <option value="createdAt">Date</option>
          <option value="username">User</option>
          <option value="productId">Product Name</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition shadow-sm"
        >
          <FileDown size={16} /> Export CSV
        </button>
        <button
          onClick={approveAll}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
        >
          <CheckCircle size={16} /> Approve All
        </button>
      </div>

      {filteredReviews.length === 0 ? (
        <p className="text-gray-500 italic">No reviews found.</p>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg shadow">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Rating</th>
                  <th className="px-4 py-3 font-semibold">Comment</th>
                  <th className="px-4 py-3 font-semibold text-center">Approved</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedReviews.map((rev, i) => (
                  <tr
                    key={rev._id}
                    className={`hover:bg-gray-50 transition ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50/70"
                    }`}
                  >
                    <td className="px-4 py-3">{rev.username}</td>
                    <td className="px-4 py-3">{rev.productId?.name || "N/A"}</td>
                    <td className="px-4 py-3 text-yellow-600 font-medium">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{rev.comment}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={rev.approved}
                        onChange={() => toggleApproval(rev._id, !rev.approved)}
                        className="w-5 h-5 cursor-pointer accent-orange-600"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(rev.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => deleteReview(rev._id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {paginatedReviews.map((rev) => (
              <div
                key={rev._id}
                className="border border-gray-200 rounded-xl p-4 shadow-sm bg-white"
              >
                <div className="mb-2 text-gray-800">
                  <span className="font-medium">User:</span> {rev.username}
                </div>
                <div className="mb-2 text-gray-800">
                  <span className="font-medium">Product:</span>{" "}
                  {rev.productId?.name || "N/A"}
                </div>
                <div className="mb-2 text-yellow-600 font-medium flex items-center gap-1">
                  <span>Rating:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-1">{rev.rating}</span>
                </div>
                <div className="mb-2 text-gray-700">
                  <span className="font-medium">Comment:</span> {rev.comment}
                </div>
                <div className="mb-2 flex items-center">
                  <span className="font-medium mr-2">Approved:</span>
                  <input
                    type="checkbox"
                    checked={rev.approved}
                    onChange={() => toggleApproval(rev._id, !rev.approved)}
                    className="w-6 h-6 cursor-pointer accent-orange-600"
                  />
                </div>
                <div className="mb-2 text-gray-500">
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(rev.createdAt).toLocaleString()}
                </div>
                <button
                  onClick={() => deleteReview(rev._id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-800 transition mt-2"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Prev
                </button>
                {(() => {
                  const range = [];
                  const start = Math.max(1, page - 2);
                  const end = Math.min(totalPages, page + 2);
                  if (start > 1) {
                    range.push(1);
                    if (start > 2) range.push("ellipsis-start");
                  }
                  for (let i = start; i <= end; i++) range.push(i);
                  if (end < totalPages) {
                    if (end < totalPages - 1) range.push("ellipsis-end");
                    range.push(totalPages);
                  }
                  return range.map((item, idx) =>
                    typeof item === "number" ? (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`px-3 py-1 rounded-full border text-sm ${
                          page === item
                            ? "bg-black text-white"
                            : "bg-white hover:bg-gray-100"
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={idx} className="px-2">
                        ...
                      </span>
                    )
                  );
                })()}
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>

  );
};

export default ReviewsPanel;
