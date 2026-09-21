import { useState, useMemo } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import { useTutorials } from '../../contexts/tutorial-context'
import { useRouter } from 'next/router'

const CippTutorialDialog = ({ open, onClose }) => {
  const { tutorials, completedIds, startTutorial, resetProgress } = useTutorials()
  const [search, setSearch] = useState('')
  const router = useRouter()

  const grouped = useMemo(() => {
    const filtered = tutorials.filter((t) => {
      const q = search.toLowerCase()
      return (
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q)
      )
    })

    return filtered.reduce((acc, tutorial) => {
      const cat = tutorial.category || 'General'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(tutorial)
      return acc
    }, {})
  }, [tutorials, search])

  const handleStart = (tutorial) => {
    onClose()
    // Small delay to let dialog close animation finish
    setTimeout(() => startTutorial(tutorial), 300)
  }

  const categoryKeys = Object.keys(grouped).sort()

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CippIcons.School color="primary" />
          <Typography variant="h6">Tutorials</Typography>
        </Box>
        <Tooltip title="Reset all progress">
          <IconButton size="small" onClick={resetProgress}>
            <CippIcons.Replay fontSize="small" />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          size="small"
          placeholder="Search tutorials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <CippIcons.Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        {categoryKeys.length === 0 && (
          <Typography
            sx={{
              color: "text.secondary",
              textAlign: 'center',
              py: 4
            }}>
            No tutorials found.
          </Typography>
        )}

        {categoryKeys.map((category) => (
          <Box key={category} sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: "text.secondary",
                px: 2,
                py: 0.5
              }}>
              {category}
            </Typography>
            <List dense disablePadding>
              {grouped[category].map((tutorial) => {
                const isCompleted = completedIds.includes(tutorial.id)
                const isOnPage = !tutorial.pages?.length || tutorial.pages.includes(router.pathname)

                return (
                  <ListItemButton
                    key={tutorial.id}
                    onClick={() => handleStart(tutorial)}
                    sx={{ borderRadius: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {isCompleted ? (
                        <CippIcons.CheckCircle color="success" fontSize="small" />
                      ) : (
                        <CippIcons.PlayArrow color="primary" fontSize="small" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={tutorial.title}
                      secondary={tutorial.description}
                      slotProps={{
                        primary: { variant: 'body2', fontWeight: 500 },
                        secondary: { variant: 'caption' },
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 0.5, ml: 1, flexShrink: 0 }}>
                      {isCompleted && (
                        <Chip label="Done" size="small" color="success" variant="outlined" />
                      )}
                      {!isOnPage && <Chip label="Navigates away" size="small" variant="outlined" />}
                      <Chip
                        label={`${tutorial.steps?.length || 0} steps`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </ListItemButton>
                )
              })}
            </List>
            <Divider sx={{ mt: 1 }} />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            mr: 'auto',
            pl: 2
          }}>
          {completedIds.length} of {tutorials.length} completed
        </Typography>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default CippTutorialDialog
