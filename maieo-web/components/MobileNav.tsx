'use client';

import { MessageSquare, Clock, Settings } from 'lucide-react';

export type MobileTab = 'debates' | 'history' | 'settings';

interface MobileNavProps {
  activeTab: MobileTab;
  onChange: (tab: MobileTab) => void;
}

export default function MobileNav({ activeTab, onChange }: MobileNavProps) {
  const tabs = [
    { id: 'debates', label: 'Debates', icon: MessageSquare },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-[64px] bg-surface border-t border-border z-50 flex items-center justify-around px-2 pb-safe">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
