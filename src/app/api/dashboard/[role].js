import { verifyToken } from "@/lib/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { role } = req.query;
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  const user = verifyToken(token);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  if (user.role !== role) return res.status(403).json({ message: "Forbidden" });

  // Mock dashboard data
  const data = role === "admin" ? { stats: "Admin stats here" } : { stats: "Staff stats here" };
  return res.status(200).json(data);
  
}