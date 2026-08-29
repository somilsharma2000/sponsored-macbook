# API Documentation

Base URL: `https://zevio-7e7f14d1.base44.app/functions`

All endpoints accept and return JSON. POST endpoints accept JSON body.

---

## GET /getCampaignStats

Returns all campaign data in a single response.

**Response:**
```json
{
  "campaign": {
    "name": "The Sponsored MacBook",
    "tagline": "Can 20 brands fund one MacBook?",
    "target": 600000,
    "raised": 0,
    "progressPercent": 0,
    "positionsTotal": 20,
    "positionsTaken": 0,
    "positionsAvailable": 20
  },
  "stats": {
    "pageViews": 0,
    "qrScans": 0,
    "shares": 0,
    "applications": 0,
    "totalNominations": 0,
    "totalSponsors": 0
  },
  "leaderboard": [],
  "topNominations": [],
  "positions": [
    {
      "positionNumber": 1,
      "displayLabel": "CROWN",
      "price": 100000,
      "tier": "crown",
      "isAvailable": true,
      "description": "The center of the MacBook lid."
    }
  ]
}
```

---

## POST /submitSponsorApplication

Submit a brand sponsorship application. Claims a position and creates a sponsor record.

**Request:**
```json
{
  "brandName": "Acme Corp",
  "contactName": "John Doe",
  "contactEmail": "john@acme.com",
  "contactPhone": "+91 98765 43210",
  "website": "https://acme.com",
  "logoUrl": "https://acme.com/logo.png",
  "brandColor": "#FF0000",
  "positionNumber": 6,
  "tier": "standard",
  "amount": 25000,
  "founderMessage": "We love the experiment!"
}
```

**Required fields:** `brandName`, `contactEmail`, `positionNumber`

**Response (success):**
```json
{
  "success": true,
  "message": "Sponsor application submitted successfully!",
  "sponsorId": "abc123",
  "trackingId": "SP-ABC123-6",
  "position": "SPOT #06",
  "amount": 25000,
  "nextSteps": [
    "You'll receive a confirmation email within 24 hours",
    "We'll schedule a 15-minute call to discuss your sponsorship",
    "After approval, you'll receive an invoice via Razorpay",
    "Once payment is confirmed, your position is locked in"
  ]
}
```

**Response (error):**
```json
{
  "success": false,
  "error": "This position is no longer available"
}
```

---

## POST /nominateBrand

Nominate a brand for sponsorship. If brand already exists, increments vote count.

**Request:**
```json
{
  "brandName": "Boat",
  "brandWebsite": "https://boat-lifestyle.com",
  "nominatorName": "Anonymous",
  "nominatorEmail": "",
  "reason": "Great D2C brand that would benefit from this"
}
```

**Required fields:** `brandName`

**Response (new nomination):**
```json
{
  "success": true,
  "message": "Boat has been nominated!",
  "nominationId": "xyz789",
  "votes": 1
}
```

**Response (existing, vote added):**
```json
{
  "success": true,
  "message": "Vote added for Boat!",
  "totalVotes": 5
}
```

---

## POST /trackActivity

Track campaign interactions. Also accepts query parameters for GET-style tracking (QR redirects).

**Request:**
```json
{
  "activityType": "page_view",
  "source": "website",
  "referrer": "",
  "visitorId": "",
  "sponsorId": ""
}
```

**Valid `activityType` values:** `page_view`, `qr_scan`, `sponsor_click`, `share`, `nomination`, `application`

**Query parameter alternative:**
```
GET /trackActivity?activityType=qr_scan&sponsorId=abc123&source=qr_code
```

**Response:**
```json
{
  "success": true,
  "tracked": true
}
```

---

## Entity Schemas

### Sponsor
| Field | Type | Description |
|-------|------|-------------|
| brandName | string | Brand name |
| contactName | string | Contact person |
| contactEmail | string | Contact email |
| contactPhone | string | Contact phone |
| website | string | Brand website |
| logoUrl | string | Logo URL |
| brandColor | string | Brand hex color |
| positionNumber | integer | Position on MacBook (1-20) |
| positionLabel | string | Display label (e.g., "CROWN") |
| tier | enum | crown, founding, standard, community |
| amount | number | Sponsorship amount in INR |
| status | enum | applied, qualified, approved, active, declined, withdrawn |
| paymentStatus | enum | pending, paid, failed, refunded |
| trackingId | string | Unique tracking ID (SP-XXXX-N) |
| uniqueUrl | string | Unique URL with tracking param |
| qrScans | integer | QR code scan count |
| shareClicks | integer | Share link click count |
| socialMentions | integer | Social media mention count |
| isCrown | boolean | Crown tier flag |
| isFounding | boolean | Founding tier flag |
| contractSigned | boolean | Contract status |
| campaignId | string | Campaign identifier |
| founderMessage | string | Message from sponsor to founder |

### SponsorPosition
| Field | Type | Description |
|-------|------|-------------|
| positionName | string | Internal name |
| displayLabel | string | Display label |
| positionNumber | integer | Position number (1-20) |
| tier | enum | crown, founding, standard, community |
| price | number | Price in INR |
| isAvailable | boolean | Availability |
| description | string | Description |

### Nomination
| Field | Type | Description |
|-------|------|-------------|
| brandName | string | Nominated brand |
| brandWebsite | string | Brand website |
| nominatorName | string | Who nominated |
| nominatorEmail | string | Nominator email |
| reason | string | Nomination reason |
| votes | integer | Vote count |

### CampaignActivity
| Field | Type | Description |
|-------|------|-------------|
| activityType | enum | page_view, qr_scan, sponsor_click, share, nomination, application |
| source | string | Traffic source |
| referrer | string | Referrer URL |
| visitorId | string | Anonymous visitor ID |
| sponsorId | string | Associated sponsor (if any) |
| timestamp | string | ISO timestamp |
