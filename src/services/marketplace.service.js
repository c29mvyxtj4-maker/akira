/**
 * Marketplace Service (Phase 8)
 *
 * App discovery, ratings/reviews, marketplace management
 * Featured apps, trending apps, search, recommendations
 */

import { supabase } from '@/lib/supabase'

// ========================================
// MARKETPLACE APPS
// ========================================

/**
 * List all marketplace apps
 */
export async function getMarketplaceApps(filters = {}) {
  let query = supabase
    .from('marketplace_apps')
    .select(`
      id, name, description, icon_url, rating, review_count,
      publisher_id,
      publishers (name),
      categories (name)
    `)
    .eq('status', 'published')

  // Apply filters
  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`)
  }

  if (filters.sortBy === 'rating') {
    query = query.order('rating', { ascending: false })
  } else if (filters.sortBy === 'trending') {
    query = query.order('installs_last_30d', { ascending: false })
  } else if (filters.sortBy === 'newest') {
    query = query.order('published_at', { ascending: false })
  }

  const { data, error } = await query.limit(50)

  if (error) throw error
  return data
}

/**
 * Get app details
 */
export async function getAppDetails(appId) {
  const { data: app, error } = await supabase
    .from('marketplace_apps')
    .select(`
      *,
      publishers (id, name, website, support_email),
      reviews (id, rating, title, body, author_name, created_at),
      screenshots (url, alt_text)
    `)
    .eq('id', appId)
    .single()

  if (error) throw error

  // Calculate average rating
  const avgRating = app.reviews.length > 0
    ? (app.reviews.reduce((sum, r) => sum + r.rating, 0) / app.reviews.length).toFixed(1)
    : 0

  return {
    ...app,
    averageRating: avgRating,
    reviews: app.reviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
  }
}

/**
 * Get featured apps
 */
export async function getFeaturedApps() {
  const { data, error } = await supabase
    .from('marketplace_apps')
    .select('*')
    .eq('status', 'published')
    .eq('is_featured', true)
    .limit(8)

  if (error) throw error
  return data
}

/**
 * Get trending apps (most installs last 30 days)
 */
export async function getTrendingApps() {
  const { data, error } = await supabase
    .from('marketplace_apps')
    .select('*')
    .eq('status', 'published')
    .order('installs_last_30d', { ascending: false })
    .limit(10)

  if (error) throw error
  return data
}

// ========================================
// APP INSTALLATION & MANAGEMENT
// ========================================

/**
 * Install app for user
 */
export async function installApp(appId) {
  const { userId } = await supabase.auth.getUser()

  // Check if already installed
  const { data: existing } = await supabase
    .from('app_installations')
    .select('id')
    .eq('user_id', userId)
    .eq('app_id', appId)
    .limit(1)

  if (existing && existing.length > 0) {
    throw new Error('App already installed')
  }

  // Create installation
  const { data: installation, error } = await supabase
    .from('app_installations')
    .insert([{
      user_id: userId,
      app_id: appId,
      status: 'active',
      installed_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error

  // Record install metric
  await supabase.rpc('increment_app_installs', { app_id: appId })

  return installation
}

/**
 * Uninstall app
 */
export async function uninstallApp(appId) {
  const { userId } = await supabase.auth.getUser()

  const { error } = await supabase
    .from('app_installations')
    .update({ status: 'uninstalled', uninstalled_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('app_id', appId)

  if (error) throw error

  // Record uninstall metric
  await supabase.rpc('increment_app_uninstalls', { app_id: appId })
}

/**
 * Get user's installed apps
 */
export async function getUserInstalledApps() {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('app_installations')
    .select(`
      id, status, installed_at,
      marketplace_apps (id, name, icon_url, latest_version)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')

  if (error) throw error
  return data
}

// ========================================
// APP REVIEWS & RATINGS
// ========================================

/**
 * Leave app review
 */
