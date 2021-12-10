import React, { Component } from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { PrivateRoute } from './components/PrivateRoute'
import './scss/style.scss'
import { FullScreenLoading } from './components'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const Login = React.lazy(() => import('./views/pages/login/Login'))

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <React.Suspense fallback={<FullScreenLoading />}>
          <Switch>
            <Route exact path="/404" name="Page 404" render={(props) => <Page404 {...props} />} />
            <Route exact path="/500" name="Page 500" render={(props) => <Page500 {...props} />} />
            <Route exact path="/login" name="Login" render={(props) => <Login {...props} />} />
            <PrivateRoute path="/" name="Home" render={(props) => <DefaultLayout {...props} />} />
          </Switch>
        </React.Suspense>
      </BrowserRouter>
    )
  }
}

export default App
