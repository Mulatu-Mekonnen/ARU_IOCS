"use client";

import { useEffect, useState } from "react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        User Management
      </h1>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 text-sm">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Office</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
             <tr key={user.id} className="border-b">
               <td>{user.name}</td>
                <td>{user.email}</td>
                 <td>{user.role}</td>
                 <td className="p-4 space-x-2">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded">
                    Edit
                  </button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded">
                    Delete
                  </button>
                        </td>
             </tr>
            ))}
          
          </tbody>
        </table>
      </div>
    </>
  );
}