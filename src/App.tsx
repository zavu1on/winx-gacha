import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PullPage from './pages/PullPage'
import RosterPage from './pages/RosterPage'
import CharacterPage from './pages/CharacterPage'
import CollectionPage from './pages/CollectionPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="pull" element={<PullPage />} />
        <Route path="roster" element={<RosterPage />} />
        <Route path="character/:id" element={<CharacterPage />} />
        <Route path="collection" element={<CollectionPage />} />
      </Route>
    </Routes>
  )
}
