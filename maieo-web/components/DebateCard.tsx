'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Share2, Copy, Check } from 'lucide-react';
import { encodeDebate } from '../lib/share';
import Toast from './Toast';

export interface DebateCardProps {
  type: 'proposer' | 'challenger' | 'arbitrator' | 'synthesizer';
  title: string;
  badge: string;
  content: string;
  score?: number;
  scoreLabel?: string;
  scoreColor?: string;
  verdict?: string;
  proposerScore?: number;
  challengerScore?: number;
  isFinal?: boolean;
  fullDebate?: any;
  shareId?: string;   // Neon DB share_id for clean shareable URLs
}

const markdownBaseClasses = `
  [&>p]:mb-3 [&>p]:leading-relaxed [&>p:last-child]:mb-0
  [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-3 [&>ul]:space-y-1
  [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-3 [&>ol]:space-y-1
  [&>li]:leading-relaxed
  [&>blockquote]:border-l-2 [&>blockquote]:border-accent [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-text-secondary [&>blockquote]:mb-3
  [&_strong]:font-semibold
  [&>h1]:font-semibold [&>h1]:mb-2 [&>h1]:mt-4 [&>h1]:text-lg
  [&>h2]:font-semibold [&>h2]:mb-2 [&>h2]:mt-4 [&>h2]:text-base
  [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-3
  [&>*:first-child]:mt-0
`;

const configMap = {
  proposer: {
    borderColor: 'border-l-[#7c6af7]',
    badgeBg: 'bg-[#7c6af7]/20',
    badgeText: 'text-[#7c6af7]',
    barColor: 'bg-[#7c6af7]',
    contentClass: `text-sm md:text-[0.95rem] text-[#e0e0e0] ${markdownBaseClasses}`,
  },
  challenger: {
    borderColor: 'border-l-[#ef4444]',
    badgeBg: 'bg-[#ef4444]/20',
    badgeText: 'text-[#ef4444]',
    barColor: 'bg-[#ef4444]',
    contentClass: `text-sm md:text-[0.95rem] text-[#e0e0e0] ${markdownBaseClasses} [&>ul>li]:text-[#ef4444] [&>ul>li]:marker:text-[#ef4444]`,
  },
  arbitrator: {
    borderColor: 'border-l-[#f59e0b]',
    badgeBg: 'bg-[#f59e0b]/20',
    badgeText: 'text-[#f59e0b]',
    barColor: 'bg-[#f59e0b]',
    contentClass: `text-sm md:text-[0.95rem] text-[#e0e0e0] ${markdownBaseClasses}`,
  },
  synthesizer: {
    borderColor: 'border-l-[#10b981]',
    badgeBg: 'bg-[#10b981]/20',
    badgeText: 'text-[#10b981]',
    barColor: 'bg-[#10b981]',
    contentClass: `text-base md:text-[1.05rem] text-text-primary ${markdownBaseClasses}`,
  },
};

export default function DebateCard({
  type,
  title,
  badge,
  content,
  score,
  scoreLabel,
  scoreColor,
  verdict,
  proposerScore,
  challengerScore,
  isFinal,
  fullDebate,
  shareId,
}: DebateCardProps) {
  const config = configMap[type];
  const [toastVisible, setToastVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAnswer = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy answer', e);
    }
  };

  const badgeClasses = isFinal
    ? 'bg-[#eab308]/20 text-[#eab308]'
    : `${config.badgeBg} ${config.badgeText}`;

  const handleShare = async () => {
    if (!fullDebate) return;
    
    // Prefer clean /share/shareId URL, fallback to encoded URL
    const shareUrl = shareId
      ? `${window.location.origin}/share/${shareId}`
      : `${window.location.origin}/?debate=${encodeDebate(fullDebate)}`;
    
    // Use native share if on mobile/supported browser
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Maieo AI Debate",
          text: "4 AIs debated: " + fullDebate.query,
          url: shareUrl
        });
        return; // Success, don't show toast
      } catch (e) {
        // User canceled or failed, fallback to clipboard
      }
    }
    
    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setToastVisible(true);
    } catch (e) {
      console.error("Failed to copy to clipboard", e);
    }
  };

  const renderSingleScoreBar = () => {
    if (score === undefined || !scoreLabel) return null;
    
    const percentage = Math.round(score * 100);
    const resolvedBarColor = scoreColor || config.barColor;

    return (
      <div className="mt-5 pt-3 border-t border-border">
        <div className="flex justify-between items-center mb-1.5 text-sm text-text-secondary">
          <span>{scoreLabel}</span>
          <span>{percentage}%</span>
        </div>
        <div className="h-2 w-full bg-black/10 dark:bg-[#333] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className={`h-full rounded-full ${resolvedBarColor}`}
          />
        </div>
      </div>
    );
  };

  const renderArbitratorScoreBars = () => {
    if (proposerScore === undefined || challengerScore === undefined) return null;

    const propPct = Math.round(proposerScore * 100);
    const challPct = Math.round(challengerScore * 100);

    return (
      <div className="mt-5 pt-3 border-t border-border flex gap-6 flex-col sm:flex-row">
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1.5 text-sm text-text-secondary">
            <span>Proposer Score</span>
            <span>{propPct}%</span>
          </div>
          <div className="h-2 w-full bg-black/10 dark:bg-[#333] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${propPct}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="h-full rounded-full bg-[#7c6af7]"
            />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1.5 text-sm text-text-secondary">
            <span>Challenger Score</span>
            <span>{challPct}%</span>
          </div>
          <div className="h-2 w-full bg-black/10 dark:bg-[#333] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${challPct}%` }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="h-full rounded-full bg-[#ef4444]"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`bg-surface rounded-xl px-4 md:px-6 py-5 mx-2 md:mx-0 mb-6 border border-border border-l-[6px] ${config.borderColor}`}
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
          <span className="text-sm md:text-base font-semibold text-text-secondary">
            {title}
          </span>
          <div className="flex items-center gap-2">
            {verdict && (
              <span className="px-2 py-1 rounded text-xs font-bold uppercase tracking-wider bg-[#f59e0b]/20 text-[#f59e0b]">
                {verdict.replace(/_/g, ' ')}
              </span>
            )}
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${badgeClasses}`}>
              {badge}
            </span>
          </div>
        </div>

        <div className={config.contentClass}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {type === 'arbitrator' ? renderArbitratorScoreBars() : renderSingleScoreBar()}

        {isFinal && fullDebate && (
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-end gap-2">
            <button
              onClick={handleCopyAnswer}
              className={`flex items-center gap-2 text-xs font-medium border rounded-lg px-3 py-1.5 transition-all ${
                isCopied
                  ? 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981]'
                  : 'text-text-secondary hover:text-text-primary border-border hover:border-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
              {isCopied ? 'Copied!' : 'Copy Answer'}
            </button>
            <button 
              onClick={handleShare} 
              className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary border border-border hover:border-text-secondary rounded-lg px-3 py-1.5 transition-all hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Share2 size={14} />
              Share Debate
            </button>
          </div>
        )}
      </motion.div>

      <Toast 
        message="Link copied! Anyone with this link can view this debate." 
        isVisible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
    </>
  );
}
