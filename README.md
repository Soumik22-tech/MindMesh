<p align="center">
  <img src="https://raw.githubusercontent.com/Soumik22-tech/MindMesh/main/banner.svg" alt="MindMesh AI — Multi-Agent Adversarial Reasoning Engine" width="100%"/>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-7c6af7?style=for-the-badge&labelColor=0d0b1e" alt="MIT License"/>
  </a>
  <img src="https://img.shields.io/badge/Python-3.11+-7c6af7?style=for-the-badge&logo=python&logoColor=white&labelColor=0d0b1e" alt="Python 3.11+"/>
  <img src="https://img.shields.io/badge/Next.js-15-7c6af7?style=for-the-badge&logo=next.js&logoColor=white&labelColor=0d0b1e" alt="Next.js 15"/>
  <img src="https://img.shields.io/badge/FastAPI-7c6af7?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=0d0b1e" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/100%25-Free%20to%20Run-7c6af7?style=for-the-badge&labelColor=0d0b1e" alt="Free"/>
</p>

<br/>

<p align="center">
  <b>What if AI answers were stress-tested before you saw them?</b><br/>
  MindMesh AI forces 4 specialized AI models to argue, challenge, judge, and synthesize —<br/>
  producing answers that are demonstrably more accurate than any single model alone.
</p>

<br/>

---

## ✦ The Problem With Every AI Tool You've Used

Every chatbot you've used — ChatGPT, Gemini, Claude — gives you **one answer, from one model, with zero accountability.**

If that model hallucinates, oversimplifies, or has a blind spot, you get a confident wrong answer with no warning.

**MindMesh AI breaks this pattern entirely.**

---

## ✦ How It Works

```
Your Question
     │
     ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────────┐
│  PROPOSER   │────▶│  CHALLENGER  │────▶│  ARBITRATOR │────▶│ SYNTHESIZER │
│             │     │              │     │             │     │             │
│ Generates   │     │ Attacks the  │     │ Judges both │     │ Writes the  │
│ first answer│     │ answer hard  │     │ sides fairly│     │ final truth │
│             │     │              │     │             │     │             │
│ Llama 3.3   │     │  Gemma 3     │     │  Qwen 3     │     │  Gemini 2.5 │
│    70B      │     │    27B       │     │   235B      │     │   Flash     │
│   (Groq)   │     │  (Google)    │     │ (Cerebras)  │     │  (Google)   │
└─────────────┘     └──────────────┘     └─────────────┘     └─────────────┘
                                                                     │
                                                                     ▼
                                                           Best possible answer
```

> The Challenger is **incentivized to find flaws**. The Arbitrator is **incentivized to be fair**. The result is an answer that has survived a gauntlet — not just autocomplete.

---

## ✦ The Four Agents

| Agent | Model | Provider | What it does |
|---|---|---|---|
| 💡 **Proposer** | Llama 3.3 70B | Groq (LPU) | Generates a deep, comprehensive first answer at 300+ tokens/sec |
| 🗡️ **Challenger** | Gemma 3 27B | Google AI | Hunts for logical fallacies, hallucinations, and hidden bias |
| ⚖️ **Arbitrator** | Qwen 3 235B | Cerebras | Scores both sides impartially, determines a winner with reasoning |
| ✨ **Synthesizer** | Gemini 2.5 Flash | Google AI | Crafts the definitive final answer from the full debate history |

---

## ✦ Key Features

- **🧠 Adversarial verification** — Catches errors single models miss. The Challenger is rewarded for finding problems, not agreeing.
- **⚡ Blazing fast inference** — Groq's LPU hardware means the Proposer answers in ~2 seconds, full debate in ~20 seconds.
- **🔐 Full auth + persistence** — Clerk authentication, Neon PostgreSQL database. Your debate history is yours, forever.
- **🔗 Shareable debates** — Every debate gets a public link. Share your findings with anyone.
- **📱 Installable PWA** — Works on mobile as an app. No App Store needed.
- **🌐 Production deployed** — Not a demo. Real backend on Render, real frontend on Vercel.
- **💸 100% free to run** — Four providers, all free tiers. Zero cost for hundreds of debates per day.

---

## ✦ Tech Stack

**Backend**
- **Python + FastAPI** — async API orchestration
- **Multi-provider LLM router** — Groq, Cerebras, Google AI with automatic failover
- **Pydantic** — type-safe data modeling

