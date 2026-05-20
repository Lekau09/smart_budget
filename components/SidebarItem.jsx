import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function SidebarItem({ icon, label, isActive, badge, onClick, isCollapsed }) {
  return (
    <button
      onClick={onClick}
      title={isCollapsed ? label : undefined}
      className={`
        w-full flex items-center gap-4 px-4 py-3 my-0.5
        rounded-xl transition-all duration-300 ease-in-out
        ${isActive 
          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm' 
          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
        }
        ${isCollapsed ? 'justify-center' : ''}
        hover:scale-[0.98] active:scale-[0.97]
      `}
    >
      <FontAwesomeIcon 
        icon={icon} 
        className={`
          w-5 h-5 transition-transform
          ${isCollapsed ? 'transform hover:scale-110' : ''}
        `} 
      />
      {!isCollapsed && (
        <span className="flex-1 text-left font-medium whitespace-nowrap">
          {label}
        </span>
      )}
      {!isCollapsed && badge && (
        <span className={`
          px-2.5 py-0.5 text-xs rounded-full font-medium
          ${isActive 
            ? 'bg-white/20 text-white' 
            : 'bg-blue-100 text-blue-600'
          }
        `}>
          {badge}
        </span>
      )}
    </button>
  );
}
