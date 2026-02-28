import { useState, useEffect, useCallback } from 'react'
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

  const loadAll = useCallback(async () => {
    if (!userId) return
    setLoading(true)

    let { data: membership } = await supabase
      .from('team_members').select('team_id').eq('player_id', userId).maybeSingle()

    let tid = membership?.team_id
    if (!tid) {
      const { data: team } = await supabase.from('teams').insert({ name: 'Foxcroft Hills' }).select().single()
      tid = team.id
      await supabase.from('team_members').insert({ team_id: tid, player_id: userId })
    }
    setTeamId(tid)

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
    setMyWindows((w || []).filter(x => x.player_id === userId))
    setAllWindows((w || []).filter(x => x.player_id !== userId))
    setJoins(j || [])
    setLoading(false)
  }, [userId])

  // Initial load + real-time subscriptions
  useEffect(() => {
    loadAll()

    // For responses, designations, and week_details we do a targeted re-fetch
    // rather than piecing together partial payloads, to avoid team_id filtering issues
    const refreshResponses = async (tid) => {
      const { data } = await supabase.from('responses').select('*').eq('team_id', tid)
      if (data) setResponses(data)
    }
    const refreshDesignations = async (tid) => {
      const { data } = await supabase.from('designations').select('*').eq('team_id', tid)
      if (data) setDesignations(data)
    }
    const refreshWeekDetails = async (tid) => {
      const { data } = await supabase.from('week_details').select('*').eq('team_id', tid)
      if (data) setWeekDetails(data)
    }

    // Use a ref-like approach: read teamId from state via closure won't work,
    // so we store it in a local var updated by the channel
    let currentTeamId = null
    supabase.from('team_members').select('team_id').eq('player_id', userId).maybeSingle()
      .then(({ data }) => { currentTeamId = data?.team_id })

    const responsesSub = supabase
      .channel('responses-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'responses' }, () => {
        if (currentTeamId) refreshResponses(currentTeamId)
      })
      .subscribe()

    const designationsSub = supabase
      .channel('designations-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'designations' }, () => {
        if (currentTeamId) refreshDesignations(currentTeamId)
      })
      .subscribe()

    const weekDetailsSub = supabase
      .channel('week-details-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'week_details' }, () => {
        if (currentTeamId) refreshWeekDetails(currentTeamId)
      })
      .subscribe()

    const joinsSub = supabase
      .channel('joins-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_joins' }, async payload => {
        if (payload.eventType === 'INSERT') {
          const { data } = await supabase.from('session_joins')
            .select('*, player:players(id,name,ntrp,email,phone)')
            .eq('id', payload.new.id).single()
          if (data) setJoins(prev => [...prev.filter(j => j.id !== data.id), data])
        } else if (payload.eventType === 'DELETE') {
          setJoins(prev => prev.filter(j => j.id !== payload.old.id))
        }
      })
      .subscribe()

    const playersSub = supabase
      .channel('players-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, payload => {
        if (payload.eventType === 'INSERT') {
          setPlayers(prev => [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name)))
        } else if (payload.eventType === 'UPDATE') {
          setPlayers(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(responsesSub)
      supabase.removeChannel(designationsSub)
      supabase.removeChannel(weekDetailsSub)
      supabase.removeChannel(joinsSub)
      supabase.removeChannel(playersSub)
    }
  }, [loadAll, userId])

  const updatePlayer = async (id, updates) => {
    const { data, error } = await supabase.from('players').update(updates).eq('id', id).select().single()
    if (!error) setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
    return { error }
  }

  // Create auth user + player row via edge function (uses service role key)
  const insertPlayer = async (playerForm) => {
    const { data, error } = await supabase.functions.invoke('create-player', {
      body: playerForm
    })
    if (error) return { error }
    if (data?.error) return { error: { message: data.error } }
    if (data?.player) {
      setPlayers(prev => [...prev.filter(p => p.id !== data.player.id), data.player]
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

  return {
    players, responses, designations, weekDetails,
    myWindows, allWindows, joins,
    teamId, loading, userId,
    updatePlayer, insertPlayer,
    upsertResponse, upsertDesignation, upsertWeekDetail,
    saveWindow, deleteWindow, joinSession, leaveSession,
    reload: loadAll,
  }
}
