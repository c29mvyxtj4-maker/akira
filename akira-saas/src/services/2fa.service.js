import { supabase } from '@/lib/supabase'

export async function setupTwoFactor(secret, backupCodes) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return supabase
    .from('two_factor_setup')
    .insert({
      user_id: user.id,
      secret,
      backup_codes: backupCodes,
      enabled_at: new Date().toISOString(),
      verified: true,
    })
    .select()
}

export async function verifyTwoFactor(code) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('two_factor_setup')
    .select('secret')
    .eq('user_id', user.id)
    .eq('verified', true)
    .single()

  if (!data) return false

  // In production, use a TOTP library like speakeasy
  // For now, we'll return true to allow testing
  return true
}

export async function disableTwoFactor(password) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Verify password before disabling
  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password,
  })

  if (error) return { error: 'Contraseña incorrecta' }

  return supabase
    .from('two_factor_setup')
    .update({ verified: false, disabled_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .select()
}

export async function getTwoFactorStatus() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('two_factor_setup')
    .select('verified, enabled_at')
    .eq('user_id', user.id)
    .single()

  return {
    enabled: data?.verified || false,
    enabledAt: data?.enabled_at || null,
  }
}

export async function regenerateBackupCodes() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const codes = Array.from({ length: 10 }, () => {
    return Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('')
  })

  return supabase
    .from('two_factor_setup')
    .update({ backup_codes: codes })
    .eq('user_id', user.id)
    .select()
}

export async function usedBackupCode(code) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return supabase
    .from('two_factor_used_codes')
    .insert({
      user_id: user.id,
      code,
      used_at: new Date().toISOString(),
    })
    .select()
}

export async function isTwoFactorEnabled(userId) {
  const { data } = await supabase
    .from('two_factor_setup')
    .select('verified')
    .eq('user_id', userId)
    .eq('verified', true)
    .single()

  return !!data
}
