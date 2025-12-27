import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-stone-900 to-amber-900 text-white py-6 shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
        <div className="logo">
          <Link to="/" className="flex items-center group">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center mr-4 shadow-xl group-hover:scale-110 transition-transform duration-300">
              <svg className="w-8 h-8 text-stone-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-stone-50 group-hover:text-amber-300 transition-colors duration-300">Sri Lankan Law AI</h1>
              <div className="w-20 h-0.5 bg-gradient-to-r from-amber-400 to-transparent mt-1"></div>
            </div>
          </Link>
        </div>
        <nav className="nav">
          <ul className="flex items-center space-x-4 list-none">
            <li>
              <Link to="/" className="text-stone-50 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:text-amber-300 hover:bg-white hover:bg-opacity-15 block">
                Home
              </Link>
            </li>
            <li>
              <Link to="/search" className="text-stone-50 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:text-amber-300 hover:bg-white hover:bg-opacity-15 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </Link>
            </li>
            <li>
              <Link to="/upload" className="text-stone-50 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:text-amber-300 hover:bg-white hover:bg-opacity-15 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-stone-50 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:text-amber-300 hover:bg-white hover:bg-opacity-15 block">
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;