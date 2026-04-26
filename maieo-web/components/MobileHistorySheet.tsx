'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { DbDebate } from '@/lib/debates';

interface MobileHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewDebate: () => void;
  debates: DbDebate[];
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

export default function MobileHistorySheet({
  isOpen,
  onClose,
  activeId,
  onSelect,
  onDelete,
  onNewDebate,
  debates,
}: MobileHistorySheetProps) {

  const handleDelete = async (e: React.MouseEvent, debateId: string) => {
    e.stopPropagation()
    
    try {
      const response = await fetch(`/api/history/${debateId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        onDelete(debateId)
      } else {
        console.error('Failed to delete debate')
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] md:hidden"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 w-full h-[85vh] bg-surface rounded-t-3xl z-[70] md:hidden flex flex-col shadow-2xl"
          >
            {/* Drag Handle */}
            <div className="w-full py-4 flex justify-center items-center shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-border rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b border-border flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-text-primary">History</h2>
              <button onClick={onClose} className="p-2 -mr-2 text-text-secondary hover:text-text-primary rounded-full bg-black/5 dark:bg-white/5">
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-2 pb-[80px]">
              {debates.length === 0 ? (
                <div className="text-center text-text-secondary py-10">
                  No debates yet
                </div>
              ) : (
                <ul className="flex flex-col gap-2 mt-2">
                  {debates.map((debate) => {
                    const isActive = debate.id === activeId;
                    return (
                      <li
                        key={debate.id}
                        onClick={() => {
                          onSelect(debate.id);
                          onClose();
                        }}
                        className={`
                          group p-4 rounded-xl cursor-pointer transition-all border text-sm relative flex justify-between items-center
                          ${isActive 
                            ? 'border-accent bg-sidebar-hover text-text-primary' 
                            : 'border-border text-text-secondary bg-background'}
                        `}
                      >
                        <div className="flex-1 pr-4">
                          <div className="font-medium mb-1 text-text-primary line-clamp-2">
                            {debate.query}
                          </div>
                          <div className="text-xs opacity-60">
                            {timeAgo(debate.created_at)}
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => handleDelete(e, debate.id)}
                          className="p-2 text-text-secondary hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {debates.length > 0 && (
              <div className="absolute bottom-0 left-0 w-full p-4 border-t border-border bg-surface shrink-0 pb-safe">
                <button
                  onClick={() => {
                    onNewDebate();
                    onClose();
                  }}
                  className="w-full py-3 text-sm font-medium text-accent bg-accent/10 rounded-xl hover:bg-accent/20 transition-colors"
                >
                  Start New Debate
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
