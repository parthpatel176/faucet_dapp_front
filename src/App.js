import React from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom'

import Faucet from './pages/Faucet.js'

import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init({
    once: false
});


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
