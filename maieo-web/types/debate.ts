interface Proposal {
  content: string
  confidence: number
  reasoning: string
  model_used: string
}

interface Challenge {
  weaknesses: string[]
  counterargument: string
  severity: number
  model_used: string
}

interface ArbitrationResult {
  verdict: 'proposer_wins' | 'challenger_wins' | 'tie'
  proposer_score: number
  challenger_score: number
  reasoning: string
  key_points: string[]
  model_used: string
}

interface DebateResult {
  query: string
  proposal: Proposal
  challenge: Challenge
  arbitration: ArbitrationResult
  final_answer: string
  duration_seconds: number
  _db_id?: string
  _share_id?: string
}

type DebateStatus = 
  | 'idle' 
  | 'proposing' 
  | 'challenging' 
  | 'arbitrating' 
  | 'synthesizing' 
  | 'complete'
  | 'error'

export type { Proposal, Challenge, ArbitrationResult, DebateResult, DebateStatus }
