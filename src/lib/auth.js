import jwt from "jsonwebtoken";

export const SECRET = process.env.JWT_SECRET || "mysecretkey";

export const signToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: "1d" });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
};