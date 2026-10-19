/**
 * Example usage for the İlkRentACar API client.
 * Run with: npx tsx scripts/ilkrentacar_api/example_usage.ts
 */
import { IlkRentACarClient } from "./api_client";

async function main() {
  const client = new IlkRentACarClient();

  const branches = await client.getBranches();
  console.log("Branches:", branches);

  const vehicles = await client.getVehicles({
    locationId: branches[0]?.id,
  });
  console.log(
    "Vehicles:",
    vehicles.map((v) => `${v.brand} ${v.model}`),
  );

  const availability = await client.getAvailability({
    pickupDate: "2026-10-20",
    returnDate: "2026-10-22",
    pickupTime: "10:00",
    returnTime: "10:00",
    locationId: branches[0]?.id,
  });
  console.log("Available count:", availability.vehicles.length);

  const campaigns = await client.getCampaigns();
  console.log(
    "Campaigns:",
    campaigns.map((c) => c.title),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
