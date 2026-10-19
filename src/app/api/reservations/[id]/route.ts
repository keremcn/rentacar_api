import { NextRequest } from "next/server";
import {
  getClient,
  handleRouteError,
  jsonError,
  jsonOk,
  requireApiKey,
} from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = requireApiKey(request);
  if (denied) return denied;

  try {
    const { id } = await params;
    if (!id) return jsonError("Reservation id is required");

    const reservation = await getClient().getReservation(id);
    return jsonOk({ reservation });
  } catch (err) {
    return handleRouteError(err);
  }
}
