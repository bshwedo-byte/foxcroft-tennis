import { supabase } from './supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function registerPushNotifications(playerId) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications not supported')
    return false
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })

    // Save subscription to Supabase
    await supabase
      .from('players')
      .update({ push_subscription: subscription.toJSON() })
      .eq('id', playerId)

    return true
  } catch (err) {
    console.error('Push registration failed:', err)
    return false
  }
}

export async function sendPushToPlayers(playerIds, title, body) {
  // This calls a Supabase Edge Function that does the actual sending
  const { error } = await supabase.functions.invoke('send-push', {
    body: { playerIds, title, body }
  })
  if (error) console.error('Push send error:', error)
}
