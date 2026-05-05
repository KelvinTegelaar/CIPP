import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import NextLink from 'next/link'
import PropTypes from 'prop-types'
import Bars3Icon from '@heroicons/react/24/outline/Bars3Icon'
import MagnifyingGlassIcon from '@heroicons/react/24/outline/MagnifyingGlassIcon'
import MoonIcon from '@heroicons/react/24/outline/MoonIcon'
import SunIcon from '@heroicons/react/24/outline/SunIcon'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import TravelExploreIcon from '@mui/icons-material/TravelExplore'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CloseIcon from '@mui/icons-material/Close'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import {
  Box,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  SvgIcon,
  useMediaQuery,
  Popover,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@mui/material'
import { Logo } from '../components/logo'
import { useSettings } from '../hooks/use-settings'
import { useUserBookmarks } from '../hooks/use-user-bookmarks'
import { paths } from '../paths'
import { AccountPopover } from './account-popover'
import { CippTenantSelector } from '../components/CippComponents/CippTenantSelector'
import { NotificationsPopover } from './notifications-popover'
import { useDialog } from '../hooks/use-dialog'
import { CippUniversalSearchV2 } from '../components/CippCards/CippUniversalSearchV2'

const TOP_NAV_HEIGHT = 64

export const TopNav = (props) => {
  const universalSearchDialog = useDialog()
  const { onNavOpen } = props
  const settings = useSettings()
  const { bookmarks, setBookmarks } = useUserBookmarks()
  const mdDown = useMediaQuery((theme) => theme.breakpoints.down('md'))
  const showPopoverBookmarks = settings.bookmarkPopover === true
  const reorderMode = settings.bookmarkReorderMode || 'arrows'
  const locked = settings.bookmarkLocked ?? false
  const handleThemeSwitch = useCallback(() => {
    const themeName = settings.currentTheme?.value === 'light' ? 'dark' : 'light'
    settings.handleUpdate({
      currentTheme: { value: themeName, label: themeName },
      paletteMode: themeName,
    })
  }, [settings])

  const [anchorEl, setAnchorEl] = useState(null)
  const [sortOrder, setSortOrder] = useState(settings.bookmarkSortOrder || 'custom')
  const [dragIndex, setDragIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)
  const [animatingPair, setAnimatingPair] = useState(null)
  const [flashSort, setFlashSort] = useState(false)
  const [flashLock, setFlashLock] = useState(false)
  const [universalSearchKey, setUniversalSearchKey] = useState(0)
  const [universalSearchDefaultType, setUniversalSearchDefaultType] = useState('Users')
  const itemRefs = useRef({})
  const touchDragRef = useRef({ startIdx: null, overIdx: null })
  const tenantSelectorRef = useRef(null)

  const handleBookmarkClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleBookmarkClose = () => {
    setAnchorEl(null)
  }

  const handleDragStart = (index) => {
    setDragIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    const items = [...bookmarks]
    const [reordered] = items.splice(dragIndex, 1)
    items.splice(dropIndex, 0, reordered)
    setBookmarks(items)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const moveBookmarkUp = (index) => {
    if (index <= 0) return
    const updatedBookmarks = [...bookmarks]
    const temp = updatedBookmarks[index]
    updatedBookmarks[index] = updatedBookmarks[index - 1]
    updatedBookmarks[index - 1] = temp
    setBookmarks(updatedBookmarks)
  }

  const moveBookmarkDown = (index) => {
    if (index >= bookmarks.length - 1) return
    const updatedBookmarks = [...bookmarks]
    const temp = updatedBookmarks[index]
    updatedBookmarks[index] = updatedBookmarks[index + 1]
    updatedBookmarks[index + 1] = temp
    setBookmarks(updatedBookmarks)
  }

  const removeBookmark = (path) => {
    const updatedBookmarks = [...bookmarks]
    const origIdx = updatedBookmarks.findIndex((b) => b.path === path)
    if (origIdx !== -1) {
      updatedBookmarks.splice(origIdx, 1)
      setBookmarks(updatedBookmarks)
    }
  }

  const triggerSortFlash = () => {
    setFlashSort(true)
    setTimeout(() => setFlashSort(false), 600)
  }

  const triggerLockFlash = () => {
    setFlashLock(true)
    setTimeout(() => setFlashLock(false), 600)
  }

  const handleToggleLock = () => {
    settings.handleUpdate({ bookmarkLocked: !locked })
  }

  const animatedMoveUp = (index) => {
    if (index <= 0 || animatingPair) return
    const el1 = itemRefs.current[index]
    const el2 = itemRefs.current[index - 1]
    if (!el1 || !el2) {
      moveBookmarkUp(index)
      return
    }
    const distance = el1.getBoundingClientRect().top - el2.getBoundingClientRect().top
    setAnimatingPair({ idx1: index, idx2: index - 1, offset1: -distance, offset2: distance })
    setTimeout(() => {
      moveBookmarkUp(index)
      setAnimatingPair(null)
    }, 250)
  }

  const animatedMoveDown = (index) => {
    if (index >= bookmarks.length - 1 || animatingPair) return
    const el1 = itemRefs.current[index]
    const el2 = itemRefs.current[index + 1]
    if (!el1 || !el2) {
      moveBookmarkDown(index)
      return
    }
    const distance = el2.getBoundingClientRect().top - el1.getBoundingClientRect().top
    setAnimatingPair({ idx1: index, idx2: index + 1, offset1: distance, offset2: -distance })
    setTimeout(() => {
      moveBookmarkDown(index)
      setAnimatingPair(null)
    }, 250)
  }

  const handleSortCycle = () => {
    const next = sortOrder === 'custom' ? 'asc' : sortOrder === 'asc' ? 'desc' : 'custom'
    setSortOrder(next)
    settings.handleUpdate({ bookmarkSortOrder: next })
  }

  const displayBookmarks = useMemo(() => {
    if (sortOrder === 'custom') return bookmarks
    return [...bookmarks].sort((a, b) => {
      const cmp = (a.label || '').localeCompare(b.label || '')
      return sortOrder === 'asc' ? cmp : -cmp
    })
  }, [bookmarks, sortOrder])
  const popoverOpen = Boolean(anchorEl)
  const popoverId = popoverOpen ? 'bookmark-popover' : undefined

  const openUniversalSearch = useCallback(
    (defaultType = 'Users') => {
      setUniversalSearchDefaultType(defaultType)
      universalSearchDialog.handleOpen()
    },
    [universalSearchDialog.handleOpen]
  )

  const closeUniversalSearch = useCallback(() => {
    universalSearchDialog.handleClose()
    setUniversalSearchKey((prev) => prev + 1)
  }, [universalSearchDialog.handleClose])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.altKey && event.key === 'k') {
        event.preventDefault()
        tenantSelectorRef.current?.focus()
      } else if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'F') {
        event.preventDefault()
        openUniversalSearch('Users')
      } else if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        openUniversalSearch('Pages')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [openUniversalSearch])

  return (
    <Box
      component="header"
      sx={{
        backgroundColor: 'neutral.900',
        color: 'common.white',
        position: 'fixed',
        width: '100%',
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          minHeight: TOP_NAV_HEIGHT,
          px: 3,
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          spacing={3}
          divider={
            <Divider
              orientation="vertical"
              sx={{
                borderColor: 'neutral.500',
                height: 36,
              }}
            />
          }
        >
          <Box
            component={NextLink}
            href={paths.index}
            sx={{
              display: 'inline-flex',
              height: 24,
              width: 24,
            }}
          >
            <Logo />
          </Box>
          {!mdDown && (
            <CippTenantSelector ref={tenantSelectorRef} refreshButton={true} tenantButton={true} />
          )}
          {mdDown && (
            <IconButton color="inherit" onClick={onNavOpen}>
              <SvgIcon color="action" fontSize="small">
                <Bars3Icon />
              </SvgIcon>
            </IconButton>
          )}
        </Stack>
        <Stack alignItems="center" direction="row" spacing={1.5}>
          {!mdDown && (
            <IconButton
              color="inherit"
              onClick={() => openUniversalSearch('Users')}
              title="Open Universal Search (Ctrl/Cmd+Shift+F)"
            >
              <TravelExploreIcon color="action" fontSize="small" />
            </IconButton>
          )}
          {!mdDown && (
            <IconButton color="inherit" onClick={handleThemeSwitch}>
              <SvgIcon color="action" fontSize="small">
                {settings?.currentTheme?.value === 'dark' ? <SunIcon /> : <MoonIcon />}
              </SvgIcon>
            </IconButton>
          )}
          {!mdDown && (
            <IconButton
              color="inherit"
              onClick={() => openUniversalSearch('Pages')}
              title="Open Page Search (Ctrl/Cmd+K)"
            >
              <SvgIcon color="action" fontSize="small">
                <MagnifyingGlassIcon />
              </SvgIcon>
            </IconButton>
          )}
          {showPopoverBookmarks && (
            <>
              <IconButton color="inherit" onClick={handleBookmarkClick}>
                <SvgIcon color="action" fontSize="small">
                  <BookmarkIcon />
                </SvgIcon>
              </IconButton>
              <Popover
                id={popoverId}
                open={popoverOpen}
                anchorEl={anchorEl}
                onClose={handleBookmarkClose}
                disableScrollLock
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <List sx={{ minWidth: '220px' }}>
                  <ListItem sx={{ py: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={handleToggleLock}
                      sx={{
                        color: locked ? 'warning.main' : 'neutral.500',
                        ...(flashLock && {
                          animation: 'lockFlash 600ms ease-in-out',
                          '@keyframes lockFlash': {
                            '0%': { transform: 'scale(1)' },
                            '25%': { transform: 'scale(1.5)', color: '#ff9800' },
                            '50%': { transform: 'scale(1)' },
                            '75%': { transform: 'scale(1.3)', color: '#ff9800' },
                            '100%': { transform: 'scale(1)' },
                          },
                        }),
                      }}
                      title={locked ? 'Unlock bookmarks' : 'Lock bookmarks'}
                    >
                      {locked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleSortCycle}
                      sx={{
                        color: sortOrder === 'custom' ? 'neutral.500' : 'primary.main',
                        ...(flashSort && {
                          animation: 'sortFlash 600ms ease-in-out',
                          '@keyframes sortFlash': {
                            '0%': { transform: 'scale(1)' },
                            '25%': { transform: 'scale(1.5)', color: '#ff9800' },
                            '50%': { transform: 'scale(1)' },
                            '75%': { transform: 'scale(1.3)', color: '#ff9800' },
                            '100%': { transform: 'scale(1)' },
                          },
                        }),
                      }}
                      title={
                        sortOrder === 'custom'
                          ? 'Custom order'
                          : sortOrder === 'asc'
                            ? 'A > Z'
                            : 'Z > A'
                      }
                    >
                      {sortOrder === 'custom' && <SwapVertIcon fontSize="small" />}
                      {sortOrder === 'asc' && <ArrowUpwardIcon fontSize="small" />}
                      {sortOrder === 'desc' && <ArrowDownwardIcon fontSize="small" />}
                    </IconButton>
                    <Typography
                      variant="body2"
                      sx={{ ml: 0.5, color: 'text.secondary', fontSize: 12 }}
                    >
                      {sortOrder === 'custom'
                        ? 'Custom order'
                        : sortOrder === 'asc'
                          ? 'A > Z'
                          : 'Z > A'}
                    </Typography>
                  </ListItem>
                  <Divider />
                  {displayBookmarks.length === 0 ? (
                    <ListItem>
                      <ListItemText
                        primary={<Typography variant="body2">No bookmarks added yet</Typography>}
                      />
                    </ListItem>
                  ) : (
                    displayBookmarks.map((bookmark, idx) => (
                      <ListItem
                        key={bookmark.path}
                        ref={(el) => {
                          itemRefs.current[idx] = el
                        }}
                        data-bookmark-index={idx}
                        draggable={reorderMode === 'drag' && sortOrder === 'custom' && !locked}
                        {...(reorderMode === 'drag'
                          ? {
                              onDragStart: (e) => {
                                if (locked) {
                                  e.preventDefault()
                                  triggerLockFlash()
                                  return
                                }
                                if (sortOrder !== 'custom') {
                                  e.preventDefault()
                                  triggerSortFlash()
                                  return
                                }
                                handleDragStart(idx)
                              },
                              onDragEnd: handleDragEnd,
                              ...(sortOrder === 'custom' && !locked
                                ? {
                                    onDragOver: (e) => handleDragOver(e, idx),
                                    onDrop: (e) => handleDrop(e, idx),
                                  }
                                : {}),
                            }
                          : {})}
                        sx={{
                          color: 'inherit',
                          display: 'flex',
                          justifyContent: 'space-between',
                          '&:hover .bookmark-controls': {
                            opacity: 1,
                          },
                          ...(sortOrder === 'custom' &&
                            reorderMode === 'drag' &&
                            dragIndex === idx && {
                              opacity: 0.4,
                            }),
                          ...(sortOrder === 'custom' &&
                            reorderMode === 'drag' &&
                            dragOverIndex === idx &&
                            dragIndex !== idx && {
                              borderTop: '2px solid',
                              borderColor: 'primary.main',
                            }),
                          ...(animatingPair &&
                            (animatingPair.idx1 === idx || animatingPair.idx2 === idx) && {
                              transform: `translateY(${animatingPair.idx1 === idx ? animatingPair.offset1 : animatingPair.offset2}px)`,
                              transition: 'transform 250ms ease-in-out',
                              position: 'relative',
                              zIndex: animatingPair.idx1 === idx ? 1 : 0,
                            }),
                        }}
                      >
                        {reorderMode === 'drag' && !locked && (
                          <Box
                            onTouchStart={() => {
                              if (sortOrder !== 'custom') {
                                triggerSortFlash()
                                return
                              }
                              touchDragRef.current.startIdx = idx
                              setDragIndex(idx)
                            }}
                            onTouchMove={(e) => {
                              if (touchDragRef.current.startIdx === null) return
                              const touch = e.touches[0]
                              const draggedLi = itemRefs.current[touchDragRef.current.startIdx]
                              if (draggedLi) draggedLi.style.pointerEvents = 'none'
                              const el = document.elementFromPoint(touch.clientX, touch.clientY)
                              if (draggedLi) draggedLi.style.pointerEvents = ''
                              const li = el?.closest('[data-bookmark-index]')
                              if (li) {
                                const overIdx = parseInt(li.dataset.bookmarkIndex, 10)
                                if (!isNaN(overIdx) && overIdx >= 0 && overIdx < bookmarks.length) {
                                  touchDragRef.current.overIdx = overIdx
                                  setDragOverIndex(overIdx)
                                }
                              }
                            }}
                            onTouchEnd={() => {
                              const { startIdx, overIdx } = touchDragRef.current
                              if (startIdx !== null && overIdx !== null && startIdx !== overIdx) {
                                const items = [...bookmarks]
                                const [reordered] = items.splice(startIdx, 1)
                                items.splice(overIdx, 0, reordered)
                                setBookmarks(items)
                              }
                              touchDragRef.current = { startIdx: null, overIdx: null }
                              setDragIndex(null)
                              setDragOverIndex(null)
                            }}
                            sx={{
                              touchAction: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              color: 'neutral.500',
                              cursor: sortOrder === 'custom' ? 'grab' : 'default',
                              mr: 1,
                            }}
                          >
                            <DragIndicatorIcon fontSize="small" />
                          </Box>
                        )}
                        <Box
                          component={NextLink}
                          href={bookmark.path}
                          onClick={() => handleBookmarkClose()}
                          sx={{
                            textDecoration: 'none',
                            color: 'inherit',
                            flexGrow: 1,
                            marginRight: 2,
                          }}
                        >
                          <Typography variant="body2">{bookmark.label}</Typography>
                        </Box>
                        <Stack
                          className="bookmark-controls"
                          direction="row"
                          spacing={0}
                          sx={{
                            opacity: 0,
                            transition: 'opacity 150ms ease-in-out',
                            '@media (hover: none)': {
                              opacity: 1,
                            },
                          }}
                        >
                          {reorderMode === 'arrows' && (
                            <>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (locked) {
                                    triggerLockFlash()
                                    return
                                  }
                                  sortOrder === 'custom' ? animatedMoveUp(idx) : triggerSortFlash()
                                }}
                                disabled={sortOrder === 'custom' && idx === 0}
                                sx={{ opacity: sortOrder !== 'custom' || locked ? 0.4 : 1 }}
                              >
                                <KeyboardArrowUpIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.preventDefault()
                                  if (locked) {
                                    triggerLockFlash()
                                    return
                                  }
                                  sortOrder === 'custom'
                                    ? animatedMoveDown(idx)
                                    : triggerSortFlash()
                                }}
                                disabled={
                                  sortOrder === 'custom' && idx === displayBookmarks.length - 1
                                }
                                sx={{ opacity: sortOrder !== 'custom' || locked ? 0.4 : 1 }}
                              >
                                <KeyboardArrowDownIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          {!(reorderMode === 'drag' && locked) && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.preventDefault()
                                if (locked) {
                                  triggerLockFlash()
                                  return
                                }
                                removeBookmark(bookmark.path)
                              }}
                              sx={{ ...(locked && { opacity: 0.4 }) }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </ListItem>
                    ))
                  )}
                </List>
              </Popover>
            </>
          )}
          <Dialog
            open={universalSearchDialog.open}
            onClose={closeUniversalSearch}
            fullWidth
            maxWidth="md"
            sx={{
              '& .MuiDialog-container': {
                alignItems: 'flex-start',
              },
              '& .MuiDialog-paper': {
                mt: 8,
              },
            }}
          >
            <DialogTitle sx={{ px: 3, pt: 2, pb: 1 }}>Universal Search</DialogTitle>
            <DialogContent sx={{ px: 3, pt: 1, pb: 3 }}>
              <Box>
                <CippUniversalSearchV2
                  key={universalSearchKey}
                  maxResults={12}
                  autoFocus={true}
                  defaultSearchType={universalSearchDefaultType}
                  onConfirm={closeUniversalSearch}
                />
              </Box>
            </DialogContent>
          </Dialog>
          <NotificationsPopover />
          <AccountPopover
            onThemeSwitch={handleThemeSwitch}
            paletteMode={settings.currentTheme?.value === 'light' ? 'dark' : 'light'}
          />
        </Stack>
      </Stack>
    </Box>
  )
}

TopNav.propTypes = {
  onNavOpen: PropTypes.func,
  openNav: PropTypes.bool,
}