export async function leaveAppReview(appId, rating, title, body) {
  const { userId, user } = await supabase.auth.getUser()

  // Check if already reviewed
  const { data: existing } = await supabase
    .from('app_reviews')
    .select('id')
    .eq('app_id', appId)
    .eq('user_id', userId)
    .limit(1)

  if (existing && existing.length > 0) {
    throw new Error('You already reviewed this app')
  }

  // Create review
  const { data: review, error } = await supabase
    .from('app_reviews')
    .insert([{
      app_id: appId,
      user_id: userId,
      rating,
      title,
      body,
      author_name: user?.email?.split('@')[0] || 'Anonymous',
      helpful_count: 0,
      unhelpful_count: 0,
      created_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error

  // Update app rating
  await updateAppRating(appId)

  return review
}

/**
 * Update app rating
 */
async function updateAppRating(appId) {
  const { data: reviews } = await supabase
    .from('app_reviews')
    .select('rating')
    .eq('app_id', appId)

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  await supabase
    .from('marketplace_apps')
    .update({
      rating: avgRating,
      review_count: reviews.length,
    })
    .eq('id', appId)
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(reviewId) {
  const { userId } = await supabase.auth.getUser()

  // Check if already voted
  const { data: existing } = await supabase
    .from('review_votes')
    .select('id')
    .eq('review_id', reviewId)
    .eq('user_id', userId)
    .limit(1)

  if (existing && existing.length > 0) {
    throw new Error('You already voted on this review')
  }

  // Record vote
  await supabase
    .from('review_votes')
    .insert([{
      review_id: reviewId,
      user_id: userId,
      is_helpful: true,
    }])

  // Update helpful count
  await supabase.rpc('increment_review_helpful', { review_id: reviewId })
}

// ========================================
// APP RECOMMENDATIONS
// ========================================

/**
 * Get recommended apps for user
 */
export async function getRecommendedApps() {
  const { userId } = await supabase.auth.getUser()

  // Get user's installed apps and categories
  const { data: installed } = await supabase
    .from('app_installations')
    .select('app_id')
    .eq('user_id', userId)
    .eq('status', 'active')

  const installedIds = installed.map(i => i.app_id)

  // Get related apps from same categories
  const { data: apps, error } = await supabase
    .from('marketplace_apps')
    .select('*')
    .eq('status', 'published')
    .not('id', 'in', `(${installedIds.join(',')})`)
    .order('rating', { ascending: false })
    .limit(12)

  if (error) throw error

  // Score and rank recommendations
  const recommendations = apps
    .map(app => ({
      ...app,
      recommendationScore: calculateRecommendationScore(app, installed),
    }))
    .sort((a, b) => b.recommendationScore - a.recommendationScore)

  return recommendations.slice(0, 6)
}

/**
 * Calculate recommendation score
 */
function calculateRecommendationScore(app, userInstalledApps) {
  let score = app.rating || 0

  // Boost score for trending apps
  if (app.installs_last_30d > 100) {
    score += 1
  }

  // Boost score for high review count
  if (app.review_count > 50) {
    score += 0.5
  }

  return score
}

// ========================================
// MARKETPLACE CATEGORIES
// ========================================

export const APP_CATEGORIES = {
  CRM: { id: 'crm', name: 'CRM', icon: 'users' },
  ACCOUNTING: { id: 'accounting', name: 'Accounting', icon: 'calculator' },
  COMMUNICATION: { id: 'communication', name: 'Communication', icon: 'mail' },
  PRODUCTIVITY: { id: 'productivity', name: 'Productivity', icon: 'zap' },
  ANALYTICS: { id: 'analytics', name: 'Analytics', icon: 'chart' },
  AUTOMATION: { id: 'automation', name: 'Automation', icon: 'repeat' },
  PAYMENT: { id: 'payment', name: 'Payments', icon: 'credit-card' },
  ECOMMERCE: { id: 'ecommerce', name: 'E-Commerce', icon: 'shopping-cart' },
}

/**
 * Get apps by category
 */
export async function getAppsByCategory(categoryId) {
  const { data, error } = await supabase
    .from('marketplace_apps')
    .select('*')
    .eq('status', 'published')
    .eq('category', categoryId)
    .order('rating', { ascending: false })

  if (error) throw error
  return data
}

// ========================================
// DEVELOPER METRICS
// ========================================

/**
 * Get app analytics for publisher
 */
export async function getAppAnalytics(appId) {
  const { data: app } = await supabase
    .from('marketplace_apps')
    .select('publisher_id')
    .eq('id', appId)
    .single()

  const { userId } = await supabase.auth.getUser()

  // Verify ownership
  if (app.publisher_id !== userId) {
    throw new Error('Unauthorized')
  }

  const { data: analytics, error } = await supabase
    .from('app_analytics')
    .select('*')
    .eq('app_id', appId)
    .order('date', { ascending: false })
    .limit(90) // Last 90 days

  if (error) throw error

  return {
    totalInstalls: analytics.reduce((sum, a) => sum + a.installations, 0),
    activeUsers: analytics[0]?.active_users || 0,
    avgRating: analytics[0]?.avg_rating || 0,
    uninstalls: analytics.reduce((sum, a) => sum + a.uninstalls, 0),
    daily: analytics.reverse(),
  }
}

/**
 * Get app reviews analytics
 */
export async function getAppReviewAnalytics(appId) {
  const { data: reviews, error } = await supabase
    .from('app_reviews')
    .select('rating')
    .eq('app_id', appId)

  if (error) throw error

  const distribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  }

  const average = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return {
    totalReviews: reviews.length,
    averageRating: average,
    distribution,
  }
}

// ========================================
// MARKETPLACE MODERATION
// ========================================

/**
 * Flag app or review for moderation
 */
export async function flagContent(contentType, contentId, reason) {
  const { userId } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('moderation_flags')
    .insert([{
      user_id: userId,
      content_type: contentType, // app, review
      content_id: contentId,
      reason,
      status: 'pending',
      flagged_at: new Date().toISOString(),
    }])

  if (error) throw error
  return data
}

/**
 * Get flagged content (admin)
 */
export async function getFlaggedContent() {
  const { data, error } = await supabase
    .from('moderation_flags')
    .select('*')
    .eq('status', 'pending')
    .order('flagged_at')

  if (error) throw error
  return data
}

/**
 * Resolve flag (admin)
 */
export async function resolveFlag(flagId, action) {
  // action: approve, reject, remove

  const { error } = await supabase
    .from('moderation_flags')
    .update({
      status: 'resolved',
      action,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', flagId)

  if (error) throw error
}
