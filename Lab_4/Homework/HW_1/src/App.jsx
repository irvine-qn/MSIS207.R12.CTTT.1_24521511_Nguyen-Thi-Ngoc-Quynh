import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import GalleryLayout from './layouts/GalleryLayout.jsx';
import Skeleton from './components/Skeleton.jsx';

const GalleryPage = lazy(() => import('./pages/GalleryPage.jsx'));

export default function App() {
  return (
    <Routes>
      <Route element={<GalleryLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<Skeleton />}>
              <GalleryPage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
