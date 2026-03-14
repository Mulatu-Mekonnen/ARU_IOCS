import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { verifyRole } from "@/lib/adminGuard";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXT = [".pdf", ".docx"];

export const runtime = "nodejs";

export async function POST(request) {
  const auth = verifyRole(request, ["STAFF"]);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const formData = await request.formData();
  const agendaId = formData.get("agendaId");
  const file = formData.get("file");

  if (!agendaId) {
    return NextResponse.json({ error: "Missing agendaId" }, { status: 400 });
  }
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const filename = file.name;
  const size = file.size;

  if (size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });
  }

  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "agendas");
  await fs.mkdir(uploadsDir, { recursive: true });

  const safeName = `agenda_${agendaId}_${Date.now()}${ext}`;
  const filePath = path.join(uploadsDir, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  const url = `/uploads/agendas/${safeName}`;

  // Update agenda record with attachment metadata
  await prisma.agenda.update({
    where: { id: agendaId },
    data: {
      attachmentUrl: url,
      attachmentName: filename,
      attachmentSize: size,
    },
  });

  return NextResponse.json({
    url,
    name: filename,
    size,
  });
}
