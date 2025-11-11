"use client";

import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import Papa from "papaparse";
import { CreditCard, FileText } from "lucide-react";
import { useSession } from "next-auth/react";

dayjs.extend(relativeTime);

export default function TransactionPanel() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("dateDesc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // server-side page size
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [enlargedImg, setEnlargedImg] = useState(null);
  const { currency } = useAppContext();
  const [summary, setSummary] = useState({
    last24HoursAmount: 0,
    last7DaysAmount: 0,
    last30DaysAmount: 0,
  });

  // 👉 Fetch transactions whenever page or pageSize changes
  useEffect(() => {
    fetchTransactions();
  }, [page, pageSize]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/admin/transactions?page=${page}&limit=${pageSize}`
      );

      setTransactions(res.data.transactions || []);
      setTotalCount(res.data.totalCount || 0);

      setSummary({
        last24HoursAmount: res.data.last24HoursAmount ?? 0,
        last7DaysAmount: res.data.last7DaysAmount ?? 0,
        last30DaysAmount: res.data.last30DaysAmount ?? 0,
      });
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(
    (txn) =>
      txn.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 👉 total pages based on server totalCount
  const totalPages = Math.ceil(totalCount / pageSize);

  const exportToCSV = () => {
    const csv = Papa.unparse(
      transactions.map((txn) => ({
        OrderID: txn.orderId,
        UserID: txn.username,
        Amount: txn.amount,
        PaymentMethod: txn.paymentMethod,
        PaymentStatus: txn.paymentStatus,
        OrderStatus: txn.orderStatus,
        ProofOfPayment: txn.proofOfPaymentUrl || "",
        Date: new Date(txn.date).toLocaleString(),
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updatePaymentStatus = async (orderId, status) => {
    try {
      const token = session.accessToken; 
      const res = await axios.post(
        "/api/admin/order/payment-status",
        { orderId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Updated payment status");
        setTransactions((prev) =>
          prev.map((txn) =>
            txn._id === orderId ? { ...txn, paymentStatus: status } : txn
          )
        );
      } else {
        toast.error(res.data.message || "Failed to update");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update payment");
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    if (!session?.accessToken) {
      toast.error("Unauthorized: Please sign in again.");
      return;
    }

    try {
      const token = session.accessToken;
      const { data } = await axios.post(
        "/api/order/update-status",
        { orderId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Order status updated");

        // ✅ Update the local state so the UI reflects the new status
        setTransactions((prev) =>
          prev.map((txn) =>
            txn.orderId === orderId ? { ...txn, orderStatus: status } : txn
          )
        );
      } else {
        toast.error(data.message || "Failed to update");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update order");
    }
  };

  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions
      .sort((a, b) => new Date(b.date) - new Date(a.date)) // sort by newest
      .forEach(txn => {
        const day = new Date(txn.date).toLocaleDateString();
        if (!groups[day]) groups[day] = [];
        groups[day].push(txn);
      });
    return groups;
  }, [filteredTransactions]);

  if (loading) return <p className="text-gray-500">Loading payments...</p>;

  return (
    <div className="flex-1 overflow-auto h-screen p-4 sm:p-6 bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex flex-col mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-normal flex items-center gap-2">
          Payments
        </h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:items-center sm:justify-start">
          <input
            type="text"
            placeholder="Search by user, order, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
          />
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1); // reset to page 1
            }}
            className="w-full sm:w-auto p-2 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:outline-none"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded shadow transition w-full sm:w-auto"
          >
            <FileText className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow text-center sm:text-left">
          <h3 className="text-sm font-semibold text-gray-500">Last 24hours</h3>
          <p className="text-xl font-normal mt-1">
            {currency}
            {summary
              .last24HoursAmount
              .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow text-center sm:text-left">
          <h3 className="text-sm font-semibold text-gray-500">Last 7 Days</h3>
          <p className="text-xl font-normal mt-1">
            {currency}
            {summary
              .last7DaysAmount
              .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow text-center sm:text-left">
          <h3 className="text-sm font-semibold text-gray-500">Last 30 Days</h3>
          <p className="text-xl font-normal mt-1">
            {currency}
            {summary
              .last30DaysAmount
              .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Transactions */}
      {loading ? (
        <p className="text-gray-500">Loading transactions...</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([day, txns]) => (
            <div key={day}>
              {/* ✅ Day header */}
              <h2 className="text-base sm:text-lg font-normal px-3 sm:px-4 py-2 bg-gray-100 dark:bg-neutral-700 border-b rounded-t-lg">
                {new Date(txns[0].date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>

              {/* ✅ Desktop table view */}
              <div className="hidden md:block overflow-x-auto border rounded-b-lg bg-white dark:bg-neutral-800 shadow">
                <table className="min-w-full text-sm border-collapse border border-gray-300 dark:border-neutral-700">
                  <thead className="bg-gray-50 dark:bg-neutral-700">
                    <tr>
                      <th className="border font-normal px-2 py-1">Order ID</th>
                      <th className="border font-normal px-2 py-1">User ID</th>
                      <th className="border font-normal px-2 py-1">Amount</th>
                      <th className="border font-normal px-2 py-1">Payment Method</th>
                      <th className="border font-normal px-2 py-1">Payment Status</th>
                      <th className="border font-normal px-2 py-1">Order Status</th>
                      <th className="border font-normal px-2 py-1">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txns.map((txn) => (
                      <tr
                        key={txn._id}
                        className="hover:bg-gray-100 dark:hover:bg-neutral-700"
                      >
                        <td className="border px-2 py-1">{txn.orderId}</td>
                        <td className="border px-2 py-1">{txn.userId?.username}</td>
                        <td className="border px-2 py-1">
                          {currency}
                          {txn.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="border px-2 py-1">{txn.paymentMethod}</td>
                        <td className="border px-2 py-1">
                          <select
                            value={txn.paymentStatus}
                            onChange={(e) =>
                              updatePaymentStatus(txn._id, e.target.value)
                            }
                            className="border text-xs px-2 py-1 rounded"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Successful">Successful</option>
                            <option value="Refunded">Refunded</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </td>
                        <td className="border px-2 py-1">
                          <select
                            value={txn.orderStatus}
                            onChange={(e) =>
                              updateOrderStatus(txn.orderId, e.target.value)
                            }
                            className="border text-xs px-2 py-1 rounded"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Order Placed">Order Placed</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="border px-2 py-1 text-xs">
                          {new Date(txn.date).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ✅ Mobile card view */}
              <div className="md:hidden space-y-3 mt-2">
                {txns.map((txn) => (
                  <div
                    key={txn._id}
                    className="border rounded-lg shadow-sm bg-white dark:bg-neutral-800 p-3"
                  >
                    {/* Header row */}
                    <div className="flex justify-between items-center">
                      <span className="font-normal text-sm">{txn.orderId}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(txn.createdAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="mt-2 text-sm space-y-1">
                      <p>
                        <span className="font-normal">User:</span> {txn.userId?.username}
                      </p>
                      <p>
                        <span className="font-normal">Amount:</span> {currency}
                        {txn.amount?.toFixed(2)}
                      </p>
                      <p>
                        <span className="font-normal">Method:</span> {txn.paymentMethod}
                      </p>
                    </div>

                    {/* Editable statuses */}
                    <div className="mt-3 flex flex-col gap-2">
                      <label className="text-xs font-normal">Payment Status</label>
                      <select
                        value={txn.paymentStatus}
                        onChange={(e) => updatePaymentStatus(txn._id, e.target.value)}
                        className="border text-xs px-2 py-1 rounded"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Successful">Successful</option>
                        <option value="Refunded">Refunded</option>
                        <option value="Failed">Failed</option>
                      </select>

                      <label className="text-xs font-normal">Order Status</label>
                      <select
                        value={txn.orderStatus}
                        onChange={(e) => updateOrderStatus(txn.orderId, e.target.value)}
                        className="border text-xs px-2 py-1 rounded"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Order Placed">Order Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center">
          <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-gray-900 shadow-sm border rounded-lg px-2 sm:px-4 py-2 overflow-x-auto">
            
            {/* Prev */}
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
            >
              Prev
            </button>

            {/* First page */}
            <button
              onClick={() => setPage(1)}
              className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                page === 1
                  ? "bg-orange-600 text-white shadow"
                  : "bg-gray-100 dark:bg-gray-800 hover:bg-orange-100"
              }`}
            >
              1
            </button>

            {/* Left dots */}
            {page > 3 && <span className="px-1 sm:px-2 text-gray-500">…</span>}

            {/* Middle pages (current ±1) */}
            {Array.from({ length: 3 }, (_, i) => page - 1 + i)
              .filter((p) => p > 1 && p < totalPages)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                    page === p
                      ? "bg-orange-600 text-white shadow"
                      : "bg-gray-100 dark:bg-gray-800 hover:bg-orange-100"
                  }`}
                >
                  {p}
                </button>
              ))}

            {/* Right dots */}
            {page < totalPages - 2 && <span className="px-1 sm:px-2 text-gray-500">…</span>}

            {/* Last page */}
            {totalPages > 1 && (
              <button
                onClick={() => setPage(totalPages)}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded ${
                  page === totalPages
                    ? "bg-orange-600 text-white shadow"
                    : "bg-gray-100 dark:bg-gray-800 hover:bg-orange-100"
                }`}
              >
                {totalPages}
              </button>
            )}

            {/* Next */}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
