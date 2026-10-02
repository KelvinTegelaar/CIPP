import { useCallback, useEffect, useState } from 'react'
import { ApiGetCallWithPagination, ApiPostCall } from '../api/ApiCall'
import { getImpersonatedRole } from '../utils/impersonation'

// Base64url -> Uint8Array, the shape PushManager.subscribe wants for applicationServerKey.
const toApplicationServerKey = (base64url) => {
  const padded = (base64url + '='.repeat((4 - (base64url.length % 4)) % 4))
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  return Uint8Array.from(window.atob(padded), (c) => c.charCodeAt(0))
}

// iOS only offers push to an installed home-screen web app, never to a Safari tab.
export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true)

const isIos = () =>
  typeof navigator !== 'undefined' &&
  /iPad|iPhone|iPod/.test(navigator.userAgent)

const defaultDeviceName = () => {
  const ua = navigator.userAgent
  const os = /iPhone|iPad/.test(ua)
    ? 'iOS'
    : /Android/.test(ua)
      ? 'Android'
      : /Mac/.test(ua)
        ? 'macOS'
        : /Windows/.test(ua)
          ? 'Windows'
          : 'Device'
  const browser = /Edg\//.test(ua)
    ? 'Edge'
    : /Chrome\//.test(ua)
      ? 'Chrome'
      : /Firefox\//.test(ua)
        ? 'Firefox'
        : /Safari\//.test(ua)
          ? 'Safari'
          : 'Browser'
  return `${os} ${browser}${isStandalone() ? ' (app)' : ''}`
}

/**
 * The signed-in user's registered push devices plus the instance VAPID public key.
 * The Preferences table lists the same endpoint under this queryKey with the paginated
 * hook, so this must read the paginated cache shape too or the two fight over one key.
 */
export const usePushDevices = () => {
  const query = ApiGetCallWithPagination({
    url: '/api/ListPushSubscriptions',
    queryKey: 'ListPushSubscriptions',
  })
  const pages = query.data?.pages ?? []
  return {
    ...query,
    devices: pages.flatMap((page) => page?.Devices ?? []),
    publicKey: pages[0]?.PublicKey,
  }
}

/** Helper text for a post-execution picker, so forms say where to enrol before Push does anything. */
export const pushEnrolmentHint = (pushDevices) => {
  const count = pushDevices?.devices?.length ?? 0
  return count
    ? `Push (notify me) sends to the ${count} device${count === 1 ? '' : 's'} you registered under Preferences > Push Notifications.`
    : 'Push (notify me) needs a registered device. Enable notifications under Preferences > Push Notifications first.'
}

/**
 * Web Push registration for the signed-in user's current browser.
 * `blockedReason` is a human-readable reason the Enable button must stay disabled, or null.
 */
export const usePushSubscription = ({ publicKey, onSubscribed }) => {
  const [permission, setPermission] = useState('default')
  const [currentEndpoint, setCurrentEndpoint] = useState(null)
  const supported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window

  const register = ApiPostCall({ relatedQueryKeys: ['ListPushSubscriptions'] })

  useEffect(() => {
    if (!supported) return
    setPermission(window.Notification?.permission ?? 'default')
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setCurrentEndpoint(sub?.endpoint ?? null))
      .catch(() => {})
  }, [supported])

  let blockedReason = null
  if (!supported)
    blockedReason = 'This browser does not support push notifications.'
  else if (isIos() && !isStandalone())
    blockedReason =
      'On iOS, add CIPP to your Home Screen and open it from there to enable notifications.'
  else if (getImpersonatedRole())
    blockedReason =
      'Push devices cannot be registered while impersonating a role.'
  else if (permission === 'denied')
    blockedReason =
      'Notifications are blocked for this site in your browser settings.'
  else if (!publicKey)
    blockedReason = 'Push notifications are not ready on this instance yet.'

  const subscribe = useCallback(async () => {
    if (blockedReason) throw new Error(blockedReason)
    const result = await window.Notification.requestPermission()
    setPermission(result)
    if (result !== 'granted') return
    const reg = await navigator.serviceWorker.ready
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: toApplicationServerKey(publicKey),
      }))
    setCurrentEndpoint(sub.endpoint)
    register.mutate(
      {
        url: '/api/ExecPushSubscription',
        data: {
          Action: 'Subscribe',
          Subscription: sub.toJSON(),
          DeviceName: defaultDeviceName(),
        },
      },
      { onSuccess: () => onSubscribed?.() }
    )
  }, [blockedReason, publicKey, register, onSubscribed])

  return {
    supported,
    permission,
    blockedReason,
    currentEndpoint,
    subscribe,
    register,
  }
}
