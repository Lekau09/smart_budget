import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSearch } from '@fortawesome/free-solid-svg-icons';

export default function FixedHeader() {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md w-full">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              placeholder="Search transactions, goals..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 
                       rounded-full shadow-sm placeholder:text-gray-400
                       focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Profile Actions */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-50 rounded-full transition-colors">
              <FontAwesomeIcon icon={faBell} className="w-5 h-5 text-gray-600" />
              <span className="absolute top-0 right-0 w-5 h-5 bg-blue-500 text-white 
                           rounded-full text-xs flex items-center justify-center
                           border-2 border-white">
                3
              </span>
            </button>
            <button className="flex items-center gap-2 py-1.5 px-3 bg-blue-50 
                           text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
              <span className="text-sm font-medium">Student</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
