"use client";

import * as Select from "@radix-ui/react-select";
import { ChevronDown, SlidersHorizontal, ListFilter } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useMemo, useRef } from "react";
import { useAppContext } from "@/context/AppContext";

/**
 * PropertyFilterBar.jsx
 * - numeric inputs (bedrooms, bathrooms, toilets, area) now debounce and only set valid values
 * - empty inputs remove the param (so clearing the input actually clears the filter)
 * - Select filters (state, category, type, feature) set string params
 * - uses router.push to update query (keeps history); change to router.replace if you prefer not to create history entries
 */

export default function PropertyFilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const { currency } = useAppContext();

  // debounce timers for numeric inputs
  const timers = useRef({});

  // write or remove a query param
  const writeParam = (params, name, value) => {
    if (value === "" || value == null) {
      params.delete(name);
    } else {
      params.set(name, String(value));
    }
  };

  // central handler (name = param name)
  const handleFilterChange = (name, value, { immediate } = {}) => {
    // numeric inputs call this frequently; we debounce those
    const numericKeys = ["bedrooms", "bathrooms", "toilets", "area", "min", "max"];

    // convert value to trimmed string
    const raw = value == null ? "" : String(value).trim();

    // special-case price when you want to clear min/max elsewhere — here we just set min/max directly
    if (numericKeys.includes(name) && !immediate) {
      // clear any existing timer
      if (timers.current[name]) clearTimeout(timers.current[name]);
      timers.current[name] = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        // only set if raw is a valid number; otherwise remove param
        if (raw === "") {
          params.delete(name);
        } else {
          // allow numeric but also prevent leading zeros weirdness
          const num = Number(raw);
          if (!Number.isFinite(num) || Number.isNaN(num)) {
            params.delete(name);
          } else {
            params.set(name, String(num));
          }
        }
        router.push(`${window.location.pathname}?${params.toString()}`);
      }, 400); // 400ms debounce
      return;
    }

    // immediate (Selects / non-numeric) or when immediate flag is true
    const params = new URLSearchParams(searchParams.toString());

    // delete when empty string
    if (raw === "") {
      params.delete(name);
    } else {
      // for numeric-like keys we try to set numeric form (but as string in URL)
      if (["min", "max", "bedrooms", "bathrooms", "toilets", "area"].includes(name)) {
        const num = Number(raw);
        if (!Number.isFinite(num) || Number.isNaN(num)) {
          params.delete(name);
        } else {
          params.set(name, String(num));
        }
      } else {
        params.set(name, raw);
      }
    }

    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const triggerClasses =
    "flex items-center justify-between w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white";
  const itemClasses =
    "text-sm px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 data-[state=checked]:bg-gray-200";

  // === summary chips ===
  const summaryChips = useMemo(() => {
    const paramsObj = Object.fromEntries(searchParams.entries());
    const chips = [];

    const sortLabels = {
      "asc price": "Price (low → high)",
      "desc price": "Price (high → low)",
      "asc date": "Oldest",
      "desc date": "Newest",
    };

    for (const [key, value] of Object.entries(paramsObj)) {
      if (key === "min" || key === "max") continue;
      if (key === "sort") chips.push({ name: key, label: sortLabels[value] || `${key}: ${value}` });
      else chips.push({ name: key, label: `${key}: ${value}` });
    }

    const min = searchParams.get("min");
    const max = searchParams.get("max");
    if (min || max) chips.push({ name: "price", label: `${currency}${min || "0"} – ${currency}${max || "∞"}` });

    return chips;
  }, [searchParams, currency]);

  const propertyTypes = ["Rent", "Sale", "Shortlet"];
  const propertyCategories = [
    "Apartment/Flat",
    "Duplexes",
    "Detached Houses",
    "Semi-Detached Houses",
    "Bungalows",
    "Mansions",
    "Penthouses",
    "Condominiums",
    "Studio Apartments",
    "Office Spaces",
    "Warehouses",
    "Hotels/Motels",
    "Event Centers/Halls",
    "Land",
    "Luxury Apartments",
    "Smart Homes",
  ];
  const states = ["Lagos", "Abuja", "Rivers", "Oyo", "Ogun", "Enugu", "Kano", "Anambra"];
  const features = ["Swimming Pool", "Security", "Parking Space", "Gym", "Furnished", "Power Supply", "Internet"];

  const formatWithCommas = (num) => {
    if (!num) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* summary chips */}
      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-700">
        {summaryChips.length > 0 && (
          <>
            <span className="font-medium text-gray-500 mr-1">Showing results for:</span>
            {summaryChips.map((chip, idx) => (
              <span key={idx} className="flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-full">
                {chip.label}
                <button
                  onClick={() =>
                    chip.name === "price"
                      ? (handleFilterChange("min", "", { immediate: true }), handleFilterChange("max", "", { immediate: true }))
                      : handleFilterChange(chip.name, "", { immediate: true })
                  }
                  className="ml-1 text-orange-500 hover:text-orange-700 focus:outline-none"
                  aria-label={`Remove ${chip.label}`}
                >
                  ×
                </button>
              </span>
            ))}
            <button onClick={() => router.push(window.location.pathname)} className="ml-2 text-xs md:text-sm text-orange-600 hover:text-orange-800 font-medium underline">
              Clear all
            </button>
          </>
        )}
      </div>

      {/* filters */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
        <div className="w-full md:w-auto">
          <button className="flex items-center justify-between w-full md:hidden bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-3"
            onClick={() => setShowFilters(!showFilters)}>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-normal text-black">Filters</span>
            </div>
            <span className="text-xs text-gray-500">{showFilters ? "Hide" : "Show"}</span>
          </button>

          <div className={`transition-all duration-300 overflow-hidden ${showFilters ? "max-h-screen mt-3" : "max-h-0"} md:max-h-none md:mt-0`}>
            <div className="flex flex-col sm:flex-row flex-wrap items-start gap-4 bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-3">
              {/* Price */}
              <div className="flex flex-col w-full sm:w-auto">
                <label className="text-xs font-medium text-gray-500 mb-1">Price</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="min"
                    placeholder="Min"
                    className="text-xs rounded-lg px-3 py-2 w-24 border border-gray-300 focus:ring-2 focus:ring-black outline-none"
                    defaultValue={formatWithCommas(searchParams.get("min") || "")}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, ""); // remove commas
                      if (raw === "") {
                        handleFilterChange("min", "");
                        e.target.value = "";
                        return;
                      }
                      if (isNaN(raw) || Number(raw) < 0) return; // 🚫 skip invalid or negative
                      e.target.value = formatWithCommas(raw);
                      handleFilterChange("min", raw);
                    }}
                  />
                  <span className="text-gray-400 text-xs">—</span>
                  <input
                    type="text"
                    name="max"
                    placeholder="Max"
                    className="text-xs rounded-lg px-3 py-2 w-24 border border-gray-300 focus:ring-2 focus:ring-black outline-none"
                    defaultValue={formatWithCommas(searchParams.get("max") || "")}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (raw === "") {
                        handleFilterChange("max", "");
                        e.target.value = "";
                        return;
                      }
                      if (isNaN(raw) || Number(raw) < 0) return; // 🚫 skip invalid or negative
                      e.target.value = formatWithCommas(raw);
                      handleFilterChange("max", raw);
                    }}
                  />
                </div>
              </div>



              {/* Select filters (type, category, state, feature) */}
              <SelectFilter label="Type" name="type" options={propertyTypes} searchParams={searchParams} onChange={(n,v) => handleFilterChange(n,v,{ immediate:true })} triggerClasses={triggerClasses} itemClasses={itemClasses} />
              <SelectFilter label="Category" name="category" options={propertyCategories} searchParams={searchParams} onChange={(n,v) => handleFilterChange(n,v,{ immediate:true })} triggerClasses={triggerClasses} itemClasses={itemClasses} />
              <SelectFilter label="State" name="state" options={states} searchParams={searchParams} onChange={(n,v) => handleFilterChange(n,v,{ immediate:true })} triggerClasses={triggerClasses} itemClasses={itemClasses} />
              <SelectFilter label="Feature" name="feature" options={features} searchParams={searchParams} onChange={(n,v) => handleFilterChange(n,v,{ immediate:true })} triggerClasses={triggerClasses} itemClasses={itemClasses} />

              {/* Numeric filters (debounced) */}
              <NumberInputFilter label="Bedrooms" name="bedrooms" defaultValue={searchParams.get("bedrooms") || ""} onChange={(n,v) => handleFilterChange(n,v)} />
              <NumberInputFilter label="Bathrooms" name="bathrooms" defaultValue={searchParams.get("bathrooms") || ""} onChange={(n,v) => handleFilterChange(n,v)} />
              <NumberInputFilter label="Toilets" name="toilets" defaultValue={searchParams.get("toilets") || ""} onChange={(n,v) => handleFilterChange(n,v)} />
              <NumberInputFilter label="Area (sqm)" name="area" defaultValue={searchParams.get("area") || ""} onChange={(n,v) => handleFilterChange(n,v)} />
            </div>
          </div>
        </div>

        {/* Right: Sort */}
        <div className="flex flex-col w-full sm:w-auto mt-3 md:mt-0">
          <label className="text-xs font-medium text-gray-500 mb-1 block">Sort</label>
          <Select.Root defaultValue={searchParams.get("sort") || undefined} onValueChange={(value) => handleFilterChange("sort", value, { immediate: true })}>
            <Select.Trigger className={`${triggerClasses} w-auto min-w-[9rem] flex items-center justify-between gap-2`}>
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <ListFilter className="w-4 h-4 text-gray-500" />
                <span>
                  {(() => {
                    const sort = searchParams.get("sort");
                    if (sort === "asc price") return "Price (low → high)";
                    if (sort === "desc price") return "Price (high → low)";
                    if (sort === "asc date") return "Oldest";
                    if (sort === "desc date") return "Newest";
                    return "Sort order";
                  })()}
                </span>
              </div>
              <Select.Icon><ChevronDown className="w-4 h-4 text-gray-500" /></Select.Icon>
            </Select.Trigger>

            <Select.Content position="popper" side="bottom" align="start" className="bg-white border border-gray-300 rounded-lg shadow-lg z-50 mt-1">
              <Select.Viewport className="p-2">
                {[
                  { label: "Price (low → high)", value: "asc price" },
                  { label: "Price (high → low)", value: "desc price" },
                  { label: "Newest", value: "desc date" },
                  { label: "Oldest", value: "asc date" },
                ].map((item) => (
                  <Select.Item key={item.value} value={item.value} className={itemClasses}>{item.label}</Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Root>
        </div>
      </div>
    </div>
  );
}

/* ---------------- reusable small components ---------------- */

function SelectFilter({ label, name, options, searchParams, onChange, triggerClasses, itemClasses }) {
  return (
    <div className="flex flex-col w-full sm:w-auto relative">
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      <Select.Root defaultValue={searchParams.get(name) || undefined} onValueChange={(value) => onChange(name, value)}>
        <Select.Trigger className={`${triggerClasses} w-auto min-w-[8rem] flex items-center justify-between`}>
          <div className="text-gray-500 text-xs">{searchParams.get(name) || `Select ${label.toLowerCase()}`}</div>
          <Select.Icon><ChevronDown className="w-4 h-4 text-gray-500 ml-2" /></Select.Icon>
        </Select.Trigger>

        <Select.Content position="popper" side="bottom" align="start" className="bg-white border border-gray-300 rounded-lg shadow-lg z-50 mt-1 max-h-80 overflow-y-auto">
          <Select.Viewport className="p-2">
            {options.map((opt) => <Select.Item key={opt} value={opt} className={itemClasses}>{opt}</Select.Item>)}
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
    </div>
  );
}

function NumberInputFilter({ label, name, defaultValue, onChange }) {
  return (
    <div className="flex flex-col w-full sm:w-auto">
      <label className="text-xs font-medium text-gray-500 mb-1">{label}</label>
      <input
        type="number"
        name={name}
        placeholder="0"
        min="0" // 👈 prevents typing negatives using arrows or keyboard
        className="text-xs rounded-lg px-3 py-2 w-24 border border-gray-300 focus:ring-2 focus:ring-black outline-none"
        defaultValue={defaultValue}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "" || Number(value) >= 0) {
            onChange(name, value);
          } else {
            // reset negative input to 0 if user tries
            e.target.value = 0;
            onChange(name, 0);
          }
        }}
      />
    </div>
  );
}

