-- Favorites Table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  item_type TEXT NOT NULL CHECK (item_type IN ('client', 'project', 'invoice', 'quote', 'document', 'event', 'task')),
  item_id UUID NOT NULL,
  item_name TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_favorites_org_id ON favorites(org_id);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_org_user ON favorites(org_id, user_id);
CREATE INDEX idx_favorites_item_type ON favorites(item_type);
CREATE UNIQUE INDEX idx_favorites_unique_per_user ON favorites(org_id, user_id, item_type, item_id);

-- RLS Policies
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can only view their own favorites
CREATE POLICY "users_can_view_own_favorites"
  ON favorites
  FOR SELECT
  USING (
    user_id = auth.uid() AND
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can create favorites for their organization
CREATE POLICY "users_can_create_favorites"
  ON favorites
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can delete their own favorites
CREATE POLICY "users_can_delete_own_favorites"
  ON favorites
  FOR DELETE
  USING (
    user_id = auth.uid() AND
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Users can update their own favorites
CREATE POLICY "users_can_update_own_favorites"
  ON favorites
  FOR UPDATE
  USING (
    user_id = auth.uid() AND
    org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  );
