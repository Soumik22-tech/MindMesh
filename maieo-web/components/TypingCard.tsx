'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TypingCardProps {
  type: 'proposer' | 'challenger' | 'arbitrator' | 'synthesizer';
  title: string;
}

const configMap = {
  proposer: {
    borderColor: 'border-l-[#7c6af7]',
    messages: ["Analyzing the question...", "Building an argument...", "Calculating confidence..."]
  },
  challenger: {
    borderColor: 'border-l-[#ef4444]',
    messages: ["Reading the proposal...", "Finding weaknesses...", "Preparing counterarguments..."]
  },
  arbitrator: {
    borderColor: 'border-l-[#f59e0b]',
    messages: ["Evaluating both sides...", "Weighing the evidence...", "Reaching a verdict..."]
  },
  synthesizer: {
    borderColor: 'border-l-[#10b981]',
    messages: ["Combining best arguments...", "Writing final answer...", "Polishing the response..."]
  },
};

export default function TypingCard({ type, title }: TypingCardProps) {
  const config = configMap[type];
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % config.messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [config.messages.length]);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`bg-surface rounded-xl px-6 py-5 mb-6 border border-border border-l-[6px] ${config.borderColor} shadow-sm`}
    >
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
        <span className="text-[0.95rem] font-semibold text-text-secondary">
          {title}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-6 gap-5">
        {/* Bouncing Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
              className="w-2.5 h-2.5 rounded-full bg-text-secondary"
            />
          ))}
        </div>

        {/* Rotating Message */}
        <div className="h-5 relative w-full flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={messageIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-text-secondary absolute"
            >
              {config.messages[messageIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
