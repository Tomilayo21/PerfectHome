"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { CheckCircle, XCircle } from "lucide-react";
import { Country, State, City } from "country-state-city";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

const propertyCategories = [
  "Apartment/Flat",
  "Duplexes",
  "Detached Houses",
  "Semi-Detached Houses",
  "Bungalows",
  "Mansions",
  "Penthouses",
  "Condominiums",
  "Terraces/Townhouses",
  "Studio Apartments",
  "Mini Flats",
  "Self-Contain Rooms",
  "Office Spaces",
  "Shops/Retail Spaces",
  "Shopping Complexes",
  "Warehouses",
  "Hotels/Motels",
  "Restaurants/Bars",
  "Event Centers/Halls",
  "Co-working Spaces",
  "Fuel Stations",
  "Banks/Financial Buildings",
  "Industrial Properties",
  "Residential Land",
  "Commercial Land",
  "Agricultural Land",
  "Industrial Land",
  "Mixed-Use Land",
  "Estate Land",
  "Waterfront Land",
  "Dry Land",
  "Wet Land",
  "Luxury Apartments",
  "Smart Homes",
  "Beach Houses",
  "Golf Estate Villas",
  "Waterfront Mansions",
  "Serviced Apartments",
  "Private Estates",
  "Short-Term Luxury Rentals",
  "Airbnb-Style Shortlets",
  "Holiday Homes",
  "Guest Houses",
  "Lodges",
  "Vacation Homes",
  "Factories",
  "Industrial Warehouses",
  "Cold Rooms",
  "Power Plants",
  "Logistic Hubs",
  "Storage Facilities",
  "Farmland",
  "Poultry Farms",
  "Fish Farms",
  "Ranches",
  "Plantations",
  "Greenhouses",
  "Mixed-Use Buildings",
  "Estates for Sale",
  "Property Development Sites",
  "Joint Venture (JV) Properties",
  "Rental Income Properties",
  "Distressed/Foreclosure Properties",
  "Schools/Colleges",
  "Hospitals/Clinics",
  "Churches/Mosques",
  "Training Centers",
  "Government Buildings",
  "Newly Built",
  "Renovated",
  "Under Construction",
  "Off-Plan Projects",
  "Furnished Properties",
  "Serviced Properties",
  "Affordable Housing",
  "Smart/Automated Homes",
  "Gated Community Homes",
];

