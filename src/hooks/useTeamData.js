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
      supabase.from('session_joins').select('*'),
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

  useEffect(() => { loadAll() }, [loadAll])

  const updatePlayer = async (id, updates) => {
    const { data, error } = await supabase.from('players').update(updates).eq('id', id).select().single()
    if (!error) setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...data } : p))
    return { error }
  }

  const insertPlayer = async (player) => {
    const { data, error } = await supabase.from('players').insert(player).select().single()
    if (!error) setPlayers(prev => [...prev, data])
    return { error }
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
    // Strip client-only fields and ensure snake_case for DB
    const { id: _id, player: _p, created_at: _ca, ...dbRow } = windowData
    if (isNew) {
      const { data, error } = await supabase.from('availability_windows')
        .insert({ ...dbRow, player_id: userId }).select('*, player:players(id,name,ntrp,email,phone)').single()
      if (error) console.error('saveWindow error:', error)
      if (data) setMyWindows(prev => [...prev, data])
    } else {
      const { data, error } = await supabase.from('availability_windows')
        .update(dbRow).eq('id', windowData.id).select('*, player:players(id,name,ntrp,email,phone)').single()
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
    await supabase.from('session_joins').upsert(row, { onConflict: 'window_id,player_id' })
    setJoins(prev => [...prev.filter(j => !(j.window_id === windowId && j.player_id === userId)), row])
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
