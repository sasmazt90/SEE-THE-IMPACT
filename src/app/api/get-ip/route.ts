export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  try {
    // Get IP from headers (x-forwarded-for for proxied requests)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    // Extract client IP
    const ip = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

    // Hash the IP with SHA-256
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    return NextResponse.json({ ip_hash: ipHash });
  } catch (error) {
    console.error("Error hashing IP:", error);
    return NextResponse.json({ ip_hash: "unknown" });
  }
}
