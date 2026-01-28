'use client';

import { useState, useRef, useEffect } from 'react';
import type { Option, MultiSelectFilterProps } from '@/types/filter';

export default function MultiSelectFilter({ 
  label, 
  options, 
  selectedValues, 
  onChange,
  mode = 'multiple'
}: MultiSelectFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = (value: string) => {
    if (mode === 'single') {
      onChange([value]);
      setIsOpen(false);
    } else {
      if (selectedValues.includes(value)) {
        onChange(selectedValues.filter(v => v !== value));
      } else {
        onChange([...selectedValues, value]);
      }
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  const displayLabel = mode === 'single' && selectedValues.length > 0
    ? options.find(opt => opt.value === selectedValues[0])?.label || label
    : label;

  return (
    <div className="flex-shrink-0 min-w-[200px] md:min-w-0 md:flex-1">
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-2 bg-white border-2 border-black rounded-full font-semibold text-black hover:text-white hover:border-primary hover:bg-primary transition-colors focus:outline-none focus:ring-4 focus:ring-red-600 flex items-center justify-between"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className='flex items-center justify-center'>
            {displayLabel}
            {mode === 'multiple' && selectedValues.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-primary text-white rounded-full text-xs">
                {selectedValues.length}
              </span>
            )}
          </span>
          <svg 
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={2} 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div 
            className="absolute z-50 w-full mt-2 bg-white border-2 border-primary rounded-lg shadow-lg max-h-64 overflow-y-auto"
            role="listbox"
            aria-label={`Options pour ${label}`}
          >
            {mode === 'multiple' && selectedValues.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-600 hover:text-white font-semibold border-b border-gray-200"
              >
                  <span className="text-sm font-medium">Effacer tout</span>
              </button>
            )}
            
            {options.map(option => {
              const isSelected = selectedValues.includes(option.value);
              
              if (mode === 'single') {
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleToggle(option.value)}
                    className={`w-full flex items-center justify-between px-4 py-2 hover:bg-primary hover:text-white cursor-pointer transition-colors text-left ${
                      isSelected ? 'bg-primary text-white' : ''
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className={`text-sm font-medium`}>{option.label}</span>
                  </button>
                );
              }
              
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-primary hover:text-white cursor-pointer transition-colors"
                  role="option"
                  aria-selected={isSelected}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(option.value)}
                    className="w-5 h-5 min-w-[20px] min-h-[20px] flex-shrink-0 text-primary border-gray-300 rounded accent-primary focus:outline-none focus:ring-4 focus:ring-red-600"
                  />
                  <span className="text-sm flex-1">{option.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
