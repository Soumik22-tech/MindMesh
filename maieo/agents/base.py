import re
from abc import ABC, abstractmethod
from mindmesh.core.router import LLMRouter

class BaseAgent(ABC):
    def __init__(self, router: LLMRouter):
        self.router = router

    @abstractmethod
    def run(self, *args, **kwargs):
        pass

    def _parse_confidence(self, text: str) -> float:
        """Extract a float between 0 and 1 from text."""
        # Try to find a decimal number or 0/1
        match = re.search(r'(0\.\d+|1\.0+|1|0)', text)
        if match:
            try:
                val = float(match.group(1))
                return max(0.0, min(1.0, val))
            except ValueError:
                return 0.5
        return 0.5
