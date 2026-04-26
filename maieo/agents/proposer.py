import re
from mindmesh.agents.base import BaseAgent
from mindmesh.core.models import Proposal

class ProposerAgent(BaseAgent):
    def run(self, query: str) -> Proposal:
        system_prompt = (
            "You are an expert analyst. Given a question, provide your best answer. "
            "Structure your response with:\n"
            "ANSWER: [your detailed answer]\n"
            "CONFIDENCE: [0.0-1.0 score]\n"
            "REASONING: [why you are confident or not]"
        )
        
        response = self.router.complete(
            provider="groq",
            model="llama-3.3-70b-versatile",
            system_prompt=system_prompt,
            user_prompt=query
        )
        
        # Parse the response
        answer_match = re.search(r'ANSWER:\s*(.*?)(?=CONFIDENCE:|$)', response, re.DOTALL | re.IGNORECASE)
        confidence_match = re.search(r'CONFIDENCE:\s*(.*?)(?=REASONING:|$)', response, re.DOTALL | re.IGNORECASE)
        reasoning_match = re.search(r'REASONING:\s*(.*)', response, re.DOTALL | re.IGNORECASE)
        
        content = answer_match.group(1).strip() if answer_match else response
        confidence_str = confidence_match.group(1).strip() if confidence_match else "0.5"
        reasoning = reasoning_match.group(1).strip() if reasoning_match else ""
        
        confidence = self._parse_confidence(confidence_str)
        
        return Proposal(
            content=content,
            confidence=confidence,
            reasoning=reasoning,
            model_used="groq (llama-3.3-70b-versatile)"
        )
