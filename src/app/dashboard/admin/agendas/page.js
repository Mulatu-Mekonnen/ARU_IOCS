"use client";
import { useEffect, useState } from "react";

export default function AgendaManagement() {
  const [agendas, setAgendas] = useState([]);
  const [officeFilter, setOfficeFilter] = useState("");

  useEffect(() => {
    loadAgendas();
  }, [officeFilter]);

  async function loadAgendas() {
    const res = await fetch(
      `/api/admin/agendas${officeFilter ? `?officeId=${officeFilter}` : ""}`
    );
    const data = await res.json();
    setAgendas(data);
  }

  async function updateStatus(id, status) {
    await fetch(`/api/admin/agendas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    loadAgendas();
  }

  function statusBadge(status) {
    if (status === "APPROVED")
      return "bg-green-100 text-green-700";
    if (status === "REJECTED")
      return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Agenda Management</h1>

      <select
        onChange={(e) => setOfficeFilter(e.target.value)}
        className="border p-2 rounded mb-4"
      >
        <option value="">All Offices</option>
        <option value="1">Office 1</option>
        <option value="2">Office 2</option>
      </select>

      <table className="w-full border rounded-lg bg-white shadow">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3">Title</th>
            <th className="p-3">Office</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {agendas.map((agenda) => (
            <tr key={agenda.id} className="border-t">
              <td className="p-3">{agenda.title}</td>
              <td className="p-3">{agenda.office?.name}</td>
              <td className="p-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${statusBadge(
                    agenda.status
                  )}`}
                >
                  {agenda.status}
                </span>
              </td>
              <td className="p-3 space-x-2">
                {agenda.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => updateStatus(agenda.id, "APPROVED")}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(agenda.id, "REJECTED")}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}