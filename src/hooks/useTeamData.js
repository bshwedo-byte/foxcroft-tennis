import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

export function useTeamData(session) {
  const [players, setPlayers] = useState([])
  const [responses, setResponses] = useState([])
  const [designations, setDesignations] = useState([])
  const [weekDetails, setWeekDetails] = useState([])
  const [myWindows, setMyWindows] = useState([])
  const [allWindows, setAllWindows] = useState([])
  const [joins, setJoins] = useState([])
  const [teamId, setTeamId] = useState(null)
  const [loading, setLoading] = useState(true)

  const userId = session?.user?.id
  const teamIdRef = useRef(null)

  const fetchAll = useCallback(async (tid, uid) => {
    const [
      { data: p }, { data: r }, { data: d }, { data: wd }, { data: w }, { data: j }
    ] = await Promise.all([
      supabase.from('players').select('*').order('name'),
      supabase.from('responses').select('*').eq('team_id', tid),
      supabase.from('designations').select('*').eq('team_id', tid),
      supabase.from('week_details').select('*').eq('team_id', tid),
      supabase.from('availability_windows').select('*, player:players(id,name,ntrp,email,phone)'),
      supabase.from('session_joins').select('*, player:players(id,name,ntrp,email,phone)'),
    ])
    setPlayers(p || [])
    setResponses(r || [])
    setDesignations(d || [])
    setWeekDetails(wd || [])
    setMyWindows((w || []).filter(x => x.player_id === uid))
    setAllWindows((w || []).filter(x => x.player_id !== uid))
    setJoins(j || [])
  }, [])

  const loadAll = useCallback(async () => {
    if (!userId) return
    console.log('[load] starting loadAll for userId:', userId?.slice(-6))
    setLoading(true)

    let { data: membership, error: memErr } = await supabase
      .from('team_members').select('team_id').eq('player_id', userId).maybeSingle()
    console.log('[load] membership:', membership?.team_id?.slice(-6), 'err:', memErr?.message)

    let tid = membership?.team_id
    if (!tid) {
      console.log('[load] no membership, finding existing team...')
      const { data: existingTeam, error: teamErr } = await supabase.from('teams').select('id').order('created_at').limit(1).single()
      console.log('[load] existingTeam:', existingTeam?.id?.slice(-6), 'err:', teamErr?.message)
      if (existingTeam) {
        tid = existingTeam.id
        const { error: joinErr } = await supabase.from('team_members').upsert({ team_id: tid, player_id: userId }, { onConflict: 'team_id,player_id' })
        console.log('[load] joined team, err:', joinErr?.message)
      } else {
        const { data: team, error: createErr } = await supabase.from('teams').insert({ name: 'Foxcroft Hills' }).select().single()
        console.log('[load] created team:', team?.id?.slice(-6), 'err:', createErr?.message)
        tid = team?.id
        if (tid) await supabase.from('team_members').insert({ team_id: tid, player_id: userId })
      }
    }

    if (!tid) {
      console.error('[load] FATAL: no team id, cannot load')
      setLoading(false)
      return
    }

    setTeamId(tid)
    teamIdRef.current = tid
    console.log('[load] fetching all data for team:', tid?.slice(-6))

    await fetchAll(tid, userId)
    console.log('[load] done')
    setLoading(false)
  }, [userId, fetchAll])

  useEffect(() => {
    loadAll()

    // Simple approach: re-fetch the relevant table whenever anything changes
    // teamIdRef.current is always up to date since it's a ref
    const refresh = async (table) => {
      let tid = teamIdRef.current
      if (!tid) {
        // Fallback: re-query if ref not set yet
        const { data } = await supabase.from('team_members').select('team_id').eq('player_id', userId).maybeSingle()
        tid = data?.team_id
        if (tid) teamIdRef.current = tid
      }
      console.log(`[rt] refresh ${table}, tid=${tid}`)
      if (!tid) { console.warn('[rt] no teamId, skipping refresh'); return }
      if (table === 'responses') {
        supabase.from('responses').select('*').eq('team_id', tid)
          .then(({ data, error }) => {
            console.log('[rt] responses fetch:', data?.length, 'rows, error:', error?.message)
            if (data) setResponses([...data])
          })
      } else if (table === 'designations') {
        supabase.from('designations').select('*').eq('team_id', tid)
          .then(({ data }) => { if (data) setDesignations([...data]) })
      } else if (table === 'week_details') {
        supabase.from('week_details').select('*').eq('team_id', tid)
          .then(({ data }) => { if (data) setWeekDetails([...data]) })
      } else if (table === 'session_joins') {
        supabase.from('session_joins').select('*, player:players(id,name,ntrp,email,phone)')
          .then(({ data }) => { if (data) setJoins([...data]) })
      } else if (table === 'players') {
        supabase.from('players').select('*').order('name')
          .then(({ data }) => { if (data) setPlayers([...data]) })
      } else if (table === 'availability_windows') {
        supabase.from('availability_windows').select('*, player:players(id,name,ntrp,email,phone)')
          .then(({ data }) => {
            if (data) {
              setMyWindows([...data.filter(x => x.player_id === userId)])
              setAllWindows([...data.filter(x => x.player_id !== userId)])
            }
          })
      }
    }

    const subs = [
      'responses', 'designations', 'week_details',
      'session_joins', 'players', 'availability_windows'
    ].map(table =>
      supabase
        .channel(`realtime-${table}-${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
          console.log(`[rt] ${table} changed:`, payload.eventType)
          refresh(table)
        })
        .subscribe((status) => {
          console.log(`[rt] ${table} subscription: ${status}`)
        })
    )

    return () => { subs.forEach(s => supabase.removeChannel(s)) }
  }, [loadAll, userId])

  const deletePlayer = async (id) => {
    // Delete data rows client-side
    await supabase.from('session_joins').delete().eq('player_id', id)
    await supabase.from('availability_windows').delete().eq('player_id', id)
    await supabase.from('designations').delete().eq('player_id', id)
    await supabase.from('responses').delete().eq('player_id', id)
    await supabase.from('team_members').delete().eq('player_id', id)
    const { error } = await supabase.from('players').delete().eq('id', id)
    if (!error) setPlayers(prev => prev.filter(p => p.id !== id))
    // Edge function deletes the auth user using service role (key stays server-side)
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    const fnRes = await fetch(`${supabaseUrl}/functions/v1/delete-player`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${currentSession?.access_token || anonKey}`
      },
      body: JSON.stringify({ player_id: id })
    })
    console.log('[delete] edge fn status:', fnRes.status, await fnRes.text())
    return { error }
  }

  const updatePlayer = async (id, updates) => {
    const { data, error } = await supabase.from('players').update(updates).eq('id', id).select().maybeSingle()
    if (!error) setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...(data || updates) } : p))
    return { error }
  }

  const insertPlayer = async (playerForm) => {
    const { name, email, phone, ntrp, is_pro, is_admin } = playerForm
    const tid = teamIdRef.current

    // Use edge function which uses service role - avoids signing in as the new user
    const { data, error } = await supabase.functions.invoke('create-player', {
      body: { name, email, phone, ntrp, is_pro, is_admin, team_id: tid }
    })

    if (!error && data?.player) {
      setPlayers(prev => [...prev.filter(p => p.id !== data.player.id), data.player]
        .sort((a, b) => a.name.localeCompare(b.name)))
      return { error: null }
    }

    // Edge function not available - add as pending player without auth account
    // They can sign up via the login screen and will auto-join the team
    const tempId = crypto.randomUUID()
    const { data: inserted, error: insertError } = await supabase
      .from('players')
      .insert({ id: tempId, name, email, phone: phone || null, ntrp: ntrp || '3.5', is_pro: !!is_pro, is_admin: !!is_admin })
      .select().maybeSingle()

    if (insertError) return { error: insertError }

    if (inserted && tid) {
      await supabase.from('team_members')
        .upsert({ team_id: tid, player_id: tempId }, { onConflict: 'team_id,player_id' })
      setPlayers(prev => [...prev.filter(p => p.id !== inserted.id), inserted]
        .sort((a, b) => a.name.localeCompare(b.name)))
    }

    return { error: null }
  }

  const upsertResponse = async (weekStart, response) => {
    if (!response) {
      await supabase.from('responses').delete()
        .eq('team_id', teamId).eq('player_id', userId).eq('week_start', weekStart)
      setResponses(prev => prev.filter(r => !(r.player_id === userId && r.week_start === weekStart)))
    } else {
      const row = { team_id: teamId, player_id: userId, week_start: weekStart, response, responded_at: new Date().toISOString() }
      const { data } = await supabase.from('responses')
        .upsert(row, { onConflict: 'team_id,player_id,week_start' }).select().single()
      setResponses(prev => [...prev.filter(r => !(r.player_id === userId && r.week_start === weekStart)), data || row])
    }
  }

  const upsertDesignation = async (playerId, weekStart, designation) => {
    await supabase.from('designations').delete()
      .eq('team_id', teamId).eq('player_id', playerId).eq('week_start', weekStart)
    setDesignations(prev => prev.filter(d => !(d.player_id === playerId && d.week_start === weekStart)))
    if (designation) {
      const row = { team_id: teamId, player_id: playerId, week_start: weekStart, designation }
      await supabase.from('designations').insert(row)
      setDesignations(prev => [...prev, row])
    }
  }

  const upsertWeekDetail = async (weekStart, detail) => {
    const row = { team_id: teamId, week_start: weekStart, ...detail }
    const { data } = await supabase.from('week_details')
      .upsert(row, { onConflict: 'team_id,week_start' }).select().single()
    setWeekDetails(prev => [...prev.filter(d => d.week_start !== weekStart), data || row])
  }

  const saveWindow = async (windowData) => {
    const isNew = !windowData.id || String(windowData.id).startsWith('my-')
    const { id: _id, player: _p, created_at: _ca, ...dbRow } = windowData
    if (isNew) {
      const { data, error } = await supabase.from('availability_windows')
        .insert({ ...dbRow, player_id: userId })
        .select('*, player:players(id,name,ntrp,email,phone)').single()
      if (error) console.error('saveWindow error:', error)
      if (data) setMyWindows(prev => [...prev, data])
    } else {
      const { data, error } = await supabase.from('availability_windows')
        .update(dbRow).eq('id', windowData.id)
        .select('*, player:players(id,name,ntrp,email,phone)').single()
      if (error) console.error('saveWindow error:', error)
      if (data) setMyWindows(prev => prev.map(w => w.id === windowData.id ? data : w))
    }
  }

  const deleteWindow = async (id) => {
    await supabase.from('availability_windows').delete().eq('id', id)
    setMyWindows(prev => prev.filter(w => w.id !== id))
  }

  const joinSession = async (windowId, startTime, endTime) => {
    const row = { window_id: windowId, player_id: userId, join_start_time: startTime, join_end_time: endTime }
    const { data } = await supabase.from('session_joins')
      .upsert(row, { onConflict: 'window_id,player_id' })
      .select('*, player:players(id,name,ntrp,email,phone)').single()
    setJoins(prev => [...prev.filter(j => !(j.window_id === windowId && j.player_id === userId)), data || row])
  }

  const leaveSession = async (windowId) => {
    await supabase.from('session_joins').delete().eq('window_id', windowId).eq('player_id', userId)
    setJoins(prev => prev.filter(j => !(j.window_id === windowId && j.player_id === userId)))
  }

  // ── Push notifications ──────────────────────────────────────────────────
  const VAPID_PUBLIC_KEY = 'GbofNdkc2R6XPltQP5lfeZomSxP2l0yqcelMYMxTLgDq1IGwR0cnDTN_0lO-qH7qa4tGKE4BPeZX6AFXCJPtLw'

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
  }

  // Called on load - just registers SW silently, no permission prompt
  const registerPush = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null
      await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready
      // If already subscribed, re-save in case it changed
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing && Notification.permission === 'granted') {
        await savePushSubscription(existing)
      }
    } catch (e) {
      console.log('[push] SW register error:', e.message)
    }
  }

  // Called from a button click - requests permission then subscribes
  const enablePush = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Push notifications are not supported in this browser.')
        return false
      }
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Please allow notifications in your browser settings to enable push notifications.')
        return false
      }
      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing) {
        await savePushSubscription(existing)
        return true
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })
      await savePushSubscription(sub)
      console.log('[push] subscribed successfully')
      return true
    } catch (e) {
      console.log('[push] enablePush error:', e.message)
      return false
    }
  }

  const savePushSubscription = async (sub) => {
    const json = sub.toJSON()
    await supabase.from('push_subscriptions').upsert({
      player_id: userId,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth
    }, { onConflict: 'player_id,endpoint' })
  }

  const sendPush = async ({ playerIds, title, body, tag, url }) => {
    await supabase.functions.invoke('send-push', {
      body: { player_ids: playerIds, title, body, tag, url }
    })
  }

  return {
    players, responses, designations, weekDetails,
    myWindows, allWindows, joins,
    teamId, loading, userId,
    updatePlayer, insertPlayer, deletePlayer,
    registerPush, enablePush, sendPush,
    upsertResponse, upsertDesignation, upsertWeekDetail,
    saveWindow, deleteWindow, joinSession, leaveSession,
    reload: loadAll,
  }
}
