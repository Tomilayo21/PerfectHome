"use client";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredLogs, setFilteredLogs] = useState([]);

  useEffect(() => {
    // Fetch logs from your API route
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/activity-logs");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };

    fetchLogs();
  }, []);

  useEffect(() => {
    if (!logs) return;
    if (!search) {
      setFilteredLogs(logs);
    } else {
      const lowerSearch = search.toLowerCase();
      setFilteredLogs(
        logs.filter(
          (log) =>
            log.user?.toLowerCase().includes(lowerSearch) ||
            log.action?.toLowerCase().includes(lowerSearch) ||
            log.date?.toLowerCase().includes(lowerSearch)
        )
      );
    }
  }, [search, logs]);

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
          <p className="text-gray-600 text-sm">
            Monitor user actions and system events in real time.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
          {filteredLogs && filteredLogs.length > 0 ? (
            <table className="min-w-full text-sm text-left text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase">
                <tr>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Action</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((log, idx) => (
                    <tr
                      key={idx}
                      className="border-t hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-2 font-medium">{log.user || "N/A"}</td>
                      <td className="px-4 py-2">{log.action || "N/A"}</td>
                      <td className="px-4 py-2">
                        {new Date(log.date).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">{log.ip || "N/A"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 text-center py-6">
              No activity logs found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
