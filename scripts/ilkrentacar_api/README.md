# İlkRentACar API Client

TypeScript client reverse-engineered from [ilkrentacar.com](https://www.ilkrentacar.com) (Filoplan-backed).

## Upstream

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/filoplan/branches` | Locations |
| GET | `/api/filoplan/vehicles` | Fleet |
| POST | `/api/filoplan/reservations` | Create booking |
| GET | `/api/reservations/:id` | Status (auth may be required) |

## Usage

```ts
import { IlkRentACarClient } from "./api_client";

const client = new IlkRentACarClient();
const branches = await client.getBranches();
const vehicles = await client.getVehicles({ locationId: branches[0].id });
```

This client is also imported by the Vercel Next.js API routes under `src/lib/ilkrentacar`.
