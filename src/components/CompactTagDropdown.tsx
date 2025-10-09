"use client";
import React, { useState, useRef, useEffect } from 'react';
import { searchTags, getTopTags } from '../utils/popularTags';

interface CompactTagDropdownProps {
  promptId: string;
  tags: string[];
  onTagsUpdate: (newTags: string[]) => void;
  className?: string;
}

export default function CompactTagDropdown({ 
  promptId, 
  tags = [], 
  onTagsUpdate, 
  className = "" 
}: CompactTagDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ tag: string; count: number }>>([]);
  const [saving, setSaving] = useState(false);
  const [localTags, setLocalTags] = useState<string[]>(tags);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update local tags when props change
  useEffect(() => {
    setLocalTags(tags);
  }, [tags]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (isEditing) {
          handleSave();
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing, localTags]);

  // Update suggestions based on input
  useEffect(() => {
    if (newTag.trim()) {
      const searchResults = searchTags(newTag, 6);
      setSuggestions(searchResults.filter(({ tag }) => !localTags.includes(tag)));
    } else {
      const topTags = getTopTags(6);
      setSuggestions(topTags.filter(({ tag }) => !localTags.includes(tag)));
    }
  }, [newTag, localTags]);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setNewTag('');
  };

  const handleSave = async () => {
    if (saving) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/update-single-prompt-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId, tags: localTags }),
      });

      if (!response.ok) throw new Error('Failed to update tags');

      onTagsUpdate(localTags);
      setIsEditing(false);
      setNewTag('');
    } catch (error) {
      console.error('Error updating tags:', error);
      alert('Failed to update tags. Please try again.');
      setLocalTags(tags); // Revert on error
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalTags(tags);
    setIsEditing(false);
    setNewTag('');
  };

  const handleAddTag = (tagToAdd: string) => {
    if (tagToAdd && !localTags.includes(tagToAdd)) {
      setLocalTags([...localTags, tagToAdd]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setLocalTags(localTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newTag.trim()) {
        handleAddTag(newTag.trim());
      }
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Display the tag count and first few tags
  const displayText = localTags.length === 0 
    ? '—' 
    : localTags.length <= 2 
      ? localTags.join(', ')
      : `${localTags.slice(0, 2).join(', ')} +${localTags.length - 2}`;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={handleToggleDropdown}
        className="w-full text-left px-2 py-1 text-xs hover:bg-amber-50 rounded border-none bg-transparent transition-colors flex items-center justify-between min-h-[24px]"
        title={localTags.length > 0 ? `Tags: ${localTags.join(', ')}` : 'No tags - click to add'}
      >
        <span className={localTags.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
          {displayText}
        </span>
        <svg 
          className={`w-3 h-3 text-gray-400 transition-transform ml-1 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[200px]">
          {/* Current Tags */}
          {localTags.length > 0 && (
            <div className="p-2 border-b border-gray-200">
              <div className="text-xs font-medium text-gray-600 mb-1">Current Tags:</div>
              <div className="flex flex-wrap gap-1">
                {localTags.map((tag) => (
                  <span 
                    key={tag}
                    className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium flex items-center"
                  >
                    {tag}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-amber-600 hover:text-red-600 font-bold text-xs"
                        title="Remove tag"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Edit Controls */}
          {isEditing ? (
            <div className="p-2">
              <input
                ref={inputRef}
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type to add tags..."
                className="w-full px-2 py-1 text-xs border border-amber-300 rounded focus:outline-none focus:border-amber-500 mb-2"
                disabled={saving}
              />

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-2 max-h-20 overflow-y-auto">
                  <div className="text-xs text-gray-500 mb-1">Suggestions:</div>
                  <div className="flex flex-wrap gap-1">
                    {suggestions.slice(0, 6).map(({ tag, count }) => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-amber-100 rounded transition-colors"
                        title={`Used ${count} times`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors flex-1"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:bg-gray-400 transition-colors flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2">
              <button
                onClick={handleStartEdit}
                className="w-full px-2 py-1 text-xs text-amber-700 hover:bg-amber-50 rounded transition-colors text-center"
              >
                {localTags.length === 0 ? '+ Add Tags' : 'Edit Tags'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}