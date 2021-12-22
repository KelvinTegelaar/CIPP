// from https://www.fullstacklabs.co/blog/keyboard-shortcuts-with-react-hooks
import { useEffect, useCallback, useRef, useMemo } from 'react'

const BLACKLISTED_DOM_TARGETS = ['TEXTAREA', 'INPUT']

const DEFAULT_OPTIONS = {
  overrideSystem: false,
  ignoreInputFields: true,
}

const useKeyboardShortcut = (shortcutKeys, callback, options = DEFAULT_OPTIONS) => {
  if (!Array.isArray(shortcutKeys))
    throw new Error(
      'The first parameter to `useKeyboardShortcut` must be an ordered array of `KeyboardEvent.key` strings.',
    )

  if (!shortcutKeys.length)
    throw new Error(
      'The first parameter to `useKeyboardShortcut` must contain atleast one `KeyboardEvent.key` string.',
    )

  if (!callback || typeof callback !== 'function')
    throw new Error(
      'The second parameter to `useKeyboardShortcut` must be a function that will be envoked when the keys are pressed.',
    )

  // Normalizes the shortcut keys a deduplicated array of lowercased keys.
  const shortcutArray = useMemo(
    () => uniq_fast(shortcutKeys).map((key) => String(key).toLowerCase()),
    // While using JSON.stringify() is bad for most larger objects, this shortcut
    // array is fine as it's small, according to the answer below.
    // https://github.com/facebook/react/issues/14476#issuecomment-471199055
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(shortcutKeys)],
  )
  // useRef to avoid a constant re-render on keydown and keyup.
  const heldKeys = useRef([])

  const keydownListener = useCallback(
    (keydownEvent) => {
      const loweredKey = String(keydownEvent.key).toLowerCase()
      if (!(shortcutArray.indexOf(loweredKey) >= 0)) return

      if (keydownEvent.repeat) return

      // This needs to be checked as soon as possible to avoid
      // all option checks that might prevent default behavior
      // of the key press.
      //
      // I.E If shortcut is "Shift + A", we shouldn't prevent the
      // default browser behavior of Select All Text just because
      // "A" is being observed for our custom behavior shortcut.
      const isHeldKeyCombinationValid = checkHeldKeysRecursive(
        loweredKey,
        null,
        shortcutArray,
        heldKeys.current,
      )

      if (!isHeldKeyCombinationValid) {
        return
      }

      if (
        options.ignoreInputFields &&
        BLACKLISTED_DOM_TARGETS.indexOf(keydownEvent.target.tagName) >= 0
      ) {
        return
      }
      if (options.overrideSystem) {
        overrideSystemHandling(keydownEvent)
      }

      heldKeys.current = [...heldKeys.current, loweredKey]

      if (heldKeys.current.length === shortcutArray.length) {
        callback(shortcutKeys)
      }

      return false
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shortcutArray, callback, options.overrideSystem, options.ignoreInputFields],
  )

  const keyupListener = useCallback(
    (keyupEvent) => {
      const raisedKey = String(keyupEvent.key).toLowerCase()
      if (!(shortcutArray.indexOf(raisedKey) >= 0)) return

      const raisedKeyHeldIndex = heldKeys.current.indexOf(raisedKey)
      if (!(raisedKeyHeldIndex >= 0)) return

      if (
        options.ignoreInputFields &&
        BLACKLISTED_DOM_TARGETS.indexOf(keyupEvent.target.tagName) >= 0
      ) {
        return
      }
      if (options.overrideSystem) {
        overrideSystemHandling(keyupEvent)
      }

      let newHeldKeys = []
      let loopIndex
      for (loopIndex = 0; loopIndex < heldKeys.current.length; ++loopIndex) {
        if (loopIndex !== raisedKeyHeldIndex) {
          newHeldKeys.push(heldKeys.current[loopIndex])
        }
      }
      heldKeys.current = newHeldKeys

      return false
    },
    [shortcutArray, options.overrideSystem, options.ignoreInputFields],
  )

  useEffect(() => {
    window.addEventListener('keydown', keydownListener)
    window.addEventListener('keyup', keyupListener)
    return () => {
      window.removeEventListener('keydown', keydownListener)
      window.removeEventListener('keyup', keyupListener)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keydownListener, keyupListener, shortcutArray])

  // Resets the held keys array if the shortcut keys are changed.
  useEffect(() => {
    heldKeys.current = []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcutArray])
}

export default useKeyboardShortcut

const overrideSystemHandling = (e) => {
  if (e) {
    if (e.preventDefault) e.preventDefault()
    if (e.stopPropagation) {
      e.stopPropagation()
    } else if (window.event) {
      window.event.cancelBubble = true
    }
  }
}

// Function stolen from this Stack Overflow answer:
// https: stackoverflow.com/a/9229821
const uniq_fast = (a) => {
  var seen = {}
  var out = []
  var len = a.length
  var j = 0
  for (var i = 0; i < len; i++) {
    var item = a[i]
    if (seen[item] !== 1) {
      seen[item] = 1
      out[j++] = item
    }
  }
  return out
}

// The goal for this recursive function is to check to ensure
// that the keys are held down in the correct order of the shortcut.
// I.E if the shortcut array is ["Shift", "E", "A"], this function will ensure
// that "E" is held down before "A", and "Shift" is held down before "E".
const checkHeldKeysRecursive = (
  shortcutKey,
  // Tracks the call interation for the recursive function,
  // based on the previous index;
  shortcutKeyRecursionIndex = 0,
  shortcutArray,
  heldKeysArray,
) => {
  const shortcutIndexOfKey = shortcutArray.indexOf(shortcutKey)
  const keyPartOfShortCut = shortcutArray.indexOf(shortcutKey) >= 0

  // Early exit if they key isn't even in the shortcut combination.
  if (!keyPartOfShortCut) return false

  // While holding down one of the keys, if another is to be let go, the shortcut
  // should be void. Shortcut keys must be held down in a specifc order.
  // This function is always called before a key is added to held keys on keydown,
  // this will ensure that heldKeys only contains the prefixing keys
  const comparisonIndex = Math.max(heldKeysArray.length - 1, 0)
  if (heldKeysArray.length && heldKeysArray[comparisonIndex] !== shortcutArray[comparisonIndex]) {
    return false
  }

  // Early exit for the first held down key in the shortcut,
  // except if this is a recursive call
  if (shortcutIndexOfKey === 0) {
    // If this isn't the first interation of this recursive function, and we're
    // recursively calling this function, we should always be checking the
    // currently held down keys instead of returning true
    if (shortcutKeyRecursionIndex > 0) return heldKeysArray.indexOf(shortcutKey) >= 0
    return true
  }

  const previousShortcutKeyIndex = shortcutIndexOfKey - 1
  const previousShortcutKey = shortcutArray[previousShortcutKeyIndex]
  const previousShortcutKeyHeld = heldKeysArray[previousShortcutKeyIndex] === previousShortcutKey

  // Early exit if the key just before the currently checked shortcut key
  // isn't being held down.
  if (!previousShortcutKeyHeld) return false

  // Recursively call this function with the previous key as the new shortcut key
  // but the index of the current shortcut key.
  return checkHeldKeysRecursive(
    previousShortcutKey,
    shortcutIndexOfKey,
    shortcutArray,
    heldKeysArray,
  )
}
