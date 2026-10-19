import { NextRequest } from "next/server";
import { getClient, handleRouteError, jsonOk, requireApiKey } from "@/lib/api";

export async function GET(request: NextRequest) {
  const denied = requireApiKey(request);
  if (denied) return denied;

  try {
    const { searchParams } = request.nextUrl;
    const vehicles = await getClient().getVehicles({
      locationId: searchParams.get("locationId") ?? undefined,
      classId: searchParams.get("classId") ?? undefined,
      transmission: searchParams.get("transmission") ?? undefined,
      fuelType: searchParams.get("fuelType") ?? undefined,
    });
    return jsonOk({ vehicles, count: vehicles.length });
  } catch (err) {
    return handleRouteError(err);
  }
}
