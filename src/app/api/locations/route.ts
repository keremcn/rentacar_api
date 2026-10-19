import { NextRequest } from "next/server";
import { getClient, handleRouteError, jsonOk, requireApiKey } from "@/lib/api";

export async function GET(request: NextRequest) {
  const denied = requireApiKey(request);
  if (denied) return denied;

  try {
    const locations = await getClient().getBranches();
    return jsonOk({ locations });
  } catch (err) {
    return handleRouteError(err);
  }
}
