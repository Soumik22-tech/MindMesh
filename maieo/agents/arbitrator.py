import re
from mindmesh.agents.base import BaseAgent
from mindmesh.core.models import Proposal, Challenge, ArbitrationResult, Verdict

class ArbitratorAgent(BaseAgent):
    def run(self, query: str, proposal: Proposal, challenge: Challenge) -> ArbitrationResult:
        system_prompt = (
            "You are an impartial judge scoring a debate. Evaluate the original answer and the challenge fairly. Output:\n"
            "PROPOSER_SCORE: [0.0-1.0]\n"
            "CHALLENGER_SCORE: [0.0-1.0]\n"
            "VERDICT: [PROPOSER_WINS / CHALLENGER_WINS / TIE]\n"
            "REASONING: [your analysis]\n"
            "KEY_POINTS: [bullet list of the strongest points from both sides to include in a final answer]"
        )
        
        weaknesses_str = '\n'.join(f"- {w}" for w in challenge.weaknesses)
        user_prompt = (
            f"Query: {query}\n\n"
            f"Proposed Answer:\n{proposal.content}\n\n"
            f"Challenge (Weaknesses):\n{weaknesses_str}\n\n"
            f"Challenge (Counterargument):\n{challenge.counterargument}"
        )
        
        response = self.router.complete(
            provider="cerebras",
            model="qwen-3-235b-a22b-instruct-2507",
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )
        
        # Parse the response
        prop_score_m = re.search(r'PROPOSER_SCORE:\s*(.*?)(?=CHALLENGER_SCORE:|$)', response, re.DOTALL | re.IGNORECASE)
        chall_score_m = re.search(r'CHALLENGER_SCORE:\s*(.*?)(?=VERDICT:|$)', response, re.DOTALL | re.IGNORECASE)
        verdict_m = re.search(r'VERDICT:\s*(.*?)(?=REASONING:|$)', response, re.DOTALL | re.IGNORECASE)
        reasoning_m = re.search(r'REASONING:\s*(.*?)(?=KEY_POINTS:|$)', response, re.DOTALL | re.IGNORECASE)
        keys_m = re.search(r'KEY_POINTS:\s*(.*)', response, re.DOTALL | re.IGNORECASE)
        
        proposer_score = self._parse_confidence(prop_score_m.group(1)) if prop_score_m else 0.5
        challenger_score = self._parse_confidence(chall_score_m.group(1)) if chall_score_m else 0.5
        
        verdict_str = verdict_m.group(1).strip().upper() if verdict_m else "TIE"
        if "PROPOSER" in verdict_str:
            verdict = Verdict.PROPOSER_WINS
        elif "CHALLENGER" in verdict_str:
            verdict = Verdict.CHALLENGER_WINS
        else:
            verdict = Verdict.TIE
            
        reasoning = reasoning_m.group(1).strip() if reasoning_m else ""
        keys_text = keys_m.group(1).strip() if keys_m else ""
        key_points = [k.strip("-* ") for k in keys_text.split('\n') if k.strip("-* ")]
        
        return ArbitrationResult(
            verdict=verdict,
            proposer_score=proposer_score,
            challenger_score=challenger_score,
            reasoning=reasoning,
            key_points=key_points,
            model_used="cerebras (qwen-3-235b-a22b-instruct-2507)"
        )
