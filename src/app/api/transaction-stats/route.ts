import { getTransactionStats } from "@/app/actions/getTransactionStats";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("start") || undefined;
  const endDate = searchParams.get("end") || undefined;
  
  try {
    const stats = await getTransactionStats({
      startDate,
      endDate
    });
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction statistics" },
      { status: 500 }
    );
  }
} 