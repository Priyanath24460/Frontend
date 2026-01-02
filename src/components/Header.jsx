import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-stone-900/95 backdrop-blur-md shadow-2xl py-3' 
        : 'bg-gradient-to-r from-stone-900 via-stone-900/95 to-amber-900/90 backdrop-blur-sm py-5'
    }`}>
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400"></div>
      
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center group">
            {/* Brand Name */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent group-hover:from-amber-200 group-hover:via-orange-200 group-hover:to-amber-300 transition-all duration-300">
                  Law
                </span>
                <span className="text-white group-hover:text-amber-100 transition-colors duration-300">
                  Know
                </span>
              </h1>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-2 list-none">
              <li>
                <Link 
                  to="/" 
                  className={`relative px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center ${
                    isActive('/') 
                      ? 'text-amber-400 bg-amber-400/10' 
                      : 'text-stone-50 hover:text-amber-300 hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Home
                  {isActive('/') && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
                  )}
                </Link>
              </li>
              <li>
                <Link 
                  to="/search" 
                  className={`relative px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center ${
                    isActive('/search') 
                      ? 'text-amber-400 bg-amber-400/10' 
                      : 'text-stone-50 hover:text-amber-300 hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Legal Research
                  {isActive('/search') && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
                  )}
                </Link>
              </li>
              <li>
                <Link 
                  to="/upload" 
                  className={`relative px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center ${
                    isActive('/upload') 
                      ? 'text-amber-400 bg-amber-400/10' 
                      : 'text-stone-50 hover:text-amber-300 hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Documents
                  {isActive('/upload') && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
                  )}
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className={`relative px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center ${
                    isActive('/about') 
                      ? 'text-amber-400 bg-amber-400/10' 
                      : 'text-stone-50 hover:text-amber-300 hover:bg-white/10'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About
                  {isActive('/about') && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400"></div>
                  )}
                </Link>
              </li>
              
              {/* CTA Button */}
              <li className="ml-4">
                <Link 
                  to="/search" 
                  className="bg-gradient-to-r from-amber-400 to-orange-400 text-stone-900 px-6 py-2.5 rounded-lg font-bold text-sm hover:from-amber-300 hover:to-orange-300 transition-all duration-300 shadow-lg hover:shadow-amber-400/50 hover:-translate-y-0.5 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Research
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Decorative Bottom Shadow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"></div>
    </header>
  );
};

export default Header;