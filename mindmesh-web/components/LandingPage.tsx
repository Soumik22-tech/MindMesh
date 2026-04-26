'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageSquare, Brain, Swords, Sparkles, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const steps = [
    {
      icon: MessageSquare,
      color: '#7c6af7',
      title: 'Ask',
      desc: 'Pose any complex question or debate topic.'
    },
    {
      icon: Brain,
      color: '#7c6af7',
      title: 'Propose',
      desc: 'The Proposer builds a strong initial case.'
    },
    {
      icon: Swords,
      color: '#ef4444',
      title: 'Challenge',
      desc: 'The Challenger finds and attacks weaknesses.'
    },
    {
      icon: Sparkles,
      color: '#10b981',
      title: 'Synthesize',
      desc: 'The final model resolves the truth for you.'
    }
  ];

  return (
    <div className="w-screen h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-5xl mx-auto w-full"
      >
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-4">
          <span className="text-white">Mind</span>
          <span className="text-[#7C6AF7]">Mesh</span>
          <span className="text-[#a78bfa] text-5xl md:text-6xl ml-4">AI</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-lg mx-auto mb-12 leading-relaxed">
          4 AI models debate your question. You get the truth.
        </p>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 relative max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center text-center relative">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-lg"
                style={{ backgroundColor: `${step.color}20`, border: `1px solid ${step.color}40` }}
              >
                <step.icon size={24} style={{ color: step.color }} />
              </div>
              <h3 className="font-bold text-base mb-1">{step.title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed px-2">{step.desc}</p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-7 text-gray-800">
                  <ChevronRight size={16} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5">
          <Link 
            href="/sign-up"
            className="w-full sm:w-auto bg-[#7c6af7] hover:bg-[#6b5ce7] text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(124,106,247,0.3)]"
          >
            Start Debating Free
          </Link>
          <Link 
            href="/sign-in"
            className="w-full sm:w-auto border border-[#333] hover:border-gray-500 bg-transparent text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:bg-white/5"
          >
            Sign In
          </Link>
        </div>
        <p className="text-xs text-gray-600 mb-16">No credit card required · Free forever</p>

        {/* Models Row */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-[10px] text-gray-500 mr-2 uppercase tracking-widest font-semibold">Powered by</span>
          {['Llama 3.3', 'Gemma 3', 'Qwen 3 235B', 'Gemini 2.5'].map(model => (
            <span key={model} className="bg-[#111] border border-[#222] px-2.5 py-1 rounded-full text-[10px] text-gray-400">
              {model}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
