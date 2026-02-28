import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const { playerIds, title, body, url } = await req.json()

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const { data: players } = await supabase
    .from('players')
    .select('id, push_subscription')
    .in('id', playerIds)
    .not('push_subscription', 'is', null)

  if (!players || players.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 })
  }

  const payload = JSON.stringify({ title, body, url: url || '/' })
  let sent = 0

  for (const player of players) {
    try {
      const sub = player.push_subscription
      const response = await fetch(sub.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `vapid t=${await generateVapidToken(sub.endpoint)},k=${VAPID_PUBLIC_KEY}`,
          'TTL': '86400',
        },
        body: payload,
      })
      if (response.ok) {
        sent++
        await supabase.from('push_logs').insert({ player_id: player.id, message: body })
      }
    } catch (e) {
      console.error('Push failed for player', player.id, e)
    }
  }

  return new Response(JSON.stringify({ sent }), { status: 200 })
})

async function generateVapidToken(endpoint: string) {
  // Simplified - in production use web-push library
  return 'placeholder'
}
