"use client";
import React, { useState, useRef, useEffect } from 'react';
import { searchTags, getTopTags } from '../utils/popularTags';

interface InlineTagEditorProps {
  promptId: string;
  initialTags: string[];
  onTagsUpdate: (newTags: string[]) => void;
  className?: string;
}

export default function InlineTagEditor({ 
  promptId, 
  initialTags, 
  onTagsUpdate, 
  className = "" 
}: InlineTagEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ tag: string; count: number }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close editor when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        handleSave();
      }
    }

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing, tags]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Update suggestions based on input
  useEffect(() => {
    if (newTag.trim()) {
      const searchResults = searchTags(newTag, 8);
      // Filter out already selected tags
      const filteredResults = searchResults.filter(({ tag }) => !tags.includes(tag));
      setSuggestions(filteredResults);
      setShowSuggestions(filteredResults.length > 0);
    } else {
      const topTags = getTopTags(8);
      const filteredTags = topTags.filter(({ tag }) => !tags.includes(tag));
      setSuggestions(filteredTags);
      setShowSuggestions(false);
    }
  }, [newTag, tags]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setTags(initialTags);
  };

  const handleSave = async () => {
    if (saving) return;
    
    setSaving(true);
    try {
      // Call API to update tags
      const response = await fetch('/api/update-single-prompt-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId,
          tags: tags
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tags');
      }

      // Update parent component
      onTagsUpdate(tags);
      setIsEditing(false);
      setNewTag('');
    } catch (error) {
      console.error('Error updating tags:', error);
      alert('Failed to update tags. Please try again.');
      // Revert to initial tags on error
      setTags(initialTags);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTags(initialTags);
    setIsEditing(false);
    setNewTag('');
  };

  const handleAddTag = (tagToAdd: string) => {
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
      setNewTag('');
      setShowSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newTag.trim()) {
        handleAddTag(newTag.trim());
      } else {
        handleSave();
      }
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    // Display mode - clickable tags
    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {tags && tags.length > 0 ? (
          <>
            {tags.map((tag: string) => (
              <span 
                key={tag} 
                className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold cursor-pointer hover:bg-amber-200 transition-colors"
                onClick={handleStartEdit}
                title="Click to edit tags"
              >
                {tag}
              </span>
            ))}
            <button
              onClick={handleStartEdit}
              className="text-amber-600 hover:text-amber-800 text-xs px-2 py-1 border border-amber-300 rounded hover:bg-amber-50 transition-colors"
              title="Add/edit tags"
            >
              + Edit
            </button>
          </>
        ) : (
          <button
            onClick={handleStartEdit}
            className="text-gray-400 hover:text-amber-600 text-xs px-2 py-1 border border-gray-300 rounded hover:bg-amber-50 transition-colors"
            title="Add tags"
          >
            + Add tags
          </button>
        )}
      </div>
    );
  }

  // Edit mode
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Current tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag) => (
          <span 
            key={tag}
            className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold flex items-center"
          >
            {tag}
            <button
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 text-amber-600 hover:text-red-600 font-bold"
              title="Remove tag"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {/* Input for new tags */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Type to add tags..."
          className="w-full px-2 py-1 text-xs border border-amber-300 rounded focus:outline-none focus:border-amber-500"
          disabled={saving}
        />

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-50 max-h-32 overflow-y-auto">
            {suggestions.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => handleAddTag(tag)}
                className="w-full text-left px-2 py-1 text-xs hover:bg-amber-50 flex justify-between items-center"
              >
                <span>{tag}</span>
                {count > 0 && <span className="text-gray-400">({count})</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-1 mt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:bg-gray-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}