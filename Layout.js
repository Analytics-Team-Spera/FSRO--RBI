import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaChartLine, FaProjectDiagram, FaExclamationTriangle, 
  FaFileAlt, FaCog, FaSignOutAlt, FaBars, FaTimes,
  FaHome
} from 'react-icons/fa';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/forecasts', label: 'Forecasts', icon: FaChartLine },
    { path: '/scenarios', label: 'Scenarios (What-If)', icon: FaProjectDiagram },
    { path: '/anomalies', label: 'Anomalies & Alerts', icon: FaExclamationTriangle },
    { path: '/reports', label: 'Reports', icon: FaFileAlt },
    { path: '/settings', label: 'Settings', icon: FaCog },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-[#003366] to-[#0066CC] text-white shadow-lg sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
            
            <div className="flex items-center gap-3">
              <img 
                src="https://i0.wp.com/logotaglines.com/wp-content/uploads/2021/06/Reserve-Bank-of-India-RBI-Tagline-Slogan-punchline-motto.png?fit=640%2C404&ssl=1"
                alt="RBI Logo" 
                className="h-12 w-15 bg-black rounded-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0Ij48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMCIgZmlsbD0iIzAwMzM2NiIvPjx0ZXh0IHg9IjMyIiB5PSIzOCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlJCSTwvdGV4dD48L3N2Zz4=';
                }}
              />
              <div>
                <h1 className="text-xl font-bold">FSRO</h1>
                <p className="text-xs text-blue-200">Financial System Risk Observatory</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-blue-200">{user?.department}</p>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? 'w-64' : 'w-0'}
            bg-white shadow-xl transition-all duration-300 overflow-hidden flex-shrink-0
            h-[calc(100vh-72px)] sticky top-[72px] flex flex-col
          `}
        >
          <nav className="p-4 flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                        ${isActive 
                          ? 'bg-[#003366] text-white shadow-md' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer in Sidebar - Only on left side */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-500">Powered by</p>
                <p className="text-sm font-semibold text-[#003366]">Spera Digital</p>
              </div>
              <img 
                src="https://framerusercontent.com/images/9dKpCm0HntV6vMkd68Slv4ZBb5A.png?width=400&height=370"
                alt="Spera Digital" 
                className="h-10 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto min-h-[calc(100vh-72px)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
