import { supabase } from './supabase'

// ── Auth ──────────────────────────────────────────
export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email, password, name) {
  return supabase.auth.signUp({
    email, password,
    options: { data: { name } }
  })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  return supabase.auth.getSession()
}

// ── Players ───────────────────────────────────────
export async function getPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('name')
  return { data, error }
}

export async function updatePlayer(id, updates) {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function insertPlayer(player) {
  const { data, error } = await supabase
    .from('players')
    .insert(player)
    .select()
    .single()
  return { data, error }
}

// ── Week Details ──────────────────────────────────
export async function getWeekDetails(teamId) {
  const { data, error } = await supabase
    .from('week_details')
    .select('*')
    .eq('team_id', teamId)
  return { data, error }
}

export async function upsertWeekDetail(detail) {
  const { data, error } = await supabase
    .from('week_details')
    .upsert(detail, { onConflict: 'team_id,week_start' })
    .select()
    .single()
  return { data, error }
}

// ── Responses ─────────────────────────────────────
export async function getResponses(teamId) {
  const { data, error } = await supabase
    .from('responses')
    .select('*')
    .eq('team_id', teamId)
  return { data, error }
}

export async function upsertResponse(teamId, playerId, weekStart, response) {
  if (!response) {
    return supabase.from('responses')
      .delete()
      .eq('team_id', teamId)
      .eq('player_id', playerId)
      .eq('week_start', weekStart)
  }
  const { data, error } = await supabase
    .from('responses')
    .upsert({ team_id: teamId, player_id: playerId, week_start: weekStart, response, responded_at: new Date().toISOString() },
      { onConflict: 'team_id,player_id,week_start' })
    .select().single()
  return { data, error }
}

// ── Designations ──────────────────────────────────
export async function getDesignations(teamId) {
  const { data, error } = await supabase
    .from('designations')
    .select('*')
    .eq('team_id', teamId)
  return { data, error }
}

export async function upsertDesignation(teamId, playerId, weekStart, designation) {
  if (!designation) {
    return supabase.from('designations')
      .delete()
      .eq('team_id', teamId)
      .eq('player_id', playerId)
      .eq('week_start', weekStart)
  }
  return supabase.from('designations')
    .upsert({ team_id: teamId, player_id: playerId, week_start: weekStart, designation },
      { onConflict: 'team_id,player_id,week_start' })
}

// ── Availability Windows ──────────────────────────
export async function getWindows() {
  const { data, error } = await supabase
    .from('availability_windows')
    .select('*, player:players(id,name,ntrp,email,phone)')
  return { data, error }
}

export async function upsertWindow(window) {
  const { data, error } = await supabase
    .from('availability_windows')
    .upsert(window)
    .select()
    .single()
  return { data, error }
}

export async function deleteWindow(id) {
  return supabase.from('availability_windows').delete().eq('id', id)
}

// ── Session Joins ─────────────────────────────────
export async function getJoins() {
  const { data, error } = await supabase
    .from('session_joins')
    .select('*, player:players(id,name), window:availability_windows(*)')
  return { data, error }
}

export async function joinSession(windowId, playerId, startTime, endTime) {
  return supabase.from('session_joins')
    .upsert({ window_id: windowId, player_id: playerId, join_start_time: startTime, join_end_time: endTime },
      { onConflict: 'window_id,player_id' })
}

export async function leaveSession(windowId, playerId) {
  return supabase.from('session_joins')
    .delete()
    .eq('window_id', windowId)
    .eq('player_id', playerId)
}
