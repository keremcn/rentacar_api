import { NextRequest } from "next/server";
import type { CreateReservationInput } from "@/lib/ilkrentacar/client";
import {
  getClient,
  handleRouteError,
  jsonError,
  jsonOk,
  requireApiKey,
} from "@/lib/api";

type ReservationBody = {
  vehicleId?: string;
  branchId?: string;
  locationId?: string;
  startDate?: string;
  endDate?: string;
  pickupDate?: string;
  returnDate?: string;
  startTime?: string;
  endTime?: string;
  pickupTime?: string;
  returnTime?: string;
  vehicleName?: string;
  branchName?: string;
  dailyPrice?: number;
  customer?: {
    name?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    identityNo?: string;
    idNumber?: string;
  };
};

function normalizeBody(body: ReservationBody): CreateReservationInput | string {
  const vehicleId = body.vehicleId?.trim();
  if (!vehicleId) return "vehicleId is required";

  const startDate = body.startDate ?? body.pickupDate;
  const endDate = body.endDate ?? body.returnDate;
  if (!startDate || !endDate) {
    return "startDate/endDate (or pickupDate/returnDate) are required";
  }

  const startTime = body.startTime ?? body.pickupTime ?? "10:00";
  const endTime = body.endTime ?? body.returnTime ?? "10:00";
  const branchId = body.branchId ?? body.locationId;

  const c = body.customer ?? {};
  const name =
    c.name?.trim() ||
    [c.firstName, c.lastName].filter(Boolean).join(" ").trim();
  const phone = c.phone?.trim();
  if (!name) return "customer.name (or firstName/lastName) is required";
  if (!phone) return "customer.phone is required";

  return {
    vehicleId,
    branchId: branchId || undefined,
    startDate,
    endDate,
    startTime,
    endTime,
    customer: {
      name,
      phone,
      email: c.email || undefined,
      identityNo: c.identityNo ?? c.idNumber ?? undefined,
    },
    vehicleName: body.vehicleName,
    branchName: body.branchName,
    dailyPrice: body.dailyPrice ?? 0,
  };
}

export async function POST(request: NextRequest) {
  const denied = requireApiKey(request);
  if (denied) return denied;

  try {
    let body: ReservationBody;
    try {
      body = (await request.json()) as ReservationBody;
    } catch {
      return jsonError("Invalid JSON body");
    }

    const normalized = normalizeBody(body);
    if (typeof normalized === "string") {
      return jsonError(normalized);
    }

    const result = await getClient().createReservation(normalized);
    return jsonOk(result, { status: 201 });
  } catch (err) {
    return handleRouteError(err);
  }
}
