// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useUser } from '@clerk/nextjs';
// // import Loading from '@/components/Loading';
// import { toast } from 'react-hot-toast';
// import { saveAs } from 'file-saver';
// import Footer from '@/components/admin/Footer';

// const AdminReviewsPage = () => {
//   const { user, isLoaded } = useUser();
//   const [reviews, setReviews] = useState([]);
//   const [filteredReviews, setFilteredReviews] = useState([]);
//   const [search, setSearch] = useState('');
//   const [sortField, setSortField] = useState('createdAt');
//   const [sortOrder, setSortOrder] = useState('desc');
//   const [page, setPage] = useState(1);
//   const [ratingFilter, setRatingFilter] = useState('');
//   const [loading, setLoading] = useState(true);

//   const reviewsPerPage = 10;
//   const isAdmin = user?.publicMetadata?.role === 'admin';

//   useEffect(() => {
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   }, [page]);


//   useEffect(() => {
//     if (!isLoaded || !isAdmin) return;
//     fetchReviews();
//   }, [isLoaded, isAdmin]);

//   useEffect(() => {
//     let updated = [...reviews];

//     if (search) {
//       updated = updated.filter(r =>
//         r.username.toLowerCase().includes(search.toLowerCase()) ||
//         r.productId.toLowerCase().includes(search.toLowerCase()) ||
//         r.comment.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     if (ratingFilter) {
//       updated = updated.filter(r => r.rating === parseInt(ratingFilter));
//     }

//     updated.sort((a, b) => {
//       const aVal = a[sortField];
//       const bVal = b[sortField];
//       if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
//       if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
//       return 0;
//     });

//     setFilteredReviews(updated);
//     setPage(1);
//   }, [search, reviews, sortField, sortOrder, ratingFilter]);

//   async function fetchReviews() {
//     setLoading(true);
//     const res = await fetch('/api/reviews');
//     const data = await res.json();
//     if (data.success) {
//       setReviews(data.reviews);
//     }
//     setLoading(false);
//   }

//   async function toggleApproval(reviewId, approved) {
//     try {
//       const res = await fetch('/api/reviews', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ reviewId, approved }),
//       });
//       if (res.ok) {
//         toast.success(`Review ${approved ? 'approved' : 'disapproved'}`);
//         fetchReviews();
//       } else {
//         const err = await res.json();
//         toast.error(err.message || 'Error toggling approval');
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   }

//   async function deleteReview(reviewId) {
//     if (!confirm('Are you sure you want to delete this review?')) return;
//     try {
//       const res = await fetch('/api/reviews', {
//         method: 'DELETE',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ reviewId }),
//       });
//       if (res.ok) {
//         toast.success('Review deleted');
//         fetchReviews();
//       } else {
//         const err = await res.json();
//         toast.error(err.message || 'Error deleting review');
//       }
//     } catch (error) {
//       toast.error(error.message);
//     }
//   }

//   function exportToCSV() {
//     const headers = ['User', 'Product ID', 'Rating', 'Comment', 'Approved', 'Date'];
//     const rows = filteredReviews.map(r => [
//       r.username,
//       r.productId,
//       r.rating,
//       r.comment,
//       r.approved ? 'Yes' : 'No',
//       new Date(r.createdAt).toLocaleString()
//     ]);
//     const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     saveAs(blob, 'reviews.csv');
//   }

//   async function approveAll() {
//     const unapprovedIds = filteredReviews.filter(r => !r.approved).map(r => r._id);
//     for (const id of unapprovedIds) {
//       await toggleApproval(id, true);
//     }
//     toast.success('All reviews approved');
//   }

//   // if (!isLoaded) return <Loading />;
//   if (!isAdmin) return <p className="p-8 text-center text-red-500">Access denied. You are not an admin.</p>;
//   // if (loading) return <Loading />;

//   const paginatedReviews = filteredReviews.slice((page - 1) * reviewsPerPage, page * reviewsPerPage);
//   const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

//   return (
//     <div className="p-2 max-w-4xl flex-1 overflow-scroll flex flex-col mx-4 mt-4">
//       {/* flex-1 overflow-scroll h-screen text-sm flex flex-col justify-between */}
//       <h1 className="text-xl md:text-2xl font-bold mb-4">Manage Reviews</h1>

//       <div className="flex flex-wrap gap-4 mb-6">
//         <input
//           type="text"
//           placeholder="Search by user, product, or comment"
//           className="border p-2 rounded flex-grow min-w-[180px]"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//         />
//         <select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} className="border p-2 rounded">
//           <option value="">All Ratings</option>
//           {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r} Stars</option>)}
//         </select>
//         <select value={sortField} onChange={e => setSortField(e.target.value)} className="border p-2 rounded">
//           <option value="createdAt">Date</option>
//           <option value="username">User</option>
//           <option value="productId">Product Name</option>
//         </select>
//         <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="border p-2 rounded">
//           <option value="asc">Ascending</option>
//           <option value="desc">Descending</option>
//         </select>
//         <button onClick={exportToCSV} className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap">
//           Export CSV
//         </button>
//         <button onClick={approveAll} className="bg-black text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap">
//           Approve All
//         </button>
//       </div>

