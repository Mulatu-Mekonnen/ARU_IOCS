"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) return router.push("/login");
    if (user.role === "admin") router.push("/dashboard/admin");
    else router.push("/dashboard/user");
  }, [router, user]);

  return <div>Redirecting to your dashboard...</div>;
}