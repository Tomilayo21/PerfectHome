"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import { ShoppingCart } from "lucide-react";
import { assets } from "@/assets/assets";
import { useSession, getSession } from "next-auth/react";


const OrderPanel = () => {
  const { currency, getToken, user } = useAppContext();
   const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const [modalItems, setModalItems] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchAdminOrders = async () => {
    if (!session?.user) {
      showErrorToast("You must be logged in");
      return;
    }

    try {
      const token = session.accessToken; 
      const { data } = await axios.get("/api/order/admin-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setOrders(data.orders);
      } else {
        showErrorToast(data.message);
      }
    } catch (error) {
      showErrorToast(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };  


  useEffect(() => {
    if (status === "authenticated") {
      fetchAdminOrders();
    }
  }, [status, session]);

  useEffect(() => {
    if (orders.length) {
      orders.forEach((order, i) => {
        console.log(`Order #${i + 1}`);
        console.log("Full Name:", order.address?.fullName || "Missing");
        console.log("Country:", order.address?.country || "Missing");
        console.log("State:", order.address?.state || "Missing");
        console.log("City:", order.address?.city || "Missing");
        console.log("Phone Number:", order.address?.phoneNumber || "Missing");
        console.log("----------------------------");
      });
    } else {
      console.log("No orders found or address is not populated.");
    }
  }, [orders]);

  const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));

  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const groupedOrders = paginatedOrders.reduce((acc, order) => {
    if (statusFilter !== "All" && order.status !== statusFilter) return acc;
    const dateKey = new Date(order.date).toISOString().split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(order);
    return acc;
  }, {});

  const toggleCollapse = (date) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  return (
    <div className="flex-1 h-screen flex flex-col justify-between bg-gray-50 dark:bg-neutral-900">
      <div className="md:p-10 p-4 space-y-6 overflow-y-auto">
        <h2 className="text-2xl font-normal flex items-center gap-2">
          {/* <ShoppingCart className="w-6 h-6 text-orange-600" /> */}
          Admin Orders
        </h2>
        {/* Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="font-medium">Filter by status:</label>
          <select
            className="border px-3 py-2 rounded-lg shadow-sm bg-white dark:bg-neutral-800 dark:border-neutral-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* Grouped Orders */}
        {Object.entries(groupedOrders)
          .sort((a, b) => new Date(b[0]) - new Date(a[0]))
          .map(([date, dayOrders]) => {
            const dateObj = new Date(date);
            const dateLabel = `${dateObj.toLocaleDateString("en-GB")} (${dateObj.toLocaleDateString("en-US", { weekday: "long" })})`;
            const isCollapsed = collapsedGroups[date] || false;
            const totalAmount = dayOrders.reduce((sum, o) => sum + o.amount, 0);

            return (
              <div key={date} className="space-y-4">
                {/* Group Header */}
                <div
                  className="flex justify-between items-center cursor-pointer bg-gray-100 dark:bg-neutral-800 p-4 rounded-lg shadow-sm hover:shadow-md transition"
                  onClick={() => toggleCollapse(date)}
                >
                  <h3 className="text-lg font-semibold">{dateLabel}</h3>
                  <div className="text-sm text-right">
                    <p>{dayOrders.length} order(s)</p>
                    <p className="font-medium">{currency}{totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Orders */}
                {!isCollapsed &&
                  dayOrders.map((order, index) => {
                    const firstImage =
                      order.items?.[0]?.product?.image[0] || assets.box_icon;

                    return (
                      <div
                        key={index}
                        className="p-5 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg shadow-sm hover:shadow-md transition"
                      >
                        <div className="grid md:grid-cols-4 gap-6">
                          {/* Product Preview */}
                          <div className="flex gap-4">
                            <button
                              onClick={() => {
                                setModalItems(order.items || []);
                                setShowModal(true);
                              }}
                            >
                              <Image
                                className="w-16 h-16 object-cover rounded-md shadow"
                                src={firstImage}
                                alt="Product Image"
                                width={64}
                                height={64}
                              />
                            </button>
                            <div className="flex flex-col justify-center">
                              <p className="font-medium text-sm line-clamp-2">
                                {order.items
                                  .map(
                                    (item) =>
                                      `${item?.product?.name || "Unknown"} × ${item.quantity}`
                                  )
                                  .join(", ")}
                              </p>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {order.items.length} item(s)
                              </span>
                            </div>
                          </div>

                          {/* Customer Info */}
                          <div className="text-sm space-y-1">
                            <p>
                              <span className="font-medium">{order.address?.fullName}</span>
                            </p>
                            <p>{order.address?.country}</p>
                            <p>{order.address?.state}, {order.address?.city}</p>
                            <p className="text-gray-500">{order.address?.phoneNumber}</p>
                          </div>

                          {/* Amount */}
                          <div className="flex items-center font-semibold">
                            {currency}{order.amount}
                          </div>

                          {/* Status & Payment */}
                          <div className="text-sm space-y-2">
                            <p>Method: {order.paymentMethod}</p>
                            <p>Date: {new Date(order.date).toLocaleDateString("en-GB")}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.orderStatus === "Delivered"
                                ? "bg-green-100 text-green-700"
                                : order.orderStatus === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : order.orderStatus === "Cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {order.orderStatus || "N/A"}
                            </span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                              order.paymentStatus === "Paid"
                                ? "bg-green-100 text-green-700"
                                : order.paymentStatus === "Failed"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}>
                              {order.paymentStatus || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>

      {/* Pagination (sticky on mobile) */}
      {totalPages > 1 && (
        <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-700 py-3 flex justify-center gap-2 shadow-inner">
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            if (totalPages <= 7 || Math.abs(currentPage - page) <= 1 || page === 1 || page === totalPages) {
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    page === currentPage
                      ? "bg-black text-white"
                      : "bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600"
                  }`}
                >
                  {page}
                </button>
              );
            }
            if (
              (page === 2 && currentPage > 4) ||
              (page === totalPages - 1 && currentPage < totalPages - 3)
            ) {
              return <span key={page} className="px-2">…</span>;
            }
            return null;
          })}
        </div>
      )}

      {/* Order Items Modal */}
      {modalItems.length > 0 && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setModalItems([])}
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
            >
              ✖
            </button>
            <h2 className="text-lg font-semibold mb-4">🛍 Order Items</h2>
            <div className="divide-y divide-gray-200 dark:divide-neutral-700">
              {modalItems.map((item, index) => (
                <div key={index} className="flex gap-4 py-4">
                  <Image
                    src={item.product?.image[0] || assets.box_icon}
                    alt={item.product?.name || "Product"}
                    width={60}
                    height={60}
                    className="w-16 h-16 object-cover rounded-md shadow"
                  />
                  <div className="flex flex-col justify-center">
                    <p className="font-medium">{item.product?.name || "Unnamed Product"}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Quantity: {item.quantity}
                    </p>
                    {item.product?.price && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Price: {currency}{item.product.price.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderPanel;
