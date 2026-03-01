import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const url = Deno.env.get('SUPABASE_URL')!
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const headers = { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }

  try {
    const { player_id } = await req.json()
    if (!player_id) return new Response(JSON.stringify({ error: 'player_id required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

    // Delete related rows via REST API
    const tables = ['session_joins', 'availability_windows', 'designations', 'responses', 'team_members', 'players']
    for (const table of tables) {
      const col = table === 'players' ? 'id' : 'player_id'
      await fetch(`${url}/rest/v1/${table}?${col}=eq.${player_id}`, { method: 'DELETE', headers })
    }

    // Delete auth user
    const res = await fetch(`${url}/auth/v1/admin/users/${player_id}`, { method: 'DELETE', headers })
    console.log('Auth delete status:', res.status)

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.log('Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
