import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-800 shadow-lg">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-white">
            ビットコイン長期投資シミュレーター
          </Link>
          <div className="flex space-x-4">
            <Link to="/simulator" className="text-gray-300 hover:text-white">
              シミュレーター
            </Link>
            <Link to="/powerlaw" className="text-gray-300 hover:text-white">
              パワーロー解説
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;