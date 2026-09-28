import { matchPattern } from './permission-rules'

/**
 * Filter menu items by user permissions.
 *
 * Groups (items with a non-empty `items` array) are visible if at least one of their
 * children is visible after filtering. A group's own `permissions` are ignored because
 * permission lists on groups do not cover every page inside them - e.g. a page with
 * Exchange.Contact.* permission can be hidden inside a group that requires Exchange.Mailbox.*.
 *
 * Pages (items without `items`) are visible only if:
 * - They declare a non-empty `permissions` array
 * - They are not in the `hiddenPages` list
 * - The user has a permission matching one of the required permissions (exact match or pattern match)
 *
 * @param {Array} items - Menu items to filter
 * @param {Object} options - Filter options
 * @param {Array} options.permissions - Array of user permission strings (e.g. ['Exchange.Contact.Read'])
 * @param {Array} options.hiddenPages - Array of page paths to hide (e.g. ['/email/administration/mailboxes'])
 * @returns {Array} Filtered menu items (a new array, never mutates input)
 */
export const filterMenuItems = (
  items,
  { permissions, hiddenPages = [] } = {}
) => {
  // If no permissions provided, return empty array
  if (!Array.isArray(permissions)) {
    return []
  }

  return items
    .map((item) => {
      // Check if page is hidden by feature flag
      if (
        item.path &&
        hiddenPages.length > 0 &&
        hiddenPages.includes(item.path)
      ) {
        return null
      }

      // Check if this is a group (has sub-items)
      if (item.items && item.items.length > 0) {
        // Recursively filter children - groups ignore their own permissions
        const filteredSubItems = filterMenuItems(item.items, {
          permissions,
          hiddenPages,
        })
        // Keep the group only if at least one child survives
        if (filteredSubItems.length === 0) return null
        return { ...item, items: filteredSubItems }
      }

      // This is a page - check its permissions
      if (!item.permissions || item.permissions.length === 0) {
        return null
      }

      const hasPermission = permissions.some((userPerm) => {
        return item.permissions.some((requiredPerm) => {
          // Exact match
          if (userPerm === requiredPerm) {
            return true
          }

          // Pattern matching - matchPattern escapes every regex metacharacter and
          // treats * as the only wildcard, mirroring PowerShell -like on the backend.
          if (requiredPerm.includes('*')) {
            return matchPattern(requiredPerm, userPerm)
          }

          return false
        })
      })

      if (!hasPermission) {
        return null
      }

      return item
    })
    .filter(Boolean)
}