const AddProperty = () => {
  const [files, setFiles] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("Rent");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [toilets, setToilets] = useState("");
   const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [uploading, setUploading] = useState(false);

  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState("");
  const [videoFiles, setVideoFiles] = useState([]);


  // Load all countries
  useEffect(() => {
    setCountryList(Country.getAllCountries());
  }, []);

  // Handle country selection
  const handleCountryChange = (e) => {
    const countryCode = e.target.value;
    setCountry(countryCode);
    setState("");
    setCity("");
    setStateList(State.getStatesOfCountry(countryCode));
    setCityList([]);
  };

  // Handle state selection
  const handleStateChange = (e) => {
    const stateCode = e.target.value;
    setState(stateCode);
    setCity("");
    setCityList(City.getCitiesOfState(country, stateCode));
  };

  // Handle city selection
  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (
        !title ||
        !description ||
        !price ||
        !country ||
        !state ||
        !city ||
        !address ||
        !area ||
        !toilets ||
        !category ||
        files.length === 0
      ) {
        toast.error("Please fill all required fields and upload at least one image.");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("type", type);
      formData.append("bedrooms", bedrooms);
      formData.append("bathrooms", bathrooms);
      formData.append("toilets", toilets);
      formData.append("area", area);
      formData.append("address", address);
      formData.append("country", country);
      formData.append("state", state);
      formData.append("city", city);
      formData.append("category", category);
      formData.append("features", JSON.stringify(features.filter(f => f.trim() !== "")));


      for (let i = 0; i < files.length; i++) {
        if (files[i]) formData.append("images", files[i]);
      }

        for (let i = 0; i < videoFiles.length; i++) {
        if (videoFiles[i]) formData.append("videos", videoFiles[i]);
        }

      await axios.post("/api/property/add", formData);

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
          >
            <CheckCircle className="text-orange-500" size={22} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Property added successfully!
            </p>
          </div>
        ),
        { duration: 3500, position: "top-right" }
      );

      // Reset form
      setFiles([]);
      setTitle("");
      setDescription("");
      setPrice("");
      setType("Rent");
      setBedrooms("");
      setBathrooms("");
      setToilets("");
      setArea("");
      setAddress("");
      setCountry("");
      setState("");
      setCity("");
      setStateList([]);
      setCityList([]);
      setCategory("");
      setFeatures([]);
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
              {error.response?.data?.message || error.message || "Upload failed"}
            </p>
          </div>
        ),
        { duration: 3000, position: "top-right" }
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50">
    <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto px-4 sm:px-6 md:px-10 py-8 space-y-10"
    >
        <div className="text-center">
        <h1 className="text-3xl font-semibold text-gray-900">Add New Property</h1>
        <p className="text-gray-500 text-sm mt-1">
            Fill out the details below to add a property to your listing
        </p>
        </div>

        {/* Upload Section */}
        <section className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Media Upload</h2>

        {/* Images */}
        <div>
            <h3 className="text-base font-medium text-gray-700 mb-2">Property Images</h3>
            <p className="text-sm text-gray-500 mb-4">
            Upload up to 10 images. The first image will be set as the primary.
            </p>

            <div className="flex flex-wrap gap-4">
            {files.map((file, index) => (
                <div
                key={index}
                className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden shadow group"
                >
                <Image
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                />
                <span
                    className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                    index === 0
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-white opacity-80"
                    }`}
                >
                    {index === 0 ? "Primary" : "Secondary"}
                </span>

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col justify-center items-center gap-2">
                    {index !== 0 && (
                    <button
                        onClick={() => {
                        const reordered = [file, ...files.filter((_, i) => i !== index)];
                        setFiles(reordered);
                        }}
                        type="button"
                        className="text-white text-xs bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
                    >
                        Make Primary
                    </button>
                    )}
                    <button
                    onClick={() => {
                        const updated = [...files];
                        updated.splice(index, 1);
                        setFiles(updated);
                    }}
                    type="button"
                    className="text-white text-xs bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                    >
                    Remove
                    </button>
                </div>
                </div>
            ))}

            {files.length < 10 && (
                <label className="w-28 h-28 sm:w-32 sm:h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 cursor-pointer transition">
                <input
                    type="file"
                    hidden
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                    const newFiles = Array.from(e.target.files);
                    setFiles([...files, ...newFiles]);
                    }}
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs font-medium">Add Image</span>
                </label>
            )}
            </div>
        </div>

        {/* Videos */}
        <div>
            <h3 className="text-base font-medium text-gray-700 mb-2">Property Videos (Optional)</h3>
            <p className="text-sm text-gray-500 mb-4">Upload up to 3 videos (max 200MB each).</p>

            <div className="flex flex-wrap gap-4">
            {videoFiles.map((file, index) => (
                <div
                key={index}
                className="relative w-40 h-28 bg-black rounded-xl overflow-hidden shadow group"
                >
                <video src={URL.createObjectURL(file)} className="object-cover w-full h-full" controls />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex justify-center items-center">
                    <button
                    onClick={() => {
                        const updated = [...videoFiles];
                        updated.splice(index, 1);
                        setVideoFiles(updated);
                    }}
                    type="button"
                    className="text-white text-xs bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                    >
                    Remove
                    </button>
                </div>
                </div>
            ))}

            {videoFiles.length < 3 && (
                <label className="w-40 h-28 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 cursor-pointer transition">
                <input
                    type="file"
                    hidden
                    accept="video/*"
                    multiple
                    onChange={(e) => {
                    const newVideos = Array.from(e.target.files);
                    setVideoFiles([...videoFiles, ...newVideos]);
                    }}
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 mb-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs font-medium">Add Video</span>
                </label>
            )}
            </div>
        </div>
        </section>

        {/* Property Details */}
        <section className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Property Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input
                type="text"
                placeholder="Luxury Apartment"
                className="input-style"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
            />
            </div>

            <div>
            <label className="text-sm font-medium text-gray-700">Price (₦)</label>
            <input
                type="number"
                placeholder="10000000"
                className="input-style"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
            />
            </div>

            <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
                className="input-style"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
            >
                <option value="">Select Category</option>
                {propertyCategories.map((cat) => (
                <option key={cat} value={cat}>
                    {cat}
                </option>
                ))}
            </select>
            </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Property Features</h3>
                {features.length > 0 && (
                <span className="text-sm text-gray-500">{features.length} added</span>
                )}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                <input
                    type="text"
                    placeholder="Add a feature (e.g. Swimming Pool, Smart Lighting)"
                    className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition placeholder:text-gray-400 text-sm"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                    if (e.key === "Enter" && featureInput.trim()) {
                        e.preventDefault();
                        if (!features.includes(featureInput.trim())) {
                        setFeatures([...features, featureInput.trim()]);
                        }
                        setFeatureInput("");
                    }
                    }}
                />

                </div>

            <button
            type="button"
            className="relative flex items-center justify-center w-11 h-11 rounded-full bg-orange-600 hover:from-orange-700 hover:to-orange-600 text-white shadow-md transition-all duration-200 hover:shadow-lg active:scale-95"
            onClick={() => {
                if (featureInput.trim() && !features.includes(featureInput.trim())) {
                setFeatures([...features, featureInput.trim()]);
                setFeatureInput("");
                }
            }}
            title="Add Feature"
            >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            </button>

            </div>

            {features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                {features.map((feature, idx) => (
                    <span
                    key={idx}
                    className="group flex items-center gap-2 px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full text-sm font-medium hover:bg-orange-100 transition"
                    >
                    <span>{feature}</span>
                    <button
                        type="button"
                        onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                        className="text-orange-400 hover:text-orange-700 transition"
                    >
                        <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    </span>
                ))}
                </div>
            )}

            {features.length === 0 && (
                <p className="text-sm text-gray-500 italic">No features added yet.</p>
            )}
            </div>


        <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
            placeholder="Describe the property..."
            rows="4"
            className="input-style resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            ></textarea>
        </div>
        </section>

        {/* Location Section */}
        <section className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Location</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
            <label className="text-sm font-medium text-gray-700">Country</label>
            <select
                value={country}
                onChange={handleCountryChange}
                className="input-style"
            >
                <option value="">Select Country</option>
                {countryList.map((c) => (
                <option key={c.isoCode} value={c.isoCode}>
                    {c.name}
                </option>
                ))}
            </select>
            </div>

            <div>
            <label className="text-sm font-medium text-gray-700">State</label>
            <select
                value={state}
                onChange={handleStateChange}
                className="input-style"
                disabled={!country}
            >
                <option value="">Select State</option>
                {stateList.map((s) => (
                <option key={s.isoCode} value={s.isoCode}>
                    {s.name}
                </option>
                ))}
            </select>
            </div>

            <div>
            <label className="text-sm font-medium text-gray-700">City</label>
            <select
                value={city}
                onChange={handleCityChange}
                className="input-style"
                disabled={!state}
            >
                <option value="">Select City</option>
                {cityList.map((c) => (
                <option key={c.name} value={c.name}>
                    {c.name}
                </option>
                ))}
            </select>
            </div>
        </div>

        <div>
            <label className="text-sm font-medium text-gray-700">Full Address</label>
            <input
            type="text"
            placeholder="e.g. No 12 Lekki Gardens, Phase 2"
            className="input-style"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            />
        </div>
        </section>

        {/* Property Type / Options */}
        <section className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 mb-6">Specifications</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
            <label className="text-sm font-medium text-gray-700">Type</label>
            <select
                className="input-style"
                value={type}
                onChange={(e) => setType(e.target.value)}
            >
                <option value="Rent">Rent</option>
                <option value="Sale">Sale</option>
                <option value="Shortlet">Shortlet</option>
            </select>
            </div>

            <div>
            <label className="text-sm font-medium text-gray-700">Bedrooms</label>
            <input
                type="number"
                placeholder="3"
                className="input-style"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
            />
            </div>

            <div>
            <label className="text-sm font-medium text-gray-700">Bathrooms</label>
            <input
                type="number"
                placeholder="2"
                className="input-style"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
            />
            </div>

            <div>
            <label className="text-sm font-medium text-gray-700">Toilets</label>
            <input
                type="number"
                placeholder="2"
                className="input-style"
                value={toilets}
                onChange={(e) => setToilets(e.target.value)}
            />
            </div>

            <div>
            <label className="text-sm font-medium text-gray-700">Area (sqft)</label>
            <input
                type="text"
                placeholder="1200 sqft"
                className="input-style"
                value={area}
                onChange={(e) => setArea(e.target.value)}
            />
            </div>
        </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end">
        <button
            type="submit"
            disabled={uploading}
            className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 shadow transition disabled:opacity-50"
        >
            {uploading ? "Uploading..." : "Add Property"}
        </button>
        </div>
    </form>
    </div>

  );
};

export default AddProperty;
