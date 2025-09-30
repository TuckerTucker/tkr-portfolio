import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Sparkles, ArrowLeft } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  const isOnDemos = location.pathname === '/demos';
  const isOnHome = location.pathname === '/';

  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">Tucker's Portfolio</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-3">
            {isOnDemos ? (
              <Link to="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back to</span> Portfolio
                </Button>
              </Link>
            ) : (
              <Link to="/demos">
                <Button className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">View</span> AI Demos
                </Button>
              </Link>
            )}

            {!isOnHome && (
              <Link to="/">
                <Button variant="ghost" size="icon" title="Home">
                  <Home className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;