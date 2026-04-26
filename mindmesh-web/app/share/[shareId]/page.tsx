import { notFound } from 'next/navigation';
import { getDebateByShareId } from '@/lib/debates';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Brain, Swords, Scale, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

const cardStyles = {
  proposer: {
    border: 'border-[#7c6af7]/40',
    bg: 'bg-[#7c6af7]/5',
    icon: Brain,
    iconColor: '#7c6af7',
    badge: 'bg-[#7c6af7]/20 text-[#a78bfa]',
  },
  challenger: {
    border: 'border-[#ef4444]/40',
    bg: 'bg-[#ef4444]/5',
    icon: Swords,
    iconColor: '#ef4444',
    badge: 'bg-[#ef4444]/20 text-[#f87171]',
  },
  arbitrator: {
    border: 'border-[#f59e0b]/40',
    bg: 'bg-[#f59e0b]/5',
    icon: Scale,
    iconColor: '#f59e0b',
    badge: 'bg-[#f59e0b]/20 text-[#fbbf24]',
  },
  synthesizer: {
    border: 'border-[#10b981]/40',
    bg: 'bg-[#10b981]/5',
    icon: Sparkles,
    iconColor: '#10b981',
    badge: 'bg-[#10b981]/20 text-[#34d399]',
  },
};

function SharedCard({
  type,
  title,
  badge,
  content,
}: {
  type: keyof typeof cardStyles;
  title: string;
  badge: string;
  content: string;
}) {
  const s = cardStyles[type];
  const Icon = s.icon;
  return (
    <div className={`rounded-2xl border ${s.border} ${s.bg} p-5 mb-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={18} style={{ color: s.iconColor }} />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${s.badge}`}>
          {badge}
        </span>
      </div>
      <div className="text-sm text-gray-300 leading-relaxed prose prose-invert max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

export default async function SharedDebatePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const dbDebate = await getDebateByShareId(shareId).catch(() => null);

  if (!dbDebate || !dbDebate.result) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-6">
        <h1 className="text-4xl font-bold mb-4">Debate Not Found</h1>
        <p className="text-gray-400 mb-8">This debate may have been deleted or the link is invalid.</p>
        <Link
          href="/sign-up"
          className="bg-[#7c6af7] hover:bg-[#6b5ce7] text-white px-6 py-3 rounded-xl font-bold transition-colors"
        >
          Start Your Own Debate
        </Link>
      </div>
    );
  }

  const debate = dbDebate.result;

  const challengeContent = debate.challenge
    ? `**Weaknesses:**\n${debate.challenge.weaknesses?.map((w: string) => `- ${w}`).join('\n') ?? ''}\n\n**Counterargument:**\n${debate.challenge.counterargument ?? ''}`
    : '';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Banner */}
      <div className="bg-[#7c6af7]/10 border-b border-[#7c6af7]/30 py-3 px-6 flex items-center justify-between">
        <div>
          <span className="text-[#a78bfa] font-semibold text-sm">MindMesh AI</span>
          <span className="text-gray-400 text-sm ml-2">— This debate was created with MindMesh AI</span>
        </div>
        <Link
          href="/sign-up"
          className="bg-[#7c6af7] hover:bg-[#6b5ce7] text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
        >
          Start your own →
        </Link>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-2 leading-tight">{debate.query}</h1>
        <p className="text-gray-500 text-sm mb-8">Debated by 4 AI models</p>

        {debate.proposal && (
          <SharedCard
            type="proposer"
            title={`Proposer · ${debate.proposal.model_used ?? 'Llama 3.3'}`}
            badge="Round 1"
            content={debate.proposal.content ?? ''}
          />
        )}
        {debate.challenge && (
          <SharedCard
            type="challenger"
            title={`Challenger · ${debate.challenge.model_used ?? 'Gemma 3'}`}
            badge="Round 2"
            content={challengeContent}
          />
        )}
        {debate.arbitration && (
          <SharedCard
            type="arbitrator"
            title={`Arbitrator · ${debate.arbitration.model_used ?? 'Qwen 3'}`}
            badge={debate.arbitration.verdict ?? 'Verdict'}
            content={`> ${debate.arbitration.reasoning ?? ''}`}
          />
        )}
        {debate.final_answer && (
          <SharedCard
            type="synthesizer"
            title="Synthesizer · Gemini 2.5 Flash"
            badge="Final Answer"
            content={debate.final_answer}
          />
        )}

        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm mb-4">Want to debate your own questions?</p>
          <Link
            href="/sign-up"
            className="bg-[#7c6af7] hover:bg-[#6b5ce7] text-white px-8 py-3 rounded-xl font-bold text-base transition-all hover:scale-105"
          >
            Start Debating Free
          </Link>
        </div>
      </div>
    </div>
  );
}
