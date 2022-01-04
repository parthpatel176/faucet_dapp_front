import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom'

import Home from './pages'
import Main from './pages/main'

// add pages to list of routes
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  )
}

export default App;
