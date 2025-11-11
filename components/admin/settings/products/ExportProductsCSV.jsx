"use client";
import React from "react";

export default function ExportProductsCSV({ filteredProducts }) {
  const handleExportCSV = () => {
    const headers = ["Name", "Category", "Price", "Stock", "Created At"];
    const rows = filteredProducts.map((p) => [
      p.name,
      p.category,
      p.offerPrice,
      p.stock,
      new Date(p.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExportCSV}
      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-md transition"
    >
      Export Products CSV
    </button>
  );
}
