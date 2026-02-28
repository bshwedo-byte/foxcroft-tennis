import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { name, email, phone, ntrp, is_pro, is_admin } = await req.json()

    // Use service role to create user
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Create auth user with default password "tennis"
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password: 'tennis',
      email_confirm: true,
      user_metadata: { name },
    })

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const playerId = authData.user.id

    // Update the player row created by the trigger
    const { data: player, error: updateError } = await adminClient
      .from('players')
      .update({ name, phone: phone || null, ntrp: ntrp || '3.5', is_pro: !!is_pro, is_admin: !!is_admin })
      .eq('id', playerId)
      .select().single()

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Add to team
    const { data: membership } = await adminClient
      .from('team_members')
      .select('team_id')
      .limit(1)
      .single()

    if (membership?.team_id) {
      await adminClient.from('team_members').insert({
        team_id: membership.team_id,
        player_id: playerId
      }).onConflict('team_id,player_id')
    }

    return new Response(JSON.stringify({ player }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
