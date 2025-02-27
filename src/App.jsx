import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './pages/Home';
import SimulatorPage from './pages/SimulatorPage';
import PowerLawPage from './pages/PowerLawPage';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/powerlaw" element={<PowerLawPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;