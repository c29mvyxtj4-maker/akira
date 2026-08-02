-- AKIRA: New RLS Policies using org_id for multi-tenant security
-- Timeline: Semana 3-5
-- Strategy: Only users in the same org can view/edit data

-- ============================================================================
-- INVOICES POLICIES
-- ============================================================================
CREATE POLICY "invoices_select_org_members"
  ON invoices FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = invoices.org_id
    )
  );

CREATE POLICY "invoices_insert_org_members"
  ON invoices FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = invoices.org_id
    )
  );

CREATE POLICY "invoices_update_org_members"
  ON invoices FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = invoices.org_id
    )
  );

CREATE POLICY "invoices_delete_org_members"
  ON invoices FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = invoices.org_id
    )
  );

-- ============================================================================
-- CLIENTS POLICIES
-- ============================================================================
CREATE POLICY "clients_select_org_members"
  ON clients FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = clients.org_id
    )
  );

CREATE POLICY "clients_insert_org_members"
  ON clients FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = clients.org_id
    )
  );

CREATE POLICY "clients_update_org_members"
  ON clients FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = clients.org_id
    )
  );

CREATE POLICY "clients_delete_org_members"
  ON clients FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = clients.org_id
    )
  );

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================
CREATE POLICY "projects_select_org_members"
  ON projects FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = projects.org_id
    )
  );

CREATE POLICY "projects_insert_org_members"
  ON projects FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = projects.org_id
    )
  );

CREATE POLICY "projects_update_org_members"
  ON projects FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = projects.org_id
    )
  );

CREATE POLICY "projects_delete_org_members"
  ON projects FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = projects.org_id
    )
  );

-- ============================================================================
-- PORTAL_USERS POLICIES
-- ============================================================================
CREATE POLICY "portal_users_select_org_members"
  ON portal_users FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = portal_users.org_id
    )
  );

CREATE POLICY "portal_users_insert_org_members"
  ON portal_users FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = portal_users.org_id
    )
  );

CREATE POLICY "portal_users_update_org_members"
  ON portal_users FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = portal_users.org_id
    )
  );

CREATE POLICY "portal_users_delete_org_members"
  ON portal_users FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = portal_users.org_id
    )
  );

-- ============================================================================
-- PORTAL_MESSAGES POLICIES
-- ============================================================================
CREATE POLICY "portal_messages_select_org_members"
  ON portal_messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = portal_messages.org_id
    )
  );

CREATE POLICY "portal_messages_insert_org_members"
  ON portal_messages FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = portal_messages.org_id
    )
  );

CREATE POLICY "portal_messages_update_org_members"
  ON portal_messages FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = portal_messages.org_id
    )
  );

CREATE POLICY "portal_messages_delete_org_members"
  ON portal_messages FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = portal_messages.org_id
    )
  );

-- ============================================================================
-- COMPANY_SETTINGS POLICIES
-- ============================================================================
CREATE POLICY "company_settings_select_org_members"
  ON company_settings FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = company_settings.org_id_explicit
    )
  );

CREATE POLICY "company_settings_update_org_members"
  ON company_settings FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM org_members WHERE org_id = company_settings.org_id_explicit
    )
  );

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- All policies now require membership in the org to access data
-- This prevents users in Org A from seeing Org B's data
-- Next step: Update service layer to use scopeToOrg() for all queries
