# İlkRentACar API

[ilkrentacar.com](https://www.ilkrentacar.com) sitesinin Filoplan destekli backend çağrılarını Vercel üzerinde yayınlanabilir bir REST API’ye dönüştürür.

## Mimari

```
Client → Next.js API (Vercel) → IlkRentACarClient → ilkrentacar.com /api/filoplan/*
```

Typed client: `scripts/ilkrentacar_api/` ve `src/lib/ilkrentacar/`.

## Lokal çalıştırma

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## Endpoint’ler

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/` | API kataloğu |
| GET | `/api/health` | Canlılık |
| GET | `/api/locations` | Şubeler / lokasyonlar |
| GET | `/api/campaigns` | Kampanyalar |
| GET | `/api/vehicles` | Araç listesi |
| GET | `/api/availability` | Tarih aralığına göre müsait araçlar |
| POST | `/api/reservations` | Rezervasyon oluştur |
| GET | `/api/reservations/:id` | Rezervasyon durumu (auth gerekebilir) |

### Curl örnekleri

```bash
curl http://localhost:3000/api/health

curl http://localhost:3000/api/locations

curl "http://localhost:3000/api/vehicles?locationId=cmqettpg90001snclmb1fut8l"

curl "http://localhost:3000/api/availability?start=2026-10-20&end=2026-10-22&pickupTime=10:00&returnTime=10:00&locationId=cmqettpg90001snclmb1fut8l"

curl http://localhost:3000/api/campaigns

curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d "{
    \"vehicleId\": \"cmtwr2p0f0003m8lo12e7bxlb\",
    \"branchId\": \"cmqettpg90001snclmb1fut8l\",
    \"startDate\": \"2026-10-20\",
    \"endDate\": \"2026-10-22\",
    \"startTime\": \"10:00\",
    \"endTime\": \"10:00\",
    \"customer\": {
      \"firstName\": \"Ali\",
      \"lastName\": \"Yılmaz\",
      \"phone\": \"5320000000\",
      \"email\": \"ali@example.com\"
    },
    \"vehicleName\": \"FIAT DOBLO\",
    \"branchName\": \"ANKARA\",
    \"dailyPrice\": 0
  }"
```

`API_KEY` tanımlıysa her istekte `x-api-key` header’ı gönderin.

## Ortam değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `API_KEY` | Opsiyonel public API koruması |
| `ILKRENTACAR_BASE_URL` | Upstream origin (varsayılan site URL) |
| `UPSTREAM_AUTH_TOKEN` | Rezervasyon sorgusu için Bearer token |

## Vercel deploy

1. Repo’yu GitHub’a push edin (veya `vercel` CLI kullanın).
2. [vercel.com](https://vercel.com) → New Project → bu repo.
3. Environment Variables: `.env.example` alanlarını ekleyin.
4. Deploy. Framework otomatik Next.js algılanır (`vercel.json` hazır).

CLI:

```bash
npm i -g vercel
vercel
vercel --prod
```

## reverse-api-engineer

Trafik yakalama / client üretimi için:

```bash
# uv tool install "reverse-api-engineer[manual]"
reverse-api-engineer agent --prompt "capture vehicles locations reservations" --url https://www.ilkrentacar.com --json
```

Mevcut client, site JS bundle’larından ve canlı `/api/filoplan/*` yanıtlarından doğrulanmıştır.

## Notlar

- Upstream rezervasyon endpoint’i ara sıra 502 dönebilir (Cloudflare / origin).
- `GET /api/reservations/:id` site tarafında auth ister; `UPSTREAM_AUTH_TOKEN` gerekir.
- Kampanyalar public Filoplan API’de yok; site içeriğinden sabitlenmiştir.
