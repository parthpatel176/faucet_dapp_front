import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom'

import Faucet from './pages/Faucet'

// add pages to list of routes
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Faucet />} />
      </Routes>
    </Router>
  )
}

export default App;
