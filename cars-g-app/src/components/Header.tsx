import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Shield, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8" />
              <h1 className="text-xl font-bold">Cars-G</h1>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8 animate-fade-in">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-blue-700' : 'hover:bg-blue-700'
              }`}
            >
              Dashboard
            </Link>
            
            {userProfile?.role === 'patrol' && (
              <Link 
                to="/patrol" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/patrol') ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                Patrol
              </Link>
            )}
            
            {(userProfile?.role === 'admin' || userProfile?.role === 'superAdmin') && (
              <Link 
                to="/admin" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin') ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-medium">
                  {userProfile?.displayName || 'User'}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">
                    {userProfile?.role}
                  </span>
                  <span className="text-xs text-blue-200">
                    {userProfile?.points || 0} pts
                  </span>
                </div>
              </div>
              <div className="sm:hidden flex flex-col">
                <span className="text-xs font-medium">
                  {userProfile?.displayName?.split(' ')[0] || 'User'}
                </span>
                <span className="text-xs text-blue-200">
                  {userProfile?.points || 0} pts
                </span>
              </div>
            </div>
            
            <Link 
              to="/profile" 
              className="p-2 rounded-md hover:bg-blue-700 transition-colors"
              title="Profile"
            >
              <Settings className="h-5 w-5" />
            </Link>
            
            <button 
              onClick={logout}
              className="p-2 rounded-md hover:bg-blue-700 transition-colors"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
