// "use client";

// import { useState } from "react";

// export default function SecuritySettings() {
//   const [twoFA, setTwoFA] = useState(false);
//   const [sessionTimeout, setSessionTimeout] = useState(30);
//   const [loginAlerts, setLoginAlerts] = useState(false);
//   const [passwordExpiry, setPasswordExpiry] = useState(false);
//   const [restrictIP, setRestrictIP] = useState("");
//   const [restrictCountry, setRestrictCountry] = useState("");
//   const [confirmAdminAction, setConfirmAdminAction] = useState(false);
//   const [auditLogging, setAuditLogging] = useState(false);

//   const handleSave = () => {
//     const settings = {
//       twoFA,
//       sessionTimeout,
//       loginAlerts,
//       passwordExpiry,
//       restrictIP,
//       restrictCountry,
//       confirmAdminAction,
//       auditLogging,
//     };

//     console.log("✅ Security Settings Saved:", settings);
//     alert("Security settings saved!");
//   };

//   return (
//     <div className="space-y-4">
//       <h3 className="font-semibold text-lg">Security Settings</h3>

//       {/* Enable 2FA */}
//       <label className="flex items-center gap-2">
//         <input
//           type="checkbox"
//           className="accent-orange-600"
//           checked={twoFA}
//           onChange={(e) => setTwoFA(e.target.checked)}
//         />
//         Require 2FA for Admins
//       </label>

//       {/* Session Timeout */}
//       <div className="flex flex-col gap-1">
//         <label className="font-medium">Session Timeout (minutes)</label>
//         <input
//           type="number"
//           min="1"
//           value={sessionTimeout}
//           onChange={(e) => setSessionTimeout(Number(e.target.value))}
//           className="border px-3 py-1 rounded w-32"
//           placeholder="e.g. 30"
//         />
//       </div>

//       {/* Login Alerts */}
//       <label className="flex items-center gap-2">
//         <input
//           type="checkbox"
//           className="accent-orange-600"
//           checked={loginAlerts}
//           onChange={(e) => setLoginAlerts(e.target.checked)}
//         />
//         Email me on new device login
//       </label>

//       {/* Password Expiry */}
//       <label className="flex items-center gap-2">
//         <input
//           type="checkbox"
//           className="accent-orange-600"
//           checked={passwordExpiry}
//           onChange={(e) => setPasswordExpiry(e.target.checked)}
//         />
//         Force password change every 90 days
//       </label>

//       {/* Restrict Login IP */}
//       <div className="flex flex-col gap-1">
//         <label className="font-medium">Restrict Login by IP</label>
//         <input
//           type="text"
//           value={restrictIP}
//           onChange={(e) => setRestrictIP(e.target.value)}
//           className="border px-3 py-1 rounded w-full"
//           placeholder="e.g. 192.168.0.1, 10.0.0.0/24"
//         />
//       </div>

//       {/* Restrict Admin Panel Access by Country */}
//       <div className="flex flex-col gap-1">
//         <label className="font-medium">Restrict Admin Panel by Country</label>
//         <input
//           type="text"
//           value={restrictCountry}
//           onChange={(e) => setRestrictCountry(e.target.value)}
//           className="border px-3 py-1 rounded w-full"
//           placeholder="e.g. US, CA, GB"
//         />
//       </div>

//       {/* Admin Action Confirmation */}
//       <label className="flex items-center gap-2">
//         <input
//           type="checkbox"
//           className="accent-orange-600"
//           checked={confirmAdminAction}
//           onChange={(e) => setConfirmAdminAction(e.target.checked)}
//         />
//         Require password confirmation for editing/deleting products
//       </label>

//       {/* Audit Logging */}
//       <label className="flex items-center gap-2">
//         <input
//           type="checkbox"
//           className="accent-orange-600"
//           checked={auditLogging}
//           onChange={(e) => setAuditLogging(e.target.checked)}
//         />
//         Enable admin activity logging
//       </label>

