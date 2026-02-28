import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { player_id } = await req.json()
    if (!player_id) return new Response(JSON.stringify({ error: 'player_id required' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Delete related data then player row
    await admin.from('session_joins').delete().eq('player_id', player_id)
    await admin.from('availability_windows').delete().eq('player_id', player_id)
    await admin.from('designations').delete().eq('player_id', player_id)
    await admin.from('responses').delete().eq('player_id', player_id)
    await admin.from('team_members').delete().eq('player_id', player_id)
    await admin.from('players').delete().eq('id', player_id)

    // Delete auth user
    const { error: deleteErr } = await admin.auth.admin.deleteUser(player_id)
    if (deleteErr) console.log('Auth delete note:', deleteErr.message)

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
