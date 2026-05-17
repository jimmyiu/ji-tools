import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'

const FxDepositCompare = lazy(() => import('./pages/FxDepositCompare'))
const MarathonSavings = lazy(() => import('./pages/MarathonSavings'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <BrowserRouter basename="/ji-tools/">
      <Suspense fallback={null}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/fx-deposit-compare" element={<FxDepositCompare />} />
            <Route path="/marathon-savings" element={<MarathonSavings />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App