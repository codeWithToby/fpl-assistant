import { NextResponse } from "next/server";
import { fetchFixtures } from "@/lib/fpl/fetchFixtures";

export async function GET() {
  try {
    const data = await fetchFixtures();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch FPL fixtures data" },
      { status: 502 }
    );
  }
}
