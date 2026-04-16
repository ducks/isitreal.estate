CREATE TABLE address_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'other',
  price TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listings_address ON address_listings(address_id);
CREATE INDEX idx_listings_user ON address_listings(user_id);
