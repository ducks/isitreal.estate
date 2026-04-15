# Curbside

Crowd-sourced real estate listing reviews. Like Waze, but for house hunting.

## Problem

Real estate listings are frequently fabricated — fake photos, misleading descriptions, phantom listings kept up to harvest leads. Renters and buyers waste time visiting properties that don't match what was advertised. There's no crowd-sourced layer of truth.

## Solution

A site where people leave reviews for addresses they've actually visited. Search an address before you visit, see if anyone's flagged it. After you visit, report what you actually found. Over time, bad actors accumulate history tied to their addresses.

## Core Flow

1. Search for an address
2. See reviews from people who've visited
3. Leave a review with photos and a rating
4. Vote "accurate" / "not accurate" on other reviews

## Data Model

### Addresses
The anchor entity. A listing comes and goes, but the address persists.

```
addresses
  id UUID
  street TEXT
  city TEXT
  state TEXT
  zip TEXT
  country TEXT DEFAULT 'US'
  lat FLOAT
  lng FLOAT
  created_at TIMESTAMP
```

Normalized and geocoded on creation. Deduped by normalized address string.

### Users

```
users
  id UUID
  username TEXT UNIQUE
  email TEXT UNIQUE
  password_hash TEXT
  created_at TIMESTAMP
```

Session-based auth, same as BeanLedger.

### Reviews

```
reviews
  id UUID
  address_id UUID FK
  user_id UUID FK
  listing_accurate BOOLEAN (photos matched reality?)
  rating INTEGER (1-5, overall condition)
  body TEXT (free text)
  visited_at DATE (when they visited)
  created_at TIMESTAMP
```

### Review Photos

```
review_photos
  id UUID
  review_id UUID FK
  filename TEXT
  path TEXT
  created_at TIMESTAMP
```

Stored on disk or S3-compatible. Served via static path or CDN.

### Votes

```
votes
  id UUID
  review_id UUID FK
  user_id UUID FK
  vote 'accurate' | 'not_accurate'
  created_at TIMESTAMP
  UNIQUE (review_id, user_id)
```

One vote per user per review. Can change vote.

## Pages

### Home
- Search bar (address autocomplete via geocoder)
- Map showing reviewed addresses nearby
- Recent reviews feed

### Address Page (/address/:id)
- Address details + map pin
- Photo gallery (user-uploaded)
- Reviews sorted by recency, weighted by votes
- "Leave a Review" button (requires login)
- Stats: total reviews, % listing accurate, avg rating

### Review Form
- Listing accurate? (yes/partially/no)
- Overall rating (1-5)
- Text review
- Photo upload (multiple)
- Date visited

### User Profile (/user/:username)
- Reviews they've left
- Credibility score (based on vote accuracy over time)
- Member since

### Auth
- Sign up (username, email, password)
- Log in
- Log out

## Tech Stack

- **Framework**: SvelteKit 5 (runes)
- **Database**: PostgreSQL
- **Auth**: Session-based with scrypt hashing
- **Maps**: Leaflet + OpenStreetMap tiles
- **Geocoding**: Nominatim (OSM, free) for address lookup/autocomplete
- **Photos**: Disk storage initially, S3 later if needed
- **Deployment**: NixOS on pond, Caddy reverse proxy, systemd

## Implementation Phases

### Phase 1: Foundation
- [ ] SvelteKit project scaffold
- [ ] PostgreSQL schema + migrations
- [ ] Auth (signup, login, logout, sessions)
- [ ] Address search with geocoding
- [ ] Address detail page

### Phase 2: Reviews
- [ ] Review form with photo upload
- [ ] Review display on address page
- [ ] Vote accurate / not accurate
- [ ] User profile page

### Phase 3: Discovery
- [ ] Map view (Leaflet + OSM) showing reviewed addresses
- [ ] Recent reviews feed on home page
- [ ] Address autocomplete in search

### Phase 4: Trust & Moderation
- [ ] Review sorting by vote weight
- [ ] User credibility score
- [ ] Report review functionality
- [ ] Admin moderation tools

### Phase 5: Polish
- [ ] Photo gallery with lightbox
- [ ] Responsive / mobile design
- [ ] SEO (address pages should be indexable)
- [ ] Share links for reviews
- [ ] Dark mode (CSS vars from day one)

## Open Questions

- Allow anonymous browsing? (yes, reading should be open)
- Rate limiting on review creation?
- Should addresses auto-create on first review, or require separate creation?
- Photo size limits / compression?
- How to handle address normalization edge cases (unit numbers, suites)?
