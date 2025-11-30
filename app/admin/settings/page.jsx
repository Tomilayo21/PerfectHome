"use client"
import { useState, useEffect } from 'react';
import {
  Cog,
  Building,
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
  List, 
  Star,
  Mail,
  PackageSearch,
  ChevronDown,
  Moon, Sun,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import toast from "react-hot-toast";
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


const settingsTabs = [
  { key: 'general', label: 'General', icon: <Cog className="w-4 h-4" /> },
  { key: 'company', label: 'Company', icon: <Briefcase className="w-4 h-4" /> },
  { key: 'legal', label: 'Legal & Policy', icon: <FileText className="w-4 h-4" /> },
];

export default function AdminSettings() {


  const [activeTab, setActiveTab] = useState('general');
  const [productSubTab, setProductSubTab] = useState(null);
  const [productPanel, setProductPanel] = useState(null);
  const [userPanel, setUserPanel] = useState(null);
  const [orderPanel, setOrderPanel] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [siteTitle, setSiteTitle] = useState('');
  const [error, setError] = useState('');
  const [siteDescription, setSiteDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [footerDescription, setFooterDescription] = useState("");
  const [footerPhone, setFooterPhone] = useState("");
  const [footerEmail, setFooterEmail] = useState("");
  const [footerName, setFooterName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [settingsPanel, setSettingsPanel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [legalPanel, setLegalPanel] = useState("main");
  const [companyPanel, setCompanyPanel] = useState("main");
  const [lightLogoPreview, setLightLogoPreview] = useState(null);
  const [darkLogoPreview, setDarkLogoPreview] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [users, setUsers] = useState([]);
  const [colorOpen, setColorOpen] = useState(false);
  const [logoWidth, setLogoWidth] = useState("120px");
  const [logoHeight, setLogoHeight] = useState("auto");

  
    
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
        setLogoWidth(data.logoWidth || "120px");
        setLogoHeight(data.logoHeight || "auto");
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
      socialLinks,
      logoWidth,
      logoHeight,

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

  const router = useRouter();



  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 text-gray-700 dark:text-gray-300 dark:bg-black">
      <h2 className="text-2xl font-normal text-gray-800 text-gray-700 dark:text-gray-300 dark:bg-black">Settings</h2>

      {/* Tab Header */}
      <div className="flex flex-wrap gap-2 border-b pb-2 text-gray-700 dark:text-gray-300">
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
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-normal transition-all duration-200
              ${
                activeTab === tab.key
                  ? "bg-blue-700/80 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
          >
            <span className="w-4 h-4">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white p-6 rounded shadow border dark:text-gray-300 dark:bg-black">

        {activeTab === 'general' && (
          <div className="relative overflow-hidden dark:text-gray-300 dark:bg-black">
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
                  <h3 className="font-normal text-lg dark:text-gray-300 dark:bg-black">Site Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <button
                      onClick={() => setSettingsPanel('site')}
                      className="
                        flex flex-col items-start
                        bg-orange-100 hover:bg-orange-200 text-orange-800
                        dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg
                        p-4 rounded-xl shadow-sm
                        transition-all duration-300 ease-in-out
                        border border-transparent 
                      "
                    >
                      <div className="flex font-thin items-center gap-2 mb-1">
                        <span className="">Site Metadata</span>
                      </div>
                      <p className="text-xs text-left font-thin text-gray-700 dark:text-gray-300">
                        Edit your site’s title, description, support email and logo.
                      </p>
                    </button>


                    <button
                      onClick={() => setSettingsPanel('footer')}
                      className="flex flex-col items-start 
                      bg-blue-100 hover:bg-blue-200 text-blue-800 
                      p-4 rounded-xl shadow 
                      dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                      dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="">Footer Settings</span>
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
                  <button onClick={() => setSettingsPanel(null)} className="flex items-center text-sm text-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-700">
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

                      {/* Logo Size Controls */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Logo Width (e.g. 120px)</label>
                          <input
                            type="text"
                            value={logoWidth}
                            onChange={(e) => setLogoWidth(e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">Logo Height (e.g. auto or 50px)</label>
                          <input
                            type="text"
                            value={logoHeight}
                            onChange={(e) => setLogoHeight(e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </div>
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
          <div className="relative overflow-hidden dark:text-gray-300 dark:bg-black">
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
                  <h3 className="font-normal text-lg">Company Info</h3>
                  <p className="text-sm font-thin dark:text-white text-gray-600">
                    Manage your company's public-facing content and team details.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <button
                      onClick={() => setCompanyPanel("about")}
                      className="flex flex-col items-start bg-sky-100 hover:bg-sky-200 text-sky-800 p-4
                       rounded-xl shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                    >
                      <span className="font-thin mb-1">About Us</span>
                      <p className="text-xs font-thin text-left">Edit your company's story and purpose.</p>
                    </button>

                    <button
                      onClick={() => setCompanyPanel("partners")}
                      className="flex flex-col items-start bg-pink-100 hover:bg-pink-200 text-pink-800 p-4
                       rounded-xl shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                    >
                      <span className="font-thin mb-1">Partner With Us</span>
                      <p className="text-xs font-thin text-left">Manage partnership information and callouts.</p>
                    </button>


                    <button
                      onClick={() => setCompanyPanel("team")}
                      className="flex flex-col items-start bg-rose-100 hover:bg-rose-200 text-rose-800 p-4 rounded-xl shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                    >
                      <span className="font-normal mb-1">Perfect Home Premium Real Estate Team</span>
                      <p className="text-xs font-thin text-left">Showcase team members and bios.</p>
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
                  <button onClick={() => setCompanyPanel("main")} className="flex items-center text-sm text-gray-600 hover:text-black  dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg">
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



              {/* Perfect Home Premium Real Estate Team Panel */}
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
                  <h3 className="font-normal text-lg">Legal & Policy</h3>
                  <p className="text-sm fonormal text-gray-600">
                    Manage your website's legal documents and policy pages.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">


                    <button
                      onClick={() => setLegalPanel("terms")}
                      className="flex flex-col items-start bg-green-100 hover:bg-green-200 text-green-800 p-4 rounded-xl 
                      shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-normal">Terms & Conditions</span>
                      </div>
                      <p className="text-xs text-left">
                        Outline the rules for using your service.
                      </p>
                    </button>


                    <button
                      onClick={() => setLegalPanel("faq")}
                      className="flex flex-col items-start bg-purple-100 hover:bg-purple-200 text-purple-800 p-4 rounded-xl 
                      shadow dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 
                        dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-normal">FAQs</span>
                      </div>
                      <p className="text-xs text-left">
                        Manage common legal-related questions and answers.
                      </p>
                    </button>
                  </div>
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
                    className="flex items-center text-sm text-gray-600 hover:text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <h3 className="font-normal text-lg">Edit Terms & Conditions</h3>

                  <TermsEditor />

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
                  <button onClick={() => setLegalPanel("main")} className="flex items-center text-sm text-gray-600 dark:hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </button>
                  <h3 className="font-normal text-lg">Edit FAQs</h3>

                  <FAQEditor />
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}