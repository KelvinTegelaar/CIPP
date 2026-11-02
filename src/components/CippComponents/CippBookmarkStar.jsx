import { useCallback } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import { useRouter } from 'next/router'
import PropTypes from 'prop-types'
import { IconButton, Tooltip } from '@mui/material'
import { MAX_BOOKMARKS, useUserBookmarks } from '../../hooks/use-user-bookmarks'

/**
 * Bookmarks store a path and nothing else, so a page is only worth offering if that path alone
 * reproduces it. tenantFilter is safe to drop - it follows the global tenant selector. Any other
 * query param identifies a specific record (userId, groupId, ...) and the bare path would open an
 * empty page, so those URLs get no star.
 */
const isPathSelfSufficient = (query) =>
  Object.keys(query ?? {}).every((key) => key === 'tenantFilter')

export const CippBookmarkStar = ({ label, category = '' }) => {
  const router = useRouter()
  const { bookmarks, isBookmarked, toggleBookmark } = useUserBookmarks()

  const path = router.pathname
  const bookmarked = isBookmarked(path)

  const handleToggle = useCallback(() => {
    toggleBookmark({ label, path, category })
  }, [toggleBookmark, label, path, category])

  if (!label || !isPathSelfSufficient(router.query)) {
    return null
  }

  const atLimit = !bookmarked && bookmarks.length >= MAX_BOOKMARKS

  return (
    <Tooltip
      title={
        atLimit
          ? `Bookmark limit reached (${MAX_BOOKMARKS})`
          : bookmarked
            ? 'Remove bookmark'
            : 'Bookmark this page'
      }
    >
      {/* span keeps the tooltip working while the button is disabled */}
      <span>
        <IconButton
          size="small"
          onClick={handleToggle}
          disabled={atLimit}
          aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this page'}
          sx={{ p: 0.5, color: bookmarked ? 'primary.main' : 'neutral.500' }}
        >
          {bookmarked ? (
            <CippIcons.Bookmark fontSize="small" />
          ) : (
            <CippIcons.BookmarkBorder fontSize="small" />
          )}
        </IconButton>
      </span>
    </Tooltip>
  )
}

CippBookmarkStar.propTypes = {
  label: PropTypes.string,
  category: PropTypes.string,
}
