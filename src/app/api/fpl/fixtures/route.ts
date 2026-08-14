import { NextResponse } from "next/server";
import { fetchFixtures } from "@/lib/fpl/fetchFixtures";

export async function GET() {
  try {
    const result = await fetchFixtures();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch FPL fixtures data" },
      { status: 502 }
    );
  }
}