**Frontend**
- **Next.js 15** (App Router) — full-stack React framework
- **Tailwind CSS** — dark-first design system
- **Framer Motion** — physics-based debate animations
- **Clerk** — authentication (Google, email)
- **Neon** — serverless PostgreSQL, never pauses

**Infra**
- **Render** — Python backend hosting
- **Vercel** — Next.js frontend hosting
- **cron-job.org** — keep-alive pinger

---

## ✦ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Soumik22-tech/MindMesh.git
cd MindMesh
```

### 2. Set up the backend

```bash
cd mindmesh
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -e .
```

### 3. Get your free API keys

| Key | Provider | Free tier | Get it |
|---|---|---|---|
| `GROQ_API_KEY` | Groq | 14,400 req/day | [console.groq.com](https://console.groq.com) |
| `GOOGLE_API_KEY_CHALLENGER` | Google AI Studio | 1,500 req/day | [aistudio.google.com](https://aistudio.google.com) |
| `GOOGLE_API_KEY_SYNTHESIZER` | Google AI Studio | 1,500 req/day | [aistudio.google.com](https://aistudio.google.com) |
| `CEREBRAS_API_KEY` | Cerebras | 1M tokens/day | [cloud.cerebras.ai](https://cloud.cerebras.ai) |

```bash
cp .env.example .env
# Fill in your keys
```

### 4. Run the backend

```bash
uvicorn mindmesh.server:app --host 0.0.0.0 --port 8000
```

### 5. Set up and run the frontend

```bash
cd ../mindmesh-web
npm install
# Add your keys to .env.local (see mindmesh-web/.env.example)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — ask anything.

---

## ✦ Project Structure

```
MindMesh AI/
├── mindmesh/                  # Python backend
│   ├── agents/
│   │   ├── proposer.py        # Llama 3.3 70B via Groq
│   │   ├── challenger.py      # Gemma 3 27B via Google
│   │   ├── arbitrator.py      # Qwen 3 235B via Cerebras
│   │   └── synthesizer.py     # Gemini 2.5 Flash via Google
│   ├── core/
│   │   ├── debate.py          # Debate session orchestrator
│   │   ├── models.py          # Pydantic data models
│   │   └── router.py          # Multi-provider LLM router
│   └── server.py              # FastAPI app
│
├── mindmesh-web/              # Next.js 15 frontend
│   ├── app/                   # App Router pages
│   ├── components/            # UI components
│   ├── lib/                   # API client, DB, storage
│   └── types/                 # TypeScript types
│
├── tests/                     # Test suite
├── examples/                  # Usage examples
├── render.yaml                # Render deploy config
└── .env.example               # API key template
```

---

## ✦ Why Four Different Providers?

Most multi-agent systems use one provider for all agents. MindMesh AI deliberately uses **four different AI providers** so no single company's biases dominate the debate. Groq brings speed. Google brings breadth. Cerebras brings reasoning depth. The diversity is the feature.

---

## ✦ Roadmap

- [ ] Multi-round debates (agents respond to each other's rebuttals)
- [ ] Export debates as PDF
- [ ] Pro mode with GPT-4o, Claude 3.5, o3-mini
- [ ] MindMesh AI API — debate-as-a-service for developers
- [ ] Discord bot integration
- [ ] Benchmark mode — compare MindMesh AI vs single LLM accuracy

---

## ✦ Contributing

Contributions welcome — new agent prompts, LLM providers, UI features, or bug fixes.

```bash
git checkout -b feature/your-feature
git commit -m "feat: description"
git push origin feature/your-feature
# Open a Pull Request
```

---

## ✦ License

MIT — free to use, modify, and distribute.

---

<p align="center">
  <sub>Built by <a href="https://github.com/Soumik22-tech">Soumik</a> · Because one AI shouldn't have the final word.</sub>
</p>

---

## ✦ Attribution

If you use MindMesh AI as a base for your project, please include:

[![Built on MindMesh AI](https://img.shields.io/badge/Built%20on-MindMesh%20AI-7c6af7?style=flat&labelColor=0d0b1e)](https://github.com/Soumik22-tech/MindMesh)

This project was originally created by [Soumik](https://github.com/Soumik22-tech).

