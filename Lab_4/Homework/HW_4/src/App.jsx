import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router'
import Layout from './components/Layout.jsx'
import Skeleton from './components/Skeleton.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const PeopleLayout = lazy(() => import('./pages/PeopleLayout.jsx'))
const PeopleIndex = lazy(() => import('./pages/PeopleIndex.jsx'))
const PersonDetail = lazy(() => import('./pages/PersonDetail.jsx'))
const SimpleForm = lazy(() => import('./pages/SimpleForm.jsx'))
const Forum = lazy(() => import('./pages/Forum.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="people"
          element={
            <Suspense fallback={<Skeleton variant="people" />}>
              <PeopleLayout />
            </Suspense>
          }
        >
          <Route index element={<PeopleIndex />} />
          <Route path=":personId" element={<PersonDetail />} />
        </Route>
        <Route
          path="form"
          element={
            <Suspense fallback={<Skeleton variant="people" />}>
              <SimpleForm />
            </Suspense>
          }
        />
        <Route path="forum/:forumId" element={<Forum />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