//       {/* Save button */}
//       <button
//         onClick={handleSave}
//         className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
//       >
//         Save Security Settings
//       </button>
//     </div>
//   );
// }

























"use client";

import { useState, useEffect } from "react";

export default function SecuritySettings() {
  const [loading, setLoading] = useState(true);

  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [loginAlerts, setLoginAlerts] = useState(false);
  const [passwordExpiry, setPasswordExpiry] = useState(false);
  const [restrictIP, setRestrictIP] = useState("");
  const [restrictCountry, setRestrictCountry] = useState("");
  const [confirmAdminAction, setConfirmAdminAction] = useState(false);
  const [auditLogging, setAuditLogging] = useState(false);

  // Load settings from API
  useEffect(() => {
    fetch("/api/settings/security")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setTwoFA(data.twoFA);
          setSessionTimeout(data.sessionTimeout);
          setLoginAlerts(data.loginAlerts);
          setPasswordExpiry(data.passwordExpiry);
          setRestrictIP(data.restrictIP);
          setRestrictCountry(data.restrictCountry);
          setConfirmAdminAction(data.confirmAdminAction);
          setAuditLogging(data.auditLogging);
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    const settings = {
      twoFA,
      sessionTimeout,
      loginAlerts,
      passwordExpiry,
      restrictIP,
      restrictCountry,
      confirmAdminAction,
      auditLogging,
    };

    await fetch("/api/settings/security", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    alert("✅ Security settings saved!");
  };

  if (loading) return <p>Loading security settings...</p>;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Security Settings</h3>

      {/* Enable 2FA */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="accent-orange-600"
          checked={twoFA}
          onChange={(e) => setTwoFA(e.target.checked)}
        />
        Require 2FA for Admins
      </label>

      {/* Session Timeout */}
      <div className="flex flex-col gap-1">
        <label className="font-medium">Session Timeout (minutes)</label>
        <input
          type="number"
          min="1"
          value={sessionTimeout}
          onChange={(e) => setSessionTimeout(Number(e.target.value))}
          className="border px-3 py-1 rounded w-32"
          placeholder="e.g. 30"
        />
      </div>

      {/* Login Alerts */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="accent-orange-600"
          checked={loginAlerts}
          onChange={(e) => setLoginAlerts(e.target.checked)}
        />
        Email me on new device login
      </label>

      {/* Password Expiry */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="accent-orange-600"
          checked={passwordExpiry}
          onChange={(e) => setPasswordExpiry(e.target.checked)}
        />
        Force password change every 90 days
      </label>

      {/* Restrict Login IP */}
      <div className="flex flex-col gap-1">
        <label className="font-medium">Restrict Login by IP</label>
        <input
          type="text"
          value={restrictIP}
          onChange={(e) => setRestrictIP(e.target.value)}
          className="border px-3 py-1 rounded w-full"
          placeholder="e.g. 192.168.0.1, 10.0.0.0/24"
        />
      </div>

      {/* Restrict Admin Panel Access by Country */}
      <div className="flex flex-col gap-1">
        <label className="font-medium">Restrict Admin Panel by Country</label>
        <input
          type="text"
          value={restrictCountry}
          onChange={(e) => setRestrictCountry(e.target.value)}
          className="border px-3 py-1 rounded w-full"
          placeholder="e.g. US, CA, GB"
        />
      </div>

      {/* Admin Action Confirmation */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="accent-orange-600"
          checked={confirmAdminAction}
          onChange={(e) => setConfirmAdminAction(e.target.checked)}
        />
        Require password confirmation for editing/deleting products
      </label>

      {/* Audit Logging */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          className="accent-orange-600"
          checked={auditLogging}
          onChange={(e) => setAuditLogging(e.target.checked)}
        />
        Enable admin activity logging
      </label>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Save Security Settings
      </button>
    </div>
  );
}
