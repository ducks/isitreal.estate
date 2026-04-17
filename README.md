# Is It Real?

Crowd-sourced real estate listing reviews. Search any address, see what visitors actually found.

[isitreal.estate](https://isitreal.estate)

## What It Does

- Search any address and see reviews from people who actually visited
- Leave reviews with photos, ratings, and listing accuracy reports
- Vote on review accuracy to build community trust
- Link listings from Zillow, Redfin, Craigslist, etc. to addresses
- Map view of reviewed addresses

## Tech Stack

- **Frontend**: SvelteKit 5 (runes)
- **Database**: PostgreSQL
- **Auth**: Session-based with scrypt password hashing
- **Maps**: Leaflet + OpenStreetMap
- **Geocoding**: Nominatim (OSM)
- **Photos**: Sharp for processing, disk storage
- **Deployment**: NixOS, Caddy, systemd

## Development

```bash
# Start PostgreSQL
docker compose up -d

# Install dependencies
pnpm install

# Run dev server (runs migrations automatically)
pnpm dev
```

## Environment

Copy `.env.example` to `.env`:

```
DATABASE_URL=postgresql://curbside:curbside@localhost:5433/curbside
```

## Release

```bash
make release
```

Uses date-based versioning (YYYY.MM.DD.X). Tags trigger a GitHub Actions build that produces a release tarball.

## License

MIT
