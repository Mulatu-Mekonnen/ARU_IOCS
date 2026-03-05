// src/lib/session.js
const { cookies } = require('next/headers');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getSessionUser() {
  const cookieStore = await cookies();   // ← await here is required!
  const sessionToken = cookieStore.get('session')?.value;

  if (!sessionToken) return null;

  try {
    const userId = Number(sessionToken);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        office: true,
      },
    });
    return user;
  } catch (err) {
    console.error('Session error:', err);
    return null;
  }
}

function createSession(userId) {
  cookies().set('session', String(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
}

function destroySession() {
  cookies().delete('session');
}

module.exports = { getSessionUser, createSession, destroySession };