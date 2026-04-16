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
  try {
    const { searchParams } = new URL(req.url);

    const path = searchParams.get("path") || "";

    // 👉 construir body desde query params
    const body: Record<string, string | number> = {};
    searchParams.forEach((value, key) => {
      if (key !== "path") {
        body[key] = isNaN(Number(value)) ? value : Number(value);
      }
    });

    const url = `${BASE_URL}/${path}`;

    const res = await fetch(url, {
      method: "POST", // 🔥 CAMBIO CLAVE
      headers: HEADERS,
      body: JSON.stringify(body),
      next: { revalidate: 30 },
    });

    // 🔥 validar respuesta
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          success: false,
          status: res.status,
          error: text,
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Error interno",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
