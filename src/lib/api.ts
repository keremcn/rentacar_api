import { NextRequest, NextResponse } from "next/server";
import {
  IlkRentACarApiError,
  IlkRentACarClient,
} from "@/lib/ilkrentacar/client";

export function getClient() {
  return new IlkRentACarClient({
    baseUrl: process.env.ILKRENTACAR_BASE_URL || "https://www.ilkrentacar.com",
    authToken: process.env.UPSTREAM_AUTH_TOKEN || undefined,
  });
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function handleRouteError(err: unknown) {
  if (err instanceof IlkRentACarApiError) {
    return jsonError(err.message, err.status >= 400 ? err.status : 502, {
      upstream: err.body,
    });
  }
  const message = err instanceof Error ? err.message : "Unexpected error";
  return jsonError(message, 500);
}

/**
 * Optional API key gate. If API_KEY env is set, require matching x-api-key header.
 */
export function requireApiKey(request: NextRequest): NextResponse | null {
  const expected = process.env.API_KEY;
  if (!expected) return null;
  const provided = request.headers.get("x-api-key");
  if (provided !== expected) {
    return jsonError("Unauthorized", 401);
  }
  return null;
}
