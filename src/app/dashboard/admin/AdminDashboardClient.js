"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardClient() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/admin/dashboard", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`API Error: ${res.status} ${errText}`);
        }
        return res.json();
      })
      .then(setData)
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setData({ statusGroups: [], officeGroups: [] });
        if (err.message.includes("401") || err.message.includes("403")) {
          router.push("/login");
        }
      });
  }, [router]);

  if (!data) return <div>Loading...</div>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">System Overview</h1>
      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={data.totalUsers || 0} />
        <StatCard title="Total Offices" value={data.totalOffices || 0} />
        <StatCard title="Total Agendas" value={data.totalAgendas || 0} />
        <StatCard title="Pending" value={data.pendingAgendas || 0} color="yellow" />
        <StatCard title="Approved" value={data.approvedAgendas || 0} color="green" />
        <StatCard title="Rejected" value={data.rejectedAgendas || 0} color="red" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Agendas by Status</h2>
          { (data.statusGroups || []).map((g) => (
            <div key={g.status} className="flex justify-between mb-2">
              <span className="capitalize">{g.status.toLowerCase()}</span>
              <span>{g._count.status}</span>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-4">Agendas by Office</h2>
          { (data.officeGroups || []).map((g) => (
            <div key={g.senderOfficeId} className="flex justify-between mb-2">
              <span>{g.name}</span>
              <span>{g._count.id}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function StatCard({ title, value, color = "gray" }) {
  const colorClasses = {
    gray: "bg-arsiLight",
    yellow: "bg-yellow-100",
    green: "bg-green-100",
    red: "bg-red-100",
  };
  return (
    <div className={`${colorClasses[color]} p-6 rounded-2xl shadow`}>
      <h3 className="text-sm text-gray-500 uppercase">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}