// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './pages/Home';
import SimulatorPage from './pages/SimulatorPage';
import PowerLawPage from './pages/PowerLawPage';

const App = () => {
  return (
    <Router>
      <Header /> {/* Header は Routes の外側 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/simulator" element={<SimulatorPage />} />
        <Route path="/powerlaw" element={<PowerLawPage />} />
      </Routes>
    </Router>
  );
};

export default App;