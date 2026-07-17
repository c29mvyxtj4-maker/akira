import { supabase } from "@/lib/supabase"

async function uid() {
  const res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error("Not authenticated")
  return res.data.user.id
}

// Get featured apps
export async function getFeaturedApps() {
  try {
    const { data, error } = await supabase
      .from("marketplace_apps")
      .select("*")
      .eq("featured", true)
      .eq("published", true)
      .limit(6)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching featured apps:", error)
    return []
  }
}

// Search marketplace
export async function searchMarketplace(query, filters = {}) {
  try {
    let search = supabase
      .from("marketplace_apps")
      .select("*")
      .eq("published", true)

    if (query) {
      search = search.or(
        `name.ilike.%\${query}%,description.ilike.%\${query}%`
      )
    }

    if (filters.category) {
      search = search.eq("category", filters.category)
    }

    if (filters.minRating) {
      search = search.gte("rating", filters.minRating)
    }

    const { data, error } = await search
      .order("downloads", { ascending: false })
      .limit(50)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error searching marketplace:", error)
    return []
  }
}

// Get app details
export async function getAppDetails(appId) {
  try {
    const { data, error } = await supabase
      .from("marketplace_apps")
      .select("*, app_reviews(*)")
      .eq("id", appId)
      .single()

    if (error) throw error
    return data || null
  } catch (error) {
    console.error("Error fetching app details:", error)
    return null
  }
}

// Get app categories
export async function getAppCategories() {
  try {
    const { data, error } = await supabase
      .from("marketplace_categories")
      .select("*")
      .order("name")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

// Get trending apps
export async function getTrendingApps() {
  try {
    const { data, error } = await supabase
      .from("marketplace_apps")
      .select("*")
      .eq("published", true)
      .order("downloads", { ascending: false })
      .limit(10)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching trending apps:", error)
    return []
  }
}

// Get user"s installed apps
export async function getUserInstalledApps() {
  try {
    const userId = await uid()
    const { data, error } = await supabase
      .from("user_apps")
      .select("*, marketplace_apps(*)")
      .eq("user_id", userId)
      .eq("status", "installed")

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching installed apps:", error)
    return []
  }
}

// Uninstall an app
export async function uninstallApp(appId) {
  try {
    const userId = await uid()
    const { error } = await supabase
      .from("user_apps")
      .update({ status: "uninstalled" })
      .eq("user_id", userId)
      .eq("app_id", appId)

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error uninstalling app:", error)
    return false
  }
}

// Rate an app
export async function rateApp(appId, rating) {
  try {
    const userId = await uid()
    const { error } = await supabase
      .from("app_ratings")
      .upsert({
        user_id: userId,
        app_id: appId,
        rating,
        updated_at: new Date(),
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error("Error rating app:", error)
    return false
  }
}
