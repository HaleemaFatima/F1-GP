import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flag, User, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-f1-dark/95 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-f1-red p-2 rounded-lg group-hover:bg-red-600 transition-colors">
              <img src="/Screenshot%202025-09-22%20221019.png" alt="F1 Logo" className="h-6 w-6" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-display font-semibold text-white">
                F1 Tickets
              </h1>
              <p className="text-xs text-f1-gray -mt-1">Premium Experience</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/events" active={location.pathname === '/events'}>
              Events
            </NavLink>
            <NavLink to="/my-orders" active={location.pathname === '/my-orders'}>
              My Orders
            </NavLink>
            <NavLink to="/admin" active={location.pathname === '/admin'}>
              Admin
            </NavLink>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors focus-visible">
              <User className="h-5 w-5 text-f1-gray hover:text-white" />
            </button>
            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors focus-visible md:hidden">
              <Settings className="h-5 w-5 text-f1-gray hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-f1-dark border-t border-white/10">
        <div className="px-4 py-2 space-x-4 flex">
          <NavLink to="/events" active={location.pathname === '/events'} mobile>
            Events
          </NavLink>
          <NavLink to="/my-orders" active={location.pathname === '/my-orders'} mobile>
            Orders
          </NavLink>
          <NavLink to="/admin" active={location.pathname === '/admin'} mobile>
            Admin
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  active: boolean;
  children: React.ReactNode;
  mobile?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, active, children, mobile }) => (
  <Link
    to={to}
    className={`${
      mobile ? 'text-sm py-2' : 'text-base'
    } font-medium transition-colors focus-visible ${
      active 
        ? 'text-f1-red' 
        : 'text-f1-gray hover:text-white'
    }`}
  >
    {children}
  </Link>
);