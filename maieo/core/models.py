import json
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class Message(BaseModel):
    role: str
    content: str


class Proposal(BaseModel):
    content: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: str
    model_used: str


class Challenge(BaseModel):
    weaknesses: List[str]
    counterargument: str
    severity: float = Field(..., ge=0.0, le=1.0)
    model_used: str


class Rebuttal(BaseModel):
    response: str
    concessions: List[str]
    reinforcements: List[str]
    model_used: str


class Verdict(str, Enum):
    PROPOSER_WINS = "PROPOSER_WINS"
    CHALLENGER_WINS = "CHALLENGER_WINS"
    TIE = "TIE"


class ArbitrationResult(BaseModel):
    verdict: Verdict
    proposer_score: float
    challenger_score: float
    reasoning: str
    key_points: List[str]
    model_used: str


class DebateResult(BaseModel):
    proposal: Proposal
    challenge: Challenge
    rebuttal: Optional[Rebuttal] = None
    arbitration: ArbitrationResult
    query: str
    final_answer: str
    total_tokens: int
    duration_seconds: float

    def to_dict(self) -> dict:
        """Returns a JSON-serializable dictionary of the model."""
        return json.loads(self.model_dump_json())
