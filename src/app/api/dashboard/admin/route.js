import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Temporary dummy data
    return NextResponse.json({
      totalUsers: 25,
      totalAgendas: 48,
      pendingAgendas: 6,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}