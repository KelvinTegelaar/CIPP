import React, { Suspense } from 'react'
import PropTypes from 'prop-types'
import Page500 from 'src/views/pages/page500/Page500'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
    // You can also log error messages to an error reporting service here
  }

  render() {
    if (this.state.errorInfo) {
      //React.lazy(() => import('src/views/pages/page500/Page500'))
      return <Page500 errorcode={this.state.error.message} issue={this.state.error.stack} />
    }
    // Normally, just render children
    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
}
