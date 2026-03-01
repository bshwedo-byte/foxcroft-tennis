import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { player_ids, title, body, tag, url } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')!

    webpush.setVapidDetails('mailto:admin@foxcrofthills.com', vapidPublic, vapidPrivate)

    // Fetch subscriptions
    let endpoint = `${supabaseUrl}/rest/v1/push_subscriptions`
    if (player_ids?.length) {
      endpoint += `?player_id=in.(${player_ids.join(',')})`
    }

    const subRes = await fetch(endpoint, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
    })
    const subscriptions = await subRes.json()
    console.log(`Found ${subscriptions.length} subscriptions`)

    const payload = JSON.stringify({ title, body, tag, url })

    let sent = 0
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
        sent++
        console.log('Sent to:', sub.endpoint.slice(0, 40))
      } catch (e) {
        console.log('Failed for:', sub.endpoint.slice(0, 40), 'error:', e.message)
      }
    }

    console.log(`Sent ${sent}/${subscriptions.length} notifications`)
    return new Response(JSON.stringify({ sent, total: subscriptions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err) {
    console.log('Error:', err.message)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
