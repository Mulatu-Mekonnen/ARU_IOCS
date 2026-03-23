"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StaffCreateClient() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [receiverOffice, setReceiverOffice] = useState("");
  const [offices, setOffices] = useState([]);
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/offices", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch offices");
        return r.json();
      })
      .then(setOffices)
      .catch((err) => {
        console.error(err);
        setOffices([]);
      });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title.trim() || !receiverOffice) {
      setError("Title and receiver office are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/agendas", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, receiverOfficeId: receiverOffice }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create communication");
      }

      if (attachment) {
        const fd = new FormData();
        fd.append("agendaId", data.id);
        fd.append("file", attachment);
        const uploadRes = await fetch("/api/agendas/upload", { method: "POST", body: fd });
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || "Failed to upload attachment");
        }
      }

      setSuccess("Communication created successfully.");
      setTitle("");
      setDescription("");
      setReceiverOffice("");
      setAttachment(null);
      setTimeout(() => router.push("/dashboard/staff/sent"), 700);
    } catch (err) {
      setError(err.message || "Server error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h1 className="text-2xl font-bold mb-4">Create Communication</h1>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">{success}</div>}

      <form onSubmit={submit} className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded p-2" placeholder="Title" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 rounded p-2" rows={4} placeholder="Description" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Office *</label>
          <select value={receiverOffice} onChange={(e) => setReceiverOffice(e.target.value)} className="w-full border border-gray-300 rounded p-2" required>
            <option value="">Select office</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>{office.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
          <input type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="w-full" />
        </div>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-70">
          {isSubmitting ? "Sending..." : "Send Communication"}
        </button>
      </form>
    </div>
  );
}
