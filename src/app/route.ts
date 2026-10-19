import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "İlkRentACar API",
    version: "1.0.0",
    upstream: "https://www.ilkrentacar.com",
    docs: "See README.md for curl examples and Vercel deploy steps.",
    endpoints: [
      { method: "GET", path: "/api/health" },
      { method: "GET", path: "/api/locations" },
      { method: "GET", path: "/api/campaigns" },
      {
        method: "GET",
        path: "/api/vehicles",
        query: ["locationId", "classId", "transmission", "fuelType"],
      },
      {
        method: "GET",
        path: "/api/availability",
        query: [
          "start|pickupDate",
          "end|returnDate",
          "pickupTime",
          "returnTime",
          "locationId|pickup",
        ],
      },
      { method: "POST", path: "/api/reservations" },
      { method: "GET", path: "/api/reservations/:id" },
    ],
  });
}
