// The frontend can't tell an expired session from a first-ever visit — both look
// like an empty /.auth/me. Remembering that a session once existed on this device
// lets the sign-in screen say "your session has expired" only when that's true.
//
// A stale flag is harmless: it only ever picks the friendlier of two wordings.

const STORAGE_KEY = 'cipp.hasSession'

export const rememberSession = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    // private mode or a full quota, the wording just falls back
  }
}

export const hasSeenSession = () => {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}
