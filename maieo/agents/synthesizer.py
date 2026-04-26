from mindmesh.agents.base import BaseAgent
from mindmesh.core.models import Proposal, Challenge, ArbitrationResult

class SynthesizerAgent(BaseAgent):
    def run(self, query: str, proposal: Proposal, challenge: Challenge, arbitration: ArbitrationResult) -> str:
        system_prompt = (
            "You are a master synthesizer. You receive a debate between two agents and an arbitration result. "
            "Your job is to write the single best possible answer by combining the strongest elements from both sides. "
            "Be clear, thorough, and acknowledge important caveats. Do not mention the debate process — just write the best answer."
        )
        
        weaknesses_str = '\n'.join(f"- {w}" for w in challenge.weaknesses)
        keys_str = '\n'.join(f"- {k}" for k in arbitration.key_points)
        
        user_prompt = (
            f"Original Query: {query}\n\n"
            f"Proposer's Answer:\n{proposal.content}\n\n"
            f"Challenger's Weaknesses Identified:\n{weaknesses_str}\n\n"
            f"Challenger's Counterargument:\n{challenge.counterargument}\n\n"
            f"Arbitrator's Key Points to Include:\n{keys_str}\n\n"
            f"Arbitrator's Verdict: {arbitration.verdict.value}\n\n"
            f"Based on all the above, write the final, synthesized answer to the Original Query."
        )
        
        response = self.router.complete(
            provider="google",
            model="gemini-2.5-flash",
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )
        
        return response.strip()
