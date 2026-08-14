import { NextResponse } from "next/server";
import { fetchBootstrap } from "@/lib/fpl/fetchBootstrap";

export async function GET() {
  try {
    const result = await fetchBootstrap();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch FPL bootstrap data" },
      { status: 502 }
    );
  }
}
