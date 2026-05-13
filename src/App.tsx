import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import FxDepositCompare from './pages/FxDepositCompare'
import MarathonSavings from './pages/MarathonSavings'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter basename="/ji-tools/">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/fx-deposit-compare" element={<FxDepositCompare />} />
          <Route path="/marathon-savings" element={<MarathonSavings />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App