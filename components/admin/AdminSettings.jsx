"use client";
import React, {useState, useEffect} from 'react'
import {
  Cog,
  Briefcase,
  ShieldCheck,
  Palette,
  Globe,
  Users,
  Bell,
  CreditCard,
  Box,
  FileText,
  CloudDownload,
  ArrowLeft,
  PlusCircle, 
  Mail,
  List, 
  Star,
  PackageSearch,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AddProductPanel from "@/components/admin/settings/products/AddProductPanel";
import ProductListPanel from "@/components/admin/settings/products/ProductListPanel";
import ReviewPanel from "@/components/admin/settings/products/ReviewPanel";
import UserListPanel from "@/components/admin/settings/users/UserListPanel";
import SubscribersPage from "@/components/admin/settings/users/SubscribersPage";
import ViewBroadcastButton from "@/components/admin/settings/users/ViewBroadcastButton";
import OrderPanel from "@/components/admin/settings/orders/OrderPanel";
import TransactionPanel from "@/components/admin/settings/orders/TransactionPanel";
import FormatDatabase from '@/components/admin/FormatDatabase';
import BackupModal from '@/components/admin/BackupModal';
import RegUsers from "@/components/admin/RegUsers";
import toast from "react-hot-toast";
import AdminRestore from '@/components/admin/AdminRestore';
import RestoreModal from '@/components/admin/RestoreModal';
import { useAppContext } from '@/context/AppContext';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import LayoutStyleSelector from "@/components/LayoutStyleSelector";
import FAQEditor from '@/components/FAQEditor';
import TermsEditor from '@/components/TermsEditor';
import PrivacyEditor from '@/components/PrivacyEditor';
import ReturnsEditor from '@/components/ReturnsEditor';
import AboutEditor from '@/components/AboutEditor';
import TeamEditor from '@/components/TeamEditor';
import Testimonials from "@/components/Testimonials";
import PartnerEditor from '@/components/PartnerEditor';
import ExportUserCSV from '@/components/admin/settings/users/ExportUsersCSV';
import ExportProductsCSV from '@/components/admin/settings/products/ExportProductsCSV';
import ExportOrdersCSV from '@/components/admin/settings/orders/ExportOrdersCSV';



const settingsTabs = [
  { key: "general", label: "General", icon: <Cog className="w-4 h-4" /> },
  { key: 'company', label: 'Company', icon: <Briefcase className="w-4 h-4" /> },
  { key: "product", label: "Product", icon: <Box className="w-4 h-4" /> },
  { key: "users", label: "User & Subscribers", icon: <Users className="w-4 h-4" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { key: "orders", label: "Orders & Payments", icon: <CreditCard className="w-4 h-4" /> },
  { key: "localization", label: "Localization", icon: <Globe className="w-4 h-4" /> },
  { key: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" /> },
  { key: "security", label: "Security", icon: <ShieldCheck className="w-4 h-4" /> },
  { key: "legal", label: "Legal / Policy", icon: <FileText className="w-4 h-4" /> },
  { key: "backup", label: "Backup / Export", icon: <CloudDownload className="w-4 h-4" /> },
];

export default function AdminSettings({
  activeTab,
  setActiveTab,
  userPanel,
  setUserPanel,
  orderPanel,
  setOrderPanel,
  setActiveView,
}) {

  const { 
    currentUser,
    currency, 
    setCurrency, 
    themeColor, 
    setThemeColor, 
    secondaryColor,
    setSecondaryColor,
    tertiaryColor,
    setTertiaryColor,
    themeMode, 
    setThemeMode, 
    contrastMode, 
    setContrastMode,
    layoutStyle,
    setLayoutStyle,
    fontSize,
    setFontSize,
    savePreferences,
    layout,
    updateSettings,
    saveLayoutStyle,
    cancelPreview,
    
  } = useAppContext();

  const [productSubTab, setProductSubTab] = useState(null);
  const [productPanel, setProductPanel] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [siteTitle, setSiteTitle] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [footerDescription, setFooterDescription] = useState("");
  const [footerPhone, setFooterPhone] = useState("");
  const [footerEmail, setFooterEmail] = useState("");
  const [footerName, setFooterName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [settingsPanel, setSettingsPanel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  
  const [legalPanel, setLegalPanel] = useState("main");
  const [companyPanel, setCompanyPanel] = useState("main");
  const [lightLogoPreview, setLightLogoPreview] = useState(null);
  const [darkLogoPreview, setDarkLogoPreview] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  





  const [layoutVal, setLayoutVal] = useState(layout);
  const [fontVal, setFontVal] = useState(fontSize);
  const [selectedFontSize, setSelectedFontSize] = useState(fontSize);
  const [selectedLayout, setSelectedLayout] = useState(layoutStyle);
  const [localLayout, setLocalLayout] = useState(layoutStyle);
  const [localFontSize, setLocalFontSize] = useState(fontSize);


  useEffect(() => {
    const fetchSiteDetails = async () => {
      try {
        const res = await fetch("/api/settings/metadata");
        const data = await res.json();

        setSiteTitle(data.siteTitle || "");
        setSiteDescription(data.siteDescription || "");
        setFooterDescription(data.footerDescription || "");
        setFooterPhone(data.footerPhone || "");
        setFooterEmail(data.footerEmail || "");
        setFooterName(data.footerName || "");
        setSupportEmail(data.supportEmail || "");
        setSocialLinks(data.socialLinks || []);
      } catch (error) {
        toast.error("Failed to load site settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSiteDetails();
  }, []);


  const handleLightLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "light");

    const res = await fetch("/api/upload-logo", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    setUploading(false);

    if (res.ok) {
      setLightLogoPreview(result.lightLogoUrl); 
      toast.success("Light mode logo uploaded");
    } else {
      toast.error(result.error || "Upload failed");
    }
  };

  // Dark logo upload
  const handleDarkLogoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setUploading(true);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", "dark");

  const res = await fetch("/api/upload-logo", {
    method: "POST",
    body: formData,
  });

  const result = await res.json();
  setUploading(false);

  if (res.ok) {
    setDarkLogoPreview(result.darkLogoUrl); 
    toast.success("Dark mode logo uploaded");
  } else {
    toast.error(result.error || "Upload failed");
  }
};


  const handleRemoveLightLogo = async () => {
    try {
      const res = await fetch("/api/settings/logo?type=light", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete light logo");
      toast.success("Light mode logo removed");
      setLightLogoPreview(null);
    } catch {
      toast.error("Error removing light logo");
    }
  };

  const handleRemoveDarkLogo = async () => {
    try {
      const res = await fetch("/api/settings/logo?type=dark", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete dark logo");
      toast.success("Dark mode logo removed");
      setDarkLogoPreview(null);
    } catch {
      toast.error("Error removing dark logo");
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setLightLogoPreview(data.lightLogoUrl || null);
        setDarkLogoPreview(data.darkLogoUrl || null);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); // Start loading

    const payload = {
      siteTitle,
      siteDescription,
      footerDescription,
      footerPhone,
      footerEmail,
      footerName,
      supportEmail,
    };

    try {
      const res = await fetch("/api/settings/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Settings updated");
      } else {
        const data = await res.json();
        toast.error(data.error || "Update failed");
      }
    } catch (err) {
      toast.error("Unexpected error");
    } finally {
      setIsSubmitting(false); // End loading
    }
  };


  const handleFormatDatabase = async () => {
    const confirmed = confirm("Are you sure? This will permanently delete ALL data.");
    if (!confirmed) return;

    try {
      const res = await fetch("/api/admin/format-database", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Database wiped successfully.");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to format database.");
      }
    } catch (err) {
      toast.error("Unexpected error occurred.");
    }
  };

    const router = useRouter();
    const changeLanguage = (e) => {
      const lang = e.target.value;
      Cookies.set('lang', lang, { expires: 30 });
      router.refresh(); // triggers layout re-render
    };
  
    useEffect(() => {
        setLocalLayout(layoutStyle);
        setLocalFontSize(fontSize);
    }, [layoutStyle, fontSize]);
  
    const handleSave = async () => {
      setLayoutStyle(localLayout);
      setFontSize(localFontSize);
      await savePreferences(localFontSize, localLayout);
    };
  
    //Exports CSVs
    //Users
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const res = await fetch("/api/clerk-users");
          if (!res.ok) throw new Error("Failed to load users");
          const data = await res.json();
          setUsers(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
  
      fetchUsers();
    }, []);
  
    const logActivity = async (action, detail) => {
      await fetch("/api/activity-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, detail }),
      });
    };
  
    //Products
  

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
    <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
        <button
            onClick={() => setActiveView("dashboard")}
            className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded text-sm"
            >
            ← Back to Dashboard
        </button>

    </div>

      {/* Tab Header */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {settingsTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setProductSubTab(null);
              if (tab.key === "product") setProductPanel(null);
              if (tab.key === "users") setUserPanel("main");
              if (tab.key === "orders") setOrderPanel(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                activeTab === tab.key
                  ? "bg-orange-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
          >
            <span className="w-4 h-4">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Panel */}
      <div className="bg-white p-6 rounded shadow border">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!settingsPanel && (
                <motion.div
                  key="general-main"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-lg">Site Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <button
                      onClick={() => setSettingsPanel('site')}
                      className="flex flex-col items-start bg-orange-100 hover:bg-orange-200 text-orange-800 p-4 rounded-xl shadow"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Site Metadata</span>
                      </div>
                      <p className="text-xs text-left">
                        Edit your site’s title, description, support email and logo.
                      </p>
                    </button>

                    <button
                      onClick={() => setSettingsPanel('footer')}
                      className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl shadow"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Footer Settings</span>
                      </div>
                      <p className="text-xs text-left">
                        Customize footer content such as contact info and branding.
                      </p>
                    </button>
                  </div>
                </motion.div>
              )}

              {settingsPanel && (
                <motion.div
                  key="general-sub"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button onClick={() => setSettingsPanel(null)} className="flex items-center text-sm text-gray-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>

                  {settingsPanel === 'site' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <h3 className="text-lg font-semibold">Site Settings</h3>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Site Title</label>
                        <input
                          type="text"
                          value={siteTitle}
                          onChange={(e) => setSiteTitle(e.target.value)}
                          className="w-full p-2 border rounded"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Site Description</label>
                        <textarea
                          value={siteDescription}
                          onChange={(e) => setSiteDescription(e.target.value)}
                          className="w-full p-2 border rounded"
                          rows={3}
                        />
                      </div>


                      <div className="space-y-2">
                        <label className="text-sm font-medium">Upload Light Mode Logo</label>
                        {lightLogoPreview ? (
                          <div className="flex items-center gap-4">
                            <img src={lightLogoPreview} alt="Light Logo" className="w-20 h-20 object-contain border rounded" />
                            <button
                              type="button"
                              onClick={handleRemoveLightLogo}
                              className="text-red-500 text-sm hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLightLogoChange}
                            className="w-full p-2 border rounded bg-white text-gray-700"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Upload Dark Mode Logo</label>
                        {darkLogoPreview ? (
                          <div className="flex items-center gap-4">
                            <img src={darkLogoPreview} alt="Dark Logo" className="w-20 h-20 object-contain border rounded" />
                            <button
                              type="button"
                              onClick={handleRemoveDarkLogo}
                              className="text-red-500 text-sm hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleDarkLogoChange}
                            className="w-full p-2 border rounded bg-white text-gray-700"
                          />
                        )}
                      </div>


                      <button
                        type="submit"
                        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </button>
                    </form>
                  )}

                  {settingsPanel === 'footer' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <h3 className="text-lg font-semibold">Footer Settings</h3>
                    
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Footer Description</label>
                        <textarea
                          value={footerDescription}
                          onChange={(e) => setFooterDescription(e.target.value)}
                          placeholder="Footer Description"
                          className="w-full p-2 border rounded"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Footer Contact Number</label>
                        <input
                          value={footerPhone}
                          onChange={(e) => setFooterPhone(e.target.value)}
                          placeholder="Footer Phone"
                          className="w-full p-2 border rounded"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Footer Contact Email</label>
                        <input
                          value={footerEmail}
                          onChange={(e) => setFooterEmail(e.target.value)}
                          placeholder="Footer Email"
                          type="email"
                          className="w-full p-2 border rounded"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Footer Name i.e. "copyright @Footer_Name"</label>
                        <input
                          value={footerName}
                          onChange={(e) => setFooterName(e.target.value)}
                          placeholder="Footer Name"
                          className="w-full p-2 border rounded"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Social Media Links</label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {socialLinks.map((link, index) => (
                            <div key={index} className="flex flex-col gap-2 border p-3 rounded">
                              {/* Platform Name */}
                              <input
                                value={link.platform}
                                onChange={(e) => {
                                  const updated = [...socialLinks];
                                  updated[index].platform = e.target.value;
                                  setSocialLinks(updated);
                                }}
                                placeholder="Platform Name"
                                className="p-2 border rounded"
                              />

                              {/* Profile URL */}
                              <input
                                value={link.url}
                                onChange={(e) => {
                                  const updated = [...socialLinks];
                                  updated[index].url = e.target.value;
                                  setSocialLinks(updated);
                                }}
                                placeholder="Profile URL"
                                className="p-2 border rounded"
                              />

                              {/* If icon exists, show preview + remove/replace */}
                              {link.iconUrl ? (
                                <div className="flex items-center gap-3">
                                  <img
                                    src={link.iconUrl}
                                    alt={link.platform}
                                    className="w-10 h-10 object-contain"
                                  />
                                  <button
                                    type="button"
                                    className="text-blue-600"
                                    onClick={() => {
                                      const updated = [...socialLinks];
                                      updated[index].iconUrl = ""; // clear image so file input reappears
                                      setSocialLinks(updated);
                                    }}
                                  >
                                    🔄 Replace Icon
                                  </button>
                                </div>
                              ) : (
                                <input
                                  type="file"
                                  onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    const { platform, url } = socialLinks[index];
                                    if (!platform || !url) {
                                      alert(
                                        "Please enter the platform name and profile URL before uploading an icon."
                                      );
                                      e.target.value = "";
                                      return;
                                    }

                                    const formData = new FormData();
                                    formData.append("file", file);
                                    formData.append("platform", platform);
                                    formData.append("url", url);

                                    const res = await fetch("/api/settings/social-icon-upload", {
                                      method: "POST",
                                      body: formData,
                                    });

                                    const data = await res.json();
                                    if (data.success) {
                                      const updated = [...socialLinks];
                                      updated[index].iconUrl = data.socialLinks.find(
                                        (sl) => sl.platform === platform
                                      )?.iconUrl;
                                      setSocialLinks(updated);
                                    }
                                  }}
                                />
                              )}

                              {/* Remove social link */}
                              <button
                                type="button"
                                onClick={async () => {
                                  const platform = socialLinks[index].platform;

                                  // Delete from DB
                                  const res = await fetch("/api/settings/social-icon-upload", {
                                    method: "DELETE",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ platform }),
                                  });

                                  const data = await res.json();
                                  if (data.success) {
                                    setSocialLinks(data.socialLinks); // Update from server
                                  } else {
                                    alert(data.error || "Failed to delete social link");
                                  }
                                }}
                                className="text-red-500"
                              >
                                ✖ Remove
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setSocialLinks([...socialLinks, { platform: "", iconUrl: "", url: "" }])
                          }
                          className="text-blue-600"
                        >
                          ➕ Add Social Link
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </button>
                      


                    </form>
                    
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === "company" && (
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              {companyPanel === "main" && (
                <motion.div
                  key="company-main"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-lg">Company Info</h3>
                  <p className="text-sm text-gray-600">
                    Manage your company's public-facing content and team details.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <button
                      onClick={() => setCompanyPanel("about")}
                      className="flex flex-col items-start bg-sky-100 hover:bg-sky-200 text-sky-800 p-4 rounded-xl shadow"
                    >
                      <span className="font-semibold mb-1">About Us</span>
                      <p className="text-xs text-left">Edit your company's story and purpose.</p>
                    </button>

                    <button
                      onClick={() => setCompanyPanel("partners")}
                      className="flex flex-col items-start bg-pink-100 hover:bg-pink-200 text-pink-800 p-4 rounded-xl shadow"
                    >
                      <span className="font-semibold mb-1">Partner With Us</span>
                      <p className="text-xs text-left">Manage partnership information and callouts.</p>
                    </button>

                    <button
                      onClick={() => setCompanyPanel("who")}
                      className="flex flex-col items-start bg-indigo-100 hover:bg-indigo-200 text-indigo-800 p-4 rounded-xl shadow"
                    >
                      <span className="font-semibold mb-1">Testimonials</span>
                      <p className="text-xs text-left">Showcase what clients or customers say about you.</p>
                    </button>

                    <button
                      onClick={() => setCompanyPanel("team")}
                      className="flex flex-col items-start bg-rose-100 hover:bg-rose-200 text-rose-800 p-4 rounded-xl shadow"
                    >
                      <span className="font-semibold mb-1">Cusceda Team</span>
                      <p className="text-xs text-left">Showcase team members and bios.</p>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* About Us Panel */}
              {companyPanel === "about" && (
                <motion.div
                  key="company-about"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button onClick={() => setCompanyPanel("main")} className="flex items-center text-sm text-gray-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>

                  <AboutEditor />
                </motion.div>
              )}

              {/* Partner With Us Panel */}
              {companyPanel === "partners" && (
                <motion.div
                  key="company-partners"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button onClick={() => setCompanyPanel("main")} className="flex items-center text-sm text-gray-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>

                  <PartnerEditor />
                </motion.div>
              )}

              {/* Who We Are Panel */}
              {companyPanel === "who" && (
                <motion.div
                  key="company-who"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button onClick={() => setCompanyPanel("main")} className="flex items-center text-sm text-gray-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  {/* <WhoWeAreEditor /> */}
                  <Testimonials />
                </motion.div>
              )}

              {/* Cusceda Team Panel */}
              {companyPanel === "team" && (
                <motion.div
                  key="company-team"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button onClick={() => setCompanyPanel("main")} className="flex items-center text-sm text-gray-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>

                  <TeamEditor />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'product' && (
          <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                {!productPanel && (
                    <motion.div
                    key="product-main"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                    >
                    <h3 className="font-semibold text-lg">Product Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <button
                        onClick={() => setProductPanel('add')}
                        className="flex flex-col items-start bg-orange-100 hover:bg-orange-200 text-orange-800 p-4 rounded-xl shadow"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <PlusCircle className="w-5 h-5" />
                          <span className="font-semibold">Add Product</span>
                        </div>
                        <p className="text-xs text-left">
                          Create a new product, upload images, set prices, and manage availability.
                      </p>
                      </button>
                      <button
                        onClick={() => setProductPanel('list')}
                        className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl shadow"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <List className="w-5 h-5" />
                          <span className="font-semibold">Product List</span>
                        </div>
                      <p className="text-xs text-left">
                          View and manage your existing product catalog, edit or delete items.
                        </p>
                      </button>

                      <button
                        onClick={() => setProductPanel('reviews')}
                        className="flex flex-col items-start bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-xl shadow"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="w-5 h-5" />
                          <span className="font-semibold">Reviews</span>
                        </div>
                        <p className="text-xs text-left">
                        Monitor and approve customer reviews and ratings on products.
                        </p>
                      </button>
                    </div>
                    </motion.div>
                )}
                {productPanel && (
                  <motion.div
                  key="product-sub"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                  >
                  <button onClick={() => setProductPanel(null)} className="flex items-center text-sm text-gray-600 hover:text-black">
                      <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>

                  {productPanel === 'add' && <AddProductPanel />}
                  {productPanel === 'list' && <ProductListPanel />}
                  {productPanel === 'reviews' && <ReviewPanel />}
                  </motion.div>
              )}
              </AnimatePresence>
          </div>
         )}

        {activeTab === "users" && (
        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            {userPanel === "main" && (
              <motion.div
                key="user-main"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="font-semibold text-lg">Users & Subscribers</h3>
                <p className="text-sm text-gray-600">
                  Role assignments, user lists, and subscriber communication tools.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <button
                    onClick={() => setUserPanel("list")}
                    className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl shadow"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">View Users</span>
                    </div>
                    <p className="text-xs text-left">
                      Browse and manage all registered users, including profile info and activity.
                    </p>
                  </button>

                    <button
                    onClick={() => setUserPanel("subscribers")}
                    className="flex flex-col items-start bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-xl shadow"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-5 h-5" />
                      <span className="font-semibold">Subscribers</span>
                    </div>
                    <p className="text-xs text-left">
                      View and export newsletter subscribers and manage email outreach.
                    </p>
                  </button>

                  <button
                    onClick={() => setUserPanel("roles")}
                    className="flex flex-col items-start bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-xl shadow"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="font-semibold">Roles & Permissions</span>
                    </div>
                    <p className="text-xs text-left">
                      Assign roles to users, configure access levels, and manage permissions.
                    </p>
                  </button>
                </div>
              </motion.div>
              )}
              {userPanel === "list" && (
              <motion.div
                key="user-list"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <button onClick={() => setUserPanel("main")} className="flex items-center text-sm text-gray-600 hover:text-black">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <RegUsers />
              </motion.div>
              )}
              {userPanel === "subscribers" && (
              <motion.div
                key="user-subscribers"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <button onClick={() => setUserPanel("main")} className="flex items-center text-sm text-gray-600 hover:text-black">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <button onClick={() => setUserPanel("broadcast")} className="bg-orange-600 text-white px-4 py-2 rounded">
                  View Broadcast History
                </button>
                <SubscribersPage />
              </motion.div>
              )}
              {userPanel === "broadcast" && (
              <motion.div
                key="user-broadcast"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <button onClick={() => setUserPanel("subscribers")} className="flex items-center text-sm text-gray-600 hover:text-black">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <ViewBroadcastButton />
              </motion.div>
              )}
              {userPanel === "roles" && (
              <motion.div
                key="user-subscribers"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <button onClick={() => setUserPanel("main")} className="flex items-center text-sm text-gray-600 hover:text-black">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back
                </button>
                <UserListPanel />
              </motion.div>
            )}
            </AnimatePresence>
          </div>
        )}
        
        {/* Orders Tab */}
        {activeTab === 'orders' && (
            <div className="relative overflow-hidden">
                <AnimatePresence mode="wait">
                {!orderPanel && (
                    <motion.div
                    key="orders-main"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                    >
                    <h3 className="font-semibold text-lg">Orders & Payments</h3>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                       <button
                        onClick={() => setOrderPanel('orders')}
                        className="flex flex-col items-start bg-orange-100 hover:bg-orange-200 text-orange-800 p-4 rounded-xl shadow"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <PackageSearch className="w-5 h-5" />
                          <span className="font-semibold">View Orders</span>
                        </div>
                        <p className="text-xs text-left">
                          Browse all placed orders, track delivery status, and update order stages.
                        </p>
                      </button>

                      <button
                        onClick={() => setOrderPanel('transactions')}
                        className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl shadow"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5" />
                          <span className="font-semibold">View Transactions</span>
                        </div>
                        <p className="text-xs text-left">
                          Monitor all payment records, verify receipts, and check transaction types.
                        </p>
                      </button>
                     </div> 
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                       <button
                        onClick={() => setOrderPanel('orders')}
                        className="flex flex-col items-start bg-orange-100 hover:bg-orange-200 text-orange-800 p-4 rounded-xl shadow transition"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <PackageSearch className="w-5 h-5" />
                          <span className="font-semibold">View Orders</span>
                        </div>
                        <p className="text-xs text-left">
                          Browse all placed orders, track delivery status, and update order stages.
                        </p>
                      </button>

                      <button
                        onClick={() => setOrderPanel('transactions')}
                        className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl shadow transition"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard className="w-5 h-5" />
                          <span className="font-semibold">View Transactions</span>
                        </div>
                        <p className="text-xs text-left">
                          Monitor all payment records, verify receipts, and check transaction types.
                        </p>
                      </button>

                      {/* Placeholder for future section */}
                      <div className="flex flex-col items-start bg-gray-100 text-gray-500 p-4 rounded-xl shadow italic">
                        <span className="font-medium mb-1">More Coming Soon</span>
                        <p className="text-xs">
                          Stay tuned for additional features in this section.
                        </p>
                      </div>
                    </div>
                    </motion.div>
                 )}

                 {orderPanel && (
                    <motion.div
                    key="orders-sub"
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                    >
                    <button
                        onClick={() => setOrderPanel(null)}
                        className="flex items-center text-sm text-gray-600 hover:text-black"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back
                    </button>

                    {orderPanel === 'orders' && <OrderPanel />}
                    {orderPanel === 'transactions' && <TransactionPanel />}
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        )}

        {/* Remaining simple tabs */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Notifications</h3>

            {/* Orders */}
            <p className="text-sm font-medium text-gray-600">Orders</p>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="accent-orange-600" /> Email on New Order
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-600" /> Email on Order Shipped
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-600" /> Email on Order Delivered
            </label>

            {/* Reviews */}
            <p className="text-sm font-medium text-gray-600">Reviews</p>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-600" /> Email on New Review
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-600" /> Email on Review Approval
            </label>

            {/* Stock Alerts */}
            <p className="text-sm font-medium text-gray-600">Stock Alerts</p>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-600" /> Email on Low Stock
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-600" /> Email on Out-of-Stock Product
            </label>

            {/* Marketing */}
            <p className="text-sm font-medium text-gray-600">Marketing</p>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-600" /> Receive Newsletter
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-600" /> Receive Promotional Offers
            </label>
          </div>
        )}

        {activeTab === 'localization' && (
            <div className="space-y-5">
                <h3 className="font-semibold text-lg">Localization Settings</h3>

                {/* Language Selection */}
                {/* <div>
                    <label className="block text-sm font-medium mb-1">Preferred Language</label>
                    <select
                        className="w-full border p-2 rounded"
                        // onChange={changeLanguage}
                        // defaultValue={i18n.language}
                    >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese (Simplified)</option>
                        <option value="ar">Arabic</option>
                    </select>
                </div> */}
                <div>
                    <label className="block text-sm font-medium mb-1">Preferred Language</label>
                    <select
                        className="w-full border p-2 rounded"
                        onChange={changeLanguage}
                        defaultValue={Cookies.get('lang') || 'en'}
                    >
                        <option value="en">English</option>
                        <option value="fr">French</option>
                        <option value="es">Spanish</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese (Simplified)</option>
                        <option value="ar">Arabic</option>
                    </select>
                </div>

                {/* Timezone Selection */}
                <div>
                <label className="block text-sm font-medium mb-1">Timezone</label>
                <select className="w-full border p-2 rounded">
                    <option>(GMT+01:00) West Africa Time</option>
                    <option>(GMT+00:00) UTC</option>
                    <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                    <option>(GMT+08:00) China Standard Time</option>
                    <option>(GMT+05:30) India Standard Time</option>
                </select>
                </div>

                {/* Date Format */}
                <div>
                <label className="block text-sm font-medium mb-1">Date Format</label>
                <select className="w-full border p-2 rounded">
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                </select>
                </div>

                {/* Number Format */}
                <div>
                <label className="block text-sm font-medium mb-1">Number Format</label>
                <select className="w-full border p-2 rounded">
                    <option>1,234.56 (US)</option>
                    <option>1.234,56 (EU)</option>
                    <option>1 234,56 (Russia/Arabic)</option>
                </select>
                </div>

                {/* Currency Preference */}
                <div>
                    <label className="block text-sm font-medium mb-1">Currency</label>
                    <select
                        className="w-full border p-2 rounded"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                    >
                        <option value="$">USD - US Dollar</option>
                        <option value="€">EUR - Euro</option>
                        <option value="₦">NGN - Nigerian Naira</option>
                        <option value="£">GBP - British Pound</option>
                        <option value="¥">JPY - Japanese Yen</option>
                    </select>
                    <p className="mt-2 text-green-600 text-sm">
                        Selected: {currency}
                    </p>
                </div>





                {/* Text Direction */}
                <div>
                <label className="block text-sm font-medium mb-1">Text Direction</label>
                <select className="w-full border p-2 rounded">
                    <option value="ltr">Left to Right (LTR)</option>
                    <option value="rtl">Right to Left (RTL)</option>
                </select>
                </div>

                {/* Regional Content Toggle */}
                <div className="flex items-center gap-2">
                <input type="checkbox" id="regional" className="accent-blue-500" />
                <label htmlFor="regional" className="text-sm">Show region-specific content (e.g., holidays, local news)</label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Apply Settings
                </button>
                <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100">
                    Reset to Default
                </button>
                </div>
            </div>
        )}

        {activeTab === 'appearance' && (
            <div className="space-y-4">

                {/* Theme Color Picker */}
                <div>
                  <h3
                    className="font-semibold text-lg mb-2 cursor-pointer flex items-center justify-between"
                    onClick={() => setColorOpen(!colorOpen)}
                  >
                    Color Picker
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${
                        colorOpen ? "rotate-180" : ""
                      }`}
                    />
                  </h3>

                  {/* Animated dropdown */}
                  <div
                    className={`grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-hidden transition-all duration-500 ease-in-out ${
                      colorOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    {/* Theme Color */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Theme Color
                      </label>
                      <input
                        type="color"
                        value={themeColor}
                        onChange={(e) => setThemeColor(e.target.value)}
                        className="w-12 h-8 border rounded"
                      />
                    </div>

                    {/* Secondary Color */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Secondary Color
                      </label>
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-12 h-8 border rounded"
                      />
                    </div>

                    {/* Tertiary Color */}
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Tertiary Color
                      </label>
                      <input
                        type="color"
                        value={tertiaryColor}
                        onChange={(e) => setTertiaryColor(e.target.value)}
                        className="w-12 h-8 border rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Font Size Selector */}

                {/* <div className="p-4 space-y-4">
                    <div>
                        <label className="block mb-1">Font Size</label>
                        <select
                        value={localFontSize}
                        onChange={(e) => setLocalFontSize(e.target.value)}
                        className="p-2 border rounded w-full"
                        >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1">Layout</label>
                        <select
                        value={localLayout}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSelectedLayout(value);
                            saveLayoutStyle(value); // ✅ make sure this comes from context
                        }}
                        className="p-2 border rounded w-full"
                        >
                        <option value="grid">Grid</option>
                        <option value="list">List</option>
                        </select>
                    </div>

                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-black text-white rounded"
                    >
                        Save Preferences
                    </button>
                </div> */}

                <div className="space-y-2">
                  {/* Toggle header */}
                  <h3
                    className="font-semibold text-lg cursor-pointer flex items-center justify-between"
                    onClick={() => setOpen(!open)}
                  >
                    Appearance / Theme
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </h3>

                  {/* Animated dropdown */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="space-y-2 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="theme"
                          checked={themeMode === "light"}
                          onChange={() => setThemeMode("light")}
                        />
                        Light Mode
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="theme"
                          checked={themeMode === "dark"}
                          onChange={() => setThemeMode("dark")}
                        />
                        Dark Mode
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="theme"
                          checked={themeMode === "system"}
                          onChange={() => setThemeMode("system")}
                        />
                        System Preference
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">High Contrast</h3>

                    <label className="flex items-center gap-2">
                        <input
                        type="checkbox"
                        checked={contrastMode}
                        onChange={(e) => setContrastMode(e.target.checked)}
                        />
                        Enable High Contrast Mode (Accessibility)
                    </label>
                </div>

                {/* Layout Style */}
                <div className="space-y-1">
                    <LayoutStyleSelector />
                </div>

                {/* Rounded Corners */}
                <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-orange-600" />
                Use Rounded Corners
                </label>
            </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Security Settings</h3>

            {/* Enable 2FA */}
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-600" />
              Require 2FA for Admins
            </label>

            {/* Session Timeout */}
            <div className="flex flex-col gap-1">
              <label className="font-medium">Session Timeout (minutes)</label>
              <input
                type="number"
                min="1"
                className="border px-3 py-1 rounded w-32"
                placeholder="e.g. 30"
              />
            </div>

            {/* Login Alerts */}
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-600" />
              Email me on new device login
            </label>

            {/* Password Expiry */}
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-600" />
              Force password change every 90 days
            </label>

            {/* Restrict Login IP */}
            <div className="flex flex-col gap-1">
              <label className="font-medium">Restrict Login by IP</label>
              <input
                type="text"
                className="border px-3 py-1 rounded w-full"
                placeholder="e.g. 192.168.0.1, 10.0.0.0/24"
              />
            </div>

            {/* Restrict Admin Panel Access by Country */}
            <div className="flex flex-col gap-1">
              <label className="font-medium">Restrict Admin Panel by Country</label>
              <input
                type="text"
                className="border px-3 py-1 rounded w-full"
                placeholder="e.g. US, CA, GB"
              />
            </div>

            {/* Admin Action Confirmation */}
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-600" />
              Require password confirmation for editing/deleting products
            </label>

            {/* Audit Logging */}
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-orange-600" />
              Enable admin activity logging
            </label>

            {/* Save button */}
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Save Security Settings
            </button>
          </div>
        )}

        {activeTab === "legal" && (
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait">
              {legalPanel === "main" && (
                <motion.div
                  key="legal-main"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <h3 className="font-semibold text-lg">Legal & Policy</h3>
                  <p className="text-sm text-gray-600">
                    Manage your website's legal documents and policy pages.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <button
                      onClick={() => setLegalPanel("privacy")}
                      className="flex flex-col items-start bg-blue-100 hover:bg-blue-200 text-blue-800 p-4 rounded-xl shadow"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Privacy Policy</span>
                      </div>
                      <p className="text-xs text-left">
                        Describe how user data is collected and used.
                      </p>
                    </button>

                    <button
                      onClick={() => setLegalPanel("terms")}
                      className="flex flex-col items-start bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-xl shadow"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Terms & Conditions</span>
                      </div>
                      <p className="text-xs text-left">
                        Outline the rules for using your service.
                      </p>
                    </button>

                    <button
                      onClick={() => setLegalPanel("returns")}
                      className="flex flex-col items-start bg-yellow-100 hover:bg-yellow-200 text-yellow-800 p-4 rounded-xl shadow"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Return Policy</span>
                      </div>
                      <p className="text-xs text-left">
                        Specify your returns and refund process.
                      </p>
                    </button>

                    <button
                      onClick={() => setLegalPanel("faq")}
                      className="flex flex-col items-start bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-xl shadow"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">FAQs</span>
                      </div>
                      <p className="text-xs text-left">
                        Manage common legal-related questions and answers.
                      </p>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Privacy Policy Panel */}
              {legalPanel === "privacy" && (
                <motion.div
                  key="legal-privacy"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button onClick={() => setLegalPanel("main")} className="flex items-center text-sm text-gray-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <h3 className="font-semibold text-lg">Edit Privacy Policy</h3>
                  
                  <PrivacyEditor />
                </motion.div>
              )}

              {/* Terms & Conditions Panel */}
              {legalPanel === "terms" && (
                <motion.div
                  key="legal-terms"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button
                    onClick={() => setLegalPanel("main")}
                    className="flex items-center text-sm text-gray-600 hover:text-black"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <h3 className="font-semibold text-lg">Edit Terms & Conditions</h3>

                  <TermsEditor />

                </motion.div>
              )}


              {/* Return Policy Panel */}
              {legalPanel === "returns" && (
                <motion.div
                  key="legal-returns"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button
                    onClick={() => setLegalPanel("main")}
                    className="flex items-center text-sm text-gray-600 hover:text-black"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>

                   <ReturnsEditor />


                </motion.div>
              )}


              {/* FAQ Panel */}
              {legalPanel === "faq" && (
                <motion.div
                  key="legal-faqs"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button onClick={() => setLegalPanel("main")} className="flex items-center text-sm text-gray-600 hover:text-black">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <h3 className="font-semibold text-lg">Edit FAQs</h3>

                  <FAQEditor />
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Backup & Export</h3>

            {/* Export Orders */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Download all order records in CSV format.</p>
              <ExportOrdersCSV orders={orders} />
            </div>

            {/* Export Products */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Download product inventory as CSV.</p>
              {/* <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                Export Products CSV
              </button> */}
              <ExportProductsCSV filteredProducts={filteredProducts} />
            </div>

            {/* Export Users */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Download user list in CSV format.</p>
              {/* <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
                Export Users CSV
              </button> */}
              <ExportUserCSV users={users} logActivity={logActivity} />

            </div>

            {/* Database Backup */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Generate and download a full database backup.</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
              >
                Database Backup
              </button>
              {showModal && <BackupModal onClose={() => setShowModal(false)} />}
            </div>

            {/* Restore From Backup */}
            <div>
              <p className="text-sm text-gray-600 mb-1">Restore data from a backup file.</p>
              {/* <input type="file" className="block mb-2" /> */}
              <button
                onClick={() => setOpen(true)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                🛠 Restore Backup
              </button>

              {/* <RestoreModal isOpen={open} onClose={() => setOpen(false)}/> */}
              <RestoreModal isOpen={open} onClose={() => setOpen(false)} />
            </div>

            {/* Format (Wipe Database) */}
            <div className="pt-4 border-t border-red-200">
              <h4 className="text-red-600 font-semibold">Danger Zone</h4>
              <p className="text-sm text-gray-600 mb-2">
                This will permanently erase all data (orders, products, users, etc). This action cannot be undone.
              </p>
              <FormatDatabase
                onSuccess={() => {
                  // Optional: trigger refetch or redirect
                  console.log("Database cleared.");
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
