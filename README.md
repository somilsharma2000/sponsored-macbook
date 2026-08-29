# The Sponsored MacBook

> A 30-day public experiment: Can 20 brands fund one MacBook through sponsorship alone?

## What is this?

This is a marketing experiment campaign that sells physical ad space on a MacBook lid to brands. 20 positions at 4 tiers, tracked with QR codes, live analytics, and a published case study.

**Target:** ₹6,00,000 (MacBook Pro 16" M5 Max + AppleCare+ + skins + fees)
**Duration:** 30 days
**Guarantee:** 100% refund if target isn't reached

## Sponsor Tiers

| Tier | Price | Positions | What you get |
|------|-------|-----------|--------------|
| Crown | ₹1,00,000 | 1 | Center of lid, QR tracking, landing page, social content, case study |
| Founding | ₹50,000 | 4 | Premium position, QR tracking, landing page, 2x social content |
| Standard | ₹25,000 | 10 | Lid position, QR tracking, sponsor profile |
| Community | ₹10,000 | 5 | Smaller position, QR tracking, sponsor listing |

## Tech Stack

- **Frontend:** Single-page HTML/CSS/JS (no framework, no build step)
- **Backend:** Base44 backend functions (Deno + TypeScript)
- **Database:** Base44 entities (Sponsor, Nomination, CampaignActivity, SponsorPosition)
- **Payments:** Razorpay (RBI-authorized payment aggregator)
- **Hosting:** Base44 public storage for website, Base44 functions for API

## Project Structure

```
sponsored-macbook/
├── index.html                  # Campaign website (self-contained)
├── functions/
│   ├── getCampaignStats.ts     # GET — campaign stats, positions, leaderboard
│   ├── submitSponsorApplication.ts  # POST — brand sponsorship application
│   ├── nominateBrand.ts        # POST — public brand nomination + voting
│   └── trackActivity.ts        # POST — page views, QR scans, shares
├── docs/
│   ├── EXECUTION_PLAN.md       # Full 30-day execution plan
│   ├── SPONSOR_AGREEMENT.md    # Template sponsor agreement
│   └── API_DOCS.md             # API endpoint documentation
├── .gitignore
└── LICENSE
```

## API Endpoints

Base URL: `https://zevio-7e7f14d1.base44.app/functions`

### GET /getCampaignStats
Returns all campaign data: funding progress, positions, leaderboard, nominations, analytics.

### POST /submitSponsorApplication
Submit a brand sponsorship application. Claims a position and creates a sponsor record.

```json
{
  "brandName": "Acme Corp",
  "contactName": "John Doe",
  "contactEmail": "john@acme.com",
  "positionNumber": 6,
  "tier": "standard"
}
```

### POST /nominateBrand
Nominate a brand for sponsorship. Auto-increments votes if brand already exists.

```json
{
  "brandName": "Boat",
  "brandWebsite": "https://boat-lifestyle.com",
  "reason": "Great D2C brand"
}
```

### POST /trackActivity
Track campaign interactions (page views, QR scans, shares).

```json
{
  "activityType": "page_view",
  "source": "website"
}
```

## Entity Schemas

### Sponsor
Brand sponsors with tracking, payment status, and position info.

### SponsorPosition
20 predefined positions with tier, price, and availability.

### Nomination
Public brand nominations with vote counting.

### CampaignActivity
Interaction tracking (page views, QR scans, shares, applications).

## Setup

### 1. Deploy Backend Functions
Each function in `functions/` is a standalone Deno script. Deploy them to Base44 backend functions.

### 2. Create Entity Schemas
Create the 4 entities (Sponsor, SponsorPosition, Nomination, CampaignActivity) in your Base44 app.

### 3. Populate Positions
Create 20 SponsorPosition records (1 Crown, 4 Founding, 10 Standard, 5 Community).

### 4. Deploy Website
Upload `index.html` to Base44 public storage or any static host. Update `API_BASE` in the script tag to point to your functions.

### 5. Configure Payments
Set up Razorpay for payment collection. Create payment links for each sponsor tier.

## Customization

### Change the target amount
Update `totalTarget` in `getCampaignStats.ts` and the countdown date in `index.html`.

### Change position pricing
Update the `SponsorPosition` records and the pricing cards in `index.html`.

### Change the campaign end date
Update `CAMPAIGN_END` in `index.html`:
```js
const CAMPAIGN_END = new Date('2026-09-28T23:59:59+05:30').getTime();
```

## License

MIT — use this as a template for your own sponsored-object campaigns.
