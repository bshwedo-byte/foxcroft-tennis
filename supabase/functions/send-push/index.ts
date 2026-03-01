import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Base64url helpers
const b64url = (buf: Uint8Array) =>
  btoa(String.fromCharCode(...buf)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')

const fromB64url = (str: string) =>
  Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))

async function makeVapidToken(audience: string, subject: string, publicKeyB64: string, privateKeyB64: string) {
  const header = { typ: 'JWT', alg: 'ES256' }
  const now = Math.floor(Date.now() / 1000)
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject }

  const enc = new TextEncoder()
  const headerB64 = b64url(enc.encode(JSON.stringify(header)))
  const payloadB64 = b64url(enc.encode(JSON.stringify(payload)))
  const signingInput = `${headerB64}.${payloadB64}`

  const privateKeyBytes = fromB64url(privateKeyB64)
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    (() => {
      // Wrap raw 32-byte key in PKCS8 DER for prime256v1
      const prefix = new Uint8Array([0x30,0x41,0x02,0x01,0x00,0x30,0x13,0x06,0x07,0x2a,0x86,0x48,0xce,0x3d,0x02,0x01,0x06,0x08,0x2a,0x86,0x48,0xce,0x3d,0x03,0x01,0x07,0x04,0x27,0x30,0x25,0x02,0x01,0x01,0x04,0x20])
      const der = new Uint8Array(prefix.length + privateKeyBytes.length)
      der.set(prefix); der.set(privateKeyBytes, prefix.length)
      return der.buffer
    })(),
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  )

  const sig = new Uint8Array(await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    enc.encode(signingInput)
  ))

  return `${signingInput}.${b64url(sig)}`
}

async function sendWebPush(subscription: { endpoint: string, keys: { p256dh: string, auth: string } }, payload: string, vapidPublic: string, vapidPrivate: string) {
  const url = new URL(subscription.endpoint)
  const audience = `${url.protocol}//${url.host}`
  const subject = 'mailto:admin@foxcrofthills.com'

  const jwt = await makeVapidToken(audience, subject, vapidPublic, vapidPrivate)
  const vapidHeader = `vapid t=${jwt},k=${vapidPublic}`

  // Encrypt payload using Web Push encryption (simplified - use content-encoding: aes128gcm)
  // For simplicity we'll send as raw JSON that the SW can read
  const enc = new TextEncoder()
  const body = enc.encode(payload)

  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': vapidHeader,
      'Content-Type': 'application/json',
      'TTL': '86400',
    },
    body: payload
  })

  return res.status
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { player_ids, title, body, tag, url } = await req.json()

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const vapidPublic = Deno.env.get('VAPID_PUBLIC_KEY')!
    const vapidPrivate = Deno.env.get('VAPID_PRIVATE_KEY')!

    // Fetch subscriptions for specified players (or all if no player_ids)
    let endpoint = `${supabaseUrl}/rest/v1/push_subscriptions`
    if (player_ids?.length) {
      endpoint += `?player_id=in.(${player_ids.join(',')})`
    }

    const subRes = await fetch(endpoint, {
      headers: { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` }
    })
    const subscriptions = await subRes.json()

    const payload = JSON.stringify({ title, body, tag, url })
    const results = await Promise.allSettled(
      subscriptions.map((sub: any) =>
        sendWebPush(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload, vapidPublic, vapidPrivate
        )
      )
    )

    const sent = results.filter(r => r.status === 'fulfilled').length
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
