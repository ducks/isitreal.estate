-- Reports for flagging inappropriate reviews
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (review_id, user_id)
);

CREATE INDEX idx_reports_review ON reports(review_id);

-- Admin flag on users
ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
