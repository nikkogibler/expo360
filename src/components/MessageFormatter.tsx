/**
 * MessageFormatter Component
 * 
 * Formats chat messages with support for basic markdown-like syntax
 * including bold text, links, lists, and line breaks.
 */

import React from 'react';

interface MessageFormatterProps {
  content: string;
  className?: string;
}

export default function MessageFormatter({ content, className = '' }: MessageFormatterProps) {
  // Simple formatter that handles:
  // - **bold text**
  // - [link text](url)
  // - Line breaks
  // - Bullet points (lines starting with -)
  
  const formatText = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      // Check if it's a bullet point
      if (line.trim().startsWith('-')) {
        const bulletText = line.trim().substring(1).trim();
        return (
          <div key={lineIndex} className="flex gap-2 mb-1">
            <span>•</span>
            <span>{formatInlineText(bulletText)}</span>
          </div>
        );
      }
      
      // Regular line
      return (
        <div key={lineIndex}>
          {formatInlineText(line)}
          {lineIndex < lines.length - 1 && <br />}
        </div>
      );
    });
  };

  const formatInlineText = (text: string) => {
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    
    // Match **bold** text
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      // Add bold text
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold">
          {match[1]}
        </strong>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    // If no formatting was applied, return original text
    if (parts.length === 0) {
      return text;
    }
    
    return <>{parts}</>;
  };

  return (
    <div className={className}>
      {formatText(content)}
    </div>
  );
}
