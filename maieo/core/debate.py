import time
import asyncio
from typing import Optional, Dict, Any

from mindmesh.core.router import LLMRouter
from mindmesh.core.models import DebateResult
from mindmesh.agents.proposer import ProposerAgent
from mindmesh.agents.challenger import ChallengerAgent
from mindmesh.agents.arbitrator import ArbitratorAgent
from mindmesh.agents.synthesizer import SynthesizerAgent

class DebateSession:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.router = LLMRouter()
        
        self.proposer = ProposerAgent(self.router)
        self.challenger = ChallengerAgent(self.router)
        self.arbitrator = ArbitratorAgent(self.router)
        self.synthesizer = SynthesizerAgent(self.router)

    def run(self, query: str) -> DebateResult:
        start_time = time.time()
        
        # 1. Proposer
        print("[1/4] Proposer thinking...")
        try:
            proposal = self.proposer.run(query)
        except Exception as e:
            raise RuntimeError(f"ProposerAgent failed: {e}") from e

        # 2. Challenger
        print("[2/4] Challenger thinking...")
        try:
            challenge = self.challenger.run(query, proposal)
        except Exception as e:
            raise RuntimeError(f"ChallengerAgent failed: {e}") from e

        # 3. Arbitrator
        print("[3/4] Arbitrator thinking...")
        try:
            arbitration = self.arbitrator.run(query, proposal, challenge)
        except Exception as e:
            raise RuntimeError(f"ArbitratorAgent failed: {e}") from e

        # 4. Synthesizer
        print("[4/4] Synthesizer thinking...")
        try:
            final_answer = self.synthesizer.run(query, proposal, challenge, arbitration)
        except Exception as e:
            raise RuntimeError(f"SynthesizerAgent failed: {e}") from e
            
        end_time = time.time()
        duration_seconds = end_time - start_time
        
        return DebateResult(
            query=query,
            proposal=proposal,
            challenge=challenge,
            rebuttal=None,
            arbitration=arbitration,
            final_answer=final_answer,
            total_tokens=0,
            duration_seconds=duration_seconds
        )

    async def run_async(self, query: str) -> DebateResult:
        start_time = time.time()
        
        # 1. Proposer
        print("[1/4] Proposer thinking...")
        try:
            proposal = await asyncio.to_thread(self.proposer.run, query)
        except Exception as e:
            raise RuntimeError(f"ProposerAgent failed: {e}") from e

        # 2. Challenger
        print("[2/4] Challenger thinking...")
        try:
            challenge = await asyncio.to_thread(self.challenger.run, query, proposal)
        except Exception as e:
            raise RuntimeError(f"ChallengerAgent failed: {e}") from e

        # 3. Arbitrator
        print("[3/4] Arbitrator thinking...")
        try:
            arbitration = await asyncio.to_thread(self.arbitrator.run, query, proposal, challenge)
        except Exception as e:
            raise RuntimeError(f"ArbitratorAgent failed: {e}") from e

        # 4. Synthesizer
        print("[4/4] Synthesizer thinking...")
        try:
            final_answer = await asyncio.to_thread(self.synthesizer.run, query, proposal, challenge, arbitration)
        except Exception as e:
            raise RuntimeError(f"SynthesizerAgent failed: {e}") from e
            
        end_time = time.time()
        duration_seconds = end_time - start_time
        
        return DebateResult(
            query=query,
            proposal=proposal,
            challenge=challenge,
            rebuttal=None,
            arbitration=arbitration,
            final_answer=final_answer,
            total_tokens=0,
            duration_seconds=duration_seconds
        )
