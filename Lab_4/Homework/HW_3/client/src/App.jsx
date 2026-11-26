import { lazy } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import PortalLayout from './components/PortalLayout.jsx'
import PortalHome from './components/PortalHome.jsx'
import NotFound from './components/NotFound.jsx'

const DossierView = lazy(() => import('./components/DossierView.jsx'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <PortalLayout />,
    children: [
      { index: true, element: <PortalHome /> },
      { path: 'dossier/:playerID', element: <DossierView /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
