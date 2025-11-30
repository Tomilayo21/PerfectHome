"use client";

import React from "react";
import { CSVLink } from "react-csv";

export default function ExportOrdersCSV({ orders = [] }) {
  if (!orders || orders.length === 0) {
    return (
      <button
        disabled
        className="bg-gray-300 text-gray-600 px-4 py-2 rounded cursor-not-allowed"
      >
        No Orders to Export
      </button>
    );
  }

  // Define CSV headers
  const headers = [
    { label: "Order ID", key: "_id" },
    { label: "Customer Name", key: "customerName" },
    { label: "Customer Email", key: "customerEmail" },
    { label: "Full Address", key: "fullAddress" },
    { label: "Order Date", key: "createdAt" },
    { label: "Status", key: "status" },
    { label: "Total Amount", key: "amount" },
    { label: "Payment Method", key: "paymentMethod" },
  ];

  // Map orders to CSV-friendly format
  const csvData = orders.map((order) => ({
    _id: order._id || "",
    customerName: order.address?.fullName || "N/A",
    customerEmail: order.email || "N/A",
    fullAddress: `${order.address?.country || ""}, ${order.address?.state || ""}, ${order.address?.city || ""}, ${order.address?.phoneNumber || ""}`,
    createdAt: order.date ? new Date(order.date).toLocaleString() : "",
    status: order.status || "",
    amount: order.amount ? order.amount.toFixed(2) : "0.00",
    paymentMethod: order.paymentMethod || "N/A",
  }));

  return (
    <CSVLink
      data={csvData}
      headers={headers}
      filename={`orders-${new Date().toISOString()}.csv`}
    >
      <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
        Export Orders CSV
      </button>
    </CSVLink>
  );
}
