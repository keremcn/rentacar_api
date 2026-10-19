/**
 * İlkRentACar API Client
 *
 * Reverse-engineered from https://www.ilkrentacar.com network traffic.
 * Upstream: site Next.js proxies → Filoplan (filoplan.com.tr).
 */

export interface Branch {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  phone: string | null;
}

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  transmission: string | null;
  fuelType: string | null;
  color: string | null;
  dailyPrice: number | null;
  monthlyPrice: number | null;
  class: string | null;
  classId: string | null;
  branchId: string | null;
  images: string[];
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  sourceUrl: string;
}

export interface ReservationCustomer {
  name: string;
  phone: string;
  email?: string;
  identityNo?: string;
}

export interface CreateReservationInput {
  vehicleId: string;
  branchId?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  customer: ReservationCustomer;
  vehicleName?: string;
  branchName?: string;
  dailyPrice?: number;
}

export interface ReservationResult {
  reservation: {
    id: string;
    [key: string]: unknown;
  };
  filoplan?: {
    reservationNo?: string | null;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AvailabilityQuery {
  pickupDate: string;
  returnDate: string;
  pickupTime?: string;
  returnTime?: string;
  locationId?: string;
}

export interface AvailabilityResult {
  range: {
    pickupDate: string;
    returnDate: string;
    pickupTime: string;
    returnTime: string;
    locationId: string | null;
  };
  vehicles: Vehicle[];
}

export interface IlkRentACarClientOptions {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
}

const DEFAULT_BASE = "https://www.ilkrentacar.com";

export const SITE_CAMPAIGNS: Campaign[] = [
  {
    id: "erken-rezervasyon",
    title: "Erken Rezervasyon Fırsatı",
    description: "Erken rezervasyon yapan müşterilere özel indirim fırsatları.",
    imageUrl: "https://www.ilkrentacar.com/kampanya-erken-rezervasyon.jpg",
    sourceUrl: "https://www.ilkrentacar.com/kampanyalar",
  },
  {
    id: "kurumsal-kiralama",
    title: "Kurumsal Kiralama İndirimi",
    description:
      "Kurumsal müşterilere özel filo ve uzun dönem kiralama avantajları.",
    imageUrl: null,
    sourceUrl: "https://www.ilkrentacar.com/kampanyalar",
  },
  {
    id: "havalimani-ozel",
    title: "Havalimanı Özel",
    description: "Havalimanı teslim / iade için özel kampanya koşulları.",
    imageUrl: null,
    sourceUrl: "https://www.ilkrentacar.com/kampanyalar",
  },
  {
    id: "yeni-musteri",
    title: "Yeni Müşteri Kampanyası",
    description: "İlk kez kiralayan müşterilere özel karşılama avantajları.",
    imageUrl: null,
    sourceUrl: "https://www.ilkrentacar.com/kampanyalar",
  },
];

export class IlkRentACarClient {
  readonly baseUrl: string;
  private readonly authToken?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: IlkRentACarClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE).replace(/\/$/, "");
    this.authToken = options.authToken;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (!headers.has("Accept")) headers.set("Accept", "application/json");
    if (init.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (this.authToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${this.authToken}`);
    }

    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    const text = await res.text();
    let data: unknown = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text.slice(0, 500) };
      }
    }

    if (!res.ok) {
      const err =
        data && typeof data === "object" && "error" in data
          ? String((data as { error: unknown }).error)
          : `Upstream ${res.status}`;
      throw new IlkRentACarApiError(err, res.status, data);
    }

    return data as T;
  }

  async getBranches(): Promise<Branch[]> {
    const data = await this.request<{ branches: Branch[] }>(
      "/api/filoplan/branches",
    );
    return data.branches ?? [];
  }

  async getVehicles(params?: {
    locationId?: string;
    classId?: string;
    transmission?: string;
    fuelType?: string;
  }): Promise<Vehicle[]> {
    const qs = new URLSearchParams();
    if (params?.locationId) qs.set("locationId", params.locationId);
    if (params?.classId) qs.set("classId", params.classId);
    if (params?.transmission) qs.set("transmission", params.transmission);
    if (params?.fuelType) qs.set("fuelType", params.fuelType);
    const suffix = qs.toString() ? `?${qs}` : "";
    const data = await this.request<{ vehicles: Vehicle[] }>(
      `/api/filoplan/vehicles${suffix}`,
    );
    let vehicles = data.vehicles ?? [];

    if (params?.locationId) {
      vehicles = vehicles.filter(
        (v) => !v.branchId || v.branchId === params.locationId,
      );
    }
    if (params?.classId) {
      vehicles = vehicles.filter((v) => v.classId === params.classId);
    }
    if (params?.transmission) {
      const t = params.transmission.toLowerCase();
      vehicles = vehicles.filter(
        (v) => (v.transmission ?? "").toLowerCase() === t,
      );
    }
    if (params?.fuelType) {
      const f = params.fuelType.toLowerCase();
      vehicles = vehicles.filter(
        (v) => (v.fuelType ?? "").toLowerCase() === f,
      );
    }
    return vehicles;
  }

  async getAvailability(query: AvailabilityQuery): Promise<AvailabilityResult> {
    const pickupTime = query.pickupTime ?? "10:00";
    const returnTime = query.returnTime ?? "10:00";
    const vehicles = await this.getVehicles({ locationId: query.locationId });

    return {
      range: {
        pickupDate: query.pickupDate,
        returnDate: query.returnDate,
        pickupTime,
        returnTime,
        locationId: query.locationId ?? null,
      },
      vehicles,
    };
  }

  async getCampaigns(): Promise<Campaign[]> {
    return SITE_CAMPAIGNS;
  }

  async createReservation(
    input: CreateReservationInput,
  ): Promise<ReservationResult> {
    return this.request<ReservationResult>("/api/filoplan/reservations", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async getReservation(id: string): Promise<unknown> {
    return this.request(`/api/reservations/${encodeURIComponent(id)}`);
  }
}

export class IlkRentACarApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "IlkRentACarApiError";
  }
}

export default IlkRentACarClient;
