import { lazy } from 'react'
import { Routes, Route } from 'react-router'
import Layout from './components/Layout.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const PeopleLayout = lazy(() => import('./pages/PeopleLayout.jsx'))
const PeopleIndex = lazy(() => import('./pages/PeopleIndex.jsx'))
const PersonDetail = lazy(() => import('./pages/PersonDetail.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="people" element={<PeopleLayout />}>
          <Route index element={<PeopleIndex />} />
          <Route path=":personId" element={<PersonDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
