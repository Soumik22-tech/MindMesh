'use client';

import { DebateStatus } from '@/types/debate';
import { Brain, Swords, Scale, Sparkles, Check, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface AgentStatusProps {
  status: DebateStatus;
  query?: string;
  onOpenSidebar?: () => void;
}

const stages = [
  { id: 'proposing', label: 'Proposer', icon: Brain, color: '#7c6af7', bgClass: 'bg-[#7c6af7]' },
  { id: 'challenging', label: 'Challenger', icon: Swords, color: '#ef4444', bgClass: 'bg-[#ef4444]' },
  { id: 'arbitrating', label: 'Arbitrator', icon: Scale, color: '#f59e0b', bgClass: 'bg-[#f59e0b]' },
  { id: 'synthesizing', label: 'Synthesizer', icon: Sparkles, color: '#10b981', bgClass: 'bg-[#10b981]' },
];

export default function AgentStatus({ status, query, onOpenSidebar }: AgentStatusProps) {
  let currentIndex = -1;
  if (status === 'proposing') currentIndex = 0;
  if (status === 'challenging') currentIndex = 1;
  if (status === 'arbitrating') currentIndex = 2;
  if (status === 'synthesizing') currentIndex = 3;
  if (status === 'complete') currentIndex = 4;

  const getMobileStatusText = () => {
    if (status === 'idle') return 'Ready';
    if (status === 'complete') return 'Debate Complete';
    if (status === 'error') return 'Error';
    if (currentIndex >= 0 && currentIndex < 4) return `${stages[currentIndex].label} active...`;
    return 'Processing...';
  };

  const getProgressStyles = () => {
    let width = '0%';
    let color = '#7c6af7'; // Default to purple

    if (status === 'proposing') { width = '25%'; color = '#7c6af7'; }
    if (status === 'challenging') { width = '50%'; color = '#ef4444'; }
    if (status === 'arbitrating') { width = '75%'; color = '#f59e0b'; }
    if (status === 'synthesizing' || status === 'complete') { width = '100%'; color = '#10b981'; }

    return { width, backgroundColor: color };
  };

  return (
    <header className="relative flex flex-col w-full bg-background border-b border-border z-10 shrink-0">
      <div className="h-[52px] md:h-[56px] lg:h-[64px] flex items-center justify-between px-4 lg:px-6 w-full">
        
        {/* Tablet Hamburger */}
        <div className="hidden md:flex lg:hidden items-center shrink-0 mr-4">
          <button onClick={onOpenSidebar} className="p-2 -ml-2 text-text-secondary hover:text-text-primary rounded-lg transition-colors">
            <Menu size={20} />
          </button>
        </div>

        {/* Mobile View: Shows Title + Status */}
        <div className="md:hidden flex-1 flex flex-col items-center justify-center overflow-hidden px-2">
           <span className="text-sm font-semibold text-text-primary truncate w-full text-center leading-tight">
             {query || 'New Debate'}
           </span>
           <div className="flex items-center gap-1.5 mt-0.5">
             <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
             <span className="text-[11px] font-medium text-text-secondary">{getMobileStatusText()}</span>
           </div>
        </div>

        {/* Desktop View: Stepper */}
        <div className="hidden md:flex items-center justify-center flex-1">
          {stages.map((stage, index) => {
            const isCompleted = currentIndex > index || status === 'complete';
            const isActive = currentIndex === index && status !== 'error';
            const isWaiting = currentIndex < index && status !== 'complete';

            return (
              <div key={stage.id} className="flex items-center">
                <div className="flex items-center gap-2.5">
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300
                    ${isCompleted || isActive ? `${stage.bgClass} border-transparent text-white` : 'border-border text-text-secondary bg-surface'}
                  `}>
                    {isCompleted ? (
                      <Check size={16} />
                    ) : (
                      <stage.icon size={16} />
                    )}
                    
                    {/* Glowing effect for active stage */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ boxShadow: `0 0 12px ${stage.color}` }}
                        animate={{ opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${isActive || isCompleted ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {stage.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < stages.length - 1 && (
                  <div className="w-12 lg:w-16 mx-4 h-[2px] bg-surface border border-border/50 rounded-full overflow-hidden relative">
                    <div 
                      className={`absolute top-0 left-0 h-full transition-all duration-500 ${stages[index].bgClass}`}
                      style={{ width: isCompleted ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Spacer for alignment if needed, or other future tools */}
        <div className="flex items-center shrink-0 w-10 md:hidden" />
      </div>
      
      {/* Global Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-transparent overflow-hidden">
        <div 
          className="h-full transition-all duration-700 ease-in-out"
          style={getProgressStyles()}
        />
      </div>
    </header>
  );
}
