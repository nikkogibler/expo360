"use client";
import React, { useState, useRef, useEffect } from 'react';
import { searchTags, getTopTagsByCategory, getTopTags } from '../utils/popularTags';

interface SmartTagSelectorProps {
  selectedTag: string;
  onTagChange: (tag: string) => void;
  allTags?: string[]; // Tags from database
  className?: string;
}

export default function SmartTagSelector({ 
  selectedTag, 
  onTagChange, 
  allTags = [], 
  className = "" 
}: SmartTagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'popular' | 'categories' | 'all' | 'search'>('popular');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      setViewMode('search');
    } else {
      setViewMode('popular');
    }
  };

  // Handle tag selection
  const handleTagSelect = (tag: string) => {
    onTagChange(tag);
    setIsOpen(false);
    setSearchQuery('');
    setViewMode('popular');
  };

  // Clear selection
  const handleClear = () => {
    onTagChange('');
    setIsOpen(false);
    setSearchQuery('');
    setViewMode('popular');
  };

  // Get tags to display based on current view mode
  const getDisplayTags = () => {
    switch (viewMode) {
      case 'search':
        return searchTags(searchQuery, 15);
      case 'popular':
        return getTopTags(20);
      case 'categories':
        return getTopTagsByCategory(3);
      case 'all':
        return allTags.map(tag => ({ tag, count: 0 })); // Database tags without counts
      default:
        return getTopTags(20);
    }
  };

  const renderCategorizedTags = (categorizedTags: { [category: string]: Array<{ tag: string; count: number }> }) => {
    return Object.entries(categorizedTags).map(([category, tags]) => (
      <div key={category} className="mb-3">
        <div className="text-xs font-semibold text-gray-600 mb-1 px-2 border-b border-gray-200 pb-1">
          {category}
        </div>
        <div className="space-y-1">
          {tags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => handleTagSelect(tag)}
              className="w-full text-left px-2 py-1 text-sm hover:bg-amber-50 rounded flex justify-between items-center group"
            >
              <span className="truncate">{tag}</span>
              {count > 0 && (
                <span className="text-xs text-gray-400 ml-2 group-hover:text-amber-600">
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    ));
  };

  const renderSimpleTags = (tags: Array<{ tag: string; count: number }>) => {
    return tags.map(({ tag, count }) => (
      <button
        key={tag}
        onClick={() => handleTagSelect(tag)}
        className="w-full text-left px-3 py-2 text-sm hover:bg-amber-50 rounded flex justify-between items-center group border-b border-gray-100 last:border-b-0"
      >
        <span className="truncate">{tag}</span>
        {count > 0 && (
          <span className="text-xs text-gray-400 ml-2 group-hover:text-amber-600 font-medium">
            ({count})
          </span>
        )}
      </button>
    ));
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Main Input/Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left border rounded px-3 py-2 text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-200 flex justify-between items-center"
          style={{ borderColor: 'rgba(140,108,94,0.7)', minWidth: '180px' }}
        >
          <span className={selectedTag ? 'text-black' : 'text-gray-500'}>
            {selectedTag || 'Select tag...'}
          </span>
          <div className="flex items-center space-x-1">
            {selectedTag && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-gray-400 hover:text-gray-600 text-xs p-1"
                title="Clear selection"
              >
                ✕
              </button>
            )}
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* View Mode Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setViewMode('popular')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                viewMode === 'popular' 
                  ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-400' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setViewMode('categories')}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                viewMode === 'categories' 
                  ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-400' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Categories
            </button>
            {allTags.length > 0 && (
              <button
                onClick={() => setViewMode('all')}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  viewMode === 'all' 
                    ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-400' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                All ({allTags.length})
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {/* Clear Option */}
            <button
              onClick={handleClear}
              className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-100 italic"
            >
              Show all (clear filter)
            </button>

            {/* Tags */}
            {viewMode === 'categories' ? (
              <div className="p-2">
                {renderCategorizedTags(getDisplayTags() as { [category: string]: Array<{ tag: string; count: number }> })}
              </div>
            ) : (
              <div>
                {renderSimpleTags(getDisplayTags() as Array<{ tag: string; count: number }>)}
              </div>
            )}

            {/* No results message */}
            {viewMode === 'search' && searchQuery && (getDisplayTags() as Array<{ tag: string; count: number }>).length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No tags found for &quot;{searchQuery}&quot;
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            {viewMode === 'popular' && 'Showing most frequently used tags'}
            {viewMode === 'categories' && 'Tags organized by category'}
            {viewMode === 'all' && `Showing all ${allTags.length} database tags`}
            {viewMode === 'search' && `Found ${(getDisplayTags() as Array<{ tag: string; count: number }>).length} matching tags`}
          </div>
        </div>
      )}
    </div>
  );
}