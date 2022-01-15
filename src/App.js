import React, { Suspense } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { PrivateRoute } from 'src/components/utilities/PrivateRoute'
import 'src/scss/style.scss'
import { FullScreenLoading } from 'src/components/utilities/Loading'
import routes from 'src/routes'
import { CSpinner } from '@coreui/react'
import ErrorBoundary from 'src/components/utilities/ErrorBoundary'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const Login = React.lazy(() => import('./views/pages/login/Login'))

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<FullScreenLoading />}>
        <ErrorBoundary>
          <Routes>
            <Route exact path="/404" name="Page 404" element={<Page404 />} />
            <Route exact path="/500" name="Page 500" element={<Page500 />} />
            <Route exact path="/login" name="Login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <DefaultLayout />
                </PrivateRoute>
              }
            >
              {routes.map((route, idx) => {
                return (
                  route.component && (
                    <Route
                      key={`route-${idx}`}
                      path={route.path}
                      exact={route.exact}
                      name={route.name}
                      element={
                        <Suspense fallback={<CSpinner color="primary" />}>
                          <route.component />
                        </Suspense>
                      }
                    />
                  )
                )
              })}
              <Route path="/" element={<Navigate to="/home" />} />
            </Route>
            <Route path="*" name="Page 404" element={<Page404 />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
