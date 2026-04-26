import re
from mindmesh.agents.base import BaseAgent
from mindmesh.core.models import Proposal, Challenge

class ChallengerAgent(BaseAgent):
    def run(self, query: str, proposal: Proposal) -> Challenge:
        system_prompt = (
            "You are a rigorous devil's advocate. Your job is to find every flaw, assumption, "
            "edge case, and weakness in the given answer. Be specific and harsh. "
            "Structure your response with:\n"
            "WEAKNESSES: [bullet list of specific flaws]\n"
            "COUNTERARGUMENT: [your stronger alternative answer if you have one]\n"
            "SEVERITY: [0.0-1.0, how badly the answer is flawed]"
        )
        
        user_prompt = f"Query: {query}\n\nProposed Answer:\n{proposal.content}"
        
        response = self.router.complete(
            provider="google",
            model="gemma-3-27b-it",
            system_prompt=system_prompt,
            user_prompt=user_prompt
        )
        
        # Parse the response
        weaknesses_match = re.search(r'WEAKNESSES:\s*(.*?)(?=COUNTERARGUMENT:|$)', response, re.DOTALL | re.IGNORECASE)
        counter_match = re.search(r'COUNTERARGUMENT:\s*(.*?)(?=SEVERITY:|$)', response, re.DOTALL | re.IGNORECASE)
        severity_match = re.search(r'SEVERITY:\s*(.*)', response, re.DOTALL | re.IGNORECASE)
        
        weaknesses_text = weaknesses_match.group(1).strip() if weaknesses_match else response
        weaknesses = [w.strip("-* ") for w in weaknesses_text.split('\n') if w.strip("-* ")]
        
        counterargument = counter_match.group(1).strip() if counter_match else ""
        severity_str = severity_match.group(1).strip() if severity_match else "0.5"
        
        severity = self._parse_confidence(severity_str)
        
        return Challenge(
            weaknesses=weaknesses,
            counterargument=counterargument,
            severity=severity,
            model_used="google (gemma-3-27b-it)"
        )
