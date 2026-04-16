import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://resultadoelectoral.onpe.gob.pe/presentacion-backend";

const HEADERS = {
  accept: "*/*",
  "accept-language": "es-419,es;q=0.9",
  "content-type": "application/json",
  "sec-fetch-site": "same-origin",
  "user-agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const path = searchParams.get("path");
    if (!path) {
      return NextResponse.json(
        { success: false, error: "Parámetro 'path' requerido" },
        { status: 400 }
      );
    }

    const forwardParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "path") forwardParams.append(key, value);
    });

    const url = `${BASE_URL}/${path}?${forwardParams.toString()}`;

    let res: Response;
    try {
      res = await fetch(url, {
        method: "GET",
        headers: HEADERS,
        next: { revalidate: 30 },
      });
    } catch (networkError) {
      return NextResponse.json(
        {
          success: false,
          error: "No se pudo conectar con la API de ONPE",
          detail: String(networkError),
        },
        { status: 503 }
      );
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        {
          success: false,
          error: `La API de ONPE respondió con estado ${res.status}`,
          detail: text,
        },
        { status: res.status }
      );
    }

    let data: unknown;
    try {
      data = await res.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "La respuesta de ONPE no es JSON válido" },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        detail: String(error),
      },
      { status: 500 }
    );
  }
}
