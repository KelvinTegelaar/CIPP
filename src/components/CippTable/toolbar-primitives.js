import { styled, alpha } from '@mui/material/styles'
import { Button, IconButton, InputBase, Paper } from '@mui/material'

// shared toolbar styling for the desktop table toolbar and the mobile card controls bar

export const ModernSearchContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: '300px',
  minWidth: '200px',
  height: '40px',
  backgroundColor: theme.palette.mode === 'dark' ? '#2A2D3A' : '#F8F9FA',
  border: `1px solid ${theme.palette.mode === 'dark' ? '#404040' : '#E0E0E0'}`,
  borderRadius: '8px',
  padding: '0 12px',
  '&:hover': {
    borderColor: theme.palette.primary.main,
  },
  '&:focus-within': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  [theme.breakpoints.down('md')]: {
    minWidth: '0',
    maxWidth: 'none',
    flex: 1,
  },
}))

export const ModernSearchInput = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
  fontSize: '14px',
  '& .MuiInputBase-input': {
    padding: '8px 0',
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
  },
}))

export const ModernButton = styled(Button)(({ theme }) => ({
  height: '40px',
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '14px',
  padding: '8px 16px',
  backgroundColor: theme.palette.mode === 'dark' ? '#2A2D3A' : '#F8F9FA',
  border: `1px solid ${theme.palette.mode === 'dark' ? '#404040' : '#E0E0E0'}`,
  color: theme.palette.text.primary,
  minWidth: 'auto',
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#363A4A' : '#F0F0F0',
    borderColor: theme.palette.primary.main,
  },
  '& .MuiButton-startIcon': {
    marginRight: '8px',
  },
  '& .MuiButton-endIcon': {
    marginLeft: '8px',
  },
  [theme.breakpoints.down('md')]: {
    padding: '8px 12px',
    fontSize: '13px',
    '& .MuiButton-startIcon': {
      marginRight: '6px',
    },
    '& .MuiButton-endIcon': {
      marginLeft: '6px',
    },
  },
  [theme.breakpoints.down('sm')]: {
    padding: '8px 10px',
    fontSize: '12px',
    '& .MuiButton-startIcon': {
      marginRight: '4px',
    },
    '& .MuiButton-endIcon': {
      marginLeft: '4px',
    },
  },
}))

// tonal icon button matching ModernButton, 44px for phone touch targets
export const ModernIconButton = styled(IconButton)(({ theme }) => ({
  width: '44px',
  height: '44px',
  borderRadius: '8px',
  backgroundColor: theme.palette.mode === 'dark' ? '#2A2D3A' : '#F8F9FA',
  border: `1px solid ${theme.palette.mode === 'dark' ? '#404040' : '#E0E0E0'}`,
  color: theme.palette.text.primary,
  flexShrink: 0,
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#363A4A' : '#F0F0F0',
    borderColor: theme.palette.primary.main,
  },
}))

export const RefreshButton = styled(IconButton)(({ theme }) => ({}))
