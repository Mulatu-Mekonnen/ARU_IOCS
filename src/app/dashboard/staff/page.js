"use client";

import { useEffect, useState } from "react";

export default function StaffDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/dashboard/staff", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading staff dashboard...</div>;

  return <div>
    <h1>Staff Dashboard</h1>
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </div>;
}