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

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify the caller is an admin
    const authHeader = req.headers.get('Authorization')
    const { data: { user }, error: authErr } = await adminClient.auth.getUser(authHeader?.replace('Bearer ', '') || '')
    if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    const { data: caller } = await adminClient.from('players').select('is_admin').eq('id', user.id).single()
    if (!caller?.is_admin) return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

    // Delete all related data first
    await adminClient.from('session_joins').delete().eq('player_id', player_id)
    await adminClient.from('availability_windows').delete().eq('player_id', player_id)
    await adminClient.from('designations').delete().eq('player_id', player_id)
    await adminClient.from('responses').delete().eq('player_id', player_id)
    await adminClient.from('team_members').delete().eq('player_id', player_id)
    await adminClient.from('players').delete().eq('id', player_id)

    // Delete auth user
    const { error: deleteErr } = await adminClient.auth.admin.deleteUser(player_id)
    if (deleteErr) {
      // Player row already deleted, auth user may not exist (e.g. pending player) - that's ok
      console.log('Auth delete note:', deleteErr.message)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
