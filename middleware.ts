import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const maintenance = true; // 🔥 cambia a false cuando termines

  // Permitir APIs si quieres (opcional)
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (maintenance) {
    return NextResponse.rewrite(new URL("/maintenance", req.url));
  }

  return NextResponse.next();
}
