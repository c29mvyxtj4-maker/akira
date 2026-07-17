import { supabase } from "@/lib/supabase"

async function uid() {
  const res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error("Not authenticated")
  return res.data.user.id
}

// Get list of available integrations
export async function getAvailableIntegrations() {
  try {
    const { data, error } = await supabase
      .from("marketplace_integrations")
      .select("*")
      .eq("published", true)
      .order("name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching integrations:", error)
    return []
  }
}

// Get user"s connected integrations
export async function getUserIntegrations() {
  try {
    const userId = await uid()
    const { data, error } = await supabase
      .from("user_integrations")
      .select("*, marketplace_integrations(*)")
      .eq("user_id", userId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching user integrations:", error)
    return []
  }
}

// Connect an integration
export async function connectIntegration(integrationId, config) {
  try {
    const userId = await uid()
    const { data, error } = await supabase
      .from("user_integrations")
      .insert({
        user_id: userId,
        integration_id: integrationId,
        config: config,
        status: "connected",
      })
      .select()

    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error("Error connecting integration:", error)
    return null
  }
}

// Disconnect an integration
export async function disconnectIntegration(integrationId) {
  try {
    const userId = await uid()
    const { error } = await supabase
      .from("user_integrations")
      .delete()
      .eq("user_id", userId)
      .eq("integration_id", integrationId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error disconnecting integration:", error)
    return false
  }
}

// Get marketplace apps
export async function getMarketplaceApps(filters = {}) {
  try {
    let query = supabase.from("marketplace_apps").select("*").eq("published", true)

    if (filters.category) query = query.eq("category", filters.category)
    if (filters.search) query = query.ilike("name", `%\${filters.search}%`)

    const { data, error } = await query.order("downloads", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching marketplace apps:", error)
    return []
  }
}

// Install an app
export async function installApp(appId) {
  try {
    const userId = await uid()
    const { data, error } = await supabase
      .from("user_apps")
      .insert({
        user_id: userId,
        app_id: appId,
        status: "installed",
        installed_at: new Date(),
      })
      .select()

    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error("Error installing app:", error)
    return null
  }
}

// Get app reviews
export async function getAppReviews(appId) {
  try {
    const { data, error } = await supabase
      .from("app_reviews")
      .select("*")
      .eq("app_id", appId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return []
  }
}

// Post a review
export async function postAppReview(appId, rating, text) {
  try {
    const userId = await uid()
    const { data, error } = await supabase
      .from("app_reviews")
      .insert({
        app_id: appId,
        user_id: userId,
        rating,
        text,
        created_at: new Date(),
      })
      .select()

    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error("Error posting review:", error)
    return null
  }
}
