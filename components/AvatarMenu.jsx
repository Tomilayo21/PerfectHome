"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { User, LogOut, ShieldCheck, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import DeleteAccountModal from "./DeleteAccountModal";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { UAParser } from "ua-parser-js";

export default function AvatarMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const user = session?.user;
  const { getCartCount } = useAppContext();

  const menuRef = useRef(null);

  if (!user) return null;

  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState("profile");
  const [localName, setLocalName] = useState(user?.name || "");
  const [localUsername, setLocalUsername] = useState(user?.username || "");
  const [imagePreview, setImagePreview] = useState(user?.image || user?.imageUrl || null);
  const [imageFile, setImageFile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => setMounted(true), []);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDesktopMenuOpen(false);
      }
    }
    if (desktopMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [desktopMenuOpen]);


  useEffect(() => {
    if (session?.user) {
      if (session.user.image) {
        setImagePreview(session.user.image);
      }
      // ✅ Always use full name for localName
      setLocalName(session.user.name || "User");

      // ✅ Keep username separate
      setLocalUsername(session.user.username || "");
    }
  }, [session]);

  const [footerData, setFooterData] = useState({
    footerName: "",
  });

  useEffect(() => {
    const fetchFooter = async () => {
      const res = await fetch("/api/settings/footerdetails");
      const data = await res.json();
      setFooterData({
        footerName: data.footerName,
      });
    };
    fetchFooter();
  }, []);

  const handleAdminClick = () => router.push("/admin");

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  // Save profile (username + optional new avatar)
  async function handleSaveProfile() {
    try {
      setSavingProfile(true);

      let dataUrl = null;
      if (imageFile) {
        dataUrl = await fileToDataUrl(imageFile);
      }

      const res = await fetch("/api/user/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: localUsername,
          dataUrl, // may be null
        }),
        credentials: "include", // 🔑 ensures NextAuth cookies/JWT are sent
      });


      if (!res.ok) {
        const err = await res.json();
        throw new Error(err?.error || "Failed to update");
      }

      // success: refresh router so session/server components pickup new data
      router.refresh();
      setImageFile(null);
      // close modal or show success message:
      // setModalOpen(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleRemoveImage() {
    if (!confirm("Remove profile image?")) return;
    const res = await fetch("/api/user/update-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ removeImage: true }),
    });
    if (!res.ok) {
      const j = await res.json(); alert(j.error || "Failed");
      return;
    }
    router.refresh();
    setImagePreview(null);
    setImageFile(null);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setChangingPass(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not update password");
      alert("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      alert(err.message || "Error");
    } finally {
      setChangingPass(false);
    }
  }  

  useEffect(() => {
    const parser = new UAParser();
    const result = parser.getResult();
    setDeviceInfo({
      os: result.os.name || "Unknown OS",
      browser: result.browser.name || "Unknown Browser",
    });


    const now = new Date();
    setTime(
      now.toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );

    // Get location (city, country) using a free IP-based service
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => setLocation(`${data.city}, ${data.country_name}`))
      .catch(() => setLocation("Unknown Location"));
  }, []);


  return (
    <div className="relative" ref={menuRef}>
    
      {/* Avatar button */}
      <button
        onClick={() => {
          if (window.innerWidth >= 768) setDesktopMenuOpen(!desktopMenuOpen);
          else setMobileMenuOpen(true);
        }}
        className="w-9 h-9 rounded-full overflow-hidden bg-black flex items-center justify-center text-white font-bold shadow hover:opacity-90 transition"
      >
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name || "User"}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center border-0">
            <User className="w-4 h-4 text-white" />
          </div>
        )}
      </button>

      {/* ================= DESKTOP DROPDOWN ================= */}
      {desktopMenuOpen && (
        <div className="hidden md:block absolute left-1/2 top-12 transform -translate-x-1/2 w-72 bg-white dark:bg-black rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          {/* Profile Header */}
          <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 dark:bg-black border-b border-gray-200 dark:border-gray-700">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <p className="text-gray-900 font-thin dark:text-white">{user?.name}</p>
              <p className="text-sm text-gray-500 font-thin dark:text-gray-400 break-words max-w-[180px]">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col py-2">
            {mounted && user ? (
              <>
                <Link
                  href="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gap-3 px-5 py-3 font-thin text-black hover:bg-gray-50 dark:text-white dark:hover:text-black dark:hover:bg-white"
                >
                  My Orders
                </Link>
                <Link
                  href="/favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gap-3 px-5 py-3 font-thin text-black hover:bg-gray-50 dark:text-white dark:hover:text-black dark:hover:bg-white"
                >
                  Favorites
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileMenuOpen(false)}
                  className="gap-3 px-5 py-3 font-thin text-black hover:bg-gray-50 dark:text-white dark:hover:text-black dark:hover:bg-white"
                >
                  Cart ({getCartCount()})
                </Link>
              </>
            ) : null }

            <button
              onClick={() => {
                setDesktopMenuOpen(false);
                setTab("profile");
                setModalOpen(true);
              }}
              className="flex items-center gap-3 px-5 py-3 text-black hover:bg-gray-50 dark:text-white dark:hover:text-black dark:hover:bg-white transition"
            >
              <span className="font-thin">Manage Account</span>
            </button>
            {mounted && user?.role === "admin" && (
              <div
                onClick={handleAdminClick}
                className="flex items-center gap-3 px-5 py-3 text-black hover:bg-gray-50 dark:text-white dark:hover:text-black dark:hover:bg-white transition font-thin cursor-pointer"
              >
                <span className="">Admin</span>
                {/* <ShieldAlert className="w-5 h-5 text-black" /> */}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:text-white transition"
            >
              <LogOut className="w-5 h-5 font-thin" />
              <span className="font-thin">Sign Out</span>
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 px-5 py-3 text-xs text-gray-400 dark:text-gray-700 bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-gray-700">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-thin">
              Secured by <span className="font-thin">{footerData.footerName}</span>
            </span>
          </div>
        </div>
      )}

      {/* ================= MOBILE SHEET ================= */}
      <Transition show={mobileMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="md:hidden fixed inset-0 z-50 flex items-center justify-center"
          onClose={() => setMobileMenuOpen(false)}
        >
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
          </Transition.Child>

          {/* Centered Panel */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="relative z-50 w-full max-w-md mx-auto rounded-2xl border dark:border-white bg-white dark:bg-black shadow-2xl overflow-hidden">
              {/* Profile Header */}

              <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 dark:bg-black border-b">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 border dark:border-white rounded-full bg-black flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="font-thin text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-sm font-thin text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
              </div>



              {/* Actions */}
              <div className="flex flex-col py-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTab("profile");
                    setModalOpen(true);
                  }}
                  className="flex items-center gap-3 px-5 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
                >
                  <User className="w-5 h-5" />
                  <span className="font-thin">Manage Account</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-5 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:text-white transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-thin">Sign Out</span>
                </button>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-center gap-2 px-5 py-3 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-black border-t">
                <ShieldCheck className="w-4 h-4" />
                <span className="font-thin">
                  Secured by <span className="font-thin">{footerData.footerName}</span>
                </span>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>


      {/* ================= FULL ACCOUNT MODAL (desktop+mobile) ================= */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-50">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

        {/* Centered modal */}
        <div className="fixed inset-0 flex items-center justify-center px-4 sm:px-6">
          <Dialog.Panel className="w-full max-w-3xl md:max-w-4xl max-h-[90vh] md:max-h-[80vh] rounded-2xl bg-white dark:bg-black shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Sidebar */}
            <div className="flex md:flex-col w-full md:w-48 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
              {["profile", "security"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 md:flex-none text-center md:text-left px-3 py-2 font-medium border-b md:border-b-0 md:border-l md:first:border-l-0
                    ${tab === t
                      ? "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-5">
              {tab === "profile" && (
                <div className="space-y-5">
                  {/* Avatar */}
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-20 h-20 border dark:border-white rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="bg-black w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 w-full">
                      <label className="block font-thin text-black dark:text-white">
                        Change avatar
                      </label>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <label className="inline-block cursor-pointer border dark:border-white bg-gray-50 dark:bg-black text-black dark:text-white text-sm px-4 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-black transition">
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="font-thin text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Name & Username */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="font-thin text-black dark:text-white w-full sm:w-1/3">
                      Full Name
                    </p>
                    <input
                      value={localName}
                      onChange={(e) => setLocalName(e.target.value)}
                      className="w-full sm:w-2/3 px-2 py-1 rounded border border-gray-300 dark:border-gray-700
                        bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100
                        placeholder-gray-400 dark:placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-white
                        transition-colors duration-300"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <p className="font-thin text-black dark:text-white w-full sm:w-1/3">
                      Username
                    </p>
                    <input
                      value={localUsername}
                      onChange={(e) => setLocalUsername(e.target.value)}
                      className="w-full sm:w-2/3 px-2 py-1 rounded border border-gray-300 dark:border-gray-700
                        bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100
                        placeholder-gray-400 dark:placeholder-gray-500
                        focus:outline-none focus:ring-2 focus:ring-white
                        transition-colors duration-300"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <p className="font-thin text-black dark:text-white">
                      Email Address
                    </p>
                    <p className="text-gray-500 font-thin dark:text-gray-400 break-all text-sm">
                      {user?.email}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={savingProfile}
                      className="bg-orange-600 text-sm text-white px-5 py-2 rounded-full hover:bg-orange-700 transition"
                    >
                      {savingProfile ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      onClick={() => {
                        setModalOpen(false);
                        setTab("profile");
                      }}
                      className="text-sm text-gray-600 dark:text-white hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

              )}

              {/* Security */}
              {tab === "security" && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <p className="font-normal text-black dark:text-gray-200">Password</p>
                    <button className="text-sm text-orange-600 hover:underline">Update password</button>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-3">
                    {/* Current password */}
                    <div className="relative w-full sm:w-2/3 md:w-1/2">
                      <input
                        type={showCurrent ? "text" : "password"}
                        placeholder="Current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 font-normal rounded border border-gray-300 dark:border-gray-700 
                          bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100 
                          placeholder-gray-400 dark:placeholder-gray-500 
                          pr-10 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                      >
                        {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* New password */}
                    <div className="relative w-full sm:w-2/3 md:w-1/2">
                      <input
                        type={showNew ? "text" : "password"}
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 font-normal rounded border border-gray-300 dark:border-gray-700 
                          bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100 
                          placeholder-gray-400 dark:placeholder-gray-500 
                          pr-10 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400"
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={changingPass}
                      className="bg-orange-600 text-sm text-white px-5 py-2 rounded-full hover:bg-orange-700 transition"
                    >
                      {changingPass ? "Updating..." : "Update password"}
                    </button>
                  </form>

                  <div className="bg-gray-50 dark:bg-black border dark:border-white p-3 rounded-lg text-xs">
                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                      Active Device
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      {deviceInfo.os} • {deviceInfo.browser} • {location || "Loading..."}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      Today at {time || "Loading..."}
                    </p>
                  </div>


                 <div className="mt-2 flex flex-col gap-1">
                    <DeleteAccountModal />
                  </div>
                </div>
              )}
            </div>
            </Dialog.Panel>
          </div>
      </Dialog>


    </div>
  );
}
