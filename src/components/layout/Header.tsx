import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Info } from 'lucide-react'; // Wallet アイコンは不要なので削除
import { useMediaQuery } from '../../hooks/useMediaQuery';

const colors = {
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    muted: 'text-gray-400',
  },
  infoLink: 'text-gray-300 hover:text-white',
  border: 'border-[#2c333e]',
  focus: 'focus:outline-none focus:ring-1 focus:ring-gray-500',
};

const Header: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="bg-[#1a202c] shadow-md sticky top-0 z-50 border-b border-[#2c333e]">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <NavLink
          to="/"
          className="flex items-center hover:opacity-90 transition-opacity"
          aria-label="ビットコイン長期投資ナビ - ホームページへ"
        >
          <div className="text-xl font-bold">
            <span className="bg-gradient-to-r from-[#4795EA] to-[#42D392] bg-clip-text text-transparent">
              ビットコイン長期投資ナビ
            </span>
          </div>
        </NavLink>

        {isMobile ? (
          <div className="relative">
            <button
              onClick={toggleMobileMenu}
              className="text-white p-2 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500"
              aria-label={isMobileMenuOpen ? "メニューを閉じる" : "メニューを開く"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {isMobileMenuOpen && (
              <nav className="absolute right-0 mt-2 bg-[#1a202c] rounded-md shadow-md w-64 z-50 overflow-hidden border border-[#2c333e] animate-fadeIn">
                <NavLink
                  to="/power-law-explanation"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 hover:bg-[#2c333e] transition-colors ${isActive ? 'bg-[#2c333e] text-amber-400 font-medium' : 'text-gray-200'}` // アクティブ時のスタイルを調整
                  }
                >
                  <Info className="h-4 w-4 mr-3" /> {/* アイコンの色は調整不要 */}
                  <span className="text-sm">パワーロー解説</span>
                </NavLink>
              </nav>
            )}
          </div>
        ) : (
          <nav>
            <NavLink
              to="/power-law-explanation"
              className={({ isActive }) =>
                `${colors.infoLink} transition-colors px-2 py-1 text-sm flex items-center ${isActive ? 'text-amber-400 font-medium' : ''}`
              }
            >
              <Info className="h-4 w-4 mr-2" />
              <span>パワーロー解説</span>
            </NavLink>
          </nav>
        )}
      </div>
    </header>
  );
};

const globalStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out forwards;
}
`;

const styleElement = document.createElement('style');
styleElement.textContent = globalStyles;
document.head.appendChild(styleElement);

export default Header;