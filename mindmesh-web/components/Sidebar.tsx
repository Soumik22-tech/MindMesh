'use client';

import { Plus, Trash2, Search, Settings, ChevronLeft, ChevronRight, Moon, Sun, Monitor, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { DbDebate } from '@/lib/debates';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewDebate: () => void;
  debates: DbDebate[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function Sidebar({ 
  isOpen, 
  onClose, 
  activeId, 
  onSelect, 
  onDelete,
  onNewDebate, 
  debates,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    setMounted(true);
    // Close menus when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.settings-menu-container')) {
        setShowSettings(false);
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async (e: React.MouseEvent, debateId: string) => {
    e.stopPropagation() // prevent triggering debate selection
    
    try {
      const response = await fetch(`/api/history/${debateId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        // Remove from local state immediately (optimistic update)
        onDelete(debateId)
      } else {
        console.error('Failed to delete debate')
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  const filteredHistory = debates.filter(debate => 
    debate.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Backdrop for tablet */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={`
          hidden md:flex flex-col justify-between z-[60] shrink-0
          bg-sidebar-bg border-r border-sidebar-border h-full
          fixed top-0 left-0 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'md:w-[70px]' : 'md:w-[280px] lg:w-[260px]'}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden p-4">
        {/* Logo & Collapse Toggle */}
        <div className={`flex items-center mb-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center overflow-hidden">
            {!isCollapsed ? (
              <span className="text-xl font-bold tracking-tight whitespace-nowrap">
                <span className="text-white">Mind</span>
                <span className="text-[#7C6AF7]">Mesh</span>
                <span className="text-[#a78bfa] text-sm ml-2">AI</span>
              </span>
            ) : (
              <span className="text-xl font-bold text-[#7C6AF7]">M.</span>
            )}
          </div>
          
          <button 
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-sidebar-hover text-text-secondary transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* New Debate Button */}
        <div className="mb-4">
          <button
            onClick={() => {
              onNewDebate();
              onClose();
            }}
            className={`
              w-full bg-accent hover:bg-accent/90 text-white rounded-xl py-3 px-4 flex items-center gap-2 text-sm font-medium transition-all
              ${isCollapsed ? 'justify-center p-0 h-10 w-10 mx-auto rounded-full' : 'justify-center'}
            `}
            title="New Debate"
          >
            <Plus size={18} />
            {!isCollapsed && <span>New Debate</span>}
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
            <input 
              type="text"
              placeholder="Search debates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface/50 border border-border rounded-lg py-2 pl-9 pr-3 text-xs text-text-primary outline-none focus:border-accent transition-colors"
            />
          </div>
        )}

        {/* History List */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-thin">
          {!isCollapsed && (
            <>
              {filteredHistory.length === 0 ? (
                <div className="text-xs text-text-secondary text-center mt-4 italic">
                  {searchQuery ? 'No matches found' : 'No debates yet'}
                </div>
              ) : (
                <motion.ul 
                  className="flex flex-col gap-1"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredHistory.map((debate) => {
                    const isActive = debate.id === activeId;
                    return (
                      <motion.li
                        key={debate.id}
                        variants={itemVariants}
                        onClick={() => handleSelect(debate.id)}
                        className={`
                          group p-3 rounded-lg cursor-pointer transition-all border-l-2 text-sm relative
                          ${isActive 
                            ? 'border-accent bg-sidebar-hover text-text-primary' 
                            : 'border-transparent text-text-secondary hover:bg-sidebar-hover hover:text-text-primary'}
                        `}
                      >
                        <div className="font-medium mb-1 pr-6 truncate" title={debate.query}>
                          {debate.query}
                        </div>
                        <div className="text-[10px] opacity-60">
                          {timeAgo(debate.created_at)}
                        </div>
                        
                        <button
                          onClick={(e) => handleDelete(e, debate.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all p-1"
                          title="Delete debate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </>
          )}
        </div>

        {/* Bottom Section: Settings & Theme */}
        <div className="mt-auto pt-4 border-t border-sidebar-border relative settings-menu-container">
          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`
                  absolute bottom-full left-0 mb-2 bg-surface border border-border rounded-xl shadow-xl z-[70] overflow-hidden
                  ${isCollapsed ? 'left-4 w-48' : 'w-full'}
                `}
              >
                {!showThemeMenu ? (
                  <div className="p-1.5">
                    <button
                      onClick={() => setShowThemeMenu(true)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-sidebar-hover text-text-secondary hover:text-text-primary transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Sun size={18} />
                        <span className="text-sm font-medium">Theme</span>
                      </div>
                      <ChevronRight size={14} />
                    </button>
                    {/* Placeholder for future settings */}
                    <div className="mt-1 pt-1 border-t border-border opacity-50 px-2.5 py-2">
                       <p className="text-[10px] uppercase tracking-wider font-bold">More coming soon</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-1.5">
                    <div className="flex items-center gap-2 px-2.5 py-2 mb-1 border-b border-border">
                       <button onClick={() => setShowThemeMenu(false)} className="p-1 hover:bg-sidebar-hover rounded text-text-secondary">
                          <ChevronLeft size={14} />
                       </button>
                       <span className="text-xs font-bold uppercase tracking-wider">Select Theme</span>
                    </div>
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          setTheme(mode.id);
                          setShowSettings(false);
                          setShowThemeMenu(false);
                        }}
                        className={`
                          w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-sidebar-hover transition-all
                          ${theme === mode.id ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <mode.icon size={18} />
                          <span className="text-sm font-medium">{mode.label}</span>
                        </div>
                        {theme === mode.id && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => {
              setShowSettings(!showSettings);
              setShowThemeMenu(false);
            }}
            className={`
              w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-hover text-text-secondary hover:text-text-primary transition-all
              ${isCollapsed ? 'justify-center' : ''}
              ${showSettings ? 'bg-sidebar-hover text-text-primary' : ''}
            `}
            title="Settings"
          >
            <Settings size={18} />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </button>
          
          {/* User Section */}
          <div className={`mt-2 flex items-center gap-3 p-2 rounded-xl transition-all ${isCollapsed ? 'justify-center' : 'bg-surface/30 border border-border/30'}`}>
            <UserButton />
            {!isCollapsed && isLoaded && user && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-medium text-text-primary truncate">Hi, {user.firstName || 'User'}</span>
                <span className="text-[10px] text-text-secondary truncate">{user.primaryEmailAddress?.emailAddress}</span>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <div className="text-[10px] text-text-secondary text-center mt-4 opacity-60 leading-relaxed">
              <p>Developed by Soumik Majumder</p>
              <p>Copyright © 2026 MindMesh AI. All rights reserved.</p>
            </div>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}
