import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://resultadoelectoral.onpe.gob.pe/presentacion-backend";
const HEADERS = {
  accept: "*/*",
  "accept-language": "es-419,es;q=0.9",
  "content-type": "application/json",
  referer: "https://resultadoelectoral.onpe.gob.pe/main/resumen",
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path") || "";
  const query = searchParams.toString().replace(/^path=[^&]*&?/, "").replace(/&?path=[^&]*/, "");
  const url = `${BASE_URL}/${path}${query ? "?" + query : ""}`;

  try {
    const res = await fetch(url, { headers: HEADERS, next: { revalidate: 30 } });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, message: "Error fetching data" }, { status: 500 });
  }
}