//       {filteredReviews.length === 0 ? (
//         <p>No reviews found.</p>
//       ) : (
//         <>
//           {/* Desktop Table */}
//           <div className="hidden md:block">
//             <table className="w-full border-collapse border border-gray-300 text-sm">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="border border-gray-300 px-4 py-2">User</th>
//                   <th className="border border-gray-300 px-4 py-2">Product ID</th>
//                   <th className="border border-gray-300 px-4 py-2">Rating</th>
//                   <th className="border border-gray-300 px-4 py-2">Comment</th>
//                   <th className="border border-gray-300 px-4 py-2">Approved</th>
//                   <th className="border border-gray-300 px-4 py-2">Date</th>
//                   <th className="border border-gray-300 px-4 py-2">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedReviews.map(rev => (
//                   <tr key={rev._id}>
//                     <td className="border border-gray-300 px-4 py-2">{rev.username}</td>
//                     <td className="border border-gray-300 px-4 py-2">{rev.productId?.name || 'N/A'}</td>
//                     <td className="border border-gray-300 px-4 py-2">{rev.rating}</td>
//                     <td className="border border-gray-300 px-4 py-2">{rev.comment}</td>
//                     <td className="border border-gray-300 px-4 py-2 text-center">
//                       <input
//                         type="checkbox"
//                         checked={rev.approved}
//                         onChange={() => toggleApproval(rev._id, !rev.approved)}
//                         className="w-5 h-5 cursor-pointer accent-orange-600"
//                       />
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">{new Date(rev.createdAt).toLocaleString()}</td>
//                     <td className="border border-gray-300 px-4 py-2 text-center">
//                       <button onClick={() => deleteReview(rev._id)} className="text-red-600 hover:underline">
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Mobile Cards */}
//           <div className="md:hidden space-y-4 mx-4">
//             {paginatedReviews.map(rev => (
//               <div key={rev._id} className="border border-gray-300 rounded p-4 shadow-sm bg-white">
//                 <div className="mb-2"><strong>User:</strong> {rev.username}</div>
//                 <div className="mb-2"><strong>Product Name:</strong> {rev.productId?.name || 'N/A'}</div>
//                 <div className="mb-2"><strong>Rating:</strong> {rev.rating} ⭐</div>
//                 <div className="mb-2"><strong>Comment:</strong> {rev.comment}</div>
//                 <div className="mb-2 flex items-center">
//                   <strong className="mr-2">Approved:</strong>
//                   <input
//                     type="checkbox"
//                     checked={rev.approved}
//                     onChange={() => toggleApproval(rev._id, !rev.approved)}
//                     className="w-6 h-6 cursor-pointer accent-orange-600"
//                   />
//                 </div>
//                 <div className="mb-2"><strong>Date:</strong> {new Date(rev.createdAt).toLocaleString()}</div>
//                 <button
//                   onClick={() => deleteReview(rev._id)}
//                   className="text-red-600 hover:underline mt-2 block"
//                 >
//                   Delete
//                 </button>
//               </div>
//             ))}
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="mt-4 flex justify-center items-center">
//               <div className="space-x-2 flex items-center">
//                 {/* Prev Button */}
//                 <button
//                   disabled={page === 1}
//                   onClick={() => setPage(p => Math.max(p - 1, 1))}
//                   className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//                 >
//                   Prev
//                 </button>

//                 {/* Page Numbers with Ellipsis */}
//                 {(() => {
//                   const range = [];
//                   const start = Math.max(1, page - 2);
//                   const end = Math.min(totalPages, page + 2);

//                   if (start > 1) {
//                     range.push(1);
//                     if (start > 2) range.push("ellipsis-start");
//                   }

//                   for (let i = start; i <= end; i++) {
//                     range.push(i);
//                   }

//                   if (end < totalPages) {
//                     if (end < totalPages - 1) range.push("ellipsis-end");
//                     range.push(totalPages);
//                   }

//                   return range.map((item, index) =>
//                     item === "ellipsis-start" || item === "ellipsis-end" ? (
//                       <span key={index} className="px-1">...</span>
//                     ) : (
//                       <button
//                         key={item}
//                         onClick={() => setPage(item)}
//                         className={`px-3 py-1 rounded border ${
//                           page === item ? "bg-black text-white" : "bg-white"
//                         }`}
//                       >
//                         {item}
//                       </button>
//                     )
//                   );
//                 })()}

//                 {/* Next Button */}
//                 <button
//                   disabled={page === totalPages}
//                   onClick={() => setPage(p => Math.min(p + 1, totalPages))}
//                   className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}



//         </>
//       )}
//       <div className='mt-12'>
//         <Footer />
//       </div>
//     </div>
//   );
// };

// export default AdminReviewsPage;




















"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";
import Footer from "@/components/admin/Footer";

const AdminReviewsPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user;

  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const reviewsPerPage = 10;
  const isAdmin = user?.role === "admin";

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // Redirect non-admin users
  useEffect(() => {
    if (status === "loading") return;
    if (!user || !isAdmin) {
      router.push("/");
    } else {
      fetchReviews();
    }
  }, [status, user]);

  // Filtering + sorting
  useEffect(() => {
    let updated = [...reviews];

    if (search) {
      updated = updated.filter(
        (r) =>
          r.username.toLowerCase().includes(search.toLowerCase()) ||
          r.productId?.name?.toLowerCase().includes(search.toLowerCase()) ||
          r.comment.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (ratingFilter) {
      updated = updated.filter((r) => r.rating === parseInt(ratingFilter));
    }

    updated.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredReviews(updated);
    setPage(1);
  }, [search, reviews, sortField, sortOrder, ratingFilter]);

  // Fetch all reviews
  async function fetchReviews() {
    setLoading(true);
    const res = await fetch("/api/reviews");
    const data = await res.json();
    if (data.success) {
      setReviews(data.reviews);
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
        toast.success(`Review ${approved ? "approved" : "disapproved"}`);
        fetchReviews();
      } else {
        const err = await res.json();
        toast.error(err.message || "Error toggling approval");
      }
    } catch (error) {
      toast.error(error.message);
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
        toast.success("Review deleted");
        fetchReviews();
      } else {
        const err = await res.json();
        toast.error(err.message || "Error deleting review");
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  function exportToCSV() {
    const headers = ["User", "Product", "Rating", "Comment", "Approved", "Date"];
    const rows = filteredReviews.map((r) => [
      r.username,
      r.productId?.name || "N/A",
      r.rating,
      r.comment,
      r.approved ? "Yes" : "No",
      new Date(r.createdAt).toLocaleString(),
    ]);
    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "reviews.csv");
  }

  async function approveAll() {
    const unapprovedIds = filteredReviews.filter((r) => !r.approved).map((r) => r._id);
    for (const id of unapprovedIds) {
      await toggleApproval(id, true);
    }
    toast.success("All reviews approved");
  }

  if (status === "loading" || loading) {
    return <p className="p-8 text-center">Loading...</p>;
  }

  if (!isAdmin) {
    return <p className="p-8 text-center text-red-500">Access denied. You are not an admin.</p>;
  }

  const paginatedReviews = filteredReviews.slice(
    (page - 1) * reviewsPerPage,
    page * reviewsPerPage
  );
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);

  return (
    <div className="p-2 max-w-4xl flex-1 overflow-scroll flex flex-col mx-4 mt-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4">Manage Reviews</h1>

      {/* Filters & Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by user, product, or comment"
          className="border p-2 rounded flex-grow min-w-[180px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="border p-2 rounded"
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
          className="border p-2 rounded"
        >
          <option value="createdAt">Date</option>
          <option value="username">User</option>
          <option value="productId">Product Name</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <button
          onClick={exportToCSV}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 whitespace-nowrap"
        >
          Export CSV
        </button>
        <button
          onClick={approveAll}
          className="bg-black text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap"
        >
          Approve All
        </button>
      </div>

      {/* Table */}
      {filteredReviews.length === 0 ? (
        <p>No reviews found.</p>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2">User</th>
                  <th className="border border-gray-300 px-4 py-2">Product</th>
                  <th className="border border-gray-300 px-4 py-2">Rating</th>
                  <th className="border border-gray-300 px-4 py-2">Comment</th>
                  <th className="border border-gray-300 px-4 py-2">Approved</th>
                  <th className="border border-gray-300 px-4 py-2">Date</th>
                  <th className="border border-gray-300 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReviews.map((rev) => (
                  <tr key={rev._id}>
                    <td className="border border-gray-300 px-4 py-2">{rev.username}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {rev.productId?.name || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{rev.rating}</td>
                    <td className="border border-gray-300 px-4 py-2">{rev.comment}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={rev.approved}
                        onChange={() => toggleApproval(rev._id, !rev.approved)}
                        className="w-5 h-5 cursor-pointer accent-orange-600"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(rev.createdAt).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <button
                        onClick={() => deleteReview(rev._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-4 mx-4">
            {paginatedReviews.map((rev) => (
              <div key={rev._id} className="border border-gray-300 rounded p-4 shadow-sm bg-white">
                <div className="mb-2"><strong>User:</strong> {rev.username}</div>
                <div className="mb-2"><strong>Product:</strong> {rev.productId?.name || "N/A"}</div>
                <div className="mb-2"><strong>Rating:</strong> {rev.rating} ⭐</div>
                <div className="mb-2"><strong>Comment:</strong> {rev.comment}</div>
                <div className="mb-2 flex items-center">
                  <strong className="mr-2">Approved:</strong>
                  <input
                    type="checkbox"
                    checked={rev.approved}
                    onChange={() => toggleApproval(rev._id, !rev.approved)}
                    className="w-6 h-6 cursor-pointer accent-orange-600"
                  />
                </div>
                <div className="mb-2"><strong>Date:</strong> {new Date(rev.createdAt).toLocaleString()}</div>
                <button
                  onClick={() => deleteReview(rev._id)}
                  className="text-red-600 hover:underline mt-2 block"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center items-center space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`px-3 py-1 rounded border ${
                    page === num ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default AdminReviewsPage;
