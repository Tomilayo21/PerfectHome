"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, 
    Trash2, 
    Edit, 
    Video, 
    Home, 
    Loader2, 
    ImagePlus, 
    Eye, 
    EyeOff, 
    ChevronDown, 
    ChevronUp 
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { propertyCategories } from "@/utils/propertyCategories";
import { motion, AnimatePresence } from "framer-motion";


export default function PropertyListPanel() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [openProperty, setOpenProperty] = useState(null);
  const [editableProperty, setEditableProperty] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const limit = 10;

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/property/admin-list", {
        params: { search, type: filterType, sort, page, limit },
      });
      setProperties(res.data.properties);
      setTotal(res.data.total);
    } catch (err) {
      toast.error("Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [search, filterType, sort, page]);

  // Delete handler
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      await axios.delete(`/api/property/${id}`);
      toast.success("Property deleted");
      fetchProperties();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  // Open edit modal
  const handleEdit = (property) => {
    setEditableProperty({ ...property, newImages: [], newVideos: [] });
    setOpenProperty(property._id);
  };

  // Upload helper (for both images and videos)
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/api/upload", formData);
      return res.data.url;
    } catch (err) {
      toast.error("Upload failed");
      return null;
    }
  };

  // Submit updates
  const handlePropertyUpdate = async () => {
    try {
      setIsUpdating(true);

      // Upload new images
      let newImageUrls = [];
      if (editableProperty.newImages?.length > 0) {
        newImageUrls = await Promise.all(editableProperty.newImages.map(handleFileUpload));
      }

      // Upload new videos
      let newVideoUrls = [];
      if (editableProperty.newVideos?.length > 0) {
        newVideoUrls = await Promise.all(editableProperty.newVideos.map(handleFileUpload));
      }

      const updatedProperty = {
        ...editableProperty,
        images: [...(editableProperty.images || []), ...newImageUrls.filter(Boolean)],
        videos: [...(editableProperty.videos || []), ...newVideoUrls.filter(Boolean)],
      };

      delete updatedProperty.newImages;
      delete updatedProperty.newVideos;

      await axios.put(`/api/property/${editableProperty._id}`, updatedProperty);
      toast.success("Property updated successfully");
      setOpenProperty(null);
      fetchProperties();
    } catch (err) {
      toast.error("Failed to update property");
    } finally {
      setIsUpdating(false);
    }
  };

    const toggleVisibility = async (id, currentVisibility) => {
    try {
        const { data } = await axios.patch(`/api/property/${id}`, {
        visible: !currentVisibility,
        });

        if (data.success) {
        toast.success(`Property is now ${data.property.visible ? "Visible" : "Hidden"}`);
        setProperties((prev) =>
            prev.map((p) =>
            p._id === id ? { ...p, visible: data.property.visible } : p
            )
        );
        } else {
        toast.error(data.message || "Failed to toggle visibility");
        }
    } catch (err) {
        toast.error(err.response?.data?.message || "Error toggling visibility");
    }
    };

    const [expanded, setExpanded] = useState(null); // Track which card is open

  const toggleCard = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };


  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Home className="text-orange-500" /> Property Management
        </h1>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search properties..."
              className="pl-9 pr-3 py-2 rounded-md bg-white dark:bg-gray-800 text-sm border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-orange-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
          >
            <option value="">All Types</option>
            <option value="Sale">Sale</option>
            <option value="Rent">Rent</option>
            <option value="Shortlet">Shortlet</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-sm"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <th className="px-4 py-3 text-left">Thumbnail</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Rooms</th>
                <th className="px-4 py-3 text-center">Actions</th>
                </tr>
            </thead>

            <tbody>
                {loading ? (
                <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                    <Loader2 className="animate-spin inline-block mr-2" /> Loading properties...
                    </td>
                </tr>
                ) : properties.length === 0 ? (
                <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                    No properties found.
                    </td>
                </tr>
                ) : (
                properties.map((p) => (
                    <tr
                    key={p._id}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                    <td className="px-4 py-3">
                        <div className="w-20 h-14 relative rounded-md overflow-hidden">
                        <Image
                            src={p.images?.[0] || "/placeholder.jpg"}
                            alt={p.title}
                            fill
                            className="object-cover"
                        />
                        </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{p.title}</td>
                    <td className="px-4 py-3">{p.type}</td>
                    <td className="px-4 py-3 text-orange-600 font-semibold">
                        ₦{Number(p.price).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{p.city}, {p.state}</td>
                    <td className="px-4 py-3">{p.category || "-"}</td>
                    <td className="px-4 py-3">
                        {p.bedrooms || 0} Bed / {p.bathrooms || 0} Bath
                    </td>
                    <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-3">
                        <button
                            onClick={() => handleEdit(p)}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => handleDelete(p._id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 size={16} />
                        </button>
                        <button
                            onClick={() => toggleVisibility(p._id, p.visible)}
                            className={`p-2 rounded-md transition ${
                            p.visible
                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                : "bg-gray-400 hover:bg-gray-500 text-white"
                            }`}
                            title={p.visible ? "Hide Property" : "Show Property"}
                        >
                            {p.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        </div>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>

        {/* Mobile Cards */}
            {/* <div className="md:hidden space-y-4">
                {loading ? (
                <div className="text-center py-8 text-gray-500">
                    <Loader2 className="animate-spin inline-block mr-2" /> Loading properties...
                </div>
                ) : properties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No properties found.</div>
                ) : (
                properties.map((p) => (
                    <div
                    key={p._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-3 shadow-sm bg-white dark:bg-gray-800"
                    >
                    <div className="flex gap-3 items-start">
                        <div className="w-24 h-20 relative rounded-md overflow-hidden flex-shrink-0">
                        <Image
                            src={p.images?.[0] || "/placeholder.jpg"}
                            alt={p.title}
                            fill
                            className="object-cover"
                        />
                        </div>
                        <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base">{p.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{p.type} • {p.category}</p>
                        <p className="text-orange-600 font-semibold text-sm mt-1">
                            ₦{Number(p.price).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {p.city}, {p.state}
                        </p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                        {p.bedrooms || 0} Bed / {p.bathrooms || 0} Bath
                        </p>

                        <div className="flex gap-2">
                        <button
                            onClick={() => handleEdit(p)}
                            className="text-blue-500 hover:text-blue-700"
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            onClick={() => handleDelete(p._id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 size={16} />
                        </button>
                        <button
                            onClick={() => toggleVisibility(p._id, p.visible)}
                            className={`p-2 rounded-md transition ${
                            p.visible
                                ? "bg-orange-500 hover:bg-orange-600 text-white"
                                : "bg-gray-400 hover:bg-gray-500 text-white"
                            }`}
                            title={p.visible ? "Hide Property" : "Show Property"}
                        >
                            {p.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        </div>
                    </div>
                    </div>
                ))
                )}
            </div> */}

            <div className="md:hidden space-y-4">
                {loading ? (
                <div className="text-center py-8 text-gray-500">
                    <Loader2 className="animate-spin inline-block mr-2" /> Loading properties...
                </div>
                ) : properties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No properties found.</div>
                ) : (
                properties.map((p) => (
                    <div
                    key={p._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800 overflow-hidden"
                    >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between p-4 cursor-pointer"
                        onClick={() => toggleCard(p._id)}
                    >
                        <div className="flex gap-3 items-center">
                        <div className="w-16 h-14 relative rounded-md overflow-hidden flex-shrink-0">
                            <Image
                            src={p.images?.[0] || "/placeholder.jpg"}
                            alt={p.title}
                            fill
                            className="object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{p.title}</h3>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                            {p.type} • {p.category || "-"}
                            </p>
                            <p className="text-orange-600 font-semibold text-sm mt-1">
                            ₦{Number(p.price).toLocaleString()}
                            </p>
                        </div>
                        </div>

                        {expanded === p._id ? (
                        <ChevronUp className="text-gray-500" size={18} />
                        ) : (
                        <ChevronDown className="text-gray-500" size={18} />
                        )}
                    </div>

                    {/* Expandable Body */}
                    <AnimatePresence>
                        {expanded === p._id && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700"
                        >
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {p.city}, {p.state}
                            </p>

                            {p.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                                {p.description}
                            </p>
                            )}

                            {p.features?.length > 0 && (
                            <ul className="text-xs text-gray-600 dark:text-gray-400 mt-3 list-disc pl-4 space-y-1">
                                {p.features.map((f, i) => (
                                <li key={i}>{f}</li>
                                ))}
                            </ul>
                            )}

                            <div className="flex justify-between items-center mt-3">
                            <p className="text-xs text-gray-500">
                                {p.bedrooms || 0} Bed / {p.bathrooms || 0} Bath
                            </p>

                            <div className="flex gap-2">
                                <button
                                onClick={() => handleEdit(p)}
                                className="text-blue-500 hover:text-blue-700"
                                >
                                <Edit size={16} />
                                </button>
                                <button
                                onClick={() => handleDelete(p._id)}
                                className="text-red-500 hover:text-red-700"
                                >
                                <Trash2 size={16} />
                                </button>
                                <button
                                onClick={() => toggleVisibility(p._id, p.visible)}
                                className={`p-2 rounded-md transition ${
                                    p.visible
                                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                                    : "bg-gray-400 hover:bg-gray-500 text-white"
                                }`}
                                title={p.visible ? "Hide Property" : "Show Property"}
                                >
                                {p.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                                </button>
                            </div>
                            </div>
                        </motion.div>
                        )}
                    </AnimatePresence>
                    </div>
                ))
                )}
            </div>            
        </div>


      {/* Edit Modal */}
        {openProperty && editableProperty && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-6 max-w-4xl w-full relative shadow-2xl space-y-6 text-sm max-h-[90vh] overflow-y-auto">

                {/* Close Button */}
                <button
                    onClick={() => setOpenProperty(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
                >
                    ✖
                </button>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 border-b pb-3">
                    Edit Property
                </h2>

                {/* Basic Info */}
                <div className="space-y-4">
                    {/* Title */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                        type="text"
                        value={editableProperty.title}
                        onChange={(e) => setEditableProperty({ ...editableProperty, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                    </div>

                    {/* Type and Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                        value={editableProperty.type}
                        onChange={(e) =>
                            setEditableProperty({ ...editableProperty, type: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                        <option value="Rent">Rent</option>
                        <option value="Sale">Sale</option>
                        <option value="Shortlet">Shortlet</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                        value={editableProperty.category || ""}
                        onChange={(e) =>
                            setEditableProperty({ ...editableProperty, category: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                        <option value="">Select category</option>
                        {propertyCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                        </select>
                    </div>
                    </div>

                    {/* Price */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                        type="number"
                        value={editableProperty.price}
                        onChange={(e) =>
                        setEditableProperty({ ...editableProperty, price: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                    </div>

                    {/* Description */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        rows={4}
                        value={editableProperty.description}
                        onChange={(e) =>
                        setEditableProperty({ ...editableProperty, description: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                    </div>

                    {/* Features */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Features (comma separated)</label>
                    <input
                        type="text"
                        value={editableProperty.features?.join(", ") || ""}
                        onChange={(e) =>
                        setEditableProperty({
                            ...editableProperty,
                            features: e.target.value.split(",").map((f) => f.trim()),
                        })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                    </div>

                    {/* Rooms & Area */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                        <input
                        type="number"
                        value={editableProperty.bedrooms || 0}
                        onChange={(e) =>
                            setEditableProperty({ ...editableProperty, bedrooms: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                        <input
                        type="number"
                        value={editableProperty.bathrooms || 0}
                        onChange={(e) =>
                            setEditableProperty({ ...editableProperty, bathrooms: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Toilets</label>
                        <input
                        type="number"
                        value={editableProperty.toilets || 0}
                        onChange={(e) =>
                            setEditableProperty({ ...editableProperty, toilets: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area (sqft)</label>
                        <input
                        type="text"
                        value={editableProperty.area || ""}
                        onChange={(e) =>
                            setEditableProperty({ ...editableProperty, area: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                        type="text"
                        value={editableProperty.country}
                        onChange={(e) =>
                            setEditableProperty({ ...editableProperty, country: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                        type="text"
                        value={editableProperty.state}
                        onChange={(e) =>
                            setEditableProperty({ ...editableProperty, state: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <input
                        type="text"
                        value={editableProperty.city}
                        onChange={(e) =>
                            setEditableProperty({ ...editableProperty, city: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                        type="text"
                        value={editableProperty.address}
                        onChange={(e) =>
                            setEditableProperty({ ...editableProperty, address: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        />
                    </div>
                    </div>
                </div>

                {/* Media Section */}
                <div className="border-t pt-4 space-y-4">
                    <p className="text-base font-semibold mb-2">Property Images</p>
                    <div className="flex flex-wrap items-start gap-3">
                    {[...(editableProperty.images || []), ...(editableProperty.newImagesPreview || [])].map((img, i) => {
                        const totalExisting = editableProperty.images?.length || 0;
                        const isNew = i >= totalExisting;
                        const realIndex = isNew ? i - totalExisting : i;
                        return (
                        <div key={i} className="relative w-24 h-24 flex-shrink-0 group">
                            <div className="w-24 h-24 border border-gray-300 rounded-lg overflow-hidden relative shadow-sm">
                            <Image
                                src={typeof img === "string" ? img : URL.createObjectURL(img)}
                                alt={`property-img-${i}`}
                                width={96}
                                height={96}
                                className="object-cover w-full h-full group-hover:scale-105 transition"
                            />
                            <button
                                onClick={() => {
                                if (!isNew) {
                                    setEditableProperty((prev) => ({
                                    ...prev,
                                    images: prev.images.filter((_, index) => index !== realIndex),
                                    }));
                                } else {
                                    const newImgs = [...(editableProperty.newImages || [])];
                                    const previews = [...(editableProperty.newImagesPreview || [])];
                                    newImgs.splice(realIndex, 1);
                                    previews.splice(realIndex, 1);
                                    setEditableProperty((prev) => ({
                                    ...prev,
                                    newImages: newImgs,
                                    newImagesPreview: previews,
                                    }));
                                }
                                }}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-800"
                                title="Remove"
                            >
                                –
                            </button>
                            </div>
                        </div>
                        );
                    })}

                    {/* Add Image */}
                    <label className="w-24 h-24 border border-dashed border-gray-400 rounded-lg cursor-pointer flex items-center justify-center hover:border-orange-500 hover:text-orange-500 transition">
                        <input
                        type="file"
                        hidden
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            const files = Array.from(e.target.files);
                            setEditableProperty((prev) => ({
                            ...prev,
                            newImages: [...(prev.newImages || []), ...files],
                            newImagesPreview: [...(prev.newImagesPreview || []), ...files],
                            }));
                        }}
                        />
                        <span className="text-xl font-bold">+</span>
                    </label>
                    </div>

                    {/* Videos */}
                    <div className="border-t pt-4">
                    <p className="text-base font-semibold mb-2">Property Videos</p>
                    <div className="flex flex-wrap items-start gap-3">
                        {[...(editableProperty.videos || []), ...(editableProperty.newVideosPreview || [])].map((vid, i) => {
                        const totalExisting = editableProperty.videos?.length || 0;
                        const isNew = i >= totalExisting;
                        const realIndex = isNew ? i - totalExisting : i;
                        return (
                            <div key={i} className="relative w-32 h-24 flex-shrink-0 group border rounded-lg overflow-hidden shadow-sm">
                            <video
                                controls
                                src={typeof vid === "string" ? vid : URL.createObjectURL(vid)}
                                className="object-cover w-full h-full"
                            />
                            <button
                                onClick={() => {
                                if (!isNew) {
                                    setEditableProperty((prev) => ({
                                    ...prev,
                                    videos: prev.videos.filter((_, index) => index !== realIndex),
                                    }));
                                } else {
                                    const newVids = [...(editableProperty.newVideos || [])];
                                    const previews = [...(editableProperty.newVideosPreview || [])];
                                    newVids.splice(realIndex, 1);
                                    previews.splice(realIndex, 1);
                                    setEditableProperty((prev) => ({
                                    ...prev,
                                    newVideos: newVids,
                                    newVideosPreview: previews,
                                    }));
                                }
                                }}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-800"
                            >
                                –
                            </button>
                            </div>
                        );
                        })}

                        {/* Add Video */}
                        <label className="w-32 h-24 border border-dashed border-gray-400 rounded-lg cursor-pointer flex items-center justify-center hover:border-orange-500 hover:text-orange-500 transition">
                        <input
                            type="file"
                            hidden
                            accept="video/*"
                            multiple
                            onChange={(e) => {
                            const files = Array.from(e.target.files);
                            setEditableProperty((prev) => ({
                                ...prev,
                                newVideos: [...(prev.newVideos || []), ...files],
                                newVideosPreview: [...(prev.newVideosPreview || []), ...files],
                            }));
                            }}
                        />
                        <span className="text-xl font-bold">+</span>
                        </label>
                    </div>
                    </div>
                </div>

                {/* Submit */}
                <button
                    className="mt-4 w-full bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 transition"
                    onClick={() => handlePropertyUpdate(editableProperty)}
                    disabled={isUpdating}
                >
                    {isUpdating ? "Updating..." : "Update Property"}
                </button>
                </div>
            </div>
        )}

    </div>
  );
}
