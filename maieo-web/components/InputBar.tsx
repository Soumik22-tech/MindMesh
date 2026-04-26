'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Square } from 'lucide-react';

interface InputBarProps {
  onSubmit: (query: string) => void;
  onStop?: () => void;
  disabled: boolean;
  isDebating?: boolean;
  placeholder?: string;
}

export default function InputBar({
  onSubmit,
  onStop,
  disabled,
  isDebating = false,
  placeholder = 'Enter a topic to debate...',
}: InputBarProps) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const scrollHeight = el.scrollHeight;
    const maxHeight = 200;
    el.style.height = `${Math.min(Math.max(scrollHeight, 44), maxHeight)}px`;
    el.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    autoResize();
  }, [query, autoResize]);

  // Cmd/Ctrl + K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = () => {
    if (!disabled && query.trim()) {
      onSubmit(query.trim());
      setQuery('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '44px';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full px-4 py-2">
      <div
        className="max-w-[760px] mx-auto bg-[#1a1a1a] border border-[#333333] rounded-[16px] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(124,106,247,0.15)] transition-all duration-300 hover:border-[#7c6af7]/50 hover:shadow-[0_8px_40px_rgba(124,106,247,0.2)] group"
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-end gap-3">
            <textarea
              ref={textareaRef}
              rows={1}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isDebating ? 'Debate in progress...' : placeholder}
              disabled={disabled}
              maxLength={500}
              className="flex-1 bg-transparent border-none py-2 px-1 text-text-primary placeholder-gray-600 outline-none disabled:opacity-50 resize-none overflow-hidden leading-relaxed text-base"
              style={{ minHeight: '44px', maxHeight: '200px' }}
            />

            {/* Stop button — shown while debate is running */}
            {isDebating ? (
              <button
                onClick={onStop}
                className="bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-xl py-2.5 px-5 font-medium transition-all flex items-center gap-2 text-sm shrink-0 mb-1 shadow-[0_0_16px_rgba(239,68,68,0.3)]"
              >
                <Square size={14} fill="currentColor" />
                Stop
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={disabled || !query.trim()}
                className="bg-accent text-white rounded-xl py-2.5 px-5 font-medium transition-all hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-sm shrink-0 mb-1"
              >
                Start Debate
              </button>
            )}
          </div>

          {/* Hints Row */}
          <div className="flex justify-between items-center px-1 border-t border-[#333333]/50 pt-2 opacity-60 group-focus-within:opacity-100 transition-opacity">
            <div className="flex items-center gap-3 text-[10px] text-text-secondary uppercase tracking-wider font-semibold">
              <span className="hidden md:flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-[#2a2a2a] border border-[#444] font-mono text-[9px]">⌘ K</kbd>
                <span>to focus</span>
              </span>
              <span>Shift+Enter for new line</span>
            </div>
            {query.length > 0 && (
              <span className={`text-[10px] font-mono ${query.length > 400 ? 'text-[#ef4444]' : 'text-text-secondary'}`}>
                {query.length} / 500
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
