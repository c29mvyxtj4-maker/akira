-- Create page_visits table for tracking recently visited pages
CREATE TABLE IF NOT EXISTS page_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_name VARCHAR NOT NULL,
  page_route VARCHAR NOT NULL,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  org_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_page_visits_user_id ON page_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits(visited_at DESC);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id VARCHAR NOT NULL,
  item_name VARCHAR NOT NULL,
  item_type VARCHAR NOT NULL, -- 'client', 'project', 'page', etc
  item_route VARCHAR,
  org_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, item_id, item_type)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_org_id ON favorites(org_id);

-- Enable RLS on page_visits
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own page visits
CREATE POLICY "Users can view own page visits"
  ON page_visits FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own page visits
CREATE POLICY "Users can insert own page visits"
  ON page_visits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS on favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can only manage their own favorites
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);
