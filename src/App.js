import React, { Suspense } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { PrivateRoute, FullScreenLoading, ErrorBoundary } from 'src/components/utilities'
import 'src/scss/style.scss'
import routes from 'src/routes'
import { Helmet } from 'react-helmet'
import adminRoutes from './adminRoutes'
import Skeleton from 'react-loading-skeleton'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Page401 = React.lazy(() => import('./views/pages/page401/Page401'))
const Page403 = React.lazy(() => import('./views/pages/page403/Page403'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Logout = React.lazy(() => import('./views/pages/login/Logout'))

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<FullScreenLoading />}>
        <ErrorBoundary>
          <Helmet>
            <title>CIPP</title>
          </Helmet>
          <Routes>
            <Route exact path="/401" name="Page 401" element={<Page401 />} />
            <Route exact path="/403" name="Page 403" element={<Page403 />} />
            <Route exact path="/404" name="Page 404" element={<Page404 />} />
            <Route exact path="/500" name="Page 500" element={<Page500 />} />
            <Route exact path="/login" name="Login" element={<Login />} />
            <Route exact path="/logout" name="Logout" element={<Logout />} />
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
                        <Suspense fallback={<Skeleton />}>
                          <Helmet>
                            <title>CIPP - {route.name}</title>
                          </Helmet>
                          <route.component />
                        </Suspense>
                      }
                    />
                  )
                )
              })}
              {adminRoutes.map((route, idx) => {
                return (
                  route.component && (
                    <Route
                      key={`route-${idx}`}
                      path={route.path}
                      exact={route.exact}
                      name={route.name}
                      element={
                        <PrivateRoute routeType="admin">
                          <Suspense fallback={<Skeleton />}>
                            <Helmet>
                              <title>CIPP - {route.name}</title>
                            </Helmet>
                            <route.component />
                          </Suspense>
                        </PrivateRoute>
                      }
                    />
                  )
                )
              })}
              <Route path="/" element={<Navigate to="/home" replace={true} />} />
            </Route>
            <Route path="*" name="Page 404" element={<Page404 />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
