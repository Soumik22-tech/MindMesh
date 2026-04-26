'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import DebateCard from '@/components/DebateCard';
import TypingCard from '@/components/TypingCard';
import MobileNav, { MobileTab } from '@/components/MobileNav';
import MobileHistorySheet from '@/components/MobileHistorySheet';
import ThemeToggle from '@/components/ThemeToggle';
import AgentStatus from '@/components/AgentStatus';
import InputBar from '@/components/InputBar';
import { runDebate, stopDebate } from '@/lib/api';
import { DebateStatus } from '@/types/debate';
import { DbDebate } from '@/lib/debates';
import { decodeDebate } from '@/lib/share';
import { useAuth } from '@clerk/nextjs';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const [debates, setDebates] = useState<DbDebate[]>([]);
  const [activeDebate, setActiveDebate] = useState<DbDebate | null>(null);
  const [status, setStatus] = useState<DebateStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [visibleStages, setVisibleStages] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSharedView, setIsSharedView] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('debates');
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleStages, activeDebate, error]);

  // Dynamic Document Title
  useEffect(() => {
    if (status === 'idle') {
      document.title = 'MindMesh AI — AI Debate Engine';
    } else if (status === 'complete' && activeDebate?.query) {
      const truncated = activeDebate.query.length > 30 
        ? activeDebate.query.slice(0, 30) + '...' 
        : activeDebate.query;
      document.title = `${truncated} — MindMesh AI`;
    } else {
      document.title = 'Debating... — MindMesh AI';
    }
  }, [status, activeDebate]);

  // Load history from DB on mount
  useEffect(() => {
    if (!isSignedIn) return;
    const loadHistory = async () => {
      try {
        const response = await fetch('/api/history');
        if (response.ok) {
          const data = await response.json();
          setDebates(data);
        }
      } catch (error) {
        console.error('Failed to load history:', error);
      }
    };
    loadHistory();
  }, [isSignedIn]);

  // Check URL for shared debate on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const debateParam = params.get('debate');
    
    if (debateParam) {
      const decoded = decodeDebate(debateParam);
      if (decoded) {
        setActiveDebate({
          id: 'shared',
          user_id: 'shared',
          query: decoded.query,
          result: decoded,
          share_id: 'shared',
          is_public: true,
          created_at: new Date().toISOString()
        });
        setIsSharedView(true);
        triggerReplaySequence();
      }
    }
  }, []);

  const triggerReplaySequence = () => {
    setVisibleStages(0);
    setStatus('proposing');
    
    setTimeout(() => {
      setVisibleStages(1);
      setStatus('challenging');
    }, 0);

    setTimeout(() => {
      setVisibleStages(2);
      setStatus('arbitrating');
    }, 1000);

    setTimeout(() => {
      setVisibleStages(3);
      setStatus('synthesizing');
    }, 2000);

    setTimeout(() => {
      setVisibleStages(4);
      setStatus('complete');
    }, 3000);
  };

  const handleStop = () => {
    stopDebate();
    setStatus('idle');
    setIsStopped(true);
    // Partial results remain visible via activeDebate + visibleStages
  };

  const handleDebateSubmit = async (q: string) => {
    if (!q.trim()) return;
    
    // Clear shared state if starting a new one
    if (isSharedView) {
      setIsSharedView(false);
      window.history.pushState({}, '', '/');
    }
    
    setStatus('proposing');
    setIsStopped(false);
    setError(null);
    setVisibleStages(0);
    setActiveMobileTab('debates');
    
    setActiveDebate({ 
      id: 'temp', 
      user_id: '', 
      query: q, 
      result: { query: q } as any, 
      share_id: '', 
      is_public: false, 
      created_at: new Date().toISOString() 
    });

    // Start simulated progress while fetching
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      // Move through stages every 4-5 seconds to keep UI alive
      if (elapsed > 12000) setStatus('synthesizing');
      else if (elapsed > 8000) setStatus('arbitrating');
      else if (elapsed > 4000) setStatus('challenging');
    }, 1000);

    try {
      const result = await runDebate(q);
      clearInterval(progressInterval);

      // _db_id and _share_id come from our /api/debate route (saved to Neon)
      const savedId = result._db_id || crypto.randomUUID();
      const newDebate: DbDebate = {
        id: savedId,
        user_id: '', // Will be filled by DB if needed, but we don't need it here
        query: q,
        result: result,
        share_id: result._share_id || '',
        is_public: false,
        created_at: new Date().toISOString(),
      };

      setActiveDebate(newDebate);
      
      // Update local history list immediately
      setDebates(prev => [newDebate, ...prev]);
      
      triggerReplaySequence();

    } catch (err: any) {
      clearInterval(progressInterval);
      setStatus('error');
      setError(err.message || 'An unexpected error occurred during the debate.');
    }
  };

  const handleSelectHistory = (id: string) => {
    // Clear shared state
    if (isSharedView) {
      setIsSharedView(false);
      window.history.pushState({}, '', '/');
    }
    
    const selected = debates.find(d => d.id === id);
    if (selected) {
      setActiveDebate(selected);
      setError(null);
      triggerReplaySequence();
      setActiveMobileTab('debates');
    }
  };

  const handleDeleteDebate = (id: string) => {
    setDebates(prev => prev.filter(d => d.id !== id))
    // If deleted debate is currently active, clear the chat
    if (activeDebate?.id === id) {
      setActiveDebate(null)
      setStatus('idle')
    }
  };

  const handleNewDebate = () => {
    if (isSharedView) {
      setIsSharedView(false);
      window.history.pushState({}, '', '/');
    }
    setActiveDebate(null);
    setVisibleStages(0);
    setStatus('idle');
    setError(null);
    setActiveMobileTab('debates');
  };

  const currentResult = activeDebate?.result;

  if (!authLoaded) return null; // Or a simple loader

  if (!isSignedIn) {
    return <LandingPage />;
  }

  return (
    <>
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeId={activeDebate?.id || null}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteDebate}
        onNewDebate={handleNewDebate}
        debates={debates}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <main 
        className={`
          flex-1 flex flex-col relative w-full h-full transition-all duration-300
          ${isSidebarCollapsed ? 'lg:ml-[70px] lg:w-[calc(100%-70px)]' : 'lg:ml-[260px] lg:w-[calc(100%-260px)]'}
        `}
      >
        <AgentStatus 
          status={status} 
          query={activeDebate?.query} 
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        <div 
          ref={scrollRef}
          className={`flex-1 overflow-y-auto scroll-smooth ${activeMobileTab === 'debates' ? 'block' : 'hidden md:block'} pb-[64px] md:pb-0 px-0 md:px-8 py-4 md:py-10`}
        >
          <div className="max-w-4xl mx-auto w-full">
            
            {/* Shared View Banner */}
            {isSharedView && activeDebate && (
              <div className="bg-[#7c6af7]/10 border border-[#7c6af7]/30 rounded-xl p-4 mb-8 flex items-center justify-between">
                <span className="text-[#7c6af7] font-medium text-sm">Viewing a shared debate</span>
                <button 
                  onClick={handleNewDebate} 
                  className="bg-[#7c6af7] text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-[#7c6af7]/90 transition-colors"
                >
                  Start your own
                </button>
              </div>
            )}

            {/* Empty State */}
            {!activeDebate && !error && status === 'idle' && (
              <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 -mt-10">
                <div className="mb-4">
                  <h1 className="text-[4rem] md:text-[5.5rem] font-bold tracking-tight leading-tight">
                    <span className="text-white">Mind</span>
                    <span className="text-[#7C6AF7]">Mesh</span>
                    <span className="text-[#a78bfa] text-[2.5rem] md:text-[3.4rem] ml-3 align-middle">AI</span>
                  </h1>
                </div>
                <p className="text-text-secondary text-lg md:text-xl mb-10 max-w-lg mx-auto opacity-80">
                  4 AI models debate your question. You get the truth.
                </p>
                
                <div className="w-full mb-6">
                  <InputBar 
                    onSubmit={handleDebateSubmit}
                    onStop={handleStop}
                    disabled={false}
                    isDebating={status !== 'idle' && status !== 'complete' && status !== 'error'}
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-3 w-full max-w-2xl opacity-70">
                  {[
                    "Is AI taking our jobs?", 
                    "Python vs JavaScript for backend?", 
                    "Is social media harmful?"
                  ].map(q => (
                    <button 
                      key={q} 
                      onClick={() => handleDebateSubmit(q)} 
                      className="py-2.5 px-5 rounded-full border border-border bg-surface/50 text-[13px] text-text-primary transition-all duration-300 hover:border-accent hover:bg-surface hover:-translate-y-0.5"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-[#ef4444]/10 rounded-xl px-6 py-5 mb-6 border border-border border-l-[6px] border-l-[#ef4444]">
                <h3 className="text-[#ef4444] font-semibold mb-2">API Error</h3>
                <p className="text-gray-300 text-sm mb-4">{error}</p>
                <button 
                  onClick={() => handleDebateSubmit(activeDebate?.query || '')} 
                  className="bg-[#ef4444] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#ef4444]/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Debate Sequence with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDebate?.id || 'empty'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {status === 'proposing' && visibleStages < 1 && (
                  <TypingCard type="proposer" title="Proposer · Llama 3.3 70B" />
                )}
                {currentResult?.proposal && visibleStages >= 1 && (
                  <DebateCard
                    type="proposer"
                    title={`Proposer · ${currentResult.proposal.model_used || 'Llama 3.3 70B'}`}
                    badge="ROUND 1"
                    content={currentResult.proposal.content}
                    score={currentResult.proposal.confidence}
                    scoreLabel="Confidence"
                  />
                )}

                {status === 'challenging' && visibleStages < 2 && (
                  <TypingCard type="challenger" title="Challenger · Gemma 3 27B" />
                )}
                {currentResult?.challenge && visibleStages >= 2 && (
                  <DebateCard
                    type="challenger"
                    title={`Challenger · ${currentResult.challenge.model_used || 'Gemma 3 27B'}`}
                    badge="ROUND 2"
                    content={`<ul class="weakness-list">\n${currentResult.challenge.weaknesses.map(w => `- ${w}`).join('\n')}\n</ul>\n\n**Counterargument:**\n${currentResult.challenge.counterargument}`}
                    score={currentResult.challenge.severity}
                    scoreLabel="Severity"
                  />
                )}

                {status === 'arbitrating' && visibleStages < 3 && (
                  <TypingCard type="arbitrator" title="Arbitrator · Qwen 3 235B" />
                )}
                {currentResult?.arbitration && visibleStages >= 3 && (
                  <DebateCard
                    type="arbitrator"
                    title={`Arbitrator · ${currentResult.arbitration.model_used || 'Qwen 3 235B'}`}
                    badge={currentResult.arbitration.verdict}
                    content={`> ${currentResult.arbitration.reasoning}`}
                    proposerScore={currentResult.arbitration.proposer_score}
                    challengerScore={currentResult.arbitration.challenger_score}
                  />
                )}

                {status === 'synthesizing' && visibleStages < 4 && (
                  <TypingCard type="synthesizer" title="Synthesizer · Gemini 2.5 Flash" />
                )}
                {currentResult?.final_answer && visibleStages >= 4 && (
                  <DebateCard
                    type="synthesizer"
                    title="Synthesizer · Gemini 2.5 Flash"
                    badge="FINAL ANSWER"
                    content={currentResult.final_answer}
                    isFinal={true}
                    fullDebate={currentResult}
                    shareId={activeDebate?.share_id}
                  />
                )}

                {/* Completion Time Footer */}
                {visibleStages >= 4 && currentResult?.duration_seconds && (
                  <div className="text-center text-text-secondary text-xs mt-8 mb-4">
                    Debate completed in {currentResult.duration_seconds.toFixed(1)}s
                  </div>
                )}

                {/* Stopped Notice */}
                {isStopped && (
                  <div className="mt-6 mb-4 flex items-center gap-3 px-5 py-4 rounded-xl border border-[#444] bg-[#1a1a1a] text-sm text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />
                    <span>Debate stopped. Showing partial results — start a new debate anytime.</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            
          </div>
        </div>

        {/* Fixed bottom InputBar (only when NOT in welcome state) */}
        {(activeDebate || error || status !== 'idle') && activeMobileTab === 'debates' && (
          <div className="pb-[64px] md:pb-0 fixed md:static bottom-0 left-0 w-full z-40 bg-background/80 backdrop-blur-md border-t border-border/50">
            <InputBar 
              onSubmit={handleDebateSubmit}
              onStop={handleStop}
              disabled={false}
              isDebating={status !== 'idle' && status !== 'complete' && status !== 'error'}
            />
          </div>
        )}

        {activeMobileTab === 'settings' && (
          <div className="flex-1 overflow-y-auto px-6 py-10 pb-[84px] md:hidden">
            <h2 className="text-2xl font-bold mb-6">Settings</h2>
            <div className="bg-surface border border-border rounded-xl p-4 flex justify-between items-center mb-4">
              <span className="font-medium text-text-primary">Theme Appearance</span>
              <ThemeToggle />
            </div>
            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center justify-center text-center mt-8">
              <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-accent">M</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-1">MindMesh AI v1.0.0</h3>
              <p className="text-sm text-text-secondary">Powered by cutting-edge Multi-Agent LLMs</p>
            </div>
          </div>
        )}

      </main>

      {/* Mobile History Bottom Sheet */}
      <MobileHistorySheet 
        isOpen={activeMobileTab === 'history'}
        onClose={() => setActiveMobileTab('debates')}
        activeId={activeDebate?.id || null}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteDebate}
        onNewDebate={handleNewDebate}
        debates={debates}
      />

      {/* Mobile Bottom Navigation */}
      <MobileNav 
        activeTab={activeMobileTab}
        onChange={setActiveMobileTab}
      />
    </>
  );
}
