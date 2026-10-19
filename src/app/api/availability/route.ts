import { NextRequest } from "next/server";
import {
  getClient,
  handleRouteError,
  jsonError,
  jsonOk,
  requireApiKey,
} from "@/lib/api";

export async function GET(request: NextRequest) {
  const denied = requireApiKey(request);
  if (denied) return denied;

  try {
    const { searchParams } = request.nextUrl;
    const pickupDate =
      searchParams.get("start") ?? searchParams.get("pickupDate");
    const returnDate =
      searchParams.get("end") ?? searchParams.get("returnDate");

    if (!pickupDate || !returnDate) {
      return jsonError(
        "Required query params: start (or pickupDate) and end (or returnDate)",
      );
    }

    const result = await getClient().getAvailability({
      pickupDate,
      returnDate,
      pickupTime:
        searchParams.get("pickupTime") ??
        searchParams.get("startTime") ??
        undefined,
      returnTime:
        searchParams.get("returnTime") ??
        searchParams.get("endTime") ??
        undefined,
      locationId:
        searchParams.get("locationId") ??
        searchParams.get("pickup") ??
        undefined,
    });

    return jsonOk({
      ...result,
      count: result.vehicles.length,
    });
  } catch (err) {
    return handleRouteError(err);
  }
}
