"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/admin/Footer";
import { assets } from "@/assets/assets";

const Orders = () => {
  const { currency, getToken, user } = useAppContext();
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
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/order/admin-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAdminOrders();
  }, [user]);

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
    <div className="flex-1 overflow-scroll h-screen text-sm flex flex-col justify-between">
      <div className="md:p-10 p-4 space-y-5">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Users Orders</h2>

        {/* Filter by status */}
        <div className="mb-4">
          <label className="mr-2 font-medium">Filter by status:</label>
          <select
            className="border px-3 py-1 rounded"
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

        {Object.entries(groupedOrders)
          .sort((a, b) => new Date(b[0]) - new Date(a[0]))
          .map(([date, dayOrders]) => {
            const dateObj = new Date(date);
            const dateLabel = `${dateObj.toLocaleDateString("en-GB")} (${dateObj.toLocaleDateString("en-US", { weekday: "long" })})`;
            const isCollapsed = collapsedGroups[date] || false;
            const totalAmount = dayOrders.reduce((sum, o) => sum + o.amount, 0);

            return (
              <div key={date} className="space-y-4 mb-8">
                <div
                  className="flex justify-between items-center cursor-pointer bg-gray-100 p-3 rounded"
                  onClick={() => toggleCollapse(date)}
                >
                  <h3 className="text-lg font-semibold">{dateLabel}</h3>
                  <div className="text-right">
                    <p>{dayOrders.length} order(s)</p>
                    <p>Total: {currency}{totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {!isCollapsed &&
                  dayOrders.map((order, index) => {
                    const firstImage =
                      order.items?.[0]?.product?.image[0] || assets.box_icon;

                    return (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row gap-5 justify-between p-5 border border-gray-300 rounded"
                      >
                        <div className="flex-1 flex gap-5 max-w-80">
                          <button
                            onClick={() => {
                              setModalItems(order.items || []);
                              setShowModal(true);
                            }}
                          >
                            <Image
                              className="w-16 h-16 object-cover rounded"
                              src={firstImage}
                              alt="Product Image"
                              width={64}
                              height={64}
                            />
                          </button>

                          <div className="flex flex-col gap-2">
                            <span className="font-medium text-base">
                              {order.items
                                .map(
                                  (item) =>
                                    `${item?.product?.name || "Unknown"} x ${item.quantity}`
                                )
                                .join(", ")}
                            </span>
                            <span>Items: {order.items.length}</span>
                          </div>
                        </div>

                        <div>
                          <p>
                            <span className="font-medium">
                              <strong>Full Name: </strong> {order.address?.fullName}
                            </span>
                            <br />
                            <strong>Country: </strong>{order.address?.country}
                            <br />
                            <strong>State: </strong>{`${order.address?.state}`}, <strong>City: </strong>{`${order.address?.city}`}
                            <br />
                            <strong>Phone number: </strong>{order.address?.phoneNumber}
                          </p>
                        </div>

                        <p className="font-medium my-auto">
                          {currency}
                          {order.amount}
                        </p>

                        <div>
                          <p className="flex flex-col">
                            <span>Method: {order.paymentMethod}</span>
                            <span>Date: {new Date(order.date).toLocaleDateString("en-GB")}</span>
                            <span>Order Status: {order.orderStatus || "N/A"}</span>
                            <span>Payment Status: {order.paymentStatus || "N/A"}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {[...Array(totalPages)].map((_, index) => {
            const page = index + 1;
            if (totalPages <= 10 || Math.abs(currentPage - page) <= 1 || page === 1 || page === totalPages) {
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded border ${
                    page === currentPage
                      ? "bg-black text-white"
                      : "bg-gray-100 text-black"
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
              return <span key={page}>...</span>;
            }

            return null;
          })}
        </div>
      )}

      {/* Modal to show all order items */}
      {modalItems.length > 0 && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow max-w-lg w-full overflow-y-auto max-h-[80vh] relative">
            <button
              onClick={() => setModalItems([])}
              className="absolute top-2 right-2 text-gray-600 hover:text-black dark:text-gray-300"
            >
              ✖
            </button>
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {modalItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-start border-b pb-4">
                  <Image
                    src={item.product?.image[0] || assets.box_icon}
                    alt={item.product?.name || "Product"}
                    width={60}
                    height={60}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
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


      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default Orders;
