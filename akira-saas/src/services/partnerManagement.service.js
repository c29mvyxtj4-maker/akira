import { supabase } from "@/lib/supabase"

async function uid() {
  const res = await supabase.auth.getUser()
  if (!res.data || !res.data.user) throw new Error("Not authenticated")
  return res.data.user.id
}

// Get partner profile
export async function getPartnerProfile() {
  try {
    const userId = await uid()
    const { data, error } = await supabase
      .from("partners")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error) throw error
    return data || null
  } catch (error) {
    console.error("Error fetching partner profile:", error)
    return null
  }
}

// Get partner apps
export async function getPartnerApps() {
  try {
    const userId = await uid()
    const { data, error } = await supabase
      .from("marketplace_apps")
      .select("*")
      .eq("publisher_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching partner apps:", error)
    return []
  }
}

// Get partner revenue
export async function getPartnerRevenue() {
  try {
    const userId = await uid()
    const { data, error } = await supabase
      .from("partner_revenue")
      .select("*")
      .eq("partner_id", userId)
      .order("month", { ascending: false })
      .limit(12)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching revenue:", error)
    return []
  }
}

// Get payouts
export async function getPartnerPayouts() {
  try {
    const userId = await uid()
    const { data, error } = await supabase
      .from("partner_payouts")
      .select("*")
      .eq("partner_id", userId)
      .order("payout_date", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching payouts:", error)
    return []
  }
}

// Create a payout
export async function createPayout(amount, method) {
  try {
    const userId = await uid()
    const { data, error } = await supabase
      .from("partner_payouts")
      .insert({
        partner_id: userId,
        amount,
        method,
        status: "requested",
        requested_at: new Date(),
      })
      .select()

    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error("Error creating payout:", error)
    return null
  }
}

// Submit app for review
export async function submitAppForReview(appData) {
  try {
    const userId = await uid()
    const { data, error } = await supabase
      .from("marketplace_apps")
      .insert({
        publisher_id: userId,
        ...appData,
        status: "pending_review",
        submitted_at: new Date(),
      })
      .select()

    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error("Error submitting app:", error)
    return null
  }
}

// Update app
export async function updatePartnerApp(appId, updates) {
  try {
    const { data, error } = await supabase
      .from("marketplace_apps")
      .update(updates)
      .eq("id", appId)
      .select()

    if (error) throw error
    return data?.[0] || null
  } catch (error) {
    console.error("Error updating app:", error)
    return null
  }
}
