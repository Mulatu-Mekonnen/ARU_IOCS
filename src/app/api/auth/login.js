import { signToken } from "@/lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  // Replace this with your DB query
  const mockUserDB = [
    { id: 1, email: "admin@example.com", password: "admin123", role: "admin" },
    { id: 2, email: "user@example.com", password: "user123", role: "user" },
  ];

  const user = mockUserDB.find(u => u.email === email && u.password === password);

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  return res.status(200).json({ user: { id: user.id, email: user.email, role: user.role }, token });
}