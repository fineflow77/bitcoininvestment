// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './pages/Home';
// import SimulatorPage from './pages/SimulatorPage'; // コメントアウト
// import PowerLawPage from './pages/PowerLawPage'; // コメントアウト

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/simulator" element={<SimulatorPage />} /> */} {/* コメントアウト */}
            {/* <Route path="/powerlaw" element={<PowerLawPage />} /> */}   {/* コメントアウト */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;