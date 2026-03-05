import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function verifyRole(request, allowedRoles = []) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!allowedRoles.includes(decoded.role)) {
      return { error: "Forbidden", status: 403 };
    }

    return { user: decoded };

  } catch (err) {
    return { error: "Invalid token", status: 401 };
  }
}