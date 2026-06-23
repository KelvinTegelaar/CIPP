import { Component } from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'

export class CippTableErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('CippDataTable render error:', error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) this.props.onReset()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={this.handleReset}>
                Retry
              </Button>
            }
          >
            <Typography variant="body2">
              {this.props.fallbackMessage ||
                'An error occurred while rendering the table. Click Retry to reload.'}
            </Typography>
          </Alert>
        </Box>
      )
    }
    return this.props.children
  }
}
