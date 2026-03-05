"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
  fetch("/api/dashboard/admin")
    .then(async (res) => {
      if (!res.ok) throw new Error("API Error");
      return res.json();
    })
    .then(setData)
    .catch((err) => {
      console.error(err);
    });
}, []);
  if (!data) return <div>Loading...</div>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        System Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={data.totalUsers || 0} />
        <StatCard title="Total Agendas" value={data.totalAgendas || 0} />
        <StatCard title="Pending Approvals" value={data.pendingAgendas || 0} />
      </div>
    </>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow">
      <h3 className="text-sm text-gray-500 uppercase">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}