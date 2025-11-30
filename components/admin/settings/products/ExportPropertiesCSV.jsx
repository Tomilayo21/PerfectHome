"use client";

export default function ExportPropertiesCSV({ properties }) {
  const handleExportCSV = () => {
    if (!properties || properties.length === 0) {
      alert("No properties available for export.");
      return;
    }

    const headers = [
      "Title",
      "Category",
      "Type",
      "Price",
      "Bedrooms",
      "Bathrooms",
      "Toilets",
      "Area (Sqm)",
      "Country",
      "State",
      "City",
      "Created At"
    ];

    const rows = properties.map((p) => [
      p.title,
      p.category || "N/A",
      p.type,
      p.price,
      p.bedrooms,
      p.bathrooms,
      p.toilets,
      p.area,
      p.country,
      p.state,
      p.city,
      new Date(p.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","), 
      ...rows.map((row) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "properties.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExportCSV}
      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-md transition"
    >
      Export Properties CSV
    </button>
  );
}
