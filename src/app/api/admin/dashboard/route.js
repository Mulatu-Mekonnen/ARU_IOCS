import { prisma } from "@/lib/prisma";
import { roleGuard } from "@/lib/requireAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await roleGuard("ADMIN");

    const [totalUsers, totalOffices, totalAgendas] = await Promise.all([
      prisma.user.count(),
      prisma.office.count(),
      prisma.agenda.count(),
    ]);

    const pendingAgendas = await prisma.agenda.count({
      where: { status: "PENDING" },
    });
    const approvedAgendas = await prisma.agenda.count({
      where: { status: "APPROVED" },
    });
    const rejectedAgendas = await prisma.agenda.count({
      where: { status: "REJECTED" },
    });

    const statusGroups = await prisma.agenda.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    let officeGroups = [];
    try {
      const officeGroupsRaw = await prisma.agenda.groupBy({
        by: ["senderOfficeId"],
        _count: { id: true },
      });
      // fetch office names
      const officeIds = officeGroupsRaw
        .map((g) => g.senderOfficeId)
        .filter((id) => id !== null);
      const offices = await prisma.office.findMany({
        where: { id: { in: officeIds } },
        select: { id: true, name: true },
      });
      const officeMap = offices.reduce((acc, o) => {
        acc[o.id] = o.name;
        return acc;
      }, {});
      officeGroups = officeGroupsRaw.map((g) => ({
        ...g,
        name: g.senderOfficeId ? officeMap[g.senderOfficeId] || "-" : "-",
      }));
    } catch (err) {
      console.error("Office groups error:", err);
      // If column doesn't exist, leave officeGroups empty
    }

    return NextResponse.json({
      totalUsers,
      totalOffices,
      totalAgendas,
      pendingAgendas,
      approvedAgendas,
      rejectedAgendas,
      statusGroups,
      officeGroups,
    });
  } catch (err) {
    console.error(err);
    const status = err?.status || 500;
    const message = err?.message || (status === 403 ? "Forbidden" : "Server error");
    return NextResponse.json({ message }, { status });
  }
}